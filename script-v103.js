const sceneCopies = [...document.querySelectorAll('[data-scene-copy]')];
const sceneDots = [...document.querySelectorAll('.scene-dot')];
const seqCanvas = document.querySelector('.seq-canvas');
const seqCtx = seqCanvas.getContext('2d');
const SEQ_COUNT = 30;
const seqFrames = { '0-1': [], '1-0': [], '1-2': [], '2-1': [] };
[['0-1', 'cover_01'], ['1-0', 'cover_01'], ['1-2', 'cover_02'], ['2-1', 'cover_02']].forEach(([key, folder]) => {
  for (let i = 0; i < SEQ_COUNT; i++) {
    const img = new Image();
    img.onload = () => updateScrollProgress();
    img.src = `assets/${folder}/${folder}_${String(i).padStart(2, '0')}.webp?v=2`;
    seqFrames[key].push(img);
  }
});
const hero = document.querySelector('.hero');
const heroNext = document.querySelector('.hero-next');
const trailToggle = document.querySelector('.trail-toggle');
const cursorGlow = document.querySelector('.cursor-glow');
let activeConfig = window.loadWentingConfig();
let currentScene = 0;
let waterEnabled = true;

/* ============ 配置驱动的全站内容渲染 ============ */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

const ICON_ARROW_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';
const ICON_ARROW_ROLE = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';
const ICON_PLAY = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>';
const ICON_ARROW_CONTACT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" class="contact-arrow" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';

const COLLECTION_ICONS = {
  video: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path><path d="m7 16.5-4.74-2.85"></path><path d="m7 16.5 5-3"></path><path d="M7 16.5v5.17"></path><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path><path d="m17 16.5-5-3"></path><path d="m17 16.5 4.74-2.85"></path><path d="M17 16.5v5.17"></path><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path><path d="M12 8 7.26 5.15"></path><path d="m12 8 4.74-2.85"></path><path d="M12 13.5V8"></path></svg>',
  grid: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>',
  circle: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m14.31 8 5.74 9.94"></path><path d="M9.69 8h11.48"></path><path d="m7.38 12 5.74-9.94"></path><path d="M9.69 16 3.95 6.06"></path><path d="M14.31 16H2.83"></path><path d="m16.62 12-5.74 9.94"></path></svg>'
};

function setSceneCopyFields(cfg) {
  const c = cfg.content;
  const copy0 = document.querySelector('[data-scene-copy="0"]');
  const copy1 = document.querySelector('[data-scene-copy="1"]');
  const copy2 = document.querySelector('[data-scene-copy="2"]');
  if (copy0) {
    const eyebrow = copy0.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = c.scene0Eyebrow;
    const h1 = copy0.querySelector('h1');
    if (h1) h1.innerHTML = `${escapeHtml(c.scene0TitleA)}<br /><em>${escapeHtml(c.scene0TitleB)}</em>`;
    const intro = copy0.querySelector('.hero-intro');
    if (intro) intro.textContent = c.heroIntro;
  }
  if (copy1) {
    const eyebrow = copy1.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = c.scene1Eyebrow;
    const nameLine = copy1.querySelector('.name-line');
    if (nameLine) nameLine.textContent = c.aboutTitle;
    const tagline = copy1.querySelector('.about-tagline');
    if (tagline) tagline.innerHTML = `<span class="line-block">${escapeHtml(c.aboutTaglineA)}</span><span class="line-block">${escapeHtml(c.aboutTaglineB)}</span>`;
    const role = copy1.querySelector('[data-config-field="aboutRole"]');
    if (role) role.textContent = c.aboutRole;
    const bio = copy1.querySelector('[data-config-field="aboutIntro"]');
    if (bio) bio.innerHTML = escapeHtml(c.aboutIntro).replace(/\n/g, '<br />');
    const summary = copy1.querySelector('.creator-summary');
    if (summary) summary.innerHTML = (c.creatorSummary || []).map((item) => `<span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.label)}</small></span>`).join('');
    const skills = copy1.querySelector('.skill-line');
    if (skills) skills.innerHTML = (c.skills || []).map((skill) => `<span>${escapeHtml(skill)}</span>`).join('');
    const link = copy1.querySelector('.text-link');
    if (link) link.innerHTML = `${escapeHtml(c.chatLink)} <span>↗</span>`;
  }
  if (copy2) {
    const h2 = copy2.querySelector('h2');
    if (h2) h2.innerHTML = `<span class="line-block">${escapeHtml(c.scene2TitleA)}</span><span class="line-block">${escapeHtml(c.scene2TitleB)}</span>`;
    const list = copy2.querySelector('.experience-list');
    if (list) list.innerHTML = (c.career || []).map((item) => `<div><i class="tl-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15"><path fill="#fff" d="M12 0C12.8 6.4 17.6 11.2 24 12C17.6 12.8 12.8 17.6 12 24C11.2 17.6 6.4 12.8 0 12C6.4 11.2 11.2 6.4 12 0Z"/></svg></i><span>${escapeHtml(item.period)}</span><strong>${escapeHtml(item.role)} <small>${escapeHtml(item.company)}</small></strong><p>${escapeHtml(item.desc)}</p></div>`).join('');
    const link = copy2.querySelector('.text-link');
    if (link) link.innerHTML = `${escapeHtml(c.worksLink)} <span>↗</span>`;
  }
  const heroName = document.querySelector('.hero-name');
  if (heroName) heroName.innerHTML = '<img class="hero-brand-img" src="assets/hero/brand-logo.webp" alt="SHUYAN" /><small class="hero-role-img"><img src="assets/hero/brand-visual.webp" alt="BRAND AND VISUAL DESIGN" /></small>';
}

