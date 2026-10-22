import assert from 'node:assert/strict';
import {parentId,dateBjt,selectNext} from './notion-core.mjs';
import {createNotionClient,para,heading,richText} from './notion-client.mjs';
const client=createNotionClient(),today=dateBjt(),tomorrow=dateBjt(new Date(Date.now()+86400000));
let report=(await client.childPages(parentId)).find(p=>p.title==='联调验证记录');
if(!report)report=await client.createPage(parentId,'联调验证记录',[heading('推送程序验证记录'),para('下面的页面只用于测试，完成勾选不会影响正式课程进度。')],'🧪');
const fixture=await client.createPage(report.id,today+'｜验证运行'+new Date().toISOString().slice(11,19),[para('独立测试空间：不计入课程。')],'🧪');
const checkbox=()=>({object:'block',type:'to_do',to_do:{rich_text:richText('已完成：联调测试'),checked:false}});
const page1=await client.createPage(fixture.id,today+'｜第001天｜测试',[para('联调数据'),checkbox()]);
async function state(){
 const pages=await client.childPages(fixture.id);
 for(const page of pages){
  const checks=(await client.children(page.id)).filter(b=>b.type==='to_do');
  if(checks.length!==1)throw Error('completion-missing');
  page.complete=checks[0].to_do.checked;page.last_edited_time=checks[0].last_edited_time;
 }
 return pages;
}
const results=[];
let pages=await state();
assert.equal(selectNext(pages,today).action,'wait');results.push('漏学：保持第001天');
assert.equal((await client.childPages(fixture.id)).length,1);results.push('重复读取：未增加页面');
const check=(await client.children(page1.id)).find(b=>b.type==='to_do');
await client.api('PATCH','/blocks/'+check.id,{to_do:{checked:true}});
pages=await state();assert.equal(selectNext(pages,today).action,'wait');results.push('完成当日：不推进');
assert.deepEqual(selectNext(pages,tomorrow),{action:'create',number:2});results.push('次日：推进第002天');
await client.createPage(fixture.id,tomorrow+'｜第002天｜测试',[para('联调数据'),checkbox()]);
pages=await state();assert.equal(selectNext(pages,tomorrow).action,'wait');assert.equal(pages.length,2);results.push('第002天重复执行：无重复页面');
const partial=await client.createPage(fixture.id,tomorrow+'｜第003天｜失败补发测试',[para('模拟完成勾选尚未写入的部分页面')]);
await assert.rejects(state,/completion-missing/);
await client.api('PATCH','/blocks/'+partial.id+'/children',{children:[checkbox()]});
pages=await state();assert.equal(selectNext(pages,tomorrow).number,3);assert.equal(pages.length,3);results.push('部分写入后修复：保留原页，不重复创建');
await assert.rejects(client.api('GET','/pages/00000000-0000-0000-0000-000000000000'),/HTTP 404/);results.push('无访问权限目标：明确失败，不写入其他页面');
await client.api('PATCH','/blocks/'+fixture.id+'/children',{children:[heading('验证结果'),...results.map((text,i)=>para((i+1)+'. 通过｜'+text)),para('北京时间跨日和第168天停止另由自动测试覆盖。这里的“次日”使用独立日期输入模拟，未改变电脑或正式课程日期。')]});
console.log(JSON.stringify({passed:results.length,formalProgressChanged:false,reportUrl:'https://www.notion.so/'+fixture.id.replaceAll('-','')}));
