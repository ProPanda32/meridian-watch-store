/* Browser-local preview data. Never use this as an authentication or order backend. */
(() => {
  const key = 'meridian-preview-v1';
  const newWatchCollection = [{"id": "emerald-gold", "name": "The Verdant", "style": "Gold tone · Emerald-green dial", "price": 185, "stock": 10, "active": true, "image": "assets/watches/emerald-gold-elegant-bg.webp", "description": "A deep emerald-green dial pairs with warm gold-tone markers, a date window and a matching bracelet. A rich, balanced colour palette for everyday occasions.", "badge": "New arrival"}, {"id": "blue-steel", "name": "The Mariner", "style": "Silver tone · Navy chronograph-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/blue-steel-elegant-bg.webp", "description": "A navy-blue dial with three contrasting subdials and a date window, framed by a silver-tone case and bracelet. A crisp, sporting expression of the Merlock collection.", "badge": "New arrival"}, {"id": "obsidian-black", "name": "The Obsidian", "style": "Black strap · Black dial with gold accents", "price": 175, "stock": 10, "active": true, "image": "assets/watches/obsidian-black-elegant-bg.webp", "description": "A textured black dial, gold-tone hands and markers, and a clean date window meet a black case and strap. Dark tones give this design a quiet, distinctive character.", "badge": "New arrival"}, {"id": "silver-blue", "name": "The Argent", "style": "Navy strap · Silver dial with blue accents", "price": 165, "stock": 10, "active": true, "image": "assets/watches/silver-blue-elegant-bg.webp", "description": "A silver-coloured dial with blue hands and markers is paired with a navy textured strap and silver-tone case. A light, considered design with a classic date window.", "badge": "New arrival"}, {"id": "two-tone-gmt", "name": "The Voyager", "style": "Two-tone bracelet · Black GMT-style dial", "price": 215, "stock": 10, "active": true, "image": "assets/watches/two-tone-gmt-elegant-bg.webp", "description": "A black dial and numbered black-and-gold bezel pair with a two-tone bracelet. Round luminous-style markers, a date window and a blue accent hand give this design its adventurous character.", "badge": "New arrival"}];
  const dressAndSportCollection = [{"id": "gold-rectangle", "name": "The Estelle", "style": "Gold-tone bracelet · Rectangular pearl-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/gold-rectangle-elegant-bg.webp", "description": "An elongated rectangular pearl-style dial is framed by a crystal-style border and warm gold-tone bracelet. Slender hands and Roman numeral accents give the design a refined evening character.", "badge": "New arrival"}, {"id": "navy-moonphase", "name": "The Luna", "style": "Navy strap · Blue moonphase-style dial", "price": 185, "stock": 10, "active": true, "image": "assets/watches/navy-moonphase-elegant-bg.webp", "description": "A deep navy dial with a moon-inspired detail pairs with a matching textured strap and silver-tone case. Clean markers and a softly brushed dial create a composed, classic look.", "badge": "New arrival"}, {"id": "green-chronograph", "name": "The Sylvan", "style": "Green strap · Gold-tone chronograph-style dial", "price": 205, "stock": 10, "active": true, "image": "assets/watches/green-chronograph-elegant-bg.webp", "description": "Three subdials and a numbered green bezel bring a sporting character to a deep green dial. Warm gold-tone accents and a matching textured strap complete the bold colour palette.", "badge": "New arrival"}, {"id": "pearl-two-tone", "name": "The Elara", "style": "Two-tone bracelet · Pearl-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/pearl-two-tone-elegant-bg.webp", "description": "A pale pearl-style dial, decorative crystal-style markers and a date window meet a sparkling bezel. The silver-and-gold-tone bracelet gives this design a bright, balanced finish.", "badge": "New arrival"}, {"id": "black-skeleton", "name": "The Eclipse", "style": "Black strap · Gold-accented skeleton-style dial", "price": 215, "stock": 10, "active": true, "image": "assets/watches/black-skeleton-elegant-bg.webp", "description": "An open-work dial reveals layered gold-tone details within a dark case and black strap. Gold-tone hands and markers add contrast to this expressive skeleton-style design.", "badge": "New arrival"}];
  const defaults = {
    version: 1,
    fiveWatchCollectionAdded: true,
    dressAndSportCollectionAdded: true,
    settings: {name: 'Merlock', announcement: 'THE MERLOCK EDIT · A WATCH FOR EVERY CHAPTER'},
    products: [
      {id:'noir',name:'The Aurelia',style:'Champagne gold · Celestial dial',price:185,stock:12,active:true,image:'assets/watches/champagne-moonphase.webp',description:'A star-speckled midnight-blue dial with a crescent-moon detail, framed by an engraved champagne-gold bezel. The matching bracelet carries delicate celestial motifs for a warm, quietly distinctive finish.',badge:'The signature edit'},
      {id:'silver',name:'The Selene',style:'White bracelet · Midnight-blue dial',price:165,stock:8,active:true,image:'assets/watches/midnight-moonphase.webp',description:'A midnight-blue starry dial brings depth to a bright white bracelet with gold-tone accents. Slender markers and a moon-inspired detail complete a crisp, balanced celestial design.',badge:'Everyday classic'},
      ...newWatchCollection,
      ...dressAndSportCollection
    ],
    orders: [
      {id:'DEMO-1003',date:'2026-10-01',customer:'Sample customer A',email:'customer-a@example.com',status:'Processing',items:[{productId:'noir',name:'The Aurelia',quantity:1,unitPrice:185}],notes:''},
      {id:'DEMO-1002',date:'2026-09-30',customer:'Sample customer B',email:'customer-b@example.com',status:'Shipped',items:[{productId:'silver',name:'The Selene',quantity:2,unitPrice:165}],notes:'Example: tracking details would be recorded here.'},
      {id:'DEMO-1001',date:'2026-09-29',customer:'Sample customer C',email:'customer-c@example.com',status:'Delivered',items:[{productId:'noir',name:'The Aurelia',quantity:1,unitPrice:185}],notes:''}
    ]
  };
  // Historical sample orders illustrate trends without changing live demo stock.
  const trendOrders=[];
  [5,8,6,10,13,9].forEach((count,monthIndex)=>{
    for(let i=0;i<count;i++){
      const product=defaults.products[i%3===0?0:(i+monthIndex)%defaults.products.length];
      trendOrders.push({id:`DEMO-TREND-${monthIndex+4}-${i+1}`,date:`2026-${String(monthIndex+4).padStart(2,'0')}-${String(2+i*2).padStart(2,'0')}`,customer:`Sample trend customer ${monthIndex+1}-${i+1}`,email:`trend-${monthIndex+1}-${i+1}@example.com`,status:i===count-1?'Cancelled':'Delivered',paymentStatus:'Demo — no payment',source:'Sample history',items:[{productId:product.id,name:product.name,quantity:i%4===0?2:1,unitPrice:product.price}],notes:'Historical demo order for analysis. No payment or stock movement.'});
    }
  });
  defaults.orders.push(...trendOrders);
  defaults.orders.sort((a,b)=>b.date.localeCompare(a.date));
  defaults.trendOrdersAdded=true;
  const premiumPrices={noir:1850,silver:1450,'emerald-gold':1850,'blue-steel':2250,'obsidian-black':1550,'silver-blue':1250,'two-tone-gmt':2450,'gold-rectangle':1950,'navy-moonphase':1750,'green-chronograph':2250,'pearl-two-tone':1950,'black-skeleton':2450};
  const previousPrices=Object.fromEntries(defaults.products.map(product=>[product.id,product.price]));
  for(const product of defaults.products)product.price=premiumPrices[product.id];

  const backgroundImages={"assets/watches/emerald-gold.webp": "assets/watches/emerald-gold-elegant-bg.webp", "assets/watches/blue-steel.webp": "assets/watches/blue-steel-elegant-bg.webp", "assets/watches/obsidian-black.webp": "assets/watches/obsidian-black-elegant-bg.webp", "assets/watches/silver-blue.webp": "assets/watches/silver-blue-elegant-bg.webp", "assets/watches/two-tone-gmt.webp": "assets/watches/two-tone-gmt-elegant-bg.webp", "assets/watches/gold-rectangle.webp": "assets/watches/gold-rectangle-elegant-bg.webp", "assets/watches/navy-moonphase.webp": "assets/watches/navy-moonphase-elegant-bg.webp", "assets/watches/green-chronograph.webp": "assets/watches/green-chronograph-elegant-bg.webp", "assets/watches/pearl-two-tone.webp": "assets/watches/pearl-two-tone-elegant-bg.webp", "assets/watches/black-skeleton.webp": "assets/watches/black-skeleton-elegant-bg.webp", "assets/watches/emerald-gold-green-bg.webp": "assets/watches/emerald-gold-elegant-bg.webp", "assets/watches/blue-steel-ocean-blue-bg.webp": "assets/watches/blue-steel-elegant-bg.webp", "assets/watches/obsidian-black-violet-bg.webp": "assets/watches/obsidian-black-elegant-bg.webp", "assets/watches/silver-blue-ice-blue-bg.webp": "assets/watches/silver-blue-elegant-bg.webp", "assets/watches/two-tone-gmt-copper-bg.webp": "assets/watches/two-tone-gmt-elegant-bg.webp", "assets/watches/gold-rectangle-burgundy-bg.webp": "assets/watches/gold-rectangle-elegant-bg.webp", "assets/watches/navy-moonphase-indigo-bg.webp": "assets/watches/navy-moonphase-elegant-bg.webp", "assets/watches/green-chronograph-teal-bg.webp": "assets/watches/green-chronograph-elegant-bg.webp", "assets/watches/pearl-two-tone-blush-bg.webp": "assets/watches/pearl-two-tone-elegant-bg.webp", "assets/watches/black-skeleton-graphite-bg.webp": "assets/watches/black-skeleton-elegant-bg.webp", "assets/watches/emerald-gold-green-clean-bg.webp": "assets/watches/emerald-gold-elegant-bg.webp", "assets/watches/blue-steel-ocean-blue-clean-bg.webp": "assets/watches/blue-steel-elegant-bg.webp", "assets/watches/obsidian-black-violet-clean-bg.webp": "assets/watches/obsidian-black-elegant-bg.webp", "assets/watches/silver-blue-ice-blue-clean-bg.webp": "assets/watches/silver-blue-elegant-bg.webp", "assets/watches/two-tone-gmt-copper-clean-bg.webp": "assets/watches/two-tone-gmt-elegant-bg.webp", "assets/watches/gold-rectangle-burgundy-clean-bg.webp": "assets/watches/gold-rectangle-elegant-bg.webp", "assets/watches/navy-moonphase-indigo-clean-bg.webp": "assets/watches/navy-moonphase-elegant-bg.webp", "assets/watches/green-chronograph-teal-clean-bg.webp": "assets/watches/green-chronograph-elegant-bg.webp", "assets/watches/pearl-two-tone-blush-clean-bg.webp": "assets/watches/pearl-two-tone-elegant-bg.webp", "assets/watches/black-skeleton-graphite-clean-bg.webp": "assets/watches/black-skeleton-elegant-bg.webp"};
  const accessories=[{"id": "accessory-leather-strap", "name": "Espresso Leather Strap", "style": "Espresso leather \u00b7 Silver-tone buckle", "price": 95, "stock": 20, "active": true, "category": "accessory", "image": "assets/watches/accessory-leather-strap.webp", "description": "A dark espresso leather strap with fine stitching and a silver-tone buckle. Check the lug width and attachment type of your watch before selecting a replacement strap.", "badge": "The finishing touches"}, {"id": "accessory-watch-case", "name": "Single-Watch Travel Case", "style": "Espresso leather \u00b7 Compact travel storage", "price": 125, "stock": 15, "active": true, "category": "accessory", "image": "assets/watches/accessory-watch-case.webp", "description": "A compact leather case for keeping one watch organised while travelling. Check the case fit against your watch dimensions before use.", "badge": "The finishing touches"}, {"id": "accessory-care-kit", "name": "Watch Care Kit", "style": "Microfibre cloth \u00b7 Soft-bristle brush", "price": 35, "stock": 25, "active": true, "category": "accessory", "image": "assets/watches/accessory-care-kit.webp", "description": "A soft microfibre cloth and a gentle brush for everyday watch care. Follow your watch manufacturer\u2019s care instructions; avoid abrasive cleaning and moisture on leather straps.", "badge": "The finishing touches"}];
  defaults.products.push(...accessories);defaults.accessoriesAdded=true;
  const legacyProducts = [{"id": "noir", "image": "https://images.unsplash.com/photo-1630512731371-a3747ab932ed?auto=format&fit=crop&w=1000&q=85", "style": "Black leather \u00b7 Gold tone", "description": "A dark dial, warm gold tones and a classic leather strap. A refined companion for evenings and everyday wear."}, {"id": "silver", "image": "https://images.unsplash.com/photo-1630512731154-ed3afce20505?auto=format&fit=crop&w=1000&q=85", "style": "Black leather \u00b7 Silver tone", "description": "A crisp silver-tone case and a pared-back black dial. Understated style with a versatile monochrome palette."}];
  const previousCatalogue = [{"id": "noir", "name": "The Noir", "description": "An engraved champagne-gold bracelet and a starry midnight dial with a moonphase-inspired detail. A celestial expression of understated luxury."}, {"id": "silver", "name": "The Silver", "description": "A white and gold-tone bracelet frames a midnight-blue celestial dial. A crisp, considered palette with a moonphase-inspired detail."}];
  const copy = v => JSON.parse(JSON.stringify(v));
  const statuses = ['Processing','Shipped','Delivered','Cancelled'];
  function validate(s) {
    if (!s || s.version!==1 || typeof s.settings?.name!=='string' || !s.settings.name.trim() || s.settings.name.length>60 || typeof s.settings.announcement!=='string' || s.settings.announcement.length>160 || !Array.isArray(s.products) || !Array.isArray(s.orders)) throw Error('Invalid store data.');
    if(s.settings.musicUrl!==undefined){
      if(typeof s.settings.musicUrl!=='string'||s.settings.musicUrl.length>2000)throw Error('Use a valid HTTPS audio URL.');
      if(s.settings.musicUrl){
        try{if(new URL(s.settings.musicUrl).protocol!=='https:')throw Error();}
        catch{throw Error('Use a valid HTTPS audio URL.');}
      }
    }
    const ids = new Set();
    for (const p of s.products) {
      if (!p || typeof p.id!=='string' || !/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw Error('Invalid product identifier.');
      ids.add(p.id);
      if(p.category!==undefined&&!['watch','accessory'].includes(p.category))throw Error('Choose watch or accessory.');
      for (const field of ['name','style','image','description','badge']) if(typeof p[field]!=='string' || p[field].length>2000) throw Error('Invalid product text.');
      if(!p.name.trim() || p.name.length>80 || !Number.isFinite(p.price) || p.price<0 || p.price>1000000 || Math.abs(p.price*100-Math.round(p.price*100))>0.000001 || !Number.isSafeInteger(p.stock) || p.stock<0 || p.stock>1000000 || typeof p.active!=='boolean') throw Error('Enter a valid price and whole-number stock level.');
      if(p.galleryImages!==undefined){
        if(!Array.isArray(p.galleryImages)||p.galleryImages.length>6)throw Error('Use up to six additional photo URLs.');
        for(const image of p.galleryImages){
          if(typeof image!=='string'||image.length>2000)throw Error('Use valid additional photo URLs.');
          if(!/^assets\/watches\/[a-z0-9-]+\.webp$/.test(image)){
            try{if(new URL(image).protocol!=='https:')throw Error();}catch{throw Error('Additional photos need HTTPS URLs or bundled watch image paths.');}
          }
        }
      }
      if (!/^assets\/watches\/[a-z0-9-]+\.webp$/.test(p.image)) {
        const url=new URL(p.image); if(url.protocol!=='https:') throw Error('Use an HTTPS image URL or a bundled assets/watches/*.webp path.');
      }
    }
    const orderIds=new Set();
    for(const o of s.orders) {
      if(!o || typeof o.id!=='string' || orderIds.has(o.id) || !statuses.includes(o.status) || typeof o.customer!=='string' || typeof o.email!=='string' || typeof o.date!=='string' || typeof o.notes!=='string' || o.notes.length>2000 || !Array.isArray(o.items)) throw Error('Invalid order.');
      const subtotal=o.items.reduce((n,i)=>n+Math.round(i.unitPrice*100)*i.quantity,0);
      if(o.discountAmount!==undefined&&(!Number.isFinite(o.discountAmount)||o.discountAmount<0||Math.round(o.discountAmount*100)>subtotal))throw Error('Invalid order discount.');
      if(o.delivery!==undefined){validateDelivery(o.delivery);if(![deliveryMethods[o.delivery.method].fee,{normal:6,express:15}[o.delivery.method]].includes(o.shippingFee))throw Error('Invalid postage fee.');}
      if(o.shippingFee!==undefined&&(!Number.isFinite(o.shippingFee)||o.shippingFee<0))throw Error('Invalid postage fee.');
      if(o.paymentMethod!==undefined&&!['card','wallet'].includes(o.paymentMethod))throw Error('Invalid demo payment method.');
      orderIds.add(o.id);
      for(const i of o.items) if(typeof i.name!=='string' || !Number.isSafeInteger(i.quantity) || i.quantity<1 || !Number.isFinite(i.unitPrice) || i.unitPrice<0) throw Error('Invalid order item.');
    }
    return s;
  }
  function load() {
    try { const raw=localStorage.getItem(key); if (!raw) return copy(defaults);
      const state=validate(JSON.parse(raw));
      for(const product of state.products){if(backgroundImages[product.image])product.image=backgroundImages[product.image];}
      state.products=state.products.filter(product=>product.id!=='everyday');
      for (const legacy of legacyProducts) {
        const product=state.products.find(p=>p.id===legacy.id);
        const replacement=defaults.products.find(p=>p.id===legacy.id);
        if (product?.image===legacy.image) product.image=replacement.image;
        for (const field of ['style','description']) if(product?.[field]===legacy[field]) product[field]=replacement[field];
      }
      for (const previous of previousCatalogue) {
        const product=state.products.find(p=>p.id===previous.id);
        const replacement=defaults.products.find(p=>p.id===previous.id);
        for (const field of ['name','description']) if(product?.[field]===previous[field]) product[field]=replacement[field];
      }
      if (!state.fiveWatchCollectionAdded) {
        for (const product of newWatchCollection) {
          if (!state.products.some(existing=>existing.id===product.id)) state.products.push(copy(product));
        }
        state.fiveWatchCollectionAdded=true;
      }
      if (!state.dressAndSportCollectionAdded) {
        for (const product of dressAndSportCollection) {
          if (!state.products.some(existing=>existing.id===product.id)) state.products.push(copy(product));
        }
        state.dressAndSportCollectionAdded=true;
      }
      if(!state.trendOrdersAdded){
        const existing=new Set(state.orders.map(o=>o.id));
        state.orders.push(...copy(trendOrders.filter(o=>!existing.has(o.id))));
        state.orders.sort((a,b)=>b.date.localeCompare(a.date));
        state.trendOrdersAdded=true;
      }
      if(!state.accessoriesAdded){for(const product of accessories)if(!state.products.some(p=>p.id===product.id))state.products.push(copy(product));state.accessoriesAdded=true;}
      for(const product of state.products){if(product.price===previousPrices[product.id])product.price=premiumPrices[product.id];}
      return copy(state); }
    catch { return copy(defaults); }
  }
  function save(state) {
    validate(state);
    try { localStorage.setItem(key,JSON.stringify(state)); }
    catch { throw Error('Your browser could not save these changes. Enable local storage or try another browser.'); }
    window.dispatchEvent(new Event('meridian-store-change'));
    return copy(state);
  }
  const deliveryMethods={normal:{label:'Normal delivery',fee:15,estimate:'3–5 working days'},express:{label:'Express delivery',fee:30,estimate:'1–2 working days'}};
  function validateDelivery(delivery){
    if(!delivery||typeof delivery!=='object'||!Object.hasOwn(deliveryMethods,delivery.method))throw Error('Choose normal or express delivery.');
    for(const [field,max] of [['addressLine1',150],['city',100],['postalCode',30],['country',100]])if(typeof delivery[field]!=='string'||!delivery[field].trim()||delivery[field].length>max)throw Error('Complete the delivery address.');
    for(const [field,max] of [['addressLine2',150],['instructions',500]])if(delivery[field]!==undefined&&(typeof delivery[field]!=='string'||delivery[field].length>max))throw Error('Check the delivery instructions and address.');
  }
  function createOrder({customer,email,items,paymentStatus='Unpaid',source='Admin',discountCode='',delivery,paymentMethod}) {
    if(typeof customer!=='string'||!customer.trim()||customer.trim().length>150||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!Array.isArray(items)||!items.length||items.length>100||!['Unpaid','Paid','Demo — no payment'].includes(paymentStatus)||!['Admin','Storefront'].includes(source))throw Error('Enter a name, valid email and order items.');
    if(delivery!==undefined)validateDelivery(delivery);
    if(paymentMethod!==undefined&&!['card','wallet'].includes(paymentMethod))throw Error('Choose a demo payment method.');
    const next=load(),seen=new Set();
    const snapshots=items.map(i=>{
      const p=next.products.find(p=>p.id===i.productId);
      if(!p||!p.active||seen.has(p.id)||!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>p.stock)throw Error('An item is unavailable or has insufficient stock. Please review your bag.');
      seen.add(p.id);p.stock-=i.quantity;
      return {productId:p.id,name:p.name,quantity:i.quantity,unitPrice:p.price};
    });
    const totals=quote(snapshots,discountCode);
    const id='DEMO-'+crypto.randomUUID();
    const order={id,date:new Date().toISOString().slice(0,10),customer:customer.trim(),email:email.trim(),status:'Processing',paymentStatus,source,notes:'',items:snapshots,discountCode:totals.discountCode,discountAmount:totals.discount};
    if(delivery!==undefined){order.delivery=Object.fromEntries(Object.entries(delivery).filter(([field,value])=>value!==undefined&&['method','addressLine1','addressLine2','city','postalCode','country','instructions'].includes(field)).map(([field,value])=>[field,value.trim()]));order.shippingFee=deliveryMethods[delivery.method].fee;}
    if(paymentMethod!==undefined)order.paymentMethod=paymentMethod;
    next.orders.unshift(order);save(next);return copy(order);
  }
  function quote(items,code=''){
    if(typeof code!=='string')throw Error('Enter a valid demo discount code.');
    const discountCode=code.trim().toUpperCase();
    const percent=discountCode?({WELCOME10:10,MERLOCK15:15})[discountCode]:0;
    if(percent===undefined)throw Error('That demo code is not recognised. Try WELCOME10 or MERLOCK15.');
    if(!Array.isArray(items)||items.some(i=>!Number.isFinite(i.unitPrice)||i.unitPrice<0||!Number.isSafeInteger(i.quantity)||i.quantity<1))throw Error('Invalid discount items.');
    const cents=items.reduce((sum,i)=>sum+Math.round(i.unitPrice*100)*i.quantity,0);
    const discount=Math.round(cents*percent/100);
    return {subtotal:cents/100,discount:discount/100,total:(cents-discount)/100,discountCode,percent};
  }
  function reset(){
    const next=copy(defaults);
    try{
      localStorage.setItem(key,JSON.stringify(next));
      for(const name of ['merlock-bag-v1','merlock-wishlist-v1','merlock-coupon-v1','merlock-last-order-v1'])localStorage.removeItem(name);
    }catch{throw Error('Your browser could not reset the demo. Enable local storage and try again.');}
    window.dispatchEvent(new Event('meridian-demo-reset'));
    window.dispatchEvent(new Event('meridian-store-change'));
    return next;
  }
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.MeridianStore={key,load,save,createOrder,validate,escape,statuses,quote,reset,deliveryMethods,money:n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n),orderTotal:o=>(o.items.reduce((sum,i)=>sum+i.quantity*Math.round(i.unitPrice*100),0)-Math.round((o.discountAmount||0)*100)+Math.round((o.shippingFee||0)*100))/100};
})();
