import * as THREE from 'three';
import { ArcballControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/ArcballControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/MTLLoader.js';

// // Get model path from <script> tag attributes
const scripts = document.querySelectorAll('script[type="module"][src$="model.js"]');
const currentScript = scripts[scripts.length - 1];
const objPath = currentScript.getAttribute('data-obj');
const mtlPath = currentScript.getAttribute('data-mtl');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new ArcballControls(camera, renderer.domElement, scene);
controls.enableAnimations = true;
controls.setGizmosVisible(false);
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0xffffff, 1.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
scene.add(dirLight);

// Axes helper
const axesHelper = new THREE.AxesHelper(1.5);
axesHelper.visible = false;
scene.add(axesHelper);

// UI elements
const slider = document.getElementById('opacitySlider');
const valueLabel = document.getElementById('opacityValue');
const toggleAxesBtn = document.getElementById('toggleAxes');
const toggleEdgesBtn = document.getElementById('toggleEdges');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const moveLeftBtn = document.getElementById('moveLeftBtn');
const moveRightBtn = document.getElementById('moveRightBtn');
const moveUpBtn = document.getElementById('moveUpBtn');
const moveDownBtn = document.getElementById('moveDownBtn');
const resetBtn = document.getElementById('resetBtn');

let currentModel = null;
let edgesVisible = false;
const edgeObjects = [];

// Opacity slider logic
slider.addEventListener('input', () => {
  const v = parseFloat(slider.value);
  valueLabel.textContent = v.toFixed(2);
  if (currentModel) {
    currentModel.traverse(o => {
      if (o.isMesh) {
        o.material.opacity = v;
        o.material.transparent = v < 1.0;
      }
    });
  }
});

// Toggle axes
toggleAxesBtn.addEventListener('click', () => {
  const visible = !axesHelper.visible;
  axesHelper.visible = visible;
  controls.setGizmosVisible(visible);
  toggleAxesBtn.classList.toggle('active', visible);
  toggleAxesBtn.textContent = visible ? 'Axes: ON' : 'Axes: OFF';
});

// Toggle edges
toggleEdgesBtn.addEventListener('click', () => {
  edgesVisible = !edgesVisible;
  edgeObjects.forEach(edge => edge.visible = edgesVisible);
  toggleEdgesBtn.classList.toggle('active', edgesVisible);
  toggleEdgesBtn.textContent = edgesVisible ? 'Edges: ON' : 'Edges: OFF';
});

// Zoom and move controls
zoomInBtn.addEventListener('click', () => {
  if (currentModel) currentModel.scale.multiplyScalar(1.1);
});
zoomOutBtn.addEventListener('click', () => {
  if (currentModel) currentModel.scale.multiplyScalar(0.9);
});

const moveDelta = 0.1;
moveLeftBtn.addEventListener('click', () => {
  if (currentModel) currentModel.position.x += moveDelta;
});
moveRightBtn.addEventListener('click', () => {
  if (currentModel) currentModel.position.x -= moveDelta;
});
moveUpBtn.addEventListener('click', () => {
  if (currentModel) currentModel.position.y -= moveDelta;
});
moveDownBtn.addEventListener('click', () => {
  if (currentModel) currentModel.position.y += moveDelta;
});

resetBtn.addEventListener('click', () => {
  location.reload();
});

// Load model
new MTLLoader().load(mtlPath, mats => {
  mats.preload();
  new OBJLoader().setMaterials(mats).load(objPath,
    obj => {
      obj.traverse(child => {
        if (!child.isMesh) return;
        child.material.transparent = true;
        child.material.opacity = parseFloat(slider.value);
        child.material.side = THREE.DoubleSide;
        child.renderOrder = 1;

        const edgeGeom = new THREE.EdgesGeometry(child.geometry);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        const edges = new THREE.LineSegments(edgeGeom, edgeMat);
        edges.visible = false;
        child.add(edges);
        edgeObjects.push(edges);
      });

      obj.scale.set(1, 1, 1);
      obj.position.set(0, 0, 0);
      scene.add(obj);
      currentModel = obj;
      document.getElementById('loading').style.display = 'none';
    },
    undefined,
    () => {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').style.display = 'block';
    }
  );
});

// Animate loop
const animate = () => {
  requestAnimationFrame(animate);
  dirLight.position.copy(camera.position);
  dirLight.target.position.set(0, 0, 0);
  dirLight.target.updateMatrixWorld();
  controls.update();
  renderer.render(scene, camera);
};
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});