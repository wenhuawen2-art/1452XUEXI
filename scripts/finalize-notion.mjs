import {createNotionClient,para,heading,plain} from './notion-client.mjs';
import {parentId} from './notion-core.mjs';
import {validateRelease} from './release.mjs';
import courseLinks from '../content/course-links.json' with {type:'json'};
const release=validateRelease(),start=process.argv[2];
if(!/^\d{4}-\d{2}-\d{2}$/.test(start||''))throw Error('需指定开课日期');
const c=createNotionClient(),nav=(await c.childPages(parentId)).find(p=>p.title==='八本书学习导航');
if(!nav)throw Error('导航不存在');
const blocks=await c.children(nav.id);
for(const b of blocks.filter(b=>b.type==='paragraph'&&plain(b.paragraph.rich_text).startsWith('正式开课日期将在'))){
 await c.api('PATCH','/blocks/'+b.id,{paragraph:para('全168课、6套阶段测验与原文附件已建立。第1学习日：'+start+'；每天北京时间07:00准备，07:30和08:15补检。未完成不推进；完成后次日继续。').paragraph});
}
if(!blocks.some(b=>b.type==='heading_2'&&plain(b.heading_2.rich_text)==='完整交付与使用方法'))await c.api('PATCH','/blocks/'+nav.id+'/children',{children:[heading('完整交付与使用方法'),para('完整课程（按24周排列，含原文节选）：'+courseLinks.root),para('手机网页：https://wenhuawen2-art.github.io/1452XUEXI/'),para('原文书库：120个文字分卷，20个原版图文附件。巴菲特PDF按页无损分卷；埃尔德EPUB按原文顺序分4册；MOBI在ZIP中。全文与私人笔记仅保留在本Notion及本地。'),para('每天先打开正式日课，按阅读任务读节选及原文，再学讲解、看图解、闭卷答8题，按标准做练习；至少6/8题并完成作业后才勾选。需要更多时间就顺延，不追赶、不跳课。'),para('预习页和正式日课用途不同：预习页可随时阅读，不推动进度；只有“学习日记”直属、标题带“第001天”等编号的正式页面用于云端推进。网页记录是本机辅助记录，可下载与恢复，不冒充Notion云端状态。'),para('六阶段测验每套20题，至少16题达标。结业项目需按评分表答辩与修订，不要求真实资金交易。'),para('故障补发：GitHub仓库→Actions→Push daily Notion lesson→Run workflow→push。重复执行先检查已有页，不重复创建；权限错误会停止并报告失败。'),para('课程内容校验：'+release.hash)]});
const read=await c.children(nav.id);if(!read.some(b=>b.type==='paragraph'&&plain(b.paragraph.rich_text).includes(courseLinks.root)))throw Error('导航回读失败');
console.log(JSON.stringify({url:'https://www.notion.so/'+nav.id.replaceAll('-',''),start,verified:true}));
