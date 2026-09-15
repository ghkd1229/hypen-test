(() => {
  const section = document.querySelector('.graphic-motion');
  const button = section.querySelector('.graphic-toggle');
  const gallery = section.querySelector('.graphic-reveal');
  const cards = [...section.querySelectorAll('.graphic-card')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const base = [400,647,702,271,739,739,400,647,702].map(n => n / 14.4);
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { n = clamp(n); return n*n*(3-2*n); };
  let expanded = false, frame = 0, target = 0, current = 0, previousTime = 0;

  function paint(progress) {
    const morph = smooth(progress / .3);
    const envelope = Math.sin(Math.PI * clamp(progress)) * morph;
    const reveal = reduce.matches ? 1 : smooth(progress / .1);
    cards.forEach((card, index) => {
      const column = Math.floor(index / 3);
      const row = index % 3;
      const phase = column * 2.15;
      const wave = Math.sin(progress * Math.PI * 3.8 + phase) * 10 * envelope;
      const second = Math.sin(progress * Math.PI * 5.2 + phase + .9) * 4 * envelope;
      // Compensating height changes keep each column's total extent steady.
      const offset = row === 0 ? wave : row === 1 ? -wave + second : -second;
      const initial = row === 0 ? 51.3194 : base[index];
      const height = reduce.matches ? base[index] : initial + (base[index] - initial) * morph + offset;
      card.style.height = Math.max(15, height) + 'vw';
      if (row > 0) {
        card.style.opacity = reveal;
        card.style.transform = 'translateY(' + (18 * (1-reveal)) + 'px)';
        card.setAttribute('aria-hidden', String(reveal < .05));
      }
      card.querySelector('img').style.objectPosition = '50% ' + (50 + offset * .7) + '%';
    });
  }

  function tick(now) {
    frame = 0;
    const dt = previousTime ? Math.min(64, now - previousTime) : 16;
    previousTime = now;
    current += (target - current) * (1 - Math.exp(-dt / 135));
    if (Math.abs(target-current) < .00015) current = target;
    paint(current);
    if (expanded && current !== target) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }
  let transitioning = false, transitionTimer;
  function schedule() {
    if (transitioning) return;
    const travel = Math.max(innerHeight * 1.5, section.clientWidth * 1.15);
    target = expanded ? clamp(-section.getBoundingClientRect().top / travel) : 0;
    if (reduce.matches) {
      cancelAnimationFrame(frame); frame = 0; current = target; paint(current);
    } else if (!frame) frame = requestAnimationFrame(tick);
  }
  button.addEventListener('click', () => {
    clearTimeout(transitionTimer);
    cancelAnimationFrame(frame);
    frame = 0; previousTime = 0;
    transitioning = !reduce.matches;
    expanded = !expanded;
    button.setAttribute('aria-expanded', String(expanded));
    gallery.inert = !expanded;
    section.classList.toggle('is-expanded', expanded);
    if (!expanded) button.focus({preventScroll:true});
    if (transitioning) {
      transitionTimer = setTimeout(() => { transitioning = false; schedule(); }, 720);
    } else schedule();
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) button.click();
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduce.addEventListener('change', schedule);
  paint(0);
  if (new URLSearchParams(location.search).get("graphic") === "open") button.click();
})();
