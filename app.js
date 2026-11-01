const $=s=>document.querySelector(s),
E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
sh=a=>[...a].sort(()=>Math.random()-.5),
K=n=>'hv:u:'+n.toLowerCase(),
hash=s=>{let h=5381;for(const c of s)h=(h*33^c.charCodeAt(0))>>>0;return h+''},
load=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
R=h=>{$('#app').innerHTML=h},
due=c=>(c.due||0)<=Date.now(),
norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(),
X='<button class="g" onclick="openSub()">Thoát</button>';
let U=null,D=null,S=null,G=null;
const API=(p,o={})=>fetch('/api/'+p,{...o,headers:{'Content-Type':'application/json',Authorization:'Bearer '+(localStorage.getItem('hv:tk')||'')}}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Lỗi kết nối');return j});
let svT;function save(){clearTimeout(svT);svT=setTimeout(()=>API('data',{method:'PUT',body:JSON.stringify(D)}).catch(()=>toast('Chưa lưu được, hãy kiểm tra mạng')),500)}
function rec(ok){const t=D.st[S]=D.st[S]||{r:0,w:0};ok?t.r++:t.w++;fx(ok);save()}
function end(t){R(`<div class="card"><h2>${t}</h2><button onclick="openSub()">Về môn học</button></div>`)}

/* Người dùng */
function login(){R(`<div class="card login"><div class="logo">🧠</div><h2>Chào mừng bạn!</h2><p class="mut">Học thuộc bài nhanh hơn, vui hơn.<br>Đăng nhập để vào kho thẻ của bạn, dùng được trên mọi thiết bị.</p><input id="n" placeholder="Tên đăng nhập" maxlength="20" autocomplete="username"><input id="p" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" maxlength="72" autocomplete="current-password" onkeydown="if(event.key==='Enter')enter('login')"><button onclick="enter('login')" style="width:100%;margin-top:8px">Đăng nhập</button><button class="g" onclick="enter('register')" style="width:100%;margin-top:10px">Tạo tài khoản mới</button></div>`)}
async function enter(m){const n=$('#n').value.trim(),p=$('#p').value;if(!n||p.length<6)return alert('Cần nhập tên và mật khẩu ít nhất 6 ký tự.');
try{const j=await API(m,{method:'POST',body:JSON.stringify({name:n,pw:p})});localStorage.setItem('hv:tk',j.token);U=j.name;D=j.data;home()}catch(e){alert(e.message)}}
function logout(){localStorage.removeItem('hv:tk');U=D=S=null;login()}

/* Màn hình chính */
function home(){S=null;daily();const ks=Object.keys(D.subs);
R(`<div class="row"><div style="flex:1"><h2>Xin chào, ${E(U)}</h2>${badge()}</div><button class="g" onclick="logout()">Đổi người dùng</button></div>
<div class="card"><div class="row"><input id="ns" placeholder="Tên môn mới (vd: Sử, Anh...)" style="flex:1;width:auto"><button onclick="addSub()">Thêm môn</button></div></div>
<div class="card"><div class="row"><button class="g" onclick="board()">🏆 Xếp hạng</button><button class="g" onclick="sample()">📚 Thêm bộ mẫu</button><button class="g" onclick="backup()">💾 Sao lưu (.json)</button><label class="g btn">📥 Nhập .json<input type="file" accept=".json" hidden onchange="restore(this)"></label></div></div><div class="grid">${ks.map((k,i)=>{const c=D.subs[k],t=D.st[k]||{r:0,w:0},n=t.r+t.w,p=n?Math.round(100*t.r/n):0;
return `<div class="card"><h3>${E(k)}</h3><div class="mut">${c.length} thẻ · ${c.filter(due).length} cần ôn</div><div class="bar"><i style="width:${p}%"></i></div><div class="mut">Đúng ${p}% (${t.r}/${n} lượt)</div><div style="margin-top:8px"><button onclick="openSub(${i})">Mở</button></div></div>`}).join('')||'<p class="mut">Chưa có môn nào. Thêm môn đầu tiên ở trên nhé.</p>'}</div>`)}
function addSub(){const n=$('#ns').value.trim();if(!n)return;if(!D.subs[n])D.subs[n]=[];save();home()}
function delSub(){if(confirm('Xóa môn '+S+' và toàn bộ thẻ?')){delete D.subs[S];delete D.st[S];save();home()}}

/* Trang môn học */
function openSub(i){if(i!=null)S=Object.keys(D.subs)[i];const c=D.subs[S];
R(`<div class="row"><button class="g" onclick="home()">← Các môn</button><h2 style="flex:1">${E(S)}</h2><button class="g" onclick="delSub()">Xóa môn</button></div>
<div class="card"><h3>Học và chơi</h3><div class="grid">${[['flash','Flashcard ôn tập'],['mc','Trắc nghiệm'],['fill','Điền đáp án'],['essay','Tự luận'],['match','Ghép cặp'],['tf','Đúng/Sai siêu tốc'],['mil','Ai là triệu phú'],['bell','Rung chuông vàng'],['boss','Đánh boss'],['bot','Đấu với máy'],['hang','Đoán chữ']].map(([k,t])=>`<button class="g" onclick="play('${k}')">${t}</button>`).join('')}</div></div>
<div class="card"><h3>Thêm thẻ</h3><input id="q" placeholder="Câu hỏi / mặt trước"><input id="a" placeholder="Đáp án / mặt sau"><button onclick="addCard()">Thêm thẻ</button>
<h3>Hoặc tải file Word (.docx)</h3><p class="mut">Mỗi dòng viết dạng "Câu hỏi - Đáp án", "Từ: nghĩa" hoặc "X là Y". Đề cương dạng "Câu 1. ..." rồi "Trả lời: ..." cũng được. File được đọc ngay trên máy bạn.</p><input type="file" accept=".docx" onchange="upload(this)"></div>
<div class="card"><h3>Thẻ (${c.length})</h3>${c.map((x,j)=>`<div class="row" style="border-top:1px solid var(--line);padding:6px 0"><div style="flex:1"><b>${E(x.q)}</b><div class="mut">${E(x.a)}</div></div><button class="g" onclick="delCard(${j})">Xóa</button></div>`).join('')||'<p class="mut">Chưa có thẻ nào. Thêm thẻ đầu tiên ở trên.</p>'}</div>`)}
function addCard(){const q=$('#q').value.trim(),a=$('#a').value.trim();if(!q||!a)return;D.subs[S].push({q,a,box:0,due:0});save();openSub()}
function delCard(j){D.subs[S].splice(j,1);save();openSub()}
async function upload(el){const f=el.files[0];if(!f)return;
if(!window.mammoth)return alert('Chưa tải được thư viện đọc Word. Hãy kiểm tra kết nối mạng.');
try{const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});
const L=r.value.split(/\n+/).map(s=>s.trim()).filter(Boolean);let n=0;
const add=(q,a)=>{D.subs[S].push({q:q.trim(),a:a.trim(),box:0,due:0});n++};
if(L.some(l=>/^Câu\s*\d+\s*[.:)]/i.test(l))){let q=null,a=[];const fl=()=>{if(q&&a.length)add(q,a.join(' '));q=null;a=[]};
for(const l of L){if(/^Câu\s*\d+\s*[.:)]/i.test(l)){fl();q=l.replace(/^Câu\s*\d+\s*[.:)]\s*/i,'')}else if(/^Ghi chú/i.test(l))continue;else if(q)a.push(l.replace(/^(Trả lời|Đáp án|Gợi ý)\s*[:：]\s*/i,''))}fl()}
else for(let i=0;i<L.length;i++){const l=L[i];let m=l.match(/^(.{2,150}?)\s*(?:[:：|]|\s[-–—]\s)\s*(.{1,400})$/);
if(m)add(m[1],m[2]);
else if(/\?$/.test(l)&&L[i+1])add(l,L[++i]);
else if(m=l.match(/^(.{2,60}?)\s+là\s+(.{3,})$/))add(m[1]+' là gì?',m[2])}
save();alert(n?`Đã thêm ${n} thẻ. Xem lại danh sách để sửa hoặc xóa thẻ sai.`:'Không tách được thẻ nào. Hãy viết mỗi dòng dạng "Câu hỏi - Đáp án".');openSub()
}catch(e){alert('Không đọc được file. Hãy dùng file .docx (không phải .doc).')}}

