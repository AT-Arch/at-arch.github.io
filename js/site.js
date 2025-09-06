/* site.js - consolidated interactive behaviors */
(function() {
  const qs = (s, o=document) => o.querySelector(s);
  const qsa = (s, o=document) => [...o.querySelectorAll(s)];

  // Theme persistence
  const themeToggle = qs('#theme-toggle');
  function applyTheme(mode) {
    const body = document.body;
    if (mode === 'light') {
      body.classList.add('light-mode');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      body.classList.remove('light-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
    try { localStorage.setItem('arch_theme', mode); } catch(e) {}
  }
  function initTheme() {
    try {
      const stored = localStorage.getItem('arch_theme');
      if (stored === 'light' || stored === 'dark') applyTheme(stored);
    } catch(e) {}
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      applyTheme(isLight ? 'light' : 'dark');
    });
  }
  initTheme();

  // Toast helper
  function showToast(msg, timeout=2600) {
    const el = qs('#toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.classList.remove('show'), timeout);
  }
  window.showToast = showToast;

  // 3D tilt
  qsa('.download-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left; const y = e.clientY - r.top;
      const cx = r.width/2; const cy = r.height/2;
      const rx = ((y-cy)/cy)*8; const ry = ((x-cx)/cx)*-8;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.classList.add('tilted');
    });
    card.addEventListener('mouseleave', ()=> {
      card.style.transform='';
      card.classList.remove('tilted');
    });
  });

  // Particles
  function initParticles() {
    const canvas = qs('#bg-particles');
    if(!canvas) return; const ctx = canvas.getContext('2d');
    const rand = (a,b)=> a+Math.random()*(b-a);
    let particles = Array.from({length:38}, () => ({
      x: rand(0, innerWidth), y: rand(0, innerHeight), r: rand(1.5,4.5),
      dx: rand(-0.5,0.5), dy: rand(-0.5,0.5), color: Math.random()>0.5?'#19c37d':'#dc3545'
    }));
    function size() { canvas.width=innerWidth; canvas.height=innerHeight; }
    addEventListener('resize', size); size();
    (function loop(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of particles){
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=0.18; ctx.fill(); ctx.globalAlpha=1;
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
      }
      requestAnimationFrame(loop);
    })();
  }
  initParticles();

  // Reveal on scroll
  function reveal() {
    const vh = innerHeight;
    qsa('.reveal:not(.visible)').forEach(el => {
      const top = el.getBoundingClientRect().top;
      if(top < vh - 60) el.classList.add('visible');
    });
  }
  addEventListener('scroll', reveal, {passive:true});
  addEventListener('DOMContentLoaded', reveal);

  // Custom cursor
  (function(){
    const c = qs('#custom-cursor');
    if(!c) return; document.body.style.cursor='none';
    addEventListener('mousemove', e => {
      c.style.left = (e.clientX - 12)+ 'px';
      c.style.top = (e.clientY - 12)+ 'px';
    });
  })();

  // Modal (native dialog)
  function openDialog(id){
    const d = qs(id);
    if(!d) return; if(typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open','');
  }
  function closeDialog(d){
    if(!d) return; if(typeof d.close==='function') d.close(); else d.removeAttribute('open');
  }
  qsa('[data-modal="contact"]').forEach(btn => btn.addEventListener('click', ()=> openDialog('#contact-dialog')));
  qsa('[data-close]').forEach(btn => btn.addEventListener('click', e => closeDialog(e.target.closest('dialog'))));
  document.addEventListener('keydown', e => { if(e.key==='Escape') qsa('dialog[open]').forEach(closeDialog); });

  // Dev popup -> replaced with toast only to reduce overlays
  qsa('.dev-popup').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const name = a.getAttribute('data-script') || 'This script';
    showToast(`${name} is under development`);
  }));
})();
