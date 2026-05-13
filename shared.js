/* ═══════════════════════════════════════════════════════
   BETHER STUDIO · Shared Engine v4
   Refined sparkles · cinematic page xfade · mouse trail
   nav · reveal · counters · marquee · FAQ · mobile menu
═══════════════════════════════════════════════════════ */
(function(){
'use strict';

const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const REDUCED  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Ambient orbs ── */
function buildAmbient(){
  if(document.querySelector('.ambient')) return;
  const a=document.createElement('div');
  a.className='ambient';
  a.innerHTML='<div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div>';
  document.body.prepend(a);
}
buildAmbient();

/* ══════════════════════════════════════════
   CANVAS — REFINED SPARKLES
   · 32 gold sparkles (twinkle, slow drift)
   · 10 color diamonds (rare, soft cross flash)
   · gold mouse trail (subtle, on movement)
══════════════════════════════════════════ */
if(!REDUCED){
  const CV=document.createElement('canvas');
  CV.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;will-change:transform';
  document.body.prepend(CV);
  const C=CV.getContext('2d',{alpha:true});
  function rz(){ CV.width=innerWidth; CV.height=innerHeight; }
  rz(); addEventListener('resize',rz,{passive:true});

  const GOLD=[[212,165,116],[230,192,138],[241,216,168],[255,235,200]];
  const COL =[[255,93,122],[212,165,116],[168,85,247],[34,211,238],[255,140,66]];
  const SPARKS=[], DIAS=[], TRAIL=[];

  class Spark{
    constructor(){ this.reset(true); }
    reset(init){
      this.x=Math.random()*innerWidth;
      this.y=Math.random()*innerHeight;
      this.r=Math.random()*1.1+.3;
      this.col=GOLD[Math.floor(Math.random()*4)];
      this.maxA=Math.random()*.22+.05;
      this.phase=Math.random()*Math.PI*2;
      this.spd=Math.random()*.008+.003;
      this.life=init?Math.floor(Math.random()*600):0;
      this.lifeMax=Math.random()*520+260;
      this.dx=(Math.random()-.5)*.08;
      this.dy=(Math.random()-.5)*.08;
    }
    update(){
      this.life++; this.phase+=this.spd;
      this.alpha=this.maxA*Math.sin(Math.PI*this.life/this.lifeMax)*(.5+.5*Math.sin(this.phase));
      this.x+=this.dx; this.y+=this.dy;
      if(this.life>=this.lifeMax) this.reset(false);
    }
    draw(){
      if(this.alpha<=0) return;
      const[r,g,b]=this.col;
      const gR=this.r*4.5;
      const grd=C.createRadialGradient(this.x,this.y,0,this.x,this.y,gR);
      grd.addColorStop(0,`rgba(${r},${g},${b},${this.alpha})`);
      grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
      C.fillStyle=grd;
      C.beginPath(); C.arc(this.x,this.y,gR,0,Math.PI*2); C.fill();
      C.fillStyle=`rgba(${r},${g},${b},${Math.min(this.alpha*3.5,.65)})`;
      C.beginPath(); C.arc(this.x,this.y,this.r,0,Math.PI*2); C.fill();
    }
  }

  class Diamond{
    constructor(){ this.reset(true); }
    reset(init){
      this.x=Math.random()*innerWidth;
      this.y=Math.random()*innerHeight;
      this.s=Math.random()*11+5;
      this.col=Math.random()<.45 ? COL[Math.floor(Math.random()*5)] : GOLD[Math.floor(Math.random()*4)];
      this.life=init?Math.floor(Math.random()*900):0;
      this.lifeMax=Math.random()*260+160;
      this.maxA=Math.random()*.20+.07;
      this.rot=Math.random()*Math.PI;
      this.alpha=0;
    }
    update(){
      this.life++;
      const t=this.life/this.lifeMax;
      if(t<.15)        this.alpha=this.maxA*(t/.15);
      else if(t<.75)   this.alpha=this.maxA;
      else             this.alpha=this.maxA*((1-t)/.25);
      if(this.life>=this.lifeMax) this.reset(false);
    }
    draw(){
      if(this.alpha<=.005) return;
      const[r,g,b]=this.col, a=this.alpha, s=this.s;
      C.save(); C.translate(this.x,this.y); C.rotate(this.rot);
      for(let i=0;i<4;i++){
        const ang=i*Math.PI/2;
        const grd=C.createLinearGradient(0,0,Math.cos(ang)*s,Math.sin(ang)*s);
        grd.addColorStop(0,`rgba(${r},${g},${b},${a})`);
        grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
        C.strokeStyle=grd; C.lineWidth=1.3;
        C.beginPath(); C.moveTo(0,0); C.lineTo(Math.cos(ang)*s,Math.sin(ang)*s); C.stroke();
      }
      C.fillStyle=`rgba(${r},${g},${b},${a*1.1})`;
      C.beginPath(); C.arc(0,0,.8,0,Math.PI*2); C.fill();
      C.restore();
    }
  }

  for(let i=0;i<32;i++) SPARKS.push(new Spark());
  for(let i=0;i<10;i++) DIAS.push(new Diamond());

  /* Mouse trail */
  let mx=-999,my=-999,pmx=-999,pmy=-999,moving=false,mt;
  if(!IS_TOUCH){
    addEventListener('mousemove',e=>{
      pmx=mx; pmy=my; mx=e.clientX; my=e.clientY;
      moving=true; clearTimeout(mt); mt=setTimeout(()=>moving=false,90);
    },{passive:true});
  }

  class TrailP{
    constructor(x,y,vx,vy){
      this.x=x; this.y=y;
      this.vx=vx+(Math.random()-.5)*.5;
      this.vy=vy+(Math.random()-.5)*.5-.3;
      this.r=Math.random()*1+.3;
      this.life=1; this.decay=Math.random()*.015+.014;
      this.col=GOLD[Math.floor(Math.random()*4)];
    }
    update(){
      this.vy+=.04; this.vx*=.965; this.vy*=.965;
      this.x+=this.vx; this.y+=this.vy;
      this.life-=this.decay; this.r*=.996;
    }
    draw(){
      const[r,g,b]=this.col;
      const grd=C.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*2.4);
      grd.addColorStop(0,`rgba(${r},${g},${b},${this.life*.65})`);
      grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
      C.fillStyle=grd;
      C.beginPath(); C.arc(this.x,this.y,this.r,0,Math.PI*2); C.fill();
    }
    get dead(){ return this.life<=0 || this.r<.1; }
  }

  function loop(){
    C.clearRect(0,0,CV.width,CV.height);
    SPARKS.forEach(s=>{ s.update(); s.draw(); });
    DIAS  .forEach(d=>{ d.update(); d.draw(); });

    if(moving && TRAIL.length<35){
      const spd=Math.hypot(mx-pmx,my-pmy);
      if(spd>3){
        const n=Math.min(Math.floor(spd/14)+1,2);
        for(let i=0;i<n;i++) TRAIL.push(new TrailP(mx,my,-(mx-pmx)*.05,-(my-pmy)*.05));
      }
    }
    for(let i=TRAIL.length-1;i>=0;i--){
      TRAIL[i].update(); TRAIL[i].draw();
      if(TRAIL[i].dead) TRAIL.splice(i,1);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* ── Spotlight (subtle mouse follow halo) ── */
if(!IS_TOUCH && !REDUCED){
  const spot=document.createElement('div');
  spot.className='spot';
  document.body.appendChild(spot);
  let tx=innerWidth/2, ty=innerHeight/2, x=tx, y=ty;
  addEventListener('mousemove',e=>{ tx=e.clientX; ty=e.clientY; },{passive:true});
  (function tick(){
    x+=(tx-x)*.09; y+=(ty-y)*.09;
    spot.style.transform=`translate(${x-260}px,${y-260}px)`;
    requestAnimationFrame(tick);
  })();
}

/* ══════════════════════════════════════════
   NAV SCROLL · PROGRESS BAR · BACK TOP
══════════════════════════════════════════ */
const navEl=document.getElementById('nav');
const sbEl=document.getElementById('sb');
function onScroll(){
  if(navEl) navEl.classList.toggle('scrolled',scrollY>40);
  if(sbEl){
    const h=document.documentElement.scrollHeight-innerHeight;
    if(h>0) sbEl.style.transform=`scaleX(${Math.min(1,scrollY/h)})`;
  }
  const bt=document.getElementById('bt');
  if(bt) bt.classList.toggle('show',scrollY>500);
}
addEventListener('scroll',onScroll,{passive:true});
onScroll();
const btEl=document.getElementById('bt');
if(btEl) btEl.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* ══════════════════════════════════════════
   REVEAL · COUNTERS · MARQUEE
══════════════════════════════════════════ */
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
},{threshold:.08,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

function animCount(el,target,suffix){
  let c=0, step=Math.max(1,Math.round(target/55));
  const t=setInterval(()=>{
    c=Math.min(c+step,target);
    el.textContent=c+(suffix||'');
    if(c>=target) clearInterval(t);
  },24);
}
const sn1=document.getElementById('sn1'),sn2=document.getElementById('sn2');
if(sn1||sn2){
  const cObs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      if(sn1) animCount(sn1,50,'+');
      if(sn2) animCount(sn2,24,'hs');
      cObs.disconnect();
    }
  },{threshold:.4});
  const se=document.querySelector('.stats-row');
  if(se) cObs.observe(se);
}

const mq=document.getElementById('mq');
if(mq) mq.parentNode.appendChild(mq.cloneNode(true));

/* ══════════════════════════════════════════
   MOBILE MENU · FAQ
══════════════════════════════════════════ */
const mmEl=document.getElementById('mm'),mtEl=document.getElementById('mt'),mcEl=document.getElementById('mc');
function openMM(){ if(!mmEl)return; mmEl.style.display='flex'; requestAnimationFrame(()=>mmEl.classList.add('open')); }
function closeMM(){ if(!mmEl)return; mmEl.classList.remove('open'); setTimeout(()=>mmEl.style.display='none',360); }
if(mtEl) mtEl.addEventListener('click',openMM);
if(mcEl) mcEl.addEventListener('click',closeMM);
if(mmEl) mmEl.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMM));

