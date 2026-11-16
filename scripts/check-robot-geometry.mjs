import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
async function open(name) {
  const bytes = await readFile(new URL('../public/assets/models/' + name, import.meta.url));
  return loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
}
const [robot, arm] = await Promise.all([open('robot-arm.glb'), open('robot-structural-arm.glb')]);
robot.scene.updateMatrixWorld(true); arm.scene.updateMatrixWorld(true);
function node(gltf, index) {
  let found;
  gltf.scene.traverse(object => {if (gltf.parser.associations.get(object)?.nodes === index) found = object;});
  assert.ok(found, 'Source node must be present'); return found;
}
function surfaces(root) {const list = []; root.traverse(object => {if (object instanceof THREE.Mesh) list.push(object);}); return list;}
const original = node(robot, 4), isolated = node(arm, 0);
const originalMeshes = surfaces(original), isolatedMeshes = surfaces(isolated);
assert.equal(originalMeshes.length, 2, 'Both arm primitives must be retained');
assert.equal(isolatedMeshes.length, originalMeshes.length);
for (let i = 0; i < 16; i++) assert.ok(Math.abs(original.matrixWorld.elements[i] - isolated.matrixWorld.elements[i]) < 1e-7, 'Isolated arm must retain its source placement');
for (let i = 0; i < originalMeshes.length; i++) {
  for (const name of ['position', 'normal']) assert.deepEqual(isolatedMeshes[i].geometry.getAttribute(name).array, originalMeshes[i].geometry.getAttribute(name).array, 'Source vertex data must be unchanged');
  assert.deepEqual(isolatedMeshes[i].geometry.index.array, originalMeshes[i].geometry.index.array, 'Source triangulation must be unchanged');
}
const triangles = meshes => meshes.reduce((total, mesh) => total + mesh.geometry.index.count / 3, 0);
assert.equal(triangles(isolatedMeshes), 37234);
assert.equal(triangles(surfaces(robot.scene)), 333423);
const originalBox = new THREE.Box3().setFromObject(original), isolatedBox = new THREE.Box3().setFromObject(isolated);
assert.ok(originalBox.min.distanceTo(isolatedBox.min) < 1e-7 && originalBox.max.distanceTo(isolatedBox.max) < 1e-7, 'Reinserted arm must occupy its original envelope');
assert.equal(robot.animations.length, 0);
console.log('Passed: both source primitives, unchanged positions/normals/triangulation, original assembly transform and envelope, 37,234 arm triangles and 333,423 robot triangles.');
