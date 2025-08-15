(() => {
  const header  = document.getElementById('site-header');
  const heroEnd = document.getElementById('hero-end');
  if (!header || !heroEnd) return;

  let io;
  let inFirstScreen = true;  // находимся ли ещё в пределах первого экрана (пока виден heroEnd)
  const TOP_THRESHOLD = 2;   // пиксели от самого верха, когда считаем, что "в самом верху"

  function showTopHeader() {
    header.classList.add('is-visible');
    header.classList.remove('is-below');
    header.classList.remove('-translate-y-full');
  }

  function hideHeader() {
    header.classList.remove('is-visible', 'is-below');
    header.classList.add('-translate-y-full');
  }

  function showBelowHeader() {
    header.classList.add('is-visible', 'is-below');
    header.classList.remove('-translate-y-full');
  }

  function updateState() {
    const scrollTop =
      document.scrollingElement?.scrollTop ?? window.pageYOffset ?? 0;

    if (!inFirstScreen) {
      // ниже hero
      showBelowHeader();
      return;
    }

    // ещё в первом экране:
    if (scrollTop <= TOP_THRESHOLD) {
      // самый верх hero — видимый «верхний» хедер без фона/CTA
      showTopHeader();
    } else {
      // скроллим внутри hero — хедер спрятан
      hideHeader();
    }
  }

  const setObserver = () => {
    const h = header.offsetHeight || 64;
    io?.disconnect?.();
    io = new IntersectionObserver(([entry]) => {
      // heroEnd виден => всё ещё первый экран
      inFirstScreen = entry.isIntersecting;
      updateState();
    }, { threshold: 0, rootMargin: `-${h}px 0px 0px 0px` });
    io.observe(heroEnd);
  };

  // скролл нужен, чтобы отлавливать "самый верх" внутри первого экрана
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (inFirstScreen) updateState();
    });
  }, { passive: true });

  setObserver();
  window.addEventListener('resize', setObserver, { passive: true });
  // первичная установка
  updateState();
})();