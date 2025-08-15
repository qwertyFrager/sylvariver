// collage.js — плавное "Ещё фото / Свернуть" по height
(function () {
  const section = document.querySelector('#photo-collage[data-collage]');
  if (!section) return;

  const wrap = section.querySelector('#collage-wrap');
  const fade = section.querySelector('#collage-fade');
  const btnMore = section.querySelector('#collage-more');
  const btnLess = section.querySelector('#collage-less');

  if (!wrap) return;

  // --- утилиты ---
  const $rows = () => Array.from(wrap.querySelectorAll(':scope > .grid')); // ряды коллажа

  // ждём загрузку всех img внутри wrap (чтобы высоты были точные)
  function waitImages() {
    const imgs = Array.from(wrap.querySelectorAll('img'));
    return Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        const done = () => { img.removeEventListener('load', done); img.removeEventListener('error', done); res(); };
        img.addEventListener('load', done); img.addEventListener('error', done);
      });
    }));
  }

  // высота "1 ряд + половина 2-го"
  function collapsedHeight() {
    const rows = $rows();
    if (rows.length === 0) return wrap.scrollHeight; // fallback
    const r1 = rows[0].getBoundingClientRect().height;
    const r2 = rows[1] ? rows[1].getBoundingClientRect().height : 0;
    return Math.round(r1 + r2 * 0.2);
  }

  // анимируем от start -> end по свойству height
  function animateTo(open) {
    const wasOpen = wrap.classList.contains('is-open');

    // фиксируем старт
    const startH = wrap.getBoundingClientRect().height;

    // задаём целевую высоту
    let endH;
    if (open) {
      // временно ставим auto, чтобы узнать scrollHeight
      const prevHeight = wrap.style.height;
      wrap.style.height = 'auto';
      endH = wrap.scrollHeight;
      wrap.style.height = prevHeight; // вернём
    } else {
      endH = collapsedHeight();
    }

    // если нет реального изменения — просто переключаем состояние
    if (Math.abs(endH - startH) < 1) {
      wrap.classList.toggle('is-open', open);
      btnMore?.classList.toggle('hidden', open);
      btnLess?.classList.toggle('hidden', !open);
      if (!open) { // при сворачивании слегка прокрутим к началу секции
        const top = section.getBoundingClientRect().top + window.scrollY - 16;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    // выставляем стартовую высоту и запускаем переход
    wrap.style.height = startH + 'px';
    // переключаем класс (для тени)
    wrap.classList.toggle('is-open', open);

    requestAnimationFrame(() => {
      wrap.style.height = endH + 'px';
    });

    const onEnd = () => {
      wrap.removeEventListener('transitionend', onEnd);
      // после анимации: открыто — высоту убираем (auto), закрыто — фиксируем collapsed
      if (open) {
        wrap.style.height = 'auto';
      } else {
        wrap.style.height = collapsedHeight() + 'px';
        // прокрутим к началу секции, если пользователь внизу
        const top = section.getBoundingClientRect().top + window.scrollY - 16;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
      btnMore?.classList.toggle('hidden', open);
      btnLess?.classList.toggle('hidden', !open);
    };
    wrap.addEventListener('transitionend', onEnd, { once: true });
  }

  // --- инициализация ---
  (async function init() {
    await waitImages();            // чтобы размеры были точные
    // ставим исходное состояние — свёрнуто и фиксируем высоту
    wrap.classList.remove('is-open');
    wrap.style.height = collapsedHeight() + 'px';
  })();

  // обработчики
  btnMore?.addEventListener('click', () => animateTo(true));
  btnLess?.addEventListener('click', () => animateTo(false));

  // пересчёт при ресайзе/оринетации/смене шрифтов
  let t;
  const recalc = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (wrap.classList.contains('is-open')) {
        // открыто — пусть будет auto, но обновим, чтобы исключить «скачки»
        wrap.style.height = 'auto';
      } else {
        wrap.style.height = collapsedHeight() + 'px';
      }
    }, 120);
  };
  window.addEventListener('resize', recalc);
})();