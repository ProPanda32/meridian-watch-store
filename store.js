/* Browser-local preview data. Never use this as an authentication or order backend. */
(() => {
  const key = 'meridian-preview-v1';
  const newWatchCollection = [{"id": "emerald-gold", "name": "The Verdant", "style": "Gold tone · Emerald-green dial", "price": 185, "stock": 10, "active": true, "image": "assets/watches/emerald-gold.webp", "description": "A deep emerald-green dial pairs with warm gold-tone markers, a date window and a matching bracelet. A rich, balanced colour palette for everyday occasions.", "badge": "New arrival"}, {"id": "blue-steel", "name": "The Mariner", "style": "Silver tone · Navy chronograph-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/blue-steel.webp", "description": "A navy-blue dial with three contrasting subdials and a date window, framed by a silver-tone case and bracelet. A crisp, sporting expression of the Merlock collection.", "badge": "New arrival"}, {"id": "obsidian-black", "name": "The Obsidian", "style": "Black strap · Black dial with gold accents", "price": 175, "stock": 10, "active": true, "image": "assets/watches/obsidian-black.webp", "description": "A textured black dial, gold-tone hands and markers, and a clean date window meet a black case and strap. Dark tones give this design a quiet, distinctive character.", "badge": "New arrival"}, {"id": "silver-blue", "name": "The Argent", "style": "Navy strap · Silver dial with blue accents", "price": 165, "stock": 10, "active": true, "image": "assets/watches/silver-blue.webp", "description": "A silver-coloured dial with blue hands and markers is paired with a navy textured strap and silver-tone case. A light, considered design with a classic date window.", "badge": "New arrival"}, {"id": "two-tone-gmt", "name": "The Voyager", "style": "Two-tone bracelet · Black GMT-style dial", "price": 215, "stock": 10, "active": true, "image": "assets/watches/two-tone-gmt.webp", "description": "A black dial and numbered black-and-gold bezel pair with a two-tone bracelet. Round luminous-style markers, a date window and a blue accent hand give this design its adventurous character.", "badge": "New arrival"}];
  const dressAndSportCollection = [{"id": "gold-rectangle", "name": "The Estelle", "style": "Gold-tone bracelet · Rectangular pearl-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/gold-rectangle.webp", "description": "An elongated rectangular pearl-style dial is framed by a crystal-style border and warm gold-tone bracelet. Slender hands and Roman numeral accents give the design a refined evening character.", "badge": "New arrival"}, {"id": "navy-moonphase", "name": "The Luna", "style": "Navy strap · Blue moonphase-style dial", "price": 185, "stock": 10, "active": true, "image": "assets/watches/navy-moonphase.webp", "description": "A deep navy dial with a moon-inspired detail pairs with a matching textured strap and silver-tone case. Clean markers and a softly brushed dial create a composed, classic look.", "badge": "New arrival"}, {"id": "green-chronograph", "name": "The Sylvan", "style": "Green strap · Gold-tone chronograph-style dial", "price": 205, "stock": 10, "active": true, "image": "assets/watches/green-chronograph.webp", "description": "Three subdials and a numbered green bezel bring a sporting character to a deep green dial. Warm gold-tone accents and a matching textured strap complete the bold colour palette.", "badge": "New arrival"}, {"id": "pearl-two-tone", "name": "The Elara", "style": "Two-tone bracelet · Pearl-style dial", "price": 195, "stock": 10, "active": true, "image": "assets/watches/pearl-two-tone.webp", "description": "A pale pearl-style dial, decorative crystal-style markers and a date window meet a sparkling bezel. The silver-and-gold-tone bracelet gives this design a bright, balanced finish.", "badge": "New arrival"}, {"id": "black-skeleton", "name": "The Eclipse", "style": "Black strap · Gold-accented skeleton-style dial", "price": 215, "stock": 10, "active": true, "image": "assets/watches/black-skeleton.webp", "description": "An open-work dial reveals layered gold-tone details within a dark case and black strap. Gold-tone hands and markers add contrast to this expressive skeleton-style design.", "badge": "New arrival"}];
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
      for (const field of ['name','style','image','description','badge']) if(typeof p[field]!=='string' || p[field].length>2000) throw Error('Invalid product text.');
      if(!p.name.trim() || p.name.length>80 || !Number.isFinite(p.price) || p.price<0 || p.price>1000000 || Math.abs(p.price*100-Math.round(p.price*100))>0.000001 || !Number.isSafeInteger(p.stock) || p.stock<0 || p.stock>1000000 || typeof p.active!=='boolean') throw Error('Enter a valid price and whole-number stock level.');
      if (!/^assets\/watches\/[a-z0-9-]+\.webp$/.test(p.image)) {
        const url=new URL(p.image); if(url.protocol!=='https:') throw Error('Use an HTTPS image URL or a bundled assets/watches/*.webp path.');
      }
    }
    const orderIds=new Set();
    for(const o of s.orders) {
      if(!o || typeof o.id!=='string' || orderIds.has(o.id) || !statuses.includes(o.status) || typeof o.customer!=='string' || typeof o.email!=='string' || typeof o.date!=='string' || typeof o.notes!=='string' || o.notes.length>2000 || !Array.isArray(o.items)) throw Error('Invalid order.');
      orderIds.add(o.id);
      for(const i of o.items) if(typeof i.name!=='string' || !Number.isSafeInteger(i.quantity) || i.quantity<1 || !Number.isFinite(i.unitPrice) || i.unitPrice<0) throw Error('Invalid order item.');
    }
    return s;
  }
  function load() {
    try { const raw=localStorage.getItem(key); if (!raw) return copy(defaults);
      const state=validate(JSON.parse(raw));
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
  function createOrder({customer,email,items,paymentStatus='Unpaid',source='Admin'}) {
    if(typeof customer!=='string'||!customer.trim()||customer.trim().length>150||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!Array.isArray(items)||!items.length||items.length>100||!['Unpaid','Paid','Demo — no payment'].includes(paymentStatus)||!['Admin','Storefront'].includes(source))throw Error('Enter a name, valid email and order items.');
    const next=load(),seen=new Set();
    const snapshots=items.map(i=>{
      const p=next.products.find(p=>p.id===i.productId);
      if(!p||!p.active||seen.has(p.id)||!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>p.stock)throw Error('An item is unavailable or has insufficient stock. Please review your bag.');
      seen.add(p.id);p.stock-=i.quantity;
      return {productId:p.id,name:p.name,quantity:i.quantity,unitPrice:p.price};
    });
    const id='DEMO-'+crypto.randomUUID();
    const order={id,date:new Date().toISOString().slice(0,10),customer:customer.trim(),email:email.trim(),status:'Processing',paymentStatus,source,notes:'',items:snapshots};
    next.orders.unshift(order);save(next);return copy(order);
  }
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.MeridianStore={key,load,save,createOrder,validate,escape,statuses,money:n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n),orderTotal:o=>o.items.reduce((sum,i)=>sum+i.quantity*i.unitPrice,0)};
})();
