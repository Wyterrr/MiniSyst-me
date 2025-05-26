import init from "./systems/init";
import createBackground from "./systems/background";
import createLight from "./fonction/lights";
import { createSolarSystem } from "./fonction/orbits";
import solarSystemData from "./solar_system.json";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { Raycaster, Vector2, Vector3 } from 'three';
import CameraController from "./systems/cameraController";
import { animateCelestialBodies, animateAsteroidBelt } from "./systems/animation.js"; 

const [camera, renderer, scene, controls] = init();
controls.update();
renderer.xr.enabled = true;

const backgroundMesh = createBackground();
scene.add(backgroundMesh);

scene.add(createLight());

const orbitCenters = [];
const rotatingBodies = [];

createSolarSystem(scene, solarSystemData, orbitCenters, rotatingBodies);

const planetTargets = {};
solarSystemData.planets.forEach((planetData) => {
  if (planetData.name) {
    planetTargets[planetData.name] = new Vector3(planetData.distance, 0, 0);
  }
});

const zoomOffset = new Vector3(0, 2, 10);
const baseCameraPosition = new Vector3(0, 10, 25);

const cameraController = new CameraController(camera, controls, 1500);

let simulationSpeedFactor = 1;

// Raycasting setup
const raycaster = new Raycaster();
const mouse = new Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    let clickedObject = null;
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData && intersects[i].object.userData.info) {
            clickedObject = intersects[i].object;
            break;
        }
    }

    if (clickedObject) {
      const objectName = clickedObject.userData.info.name;
      const targetObject = scene.getObjectByName(objectName);

      if (targetObject) {
        const targetCurrentPos = new Vector3();
        targetObject.getWorldPosition(targetCurrentPos);
        
        let focusOffset;
        let targetForFollow;

        if (objectName === "Sun") {
          cameraController.tweenTo(baseCameraPosition, targetCurrentPos);
          focusOffset = new Vector3(0, 5, 25);
          targetForFollow = targetObject;
        } else {
          const desiredCameraPos = targetCurrentPos.clone().add(zoomOffset);
          cameraController.tweenTo(desiredCameraPos, targetCurrentPos);
          focusOffset = zoomOffset;
          targetForFollow = targetObject;
        }
        
        updatePlanetInfo(objectName); 

        setTimeout(() => {
          cameraController.follow(targetForFollow, focusOffset);
        }, cameraController.duration);
      }
    }
  }
}
renderer.domElement.addEventListener('click', onMouseClick);


renderer.setAnimationLoop(() => {
  animateCelestialBodies(orbitCenters, rotatingBodies, simulationSpeedFactor);
  animateAsteroidBelt(scene, simulationSpeedFactor); 

  cameraController.update();
  renderer.render(scene, camera);
});

// --- Menu UI ---

function createStyledButton(text) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.backgroundColor = "#333";
  button.style.color = "#eee";
  button.style.border = "1px solid #555";
  button.style.borderRadius = "4px";
  button.style.padding = "8px 12px";
  button.style.margin = "4px";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.transition = "background-color 0.2s ease, transform 0.1s ease";
  button.onmouseover = () => button.style.backgroundColor = "#444";
  button.onmouseout = () => button.style.backgroundColor = "#333";
  button.onmousedown = () => button.style.transform = "scale(0.98)";
  button.onmouseup = () => button.style.transform = "scale(1)";
  return button;
}

function createSectionTitle(text) {
  const title = document.createElement("h3");
  title.textContent = text;
  title.style.color = "#bbb";
  title.style.fontSize = "16px";
  title.style.marginBottom = "8px";
  title.style.marginTop = "15px";
  title.style.borderBottom = "1px solid #444";
  title.style.paddingBottom = "4px";
  return title;
}

const menu = document.createElement("div");
const menuWidth = 280; 
const menuPadding = 15; 

menu.style.position = "fixed"; 
menu.style.top = "0px"; 
menu.style.height = "100vh"; 
menu.style.padding = `${menuPadding}px`;
menu.style.backgroundColor = "rgba(25, 25, 35, 0.95)"; 
menu.style.color = "#f0f0f0";
menu.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
menu.style.zIndex = "1000";
menu.style.width = `${menuWidth}px`;
menu.style.boxShadow = "3px 0px 15px rgba(0,0,0,0.3)";
menu.style.overflowY = "auto"; 

