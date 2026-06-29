// ── Sticky header ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── Mobile menu ──
const burger   = document.getElementById('burger');
const mobMenu  = document.getElementById('mobMenu');
const mobClose = document.getElementById('mobClose');
burger.addEventListener('click',   () => mobMenu.classList.add('open'));
mobClose.addEventListener('click', () => mobMenu.classList.remove('open'));
mobMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobMenu.classList.remove('open'));
});

// ── Language switcher ──
function applyLang(lang) {
  document.documentElement.lang = lang === 'tm' ? 'tk' : 'en';
  document.querySelectorAll('[data-tm]').forEach(el => {
    const text = el.dataset[lang] ?? el.dataset.en;
    if (text !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  localStorage.setItem('arwana-lang', lang);
}
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});
applyLang(localStorage.getItem('arwana-lang') || 'tm');

// ── Scroll fade-in ──
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.07) + 's';
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ── Counter animation ──
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const interval = 16;
  const steps    = duration / interval;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, interval);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hstat-num, .astat-num span[data-target]').forEach(el => counterObserver.observe(el));

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }
  });
});

// ── Project tabs ──
const projTabs   = document.querySelectorAll('.proj-tab');
const projPanels = document.querySelectorAll('.proj-panel');
projTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    projTabs.forEach(t  => t.classList.remove('active'));
    projPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('proj-' + tab.dataset.proj);
    if (panel) panel.classList.add('active');
    applyLang(localStorage.getItem('arwana-lang') || 'tm');
  });
});

// ── Contact form ──
const cform = document.querySelector('.cform');
if (cform) {
  cform.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = cform.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = '✓ Ugradyldy';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; cform.reset(); }, 3000);
  });
}

