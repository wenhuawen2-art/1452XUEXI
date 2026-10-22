import fs from 'node:fs';
import {lessons,assessments,finalProject} from '../content/curriculum.mjs';
import {parentId} from './notion-core.mjs';
import {createNotionClient,heading,para,richText} from './notion-client.mjs';
import {lessonBlocks,verifyLesson} from './notion-content.mjs';
import {getSources} from './notion-sources.mjs';
const client=createNotionClient(),parent=process.env.NOTION_PARENT_ID||parentId;
const checkpoint='.local/course-library.json';
fs.mkdirSync('.local',{recursive:true});
const report=fs.existsSync(checkpoint)?JSON.parse(fs.readFileSync(checkpoint,'utf8')):{lessons:{},exams:{}};
const save=()=>fs.writeFileSync(checkpoint,JSON.stringify(report,null,2));
async function ensure(p,title,blocks=[]){const pages=await client.childPages(p);return pages.find(x=>x.title===title)||client.createPage(p,title,blocks,'📚')}
async function run(){
 const root=await ensure(parent,'168天课程全集（预习与补课）',[heading('完整课程，不作为每日推进记录'),para('按24周排列。正式每日页面另建在“学习日记”下，只有正式页面的已完成勾选用于推进。这里可预习、补课；私人笔记不会进入公开仓库。')]);report.root=root.id;save();
 for(let week=1;week<=24;week++){
  const group=await ensure(root.id,'第'+String(week).padStart(2,'0')+'周｜'+lessons[(week-1)*7].track);
  const existing=await client.childPages(group.id);
  for(const l of lessons.filter(x=>x.week===week)){
   if(report.lessons[l.number]?.verified)continue;
   const title='D'+String(l.number).padStart(3,'0')+'｜'+l.title;
   const sources=await getSources(client,parent,l.number);
   const page=existing.find(x=>x.title===title)||await client.createPage(group.id,title,lessonBlocks(l,sources));
   report.lessons[l.number]={id:page.id,verified:false};save();
   const verified=await verifyLesson(client,page.id,l,sources);
   report.lessons[l.number]={id:page.id,verified:true,at:new Date().toISOString(),...verified};save();
   console.log(JSON.stringify({day:l.number,verified:true,blocks:verified.blocks}));
  }
 }
 const examRoot=await ensure(root.id,'六阶段测验与结业答辩');
 for(const a of assessments){
  if(report.exams[a.id])continue;
  const blocks=[heading(a.title),para('20题，建议35—50分钟；自评至少16题正确。先闭卷写答案，再展开参考。'),...a.questions.map((q,i)=>({object:'block',type:'toggle',toggle:{rich_text:richText((i+1)+'. '+q.q),children:[para(q.a),para('针对性复习：第'+q.originDay+'天')]}}))];
  const p=await ensure(examRoot.id,'阶段'+a.id+'｜'+a.title,blocks);const read=await client.children(p.id);if(read.filter(b=>b.type==='toggle').length!==20)throw Error('阶段测验回读失败');report.exams[a.id]=p.id;save();
 }
 await ensure(examRoot.id,'结业项目与评分标准',[heading(finalProject.title),...finalProject.deliverables.map(para),...finalProject.rubric.map(r=>para(r[0]+'｜'+r[1]+'分｜'+r[2])),para(finalProject.pass),para(finalProject.followUp)]);
 report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({complete:true,lessons:Object.keys(report.lessons).length,exams:Object.keys(report.exams).length,url:'https://www.notion.so/'+root.id.replaceAll('-','')}));
}
run().catch(e=>{console.error(e.message);process.exitCode=1});
