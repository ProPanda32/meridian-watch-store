const store=window.MeridianStore,esc=store.escape,money=store.money,$=id=>document.getElementById(id);
let state=store.load();const bag=new Map();let toastTimer,detailProductId;
const collectionGroups={
  celestial:['noir','silver','navy-moonphase'],
  dress:['gold-rectangle','pearl-two-tone','silver-blue'],
  sport:['blue-steel','green-chronograph','two-tone-gmt'],
  statement:['emerald-gold','obsidian-black','black-skeleton']
};
let selectedCollection='all';
function collectionProducts(group){return state.products.filter(p=>p.active&&(group==='all'||collectionGroups[group].includes(p.id)));}
let collectionAnimation,collectionTransition=0;
const collectionMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
async function selectCollection(button){
  if(button.dataset.collection===selectedCollection)return;
  selectedCollection=button.dataset.collection;
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
  const visibleProducts=collectionProducts(selectedCollection);
  $('products').setAttribute('aria-labelledby','collection-tab-'+selectedCollection);
  $('collection-status').textContent=`Showing ${visibleProducts.length} ${visibleProducts.length===1?'watch':'watches'}.`;
  const collectionSignature=JSON.stringify([selectedCollection,visibleProducts]);
  if(collectionSignature!==renderedCollection){
  renderedCollection=collectionSignature;
  $('products').innerHTML=visibleProducts.map(p=>`<article><div class="product-image"><img src="${esc(p.image)}" alt="${esc(p.style)} watch" loading="lazy"><span class="badge${p.stock===0?' sold-out-badge':''}">${p.stock===0?'Sold out':esc(p.badge)}</span></div><div class="product-info"><div><h3>${esc(p.name)}</h3><p>${esc(p.style)}</p></div><span class="price">${money(p.price)}</span></div><div class="product-actions"><button data-details="${p.id}">View details</button>${bagStepper(p)}</div></article>`).join('')||'<p>No watches are currently available in this collection.</p>';
  }
  renderBag();
}
function bagStepper(product){
  const quantity=product.stock>0?(bag.get(product.id)||0):0;
  return `<div class="bag-controls" data-bag-controls="${product.id}"><button class="bag-add-button" data-add="${product.id}" ${quantity?'hidden':''} ${product.stock?'':'disabled'}>${product.stock?'Add to bag':'Sold out'}</button><div class="bag-stepper" ${quantity?'':'hidden'} role="group" aria-label="${esc(product.name)} bag quantity"><button data-decrease="${product.id}" aria-label="Remove one ${esc(product.name)} from bag" ${quantity?'':'disabled'}>−</button><span data-bag-quantity="${product.id}" aria-label="${quantity} in bag">${quantity}</span><button data-add="${product.id}" aria-label="Add one ${esc(product.name)} to bag" ${quantity>=product.stock?'disabled':''}>+</button></div></div>`;
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
  $('checkout-button').disabled=!items.length;
  if($('checkout-dialog').open)renderCheckout();
  syncBagIndicators();syncDetailsStock();
}
function addToBag(id){state=store.load();const p=state.products.find(p=>p.id===id);if(!p||!p.active)throw Error('Unknown product');if(p.stock===0){render();toast('This watch is sold out');return {error:'Insufficient stock'};}if((bag.get(id)||0)>=p.stock){toast('No more stock available');return {error:'Insufficient stock'};}bag.set(id,(bag.get(id)||0)+1);renderBag();toast('Added to your bag');return {product:id,quantity:bag.get(id),totalItems:[...bag.values()].reduce((a,b)=>a+b,0)};}
function syncDetailsStock(){
  if(!detailProductId)return;
  const product=state.products.find(p=>p.id===detailProductId&&p.active);
  const controls=$('detail-bag-controls');
  if(!product){controls.textContent='Unavailable';controls.dataset.product='';return;}
  if(controls.dataset.product!==product.id){controls.innerHTML=bagStepper(product);controls.dataset.product=product.id;}
  $('detail-stock-status').textContent=product.stock===0?'Sold out':'';
  syncBagIndicators();
}
function showDetails(id){state=store.load();const p=state.products.find(p=>p.id===id&&p.active);if(!p)return;const img=$('detail-img');img.src=p.image;img.alt=p.style+' watch';$('detail-title').textContent=p.name;$('detail-copy').textContent=p.description+' '+money(p.price);detailProductId=id;syncDetailsStock();$('details-dialog').showModal();}
function openBag(){render();$('bag-dialog').showModal();}
function renderCheckout(){const items=bagItems();$('checkout-summary').innerHTML=items.map(({product:p,quantity:q})=>`<p>${esc(p.name)} × ${q} — ${money(p.price*q)}</p>`).join('')+`<div class="total"><strong>Total</strong><strong>${money(items.reduce((s,i)=>s+i.quantity*i.product.price,0))}</strong></div>`;$('place-order').disabled=!bag.size;}
function startCheckout(){render();if(!bag.size)return;$('bag-dialog').close();$('checkout-error').textContent='';renderCheckout();$('checkout-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.details)showDetails(b.dataset.details);if(b.dataset.add)addToBag(b.dataset.add);if(b.dataset.decrease)removeOneFromBag(b.dataset.decrease);if(b.dataset.remove){bag.delete(b.dataset.remove);renderBag();}if(b.dataset.quantity){state=store.load();const p=state.products.find(p=>p.id===b.dataset.quantity);if(!p)return;const q=(bag.get(p.id)||0)+Number(b.dataset.delta);if(q<=0)bag.delete(p.id);else bag.set(p.id,Math.min(q,p.stock));renderBag();}});
$('checkout-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;$('place-order').disabled=true;try{const order=store.createOrder({customer:f.elements.customer.value,email:f.elements.email.value,paymentStatus:'Demo — no payment',source:'Storefront',items:[...bag].map(([productId,quantity])=>({productId,quantity}))});bag.clear();render();$('checkout-dialog').close();$('confirmation-text').textContent=order.id+' · '+money(store.orderTotal(order))+' — saved to the admin Orders page.';$('confirmation-dialog').showModal();}catch(err){$('checkout-error').textContent=err.message;$('place-order').disabled=!bag.size;}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
window.addEventListener('pageshow',render);
window.addEventListener('storage',e=>{if(e.key===store.key)render();});window.addEventListener('focus',render);window.addEventListener('meridian-store-change',render);
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'add_watch_to_bag',description:'Add one demo watch to the visible bag. Does not place an order.',inputSchema:{type:'object',properties:{productId:{type:'string'}},required:['productId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.productId!=='string'||Object.keys(input).some(k=>k!=='productId'))throw Error('A valid productId is required');return addToBag(input.productId);}})).catch(()=>{});}catch{}}
render();
