import init from "./systems/init";
import createBackground from "./systems/background";
import createLight from "./fonction/lights";
import { createSolarSystem } from "./fonction/orbits";
import solarSystemData from "./solar_system.json";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { Vector3 } from "three";

// Initialisation de la scène, caméra, renderer et contrôles
const [camera, renderer, scene, controls, tweenCamera] = init();
controls.update();
renderer.xr.enabled = true;

const backgroundMesh = createBackground();
scene.add(backgroundMesh);

// Ajout des lumières
scene.add(createLight());

// Création des tableaux pour les animations
const orbitCenters = [];
const rotatingBodies = [];

// Ajout du système solaire (soleil, planètes, lunes, orbites)
// Les planètes recevront désormais leur nom
createSolarSystem(scene, solarSystemData, orbitCenters, rotatingBodies);

// Variable pour suivre une planète (null = pas de suivi)
let followPlanet = null;

// Définir les positions cibles pour chaque planète (approximativement sur l'axe X selon la distance)
const planetTargets = {};
solarSystemData.planets.forEach((planetData) => {
  planetTargets[planetData.name] = new Vector3(planetData.distance, 0, 0);
});

// Boucle d'animation
renderer.setAnimationLoop(() => {
  orbitCenters.forEach(({ center, speed }) => {
    center.rotation.y += speed;
  });

  rotatingBodies.forEach(({ mesh, rotationSpeed }) => {
    mesh.rotation.y += rotationSpeed;
  });

  // Si on suit une planète, mettre à jour le suivi avec un offset incliné
  if (followPlanet) {
    const planetPos = new Vector3();
    followPlanet.getWorldPosition(planetPos);
    camera.position.lerp(planetPos.clone().add(followOffset), 0.1);
    controls.target.lerp(planetPos, 0.1);
    controls.update();
  }

  renderer.render(scene, camera);
});

// Création d'un menu pour se déplacer sur les planètes
const menu = document.createElement("div");
menu.style.position = "absolute";
menu.style.top = "10px";
menu.style.left = "10px";
menu.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
menu.style.padding = "10px";
menu.style.borderRadius = "4px";
menu.style.zIndex = "1000";

// Offset utilisé pour la vue en mode suivi de planète (inclinaison générale)
const followOffset = new Vector3(0, 3, 10);
// Nouvel offset pour zoomer plus sur la planète (plus petit pour se rapprocher)
const zoomOffset = new Vector3(0, 1, 2);

// Bouton Reset : arrêter le suivi et repositionner la caméra à sa position de base
const baseCameraPosition = new Vector3(0, 10, 30);
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset";
resetBtn.style.margin = "4px";
resetBtn.addEventListener("click", () => {
  followPlanet = null;
  tweenCamera(baseCameraPosition);
});
menu.appendChild(resetBtn);

for (const planetName in planetTargets) {
  const btn = document.createElement("button");
  btn.textContent = planetName;
  btn.style.margin = "4px";
  btn.addEventListener("click", () => {
    const planetObj = scene.getObjectByName(planetName);
    if (planetObj) {
      // Utilise zoomOffset pour rapprocher la caméra de la planète
      const targetPos = planetTargets[planetName].clone().add(zoomOffset);
      tweenCamera(targetPos);
      followPlanet = planetObj;
    }
  });
  menu.appendChild(btn);
}

document.body.appendChild(menu);
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));