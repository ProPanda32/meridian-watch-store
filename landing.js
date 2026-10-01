(() => {
  const byId = id => document.getElementById(id);
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const copy = document.querySelector('.hero-copy');
  const header = document.querySelector('.site-header');
  const video = byId('hero-video');
  const toggle = byId('video-toggle');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlayback = !motion.matches;
  let inView = true;
  let failed = false;
  let frame = 0;

  video.controls = false;
  toggle.hidden = false;
  document.documentElement.classList.add('motion-ready');

  function syncPlaybackButton() {
    const label = video.paused ? 'Play film' : 'Pause film';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.querySelector('use').setAttribute('href', video.paused ? '#icon-play' : '#icon-pause');
  }

  function syncPlayback() {
    if (wantsPlayback && inView && !document.hidden && !failed) {
      video.play().catch(() => syncPlaybackButton());
    } else {
      video.pause();
    }
  }
  toggle.addEventListener('click', () => {
    wantsPlayback = video.paused;
    syncPlayback();
  });
  video.addEventListener('play', syncPlaybackButton);
  video.addEventListener('pause', syncPlaybackButton);
  function showPoster() {
    failed = true;
    video.hidden = true;
    toggle.hidden = true;
    byId('film-status').textContent = 'The film is unavailable. A still from the collection is shown.';
  }
  video.addEventListener('error', showPoster);
  const sources = video.querySelectorAll('source');
  let failedSources = 0;
  for (const source of sources) source.addEventListener('error', () => {
    failedSources += 1;
    if (failedSources === sources.length) showPoster();
  });
  document.addEventListener('visibilitychange', syncPlayback);

  // Pin briefly, then let normal page scrolling carry the film out of view.
  function updateScroll() {
    frame = 0;
    const travel = hero.offsetHeight - stage.offsetHeight;
    const progress = motion.matches ? 0 : Math.min(1, Math.max(0, -hero.getBoundingClientRect().top + header.offsetHeight) / Math.max(1, travel));
    const opacity = Math.max(0, 1 - progress * 1.3);
    hero.style.setProperty('--film-scale', String(1 + progress * .065));
    hero.style.setProperty('--copy-y', `${-progress * 40}px`);
    hero.style.setProperty('--copy-opacity', String(opacity));
    copy.inert = opacity < .05;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  motion.addEventListener('change', () => {
    wantsPlayback = !motion.matches;
    syncPlayback();
    scheduleScroll();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncPlayback();
    }).observe(stage);
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: .05 });
    for (const section of document.querySelectorAll('.section-top, .products, .editorial')) {
      section.classList.add('reveal');
      revealObserver.observe(section);
    }
  }
  updateScroll();
  syncPlayback();

  const menu = byId('menu-dialog');
  const menuToggle = byId('menu-toggle');
  menuToggle.addEventListener('click', () => {
    menu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => menuToggle.setAttribute('aria-expanded', 'false'));
  for (const link of menu.querySelectorAll('a')) link.addEventListener('click', () => menu.close());
  for (const button of document.querySelectorAll('[data-close-dialog]')) {
    button.addEventListener('click', () => button.closest('dialog').close());
  }

  const search = byId('search-dialog');
  const input = byId('watch-search');
  const data = window.MeridianStore;
  function renderSearch() {
    const query = input.value.trim().toLocaleLowerCase();
    const products = data.load().products.filter(product => product.active && `${product.name} ${product.style} ${product.description}`.toLocaleLowerCase().includes(query));
    byId('search-status').textContent = products.length ? `${products.length} ${products.length === 1 ? 'watch' : 'watches'}` : 'No watches found.';
    byId('search-results').innerHTML = products.map(product => `<button class="search-result" data-search-product="${data.escape(product.id)}"><img src="${data.escape(product.image)}" alt=""><span><strong>${data.escape(product.name)}</strong><small>${data.escape(product.style)}<br>${data.money(product.price)}</small></span></button>`).join('');
  }
  byId('search-toggle').addEventListener('click', () => {
    renderSearch();
    search.showModal();
    input.focus();
  });
  input.addEventListener('input', renderSearch);
  byId('search-results').addEventListener('click', event => {
    const result = event.target.closest('[data-search-product]');
    if (!result) return;
    search.close();
    window.showDetails(result.dataset.searchProduct);
  });
})();
