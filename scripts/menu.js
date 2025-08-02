(function () {
    const overlay = document.getElementById('menu-overlay');
    const btnMobile = document.getElementById('menuToggle');
    const btnDesktop = document.getElementById('menuToggleDesktop');
    const drawerMobile = document.getElementById('site-drawer');
    const drawerDesktop = document.getElementById('site-drawer-desktop');

    // Открытие любого меню — показать оверлей
    function showOverlay() {
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100');
    }

    // Закрытие — скрыть
    function hideOverlay() {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100');
    }

    // Добавляем обработчики
    if (btnMobile) {
      btnMobile.addEventListener('click', () => {
        const isOpen = btnMobile.classList.toggle('active');
        if (isOpen) showOverlay();
        else hideOverlay();
      });
    }

    if (btnDesktop) {
      btnDesktop.addEventListener('click', () => {
        const isOpen = btnDesktop.classList.toggle('active');
        if (isOpen) showOverlay();
        else hideOverlay();
      });
    }

    // Закрытие по крестику/ссылке
    [drawerMobile, drawerDesktop].forEach(drawer => {
      if (!drawer) return;
      drawer.querySelectorAll('[data-drawer-hide], a[href^="#"]').forEach(el => {
        el.addEventListener('click', () => {
          btnMobile?.classList.remove('active');
          btnDesktop?.classList.remove('active');
          hideOverlay();
        });
      });
    });

    // Клик по фону — тоже закрывает
    overlay.addEventListener('click', () => {
      hideOverlay();
      btnMobile?.classList.remove('active');
      btnDesktop?.classList.remove('active');
      document.querySelector('[data-drawer-hide="site-drawer"]')?.click();
      document.querySelector('[data-drawer-hide="site-drawer-desktop"]')?.click();
    });

    // Сброс при ресайзе
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) hideOverlay();
    });
  })();