/* ============================================
   ConnectMe — AR Scene Module
   MindAR.js Image Tracking + A-Frame 3D Scene
   ============================================ */

export class ARScene {
  constructor({ containerEl, onTrackingFound, onTrackingLost }) {
    this.containerEl = containerEl;
    this.onTrackingFound = onTrackingFound;
    this.onTrackingLost = onTrackingLost;

    this.sceneEl = null;
    this.targetEl = null;
    this.profileData = null;
    this.isTracking = false;
  }

  /**
   * Build and inject the MindAR + A-Frame scene into the container
   */
  start(profileData) {
    this.profileData = profileData || this._defaultProfile();
    this.containerEl.innerHTML = '';

    // Build scene element
    this.sceneEl = document.createElement('a-scene');
    this.sceneEl.setAttribute('mindar-image', 'imageTargetSrc: ./assets/targets/targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;');
    this.sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
    this.sceneEl.setAttribute('device-orientation-permission-ui', 'enabled: false');
    this.sceneEl.setAttribute('embedded', '');
    this.sceneEl.style.width = '100%';
    this.sceneEl.style.height = '100%';
    this.sceneEl.style.position = 'absolute';
    this.sceneEl.style.top = '0';
    this.sceneEl.style.left = '0';

    // Camera with cursor for click interaction
    const cameraEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', '');
    cameraEl.setAttribute('position', '0 0 0');
    cameraEl.setAttribute('look-controls', 'enabled: false');

    // Image target entity (targetIndex: 0 = first compiled image)
    this.targetEl = document.createElement('a-entity');
    this.targetEl.setAttribute('mindar-image-target', 'targetIndex: 0');
    this.targetEl.setAttribute('id', 'card-target');

    // Build 3D content anchored to the target
    this._buildARContent(this.targetEl);

    // Assemble scene
    this.sceneEl.appendChild(cameraEl);
    this.sceneEl.appendChild(this.targetEl);
    this.containerEl.appendChild(this.sceneEl);

    // Listen for tracking events
    this.targetEl.addEventListener('targetFound', () => {
      this.isTracking = true;
      console.log('🎯 Target FOUND');
      if (this.onTrackingFound) this.onTrackingFound();
    });

    this.targetEl.addEventListener('targetLost', () => {
      this.isTracking = false;
      console.log('👻 Target LOST');
      if (this.onTrackingLost) this.onTrackingLost();
    });

    // Handle MindAR errors gracefully
    this.sceneEl.addEventListener('arError', (e) => {
      console.warn('⚠️ MindAR error:', e.detail);
    });

    console.log('🚀 AR Scene injected with MindAR image tracking');
  }

