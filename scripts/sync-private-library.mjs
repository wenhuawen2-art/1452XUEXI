import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {books} from '../content/books.mjs';
import {parentId} from './notion-core.mjs';
import {createNotionClient,para,heading,plain,titleOf,splitText} from './notion-client.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceDir=path.resolve(root,'..','.codex-reading','library');
const order=['buffett','elder','marks','fisher','kahneman','tang','graham','duan'];
const checkpoint=path.join(root,'.local','notion-library.json');
const client=createNotionClient();
const parent=await client.api('GET','/pages/'+parentId);
if(titleOf(parent)!=='学习日记')throw Error('父页不符');
let library=(await client.childPages(parentId)).find(x=>x.title==='原文书库');
if(!library)library=await client.createPage(parentId,'原文书库',[heading('八本书的个人原文检索入口'),para('这里保存你提供的八个文件的提取文字，按原顺序分卷。章节、页码或电子书文件名标记保留用于定位；PDF表格和OCR错字请对照本地原文件。内容继承学习日记页面的权限。'),para('全文为原文件内容，不代表课程讲解认可其中每项判断。段永平相关文件包含孙力科编著的两本书；原文、编者归纳和课程解释需区分。')],'📚');
const index={parentId,libraryId:library.id,books:{}};
fs.mkdirSync(path.dirname(checkpoint),{recursive:true});
const save=()=>fs.writeFileSync(checkpoint,JSON.stringify(index,null,2));
const existingBooks=await client.childPages(library.id);
for(let i=0;i<order.length;i++){
 const id=order[i],book=books.find(x=>x.id===id),title=book.title;
 let bookPage=existingBooks.find(x=>x.title===title||x.title===`[${id}] ${title}`);
 if(!bookPage)bookPage=await client.createPage(library.id,title,[heading(book.title),para(book.author),para(book.note),para('按下列分卷顺序阅读全文。用 Notion 页面搜索或手机页面内搜索查找关键词；每卷保留原始提取行号。')],'📘');
 else if(bookPage.title!==title)await client.api('PATCH','/pages/'+bookPage.id,{properties:{title:{type:'title',title:para(title).paragraph.rich_text}}});
 const lines=fs.readFileSync(path.join(sourceDir,`book-${i+1}.txt`),'utf8').replace(/\r/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').split('\n');
 const parts=[];let start=1,buffer='';
 for(let j=0;j<lines.length;j++){
  buffer+=lines[j]+(j<lines.length-1?'\n':'');
  if(buffer.length>=24000||j===lines.length-1){parts.push({start,end:j+1,text:buffer});start=j+2;buffer=''}
 }
 index.books[id]={id:bookPage.id,url:'https://www.notion.so/'+bookPage.id.replaceAll('-',''),title:book.title,parts:[]};save();
 const existing=await client.childPages(bookPage.id);
 const desiredTitles=new Set(parts.map((p,j)=>`原文分卷${String(j+1).padStart(3,'0')}｜第${p.start}—${p.end}行`));
 let createdCount=0;
 for(let j=0;j<parts.length;j++){
  const part=parts[j],partTitle=`原文分卷${String(j+1).padStart(3,'0')}｜第${part.start}—${part.end}行`;
  const hash=crypto.createHash('sha256').update(part.text).digest('hex');
  let page=existing.find(x=>x.title===partTitle);
  if(page){
   const blocks=await client.children(page.id);
   const marker=blocks.find(x=>x.type==='paragraph'&&/^(SOURCE_META |原文定位：)/.test(plain(x.paragraph.rich_text)));
   if(!marker)throw Error('已有分卷缺少来源标记：'+partTitle);
   const actual=blocks.slice(2).filter(x=>x.type==='paragraph').map(x=>plain(x.paragraph.rich_text)).join('');
   if(crypto.createHash('sha256').update(actual).digest('hex')!==hash)throw Error('已有原文分卷与本地不符，保留现页等待核查：'+partTitle);
   if(plain(marker.paragraph.rich_text).startsWith('SOURCE_META '))await client.api('PATCH','/blocks/'+marker.id,{paragraph:{rich_text:para(`原文定位：提取文本第${part.start}—${part.end}行。请对照原文件核查图表与疑难文字。`).paragraph.rich_text}});
  }else{
   const sourceBlocks=splitText(part.text,1700).map(para);
   page=await client.createPage(bookPage.id,partTitle,[heading(book.title+' · 原文'),para(`原文定位：提取文本第${part.start}—${part.end}行。请对照原文件核查图表与疑难文字。`),...sourceBlocks]);
   const blocks=await client.children(page.id);
   const actual=blocks.slice(2).filter(x=>x.type==='paragraph').map(x=>plain(x.paragraph.rich_text)).join('');
   if(crypto.createHash('sha256').update(actual).digest('hex')!==hash)throw Error('原文回读校验失败：'+partTitle);
   createdCount++;
  }
  index.books[id].parts.push({id:page.id,start:part.start,end:part.end,sha256:hash});save();
 }
 for(const old of existing.filter(p=>p.title.startsWith('原文分卷')&&!desiredTitles.has(p.title))){
  const blocks=await client.children(old.id);
  if(!blocks.some(b=>b.type==='paragraph'&&/^(SOURCE_META |原文定位：)/.test(plain(b.paragraph.rich_text))))throw Error('未知来源的额外分卷，未修改');
  await client.api('PATCH','/pages/'+old.id,{properties:{title:{type:'title',title:para('历史校验记录｜'+old.title).paragraph.rich_text}}});
 }
 console.log(JSON.stringify({book:id,parts:parts.length,created:createdCount,verified:true}));
}
// Private page URLs are navigation metadata; no source text or personal notes are exported.
fs.writeFileSync(path.join(root,'content','book-source-links.json'),JSON.stringify(Object.fromEntries(Object.entries(index.books).map(([id,b])=>[id,{url:b.url,title:b.title,parts:b.parts.map(p=>({start:p.start,end:p.end,url:'https://www.notion.so/'+p.id.replaceAll('-','')}))}])),null,2)+'\n');
console.log(JSON.stringify({completed:true,books:Object.keys(index.books).length,libraryUrl:'https://www.notion.so/'+library.id.replaceAll('-','')}));
