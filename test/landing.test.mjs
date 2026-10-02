import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../landing.js',import.meta.url),'utf8');
function page({reduced=false,observers=true,hash='',columns=3}={}){
  function element(tagName='DIV'){
    const classes=new Set(),events=new Map(),properties={};
    const child={setAttribute(){},textContent:'MERLOCK'};
    return {tagName,nodeType:1,hidden:true,offsetHeight:800,children:[],properties,removed:false,
      classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on){on?classes.add(c):classes.delete(c);}},
      style:{setProperty:(k,v)=>properties[k]=v},
      getBoundingClientRect:()=>({top:0,bottom:900}),
      addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn);},
      emit(name,event={}){for(const fn of events.get(name)||[])fn(event);},
      setAttribute(){},querySelector:()=>child,querySelectorAll:()=>[],remove(){this.removed=true;}
    };
  }
  const ids=new Map(['entry-intro','hero-video','video-toggle','film-status','products','menu-dialog','menu-toggle','search-dialog','watch-search','search-toggle','search-results','search-status'].map(id=>[id,element()]));
  const hero=element(),stage=element(),copy=element(),header=element(),root=element(),text=element();
  hero.offsetHeight=1000;
  const video=ids.get('hero-video');video.paused=true;video.play=()=>{video.paused=false;return Promise.resolve();};video.pause=()=>video.paused=true;
  ids.get('products').children=Array.from({length:6},()=>element('ARTICLE'));
  const document=element();Object.assign(document,{documentElement:root,hidden:false,
    getElementById:id=>ids.get(id),
    querySelector:s=>({'.hero':hero,'.hero-stage':stage,'.hero-copy':copy,'.site-header':header})[s],
    querySelectorAll:s=>s==='.reveal, .reveal-card'?[text,...ids.get('products').children]:s.startsWith('.section-top')?[text]:[]});
  const motion=element();motion.matches=reduced;
  const window=element();Object.assign(window,{scrollY:0,matchMedia:()=>motion,MeridianStore:{}});
  const intersections=[],mutations=[],timers=new Map();let timerId=0;
  class IO{constructor(fn){this.fn=fn;this.targets=new Set();intersections.push(this);}observe(e){this.targets.add(e);}unobserve(e){this.targets.delete(e);}disconnect(){this.targets.clear();}}
  class MO{constructor(fn){this.fn=fn;mutations.push(this);}observe(){}}
  if(observers){window.IntersectionObserver=IO;window.MutationObserver=MO;}
  vm.runInNewContext(source,{document,window,location:{hash},CSS:{supports:()=>false},
    IntersectionObserver:IO,MutationObserver:MO,getComputedStyle:()=>({gridTemplateColumns:Array(columns).fill('300px').join(' ')}),
    requestAnimationFrame:fn=>{fn();return 0;},setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)});
  return {ids,root,text,window,motion,document,intersections,mutations,timers,element};
}
test('opening cover fades independently of video loading and has a timed escape',()=>{
  const p=page(),intro=p.ids.get('entry-intro');
  assert.equal(intro.hidden,false);assert.ok(p.root.classList.contains('entry-playing'));
  for(const fn of [...p.timers.values()])fn();
  assert.ok(intro.removed);assert.ok(!p.root.classList.contains('entry-playing'));
});
test('scrolling immediately dismisses the opening cover and changes navigation colours',()=>{
  const p=page();p.window.scrollY=20;p.window.emit('scroll');
  assert.ok(p.ids.get('entry-intro').removed);assert.ok(!p.root.classList.contains('entry-playing'));
});
test('cards reveal individually once and newly filtered cards are observed',()=>{
  const p=page(),observer=p.intersections[1],panel=p.ids.get('products');
  assert.equal(observer.targets.size,7);
  const [first,second]=panel.children;
  observer.fn([{target:first,isIntersecting:true},{target:second,isIntersecting:false}]);
  assert.ok(first.classList.contains('is-visible'));assert.ok(!second.classList.contains('is-visible'));
  assert.ok(!observer.targets.has(first));assert.equal(second.properties['--reveal-delay'],'80ms');
  const old=panel.children;panel.children=[p.element('ARTICLE')];
  p.mutations[0].fn([{removedNodes:old}]);
  assert.ok(observer.targets.has(panel.children[0]));assert.ok(!observer.targets.has(second));
});
test('mobile cards have no horizontal stagger and keyboard focus exposes a pending card',()=>{
  const p=page({columns:1}),card=p.ids.get('products').children[2];
  assert.equal(card.properties['--reveal-delay'],'0ms');
  p.document.emit('focusin',{target:{closest:()=>card}});
  assert.ok(card.classList.contains('is-visible'));
});
test('reduced motion, anchored links and missing observers keep content available',()=>{
  for(const options of [{reduced:true},{hash:'#collection'},{observers:false}]){
    const p=page(options);
    if(options.reduced||options.hash)assert.ok(p.ids.get('entry-intro').removed);
    if(options.reduced||options.observers===false)for(const card of p.ids.get('products').children)assert.ok(card.classList.contains('is-visible'));
  }
  const p=page();p.motion.matches=true;p.motion.emit('change');
  assert.ok(p.ids.get('entry-intro').removed);
  for(const card of p.ids.get('products').children)assert.ok(card.classList.contains('is-visible'));
});
