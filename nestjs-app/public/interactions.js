document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.querySelector('.intro');
  const introFill = document.querySelector('.intro-fill');
  const introPercent = document.querySelector('.intro-percent');
  const header = document.querySelector('.site-header');
  const heroWords = [...document.querySelectorAll('.hero-word')];
  const heroTexts = heroWords.map((word) => word.textContent.trim());

  heroWords.forEach((word) => {
    word.textContent = '';
  });

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

  let typingStarted = false;
  const startHeroTyping = async () => {
    if (typingStarted) return;
    typingStarted = true;
    if (reduceMotion) {
      heroWords.forEach((word, index) => {
        word.textContent = heroTexts[index];
      });
      return;
    }
    for (let wordIndex = 0; wordIndex < heroWords.length; wordIndex += 1) {
      const word = heroWords[wordIndex];
      const text = heroTexts[wordIndex];
      word.classList.add('is-typing');
      for (const character of text) {
        word.textContent += character;
        await new Promise((resolve) => window.setTimeout(resolve, 86));
      }
      await new Promise((resolve) => window.setTimeout(resolve, 150));
      word.classList.remove('is-typing');
    }
  };

  const finishIntro = () => {
    introFill.style.transform = 'scaleX(1)';
    introPercent.textContent = '100';
    intro.classList.add('is-complete');
    window.setTimeout(() => {
      intro.hidden = true;
      document.body.classList.remove('is-loading');
      startHeroTyping();
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

  const heroMenuButton = document.querySelector('.hero-70-menu-title');
  const heroMenuPanel = document.querySelector('.hero-70-menu');
  const heroMenuRail = document.querySelector('.hero-70-rail');
  const setHeroMenuOpen = (isOpen) => {
    heroMenuButton?.setAttribute('aria-expanded', String(isOpen));
    heroMenuPanel?.setAttribute('aria-hidden', String(!isOpen));
    heroMenuPanel?.classList.toggle('is-open', isOpen);
  };
  heroMenuButton?.addEventListener('click', () => {
    setHeroMenuOpen(heroMenuButton.getAttribute('aria-expanded') !== 'true');
  });
  heroMenuPanel?.addEventListener('pointermove', (event) => {
    if (!heroMenuRail) return;
    const panelRect = heroMenuPanel.getBoundingClientRect();
    const railRect = heroMenuRail.getBoundingClientRect();
    const pointerY = event.clientY - panelRect.top;
    const minY = railRect.height * (11.5 / 111);
    const maxY = railRect.height * (99.5 / 111);
    const nextY = Math.min(Math.max(pointerY, minY), maxY);
    heroMenuRail.style.setProperty('--rail-dot-y', `${nextY}px`);
  });
  document.addEventListener('click', (event) => {
    if (!heroMenuButton || !heroMenuPanel || heroMenuButton.contains(event.target) || heroMenuPanel.contains(event.target)) return;
    setHeroMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setHeroMenuOpen(false);
    heroMenuButton?.focus();
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

  const workSection = document.querySelector('.work');
  if (workSection) {
    const workObserver = new IntersectionObserver(([entry]) => {
      workSection.classList.toggle('is-visible', entry.isIntersecting);
    }, { threshold: 0.25 });
    workObserver.observe(workSection);

    const workColumns = [...workSection.querySelectorAll('.work-column')];
    let folderFrame = 0;
    const updateFolderSpread = () => {
      folderFrame = 0;
      if (reduceMotion) {
        workColumns.forEach((column) => column.style.setProperty('--folder-overlap', '-24.652778vw'));
        return;
      }
      const rect = workSection.getBoundingClientRect();
      const travel = window.innerHeight * 0.82;
      const rawProgress = Math.min(Math.max((travel - rect.top) / travel, 0), 1);
      workColumns.forEach((column, index) => {
        const staggered = Math.min(Math.max((rawProgress - index * 0.055) / 0.89, 0), 1);
        const eased = 1 - Math.pow(1 - staggered, 3);
        const overlap = -34.027778 + (9.375 * eased);
        column.style.setProperty('--folder-overlap', `${overlap}vw`);
      });
    };
    const requestFolderUpdate = () => {
      if (folderFrame) return;
      folderFrame = window.requestAnimationFrame(updateFolderSpread);
    };
    updateFolderSpread();
    window.addEventListener('scroll', requestFolderUpdate, { passive: true });
    window.addEventListener('resize', requestFolderUpdate, { passive: true });
  }

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
    document.querySelectorAll('a, button, .work-card').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('is-active'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });
  }
});
