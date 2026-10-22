import fs from 'node:fs';
const index=JSON.parse(fs.readFileSync(new URL('../.local/notion-library.json',import.meta.url),'utf8'));
const links=Object.fromEntries(Object.entries(index.books).map(([id,b])=>[id,{url:b.url,title:b.title,parts:b.parts.map(p=>({start:p.start,end:p.end,sha256:p.sha256,url:'https://www.notion.so/'+p.id.replaceAll('-','')}))}]));
fs.writeFileSync(new URL('../content/book-source-links.json',import.meta.url),JSON.stringify(links,null,2)+'\n');
console.log(JSON.stringify({books:Object.keys(links).length,parts:Object.values(links).reduce((n,b)=>n+b.parts.length,0),contentExported:false}));
