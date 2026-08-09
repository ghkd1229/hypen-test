document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.querySelector('.intro');
  const introFill = document.querySelector('.intro-fill');
  const introPercent = document.querySelector('.intro-percent');
  const header = document.querySelector('.site-header');

  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  document.querySelectorAll('.checker').forEach((checker) => {
    checker.replaceChildren();
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        const cell = document.createElement('span');
        cell.className = 'checker-cell';
        cell.style.background = (row + column) % 2 === 0 ? '#515151' : 'transparent';
        checker.appendChild(cell);
      }
    }
  });

  const finishIntro = () => {
    introFill.style.transform = 'scaleX(1)';
    introPercent.textContent = '100';
    intro.classList.add('is-complete');
    window.setTimeout(() => {
      intro.hidden = true;
      document.body.classList.remove('is-loading');
    }, reduceMotion ? 10 : 720);
  };

  if (reduceMotion) {
    finishIntro();
  } else {
    const duration = 2800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      introFill.style.transform = `scaleX(${eased})`;
      introPercent.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      if (progress < 1) requestAnimationFrame(tick);
      else window.setTimeout(finishIntro, 180);
    };
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  const copyButton = document.querySelector('.copy-email');
  const copyStatus = document.querySelector('.copy-status');
  copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const input = document.createElement('textarea');
      input.value = email;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    copyStatus.classList.add('is-visible');
    window.setTimeout(() => copyStatus.classList.remove('is-visible'), 1200);
  });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.querySelector('.cursor-dot');
    let targetX = -50;
    let targetY = -50;
    let currentX = -50;
    let currentY = -50;
    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });
    const renderCursor = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    document.querySelectorAll('a, button, .work-card, .hero-word').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('is-active'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });
  }
});
