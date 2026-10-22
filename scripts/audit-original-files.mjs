import fs from 'node:fs';
import crypto from 'node:crypto';
import pathModule from 'node:path';
import {spawnSync} from 'node:child_process';
import {createNotionClient} from './notion-client.mjs';
const c=createNotionClient(),uploads=JSON.parse(fs.readFileSync('.local/original-uploads.json','utf8'));
const file='.local/original-file-audit.json',report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{files:[]};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [path,p] of Object.entries(uploads)){
 if(report.files.some(x=>x.id===p.id))continue;
 const b=await c.api('GET','/blocks/'+p.id),url=b.file?.[b.file.type]?.url;if(!url)throw Error('附件下载地址不可读');
 const r=await fetch(url,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('附件下载失败 HTTP'+r.status);
 const bytes=Buffer.from(await r.arrayBuffer()),hash=sha(bytes);let comparison='sha256-exact';
 if(hash!==sha(fs.readFileSync(path))){
  // Rebuilding a PDF/ZIP changes IDs/timestamps, not the preserved pages/entries.
  const dir='../.codex-reading/original-attachments/verified-cloud';fs.mkdirSync(dir,{recursive:true});const downloaded=pathModule.join(dir,pathModule.basename(path));fs.writeFileSync(downloaded,bytes);
  const python=process.env.LEARNING_PYTHON||'C:/Users/wenhu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
  const test=spawnSync(python,['scripts/verify-original-container.py',path,downloaded],{encoding:'utf8',windowsHide:true});
  if(test.status!==0)throw Error('附件内容回读不一致：'+test.stderr.slice(0,300));comparison='container-content-exact';
 }
 report.files.push({id:p.id,bytes:bytes.length,sha256:hash,comparison});fs.writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({verifiedFiles:report.files.length}));
}
report.completedAt=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({complete:true,files:report.files.length}));
