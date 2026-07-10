// Shared across every page: nav behavior, scroll reveal, and content loading.

function esc(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
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
}

function openLightbox(photos, startIndex, title){
  ensureLightboxDOM();
  _lightboxState = {photos, current: startIndex || 0, title: title || ''};
  _lightboxShow(_lightboxState.current);
  document.getElementById('sharedLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ============ JOURNAL PHOTO STACK ============
function setupJournalStack(wrap, images, title){
  if(!images || images.length === 0) return;

  if(images.length === 1){
    wrap.innerHTML = `<div class="stack-photo layer-0"><img src="${esc(images[0])}" alt="${esc(title)}"></div>
      <button class="stack-expand" aria-label="View fullscreen">⤢</button>`;
    wrap.querySelector('.stack-expand').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(images, 0, title);
    });
    return;
  }

  let current = 0;
  let hintShown = true;

  function render(){
    wrap.querySelectorAll('.stack-photo').forEach(el => el.remove());
    const order = [0,1,2].filter(o => o < images.length).map(o => images[(current + o) % images.length]);
    order.slice(0,3).reverse().forEach((src, i) => {
      const depth = order.slice(0,3).length - 1 - i;
      const div = document.createElement('div');
      div.className = 'stack-photo layer-' + depth;
      div.innerHTML = `<img src="${esc(src)}" alt="${esc(title)}">`;
      if(depth === 0){
        div.addEventListener('click', advance);
      }
      wrap.appendChild(div);
    });
    let badge = wrap.querySelector('.stack-badge');
    if(!badge){
      badge = document.createElement('div');
      badge.className = 'stack-badge';
      wrap.appendChild(badge);
    }
    badge.textContent = (current + 1) + ' / ' + images.length;
  }

  function advance(){
    const front = wrap.querySelector('.stack-photo.layer-0');
    if(front) front.classList.add('fading');
    if(hintShown){
      const hint = wrap.querySelector('.stack-hint');
      if(hint) hint.style.opacity = '0';
      hintShown = false;
    }
    setTimeout(() => {
      current = (current + 1) % images.length;
      render();
    }, 180);
  }

  render();

  const hint = document.createElement('div');
  hint.className = 'stack-hint';
  hint.textContent = 'Click to see more →';
  wrap.appendChild(hint);

  const expandBtn = document.createElement('button');
  expandBtn.className = 'stack-expand';
  expandBtn.setAttribute('aria-label', 'View fullscreen');
  expandBtn.textContent = '⤢';
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(images, current, title);
  });
  wrap.appendChild(expandBtn);
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
function initSite(){
  initHeaderScroll();
  initMobileNav();
  initContactForm();
}

// ---------- Render functions ----------

function renderHome(data){
  if(!data || !data.home) return;
  const h = data.home;
  if(h.heroPortrait) document.getElementById('heroBg').src = h.heroPortrait;
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
  el.innerHTML = data.items.slice(0,3).map(f => `
    <div class="frame"><img src="${esc(f.image)}" alt="${esc(f.caption)}">
      <div class="frame-label">${esc(f.frame)}</div>
      <div class="frame-cap">${esc(f.caption)}</div>
    </div>`).join('');
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

function renderJournal(data){
  const el = document.getElementById('journalList');
  if(!el || !data) return;
  if(!data.entries || data.entries.length === 0){
    el.innerHTML = `<p style="color:var(--ash); padding:32px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);">New field notes coming soon.</p>`;
    return;
  }
  el.innerHTML = data.entries.map((e, i) => `
    <div class="journal-entry ${i % 2 === 1 ? 'reverse' : ''} reveal">
      <div class="journal-photo"><div class="stack-wrap" data-entry="${i}"></div></div>
      <div class="journal-text">
        <div class="journal-date mono">${esc(e.date)}</div>
        <h3>${esc(e.title)}</h3>
        <div class="journal-story">${esc(e.story).split('\n\n').map(p => `<p style="margin-bottom:14px;">${p}</p>`).join('')}</div>
      </div>
    </div>`).join('');

  el.querySelectorAll('.stack-wrap').forEach(wrap => {
    const i = parseInt(wrap.dataset.entry, 10);
    const entry = data.entries[i];
    const rawImages = entry.images || [];
    const images = rawImages.slice(0, 5).map(img => typeof img === 'string' ? img : img.image);
    setupJournalStack(wrap, images, entry.title);
  });

  initReveal();
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
