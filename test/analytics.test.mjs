import {test} from 'node:test';
import assert from 'node:assert/strict';
import analytics from '../analytics.js';
const order=(date,quantity,price=10,status='Delivered')=>({date,status,items:[{productId:'removed-product',name:'Historical watch',quantity,unitPrice:price}]});
test('analysis uses historical prices, excludes cancellations and fills missing months',()=>{
 const result=analytics.analyse([order('2026-01-02',2,10.25),order('2026-03-01',3,10.25),order('2026-03-02',99,100,'Cancelled'),order('invalid',1)]);
 assert.equal(result.revenue,51.25);assert.equal(result.units,5);assert.equal(result.orders,2);assert.equal(result.average,25.625);
 assert.deepEqual(result.months.map(m=>m.key),['2026-01','2026-02','2026-03']);
 assert.equal(result.months[1].difference,-20.5);assert.equal(result.months[1].change,-100);assert.equal(result.months[2].change,null);
 assert.equal(result.products[0].name,'Historical watch');assert.equal(result.products[0].revenue,51.25);
});
test('analysis ranks by units with revenue breaking ties and handles empty data',()=>{
 const a=order('2026-09-01',2);const b=order('2026-09-01',2,20);b.items[0].productId='b';
 assert.equal(analytics.analyse([a,b]).products[0].id,'b');
 assert.deepEqual(analytics.analyse([]),{revenue:0,units:0,orders:0,average:0,months:[],products:[]});
});
