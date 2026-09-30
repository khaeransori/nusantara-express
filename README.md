# Nusantara Express

Game edukasi piksel untuk anak. Oyen, kucing oren pemilik jasa antar Nusantara Express, terbang dengan pesawat amfibi Si Capung ke seluruh Indonesia. Setiap pesanan punya petunjuk: anak harus menebak dari kota mana makanan khas itu berasal, terbang ke sana untuk mengambilnya, lalu mengantarnya ke pelanggan. Dimainkan dengan sentuhan di HP, bisa jalan tanpa internet, dan semuanya ada dalam satu file HTML.

**Main sekarang:** https://khaeransori.github.io/nusantara-express/

## Main di HP

1. Buka https://khaeransori.github.io/nusantara-express/ di Chrome (Android) atau Safari (iPhone).
2. Android: menu titik tiga › **Instal aplikasi** / **Tambahkan ke Layar utama**.
   iPhone: tombol Bagikan › **Tambah ke Layar Utama**.
3. Setelah itu game bisa dimainkan tanpa internet, dan progresnya (koin, bintang, Buku Oyen, markas) tersimpan di HP.

Alternatif tanpa hosting: unduh [nusantara-express.html](https://khaeransori.github.io/nusantara-express/nusantara-express.html) lalu buka di Chrome.

Game dibuat untuk layar miring. Kalau HP dipegang tegak, game tampil menyamping, jadi tinggal putar HP.

## Isi game

- **Satu putaran:**
  1. Pelanggan memesan makanan khas dan memberi petunjuk, misalnya "Cari di Sumatera, di daerah yang atap rumahnya mirip tanduk kerbau."
  2. Ketuk kota asal makanan itu di peta. Salah tebak tidak apa-apa: Oyen memberi petunjuk tambahan, pulau yang benar bergoyang, dan setelah dua kali salah kotanya diberi lingkaran.
  3. Terbang dengan Si Capung: geser jari ke atas dan ke bawah, ambil koin dan ikan, hindari awan hujan. Menabrak awan hanya mengurangi bintang, tidak pernah kalah.
  4. Ambil pesanan, lalu terbang lagi ke kota pelanggan.
- **Bab 1: 8 pesanan**, satu untuk setiap makanan: rendang (Padang), pempek (Palembang), kerak telor (Jakarta), gudeg (Yogyakarta), ayam betutu (Bali), soto Banjar (Banjarmasin), coto Makassar (Makassar), papeda (Jayapura). Setelah bab 1 selesai, pesanan acak terus berdatangan.
- **8 tokoh daerah** dengan pakaian adatnya: Uni Rani, Ayuk Ina, Mpok Siti, Mas Bayu, Bli Made, Acil Aisyah, Daeng Ical, Mama Yosina. Semua bicara bahasa Indonesia standar. Sapaan daerahnya tetap dipakai di versi Inggris.
- **Buku Oyen:** kartu "Tahukah Kamu?" untuk setiap makanan dan rumah adat yang sudah ditemukan.
- **Markas Oyen:** rumah adat (Rumah Gadang, Joglo, Rumah Betang, Tongkonan, Honai) terbuka saat pertama kali mengantar makanan dari pulau asalnya, lalu dipasang di pulau markas.
- **Peta** dari data Natural Earth. Bisa digeser dan di-zoom (cubit atau scroll mouse).
- **Bahasa Indonesia / English**, bisa diganti di layar judul atau menu Jeda. Bahasa Indonesia jadi bawaan.
- Semua gambar digambar dengan kode di atas satu palet 41 warna. Efek suara dibuat langsung dengan WebAudio, tanpa file gambar atau audio.

Kontrol: ketuk kota di peta atau labelnya, geser jari naik-turun saat terbang. Di laptop: klik, panah atas/bawah atau W/S saat terbang, Spasi/Enter untuk lanjut dialog, Esc untuk jeda.

## Pengembangan

```bash
npm ci
npm run build          # hasil di dist/
npm run serve          # buka http://localhost:8080 (versi PWA)
npm run build:review   # lembar aset: dist/nusantara-express-aset.html
```

Hasil build:

| File | Kegunaan |
| --- | --- |
| `dist/nusantara-express.html` | Satu file offline, lengkap dengan font dan semua kode |
| `dist/pwa/` | Versi aplikasi (manifest, service worker, ikon) untuk di-hosting |
| `dist/nusantara-express-pwa.zip` | Isi `dist/pwa/` dalam bentuk zip |
| `dist/nusantara-express-artifact.html` | Versi untuk Claude Artifact |
| `dist/nusantara-express-aset.html` | Lembar aset untuk cek gaya gambar dan bahasa (`npm run build:review`) |

### Tes

Butuh Chromium: `npx playwright install chromium`, lalu `npm run build`.

```bash
npm run test:play     # main satu bab penuh: intro, salah tebak, 8 pengantaran, Buku Oyen, markas, bahasa Inggris
npm run test:layout   # HP miring, HP tegak, viewer pendek tanpa layar penuh, desktop: peta, HUD, dan ketuk kota
```

Screenshot tes tersimpan di `test/shots/`.

### Struktur kode

| File | Isi |
| --- | --- |
| `src/game.js` | Game: layar judul, peta, terbang, markas, dialog, kartu, Buku Oyen, menu, simpanan |
| `src/content-game.js` | Kota, pulau, tokoh, makanan (petunjuk, fakta), bab 1, semua kalimat Indonesia dan Inggris |
| `src/i18n.js` | Data makanan dan rumah adat yang dipakai bersama, teks lembar aset |
| `src/assets/px.js` | Mesin piksel kecil dan palet warna |
| `src/assets/sprites.js` | Semua sprite: Oyen, tokoh, kendaraan, makanan, rumah adat, ikon |
| `src/assets/map-world.js` | Peta piksel Indonesia (hasil `npm run map`) |
| `game/template.html` | Tata letak dan gaya tampilan game |
| `scripts/build.mjs` | Build semua file rilis |
| `review/` | Lembar aset |
| `tools/rasterize-*.mjs` | Membuat ulang peta piksel dari data Natural Earth |
| `test/` | Tes Playwright |

## Deploy

- **GitHub Pages:** push ke `main` menjalankan `.github/workflows/pages.yml` yang build lalu deploy `dist/pwa/`. Aktifkan sekali di **Settings › Pages › Source: GitHub Actions**.
- **Arcade (main.khaeransori.com/nusantara-express):** `.github/workflows/arcade.yml` meng-upload `dist/pwa/` lewat rsync. Isi secret `ARCADE_SSH_KEY`, `ARCADE_KNOWN_HOSTS`, dan `ARCADE_HOST` di **Settings › Secrets and variables › Actions**. Selama secret belum diisi, langkah ini dilewati tanpa gagal.

Data peta: Natural Earth lewat world-atlas (domain publik). Huruf: Pixelify Sans (OFL).
