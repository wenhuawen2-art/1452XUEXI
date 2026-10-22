import {github} from './github.mjs';
const path='/repos/wenhuawen2-art/1452XUEXI/actions/workflows/daily-notion.yml';
const workflow=await github(path);
if(workflow.state==='disabled_inactivity'){
 await github(path+'/enable',{method:'PUT'});console.log('Recovered inactivity-disabled daily scheduler.');
}else if(workflow.state!=='active')throw Error('Daily scheduler is '+workflow.state+'; manual intervention required.');
else console.log('Daily scheduler active; no change.');
const runs=await github(path+'/runs?per_page=10');
const recent=runs.workflow_runs.find(r=>r.event==='schedule'&&r.status==='completed');
if(recent&&['failure','timed_out','action_required'].includes(recent.conclusion))throw Error('Latest scheduled run did not succeed: '+recent.html_url);
