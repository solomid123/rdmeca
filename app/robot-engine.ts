import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {rotateRobotCamera} from './robot-motion';

export type RobotStage = 0 | 1 | 2 | 3;
export type RobotView = 'isometric' | 'front' | 'side';
export type RobotEngine = {
  setStage: (stage: RobotStage) => void;
  setActive: (active: boolean) => void;
  setAutoRotate: (enabled: boolean) => void;
  setMeshVisible: (enabled: boolean) => void;
  setView: (view: RobotView) => void;
  zoom: (direction: number) => void;
  rotate: (horizontal: number, vertical: number) => void;
  roll: (angle: number) => void;
  pan: (horizontal: number, vertical: number) => void;
  reset: () => void;
  dispose: () => void;
};
type Callbacks = {
  onLoad: (state: 'component' | 'assembly' | 'ready' | 'error', progress?: number) => void;
  onInteraction: () => void;
};

// The four views share this source component. The surface colour field is a
// qualitative bending pattern, not a solved finite-element result or MPa data.
const SOURCE_COMPONENT_NODE = 4;
const SOURCE_COMPONENT_NAME = '394.304-10.001.03-00umm000~00';
const PART_MIN_Z = -.071354188;
const PART_MAX_Z = .645257473;
const FULL_BOUNDS = new THREE.Box3(
  new THREE.Vector3(-.344332993, 0, -.21865979),
  new THREE.Vector3(.945199995, 1.214033678, .278385181),
);
const palette = ['#2446ed', '#00bbec', '#24d794', '#f6e944', '#ff9234', '#f04443'].map(c => new THREE.Color(c));

function stressColours(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute('position');
  const colours = new Float32Array(positions.count * 3);
  const colour = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i), x = positions.getX(i), y = positions.getY(i);
    const moment = THREE.MathUtils.clamp((z - PART_MIN_Z) / (PART_MAX_Z - PART_MIN_Z), 0, 1);
    const fibre = THREE.MathUtils.clamp(Math.abs(x) / .093 * .65 + Math.abs(y - .0364) / .074 * .35, 0, 1);
    const value = THREE.MathUtils.clamp(moment * (.86 + .14 * fibre) / .82, 0, 1);
    const stop = value * (palette.length - 1), index = Math.min(palette.length - 2, Math.floor(stop));
    colour.copy(palette[index]).lerp(palette[index + 1], stop - index);
    colour.toArray(colours, i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
}