  /**
   * Build 3D content: avatar, hologram info panel, social icons
   */
  _buildARContent(parentEl) {
    const data = this.profileData;
    const color = data.color || '#7B6CF6';

    // === 1. Avatar (placeholder — composed from primitives) ===
    const avatarGroup = document.createElement('a-entity');
    avatarGroup.setAttribute('position', '0 0.6 0.05');
    avatarGroup.setAttribute('scale', '0.3 0.3 0.3');

    // Head
    const head = document.createElement('a-sphere');
    head.setAttribute('radius', '0.35');
    head.setAttribute('color', '#FFD5A0');
    head.setAttribute('position', '0 1.6 0');
    head.setAttribute('material', 'roughness: 0.6; metalness: 0.1');
    avatarGroup.appendChild(head);

    // Body
    const body = document.createElement('a-cylinder');
    body.setAttribute('radius', '0.28');
    body.setAttribute('height', '0.8');
    body.setAttribute('color', color);
    body.setAttribute('position', '0 0.95 0');
    body.setAttribute('material', 'roughness: 0.4; metalness: 0.2');
    avatarGroup.appendChild(body);

    // Arms
    const leftArm = document.createElement('a-cylinder');
    leftArm.setAttribute('radius', '0.08');
    leftArm.setAttribute('height', '0.55');
    leftArm.setAttribute('color', color);
    leftArm.setAttribute('position', '-0.38 1.0 0');
    leftArm.setAttribute('rotation', '0 0 15');
    avatarGroup.appendChild(leftArm);

    const rightArm = document.createElement('a-cylinder');
    rightArm.setAttribute('radius', '0.08');
    rightArm.setAttribute('height', '0.55');
    rightArm.setAttribute('color', color);
    rightArm.setAttribute('position', '0.38 1.0 0');
    rightArm.setAttribute('rotation', '0 0 -15');
    avatarGroup.appendChild(rightArm);

    // Eyes
    const leftEye = document.createElement('a-sphere');
    leftEye.setAttribute('radius', '0.06');
    leftEye.setAttribute('color', '#333');
    leftEye.setAttribute('position', '-0.12 1.65 0.28');
    avatarGroup.appendChild(leftEye);

    const rightEye = document.createElement('a-sphere');
    rightEye.setAttribute('radius', '0.06');
    rightEye.setAttribute('color', '#333');
    rightEye.setAttribute('position', '0.12 1.65 0.28');
    avatarGroup.appendChild(rightEye);

    // Smile
    const smile = document.createElement('a-torus');
    smile.setAttribute('radius', '0.08');
    smile.setAttribute('radius-tubular', '0.015');
    smile.setAttribute('arc', '180');
    smile.setAttribute('color', '#C0392B');
    smile.setAttribute('position', '0 1.50 0.30');
    smile.setAttribute('rotation', '180 0 0');
    avatarGroup.appendChild(smile);

    parentEl.appendChild(avatarGroup);

    // === 2. Hologram Info Panel (floating plane behind avatar) ===
    const infoPanel = document.createElement('a-entity');
    infoPanel.setAttribute('position', '0 0.35 -0.05');

    // Background plane
    const bg = document.createElement('a-plane');
    bg.setAttribute('width', '1.0');
    bg.setAttribute('height', '0.55');
    bg.setAttribute('color', '#0a0a2e');
    bg.setAttribute('opacity', '0.85');
    bg.setAttribute('material', 'side: double; transparent: true');
    bg.setAttribute('position', '0 0 -0.01');
    infoPanel.appendChild(bg);

    // Border glow
    const borderGlow = document.createElement('a-plane');
    borderGlow.setAttribute('width', '1.02');
    borderGlow.setAttribute('height', '0.57');
    borderGlow.setAttribute('color', color);
    borderGlow.setAttribute('opacity', '0.25');
    borderGlow.setAttribute('material', 'side: double; transparent: true');
    borderGlow.setAttribute('position', '0 0 -0.015');
    infoPanel.appendChild(borderGlow);

    // Name text
    const nameText = document.createElement('a-text');
    nameText.setAttribute('value', data.name);
    nameText.setAttribute('align', 'center');
    nameText.setAttribute('color', '#EEEEFF');
    nameText.setAttribute('width', '1.6');
    nameText.setAttribute('position', '0 0.12 0');
    nameText.setAttribute('font', 'roboto');
    infoPanel.appendChild(nameText);

    // Title text
    if (data.title) {
      const titleText = document.createElement('a-text');
      titleText.setAttribute('value', data.title);
      titleText.setAttribute('align', 'center');
      titleText.setAttribute('color', '#9A9ABF');
      titleText.setAttribute('width', '1.2');
      titleText.setAttribute('position', '0 0.01 0');
      titleText.setAttribute('font', 'roboto');
      infoPanel.appendChild(titleText);
    }

    // Company text
    if (data.company) {
      const companyText = document.createElement('a-text');
      companyText.setAttribute('value', data.company);
      companyText.setAttribute('align', 'center');
      companyText.setAttribute('color', '#00E8B0');
      companyText.setAttribute('width', '1.0');
      companyText.setAttribute('position', '0 -0.1 0');
      companyText.setAttribute('font', 'roboto');
      infoPanel.appendChild(companyText);
    }

    parentEl.appendChild(infoPanel);

    // === 3. Floating Social Icons (orbit around avatar) ===
    const socialItems = [];
    if (data.linkedin) socialItems.push({ icon: 'in', color: '#0A66C2', url: data.linkedin });
    if (data.instagram) socialItems.push({ icon: 'ig', color: '#E4405F', url: data.instagram });
    if (data.github) socialItems.push({ icon: 'gh', color: '#FFFFFF', url: data.github });
    if (data.email) socialItems.push({ icon: '@', color: '#FFB84D', url: `mailto:${data.email}` });
    if (data.website) socialItems.push({ icon: 'www', color: '#00E8B0', url: data.website });

    const iconCount = socialItems.length;
    if (iconCount > 0) {
      const radius = 0.55;
      socialItems.forEach((item, i) => {
        const angle = (i / iconCount) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * 0.15;
        const y = 0.75 + Math.sin(angle) * 0.15;

        const iconEntity = document.createElement('a-entity');
        iconEntity.setAttribute('position', `${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}`);

        // Icon sphere
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('radius', '0.07');
        sphere.setAttribute('color', item.color);
        sphere.setAttribute('material', 'roughness: 0.3; metalness: 0.5');
        sphere.setAttribute('class', 'clickable');
        sphere.setAttribute('animation', `property: position; to: ${x.toFixed(3)} ${(y + 0.03).toFixed(3)} ${z.toFixed(3)}; dir: alternate; loop: true; dur: ${1200 + i * 200}; easing: easeInOutSine`);
        iconEntity.appendChild(sphere);

        // Label
        const label = document.createElement('a-text');
        label.setAttribute('value', item.icon);
        label.setAttribute('align', 'center');
        label.setAttribute('color', item.color === '#FFFFFF' ? '#000' : '#FFF');
        label.setAttribute('width', '0.5');
        label.setAttribute('position', '0 0 0.08');
        label.setAttribute('font', 'roboto');
        iconEntity.appendChild(label);

        parentEl.appendChild(iconEntity);
      });
    }

    // === 4. Decorative orbit ring ===
    const ring = document.createElement('a-torus');
    ring.setAttribute('radius', '0.6');
    ring.setAttribute('radius-tubular', '0.005');
    ring.setAttribute('color', color);
    ring.setAttribute('opacity', '0.3');
    ring.setAttribute('material', 'transparent: true');
    ring.setAttribute('position', '0 0.7 0');
    ring.setAttribute('rotation', '75 0 0');
    ring.setAttribute('animation', 'property: rotation; to: 75 360 0; loop: true; dur: 8000; easing: linear');
    parentEl.appendChild(ring);

    // === 5. Small floating particles ===
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('a-sphere');
      particle.setAttribute('radius', '0.015');
      particle.setAttribute('color', color);
      particle.setAttribute('opacity', '0.5');
      particle.setAttribute('material', 'transparent: true');
      const px = (Math.random() - 0.5) * 1.0;
      const py = 0.3 + Math.random() * 0.8;
      const pz = (Math.random() - 0.5) * 0.3;
      particle.setAttribute('position', `${px.toFixed(3)} ${py.toFixed(3)} ${pz.toFixed(3)}`);
      particle.setAttribute('animation', `property: position; to: ${px.toFixed(3)} ${(py + 0.08).toFixed(3)} ${pz.toFixed(3)}; dir: alternate; loop: true; dur: ${1500 + i * 300}; easing: easeInOutSine`);
      parentEl.appendChild(particle);
    }
  }

  /**
   * Default demo profile data
   */
  _defaultProfile() {
    return {
      name: 'Farrel Berwyn',
      title: 'Software Developer',
      company: 'ConnectMe',
      email: 'farrel@connectme.dev',
      phone: '+62 812 3456 7890',
      website: 'https://farrelberwyn.github.io/ConnectMe/',
      linkedin: 'https://linkedin.com/in/farrelberwyn',
      instagram: 'https://instagram.com/farrelberwyn',
      github: 'https://github.com/FarrelBerwyn',
      color: '#7B6CF6',
    };
  }

  /**
   * Stop and cleanup AR scene
   */
  stop() {
    if (this.sceneEl) {
      // Stop MindAR
      const mindARSystem = this.sceneEl.systems?.['mindar-image-system'];
      if (mindARSystem) {
        try { mindARSystem.stop(); } catch (e) { /* ignore */ }
      }

      // Stop any camera streams AR might have started
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (v.srcObject) {
          v.srcObject.getTracks().forEach(t => t.stop());
        }
      });

      // Remove scene from DOM
      if (this.sceneEl.parentNode) {
        this.sceneEl.parentNode.removeChild(this.sceneEl);
      }
      this.sceneEl = null;
      this.targetEl = null;
      this.isTracking = false;
      console.log('🛑 AR Scene destroyed');
    }
  }
}
