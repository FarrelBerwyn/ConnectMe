/* ============================================
   ConnectMe — QR Detection Module
   Uses jsQR to detect QR codes from camera feed
   ============================================ */

export class QRDetector {
  constructor({ videoEl, onDetected, onError }) {
    this.videoEl = videoEl;
    this.onDetected = onDetected;
    this.onError = onError;

    this.stream = null;
    this.scanning = false;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.scanTimer = null;
  }

  async start() {
    try {
      // Request rear-facing camera for mobile
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.videoEl.srcObject = this.stream;
      this.videoEl.setAttribute('playsinline', '');
      this.videoEl.setAttribute('autoplay', '');
      await this.videoEl.play();

      this.scanning = true;
      this._scanLoop();

      console.log('📸 QR Detector started');
    } catch (err) {
      console.error('Camera error:', err);
      if (this.onError) {
        this.onError(err);
      }
    }
  }

  _scanLoop() {
    if (!this.scanning) return;

    if (this.videoEl.readyState === this.videoEl.HAVE_ENOUGH_DATA) {
      const vw = this.videoEl.videoWidth;
      const vh = this.videoEl.videoHeight;

      if (vw && vh) {
        this.canvas.width = vw;
        this.canvas.height = vh;
        this.ctx.drawImage(this.videoEl, 0, 0, vw, vh);

        const imageData = this.ctx.getImageData(0, 0, vw, vh);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          const data = this._parseQRData(code.data);
          if (data) {
            console.log('✅ QR Detected:', data);
            this.scanning = false;

            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }

            if (this.onDetected) {
              this.onDetected(data);
            }
            return; // Stop scanning
          }
        }
      }
    }

    this.scanTimer = setTimeout(() => this._scanLoop(), 200);
  }

  _parseQRData(text) {
    try {
      const data = JSON.parse(text);
      // Expect at minimum a "name" field
      if (data.name || data.title) {
        return {
          name: data.name || data.title || 'Unknown',
          title: data.jobTitle || data.title || '',
          company: data.company || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          instagram: data.instagram || '',
          github: data.github || '',
          avatar: data.avatar || '',
          color: data.color || '#7B6CF6',
        };
      }
      return null;
    } catch {
      // Fallback: plain URL or vCard
      if (text.startsWith('http://') || text.startsWith('https://')) {
        return {
          name: 'Link Detected',
          title: '',
          company: '',
          email: '',
          phone: '',
          website: text,
          linkedin: '',
          instagram: '',
          github: '',
          avatar: '',
          color: '#00E8B0',
        };
      }
      return null;
    }
  }

  stop() {
    this.scanning = false;
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    console.log('🛑 QR Detector stopped');
  }
}
