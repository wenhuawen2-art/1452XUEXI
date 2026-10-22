export const parentId='400e722b7e15802d9111decadde03688';
export const dateBjt=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const dayMarker=n=>'第'+String(n).padStart(3,'0')+'天';
export function selectNext(pages,today){
 const coursePages=pages.map(p=>({...p,number:Number(p.title.match(/第(\d{3})天/)?.[1]||0)})).filter(p=>p.number>=1&&p.number<=168).sort((a,b)=>b.number-a.number||String(b.created_time).localeCompare(String(a.created_time)));
 const latest=coursePages[0];
 if(!latest)return {action:'create',number:1};
 if(!latest.complete)return {action:'wait',number:latest.number,reason:'当前课程未完成'};
 if(dateBjt(new Date(latest.last_edited_time||latest.created_time))>=today)return {action:'wait',number:latest.number,reason:'完成当日不推进'};
 if(latest.number>=168)return {action:'finished',number:168};
 if(coursePages.some(p=>p.number===latest.number+1))return {action:'wait',number:latest.number+1,reason:'下一课程已存在'};
 return {action:'create',number:latest.number+1};
}
