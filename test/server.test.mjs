import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDemoServer} from '../server.mjs';

let server,base;
const film=readFileSync(new URL('../assets/watches/landing-page-video.mp4',import.meta.url));
before(async()=>{
  server=createDemoServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{if(server?.listening)await new Promise(resolve=>server.close(resolve));});

test('landing assets are served with browser-compatible content types',async()=>{
  for(const [path,type] of [['/','text/html'],['/landing.js','text/javascript'],['/shop.js','text/javascript'],['/analytics.js','text/javascript'],['/storefront.css','text/css'],['/assets/watches/landing-page-poster.webp','image/webp']]){
    const response=await fetch(base+path);
    assert.equal(response.status,200);
    assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.arrayBuffer()).byteLength>0);
  }
});
test('video supports complete downloads and HEAD metadata',async()=>{
  const head=await fetch(base+'/assets/watches/landing-page-video.mp4',{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');
  assert.equal(Number(head.headers.get('content-length')),film.length);
  assert.equal(head.headers.get('accept-ranges'),'bytes');assert.equal(await head.text(),'');
  const response=await fetch(base+'/assets/watches/landing-page-video.mp4');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),film);
});
test('video serves byte ranges for browser seeking and mobile playback',async()=>{
  for(const [range,start,end] of [['bytes=0-1023',0,1023],['bytes=2048-',2048,film.length-1],['bytes=-128',film.length-128,film.length-1],['bytes=0-999999999',0,film.length-1]]){
    const response=await fetch(base+'/assets/watches/landing-page-video.mp4',{headers:{Range:range}});
    assert.equal(response.status,206);
    assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${film.length}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),film.subarray(start,end+1));
  }
});
test('the WebM alternative streams with its own MIME type and byte ranges',async()=>{
  const webm=readFileSync(new URL('../assets/watches/landing-page-video.webm',import.meta.url));
  const response=await fetch(base+'/assets/watches/landing-page-video.webm',{headers:{Range:'bytes=0-255'}});
  assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'video/webm');
  assert.equal(response.headers.get('content-range'),`bytes 0-255/${webm.length}`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),webm.subarray(0,256));
});
test('malformed ranges and non-public paths are rejected without crashing the server',async()=>{
  for(const range of ['bytes=10-1',`bytes=${film.length}-`,'bytes=-0','bytes=-','bytes=0-2,4-6','bytes=999999999999999999999999-']){
    const response=await fetch(base+'/assets/watches/landing-page-video.mp4',{headers:{Range:range}});
    assert.equal(response.status,416);assert.equal(response.headers.get('content-range'),`bytes */${film.length}`);
    await response.arrayBuffer();
  }
  for(const path of ['/missing','/constructor','/toString','/package.json'])assert.equal((await fetch(base+path)).status,404);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/')).status,200);
});

test('five individual product images are available to storefront and admin',async()=>{
  for(const name of ['emerald-gold','blue-steel','obsidian-black','silver-blue','two-tone-gmt']){
    const response=await fetch(base+`/assets/watches/${name}.webp`);
    assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/webp');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),readFileSync(new URL(`../assets/watches/${name}.webp`,import.meta.url)));
  }
});


test('removed skeleton product image is no longer served',async()=>{
  assert.equal((await fetch(base+'/assets/watches/champagne-skeleton.webp')).status,404);
});

test('background piano supports audio metadata and byte-range downloads',async()=>{
  const path='/assets/music/chopin-prelude-a-major.mp3';
  const audio=readFileSync(new URL('../assets/music/chopin-prelude-a-major.mp3',import.meta.url));
  const head=await fetch(base+path,{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'audio/mpeg');
  assert.equal(Number(head.headers.get('content-length')),audio.length);
  const response=await fetch(base+path,{headers:{Range:'bytes=0-1023'}});
  assert.equal(response.status,206);assert.deepEqual(Buffer.from(await response.arrayBuffer()),audio.subarray(0,1024));
  assert.equal((await fetch(base+'/music.js')).status,200);
});

test('dress and sport product photos serve the exact bundled images',async()=>{
  for(const name of ['gold-rectangle','navy-moonphase','green-chronograph','pearl-two-tone','black-skeleton']){
    const response=await fetch(base+`/assets/watches/${name}.webp`);
    assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/webp');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),readFileSync(new URL(`../assets/watches/${name}.webp`,import.meta.url)));
  }
});
