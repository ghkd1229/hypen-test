const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (window.location.hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
window.scrollTo(0, 0);
const cursor = document.querySelector('.cursor-dot');
const header = document.querySelector('.site-header');
const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
const about = document.querySelector('.about');
const photos = document.querySelector('.photos-modal');
const photoTrack = document.querySelector('.photo-track');
const photoCards = [...document.querySelectorAll('.photo-card')];
const photoClose = document.querySelector('.photos-close');
const photoViewport = document.querySelector('.photo-viewport');
const aboutLink = document.querySelector('.nav-links a[href="#about"]');
const heroAboutLink = document.querySelector('.hero-about-link');
const letteringFrame = document.querySelector('.lettering-frame');
const musicModal = document.querySelector('.music-modal');
const musicOpen = document.querySelector('.music-jump');
const musicClose = document.querySelector('.music-close');
const musicStage = document.querySelector('.music-stage');

document.querySelectorAll('.checker').forEach((checker) => {
  const palette = ['transparent', '#e7ddf9', '#e7ddf9'];
  const cellColors = [
    0, 1, 0, 1, 0, 2, 0, 2, 0,
    2, 0, 1, 0, 2, 0, 1, 0, 2,
    0, 2, 0, 1, 0, 2, 0, 1, 0,
  ];
  for (let index = 0; index < 27; index += 1) {
    const cell = document.createElement('span');
    cell.className = 'checker-cell';
    cell.style.setProperty('--cell-color', palette[cellColors[index]]);
    checker.append(cell);
  }
});

if (!reduceMotion) {
  const interactiveSelector = 'a, button, .hero-word, .university-pill, .photo-viewport, .music-card';
  let pointerX = -50;
  let pointerY = -50;
  let cursorX = -50;
  let cursorY = -50;

  window.addEventListener('mousemove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.classList.remove('is-hidden');
    cursor.classList.toggle('is-active', Boolean(event.target.closest(interactiveSelector)));
  });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));

  const renderCursor = () => {
    cursorX += (pointerX - cursorX) * 0.22;
    cursorY += (pointerY - cursorY) * 0.22;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  };
  renderCursor();
}

const finishIntro = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.body.classList.remove('is-loading');
  document.body.classList.add('intro-done');
};

if (reduceMotion) finishIntro();
else window.setTimeout(finishIntro, 3400);
window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });

copyButton.addEventListener('click', async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const input = document.createElement('textarea');
    input.value = email;
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  copyStatus.classList.add('is-shown');
  window.setTimeout(() => copyStatus.classList.remove('is-shown'), 1400);
});

const moveToAbout = (event) => {
  event.preventDefault();
  const frameTop = letteringFrame.getBoundingClientRect().top + window.scrollY;
  const targetTop = frameTop + letteringFrame.offsetHeight / 2 - window.innerHeight / 2 - 50;
  history.replaceState(null, '', '#about');
  window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' });
};
aboutLink.addEventListener('click', moveToAbout);
heroAboutLink.addEventListener('click', moveToAbout);

document.querySelector('.photo-jump').addEventListener('click', () => {
  photos.classList.add('is-open');
  photos.setAttribute('aria-hidden', 'false');
  document.body.classList.add('photos-open');
  photoViewport.focus({ preventScroll: true });
});
photoClose.addEventListener('click', () => {
  photos.classList.remove('is-open');
  photos.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('photos-open');
});

musicOpen.addEventListener('click', () => {
  renderMusicStage();
  musicModal.classList.add('is-open');
  musicModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('music-open');
});

const renderMusicStage = () => {
  const availableHeight = Math.max(360, window.innerHeight - 162);
  const availableWidth = Math.max(320, window.innerWidth - 24);
  const scale = Math.min(1, availableHeight / 862, availableWidth / 1302);
  musicStage.style.setProperty('--music-scale', scale.toFixed(4));
};
musicClose.addEventListener('click', () => {
  musicModal.classList.remove('is-open');
  musicModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('music-open');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
    if (entry.target === about) document.body.classList.toggle('about-active', entry.isIntersecting);
  });
}, { threshold: 0.24 });
document.querySelectorAll('.reveal-section').forEach((section) => revealObserver.observe(section));

let ticking = false;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const renderScroll = () => {
  ticking = false;
  header.classList.toggle('is-scrolled', window.scrollY > 24);

  if (!reduceMotion) {
  }
};

let photoOffset = 0;
let dragStartX = 0;
let dragStartOffset = 0;
let isDragging = false;

const renderPhotos = () => {
  const cardWidth = photoCards[0]?.offsetWidth || 152.5;
  const expandedGap = window.innerWidth <= 900 ? 5 : 0;
  const expandedWidth = photoCards.length * (cardWidth + expandedGap) - expandedGap;
  const maxX = Math.max(0, (expandedWidth - photoViewport.clientWidth) / 2 + 20);
  photoOffset = clamp(photoOffset, -maxX, maxX);
  photoTrack.style.setProperty('--photo-shift', `${-photoOffset}px`);
};

photoViewport.addEventListener('mouseenter', () => {
  photoViewport.classList.add('is-expanded');
  renderPhotos();
});
photoViewport.addEventListener('mouseleave', () => {
  if (!isDragging) photoViewport.classList.remove('is-expanded');
});

photos.addEventListener('wheel', (event) => {
  if (!photos.classList.contains('is-open')) return;
  event.preventDefault();
  photoViewport.classList.add('is-expanded');
  photoOffset += event.deltaY + event.deltaX;
  renderPhotos();
  photoCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const bend = clamp((rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth, -1, 1);
    card.style.transform = `rotateY(${bend * -24}deg) skewY(${bend * 3.5}deg) scale(${1 - Math.abs(bend) * 0.12})`;
  });
}, { passive: false });

photoViewport.addEventListener('pointerdown', (event) => {
  isDragging = true;
  dragStartX = event.clientX;
  dragStartOffset = photoOffset;
  photoViewport.classList.add('is-expanded');
  photoViewport.setPointerCapture(event.pointerId);
});
photoViewport.addEventListener('pointermove', (event) => {
  if (!isDragging) return;
  photoOffset = dragStartOffset - (event.clientX - dragStartX);
  renderPhotos();
});
photoViewport.addEventListener('pointerup', (event) => {
  isDragging = false;
  photoViewport.releasePointerCapture(event.pointerId);
});

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(renderScroll);
  }
}, { passive: true });
window.addEventListener('resize', () => {
  renderScroll();
  renderPhotos();
  renderMusicStage();
});
renderScroll();
renderMusicStage();
