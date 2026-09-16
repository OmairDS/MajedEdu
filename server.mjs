import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import api from './api/app.js';
process.env.DEMO_MODE??='true';
const files={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css'],'/brand.png':['brand.png','image/png'],'/favicon.svg':['favicon.svg','image/svg+xml']};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost:3000');if(url.pathname==='/api/app'){const r=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})});const result=await api.fetch(r);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;}const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':file[1]});res.end(await readFile(new URL('./public/'+file[0],import.meta.url)));}catch{res.writeHead(500);res.end('Server error');}}).listen(3000,()=>console.log('Kafaat: http://localhost:3000 — demo data only'));