const menuHiddenLeft = `-${menuWidth + menuPadding * 2}px`; 
const menuVisibleLeft = "0px"; 
menu.style.left = menuHiddenLeft;
menu.style.transition = "left 0.3s ease-in-out";
let menuIsOpen = false;

const menuToggleBtn = document.createElement("button");
menuToggleBtn.innerHTML = "&#9776;"; 
menuToggleBtn.style.position = "fixed";
menuToggleBtn.style.top = "15px";
menuToggleBtn.style.left = "15px";
menuToggleBtn.style.zIndex = "1001"; 
menuToggleBtn.style.backgroundColor = "#333";
menuToggleBtn.style.color = "#eee";
menuToggleBtn.style.border = "1px solid #555";
menuToggleBtn.style.borderRadius = "4px";
menuToggleBtn.style.padding = "8px 10px";
menuToggleBtn.style.cursor = "pointer";
menuToggleBtn.style.fontSize = "18px"; 
menuToggleBtn.style.lineHeight = "1"; 
menuToggleBtn.style.transition = "left 0.3s ease-in-out, background-color 0.2s ease";
menuToggleBtn.onmouseover = () => menuToggleBtn.style.backgroundColor = "#444";
menuToggleBtn.onmouseout = () => menuToggleBtn.style.backgroundColor = "#333";
menuToggleBtn.addEventListener("click", () => {
  menuIsOpen = !menuIsOpen;
  if (menuIsOpen) {
    menu.style.left = menuVisibleLeft;
    menuToggleBtn.innerHTML = "&times;"; 
    menuToggleBtn.style.left = `${menuWidth + menuPadding * 2 + 15}px`; 
  } else {
    menu.style.left = menuHiddenLeft;
    menuToggleBtn.innerHTML = "&#9776;"; 
    menuToggleBtn.style.left = "15px"; 
  }
});
document.body.appendChild(menuToggleBtn);

const currentTargetDisplay = document.createElement("div");
currentTargetDisplay.style.padding = "6px 10px";
currentTargetDisplay.style.backgroundColor = "rgba(0,0,0,0.25)";
currentTargetDisplay.style.borderRadius = "4px";
currentTargetDisplay.style.marginBottom = "10px";
currentTargetDisplay.style.fontSize = "16px"; 
currentTargetDisplay.style.fontWeight = "bold";
currentTargetDisplay.style.textAlign = "center";
menu.appendChild(currentTargetDisplay);

menu.appendChild(createSectionTitle("Informations Détaillées"));
const planetInfoDisplay = document.createElement("div");
planetInfoDisplay.style.padding = "10px";
planetInfoDisplay.style.backgroundColor = "rgba(0,0,0,0.15)";
planetInfoDisplay.style.borderRadius = "4px";
planetInfoDisplay.style.marginBottom = "15px";
planetInfoDisplay.style.fontSize = "13px";
planetInfoDisplay.style.lineHeight = "1.6";
menu.appendChild(planetInfoDisplay);

function updatePlanetInfo(objectName) {
  const obj = scene.getObjectByName(objectName);
  if (!obj || !obj.userData || !obj.userData.info) {
    planetInfoDisplay.innerHTML = "Aucune information disponible.";
    currentTargetDisplay.textContent = "N/A";
    return;
  }
  const data = obj.userData.info;
  currentTargetDisplay.textContent = data.name || "N/A";
  let infoHTML = `<strong>Nom:</strong> ${data.name}<br>`;
  if (data.radius) infoHTML += `<strong>Rayon:</strong> ${data.radius} unités<br>`;
  if (obj.userData.type === "planet" && data.distance) infoHTML += `<strong>Distance du Soleil:</strong> ${data.distance} unités<br>`;
  if (data.orbitSpeed) infoHTML += `<strong>Vitesse d'orbite:</strong> ${data.orbitSpeed.toFixed(4)} rad/tick<br>`;
  if (data.selfRotationSpeed) infoHTML += `<strong>Rotation propre:</strong> ${data.selfRotationSpeed.toFixed(4)} rad/tick<br>`;
  planetInfoDisplay.innerHTML = infoHTML;
}

