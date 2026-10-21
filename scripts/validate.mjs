import assert from 'node:assert/strict';
import {books,weeks,lessons,cards} from '../content/curriculum.mjs';
import fs from 'node:fs';
assert.equal(books.length,8);assert.equal(weeks.length,24);assert.equal(cards.length,24);assert.equal(lessons.length,168);
for(let i=0;i<168;i++){const l=lessons[i];assert.equal(l.number,i+1);assert.equal(l.quiz.length,i<7?8:3);assert.ok(l.exercise&&l.reading&&l.sourceNote);assert.equal(l.week,Math.floor(i/7)+1);}
for(const l of lessons.slice(0,7)){
 assert.ok(l.readingAnchors.length>=1&&l.deepDive.sections.length>=6);
 assert.ok(l.studySteps.reduce((sum,step)=>sum+step[1],0)>=30);
 assert.ok(l.quiz.every(q=>q.q&&q.a));
 assert.ok(l.rubric&&l.exercise.length>=50);
}
const index=JSON.parse(fs.readFileSync(new URL('../content/chapter-index.json',import.meta.url),'utf8'));
for(const b of books)assert.ok(index[b.id]?.length>0,'Missing chapter index: '+b.id);
console.log('Validated 8 books, 24 weeks, 96 concepts, 168 days; first-week lessons have 8 questions each.');
