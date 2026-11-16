import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import * as THREE from 'three';

const source = await readFile(new URL('../app/robot-motion.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
const {rotateRobotCamera} = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const target = new THREE.Vector3(.3, -.2, .1);
for (const axis of ['horizontal', 'vertical', 'roll']) {
  const camera = new THREE.PerspectiveCamera(38, 1, .005, 60);
  camera.position.copy(target).add(new THREE.Vector3(.42, .2, 1).normalize().multiplyScalar(2));
  camera.lookAt(target);
  const initialPosition = camera.position.clone(), initialUp = camera.up.clone(), initialRotation = camera.quaternion.clone();
  let inverted = false, rear = false;
  for (let index = 0; index < 120; index++) {
    const angle = Math.PI * 2 / 120;
    rotateRobotCamera(camera, target, axis === 'horizontal' ? angle : 0, axis === 'vertical' ? angle : 0, axis === 'roll' ? angle : 0);
    assert.ok(Math.abs(camera.position.distanceTo(target) - 2) < 1e-10, 'Rotation must preserve zoom distance');
    assert.ok(Math.abs(camera.up.length() - 1) < 1e-10, 'Camera up must remain normalised');
    assert.ok(camera.position.toArray().every(Number.isFinite) && camera.quaternion.toArray().every(Number.isFinite), 'Crossing either pole must remain finite');
    inverted ||= camera.up.y < -.8; rear ||= camera.position.z < target.z;
  }
  assert.ok(camera.position.distanceTo(initialPosition) < 1e-10, axis + ' must complete 360 degrees and return to its starting position');
  assert.ok(camera.up.distanceTo(initialUp) < 1e-10, axis + ' must complete a full roll without flipping');
  assert.ok(1 - Math.abs(camera.quaternion.dot(initialRotation)) < 1e-10, axis + ' must restore its starting orientation');
  if (axis === 'vertical' || axis === 'roll') assert.ok(inverted, 'Camera must freely pass through an upside-down orientation');
  if (axis !== 'roll') assert.ok(rear, 'Camera must reach the rear of the component');
}
console.log('Passed: complete 360-degree horizontal, vertical and roll rotations, both pole crossings, stable zoom distance and orientation round trips.');
