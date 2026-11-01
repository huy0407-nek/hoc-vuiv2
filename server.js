// Học Vui - server do Lâm Huy tạo
const express=require('express'),{MongoClient,ObjectId}=require('mongodb'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),path=require('path');
const SECRET=process.env.JWT_SECRET;
if(!process.env.MONGODB_URI||!SECRET){console.error('Thiếu biến môi trường MONGODB_URI hoặc JWT_SECRET');process.exit(1)}
const app=express();let users;
app.use(express.json({limit:'5mb'}));
['index.html','style.css','app.js','extras.js','sample.json'].forEach(f=>app.get(f=='index.html'?['/','/index.html']:'/'+f,(q,r)=>r.sendFile(path.join(__dirname,f))));
const sign=u=>jwt.sign({id:String(u._id)},SECRET,{expiresIn:'30d'});
const auth=(q,r,n)=>{try{q.uid=new ObjectId(jwt.verify((q.headers.authorization||'').slice(7),SECRET).id);n()}catch(e){r.status(401).json({error:'Hãy đăng nhập lại'})}};
const valid=(n,p)=>typeof n==='string'&&typeof p==='string'&&n.trim().length>=1&&n.trim().length<=20&&p.length>=6&&p.length<=72;

app.post('/api/register',async(q,r)=>{const{name,pw}=q.body||{};
if(!valid(name,pw))return r.status(400).json({error:'Tên từ 1-20 ký tự, mật khẩu từ 6-72 ký tự'});
const n=name.trim(),data={subs:{},st:{}},u={lc:n.toLowerCase(),name:n,hash:await bcrypt.hash(pw,10),data,xp:0};
try{u._id=(await users.insertOne(u)).insertedId}catch(e){return r.status(409).json({error:'Tên này đã có người dùng, hãy chọn tên khác'})}
r.json({token:sign(u),name:n,data})});

app.post('/api/login',async(q,r)=>{const{name,pw}=q.body||{};
const u=typeof name==='string'&&await users.findOne({lc:name.trim().toLowerCase()});
if(!u||typeof pw!=='string'||!(await bcrypt.compare(pw,u.hash)))return r.status(401).json({error:'Sai tên hoặc mật khẩu'});
r.json({token:sign(u),name:u.name,data:u.data})});

app.get('/api/me',auth,async(q,r)=>{const u=await users.findOne({_id:q.uid});u?r.json({name:u.name,data:u.data}):r.status(401).json({error:'Hãy đăng nhập lại'})});

app.put('/api/data',auth,async(q,r)=>{const d=q.body;
if(!d||typeof d.subs!=='object')return r.status(400).json({error:'Dữ liệu không hợp lệ'});
await users.updateOne({_id:q.uid},{$set:{data:d,xp:Number(d.xp)||0}});r.json({ok:1})});

app.get('/api/leaderboard',async(q,r)=>{const l=await users.find({xp:{$gt:0}},{projection:{name:1,xp:1}}).sort({xp:-1}).limit(10).toArray();r.json(l)});

MongoClient.connect(process.env.MONGODB_URI).then(async c=>{
users=c.db('hocvui').collection('users');await users.createIndex({lc:1},{unique:true});
app.listen(process.env.PORT||3000,()=>console.log('Học Vui đang chạy'))
}).catch(e=>{console.error('Không kết nối được MongoDB:',e.message);process.exit(1)});
