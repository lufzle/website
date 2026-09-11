import { clamp01, progressForScroll, createLaptop } from './scene.mjs';
import { WebGLRenderer, WebGPURenderer, makeLabelAtlas, makeMipLevels } from './renderers.mjs';

let canvas = document.querySelector('#fold-canvas');
const section = document.querySelector('#the-fold');
const status = document.querySelector('.gpu-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const forceWebGL = new URLSearchParams(location.search).get('renderer') === 'webgl';
let renderer;
let rendererName;
let recovering = false;
let wake = () => {};

function freshCanvas() {
  const next = canvas.cloneNode(false);
  canvas.replaceWith(next);
  canvas = next;
  return next;
}

function showPoster() {
  renderer?.destroy();
  renderer = undefined;
  document.documentElement.classList.add('no-gpu');
  document.documentElement.dataset.renderer = 'static';
  status.textContent = 'A still preview is shown because GPU rendering is unavailable.';
  wake();
}

async function start() {
  const image = new Image();
  image.src = './assets/lock-screen.png';
  await image.decode();
  const scene = createLaptop();
  const levels = makeMipLevels(image);
  const labels = makeLabelAtlas(scene.labels);

  const failure = async (error) => {
    if (recovering) return;
    recovering = true;
    console.warn('The renderer stopped. Recovering the preview.', error);
    const previous = rendererName;
    renderer?.destroy();
    renderer = undefined;
    if (previous === 'WebGPU') {
      try {
        renderer = await WebGLRenderer.create(freshCanvas(), scene, levels, labels, failure);
        rendererName = 'WebGL 2';
        ready();
      } catch { showPoster(); }
    } else {
      showPoster();
    }
    recovering = false;
    wake();
  };

  function ready() {
    document.documentElement.classList.remove('no-gpu');
    document.documentElement.dataset.renderer = rendererName;
    status.textContent = 'The MacBook opens from 0 to 100 degrees as you scroll.';
  }

  if (!forceWebGL && navigator.gpu) {
    try {
      renderer = await WebGPURenderer.create(canvas, scene, levels, labels, failure);
      rendererName = 'WebGPU';
    } catch (error) {
      console.warn('WebGPU initialization failed; using WebGL 2.', error);
      freshCanvas();
    }
  }
  if (!renderer) {
    try {
      renderer = await WebGLRenderer.create(canvas, scene, levels, labels, failure);
      rendererName = 'WebGL 2';
    } catch (error) {
      console.warn('A GPU renderer could not start.', error);
      showPoster();
    }
  }
  if (renderer) ready();

  let startY = 0, travel = 1;
  let animationFrame = 0, lastTime = 0, lastRendered = -1;
  let current = 0, resized = true, frames = 0;
  const measure = () => {
    startY = section.getBoundingClientRect().top + scrollY;
    travel = Math.max(1, section.offsetHeight - section.querySelector('.fold-stage').clientHeight);
  };
  const schedule = () => {
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(frame);
  };
  wake = () => { resized = true; lastRendered = -1; measure(); schedule(); };
  const frame = (time) => {
    animationFrame = 0;
    const target = progressForScroll(scrollY, startY, travel);
    const delta = target - current;
    const elapsed = lastTime ? Math.min(64, time-lastTime) : 16.667;
    current = reducedMotion.matches || Math.abs(delta)<.00005
      ? target : current + delta*(1-Math.exp(-elapsed/42));
    const moving = Math.abs(target-current)>=.00005;
    if (renderer && (resized || Math.abs(current-lastRendered)>.000001)) {
      try {
        renderer.render(clamp01(current), time*.001);
        canvas.dataset.frameCount = String(++frames);
        lastRendered = current;
        resized = false;
      } catch (error) { void failure(error); }
    }
    if (moving) { lastTime = time; schedule(); } else { lastTime = 0; }
  };

  measure();
  current = progressForScroll(scrollY, startY, travel);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', wake, { passive: true });
  reducedMotion.addEventListener('change', wake);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animationFrame); animationFrame=0; lastTime=0; }
    else wake();
  });
  document.fonts.ready.then(wake);
  schedule();
}

start().catch(async (error) => {
  console.error('The preview could not start.', error);
  const poster = document.querySelector('.fallback-poster');
  try {
    await poster.decode();
    showPoster();
  } catch {
    document.documentElement.classList.add('no-preview');
    document.documentElement.dataset.renderer = 'unavailable';
    status.textContent = 'The preview image could not load. You can still download foldelight below.';
  }
});
