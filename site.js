// Shared across every page: nav behavior, scroll reveal, and content loading.

function esc(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function slugify(str){
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function loadJSON(path){
  try{
    const res = await fetch(path, {cache:'no-store'});
    if(!res.ok) throw new Error('not ok');
    return await res.json();
  }catch(err){
    return null;
  }
}

function initHeaderScroll(){
  const header = document.getElementById('masthead');
  if(!header) return;
  if(header.dataset.solid === 'true'){
    header.classList.add('scrolled');
    return;
  }
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

function initMobileNav(){
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if(!navToggle || !navLinks) return;
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

function initReveal(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
}

// ============ SHARED LIGHTBOX (used by essay.html and journal.html) ============
let _lightboxState = null;
let _lightboxShow = null;

function ensureLightboxDOM(){
  if(document.getElementById('sharedLightbox')) return;
  const div = document.createElement('div');
  div.className = 'lightbox';
  div.id = 'sharedLightbox';
  div.innerHTML = `
    <button class="lightbox-close" id="lbClose">Close ✕</button>
    <button class="lightbox-arrow prev" id="lbPrev" aria-label="Previous photo">‹</button>
    <div class="lightbox-img-wrap"><img id="lbImg" src="" alt=""></div>
    <button class="lightbox-arrow next" id="lbNext" aria-label="Next photo">›</button>
    <div class="lightbox-caption" id="lbCaption"></div>
    <div class="lightbox-counter" id="lbCounter"></div>
  `;
  document.body.appendChild(div);

  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');

  function show(i){
    const st = _lightboxState;
    st.current = (i + st.photos.length) % st.photos.length;
    const p = st.photos[st.current];
    const src = typeof p === 'string' ? p : p.image;
    const cap = typeof p === 'string' ? '' : (p.caption || '');
    lbImg.src = src;
    lbImg.alt = cap || st.title || '';
    lbCaption.textContent = cap;
    lbCounter.textContent = (st.current + 1) + ' / ' + st.photos.length;
  }
  _lightboxShow = show;

  function close(){
    div.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(_lightboxState.current - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(_lightboxState.current + 1));
  div.addEventListener('click', (e) => { if(e.target === div) close(); });
  document.addEventListener('keydown', (e) => {
    if(!div.classList.contains('open')) return;
    if(e.key === 'ArrowLeft') show(_lightboxState.current - 1);
    else if(e.key === 'ArrowRight') show(_lightboxState.current + 1);
    else if(e.key === 'Escape') close();
  });
  attachSwipe(div, {
    onSwipeLeft: () => show(_lightboxState.current + 1),
    onSwipeRight: () => show(_lightboxState.current - 1)
  });
}

function openLightbox(photos, startIndex, title){
  ensureLightboxDOM();
  _lightboxState = {photos, current: startIndex || 0, title: title || ''};
  _lightboxShow(_lightboxState.current);
  document.getElementById('sharedLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ============ TOUCH SWIPE HELPER ============
function attachSwipe(el, handlers){
  let startX = 0, startY = 0, tracking = false;
  el.addEventListener('touchstart', (e) => {
    if(e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, {passive: true});
  el.addEventListener('touchend', (e) => {
    if(!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // ignore short or mostly-vertical swipes
    if(dx < 0 && handlers.onSwipeLeft) handlers.onSwipeLeft();
    else if(dx > 0 && handlers.onSwipeRight) handlers.onSwipeRight();
  }, {passive: true});
}

function renderJournal(data){
  const el = document.getElementById('journalList');
  if(!el || !data) return;
  if(!data.entries || data.entries.length === 0){
    el.innerHTML = `<p style="color:var(--ash); padding:32px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);">New field notes coming soon.</p>`;
    return;
  }
  el.innerHTML = data.entries.map((e, i) => {
    const rawImages = e.images || [];
    const images = rawImages.map(img => typeof img === 'string' ? img : img.image);
    const thumb = images[0] || '';
    const slug = e.id || slugify(e.title);
    const link = slug ? `journal-entry.html?id=${encodeURIComponent(slug)}` : '#';
    const countBadge = images.length > 1 ? `<div class="frame-label" style="position:absolute; bottom:10px; left:10px; top:auto;">${images.length} photos</div>` : '';
    return `
    <div class="journal-entry ${i % 2 === 1 ? 'reverse' : ''} reveal journal-card" data-href="${esc(link)}">
      <div class="journal-photo" style="position:relative;">
        <img src="${esc(thumb)}" alt="${esc(e.title)}">
        ${countBadge}
      </div>
      <div class="journal-text">
        <div class="journal-date mono">${esc(e.date)}</div>
        <h3>${esc(e.title)}</h3>
        <p style="color:var(--ink-soft); font-size:0.97rem; font-family:'IBM Plex Sans', sans-serif; margin-bottom:16px;">${esc(e.teaser || '')}</p>
        <a class="story-link" href="${esc(link)}">Read the full story →</a>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.journal-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if(e.target.tagName === 'A') return;
      window.location.href = card.dataset.href;
    });
  });

  initReveal();
}

function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const note = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.classList.add('show');
    form.reset();
  });
}

// Call this once at the top of every page's script.
function renderPlacesMap(essaysData){
  const mapEl = document.getElementById('placesMap');
  const emptyMsg = document.getElementById('placesMapEmpty');
  if(!mapEl || typeof L === 'undefined') return;

  const items = (essaysData && essaysData.items) ? essaysData.items : [];
  const pins = items.filter(it => it.location && typeof it.location.lat === 'number' && typeof it.location.lng === 'number');

  if(pins.length === 0){
    mapEl.style.display = 'none';
    if(emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  const map = L.map('placesMap', {scrollWheelZoom: false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 18
  }).addTo(map);

  const markers = [];
  pins.forEach(item => {
    const icon = L.divIcon({className: '', html: '<div class="place-pin"></div>', iconSize: [16,16]});
    const marker = L.marker([item.location.lat, item.location.lng], {icon}).addTo(map);
    const link = item.id ? `essay.html?id=${encodeURIComponent(item.id)}` : '#';
    marker.bindPopup(`
      <div class="place-popup">
        <span class="eyebrow">${esc(item.label || '')}</span>
        <h4>${esc(item.title || '')}</h4>
        <a href="${esc(link)}">View project →</a>
      </div>
    `);
    markers.push(marker);
  });

  if(markers.length === 1){
    map.setView(markers[0].getLatLng(), 6);
  } else {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  }
}

function initSite(){
  initHeaderScroll();
  initMobileNav();
  initContactForm();
}

// ---------- Render functions ----------

function renderHome(data){
  if(!data || !data.home) return;
  const h = data.home;
  if(h.heroPortrait){
    const heroImg = document.getElementById('heroBg');
    heroImg.addEventListener('load', () => heroImg.classList.add('loaded'), {once: true});
    heroImg.src = h.heroPortrait;
  }
  if(h.name) document.getElementById('heroName').textContent = h.name;
  if(h.tagline) document.getElementById('heroTagline').textContent = h.tagline;
  if(data.about && data.about.bio) {
    const introEl = document.getElementById('homeIntroText');
    if(introEl) introEl.textContent = data.about.bio;
  }
}

function renderDispatches(data){
  const el = document.getElementById('dispatchFrames');
  if(!el || !data || !data.items) return;
  const items = data.items.slice(0,15);
  if(items.length === 0) return;

  const frameHtml = (f) => `
    <div class="filmstrip-frame">
      <img src="${esc(f.image)}" alt="${esc(f.caption)}">
      <div class="frame-label">${esc(f.frame)}</div>
      <div class="frame-cap">${esc(f.caption)}</div>
    </div>`;

  // Duplicate the sequence so the CSS animation (translateX -50%) loops seamlessly.
  el.innerHTML = items.map(frameHtml).join('') + items.map(frameHtml).join('');

  el.querySelectorAll('.filmstrip-frame').forEach((frameEl, i) => {
    const item = items[i % items.length];
    frameEl.addEventListener('click', () => {
      openLightbox(items.map(it => ({image: it.image, caption: it.caption})), i % items.length);
    });
  });
}

function renderEssays(data){
  const el = document.getElementById('essaysList');
  if(!el || !data || !data.items) return;
  el.innerHTML = data.items.map((s, i) => {
    const p = s.preview || {};
    const link = s.id ? `essay.html?id=${encodeURIComponent(s.id)}` : '';
    return `
    <div class="story ${i % 2 === 1 ? 'reverse' : ''} reveal">
      <div class="story-media"><img src="${esc(p.image)}" alt="${esc(s.title)}"></div>
      <div class="story-text">
        <div class="story-eyebrow mono">${esc(s.label)}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <div class="story-thumbs">
          <img src="${esc(p.thumb1)}" alt="Supporting image">
          <img src="${esc(p.thumb2)}" alt="Supporting image">
          <img src="${esc(p.thumb3)}" alt="Supporting image">
        </div>
        ${link ? `<a class="story-link" href="${esc(link)}" target="_blank" rel="noopener">Read the full story →</a>` : ''}
      </div>
    </div>`;
  }).join('');
  initReveal();
}

function formatStory(story){
  return (story || '')
    .split(/\n\s*\n/)
    .map(para => esc(para.trim()).replace(/\n/g, '<br>'))
    .filter(p => p.length > 0)
    .map(p => `<p style="margin-bottom:14px;">${p}</p>`)
    .join('');
}

function renderAboutPage(data){
  if(!data) return;
  const bio = document.getElementById('aboutBio');
  const quote = document.getElementById('aboutQuote');
  const location = document.getElementById('aboutLocation');
  const portrait = document.getElementById('aboutPortrait');
  const a = data.about || {};
  if(bio) bio.textContent = a.bio || '';
  if(quote) quote.textContent = a.quote || '';
  if(location) location.textContent = data.location || '';
  if(portrait && a.portrait) portrait.src = a.portrait;
}

function renderContactPage(data){
  if(!data) return;
  const c = data.contact || {};
  const ids = {
    contactEmail: c.email,
    contactPressEmail: c.pressEmail,
    contactLocation: data.location
  };
  Object.keys(ids).forEach(id => {
    const el = document.getElementById(id);
    if(el && ids[id]) el.textContent = ids[id];
  });
  const ig = document.getElementById('socialInstagram');
  if(ig && c.instagram) ig.href = c.instagram;
}
