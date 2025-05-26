import {
  Object3D,
  RingGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  InstancedMesh,
  IcosahedronGeometry,
  MeshStandardMaterial,
  Vector3,
  Euler,
  Quaternion
} from "three";
import Sphere from "../components/sphere";

export function createSolarSystem(scene, solarSystemData, orbitCenters, rotatingBodies) {
  const textureLoader = new TextureLoader();

  // --- Création du Soleil ---
  const sunData = solarSystemData.sun;
  const sun = new Sphere(sunData.radius, 32, 32, sunData.texture, {
    emissive: true, // Géré par la classe Sphere
  });
  sun.name = sunData.name;
  sun.userData = { info: sunData, type: "sun" };
  scene.add(sun);
  rotatingBodies.push({ mesh: sun, rotationSpeed: sunData.rotationSpeed });

  // --- Création des Planètes, Lunes et Anneaux ---
  solarSystemData.planets.forEach((planetData) => {
    const planetOrbit = new Object3D();
    planetOrbit.position.copy(sun.position); // Orbite autour du centre du soleil
    scene.add(planetOrbit);

    // Ligne d'orbite pour la planète
    const orbitLineRadius = planetData.distance;
    const orbitLineGeometry = new RingGeometry(
      orbitLineRadius - 0.02, // Ajuster l'épaisseur de la ligne
      orbitLineRadius + 0.02,
      128
    );
    const orbitLineMaterial = new MeshBasicMaterial({ color: 0x555555, side: 2 });
    const orbitLine = new Mesh(orbitLineGeometry, orbitLineMaterial);
    orbitLine.rotation.x = Math.PI / 2;
    orbitLine.position.copy(sun.position); // Centré sur le soleil
    scene.add(orbitLine);

    // Planète
    const planet = new Sphere(planetData.radius, 32, 32, planetData.texture);
    planet.name = planetData.name;
    planet.userData = { info: planetData, type: "planet" };
    planet.position.x = planetData.distance;
    planet.rotation.x = planetData.inclination || 0; // Inclinaison axiale
    planetOrbit.add(planet);

    // Anneaux planétaires
    if (planetData.rings) {
      const ringTexture = textureLoader.load(
        planetData.rings.texture.startsWith('./')
        ? planetData.rings.texture.replace('./', import.meta.env.BASE_URL)
        : planetData.rings.texture
      );
      const ringGeo = new RingGeometry(
        planetData.rings.innerRadius,
        planetData.rings.outerRadius,
        128
      );
      const ringMat = new MeshBasicMaterial({
        map: ringTexture,
        color: 0xffffff, // La texture définira la couleur
        side: 2,
        transparent: true,
        alphaTest: 0.05 // Ajuster pour une meilleure transparence
      });
      const ringMesh = new Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2; // Orienter les anneaux
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
        // L'orbite de la lune est centrée sur la planète, pas décalée par son rayon
        moonOrbit.position.set(0, 0, 0); 
        planet.add(moonOrbit);

        const moon = new Sphere(moonData.radius, 16, 16, moonData.texture); // Moins de segments pour les lunes
        moon.name = moonData.name;
        moon.userData = { info: moonData, type: "moon" };
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

  // --- Création de la Ceinture d'Astéroïdes ---
  if (solarSystemData.asteroidBelt) {
    const beltData = solarSystemData.asteroidBelt;
    const asteroidTexture = textureLoader.load(
        beltData.texture.startsWith('./')
        ? beltData.texture.replace('./', import.meta.env.BASE_URL)
        : beltData.texture
    );

    // Utiliser une géométrie simple pour les astéroïdes
    const asteroidGeometry = new IcosahedronGeometry(1, 0); // Rayon 1, 0 détails pour un look low-poly
    const asteroidMaterial = new MeshStandardMaterial({ 
        map: asteroidTexture, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    
    const instancedAsteroids = new InstancedMesh(asteroidGeometry, asteroidMaterial, beltData.count);
    instancedAsteroids.name = "AsteroidBelt"; // Pour identification éventuelle
    scene.add(instancedAsteroids);

    const dummy = new Object3D(); // Objet temporaire pour calculer les matrices
    const asteroidsInstanceData = []; // Pour stocker les infos de chaque astéroïde pour l'animation

    for (let i = 0; i < beltData.count; i++) {
      // Position orbitale aléatoire
      const radius = beltData.innerRadius + Math.random() * (beltData.outerRadius - beltData.innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * beltData.thickness;

      dummy.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );

      // Rotation et échelle aléatoires
      const randomEuler = new Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      dummy.quaternion.setFromEuler(randomEuler);
      
      const scale = beltData.minSize + Math.random() * (beltData.maxSize - beltData.minSize);
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      instancedAsteroids.setMatrixAt(i, dummy.matrix);

      // Stocker les données pour l'animation
      asteroidsInstanceData.push({
        initialAngle: angle,
        orbitRadius: radius,
        yOffset: yOffset,
        currentQuaternion: dummy.quaternion.clone(),
        scale: dummy.scale.clone(),
        rotationSpeed: new Vector3(
          (Math.random() - 0.5) * 0.01, // Vitesse de rotation plus lente
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        // Vitesse orbitale plus lente pour les orbites plus éloignées, et un peu de variabilité
        orbitSpeedFactor: (0.0005 + Math.random() * 0.0003) / Math.sqrt(radius) 
      });
    }
    instancedAsteroids.instanceMatrix.needsUpdate = true;

    // Stocker les données pour l'animation dans userData de la scène pour y accéder depuis main.js
    scene.userData.asteroidBeltData = {
        mesh: instancedAsteroids,
        instances: asteroidsInstanceData
    };
  }
}