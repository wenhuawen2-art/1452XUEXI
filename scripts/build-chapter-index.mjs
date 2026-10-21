// Public-safe chapter metadata only; full copyrighted text stays in private reader.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const privateDir=path.resolve(root,'..','.codex-reading','reader');
const out={};
for(const id of ['buffett','elder','marks','fisher','kahneman','tang','graham','duan']){
 const data=JSON.parse(fs.readFileSync(path.join(privateDir,id+'.json'),'utf8'));
 const headings=data.headings.filter(h=>/^(?:第[一二三四五六七八九十百0-9]+[章节讲部篇]|附录[ A-Z一二三四五六七八九十]?\s*$|(?:0[1-9]|1[0-8])\s+|巴菲特致(?:合伙人|股东)的信\s*\d{4}$)/.test(h.title)&&h.title.length<44&&!/[，。；]/.test(h.title));
 out[id]=headings.map(h=>({title:h.title,line:h.line}));
}
fs.writeFileSync(path.join(root,'content','chapter-index.json'),JSON.stringify(out,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length])));
