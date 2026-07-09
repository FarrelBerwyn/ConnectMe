/* ============================================
   ConnectMe — 3D AR Viewer Module
   Integrates with A-Frame and AR.js for WebAR
   ============================================ */

export class Viewer3D {
  constructor(canvasId) {
    // A-Frame elements
    this.sceneEl = document.getElementById('ar-scene');
    this.modelContainer = document.getElementById('ar-model-container');
    
    this.autoRotate = true;
    this.wireframeMode = false;
    this.currentData = null;
    this.rotationAnimation = null;

    this.init();
  }

  init() {
    console.log('📦 AR Viewer Initialized');
  }

  /**
   * Generate a 3D model in A-Frame based on QR data
   */
  loadModel(data) {
    this.currentData = data;
    if (!this.modelContainer) return;

    // Clear existing model
    this.modelContainer.innerHTML = '';

    const color = data.color || '#6C63FF';
    const modelType = (data.model || 'cube').toLowerCase();

    // Create main 3D entity
    let modelEntity = document.createElement('a-entity');
    
    // Configure geometry and material based on QR data
    let geometryAttr = '';
    let materialAttr = `color: ${color}; roughness: 0.2; metalness: 0.3;`;

    if (this.wireframeMode) {
      materialAttr += ' wireframe: true;';
    }

    switch (modelType) {
      case 'sphere':
        geometryAttr = 'primitive: sphere; radius: 0.6; segmentsWidth: 32; segmentsHeight: 32;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'torus':
        geometryAttr = 'primitive: torus; radius: 0.5; radiusTubular: 0.15; segmentsRadial: 16; segmentsTubular: 32;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        modelEntity.setAttribute('rotation', '90 0 0');
        break;
      case 'knot':
        geometryAttr = 'primitive: torusKnot; radius: 0.4; radiusTubular: 0.12; segmentsRadial: 8; segmentsTubular: 64; p: 2; q: 3;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'cylinder':
        geometryAttr = 'primitive: cylinder; radius: 0.4; height: 1.2; segmentsRadial: 32;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'cone':
        geometryAttr = 'primitive: cone; radiusBottom: 0.5; height: 1.2; segmentsRadial: 32;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'dodecahedron':
        geometryAttr = 'primitive: dodecahedron; radius: 0.6;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'icosahedron':
        geometryAttr = 'primitive: icosahedron; radius: 0.6;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'octahedron':
        geometryAttr = 'primitive: octahedron; radius: 0.6;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
      case 'diamond':
        this.buildDiamondModel(modelEntity, color);
        break;
      case 'rocket':
        this.buildRocketModel(modelEntity, color);
        break;
      case 'cube':
      default:
        geometryAttr = 'primitive: box; width: 0.9; height: 0.9; depth: 0.9;';
        modelEntity.setAttribute('geometry', geometryAttr);
        modelEntity.setAttribute('material', materialAttr);
        break;
    }

    // Shadow support
    modelEntity.setAttribute('shadow', 'cast: true; receive: true;');
    
    // ID for reference
    modelEntity.setAttribute('id', 'ar-interactive-model');
    this.modelContainer.appendChild(modelEntity);

    // Add extra decorations (orbiting rings and small floating particles)
    this.addARDecorations(color);

    // Apply auto-rotation if active
    this.updateAutoRotateState();
  }

  buildDiamondModel(parentEntity, color) {
    // A diamond is composed of two cones base-to-base
    let materialAttr = `color: ${color}; roughness: 0.1; metalness: 0.4;`;
    if (this.wireframeMode) materialAttr += ' wireframe: true;';

    const topCone = document.createElement('a-entity');
    topCone.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.5; height: 0.5; segmentsRadial: 8;');
    topCone.setAttribute('material', materialAttr);
    topCone.setAttribute('position', '0 0.25 0');
    parentEntity.appendChild(topCone);

    const bottomCone = document.createElement('a-entity');
    bottomCone.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.5; height: 0.7; segmentsRadial: 8;');
    bottomCone.setAttribute('material', materialAttr);
    bottomCone.setAttribute('position', '0 -0.35 0');
    bottomCone.setAttribute('rotation', '180 0 0');
    parentEntity.appendChild(bottomCone);
  }

