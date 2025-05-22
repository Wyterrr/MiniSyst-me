import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function init() {
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 10, 30);

  const renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  const scene = new Scene();
  function tweenCamera(target, duration = 1500) {
    const start = camera.position.clone();
    const startTime = performance.now();
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      camera.position.lerpVectors(start, target, t);
      controls.update();
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    }
    animate();
  }

  // Vous pouvez exposer tweenCamera si besoin
  return [camera, renderer, scene, controls, tweenCamera];
}