function renderProjects(cfg) {
  const CAP_EN_LABELS = { '01': 'BRAND', '02': '3D ANIMATION', '03': 'AIGC', '04': 'SOCIAL' };
  const capEn = (p) => CAP_EN_LABELS[p.number] || p.type || p.category || '';
  const featured = cfg.projects?.featured || [];
  const grid = document.querySelector('.featured-grid');
  if (grid) {
    grid.innerHTML = featured.map((project, index) => {
      if (Array.isArray(project.points)) {
        return `
      <article class="project-card featured-card featured-${index} capability-card cap-${String(project.type || '').toLowerCase()} cap-n${String(project.number || String(index + 1).padStart(2, '0'))}" data-project="${escapeHtml(project.title)}">
        <div class="cap-visual">
          <span class="project-number">${escapeHtml(project.number || String(index + 1).padStart(2, '0'))}</span>
          <span class="cap-deco" aria-hidden="true"></span>
        </div>
        <div class="cap-info">
          <div class="cap-text">
            <h3 class="cap-title">${escapeHtml(String(project.title).replace(/·\s*$/, ''))}</h3>
            <p class="cap-sub">${escapeHtml(capEn(project))}</p>
          </div>
          <button class="cap-open" type="button" aria-label="查看${escapeHtml(project.title)}项目">${ICON_ARROW_OPEN}<span>查看项目</span></button>
        </div>
      </article>`;
      }
      return `
      <article class="project-card featured-card featured-${index}" data-project="${escapeHtml(project.title)}">
        <button class="card-trigger" type="button" aria-label="浏览${escapeHtml(project.title)}项目">
          <div class="project-cover">
            <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title)}项目封面" />
            <span class="project-number">${escapeHtml(project.number || String(index + 1).padStart(2, '0'))}</span>
            ${project.behance ? `<span class="behance-feature cover-feature"><b>Be</b> ${escapeHtml(project.behanceText || 'Behance 精选')}</span>` : ''}
            <span class="open-project">${project.openText ? `<span>${escapeHtml(project.openText)}</span>` : ''}${ICON_ARROW_OPEN}</span>
          </div>
          <div class="project-caption"><div><p>${escapeHtml(project.category)}</p><h3>${escapeHtml(project.title)}</h3></div><span class="project-role">${escapeHtml(project.role)} ${ICON_ARROW_ROLE}</span></div>
        </button>
      </article>`;
    }).join('');
  }
  const collection = cfg.projects?.collection || [];
  const cgrid = document.querySelector('.collections-grid');
  if (cgrid) {
    cgrid.innerHTML = collection.map((project) => {
      if (Array.isArray(project.points)) {
        return `
      <article class="project-card collection-card capability-card cap-${String(project.type || '').toLowerCase()} cap-n${String(project.number || '')}" data-project="${escapeHtml(project.title)}">
        <div class="cap-visual">
          <span class="project-number">${escapeHtml(project.number || '')}</span>
          <span class="cap-deco" aria-hidden="true"></span>
        </div>
        <div class="cap-info">
          <div class="cap-text">
            <h3 class="cap-title">${escapeHtml(String(project.title).replace(/·\s*$/, ''))}</h3>
            <p class="cap-sub">${escapeHtml(capEn(project))}</p>
          </div>
          <button class="cap-open" type="button" aria-label="查看${escapeHtml(project.title)}项目">${ICON_ARROW_OPEN}<span>查看项目</span></button>
        </div>
      </article>`;
      }
      return `
      <article class="project-card collection-card" data-project="${escapeHtml(project.title)}">
        <button class="card-trigger" type="button" aria-label="浏览${escapeHtml(project.title)}">
          <div class="project-cover">
            <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title)}" />
            <span class="collection-icon">${COLLECTION_ICONS[project.icon] || COLLECTION_ICONS.video}</span>
            <span class="open-project" aria-hidden="true">${ICON_PLAY}</span>
          </div>
          <div class="project-caption"><div><p>${escapeHtml(project.category)}</p><h3>${escapeHtml(project.title)}</h3></div><span>${escapeHtml(project.count)}</span></div>
        </button>
      </article>`;
    }).join('');
  }
}

function renderContact(cfg) {
  const c = cfg.content;
  const kicker = document.querySelector('.contact-top .section-kicker');
  if (kicker) kicker.textContent = c.contactKicker;
  const lead = document.querySelector('#contact-lead');
  if (lead) lead.textContent = c.contactLead;
  const heading = document.querySelector('#contact-heading');
  if (heading) heading.innerHTML = `${escapeHtml(c.contactHeading1)}<br /><em>${escapeHtml(c.contactHeading2)}</em>${ICON_ARROW_CONTACT}`;
  const email = document.querySelector('#email-link');
  if (email) {
    email.firstChild.textContent = `${c.email} `;
    email.href = `mailto:${c.email}`;
  }
  const wechat = document.querySelector('.wechat-contact strong');
  if (wechat) wechat.textContent = c.wechat;
  const socials = document.querySelector('.social-links');
  if (socials) {
    socials.innerHTML = (cfg.socials || []).map((social) => `<a href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer noopener"><span>${escapeHtml(social.name)}</span><small>${escapeHtml(social.sub)}</small><span aria-hidden="true">↗</span></a>`).join('');
  }
}

function renderWorksHeading(cfg) {
  const c = cfg.content;
  const title = document.querySelector('#works-title');
  if (title) title.textContent = c.worksTitle;
  const italic = document.querySelector('#works-italic');
  if (italic) italic.textContent = c.worksItalic;
  const heading = document.querySelector('#works-heading');
  if (heading && heading.__scrollFloat) {
    scrollFloatTargets.forEach(([el, o]) => { if (el && el.__scrollFloat) { el.__scrollFloat = false; initScrollFloat(el, o); } });
  }
  const aside = document.querySelector('.section-aside');
  if (aside) aside.innerHTML = `${escapeHtml(c.worksAsideLine1)}<br />${escapeHtml(c.worksAsideLine2)}<span>${escapeHtml(c.worksAsideTag)}</span>`;
  const collectionHeading = document.querySelector('.collection-heading h3');
  if (collectionHeading) collectionHeading.textContent = c.collectionHeading;
  const collectionSub = document.querySelector('.collection-heading > span');
  if (collectionSub) collectionSub.textContent = c.collectionSub;
}