// ══════════════════════════════════════════════
// ELECTRIC DISCHARGE — exact wire paths traced from hero photo pixels
// Photo 1584x672, bg: cover center 30%
// Wires go RIGHT->LEFT (pylon -> ARWANA INER text)
// Torn inertia: charge -> burst -> charge
// ══════════════════════════════════════════════
(function initElectricCanvas() {
  const canvas  = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { canvas.style.opacity = '0'; return; }

  // Photo metrics (hero-sunset.jpg 1584x672)
  const PW = 1584, PH = 672;
  let W = 0, H = 0, bgS = 1, bgX = 0, bgY = 0, animId = null;

  // Wire paths in PHOTO PIXELS [x, y].
  // Direction: index 0 = LEFT (ARWANA INER text), last = RIGHT EDGE.
  // Right-side coordinates verified with PIL brightness scan.
  const WIRE_PX = [
    // Wire 1 — upper catenary: text→pylon [940,96]→right edge (scan: y 96→187)
    [
      [60,159],[100,162],[150,164],[200,167],[250,169],[300,171],[350,173],[400,170],
      [450,166],[500,162],[550,157],[600,151],[650,145],[700,136],[750,131],[800,123],
      [850,114],[900,105],[940,96],
      [1060,90],[1140,96],[1200,109],[1260,122],[1340,139],[1420,156],[1500,172],[1560,183],[1584,187]
    ],
    // Wire 2 — middle: text→pylon [940,191]→right edge (scan: y 191→275)
    [
      [60,171],[100,173],[150,175],[200,175],[250,175],[300,171],[350,173],[400,176],
      [450,177],[500,179],[550,181],[600,183],[650,184],[700,186],[750,187],[800,188],
      [850,189],[900,190],[940,191],
      [1060,207],[1160,213],[1260,230],[1360,243],[1460,255],[1560,272],[1584,275]
    ],
    // Wire 3 — lower: text→pylon arm [800,238]→right edge (scan: y 238→400)
    [
      [60,222],[100,228],[150,235],[200,242],[250,249],[300,256],[350,263],[400,270],
      [450,277],[500,284],[550,290],[600,296],[650,298],[700,279],[750,259],
      [800,238],
      [900,265],[1020,310],[1140,340],[1280,362],[1420,380],[1560,396],[1584,400]
    ],
  ];

  // Normalised t at pylon attachment per wire (index / (len-1)):
  // Wire 1: index 18 of 28 pts = 18/27; Wire 2: 18/26 = 18/25; Wire 3: 15/23 = 15/22
  const PYLON_T = [18/27, 18/25, 15/22];

  // Recompute background transform: background-size:cover; background-position:center 30%
  function computeBg() {
    bgS = Math.max(W / PW, H / PH);
    bgX = (W - PW * bgS) * 0.5;
    bgY = (H - PH * bgS) * 0.30;
  }

  // Photo pixel -> canvas pixel
  function p2c(px, py) {
    return { x: px * bgS + bgX, y: py * bgS + bgY };
  }

  // Precomputed canvas-space wires (rebuilt on resize)
  let wires = [];
  function buildWires() {
    wires = WIRE_PX.map(pts => pts.map(([px, py]) => p2c(px, py)));
  }

  // Interpolate canvas position along a wire (t 0->1 = right pylon -> left text)
  function wirePos(wi, t) {
    const pts = wires[wi], n = pts.length - 1;
    const s = Math.min(t * n, n - 1e-5);
    const i = Math.floor(s), f = s - i;
    const a = pts[i], b = pts[i + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  // Draw a jagged lightning bolt segment
  function drawBolt(x1, y1, x2, y2, alpha, bright) {
    if (alpha < 0.01) return;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) return;
    const nx = -dy / len, ny = dx / len;
    const segs = Math.max(2, Math.round(len / 8));
    const dev  = len * (bright ? 0.50 : 0.22);

    const pts = [[x1, y1]];
    for (let i = 1; i < segs; i++) {
      const tt = i / segs;
      const d  = (Math.random() - 0.5) * 2 * dev;
      pts.push([x1 + dx * tt + nx * d, y1 + dy * tt + ny * d]);
    }
    pts.push([x2, y2]);

    ctx.save();
    if (bright) {
      ctx.shadowColor = `rgba(255,220,60,${alpha * 0.75})`;
      ctx.shadowBlur  = 16;
      ctx.strokeStyle = `rgba(255,245,170,${alpha})`;
      ctx.lineWidth   = 2;
    } else {
      ctx.shadowColor = `rgba(210,150,20,${alpha * 0.45})`;
      ctx.shadowBlur  = 7;
      ctx.strokeStyle = `rgba(205,155,35,${alpha * 0.72})`;
      ctx.lineWidth   = 1;
    }
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.stroke();
    ctx.restore();
  }

  function makeSpark(wi, delay) {
    return {
      wi, t: 0, delay, born: null,
      state: 'charge',
      chargeTimer: 0,
      chargeNeed: 0.5 + Math.random() * 1.1,
      burstLeft: 0,
      trail: [],
      alpha: 0,
      dead: false,
      flash: 0,
      pylonFlash: 0,
      pylonFlashed: false,
    };
  }

  let sparks = [];

  function spawnAll() {
    sparks = [];
    WIRE_PX.forEach((_, wi) => {
      for (let k = 0; k < 2; k++) {
        sparks.push(makeSpark(wi, wi * 420 + k * 1100 + Math.random() * 700));
      }
    });
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    computeBg();
    buildWires();
  }

  let lastT = 0;

  function frame(now) {
    const dt = Math.min(now - lastT, 50) / 1000;
    lastT = now;
    ctx.clearRect(0, 0, W, H);

    // Faint static trace (exactly on photo wires)
    wires.forEach(wire => {
      ctx.save();
      ctx.strokeStyle = 'rgba(200,145,22,0.07)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(wire[0].x, wire[0].y);
      wire.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    });

    // Replenish sparks
    WIRE_PX.forEach((_, wi) => {
      if (sparks.filter(s => s.wi === wi && !s.dead).length < 2) {
        const sp = makeSpark(wi, 300 + Math.random() * 1400);
        sp.born = now;
        sparks.push(sp);
      }
    });

    sparks = sparks.filter(s => !s.dead);

    sparks.forEach(sp => {
      if (!sp.born) sp.born = now;
      if (now - sp.born < sp.delay) return;

      // Torn inertia state machine
      if (sp.state === 'charge') {
        sp.chargeTimer += dt;
        if (sp.chargeTimer >= sp.chargeNeed) {
          sp.state     = 'burst';
          sp.burstLeft = 0.06 + Math.random() * 0.11;
        }
      } else {
        const speed = 0.50 + Math.random() * 0.45;
        const move  = Math.min(sp.burstLeft, speed * dt);
        sp.t        += move;
        sp.burstLeft -= move;
        if (sp.burstLeft <= 0) {
          sp.state       = 'charge';
          sp.chargeTimer = 0;
          sp.chargeNeed  = 0.35 + Math.random() * 0.85;
        }
      }

      if (sp.t >= 1) { sp.t = 1; sp.flash = 1; sp.dead = true; }

      // Trigger pylon flash when spark reaches pylon attachment zone
      if (!sp.pylonFlashed && sp.t >= PYLON_T[sp.wi] - 0.02) {
        sp.pylonFlash   = 1.0;
        sp.pylonFlashed = true;
      }

      sp.alpha = sp.t < 0.05 ? sp.t / 0.05
               : sp.t > 0.90 ? (1 - sp.t) / 0.10
               : 1;

      const pos        = wirePos(sp.wi, sp.t);
      const isBursting = sp.state === 'burst' && sp.burstLeft > 0;

      sp.trail.push({ ...pos, burst: isBursting });
      if (sp.trail.length > 30) sp.trail.shift();

      for (let i = 1; i < sp.trail.length; i++) {
        const ratio  = i / sp.trail.length;
        const bright = sp.trail[i].burst;
        drawBolt(
          sp.trail[i-1].x, sp.trail[i-1].y,
          sp.trail[i].x,   sp.trail[i].y,
          ratio * sp.alpha * (bright ? 0.92 : 0.38),
          bright
        );
      }

      if (sp.alpha > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255,225,70,0.95)';
        ctx.shadowBlur  = isBursting ? 28 : 13;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isBursting ? 4.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,185,${sp.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      if (sp.flash > 0) {
        sp.flash = Math.max(0, sp.flash - dt * 2.8);
        ctx.save();
        ctx.shadowColor = 'rgba(255,210,50,0.95)';
        ctx.shadowBlur  = 55;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 9 * sp.flash, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(255,235,130,${sp.flash * 0.88})`;
        ctx.fill();
        ctx.restore();
      }

      // Pylon node burst — expanding ring at attachment point
      if (sp.pylonFlash > 0) {
        sp.pylonFlash = Math.max(0, sp.pylonFlash - dt * 2.2);
        const pp = wirePos(sp.wi, PYLON_T[sp.wi]);
        const pf = sp.pylonFlash;
        ctx.save();
        ctx.shadowColor = 'rgba(255,200,50,0.98)';
        ctx.shadowBlur  = 60;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, (3 + (1 - pf) * 22) * pf, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(255,238,140,${pf * 0.92})`;
        ctx.fill();
        ctx.restore();
      }
    });

    animId = requestAnimationFrame(frame);
  }

  function init() {
    resize();
    spawnAll();
    sparks.forEach(s => { s.born = performance.now(); });
    requestAnimationFrame(() => {
      canvas.style.opacity = '1';
      animId = requestAnimationFrame(frame);
    });
  }

  const ro = new ResizeObserver(() => {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    resize();
    animId = requestAnimationFrame(frame);
  });
  ro.observe(canvas.parentElement || document.body);

  init();
})();


// ══════════════════════════════════════════════
// PRODUCT MODAL
// ══════════════════════════════════════════════
const PRODUCTS = [
  {
    id: 'electrical',
    tag:   { tm: 'Elektrik',      en: 'Electrical' },
    title: { tm: 'Elektrik paýlaýjy enjamlary',        en: 'Electrical Distribution Equipment' },
    desc:  {
      tm: 'ÝPG, KRU we beýleki elektrik paýlaýjy enjamlary. Podstansiýa we paýlaýjy nokatlar üçin ähli görnüşdäki enjamlary üpjün edýäris. 220 kV çenli ähli güýç derejelerine laýyk gelýär.',
      en: 'Switchgear, KRU and other electrical distribution equipment. We supply all types of equipment for substations and distribution points. Compatible with all voltage levels up to 220 kV.',
    },
    images: [117,118,119,121,123,124,125].map(n => `images/products/img-${n}.jpg`),
  },
  {
    id: 'transformers',
    tag:   { tm: 'Transformator', en: 'Transformer' },
    title: { tm: 'Güýç transformatorlary',             en: 'Power Transformers' },
    desc:  {
      tm: 'Dürli güýç derejelerinde güýç transformatorlary. Pes we ýokary woltly transformatorlar, düwürme desgalary we podstansiýa transformatorlary. Uzak möhletleýin işlemek üçin taslanýar.',
      en: 'Power transformers at various voltage levels. Low and high voltage transformers, step-up/step-down units and substation transformers. Designed for long-term operation.',
    },
    images: [127,129,130,131,132,133,134,135,136,137,138,139,140,141,142,144].map(n => `images/products/img-${n}.jpg`),
  },
  {
    id: 'pumps',
    tag:   { tm: 'Öz önümimiz', en: 'Own Production' },
    title: { tm: 'Suwa basdyrylýan nasoslar',          en: 'Submersible Pumps' },
    desc:  {
      tm: 'Öz önümimiz — ýokary öndürijilikli suw nasos enjamlary. Çuň guýular, suw üpjünçiligi we suwaryş ulgamlary üçin niýetlenen. Agrotehnologiýa we senagat ulanylmak üçin laýyk.',
      en: 'Our own production — high-performance water pump equipment. Designed for deep wells, water supply and irrigation systems. Suitable for agricultural and industrial use.',
    },
    images: Array.from({ length: 7 }, (_, i) => `images/pumps/img-${145 + i}.jpg`),
  },
  {
    id: 'transport',
    tag:   { tm: 'Transport',    en: 'Transport' },
    title: { tm: 'Ýöriteleşdirilen ulaglar',           en: 'Specialized Vehicles' },
    desc:  {
      tm: 'Agyr ýük we ýörite tehnikalar parky. Uly göwrümli ýükleri, inženerçilik enjamlary we gurluşyk materiallaryny daşamak üçin ullanylýar. Giň gurply çäklere baryp bilýär.',
      en: 'Heavy cargo and special equipment fleet. Used for transporting oversized loads, engineering equipment and construction materials. Can reach remote areas across all regions.',
    },
    images: Array.from({ length: 8 }, (_, i) => `images/transport/img-${100 + i}.jpg`),
  },
];

const prodModal         = document.getElementById('prodModal');
const prodModalBackdrop = document.getElementById('prodModalBackdrop');
const prodModalClose    = document.getElementById('prodModalClose');
const pmTag             = document.getElementById('pmTag');
const pmTitle           = document.getElementById('pmTitle');
const pmDesc            = document.getElementById('pmDesc');
const pmGallery         = document.getElementById('pmGallery');

function openProdModal(productIndex) {
  const lang = localStorage.getItem('arwana-lang') || 'tm';
  const p    = PRODUCTS[productIndex];
  pmTag.textContent   = p.tag[lang]   || p.tag.en;
  pmTitle.textContent = p.title[lang] || p.title.en;
  pmDesc.textContent  = p.desc[lang]  || p.desc.en;

  pmGallery.innerHTML = p.images.map(src => `
    <div class="photo-item" data-src="${src}">
      <img src="${src}" loading="lazy" alt="">
      <div class="photo-ov">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
    </div>
  `).join('');

  prodModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProdModal() {
  prodModal.classList.remove('open');
  document.body.style.overflow = '';
}

prodModalClose.addEventListener('click',    closeProdModal);
prodModalBackdrop.addEventListener('click', closeProdModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && prodModal.classList.contains('open')) closeProdModal();
});

document.querySelectorAll('.prod-card').forEach((card, i) => {
  card.addEventListener('click', () => openProdModal(i));
});

// ══════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbCounter  = document.getElementById('lbCounter');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const lbBackdrop = document.getElementById('lbBackdrop');

let lbImages = [];
let lbIndex  = 0;

function openLightbox(items, index) {
  lbImages = items; lbIndex = index;
  showLbImage();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function showLbImage() {
  lbImg.src = lbImages[lbIndex];
  lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
}
function lbGoPrev() { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLbImage(); }
function lbGoNext() { lbIndex = (lbIndex + 1) % lbImages.length; showLbImage(); }

lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', lbGoPrev);
lbNext.addEventListener('click', lbGoNext);
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbGoPrev();
  if (e.key === 'ArrowRight') lbGoNext();
});
document.addEventListener('click', e => {
  const item = e.target.closest('.photo-item');
  if (!item) return;
  // Don't trigger lightbox from prod-card cover image click (opens prod modal instead)
  if (item.closest('.prod-card')) return;
  const panel    = item.closest('.proj-panel, .cert-grid, .prod-modal-gallery, section');
  const allItems = panel ? Array.from(panel.querySelectorAll('.photo-item')) : [item];
  const srcs     = allItems.map(i => i.dataset.src);
  const index    = allItems.indexOf(item);
  openLightbox(srcs, index);
});

/* ── Переключатель темы (убрать после утверждения) ── */
(function() {
  const btn   = document.getElementById('themeToggle');
  const label = btn.querySelector('.tt-label');

  if (localStorage.getItem('previewTheme') === 'navy') {
    document.body.classList.add('navy');
    label.textContent = 'Gold';
  }

  btn.addEventListener('click', () => {
    const isNavy = document.body.classList.toggle('navy');
    label.textContent = isNavy ? 'Gold' : 'Navy';
    localStorage.setItem('previewTheme', isNavy ? 'navy' : 'gold');
  });
})();
