// ===== Анимация декора при видимости =====
document.querySelectorAll('[data-decor]').forEach((decor) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        decor.classList.add('decor-animate');
      } else {
        decor.classList.remove('decor-animate');
      }
    });
  }, {
    threshold: 0.2 // 20% элемента в зоне видимости
  });

  observer.observe(decor);
});