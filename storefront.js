const store=window.MeridianStore,esc=store.escape,money=store.money,$=id=>document.getElementById(id);
const shop=window.MerlockShop;
// Only the bundled photos have matching empty background plates.
const watchLayers={
  'champagne-moonphase':[1672,941,'800,68 1008,68 1065,140 1070,750 1010,900 960,941 620,941 600,790 560,580 575,360 650,210 740,156'],
  'midnight-moonphase':[1254,1254,'585,75 862,75 931,180 935,780 855,1080 950,1254 300,1254 420,1080 380,790 310,620 310,400 415,235 500,180'],
  'emerald-gold-elegant-bg':[834,460,'277,0 445,0 480,65 535,110 562,163 566,247 531,333 546,460 370,460 346,375 297,324 260,250 260,180 281,88'],
  'blue-steel-elegant-bg':[834,460,'277,0 455,0 485,68 553,112 573,180 573,273 535,350 552,460 369,460 338,375 293,320 266,250 261,174 281,89'],
  'obsidian-black-elegant-bg':[557,476,'144,5 280,5 340,49 369,88 408,153 427,163 430,217 407,266 388,333 399,476 252,476 209,391 166,332 131,272 130,168 145,111'],
  'silver-blue-elegant-bg':[550,476,'126,0 257,0 285,51 327,89 379,152 408,173 405,212 381,230 358,303 373,476 239,476 208,400 177,337 121,276 112,188 125,126'],
  'two-tone-gmt-elegant-bg':[556,476,'174,5 307,5 335,51 370,97 414,153 441,150 445,199 423,234 398,305 412,455 377,476 279,476 243,393 212,341 162,280 150,196 157,125'],
  'gold-rectangle-elegant-bg':[460,460,'101,10 216,10 243,59 279,89 297,161 334,165 340,213 317,222 340,303 326,343 349,460 221,460 199,395 171,350 147,314 121,210 107,127'],
  'navy-moonphase-elegant-bg':[460,460,'97,9 222,9 255,61 302,103 350,150 379,165 385,209 362,228 337,306 363,460 227,460 192,393 158,344 103,285 87,202 94,128'],
  'green-chronograph-elegant-bg':[476,476,'104,9 246,9 279,56 311,96 351,112 367,144 362,161 385,162 388,196 368,222 383,235 381,272 356,284 338,324 369,476 225,476 198,401 154,352 102,285 86,208 95,122'],
  'pearl-two-tone-elegant-bg':[476,476,'92,7 222,7 251,54 301,93 342,146 365,162 369,194 346,215 327,296 352,429 363,476 243,476 212,406 179,353 126,289 95,213 92,139'],
  'black-skeleton-elegant-bg':[476,476,'103,4 247,4 281,49 307,93 357,143 397,163 400,204 375,219 393,238 396,270 364,285 345,324 376,476 228,476 191,400 151,355 111,301 102,243 96,168 102,104']
};
function watchImage(product){
  const label=product.name?`${product.name} — ${product.style}`:`${product.style} watch`;
  const photo=`<img class="watch-photo" src="${esc(product.image)}" alt="${esc(label)}" loading="lazy">`;
  const name=product.image.replace(/^assets\/watches\//,'').replace(/\.webp$/,'');
  const layer=watchLayers[name];
  if(!layer||product.image!==`assets/watches/${name}.webp`)return photo;
  const [width,height,points]=layer;
  // Keep the original scenery outside the watch visible throughout the dissolve.
  const hole='M'+points.split(' ').join('L')+'Z';
  const mask=encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path fill="white" fill-rule="evenodd" d="M0 0H${width}V${height}H0Z ${hole}"/></svg>`).replace(/'/g,'%27');
  return `<img class="watch-backdrop" src="assets/watches/${name}-empty.webp" alt="" aria-hidden="true" loading="lazy"><img class="watch-context" src="${esc(product.image)}" alt="" aria-hidden="true" loading="lazy" style="--watch-mask:url('data:image/svg+xml,${mask}')">${photo}`;
}
const bagKey='merlock-bag-v1',wishKey='merlock-wishlist-v1',couponKey='merlock-coupon-v1';
function readPreference(key,fallback){try{return shop.read(localStorage,key,fallback);}catch{return fallback;}}
let state=store.load();const bag=shop.normaliseBag(readPreference(bagKey,[]),state.products);
const savedRaw=readPreference(wishKey,[]);const wishlist=new Set(Array.isArray(savedRaw)?savedRaw.filter(id=>typeof id==='string'):[]),comparison=new Set();
let discountCode=readPreference(couponKey,'');try{discountCode=store.quote([],discountCode).discountCode;}catch{discountCode='';}
let toastTimer,detailProductId,trackedOrderId,trackedEmail;
const collectionGroups={
  celestial:['noir','silver','navy-moonphase'],
  dress:['gold-rectangle','pearl-two-tone','silver-blue'],
  sport:['blue-steel','green-chronograph','two-tone-gmt'],
  statement:['emerald-gold','obsidian-black','black-skeleton']
};
let selectedCollection='all';
function collectionProducts(group){return shop.collection(state.products,group,collectionGroups);}
let collectionAnimation,collectionTransition=0;
const collectionMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
async function selectCollection(button){
  if(button.dataset.collection===selectedCollection)return;
  selectedCollection=button.dataset.collection;
  if(selectedCollection==='accessories'){for(const name of ['colour','strap'])$('collection-filters').elements[name].value='';}
  const panel=$('products'),transition=++collectionTransition;
  collectionAnimation?.cancel();
  if(collectionMotion.matches||!panel.animate){
    panel.inert=false;panel.classList.remove('is-switching');panel.removeAttribute('aria-busy');render();return;
  }
  const oldHeight=panel.getBoundingClientRect().height;
  panel.inert=true;panel.classList.add('is-switching');panel.setAttribute('aria-busy','true');
  try{
    collectionAnimation=panel.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:120,easing:'ease-out',fill:'forwards'});
    await collectionAnimation.finished;
    if(transition!==collectionTransition)return;
    render();
    const newHeight=panel.getBoundingClientRect().height;
    collectionAnimation.cancel();
    collectionAnimation=panel.animate([
      {opacity:0,transform:'translateY(8px)',height:oldHeight+'px'},
      {opacity:1,transform:'translateY(0)',height:newHeight+'px'}
    ],{duration:280,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
    await collectionAnimation.finished;
  }catch{/* A newer tab selection cancels the previous transition. */}
  finally{
    if(transition===collectionTransition){
      collectionAnimation?.cancel();collectionAnimation=null;
      panel.inert=false;panel.classList.remove('is-switching');panel.removeAttribute('aria-busy');
    }
  }
}
const collectionTabs=document.querySelector('.collection-tabs');
collectionTabs.addEventListener('click',event=>{const button=event.target.closest('[data-collection]');if(button)selectCollection(button);});
collectionTabs.addEventListener('keydown',event=>{
  const buttons=[...collectionTabs.querySelectorAll('[role="tab"]')],index=buttons.indexOf(event.target);
  if(index<0)return;
  let next;
  if(event.key==='ArrowRight')next=(index+1)%buttons.length;
  else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=buttons.length-1;
  else return;
  event.preventDefault();selectCollection(buttons[next]);buttons[next].focus();
});
function toast(message){$('toast').textContent=message;$('toast').classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('is-visible'),2500);}
let renderedCollection;
function render(){state=store.load();document.title=state.settings.name+' | Time, well chosen.';document.querySelectorAll('.logo').forEach(el=>el.textContent=state.settings.name.toUpperCase());document.querySelector('.announcement').textContent=state.settings.announcement;$('year').textContent=new Date().getFullYear();
  for(const [id,q]of bag){const p=state.products.find(p=>p.id===id);if(!p||!p.active||p.stock===0)bag.delete(id);else if(q>p.stock)bag.set(id,p.stock);}
  for(const button of collectionTabs.querySelectorAll('[data-collection]')){
    const selected=button.dataset.collection===selectedCollection;
    button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
    button.querySelector('[data-collection-count]').textContent=collectionProducts(button.dataset.collection).length;
  }
  const accessoryView=selectedCollection==='accessories';
  for(const name of ['colour','strap'])$('collection-filters').elements[name].closest('label').hidden=accessoryView;
  $('collection-filters').elements.query.placeholder=accessoryView?'Name or material':'Name, colour or dial';
  $('collection-search-label').textContent=accessoryView?'Find an accessory':'Find a watch';
  const singular=accessoryView?'accessory':'watch',plural=accessoryView?'accessories':'watches';
  const filters=Object.fromEntries(new FormData($('collection-filters')));
  const activeCount=Object.entries(filters).filter(([key,value])=>value&&(key!=='sort'||value!=='featured')).length;
  $('filter-active-count').hidden=!activeCount;
  $('filter-active-count').textContent=`${activeCount} active`;
  const visibleProducts=shop.filter(collectionProducts(selectedCollection),filters,state.orders);
  $('products').setAttribute('aria-labelledby','collection-tab-'+selectedCollection);
  $('collection-status').textContent=`Showing ${visibleProducts.length} ${visibleProducts.length===1?singular:plural}.`;
  $('collection-results').textContent=`${visibleProducts.length} ${visibleProducts.length===1?singular:plural} in this view`;
  const collectionSignature=JSON.stringify([selectedCollection,visibleProducts]);
  if(collectionSignature!==renderedCollection){
  renderedCollection=collectionSignature;
  $('products').innerHTML=visibleProducts.map(p=>`<article><div class="product-image">${watchImage(p)}${p.category==='accessory'?'':`<button class="wish-button" type="button" data-wish="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${wishlist.has(p.id)}"><svg class="icon" aria-hidden="true"><use href="#icon-heart"/></svg></button>`}<span class="badge${p.stock===0?' sold-out-badge':''}">${p.stock===0?'Sold out':esc(p.badge)}</span></div><div class="product-info"><div><h3>${esc(p.name)}</h3><p>${esc(p.style)}</p></div><span class="price">${money(p.price)}</span></div><div class="product-actions"><button data-details="${p.id}">View details</button>${bagStepper(p)}</div>${p.category==='accessory'?'':`<div class="card-extras"><span class="sample-rating" aria-label="Sample rating 4.5 out of 5">★ 4.5 <small>Sample reviews</small></span><label><input type="checkbox" data-compare="${p.id}" ${comparison.has(p.id)?'checked':''}> Compare</label></div>`}</article>`).join('')||'<div class="empty-collection"><p>No products match these filters.</p><button class="outline-button" type="button" id="empty-reset">Clear filters</button></div>';
  }
  syncShoppingTools();renderWishlist();
  renderBag();
  if($('tracking-dialog').open&&trackedOrderId)renderTracking();
}
function bagStepper(product){
  const quantity=product.stock>0?(bag.get(product.id)||0):0;
  return `<div class="bag-controls" data-bag-controls="${product.id}"><button type="button" class="bag-add-button" data-add="${product.id}" ${quantity?'hidden':''} ${product.stock?'':'disabled'}>${product.stock?'Add to bag':'Sold out'}</button><div class="bag-stepper" ${quantity?'':'hidden'} role="group" aria-label="${esc(product.name)} bag quantity"><button type="button" data-decrease="${product.id}" aria-label="Remove one ${esc(product.name)} from bag" ${quantity?'':'disabled'}>−</button><span data-bag-quantity="${product.id}" aria-label="${quantity} in bag">${quantity}</span><button type="button" data-add="${product.id}" aria-label="Add one ${esc(product.name)} to bag" ${quantity>=product.stock?'disabled':''}>+</button></div></div>`;
}
function removeOneFromBag(id){
  const quantity=bag.get(id)||0;
  if(!quantity)return;
  if(quantity===1)bag.delete(id);else bag.set(id,quantity-1);
  renderBag();toast('Removed one from your bag');
}
function syncBagIndicators(){
  for(const controls of document.querySelectorAll('[data-bag-controls]')){
    const product=state.products.find(p=>p.id===controls.dataset.bagControls);
    const soldOut=!product||product.stock<=0;
    const quantity=soldOut?0:(bag.get(controls.dataset.bagControls)||0);
    const add=controls.querySelector('.bag-add-button');
    const stepper=controls.querySelector('.bag-stepper');
    const focused=controls.contains(document.activeElement);
    const changed=add.hidden!==Boolean(quantity);
    add.hidden=Boolean(quantity);stepper.hidden=!quantity;
    add.textContent=soldOut?'Sold out':'Add to bag';
    add.classList.toggle('is-sold-out',soldOut);
    add.disabled=soldOut||!product.active;
    if(changed&&focused)(quantity?stepper.querySelector('[data-add]'):add).focus();
  }
  for(const button of document.querySelectorAll('[data-decrease]'))button.disabled=!bag.get(button.dataset.decrease);
  for(const counter of document.querySelectorAll('[data-bag-quantity]')){
    const quantity=bag.get(counter.dataset.bagQuantity)||0;
    counter.textContent=quantity;counter.setAttribute('aria-label',`${quantity} in bag`);
  }
  for(const button of document.querySelectorAll('[data-add]')){
    const product=state.products.find(p=>p.id===button.dataset.add);
    button.disabled=!product||!product.active||(bag.get(product.id)||0)>=product.stock;
  }
}
function bagItems(){return [...bag].map(([id,quantity])=>({product:state.products.find(p=>p.id===id),quantity}));}
function renderBag(){
  for(const [id,q]of bag){const p=state.products.find(p=>p.id===id&&p.active);if(!p||p.stock<=0)bag.delete(id);else if(q>p.stock)bag.set(id,p.stock);}
  persistBag();
  const items=bagItems();const container=$('cart-items');
  $('bag-count').textContent=items.reduce((s,i)=>s+i.quantity,0);
  for(const row of container.querySelectorAll('[data-cart-product]')){
    if(!bag.has(row.dataset.cartProduct))row.remove();
  }
  if(items.length){
    container.querySelector('.details')?.remove();
    for(const {product:p,quantity:q} of items){
      let row=[...container.children].find(el=>el.dataset.cartProduct===p.id);
      if(!row){
        row=document.createElement('div');row.className='cart-row';row.dataset.cartProduct=p.id;
        row.innerHTML=`<img class="cart-watch-image" width="72" height="72"><div><p></p><div class="quantity"><button data-quantity="${p.id}" data-delta="-1">−</button><span></span><button data-quantity="${p.id}" data-delta="1">+</button><button class="remove" data-remove="${p.id}" style="width:auto">Remove</button></div></div><span class="cart-line-price"></span>`;
        container.append(row);
      }
      const image=row.querySelector('img');
      if(image.getAttribute('src')!==p.image)image.src=p.image;
      image.alt=p.name+' — '+p.style;
      row.querySelector('p').textContent=p.name;
      row.querySelector('.quantity span').textContent=q;
      const minus=row.querySelector('[data-delta="-1"]');const plus=row.querySelector('[data-delta="1"]');
      minus.setAttribute('aria-label','Decrease '+p.name+' quantity');
      plus.setAttribute('aria-label','Increase '+p.name+' quantity');plus.disabled=q>=p.stock;
      row.querySelector('.cart-line-price').textContent=money(p.price*q);
    }
  }else if(!container.querySelector('.details')){
    container.innerHTML='<p class="details">Your bag is empty. Find a watch that feels like you.</p>';
  }
  $('subtotal').textContent=money(items.reduce((s,i)=>s+i.quantity*i.product.price,0));
  renderDiscount();
  $('checkout-button').disabled=!items.length;
  if($('checkout-dialog').open)renderCheckout();
  syncBagIndicators();syncDetailsStock();
}
function addToBag(id){state=store.load();const p=state.products.find(p=>p.id===id);if(!p||!p.active)throw Error('Unknown product');if(p.stock===0){render();toast('This product is sold out');return {error:'Insufficient stock'};}if((bag.get(id)||0)>=p.stock){toast('No more stock available');return {error:'Insufficient stock'};}bag.set(id,(bag.get(id)||0)+1);renderBag();toast('Added to your bag');return {product:id,quantity:bag.get(id),totalItems:[...bag.values()].reduce((a,b)=>a+b,0)};}
function syncDetailsStock(){
  if(!detailProductId)return;
  const product=state.products.find(p=>p.id===detailProductId&&p.active);
  const controls=$('detail-bag-controls');
  if(!product){controls.textContent='Unavailable';controls.dataset.product='';return;}
  if(controls.dataset.product!==product.id){controls.innerHTML=bagStepper(product);controls.dataset.product=product.id;}
  $('detail-stock-status').textContent=product.stock===0?'Sold out':'';
  syncBagIndicators();
}
function showDetails(id){
  state=store.load();const p=state.products.find(p=>p.id===id&&p.active);if(!p)return;
  for(const modal of ['wishlist-dialog','compare-dialog','search-dialog'])if($(modal).open)$(modal).close();
  const img=$('detail-img');img.src=p.image;img.alt=p.name+' — '+p.style;
  $('detail-title').textContent=p.name;$('detail-copy').textContent=p.description+' '+money(p.price);
  detailProductId=id;$('detail-wish').dataset.wish=id;
  $('detail-wish').hidden=p.category==='accessory';
  document.querySelector('[data-gallery=full]').textContent=p.category==='accessory'?'Full product':'Full watch';
  document.querySelector('[data-gallery=dial]').hidden=p.category==='accessory';
  $('extra-gallery').innerHTML=(p.galleryImages||[]).map((url,index)=>`<button type="button" data-photo="${index}" aria-label="Show additional photo ${index+1}" aria-pressed="false"><img src="${esc(url)}" alt="Additional view ${index+1} of ${esc(p.name)}"></button>`).join('');
  setGallery('full');$('detail-zoom').classList.remove('is-zoomed');$('detail-zoom').setAttribute('aria-pressed','false');
  const d=shop.details(p);
  $('detail-specs').innerHTML=`<h3>Design details</h3><p class="preview-note">Illustrative specifications, not verified technical specifications.</p><dl class="watch-specs">${[['Dial colour',d.colour],['Strap',d.strap],['Case size',d.size],['Movement',d.movement],['Finish',d.caseMaterial],['Water resistance',d.water]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  $('detail-reviews').innerHTML=`<h3>Sample reviews</h3><p class="preview-note">4.5 / 5 · Two fictional reviews to demonstrate the experience.</p>${shop.reviews(p).map(r=>`<article class="review-card"><div><strong>${esc(r.name)}</strong><span aria-label="${r.rating} out of 5">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p><small>Sample review · Not a real customer</small></article>`).join('')}`;
  if(p.category==='accessory'){$('detail-specs').innerHTML='<h3>Care and compatibility</h3><p>Check dimensions and compatibility with your watch before choosing an accessory. Follow the manufacturer’s guidance for fitting and care.</p>';$('detail-reviews').innerHTML='';}
  syncDetailsStock();syncShoppingTools();if(!$('details-dialog').open)$('details-dialog').showModal();
}
function openBag(){for(const modal of ['wishlist-dialog','compare-dialog','details-dialog'])if($(modal).open)$(modal).close();render();$('bag-dialog').showModal();}
function bagQuote(){return store.quote(bagItems().map(({product,quantity})=>({unitPrice:product.price,quantity})),discountCode);}
function renderDiscount(){
  const totals=bagQuote();$('discount-code').value=discountCode;
  $('discount-remove').hidden=!discountCode;$('bag-discount').hidden=!discountCode;
  $('bag-discount').innerHTML=`<span>${esc(discountCode)} · ${totals.percent}% off</span><span>−${money(totals.discount)}</span>`;
  $('bag-total').textContent=money(totals.total);
  $('discount-status').textContent=discountCode?`${discountCode} applied. You save ${money(totals.discount)}.`:'Try WELCOME10 (10%) or MERLOCK15 (15%).';
}
let accessorySuggestionSignature;
const checkoutAccessoryIds=new Set();
function renderAccessorySuggestions(){
  for(const product of shop.recommendations(state.products,bag))checkoutAccessoryIds.add(product.id);
  for(const product of state.products)if(product.category==='accessory'&&bag.has(product.id))checkoutAccessoryIds.add(product.id);
  const products=state.products.filter(p=>p.active&&p.category==='accessory'&&checkoutAccessoryIds.has(p.id)),signature=JSON.stringify(products);
  $('checkout-accessories').hidden=!products.length;
  if(signature!==accessorySuggestionSignature){accessorySuggestionSignature=signature;$('checkout-accessory-items').innerHTML=products.map(p=>`<article class="checkout-accessory"><img src="${esc(p.image)}" alt="${esc(p.name)}" width="64" height="64"><div><h4>${esc(p.name)}</h4><p>${money(p.price)}</p></div>${bagStepper(p)}</article>`).join('');}
}
function renderCheckout(){
  renderAccessorySuggestions();
  const totals=bagQuote(),shipping=store.deliveryMethods[$('checkout-form').elements.deliveryMethod.value];$('checkout-summary').innerHTML=bagItems().map(({product:p,quantity:q})=>`<p>${esc(p.name)} × ${q} — ${money(p.price*q)}</p>`).join('')+`<div class="summary-line"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>${discountCode?`<div class="summary-line"><span>${esc(discountCode)}</span><span>−${money(totals.discount)}</span></div>`:''}<div class="summary-line"><span>${esc(shipping.label)}</span><span>${money(shipping.fee)}</span></div><div class="total"><strong>Total</strong><strong>${money(totals.total+shipping.fee)}</strong></div>`;$('place-order').disabled=!bag.size;
}
function startCheckout(){checkoutAccessoryIds.clear();accessorySuggestionSignature=undefined;render();if(!bag.size)return;$('bag-dialog').close();$('checkout-error').textContent='';renderCheckout();$('checkout-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.details)showDetails(b.dataset.details);if(b.dataset.add)addToBag(b.dataset.add);if(b.dataset.decrease)removeOneFromBag(b.dataset.decrease);if(b.dataset.remove){bag.delete(b.dataset.remove);renderBag();}if(b.dataset.quantity){state=store.load();const p=state.products.find(p=>p.id===b.dataset.quantity);if(!p)return;const q=(bag.get(p.id)||0)+Number(b.dataset.delta);if(q<=0)bag.delete(p.id);else bag.set(p.id,Math.min(q,p.stock));renderBag();}});
$('checkout-form').addEventListener('change',e=>{if(e.target.name==='deliveryMethod')renderCheckout();});
$('checkout-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;$('place-order').disabled=true;try{const order=store.createOrder({customer:f.elements.customer.value,email:f.elements.email.value,paymentStatus:'Demo — no payment',source:'Storefront',discountCode,paymentMethod:f.elements.paymentMethod.value,delivery:{method:f.elements.deliveryMethod.value,addressLine1:f.elements.addressLine1.value,addressLine2:f.elements.addressLine2.value,city:f.elements.city.value,postalCode:f.elements.postalCode.value,country:f.elements.country.value,instructions:f.elements.deliveryInstructions.value},items:[...bag].map(([productId,quantity])=>({productId,quantity}))});bag.clear();discountCode='';writePreference(couponKey,'');render();$('checkout-dialog').close();$('confirmation-text').textContent=order.id+' · '+money(store.orderTotal(order))+' — saved to the admin Orders page.';$('confirmation-track').dataset.order=order.id;writePreference('merlock-last-order-v1',{id:order.id,email:order.email});$('confirmation-dialog').showModal();}catch(err){$('checkout-error').textContent=err.message;$('place-order').disabled=!bag.size;}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
window.addEventListener('pageshow',render);
window.addEventListener('storage',e=>{if([bagKey,wishKey,couponKey].includes(e.key)){loadShoppingPreferences();render();}else if(e.key===store.key){loadShoppingPreferences();render();}});window.addEventListener('focus',render);window.addEventListener('meridian-store-change',render);
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'add_watch_to_bag',description:'Add one demo watch to the visible bag. Does not place an order.',inputSchema:{type:'object',properties:{productId:{type:'string'}},required:['productId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.productId!=='string'||Object.keys(input).some(k=>k!=='productId'))throw Error('A valid productId is required');return addToBag(input.productId);}})).catch(()=>{});}catch{}}
function writePreference(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function persistBag(){
  const saved=writePreference(bagKey,[...bag]);$('bag-storage-note').hidden=saved;
  $('bag-storage-note').textContent='Your bag works for this visit, but this browser cannot save it for later.';
}
function loadShoppingPreferences(){
  bag.clear();for(const [id,q]of shop.normaliseBag(readPreference(bagKey,[]),store.load().products))bag.set(id,q);
  wishlist.clear();const ids=readPreference(wishKey,[]);if(Array.isArray(ids))for(const id of ids)if(typeof id==='string')wishlist.add(id);
  try{discountCode=store.quote([],readPreference(couponKey,'')).discountCode;}catch{discountCode='';}
}
function syncShoppingTools(){
  const active=new Set(state.products.filter(p=>p.active).map(p=>p.id));
  for(const id of wishlist)if(!active.has(id))wishlist.delete(id);
  for(const id of comparison)if(!active.has(id))comparison.delete(id);
  $('wishlist-count').textContent=wishlist.size;$('compare-count').textContent=comparison.size;$('compare-open').disabled=comparison.size<2;
  for(const button of document.querySelectorAll('[data-wish]')){
    const saved=wishlist.has(button.dataset.wish);button.setAttribute('aria-pressed',String(saved));
    const product=state.products.find(p=>p.id===button.dataset.wish);
    button.setAttribute('aria-label',`${saved?'Remove':'Save'} ${product?.name||'watch'} ${saved?'from saved watches':''}`.trim());
    if(button.id==='detail-wish')button.textContent=saved?'Saved ✓':'Save watch';
  }
  for(const input of document.querySelectorAll('[data-compare]'))input.checked=comparison.has(input.dataset.compare);
}
let savedSignature;
function renderWishlist(){
  const products=state.products.filter(p=>p.active&&wishlist.has(p.id));const signature=JSON.stringify(products);
  if(signature===savedSignature)return;savedSignature=signature;
  $('wishlist-items').innerHTML=products.length?products.map(p=>`<article class="saved-row"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>${money(p.price)}${p.stock===0?' · Sold out':''}</p><div class="saved-actions"><button class="text-button" data-details="${p.id}" type="button">View watch</button><button class="text-button" data-wish="${p.id}" type="button">Remove</button></div></div>${bagStepper(p)}</article>`).join(''):'<p class="details">No saved watches yet. Tap a heart in the collection to keep a favourite here.</p>';
  syncShoppingTools();syncBagIndicators();
}
function openWishlist(){if($('menu-dialog').open)$('menu-dialog').close();renderWishlist();$('wishlist-dialog').showModal();}
function renderComparison(){
  const products=state.products.filter(p=>p.active&&comparison.has(p.id));
  $('compare-items').innerHTML=products.map(p=>{const d=shop.details(p);return `<article class="compare-watch"><img src="${esc(p.image)}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p>${money(p.price)} · ${p.stock>0?'In stock':'Sold out'}</p><dl class="watch-specs">${[['Theme',d.theme],['Dial',d.colour],['Strap',d.strap],['Size',d.size],['Movement',d.movement],['Water',d.water]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><button class="outline-button" data-details="${p.id}" type="button">View watch</button><button class="text-button" data-uncompare="${p.id}" type="button">Remove from comparison</button></article>`;}).join('')||'<p>Select watches in the collection to compare.</p>';
}
function setGallery(view){
  const product=state.products.find(p=>p.id===detailProductId);if(product)$('detail-img').src=product.image;
  for(const button of document.querySelectorAll('[data-photo]'))button.setAttribute('aria-pressed','false');
  $('detail-zoom').classList.toggle('dial-view',view==='dial');
  $('detail-zoom').classList.remove('is-zoomed');$('detail-zoom').setAttribute('aria-pressed','false');
  for(const button of document.querySelectorAll('[data-gallery]'))button.setAttribute('aria-pressed',String(button.dataset.gallery===view));
}
$('detail-zoom').addEventListener('click',()=>{const button=$('detail-zoom');const zoomed=button.classList.toggle('is-zoomed');button.setAttribute('aria-pressed',String(zoomed));button.setAttribute('aria-label',zoomed?'Reset image zoom':'Zoom watch image');});
$('wishlist-open').addEventListener('click',openWishlist);$('menu-wishlist').addEventListener('click',openWishlist);
$('compare-open').addEventListener('click',()=>{renderComparison();$('compare-dialog').showModal();});
$('filter-toggle').addEventListener('click',()=>{const button=$('filter-toggle');const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));$('sort-filter-dropdown').hidden=!expanded;});
$('collection-filters').addEventListener('input',render);
$('collection-filters').addEventListener('change',render);
$('collection-filters').addEventListener('submit',e=>e.preventDefault());
$('collection-filters').addEventListener('reset',()=>setTimeout(render,0));
$('discount-form').addEventListener('submit',e=>{
  e.preventDefault();try{discountCode=store.quote([], $('discount-code').value).discountCode;writePreference(couponKey,discountCode);renderDiscount();if(!discountCode)$('discount-status').textContent='Enter WELCOME10 (10%) or MERLOCK15 (15%).';}
  catch(error){$('discount-status').textContent=error.message;}
});
$('discount-remove').addEventListener('click',()=>{discountCode='';writePreference(couponKey,'');renderDiscount();$('discount-status').textContent='Code removed. Try WELCOME10 (10%) or MERLOCK15 (15%).';});
document.addEventListener('change',event=>{
  const input=event.target;if(!input.dataset.compare)return;
  if(input.checked){if(comparison.size>=3){input.checked=false;toast('Compare up to three watches at a time');return;}comparison.add(input.dataset.compare);}
  else comparison.delete(input.dataset.compare);
  syncShoppingTools();
});
function openTracking(order){
  for(const modal of ['menu-dialog','confirmation-dialog'])if($(modal).open)$(modal).close();
  const last=order||readPreference('merlock-last-order-v1',null);
  if(last&&typeof last.id==='string'&&typeof last.email==='string'){$('tracking-form').elements.orderId.value=last.id;$('tracking-form').elements.email.value=last.email;trackedOrderId=last.id;trackedEmail=last.email;renderTracking();}
  else {$('tracking-result').innerHTML='';$('tracking-error').textContent='';trackedOrderId=null;}
  $('tracking-dialog').showModal();
}
function renderTracking(){
  const order=store.load().orders.find(o=>o.id.toUpperCase()===String(trackedOrderId).trim().toUpperCase()&&o.email.toLowerCase()===String(trackedEmail).trim().toLowerCase());
  if(!order){$('tracking-result').innerHTML='';$('tracking-error').textContent='No matching demo order. Check the order number and email used in this browser.';return;}
  trackedOrderId=order.id;$('tracking-error').textContent='';
  const stages=['Processing','Shipped','Delivered'],index=stages.indexOf(order.status);
  $('tracking-result').innerHTML=`<div class="tracking-summary"><h3>${esc(order.id)}</h3><p>Placed ${esc(order.date)} · ${money(store.orderTotal(order))}</p>${order.status==='Cancelled'?'<p class="checkout-error">This demo order was cancelled.</p>':`<ol class="tracking-stages">${stages.map((stage,i)=>`<li class="${i<=index?'complete':''}" ${i===index?'aria-current="step"':''}><span aria-hidden="true">${i<index?'✓':i+1}</span>${stage}</li>`).join('')}</ol>`}${order.items.map(i=>`<p>${esc(i.name)} × ${i.quantity}</p>`).join('')}${order.delivery?`<p>${esc(store.deliveryMethods[order.delivery.method].label)} · ${money(order.shippingFee)} · estimated ${esc(store.deliveryMethods[order.delivery.method].estimate)}</p>`:''}${order.discountAmount?`<p class="preview-note">${esc(order.discountCode)} saved ${money(order.discountAmount)}.</p>`:''}${index>=0&&index<2?'<button class="outline-button" id="advance-tracking" type="button">Advance demo status</button>':''}<p class="preview-note">This illustrates order tracking; no carrier or shipment is connected.</p></div>`;
}
$('tracking-form').addEventListener('submit',event=>{event.preventDefault();trackedOrderId=event.currentTarget.elements.orderId.value;trackedEmail=event.currentTarget.elements.email.value;renderTracking();});
$('sample-tracking').addEventListener('click',()=>{const sample=store.load().orders.find(o=>o.id==='DEMO-1003');if(!sample){$('tracking-error').textContent='The sample order is unavailable. Use an existing demo order or reset the demo in admin.';return;}$('tracking-form').elements.orderId.value=sample.id;$('tracking-form').elements.email.value=sample.email;trackedOrderId=sample.id;trackedEmail=sample.email;renderTracking();});
$('confirmation-track').addEventListener('click',()=>openTracking(readPreference('merlock-last-order-v1',null)));
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.wish){const id=button.dataset.wish;if(wishlist.has(id))wishlist.delete(id);else wishlist.add(id);const saved=writePreference(wishKey,[...wishlist]);syncShoppingTools();renderWishlist();toast(saved?'Saved watches updated':'Saved for this visit; browser storage is unavailable');}
  if(button.dataset.closeShop)$(button.dataset.closeShop).close();
  if(button.dataset.gallery)setGallery(button.dataset.gallery);
  if(button.hasAttribute('data-photo')){
    const product=state.products.find(p=>p.id===detailProductId);const url=product?.galleryImages?.[Number(button.dataset.photo)];
    if(url){setGallery('full');$('detail-img').src=url;for(const main of document.querySelectorAll('[data-gallery]'))main.setAttribute('aria-pressed','false');button.setAttribute('aria-pressed','true');}
  }
  if(button.dataset.uncompare){comparison.delete(button.dataset.uncompare);syncShoppingTools();renderComparison();}
  if(button.id==='empty-reset')$('collection-filters').reset();
  if(button.hasAttribute('data-open-tracking'))openTracking();
  if(button.id==='advance-tracking'){
    const next=store.load();const order=next.orders.find(o=>o.id===trackedOrderId&&o.email.toLowerCase()===String(trackedEmail).trim().toLowerCase());
    if(!order)return;const stages=['Processing','Shipped','Delivered'];const index=stages.indexOf(order.status);
    if(index<0||index===2)return;order.status=stages[index+1];
    try{store.save(next);renderTracking();}catch(error){$('tracking-error').textContent=error.message;}
  }
});
window.addEventListener('meridian-demo-reset',()=>{bag.clear();wishlist.clear();comparison.clear();discountCode='';trackedOrderId=null;trackedEmail=null;for(const modal of document.querySelectorAll('dialog'))modal.close();renderedCollection=undefined;savedSignature=undefined;render();});
render();
