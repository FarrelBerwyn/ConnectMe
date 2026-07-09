# ConnectMe 🔗

**Scan QR Code → Lihat Informasi 3D Interaktif**

ConnectMe adalah web app yang memungkinkan kamu men-scan QR Code menggunakan kamera perangkat, lalu menampilkan informasi dalam bentuk visualisasi 3D interaktif yang bisa diputar, zoom, dan dijelajahi.

## ✨ Fitur

- 📷 **QR Scanner** — Scan via kamera atau upload gambar QR
- 🧊 **3D Viewer** — Visualisasi data dalam objek 3D interaktif (rotate, zoom, pan)
- 🎨 **Premium Design** — Dark theme, glassmorphism, animasi partikel
- 📱 **Responsive** — Optimal di mobile dan desktop
- 🚀 **Zero Install** — Langsung berjalan di browser, tanpa download apapun

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Struktur | HTML5 |
| Styling | Vanilla CSS |
| Logic | Vanilla JavaScript (ES Modules) |
| QR Scanner | [html5-qrcode](https://github.com/mebjas/html5-qrcode) v2.3.8 |
| 3D Engine | [Three.js](https://threejs.org/) r180 |
| Hosting | GitHub Pages |

## 📂 Struktur Project

```
ConnectMe/
├── index.html          # Halaman utama (Landing + Scanner + Viewer)
├── demo.html           # Demo QR codes untuk testing
├── README.md
├── css/
│   └── styles.css      # Design system & semua styling
└── js/
    ├── app.js           # App controller & navigation
    ├── scanner.js       # QR scanner module
    ├── viewer.js        # Three.js 3D viewer
    └── particles.js     # Background particle system
```

## 🚀 Deploy ke GitHub Pages

1. **Buat repository** di GitHub (misal: `ConnectMe`)
2. **Push semua file** ke repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ConnectMe"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ConnectMe.git
   git push -u origin main
   ```
3. Buka **Settings** → **Pages** → pilih branch `main` → Save
4. Website akan live di: `https://USERNAME.github.io/ConnectMe/`

> **Note:** GitHub Pages otomatis menyediakan HTTPS, yang diperlukan untuk akses kamera.

## 📋 Format QR Code

QR Code harus meng-encode JSON string dengan format:

```json
{
  "type": "product|person|location|info",
  "title": "Nama Item",
  "description": "Deskripsi detail",
  "model": "cube|sphere|torus|diamond|rocket|knot|dodecahedron",
  "color": "#6C63FF",
  "details": {
    "Key1": "Value1",
    "Key2": "Value2"
  }
}
```

### Model 3D yang Tersedia

| Model | Tampilan |
|---|---|
| `cube` | Kubus (default) |
| `sphere` | Bola |
| `torus` | Donat |
| `diamond` | Berlian |
| `rocket` | Roket |
| `knot` | Torus Knot |
| `dodecahedron` | Dodecahedron |
| `icosahedron` | Icosahedron |
| `octahedron` | Octahedron |
| `cylinder` | Silinder |
| `cone` | Kerucut |

## 📝 Lisensi

MIT License — Bebas digunakan dan dimodifikasi.
