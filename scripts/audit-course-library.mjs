import fs from 'node:fs';
import {lessons,assessments} from '../content/curriculum.mjs';
import {createNotionClient,plain} from './notion-client.mjs';
import {getSources} from './notion-sources.mjs';
import {verifyLesson} from './notion-content.mjs';
import {parentId} from './notion-core.mjs';
const client=createNotionClient(),index=JSON.parse(fs.readFileSync('.local/course-library.json','utf8'));
const file='.local/course-final-audit.json',report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{days:[],exams:[]};
const save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2));
for(const l of lessons){
 if(report.days.some(d=>d.number===l.number))continue;
 const p=index.lessons[l.number];if(!p?.verified)throw Error('课程尚未建立：'+l.number);
 const result=await verifyLesson(client,p.id,l,await getSources(client,parentId,l.number));
 report.days.push({number:l.number,...result});save();if(l.number%14===0)console.log(JSON.stringify({exactAnswersVerifiedThrough:l.number}));
}
for(const a of assessments){
 if(report.exams.includes(a.id))continue;
 const blocks=await client.children(index.exams[a.id]);const toggles=blocks.filter(x=>x.type==='toggle');
 if(toggles.length!==20)throw Error('阶段测验题数不符');
 for(const [i,b] of toggles.entries()){
  if(plain(b.toggle.rich_text)!==(i+1)+'. '+a.questions[i].q)throw Error('测验题目不符');
  const answer=await client.children(b.id);if(!answer.some(x=>x.type==='paragraph'&&plain(x.paragraph.rich_text)===a.questions[i].a))throw Error('测验答案不符');
 }
 report.exams.push(a.id);save();
}
report.completedAt=new Date().toISOString();save();console.log(JSON.stringify({complete:true,days:report.days.length,stageQuestions:120}));
