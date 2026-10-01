import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';

const source=readFileSync(new URL('../store.js',import.meta.url),'utf8');
function browser(storage=new Map(),fail=false){const events=[];const context={window:{dispatchEvent:e=>events.push(e.type)},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('Unavailable');storage.set(k,v);}},URL,Event,crypto:{randomUUID}};vm.runInNewContext(source,context);return {store:context.window.MeridianStore,events,storage};}
test('storefront checkout appears in admin data with price snapshots and stock updates',()=>{
  const b=browser(),before=b.store.load();const order=b.store.createOrder({customer:'Demo shopper',email:'shopper@example.com',source:'Storefront',paymentStatus:'Demo — no payment',items:[{productId:'noir',quantity:2},{productId:'silver',quantity:1}]});
  assert.equal(b.store.orderTotal(order),535);assert.equal(order.source,'Storefront');assert.equal(order.status,'Processing');
  const admin=browser(b.storage),saved=admin.store.load();assert.equal(saved.orders[0].id,order.id);assert.equal(saved.orders.length,before.orders.length+1);assert.equal(saved.products[0].stock,10);assert.equal(saved.products[1].stock,7);
  saved.products[0].price=200;admin.store.save(saved);assert.equal(admin.store.load().orders[0].items[0].unitPrice,185);assert.ok(b.events.includes('meridian-store-change'));
});
test('invalid or unavailable checkout does not create an order or change stock',()=>{
  const b=browser();const initial=JSON.stringify(b.store.load());
  for(const items of [[],[{productId:'noir',quantity:13}],[{productId:'noir',quantity:-1}],[{productId:'noir',quantity:1.5}],[{productId:'missing',quantity:1}],[{productId:'noir',quantity:1},{productId:'noir',quantity:1}]])assert.throws(()=>b.store.createOrder({customer:'Test',email:'test@example.com',items}));
  assert.throws(()=>b.store.createOrder({customer:'Test',email:'invalid',items:[{productId:'noir',quantity:1}]}));assert.equal(JSON.stringify(b.store.load()),initial);
  const state=b.store.load();state.products[0].active=false;b.store.save(state);assert.throws(()=>b.store.createOrder({customer:'Test',email:'test@example.com',items:[{productId:'noir',quantity:1}]}));
});
test('failed storage reports failure and does not claim checkout success',()=>{const b=browser(new Map(),true);assert.throws(()=>b.store.createOrder({customer:'Test',email:'test@example.com',items:[{productId:'noir',quantity:1}]}),/could not save/);assert.equal(b.store.load().orders.length,3);});
test('checkout checks the latest shared stock before saving',()=>{const b=browser(),other=browser(b.storage);other.store.createOrder({customer:'Test A',email:'a@example.com',items:[{productId:'everyday',quantity:3}]});assert.throws(()=>b.store.createOrder({customer:'Test B',email:'b@example.com',items:[{productId:'everyday',quantity:1}]}),/insufficient stock/);assert.equal(b.store.load().orders.length,4);});
