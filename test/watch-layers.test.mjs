import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {createDemoServer} from '../server.mjs';

const source=readFileSync(new URL('../storefront.js',import.meta.url),'utf8');
const renderSource=source.slice(source.indexOf('const watchLayers='),source.indexOf("const bagKey="));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const context={esc:escape,encodeURIComponent};
vm.runInNewContext(renderSource+';globalThis.renderWatch=watchImage;globalThis.layers=watchLayers;',context);

test('all twelve bundled watch images have separate backdrops and one accessible product image',()=>{
  assert.equal(Object.keys(context.layers).length,12);
  for(const name of Object.keys(context.layers)){
    const image=`assets/watches/${name}.webp`;
    const html=context.renderWatch({image,style:'Merlock'});
    assert.ok(html.includes(`src="assets/watches/${name}-empty.webp"`));
    assert.ok(html.includes('class="watch-context"'));
    assert.ok(html.includes(`class="watch-photo" src="${image}"`));
    assert.equal((html.match(/aria-hidden="true"/g)||[]).length,2);
    assert.equal((html.match(/alt="Merlock watch"/g)||[]).length,1);
    assert.ok(existsSync(new URL('../'+`assets/watches/${name}-empty.webp`,import.meta.url)));
  }
});
test('custom and changed product photos retain their original image without an unrelated backdrop',()=>{
  for(const image of ['https://example.com/custom.webp','https://example.com/emerald-gold-elegant-bg.webp','assets/watches/another-watch.webp']){
    const html=context.renderWatch({image,style:'Custom'});
    assert.equal((html.match(/<img/g)||[]).length,1);
    assert.ok(!html.includes('watch-backdrop'));
  }
});
test('the scenery mask has original photo proportions and a transparent opening around the watch',()=>{
  for(const [name,[width,height,points]] of Object.entries(context.layers)){
    const html=context.renderWatch({image:`assets/watches/${name}.webp`,style:'Watch'});
    const svg=decodeURIComponent(html.match(/data:image\/svg\+xml,([^']+)/)[1]);
    assert.ok(svg.includes(`viewBox="0 0 ${width} ${height}"`));
    assert.ok(svg.includes('fill-rule="evenodd"'));
    for(const pair of points.split(' ')){
      const [x,y]=pair.split(',').map(Number);
      assert.ok(x>=0&&x<=width&&y>=0&&y<=height);
    }
  }
});
test('empty backdrops are served as WebP images by the storefront server',async()=>{
  const server=createDemoServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    for(const name of Object.keys(context.layers)){
      const response=await fetch(`http://127.0.0.1:${server.address().port}/assets/watches/${name}-empty.webp`);
      assert.equal(response.status,200);
      assert.equal(response.headers.get('content-type'),'image/webp');
      assert.ok((await response.arrayBuffer()).byteLength>0);
    }
  }finally{await new Promise(resolve=>server.close(resolve));}
});
