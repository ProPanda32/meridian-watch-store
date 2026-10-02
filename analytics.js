(function(root){
  function analyse(orders){
    const months=new Map(),products=new Map();let revenue=0,units=0,count=0;
    for(const order of orders){
      if(order.status==='Cancelled'||!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/.test(order.date))continue;
      const key=order.date.slice(0,7);const month=months.get(key)||{key,revenue:0,orders:0,units:0};month.orders++;count++;
      for(const item of order.items){
        const value=Math.round(item.unitPrice*100)*item.quantity;
        revenue+=value;units+=item.quantity;month.revenue+=value;month.units+=item.quantity;
        const id=item.productId||item.name;const product=products.get(id)||{id,name:item.name,units:0,revenue:0};
        product.units+=item.quantity;product.revenue+=value;products.set(id,product);
      }
      months.set(key,month);
    }
    const sorted=[...months.values()].sort((a,b)=>a.key.localeCompare(b.key));
    if(sorted.length){
      const end=sorted.at(-1).key;let key=sorted[0].key;
      while(key<=end){if(!months.has(key))months.set(key,{key,revenue:0,orders:0,units:0});const [y,m]=key.split('-').map(Number);key=`${y+(m===12?1:0)}-${String(m===12?1:m+1).padStart(2,'0')}`;}
    }
    const result=[...months.values()].sort((a,b)=>a.key.localeCompare(b.key));
    result.forEach((month,i)=>{const previous=result[i-1];month.difference=previous?month.revenue-previous.revenue:null;month.change=previous&&previous.revenue?month.difference/previous.revenue*100:null;});
    return {revenue:revenue/100,units,orders:count,average:count?revenue/count/100:0,months:result.map(m=>({...m,revenue:m.revenue/100,difference:m.difference===null?null:m.difference/100})),products:[...products.values()].sort((a,b)=>b.units-a.units||b.revenue-a.revenue||a.name.localeCompare(b.name)).map(p=>({...p,revenue:p.revenue/100}))};
  }
  if(typeof module!=='undefined')module.exports={analyse};else root.MerlockAnalytics={analyse};
})(typeof window==='undefined'?globalThis:window);
