// Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Add hover effects
         document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(btn => {
      // Базовая плавность
      btn.style.transition = 'transform 200ms ease';

      // Мышь (десктоп)
      btn.addEventListener('pointerenter', () => {
        // ховер
        btn.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'scale(1)';
      });

      // Тач/клик
      btn.addEventListener('pointerdown', () => {
        // эффект нажатия
        btn.style.transform = 'scale(0.95)';
      });
      btn.addEventListener('pointerup', () => {
        // краткий "возврат" ховера
        btn.style.transform = 'scale(1.05)';
        // а затем мягко вернуться к норме
        setTimeout(() => {
          // Если палец ушёл с кнопки/курсор вне — вернём к 1, иначе оставим hover
          const rect = btn.getBoundingClientRect();
          const within =
            window.event && 'clientX' in window.event && 'clientY' in window.event
              ? (window.event.clientX >= rect.left && window.event.clientX <= rect.right &&
                 window.event.clientY >= rect.top  && window.event.clientY <= rect.bottom)
              : false;
          btn.style.transform = within ? 'scale(1.05)' : 'scale(1)';
        }, 150);
      });

      // На случай отмены жеста
      btn.addEventListener('pointercancel', () => {
        btn.style.transform = 'scale(1)';
      });
      // Если тач ушёл за пределы
      btn.addEventListener('lostpointercapture', () => {
        btn.style.transform = 'scale(1)';
      });
    });
  });