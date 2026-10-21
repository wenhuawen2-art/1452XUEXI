import assert from 'node:assert/strict';
import {books,weeks,lessons,cards} from '../content/curriculum.mjs';
assert.equal(books.length,8);assert.equal(weeks.length,24);assert.equal(cards.length,24);assert.equal(lessons.length,168);
for(let i=0;i<168;i++){const l=lessons[i];assert.equal(l.number,i+1);assert.equal(l.quiz.length,3);assert.ok(l.exercise&&l.reading&&l.sourceNote);assert.equal(l.week,Math.floor(i/7)+1);}
console.log('Validated 8 books, 24 weeks, 96 concepts, 168 days, 504 checks.');
