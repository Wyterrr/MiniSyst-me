import {
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
    Color
} from "three";

export default class Sphere extends Mesh {
  constructor(radius, widthSeg, heightSeg, texturePath, options = {}) {
    const geometry = new SphereGeometry(radius, widthSeg, heightSeg);
    const texture = new TextureLoader().load(
      texturePath.startsWith('./')
        ? texturePath.replace('./', import.meta.env.BASE_URL)
        : texturePath
    );

    const material = new MeshStandardMaterial({
      map: texture,
      emissive: options.emissive ? new Color(0xffffaa) : new Color(0x000000),
      emissiveMap: options.emissive ? texture : null,
      emissiveIntensity: options.emissive ? 1.5 : 0
    });

    super(geometry, material);
  }
}