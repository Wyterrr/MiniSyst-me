import { TextureLoader, Mesh, MeshBasicMaterial, SphereGeometry, BackSide } from 'three';
import background from '../../public/skyyy.jpg';

export default function createBackground() {
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load(background);

  const geometry = new SphereGeometry(500, 60, 40);
  const material = new MeshBasicMaterial({
    map: texture,
    side: BackSide
  });

  const sphere = new Mesh(geometry, material);
  return sphere;
}