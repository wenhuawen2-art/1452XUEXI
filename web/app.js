const data=await fetch('./data.json').then(r=>r.json());
const KEY='1452xuexi-v1';
let state;
try{state=JSON.parse(localStorage.getItem(KEY))||{}}catch{state={}}
state.done||=[];state.answers||={};state.theme||='light';state.font||=16;
let view=new URL(location.href).searchParams.has('day')?'lesson':'home';
let selected=Number(new URL(location.href).searchParams.get('day'))||1;
const app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const lessonAt=n=>data.lessons[Math.max(0,Math.min(167,n-1))];
const next=()=>data.lessons.find(x=>!state.done.includes(x.number))?.number||168;
const tabs=[['home','今日','⌂'],['plan','计划','▦'],['map','框架','◇'],['search','搜索','⌕'],['books','书籍','▤']];

function frame(body){
 document.body.classList.toggle('dark',state.theme==='dark');
 document.documentElement.style.setProperty('--font',state.font+'px');
 app.innerHTML=`<div class="shell"><aside class="side"><div class="brand">把八本书<br>读成一套方法<small>168 DAYS · 24 WEEKS</small></div><nav class="nav">${tabs.map(([id,title])=>`<button data-view="${id}" class="${view===id?'active':''}">${title}</button>`).join('')}</nav><div class="side-note">原创教学课程 · 非投资建议<br>本机记录只保存在此浏览器，<br>不与 Notion 勾选自动同步。</div></aside><main class="main"><div class="top"><div class="eyebrow">LEARNING JOURNAL / 2026</div><div class="tools"><button class="icon-btn" data-action="font" aria-label="调整字号">A${state.font}</button><button class="icon-btn" data-action="theme" aria-label="切换主题">${state.theme==='dark'?'☀':'☾'}</button></div></div>${body}</main><nav class="bottom-nav">${tabs.map(([id,title,icon])=>`<button data-view="${id}" class="${view===id?'active':''}"><b>${icon}</b>${title}</button>`).join('')}</nav></div>`;
}
function home(){
 const n=next(),cur=lessonAt(n),w=data.weeks[cur.week-1],pct=Math.round(state.done.length/168*100);
 frame(`<section class="hero"><div class="eyebrow" style="color:#f0c87b">从看懂，到会用</div><h1>每天 30—45 分钟，<br>把知识变成判断力。</h1><p>八本书并行，六条知识主线。每天一个可讲清的概念或任务；每周四天新课、一天案例、一天练习、一天复盘。</p><div class="hero-row"><button class="gold" data-day="${n}">进入第 ${String(n).padStart(3,'0')} 天 →</button><span class="hero-stat">本机完成 ${state.done.length} / 168 天</span></div></section><div class="notice">目前是公开试学版：首周为深入样课，第2—24周已有提纲、案例解析和练习，但仍需逐章校对与扩写。每日 Notion 推送尚未启用。</div><h2 class="section-title">你现在走到这里</h2><div class="grid"><div class="card"><div class="number">TODAY · DAY ${String(n).padStart(3,'0')}</div><h3>${esc(cur.title)}</h3><p>${esc(cur.books)} · ${esc(cur.type)}</p></div><div class="card"><div class="number">WEEK ${String(cur.week).padStart(2,'0')}</div><h3>${esc(w.title)}</h3><p>${esc(w.track)} · ${esc(w.reading)}</p></div><div class="card"><div class="number">LOCAL PROGRESS</div><h3>${pct}% 完成</h3><div class="bar"><span style="width:${pct}%"></span></div><p style="margin-top:10px">自测至少答对 2 题并完成练习，才可记为完成。</p></div></div><div class="notice">网页完成状态只记录在这台设备。正式每日推进以 Notion“已完成”勾选为准；当前公开课程可自行阅读，不代表云端已开始推送。</div><h2 class="section-title">本周 7 天</h2><div class="grid">${data.lessons.filter(x=>x.week===cur.week).map(x=>`<button class="result" data-day="${x.number}"><span class="number">DAY ${String(x.number).padStart(3,'0')} · ${esc(x.type)}</span><strong>${esc(x.title)}</strong><small>${state.done.includes(x.number)?'✓ 本机已完成':'建议30—45分钟'}</small></button>`).join('')}</div><div class="download-row"><button class="ghost" data-action="download-data">下载全部课程资料 JSON</button><button class="ghost" data-action="download-record">下载本机学习记录</button></div>`);
}
function diagram(d){
 if(d.kind==='table')return `<div class="table-wrap"><table class="case-table"><tbody>${d.items.map(x=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td></tr>`).join('')}</tbody></table></div>`;
 return `<div class="diagram" role="img" aria-label="知识流程图">${d.items.map((x,i)=>`${i?'<span class="arrow">→</span>':''}<div class="node">${esc(x)}</div>`).join('')}</div>`;
}
function lesson(){
 const x=lessonAt(selected),rec=state.answers[selected]||{responses:[],graded:[],exercise:''};
 history.replaceState(null,'','?day='+selected);
 const deeper=x.deepDive?`<h2>深入讲解与引导</h2>${x.deepDive.sections.map(s=>`<h3>${esc(s[0])}</h3><p>${esc(s[1])}</p>`).join('')}`:'';
 const quiz=x.quiz.map((q,i)=>`<div class="quiz"><b>${i+1}. ${esc(q.q)}</b><textarea class="write-box" data-response="${i}" placeholder="先写自己的理解…">${esc(rec.responses?.[i]||'')}</textarea><button class="pill" data-answer="${i}">展开参考答案</button><div class="answer" id="answer-${i}" hidden>${esc(q.a)}</div><div class="grade"><button class="pill" data-grade="${i}" data-value="true">${rec.graded?.[i]===true?'✓ ':''}我答对了</button><button class="pill" data-grade="${i}" data-value="false">${rec.graded?.[i]===false?'✓ ':''}还不会</button></div></div>`).join('');
 frame(`<article class="lesson"><button class="ghost" data-view="plan">← 返回课程表</button><div class="meta"><span class="tag">第 ${String(x.number).padStart(3,'0')} 天</span><span class="tag">第 ${x.week} 周</span><span class="tag">${esc(x.type)}</span><span class="tag">${esc(x.track)}</span></div><h1>${esc(x.title)}</h1><p class="muted">${esc(x.books)} · 建议 ${esc(x.minutes)} 分钟</p>${x.week>1?'<div class="notice">试编课程：内容与出处仍在逐章校对，暂不作为已审定的每日推送。</div>':''}<div class="notice"><b>今天要学会：</b>${esc(x.goal)}</div><h2>先从一个场景开始</h2><div class="lead">${esc(x.lead)}</div><h2>把概念讲明白</h2><p>${esc(x.concept)}</p>${diagram(x.diagram)}<p><b>容易踩的坑：</b>${esc(x.pitfall)}</p>${deeper}<h2>把几本书连起来</h2><p>${esc(x.cross)}</p><h2>自己试一试</h2><p class="muted">先写答案，再展开参考答案并诚实自评。至少答对 2 题。</p>${quiz}<h2>今天的产出</h2><div class="action">${esc(x.exercise)}</div><textarea class="write-box" data-exercise placeholder="把练习写在这里，仅保存在本机…">${esc(rec.exercise||'')}</textarea><h2>出处与边界</h2><p>本地书目：${esc(x.reading)}</p><p class="muted">${esc(x.sourceNote)}</p>${x.reviewLinks.length?`<p>复习入口：${x.reviewLinks.map(n=>`<button class="pill" data-day="${n}">第${n}天</button>`).join(' ')}</p>`:''}<div class="footer-actions"><button class="primary" data-action="complete">${state.done.includes(x.number)?'✓ 本机已完成':'完成自测与练习，记为本机完成'}</button><button class="ghost" data-day="${Math.min(168,x.number+1)}">下一课 →</button></div><p class="progress-note">本机完成状态与 Notion 云端进度分开。未完成练习请不要勾选。</p></article>`);
}
function plan(){
 frame(`<h1 class="section-title">24 周课程计划</h1><p class="muted">168 个学习日，每周固定 4 新课 + 1 案例 + 1 练习 + 1 复习。日期不预填，漏学不跳课。</p><div class="week-list">${data.weeks.map(w=>{const days=data.lessons.filter(x=>x.week===w.number);return `<section class="week"><div class="number">WEEK ${String(w.number).padStart(2,'0')} · ${esc(w.track)}</div><h3>${esc(w.title)}</h3><p>${esc(w.reading)}</p><div class="days">${days.map(x=>`<button data-day="${x.number}" class="${state.done.includes(x.number)?'done':''}" title="${esc(x.title)}">${x.weekday}</button>`).join('')}</div><p style="margin-top:8px">1—4 新课 · 5 案例 · 6 练习 · 7 复习</p></section>`}).join('')}</div>`);
}
function map(){frame(`<h1 class="section-title">六条知识主线</h1><p class="muted">点开主线，沿周主题进入课程。心理影响判断，财报支持估值，周期改变风险；交易另有方法。</p>${data.tracks.map(t=>`<details class="track-card"><summary>${esc(t)}</summary><ul>${data.weeks.filter(w=>w.track===t).map(w=>`<li><button class="pill" data-day="${(w.number-1)*7+1}">第${w.number}周 · ${esc(w.title)}</button></li>`).join('')}</ul></details>`).join('')}<div class="notice">建议学习顺序：认知 → 财报 → 企业质量 → 估值 → 周期；交易作为单独方法，风险纪律贯穿全程。</div>`)}
function searchResults(){const q=document.querySelector('#query').value.trim().toLowerCase();const list=q?data.lessons.filter(x=>(x.title+x.concept+x.books+x.track).toLowerCase().includes(q)).slice(0,40):data.lessons.filter(x=>x.type==='新课').slice(0,12);document.querySelector('#results').innerHTML=list.length?list.map(x=>`<button class="result" data-day="${x.number}"><span class="number">DAY ${String(x.number).padStart(3,'0')} · ${esc(x.track)}</span><strong>${esc(x.title)}</strong><small>${esc(x.concept).slice(0,90)}…</small></button>`).join(''):'没有找到；换一个关键词试试。'}
function search(){frame(`<h1 class="section-title">找一个概念</h1><input class="search" id="query" placeholder="试试：现金流、安全边际、损失厌恶…" autocomplete="off"><div id="results" class="results"></div>`);document.querySelector('#query').addEventListener('input',searchResults);searchResults()}
function books(){frame(`<h1 class="section-title">八本书，各有职责</h1><p class="muted">不是八条孤立的阅读线。每本书在知识地图里承担一个角色；章节出处在每天课程底部。</p><div class="book-grid">${data.books.map(b=>`<section class="book" style="--book:${esc(b.color)}"><small>${esc(b.author)}</small><h3>${esc(b.title)}</h3><p><b>${esc(b.role)}</b></p><p>${esc(b.note)}</p><p style="margin-top:12px">关联周：${b.weeks.map(n=>`<button class="pill" data-day="${(n-1)*7+1}">${n}</button>`).join(' ')}</p></section>`).join('')}</div><h2 class="section-title">可核对的补充资料</h2>${data.references.map(r=>`<p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a><br><small class="muted">${esc(r.why)}</small></p>`).join('')}`)}
function render(){if(view==='home')home();else if(view==='lesson')lesson();else if(view==='plan')plan();else if(view==='map')map();else if(view==='search')search();else books()}
function download(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
app.addEventListener('input',e=>{if(view!=='lesson')return;const rec=state.answers[selected]||{responses:[],graded:[],exercise:''};if(e.target.dataset.response!==undefined)rec.responses[Number(e.target.dataset.response)]=e.target.value;else if(e.target.dataset.exercise!==undefined)rec.exercise=e.target.value;else return;state.answers[selected]=rec;save()});
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view){view=b.dataset.view;render();scrollTo(0,0)}
 else if(b.dataset.day){selected=Number(b.dataset.day);view='lesson';render();scrollTo(0,0)}
 else if(b.dataset.answer!==undefined){const panel=document.querySelector('#answer-'+b.dataset.answer);panel.hidden=!panel.hidden;b.textContent=panel.hidden?'展开参考答案':'收起参考答案'}
 else if(b.dataset.grade!==undefined){const i=Number(b.dataset.grade),rec=state.answers[selected]||{responses:[],graded:[],exercise:''};if(!rec.responses?.[i]?.trim()){alert('请先写下自己的答案，再自评。');return}rec.graded[i]=b.dataset.value==='true';state.answers[selected]=rec;save();b.parentElement.querySelectorAll('button').forEach(x=>x.textContent=x.dataset.value==='true'?'我答对了':'还不会');b.textContent='✓ '+b.textContent}
 else if(b.dataset.action==='theme'){state.theme=state.theme==='dark'?'light':'dark';save();render()}
 else if(b.dataset.action==='font'){state.font=state.font>=20?14:state.font+2;save();render()}
 else if(b.dataset.action==='complete'){if(!state.done.includes(selected)){const r=state.answers[selected];if(!r||r.graded?.filter(Boolean).length<2||!r.exercise?.trim()){alert('先完成练习，并在三道自测中诚实自评至少答对两题。');return}state.done.push(selected);state.done.sort((a,b)=>a-b);save()}render()}
 else if(b.dataset.action==='download-data')download('八本书168天课程.json',data);
 else if(b.dataset.action==='download-record')download('我的本机学习记录.json',{exportedAt:new Date().toISOString(),done:state.done,answers:state.answers,note:'仅为本机记录，不代表Notion云端进度'});
});
window.addEventListener('scroll',()=>{if(view==='lesson'){state.position={day:selected,y:scrollY};save()}},{passive:true});
render();if(view==='lesson'&&state.position?.day===selected)setTimeout(()=>scrollTo(0,state.position.y),80);
