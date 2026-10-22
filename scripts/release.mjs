import crypto from 'node:crypto';
import fs from 'node:fs';
import {catalog} from '../content/curriculum.mjs';
import links from '../content/book-source-links.json' with {type:'json'};
export const contentHash=()=>crypto.createHash('sha256').update(JSON.stringify({catalog,links})).digest('hex');
export function validateRelease(){
 const report=JSON.parse(fs.readFileSync(new URL('../content/release.json',import.meta.url),'utf8'));
 if(report.hash!==contentHash()||report.lessons!==168||report.verifiedNotionLessons!==168||report.originalAttachments!==20)throw Error('课程尚未完整验收，或内容变更后尚未重新验收');
 return report;
}
if(process.argv.includes('--seal')){
 const course=JSON.parse(fs.readFileSync('.local/course-library.json','utf8'));
 const readings=JSON.parse(fs.readFileSync('.local/all-readings-audit.json','utf8'));
 const uploads=JSON.parse(fs.readFileSync('.local/original-uploads.json','utf8'));
 const finalAudit=JSON.parse(fs.readFileSync('.local/course-final-audit.json','utf8'));
 const fileAudit=JSON.parse(fs.readFileSync('.local/original-file-audit.json','utf8'));
 if(Object.values(course.lessons).filter(x=>x.verified).length!==168||Object.keys(course.exams).length!==6||Object.values(uploads).filter(x=>x.verified).length!==20)throw Error('Notion课程/测验/原版附件尚未全部验证');
 if(readings.days?.length!==168||readings.days.some(x=>!x.hash||!x.characters))throw Error('原文审计尚未通过');
 if(finalAudit.days.length!==168||finalAudit.exams.length!==6||!finalAudit.completedAt)throw Error('完整课程与测验最终回读尚未通过');
 if(fileAudit.files.length!==20||!fileAudit.completedAt)throw Error('原版附件下载核对尚未通过');
 const report={hash:contentHash(),sealedAt:new Date().toISOString(),lessons:168,questions:1344,chapterUnits:201,stageQuestions:120,verifiedNotionLessons:168,originalAttachments:20};
 fs.writeFileSync('content/release.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
