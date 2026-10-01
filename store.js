/* Browser-local preview data. Never use this as an authentication or order backend. */
(() => {
  const key = 'meridian-preview-v1';
  const defaults = {
    version: 1,
    settings: {name: 'Merlock', announcement: 'THE MERLOCK EDIT · A WATCH FOR EVERY CHAPTER'},
    products: [
      {id:'noir',name:'The Noir',style:'Black leather · Gold tone',price:185,stock:12,active:true,image:'https://images.unsplash.com/photo-1630512731371-a3747ab932ed?auto=format&fit=crop&w=1000&q=85',description:'A dark dial, warm gold tones and a classic leather strap. A refined companion for evenings and everyday wear.',badge:'The signature edit'},
      {id:'silver',name:'The Silver',style:'Black leather · Silver tone',price:165,stock:8,active:true,image:'https://images.unsplash.com/photo-1630512731154-ed3afce20505?auto=format&fit=crop&w=1000&q=85',description:'A crisp silver-tone case and a pared-back black dial. Understated style with a versatile monochrome palette.',badge:'Everyday classic'},
      {id:'everyday',name:'The Everyday',style:'Minimal dial · Leather strap',price:195,stock:3,active:true,image:'https://images.unsplash.com/photo-1660287049716-036751adfa1b?auto=format&fit=crop&w=1000&q=85',description:'Clean lines and an easy-wearing profile. A simple expression of everyday style, from your morning coffee to your last meeting.',badge:'A considered choice'}
    ],
    orders: [
      {id:'DEMO-1003',date:'2026-10-01',customer:'Sample customer A',email:'customer-a@example.com',status:'Processing',items:[{productId:'noir',name:'The Noir',quantity:1,unitPrice:185}],notes:''},
      {id:'DEMO-1002',date:'2026-09-30',customer:'Sample customer B',email:'customer-b@example.com',status:'Shipped',items:[{productId:'silver',name:'The Silver',quantity:2,unitPrice:165}],notes:'Example: tracking details would be recorded here.'},
      {id:'DEMO-1001',date:'2026-09-29',customer:'Sample customer C',email:'customer-c@example.com',status:'Delivered',items:[{productId:'everyday',name:'The Everyday',quantity:1,unitPrice:195}],notes:''}
    ]
  };
  const copy = v => JSON.parse(JSON.stringify(v));
  const statuses = ['Processing','Shipped','Delivered','Cancelled'];
  function validate(s) {
    if (!s || s.version!==1 || typeof s.settings?.name!=='string' || !s.settings.name.trim() || s.settings.name.length>60 || typeof s.settings.announcement!=='string' || s.settings.announcement.length>160 || !Array.isArray(s.products) || !Array.isArray(s.orders)) throw Error('Invalid store data.');
    const ids = new Set();
    for (const p of s.products) {
      if (!p || typeof p.id!=='string' || !/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw Error('Invalid product identifier.');
      ids.add(p.id);
      for (const field of ['name','style','image','description','badge']) if(typeof p[field]!=='string' || p[field].length>2000) throw Error('Invalid product text.');
      if(!p.name.trim() || p.name.length>80 || !Number.isFinite(p.price) || p.price<0 || p.price>1000000 || Math.abs(p.price*100-Math.round(p.price*100))>0.000001 || !Number.isSafeInteger(p.stock) || p.stock<0 || p.stock>1000000 || typeof p.active!=='boolean') throw Error('Enter a valid price and whole-number stock level.');
      const url=new URL(p.image); if(url.protocol!=='https:') throw Error('Product images must use HTTPS.');
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
    try { const raw=localStorage.getItem(key); return raw ? copy(validate(JSON.parse(raw))) : copy(defaults); }
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
