import Sphere from "./components/sphere";
import { Object3D, Group, PointLight, AmbientLight } from "three";
import createBackground from "./systems/background";
import init from "./systems/init";
import solarSystemData from "./solar_system.json";


const [camera, renderer, scene, controls] = init();
controls.update();
scene.background = createBackground();


function createLight() {
  const lightGroup = new Group();

  const sunLight = new PointLight(0xffffff, 2, 100);
  sunLight.position.set(0, 0, 0);
  lightGroup.add(sunLight);

  const ambientLight = new AmbientLight(0x404040, 0.5);
  lightGroup.add(ambientLight);

  return lightGroup;
}

scene.add(createLight());


const orbitCenters = []; 
const rotatingBodies = []; 
// Soleil
const sunData = solarSystemData.sun;
const sun = new Sphere(sunData.radius, 32, 32, sunData.texture, { emissive: true });
scene.add(sun);
rotatingBodies.push({ mesh: sun, rotationSpeed: sunData.rotationSpeed });

// Planètes
solarSystemData.planets.forEach(planetData => {
  const planetOrbit = new Object3D();
  planetOrbit.position.copy(sun.position);
  scene.add(planetOrbit);

  const planet = new Sphere(planetData.radius, 32, 32, planetData.texture);
  planet.position.x = planetData.distance;
  planet.rotation.x = planetData.inclination || 0;
  planetOrbit.add(planet);

  orbitCenters.push({ center: planetOrbit, speed: planetData.orbitSpeed});
  rotatingBodies.push({ mesh: planet, rotationSpeed: planetData.selfRotationSpeed });

  // Lunes 
  if (planetData.moons) {
    planetData.moons.forEach(moonData => {
      const moonOrbit = new Object3D();
      moonOrbit.position.x = planetData.radius;
      planet.add(moonOrbit);

      const moon = new Sphere(moonData.radius, 32, 32, moonData.texture);
      moon.position.x = moonData.distance;
      moonOrbit.add(moon);

      orbitCenters.push({ center: moonOrbit, speed: moonData.orbitSpeed});
      rotatingBodies.push({ mesh: moon, rotationSpeed: moonData.selfRotationSpeed });
    });
  }
});


function animate() {
  orbitCenters.forEach(({ center, speed }) => {
    center.rotation.y += speed;
  });

  rotatingBodies.forEach(({ mesh, rotationSpeed }) => {
    mesh.rotation.y += rotationSpeed;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
document.body.appendChild(renderer.domElement);
