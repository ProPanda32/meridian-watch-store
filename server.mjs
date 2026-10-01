import http from 'node:http';
import {readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {randomBytes,scryptSync,timingSafeEqual,randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';

export function createStoreServer({password,dbPath='data/store.sqlite',origin='http://localhost:3000',secure=false}={}) {
  if(typeof password!=='string'||password.length<14)throw Error('Set ADMIN_PASSWORD to a unique password of at least 14 characters.');
  if(secure&&!origin.startsWith('https://'))throw Error('Production APP_ORIGIN must use HTTPS.');
  const root=dirname(fileURLToPath(import.meta.url));
  if(dbPath!==':memory:')mkdirSync(dirname(dbPath),{recursive:true});
  const db=new DatabaseSync(dbPath);db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, body TEXT NOT NULL)');
  const seed=JSON.parse(readFileSync(join(root,'catalogue.json'),'utf8'));seed.orders=[];
  db.prepare('INSERT OR IGNORE INTO store(id,revision,body) VALUES(1,0,?)').run(JSON.stringify(seed));
  const salt=randomBytes(16),hash=scryptSync(password,salt,64),sessions=new Map(),attempts=new Map();
  const read=()=>{const r=db.prepare('SELECT revision,body FROM store WHERE id=1').get();return {...JSON.parse(r.body),revision:r.revision};};
  const write=(s,revision)=>{const {revision:ignored,...body}=s;const result=db.prepare('UPDATE store SET revision=revision+1,body=? WHERE id=1 AND revision=?').run(JSON.stringify(body),revision);if(!result.changes)throw Object.assign(Error('The store changed in another tab. Reload before saving.'),{status:409});return read();};
  const text=(s,max)=>typeof s==='string'&&s.length<=max;
  function validate(s){
    if(!s||s.version!==1||!text(s.settings?.name,60)||!s.settings.name.trim()||!text(s.settings.announcement,160)||!Array.isArray(s.products)||s.products.length>1000||!Array.isArray(s.orders)||s.orders.length>10000)throw Error('Invalid store data.');
    const ids=new Set();for(const p of s.products){if(!p||!text(p.id,100)||!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id)||!text(p.name,80)||!p.name.trim()||!text(p.style,150)||!text(p.description,2000)||!text(p.badge,100)||!text(p.image,2000)||!p.image.startsWith('https://')||!Number.isFinite(p.price)||p.price<0||p.price>1000000||Math.abs(p.price*100-Math.round(p.price*100))>0.000001||!Number.isSafeInteger(p.stock)||p.stock<0||p.stock>1000000||typeof p.active!=='boolean')throw Error('Invalid product data.');new URL(p.image);ids.add(p.id);}
    const orders=new Set();for(const o of s.orders){if(!o||!text(o.id,100)||orders.has(o.id)||!text(o.customer,150)||!o.customer.trim()||!text(o.email,254)||!text(o.date,30)||!text(o.notes,2000)||!['Processing','Shipped','Delivered','Cancelled'].includes(o.status)||!['Unpaid','Paid'].includes(o.paymentStatus)||!Array.isArray(o.items)||!o.items.length||o.items.length>100)throw Error('Invalid order data.');orders.add(o.id);for(const i of o.items)if(!text(i.productId,100)||!text(i.name,80)||!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>1000000||!Number.isFinite(i.unitPrice)||i.unitPrice<0||i.unitPrice>1000000)throw Error('Invalid order item.');}
  }
  function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
  async function body(req){if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON is required.');let raw='';for await(const c of req){raw+=c;if(Buffer.byteLength(raw)>2_000_000)throw Error('Request is too large.');}try{return JSON.parse(raw);}catch{throw Error('Invalid JSON.');}}
  function session(req){const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('meridian_session='))?.slice(17);const s=sessions.get(token);if(!s||s.expires<Date.now()){if(token)sessions.delete(token);return null;}return {token,...s};}
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
    const path=new URL(req.url,'http://localhost').pathname;
    try{
      if(path.startsWith('/api/')){
        if(!['GET','POST','PUT'].includes(req.method))return json(res,405,{error:'Method not allowed.'});
        if(req.method!=='GET'&&req.headers.origin!==origin)return json(res,403,{error:'Invalid request origin.'});
        if(path==='/api/config'&&req.method==='GET')return json(res,200,{live:true});
        if(path==='/api/catalogue'&&req.method==='GET'){const s=read();return json(res,200,{version:1,settings:s.settings,products:s.products.filter(p=>p.active),orders:[]});}
        if(path==='/api/login'&&req.method==='POST'){
          const ip=req.socket.remoteAddress;const now=Date.now();for(const [k,a]of attempts)if(now-a.start>900000)attempts.delete(k);const a=attempts.get(ip)||{start:now,count:0};if(a.count>=5)return json(res,429,{error:'Too many sign-in attempts. Try again in 15 minutes.'});a.count++;attempts.set(ip,a);
          const b=await body(req);if(!text(b.password,1024)||!timingSafeEqual(scryptSync(b.password,salt,64),hash))return json(res,401,{error:'Incorrect password.'});attempts.delete(ip);
          for(const [k,s]of sessions)if(s.expires<now)sessions.delete(k);const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');sessions.set(token,{csrf,expires:now+8*3600000});res.setHeader('Set-Cookie',`meridian_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`);return json(res,200,{csrf,state:read()});
        }
        const auth=session(req);if(!auth)return json(res,401,{error:'Owner sign-in required.'});
        if(req.method!=='GET'&&req.headers['x-csrf-token']!==auth.csrf)return json(res,403,{error:'Invalid session token.'});
        if(path==='/api/session'&&req.method==='GET')return json(res,200,{csrf:auth.csrf,state:read()});
        if(path==='/api/logout'&&req.method==='POST'){sessions.delete(auth.token);res.setHeader('Set-Cookie',`meridian_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure?'; Secure':''}`);return json(res,200,{ok:true});}
        if(path==='/api/state'&&req.method==='PUT'){
          const b=await body(req),old=read();validate(b);
          if(b.orders.length!==old.orders.length)throw Error('Use Add order to create an order.');
          for(const o of b.orders){const prior=old.orders.find(x=>x.id===o.id);if(!prior||JSON.stringify(o.items)!==JSON.stringify(prior.items)||o.customer!==prior.customer||o.email!==prior.email||o.date!==prior.date)throw Error('Original order details cannot be rewritten.');if(prior.status==='Cancelled'&&o.status!=='Cancelled')throw Error('Cancelled orders cannot be reopened.');}
          if(old.products.some(p=>!b.products.some(n=>n.id===p.id)))throw Error('Hide products instead of deleting them.');
          return json(res,200,write(b,b.revision));
        }
        if(path==='/api/orders'&&req.method==='POST'){
          const b=await body(req),s=read();if(b.revision!==s.revision)return json(res,409,{error:'The store changed. Reload before creating this order.'});
          if(!text(b.customer,150)||!b.customer.trim()||!text(b.email,254)||!/^\S+@\S+\.\S+$/.test(b.email)||!['Unpaid','Paid'].includes(b.paymentStatus)||!Array.isArray(b.items)||!b.items.length||b.items.length>100)throw Error('Enter customer details and valid order items.');
          const seen=new Set();const items=b.items.map(i=>{const p=s.products.find(p=>p.id===i.productId);if(!p||!p.active||seen.has(p.id)||!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>p.stock)throw Error('An item is unavailable or has insufficient stock.');seen.add(p.id);p.stock-=i.quantity;return {productId:p.id,name:p.name,quantity:i.quantity,unitPrice:p.price};});
          const order={id:`ORD-${randomUUID()}`,date:new Date().toISOString().slice(0,10),customer:b.customer.trim(),email:b.email.trim(),status:'Processing',paymentStatus:b.paymentStatus,notes:'',items};s.orders.unshift(order);validate(s);return json(res,201,{state:write(s,s.revision),orderId:order.id});
        }
        return json(res,404,{error:'Unknown API route.'});
      }
      if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
      const files={'/':'index.html','/index.html':'index.html','/admin':'admin.html','/admin.html':'admin.html','/admin.css':'admin.css','/admin.js':'admin.js','/store.js':'store.js'};
      const file=files[path];if(!file){res.writeHead(404);return res.end('Not found');}
      const mime=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript';res.writeHead(200,{'Content-Type':`${mime}; charset=utf-8`,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:readFileSync(join(root,file)));
    }catch(err){json(res,err.status||400,{error:err.message});}
  });
  return {server,close:()=>db.close()};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const secure=process.env.NODE_ENV==='production';const port=Number(process.env.PORT||3000);
  const app=createStoreServer({password:process.env.ADMIN_PASSWORD,dbPath:process.env.DATABASE_PATH||'data/store.sqlite',origin:process.env.APP_ORIGIN||`http://localhost:${port}`,secure});
  app.server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Meridian ready at ${process.env.APP_ORIGIN||`http://localhost:${port}`}`));
}
