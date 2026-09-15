(() => {
  const shell = document.querySelector('.printer-scroll');
  const hero = document.querySelector('.printer-hero');
  const canvas = document.querySelector('.printer-video');
  const context = canvas.getContext('2d', { alpha: false });
  const resume = document.querySelector('.printer-resume');
  const cue = document.querySelector('.printer-cue');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = 152;
  const frames = new Array(count);
  const requested = new Set();
  const clamp = n => Math.max(0, Math.min(1, n));
  let progress = 0, frame = 0, drawn = -1;

  function draw() {
    const target = Math.round(clamp(progress / .88) * (count - 1));
    let available = target;
    if (!frames[available]) {
      for (let distance = 1; distance < count; distance++) {
        if (frames[target - distance]) { available = target - distance; break; }
        if (frames[target + distance]) { available = target + distance; break; }
      }
    }
    if (!frames[available] || !context) return;
    if (drawn !== available) {
      const image = frames[available];
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      drawn = available;
      canvas.dataset.frame = String(available);
    }
    hero.style.setProperty('--video-opacity', 1);
    hero.style.setProperty('--poster-opacity', 0);
  }

  function load(index) {
    if (index < 0 || index >= count || requested.has(index)) return Promise.resolve();
    requested.add(index);
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => { frames[index] = image; draw(); resolve(); };
      image.onerror = () => { requested.delete(index); resolve(); };
      image.src = '/media/printer-comp/frame-' + String(index + 1).padStart(4, '0') + '.jpg';
    });
  }

  function update() {
    frame = 0;
    const start = scrollY + shell.getBoundingClientRect().top;
    // Clamp the range to the actual page bottom, including fractional layout pixels.
    const travel = Math.max(1, Math.min(shell.offsetHeight - hero.offsetHeight,
      document.documentElement.scrollHeight - innerHeight - start));
    progress = clamp((scrollY - start) / travel);
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
    const arrival = clamp((progress - .63) / .37);
    const settle = smooth(arrival);
    const exit = smooth((progress - .8) / .2);
    const scale = width < height ? Math.min(width / 1280, height / 960) : Math.max(width / 1280, height / 960);
    hero.style.setProperty('--media-scale', scale);
    hero.style.setProperty('--scene-opacity', 1 - .6 * exit);
    hero.style.setProperty('--resume-opacity', smooth(arrival / .16));
    hero.style.setProperty('--paper-y', (-1200 * (1 - settle)) + 'px');
    hero.style.setProperty('--paper-x', (Math.sin(arrival * Math.PI * 2) * 65 * (1 - settle)) + 'px');
    hero.style.setProperty('--paper-rotation', (-12 * (1 - settle) + Math.sin(arrival * Math.PI * 2) * 5 * (1 - settle)) + 'deg');
    hero.style.setProperty('--paper-shadow', '0px ' + (22 * (1 - exit)) + 'px ' + (48 * (1 - exit)) + 'px rgba(0,0,0,' + (.18 * (1 - exit)) + ')');
    const cueOpacity = 1 - smooth((progress - .16) / .19);
    hero.style.setProperty('--cue-opacity', cueOpacity);
    cue.inert = cueOpacity < .05;
    cue.setAttribute('aria-hidden', String(cueOpacity < .05));
    document.querySelector('.printer-nav').inert = false;
    resume.inert = arrival < .98;
    synchronizeCue(progress >= .35);
    const target = Math.round(clamp(progress / .88) * (count - 1));
    load(target);
    draw();
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  const scrollToProgress = value => scrollTo({
    top: scrollY + shell.getBoundingClientRect().top + value * (shell.offsetHeight - hero.offsetHeight),
    behavior: motion.matches ? 'instant' : 'smooth'
  });
  cue.addEventListener('click', () => scrollToProgress(progress > .95 ? 0 : 1));
  document.querySelector('[data-show-about]').addEventListener('click', () => scrollToProgress(1));
  const object = cue.querySelector('object');
  let animation;
  function synchronizeCue(atEnd) {
    if (!animation) return;
    if (atEnd || motion.matches) {
      animation.pause();
      animation.currentTime = atEnd ? 1100 : 0;
    } else if (animation.playState !== 'running') {
      animation.play();
    }
  }
  function initializeCue() {
    const dot = object.contentDocument?.querySelector('circle');
    if (!dot) return;
    animation?.cancel();
    if (!motion.matches) animation = dot.animate([
      { transform: 'translateY(0)' }, { transform: 'translateY(100px)' }, { transform: 'translateY(0)' }
    ], { duration: 2200, iterations: Infinity, easing: 'ease-in-out' });
    synchronizeCue(progress >= .35);
  }
  object.addEventListener('load', initializeCue);
  motion.addEventListener('change', initializeCue);
  initializeCue();
  update();
  // Load a sparse preview first, then fill the sequence with six bounded workers.
  const queue = [...Array.from({ length: Math.ceil(count / 8) }, (_, i) => i * 8),
    ...Array.from({ length: count }, (_, i) => i)];
  async function worker() { while (queue.length) await load(queue.shift()); }
  for (let i = 0; i < 6; i++) worker();
})();
