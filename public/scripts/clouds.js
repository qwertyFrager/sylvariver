

  // ===== Универсальный движок для [data-parallax] с поддержкой скоростей и диапазонов =====
(function () {
  // Найдём "секции-наблюдатели". Любой контейнер с data-scroll-scope (например, <section data-scroll-scope>)
  // Если не поставить атрибут, элементы будут привязаны к ближайшему родителю section/article/main/body.
  function closestScope(el) {
    return el.closest('[data-scroll-scope]') || el.closest('section, article, main') || document.body;
  }

  // Собираем все элементы
  const items = Array.from(document.querySelectorAll('[data-parallax]')).map(el => {
    const scope = closestScope(el);
    // Режим 1: speed (как у тебя было раньше)
    const speedX = parseFloat(el.dataset.speedX || '0');
    const speedY = parseFloat(el.dataset.speedY || '0');
    const speedS = parseFloat(el.dataset.scale || '0');

    // Режим 2: range — явные from/to
    const hasRange =
      el.dataset.fromX !== undefined || el.dataset.toX !== undefined ||
      el.dataset.fromY !== undefined || el.dataset.toY !== undefined ||
      el.dataset.fromScale !== undefined || el.dataset.toScale !== undefined;

    // Базовые значения
    const base = { x: 0, y: 0, s: 1 };

    el.style.willChange = 'transform';

    return {
      el,
      scope,
      mode: hasRange ? 'range' : 'speed',
      // speed mode
      speedX, speedY, speedS,
      // range mode
      fromX: el.dataset.fromX, toX: el.dataset.toX,
      fromY: el.dataset.fromY, toY: el.dataset.toY,
      fromS: el.dataset.fromScale, toS: el.dataset.toScale,
      // текущие вычисленные трансформы
      x: base.x, y: base.y, s: base.s,
    };
  });

  if (!items.length) return;

  // Группируем элементы по scope
  const byScope = new Map();
  for (const it of items) {
    if (!byScope.has(it.scope)) byScope.set(it.scope, []);
    byScope.get(it.scope).push(it);
  }

  // Активные скопы — только они анимируются
  const activeScopes = new Set();

  // IO наблюдает за скопами
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) activeScopes.add(e.target);
      else activeScopes.delete(e.target);
    }
    // стартуем rAF если нужно
    ensureRAF();
  }, { threshold: 0 });
  for (const scope of byScope.keys()) io.observe(scope);

  // Парсинг значения: число в px или проценты '%'
  function parseValue(v, axisLen) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s.endsWith('%')) {
      const p = parseFloat(s.slice(0, -1)) || 0;
      return axisLen * (p / 100);
    }
    // px по умолчанию
    const n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  let rafId = null;
  function ensureRAF() {
    if (rafId == null && activeScopes.size) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function tick() {
    rafId = null;
    // Если нет активных — выходим
    if (!activeScopes.size) return;

    const vh = window.innerHeight || document.documentElement.clientHeight;

    for (const scope of activeScopes) {
      const rect = scope.getBoundingClientRect();
      const total = rect.height + vh;                 // дистанция прокрутки
      const progress = clamp((vh - rect.top) / total, 0, 1); // 0..1, когда проскроллили scope

      // размеры для процентов
      const scopeW = rect.width || scope.clientWidth || window.innerWidth;
      const scopeH = rect.height || scope.clientHeight || window.innerHeight;

      const list = byScope.get(scope) || [];
      for (const it of list) {
        if (it.mode === 'speed') {
          // как у тебя было, но считаем относительно прогресса текущего scope
          // Чтобы «скорость» чувствовалась, домножим на длину пути (total)
          const delta = total * progress; // 0..total
          const tx = (it.speedX || 0) * delta;
          const ty = (it.speedY || 0) * delta;

          let s = 1 + (it.speedS || 0) * progress * 2; // немного усиленный чувствительный масштаб
          if (s < 0.75) s = 0.75;
          if (s > 1.25) s = 1.25;

          it.x = tx; it.y = ty; it.s = s;
        } else {
          // range: from -> to, линейная интерполяция по progress
          const fx = parseValue(it.fromX ?? 0, scopeW);
          const tx = parseValue(it.toX   ?? 0, scopeW);
          const fy = parseValue(it.fromY ?? 0, scopeH);
          const ty = parseValue(it.toY   ?? 0, scopeH);
          const fs = it.fromS != null ? parseFloat(it.fromS) : 1;
          const ts = it.toS   != null ? parseFloat(it.toS)   : 1;

          it.x = fx + (tx - fx) * progress;
          it.y = fy + (ty - fy) * progress;
          it.s = fs + (ts - fs) * progress;
        }

        // если есть отражение по X (классы Tailwind могут подменять transform), учтём это
        const flipX = it.el.classList.contains('scale-x-[-1]') ? ' scaleX(-1)' : '';
        it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) scale(${it.s})${flipX}`;
      }
    }

    // продолжаем, пока есть активные скопы
    ensureRAF();
  }

  // ресайз — перерисовать
  window.addEventListener('resize', () => { ensureRAF(); });
  // первый запуск, если какой-то scope уже виден
  ensureRAF();
})();