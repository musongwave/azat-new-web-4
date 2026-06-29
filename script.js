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
  document.documentElement.lang = lang === 'tm' ? 'tk' : lang === 'ru' ? 'ru' : 'en';
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
// ELECTRICAL GRID CANVAS — Amber / Gold palette
// ══════════════════════════════════════════════
(function initGridCanvas() {
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NODE_DEFS = [
    { nx: 0.52, ny: 0.28, type: 'large',  label: 'Aşgabat' },
    { nx: 0.88, ny: 0.18, type: 'large',  label: 'Lebap' },
    { nx: 0.72, ny: 0.78, type: 'large',  label: 'Mary' },
    { nx: 0.30, ny: 0.15, type: 'medium', label: '110kV' },
    { nx: 0.65, ny: 0.47, type: 'medium', label: '110kV' },
    { nx: 0.94, ny: 0.54, type: 'medium', label: '110kV' },
    { nx: 0.44, ny: 0.68, type: 'medium', label: '110kV' },
    { nx: 0.18, ny: 0.58, type: 'medium', label: '110kV' },
    { nx: 0.80, ny: 0.90, type: 'medium', label: '110kV' },
    { nx: 0.42, ny: 0.40, type: 'small' },
    { nx: 0.60, ny: 0.14, type: 'small' },
    { nx: 0.76, ny: 0.36, type: 'small' },
    { nx: 0.14, ny: 0.34, type: 'small' },
    { nx: 0.55, ny: 0.85, type: 'small' },
    { nx: 0.92, ny: 0.72, type: 'small' },
    { nx: 0.34, ny: 0.82, type: 'small' },
    { nx: 0.08, ny: 0.72, type: 'small' },
    { nx: 0.63, ny: 0.63, type: 'small' },
  ];

  const TYPE_CFG = {
    large:  { r: 10, fill: '#FEF3C7', glowColor: 'rgba(202,138,4,0.5)',  glowBlur: 24 },
    medium: { r: 6,  fill: '#CA8A04', glowColor: 'rgba(202,138,4,0.3)',  glowBlur: 14 },
    small:  { r: 3,  fill: '#A16207', glowColor: null,                    glowBlur: 0  },
  };

  const CONNECT_DIST = 0.38;
  const PULSE_COUNT  = 12;

  let W = 0, H = 0;
  let nodes = [], connections = [], pulses = [];
  let animId = null;

  function buildNodes() {
    nodes = NODE_DEFS.map(def => ({
      ...def, x: 0, y: 0,
      floatAmp:    2 + Math.random() * 2,
      floatPeriod: (8 + Math.random() * 7) * 1000,
      floatOffset: Math.random() * Math.PI * 2,
      flashAlpha:  0,
    }));
  }

  function buildConnections() {
    connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].nx - nodes[j].nx;
        const dy = nodes[i].ny - nodes[j].ny;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECT_DIST) {
          const isMain = nodes[i].type !== 'small' && nodes[j].type !== 'small';
          connections.push({ a: i, b: j, width: isMain ? 1.5 : 1 });
        }
      }
    }
  }

  function makePulse() {
    if (!connections.length) return null;
    return {
      conn:     connections[Math.floor(Math.random() * connections.length)],
      forward:  Math.random() < 0.5,
      progress: Math.random(),
      speed:    0.003 + Math.random() * 0.004,
    };
  }

  function buildPulses() {
    pulses = Array.from({ length: PULSE_COUNT }, makePulse);
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    nodes.forEach(n => { n.x = n.nx * W; n.y = n.ny * H; });
  }

  function getFloatY(node, t) {
    if (reduced) return 0;
    return node.floatAmp * Math.sin((t / node.floatPeriod) * Math.PI * 2 + node.floatOffset);
  }

  function drawConnections() {
    connections.forEach(({ a, b, width }) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.strokeStyle = 'rgba(161,98,7,0.25)';
      ctx.lineWidth   = width;
      ctx.stroke();
    });
  }

  function drawNode(node, t) {
    const cfg = TYPE_CFG[node.type];
    const x   = node.x;
    const y   = node.y + getFloatY(node, t);

    if (cfg.glowBlur > 0) {
      ctx.save();
      ctx.shadowColor = cfg.glowColor;
      ctx.shadowBlur  = cfg.glowBlur + node.flashAlpha * 30;
      ctx.beginPath();
      ctx.arc(x, y, cfg.r, 0, Math.PI * 2);
      ctx.fillStyle = cfg.fill;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(x, y, cfg.r, 0, Math.PI * 2);
    ctx.fillStyle = cfg.fill;
    ctx.fill();

    if (node.type === 'large' && node.flashAlpha > 0) {
      ctx.beginPath();
      ctx.arc(x, y, cfg.r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(202,138,4,${node.flashAlpha * 0.7})`;
      ctx.lineWidth   = 2;
      ctx.stroke();
    }

    if (node.label && node.type !== 'small') {
      ctx.font      = '600 9px Jost, sans-serif';
      ctx.fillStyle = 'rgba(161,98,7,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y + cfg.r + 13);
    }
  }

  function drawPulse(pulse, t) {
    if (!pulse) return;
    const na = nodes[pulse.conn.a];
    const nb = nodes[pulse.conn.b];
    const p  = pulse.forward ? pulse.progress : 1 - pulse.progress;
    const px = na.x + (nb.x - na.x) * p;
    const py = (na.y + getFloatY(na, t)) + ((nb.y + getFloatY(nb, t)) - (na.y + getFloatY(na, t))) * p;

    ctx.save();
    ctx.shadowColor = 'rgba(202,138,4,0.6)';
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(202,138,4,0.92)';
    ctx.fill();
    ctx.restore();
  }

  function stepPulses() {
    pulses.forEach((pulse, i) => {
      if (!pulse) { pulses[i] = makePulse(); return; }
      pulse.progress += pulse.speed;
      if (pulse.progress >= 1) {
        const arrIdx = pulse.forward ? pulse.conn.b : pulse.conn.a;
        nodes[arrIdx].flashAlpha = 1;
        pulses[i] = makePulse();
      }
    });
  }

  function stepFlashes(dt) {
    nodes.forEach(n => {
      if (n.flashAlpha > 0) n.flashAlpha = Math.max(0, n.flashAlpha - dt / 400);
    });
  }

  let lastT = 0;
  function draw(t) {
    const dt = Math.min(t - lastT, 50);
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    if (!reduced) pulses.forEach(p => drawPulse(p, t));
    nodes.forEach(n => drawNode(n, t));
    if (!reduced) { stepPulses(); stepFlashes(dt); }
    animId = requestAnimationFrame(draw);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    nodes.forEach(n => drawNode(n, 0));
  }

  function init() {
    buildNodes();
    buildConnections();
    buildPulses();
    resize();
    requestAnimationFrame(() => {
      canvas.style.opacity = '1';
      if (reduced) { drawStatic(); } else { animId = requestAnimationFrame(draw); }
    });
  }

  const ro = new ResizeObserver(() => {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    resize();
    if (reduced) { drawStatic(); } else { animId = requestAnimationFrame(draw); }
  });
  ro.observe(canvas.parentElement);

  init();
})();

// ══════════════════════════════════════════════
// PRODUCT MODAL
// ══════════════════════════════════════════════
const PRODUCTS = [
  {
    id: 'electrical',
    tag:   { tm: 'Elektrik',      en: 'Electrical',    ru: 'Электрооборудование' },
    title: { tm: 'Elektrik paýlaýjy enjamlary',        en: 'Electrical Distribution Equipment',          ru: 'Распределительное электрооборудование' },
    desc:  {
      tm: 'ÝPG, KRU we beýleki elektrik paýlaýjy enjamlary. Podstansiýa we paýlaýjy nokatlar üçin ähli görnüşdäki enjamlary üpjün edýäris. 220 kV çenli ähli güýç derejelerine laýyk gelýär.',
      en: 'Switchgear, KRU and other electrical distribution equipment. We supply all types of equipment for substations and distribution points. Compatible with all voltage levels up to 220 kV.',
      ru: 'Коммутационные аппараты, КРУ и прочее распределительное оборудование. Поставляем все типы оборудования для подстанций и распределительных пунктов. Совместимо со всеми классами напряжения до 220 кВ.',
    },
    images: [117,118,119,121,123,124,125].map(n => `images/products/img-${n}.jpg`),
  },
  {
    id: 'transformers',
    tag:   { tm: 'Transformator', en: 'Transformer',   ru: 'Трансформатор' },
    title: { tm: 'Güýç transformatorlary',             en: 'Power Transformers',                         ru: 'Силовые трансформаторы' },
    desc:  {
      tm: 'Dürli güýç derejelerinde güýç transformatorlary. Pes we ýokary woltly transformatorlar, düwürme desgalary we podstansiýa transformatorlary. Uzak möhletleýin işlemek üçin taslanýar.',
      en: 'Power transformers at various voltage levels. Low and high voltage transformers, step-up/step-down units and substation transformers. Designed for long-term operation.',
      ru: 'Силовые трансформаторы различных классов напряжения. Трансформаторы низкого и высокого напряжения, повышающие/понижающие агрегаты и трансформаторы для подстанций. Проектируются для долгосрочной эксплуатации.',
    },
    images: [127,129,130,131,132,133,134,135,136,137,138,139,140,141,142,144].map(n => `images/products/img-${n}.jpg`),
  },
  {
    id: 'pumps',
    tag:   { tm: 'Öz önümimiz', en: 'Own Production', ru: 'Собственное производство' },
    title: { tm: 'Suwa basdyrylýan nasoslar',          en: 'Submersible Pumps',                          ru: 'Погружные насосы' },
    desc:  {
      tm: 'Öz önümimiz — ýokary öndürijilikli suw nasos enjamlary. Çuň guýular, suw üpjünçiligi we suwaryş ulgamlary üçin niýetlenen. Agrotehnologiýa we senagat ulanylmak üçin laýyk.',
      en: 'Our own production — high-performance water pump equipment. Designed for deep wells, water supply and irrigation systems. Suitable for agricultural and industrial use.',
      ru: 'Собственное производство — высокопроизводительное насосное оборудование. Предназначено для глубоких скважин, систем водоснабжения и орошения. Подходит для сельскохозяйственного и промышленного использования.',
    },
    images: Array.from({ length: 7 }, (_, i) => `images/pumps/img-${145 + i}.jpg`),
  },
  {
    id: 'transport',
    tag:   { tm: 'Transport',    en: 'Transport',      ru: 'Транспорт' },
    title: { tm: 'Ýöriteleşdirilen ulaglar',           en: 'Specialized Vehicles',                       ru: 'Специализированный транспорт' },
    desc:  {
      tm: 'Agyr ýük we ýörite tehnikalar parky. Uly göwrümli ýükleri, inženerçilik enjamlary we gurluşyk materiallaryny daşamak üçin ullanylýar. Giň gurply çäklere baryp bilýär.',
      en: 'Heavy cargo and special equipment fleet. Used for transporting oversized loads, engineering equipment and construction materials. Can reach remote areas across all regions.',
      ru: 'Парк тяжёлого и специализированного транспорта. Используется для перевозки крупногабаритных грузов, инженерного оборудования и строительных материалов. Может добраться до отдалённых районов во всех регионах.',
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
