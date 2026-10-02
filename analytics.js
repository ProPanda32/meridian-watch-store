(function(root){
  const validDate=date=>/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/.test(date);
  function filterOrders(orders,{from='',to=''}={}){
    if(from&&to&&from>to)return [];
    return orders.filter(o=>validDate(o.date)&&(!from||o.date.slice(0,10)>=from)&&(!to||o.date.slice(0,10)<=to));
  }
  function analyse(orders){
    const months=new Map(),products=new Map();let revenue=0,units=0,count=0,gross=0,discounts=0;
    for(const order of orders){
      if(order.status==='Cancelled'||!validDate(order.date))continue;
      const key=order.date.slice(0,7);const month=months.get(key)||{key,revenue:0,gross:0,discounts:0,orders:0,units:0};month.orders++;count++;
      const subtotal=order.items.reduce((sum,i)=>sum+Math.round(i.unitPrice*100)*i.quantity,0);
      const discount=Math.min(subtotal,Math.max(0,Math.round((order.discountAmount||0)*100)));let allocated=0;
      gross+=subtotal;discounts+=discount;month.gross+=subtotal;month.discounts+=discount;
      order.items.forEach((item,index)=>{
        const lineGross=Math.round(item.unitPrice*100)*item.quantity;
        const lineDiscount=index===order.items.length-1?discount-allocated:Math.floor(subtotal?discount*lineGross/subtotal:0);allocated+=lineDiscount;
        const value=lineGross-lineDiscount;
        revenue+=value;units+=item.quantity;month.revenue+=value;month.units+=item.quantity;
        const id=item.productId||item.name;const product=products.get(id)||{id,name:item.name,units:0,revenue:0};
        product.units+=item.quantity;product.revenue+=value;products.set(id,product);
      });
      months.set(key,month);
    }
    const sorted=[...months.values()].sort((a,b)=>a.key.localeCompare(b.key));
    if(sorted.length){
      const end=sorted.at(-1).key;let key=sorted[0].key;
      while(key<=end){if(!months.has(key))months.set(key,{key,revenue:0,gross:0,discounts:0,orders:0,units:0});const [y,m]=key.split('-').map(Number);key=`${y+(m===12?1:0)}-${String(m===12?1:m+1).padStart(2,'0')}`;}
    }
    const result=[...months.values()].sort((a,b)=>a.key.localeCompare(b.key));
    result.forEach((month,i)=>{const previous=result[i-1];month.difference=previous?month.revenue-previous.revenue:null;month.change=previous&&previous.revenue?month.difference/previous.revenue*100:null;});
    return {revenue:revenue/100,gross:gross/100,discounts:discounts/100,units,orders:count,average:count?revenue/count/100:0,months:result.map(m=>({...m,revenue:m.revenue/100,gross:m.gross/100,discounts:m.discounts/100,difference:m.difference===null?null:m.difference/100})),products:[...products.values()].sort((a,b)=>b.units-a.units||b.revenue-a.revenue||a.name.localeCompare(b.name)).map(p=>({...p,revenue:p.revenue/100}))};
  }
  function csv(rows){
    return rows.map(row=>row.map(value=>{
      let text=value===null||value===undefined?'':String(value);
      if(typeof value==='string'&&/^[=+\-@\t\r]/.test(text))text="'"+text;
      return '"'+text.replace(/"/g,'""')+'"';
    }).join(',')).join('\r\n')+'\r\n';
  }
  const api={analyse,filterOrders,csv};
  if(typeof module!=='undefined')module.exports=api;else root.MerlockAnalytics=api;
})(typeof window==='undefined'?globalThis:window);