  buildRocketModel(parentEntity, color) {
    // Body (cylinder)
    let bodyMat = `color: ${color}; roughness: 0.2; metalness: 0.4;`;
    if (this.wireframeMode) bodyMat += ' wireframe: true;';
    
    const body = document.createElement('a-entity');
    body.setAttribute('geometry', 'primitive: cylinder; radius: 0.2; height: 0.8; segmentsRadial: 16;');
    body.setAttribute('material', bodyMat);
    body.setAttribute('position', '0 0 0');
    parentEntity.appendChild(body);

    // Nose Cone (cone, pink/red)
    let noseMat = `color: #FF6B9D; roughness: 0.2; metalness: 0.3;`;
    if (this.wireframeMode) noseMat += ' wireframe: true;';
    const nose = document.createElement('a-entity');
    nose.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.2; height: 0.4; segmentsRadial: 16;');
    nose.setAttribute('material', noseMat);
    nose.setAttribute('position', '0 0.6 0');
    parentEntity.appendChild(nose);

    // Fins (small boxes)
    let finMat = `color: #00D4AA; roughness: 0.3;`;
    if (this.wireframeMode) finMat += ' wireframe: true;';
    
    for (let i = 0; i < 3; i++) {
      const fin = document.createElement('a-entity');
      fin.setAttribute('geometry', 'primitive: box; width: 0.05; height: 0.3; depth: 0.2;');
      fin.setAttribute('material', finMat);
      const angle = (i * 2 * Math.PI) / 3;
      const x = Math.cos(angle) * 0.25;
      const z = Math.sin(angle) * 0.25;
      fin.setAttribute('position', `${x} -0.3 ${z}`);
      fin.setAttribute('rotation', `0 ${- (angle * 180 / Math.PI)} 0`);
      parentEntity.appendChild(fin);
    }
  }

  addARDecorations(color) {
    // Add an orbiting ring around the model container
    const ring = document.createElement('a-entity');
    ring.setAttribute('geometry', 'primitive: torus; radius: 0.9; radiusTubular: 0.01; segmentsRadial: 8; segmentsTubular: 32;');
    ring.setAttribute('material', `color: ${color}; opacity: 0.4; transparent: true;`);
    ring.setAttribute('rotation', '75 0 0');
    
    // Add self rotation animation to the ring
    ring.setAttribute('animation', 'property: rotation; to: 75 360 0; loop: true; dur: 6000; easing: linear');
    this.modelContainer.appendChild(ring);

    // Add a few small floating dust spheres
    for (let i = 0; i < 4; i++) {
      const orb = document.createElement('a-entity');
      orb.setAttribute('geometry', 'primitive: sphere; radius: 0.04;');
      orb.setAttribute('material', `color: ${color}; opacity: 0.6; transparent: true;`);
      
      const angle = (i * 2 * Math.PI) / 4;
      const r = 0.8;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * 0.4;
      
      orb.setAttribute('position', `${x} ${y} ${z}`);
      
      // Floating animation
      orb.setAttribute('animation', `property: position; to: ${x} ${y + 0.2} ${z}; dir: alternate; loop: true; dur: ${1500 + i * 300}; easing: easeInOutSine`);
      this.modelContainer.appendChild(orb);
    }
  }

  updateAutoRotateState() {
    const model = document.getElementById('ar-interactive-model');
    if (!model) return;

    if (this.autoRotate) {
      model.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear');
    } else {
      model.removeAttribute('animation');
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    this.updateAutoRotateState();
    return this.autoRotate;
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    if (this.currentData) {
      // Reload model to apply wireframe style
      this.loadModel(this.currentData);
    }
    return this.wireframeMode;
  }

  resetCamera() {
    // In AR.js, camera reset translates to resetting the model rotation/scale back to normal
    if (this.modelContainer) {
      this.modelContainer.setAttribute('rotation', '0 0 0');
      this.modelContainer.setAttribute('scale', '1 1 1');
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

  start() {
    // Play the A-Frame scene
    if (this.sceneEl) {
      this.sceneEl.play();
    }
  }

  stop() {
    // Pause the A-Frame scene
    if (this.sceneEl) {
      this.sceneEl.pause();
    }
  }

  onResize() {
    // Managed automatically by A-Frame embedded mode
  }

  dispose() {
    if (this.modelContainer) {
      this.modelContainer.innerHTML = '';
    }
  }
}
