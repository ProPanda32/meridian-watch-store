(() => {
  const music=document.getElementById('background-music');
  const controls=document.getElementById('music-controls');
  const toggle=document.getElementById('music-toggle');
  const label=document.getElementById('music-label');
  const volume=document.getElementById('music-volume');
  const status=document.getElementById('music-status');
  let enabled=false;
  let attempt=0;
  music.volume=Number(volume.value)/100;
  controls.hidden=false;
  document.body.classList.add('music-ready');
  function render() {
    const playing=!music.paused;
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label',enabled?'Pause background piano':'Play background piano');
    toggle.querySelector('use').setAttribute('href',playing?'#icon-pause':'#icon-play');
    label.textContent=playing?'Piano on':'Piano off';
  }
  async function play() {
    const current=++attempt;
    try {
      await music.play();
      if(!enabled||document.hidden) music.pause();
    } catch {
      if(current!==attempt) return;
      enabled=false;
      status.textContent='Piano could not start. Press play to try again.';
    }
    render();
  }
  toggle.addEventListener('click',()=>{
    enabled=!enabled;
    status.textContent='';
    if(enabled) {render();void play();}
    else {attempt++;music.pause();render();}
  });
  volume.addEventListener('input',()=>{music.volume=Number(volume.value)/100;});
  music.addEventListener('play',render);
  music.addEventListener('pause',render);
  music.addEventListener('error',()=>{
    attempt++;enabled=false;music.pause();render();
    status.textContent='Piano is currently unavailable. Please try again later.';
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) {attempt++;music.pause();}
    else if(enabled) void play();
  });
  render();
})();