menu.appendChild(createSectionTitle("Navigation Planétaire"));
const cameraControlsContainer = document.createElement("div");
cameraControlsContainer.style.display = "flex";
cameraControlsContainer.style.flexWrap = "wrap";
cameraControlsContainer.style.justifyContent = "flex-start";

const resetBtn = createStyledButton("Vue d'ensemble (Soleil)");
resetBtn.style.width = "calc(100% - 8px)"; 
resetBtn.addEventListener("click", () => {
  const sunObj = scene.getObjectByName("Sun");
  if (sunObj) {
    const sunPos = new Vector3();
    sunObj.getWorldPosition(sunPos);
    cameraController.tweenTo(baseCameraPosition, sunPos);
    updatePlanetInfo("Sun"); 
    setTimeout(() => {
      cameraController.follow(sunObj, new Vector3(0, 5, 25));
    }, cameraController.duration);
  } else {
    cameraController.tweenTo(baseCameraPosition, new Vector3(0, 0, 0));
    updatePlanetInfo(null); 
  }
});
cameraControlsContainer.appendChild(resetBtn);

for (const planetName in planetTargets) {
  const btn = createStyledButton(planetName);
  btn.addEventListener("click", () => {
    const planetObj = scene.getObjectByName(planetName);
    if (planetObj) {
      const planetCurrentPos = new Vector3();
      planetObj.getWorldPosition(planetCurrentPos);
      const desiredCameraPos = planetCurrentPos.clone().add(zoomOffset);
      cameraController.tweenTo(desiredCameraPos, planetCurrentPos);
      updatePlanetInfo(planetName); 
      setTimeout(() => {
        cameraController.follow(planetObj, zoomOffset);
      }, cameraController.duration);
    }
  });
  cameraControlsContainer.appendChild(btn);
}
menu.appendChild(cameraControlsContainer);

menu.appendChild(createSectionTitle("Vitesse de Simulation"));
const speedControlsContainer = document.createElement("div");

const speedDisplay = document.createElement("div");
speedDisplay.textContent = `Vitesse: x${simulationSpeedFactor}`;
speedDisplay.style.padding = "6px 10px";
speedDisplay.style.backgroundColor = "rgba(0,0,0,0.25)";
speedDisplay.style.borderRadius = "4px";
speedDisplay.style.marginBottom = "8px";
speedDisplay.style.textAlign = "center";
speedDisplay.style.fontSize = "14px";
speedControlsContainer.appendChild(speedDisplay);

const speedButtonContainer = document.createElement("div");
speedButtonContainer.style.display = "flex";
speedButtonContainer.style.justifyContent = "space-between";

const slowerBtn = createStyledButton("Ralentir (-)");
slowerBtn.addEventListener("click", () => {
  simulationSpeedFactor /= 2;
  speedDisplay.textContent = `Vitesse: x${simulationSpeedFactor}`;
});
speedButtonContainer.appendChild(slowerBtn);

const resetSpeedBtn = createStyledButton("Normal");
resetSpeedBtn.addEventListener("click", () => {
  simulationSpeedFactor = 1;
  speedDisplay.textContent = `Vitesse: x${simulationSpeedFactor}`;
});
speedButtonContainer.appendChild(resetSpeedBtn);

const fasterBtn = createStyledButton("Accélérer (+)");
fasterBtn.addEventListener("click", () => {
  simulationSpeedFactor *= 2;
  speedDisplay.textContent = `Vitesse: x${simulationSpeedFactor}`;
});
speedButtonContainer.appendChild(fasterBtn);

speedControlsContainer.appendChild(speedButtonContainer);
menu.appendChild(speedControlsContainer);

updatePlanetInfo("Sun");

document.body.appendChild(menu);
document.body.appendChild(renderer.domElement); 

const vrButton = VRButton.createButton(renderer);
vrButton.style.position = "fixed"; 
vrButton.style.bottom = "20px";
vrButton.style.right = "20px";
vrButton.style.zIndex = "1002"; 
document.body.appendChild(vrButton);

renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";