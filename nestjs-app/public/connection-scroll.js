import { animate, onScroll, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/modules/index.js';

const shell = document.querySelector('.connection-scroll-shell');
const paths = [...document.querySelectorAll('.connection-path')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (shell && paths.length) {
  const offsets = [
    [-150, -78, -34], [136, -102, 28], [-126, 96, -22], [148, 74, 38],
    [-92, -142, -42], [84, 138, 32], [-168, 24, -18], [164, -18, 20],
    [-56, 156, -36], [62, -154, 34], [-138, -118, -26], [142, 112, 26],
    [-176, 82, -16], [174, -86, 18], [-104, 132, -30], [108, -130, 30],
  ];

  paths.forEach((path, index) => {
    const [x, y, rotation] = offsets[index];
    const [drawable] = svg.createDrawable(path);

    if (reduceMotion) {
      drawable.draw = '0 1';
      path.style.opacity = '0.82';
      return;
    }

    animate(drawable, {
      draw: ['0 0', '0 1'],
      x: [x, 0],
      y: [y, 0],
      rotate: [rotation, index % 2 ? 4 : -4],
      scale: [0.72 + (index % 3) * 0.06, 1],
      opacity: [0.08, 0.82],
      duration: 920 + (index % 5) * 95,
      delay: index * 22,
      ease: 'linear',
      autoplay: onScroll({
        target: shell,
        enter: 'top top',
        leave: 'bottom bottom',
        sync: true,
      }),
    });
  });
}
