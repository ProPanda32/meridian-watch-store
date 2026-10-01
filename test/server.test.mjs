import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStoreServer} from '../server.mjs';

test('owner authentication, private orders, validation, stock, price snapshots and persistence',async()=>{
  const app=createStoreServer({password:'test-password-long-enough',dbPath:':memory:',origin:'http://localhost:3000'});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`;let cookie='',csrf='';
  const request=async(path,method='GET',data,{auth=true,origin=true,token=true}={})=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(origin?{Origin:'http://localhost:3000'}:{}),...(auth&&cookie?{Cookie:cookie}:{}),...(token&&csrf?{'X-CSRF-Token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')};};
  try{
    assert.equal((await request('/api/session')).status,401);
    assert.equal((await request('/api/login','POST',{password:'wrong'})).status,401);
    assert.equal((await request('/api/login','POST',{password:'test-password-long-enough'},{origin:false})).status,403);
    const login=await request('/api/login','POST',{password:'test-password-long-enough'});assert.equal(login.status,200);cookie=login.cookie.split(';')[0];csrf=login.body.csrf;assert.match(login.cookie,/HttpOnly/);assert.match(login.cookie,/SameSite=Strict/);
    let state=login.body.state;assert.equal(state.orders.length,0);
    assert.equal((await request('/api/state','PUT',state,{token:false})).status,403);
    const invalid=structuredClone(state);invalid.products[0].price=-1;assert.equal((await request('/api/state','PUT',invalid)).status,400);
    const created=await request('/api/orders','POST',{revision:state.revision,customer:'Test customer',email:'test@example.com',paymentStatus:'Unpaid',items:[{productId:'noir',quantity:2}]});assert.equal(created.status,201);state=created.body.state;assert.equal(state.products[0].stock,10);assert.equal(state.orders[0].items[0].unitPrice,185);
    const duplicate=await request('/api/orders','POST',{revision:0,customer:'Test',email:'test@example.com',paymentStatus:'Unpaid',items:[{productId:'noir',quantity:1}]});assert.equal(duplicate.status,409);
    const overstock=await request('/api/orders','POST',{revision:state.revision,customer:'Test',email:'test@example.com',paymentStatus:'Unpaid',items:[{productId:'noir',quantity:100}]});assert.equal(overstock.status,400);
    state.products[0].price=220.50;state.orders[0].status='Shipped';const saved=await request('/api/state','PUT',state);assert.equal(saved.status,200);state=saved.body;assert.equal(state.orders[0].items[0].unitPrice,185);
    const publicData=await request('/api/catalogue');assert.equal(publicData.body.orders.length,0);assert.equal(publicData.body.products[0].price,220.50);assert.ok(!JSON.stringify(publicData.body).includes('test@example.com'));
    const stale={...state,revision:0};assert.equal((await request('/api/state','PUT',stale)).status,409);
    state.orders[0].items[0].unitPrice=1;assert.equal((await request('/api/state','PUT',state)).status,400);
    assert.equal((await request('/api/logout','POST',{})).status,200);assert.equal((await request('/api/session')).status,401);
    const blocked=await fetch(base+'/server.mjs');assert.equal(blocked.status,404);
  }finally{await new Promise(resolve=>app.server.close(resolve));app.close();}
});
