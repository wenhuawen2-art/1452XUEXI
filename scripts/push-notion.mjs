import fs from 'node:fs';
import {lessons} from '../content/curriculum.mjs';
import {parentId,dateBjt,dayMarker,selectNext} from './notion-core.mjs';

const token=process.env.NOTION_TOKEN;
const parent=process.env.NOTION_PARENT_ID||parentId;
const site=process.env.SITE_URL||'https://wenhuawen2-art.github.io/1452XUEXI/';
if(!token){console.error('NOTION_TOKEN 未配置；未创建任何页面。');process.exit(2)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function api(method,url,body){
 for(let attempt=0;attempt<4;attempt++){
  const res=await fetch('https://api.notion.com/v1'+url,{method,headers:{Authorization:'Bearer '+token,'Notion-Version':'2022-06-28','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(res.ok)return res.json();
  const txt=await res.text();
  if((res.status===429||res.status>=500)&&attempt<3){await sleep(Math.min(15000,1000*2**attempt));continue}
  throw Error(method+' '+url+' HTTP '+res.status+' '+txt.slice(0,500));
 }
}
async function children(id){let cursor,all=[];do{const u='/blocks/'+id+'/children?page_size=100'+(cursor?'&start_cursor='+encodeURIComponent(cursor):'');const r=await api('GET',u);all.push(...r.results);cursor=r.has_more?r.next_cursor:null}while(cursor);return all}
const plain=x=>(x||[]).map(v=>v.plain_text||v.text?.content||'').join('');
const text=s=>[{type:'text',text:{content:String(s).slice(0,1900)}}];
const para=s=>({object:'block',type:'paragraph',paragraph:{rich_text:text(s)}});
const heading=s=>({object:'block',type:'heading_2',heading_2:{rich_text:text(s)}});
function titleOf(page){return plain(page.properties?.title?.title||page.properties?.Name?.title||Object.values(page.properties||{}).find(x=>x.type==='title')?.title)}
async function listPages(){const items=await children(parent);return items.filter(x=>x.type==='child_page').map(x=>({id:x.id,title:x.child_page.title,created_time:x.created_time,last_edited_time:x.last_edited_time}))}
async function completed(id){const blocks=await children(id);const checks=blocks.filter(x=>x.type==='to_do'&&plain(x.to_do.rich_text).includes('已完成'));if(checks.length!==1)throw Error('课程页面 '+id+' 缺失唯一的完成勾选，需人工检查');return {checked:checks[0].to_do.checked,editedAt:checks[0].last_edited_time,blocks}}
function lessonBlocks(l){const img=site.replace(/\/?$/,'/')+'diagrams/day-'+String(l.number).padStart(3,'0')+'.png';return [
 para('课程编号 '+l.id+' ｜ 建议学习 '+l.minutes+' 分钟 ｜ '+l.track),
 {object:'block',type:'image',image:{type:'external',external:{url:img}}},
 heading('今天要学会'),para(l.goal),heading('先从生活场景开始'),para(l.lead),
 heading('概念与图解'),para(l.concept),para('容易踩的坑：'+l.pitfall),
 heading('跨书联系'),para(l.cross),heading('三道自测'),
 ...l.quiz.map((q,i)=>({object:'block',type:'toggle',toggle:{rich_text:text((i+1)+'. '+q.q),children:[para('参考答案：'+q.a)]}})),
 heading('今天的练习'),para(l.exercise),heading('阅读出处与边界'),para(l.reading),para(l.sourceNote),
 para('手机网页版：'+site.replace(/\/?$/,'/')+'?day='+l.number),
 {object:'block',type:'to_do',to_do:{rich_text:text('已完成：自测至少答对2题，并完成练习后勾选'),checked:false}}
]}
async function ensureNav(pages){if(pages.some(x=>x.title==='八本书学习导航'))return;const body={parent:{page_id:parent},icon:{type:'emoji',emoji:'📚'},properties:{title:{type:'title',title:text('八本书学习导航')}},children:[heading('168天学习入口'),para('学习计划：24周，每周四天新课、一天案例、一天练习、一天复盘。完成勾选在每日子页面；手机网页本机记录不与此同步。'),para('手机网页：'+site),para('每天北京时间早上7点补检；未完成则保留当前课。GitHub 调度可能延迟。'),para('课程为原创教学转述，原书、个人笔记和访问凭据不在公开仓库。')]};await api('POST','/pages',body)}
async function run(){
 await api('GET','/pages/'+parent); // 提前确认目标父页在当前集成可见
 const pages=await listPages();
 const coursePages=pages.filter(x=>/第\d{3}天/.test(x.title)).sort((a,b)=>b.title.match(/第(\d{3})天/)[1]-a.title.match(/第(\d{3})天/)[1]);
 if(coursePages.length){const p=coursePages[0];const result=await completed(p.id);p.complete=result.checked;p.last_edited_time=result.editedAt;p.blockCount=result.blocks.length;if(p.blockCount<15)throw Error('已有课程页面内容可能不完整：'+p.title+'；不会重复创建')}
 const today=dateBjt();const decision=selectNext(pages,today);console.log(JSON.stringify({today,decision}));
 if(decision.action!=='create')return;
 await ensureNav(pages);
 if(pages.some(x=>x.title.includes(dayMarker(decision.number))))throw Error('同编号页面已存在，停止以避免重复');
 const l=lessons[decision.number-1];const title=today+'｜'+dayMarker(l.number)+'｜'+l.books+'｜'+l.title;
 const created=await api('POST','/pages',{parent:{page_id:parent},icon:{type:'emoji',emoji:'📖'},properties:{title:{type:'title',title:text(title)}},children:lessonBlocks(l)});
 const verify=await completed(created.id);
 if(verify.blocks.length<15||verify.checked)throw Error('Notion 回读不完整；保留页面，人工核查：'+created.id);
 console.log('SUCCESS '+title+' '+created.url);
}
run().catch(e=>{console.error(e.message);process.exitCode=1});
