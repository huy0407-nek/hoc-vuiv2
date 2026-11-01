/* Hiệu ứng, cấp độ, sao lưu JSON, đoán chữ - Học Vui, do Lâm Huy tạo */
let ac;
function beep(f){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.12)}catch(e){}}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2400)}
function confetti(){const c=document.createElement('canvas');c.id='cf';c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);
const x=c.getContext('2d'),p=Array.from({length:100},()=>({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*16,vy:Math.random()*-15-2,s:4+Math.random()*6,c:`hsl(${Math.random()*360},90%,60%)`}));let f=0;
(function t(){x.clearRect(0,0,c.width,c.height);p.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.4;x.fillStyle=q.c;x.fillRect(q.x,q.y,q.s,q.s)});++f<100?requestAnimationFrame(t):c.remove()})()}
const lv=x=>Math.floor(Math.sqrt(x/50))+1;
function fx(ok){const old=lv(D.xp||0);D.xp=(D.xp||0)+(ok?10:0);D.cb=ok?(D.cb||0)+1:0;beep(ok?660:220);
if(!ok){const a=$('#app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
if(lv(D.xp)>old){confetti();toast('Lên cấp '+lv(D.xp)+'! 🎉')}else if(ok&&D.cb%5==0){confetti();toast('Chuỗi '+D.cb+' câu đúng! 🔥')}}
function daily(){const d=new Date().toDateString();if(D.sk&&D.sk.d===d)return;const y=new Date(Date.now()-864e5).toDateString();D.sk={d,n:D.sk&&D.sk.d===y?D.sk.n+1:1};save()}
function badge(){const x=D.xp||0,l=lv(x),a=50*(l-1)**2,b=50*l*l;
return `<div class="row"><span class="badge">⭐ Cấp ${l}</span><span class="badge">🔥 ${D.sk?D.sk.n:1} ngày liên tiếp</span><span class="badge">✨ ${x} XP</span></div><div class="bar" style="margin-top:8px;max-width:260px"><i style="width:${100*(x-a)/(b-a)}%"></i></div>`}
async function sample(){try{const j=await (await fetch('data/sample.json')).json();let n=0;
for(const k in j){if(!D.subs[k])D.subs[k]=[];j[k].forEach(([q,a])=>{D.subs[k].push({q,a,box:0,due:0});n++})}
save();home();toast('Đã thêm '+n+' thẻ mẫu')}catch(e){alert('Không tải được bộ mẫu. Hãy mở web qua Render hoặc máy chủ, không mở trực tiếp file.')}}
function backup(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:'application/json'}));a.download='hocvui-'+U+'.json';a.click()}
async function restore(el){const f=el.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!j.subs)throw 0;
D.subs=j.subs;D.st=j.st||{};D.xp=j.xp||0;save();home();toast('Đã nhập dữ liệu')}catch(e){alert('File JSON không hợp lệ.')}}
function hang(){const c=D.subs[S].filter(x=>x.a.length<=30);if(!c.length)return alert('Cần thẻ có đáp án ngắn (tối đa 30 ký tự).');
const x=sh(c)[0],g=[];let hp=6;const gu=ch=>/[a-z0-9]/.test(norm(ch)),
ok=()=>x.a.split('').every(ch=>!gu(ch)||g.includes(norm(ch))),
draw=()=>{if(ok()){rec(1);confetti();return end('Đúng rồi! Đáp án: '+E(x.a))}
if(hp<=0){rec(0);return end('Hết tim. Đáp án: '+E(x.a))}
R(`<div class="row">${X}<span class="mut">Tim ${'♥'.repeat(hp)}</span></div><div class="card big">${E(x.q)}</div><div class="card big" style="letter-spacing:.25em;text-align:center;word-break:break-word">${E(x.a.split('').map(ch=>!gu(ch)||g.includes(norm(ch))?ch:'_').join(''))}</div><div class="row" style="justify-content:center">${[...'abcdefghijklmnopqrstuvwxyz0123456789'].map(l=>`<button class="g" style="padding:8px 11px" ${g.includes(l)?'disabled':''} onclick="hg('${l}')">${l.toUpperCase()}</button>`).join('')}</div>`)};
window.hg=l=>{g.push(l);if(!x.a.split('').some(ch=>norm(ch)===l))hp--;draw()};draw()}
