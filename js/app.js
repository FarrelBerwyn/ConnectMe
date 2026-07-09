/* ============================================
   ConnectMe — App Controller
   Entry point, navigation & view management
   ============================================ */

import { ParticleBackground } from './particles.js';
import { QRScanner } from './scanner.js';
import { Viewer3D } from './viewer.js';

class App {
  constructor() {
    // Views
    this.views = {
      landing: document.getElementById('landing-view'),
      scanner: document.getElementById('scanner-view'),
      viewer: document.getElementById('viewer-view'),
    };

    this.currentView = 'landing';

    // Modules
    this.particleBg = null;
    this.scanner = null;
    this.viewer = null;

    // Toast
    this.toastContainer = document.getElementById('toast-container');

    this.init();
  }

  init() {
    // Initialize particle background
    this.particleBg = new ParticleBackground('particle-canvas');

    // Initialize 3D viewer (lazy — scene ready, no model yet)
    this.viewer = new Viewer3D('three-canvas');

    // Bind navigation
    this.bindEvents();

    console.log('✨ ConnectMe initialized');
  }

  bindEvents() {
    // Landing → Scanner
    document.getElementById('btn-start-scan')?.addEventListener('click', () => {
      this.navigateTo('scanner');
    });

    // Scanner → Landing
    document.getElementById('btn-scanner-back')?.addEventListener('click', () => {
      this.navigateTo('landing');
    });

    // Viewer → Scanner
    document.getElementById('btn-viewer-back')?.addEventListener('click', () => {
      this.navigateTo('scanner');
    });

    // Scanner → Demo page
    document.getElementById('btn-scan-demo')?.addEventListener('click', () => {
      window.open('demo.html', '_blank');
    });

    // Viewer controls
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

    document.getElementById('btn-scan-again')?.addEventListener('click', () => {
      this.navigateTo('scanner');
    });
  }

  navigateTo(viewName) {
    if (viewName === this.currentView) return;

    const prevView = this.currentView;

    // Hide current view
    const currentViewEl = this.views[prevView];
    if (currentViewEl) {
      currentViewEl.classList.add('fade-out');
      setTimeout(() => {
        currentViewEl.classList.remove('active', 'fade-out');
      }, 300);
    }

    // Show new view
    setTimeout(() => {
      const newViewEl = this.views[viewName];
      if (newViewEl) {
        newViewEl.classList.add('active', 'fade-in');
        setTimeout(() => {
          newViewEl.classList.remove('fade-in');
        }, 500);
      }

      // Handle view lifecycle
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

      case 'scanner':
        this.startScanner();
        break;

      case 'viewer':
        if (this.viewer) {
          this.viewer.start();
          this.viewer.onResize();
        }
        break;
    }
  }

  onViewLeave(viewName) {
    switch (viewName) {
      case 'landing':
        if (this.particleBg) this.particleBg.stop();
        break;

      case 'scanner':
        this.stopScanner();
        break;

      case 'viewer':
        if (this.viewer) this.viewer.stop();
        break;
    }
  }

  startScanner() {
    // Create fresh scanner each time
    if (this.scanner) {
      this.scanner.dispose();
    }

    this.scanner = new QRScanner(
      'qr-reader',
      // On success
      (data) => {
        this.showToast('success', `✅ QR Terdeteksi: ${data.title}`);

        // Load 3D model from QR data
        if (this.viewer) {
          this.viewer.loadModel(data);
          this.viewer.updateInfoPanel(data);
        }

        // Navigate to viewer
        setTimeout(() => {
          this.navigateTo('viewer');
        }, 800);
      },
      // On error
      (message) => {
        this.showToast('warning', message);
      }
    );

    this.scanner.init();
  }

  stopScanner() {
    if (this.scanner) {
      this.scanner.stop();
    }
  }

  /**
   * Show toast notification
   */
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
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    // Auto remove
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.connectMeApp = new App();
});
