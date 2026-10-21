import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog} from '../content/curriculum.mjs';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
fs.mkdirSync(dist,{recursive:true});
for(const file of ['index.html','style.css','app.js','favicon.svg']) fs.copyFileSync(path.join(root,'web',file),path.join(dist,file));
fs.writeFileSync(path.join(dist,'data.json'),JSON.stringify(catalog));
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
const diagramDir=path.join(dist,'diagrams');fs.mkdirSync(diagramDir,{recursive:true});
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
for(const lesson of catalog.lessons){
 const items=(lesson.diagram.kind==='table'?lesson.diagram.items.map(x=>x[0]):lesson.diagram.items).slice(0,4);
 const width=1200,height=220+items.length*105;
 const rows=items.map((s,i)=>`<rect x="90" y="${150+i*105}" width="1020" height="74" rx="18" fill="${i%2?'#e5efe9':'#f7f2e5'}"/><circle cx="145" cy="${187+i*105}" r="22" fill="#24534b"/><text x="145" y="${195+i*105}" text-anchor="middle" font-size="22" fill="#fff">${i+1}</text><text x="200" y="${197+i*105}" font-size="25" fill="#173c36">${xml(String(s).slice(0,36))}</text>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" rx="28" fill="#fffdf8"/><text x="90" y="75" font-size="20" fill="#9b7947">第 ${String(lesson.number).padStart(3,'0')} 天 · ${xml(lesson.type)}</text><text x="90" y="118" font-size="32" font-weight="bold" fill="#173c36">${xml(lesson.title)}</text>${rows}</svg>`;
 await sharp(Buffer.from(svg)).png().toFile(path.join(diagramDir,`day-${String(lesson.number).padStart(3,'0')}.png`));
}
console.log('Built',catalog.lessons.length,'lessons to',dist);
