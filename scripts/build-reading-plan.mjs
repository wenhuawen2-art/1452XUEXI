import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {depth} from '../content/depth-index.mjs';
import {books} from '../content/books.mjs';
import {cards} from '../content/cards.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const chapters=JSON.parse(fs.readFileSync(path.join(root,'content','chapters.json'),'utf8'));
const order=['buffett','elder','marks','fisher','kahneman','tang','graham','duan'];
const lines=Object.fromEntries(order.map((id,i)=>[id,fs.readFileSync(path.join(root,'..','.codex-reading','library','book-'+(i+1)+'.txt'),'utf8').replace(/\r/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').split('\n')]));
const synonyms={'owner earnings':['业主','盈余','折旧'],'depreciation':['折旧'],'retained':['保留','留存','盈余'],'repurchases':['买回','回购'],'competence':['能力圈','能力范围','懂得','了解'],'float':['浮存金'],'business':['企业','经营'],'per-share':['每股'],'value':['价值'],'mistake':['错误'],'owner':['股东','拥有'],'acquisition':['购并','并购','收购','买下'],'随机':['随机','运气','波动'],'产能':['生产能力','产能','产量'],'库存':['库存','存货','订货'],'局限':['局限','预测','无法'],'结论':['结论','原则','投资人']};
function selection(module,target=2200){
 const chapter=chapters.find(c=>c.id===module.chapterId);if(!chapter)throw Error('Unknown chapter '+module.chapterId);
 const source=lines[chapter.bookId],words=synonyms[module.focus]||[module.focus];
 let best=-1,bestScore=-1;
 for(let i=chapter.lineStart;i<chapter.lineEnd;i++){
  const s=source[i];if(!s||s.length<20||s.startsWith('===='))continue;
  const score=words.reduce((sum,w)=>sum+(s.toLowerCase().split(w.toLowerCase()).length-1),0);
  if(score>bestScore){best=i;bestScore=score}
 }
 if(best<0)throw Error('Chapter has no readable body '+chapter.id);
 let start=best;if(source[best-1]?.length>80)start--;
 let end=start,length=0;
 while(end<chapter.lineEnd&&length<target){
  const size=source[end].length+1;
  if(length>target*.65&&length+size>target*1.65)break;
  length+=size;end++;
 }
 const book=books.find(b=>b.id===chapter.bookId);
 return {bookId:chapter.bookId,chapterId:chapter.id,start:start+1,end,characters:length,label:book.title+' · '+chapter.title,prompt:'围绕“'+module.topic+'”读这一段：划出作者的判断、支持它的事实和适用条件；再用本课例题检验，写一项原文没有直接证明的推论。',focusMatched:bestScore>0};
}
const plan={};const audit=[];
for(const [weekStr,modules] of Object.entries(depth)){
 const week=Number(weekStr);modules.forEach((m,i)=>m.topic=cards[week-1][i].title);
 for(let j=0;j<4;j++){const day=(week-1)*7+j+1;plan[day]=[selection(modules[j])];audit.push({day,focus:modules[j].focus,...plan[day][0]})}
 plan[(week-1)*7+5]=modules.map(m=>selection(m,850));
 plan[(week-1)*7+6]=[selection(modules[1],1300),selection(modules[3],1300)];
 plan[(week-1)*7+7]=[selection(modules[0],950),selection(modules[2],950)];
}
fs.writeFileSync(path.join(root,'content','reading-plan.json'),JSON.stringify(plan,null,2)+'\n');
fs.mkdirSync(path.join(root,'.local'),{recursive:true});
fs.writeFileSync(path.join(root,'.local','reading-plan-audit.json'),JSON.stringify(audit,null,2));
console.log(JSON.stringify({days:Object.keys(plan).length,modules:audit.length,unmatched:audit.filter(a=>!a.focusMatched).map(a=>({day:a.day,chapter:a.chapterId,focus:a.focus})),largest:audit.sort((a,b)=>b.characters-a.characters).slice(0,4).map(a=>({day:a.day,chars:a.characters}))}));
