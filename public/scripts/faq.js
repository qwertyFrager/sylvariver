// FAQ toggle
        function toggleFAQ(index) {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item, i) => {
    const panel   = item.querySelector('.faq-panel');
    const content = item.querySelector('.faq-content');
    const icon    = item.querySelector('.faq-icon');
    const isOpen  = item.classList.contains('is-open');

    if (i === index) {
      // переключаем текущий
      if (isOpen) {
        item.classList.remove('is-open');
        panel.classList.remove('grid-rows-[1fr]');
        content.classList.add('opacity-0','translate-y-1');
        icon.classList.remove('rotate-45');
      } else {
        item.classList.add('is-open');
        panel.classList.add('grid-rows-[1fr]');
        content.classList.remove('opacity-0','translate-y-1');
        icon.classList.add('rotate-45');
      }
    } else {
      // закрываем остальные
      item.classList.remove('is-open');
      panel.classList.remove('grid-rows-[1fr]');
      content.classList.add('opacity-0','translate-y-1');
      icon.classList.remove('rotate-45');
    }
  });
}