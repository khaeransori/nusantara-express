# PRD: Nusantara Express

Status: v1 (Bab 1) sudah rilis di https://khaeransori.github.io/nusantara-express/
Pemilik: Aan · Terakhir diperbarui: 1 Oktober 2026

## 1. Ringkasan

Game edukasi piksel untuk anak. Oyen, kucing oren pemilik jasa antar Nusantara Express, terbang ke seluruh Indonesia untuk mengambil makanan khas dari daerah asalnya lalu mengantarnya ke pelanggan. Anak belajar geografi dan budaya Indonesia dengan cara bepergian, bukan menghafal.

Satu konsep mengikat semua fitur: **belajar Indonesia lewat mengantar barang.** Setiap fitur baru harus menambah sesuatu yang diantar, cara mengantar, atau tempat yang dikunjungi.

## 2. Pengguna dan konteks

- Anak sekitar 8 tahun, main sendiri di HP, kadang ditemani orang tua.
- HP dipegang miring. Kalau dipegang tegak, game tampil menyamping.
- Harus bisa dimainkan tanpa internet setelah dibuka sekali.
- Bahasa Indonesia sebagai bawaan, bahasa Inggris sebagai pilihan.

## 3. Prinsip nada (tidak berubah di rilis mana pun)

1. **Hangat dan jenaka.** Oyen sedikit ceroboh dan gampang lapar. Leluconnya lembut, tidak pernah mengejek siapa pun.
2. **Belajar sambil jalan-jalan.** Setiap fakta menempel pada satu tempat di peta.
3. **Salah itu wajar.** Tidak ada nyawa, tidak ada hitung mundur, tidak ada kalah. Salah tebak dibalas petunjuk.

Keputusan yang sudah diambil:
- Oyen satu-satunya tokoh utama (untuk sekarang).
- Bahasa santai ("nggak", "yuk") boleh.
- Semua tokoh bicara bahasa Indonesia standar, tanpa logat daerah, supaya tidak jadi karikatur.
- Sapaan daerah (Uni, Mas, Bli, Daeng, Mama, Ayuk, Mpok, Acil) tetap dipakai di versi Inggris.
- Gaya gambar piksel 2D, satu palet 41 warna, semua sprite digambar dengan kode.
- Setiap fakta budaya dicek dulu ke sumber sebelum masuk game.

## 4. Yang sudah ada (v1, Bab 1)

- **Alur satu pesanan:** kartu pesanan + petunjuk → ketuk kota asal di peta → terbang (mini game) → ambil pesanan → terbang ke pelanggan → kartu fakta.
- **Petunjuk bertingkat:** salah sekali, Oyen memberi petunjuk tambahan dan pulau yang benar bergoyang. Salah dua kali, kotanya diberi lingkaran.
- **Terbang dengan Si Capung:** geser jari naik-turun, ambil koin dan ikan, hindari awan hujan. Bintang 1 sampai 3 sesuai jumlah tabrakan.
- **8 kota, 8 makanan, 8 tokoh.** Bab 1 berisi 8 pesanan tetap. Setelah selesai, pesanan acak terus berdatangan.
- **Buku Oyen:** kartu makanan dan rumah adat yang sudah ditemukan.
- **Markas Oyen:** 5 rumah adat yang terbuka per pulau.
- **Peta** bisa digeser dan di-zoom. Semua kota kelihatan di zoom awal.
- **Teknis:** simpanan di HP, layar penuh, rotasi otomatis di HP tegak, PWA offline, deploy otomatis ke GitHub Pages, tes Playwright untuk satu bab penuh dan lima bentuk layar.

## 5. Roadmap

| Prioritas | Fitur | Rilis | Alasan |
| --- | --- | --- | --- |
| P1 | Koin jadi berguna (Toko Oyen) | v1.1 | Koin sekarang cuma angka. Memberi alasan main ulang. |
| P1 | Bab 2: Jalur Rempah (Pinisi) | v1.2 | Pinisi sudah digambar dan sudah dijanjikan "dibuka nanti". |
| P2 | Bab 3: Oleh-oleh Kerajinan | v1.3 | Memperluas peta dan jenis barang tanpa mekanik baru. |
| P2 | Paspor Nusantara | v1.3 | Membuat kemajuan terlihat di peta. |
| P3 | Kejutan di jalan | v1.4 | Menambah fakta di tengah penerbangan. |
| P3 | Musik tiap daerah | v1.4 | Memperkuat rasa tiap daerah lewat suara. |

