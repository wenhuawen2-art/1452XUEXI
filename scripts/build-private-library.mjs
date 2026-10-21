// Builds a personal, offline copy of the user's supplied books OUTSIDE the public repository.
// Never import this output from the public site or commit it to GitHub.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {books} from '../content/books.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(root,'..','.codex-reading','library');
const target=path.resolve(root,'..','.codex-reading','reader');
const sourceOrder=['buffett','elder','marks','fisher','kahneman','tang','graham','duan'];
fs.mkdirSync(target,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const manifest=[];
for(let i=0;i<sourceOrder.length;i++){
 const b=books.find(x=>x.id===sourceOrder[i]);
 const input=path.join(source,`book-${i+1}.txt`);
 if(!fs.existsSync(input))throw Error(`缺少私有原文：${input}`);
 const raw=fs.readFileSync(input,'utf8').replace(/\r\n/g,'\n');
 const lines=raw.split('\n');
 const chunks=[];let group=[];let start=1;
 for(let j=0;j<lines.length;j++){
  group.push(lines[j]);
  if(group.join('\n').length>=8500||j===lines.length-1){chunks.push({start,end:j+1,text:group.join('\n')});group=[];start=j+2}
 }
 let headings=lines.flatMap((line,j)=>{
  const s=line.trim();
  if(s.length<3||s.length>55)return [];
  if(/^(?:第[一二三四五六七八九十百0-9]+[章节讲部篇]|附录|序言|前言|导论|后记|19\d\d年|20\d\d年|巴菲特致(?:合伙人|股东)的信\s*\d{4}$)/.test(s))return [{line:j+1,title:s}];
  return [];
 });
 if(b.id==='marks'){
  const toc=lines.slice(0,70).map(x=>x.trim()).filter(x=>/^(?:0[1-9]|1[0-8])\s+/.test(x));
  headings.push(...toc.map(title=>({title,line:lines.findIndex((x,j)=>j>70&&x.trim()===title.replace(/^\d{2}\s+/,''))+1})).filter(x=>x.line>70));
 }
 headings=headings.sort((a,b)=>a.line-b.line).slice(0,550);
 fs.writeFileSync(path.join(target,`${b.id}.json`),JSON.stringify({id:b.id,title:b.title,author:b.author,sourceFile:path.basename(input),lines:lines.length,headings,chunks}));
 manifest.push({id:b.id,title:b.title,author:b.author,lines:lines.length,characters:raw.length,headings:headings.length});
}
fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify(manifest));
fs.writeFileSync(path.join(target,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>我的私有原文书库</title><style>body{margin:0;background:#f2eee4;color:#172f31;font:16px/1.8 system-ui,sans-serif}header{position:sticky;top:0;background:#17373a;color:#fff;padding:12px 16px;z-index:2;display:flex;gap:8px;flex-wrap:wrap}button,input,select{font:inherit;padding:7px 10px;border-radius:8px;border:1px solid #acb9b4}button{cursor:pointer}main{max-width:1000px;margin:auto;padding:18px}aside{color:#5b6863}#results{display:grid;gap:6px;margin:12px 0}.hit{display:block;text-align:left;background:#fff;border:1px solid #d9dfd8;padding:10px 14px}.hit small{display:block;color:#65716c}#original{white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;padding:20px;border-radius:12px;max-height:70vh;overflow:auto}#toc{max-height:220px;overflow:auto;background:#fff;padding:10px;border-radius:12px}#toc button{display:block;width:100%;text-align:left;border:0;background:transparent}mark{background:#ffe49d}</style><header><select id="book"></select><input id="query" placeholder="搜索当前书原文" aria-label="搜索当前书原文"><button id="go">搜索</button></header><main><h1>我的私有原文书库</h1><aside>仅在本机保存，不上传公开仓库。搜索是对提取文字的检索；PDF／OCR 可能有错漏，请回看原文件核对。</aside><h2 id="name"></h2><details><summary>目录与定位</summary><div id="toc"></div></details><div id="results"></div><h2>原文 <small id="where"></small></h2><div id="original"></div></main><script type="module">const manifest=await fetch('./manifest.json').then(r=>r.json());const book=document.querySelector('#book'),query=document.querySelector('#query'),results=document.querySelector('#results'),original=document.querySelector('#original'),where=document.querySelector('#where'),toc=document.querySelector('#toc');book.innerHTML=manifest.map(x=>'<option value="'+x.id+'">'+x.title+'</option>').join('');let data;function show(i,line){const c=data.chunks[i];original.textContent=c.text;where.textContent='提取文本第 '+c.start+'—'+c.end+' 行'+(line?' · 目标第 '+line+' 行':'');original.scrollTop=0;if(line){const ratio=Math.max(0,Math.min(1,(line-c.start)/(c.end-c.start)));requestAnimationFrame(()=>original.scrollTop=ratio*original.scrollHeight)}}async function load(){data=await fetch('./'+book.value+'.json').then(r=>r.json());document.querySelector('#name').textContent=data.title;toc.innerHTML='';for(const h of data.headings){const b=document.createElement('button');b.textContent=h.title+' · '+h.line+'行';b.onclick=()=>show(data.chunks.findIndex(c=>h.line<=c.end),h.line);toc.append(b)}results.textContent='';show(0)}function search(){const q=query.value.trim();results.textContent='';if(!q)return;let count=0;for(let i=0;i<data.chunks.length;i++){let pos=-1;while((pos=data.chunks[i].text.indexOf(q,pos+1))>=0){const c=data.chunks[i],line=c.start+c.text.slice(0,pos).split('\n').length-1;const b=document.createElement('button');b.className='hit';b.textContent='第 '+line+' 行 · '+c.text.slice(Math.max(0,pos-35),Math.min(c.text.length,pos+q.length+65)).replaceAll('\n',' ');b.onclick=()=>show(i,line);results.append(b);if(++count>=60)break}if(count>=60)break}if(!count)results.textContent='没有找到；可换词或查看目录。';else if(count===60)results.append('只显示前60处，请缩小关键词。')}book.onchange=load;document.querySelector('#go').onclick=search;query.onkeydown=e=>{if(e.key==='Enter')search()};await load();</script></html>`);
// Template literal escape sequences must remain valid JS string literals in generated HTML.
const generatedIndex=path.join(target,'index.html');
fs.writeFileSync(generatedIndex,fs.readFileSync(generatedIndex,'utf8')
 .replaceAll("split('\n')","split('\\n')")
 .replaceAll("replaceAll('\n',' ')","replaceAll('\\n',' ')"));
// A single-file edition opens directly on desktop or phone without a local server.
const all=Object.fromEntries(sourceOrder.map(id=>[id,JSON.parse(fs.readFileSync(path.join(target,`${id}.json`),'utf8'))]));
const embedded=JSON.stringify(all).replaceAll('<','\\u003c');
const standalone=fs.readFileSync(path.join(target,'index.html'),'utf8')
 .replace("const manifest=await fetch('./manifest.json').then(r=>r.json());",`const booksData=${embedded};const manifest=${JSON.stringify(manifest)};`)
 .replace("data=await fetch('./'+book.value+'.json').then(r=>r.json())","data=booksData[book.value]");
fs.writeFileSync(path.join(target,'我的八本书原文书库-离线版.html'),standalone);
console.log(JSON.stringify({target,books:manifest.length,characters:manifest.reduce((n,x)=>n+x.characters,0)}));