/* Chế độ chơi */
function play(m){const c=D.subs[S],need={mc:4,mil:4,bell:4,boss:4,bot:4,tf:3,match:3}[m]||1;
if(c.length<need)return alert(`Chế độ này cần ít nhất ${need} thẻ. Hãy thêm thẻ trước.`);
({flash,mc:()=>mc({n:10}),fill:()=>typed(0),essay:()=>typed(1),match,tf,mil:()=>mc({n:15,sudden:1,life:1}),bell:()=>mc({n:99,sudden:1}),boss:()=>mc({n:12,boss:1}),bot:()=>botPick(),hang}[m])()}

function flash(){let q=D.subs[S].filter(due);
if(!q.length)return alert('Hôm nay không có thẻ nào cần ôn. Quay lại sau nhé, hoặc chơi minigame!');
q=sh(q);let i=0;
const show=b=>{if(i>=q.length)return end('Xong lượt ôn!');const x=q[i];
R(`<div class="row">${X}<span class="mut">Thẻ ${i+1}/${q.length}</span></div><div class="card big" style="min-height:160px">${E(b?x.a:x.q)}</div>${b?'<div class="row"><button class="g" onclick="fk(0)">Quên</button><button onclick="fk(1)">Nhớ</button></div>':'<button onclick="fs()">Lật thẻ</button>'}`)};
window.fs=()=>show(1);
window.fk=ok=>{const x=q[i++];x.box=ok?Math.min(4,(x.box||0)+1):0;x.due=Date.now()+[0,1,3,7,14][x.box]*864e5;rec(ok);show(0)};
show(0)}