### 5.1 Koin jadi berguna: Toko Oyen (P1)

**Tujuan:** koin punya kegunaan, dan yang dibeli tetap mengajarkan budaya.

**Isi:**
- **Cat Si Capung:** 5 motif, misalnya batik parang (Jawa), tenun ikat (Sumba), songket (Palembang), sasirangan (Banjarmasin), dan motif polos warna-warni. Setiap motif punya kartu penjelasan asal-usulnya.
- **Hiasan markas:** 8 benda, misalnya pohon kelapa, perahu jukung, becak, bajaj, lumbung padi, gerobak bakso, lampu minyak, dan kursi bambu.

**Kebutuhan:**
- Tombol "Toko" di HUD peta dan di markas.
- Harga dalam koin, terlihat sebelum membeli. Koin tidak pernah minus.
- Motif Si Capung terlihat di layar judul, di peta (pesawat kecil), dan saat terbang.
- Hiasan dipasang di slot tetap di markas. Menggeser bebas bisa menyusul.
- Tidak ada pembelian dengan uang sungguhan.

**Selesai kalau:**
- Anak bisa membeli, memakai, dan mengganti motif. Pilihannya tetap tersimpan setelah game ditutup.
- Hiasan yang dibeli muncul di markas dan tersimpan.
- Dalam satu bab, anak rata-rata bisa membeli 2 sampai 3 barang, jadi harga tidak terasa terlalu mahal.

### 5.2 Bab 2: Jalur Rempah (P1)

**Tujuan belajar:** rempah Nusantara berasal dari mana, dan kenapa pedagang dari jauh datang ke sini.

**Alur:**
- Bab 2 terbuka setelah Bab 1 selesai. Pinisi dibuka sebagai kendaraan kedua.
- Pesanan rempah diantar ke pelabuhan dengan Pinisi. Makanan tetap diantar dengan Si Capung.
- Petunjuknya sama seperti Bab 1: tebak asal rempah, berlayar ke sana, lalu antar.

**Konten awal (fakta dicek sebelum ditulis):**

| Rempah | Asal | Kota di peta |
| --- | --- | --- |
| Pala | Kepulauan Banda, Maluku | Banda Neira |
| Cengkih | Ternate, Maluku Utara | Ternate |
| Lada | Lampung | Bandar Lampung |
| Lada putih | Bangka | Muntok |
| Kayu manis | Kerinci, Jambi | Sungai Penuh |

Pelabuhan tujuan bisa memakai kota yang sudah ada (Makassar, Jakarta, Padang) ditambah Ambon.

**Mini game berlayar:**
- Tampilan samping di laut, mirip terbang tapi di permukaan air.
- Geser naik-turun untuk pindah jalur dan menghindari karang.
- Tahan untuk mengembangkan layar (lebih cepat), lepas untuk pelan. Panah angin memberi bonus kalau diikuti.
- Tetap tanpa kalah: menabrak karang hanya membuat kapal goyang dan bintang berkurang.

**Kebutuhan:**
- Kota baru di peta. Pulau kecil seperti Banda perlu dipastikan tetap tergambar walaupun lebih kecil dari satu piksel peta.
- Tokoh baru di kota rempah, dengan pakaian adat masing-masing dan sapaan daerah yang sudah dicek.
- Rumah adat baru untuk Maluku (misalnya Baileo) sebagai hadiah markas.
- Kartu fakta rempah di Buku Oyen, di tab baru "Rempah".

**Selesai kalau:**
- Bab 2 bisa dimainkan dari awal sampai akhir, dan tes Playwright memainkannya penuh.
- Semua kota baru kelihatan di zoom awal peta, atau peta otomatis bergeser ke sana saat dibutuhkan.

### 5.3 Bab 3: Oleh-oleh Kerajinan (P2)

**Tujuan belajar:** kerajinan khas daerah dan asal-usulnya.

**Konten awal:**

| Barang | Asal | Kota |
| --- | --- | --- |
| Batik | Pekalongan, Jawa Tengah | Pekalongan |
| Ulos | Batak, Sumatera Utara | Medan |
| Tenun ikat | Sumba, NTT | Waingapu |
| Angklung | Jawa Barat | Bandung |
| Noken | Papua | Jayapura |
| Wayang kulit | Jawa | Yogyakarta |

