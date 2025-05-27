// enneper-glb.js with full UI controls for GLB model

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

// Get the <script> tag that includes this module script
const scripts = document.querySelectorAll('script[type="module"][src$="enneper-glb.js"]');
const currentScript = scripts[scripts.length - 1];
const glbPath = currentScript.getAttribute('data-glb');

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
if (slider) {
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    if (valueLabel) valueLabel.textContent = v.toFixed(2);
    if (currentModel) {
      currentModel.traverse(o => {
        if (o.isMesh) {
          o.material.opacity = v;
          o.material.transparent = v < 1.0;
        }
      });
    }
  });
}

// Toggle axes
if (toggleAxesBtn) {
  toggleAxesBtn.addEventListener('click', () => {
    const visible = !axesHelper.visible;
    axesHelper.visible = visible;
    controls.setGizmosVisible(visible);
    toggleAxesBtn.classList.toggle('active', visible);
    toggleAxesBtn.textContent = visible ? 'Axes: ON' : 'Axes: OFF';
  });
}

// Toggle edges
if (toggleEdgesBtn) {
  toggleEdgesBtn.addEventListener('click', () => {
    edgesVisible = !edgesVisible;
    edgeObjects.forEach(edge => edge.visible = edgesVisible);
    toggleEdgesBtn.classList.toggle('active', edgesVisible);
    toggleEdgesBtn.textContent = edgesVisible ? 'Edges: ON' : 'Edges: OFF';
  });
}

// Zoom and move controls
if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    if (currentModel) currentModel.scale.multiplyScalar(1.1);
  });
}
if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    if (currentModel) currentModel.scale.multiplyScalar(0.9);
  });
}

const moveDelta = 0.1;
if (moveLeftBtn) {
  moveLeftBtn.addEventListener('click', () => {
    if (currentModel) currentModel.position.x += moveDelta;
  });
}
if (moveRightBtn) {
  moveRightBtn.addEventListener('click', () => {
    if (currentModel) currentModel.position.x -= moveDelta;
  });
}
if (moveUpBtn) {
  moveUpBtn.addEventListener('click', () => {
    if (currentModel) currentModel.position.y -= moveDelta;
  });
}
if (moveDownBtn) {
  moveDownBtn.addEventListener('click', () => {
    if (currentModel) currentModel.position.y += moveDelta;
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    location.reload();
  });
}

// Load GLB model
const loader = new GLTFLoader();
loader.load(glbPath, gltf => {
  const model = gltf.scene;
  model.traverse(child => {
    if (child.isMesh) {
      child.material.transparent = true;
      child.material.opacity = slider ? parseFloat(slider.value) : 1.0;
      child.material.side = THREE.DoubleSide;
      child.renderOrder = 1;

      const edgeGeom = new THREE.EdgesGeometry(child.geometry);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const edges = new THREE.LineSegments(edgeGeom, edgeMat);
      edges.visible = false;
      child.add(edges);
      edgeObjects.push(edges);
    }
  });

  model.scale.set(1, 1, 1);
  model.position.set(0, 0, 0);
  scene.add(model);
  currentModel = model;
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';
}, undefined, () => {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'block';
});

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  dirLight.position.copy(camera.position);
  dirLight.target.position.set(0, 0, 0);
  dirLight.target.updateMatrixWorld();
  controls.update();
  renderer.render(scene, camera);
};
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
