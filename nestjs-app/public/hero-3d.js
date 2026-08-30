import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('.hero-70-model');

if (container) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const fallbackCamera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
  fallbackCamera.position.set(0, 0, 8);

  let activeCamera = fallbackCamera;
  let rotationTarget = null;
  let mixer = null;

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;

    renderer.setSize(width, height, false);
    if (activeCamera.isPerspectiveCamera) {
      activeCamera.aspect = width / height;
      activeCamera.updateProjectionMatrix();
    } else if (activeCamera.isOrthographicCamera) {
      activeCamera.updateProjectionMatrix();
    }
  };

  new ResizeObserver(resize).observe(container);
  resize();

  const loader = new GLTFLoader();
  loader.load(
    '/models/3_d_animation.glb',
    (gltf) => {
      scene.add(gltf.scene);
      activeCamera = gltf.cameras[0] || fallbackCamera;
      if (activeCamera.isPerspectiveCamera) {
        activeCamera.near = 0.01;
        activeCamera.far = 1000;
        activeCamera.updateProjectionMatrix();
      }
      rotationTarget = gltf.scene.getObjectByName('Scene 1') || gltf.scene;

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        });
      }

      resize();
      container.classList.add('is-loaded');
    },
    undefined,
    (error) => {
      console.error('3D model could not be loaded.', error);
    },
  );

  const clock = new THREE.Clock();
  const render = () => {
    const delta = Math.min(clock.getDelta(), 0.05);

    if (mixer) {
      mixer.update(delta);
    } else if (rotationTarget) {
      rotationTarget.rotation.y += delta * 0.16;
    }

    renderer.render(scene, activeCamera);
    requestAnimationFrame(render);
  };

  render();
}
