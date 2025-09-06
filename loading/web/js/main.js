// Main runtime for Arch Loading Screen
(function(){
  const cfg = window.ARCH_CONFIG || {};

  /* Utility helpers */
  const $ = s => document.querySelector(s);
  const rand = (min,max)=>Math.random()*(max-min)+min;
  const qs = Object.fromEntries(new URLSearchParams(location.search).entries());

  function applyBranding(){
    if(cfg.favicon){
      const link = document.createElement('link');
      link.rel='icon'; link.href=cfg.favicon; document.head.appendChild(link);
    }
    if(cfg.primaryColor){
      document.documentElement.style.setProperty('--bs-primary', cfg.primaryColor);
      document.documentElement.style.setProperty('--arch-primary', cfg.primaryColor);
    }
    if(cfg.accentColor){
      document.documentElement.style.setProperty('--arch-accent', cfg.accentColor);
    }
    if(cfg.background?.image){
      document.body.style.backgroundImage = `url(${cfg.background.image})`;
      document.body.style.backgroundSize='cover';
      document.body.style.backgroundPosition='center';
      if(cfg.background.overlay){
        const o = document.createElement('div');
        o.style.position='fixed';o.style.inset='0';o.style.background=cfg.background.overlay;o.style.zIndex='-1';
        document.body.appendChild(o);
      }
    }
  }

  function setServerInfo(){
    const serverName = (cfg.showHostnameFromQuery && qs.hostname) ? qs.hostname : cfg.serverName;
    $('#server-name').textContent = serverName || 'Server';
    $('#server-subtitle').textContent = cfg.subtitle || 'Loading environment';
    $('#doc-title').textContent = `${serverName} • Loading...`;
    if(cfg.logo) $('#logo').src = cfg.logo;
    $('#map-name').textContent = qs.mapname ? `map: ${qs.mapname}` : 'map: unknown';
    $('#gamemode').textContent = qs.gamemode ? `mode: ${qs.gamemode}` : 'mode: ?';
    $('#player-steamid').textContent = qs.steamid ? `steam: ${qs.steamid}` : 'steam: ?';
    $('#footer-text').textContent = cfg.footerText || '';
  }

  /* Tips rotation */
  let tipIndex = 0; let tipTimer;
  function showTip(i){
    if(!cfg.tips?.length) { $('#tip-text').textContent=''; return; }
    const tip = cfg.tips[i % cfg.tips.length];
    $('#tip-text').textContent = tip;
    $('#tip-counter').textContent = `${(i%cfg.tips.length)+1}/${cfg.tips.length}`;
  }
  function startTips(){
    showTip(tipIndex);
    clearInterval(tipTimer);
    tipTimer = setInterval(()=>{ tipIndex++; showTip(tipIndex); }, cfg.tipIntervalMs || 6000);
  }

  /* Rules list */
  function populateRules(){
    const ul = $('#rules-list');
    ul.innerHTML='';
    (cfg.rules||[]).forEach(r=>{
      const li=document.createElement('li');
      li.className='list-group-item';
      li.textContent = r; ul.appendChild(li);
    });
  }

  /* Progress (simulation + real callbacks) */
  let simActive=false, simCancelled=false, simRaf=null;
  function simulateProgress(){
    if(!cfg.progress?.simulated) return;
    simActive=true; simCancelled=false;
    const bar = $('#progress-bar');
    const etaEl = $('#eta');
    const statusLine = $('#status-line');
    const fileEl = $('#current-file');
    const total = rand(cfg.progress.minTotalTimeMs, cfg.progress.maxTotalTimeMs);
    const start = performance.now();
    const sampleFiles = ['maps/'+(qs.mapname||'world')+'.bsp','materials/shared/pack1.vtf','materials/shared/pack2.vmt','models/player.mdl','sound/ui/menu.wav','lua/autorun/server/init.lua'];
    let nextFileChange = 0; let currentFile = sampleFiles[0];
    const step = now => {
      if(simCancelled){ simActive=false; return; }
      const elapsed = now-start;
      let t = Math.min(elapsed/total, 1);
      const eased = 1 - Math.pow(1-t, 2.2);
      if(Math.random()<cfg.progress.stallChance && t<0.92){
        const stallMs = rand(150, cfg.progress.stallMaxMs);
        nextFileChange = now + stallMs;
        cfg.progress.stallChance *= 0.92;
      }
      if(now < nextFileChange){ simRaf=requestAnimationFrame(step); return; }
      bar.style.width = (eased*100).toFixed(1)+'%';
      bar.textContent = (eased*100).toFixed(0)+'%';
      const remainingMs = Math.max(0,total-elapsed);
      etaEl.textContent = (remainingMs/1000).toFixed(1)+'s remaining';
      if(elapsed > (sampleFiles.indexOf(currentFile)+1)* (total/sampleFiles.length) && sampleFiles.length>1){
        sampleFiles.push(sampleFiles.shift());
        currentFile = sampleFiles[0];
        fileEl.textContent = 'Downloading '+currentFile;
      }
      if(t>=1){
        fileEl.textContent='Finishing up...';
        statusLine.textContent='Almost there';
        setTimeout(()=>statusLine.textContent='Ready — waiting for game to finish mounting resources', 1200);
        simActive=false; return;
      }
      simRaf=requestAnimationFrame(step);
    };
    fileEl.textContent='Preparing downloads...';
    simRaf=requestAnimationFrame(step);
  }
  function cancelSimulation(){ if(simActive){ simCancelled=true; if(simRaf) cancelAnimationFrame(simRaf);} }

  const real = { total:0, needed:0 };
  function updateReal(){
    if(!real.total) return;
    const bar = $('#progress-bar');
    const have = Math.max(0, real.total - real.needed);
    const pct = Math.min(100, (have/real.total)*100);
    bar.style.width = pct.toFixed(1)+'%';
    bar.textContent = pct.toFixed(0)+'%';
    $('#eta').textContent = real.needed>0? `${real.needed} files left` : 'Finishing...';
  }

  // GMod callback hooks
  window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language){
    $('#server-name').textContent = servername || cfg.serverName || 'Server';
    $('#map-name').textContent = mapname ? `map: ${mapname}` : 'map: ?';
    $('#gamemode').textContent = gamemode ? `mode: ${gamemode}` : 'mode: ?';
    $('#player-steamid').textContent = steamid ? `steam: ${steamid}` : 'steam: ?';
    document.title = `${servername||cfg.serverName||'Server'} • Loading...`;
    if(typeof volume === 'number'){ const a=$('#bg-music'); a.volume = volume; }
  };
  window.SetFilesTotal = function(total){ if(!cfg.progress?.preferReal) return; real.total=total; cancelSimulation(); updateReal(); };
  window.SetFilesNeeded = function(needed){ if(!cfg.progress?.preferReal) return; real.needed=needed; cancelSimulation(); updateReal(); if(needed===0) $('#current-file').textContent='Finishing up...'; };
  window.DownloadingFile = function(file){ if(!cfg.progress?.preferReal) return; cancelSimulation(); $('#current-file').textContent = 'Downloading '+file; };
  window.SetStatusChanged = function(status){ $('#status-line').textContent = status || ''; };
  // compatibility lowercase variant
  window.downloadingFile = window.DownloadingFile;

  function attemptMusicPlay(){
    const audio = $('#bg-music');
    if(!audio.src) return;
    audio.play().catch(()=>{
      // Provide a manual button
      if(!document.getElementById('manual-play')){
        const btn = document.createElement('button');
        btn.id='manual-play';
        btn.className='btn btn-sm btn-primary ms-2';
        btn.textContent='Play Audio';
        btn.addEventListener('click',()=> audio.play().then(()=>btn.remove()).catch(()=>{}));
        const headerBtn = document.getElementById('toggle-mute');
        headerBtn?.insertAdjacentElement('afterend', btn);
      }
    });
  }

  /* Music */
  function initMusic(){
    if(!cfg.music?.enabled) return;
    const card = $('#music-card'); card.style.display='block';
    const audio = $('#bg-music');
    let list = [...(cfg.music.playlist||[])];
    if(!list.length){ card.style.display='none'; return; }
    if(cfg.music.shuffle) list = list.sort(()=>Math.random()-0.5);
    let trackIndex = 0;
  function play(index){
      const track = list[index % list.length];
      audio.src = track.url; audio.volume = cfg.music.volume ?? 0.5; audio.play().catch(()=>{});
      $('#track-title').textContent = track.title||'Track';
      $('#track-artist').textContent = track.artist||'';
    }
    audio.addEventListener('ended',()=>{ trackIndex++; play(trackIndex); });
    audio.addEventListener('timeupdate',()=>{
      if(audio.duration){
        $('#music-progress').style.width = (audio.currentTime/audio.duration*100)+'%';
      }
    });
    $('#toggle-mute').addEventListener('click',()=>{
      audio.muted = !audio.muted; $('#toggle-mute').classList.toggle('muted', audio.muted);
    });
  if(cfg.music.autoplay){ play(trackIndex); attemptMusicPlay(); }
  // Fallback: user interaction to start audio if blocked
  ['click','keydown'].forEach(ev=>window.addEventListener(ev,()=>{ if(audio.paused){ audio.play().catch(()=>{}); } }, { once:true }));
  }

  // Initialize
  applyBranding();
  setServerInfo();
  startTips();
  populateRules();
  if(cfg.progress?.simulated) simulateProgress();
  initMusic();

})();