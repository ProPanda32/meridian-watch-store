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
  music.volume=Number(volume.value)/100;
  controls.hidden=false;
  function render() {
    const playing=!music.paused;
    toggle.setAttribute('aria-pressed',String(playing));
    const label=playing?'Pause background music':'Play background music';
    toggle.setAttribute('aria-label',label);
    toggle.title=label;
  }
  async function play() {
    const current=++attempt;
    try {
      await music.play();
      if(!enabled||document.hidden) music.pause();
      else {retryOnInteraction=false;status.textContent='';}
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
    else {attempt++;music.pause();render();}
  });
  volume.addEventListener('input',()=>{music.volume=Number(volume.value)/100;});
  music.addEventListener('play',render);
  music.addEventListener('pause',render);
  music.addEventListener('error',()=>{
    attempt++;enabled=false;retryOnInteraction=false;music.pause();render();
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
    if(document.hidden) {attempt++;music.pause();adjustingVolume=false;hideVolume();}
    else if(enabled) void play();
  });
  render();
  if(!document.hidden) void play();
})();
