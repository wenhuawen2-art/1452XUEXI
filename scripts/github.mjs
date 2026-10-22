import {spawnSync} from 'node:child_process';
const origin='https://github.com';
export function credential(){
 if(process.env.GITHUB_TOKEN)return {password:process.env.GITHUB_TOKEN};
 const r=spawnSync('git',['credential','fill'],{input:`protocol=https\nhost=github.com\n\n`,encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},timeout:15000});
 if(r.status!==0)return null;
 return Object.fromEntries(r.stdout.trim().split('\n').map(s=>{let i=s.indexOf('=');return[s.slice(0,i),s.slice(i+1)]}));
}
export async function github(path,{method='GET',body}={}){
 const c=credential();if(!c?.password)throw Error('GitHub credential unavailable; sign in with Git Credential Manager.');
 const r=await fetch(`https://api.github.com${path}`,{method,headers:{Authorization:`Bearer ${c.password}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 if(!r.ok)throw Error(`GitHub ${method} ${path}: ${r.status} ${(await r.text()).slice(0,500)}`);
 return r.status===204?{}:r.json();
}
if(process.argv[2]==='status'){
 try{const u=await github('/user'); const r=await github('/repos/wenhuawen2-art/1452XUEXI');console.log(JSON.stringify({login:u.login,name:u.name,public:r.private===false,permissions:r.permissions,default_branch:r.default_branch}));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
