(() => {
  const music=document.getElementById('background-music');
  const controls=document.getElementById('music-controls');
  const toggle=document.getElementById('music-toggle');
  const volume=document.getElementById('music-volume');
  const status=document.getElementById('music-status');
  const volumePanel=controls.querySelector('.music-volume-panel');
  let volumeTimer;
  let adjustingVolume=false;
  function hideVolume() {
    if(volumePanel.contains(document.activeElement)) toggle.focus({preventScroll:true});
    controls.classList.remove('volume-open');
    clearTimeout(volumeTimer);
  }
  function showVolume() {
    controls.classList.add('volume-open');
    clearTimeout(volumeTimer);
    if(!adjustingVolume) volumeTimer=setTimeout(hideVolume,3000);
  }
  window.addEventListener('scroll',hideVolume,{passive:true});
  for(const event of ['pointerenter','pointermove','focusin','input']) controls.addEventListener(event,showVolume);
  controls.addEventListener('pointerdown',()=>{adjustingVolume=true;showVolume();});
  for(const event of ['pointerup','pointercancel']) document.addEventListener(event,()=>{
    if(!adjustingVolume)return;
    adjustingVolume=false;showVolume();
  });
  controls.addEventListener('focusout',event=>{if(!controls.contains(event.relatedTarget))hideVolume();});
  controls.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();hideVolume();}
    else showVolume();
  });
  document.addEventListener('pointerdown',event=>{if(!controls.contains(event.target))hideVolume();});
  let enabled=true;
  let retryOnInteraction=true;
  let attempt=0;
  let selectedVolume=Number(volume.value)/100;
  let fadeTimer;
  let fading=false;
  const fadeDuration=800;
  function stopFade() {
    clearTimeout(fadeTimer);fading=false;
  }
  function fadeTo(target,onComplete) {
    stopFade();fading=true;
    const start=music.volume;const started=Date.now();
    function step() {
      const progress=Math.min(1,(Date.now()-started)/fadeDuration);
      const eased=progress*progress*(3-2*progress);
      music.volume=start+(target-start)*eased;
      if(progress<1)fadeTimer=setTimeout(step,16);
      else {fading=false;onComplete?.();}
    }
    step();
  }
  music.volume=0;
  controls.hidden=false;
  function render() {
    const playing=enabled&&!music.paused;
    toggle.setAttribute('aria-pressed',String(playing));
    const label=playing?'Pause background music':'Play background music';
    toggle.setAttribute('aria-label',label);
    toggle.title=label;
  }
  async function play() {
    const current=++attempt;
    stopFade();
    if(music.paused)music.volume=0;
    try {
      await music.play();
      if(current!==attempt)return;
      if(!enabled||document.hidden) music.pause();
      else {retryOnInteraction=false;status.textContent='';fadeTo(selectedVolume);}
    } catch(error) {
      if(current!==attempt) return;
      enabled=false;
      if(error.name==='NotAllowedError'&&retryOnInteraction) {
        status.textContent='Music is ready. Select the music icon to play.';
      } else {
        retryOnInteraction=false;
        status.textContent='Music could not start. Select the music icon to try again.';
      }
    }
    render();
  }
  toggle.addEventListener('click',()=>{
    showVolume();
    retryOnInteraction=false;
    enabled=!enabled;
    status.textContent='';
    if(enabled) void play();
    else {attempt++;fadeTo(0,()=>music.pause());render();}
  });
  volume.addEventListener('input',()=>{
    selectedVolume=Number(volume.value)/100;
    if(enabled&&!music.paused){
      if(fading)fadeTo(selectedVolume);
      else music.volume=selectedVolume;
    }
  });
  music.addEventListener('play',render);
  music.addEventListener('pause',render);
  music.addEventListener('error',()=>{
    attempt++;stopFade();enabled=false;retryOnInteraction=false;music.pause();music.volume=0;render();
    status.textContent='Music is currently unavailable. Please try again later.';
  });
  function retry(event) {
    if(!retryOnInteraction||document.hidden||event.target.closest('#music-controls'))return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    retryOnInteraction=false;enabled=true;void play();
  }
  document.addEventListener('pointerdown',retry);
  document.addEventListener('keydown',retry);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) {attempt++;stopFade();music.pause();music.volume=0;adjustingVolume=false;hideVolume();}
    else if(enabled) void play();
  });
  render();
  if(!document.hidden) void play();
})();
