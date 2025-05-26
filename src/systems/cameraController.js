import { Vector3 } from "three";

export default class CameraController {
  constructor(camera, controls, duration = 1500) {
    this.camera = camera;
    this.controls = controls;
    this.duration = duration;
    this.isTweening = false;
    this.startPosition = new Vector3();
    this.endPosition = new Vector3();
    this.startTime = null;
    this.followTarget = null;
    this.followOffset = new Vector3(0, 3, 10); 
    this.isTweeningLookAt = false;
    this.startLookAt = new Vector3();
    this.endLookAt = new Vector3();
  }

  tweenTo(targetCameraPosition, lookAtTargetPosition = null) {
    this.clearFollow();
    this.startPosition.copy(this.camera.position);
    this.endPosition.copy(targetCameraPosition);
    this.startTime = performance.now();
    this.isTweening = true;

    if (lookAtTargetPosition) {
      this.startLookAt.copy(this.controls.target);
      this.endLookAt.copy(lookAtTargetPosition);
      this.isTweeningLookAt = true;
    } else {
      this.isTweeningLookAt = false;
    }
  }

  follow(target, offset) {
    this.isTweening = false; 
    this.isTweeningLookAt = false;
    this.followTarget = target;
    this.followOffset.copy(offset);
  }

  clearFollow() {
    this.followTarget = null;
  }

  update() {
    if (this.isTweening) {
      const elapsed = performance.now() - this.startTime;
      let t = Math.min(elapsed / this.duration, 1);
      t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 

      this.camera.position.lerpVectors(this.startPosition, this.endPosition, t);

      if (this.isTweeningLookAt) {
        this.controls.target.lerpVectors(this.startLookAt, this.endLookAt, t);
      }
      
      this.controls.update();

      if (elapsed >= this.duration) {
        this.isTweening = false;
        this.isTweeningLookAt = false; 
      }
    } else if (this.followTarget) {
      const currentTargetPosition = new Vector3();
      this.followTarget.getWorldPosition(currentTargetPosition);
      const desiredCameraPosition = currentTargetPosition.clone().add(this.followOffset);

      this.camera.position.lerp(desiredCameraPosition, 0.1);
      this.controls.target.lerp(currentTargetPosition, 0.1);
      this.controls.update();
    }
  }
}