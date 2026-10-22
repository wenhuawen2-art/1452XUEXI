import {lessons} from '../content/curriculum.mjs';
import {parentId,dateBjt,dayMarker,selectNext} from './notion-core.mjs';
import {createNotionClient,para,heading,plain,titleOf} from './notion-client.mjs';
import {lessonBlocks,verifyLesson} from './notion-content.mjs';
import {getSources} from './notion-sources.mjs';

const parent=process.env.NOTION_PARENT_ID||parentId;
const site=process.env.SITE_URL||'https://wenhuawen2-art.github.io/1452XUEXI/';
const mode=process.argv.includes('--check')?'check':process.argv.includes('--sample')?'sample':'push';
const client=createNotionClient();
async function ensureNav(pages){
 let nav=pages.find(x=>x.title==='八本书学习导航');if(nav)return nav;
 return client.createPage(parent,'八本书学习导航',[heading('168天学习入口'),para('24周：每周四天新课、一天案例、一天练习、一天复盘。每课包含原文精读、讲解、图解、自测与作业。'),para('手机网页：'+site),para('完整原书在同级“原文书库”，需登录本人的 Notion。每日课程会引用相关原文节选。'),para('正式开课日期将在内容验收后确定。目前首周可试学，后续课程仍在扩写；每日自动推送未启用。'),para('正式推进以每日页面“已完成”勾选为准。当天完成，次日继续；漏学保留当前课。网页本机记录不会自动同步到 Notion。')],'📚');
}
async function run(){
 const root=await client.api('GET','/pages/'+parent);
 if(titleOf(root)!=='学习日记')throw Error('目标父页标题不符');
 const pages=await client.childPages(parent);
 if(mode==='check'){console.log(JSON.stringify({ok:true,parentTitle:titleOf(root),childPages:pages.length,libraryReady:pages.some(x=>x.title==='原文书库'),scheduleChanged:false}));return}
 if(mode==='sample'){
  const lesson=lessons[0],sources=await getSources(client,parent,1);
  let page=pages.find(x=>x.title.includes('｜试学D001｜'));
  const existed=Boolean(page);
  if(!page){await ensureNav(pages);page=await client.createPage(parent,dateBjt()+'｜试学D001｜格雷厄姆与段永平相关｜'+lesson.title,lessonBlocks(lesson,sources,site))}
  if(existed){
   const blocks=await client.children(page.id);
   for(const [name,text] of lesson.deepDive.sections){
    if(blocks.some(b=>b.type==='heading_2'&&plain(b.heading_2.rich_text)===name))continue;
    const preceding=lesson.deepDive.sections.slice(0,lesson.deepDive.sections.findIndex(s=>s[0]===name)).map(s=>s[1]);
    const anchor=blocks.filter(b=>b.type==='paragraph'&&preceding.includes(plain(b.paragraph.rich_text))).at(-1);
    if(!anchor)throw Error('试学页结构已变化，未插入讲解');
    await client.api('PATCH','/blocks/'+page.id+'/children',{after:anchor.id,children:[heading(name),para(text)]});
   }
  }
  const verified=await verifyLesson(client,page.id,lesson,sources);
  console.log(JSON.stringify({mode,created:!existed,verified,url:'https://www.notion.so/'+page.id.replaceAll('-',''),countsAsOfficialProgress:false}));return;
 }
 const coursePages=pages.filter(x=>/第\d{3}天/.test(x.title)).sort((a,b)=>Number(b.title.match(/第(\d{3})天/)[1])-Number(a.title.match(/第(\d{3})天/)[1]));
 const seen=new Set();for(const p of coursePages){const n=p.title.match(/第(\d{3})天/)[1];if(seen.has(n))throw Error('发现重复课程编号，停止自动推进');seen.add(n)}
 if(coursePages.length){
  const page=coursePages[0],blocks=await client.children(page.id),checks=blocks.filter(x=>x.type==='to_do'&&plain(x.to_do.rich_text).startsWith('已完成：'));
  if(checks.length!==1)throw Error('已有课程缺少唯一完成勾选');
  page.complete=checks[0].to_do.checked;page.last_edited_time=checks[0].last_edited_time;
  if(blocks.length<25)throw Error('已有课程可能不完整，未创建下一课');
 }
 const decision=selectNext(pages,dateBjt());
 if(decision.action!=='create'){console.log(JSON.stringify({decision}));return}
 const lesson=lessons[decision.number-1];
 if(!lesson?.publishReady)throw Error('该日内容尚未扩写并审核，未推送提纲');
 const sources=await getSources(client,parent,lesson.number);
 await ensureNav(pages);
 const created=await client.createPage(parent,dateBjt()+'｜'+dayMarker(lesson.number)+'｜'+lesson.books+'｜'+lesson.title,lessonBlocks(lesson,sources,site));
 const verified=await verifyLesson(client,created.id,lesson,sources);
 console.log(JSON.stringify({created:true,day:lesson.number,verified,url:created.url}));
}
run().catch(error=>{console.error(error.message);process.exitCode=1});
