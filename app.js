const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};

const personal=[['name','Full name'],['title','Job title'],['email','Email'],['phone','Phone'],['location','Location'],['website','Website'],['social','LinkedIn / GitHub']];
const lists={
  experience:{label:'Experience',add:'Add job',fields:[['role','Job title'],['org','Company'],['start','Start'],['end','End'],['desc','What you did (one point per line)',1]]},
  education:{label:'Education',add:'Add education',fields:[['role','Degree'],['org','University'],['start','Start'],['end','End'],['desc','Details (one per line)',1]]},
  projects:{label:'Projects',add:'Add project',fields:[['role','Project name'],['org','Link or tech used'],['desc','Description (one point per line)',1]]}
};
const extra=[['skills','Skills (comma separated)'],['languages','Languages (comma separated)'],['certs','Certifications (one per line)',1]];

const sample={name:'Your Name',title:'Your Dream Designation',email:'sajidrahi@example.com',phone:'+880 1700 000000',location:'Dhaka, Bangladesh',website:'domain.com',social:'github.com/username',
  
 summary:'Who are you and what you do?',

 experience:[{role:'Role',org:'Org.',start:'20xx',end:'Present',desc:'What you hava done and how (in short)'}],

 education:[{role:'Program',org:'University of Frontier Technology, Bangladesh',start:'2022',end:'2026',desc:'CGPA 3.xx / 4.00'}],

 projects:[{role:'Project Name',org:'Components or Technology',desc:'Achievement'}],

 skills:'Your skills',languages:'Bengali (native), English (fluent)',certs:'Org. or Company',photo:''};

let d;
try{d=JSON.parse(store.get('cv-data'))}catch(e){}
d=d||structuredClone(sample);
$('#tpl').value=store.get('cv-tpl')||'classic';
$('#accent').value=store.get('cv-acc')||'#0f766e';

/* ---------- form ---------- */
function build(){
  let h='<fieldset><legend>Personal details</legend><label>Photo (Modern template)<input type="file" id="photo" accept="image/*"></label>';
  personal.forEach(([k,l])=>h+=`<label>${l}<input data-k="${k}" value="${esc(d[k])}"></label>`);
  h+=`<label>Summary<textarea rows="4" data-k="summary">${esc(d.summary)}</textarea></label></fieldset>`;
  for(const [key,c] of Object.entries(lists)){
    h+=`<fieldset><legend>${c.label}</legend>`;
    d[key].forEach((e,i)=>{
      h+=`<div class="entry"><button type="button" class="rm" data-rm="${key}:${i}">Remove</button>`;
      c.fields.forEach(([k,l,ta])=>{
        const a=`data-l="${key}:${i}:${k}"`;
        h+=`<label>${l}${ta?`<textarea rows="3" ${a}>${esc(e[k])}</textarea>`:`<input ${a} value="${esc(e[k])}">`}</label>`;
      });
      h+='</div>';
    });
    h+=`<button type="button" class="add" data-add="${key}">${c.add}</button></fieldset>`;
  }
  h+='<fieldset><legend>More</legend>';
  extra.forEach(([k,l,ta])=>h+=`<label>${l}${ta?`<textarea rows="3" data-k="${k}">${esc(d[k])}</textarea>`:`<input data-k="${k}" value="${esc(d[k])}">`}</label>`);
  $('#form').innerHTML=h+'</fieldset>';
}
$('#form').addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.k)d[t.dataset.k]=t.value;
  else if(t.dataset.l){const [k,i,f]=t.dataset.l.split(':');d[k][i][f]=t.value}
  else return;
  render();
});
$('#form').addEventListener('click',e=>{
  const b=e.target;
  if(b.dataset.add){d[b.dataset.add].push({});build();render()}
  if(b.dataset.rm){const [k,i]=b.dataset.rm.split(':');d[k].splice(i,1);build();render()}
});
$('#form').addEventListener('change',e=>{
  if(e.target.id!=='photo'||!e.target.files[0])return;
  const r=new FileReader();r.onload=()=>{d.photo=r.result;render()};r.readAsDataURL(e.target.files[0]);
});

/* ---------- templates ---------- */
const lines=t=>(t||'').split('\n').map(s=>s.trim()).filter(Boolean);
const bul=t=>lines(t).length?`<ul>${lines(t).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
const sec=(t,h)=>h?`<section><h2>${t}</h2>${h}</section>`:'';
const item=e=>`<div class="it"><div class="ith"><b>${esc(e.role)}</b><span>${esc([e.start,e.end].filter(Boolean).join(' – '))}</span></div>${e.org?`<div class="org">${esc(e.org)}</div>`:''}${bul(e.desc)}</div>`;
const tags=t=>{const a=(t||'').split(',').map(s=>s.trim()).filter(Boolean);return a.length?`<ul class="tags">${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''};

