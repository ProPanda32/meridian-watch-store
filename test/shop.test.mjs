import {test} from 'node:test';
import assert from 'node:assert/strict';
import shop from '../shop.js';
const products=[{id:'noir',name:'Aurelia',style:'Gold bracelet',description:'Blue dial',price:185,active:true,stock:2},{id:'silver-blue',name:'Argent',style:'Navy strap',description:'Silver dial',price:165,active:true,stock:0},{id:'emerald-gold',name:'Verdant',style:'Gold bracelet',description:'Green dial',price:195,active:true,stock:3},{id:'hidden',name:'Hidden',style:'',description:'',price:1,active:false,stock:5}];
test('combined catalogue filters match query colour strap price and stock',()=>{
 assert.deepEqual(shop.filter(products,{query:'dial',colour:'Blue',strap:'Bracelet',min:180,max:190,availability:'in'}).map(p=>p.id),['noir']);
 assert.deepEqual(shop.filter(products,{availability:'out'}).map(p=>p.id),['silver-blue']);
 assert.equal(shop.filter(products,{min:200,max:100}).length,0);
});
test('sorting uses demo order popularity without counting cancelled orders or mutating products',()=>{
 const orders=[{status:'Delivered',items:[{productId:'emerald-gold',quantity:3}]},{status:'Cancelled',items:[{productId:'noir',quantity:99}]}];
 assert.equal(shop.filter(products,{sort:'popular'},orders)[0].id,'emerald-gold');
 assert.equal(shop.filter(products,{sort:'price-low'})[0].id,'silver-blue');assert.equal(products[0].id,'noir');
});
test('stored bags cap stock and discard removed hidden sold-out and invalid quantities',()=>{
 assert.deepEqual([...shop.normaliseBag([['noir',8],['missing',1],['hidden',1],['silver-blue',1],['emerald-gold',-1],['noir',1.5]],products)],[['noir',2]]);
 assert.equal(shop.normaliseBag('bad',products).size,0);
});
test('corrupt or unavailable browser storage falls back gracefully',()=>{
 assert.deepEqual(shop.read({getItem:()=>'{bad'},'bag',[]),[]);
 assert.deepEqual(shop.read({getItem(){throw Error('blocked');}},'bag',[]),[]);
});

test('watch tabs exclude accessories and recommendations omit sold out hidden and bagged extras',()=>{
 const extras=[{id:'strap',category:'accessory',active:true,stock:2},{id:'case',category:'accessory',active:true,stock:0},{id:'care',category:'accessory',active:true,stock:4},{id:'hidden-extra',category:'accessory',active:false,stock:5}],all=[...products,...extras];
 assert.deepEqual(shop.collection(all,'all').map(p=>p.id),['noir','silver-blue','emerald-gold']);
 assert.deepEqual(shop.collection(all,'accessories').map(p=>p.id),['strap','case','care']);
 assert.deepEqual(shop.collection(all,'celestial',{celestial:['noir','strap']}).map(p=>p.id),['noir']);
 assert.deepEqual(shop.recommendations(all,new Map([['noir',1],['strap',1]])).map(p=>p.id),['care']);
 assert.deepEqual(shop.recommendations(all,new Map([['strap',1]])),[]);
});
