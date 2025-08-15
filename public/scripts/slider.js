// ===== Главный слайдер под текстом =====
const mainSwiper = new Swiper('#main-swiper', {
  loop: true,
  speed: 700,
  spaceBetween: 24,
  effect: 'fade',
  fadeEffect: { crossFade: true },
  centeredSlides: true,
  pagination: {
    el: '#main-swiper .swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '#next-main',
    prevEl: '#prev-main',
  },
  keyboard: { enabled: true },
  preloadImages: false,
  lazy: { loadOnTransitionStart: true },
  watchSlidesProgress: true,
  zoom: { maxRatio: 3 }, // двойной клик/тап и pinch для увеличения
  // autoplay: { delay: 5000, disableOnInteraction: false },
});

// ===== Лайтбокс (полноэкранный просмотр) =====
const dlg = document.getElementById('lightbox');
const dlgImg = document.getElementById('lightbox-img');
const dlgClose = document.getElementById('lightbox-close');

dlgClose.addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => {
  const r = dlg.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
    dlg.close();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dlg.open) dlg.close();
});

// ====== Управление зумом внутри диалога ======
const stage = document.getElementById('lightbox-stage');
const imgEl = document.getElementById('lightbox-img');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoom100Btn = document.getElementById('zoom-100');
const fitBtn = document.getElementById('fit-screen');
const zoomLevel = document.getElementById('zoom-level');

let z = 1;            // текущий масштаб
let tx = 0, ty = 0;   // смещения для панорамирования
const Z_MIN = 0.5;
const Z_MAX = 5;
const Z_STEP = 0.25;

function applyTransform() {
  imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
  zoomLevel.textContent = `${Math.round(z * 100)}%`;
}

function centerImage() {
  tx = 0; ty = 0;
  applyTransform();
}

function fitToScreen() {
  z = 1;
  centerImage();
}

function setZoom(newZ, centerX, centerY) {
  const prev = z;
  z = Math.min(Z_MAX, Math.max(Z_MIN, newZ));

  const rect = imgEl.getBoundingClientRect();
  const cx = centerX ?? (rect.left + rect.width / 2);
  const cy = centerY ?? (rect.top + rect.height / 2);

  const dx = (cx - (rect.left + rect.width / 2));
  const dy = (cy - (rect.top + rect.height / 2));
  tx = (tx - dx) * (z / prev) + dx;
  ty = (ty - dy) * (z / prev) + dy;

  applyTransform();
}

// Кнопки зума
zoomInBtn.addEventListener('click', () => setZoom(z + Z_STEP));
zoomOutBtn.addEventListener('click', () => setZoom(z - Z_STEP));
zoom100Btn.addEventListener('click', () => { z = 1; centerImage(); });
fitBtn.addEventListener('click', fitToScreen);

// Двойной клик — быстрый зум
imgEl.addEventListener('dblclick', (e) => {
  if (z < 2) setZoom(z + 1, e.clientX, e.clientY);
  else setZoom(1, e.clientX, e.clientY);
});

// Колесо мыши — масштаб
stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  const dir = e.deltaY > 0 ? -Z_STEP : Z_STEP;
  setZoom(z + dir, e.clientX, e.clientY);
}, { passive: false });

// Панорамирование
let dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;
stage.addEventListener('pointerdown', (e) => {
  dragging = true; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  tx = stx + (e.clientX - sx);
  ty = sty + (e.clientY - sy);
  applyTransform();
});
stage.addEventListener('pointerup', () => { dragging = false; });
stage.addEventListener('pointercancel', () => { dragging = false; });

// Сброс трансформа при открытии диалога
function lightboxInitFor(src) {
  imgEl.src = src;
  z = 1; tx = 0; ty = 0;
  requestAnimationFrame(applyTransform);
}

// ===== Контекстные источники лайтбокса (перелистывание только в своей галерее) =====
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');

let lbIndex = 0;
let lbSources = [];
let lbRoot = null; // DOM-элемент корневой галереи

// --- ЗАМЕНИ ЭТУ ФУНКЦИЮ ПОЛНОСТЬЮ ---
function lightboxSetSources(rootEl) {
  lbRoot = rootEl;

  // 1) Если это swiper-галерея — собираем слайды без дубликатов
  const swiperImgs = rootEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img');
  if (swiperImgs.length) {
    lbSources = Array.from(swiperImgs)
      .map(el => el.currentSrc || el.src || el.getAttribute('data-src') || el.getAttribute('src'))
      .filter(Boolean);
    return;
  }

  // 2) Если это коллаж (секция с атрибутом data-collage)
  //    Берём только элементы, помеченные data-collage-img, чтобы порядок был правильный
  const collageContainer = rootEl.matches('[data-collage]')
    ? rootEl
    : rootEl.closest('[data-collage]');

  if (collageContainer) {
    const collageImgs = collageContainer.querySelectorAll('[data-collage-img] img');
    if (collageImgs.length) {
      lbSources = Array.from(collageImgs)
        .map(el => el.currentSrc || el.src)
        .filter(Boolean);
      return;
    }
  }

  // 3) Fallback — любые <img> внутри rootEl
  const anyImgs = rootEl.querySelectorAll('img');
  lbSources = Array.from(anyImgs).map(el => el.currentSrc || el.src).filter(Boolean);
}