function blocks(){
  return {
    contact:[d.email,d.phone,d.location,d.website,d.social].filter(Boolean).map(esc),
    sum:sec('Profile',d.summary?`<p>${esc(d.summary)}</p>`:''),
    exp:sec('Experience',d.experience.map(item).join('')),
    edu:sec('Education',d.education.map(item).join('')),
    prj:sec('Projects',d.projects.map(item).join('')),
    skl:sec('Skills',tags(d.skills)),
    lng:sec('Languages',tags(d.languages)),
    crt:sec('Certifications',bul(d.certs))
  };
}
const head=(b,sep)=>`<h1>${esc(d.name)}</h1>${d.title?`<p class="ttl">${esc(d.title)}</p>`:''}<p class="ct">${b.contact.join(sep)}</p>`;
const T={
  classic:b=>`<div class="cv classic"><header>${head(b,' &nbsp;|&nbsp; ')}</header>${b.sum+b.exp+b.edu+b.prj+b.skl+b.lng+b.crt}</div>`,
  minimal:b=>`<div class="cv minimal"><header>${head(b,' &nbsp;&middot;&nbsp; ')}</header>${b.sum+b.exp+b.edu+b.prj+b.skl+b.lng+b.crt}</div>`,
  band:b=>`<div class="cv band"><header>${head(b,' &nbsp;|&nbsp; ')}</header><div class="body">${b.sum+b.exp+b.edu+b.prj+b.skl+b.lng+b.crt}</div></div>`,
  modern:b=>`<div class="cv modern"><aside>${d.photo?`<img class="photo" src="${d.photo}" alt="">`:''}${b.contact.length?`<section><h2>Contact</h2>${b.contact.map(c=>`<p>${c}</p>`).join('')}</section>`:''}${b.skl+b.lng+b.crt}</aside><div class="main"><h1>${esc(d.name)}</h1>${d.title?`<p class="ttl">${esc(d.title)}</p>`:''}${b.sum+b.exp+b.edu+b.prj}</div></div>`
};
function render(){
  const cv=$('#cv');
  cv.style.setProperty('--acc',$('#accent').value);
  cv.innerHTML=T[$('#tpl').value](blocks());
  cv.firstChild.style.setProperty('--a',$('#accent').value);
  store.set('cv-data',JSON.stringify(d));store.set('cv-tpl',$('#tpl').value);store.set('cv-acc',$('#accent').value);
}
function fit(){
  const z=Math.min(1,($('.desk').clientWidth-40)/794);
  $('#scaler').style.zoom=z;
}
$('#tpl').onchange=$('#accent').oninput=render;
addEventListener('resize',fit);

/* ---------- downloads ---------- */
const fname=()=>(d.name||'cv').trim().replace(/\s+/g,'_')+'_CV';
function say(t,ms=2500){const m=$('#msg');m.textContent=t;m.style.display='block';if(ms)setTimeout(()=>m.style.display='none',ms)}
function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
async function snap(){
  const s=$('#scaler'),z=s.style.zoom;s.style.zoom=1;
  try{return await html2canvas($('#cv'),{scale:2,backgroundColor:'#fff',useCORS:true})}
  finally{s.style.zoom=z}
}
async function toPdf(){
  const c=await snap(),{jsPDF}=window.jspdf,pdf=new jsPDF('p','pt','a4');
  const W=pdf.internal.pageSize.getWidth(),H=pdf.internal.pageSize.getHeight(),ph=Math.floor(c.width*H/W);
  for(let y=0,i=0;y<c.height;y+=ph,i++){
    const p=document.createElement('canvas');p.width=c.width;p.height=Math.min(ph,c.height-y);
    p.getContext('2d').drawImage(c,0,y,c.width,p.height,0,0,c.width,p.height);
    if(i)pdf.addPage();
    pdf.addImage(p.toDataURL('image/jpeg',.95),'JPEG',0,0,W,p.height*W/c.width);
  }
  pdf.save(fname()+'.pdf');
}
async function toImg(type){
  const c=await snap();
  c.toBlob(b=>save(b,fname()+(type==='png'?'.png':'.jpg')),type==='png'?'image/png':'image/jpeg',.95);
}
async function toDocx(){
  const {Document,Paragraph,TextRun,Packer,BorderStyle,TabStopType}=docx,col=$('#accent').value.slice(1).toUpperCase();
  const kids=[];
  const H=t=>kids.push(new Paragraph({spacing:{before:240,after:80},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:col,space:1}},children:[new TextRun({text:t.toUpperCase(),bold:true,color:col,size:24})]}));
  const B=t=>lines(t).forEach(x=>kids.push(new Paragraph({text:x,bullet:{level:0}})));
  kids.push(new Paragraph({children:[new TextRun({text:d.name||'',bold:true,size:48,color:col})]}));
  if(d.title)kids.push(new Paragraph({children:[new TextRun({text:d.title,size:26})]}));
  const ct=[d.email,d.phone,d.location,d.website,d.social].filter(Boolean).join('  |  ');
  if(ct)kids.push(new Paragraph({spacing:{after:120},children:[new TextRun({text:ct,size:20,color:'555555'})]}));
  if(d.summary){H('Profile');kids.push(new Paragraph({text:d.summary}))}
  const items=(t,a)=>{if(!a.length)return;H(t);a.forEach(e=>{
    kids.push(new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:9300}],spacing:{before:100},children:[new TextRun({text:e.role||'',bold:true}),new TextRun({text:'\t'+[e.start,e.end].filter(Boolean).join(' – '),color:'666666'})]}));
    if(e.org)kids.push(new Paragraph({children:[new TextRun({text:e.org,italics:true})]}));
    B(e.desc);
  })};
  items('Experience',d.experience);items('Education',d.education);items('Projects',d.projects);
  if(d.skills){H('Skills');kids.push(new Paragraph({text:d.skills}))}
  if(d.languages){H('Languages');kids.push(new Paragraph({text:d.languages}))}
  if(lines(d.certs).length){H('Certifications');B(d.certs)}
  const doc=new Document({sections:[{children:kids}]});
  save(await Packer.toBlob(doc),fname()+'.docx');
}
document.querySelector('.dl').addEventListener('click',async e=>{
  const f=e.target.dataset.fmt;if(!f)return;
  say('Preparing '+f.toUpperCase()+'…',0);
  try{f==='pdf'?await toPdf():f==='docx'?await toDocx():await toImg(f);say('Downloaded')}
  catch(err){console.error(err);say('Download failed. Check your internet connection (export libraries load from a CDN).',5000)}
});
$('#print').onclick=()=>{const s=$('#scaler'),z=s.style.zoom;s.style.zoom=1;print();s.style.zoom=z};

build();render();fit();
