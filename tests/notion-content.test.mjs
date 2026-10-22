import test from 'node:test';
import assert from 'node:assert/strict';
import {richText,plain,splitText} from '../scripts/notion-client.mjs';
import {lessonBlocks} from '../scripts/notion-content.mjs';
import {lessons} from '../content/curriculum.mjs';
test('长原文不被截断，跨边界表情不被拆断',()=>{
 const text='中'.repeat(1799)+'📚'+'文'.repeat(2200);
 const parts=splitText(text);
 assert.equal(plain(richText(text)),text);
 assert.ok(parts.every(p=>p.length<=1800&&!/[\uD800-\uDBFF]$/.test(p)));
});
test('试学课同时包含原文、图解、全部题目和唯一完成勾选',()=>{
 const sources=[{text:'原文'.repeat(2200),label:'来源',prompt:'问题',start:1,end:2,url:'https://www.notion.so/example'}];
 const blocks=lessonBlocks(lessons[0],sources);
 assert.equal(blocks.filter(b=>b.type==='toggle').length,8);
 assert.equal(blocks.filter(b=>b.type==='to_do').length,1);
 assert.equal(plain(blocks.find(b=>b.type==='quote').quote.rich_text),sources[0].text);
 assert.ok(blocks.some(b=>b.type==='image'));
 assert.ok(blocks.length<=100);
});
