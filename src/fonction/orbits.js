import { Object3D, RingGeometry, MeshBasicMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial, AdditiveBlending } from "three";
import Sphere from "../components/sphere";

export function createSolarSystem(scene, solarSystemData, orbitCenters, rotatingBodies) {
  // Soleil
  const sunData = solarSystemData.sun;
  const sun = new Sphere(sunData.radius, 32, 32, sunData.texture, {
    emissive: true,
  });
  scene.add(sun);
  rotatingBodies.push({ mesh: sun, rotationSpeed: sunData.rotationSpeed });

  // Planètes
  solarSystemData.planets.forEach((planetData) => {
    const planetOrbit = new Object3D();
    planetOrbit.position.copy(sun.position);
    scene.add(planetOrbit);

    // Orbite
    const orbitRadius = planetData.distance;
    const ringGeometry = new RingGeometry(
      orbitRadius - 0.05,
      orbitRadius + 0.05,
      128
    );
    const ringMaterial = new MeshBasicMaterial({ color: 0x888888, side: 2 });
    const orbitRing = new Mesh(ringGeometry, ringMaterial);
    orbitRing.rotation.x = Math.PI / 2;
    scene.add(orbitRing);

    // Création de la planète
    const planet = new Sphere(planetData.radius, 32, 32, planetData.texture);
    planet.name = planetData.name; // Ajout du nom pour pouvoir la retrouver depuis la scène
    planet.position.x = planetData.distance;
    planet.rotation.x = planetData.inclination || 0;
    planetOrbit.add(planet);

    if (planetData.rings) {
      const ringTexture = new TextureLoader().load(
        planetData.rings.texture
      );
      const ringGeometry = new RingGeometry(
        planetData.rings.innerRadius,
        planetData.rings.outerRadius,
        128
      );
      const ringMaterial = new MeshBasicMaterial({
        map: ringTexture,
        color: 0xffffff,
        side: 2,
        transparent: true,
      });
      const ringMesh = new Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      planet.add(ringMesh);
    }

    orbitCenters.push({ center: planetOrbit, speed: planetData.orbitSpeed });
    rotatingBodies.push({
      mesh: planet,
      rotationSpeed: planetData.selfRotationSpeed,
    });

    // Lunes
    if (planetData.moons) {
      planetData.moons.forEach((moonData) => {
        const moonOrbit = new Object3D();
        moonOrbit.position.x = planetData.radius;
        planet.add(moonOrbit);

        const moon = new Sphere(moonData.radius, 32, 32, moonData.texture);
        moon.position.x = moonData.distance;
        moonOrbit.add(moon);

        orbitCenters.push({ center: moonOrbit, speed: moonData.orbitSpeed });
        rotatingBodies.push({
          mesh: moon,
          rotationSpeed: moonData.selfRotationSpeed,
        });
      });
    }
  });
}