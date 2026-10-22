import {readingRanges} from '../content/reading-ranges.mjs';
import {books as bookCatalog} from '../content/books.mjs';
import {plain} from './notion-client.mjs';
export async function getSources(client,parent,number){
 const library=(await client.childPages(parent)).find(x=>x.title==='原文书库');
 if(!library)throw Error('私有原文书库尚未同步完成');
 const books=await client.childPages(library.id),result=[];
 for(const range of readingRanges[number]||[]){
  const bookTitle=bookCatalog.find(b=>b.id===range.bookId)?.title;
  const book=books.find(x=>x.title===bookTitle||x.title.startsWith('['+range.bookId+'] '));
  if(!book)throw Error('缺少原文书籍：'+range.bookId);
  const parts=(await client.childPages(book.id)).map(p=>({...p,range:p.title.match(/^原文分卷\d+｜第(\d+)—(\d+)行$/)})).filter(p=>p.range&&Number(p.range[1])<=range.end&&Number(p.range[2])>=range.start).sort((a,b)=>Number(a.range[1])-Number(b.range[1]));
  let current=range.start;const excerpts=[];
  for(const part of parts){
   const blocks=await client.children(part.id);
   const meta={start:Number(part.range[1]),end:Number(part.range[2])};
   const raw=blocks.slice(2).filter(x=>x.type==='paragraph').map(x=>plain(x.paragraph.rich_text)).join('');
   const first=Math.max(current,meta.start),last=Math.min(range.end,meta.end);
   if(first!==current)throw Error('原文定位不连续');
   excerpts.push(raw.split('\n').slice(first-meta.start,last-meta.start+1).join('\n'));
   current=last+1;if(current>range.end)break;
  }
  if(current<=range.end)throw Error('原文范围未同步完整：'+range.bookId);
  result.push({...range,text:excerpts.join('\n'),url:'https://www.notion.so/'+book.id.replaceAll('-','')});
 }
 return result;
}