function lightboxShowAt(index) {
  if (!lbRoot || !lbSources.length) return;
  lbIndex = (index + lbSources.length) % lbSources.length; // кольцевой
  const src = lbSources[lbIndex];
  lightboxInitFor(src);

  // прелоад соседних
  new Image().src = lbSources[(lbIndex + 1) % lbSources.length];
  new Image().src = lbSources[(lbIndex - 1 + lbSources.length) % lbSources.length];
}

// Кнопки в лайтбоксе
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxShowAt(lbIndex - 1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxShowAt(lbIndex + 1); });

// Стрелки клавиатуры
document.addEventListener('keydown', (e) => {
  if (!dlg.open) return;
  if (e.key === 'ArrowLeft')  lightboxShowAt(lbIndex - 1);
  if (e.key === 'ArrowRight') lightboxShowAt(lbIndex + 1);
});

// Свайпы по сцене
let swipeStartX = 0, swipeActive = false;
stage.addEventListener('pointerdown', (e) => {
  swipeStartX = e.clientX; swipeActive = true;
});
stage.addEventListener('pointerup', (e) => {
  if (!swipeActive) return;
  const dx = e.clientX - swipeStartX;
  swipeActive = false;
  if (Math.abs(dx) > 60 && Math.abs(tx) < 20) {
    if (dx < 0) lightboxShowAt(lbIndex + 1);
    else        lightboxShowAt(lbIndex - 1);
  }
});

// ===== Открытие лайтбокса из ГЛАВНОГО слайдера (только его фото) =====
document
  .querySelectorAll('#main-swiper .swiper-slide:not(.swiper-slide-duplicate) img')
  .forEach((img, idx) => {
    img.addEventListener('click', () => {
      const zoom = mainSwiper?.zoom;
      if (zoom && zoom.scale && zoom.scale > 1.01) return; // если уже зум в слайдере — не открываем

      const root = document.getElementById('main-swiper');
      lightboxSetSources(root);
      lightboxShowAt(idx);

      try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); }
    });
  });

// ===== Галереи внутри секции «Домики» (каждая листается отдельно) =====
document.querySelectorAll('[data-house]').forEach((card) => {
  const gal = card.querySelector('.house-gallery');
  const prev = card.querySelector('.house-prev');
  const next = card.querySelector('.house-next');
  const pag  = card.querySelector('.house-pagination');
  if (!gal) return;

  const sw = new Swiper(gal, {
    loop: true,
    speed: 600,
    spaceBetween: 12,
    navigation: { prevEl: prev, nextEl: next },
    pagination: { el: pag, clickable: true },
    preloadImages: false,
    lazy: { loadOnTransitionStart: true },
    watchSlidesProgress: true,
  });

  // Открытие из конкретной карточки — источники только её галереи
  const imgs = card.querySelectorAll('.house-gallery .swiper-slide:not(.swiper-slide-duplicate) img');
  imgs.forEach((img, idx) => {
    img.addEventListener('click', () => {
      if (typeof lightboxInitFor !== 'function' || typeof dlg === 'undefined') return;
      const root = card.querySelector('.house-gallery');
      lightboxSetSources(root);
      lightboxShowAt(idx);
      try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); }
    });
  });
});


// === Лайтбокс для коллажа ===
(() => {
  const collageRoot = document.querySelector('#photo-collage[data-collage]');
  if (!collageRoot) return;

  const imgs = Array.from(collageRoot.querySelectorAll('[data-collage-img] img'));
  imgs.forEach((img, idx) => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof lightboxInitFor !== 'function' || typeof dlg === 'undefined') return;

      lightboxSetSources(collageRoot);
      lightboxShowAt(idx);

      try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); }
    });
  });
})();


// ==== Галереи в блоке "Чем у нас заняться" (карточки-услуги) ====
document.querySelectorAll('[data-service]').forEach((card) => {
  const gal = card.querySelector('.service-gallery');
  const prev = card.querySelector('.service-prev');
  const next = card.querySelector('.service-next');
  const pag  = card.querySelector('.service-pagination');
  if (!gal) return;

  const sw = new Swiper(gal, {
    loop: true,
    speed: 600,
    spaceBetween: 12,
    navigation: { prevEl: prev, nextEl: next },
    pagination: { el: pag, clickable: true },
    preloadImages: false,
    lazy: { loadOnTransitionStart: true },
    watchSlidesProgress: true,
  });

  // Открытие в ЛАЙТБОКСЕ — только фото этой карточки
  const imgs = card.querySelectorAll('.service-gallery .swiper-slide:not(.swiper-slide-duplicate) img');
  imgs.forEach((img, idx) => {
    img.addEventListener('click', () => {
      if (typeof lightboxInitFor !== 'function' || typeof dlg === 'undefined') return;
      // передаём корень именно этой галереи — лайтбокс листает её
      lightboxSetSources(gal);
      lightboxShowAt(idx);
      try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); }
    });
  });
});