Beberapa di antaranya diakui UNESCO (batik, wayang, angklung, noken). Tahunnya dicek sebelum ditulis di kartu.

**Kebutuhan:**
- Barang bisa diantar dengan Si Capung atau Pinisi, dan kendaraannya dipilih anak.
- Tab "Kerajinan" di Buku Oyen.
- Tokoh dan rumah adat baru untuk Sumatera Utara dan NTT.

**Selesai kalau:** Bab 3 bisa dimainkan penuh dan lulus tes seperti Bab 1.

### 5.4 Paspor Nusantara (P2)

**Tujuan:** anak melihat bagian Indonesia mana yang sudah dan belum dikunjungi.

**Kebutuhan:**
- Setiap kota yang pernah didatangi memberi satu stempel provinsi.
- Halaman Paspor berisi stempel-stempel itu, dengan nama provinsi dan pulaunya.
- Di peta, daerah yang sudah dikunjungi berwarna lebih cerah. Tahap awalnya per pulau. Per provinsi butuh data batas provinsi (Natural Earth admin-1), jadi itu menyusul.

**Selesai kalau:** stempel tersimpan, halaman Paspor menampilkan semuanya, dan warna peta berubah setelah kunjungan pertama.

### 5.5 Kejutan di jalan (P3)

**Tujuan:** fakta tambahan yang muncul pas lewat tempatnya.

**Contoh (dicek sebelum ditulis):**
- Melintasi garis khatulistiwa (Pontianak)
- Asap Gunung Merapi (Jawa Tengah dan Yogyakarta)
- Lumba-lumba di Lovina, Bali
- Komodo di Pulau Komodo, NTT
- Danau Toba, Sumatera Utara

**Kebutuhan:**
- Kejutan muncul kalau rute penerbangan melewati titik tertentu. Paling banyak satu kejutan per penerbangan.
- Tampil sebagai gambar singkat di layar terbang, lalu kartunya masuk Buku Oyen.
- Tidak menghentikan permainan lebih dari 2 detik.

**Selesai kalau:** setiap kejutan bisa muncul minimal di satu rute Bab 1 sampai 3.

### 5.6 Musik tiap daerah (P3)

**Tujuan:** setiap daerah terdengar berbeda.

**Kebutuhan:**
- Lagu penerbangan berubah sesuai daerah tujuan, dibuat dengan WebAudio tanpa file suara.
- Pola nada awal: gamelan slendro atau pelog (Jawa, Bali), talempong (Sumatera Barat), sape (Kalimantan), kolintang (Sulawesi Utara), tifa (Papua dan Maluku).
- Ada pengaturan volume musik yang terpisah dari efek suara. Tombol Suara tetap mematikan semuanya.

**Selesai kalau:** setiap pulau punya lagu sendiri, dan musik bisa dimatikan tanpa mematikan efek suara.

## 6. Kebutuhan umum

- **Offline:** semua rilis tetap satu file HTML plus PWA, tanpa file gambar atau suara dari luar.
- **Dua bahasa:** setiap teks baru ditulis dalam bahasa Indonesia dan Inggris.
- **Simpanan:** simpanan v1 harus tetap terbaca di rilis baru. Kalau formatnya berubah, simpanan lama diubah otomatis tanpa menghapus kemajuan.
- **Ukuran:** file game di bawah 400 KB.
- **Performa:** lancar di HP Android kelas menengah, target 60 fps saat terbang.
- **Aksesibilitas:** menghormati pengaturan kurangi gerakan di HP, dan tombol cukup besar untuk jari anak.
- **Tes:** setiap bab baru punya tes Playwright yang memainkannya penuh, dan tes tata letak tetap lulus.

## 7. Di luar cakupan

- Mode online, papan skor, atau akun.
- Pembelian dengan uang sungguhan dan iklan.
- Tokoh utama selain Oyen (bisa dipertimbangkan lagi nanti).
- Logat atau bahasa daerah dalam dialog.

## 8. Pertanyaan terbuka

1. Apakah Bab 2 harus menunggu Bab 1 selesai, atau bisa dipilih kapan saja?
2. Toko Oyen memakai harga tetap, atau ada barang yang hanya bisa didapat dari bintang atau bab tertentu?
3. Hiasan markas cukup di slot tetap, atau langsung bisa digeser bebas?
4. Paspor per pulau dulu, atau langsung per provinsi?
