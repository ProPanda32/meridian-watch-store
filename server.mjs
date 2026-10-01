import http from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const files={'/':'index.html','/index.html':'index.html','/admin.html':'admin.html','/admin':'admin.html','/store.js':'store.js','/storefront.js':'storefront.js','/admin.js':'admin.js','/admin.css':'admin.css'};
const port=Number(process.env.PORT||3000);
http.createServer((req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!file){res.writeHead(404);res.end('Not found');return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const type=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:readFileSync(join(root,file)));
}).listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Merlock demo ready at http://localhost:'+port));
