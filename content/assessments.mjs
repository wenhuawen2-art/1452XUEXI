export const stageDefinitions=[
 {id:1,title:'入门与思维基础',start:1,end:28},
 {id:2,title:'企业与财报',start:29,end:63},
 {id:3,title:'企业质量与成长',start:64,end:91},
 {id:4,title:'价值与资本配置',start:92,end:119},
 {id:5,title:'周期、交易与风险',start:120,end:147},
 {id:6,title:'综合应用与结业',start:148,end:168}
];
export function makeAssessments(lessons){
 return stageDefinitions.map(stage=>{
  const pool=lessons.filter(l=>l.number>=stage.start&&l.number<=stage.end&&l.type==='新课').flatMap(l=>l.quiz.slice(0,3).map(q=>({...q,originDay:l.number})));
  const questions=Array.from({length:20},(_,i)=>pool[Math.floor(i*pool.length/20)]);
  return {...stage,pass:16,total:20,minutes:'35—50',questions};
 });
}
export const finalProject={
 title:'结业作品：企业研究与纸上交易的双轨答辩',
 deliverables:['一页商业模式与竞争图','五年同口径财务表及出处','保守、中性、压力三种现金与估值情景','最强反证和不行动条件','资金期限与共同风险压力测试','一份独立纸上交易规则与十笔模拟日志','三分钟口头解释及问答记录'],
 rubric:[['事实与来源',20,'关键数字可追溯，日期和会计口径清楚，未知不造填'],['企业与财报',20,'说清收钱、利润、现金、维护与债务，三表关系正确'],['估值与假设',20,'区间、现金、期限与敏感性一致，计算无实质错误'],['反证与风险',20,'有真正可推翻论点的事实，资金与尾部损失可解释'],['双轨与复盘',20,'投资和交易依据分开，保留原稿、模拟日志和修订']],
 pass:'总分至少80；来源伪造、重要计算错误、用未来信息模拟过去或混用投资交易依据，须修订后再答辩。',
 followUp:'保存原稿，30天、90天和一年后追加复盘；不要求以真实资金交易作为结业证明。'
};
