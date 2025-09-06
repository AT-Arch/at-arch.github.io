(() => {
  const C = window.ARCH_CONFIG || {};
  // Apply config values to DOM
  document.getElementById('server-name').textContent = C.serverName || 'Server';
  document.getElementById('server-desc').textContent = C.serverDesc || '';
  document.getElementById('logo').src = C.logo || 'assets/logo.svg';
  const tipEl = document.getElementById('tip');
  const percentEl = document.getElementById('percent');
  const statusEl = document.getElementById('status');
  const progressEl = document.getElementById('progress');

  // Setup tips
  const tips = (C.tips && C.tips.length) ? C.tips : ['Welcome!'];
  let tipIdx = 0;
  function rotateTip(){ tipEl.textContent = tips[tipIdx % tips.length]; tipIdx++; }
  rotateTip(); setInterval(rotateTip, 6000);

  // Particle background
  const canvas = document.getElementById('bgcanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  function makeParticles(){
    particles = [];
    const count = (C.particles && C.particles.count) || 40;
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: 1 + Math.random()*3,
        vx: (Math.random()-0.5)*0.25,
        vy: (Math.random()-0.5)*0.25,
        alpha: 0.2 + Math.random()*0.9
      });
    }
  }
  makeParticles();

  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // animated gradient overlay
    const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0, (C.colors && C.colors.accent) || '#7dd3fc');
    g.addColorStop(1, (C.colors && C.colors.accent2) || '#60a5fa');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.02;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha = 1;

    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x< -10) p.x = canvas.width+10; if(p.x>canvas.width+10) p.x = -10;
      if(p.y< -10) p.y = canvas.height+10; if(p.y>canvas.height+10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = (C.particles && C.particles.color) || 'rgba(125,211,252,0.9)';
      ctx.globalAlpha = p.alpha * 0.9;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Progress simulation
  const totalMs = C.simulatedLoadTime || 4000;
  let start = performance.now();
  function updateProgress(now){
    const t = Math.min(1,(now-start)/totalMs);
    // ease out
    const eased = 1 - Math.pow(1-t,3);
    const pct = Math.round(eased*100);
    progressEl.style.width = pct + '%';
    percentEl.textContent = pct + '%';
    if(pct < 100){
      statusEl.textContent = ['Downloading content','Preparing resources','Loading modules','Almost there...'][Math.floor(t*4)] || 'Loading...';
      requestAnimationFrame(updateProgress);
    } else {
      statusEl.textContent = 'Ready — joining soon';
      // Optionally redirect or close if desired
    }
  }
  requestAnimationFrame(updateProgress);

  // Expose a simple API for external integration (GMod) to set percent
  window.ArchLoading = {
    setPercent(p){ const n = Math.max(0,Math.min(100,Math.round(p))); progressEl.style.width = n+'%'; percentEl.textContent = n+'%'; },
    setStatus(s){ statusEl.textContent = String(s); },
    finish(){ progressEl.style.width = '100%'; percentEl.textContent = '100%'; statusEl.textContent = 'Ready'; }
  };
})();
