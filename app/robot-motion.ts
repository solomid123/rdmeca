import type {PerspectiveCamera, Vector3} from 'three';

// Rotate the camera and its up vector together, so pitch can pass both poles
// and complete a full revolution without a spherical-angle clamp.
export function rotateRobotCamera(camera: PerspectiveCamera, target: Vector3, horizontal: number, vertical: number, roll = 0) {
  const offset = camera.position.clone().sub(target);
  const right = camera.up.clone().cross(offset).normalize();
  const pitch = camera.quaternion.clone().setFromAxisAngle(right, vertical);
  offset.applyQuaternion(pitch); camera.up.applyQuaternion(pitch).normalize();
  const yaw = camera.quaternion.clone().setFromAxisAngle(camera.up, horizontal);
  offset.applyQuaternion(yaw);
  if (roll) camera.up.applyQuaternion(camera.quaternion.clone().setFromAxisAngle(offset.clone().normalize(), roll)).normalize();
  camera.position.copy(target).add(offset); camera.lookAt(target);
}
