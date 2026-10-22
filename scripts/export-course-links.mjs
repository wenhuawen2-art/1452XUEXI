import fs from 'node:fs';
const index=JSON.parse(fs.readFileSync('.local/course-library.json','utf8'));
if(Object.values(index.lessons).filter(x=>x.verified).length!==168)throw Error('课程未全部同步');
fs.writeFileSync('content/course-links.json',JSON.stringify({root:'https://www.notion.so/'+index.root.replaceAll('-',''),days:Object.fromEntries(Object.entries(index.lessons).map(([n,p])=>[n,'https://www.notion.so/'+p.id.replaceAll('-','')]))},null,2)+'\n');
