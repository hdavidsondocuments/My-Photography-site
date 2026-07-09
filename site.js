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
  el.innerHTML = data.entries.map(e => `
    <div class="journal-entry">
      <div class="journal-date mono">${esc(e.date)}</div>
      <div>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.excerpt)}</p>
        <a href="${esc(e.link || '#')}">Continue reading →</a>
      </div>
    </div>`).join('');
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
