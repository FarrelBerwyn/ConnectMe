# ConnectMe v2 — AR Business Card Scanner

ConnectMe adalah aplikasi web-based Augmented Reality (AR) interaktif yang berjalan sepenuhnya di browser mobile. Aplikasi ini dirancang untuk mendeteksi kartu nama fisik melalui kamera, memindai data profil di awal (melalui QR Code), dan menampilkan model avatar 3D interaktif, data kontak melayang (hologram), serta tautan media sosial secara real-time yang menempel presisi di atas kartu nama tersebut.

Proyek ini dibangun menggunakan **MindAR.js** untuk pelacakan gambar (*image tracking*), **A-Frame** untuk rendering 3D, dan **jsQR** untuk deteksi QR Code sebagai gerbang masuk awal (*gate*).

---

## 🚀 Fitur Utama

- **100% Web-based:** Berjalan langsung di browser tanpa perlu menginstal aplikasi tambahan di handphone.
- **Image Tracking (MindAR):** Menggunakan desain kartu nama fisik Anda sebagai marker pelacakan gambar yang stabil, bukan marker generik (seperti Hiro marker).
- **QR Code Gate:** Langkah awal deteksi instan yang membaca informasi profil dan tautan dari QR Code sebelum mengaktifkan pelacakan AR.
- **Visual Efek Premium:** Tampilan landing page interaktif dengan latar belakang partikel, transisi antar halaman yang halus, serta panel data kartu nama dengan gaya *glassmorphism*.
- **Responsive:** Didesain dengan pendekatan *mobile-first* agar kompatibel dengan browser HP (Chrome Android, Safari iOS).

---

## 🛠️ Persyaratan Teknis
Untuk mengakses perangkat kamera, browser mewajibkan penggunaan protokol keamanan **HTTPS** (atau `localhost` untuk pengembangan lokal).

---

## 📁 Struktur Folder

```
/ConnectMe
├── index.html                 # Halaman Home (Landing Page)
├── scanner.html               # Halaman utama Scanner QR & Pelacakan AR
├── /assets
│   ├── /models                # Wadah file 3D Model .glb/.gltf
│   ├── /targets               # Berkas pelacak .mind dan gambar target kartu nama
│   │   ├── card-target.png    # Gambar referensi kartu nama (marker target)
│   │   └── targets.mind       # Berkas tracking hasil kompilasi MindAR
│   └── /icons                 # Aset ikon SVG untuk media sosial
├── /css
│   └── style.css              # Seluruh modul desain & responsivitas halaman
└── /js
    ├── qr-detect.js           # Pengendali deteksi real-time QR Code (jsQR)
    └── ar-scene.js            # Pengendali A-Frame scene & injeksi dinamis MindAR
```

---

## 💻 Pengembangan Lokal (Local Development)

Untuk menjalankan proyek ini di komputer lokal Anda dan mengujinya di handphone:

1. **Jalankan local server** di direktori proyek:
   ```bash
   npx serve .
   # Default berjalan di http://localhost:3000 atau http://localhost:5000
   ```
2. **Uji di HP Anda:**
   Karena kamera mewajibkan HTTPS, Anda bisa menggunakan layanan seperti **ngrok** untuk membuat terowongan HTTPS aman secara gratis:
   ```bash
   ngrok http 3000
   ```
   Buka tautan HTTPS yang dihasilkan ngrok di handphone Anda.

---

## 🎯 Cara Kustomisasi

### 1. Mengganti Gambar Target (Kartu Nama Anda)
Untuk menggunakan desain kartu nama Anda sendiri sebagai pelacak AR:
1. Siapkan file gambar kartu nama Anda (`.png` atau `.jpg`), disarankan memiliki tingkat kontras tinggi dan pola yang bervariasi agar mudah dilacak.
2. Buka alat kompilasi resmi MindAR: [https://hiukim.github.io/mind-ar-js-doc/tools/compile/](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
3. Unggah gambar kartu nama Anda ke sana, lalu klik **Start**.
4. Setelah selesai, klik **Download** untuk mengunduh berkas `.mind`.
5. Ubah nama berkas hasil unduhan tersebut menjadi `targets.mind`, lalu timpa berkas yang ada di folder `/assets/targets/targets.mind`.
6. Simpan gambar desain kartu nama Anda di `/assets/targets/card-target.png` sebagai referensi.

### 2. Mengganti Model Avatar 3D (.glb)
Jika Anda memiliki model 3D custom (misal dari Ready Player Me atau Sketchfab) dalam format `.glb`:
1. Simpan berkas `.glb` Anda di folder `/assets/models/avatar.glb`.
2. Buka berkas `js/ar-scene.js`.
3. Pada method `_buildARContent(parentEl)`, cari bagian **Avatar** dan gantilah kode pembuatan primitif dengan elemen `<a-gltf-model>` bawaan A-Frame:
   ```javascript
   // Ganti pembuatan primitif avatar dengan pemanggilan model GLB
   const model = document.createElement('a-gltf-model');
   model.setAttribute('src', './assets/models/avatar.glb');
   model.setAttribute('position', '0 0.2 0');
   model.setAttribute('scale', '0.5 0.5 0.5'); // Sesuaikan ukuran model Anda
   parentEl.appendChild(model);
   ```

### 3. Mengatur Tautan / Data Profil
Aplikasi akan membaca informasi profil (Nama, Jabatan, Sosmed) melalui QR Code yang berformat JSON.
Contoh isi QR Code JSON:
```json
{
  "name": "Farrel Berwyn",
  "title": "Software Developer",
  "company": "ConnectMe",
  "email": "farrel@connectme.dev",
  "phone": "+62 812 3456 7890",
  "website": "https://farrelberwyn.github.io/ConnectMe/",
  "linkedin": "https://linkedin.com/in/farrelberwyn",
  "instagram": "https://instagram.com/farrelberwyn",
  "github": "https://github.com/FarrelBerwyn",
  "color": "#7B6CF6"
}
```
Anda dapat membuat QR Code berformat JSON di atas secara online di generator QR Code pihak ketiga, lalu mencetaknya di kartu nama Anda. Jika QR Code yang dipindai berupa tautan web biasa (URL), aplikasi secara otomatis akan mendeteksinya sebagai fallback link.

---

## 🌐 Cara Deploy ke GitHub Pages

1. Commit seluruh perubahan ke branch utama (`main`):
   ```bash
   git add .
   git commit -m "Build: Rebuild total ConnectMe v2 dengan MindAR"
   git push origin main
   ```
2. Pastikan GitHub Pages diaktifkan pada repository Anda:
   - Masuk ke **Settings** repository GitHub Anda.
   - Pilih menu **Pages** di bilah sisi kiri.
   - Pada bagian **Build and deployment**, atur Source ke **Deploy from a branch**.
   - Pilih branch **main** dan folder **/(root)**, lalu klik **Save**.
3. Tunggu 1-2 menit hingga proses CI/CD GitHub Actions selesai. Website Anda akan tersedia di `https://<username-github>.github.io/ConnectMe/`.
