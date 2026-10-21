import {books,references} from './books.mjs';
import {weekMeta} from './weeks.mjs';
import {cards} from './cards.mjs';
import {firstWeek,firstWeekQuizzes} from './first-week.mjs';
import {caseAnswers} from './case-answers.mjs';

export const tracks=['认知与概率','企业与财报','竞争与成长','价值与估值','周期与市场','交易与风险'];
const pad=n=>String(n).padStart(3,'0');
export const weeks=weekMeta.map((w,i)=>({number:i+1,title:w[0],track:tracks[w[1]],bookIds:w[2].split(','),reading:w[3],caseTitle:w[4],scenario:w[5],task:w[6]}));
const bookName=ids=>ids.map(id=>books.find(b=>b.id===id)?.short).filter(Boolean).join('、');
const lessons=[];
for(const week of weeks){
 const c=cards[week.number-1];
 for(let j=0;j<7;j++){
  const number=(week.number-1)*7+j+1;
  const base={number,id:'D'+pad(number),week:week.number,weekday:j+1,track:week.track,bookIds:week.bookIds,books:bookName(week.bookIds),reading:week.reading,minutes:'30—45',sourceNote:'依据本地书目相关章节的教学转述；请与原书对照。案例及计算为原创教学示例，不构成投资建议。'};
  if(j<4){const x=c[j];lessons.push({...base,type:'新课',title:x.title,goal:'能用自己的话解释“'+x.title+'”，识别常见误判并完成一个小操作。',lead:x.example,concept:x.explain,pitfall:x.pitfall,diagram:{kind:'flow',items:[x.title,x.explain.split('；')[0],x.action]},cross:'本周主线“'+week.title+'”与 '+week.bookIds.map(id=>books.find(b=>b.id===id)?.role).filter(Boolean).join('、')+' 相连。',quiz:[{q:x.question,a:x.answer},{q:'这个知识点最容易犯的错误是什么？',a:x.pitfall},{q:'怎样把本课用在真实研究而不是只背术语？',a:x.action}],exercise:x.action,reviewLinks:number>7?[number-7]:[]});}
  else if(j===4){lessons.push({...base,type:'案例',title:week.caseTitle,goal:'用本周四个概念分析同一情境，区分事实、解释与未知。',lead:week.scenario,concept:'案例事实：'+week.scenario+' 先把已知数字列出，再逐一应用 '+c.map(x=>x.title).join('、')+'。结论须写“还不知道什么”，不能由一个数直接买卖。',pitfall:'将故事当证据，或忽略反证与现金风险。',diagram:{kind:'table',items:c.map(x=>[x.title,x.explain])},cross:'对照本周书籍的不同视角：'+bookName(week.bookIds)+'。',quiz:c.slice(0,3).map(x=>({q:'案例中怎样应用“'+x.title+'”？',a:x.explain+' '+x.action})),exercise:week.task,reviewLinks:[number-1,number-2,number-3,number-4]});}
  else if(j===5){lessons.push({...base,type:'练习',title:'动手练：'+week.title,goal:'独立交付一份可检查的学习作品。',lead:week.scenario,concept:'先重述本周案例，分成“已知事实｜我的假设｜需要核实｜可能反证”四栏，再完成具体任务。',pitfall:'只写态度，不写可核验数据和来源。',diagram:{kind:'flow',items:['事实','假设','反证','结论与限制']},cross:'同时回看本周四课：'+c.map(x=>x.title).join('、')+'。',quiz:c.slice(1,4).map(x=>({q:x.question,a:x.answer})),exercise:week.task+' 交付格式：一张表＋一段不超过200字的解释＋一条可能推翻你结论的事实。',reviewLinks:[number-5,number-4,number-3,number-2]});}
  else{const prior=lessons[Math.max(0,number-8)];lessons.push({...base,type:'复习',title:'复盘与迁移：'+week.title,goal:'不看答案复述本周知识，并发现需要重学的环节。',lead:'先合上材料，用两分钟讲出本周四个概念，再处理错题。',concept:'本周路线：'+c.map((x,k)=>(k+1)+'→'+x.title).join('；')+'。间隔复习上周知识：'+prior.title+'。若答错，请返回对应课程，并隔3天再做一次。',pitfall:'看完答案产生“我会了”的熟悉感。',diagram:{kind:'flow',items:c.map(x=>x.title)},cross:'从“'+tracks[0]+'”到“'+tracks[5]+'”寻找本周主题位置。',quiz:[{q:c[0].question,a:c[0].answer},{q:c[2].question,a:c[2].answer},{q:'本周案例的最大未知是什么？',a:'可用本周练习中的事实、假设、反证三栏检查；不能只凭故事定论。'}],exercise:'闭卷解释四概念；核对答案。得分至少2/3且完成本周练习，才建议勾选完成。第4、9、13、17、21、24周另做阶段自评。',reviewLinks:[number-6,number-4,number-1,Math.max(1,number-7),Math.max(1,number-21)]});}
 }
}
export {books,references,cards};
for(const lesson of lessons) if(firstWeek[lesson.number]){lesson.deepDive=firstWeek[lesson.number];lesson.reading=firstWeek[lesson.number].reading;lesson.quiz=firstWeekQuizzes[lesson.number].map(([q,a])=>({q,a}));}
for(const lesson of lessons) if(lesson.type==='案例'&&lesson.week>1){lesson.deepDive={sections:caseAnswers[lesson.week]};}
export {lessons};
export const catalog={version:'2026-10-21',tracks,books,references,weeks,lessons};
