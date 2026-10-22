import sodium from 'libsodium-wrappers';
import {github} from './github.mjs';
import {parentId} from './notion-core.mjs';
import {loadNotionToken,saveLocalToken} from './local-token.mjs';

const token=loadNotionToken();
const response=await fetch('https://api.notion.com/v1/pages/'+parentId,{headers:{Authorization:'Bearer '+token,'Notion-Version':'2022-06-28'}});
if(!response.ok)throw Error('新的 Notion 集成无法读取父页，HTTP '+response.status);
const page=await response.json();
const title=Object.values(page.properties||{}).find(x=>x.type==='title')?.title.map(x=>x.plain_text||x.text?.content||'').join('');
if(title!=='学习日记')throw Error('目标父页标题不符，已停止设置');
await sodium.ready;
const repo='/repos/wenhuawen2-art/1452XUEXI';
const key=await github(repo+'/actions/secrets/public-key');
for(const [name,value] of Object.entries({NOTION_TOKEN:token,NOTION_PARENT_ID:parentId})){
 const encrypted=sodium.crypto_box_seal(sodium.from_string(value),sodium.from_base64(key.key,sodium.base64_variants.ORIGINAL));
 await github(repo+'/actions/secrets/'+name,{method:'PUT',body:{encrypted_value:sodium.to_base64(encrypted,sodium.base64_variants.ORIGINAL),key_id:key.key_id}});
}
const variables=await github(repo+'/actions/variables');
const exists=variables.variables.some(x=>x.name==='ENABLE_NOTION_PUSH');
await github(repo+'/actions/variables'+(exists?'/ENABLE_NOTION_PUSH':''),{method:exists?'PATCH':'POST',body:{name:'ENABLE_NOTION_PUSH',value:'false'}});
saveLocalToken(token);
console.log(JSON.stringify({parentTitle:title,parentId,secretsConfigured:['NOTION_TOKEN','NOTION_PARENT_ID'],scheduleEnabled:false,localCredential:'Windows DPAPI encrypted'}));
