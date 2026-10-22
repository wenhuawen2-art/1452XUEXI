import {para,heading,richText,plain} from './notion-client.mjs';
export function lessonBlocks(l,sources=[],site='https://wenhuawen2-art.github.io/1452XUEXI/'){
 const image=site.replace(/\/?$/,'/')+'diagrams/day-'+String(l.number).padStart(3,'0')+'.png';
 return [para('课程编号 '+l.id+' ｜ '+l.track+' ｜ 原书阅读、讲解、自测与作业共约30—45分钟'),
 heading('今天要学会'),para(l.goal),
 heading('今天怎么学'),...(l.studySteps||[]).map(([name,min])=>para(name+'｜约'+min+'分钟')),
 heading('先从生活场景开始'),para(l.lead),
 heading('原书精读'),para('以下节选来自你提供的原文件提取文字；行号用于与私有原文书库对照。PDF表格、OCR疑点与历史规则请核原文件。'),
 ...sources.flatMap(s=>[heading(s.label),para('阅读任务：'+s.prompt),{object:'block',type:'quote',quote:{rich_text:richText(s.text)}},para('原文定位：第'+s.start+'—'+s.end+'行；完整原书：'+s.url)]),
 heading('概念与图解'),para(l.concept),{object:'block',type:'image',image:{type:'external',external:{url:image}}},para('容易踩的坑：'+l.pitfall),
 ...(l.deepDive?.sections||[]).flatMap(([name,text])=>[heading(name),para(text)]),
 heading('跨书联系'),para(l.cross),heading(l.quiz.length+'道自测'),para('先在纸上或下面写下答案，再展开参考答案。把答错的题号和错因记在学习笔记中。'),
 ...l.quiz.map((q,i)=>({object:'block',type:'toggle',toggle:{rich_text:richText((i+1)+'. '+q.q),children:[para('参考答案：'+q.a)]}})),
 heading('今天的练习'),para(l.exercise),para('达标标准：'+l.rubric),heading('我的学习笔记'),para('在这里记录自己的答案、作业与错题。'),
 heading('出处与补充资料'),para(l.reading),para(l.sourceNote),...(l.externalReferences||[]).map(r=>para(r.title+'：'+r.url)),
 para('手机网页版：'+site.replace(/\/?$/,'/')+'?day='+l.number),
 {object:'block',type:'to_do',to_do:{rich_text:richText('已完成：自测至少答对6/8题，并按达标标准完成练习后勾选'),checked:false}}];
}
export async function verifyLesson(client,id,lesson,expectedSources){
 const blocks=await client.children(id);
 const checks=blocks.filter(x=>x.type==='to_do'&&plain(x.to_do.rich_text).startsWith('已完成：'));
 if(checks.length!==1)throw Error('课程缺少唯一完成勾选');
 if(blocks.filter(x=>x.type==='toggle').length!==lesson.quiz.length)throw Error('自测题回读数量不符');
 if(!blocks.some(x=>x.type==='image'))throw Error('图解回读缺失');
 const teaching=blocks.filter(x=>x.type==='paragraph').map(x=>plain(x.paragraph.rich_text));
 for(const [,text] of lesson.deepDive?.sections||[])if(!teaching.includes(text))throw Error('课程讲解回读不完整');
 const quotes=blocks.filter(x=>x.type==='quote').map(x=>plain(x.quote.rich_text));
 if(quotes.length!==expectedSources.length||quotes.some((text,i)=>text!==expectedSources[i].text))throw Error('原文节选回读不完整');
 for(const toggle of blocks.filter(x=>x.type==='toggle')){
  if(!toggle.has_children)throw Error('自测答案缺失');
  const children=await client.children(toggle.id);
  if(!children.some(x=>x.type==='paragraph'&&plain(x.paragraph.rich_text).startsWith('参考答案：')))throw Error('自测参考答案回读缺失');
 }
 return {blocks:blocks.length,questions:lesson.quiz.length,sources:quotes.length,complete:checks[0].to_do.checked,completedAt:checks[0].last_edited_time};
}
