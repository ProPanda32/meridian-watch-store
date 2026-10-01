import http from 'node:http';
import {readFileSync,statSync,createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const files={'/':'index.html','/index.html':'index.html','/admin.html':'admin.html','/admin':'admin.html','/store.js':'store.js','/storefront.js':'storefront.js','/storefront.css':'storefront.css','/landing.js':'landing.js','/music.js':'music.js','/assets/music/chopin-prelude-a-major.mp3':'assets/music/chopin-prelude-a-major.mp3','/admin.js':'admin.js','/admin.css':'admin.css','/assets/watches/landing-page-video.mp4':'assets/watches/landing-page-video.mp4'};
for (const name of ['champagne-moonphase','midnight-moonphase','landing-page-poster','emerald-gold','blue-steel','obsidian-black','silver-blue','two-tone-gmt']) files['/assets/watches/'+name+'.webp']='assets/watches/'+name+'.webp';
files['/assets/watches/landing-page-video.webm']='assets/watches/landing-page-video.webm';
files['/assets/fonts/bodoni-moda.ttf']='assets/fonts/bodoni-moda.ttf';
const port=Number(process.env.PORT||3000);
export function createDemoServer(){return http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=Object.hasOwn(files,pathname)?files[pathname]:undefined;
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!file){res.writeHead(404);res.end('Not found');return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  if(file.endsWith('.mp4')||file.endsWith('.webm')||file.endsWith('.mp3')) {
    const path=join(root,file),size=statSync(path).size;
    const headers={'Content-Type':file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.webm')?'video/webm':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start=0,end=size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(match&&(match[1]||match[2])){
        start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
        end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
      }
      if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){
        res.writeHead(416,{...headers,'Content-Range':`bytes */${size}`});res.end();return;
      }
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    }
    res.writeHead(status,{...headers,'Content-Length':end-start+1});
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(path,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);return;
  }
  if(file.endsWith('.webp')) {res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:readFileSync(join(root,file)));return;}
  if(file.endsWith('.ttf')) {res.writeHead(200,{'Content-Type':'font/ttf','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:readFileSync(join(root,file)));return;}
  const type=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:readFileSync(join(root,file)));
});}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))createDemoServer().listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Merlock demo ready at http://localhost:'+port));
