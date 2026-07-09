/* ============================================
   ConnectMe — QR Scanner Module
   Handles camera QR scanning & data validation
   ============================================ */

export class QRScanner {
  constructor(readerId, onScanSuccess, onScanError) {
    this.readerId = readerId;
    this.onScanSuccess = onScanSuccess;
    this.onScanError = onScanError;
    this.scanner = null;
    this.isScanning = false;
    this.scanLine = document.getElementById('scan-line');
  }

  init() {
    this.scanner = new Html5QrcodeScanner(
      this.readerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 1,
        rememberLastUsedCamera: true,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE,
        ],
      },
      /* verbose */ false
    );

    this.scanner.render(
      (decodedText, decodedResult) => this.handleScanResult(decodedText, decodedResult),
      (errorMessage) => {
        // Scan errors are normal (no QR detected in frame), ignore them
      }
    );

    this.isScanning = true;
    if (this.scanLine) this.scanLine.classList.add('active');
  }

  handleScanResult(decodedText, decodedResult) {
    // Parse the QR data
    const parsed = this.parseQRData(decodedText);

    if (parsed) {
      // Stop scanning
      this.stop();

      // Play success feedback
      this.vibrateDevice();

      // Callback with parsed data
      if (this.onScanSuccess) {
        this.onScanSuccess(parsed);
      }
    } else {
      // Not a valid ConnectMe QR
      if (this.onScanError) {
        this.onScanError('QR Code tidak mengandung data ConnectMe yang valid.');
      }
    }
  }

  parseQRData(text) {
    try {
      // Try JSON parse first
      const data = JSON.parse(text);

      // Validate required fields
      if (!data.type || !data.title) {
        return null;
      }

      // Normalize data
      return {
        type: data.type || 'info',
        title: data.title || 'Tanpa Judul',
        description: data.description || '',
        model: data.model || 'cube',
        color: data.color || '#6C63FF',
        details: data.details || {},
      };
    } catch {
      // If not JSON, try to create info from plain text/URL
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

      // Plain text QR
      if (text.length > 0 && text.length < 500) {
        return {
          type: 'info',
          title: 'Teks QR',
          description: text,
          model: 'cube',
          color: '#FF6B9D',
          details: { 'Konten': text.substring(0, 100) },
        };
      }

      return null;
    }
  }

  vibrateDevice() {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }

  stop() {
    if (this.scanner && this.isScanning) {
      try {
        this.scanner.clear();
      } catch (e) {
        // Scanner might already be cleared
        console.warn('Scanner clear warning:', e);
      }
      this.isScanning = false;
      if (this.scanLine) this.scanLine.classList.remove('active');
    }
  }

  restart() {
    this.stop();
    // Small delay to ensure cleanup
    setTimeout(() => {
      this.init();
    }, 300);
  }

  dispose() {
    this.stop();
    this.scanner = null;
  }
}
