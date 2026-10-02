const store=window.MeridianStore, esc=store.escape, money=store.money;
let state=store.load();
const $=id=>document.getElementById(id);
function notify(text,error=false){$('notice').textContent=text;$('notice').style.borderColor=error?'#a02222':'#46652e';}
function commit(next){store.save(next);state=next;render();notify('Demo changes saved in this browser.');}
function orderTable(orders){return orders.length?`<table role="table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead><tbody>${orders.map(o=>`<tr role="row"><td role="cell" data-label="Order">${esc(o.id)}</td><td role="cell" data-label="Customer">${esc(o.customer)}</td><td role="cell" data-label="Date">${esc(o.date)}</td><td role="cell" data-label="Total">${money(store.orderTotal(o))}</td><td role="cell" data-label="Status"><span class="status">${esc(o.status)}</span></td><td role="cell" data-label="Details"><button data-order="${esc(o.id)}">View order</button></td></tr>`).join('')}</tbody></table>`:'<p>No orders match your search.</p>';}
function stockTag(product){return product.stock===0?'<span class="stock-tag stock-empty">Out of stock</span>':product.stock<=5?'<span class="stock-tag stock-low">Low stock</span>':'';}
function renderOrders(){const q=$('order-search').value.trim().toLowerCase(),status=$('order-filter').value;$('order-list').innerHTML=orderTable(state.orders.filter(o=>(!status||o.status===status)&&`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)));}
function render(){document.querySelector('.brand').textContent=state.settings.name.toUpperCase();document.title=`Store management | ${state.settings.name}`;
  const nonCancelled=state.orders.filter(o=>o.status!=='Cancelled');
  const metrics=[['Demo order value',money(nonCancelled.reduce((n,o)=>n+store.orderTotal(o),0))],['Demo orders',state.orders.length],['Awaiting dispatch',state.orders.filter(o=>o.status==='Processing').length],['Visible products',state.products.filter(p=>p.active).length]];
  $('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');
  $('recent-orders').innerHTML=orderTable(state.orders.slice(0,5));renderOrders();
  const low=state.products.filter(p=>p.stock<=5);$('low-stock').innerHTML=low.length?low.map(p=>`<div class="stock-row"><button class="stock-link" data-stock-product="${esc(p.id)}" aria-label="Update stock for ${esc(p.name)}">${esc(p.name)}</button><span>${stockTag(p)} ${p.stock} remaining</span></div>`).join(''):'<p>All products have more than five units in stock.</p>';
  $('product-list').innerHTML=state.products.map(p=>`<article class="product"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div><h2>${esc(p.name)}</h2><p>${money(p.price)} · ${p.stock} in stock · ${p.active?'Visible':'Hidden'}</p>${stockTag(p)}</div><button data-product="${esc(p.id)}">Edit product</button></article>`).join('');
  renderAnalysis();
  const f=$('settings-form');f.elements.name.value=state.settings.name;f.elements.announcement.value=state.settings.announcement;f.elements.musicChoice.value=state.settings.musicUrl?'custom':'default';f.elements.musicUrl.value=state.settings.musicUrl||'';syncMusicSettings();
}
function monthLabel(key){return new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(key+'-01T00:00:00Z'));}
function renderBestSellers(){
  const month=$('analysis-month').value;
  const results=window.MerlockAnalytics.analyse(state.orders.filter(o=>!month||o.date.startsWith(month))).products;
  const max=results[0]?.units||1;
  $('best-sellers').innerHTML=results.length?results.map((p,i)=>`<div class="seller-row"><div><strong>${i+1}. ${esc(p.name)}</strong><span class="muted">${p.units} units · ${money(p.revenue)}</span></div><div class="sales-track" aria-hidden="true"><span style="width:${p.units/max*100}%"></span></div></div>`).join(''):'<p>No sales recorded for this month.</p>';
}
function renderAnalysis(){
  const stats=window.MerlockAnalytics.analyse(state.orders);
  $('analysis-metrics').innerHTML=[['Recorded order value',money(stats.revenue)],['Orders',stats.orders],['Watches sold',stats.units],['Average order value',money(stats.average)]].map(([label,value])=>`<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');
  const max=Math.max(1,...stats.months.map(m=>m.revenue));
  $('monthly-chart').innerHTML=stats.months.length?stats.months.map(m=>`<div class="month-bar"><span>${monthLabel(m.key)}</span><div class="sales-track" aria-hidden="true"><span style="width:${m.revenue/max*100}%"></span></div><strong>${money(m.revenue)}</strong></div>`).join(''):'<p>No sales recorded yet.</p>';
  $('monthly-comparison').innerHTML=stats.months.length?`<table role="table"><thead><tr><th>Month</th><th>Order value</th><th>Orders</th><th>Units</th><th>Monthly difference</th></tr></thead><tbody>${stats.months.map(m=>`<tr role="row"><td role="cell" data-label="Month">${monthLabel(m.key)}</td><td role="cell" data-label="Value">${money(m.revenue)}</td><td role="cell" data-label="Orders">${m.orders}</td><td role="cell" data-label="Units">${m.units}</td><td role="cell" data-label="Change">${m.difference===null?'—':`${m.difference>0?'+':''}${money(m.difference)}${m.change===null?'':` (${m.change>0?'+':''}${m.change.toFixed(1)}%)`}`}</td></tr>`).join('')}</tbody></table>`:'';
  const selected=$('analysis-month').value;
  $('analysis-month').innerHTML='<option value="">All months</option>'+stats.months.map(m=>`<option value="${m.key}">${monthLabel(m.key)}</option>`).join('');
  if(stats.months.some(m=>m.key===selected))$('analysis-month').value=selected;
  renderBestSellers();
}
$('analysis-month').addEventListener('change',renderBestSellers);
function editProduct(id){const p=id?state.products.find(p=>p.id===id):{id:'',name:'',style:'',price:0,stock:0,image:'',description:'',badge:'',active:true};if(!p)return;const f=$('product-form');for(const k of ['id','name','style','price','stock','image','description','badge'])f.elements[k].value=p[k];f.elements.active.checked=p.active;$('product-dialog-title').textContent=id?'Edit product':'Add product';$('product-error').textContent='';$('remove-product').hidden=!id;$('product-dialog').showModal();}
function viewOrder(id){const o=state.orders.find(o=>o.id===id);if(!o)return;const f=$('order-form');f.elements.id.value=id;f.elements.status.value=o.status;f.elements.paymentStatus.value=o.paymentStatus||'Unpaid';f.elements.notes.value=o.notes;$('order-dialog-title').textContent=o.id;$('order-error').textContent='';$('order-details').innerHTML=`<p>${esc(o.customer)}<br>${esc(o.email)}<br>${esc(o.date)}<br>Payment: ${esc(o.paymentStatus||'Sample')}<br>Source: ${esc(o.source||'Sample')}</p>${o.items.map(i=>`<p>${esc(i.name)} × ${i.quantity} — ${money(i.unitPrice*i.quantity)}</p>`).join('')}<p><strong>Total: ${money(store.orderTotal(o))}</strong></p><p class="muted">Original order prices stay unchanged when you edit product prices.</p>`;$('order-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.view){for(const s of document.querySelectorAll('main>section'))s.hidden=s.id!==b.dataset.view;for(const n of document.querySelectorAll('nav button'))n.removeAttribute('aria-current');b.setAttribute('aria-current','page');$('notice').textContent='';}if(b.dataset.stockProduct){document.querySelector('[data-view=products]').click();editProduct(b.dataset.stockProduct);$('product-form').elements.stock.focus();}if(b.dataset.product)editProduct(b.dataset.product);if(b.dataset.order)viewOrder(b.dataset.order);if(b.dataset.close)$(b.dataset.close).close();});
$('new-product').addEventListener('click',()=>editProduct());$('order-search').addEventListener('input',renderOrders);$('order-filter').addEventListener('change',renderOrders);
$('remove-product').addEventListener('click',()=>{
  const id=$('product-form').elements.id.value;
  const next=store.load();const product=next.products.find(p=>p.id===id);
  if(!product)return;
  if(!window.confirm(`Remove ${product.name} from the catalogue? Existing orders will be kept.`))return;
  next.products=next.products.filter(p=>p.id!==id);
  try{commit(next);$('product-dialog').close();notify('Product removed. Existing orders were kept.');}
  catch(error){$('product-error').textContent=error.message;}
});
$('product-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;const next=store.load();const id=f.elements.id.value||`watch-${crypto.randomUUID()}`;const p={id,name:f.elements.name.value.trim(),style:f.elements.style.value.trim(),price:Number(f.elements.price.value),stock:Number(f.elements.stock.value),image:f.elements.image.value.trim(),description:f.elements.description.value.trim(),badge:f.elements.badge.value.trim(),active:f.elements.active.checked};const index=next.products.findIndex(p=>p.id===id);if(index<0)next.products.push(p);else next.products[index]=p;try{await commit(next);$('product-dialog').close();}catch(err){$('product-error').textContent=err.message;}});
$('order-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,next=store.load(),o=next.orders.find(o=>o.id===f.elements.id.value);if(!o){$('order-error').textContent='This order no longer exists.';return;}o.status=f.elements.status.value;o.paymentStatus=f.elements.paymentStatus.value;o.notes=f.elements.notes.value;try{await commit(next);$('order-dialog').close();}catch(err){$('order-error').textContent=err.message;}});
function syncMusicSettings(){
  const custom=$('settings-form').elements.musicChoice.value==='custom';
  $('custom-music-field').hidden=!custom;
  $('settings-form').elements.musicUrl.required=custom;
  $('settings-form').elements.musicUrl.disabled=!custom;
  $('music-preview').pause();$('music-preview').hidden=true;
}
$('music-choice').addEventListener('change',syncMusicSettings);
$('settings-form').elements.musicUrl.addEventListener('input',()=>{$('music-preview').pause();$('music-preview').hidden=true;});
$('preview-music').addEventListener('click',()=>{
  const form=$('settings-form');const custom=form.elements.musicChoice.value==='custom';
  if(custom&&!form.elements.musicUrl.reportValidity())return;
  const source=custom?form.elements.musicUrl.value.trim():'assets/music/chopin-prelude-a-major.mp3';
  if(custom&&!source.startsWith('https://')){notify('Use a direct HTTPS audio URL.',true);return;}
  const audio=$('music-preview');audio.src=source;audio.volume=.2;audio.hidden=false;
  audio.play().catch(()=>notify('The audio could not play. Check that the URL points to an accessible audio file.',true));
});
$('music-preview').addEventListener('error',()=>{if(!$('music-preview').hidden)notify('The audio could not load. Check the audio file URL.',true);});
$('settings-form').addEventListener('submit',async e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const next=store.load();next.settings={...next.settings,name:e.currentTarget.elements.name.value.trim(),announcement:e.currentTarget.elements.announcement.value.trim(),musicUrl:e.currentTarget.elements.musicChoice.value==='custom'?e.currentTarget.elements.musicUrl.value.trim():''};try{await commit(next);}catch(err){notify(err.message,true);}});
window.addEventListener('storage',e=>{if(e.key===store.key){state=store.load();render();notify('Updated from another tab in this browser.');}});
render();


$('add-order').addEventListener('click',()=>{state=store.load();const f=$('new-order-form');f.reset();f.elements.productId.innerHTML=state.products.filter(p=>p.active&&p.stock>0).map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)} (${p.stock} in stock)</option>`).join('');$('new-order-mode').textContent='This creates a demo order in this browser and reduces demo stock. Use fictional customer details.';$('new-order-error').textContent='';$('new-order-dialog').showModal();});
$('new-order-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;try{store.createOrder({customer:f.elements.customer.value,email:f.elements.email.value,paymentStatus:f.elements.paymentStatus.value,source:'Admin',items:[{productId:f.elements.productId.value,quantity:Number(f.elements.quantity.value)}]});state=store.load();render();$('new-order-dialog').close();notify('Demo order created. Stock updated.');}catch(err){$('new-order-error').textContent=err.message;}});
window.addEventListener('focus',()=>{state=store.load();render();});
window.addEventListener('meridian-store-change',()=>{state=store.load();render();});

const sessionKey='merlock-demo-owner';
function showDashboard(){let signedIn=false;try{signedIn=sessionStorage.getItem(sessionKey)==='signed-in';}catch{}$('dashboard').hidden=!signedIn;$('login-screen').hidden=signedIn;$('demo-logout').hidden=!signedIn;if(signedIn){state=store.load();render();}}
$('demo-login-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(f.elements.username.value.trim()!=='owner'||f.elements.password.value!=='MerlockDemo123!'){$('login-error').textContent='Incorrect demo username or password.';return;}try{sessionStorage.setItem(sessionKey,'signed-in');f.reset();$('login-error').textContent='';showDashboard();}catch{$('login-error').textContent='Enable session storage in your browser to use the demo login.';}});
$('demo-logout').addEventListener('click',()=>{try{sessionStorage.removeItem(sessionKey);}catch{}for(const d of document.querySelectorAll('dialog'))d.close();showDashboard();});
showDashboard();