export function createRobotEngine(host: HTMLDivElement, callbacks: Callbacks, signal: AbortSignal): RobotEngine {
  const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', host.dataset.canvasLabel || 'Interactive 3D robot component');
  canvas.dataset.robotCanvas = '';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .005, 60);
  camera.position.set(.66, .32, 1.56);
  const controls = new TrackballControls(camera, canvas);
  controls.staticMoving = true;
  controls.rotateSpeed = 2.2;
  controls.zoomSpeed = 1.1;
  controls.panSpeed = .45;
  controls.multiTouchRoll = true;
  controls.keys = ['', '', ''];
  controls.minDistance = .2;
  controls.maxDistance = 8;
  controls.target.set(0, 0, 0);
  controls.mouseButtons = {LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa1acc6, .85));
  const key = new THREE.DirectionalLight(0xffffff, 1.65); key.position.set(3, 5, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbec5ff, .65); fill.position.set(-3, 1, -2); scene.add(fill);

  const componentRoot = new THREE.Group(); scene.add(componentRoot);
  const assemblyRoot = new THREE.Group(); assemblyRoot.visible = false; scene.add(assemblyRoot);
  const grid = new THREE.GridHelper(4, 32, 0xc5cbe0, 0xe0e4ef);
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach(material => {material.transparent = true; material.opacity = .25; material.depthWrite = false;});
  grid.position.y = -.38; scene.add(grid);

  const cadMaterial = new THREE.MeshStandardMaterial({color: '#8c98ad', metalness: .48, roughness: .35, envMapIntensity: .8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
  const stressMaterial = new THREE.MeshStandardMaterial({vertexColors: true, metalness: 0, roughness: .9, envMapIntensity: .12, toneMapped: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
  const meshMaterial = new THREE.LineBasicMaterial({color: '#4b51bc', transparent: true, opacity: .27, depthWrite: false});
  const stressMeshMaterial = new THREE.LineBasicMaterial({color: '#17204b', transparent: true, opacity: .12, depthWrite: false});
  const edgeMaterial = new THREE.LineBasicMaterial({color: '#576179', transparent: true, opacity: .22, depthWrite: false});
  const surfaces: THREE.Mesh[] = [], wires: THREE.LineSegments[] = [], edges: THREE.LineSegments[] = [];
  const sourceFinishes = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const ownedGeometries = new Set<THREE.BufferGeometry>([grid.geometry]);
  const ownedMaterials = new Set<THREE.Material>([cadMaterial, stressMaterial, meshMaterial, stressMeshMaterial, edgeMaterial, ...gridMaterials]);
  const assemblyMaterials: THREE.MeshStandardMaterial[] = [];
  const loader = new GLTFLoader();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const partCentre = new THREE.Vector3(), fullCentre = FULL_BOUNDS.getCenter(new THREE.Vector3());
  let partBounds = new THREE.Box3(), stage: RobotStage = 0, active = false, autoRotate = !reduced.matches;
  let meshVisible = true, disposed = false, frame = 0, partReady = false, assemblyReady = false, loadingAssembly = false;
  let renderCount = 0, drawing = false, view: RobotView = 'isometric', settleUntil = 0, lastFrame = performance.now();
  let transition: null | {start: number; duration: number; partFrom: THREE.Vector3; partTo: THREE.Vector3; rotationFrom: THREE.Quaternion; rotationTo: THREE.Quaternion; distanceFrom: number; distanceTo: number; targetFrom: THREE.Vector3; targetTo: THREE.Vector3; opacityFrom: number; opacityTo: number; groundFrom: number; groundTo: number} = null;

  function sourceFinish(original: THREE.Material) {
    const material = original instanceof THREE.MeshStandardMaterial ? original.clone() : new THREE.MeshStandardMaterial();
    material.vertexColors = false;
    material.metalness = Math.min(material.metalness, .35);
    material.roughness = Math.max(material.roughness, .35);
    material.envMapIntensity = .65;
    material.side = THREE.DoubleSide;
    material.polygonOffset = true; material.polygonOffsetFactor = 1; material.polygonOffsetUnits = 1;
    ownedMaterials.add(material); return material;
  }

  function trackScene(root: THREE.Object3D) {
    root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        ownedGeometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) ownedMaterials.add(material);
      }
    });
  }
  async function load(path: string, kind: 'component' | 'assembly'): Promise<GLTF> {
    callbacks.onLoad(kind, 0);
    const response = await fetch(path, {signal});
    if (!response.ok) throw new Error('Robot geometry could not be loaded.');
    const length = Number(response.headers.get('content-length'));
    let bytes: ArrayBuffer;
    if (response.body && length > 0) {
      const reader = response.body.getReader(), chunks: Uint8Array[] = []; let received = 0;
      while (true) {const next = await reader.read(); if (next.done) break; chunks.push(next.value); received += next.value.byteLength; callbacks.onLoad(kind, Math.min(.96, received / length));}
      const data = new Uint8Array(received); let offset = 0;
      for (const chunk of chunks) {data.set(chunk, offset); offset += chunk.byteLength;}
      bytes = data.buffer;
    } else {bytes = await response.arrayBuffer(); callbacks.onLoad(kind, .9);}
    return loader.parseAsync(bytes, '/assets/models/');
  }
  function fitDistance(bounds: THREE.Box3, direction = directionForView(), cameraUp = camera.up) {
    const half = bounds.getSize(new THREE.Vector3()).multiplyScalar(.5);
    const right = new THREE.Vector3().crossVectors(cameraUp, direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    let width = 0, height = 0, depth = 0;
    for (const x of [-half.x, half.x]) for (const y of [-half.y, half.y]) for (const z of [-half.z, half.z]) {
      const corner = new THREE.Vector3(x, y, z);
      width = Math.max(width, Math.abs(corner.dot(right))); height = Math.max(height, Math.abs(corner.dot(up))); depth = Math.max(depth, Math.abs(corner.dot(direction)));
    }
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    return (Math.max(height / Math.tan(halfFov), width / (Math.tan(halfFov) * camera.aspect)) + depth) * 1.13;
  }
  function directionForView() {
    return view === 'front' ? new THREE.Vector3(0, .05, 1) : view === 'side' ? new THREE.Vector3(1, .05, 0) : new THREE.Vector3(.42, .2, 1).normalize();
  }
  function currentOpacity() {return assemblyMaterials[0]?.opacity ?? 0;}
  function updateAssemblyOpacity(value: number) {
    assemblyRoot.visible = value > .002;
    assemblyMaterials.forEach(material => {material.opacity = value; material.transparent = value < .999; material.depthWrite = value > .65;});
  }
  function beginTransition(resetCamera = false, cameraOnly = false) {
    if (!partReady) return;
    const full = stage === 3 && assemblyReady;
    const partTo = (full ? fullCentre : partCentre).clone().negate();
    const direction = resetCamera ? directionForView() : camera.position.clone().sub(controls.target).normalize();
    if (direction.lengthSq() < .01) direction.copy(directionForView());
    const up = resetCamera ? new THREE.Vector3(0, 1, 0) : camera.up.clone();
    const distance = fitDistance(full ? FULL_BOUNDS : partBounds, direction, up) * (full ? .86 : 1);
    const targetTo = new THREE.Vector3();
    const rotationTo = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(direction, targetTo, up));
    transition = {
      start: performance.now(), duration: reduced.matches ? 1 : cameraOnly ? 650 : 1250,
      partFrom: componentRoot.position.clone(), partTo,
      rotationFrom: camera.quaternion.clone(), rotationTo,
      distanceFrom: camera.position.distanceTo(controls.target), distanceTo: distance,
      targetFrom: controls.target.clone(), targetTo,
      opacityFrom: currentOpacity(), opacityTo: full ? 1 : 0,
      groundFrom: grid.position.y, groundTo: full ? FULL_BOUNDS.min.y - fullCentre.y - .025 : partBounds.min.y - partCentre.y - .025,
    };
    wake();
  }
  function applyStage() {
    surfaces.forEach(mesh => {mesh.material = stage === 2 ? stressMaterial : stage === 1 ? cadMaterial : sourceFinishes.get(mesh) || cadMaterial;});
    wires.forEach(wire => {wire.visible = (stage === 1 || stage === 2) && meshVisible; wire.material = stage === 2 ? stressMeshMaterial : meshMaterial;});
    edges.forEach(edge => {edge.visible = stage === 0;});
    host.dataset.stage = String(stage);
    host.dataset.triangles = String(stage === 3 && assemblyReady ? 333423 : 37234);
  }
  async function ensureAssembly() {
    if (assemblyReady || loadingAssembly || disposed) return;
    loadingAssembly = true;
    try {
      const gltf = await load('/assets/models/robot-arm.glb', 'assembly');
      trackScene(gltf.scene);
      if (disposed) {gltf.scene.traverse(object => {if (object instanceof THREE.Mesh) {object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());}}); return;}
      const remove: THREE.Object3D[] = [];
      gltf.scene.traverse(object => {
        if (object instanceof THREE.Camera || object instanceof THREE.Light) remove.push(object);
        const association = gltf.parser.associations.get(object);
        if (association?.nodes === SOURCE_COMPONENT_NODE || object.name === SOURCE_COMPONENT_NAME) object.visible = false;
        if (object instanceof THREE.Mesh) {
          const materials = (Array.isArray(object.material) ? object.material : [object.material]).map(original => {
            const material = sourceFinish(original); material.transparent = true; material.opacity = 0; assemblyMaterials.push(material); return material;
          });
          object.material = Array.isArray(object.material) ? materials : materials[0];
        }
      });
      remove.forEach(object => object.removeFromParent());
      assemblyRoot.add(gltf.scene); assemblyRoot.position.copy(fullCentre).negate(); assemblyReady = true;
      host.dataset.assemblyReady = 'true';
      callbacks.onLoad('ready', 1); applyStage();
      if (stage === 3) beginTransition();
    } catch (error) {if (!disposed && !signal.aborted) callbacks.onLoad('error');}
    finally {loadingAssembly = false;}
  }
  function draw(now: number) {
    frame = 0;
    if (disposed) return;
    drawing = true;
    const delta = Math.min((now - lastFrame) / 1000, .05); lastFrame = now;
    if (autoRotate && active && !reduced.matches && !transition) rotateRobotCamera(camera, controls.target, THREE.MathUtils.degToRad(3.9) * delta, 0);
    if (transition) {
      const t = Math.min(1, (now - transition.start) / transition.duration);
      const ease = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      componentRoot.position.lerpVectors(transition.partFrom, transition.partTo, ease);
      controls.target.lerpVectors(transition.targetFrom, transition.targetTo, ease);
      const rotation = transition.rotationFrom.clone().slerp(transition.rotationTo, ease);
      const distance = THREE.MathUtils.lerp(transition.distanceFrom, transition.distanceTo, ease);
      camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, distance).applyQuaternion(rotation));
      camera.up.set(0, 1, 0).applyQuaternion(rotation);
      updateAssemblyOpacity(THREE.MathUtils.lerp(transition.opacityFrom, transition.opacityTo, ease));
      grid.position.y = THREE.MathUtils.lerp(transition.groundFrom, transition.groundTo, ease);
      if (t === 1) {transition = null; settleUntil = now + 200;}
    }
    controls.update();
    renderer.render(scene, camera);
    host.dataset.renderFrame = String(++renderCount);
    host.dataset.motion = active ? autoRotate && !reduced.matches ? 'orbiting' : 'interactive' : 'paused';
    host.dataset.cameraUp = camera.up.toArray().map(value => value.toFixed(5)).join(',');
    host.dataset.cameraOffset = camera.position.clone().sub(controls.target).toArray().map(value => value.toFixed(5)).join(',');
    drawing = false;
    if (active && !document.hidden && (autoRotate && !reduced.matches || transition || now < settleUntil)) frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (!disposed && !frame && !document.hidden) {lastFrame = performance.now(); frame = requestAnimationFrame(draw);}
  }
  function interact() {
    autoRotate = false; transition = null; callbacks.onInteraction(); settleUntil = performance.now() + 1100; wake();
  }
  controls.addEventListener('start', interact);
  const changed = () => {if (!frame && !drawing) {settleUntil = performance.now() + 900; wake();}};
  controls.addEventListener('change', changed);
  const pointerMove = (event: PointerEvent) => {if (event.buttons || event.pointerType === 'touch') {settleUntil = performance.now() + 1100; wake();}};
  canvas.addEventListener('pointermove', pointerMove);
  const scrollViewport = () => controls.handleResize(); window.addEventListener('scroll', scrollViewport, {passive: true});
  const contextMenu = (event: Event) => event.preventDefault(); canvas.addEventListener('contextmenu', contextMenu);
  const resize = new ResizeObserver(() => {
    const width = host.clientWidth, height = host.clientHeight; if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    controls.handleResize();
    if (partReady) beginTransition(false, true); else {camera.position.copy(directionForView().multiplyScalar(1.7)); wake();}
  }); resize.observe(host);
  const motionPolicy = () => {if (reduced.matches) autoRotate = false; settleUntil = performance.now() + 100; wake();};
  reduced.addEventListener('change', motionPolicy);

  void load('/assets/models/robot-structural-arm.glb', 'component').then(gltf => {
    trackScene(gltf.scene);
    if (disposed) {gltf.scene.traverse(object => {if (object instanceof THREE.Mesh) {object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());}}); return;}
    componentRoot.add(gltf.scene); gltf.scene.updateMatrixWorld(true);
    partBounds = new THREE.Box3().setFromObject(gltf.scene); partBounds.getCenter(partCentre);
    const partMeshes: THREE.Mesh[] = [];
    gltf.scene.traverse(object => {if (object instanceof THREE.Mesh) partMeshes.push(object);});
    partMeshes.forEach(mesh => {
      sourceFinishes.set(mesh, Array.isArray(mesh.material) ? mesh.material.map(sourceFinish) : sourceFinish(mesh.material));
      const geometry = mesh.geometry.clone(); ownedGeometries.add(geometry); stressColours(geometry); mesh.geometry = geometry;
      mesh.material = cadMaterial; surfaces.push(mesh);
      const wireGeometry = new THREE.WireframeGeometry(geometry); ownedGeometries.add(wireGeometry);
      const wire = new THREE.LineSegments(wireGeometry, meshMaterial); wire.visible = false; mesh.add(wire); wires.push(wire);
      const edgeGeometry = new THREE.EdgesGeometry(geometry, 35); ownedGeometries.add(edgeGeometry);
      const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial); mesh.add(edge); edges.push(edge);
    });
    componentRoot.position.copy(partCentre).negate();
    camera.position.copy(directionForView().multiplyScalar(fitDistance(partBounds))); controls.target.set(0, 0, 0); controls.update();
    grid.position.y = partBounds.min.y - partCentre.y - .025;
    partReady = true; host.dataset.status = 'ready'; callbacks.onLoad('ready', 1); applyStage(); wake();
    if (stage === 3) {if (assemblyReady) beginTransition(); else void ensureAssembly();}
  }).catch(() => {if (!disposed && !signal.aborted) {host.dataset.status = 'error'; callbacks.onLoad('error');}});

  return {
    setStage(value) {const previous = stage; stage = value; meshVisible = true; applyStage(); if (stage === 3 && partReady && !assemblyReady) void ensureAssembly(); else if (partReady && (previous === 3 || stage === 3)) beginTransition(); else wake();},
    setActive(value) {active = value; if (active) wake(); else {cancelAnimationFrame(frame); frame = 0; host.dataset.motion = 'paused';}},
    setAutoRotate(value) {autoRotate = value; settleUntil = performance.now() + 100; wake();},
    setMeshVisible(value) {meshVisible = value; applyStage(); wake();},
    setView(value) {view = value; autoRotate = false; callbacks.onInteraction(); beginTransition(true, true);},
    zoom(direction) {if (!partReady) return; interact(); const offset = camera.position.clone().sub(controls.target); const distance = THREE.MathUtils.clamp(offset.length() * (direction > 0 ? .82 : 1.22), controls.minDistance, controls.maxDistance); camera.position.copy(controls.target).add(offset.setLength(distance)); controls.update(); wake();},
    rotate(horizontal, vertical) {if (!partReady) return; interact(); rotateRobotCamera(camera, controls.target, horizontal, vertical); controls.update(); wake();},
    roll(angle) {if (!partReady) return; interact(); rotateRobotCamera(camera, controls.target, 0, 0, angle); controls.update(); wake();},
    pan(horizontal, vertical) {if (!partReady) return; interact(); const distance = camera.position.distanceTo(controls.target); const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0); const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1); const offset = right.multiplyScalar(horizontal * distance * .035).add(up.multiplyScalar(vertical * distance * .035)); camera.position.add(offset); controls.target.add(offset); controls.update(); wake();},
    reset() {view = 'isometric'; autoRotate = false; callbacks.onInteraction(); beginTransition(true, true);},
    dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(frame); resize.disconnect(); reduced.removeEventListener('change', motionPolicy);
      controls.removeEventListener('start', interact); controls.removeEventListener('change', changed); controls.dispose(); canvas.removeEventListener('contextmenu', contextMenu);
      canvas.removeEventListener('pointermove', pointerMove); window.removeEventListener('scroll', scrollViewport);
      ownedGeometries.forEach(geometry => geometry.dispose()); ownedMaterials.forEach(material => material.dispose()); environment.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
