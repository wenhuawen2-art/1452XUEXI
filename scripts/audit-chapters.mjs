import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const order=['buffett','elder','marks','fisher','kahneman','tang','graham','duan'];
const cn=s=>{if(/^\d+$/.test(s))return Number(s);const map={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};if(s==='十')return 10;if(s.includes('十')){const [a,b]=s.split('十');return (map[a]||1)*10+(map[b]||0)}return map[s]};
const all=[];
for(let file=0;file<order.length;file++){
 const bookId=order[file],lines=fs.readFileSync(path.join(root,'..','.codex-reading','library',`book-${file+1}.txt`),'utf8').replace(/\r/g,'').split('\n');
 const candidates=[];let part=1,volume=1;
 const marksTitles=bookId==='marks'?lines.slice(0,70).map(x=>x.trim()).filter(x=>/^(0[1-9]|1[0-8])\s/.test(x)):[];
 for(let i=0;i<lines.length;i++){
  const title=lines[i].trim();
  const p=title.match(/^第([一二三四五六七八九十]+)部分/);if(p)part=cn(p[1]);
  if(bookId==='duan'&&/=====.*V02/.test(title))volume=2;
  let number,kind='c',key;
  if(bookId==='buffett'){
   const match=title.match(/^巴菲特.*信\s*((?:19|20)\d{2})\s*年?\s*$/);if(!match)continue;number=Number(match[1]);kind='y';
  }else if(bookId==='marks'){
   number=marksTitles.findIndex(x=>x.replace(/^\d{2}\s+/,'')===title)+1;if(!number||i<70)continue;
  }else{
   const match=title.match(/^第([一二三四五六七八九十百0-9]+)(章|讲)(?:\s|　|$)/);
   if(!match||title.length>80||/\.\.\./.test(title))continue;
   number=cn(match[1]);if(match[2]==='讲')kind='l';
  }
  key=bookId+'-'+(bookId==='fisher'?'p'+part+'-':bookId==='duan'?'v'+volume+'-':'')+kind+number;
  candidates.push({id:key,bookId,title:bookId==='elder'?title+' '+(lines[i+1]||'').trim():title,number,kind,part:bookId==='fisher'?part:undefined,volume:bookId==='duan'?volume:undefined,lineStart:i+1});
 }
 for(let i=0;i<candidates.length;i++){
  const c=candidates[i];let next=i+1;while(next<candidates.length&&candidates[next].id===c.id)next++;
  c.lineEnd=(candidates[next]?.lineStart||lines.length+1)-1;
  c.characters=lines.slice(c.lineStart-1,c.lineEnd).join('\n').length;
 }
 const unique=new Map();for(const c of candidates)if(c.characters>(unique.get(c.id)?.characters||0))unique.set(c.id,c);
 const chapters=[...unique.values()].sort((a,b)=>a.lineStart-b.lineStart);
 for(const c of chapters){delete c.kind;all.push(c)}
 console.log(bookId,chapters.length,chapters.map(c=>c.id).join(','));
}
fs.writeFileSync(path.join(root,'content','chapters.json'),JSON.stringify(all,null,2)+'\n');
fs.writeFileSync(path.join(root,'content','chapter-index.json'),JSON.stringify(Object.fromEntries(order.map(id=>[id,all.filter(c=>c.bookId===id).map(c=>({id:c.id,title:c.title,line:c.lineStart,end:c.lineEnd}))])),null,2)+'\n');
