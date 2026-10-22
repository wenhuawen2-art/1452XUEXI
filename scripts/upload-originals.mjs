import fs from 'node:fs';
import path from 'node:path';
import {loadNotionToken} from './local-token.mjs';
import {createNotionClient,para,plain,richText} from './notion-client.mjs';
import links from '../content/book-source-links.json' with {type:'json'};
const files=JSON.parse(fs.readFileSync('../.codex-reading/original-attachments/manifest.json','utf8'));
const checkpoint='.local/original-uploads.json';
const report=fs.existsSync(checkpoint)?JSON.parse(fs.readFileSync(checkpoint,'utf8')):{};
const client=createNotionClient(),token=loadNotionToken();
async function run(){
 for(const [index,f] of files.entries()){
  if(report[f.path]?.verified)continue;
  const bookId=links[f.bookId].url.split('/').at(-1),filename=path.basename(f.path);
  const existing=(await client.children(bookId)).find(b=>b.type==='file'&&b.file.caption?.some(t=>(t.plain_text||t.text?.content||'').includes(filename)));
  let block=existing;
  if(!block){
   const upload=await client.api('POST','/file_uploads',{mode:'single_part',filename,content_type:f.mime});
   const form=new FormData();form.append('file',new Blob([fs.readFileSync(f.path)],{type:f.mime}),filename);
   const response=await fetch('https://api.notion.com/v1/file_uploads/'+upload.id+'/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Notion-Version':'2022-06-28'},body:form,signal:AbortSignal.timeout(120000)});
   if(!response.ok)throw Error('上传 '+filename+' HTTP '+response.status+' '+(await response.text()).slice(0,500));
   const sent=await response.json();if(sent.status!=='uploaded')throw Error('文件上传尚未完成');
   const created=await client.api('PATCH','/blocks/'+bookId+'/children',{children:[{object:'block',type:'file',file:{type:'file_upload',file_upload:{id:upload.id},caption:richText(f.label+'｜'+filename)}}]});
   block=created.results[0];
  }
  const verified=await client.api('GET','/blocks/'+block.id);
  if(verified.type!=='file'||!verified.file?.[verified.file.type]?.url)throw Error('附件回读失败');
  report[f.path]={id:block.id,verified:true,bytes:fs.statSync(f.path).size,at:new Date().toISOString()};fs.writeFileSync(checkpoint,JSON.stringify(report,null,2));
  console.log(JSON.stringify({attachment:index+1,total:files.length,book:f.bookId,verified:true}));
 }
 console.log(JSON.stringify({complete:true,attachments:Object.keys(report).length}));
}
run().catch(e=>{console.error(e.message);process.exitCode=1});
