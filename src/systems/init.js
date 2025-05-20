import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function init() {
  // Set a wider aspect if needed: window.innerWidth/window.innerHeight
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  // Position the camera further back and higher
  camera.position.set(0, 10, 20);
  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  const scene = new Scene();
  return [camera, renderer, scene, controls];
}