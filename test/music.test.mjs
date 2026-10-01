import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../music.js',import.meta.url),'utf8');
function player({blocked=false}={}){
  const elements=new Map();
  function element(id){const events=new Map(),attributes={},classes=new Set();return {classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value)},contains:()=>false,focus(){},hidden:true,value:'20',paused:true,textContent:'',attributes,
    addEventListener(name,fn){events.set(name,fn);},emit(name){events.get(name)?.();},
    setAttribute(name,value){attributes[name]=value;},querySelector(){return element('use');}};}
  for(const id of ['background-music','music-controls','music-toggle','music-label','music-volume','music-status'])elements.set(id,element(id));
  const music=elements.get('background-music');let calls=0,reject=blocked;
  music.play=()=>{calls++;if(reject)return Promise.reject(Object.assign(Error('Blocked'),{name:'NotAllowedError'}));music.paused=false;music.emit('play');return Promise.resolve();};
  music.pause=()=>{music.paused=true;music.emit('pause');};
  const events=new Map(),document={hidden:false,body:{classList:{add(){}}},getElementById:id=>elements.get(id),addEventListener:(name,fn)=>events.set(name,fn)};
  const timers=new Map();let timerId=0,now=0;
  function advance(milliseconds){
    const end=now+milliseconds;
    while(true){
      const next=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;
      const [id,timer]=next;timers.delete(id);now=timer.at;timer.fn();
    }
    now=end;
  }
  const windowEvents=new Map();
  vm.runInNewContext(source,{document,window:{addEventListener:(name,fn)=>windowEvents.set(name,fn)},Date:{now:()=>now},setTimeout:(fn,delay=0)=>{timers.set(++timerId,{fn,at:now+delay});return timerId;},clearTimeout:id=>timers.delete(id)});
  return {elements,music,document,scroll:()=>windowEvents.get('scroll')(),advance,expire:()=>advance(3000),release:()=>events.get('pointerup')(),click:()=>elements.get('music-toggle').emit('click'),visibility:hidden=>{document.hidden=hidden;events.get('visibilitychange')();},calls:()=>calls,reject:()=>{reject=true;},allow:()=>{reject=false;},interact:()=>events.get('pointerdown')({type:'pointerdown',target:{closest:()=>false}})};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('music attempts playback by default at low volume and the icon can stop it',async()=>{
  const p=player();await flush();assert.equal(p.calls(),1);assert.equal(p.music.paused,false);assert.equal(p.music.volume,0);p.advance(800);assert.equal(p.music.volume,.2);
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'true');
  p.elements.get('music-volume').value='10';p.elements.get('music-volume').emit('input');assert.equal(p.music.volume,.1);
  p.click();assert.equal(p.music.paused,false);p.advance(800);assert.equal(p.music.paused,true);assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');
  p.interact();assert.equal(p.calls(),1);
});
test('hidden tabs pause and resume enabled music but respect a manual pause',async()=>{
  const p=player();await flush();p.visibility(true);assert.equal(p.music.paused,true);
  p.visibility(false);await flush();assert.equal(p.music.paused,false);
  p.click();p.visibility(true);p.visibility(false);assert.equal(p.music.paused,true);assert.equal(p.calls(),2);
});
test('blocked autoplay shows the actual off state and retries on visitor interaction',async()=>{
  const p=player({blocked:true});await flush();
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');assert.equal(p.music.paused,true);
  assert.match(p.elements.get('music-status').textContent,/ready/);
  p.allow();p.interact();await flush();assert.equal(p.music.paused,false);
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'true');
});
test('the music icon starts blocked autoplay and playback errors reset its state',async()=>{
  const p=player({blocked:true});await flush();p.allow();p.click();await flush();assert.equal(p.music.paused,false);
  p.music.emit('error');assert.equal(p.music.paused,true);
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');assert.match(p.elements.get('music-status').textContent,/unavailable/);
});


test('volume panel closes after inactivity, reopens on interaction and stays open during dragging',()=>{
  const p=player(),controls=p.elements.get('music-controls');
  controls.emit('pointerenter');assert.equal(controls.classList.contains('volume-open'),true);
  p.expire();assert.equal(controls.classList.contains('volume-open'),false);
  controls.emit('pointermove');assert.equal(controls.classList.contains('volume-open'),true);
  controls.emit('pointerdown');p.expire();assert.equal(controls.classList.contains('volume-open'),true);
  p.release();p.expire();assert.equal(controls.classList.contains('volume-open'),false);
});


test('scrolling immediately closes the music volume panel',()=>{
  const p=player(),controls=p.elements.get('music-controls');
  controls.emit('pointerenter');assert.equal(controls.classList.contains('volume-open'),true);
  p.scroll();assert.equal(controls.classList.contains('volume-open'),false);
});


test('music fades out before pausing and fades back to the selected volume',async()=>{
  const p=player();await flush();p.advance(800);
  p.click();assert.equal(p.music.paused,false);
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');
  p.advance(400);assert.ok(p.music.volume>0&&p.music.volume<.2);
  p.advance(400);assert.equal(p.music.volume,0);assert.equal(p.music.paused,true);
  p.elements.get('music-volume').value='12';p.elements.get('music-volume').emit('input');
  assert.equal(p.music.volume,0);
  p.click();await flush();assert.equal(p.music.volume,0);
  p.advance(400);assert.ok(p.music.volume>0&&p.music.volume<.12);
  p.advance(400);assert.equal(p.music.volume,.12);assert.equal(p.music.paused,false);
});
test('rapid toggles reverse the fade without a stale pause or volume jump',async()=>{
  const p=player();await flush();p.advance(800);p.click();p.advance(320);
  const midway=p.music.volume;p.click();await flush();assert.equal(p.music.volume,midway);
  p.advance(800);assert.equal(p.music.volume,.2);assert.equal(p.music.paused,false);
  p.click();p.advance(160);p.visibility(true);p.advance(800);
  assert.equal(p.music.paused,true);assert.equal(p.music.volume,0);
  p.visibility(false);assert.equal(p.music.paused,true);
});
