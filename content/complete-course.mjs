import {depth} from './depth-index.mjs';
import {readingRanges} from './reading-ranges.mjs';
import {caseAnswers} from './case-answers.mjs';
import {books} from './books.mjs';
const question=(q,a,kind='解释')=>({q,a,kind});
export function completeCourse(lessons,cards,weeks){
 for(const week of weeks.slice(1)){
  const modules=depth[week.number],concepts=cards[week.number-1];
  if(!modules||modules.length!==4)throw Error('Missing authored week '+week.number);
  const connected=modules.map((m,i)=>concepts[i].title+'：'+m.transfer).join('\n');
  const factQuestions=concepts.map(c=>question(c.question,c.answer,'闭卷概念'));
  const applications=modules.map((m,i)=>question('将“'+concepts[i].title+'”用于本周案例，你会怎样判断？',m.transfer+' 核验证据：'+m.evidence,'案例迁移'));
  const worked=modules.map(m=>question(m.workedQ,m.workedA,'例题'));
  const boundaries=modules.map(m=>question(m.boundaryQ,m.boundaryA,'边界辨析'));
  const byDay=lessons.filter(l=>l.week===week.number);
  for(let j=0;j<7;j++){
   const lesson=byDay[j],sources=readingRanges[lesson.number];
   lesson.sourceSelections=sources;
   lesson.bookIds=[...new Set([...lesson.bookIds,...sources.map(s=>s.bookId)])];
   lesson.books=lesson.bookIds.map(id=>books.find(b=>b.id===id).short).join('、');
   lesson.reading=sources.map(s=>s.label+'（提取文本第'+s.start+'—'+s.end+'行）').join('；');
   lesson.readingAnchors=sources.map(s=>({book:s.label,section:'原文定位：第'+s.start+'—'+s.end+'行',note:s.prompt}));
   lesson.studySteps=j===6?[['闭卷检索',8],['错题与原文核对',10],['迁移自测',10],['总结与回访',12]]:[['带问题精读原文',12],['讲解与例题核对',10],['八题自测',8],['独立作业与修订',10]];
   lesson.minutes='30—45';
   lesson.cross='本周四个知识点在同一案例中的联系：\n'+connected;
   if(j<4){
    const m=modules[j],c=concepts[j];
    const prior=lessons[Math.max(0,lesson.number-8)].quiz[0];
    lesson.deepDive={sections:[
     ['把机制讲清楚',m.teach],
     ['跟着做一道例题',m.workedQ+'\n推演：'+m.workedA+'\n先独立写出数字、假设与判断步骤，再核答案。涉及比例时写清分母与期间；非计算题也需说明事实如何支持结论。'],
     ['边界、反例与争议',m.boundaryQ+'\n'+m.boundaryA+' 原书中的经验、人物故事或历史环境提供思考材料；是否适用于当前对象，还须用可观察证据检验。'],
     ['把观点变成取证任务',m.evidence+' 请把每项证据写成“资料在哪里—什么时点可取得—若与预期不同如何重审”三栏。未知信息保留未知，不能把缺失数据默认为支持自己。'],
     ['用本周案例迁移',m.transfer+' 对照原题的已知数字，不自行增补有利条件；必须区分事实、假设、计算和结论。'],
     ['同另外三课连起来',connected]
    ]};
    lesson.quiz=[factQuestions[j],worked[j],boundaries[j],
     question('面对“'+c.example+'”，至少要补查哪些证据？',m.evidence,'取证'),
     question('怎样解释并避免这个误判：“'+c.pitfall+'”？',m.teach+' '+m.boundaryA,'纠错'),
     applications[j],question('间隔复习：'+prior.q,prior.a,'间隔复习'),
     question('读完“'+c.title+'”相关原文，区分作者主张、你的推论和适用边界。',c.explain+' 证据检查：'+m.evidence+' 边界：'+m.boundaryA,'原文理解')];
    lesson.exercise=c.action+' 先完成本课例题，再将本周案例按“已知事实、我的假设、核验来源、可能反证”分栏，写至少180字。重点：'+m.evidence+' 最后给出一个带条件的结论，而非只写看好或不看好。';
    lesson.rubric='例题步骤与口径正确；四栏齐全；至少三项具体证据；至少一条反证能改变结论；能解释“'+c.title+'”的适用边界。';
    lesson.diagram={kind:'table',items:[['机制',c.explain],['具体例题',m.workedQ],['推演结果',m.workedA],['核验证据',m.evidence],['边界',m.boundaryA]]};
   }else{
    const caseSections=caseAnswers[week.number]||[];
    const common=[...caseSections,['四个概念怎样共同工作',connected],['必须保留的未知',modules.map((m,i)=>(i+1)+'. '+m.evidence).join('\n')+' 未提供的条件不要编造；给每个数字标明原题、假设或计算。'],['对照原书再修订',sources.map(s=>s.label+'：'+s.prompt).join('\n')],['交付前的反向检查','如果你的结论与最初立场相反，是否仍会采用相同证据标准？尝试写出一个相反解释，指出用什么公开事实区分两者。数值结果不等于完整决策，还需说明价格、期限、风险和资料限制。']];
    if(j===4){
     lesson.deepDive={sections:common};
     lesson.quiz=[...factQuestions,...applications];
     lesson.exercise=week.task+' 提交一张至少六行的分析表：事实、口径、计算、替代解释、反证、资料缺口。再写200字说明哪些判断可靠、哪些只能暂定。';
    }else if(j===5){
     lesson.deepDive={sections:[['先独立完成，不先看答案','把本周案例重新写成事实与假设两栏，独立做计算或判断。再从四个概念逐一追问，记录自己最不确定的一项。完成初稿后才读下面解析。'],...common,['修订记录','保留初稿，在新段落写出你改了哪一条判断、依据是什么，或为什么仍维持原结论。改变结论不扣分，隐去不利证据或倒改原假设才会损害可检验性。']]};
     lesson.quiz=[...worked,...boundaries];
     lesson.exercise=week.task+' 独立写至少300字，附四栏研究表、两种相反情景及一条会触发重审的事实。使用原文或原始资料至少两处，注明章节/行号或网址与日期。';
    }else{
     const spaced=[7,21,49,84].map(offset=>lessons[Math.max(0,lesson.number-offset-1)].quiz[0]);
     lesson.deepDive={sections:[['闭卷先说出来','合上材料，用两分钟说明本周四个概念和它们的联系。不会之处先留空，不用熟悉感替代独立作答。下面八题先作答再展开。'],...concepts.map((c,i)=>[c.title+'的纠错定位',modules[i].teach+' 关键边界：'+modules[i].boundaryA]),['本周案例的联合判断',connected],['间隔复习与回访','答错后记录题号、错因和对应课程；3天、7天、21天后重答。若计算错，重新手算；若忽略条件，写一条相反情景；若来源错，回原书或原始材料定位。']]};
     lesson.quiz=[...factQuestions,...spaced.map(q=>question('间隔复习：'+q.q,q.a,'间隔复习'))];
     lesson.exercise='闭卷写出本周四个概念的因果联系，再用本周案例作一次迁移解释。至少250字，给每道错题标错因、对应课号和3天后的回访任务。第'+week.number+'周的作品需保留初稿与修订稿。';
    }
    lesson.rubric='八题至少答对六题；完成规定表格和文字；案例计算正确且标口径；事实与假设分开；至少有一项可推翻结论的证据；错题有对应课程与回访任务。';
    lesson.diagram={kind:'table',items:concepts.map((c,i)=>[c.title,modules[i].transfer])};
   }
   lesson.status='已编写：原文精读、讲解、八题自测与作业';
  }
  week.reading=[...new Set(byDay.slice(0,4).flatMap(l=>l.sourceSelections.map(s=>s.label)))].join('；');
  for(const l of byDay)for(const id of l.bookIds){const b=books.find(b=>b.id===id);if(!b.weeks.includes(week.number))b.weeks.push(week.number)}
 }
}
