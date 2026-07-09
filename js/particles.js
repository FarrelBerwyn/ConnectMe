/* ============================================
   ConnectMe — Particles Background
   Lightweight Three.js particle system
   ============================================ */

import * as THREE from 'three';

export class ParticleBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
    });

    this.particleCount = 200;
    this.mouseX = 0;
    this.mouseY = 0;
    this.animationId = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.z = 30;

    this.createParticles();
    this.createConnections();
    this.bindEvents();
    this.start();
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    this.velocities = [];

    const colorPalette = [
      new THREE.Color(0x6C63FF), // Purple
      new THREE.Color(0x00D4AA), // Cyan
      new THREE.Color(0xFF6B9D), // Pink
      new THREE.Color(0x4A90D9), // Blue
    ];

    for (let i = 0; i < this.particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 2 + 0.5;

      // Velocity
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createConnections() {
    const material = new THREE.LineBasicMaterial({
      color: 0x6C63FF,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });

    this.lineGeometry = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(this.particleCount * this.particleCount * 6);
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.lineGeometry.setDrawRange(0, 0);

    this.lines = new THREE.LineSegments(this.lineGeometry, material);
    this.scene.add(this.lines);
  }

  updateConnections() {
    const positions = this.particles.geometry.attributes.position.array;
    let vertexIndex = 0;
    let lineCount = 0;
    const maxDistance = 8;
    const maxLines = 150;

    for (let i = 0; i < this.particleCount && lineCount < maxLines; i++) {
      for (let j = i + 1; j < this.particleCount && lineCount < maxLines; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          this.linePositions[vertexIndex++] = positions[i * 3];
          this.linePositions[vertexIndex++] = positions[i * 3 + 1];
          this.linePositions[vertexIndex++] = positions[i * 3 + 2];
          this.linePositions[vertexIndex++] = positions[j * 3];
          this.linePositions[vertexIndex++] = positions[j * 3 + 1];
          this.linePositions[vertexIndex++] = positions[j * 3 + 2];
          lineCount++;
        }
      }
    }

    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.setDrawRange(0, lineCount * 2);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  animate() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] += this.velocities[i].x;
      positions[i * 3 + 1] += this.velocities[i].y;
      positions[i * 3 + 2] += this.velocities[i].z;

      // Boundaries — wrap around
      if (Math.abs(positions[i * 3]) > 30) this.velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 30) this.velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 15) this.velocities[i].z *= -1;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Subtle camera follow mouse
    this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.01;
    this.camera.position.y += (-this.mouseY * 2 - this.camera.position.y) * 0.01;
    this.camera.lookAt(this.scene.position);

    // Update connections every 3 frames for performance
    if (Math.random() < 0.33) {
      this.updateConnections();
    }

    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose() {
    this.stop();
    this.particles.geometry.dispose();
    this.particles.material.dispose();
    this.lineGeometry.dispose();
    this.lines.material.dispose();
    this.renderer.dispose();
  }
}
