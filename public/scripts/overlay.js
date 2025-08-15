(() => {
  const hero = document.getElementById('hero');
  const overlay = document.getElementById('overlay');
  if (!hero || !overlay) return;

  let raf = null, x = 0, y = 0, active = false;

  const apply = () => {
    raf = null;
    overlay.style.setProperty('--x', x + 'px');
    overlay.style.setProperty('--y', y + 'px');
  };
  const queue = () => { if (raf == null) raf = requestAnimationFrame(apply); };

  function onEnter(e){
    active = true;
    overlay.classList.add('is-on');               // включаем маску и blur
    const r = hero.getBoundingClientRect();
    x = (e.clientX ?? (r.left + r.width/2)) - r.left;
    y = (e.clientY ?? (r.top  + r.height/2)) - r.top;
    queue();
  }
  function onMove(e){
    if (!active) return;
    const r = hero.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;
    queue();
  }
  function onLeave(){
    active = false;
    overlay.classList.remove('is-on');            // маска/blur выключаются
    overlay.style.removeProperty('--x');
    overlay.style.removeProperty('--y');
  }

  hero.addEventListener('pointerenter', onEnter);
  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
})();