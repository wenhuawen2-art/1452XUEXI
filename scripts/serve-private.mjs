// Local-only preview of private originals. Never bind to a public interface.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','.codex-reading','reader');
http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';
 const target=path.resolve(root,name);
 if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(target,(err,buf)=>{if(err){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':name.endsWith('.json')?'application/json; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});res.end(buf)});
}).listen(4199,'127.0.0.1',()=>console.log('Private reader: http://127.0.0.1:4199/'));
