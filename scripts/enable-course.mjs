import fs from 'node:fs';
import crypto from 'node:crypto';
import {github} from './github.mjs';
import {validateRelease} from './release.mjs';
import {catalog} from '../content/curriculum.mjs';
import {dateBjt} from './notion-core.mjs';
const release=validateRelease(),repo='/repos/wenhuawen2-art/1452XUEXI';
const date=process.argv[2]||dateBjt(new Date(Date.now()+86400000));
if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<=dateBjt())throw Error('开课日须为验收后次日或更晚');
const response=await fetch('https://wenhuawen2-art.github.io/1452XUEXI/data.json?acceptance='+Date.now());
if(!response.ok)throw Error('公开网页尚不可用');
const data=await response.json();
const publicCatalog=Object.fromEntries(Object.keys(catalog).map(k=>[k,data[k]]));
const hash=crypto.createHash('sha256').update(JSON.stringify({catalog:publicCatalog,links:data.sourceLinks})).digest('hex');
if(hash!==release.hash)throw Error('公网课程还不是已验收版本，保持推送关闭');
async function variable(name,value){
 let exists=true;try{await github(repo+'/actions/variables/'+name)}catch(e){if(!e.message.includes('404'))throw e;exists=false}
 await github(repo+'/actions/variables'+(exists?'/'+name:''),{method:exists?'PATCH':'POST',body:{name,value}});
 const read=await github(repo+'/actions/variables/'+name);if(read.value!==value)throw Error('仓库变量回读失败');
}
await variable('COURSE_START_DATE',date);await variable('ENABLE_NOTION_PUSH','true');
const workflow=await github(repo+'/actions/workflows/daily-notion.yml');if(workflow.state!=='active')throw Error('每日工作流未启用');
const result={enabled:true,startDate:date,timeZone:'Asia/Shanghai',checks:['07:00','07:30','08:15'],hash};
fs.writeFileSync('.local/cloud-start.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
