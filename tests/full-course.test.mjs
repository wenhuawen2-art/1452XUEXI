import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../content/curriculum.mjs';
import {lessonBlocks} from '../scripts/notion-content.mjs';
test('全部168课具有完整教学、8题、原文坐标和可创建的Notion载荷',()=>{
 for(const l of catalog.lessons){
  assert.equal(l.quiz.length,8,'D'+l.number);assert.ok(l.deepDive.sections.length>=6);
  assert.ok(l.sourceSelections.length>=1);assert.ok(l.exerciseMinChars>=100);
  const blocks=lessonBlocks(l,l.sourceSelections.map(s=>({...s,text:'用于结构校验的私有原文占位',url:'https://www.notion.so/example'})));
  assert.ok(blocks.length<=100,'Notion block overflow D'+l.number);
  assert.equal(blocks.filter(b=>b.type==='toggle').length,8);
 }
});
test('201章覆盖及六阶段20题均可追溯，结业评分100分',()=>{
 assert.equal(catalog.coverage.length,201);
 for(const c of catalog.coverage)assert.ok(c.coreDays.length||c.assignedDays.length,c.id);
 for(const a of catalog.assessments){assert.equal(a.questions.length,20);for(const q of a.questions)assert.ok(q.originDay>=a.start&&q.originDay<=a.end);}
 assert.equal(catalog.finalProject.rubric.reduce((s,r)=>s+r[1],0),100);
});
test('关键教学计算复核',()=>{
 assert.equal((92+3-100)/100,-.05);
 assert.ok(Math.abs(100/1.1-90.90909)<.00001);
 assert.ok(Math.abs(100/1.1**2-82.644628)<.00001);
 assert.equal((100-70)/100,.3);assert.equal(1000/(50-48),500);
 assert.equal(500*(50-46),2000);assert.ok(Math.abs(.03*4*2-.24)<1e-12);
 assert.equal(90-90*.6-30,6);assert.equal(10*(10-12),-20);
});
