import { Object3D, Euler, Quaternion } from 'three';

// Un objet temporaire réutilisable pour les mises à jour de matrices (principalement pour les astéroïdes)
const dummy = new Object3D();

/**
 * Anime les corps célestes (planètes, lunes, soleil).
 * @param {Array} orbitCenters - Tableau des objets dont la rotation.y contrôle l'orbite.
 * @param {Array} rotatingBodies - Tableau des objets qui tournent sur eux-mêmes.
 * @param {number} simulationSpeedFactor - Facteur de vitesse de la simulation.
 */
export function animateCelestialBodies(orbitCenters, rotatingBodies, simulationSpeedFactor) {
  orbitCenters.forEach(({ center, speed }) => {
    center.rotation.y += speed * simulationSpeedFactor;
  });

  rotatingBodies.forEach(({ mesh, rotationSpeed }) => {
    mesh.rotation.y += rotationSpeed * simulationSpeedFactor;
  });
}

/**
 * Anime la ceinture d'astéroïdes.
 * @param {THREE.Scene} scene - La scène Three.js, pour accéder à scene.userData.asteroidBeltData.
 * @param {number} simulationSpeedFactor - Facteur de vitesse de la simulation.
 */
export function animateAsteroidBelt(scene, simulationSpeedFactor) {
  if (scene.userData.asteroidBeltData) {
    const { mesh: instancedAsteroids, instances: asteroidsInstanceData } = scene.userData.asteroidBeltData;

    asteroidsInstanceData.forEach((data, i) => {
      // Mise à jour de la position orbitale
      // La vitesse orbitale est déjà un facteur, donc on l'ajuste avec simulationSpeedFactor
      data.initialAngle += data.orbitSpeedFactor * simulationSpeedFactor; 
      const x = Math.cos(data.initialAngle) * data.orbitRadius;
      const z = Math.sin(data.initialAngle) * data.orbitRadius;
      dummy.position.set(x, data.yOffset, z);

      // Mise à jour de la rotation propre de l'astéroïde
      // Crée un quaternion pour la rotation de cette frame
      const deltaRotation = new Quaternion().setFromEuler(
        new Euler(
          data.rotationSpeed.x * simulationSpeedFactor * 0.1, // Ralentir un peu la rotation propre pour la visibilité
          data.rotationSpeed.y * simulationSpeedFactor * 0.1,
          data.rotationSpeed.z * simulationSpeedFactor * 0.1
        )
      );
      // Applique la rotation delta au quaternion actuel de l'astéroïde
      data.currentQuaternion.multiply(deltaRotation);
      dummy.quaternion.copy(data.currentQuaternion);

      // Applique l'échelle
      dummy.scale.copy(data.scale);

      // Met à jour la matrice de l'instance
      dummy.updateMatrix();
      instancedAsteroids.setMatrixAt(i, dummy.matrix);
    });
    instancedAsteroids.instanceMatrix.needsUpdate = true;
  }
}