function renderFooter(cfg) {
  const c = cfg.content;
  const socials = (cfg.socials || []).map(s => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(s.name)} ${escapeHtml(s.sub)}</a>`).join('');
  const footer = document.querySelector('.site-footer');
  if (footer) footer.innerHTML = `<div class="view-all-projects">
      <a href="#home" class="view-all-link">BACK TO TOP <span>↗</span></a>
    </div>
    <div class="footer-inner">
      <h2><span>Crafting</span><strong>visual stories.</strong></h2>
      <div class="footer-top">
        <div><small>EMAIL</small><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></div>
        <div><small>WECHAT</small><a href="#contact">${escapeHtml(c.wechat)}</a></div>
        <div><small>CALL ME</small><div class="social-links">${socials}</div></div>
      </div>
      <div class="footer-bottom">
        <div><small>MENU</small><div><a href="#works">WORKS</a><a href="#about">ABOUT</a><a href="#contact">CONTACT</a></div></div>
        <div><small>LEGAL</small><div><a href="#home">${escapeHtml(c.footerLeft)}</a><a href="#home">${escapeHtml(c.footerMid)}</a></div></div>
      </div>
    </div>`;
}

function renderModalDefaults(cfg) {
  const title = document.querySelector('.modal-title');
  if (title) title.textContent = cfg.modal.title;
}

function renderSiteContent(nextConfig) {
  setSceneCopyFields(nextConfig);
  renderWorksHeading(nextConfig);
  renderProjects(nextConfig);
  renderContact(nextConfig);
  renderFooter(nextConfig);
  renderModalDefaults(nextConfig);
}

function applyConfig(nextConfig) {
  activeConfig = nextConfig;
  const root = document.documentElement;
  root.style.setProperty('--ink', nextConfig.colors.ink);
  root.style.setProperty('--ink-soft', nextConfig.colors.inkSoft);
  root.style.setProperty('--blue', nextConfig.colors.blue);
  root.style.setProperty('--accent', nextConfig.colors.accent);
  root.style.setProperty('--muted', nextConfig.colors.muted);
  root.style.setProperty('--body-size', `${nextConfig.typography.baseSize}px`);
  root.style.setProperty('--hero-title-vw', nextConfig.typography.heroTitle);
  root.style.setProperty('--section-title-vw', nextConfig.typography.sectionTitle);
  root.style.setProperty('--section-space', `${nextConfig.typography.sectionSpace}rem`);
  root.style.setProperty('--motion-duration', `${nextConfig.motion.transition}ms`);

  document.title = nextConfig.pageTitle || document.title;
  const brandNameEl = document.querySelector('#brand-name');
  if (brandNameEl) brandNameEl.textContent = nextConfig.brand;
  const brandSuffixEl = document.querySelector('#brand-suffix');
  if (brandSuffixEl) brandSuffixEl.textContent = nextConfig.brandSuffix;
  renderSiteContent(nextConfig);
}

sceneDots.forEach((dot) => dot.addEventListener('click', () => {
  const scene = Number(dot.dataset.scene);
  const stage = document.querySelector('.scroll-stage');
  if (!stage) return;
  const target = scene === 0 ? 0 : stage.offsetTop + (stage.offsetHeight - window.innerHeight) * (scene / 3);
  window.scrollTo({ top: target, behavior: 'smooth' });
}));
heroNext.addEventListener('click', () => {
  const stage = document.querySelector('.scroll-stage');
  if (!stage) return;
  const maxScroll = stage.offsetTop + stage.offsetHeight - window.innerHeight;
  const cur = window.scrollY;
  if (cur < maxScroll * 0.34) window.scrollTo({ top: stage.offsetTop + (stage.offsetHeight - window.innerHeight) / 3, behavior: 'smooth' });
  else if (cur < maxScroll * 0.67) window.scrollTo({ top: stage.offsetTop + (stage.offsetHeight - window.innerHeight) * 2 / 3, behavior: 'smooth' });
  else document.querySelector('#works')?.scrollIntoView({ behavior: 'smooth' });
});
document.querySelectorAll('.nav-scene').forEach((btn) => {
  btn.addEventListener('click', () => {
    const scene = Number(btn.dataset.scene);
    const stage = document.querySelector('.scroll-stage');
    if (!stage) return;
    const target = scene === 0 ? 0 : stage.offsetTop + (stage.offsetHeight - window.innerHeight) * (scene / 3);
    window.scrollTo({ top: target, behavior: 'smooth' });
  });
});
document.querySelector('.next-screen')?.addEventListener('click', () => {
  const stage = document.querySelector('.scroll-stage');
  if (!stage) return;
  const maxScroll = stage.offsetTop + stage.offsetHeight - window.innerHeight;
  const cur = window.scrollY;
  if (cur < maxScroll * 0.34) window.scrollTo({ top: stage.offsetTop + (stage.offsetHeight - window.innerHeight) / 3, behavior: 'smooth' });
  else if (cur < maxScroll * 0.67) window.scrollTo({ top: stage.offsetTop + (stage.offsetHeight - window.innerHeight) * 2 / 3, behavior: 'smooth' });
  else document.querySelector('#works')?.scrollIntoView({ behavior: 'smooth' });
});
trailToggle.addEventListener('click', () => {
  const isPressed = trailToggle.getAttribute('aria-pressed') === 'true';
  trailToggle.setAttribute('aria-pressed', String(!isPressed));
  trailToggle.setAttribute('aria-label', isPressed ? '开启水面拖尾' : '关闭水面拖尾');
  waterEnabled = !isPressed;
  document.body.classList.toggle('trail-off', !isPressed);
});

// Scroll-driven frame animation (replaces wheel/touch scene navigation)
let scrollTicking = false;
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function updateScrollProgress() {
  const stage = document.querySelector('.scroll-stage');
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const scrolled = Math.max(0, -rect.top);
  const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;

  // Map progress to frame: 0~1/3 = cover_01 (scene0->1), 1/3~0.42 = hold cover_02_00 (scene1 text show, crisp), 0.42~0.63 = cover_02 transition, >0.63 = cover_02_29 (scene2)
  let group, frameT;
  if (p <= 1 / 3) {
    group = 0;
    frameT = p / (1 / 3);
  } else if (p <= 0.42) {
    group = 1;
    frameT = 0;
  } else if (p <= 0.63) {
    group = 1;
    frameT = (p - 0.42) / (0.63 - 0.42);
  } else {
    group = 1;
    frameT = 1;
  }
  const idx = Math.round(frameT * (SEQ_COUNT - 1));
  const img = seqFrames[group === 0 ? '0-1' : '1-2'][idx];
  currentSeqImg = img;
  if (img && img.width) {
    const cw = seqCanvas.width, ch = seqCanvas.height;
    const scale = Math.max(cw / img.width, ch / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    seqCtx.clearRect(0, 0, cw, ch);
    seqCtx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // Copy opacity and entrance/exit motion based on progress
  const copy0 = document.querySelector('[data-scene-copy="0"]');
  const copy1 = document.querySelector('[data-scene-copy="1"]');
  const copy2 = document.querySelector('[data-scene-copy="2"]');

  // copy0: always hidden (user request)
  if (copy0) {
    copy0.style.opacity = '0';
    copy0.style.pointerEvents = 'none';
  }

  // copy1 (ABOUT ME): enter [0.27, 0.34], exit [0.42, 0.50]
  const enter1 = smoothstep(0.27, 0.34, p);
  const exit1 = smoothstep(0.42, 0.50, p);
  const o1 = enter1 * (1 - exit1);
  const y1 = (1 - enter1) * 40 - exit1 * 40;
  if (copy1) {
    copy1.style.opacity = String(o1);
    copy1.style.transform = `translateY(calc(-50% + ${y1}px))`;
    copy1.style.pointerEvents = o1 > 0.5 ? 'auto' : 'none';
    copy1.classList.remove('is-hidden');
  }

  // copy2 (EXPERIENCE): fade in place — stays vertically centered at all scroll positions
  const enter2 = smoothstep(0.56, 0.63, p);
  const o2 = enter2;
  const y2 = 0;
  if (copy2) {
    copy2.style.opacity = String(o2);
    copy2.style.transform = `translate(-50%, -50%) translateY(${y2}px)`;
    copy2.style.pointerEvents = o2 > 0.5 ? 'auto' : 'none';
    copy2.classList.remove('is-hidden');
  }

  // Update dots
  const activeDot = p < 0.2 ? 0 : p < 0.5 ? 1 : 2;
  sceneDots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === activeDot);
    dot.setAttribute('aria-current', i === activeDot ? 'step' : 'false');
  });

  // Update hero dataset for WebGL / layout
  hero.dataset.scene = String(activeDot);
  currentScene = activeDot;

  scrollTicking = false;
}

function onScroll() {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScrollProgress);
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

// Reproduce the reference site's soft WebGL refraction behind the transition layer.
function makeWater() {
  const size = 96 * 64;
  let currentX = new Float32Array(size);
  let currentY = new Float32Array(size);
  let nextX = new Float32Array(size);
  let nextY = new Float32Array(size);
  const pixels = new Uint8Array(size * 4);
  let pointerX = -1;
  let pointerY = -1;
  const sample = (field, x, y) => {
    x = Math.min(94, Math.max(1, x));
    y = Math.min(62, Math.max(1, y));
    const left = Math.floor(x);
    const top = Math.floor(y);
    const fx = x - left;
    const fy = y - top;
    const index = top * 96 + left;
    return (field[index] * (1 - fx) + field[index + 1] * fx) * (1 - fy)
      + (field[index + 96] * (1 - fx) + field[index + 97] * fx) * fy;
  };
  return {
    width: 96,
    height: 64,
    pixels,
    resetPointer() {
      pointerX = -1;
      pointerY = -1;
    },
    move(x, y) {
      x *= 96;
      y *= 64;
      if (pointerX < 0) {
        pointerX = x;
        pointerY = y;
        return;
      }
      const dx = Math.max(-6, Math.min(6, x - pointerX));
      const dy = Math.max(-6, Math.min(6, y - pointerY));
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
      const length = Math.min(2, Math.hypot(dx, dy));
      for (let step = 0; step <= steps; step += 1) {
        const px = pointerX + (x - pointerX) * step / steps;
        const py = pointerY + (y - pointerY) * step / steps;
        for (let row = Math.max(1, Math.floor(py - 5)); row < Math.min(63, py + 5); row += 1) {
          for (let col = Math.max(1, Math.floor(px - 5)); col < Math.min(95, px + 5); col += 1) {
            const offsetX = col - px;
            const offsetY = row - py;
            const weight = Math.exp(-(offsetX * offsetX + offsetY * offsetY) / 9) / steps;
            const index = row * 96 + col;
            currentX[index] = Math.max(-3, Math.min(3, currentX[index] + (dx * .3 - offsetY * length * .12) * weight));
            currentY[index] = Math.max(-3, Math.min(3, currentY[index] + (dy * .3 + offsetX * length * .12) * weight));
          }
        }
      }
      pointerX = x;
      pointerY = y;
    },
    update(delta) {
      const fade = .964 ** delta;
      for (let row = 1; row < 63; row += 1) {
        for (let col = 1; col < 95; col += 1) {
          const index = row * 96 + col;
          const shiftedX = col - currentX[index] * delta * .7;
          const shiftedY = row - currentY[index] * delta * .7;
          nextX[index] = (sample(currentX, shiftedX, shiftedY) * .92
            + (currentX[index - 1] + currentX[index + 1] + currentX[index - 96] + currentX[index + 96]) * .02) * fade;
          nextY[index] = (sample(currentY, shiftedX, shiftedY) * .92
            + (currentY[index - 1] + currentY[index + 1] + currentY[index - 96] + currentY[index + 96]) * .02) * fade;
        }
      }
      [currentX, nextX] = [nextX, currentX];
      [currentY, nextY] = [nextY, currentY];
      for (let index = 0; index < size; index += 1) {
        pixels[index * 4] = Math.round(127.5 + Math.max(-1, Math.min(1, currentX[index] * .6)) * 127.5);
        pixels[index * 4 + 1] = Math.round(127.5 + Math.max(-1, Math.min(1, currentY[index] * .6)) * 127.5);
        pixels[index * 4 + 2] = 0;
        pixels[index * 4 + 3] = 255;
      }
    }
  };
}

const waterCanvas = document.querySelector('.depth-canvas');
const waterSim = makeWater();
const WATER_VERTEX = 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
const WATER_FRAGMENT = 'precision highp float; varying vec2 uv; uniform sampler2D picture, water; uniform vec2 fit; uniform float strength; void main(){vec2 base=(uv-.5)*fit+.5; vec2 flow=(texture2D(water,uv).rg*255.-128.)/127.; vec2 refraction=flow*.06*strength; vec3 color=texture2D(picture,clamp(base+refraction,.001,.999)).rgb; color+=vec3(.65,.8,1.)*length(flow)*.08*strength; gl_FragColor=vec4(color,1.);}';
let waterGL = null;
let waterPictureTexture = null;
let waterFieldTexture = null;
let waterUploadedScene = -1;
let waterStrength = 0;
let waterLastFrame = 0;
let waterFailed = false;
let currentSeqImg = null;

function initWater() {
  if (!waterCanvas) return;
  const gl = waterCanvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;
  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vertex = createShader(gl.VERTEX_SHADER, WATER_VERTEX);
  const fragment = createShader(gl.FRAGMENT_SHADER, WATER_FRAGMENT);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const locations = {
    picture: gl.getUniformLocation(program, 'picture'),
    water: gl.getUniformLocation(program, 'water'),
    fit: gl.getUniformLocation(program, 'fit'),
    strength: gl.getUniformLocation(program, 'strength')
  };
  const createTexture = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  };
  waterGL = gl;
  waterPictureTexture = createTexture();
  waterFieldTexture = createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, waterPictureTexture);
  gl.uniform1i(locations.picture, 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, waterFieldTexture);
  gl.uniform1i(locations.water, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, waterSim.width, waterSim.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, waterSim.pixels);
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    waterCanvas.width = Math.round(waterCanvas.clientWidth * dpr);
    waterCanvas.height = Math.round(waterCanvas.clientHeight * dpr);
    gl.viewport(0, 0, waterCanvas.width, waterCanvas.height);
  };
  resize();
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(waterCanvas);
  else window.addEventListener('resize', resize);
  window.addEventListener('load', () => { resize(); setTimeout(resize, 100); });
  requestAnimationFrame(() => { resize(); setTimeout(resize, 200); });
let waterUploadedImage = null;
  const frame = (now) => {
    window.requestAnimationFrame(frame);
    if (waterFailed) return;
    if (!waterGL || !waterCanvas.width || !waterCanvas.height) return;
    const image = currentSeqImg;
    const paused = !waterEnabled || document.hidden || !image || !image.complete || !image.naturalWidth;
    waterCanvas.style.visibility = paused ? 'hidden' : 'visible';
    const delta = Math.min(2, Math.max(.3, (now - waterLastFrame) / 16.667));
    waterLastFrame = now;
    waterStrength += ((paused ? 0 : 1) - waterStrength) * .08;
    if (paused) return;
    waterSim.update(delta);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, waterFieldTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, waterSim.width, waterSim.height, gl.RGBA, gl.UNSIGNED_BYTE, waterSim.pixels);
    if (waterUploadedImage !== image) {
      waterUploadedImage = image;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, waterPictureTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } catch (error) {
        waterFailed = true;
        waterCanvas.style.visibility = 'hidden';
        return;
      }
    }
    const ratio = waterCanvas.width / waterCanvas.height;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    gl.uniform2f(locations.fit, Math.min(1, ratio / sourceRatio), Math.min(1, sourceRatio / ratio));
    gl.uniform1f(locations.strength, waterStrength);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  window.requestAnimationFrame(frame);
}

hero.addEventListener('pointermove', (event) => {
  if (!waterEnabled || !waterCanvas) return;
  const rect = waterCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  waterSim.move((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height);
}, { passive: true });
hero.addEventListener('pointerleave', () => waterSim.resetPointer(), { passive: true });

document.addEventListener('pointermove', (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

// 作品卡片 3D 倾斜（事件委托，适配配置驱动的动态渲染）
let tiltCard = null;
document.addEventListener('pointermove', (event) => {
  const card = event.target.closest('.project-card') || event.target.closest('.work-card');
  if (tiltCard && card !== tiltCard) {
    tiltCard.style.transform = '';
    tiltCard = null;
  }
  if (!card) return;
  tiltCard = card;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
  const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
  card.style.transform = `perspective(900px) rotateX(${y * -1.2}deg) rotateY(${x * 1.2}deg)`;
});

const modal = document.querySelector('.project-modal');
const modalTitle = document.querySelector('.modal-title');
const modalDesc = document.querySelector('.modal-desc');
const metaClient = document.querySelector('.meta-client');
const metaType = document.querySelector('.meta-type');
const metaYear = document.querySelector('.meta-year');
const metaCredits = document.querySelector('.meta-credits');
const modalGallery = document.querySelector('.modal-gallery');
const modalClose = document.querySelector('.modal-dot-close');
const modalMin = document.querySelector('.modal-dot-min');

function findProject(title) {
  const featured = activeConfig.projects?.featured || [];
  const collection = activeConfig.projects?.collection || [];
  return [...featured, ...collection].find((project) => project.title === title);
}

/* —— 详情弹窗瀑布流（Masonry 动效：blur 聚焦 + 底部飞入 + stagger + 悬停缩放） —— */
const MODAL_IMAGES = [
  'assets/marketing/万圣节_v4-02.webp',
  'assets/marketing/万圣节_v4-02.webp',
  'assets/marketing/妇女节.webp',
  'assets/3d/干货分享-01.webp',
  'assets/marketing/成分解析_v2_画板 1.webp',
  'assets/marketing/悠闲-封面.jpg',
  'assets/marketing/新年_v2-03.webp',
  'assets/marketing/旅行-01.webp',
  'assets/marketing/沐浴油_画板 1.webp',
  'assets/aigc/端午.webp',
  'assets/marketing/浴室-封面.jpg',
  'assets/marketing/数据-01.webp'
];
function buildMasonryItems(project) {
  const num = String(project?.number || '0').replace(/\D/g, '');
  const list = (window.PROJECT_IMAGES && window.PROJECT_IMAGES[num]) || MODAL_IMAGES;
  return list.map((it, i) => {
    const src = typeof it === 'string' ? it : it.s;
    const w = typeof it === 'object' ? (it.w || 0) : 0;
    const h = typeof it === 'object' ? (it.h || 0) : 0;
    const delay = (i * 0.05).toFixed(2);
    const isVideo = /\.(mp4|mov|webm)$/i.test(src);
    const ratio = (w > 0 && h > 0) ? (w / h) : 0;
    const isSpan = /淘宝服饰kv/.test(src) ? ' data-span="3"' : '';
    let media;
    if (isVideo) {
      media = `<video class="mg-img" src="${src}" controls preload="metadata" playsinline muted style="min-height:260px;background:#000"></video>`;
    } else if (w > 0 && h > 0) {
      media = `<img class="mg-img" loading="lazy" src="${src}" alt="" style="aspect-ratio:${w}/${h};background:#e9e9e9">`;
    } else {
      media = `<img class="mg-img" loading="lazy" src="${src}" alt="" style="min-height:260px;background:#e9e9e9">`;
    }
    return `<div class="mg-item" data-ar="${ratio}" data-v="${isVideo ? 1 : 0}"${isSpan} style="--d:${delay}s">${media}</div>`;
  }).join('');
}

// 瀑布流布局：按顺序把每个条目放入当前最矮的列，3 列，无空白；data-span="3" 条目单独占一整行（三列宽）
function layoutMasonry(gallery) {
  const items = gallery.querySelectorAll('.mg-item');
  if (!items.length) return;
  const W = gallery.clientWidth;
  const G = 12;
  const COLS = 3;
  const colW = Math.floor((W - (COLS - 1) * G) / COLS);
  const heights = [0, 0, 0];
  items.forEach(el => {
    const ar = parseFloat(el.dataset.ar) || 0;
    const isV = el.dataset.v === '1';
    const isSpan = el.dataset.span === '3';
    if (isSpan) {
      const rowW = colW * COLS + G * (COLS - 1);
      const rowTop = Math.max(...heights);
      const h = (ar > 0) ? Math.round(rowW / ar) : 300;
      el.style.width = rowW + 'px';
      el.style.left = '0px';
      el.style.top = rowTop + 'px';
      heights[0] = heights[1] = heights[2] = rowTop + h + G;
      return;
    }
    const h = (ar > 0) ? Math.round(colW / ar) : (isV ? 260 : 300);
    let c = 0;
    for (let i = 1; i < COLS; i++) if (heights[i] < heights[c]) c = i;
    el.style.width = colW + 'px';
    el.style.left = (c * (colW + G)) + 'px';
    el.style.top = heights[c] + 'px';
    heights[c] += h + G;
  });
  gallery.style.height = (Math.max(...heights) - G) + 'px';
}

function openProjectModal(project) {
  const title = project?.title || 'Project';
  modalTitle.textContent = title;
  const desc = String(project?.description || '').trim() || (Array.isArray(project?.points) ? project.points.join(' · ') : activeConfig.modal.body);
  modalDesc.textContent = desc;
  const d = project?.detail || {};
  metaClient.textContent = d.client || '—';
  metaType.textContent = d.type || project?.category || '—';
  metaYear.textContent = d.year || '—';
  metaCredits.textContent = d.credits || '李淑雁 · WENTING';
  modalGallery.innerHTML = buildMasonryItems(project);
  modal.classList.remove('modal-anim');
  modal.showModal();
  try { layoutMasonry(modalGallery); } catch (e) { console.error('masonry', e); }
  document.body.classList.add('modal-open');
  setTimeout(() => modal.classList.add('modal-anim'), 40);
}

document.addEventListener('click', (event) => {
  const card = event.target.closest('.project-card') || event.target.closest('.work-card');
  if (!card) return;
  const project = findProject(card.dataset.project);
  openProjectModal(project);
});
function closeModal() {
  modal.classList.remove('modal-anim');
  modal.close();
  document.body.classList.remove('modal-open');
}
modalClose.addEventListener('click', closeModal);
modalMin.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const destination = document.querySelector(link.getAttribute('href'));
    if (destination && link.getAttribute('href') === '#works') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
});

// Initialize sequence canvas size and first frame
function initSeqCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  seqCanvas.width = Math.round(seqCanvas.clientWidth * dpr);
  seqCanvas.height = Math.round(seqCanvas.clientHeight * dpr);
  updateScrollProgress();
}
initSeqCanvas();
window.addEventListener('resize', initSeqCanvas);
applyConfig(activeConfig);
initWater();

// Continuous grainient backdrop spanning the works → creator → contact sections.
// Rendered live with a WebGL2 fragment shader (ported from @bg-effects/grainient,
// same params as the original backdrop video) so the animated grain gradient
// flows without a seam and without loading a large video file.
const FLOW_CFG = {
  uTimeSpeed: 0.25,
  uColorBalance: 0,
  uWarpStrength: 1,
  uWarpFrequency: 5,
  uWarpSpeed: 2,
  uWarpAmplitude: 50,
  uBlendAngle: 0,
  uBlendSoftness: 0.05,
  uRotationAmount: 550,
  uNoiseScale: 2,
  uGrainAmount: 0.1,
  uGrainScale: 2,
  uGrainAnimated: 0,
  uContrast: 1.5,
  uGamma: 1,
  uSaturation: 0.95,
  uRotation: 0,
  uBlur: 0,
  uCenterOffset: [0.04, -0.12],
  uZoom: 0.95,
  uColor1: [0xFF, 0x9F, 0xFC],
  uColor2: [0x00, 0x00, 0x00],
  uColor3: [0xA3, 0xB2, 0xF0]
};

const FLOW_VS = '#version 300 es\nvoid main() {\n  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);\n  gl_Position = vec4(pos, 0.0, 1.0);\n}';

const FLOW_FS = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform float uRotation;
uniform float uBlur;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a, b, t) smoothstep(a, b, t)
mat2 Rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(
      dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
      u.x
    ),
    mix(
      dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)),
      u.x
    ),
    u.y
  );
  return 0.5 + 0.5 * n;
}
void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv - 0.5 + uCenterOffset;
  float rotRad = radians(uRotation);
  if (abs(rotRad) > 0.01) tuv *= Rot(rotRad);
  tuv /= max(uZoom, 0.001);
  float t = iTime * uTimeSpeed;
  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * uNoiseScale);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians(-90.0));
  tuv *= Rot(radians((degree - 0.5) * uRotationAmount + 180.0));
  tuv.y *= ratio;
  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);
  vec3 colLav = uColor1;
  vec3 colOrg = uColor2;
  vec3 colDark = uColor3;
  float b = uColorBalance;
  float s = max(uBlendSoftness, 0.0);
  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendX = (tuv * blendRot).x;
  float edge0 = -0.3 - b - s;
  float edge1 = 0.2 - b + s;
  float v0 = 0.5 - b + s;
  float v1 = -0.3 - b - s;
  vec3 layer1 = mix(colDark, colOrg, S(edge0, edge1, blendX));
  vec3 layer2 = mix(colOrg, colLav, S(edge0, edge1, blendX));
  vec3 col = mix(layer1, layer2, S(v0, v1, tuv.y));
  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if (uGrainAnimated > 0.5) grainUv += vec2(iTime * 0.05);
  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrainAmount;
  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  float blurAmount = uBlur * 0.3;
  if (blurAmount > 0.01) col = mix(col, vec3(luma), blurAmount);
  col = clamp(col, 0.0, 1.0);
  fragColor = vec4(col, 1.0);
}`;

function initFlowGradient(canvas) {
  try {
    const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) return null;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'compile failed');
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, FLOW_VS);
    const fs = compile(gl.FRAGMENT_SHADER, FLOW_FS);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.useProgram(prog);
    const U = {};
    ['iResolution', 'iTime', 'uTimeSpeed', 'uColorBalance', 'uWarpStrength', 'uWarpFrequency', 'uWarpSpeed', 'uWarpAmplitude', 'uBlendAngle', 'uBlendSoftness', 'uRotationAmount', 'uNoiseScale', 'uGrainAmount', 'uGrainScale', 'uGrainAnimated', 'uContrast', 'uGamma', 'uSaturation', 'uRotation', 'uBlur', 'uCenterOffset', 'uZoom', 'uColor1', 'uColor2', 'uColor3'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    const C = FLOW_CFG;
    const c1 = C.uColor1.map((v) => v / 255);
    const c2 = C.uColor2.map((v) => v / 255);
    const c3 = C.uColor3.map((v) => v / 255);
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
    };
    resize();
    let rafId = 0;
    const frame = (now) => {
      gl.useProgram(prog);
      gl.uniform2f(U.iResolution, canvas.width, canvas.height);
      gl.uniform1f(U.iTime, now / 1000);
      gl.uniform1f(U.uTimeSpeed, C.uTimeSpeed);
      gl.uniform1f(U.uColorBalance, C.uColorBalance);
      gl.uniform1f(U.uWarpStrength, C.uWarpStrength);
      gl.uniform1f(U.uWarpFrequency, C.uWarpFrequency);
      gl.uniform1f(U.uWarpSpeed, C.uWarpSpeed);
      gl.uniform1f(U.uWarpAmplitude, C.uWarpAmplitude);
      gl.uniform1f(U.uBlendAngle, C.uBlendAngle);
      gl.uniform1f(U.uBlendSoftness, C.uBlendSoftness);
      gl.uniform1f(U.uRotationAmount, C.uRotationAmount);
      gl.uniform1f(U.uNoiseScale, C.uNoiseScale);
      gl.uniform1f(U.uGrainAmount, C.uGrainAmount);
      gl.uniform1f(U.uGrainScale, C.uGrainScale);
      gl.uniform1f(U.uGrainAnimated, C.uGrainAnimated);
      gl.uniform1f(U.uContrast, C.uContrast);
      gl.uniform1f(U.uGamma, C.uGamma);
      gl.uniform1f(U.uSaturation, C.uSaturation);
      gl.uniform1f(U.uRotation, C.uRotation);
      gl.uniform1f(U.uBlur, C.uBlur);
      gl.uniform2f(U.uCenterOffset, C.uCenterOffset[0], C.uCenterOffset[1]);
      gl.uniform1f(U.uZoom, C.uZoom);
      gl.uniform3fv(U.uColor1, c1);
      gl.uniform3fv(U.uColor2, c2);
      gl.uniform3fv(U.uColor3, c3);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(frame);
    };
    const start = () => { if (!rafId) rafId = requestAnimationFrame(frame); };
    const stop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } };
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    start();
    return { start, stop, destroy: () => { stop(); observer.disconnect(); document.removeEventListener('visibilitychange', () => {}); } };
  } catch (e) {
    console.warn('grainient renderer unavailable:', e && e.message);
    return null;
  }
}

