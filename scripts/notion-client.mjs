import {loadNotionToken} from './local-token.mjs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const plain=items=>(items||[]).map(x=>x.plain_text??x.text?.content??'').join('');
export function splitText(value,max=1800){
 const text=String(value),parts=[];let start=0;
 while(start<text.length){let end=Math.min(start+max,text.length);const code=text.charCodeAt(end-1);if(end<text.length&&code>=0xD800&&code<=0xDBFF)end--;parts.push(text.slice(start,end));start=end}
 return parts.length?parts:[''];
}
export const richText=value=>splitText(value).map(content=>({type:'text',text:{content}}));
export const para=value=>({object:'block',type:'paragraph',paragraph:{rich_text:richText(value)}});
export const heading=value=>({object:'block',type:'heading_2',heading_2:{rich_text:richText(value)}});
export const titleOf=page=>plain(Object.values(page.properties||{}).find(x=>x.type==='title')?.title);
export function createNotionClient(){
 const token=loadNotionToken();let nextStart=0;
 async function api(method,url,body){
  for(let attempt=0;attempt<5;attempt++){
   const start=Math.max(Date.now(),nextStart);nextStart=start+370;await sleep(Math.max(0,start-Date.now()));
   let response;
   try{response=await fetch('https://api.notion.com/v1'+url,{method,headers:{Authorization:'Bearer '+token,'Notion-Version':'2022-06-28','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)})}
   catch{throw Error('Notion 请求结果未知，请回读后重试：'+method+' '+url)}
   if(response.ok)return response.json();
   if(response.status===429||(method==='GET'&&response.status>=500)){
    if(attempt<4){await sleep(Math.max(1000,Number(response.headers.get('retry-after')||0)*1000,1000*2**attempt));continue}
   }
   throw Error('Notion '+method+' '+url+' HTTP '+response.status);
  }
 }
 async function children(id){let cursor;const all=[];do{const result=await api('GET','/blocks/'+id+'/children?page_size=100'+(cursor?'&start_cursor='+encodeURIComponent(cursor):''));all.push(...result.results);cursor=result.has_more?result.next_cursor:null}while(cursor);return all}
 async function childPages(id){return (await children(id)).filter(x=>x.type==='child_page').map(x=>({id:x.id,title:x.child_page.title,created_time:x.created_time,last_edited_time:x.last_edited_time}))}
 async function createPage(parent,title,blocks,emoji='📖'){
  if(blocks.length>100)throw Error('创建页面超过100块限制：'+title);
  return api('POST','/pages',{parent:{page_id:parent},icon:{type:'emoji',emoji},properties:{title:{type:'title',title:richText(title)}},children:blocks});
 }
 return {api,children,childPages,createPage};
}