function opts(x){return sh([x.a,...sh(D.subs[S].filter(y=>y!==x&&y.a!==x.a)).slice(0,3).map(y=>y.a)])}
function botPick(){R(`<div class="card"><h3>Chọn độ khó của máy</h3><div class="row">${[['Dễ',.4],['Vừa',.7],['Khó',.9]].map(([t,p])=>`<button onclick="mc({n:10,bot:${p}})">${t}</button>`).join('')}</div></div>`)}
function mc(o){const c=D.subs[S];let q=sh(c).slice(0,o.n);
if(o.boss)q=[...sh(c),...sh(c),...sh(c)].slice(0,12);
let i=0,sc=0,hp=3,boss=100,bs=0,lf={a:1,b:1};
const fin=w=>end(`${w?'Hoàn thành!':'Sai rồi, kết thúc!'} Đúng ${sc}/${q.length} câu${o.bot?` · Máy đúng ${bs}${sc>bs?' → Bạn thắng!':sc<bs?' → Máy thắng':' → Hòa'}`:''}`);
const next=()=>{if(i>=q.length)return fin(1);G={x:q[i],os:opts(q[i]),hide:[]};draw()};
const draw=()=>{const{x,os,hide}=G;
R(`<div class="row">${X}<span class="mut" style="flex:1">Câu ${i+1}/${q.length} · Điểm ${sc}${o.boss?` · Tim ${'♥'.repeat(hp)}`:''}${o.bot?` · Máy ${bs}`:''}</span></div>
${o.boss?`<div class="bar"><i style="width:${Math.max(0,boss)}%;background:var(--no)"></i></div>`:''}
<div class="card big">${E(x.q)}</div><div id="os">${os.map((t,j)=>hide.includes(j)?'':`<button class="opt" onclick="pick(${j})">${E(t)}</button>`).join('')}</div>
${o.life?`<div class="row"><button class="g" ${lf.a?'':'disabled'} onclick="l50()">50:50</button><button class="g" ${lf.b?'':'disabled'} onclick="lAud()">Hỏi khán giả</button></div><div id="au" class="mut" style="margin-top:8px"></div>`:''}`)};
window.l50=()=>{if(!lf.a)return;lf.a=0;G.hide=sh(G.os.map((t,j)=>j).filter(j=>G.os[j]!==G.x.a)).slice(0,2);draw()};
window.lAud=()=>{if(!lf.b)return;lf.b=0;draw();
const v=G.os.map((t,j)=>j).filter(j=>!G.hide.includes(j)),k=v.find(j=>G.os[j]===G.x.a),p={};let r=100;
p[k]=45+(Math.random()*30|0);r-=p[k];const ot=v.filter(j=>j!==k);
ot.forEach((j,n)=>{p[j]=n==ot.length-1?r:(Math.random()*r|0);r-=p[j]});
$('#au').textContent='Khán giả chọn: '+v.map(j=>`${G.os[j]}: ${p[j]}%`).join(' · ')};
window.pick=j=>{const{x,os,hide}=G,ok=os[j]===x.a;rec(ok);
$('#os').innerHTML=os.map((t,k)=>hide.includes(k)?'':`<button class="opt ${t===x.a?'ok':k==j?'no':''}" disabled>${E(t)}</button>`).join('');
if(ok){sc++;boss-=13}else if(o.boss)hp--;
if(o.bot&&Math.random()<o.bot)bs++;
i++;
setTimeout(()=>{if(!ok&&o.sudden)return fin(0);
if(o.boss&&boss<=0)return end('Bạn đã hạ boss! 🏆');
if(o.boss&&hp<=0)return end('Boss thắng rồi. Ôn lại rồi đánh tiếp nhé!');
next()},ok?700:1600)};
next()}

