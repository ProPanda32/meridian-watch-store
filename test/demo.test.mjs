import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';

const source=readFileSync(new URL('../store.js',import.meta.url),'utf8');
function browser(storage=new Map(),fail=false){const events=[];const context={window:{dispatchEvent:e=>events.push(e.type)},localStorage:{removeItem:k=>{if(fail)throw Error('Unavailable');storage.delete(k);},getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('Unavailable');storage.set(k,v);}},URL,Event,crypto:{randomUUID}};vm.runInNewContext(source,context);return {store:context.window.MeridianStore,events,storage};}
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
test('failed storage reports failure and does not claim checkout success',()=>{const b=browser(new Map(),true),initialCount=b.store.load().orders.length;assert.throws(()=>b.store.createOrder({customer:'Test',email:'test@example.com',items:[{productId:'noir',quantity:1}]}),/could not save/);assert.equal(b.store.load().orders.length,initialCount);});
test('checkout checks the latest shared stock before saving',()=>{const b=browser(),other=browser(b.storage),initialCount=b.store.load().orders.length;other.store.createOrder({customer:'Test A',email:'a@example.com',items:[{productId:'emerald-gold',quantity:10}]});assert.throws(()=>b.store.createOrder({customer:'Test B',email:'b@example.com',items:[{productId:'emerald-gold',quantity:1}]}),/insufficient stock/);assert.equal(b.store.load().orders.length,initialCount+1);});
test('stock imagery migrates without losing browser orders or admin edits',()=>{
  const b=browser(),state=b.store.load();
  state.products[0].image='https://images.unsplash.com/photo-1630512731371-a3747ab932ed?auto=format&fit=crop&w=1000&q=85';
  state.products[0].stock=4;state.products[0].price=250;state.products[0].description='Owner description';
  state.products[1].image='https://example.com/custom.webp';
  b.storage.set(b.store.key,JSON.stringify(state));
  const migrated=b.store.load();assert.equal(migrated.products[0].image,'assets/watches/champagne-moonphase.webp');
  assert.equal(migrated.products[0].stock,4);assert.equal(migrated.products[0].price,250);assert.equal(migrated.products[0].description,'Owner description');
  assert.equal(migrated.products[1].image,'https://example.com/custom.webp');assert.equal(JSON.stringify(migrated.orders),JSON.stringify(state.orders));
  b.store.save(migrated);assert.equal(b.store.load().products[0].image,migrated.products[0].image);
});
test('catalogue copy updates old defaults while preserving custom text and order snapshots',()=>{
  const b=browser(),state=b.store.load();
  state.products[0].name='The Noir';
  state.products[0].description='An engraved champagne-gold bracelet and a starry midnight dial with a moonphase-inspired detail. A celestial expression of understated luxury.';
  state.products[1].name='My custom watch';state.products[1].description='My custom description';
  state.orders[0].items[0].name='The Noir';
  b.storage.set(b.store.key,JSON.stringify(state));
  const updated=b.store.load();assert.equal(updated.products[0].name,'The Aurelia');assert.match(updated.products[0].description,/crescent-moon/);
  assert.equal(updated.products[1].name,'My custom watch');assert.equal(updated.products[1].description,'My custom description');
  assert.equal(updated.orders[0].items[0].name,'The Noir');
  const order=b.store.createOrder({customer:'Test',email:'test@example.com',items:[{productId:'noir',quantity:1}]});assert.equal(order.items[0].name,'The Aurelia');
});

