/* Shared demo catalogue and shopping helpers. */
(function(root){
  const profiles={
    noir:['Blue','Bracelet','Celestial',40,'Automatic-style'],silver:['Blue','Bracelet','Celestial',38,'Automatic-style'],
    'navy-moonphase':['Blue','Leather-style strap','Celestial',40,'Moonphase-style'],
    'gold-rectangle':['Pearl','Bracelet','Dress',28,'Quartz-style'],'pearl-two-tone':['Pearl','Bracelet','Dress',34,'Quartz-style'],
    'silver-blue':['Silver','Leather-style strap','Dress',40,'Automatic-style'],
    'blue-steel':['Blue','Bracelet','Sport',42,'Chronograph-style'],'green-chronograph':['Green','Leather-style strap','Sport',42,'Chronograph-style'],
    'two-tone-gmt':['Black','Bracelet','Sport',42,'GMT-style'],
    'emerald-gold':['Green','Bracelet','Statement',40,'Automatic-style'],'obsidian-black':['Black','Rubber-style strap','Statement',40,'Automatic-style'],
    'black-skeleton':['Black','Rubber-style strap','Statement',42,'Skeleton-style']
  };
  function details(product){
    const p=profiles[product.id]||['Other',/bracelet/i.test(product.style)?'Bracelet':'Strap','Other',40,'Analogue-style'];
    return {colour:p[0],strap:p[1],theme:p[2],size:`${p[3]} mm`,movement:p[4],water:'3 ATM (illustrative)',caseMaterial:/gold/i.test(product.style)?'Gold-tone finish':'Silver or dark-tone finish'};
  }
  function collection(products,group,groups={}){return products.filter(p=>p.active&&(group==='accessories'?p.category==='accessory':p.category!=='accessory'&&(group==='all'||(groups[group]||[]).includes(p.id))));}
  function recommendations(products,bag){return [...bag.keys()].some(id=>products.some(p=>p.id===id&&p.category!=='accessory'))?products.filter(p=>p.active&&p.category==='accessory'&&p.stock>0&&!bag.has(p.id)).slice(0,3):[];}
  function reviews(product){
    const names=['Jamie L.','Taylor R.'];
    return [{name:names[0],rating:5,title:'A considered finishing touch',text:`The ${details(product).colour.toLowerCase()} dial brings just the right amount of character to this design.`},{name:names[1],rating:4,title:'Easy to style',text:'A versatile look that works with both relaxed outfits and a smarter wardrobe.'}];
  }
  function filter(products,options={},orders=[]){
    const popularity=new Map();for(const o of orders)if(o.status!=='Cancelled')for(const i of o.items)popularity.set(i.productId,(popularity.get(i.productId)||0)+i.quantity);
    const query=(options.query||'').trim().toLowerCase();
    const result=products.filter(p=>{
      const d=details(p);
      return p.active&&(!query||`${p.name} ${p.style} ${p.description}`.toLowerCase().includes(query))&&
        (!options.colour||d.colour===options.colour)&&(!options.strap||d.strap===options.strap)&&
        (options.min===''||options.min===undefined||p.price>=Number(options.min))&&
        (options.max===''||options.max===undefined||p.price<=Number(options.max))&&
        (!options.availability||(options.availability==='in'?p.stock>0:p.stock===0));
    });
    if(options.sort==='price-low')result.sort((a,b)=>a.price-b.price||a.name.localeCompare(b.name));
    if(options.sort==='price-high')result.sort((a,b)=>b.price-a.price||a.name.localeCompare(b.name));
    if(options.sort==='popular')result.sort((a,b)=>(popularity.get(b.id)||0)-(popularity.get(a.id)||0)||a.name.localeCompare(b.name));
    if(options.sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
    return result;
  }
  function normaliseBag(entries,products){
    const result=new Map();if(!Array.isArray(entries))return result;
    for(const entry of entries){
      if(!Array.isArray(entry)||entry.length!==2)continue;
      const [id,quantity]=entry,p=products.find(p=>p.id===id&&p.active);
      if(p&&p.stock>0&&Number.isSafeInteger(quantity)&&quantity>0)result.set(id,Math.min(quantity,p.stock));
    }
    return result;
  }
  function read(storage,key,fallback){try{const raw=storage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}}
  const api={details,reviews,filter,normaliseBag,read,collection,recommendations};
  if(typeof module!=='undefined')module.exports=api;else root.MerlockShop=api;
})(typeof window==='undefined'?globalThis:window);
