// ---------- Clocks ----------
function tick(){
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clock').textContent = `${h}:${String(m).padStart(2,'0')} ${ap}`;
  const setH = (sel,deg)=>{ const el=document.querySelector(sel); if(el) el.style.transform=`rotate(${deg}deg)`; };
  setH('.hour', (d.getHours()%12)*30 + d.getMinutes()*0.5);
  setH('.min',  d.getMinutes()*6 + d.getSeconds()*0.1);
  setH('.sec',  d.getSeconds()*6);
}
setInterval(tick, 1000); tick();

// ---------- Calendar ----------
(function(){
  const d = new Date();
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  document.querySelector('.cal-body .day').textContent = days[d.getDay()];
  document.querySelector('.cal-head .month').textContent = months[d.getMonth()];
  document.querySelector('.cal-body .date').textContent = d.getDate();
})();

// ---------- Window management ----------
let z = 10;
const windows = [...document.querySelectorAll('.window')];
const focusWin = w => { w.style.zIndex = ++z; };
function openWin(id){ const w=document.getElementById(id); if(!w) return; w.classList.remove('hidden'); focusWin(w); }

windows.forEach(w=>{
  w.addEventListener('pointerdown', ()=>focusWin(w));
  const tb = w.querySelector('.titlebar');
  let drag = null;
  tb.addEventListener('pointerdown', e=>{
    if(e.target.closest('.wc')) return;
    if(w.classList.contains('maxed')) return;
    focusWin(w);
    drag = { x:e.clientX - w.offsetLeft, y:e.clientY - w.offsetTop };
    tb.setPointerCapture(e.pointerId);
  });
  tb.addEventListener('pointermove', e=>{
    if(!drag) return;
    w.style.left = (e.clientX - drag.x) + 'px';
    w.style.top  = (e.clientY - drag.y) + 'px';
  });
  tb.addEventListener('pointerup', e=>{ drag=null; try{ tb.releasePointerCapture(e.pointerId); }catch(_){} });

  w.querySelectorAll('.wc.close, .tl-close').forEach(b=>b.addEventListener('click',()=>w.classList.add('hidden')));
  w.querySelectorAll('.wc.min, .tl-min').forEach(b=>b.addEventListener('click',()=>w.classList.add('hidden')));
  w.querySelectorAll('.wc.max, .tl-max').forEach(b=>b.addEventListener('click',()=>w.classList.toggle('maxed')));
});

// ---------- Desktop icons ----------
document.querySelectorAll('.desk-icon').forEach(ic=>{
  ic.addEventListener('dblclick', ()=>openWin(ic.dataset.launch));
});

// ---------- Start menu ----------
const orb = document.getElementById('start-orb');
const menu = document.getElementById('start-menu');
orb.addEventListener('click', e=>{ e.stopPropagation(); menu.classList.toggle('hidden'); });
document.addEventListener('click', e=>{ if(!menu.contains(e.target) && e.target!==orb) menu.classList.add('hidden'); });
document.querySelectorAll('#start-menu .sm-item[data-launch]').forEach(it=>{
  it.addEventListener('click', ()=>{ openWin(it.dataset.launch); menu.classList.add('hidden'); });
});

// ---------- Taskbar buttons ----------
const apps = document.querySelector('.task-apps');
windows.forEach(w=>{
  const b = document.createElement('button');
  b.className = 'task-app';
  const t = w.querySelector('.title').textContent.split('—')[0].trim();
  b.textContent = t.length>18 ? t.slice(0,18)+'…' : t;
  b.addEventListener('click', ()=>{
    if(w.classList.contains('hidden')){ w.classList.remove('hidden'); focusWin(w); }
    else { w.classList.add('hidden'); }
  });
  apps.appendChild(b);
});

// ---------- Calculator ----------
(function(){
  const screen = document.getElementById('calc-screen');
  let cur='0', prev=null, op=null, fresh=true;
  const render = ()=>{ screen.textContent = cur; };
  function press(v){
    if(fresh){ cur = (v==='.') ? '0.' : v; fresh=false; }
    else if(v==='.'){ if(!cur.includes('.')) cur+='.'; }
    else { cur = (cur==='0') ? v : cur+v; }
    render();
  }
  function operator(o){
    if(op && !fresh) equals();
    prev = parseFloat(cur); op = o; fresh = true;
  }
  function equals(){
    if(op==null || prev==null) return;
    const n = parseFloat(cur); let r = prev;
    if(op==='+') r += n;
    else if(op==='-') r -= n;
    else if(op==='×') r *= n;
    else if(op==='÷') r = (n===0) ? 'Error' : r / n;
    cur = (typeof r==='number') ? String(+r.toPrecision(12)) : r;
    op=null; prev=null; fresh=true; render();
  }
  document.querySelectorAll('.calc-key').forEach(k=>k.addEventListener('click',()=>{
    const d = k.dataset;
    if(d.num!=null) press(d.num);
    else if(d.op) operator(d.op);
    else if(d.act==='eq') equals();
    else if(d.act==='ac'){ cur='0'; prev=null; op=null; fresh=true; render(); }
    else if(d.act==='neg'){ cur = (parseFloat(cur)*-1).toString(); render(); }
    else if(d.act==='pct'){ cur = (parseFloat(cur)/100).toString(); render(); }
  }));
  render();
})();
