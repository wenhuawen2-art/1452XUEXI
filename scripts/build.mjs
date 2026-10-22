import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog} from '../content/curriculum.mjs';
import {categories} from '../content/categories.mjs';
import {validateCategories} from '../web/category-core.js';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
fs.mkdirSync(dist,{recursive:true});
for(const file of ['index.html','style.css','form.css','learning.css','app.js','category-core.js','categories.css','favicon.svg']) fs.copyFileSync(path.join(root,'web',file),path.join(dist,file));
const chapterIndex=JSON.parse(fs.readFileSync(path.join(root,'content','chapter-index.json'),'utf8'));
const sourceLinks=JSON.parse(fs.readFileSync(path.join(root,'content','book-source-links.json'),'utf8'));
const courseLinks=JSON.parse(fs.readFileSync(path.join(root,'content','course-links.json'),'utf8'));
fs.writeFileSync(path.join(dist,'data.json'),JSON.stringify({...catalog,chapterIndex,sourceLinks,courseLinks}));
validateCategories(categories);
const notionCategories=JSON.parse(fs.readFileSync(path.join(root,'content','category-notion-links.json'),'utf8'));
const categoryCatalog=categories.map(c=>{
 const course=c.id==='finance'?catalog:JSON.parse(fs.readFileSync(path.join(root,'content','categories',c.id,'data.json'),'utf8'));
 if(c.id!=='finance'){const target=path.join(dist,c.dataUrl);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(course));}
 return {...c,bookCount:course.books.length,lessonCount:course.lessons.length,weekCount:course.weeks.length,notionUrl:notionCategories[c.id]?.url};
});
fs.writeFileSync(path.join(dist,'categories.json'),JSON.stringify(categoryCatalog));
const csv=rows=>'\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
fs.writeFileSync(path.join(dist,'课程总表.csv'),csv([['学习日','周','类型','知识名称','书籍','网页','Notion预习页'],...catalog.lessons.map(l=>[l.number,l.week,l.type,l.title,l.books,'https://wenhuawen2-art.github.io/1452XUEXI/?day='+l.number,courseLinks.days[l.number]])]));
fs.writeFileSync(path.join(dist,'章节覆盖表.csv'),csv([['书籍','章节','类别','主课日','延伸日','阅读任务'],...catalog.coverage.map(c=>[c.bookId,c.title,c.role,c.coreDays.join('、'),c.assignedDays.join('、'),c.guide])]));
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
const diagramDir=path.join(dist,'diagrams');fs.mkdirSync(diagramDir,{recursive:true});
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
for(const lesson of catalog.lessons){
 const items=(lesson.diagram.kind==='table'?lesson.diagram.items.map(x=>x[0]+'｜'+x[1]):lesson.diagram.items);
 const width=1200;let y=150;
 const rows=items.map((s,i)=>{
  const chars=Array.from(String(s)),lines=[];for(let k=0;k<chars.length;k+=33)lines.push(chars.slice(k,k+33).join(''));
  const rowHeight=Math.max(82,34+lines.length*36);
  const row=`<rect x="70" y="${y}" width="1060" height="${rowHeight}" rx="16" fill="${i%2?'#e5efe9':'#f7f2e5'}"/><circle cx="116" cy="${y+rowHeight/2}" r="22" fill="#24534b"/><text x="116" y="${y+rowHeight/2+8}" text-anchor="middle" font-size="22" fill="#fff">${i+1}</text>${lines.map((line,j)=>`<text x="162" y="${y+36+j*36}" font-size="26" fill="#173c36">${xml(line)}</text>`).join('')}`;
  y+=rowHeight+18;return row;
 }).join('');
 const height=y+35;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" rx="28" fill="#fffdf8"/><text x="90" y="75" font-size="20" fill="#9b7947">第 ${String(lesson.number).padStart(3,'0')} 天 · ${xml(lesson.type)}</text><text x="90" y="118" font-size="32" font-weight="bold" fill="#173c36">${xml(lesson.title)}</text>${rows}</svg>`;
 await sharp(Buffer.from(svg)).png().toFile(path.join(diagramDir,`day-${String(lesson.number).padStart(3,'0')}.png`));
}
console.log('Built',catalog.lessons.length,'lessons to',dist);