document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.parentElement;
    const was=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
    if(!was) item.classList.add('open');
  });
});

/* ══════════════════════════════════════════
   PAGE TRANSITION — Circle reveal + gold flash
   · Círculo negro se expande desde el punto de click
   · Destello dorado en el momento del click
   · Prefetch silencioso de la página destino
══════════════════════════════════════════ */
const TR = document.createElement('div');
TR.id = 'pgTrans';
document.body.appendChild(TR);

/* Canvas del destello dorado */
const FC = document.createElement('canvas');
FC.id = 'pgFlash';
FC.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9001;opacity:0;transition:opacity .12s';
document.body.appendChild(FC);
const FX = FC.getContext('2d');
FC.width = innerWidth; FC.height = innerHeight;
addEventListener('resize', () => { FC.width = innerWidth; FC.height = innerHeight; }, {passive:true});

function drawFlash(ox, oy) {
  FX.clearRect(0, 0, FC.width, FC.height);
  /* Anillo dorado que se expande */
  const maxR = Math.hypot(Math.max(ox, FC.width-ox), Math.max(oy, FC.height-oy)) * .55;
  const g1 = FX.createRadialGradient(ox, oy, 0, ox, oy, maxR);
  g1.addColorStop(0,   'rgba(212,165,116,0)');
  g1.addColorStop(.65, 'rgba(230,192,138,.16)');
  g1.addColorStop(.82, 'rgba(241,216,168,.32)');
  g1.addColorStop(.92, 'rgba(255,235,200,.10)');
  g1.addColorStop(1,   'rgba(212,165,116,0)');
  FX.beginPath(); FX.arc(ox, oy, maxR, 0, Math.PI*2);
  FX.fillStyle = g1; FX.fill();
  /* 12 rayos finos */
  for (let i = 0; i < 12; i++) {
    const ang = (Math.PI*2*i)/12;
    const len = maxR * (.28 + Math.random()*.08);
    const g2 = FX.createLinearGradient(ox, oy, ox+Math.cos(ang)*len, oy+Math.sin(ang)*len);
    g2.addColorStop(0, 'rgba(241,216,168,.28)');
    g2.addColorStop(1, 'rgba(212,165,116,0)');
    FX.beginPath(); FX.moveTo(ox, oy);
    FX.lineTo(ox+Math.cos(ang)*len, oy+Math.sin(ang)*len);
    FX.strokeStyle = g2; FX.lineWidth = .9; FX.stroke();
  }
  /* Punto central brillante */
  const g3 = FX.createRadialGradient(ox, oy, 0, ox, oy, 18);
  g3.addColorStop(0, 'rgba(255,248,220,.65)');
  g3.addColorStop(1, 'rgba(212,165,116,0)');
  FX.beginPath(); FX.arc(ox, oy, 18, 0, Math.PI*2);
  FX.fillStyle = g3; FX.fill();
}

