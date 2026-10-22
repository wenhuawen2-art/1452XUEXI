import fs from 'node:fs';
import {lessons} from '../content/curriculum.mjs';
import {depth} from '../content/depth-index.mjs';
import {chapterGuides} from '../content/chapter-guides.mjs';
const chapters=JSON.parse(fs.readFileSync(new URL('../content/chapters.json',import.meta.url),'utf8'));
const modules=Object.values(depth).flat(),counters={};
const coverage=chapters.map(chapter=>{
 const days=lessons.filter(l=>l.sourceSelections?.some(s=>s.chapterId===chapter.id||(!s.chapterId&&s.bookId===chapter.bookId&&s.start>=chapter.lineStart&&s.start<=chapter.lineEnd))).map(l=>l.number);
 const module=modules.find(m=>m.chapterId===chapter.id);
 let guide=chapterGuides[chapter.id];
 let role=days.length?'核心精读':'专题补读';
 if(!guide&&module)guide={week:Math.ceil(days[0]/7),guide:module.teach,q:module.boundaryQ,a:module.boundaryA};
 if(!guide&&days.length){const lesson=lessons[days[0]-1];guide={week:lesson.week,guide:lesson.deepDive.sections[0][1],q:lesson.quiz[0].q,a:lesson.quiz[0].a}}
 if(chapter.bookId==='buffett'&&!days.length){
  const year=chapter.number,week=year<1971?1:year<1984?5:year<1993?15:year<2000?16:year<2010?18:year<2020?15:16;
  guide={week,guide:'年代延伸阅读：按当年信的原始语境记录经营、资本配置与风险表述，核报告期与落款。该年度未作为当前日课的核心证据，避免用后来的股价倒推当时判断。',q:'这封信中哪些是当年已知事实，哪些是预测或管理层判断？',a:'需回到该信逐项标注事实、预测、估计及出处，不以其后结果把预测改写为当时已知。'};role='年代延伸';
 }
 if(!guide)throw Error('Uncovered chapter '+chapter.id);
 if(['graham-c9','graham-c10'].includes(chapter.id)||chapter.id.startsWith('duan-v2-')&&!days.length)role='历史背景';
 let assignedDays=days;
 if(!days.length){const offset=counters[guide.week]||0;counters[guide.week]=offset+1;assignedDays=[(guide.week-1)*7+(offset%7)+1]}
 return {...chapter,role,coreDays:days,assignedDays,guide:guide.guide,question:guide.q,answer:guide.a};
});
fs.writeFileSync(new URL('../content/coverage.json',import.meta.url),JSON.stringify(coverage,null,2)+'\n');
console.log(JSON.stringify({chapters:coverage.length,core:coverage.filter(c=>c.coreDays.length).length,supplementary:coverage.filter(c=>!c.coreDays.length).length,uncovered:0}));
