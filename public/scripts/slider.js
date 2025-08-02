const swiper = new Swiper('#houses-swiper', {
    loop: true,
    speed: 600,
    spaceBetween: 40,
    effect: 'fade',                 // плавные перелистывания (можно 'slide' или 'creative')
    fadeEffect: { crossFade: true },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '#next-house',        // внешние кнопки
      prevEl: '#prev-house'
    },
    keyboard: { enabled: true },
    // autoplay: { delay: 5000, disableOnInteraction: false },
  });

  // Табам дать возможность переключать слайды
  window.selectHouseType = function (idx) {
    swiper.slideToLoop(idx);     // 0..3
    updateTabs(idx);
  };

  // Подсветка активного таба
  function updateTabs(activeIdx) {
    const tabs = Array.from(document.querySelectorAll('.house-tab'));
    tabs.forEach((t, i) => {
      const active = i === activeIdx;
      t.classList.toggle('bg-[#93d989]', active);
      t.classList.toggle('text-white', active);
      t.classList.toggle('shadow-md', active);
      t.classList.toggle('bg-[#f4f3f3]', !active);
      t.classList.toggle('text-black', !active);
    });
  }

  // Синхронизация при свапе/стрелках/точках
  swiper.on('slideChange', () => {
    // так как loop: true — берём реальный индекс в наборе
    const real = swiper.realIndex; // 0..N-1
    updateTabs(real);
  });

  // Начальная подсветка
  updateTabs(0);