const flowBg = document.querySelector('.flow-bg');
const worksSection = document.querySelector('.works-section');
const contactSection = document.querySelector('.contact-section') || document.querySelector('.site-footer');
function sizeFlowBg() {
  if (!flowBg || !worksSection || !contactSection) return;
  const top = worksSection.offsetTop;
  const bottom = contactSection.offsetTop + contactSection.offsetHeight;
  flowBg.style.top = top + 'px';
  flowBg.style.height = Math.max(0, bottom - top) + 'px';
}
sizeFlowBg();
window.addEventListener('resize', sizeFlowBg);
const flowCanvas = document.querySelector('.flow-bg-canvas');
if (flowCanvas) initFlowGradient(flowCanvas);

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'wenting-config-preview') return;
  applyConfig(window.mergeWentingConfig(window.WENTING_DEFAULTS, event.data.config || {}));
});


/* ===== ShinyText fade-in: all heading texts fade in scrubbed with scroll (bidirectional) ===== */
function initScrollFloat(el, opts) {
  if (!el) return;
  const stagger = (opts && opts.stagger) || 0.02;
  const endAt = (opts && opts.endAt) || 0.55;
  const split = !opts || opts.split !== false;
  let chars;
  if (split) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) { if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode); }
    let gi = 0;
    textNodes.forEach(node => {
      const frag = document.createDocumentFragment();
      Array.from(node.textContent).forEach(ch => {
        const s = document.createElement('span');
        s.className = 'scroll-float-char';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.animationDelay = (gi * 0.14).toFixed(2) + 's';
        gi++;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    chars = Array.from(el.querySelectorAll('.scroll-float-char'));
  } else {
    chars = [el];
  }
  if (!chars.length) return;
  el.__scrollFloat = true;
  let raf = null;
  const update = () => {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    let p = (vh * endAt - r.top) / (vh + r.height);
    p = Math.max(0, Math.min(1, p));
    const denom = Math.max(0.05, 1 - (chars.length - 1) * stagger);
    chars.forEach((c, i) => {
      let cp = (p - i * stagger) / denom;
      cp = Math.max(0, Math.min(1, cp));
      c.style.opacity = cp;
    });
  };
  let timer = null;
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = null; update(); });
    clearTimeout(timer);
    timer = setTimeout(update, 120);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
const scrollFloatTargets = [
  [document.querySelector('.works-section .section-kicker'), { stagger: 0.012, endAt: 1.12 }],
  [document.querySelector('.works-section .section-aside'), { split: false, stagger: 0, endAt: 1.12 }]
];
scrollFloatTargets.forEach(([el, o]) => initScrollFloat(el, o));
/* Card entrance: staggered fade-up when each grid scrolls into view */
(function initCardEntrance() {
  const grids = Array.from(document.querySelectorAll('.featured-grid, .collections-grid'));
  if (!grids.length) return;
  grids.forEach(g => {
    g.querySelectorAll('.capability-card').forEach(c => c.classList.add('card-hidden'));
  });
  const check = () => {
    const vh = window.innerHeight;
    grids.forEach(g => {
      if (g.__entered) return;
      const r = g.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) {
        g.__entered = true;
        g.querySelectorAll('.capability-card').forEach(c => c.classList.add('entered'));
      }
    });
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
  setInterval(check, 300);
})();

/* ===== 逐渐模糊：从第四页（works）到页脚，底部渐隐（参考 GradualBlur 组件） ===== */
(function initGradualBlur() {
  var targets = document.querySelectorAll('.works-section, .site-footer');
  targets.forEach(function (sec) {
    if (sec.__gb) return;
    sec.__gb = 1;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    var layer = document.createElement('div');
    layer.className = 'gradual-blur-layer';
    var count = 5, strength = 2;
    for (var i = 1; i <= count; i++) {
      var d = document.createElement('div');
      var progress = i / count;
      var blur = 0.0625 * (progress * count + 1) * strength;
      var p1 = ((100 / count) * (i - 1)).toFixed(1);
      var p2 = ((100 / count) * i).toFixed(1);
      var p3 = ((100 / count) * (i + 1)).toFixed(1);
      var p4 = ((100 / count) * (i + 2)).toFixed(1);
      var grad = 'transparent ' + p1 + '%, black ' + p2 + '%';
      if (p3 <= 100) grad += ', black ' + p3 + '%';
      if (p4 <= 100) grad += ', transparent ' + p4 + '%';
      d.style.cssText =
        'position:absolute;inset:0;' +
        'mask-image:linear-gradient(to bottom, ' + grad + ');' +
        '-webkit-mask-image:linear-gradient(to bottom, ' + grad + ');' +
        'backdrop-filter:blur(' + blur.toFixed(3) + 'rem);' +
        '-webkit-backdrop-filter:blur(' + blur.toFixed(3) + 'rem);';
      layer.appendChild(d);
    }
    sec.appendChild(layer);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          layer.classList.toggle('gb-clear', e.isIntersecting);
        });
      }, { threshold: 0.05 });
      io.observe(sec);
    }
  });
})();

/* ===== 导航栏随背景亮度适配：进入浅灰作品区时切换深色文字 ===== */
(function () {
  var header = document.querySelector('.site-header');
  var works = document.querySelector('.works-section');
  if (!header || !works) return;
  var update = function () {
    var r = works.getBoundingClientRect();
    var inLight = r.top < window.innerHeight * 0.25 && r.bottom > window.innerHeight * 0.4;
    header.classList.toggle('nav-on-light', inLight);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
