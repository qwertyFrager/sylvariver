(() => {
  const hero = document.getElementById('hero');
  const overlay = document.getElementById('overlay');

  if (!hero || !overlay) return;

  function move(e) {
    const r = hero.getBoundingClientRect();
    overlay.style.setProperty('--x', (e.clientX - r.left) + 'px');
    overlay.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }

  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', () => {
    overlay.style.removeProperty('--x');
    overlay.style.removeProperty('--y');
  });
})();