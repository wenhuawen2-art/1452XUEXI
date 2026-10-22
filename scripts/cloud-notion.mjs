import {github} from './github.mjs';
const repo='/repos/wenhuawen2-art/1452XUEXI';
const mode=process.argv[2]||'status';
if(mode==='status'){
 const runs=await github(repo+'/actions/workflows/daily-notion.yml/runs?per_page=5');
 console.log(JSON.stringify(runs.workflow_runs.map(r=>({id:r.id,status:r.status,result:r.conclusion,head:r.head_sha,url:r.html_url}))));
}else{
 if(!['check','sample'].includes(mode))throw Error('Only check/sample dispatches are allowed by this utility');
 await github(repo+'/actions/workflows/daily-notion.yml/dispatches',{method:'POST',body:{ref:'main',inputs:{mode}}});
 console.log(JSON.stringify({dispatched:mode,scheduleEnabled:false}));
}
