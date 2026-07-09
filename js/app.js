/* ============================================
   ConnectMe — App Controller
   Manages Home/AR transition & Background QR Scanning
   ============================================ */

import { ParticleBackground } from './particles.js';
import { Viewer3D } from './viewer.js';

class App {
  constructor() {
    this.views = {
      landing: document.getElementById('landing-view'),
      viewer: document.getElementById('viewer-view'),
    };

    this.currentView = 'landing';
    this.particleBg = null;
    this.viewer = null;
    this.toastContainer = document.getElementById('toast-container');

    // Scanning properties
    this.scanningQR = false;
    this.scanInterval = null;
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.detectedQRData = null;

    this.init();
  }

  init() {
    // Landing background animation
    this.particleBg = new ParticleBackground('particle-canvas');

    // Unified AR 3D Viewer
    this.viewer = new Viewer3D('ar-scene');

    this.bindEvents();
    console.log('✨ ConnectMe Unified AR App Initialized');
  }

  bindEvents() {
    // Home -> AR Camera
    document.getElementById('btn-start-scan')?.addEventListener('click', () => {
      this.navigateTo('viewer');
    });

    // AR Camera -> Home
    document.getElementById('btn-viewer-back')?.addEventListener('click', () => {
      this.navigateTo('landing');
    });

    // AR controls
    document.getElementById('btn-auto-rotate')?.addEventListener('click', (e) => {
      const isActive = this.viewer.toggleAutoRotate();
      e.currentTarget.classList.toggle('active', isActive);
    });

    document.getElementById('btn-reset-camera')?.addEventListener('click', () => {
      this.viewer.resetCamera();
    });

    document.getElementById('btn-toggle-wireframe')?.addEventListener('click', (e) => {
      const isActive = this.viewer.toggleWireframe();
      e.currentTarget.classList.toggle('active', isActive);
    });
  }

  navigateTo(viewName) {
    if (viewName === this.currentView) return;

    const prevView = this.currentView;

    // Fade out current view
    const currentViewEl = this.views[prevView];
    if (currentViewEl) {
      currentViewEl.classList.add('fade-out');
      setTimeout(() => {
        currentViewEl.classList.remove('active', 'fade-out');
      }, 300);
    }

    // Fade in new view
    setTimeout(() => {
      const newViewEl = this.views[viewName];
      if (newViewEl) {
        newViewEl.classList.add('active', 'fade-in');
        setTimeout(() => {
          newViewEl.classList.remove('fade-in');
        }, 500);
      }

      this.onViewLeave(prevView);
      this.onViewEnter(viewName);
      this.currentView = viewName;
    }, 300);
  }

  onViewEnter(viewName) {
    switch (viewName) {
      case 'landing':
        if (this.particleBg) this.particleBg.start();
        break;

      case 'viewer':
        document.body.classList.add('ar-active');
        if (this.viewer) {
          this.viewer.start();
        }
        // Start running QR code search in the background of the AR webcam stream
        this.startBackgroundQRScanning();
        break;
    }
  }

  onViewLeave(viewName) {
    switch (viewName) {
      case 'landing':
        if (this.particleBg) this.particleBg.stop();
        break;

      case 'viewer':
        document.body.classList.remove('ar-active');
        if (this.viewer) {
          this.viewer.stop();
          this.viewer.dispose();
        }
        this.stopBackgroundQRScanning();
        break;
    }
  }

  startBackgroundQRScanning() {
    this.scanningQR = true;
    this.detectedQRData = null;

    // Reset UI displays
    document.getElementById('info-panel').style.display = 'none';
    document.getElementById('viewer-controls').style.display = 'none';
    document.getElementById('ar-hint').textContent = '📸 Arahkan kamera ke QR Code Kartu Nama untuk mendeteksi AR';
    document.getElementById('ar-hint').style.display = 'block';

    const scanFrame = () => {
      if (!this.scanningQR) return;

      // AR.js mounts the webcam video directly in the body
      const video = document.querySelector('video');

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        // Resize offscreen canvas to match video frames
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;

        // Draw current frame to temp canvas
        this.tempCtx.drawImage(video, 0, 0, width, height);

        // Decode frame using jsQR
        const imageData = this.tempCtx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          const parsed = this.parseQRData(code.data);
          if (parsed) {
            // Success! QR detected
            this.scanningQR = false; // Stop scanning loop
            this.detectedQRData = parsed;

            // Trigger vibrate feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }

            this.showToast('success', `✅ QR Terdeteksi: ${parsed.title}`);

            // Load A-Frame model & info panel
            if (this.viewer) {
              this.viewer.loadModel(parsed);
              this.viewer.updateInfoPanel(parsed);
            }

            // Reveal Overlay HUD UI
            document.getElementById('info-panel').style.display = 'block';
            document.getElementById('viewer-controls').style.display = 'flex';
            document.getElementById('ar-hint').textContent = '🎯 Objek AR Berhasil Dimuat! Dekatkan/jauhkan kamera pada kartu nama.';
            
            return; // Exit loop
          }
        }
      }

      // Query next frame in 300ms
      setTimeout(scanFrame, 300);
    };

    // Kickstart scan loop with a delay to let webcam load
    setTimeout(scanFrame, 1500);
  }

  stopBackgroundQRScanning() {
    this.scanningQR = false;
    document.getElementById('info-panel').style.display = 'none';
    document.getElementById('viewer-controls').style.display = 'none';
  }

  parseQRData(text) {
    try {
      const data = JSON.parse(text);
      if (!data.type || !data.title) return null;
      return {
        type: data.type || 'info',
        title: data.title || 'Tanpa Judul',
        description: data.description || '',
        model: data.model || 'cube',
        color: data.color || '#6C63FF',
        details: data.details || {},
      };
    } catch {
      // Fallback for plaintext URL
      if (text.startsWith('http://') || text.startsWith('https://')) {
        return {
          type: 'link',
          title: 'Link Terdeteksi',
          description: text,
          model: 'sphere',
          color: '#00D4AA',
          details: { URL: text },
        };
      }
      return null;
    }
  }

  showToast(type, message, duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

// Start App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.connectMeApp = new App();
});