test('five-watch collection migrates once while preserving catalogue edits and order snapshots',()=>{
  const b=browser(),old=b.store.load();
  old.products=old.products.slice(0,2);delete old.fiveWatchCollectionAdded;
  old.products[0].name='Owner custom name';old.products[0].price=250;old.products[0].stock=4;
  const orders=JSON.stringify(old.orders);
  b.storage.set(b.store.key,JSON.stringify(old));
  const updated=b.store.load();assert.equal(updated.products.length,7);
  assert.equal(updated.products[0].name,'Owner custom name');assert.equal(updated.products[0].price,250);assert.equal(updated.products[0].stock,4);
  assert.equal(JSON.stringify(updated.orders),orders);
  updated.products.find(p=>p.id==='emerald-gold').price=300;
  updated.products=updated.products.filter(p=>p.id!=='blue-steel');
  b.store.save(updated);
  const saved=b.store.load();assert.equal(saved.products.length,6);
  assert.equal(saved.products.find(p=>p.id==='emerald-gold').price,300);
  assert.equal(saved.products.some(p=>p.id==='blue-steel'),false);
});
test('all five new watches can be ordered with distinct image paths and stock snapshots',()=>{
  const b=browser(),ids=['emerald-gold','blue-steel','obsidian-black','silver-blue','two-tone-gmt'];
  const initial=b.store.load(),newProducts=ids.map(id=>initial.products.find(p=>p.id===id));
  assert.equal(new Set(newProducts.map(p=>p.image)).size,5);
  const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',items:ids.map(productId=>({productId,quantity:1}))});
  assert.equal(order.items.length,5);assert.equal(b.store.orderTotal(order),935);
  for(const product of newProducts){
    assert.equal(b.store.load().products.find(p=>p.id===product.id).stock,product.stock-1);
    assert.equal(order.items.find(i=>i.productId===product.id).unitPrice,product.price);
  }
});


test('removed Aster disappears from saved catalogues while historical orders remain intact',()=>{
  const b=browser(),state=b.store.load();
  state.products.push({...state.products[0],id:'everyday',name:'The Aster',image:'assets/watches/champagne-skeleton.webp'});
  state.orders[0].items[0]={productId:'everyday',name:'The Aster',quantity:1,unitPrice:195};
  const orders=JSON.stringify(state.orders);b.storage.set(b.store.key,JSON.stringify(state));
  const updated=b.store.load();assert.equal(updated.products.some(p=>p.id==='everyday'),false);
  assert.equal(JSON.stringify(updated.orders),orders);
  assert.throws(()=>b.store.createOrder({customer:'Demo',email:'demo@example.com',items:[{productId:'everyday',quantity:1}]}),/unavailable/);
});

test('dress and sport collection updates returning browsers without duplicating or replacing edited products',()=>{
  const b=browser(),old=b.store.load(),ids=['gold-rectangle','navy-moonphase','green-chronograph','pearl-two-tone','black-skeleton'];
  old.products=old.products.filter(p=>!ids.includes(p.id));delete old.dressAndSportCollectionAdded;
  old.products[0].name='Owner name';old.products[0].stock=4;old.products[0].price=250;
  const orders=JSON.stringify(old.orders);
  b.storage.set(b.store.key,JSON.stringify(old));
  const updated=b.store.load();assert.equal(updated.products.length,12);
  assert.equal(updated.products[0].name,'Owner name');assert.equal(updated.products[0].stock,4);assert.equal(updated.products[0].price,250);
  assert.equal(JSON.stringify(updated.orders),orders);
  updated.products.find(p=>p.id==='gold-rectangle').price=300;
  updated.products=updated.products.filter(p=>p.id!=='navy-moonphase');b.store.save(updated);
  const saved=b.store.load();assert.equal(saved.products.length,11);
  assert.equal(saved.products.find(p=>p.id==='gold-rectangle').price,300);
  assert.equal(saved.products.some(p=>p.id==='navy-moonphase'),false);
});
test('all five dress and sport watches can be checked out with individual stock and price snapshots',()=>{
  const b=browser(),ids=['gold-rectangle','navy-moonphase','green-chronograph','pearl-two-tone','black-skeleton'];
  const products=ids.map(id=>b.store.load().products.find(p=>p.id===id));
  assert.equal(new Set(products.map(p=>p.image)).size,5);
  const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',items:ids.map(productId=>({productId,quantity:1}))});
  assert.equal(order.items.length,5);assert.equal(b.store.orderTotal(order),995);
  for(const product of products){
    assert.equal(b.store.load().products.find(p=>p.id===product.id).stock,product.stock-1);
    assert.equal(order.items.find(item=>item.productId===product.id).unitPrice,product.price);
  }
});

