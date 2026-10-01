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
  for(const [path,type] of [['/','text/html'],['/landing.js','text/javascript'],['/storefront.css','text/css'],['/assets/watches/landing-page-poster.webp','image/webp']]){
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
