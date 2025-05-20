import {
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  TextureLoader,
} from 'three';
import img from '../assets/images/coast_sand_rocks_02_diff_1k.jpg';

export default class Cube extends Mesh {
  constructor(size) {
    const textureLoader = new TextureLoader();
    const geometry = new BoxGeometry(size, size, size);
    const texture = textureLoader.load(img);
    const material = new MeshStandardMaterial({ map: texture });
    super(geometry, material);
  }

  tick() {
    this.rotation.x += 0.03;
    this.rotation.y += 0.03;
  }
}
