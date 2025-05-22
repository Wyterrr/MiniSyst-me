import { TextureLoader, Mesh, MeshBasicMaterial, SphereGeometry, BackSide } from 'three';
import background from '../../public/skyyy.jpg';

export default function createBackground() {
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load(background);

  // Crée une grande sphère
  const geometry = new SphereGeometry(500, 60, 40); // rayon, segments horizontaux, verticaux
  const material = new MeshBasicMaterial({
    map: texture,
    side: BackSide // Affiche la texture à l'intérieur
  });

  const sphere = new Mesh(geometry, material);
  return sphere;
}