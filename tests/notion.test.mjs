import test from 'node:test';import assert from 'node:assert/strict';
import {selectNext} from '../scripts/notion-core.mjs';
const time='2026-10-20T01:00:00.000Z';
test('首日创建',()=>assert.deepEqual(selectNext([],'2026-10-21'),{action:'create',number:1}));
test('漏学不重复',()=>assert.equal(selectNext([{title:'第001天',complete:false,created_time:time}],'2026-10-21').action,'wait'));
test('完成当日不推进',()=>assert.equal(selectNext([{title:'第001天',complete:true,created_time:time,last_edited_time:'2026-10-21T02:00:00Z'}],'2026-10-21').action,'wait'));
test('隔日推进',()=>assert.deepEqual(selectNext([{title:'第001天',complete:true,created_time:time,last_edited_time:time}],'2026-10-21'),{action:'create',number:2}));
test('结业停止',()=>assert.equal(selectNext([{title:'第168天',complete:true,created_time:time,last_edited_time:time}],'2026-10-21').action,'finished'));
