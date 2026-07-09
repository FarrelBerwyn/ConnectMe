/* ============================================
   ConnectMe — 3D Viewer Module
   Three.js scene with procedural geometry
   ============================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Viewer3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mainModel = null;
    this.modelGroup = null;
    this.particles = null;
    this.animationId = null;
    this.isRunning = false;
    this.autoRotate = true;
    this.wireframeMode = false;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.canvas.clientWidth / this.canvas.clientHeight || window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 2.0;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;

    // Lighting
    this.setupLighting();

    // Background particles
    this.createBackgroundParticles();

    // Grid helper (subtle)
    this.createGrid();

    // Events
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Fill light (cool tone)
    const fillLight = new THREE.DirectionalLight(0x6C63FF, 0.4);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Rim light (warm)
    const rimLight = new THREE.DirectionalLight(0x00D4AA, 0.3);
    rimLight.position.set(0, -3, 8);
    this.scene.add(rimLight);

    // Point light near center
    const pointLight = new THREE.PointLight(0x6C63FF, 0.5, 20);
    pointLight.position.set(0, 3, 0);
    this.scene.add(pointLight);
  }

  createBackgroundParticles() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x6C63FF,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x1a1a3e, 0x1a1a3e);
    gridHelper.position.y = -1.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    this.scene.add(gridHelper);
  }

  /**
   * Generate a 3D model based on QR data
   */
  loadModel(data) {
    // Clear existing model
    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
      this.disposeGroup(this.modelGroup);
    }

    this.modelGroup = new THREE.Group();

    const color = new THREE.Color(data.color || '#6C63FF');
    const modelType = (data.model || 'cube').toLowerCase();

    // Create main geometry
    let geometry;
    switch (modelType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.2, 64, 64);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(1, 0.4, 32, 64);
        break;
      case 'diamond':
        geometry = this.createDiamondGeometry();
        break;
      case 'rocket':
        this.createRocketModel(color);
        this.scene.add(this.modelGroup);
        return;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 64);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(1, 2, 64);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(1.2);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(1.2);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1.2);
        break;
      case 'knot':
        geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32);
        break;
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 4, 4, 4);
        break;
    }

    // Main material (glossy)
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    this.mainModel = new THREE.Mesh(geometry, mainMaterial);
    this.mainModel.castShadow = true;
    this.mainModel.receiveShadow = true;
    this.modelGroup.add(this.mainModel);

    // Wireframe overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMat);
    wireframeMesh.scale.multiplyScalar(1.01);
    wireframeMesh.name = 'wireframe-overlay';
    this.modelGroup.add(wireframeMesh);

    // Glow effect (larger, transparent version)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(geometry.clone(), glowMaterial);
    glowMesh.scale.multiplyScalar(1.3);
    glowMesh.name = 'glow';
    this.modelGroup.add(glowMesh);

    // Orbiting ring
    this.addOrbitRing(color);

    // Floating small spheres
    this.addFloatingOrbs(color);

    this.scene.add(this.modelGroup);
  }

  createDiamondGeometry() {
    const topRadius = 0;
    const midRadius = 1.2;
    const bottomRadius = 0;
    const topHeight = 1.0;
    const bottomHeight = 1.5;

    const top = new THREE.ConeGeometry(midRadius, topHeight, 8);
    top.translate(0, topHeight / 2, 0);

    const bottom = new THREE.ConeGeometry(midRadius, bottomHeight, 8);
    bottom.rotateX(Math.PI);
    bottom.translate(0, -bottomHeight / 2, 0);

    // Merge geometries
    const mergedGeometry = new THREE.BufferGeometry();
    const topPositions = top.attributes.position.array;
    const bottomPositions = bottom.attributes.position.array;
    const topNormals = top.attributes.normal.array;
    const bottomNormals = bottom.attributes.normal.array;

    const positions = new Float32Array(topPositions.length + bottomPositions.length);
    positions.set(topPositions, 0);
    positions.set(bottomPositions, topPositions.length);

    const normals = new Float32Array(topNormals.length + bottomNormals.length);
    normals.set(topNormals, 0);
    normals.set(bottomNormals, topNormals.length);

    mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    // Build index
    const topIndex = top.index ? Array.from(top.index.array) : [];
    const bottomIndex = bottom.index ? Array.from(bottom.index.array) : [];
    const vertexOffset = topPositions.length / 3;
    const mergedIndex = [...topIndex, ...bottomIndex.map(i => i + vertexOffset)];
    mergedGeometry.setIndex(mergedIndex);

    top.dispose();
    bottom.dispose();

    return mergedGeometry;
  }

  createRocketModel(color) {
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 2, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.4,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    this.modelGroup.add(body);

    // Nose cone
    const noseGeo = new THREE.ConeGeometry(0.4, 1, 32);
    const noseMat = new THREE.MeshPhysicalMaterial({
      color: 0xFF6B9D,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 1.5;
    nose.castShadow = true;
    this.modelGroup.add(nose);

    // Fins
    const finShape = new THREE.BufferGeometry();
    const finVertices = new Float32Array([
      0, 0, 0,
      0.8, -0.5, 0,
      0, -1, 0,
    ]);
    finShape.setAttribute('position', new THREE.BufferAttribute(finVertices, 3));
    finShape.computeVertexNormals();

    const finMat = new THREE.MeshPhysicalMaterial({
      color: 0x00D4AA,
      metalness: 0.4,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finShape.clone(), finMat);
      fin.position.y = -0.5;
      fin.rotation.y = (Math.PI / 2) * i;
      fin.castShadow = true;
      this.modelGroup.add(fin);
    }

    // Engine glow
    const engineGeo = new THREE.CylinderGeometry(0.3, 0.1, 0.5, 16);
    const engineMat = new THREE.MeshBasicMaterial({
      color: 0xFF8800,
      transparent: true,
      opacity: 0.8,
    });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.y = -1.25;
    engine.name = 'engine-glow';
    this.modelGroup.add(engine);

    // Add orbiting ring
    this.addOrbitRing(color);
    this.addFloatingOrbs(color);

    this.mainModel = body;
  }

  addOrbitRing(color) {
    const ringGeo = new THREE.TorusGeometry(2.2, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.name = 'orbit-ring';
    this.modelGroup.add(ring);
  }

  addFloatingOrbs(color) {
    const orbGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });

    for (let i = 0; i < 5; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat.clone());
      const angle = (Math.PI * 2 * i) / 5;
      orb.position.set(
        Math.cos(angle) * 2.2,
        Math.sin(angle * 0.5) * 0.5,
        Math.sin(angle) * 2.2
      );
      orb.name = `floating-orb-${i}`;
      this.modelGroup.add(orb);
    }
  }

  /**
   * Update the info panel with QR data
   */
  updateInfoPanel(data) {
    const typeIcons = {
      product: '📦',
      person: '👤',
      location: '📍',
      info: 'ℹ️',
      link: '🔗',
    };

    document.getElementById('info-type-text').textContent = (data.type || 'INFO').toUpperCase();
    document.getElementById('info-type').querySelector('span:first-child').textContent = typeIcons[data.type] || '📄';
    document.getElementById('info-title').textContent = data.title;
    document.getElementById('info-desc').textContent = data.description;

    // Details
    const detailsContainer = document.getElementById('info-details');
    detailsContainer.innerHTML = '';

    if (data.details && typeof data.details === 'object') {
      Object.entries(data.details).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `
          <span class="detail-key">${key}</span>
          <span class="detail-value">${value}</span>
        `;
        detailsContainer.appendChild(item);
      });
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
    return this.autoRotate;
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;

    if (this.modelGroup) {
      this.modelGroup.traverse((child) => {
        if (child.isMesh && child.material && child.name !== 'wireframe-overlay' && child.name !== 'glow') {
          if (child.material.isMeshPhysicalMaterial || child.material.isMeshStandardMaterial) {
            child.material.wireframe = this.wireframeMode;
          }
        }
      });
    }
    return this.wireframeMode;
  }

  resetCamera() {
    if (this.controls) {
      this.camera.position.set(0, 2, 5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  onResize() {
    const container = this.canvas.parentElement;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Model floating animation
    if (this.modelGroup) {
      this.modelGroup.position.y = Math.sin(elapsed * 0.8) * 0.15;

      // Orbit ring rotation
      const ring = this.modelGroup.getObjectByName('orbit-ring');
      if (ring) {
        ring.rotation.z = elapsed * 0.3;
      }

      // Floating orbs
      for (let i = 0; i < 5; i++) {
        const orb = this.modelGroup.getObjectByName(`floating-orb-${i}`);
        if (orb) {
          const angle = (Math.PI * 2 * i) / 5 + elapsed * 0.5;
          orb.position.x = Math.cos(angle) * 2.2;
          orb.position.z = Math.sin(angle) * 2.2;
          orb.position.y = Math.sin(elapsed * 1.5 + i) * 0.3;
        }
      }

      // Engine glow pulse (rocket)
      const engine = this.modelGroup.getObjectByName('engine-glow');
      if (engine) {
        engine.material.opacity = 0.5 + Math.sin(elapsed * 5) * 0.3;
        engine.scale.y = 1 + Math.sin(elapsed * 8) * 0.1;
      }
    }

    // Background particles rotation
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.02;
      this.particles.rotation.x = elapsed * 0.01;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  disposeGroup(group) {
    group.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  dispose() {
    this.stop();
    if (this.modelGroup) {
      this.disposeGroup(this.modelGroup);
    }
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
