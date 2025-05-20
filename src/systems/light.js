import { PointLight, AmbientLight, Group } from 'three';

export default function createLight() {
  const lightGroup = new Group();

  const sunLight = new PointLight(0xffffff, 2, 100);
  sunLight.position.set(0, 0, 0); 
  lightGroup.add(sunLight);

  const ambientLight = new AmbientLight(0x404040, 0.5); 
  lightGroup.add(ambientLight);

  return lightGroup;
}
