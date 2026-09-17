(() => {
  const stack = document.querySelector('.motion-stack');
  if (!stack) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...stack.querySelectorAll('.motion-card')];
  let frame = 0;
  let previousTime = 0;
  let progress = 0;
  let target = 0;
  let cardHeight = 0;
  let overlap = 0;
  let gap = 0;
  let travel = 1;

  function paint() {
    stack.style.setProperty('--overlap', `${overlap * (1 - progress)}px`);
    stack.style.setProperty('--gap', `${gap * progress}px`);
  }

  function tick(now) {
    frame = 0;
    const dt = previousTime ? Math.min(64, now - previousTime) : 16;
    previousTime = now;
    progress += (target - progress) * (1 - Math.exp(-dt / 110));
    if (Math.abs(target - progress) < .0005) progress = target;
    paint();
    if (progress !== target) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }

  function update() {
    // A fixed scroll range avoids a feedback loop as the gallery grows.
    target = reduce.matches || stack.querySelector('.motion-card:focus-visible') ? 1 : Math.max(0, Math.min(1, scrollY / travel));
    if (reduce.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      progress = target;
      paint();
    } else if (!frame) frame = requestAnimationFrame(tick);
  }

  function measure() {
    cardHeight = cards[0].offsetHeight;
    const compactStep = Math.max(64, cardHeight * 146 / 429);
    overlap = Math.max(0, cardHeight - compactStep);
    gap = Math.max(20, Math.min(48, innerWidth * .025));
    travel = Math.max(240, Math.min(innerHeight * .8, innerWidth * .55));
    update();
  }

  // Expand before keyboard focus so every link has a visible target.
  stack.addEventListener('focusin', event => {
    if (!event.target.matches(':focus-visible')) return;
    cancelAnimationFrame(frame);
    frame = 0;
    progress = target = 1;
    paint();
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', measure);
  addEventListener('pageshow', measure);
  reduce.addEventListener('change', measure);
  measure();
  progress = target;
  paint();
})();
