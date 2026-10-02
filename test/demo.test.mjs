import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';

const source=readFileSync(new URL('../store.js',import.meta.url),'utf8');
function browser(storage=new Map(),fail=false){const events=[];const context={window:{dispatchEvent:e=>events.push(e.type)},localStorage:{removeItem:k=>{if(fail)throw Error('Unavailable');storage.delete(k);},getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('Unavailable');storage.set(k,v);}},URL,Event,crypto:{randomUUID}};vm.runInNewContext(source,context);return {store:context.window.MeridianStore,events,storage};}
test('storefront checkout appears in admin data with price snapshots and stock updates',()=>{
  const b=browser(),before=b.store.load();const order=b.store.createOrder({customer:'Demo shopper',email:'shopper@example.com',source:'Storefront',paymentStatus:'Demo — no payment',items:[{productId:'noir',quantity:2},{productId:'silver',quantity:1}]});
  assert.equal(b.store.orderTotal(order),5150);assert.equal(order.source,'Storefront');assert.equal(order.status,'Processing');
  const admin=browser(b.storage),saved=admin.store.load();assert.equal(saved.orders[0].id,order.id);assert.equal(saved.orders.length,before.orders.length+1);assert.equal(saved.products[0].stock,10);assert.equal(saved.products[1].stock,7);
  saved.products[0].price=200;admin.store.save(saved);assert.equal(admin.store.load().orders[0].items[0].unitPrice,1850);assert.ok(b.events.includes('meridian-store-change'));
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
  assert.equal(order.items.length,5);assert.equal(b.store.orderTotal(order),9350);
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
  const updated=b.store.load();assert.equal(updated.products.length,15);
  assert.equal(updated.products[0].name,'Owner name');assert.equal(updated.products[0].stock,4);assert.equal(updated.products[0].price,250);
  assert.equal(JSON.stringify(updated.orders),orders);
  updated.products.find(p=>p.id==='gold-rectangle').price=300;
  updated.products=updated.products.filter(p=>p.id!=='navy-moonphase');b.store.save(updated);
  const saved=b.store.load();assert.equal(saved.products.length,14);
  assert.equal(saved.products.find(p=>p.id==='gold-rectangle').price,300);
  assert.equal(saved.products.some(p=>p.id==='navy-moonphase'),false);
});
test('all five dress and sport watches can be checked out with individual stock and price snapshots',()=>{
  const b=browser(),ids=['gold-rectangle','navy-moonphase','green-chronograph','pearl-two-tone','black-skeleton'];
  const products=ids.map(id=>b.store.load().products.find(p=>p.id===id));
  assert.equal(new Set(products.map(p=>p.image)).size,5);
  const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',items:ids.map(productId=>({productId,quantity:1}))});
  assert.equal(order.items.length,5);assert.equal(b.store.orderTotal(order),10350);
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
 assert.equal(order.discountCode,'WELCOME10');assert.equal(order.discountAmount,185);assert.equal(b.store.orderTotal(order),1665);
 const edited=b.store.load();edited.products[0].price=999;b.store.save(edited);assert.equal(b.store.orderTotal(b.store.load().orders[0]),1665);
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

test('background colours update old catalogue images without changing watches or saved store data',()=>{
 const b=browser(),state=b.store.load();const oldImages=JSON.parse(readFileSync(new URL('../sources/watch-backgrounds.json',import.meta.url),'utf8'));
 for(const product of state.products){const entry=Object.entries(oldImages).find(([,current])=>current===product.image);if(entry)product.image=entry[0];}
 const target=state.products.find(p=>p.id==='emerald-gold');target.stock=3;target.price=199;
 const custom=state.products.find(p=>p.id==='blue-steel');custom.image='https://example.com/custom-watch.webp';
 const orders=JSON.stringify(state.orders);const firstTwo=state.products.slice(0,2).map(p=>p.image);b.store.save(state);
 const saved=b.store.load();assert.equal(saved.products.find(p=>p.id==='emerald-gold').image,oldImages['assets/watches/emerald-gold.webp']);
 assert.equal(saved.products.find(p=>p.id==='emerald-gold').stock,3);assert.equal(saved.products.find(p=>p.id==='emerald-gold').price,199);
 assert.equal(saved.products.find(p=>p.id==='blue-steel').image,custom.image);assert.equal(JSON.stringify(saved.orders),orders);
 assert.deepEqual(saved.products.slice(0,2).map(p=>p.image),firstTwo);
 for(const product of saved.products){if(Object.values(oldImages).includes(product.image))product.image=Object.entries(oldImages).find(([,current])=>current===product.image)[0];}
 saved.products.find(p=>p.id==='obsidian-black').image='assets/watches/obsidian-black-violet-clean-bg.webp';
 b.store.save(saved);const cleaned=b.store.load();
 for(const product of cleaned.products){const expected=oldImages['assets/watches/'+product.id+'.webp'];if(expected&&product.id!=='blue-steel')assert.equal(product.image,expected);}
 assert.equal(cleaned.products.find(p=>p.id==='blue-steel').image,custom.image);
});

test('premium prices migrate old defaults and preserve custom prices and historical orders',()=>{
 const b=browser(),state=b.store.load();state.products.find(p=>p.id==='noir').price=185;
 state.products.find(p=>p.id==='silver').price=777;const orders=JSON.stringify(state.orders);
 b.store.save(state);const updated=b.store.load();
 assert.equal(updated.products.find(p=>p.id==='noir').price,1850);
 assert.equal(updated.products.find(p=>p.id==='silver').price,777);
 assert.equal(JSON.stringify(updated.orders),orders);
 assert.ok(browser().store.load().products.filter(p=>p.category!=='accessory').every(p=>p.price>=1250&&p.price<=2450));
});

test('delivery checkout records address and postage with discounts only on watches',()=>{
 const b=browser();const delivery={method:'express',addressLine1:' 12 Example Street ',addressLine2:'Flat 2',city:'London',postalCode:'SW1A 1AA',country:'United Kingdom',instructions:'Ring the bell',fee:0};
 const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',source:'Storefront',paymentStatus:'Demo — no payment',paymentMethod:'wallet',discountCode:'WELCOME10',delivery,items:[{productId:'noir',quantity:1}]});
 assert.equal(order.shippingFee,30);assert.equal(order.discountAmount,185);assert.equal(b.store.orderTotal(order),1695);
 assert.equal(order.delivery.addressLine1,'12 Example Street');assert.equal(order.delivery.instructions,'Ring the bell');assert.equal(order.paymentMethod,'wallet');assert.equal(order.delivery.fee,undefined);
 const saved=b.store.load();saved.products[0].price=999;b.store.save(saved);assert.equal(b.store.orderTotal(b.store.load().orders[0]),1695);
 const normal=b.store.createOrder({customer:'Demo',email:'demo@example.com',delivery:{...delivery,method:'normal'},items:[{productId:'silver',quantity:1}]});assert.equal(normal.shippingFee,15);assert.equal(b.store.orderTotal(normal),1465);
});
test('invalid delivery cannot create orders or reduce stock and legacy orders retain totals',()=>{
 const b=browser(),initial=JSON.stringify(b.store.load()),delivery={method:'normal',addressLine1:'12 Example Street',city:'London',postalCode:'SW1A 1AA',country:'United Kingdom'};
 for(const invalid of [{...delivery,method:'free'},{...delivery,city:' '},{...delivery,instructions:'x'.repeat(501)},{...delivery,postalCode:undefined}])assert.throws(()=>b.store.createOrder({customer:'Demo',email:'demo@example.com',delivery:invalid,items:[{productId:'noir',quantity:1}]}));
 assert.equal(JSON.stringify(b.store.load()),initial);
 const state=b.store.load();assert.equal(b.store.orderTotal(state.orders.find(o=>o.id==='DEMO-1003')),185);
 const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',delivery,items:[{productId:'noir',quantity:1}]});const tampered=b.store.load();tampered.orders[0].shippingFee=0;assert.throws(()=>b.store.save(tampered),/postage/);assert.equal(b.store.load().orders[0].shippingFee,order.shippingFee);
});

test('previous delivery rates remain valid without changing saved totals',()=>{
 const b=browser(),delivery={method:'normal',addressLine1:'12 Example Street',city:'London',postalCode:'SW1A 1AA',country:'United Kingdom'};
 b.store.createOrder({customer:'Demo',email:'demo@example.com',delivery,items:[{productId:'noir',quantity:1}]});
 const state=b.store.load();state.orders[0].shippingFee=6;b.store.save(state);
 assert.equal(b.store.orderTotal(b.store.load().orders[0]),1856);
 state.orders[0].delivery.method='express';state.orders[0].shippingFee=15;b.store.save(state);
 assert.equal(b.store.orderTotal(b.store.load().orders[0]),1865);
});

test('accessories migrate once without replacing edits or restoring removed products',()=>{
 const b=browser(),old=b.store.load();old.products=old.products.filter(p=>p.category!=='accessory');delete old.accessoriesAdded;old.products[0].stock=2;const orders=JSON.stringify(old.orders);b.store.save(old);
 const migrated=b.store.load();assert.equal(migrated.products.filter(p=>p.category==='accessory').length,3);assert.equal(migrated.products[0].stock,2);assert.equal(JSON.stringify(migrated.orders),orders);
 migrated.products.find(p=>p.id==='accessory-care-kit').price=40;migrated.products=migrated.products.filter(p=>p.id!=='accessory-watch-case');b.store.save(migrated);
 const saved=b.store.load();assert.equal(saved.products.find(p=>p.id==='accessory-care-kit').price,40);assert.equal(saved.products.some(p=>p.id==='accessory-watch-case'),false);
});
test('mixed watch and accessory orders snapshot prices and update stock together',()=>{
 const b=browser(),initial=b.store.load();const order=b.store.createOrder({customer:'Demo',email:'demo@example.com',items:[{productId:'noir',quantity:1},{productId:'accessory-care-kit',quantity:2}]});
 assert.equal(b.store.orderTotal(order),1920);assert.equal(order.items[1].unitPrice,35);assert.equal(b.store.load().products.find(p=>p.id==='accessory-care-kit').stock,23);
 const edited=b.store.load();edited.products.find(p=>p.id==='accessory-care-kit').stock=0;b.store.save(edited);assert.throws(()=>b.store.createOrder({customer:'Demo',email:'demo@example.com',items:[{productId:'accessory-care-kit',quantity:1}]}),/insufficient stock/);
 assert.equal(initial.products.filter(p=>p.category==='accessory').length,3);
});

test('midnight strap replaces the original listing while preserving edits stock and order history',()=>{
 const b=browser(),state=b.store.load(),strap=state.products.find(p=>p.id==='accessory-leather-strap');
 strap.name='Espresso Leather Strap';strap.style='Espresso leather · Silver-tone buckle';strap.image='assets/watches/accessory-leather-strap.webp';strap.description='A dark espresso leather strap with fine stitching and a silver-tone buckle. Check the lug width and attachment type of your watch before selecting a replacement strap.';strap.stock=7;strap.price=110;
 const history=JSON.stringify(state.orders);b.store.save(state);const updated=b.store.load(),replacement=updated.products.find(p=>p.id===strap.id);
 assert.equal(replacement.name,'Midnight Leather Strap');assert.equal(replacement.image,'assets/watches/accessory-midnight-strap.webp');assert.equal(replacement.stock,7);assert.equal(replacement.price,110);assert.equal(JSON.stringify(updated.orders),history);
 replacement.name='Owner strap';replacement.image='https://example.com/strap.webp';b.store.save(updated);assert.equal(b.store.load().products.find(p=>p.id===strap.id).name,'Owner strap');assert.equal(b.store.load().products.find(p=>p.id===strap.id).image,replacement.image);
});
