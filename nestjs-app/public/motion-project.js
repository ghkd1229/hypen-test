(() => {
  // Replace the neutral titles and add approved descriptions/video paths here.
  // video accepts a hosted MP4/WebM URL; leave empty until the film is available.
  const projects = [
    { id: '01', title: 'Motion 01', image: '499b5.png', alt: '초록색 종이가 겹쳐진 모션 작업', description: '', video: '' },
    { id: '02', title: 'Motion 02', image: 'b4832.png', alt: '부드러운 분홍빛 모션 작업', description: '', video: '' },
    { id: '03', title: 'Motion 03', image: 'fe02c.png', alt: '검은 배경 위 붉은 오브제 모션 작업', description: '', video: '' },
    { id: '04', title: 'Motion 04', image: '5c377.png', alt: '격자 질감과 붉은 글자의 타이포그래피 모션 작업', description: '', video: '' },
    { id: '05', title: 'Motion 05', image: 'b24cf.png', alt: '연보라빛 곡선이 겹쳐진 모션 작업', description: '', video: '' },
    { id: '06', title: 'Motion 06', image: '496d7.png', alt: '분홍색 배경 위 유리 향수 오브제 모션 작업', description: '', video: '' },
  ];
  const id = new URLSearchParams(location.search).get('work');
  const index = projects.findIndex(project => project.id === id);
  if (index === -1) {
    document.querySelector('#project-missing').hidden = false;
    document.title = 'Project not found — Hwang Taehee';
    return;
  }
  const project = projects[index];
  document.title = `${project.title} — Hwang Taehee`;
  document.querySelector('#project-number').textContent = `${project.id} / 06`;
  document.querySelector('#project-title').textContent = project.title;
  const image = document.querySelector('#project-image');
  image.src = `/images/${project.image}`;
  image.alt = project.alt;
  document.querySelector('#project-description').textContent = project.description || '작품 소개와 전체 영상은 준비 중입니다.';
  if (project.video) {
    const video = document.querySelector('#project-video');
    video.src = project.video;
    video.poster = image.src;
    video.setAttribute('aria-label', `${project.title} 전체 영상`);
    video.hidden = false;
  }
  document.querySelector('#previous-project').href = `/motion-project.html?work=${projects[(index + projects.length - 1) % projects.length].id}`;
  document.querySelector('#next-project').href = `/motion-project.html?work=${projects[(index + 1) % projects.length].id}`;
  document.querySelector('#project').hidden = false;
  const artwork = document.querySelector('.motion-project-frame');
  function faceFront() {
    const width = artwork.clientWidth;
    const height = artwork.clientHeight;
    if (!height) return;
    // Undo the exported trapezoid's 8% bottom inset without cropping its content.
    image.style.transform = `matrix3d(1,0,0,0,${-.08 * width / height},.84,0,${-.16 / height},0,0,1,0,0,0,0,1)`;
  }
  new ResizeObserver(faceFront).observe(artwork);
  faceFront();
})();
