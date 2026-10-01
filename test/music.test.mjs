import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../music.js',import.meta.url),'utf8');
function player(){
  const elements=new Map();
  function element(id){const events=new Map(),attributes={};return {hidden:true,value:'20',paused:true,textContent:'',attributes,
    addEventListener(name,fn){events.set(name,fn);},emit(name){events.get(name)?.();},
    setAttribute(name,value){attributes[name]=value;},querySelector(){return element('use');}};}
  for(const id of ['background-music','music-controls','music-toggle','music-label','music-volume','music-status'])elements.set(id,element(id));
  const music=elements.get('background-music');let calls=0,reject=false;
  music.play=()=>{calls++;if(reject)return Promise.reject(Error('Blocked'));music.paused=false;music.emit('play');return Promise.resolve();};
  music.pause=()=>{music.paused=true;music.emit('pause');};
  const events=new Map(),document={hidden:false,body:{classList:{add(){}}},getElementById:id=>elements.get(id),addEventListener:(name,fn)=>events.set(name,fn)};
  vm.runInNewContext(source,{document});
  return {elements,music,document,click:()=>elements.get('music-toggle').emit('click'),visibility:hidden=>{document.hidden=hidden;events.get('visibilitychange')();},calls:()=>calls,reject:()=>{reject=true;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('piano stays silent until requested, controls volume and stops on a second click',async()=>{
  const p=player();assert.equal(p.calls(),0);assert.equal(p.music.paused,true);assert.equal(p.music.volume,.2);
  p.click();await flush();assert.equal(p.music.paused,false);assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'true');
  p.elements.get('music-volume').value='10';p.elements.get('music-volume').emit('input');assert.equal(p.music.volume,.1);
  p.click();assert.equal(p.music.paused,true);assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');
});
test('hidden tabs pause and resume only music the visitor enabled',async()=>{
  const p=player();p.visibility(true);p.visibility(false);assert.equal(p.calls(),0);
  p.click();await flush();p.visibility(true);assert.equal(p.music.paused,true);
  p.visibility(false);await flush();assert.equal(p.music.paused,false);
  p.click();p.visibility(true);p.visibility(false);assert.equal(p.music.paused,true);assert.equal(p.calls(),2);
});
test('blocked playback resets the control and announces the failure',async()=>{
  const p=player();p.reject();p.click();await flush();
  assert.equal(p.elements.get('music-toggle').attributes['aria-pressed'],'false');
  assert.equal(p.music.paused,true);assert.match(p.elements.get('music-status').textContent,/could not start/);
});