let _nav = false;

function goTo(href, ox, oy) {
  if (_nav) return; _nav = true;
  /* Prefetch silencioso */
  try { const lk=document.createElement('link'); lk.rel='prefetch'; lk.href=href; document.head.appendChild(lk); } catch(e){}
  /* 1. Destello dorado inmediato */
  FC.style.opacity = '1';
  drawFlash(ox || innerWidth/2, oy || innerHeight/2);
  /* 2. Círculo negro se expande desde el punto de click */
  TR.style.setProperty('--ox', (ox||innerWidth/2)+'px');
  TR.style.setProperty('--oy', (oy||innerHeight/2)+'px');
  TR.classList.add('go');
  /* 3. Flash desaparece mientras el círculo avanza */
  setTimeout(() => { FC.style.opacity = '0'; }, 160);
  /* 4. Navegar */
  setTimeout(() => location.href = href, 580);
}

/* Fade in al cargar */
document.body.style.opacity = '0';
addEventListener('load', () => {
  document.body.style.transition = 'opacity .5s ease';
  document.body.style.opacity = '1';
}, {once:true});

/* Interceptar links internos */
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto') ||
      href.startsWith('tel') || a.target === '_blank' || href.startsWith('#')) return;
  e.preventDefault();
  const r = a.getBoundingClientRect();
  goTo(href, r.left + r.width/2, r.top + r.height/2);
});

})();