function typed(essay){const q=sh(D.subs[S]).slice(0,10);let i=0,sc=0;
const show=()=>{if(i>=q.length)return end(`Xong! Đúng ${sc}/${q.length}`);
R(`<div class="row">${X}<span class="mut">Câu ${i+1}/${q.length}</span></div><div class="card big">${E(q[i].q)}</div>${essay?'<textarea id="t" rows="4" placeholder="Viết câu trả lời của bạn..."></textarea>':'<input id="t" placeholder="Gõ đáp án" autocomplete="off">'}<div id="fb"></div><button id="go" onclick="chk()">${essay?'Xem đáp án':'Kiểm tra'}</button>`);$('#t').focus()};
window.chk=()=>{const x=q[i];
if(essay){$('#fb').innerHTML=`<div class="card"><div class="mut">Đáp án mẫu</div>${E(x.a)}</div><div class="row"><button class="g" onclick="gr(0)">Chưa đúng</button><button onclick="gr(1)">Mình đúng</button></div>`;$('#go').remove();return}
const ok=norm($('#t').value)===norm(x.a);
$('#fb').innerHTML=`<div class="card" style="border-color:var(--${ok?'ok':'no'})">${ok?'Đúng rồi!':'Chưa đúng. Đáp án: '+E(x.a)}</div>`;
$('#go').outerHTML=`<button onclick="gr(${ok?1:0})">Câu tiếp</button>`};
window.gr=ok=>{sc+=ok;rec(ok);i++;show()};
show()}

function match(){const c=sh(D.subs[S]).slice(0,6);let t=[];
c.forEach((x,k)=>{t.push({k,s:x.q});t.push({k,s:x.a})});t=sh(t);let sel=null,left=c.length,miss=0;
R(`<div class="row">${X}<span class="mut">Ghép câu hỏi với đáp án đúng</span></div><div class="grid">${t.map((o,j)=>`<button class="tile" onclick="mt(${j})">${E(o.s)}</button>`).join('')}</div>`);
window.mt=j=>{const T=document.querySelectorAll('.tile'),b=T[j];
if(sel===j||b.classList.contains('done'))return;
if(sel==null){sel=j;b.classList.add('sel');return}
const a=T[sel];a.classList.remove('sel');
if(t[sel].k===t[j].k){a.classList.add('done');b.classList.add('done');rec(1);if(!--left)end('Ghép xong! Sai '+miss+' lần')}
else{miss++;rec(0)}
sel=null}}

function tf(){const c=D.subs[S];let sc=0,t=30,cur;
const draw=()=>R(`<div class="row">${X}<b style="flex:1">⏱ <span id="tm">${t}</span>s</b><b>Điểm ${sc}</b></div><div class="card big">${E(cur.q)}<div class="mut" style="margin-top:8px">có đáp án là</div>${E(cur.a)}</div><div class="row"><button class="g" style="flex:1" onclick="tj(0)">Sai</button><button style="flex:1" onclick="tj(1)">Đúng</button></div>`);
const nx=()=>{const x=sh(c)[0],tr=Math.random()<.5,o=sh(c.filter(y=>y.a!==x.a))[0]||x;cur={tr:tr||o===x,q:x.q,a:tr||o===x?x.a:o.a};draw()};
window.tj=v=>{const ok=!!v===cur.tr;rec(ok);sc+=ok?10:-5;nx()};
clearInterval(window.iv);
window.iv=setInterval(()=>{t--;const e=$('#tm');
if(!e||t<0){clearInterval(window.iv);if(e)end(`Hết giờ! Điểm: ${sc}`);return}
e.textContent=t},1000);
nx()}

/* Khởi động */
(async()=>{if(localStorage.getItem('hv:tk')){try{const j=await API('me');U=j.name;D=j.data;return home()}catch(e){localStorage.removeItem('hv:tk')}}login()})();
