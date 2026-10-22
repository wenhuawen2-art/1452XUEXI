import fs from 'node:fs';
import crypto from 'node:crypto';
import {createNotionClient} from './notion-client.mjs';
import {getSources} from './notion-sources.mjs';
import {parentId} from './notion-core.mjs';
const ids=['buffett','elder','marks','fisher','kahneman','tang','graham','duan'];
const originals=Object.fromEntries(ids.map((id,i)=>[id,fs.readFileSync(new URL('../../.codex-reading/library/book-'+(i+1)+'.txt',import.meta.url),'utf8').replace(/\r/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').split('\n')]));
const client=createNotionClient(),report=[];
for(let number=1;number<=168;number++){
 const sources=await getSources(client,parentId,number);
 for(const s of sources){
  const expected=originals[s.bookId].slice(s.start-1,s.end).join('\n');
  if(s.text!==expected)throw Error('第'+number+'天的原文回读与本地不符');
 }
 report.push({number,sources:sources.length,characters:sources.reduce((n,s)=>n+s.text.length,0),hash:crypto.createHash('sha256').update(sources.map(s=>s.text).join('\n')).digest('hex')});
 if(number%28===0)console.log(JSON.stringify({verifiedThrough:number}));
}
fs.writeFileSync(new URL('../.local/all-readings-audit.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),days:report},null,2));
console.log(JSON.stringify({complete:true,days:report.length,allOriginalRangesMatched:true,maxCharacters:Math.max(...report.map(x=>x.characters))}));