test('music settings persist across store edits and reject unsupported audio URLs',()=>{
  const b=browser(),state=b.store.load();
  state.settings.musicUrl='https://example.com/piano.mp3';b.store.save(state);
  assert.equal(b.store.load().settings.musicUrl,state.settings.musicUrl);
  b.store.createOrder({customer:'Music setting test',email:'music@example.com',source:'Storefront',paymentStatus:'Demo — no payment',items:[{productId:'noir',quantity:1}]});
  assert.equal(b.store.load().settings.musicUrl,state.settings.musicUrl);
  for(const musicUrl of ['http://example.com/piano.mp3','javascript:alert(1)','not-a-url',123]){
    const invalid=b.store.load();invalid.settings.musicUrl=musicUrl;
    assert.throws(()=>b.store.save(invalid),/HTTPS audio URL/);
  }
  const reset=b.store.load();reset.settings.musicUrl='';b.store.save(reset);
  assert.equal(b.store.load().settings.musicUrl,'');
});

test('demo trend history migrates once without changing saved orders, stock or settings',()=>{
  const b=browser(),state=b.store.load();state.orders=state.orders.filter(o=>!o.id.startsWith('DEMO-TREND-'));delete state.trendOrdersAdded;
  state.products[0].stock=2;state.settings.name='Custom store';const original=JSON.stringify(state.orders);b.store.save(state);
  const migrated=b.store.load();assert.equal(migrated.orders.filter(o=>o.id.startsWith('DEMO-TREND-')).length,51);
  assert.equal(JSON.stringify(migrated.orders.filter(o=>!o.id.startsWith('DEMO-TREND-'))),original);
  assert.equal(migrated.products[0].stock,2);assert.equal(migrated.settings.name,'Custom store');
  b.store.save(migrated);assert.equal(b.store.load().orders.length,migrated.orders.length);
});

test('discount checkout stores an immutable discounted total and rejects unknown codes without saving',()=>{
 const b=browser(),initial=b.store.load();
 const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',source:'Storefront',discountCode:' welcome10 ',items:[{productId:'noir',quantity:1}]});
 assert.equal(order.discountCode,'WELCOME10');assert.equal(order.discountAmount,18.5);assert.equal(b.store.orderTotal(order),166.5);
 const edited=b.store.load();edited.products[0].price=999;b.store.save(edited);assert.equal(b.store.orderTotal(b.store.load().orders[0]),166.5);
 const before=JSON.stringify(b.store.load());assert.throws(()=>b.store.createOrder({customer:'Demo',email:'demo@example.com',discountCode:'invalid',items:[{productId:'silver',quantity:1}]}),/not recognised/);
 assert.equal(JSON.stringify(b.store.load()),before);assert.equal(initial.products[0].stock-b.store.load().products[0].stock,1);
 assert.equal(b.store.quote([{unitPrice:1.99,quantity:3}],'MERLOCK15').total,5.07);
});
test('demo reset restores catalogue history and settings and only clears this store shopping keys',()=>{
 const b=browser(),initial=b.store.load(),edited=b.store.load();edited.products=[];edited.orders=[];edited.settings.name='Edited';b.store.save(edited);
 for(const key of ['merlock-bag-v1','merlock-wishlist-v1','merlock-coupon-v1','merlock-last-order-v1'])b.storage.set(key,'changed');
 b.storage.set('unrelated-app','keep');const reset=b.store.reset();
 assert.equal(JSON.stringify(reset),JSON.stringify(initial));assert.equal(b.storage.get('unrelated-app'),'keep');assert.equal(b.storage.has('merlock-bag-v1'),false);assert.ok(b.events.includes('meridian-demo-reset'));
});

test('product galleries accept extra photos and preserve them across store saves',()=>{
 const b=browser(),state=b.store.load();state.products[0].galleryImages=['https://example.com/detail.jpg','assets/watches/champagne-moonphase.webp'];b.store.save(state);
 assert.equal(b.store.load().products[0].galleryImages.length,2);
 for(const images of [['http://example.com/image.jpg'],Array(7).fill('https://example.com/a.jpg')]){
   const invalid=b.store.load();invalid.products[0].galleryImages=images;assert.throws(()=>b.store.save(invalid),/photos|photo URLs/);
 }
});
