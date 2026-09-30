// Nusantara Express: all words, in Indonesian (default) and English.
(function (NX) {
  NX.LANGS = ['id', 'en'];
  NX.DEFAULT_LANG = 'id';

  // UI + review-sheet strings. Keys shared by both languages.
  NX.T = {
    id: {
      'meta.sheet': 'Lembar aset v0.1',
      'lang.label': 'Bahasa',
      'hero.tagline': 'Antar makanan khas ke seluruh Nusantara bersama Oyen!',
      'hero.note': 'Lembar ini untuk cek nada: gaya gambar, tokoh, dan bahasa. Gameplay belum dibuat.',
      'intro': 'Semua gambar di sini digambar dengan kode di atas satu palet warna, jadi game nanti jalan offline tanpa file gambar. Bahasa bawaan Indonesia; tekan EN di atas untuk versi Inggris.',

      'tone.h': 'Arah nada',
      'tone.p': 'Tiga aturan yang dipakai untuk semua gambar dan kalimat.',
      'tone.1.h': 'Hangat dan jenaka',
      'tone.1.p': 'Oyen sedikit ceroboh dan gampang lapar. Leluconnya lembut, tidak pernah mengejek siapa pun.',
      'tone.2.h': 'Belajar sambil jalan-jalan',
      'tone.2.p': 'Setiap fakta menempel pada satu tempat di peta. Anak ingat rendang karena pernah terbang ke Padang, bukan karena menghafal.',
      'tone.3.h': 'Salah itu wajar',
      'tone.3.p': 'Salah pulau? Oyen kasih petunjuk, lalu coba lagi. Tidak ada nyawa yang hilang, tidak ada hitung mundur.',
      'pal.h': 'Palet',
      'pal.p': '41 warna, dipakai bersama oleh semua aset. Ini sembilan yang paling sering muncul.',

      'chars.h': 'Tokoh',
      'chars.p': 'Oyen tokoh utamanya. Tiap daerah punya satu pelanggan yang memakai pakaian adatnya.',
      'oyen.role': 'Kurir dan pilot',
      'oyen.bio': 'Kucing oren pemilik Nusantara Express. Terbang pakai Si Capung, bawa tas paket, dan selalu tergoda mencium bau pesanan.',
      'oyen.tag': 'Tokoh utama',

      'veh.h': 'Kendaraan',
      'veh.p': 'Mulai dengan pesawat kecil. Kapal dibuka nanti untuk rute laut yang jauh.',
      'veh.capung': 'Pesawat amfibi kecil. Bisa mendarat di air dekat pulau mana saja.',
      'veh.pinisi': 'Kapal layar khas Bugis. Seni membuat pinisi diakui UNESCO sejak 2017.',
      'veh.start': 'Kendaraan awal',
      'veh.unlock': 'Dibuka nanti',

      'food.h': 'Makanan khas',
      'food.p': 'Barang antaran bab pertama. Anak harus tahu asal makanannya untuk mengambilnya.',

      'house.h': 'Rumah adat',
      'house.p': 'Hadiah setiap selesai satu daerah. Dipasang di markas Oyen seperti balok bangunan.',

      'map.h': 'Peta Nusantara',
      'map.p': 'Delapan titik antar untuk bab pertama. Garis putus-putus adalah contoh rute Padang ke Jayapura.',
      'map.note': 'Bentuk pulau diambil dari data Natural Earth. Negara tetangga diberi warna abu-abu.',
      'map.hint': 'Geser peta ke samping untuk melihat semuanya.',

      'ui.h': 'Antarmuka',
      'ui.p': 'Semua teks di bawah ini ikut berganti saat bahasa diganti.',
      'ui.hud': 'Panel atas',
      'ui.order': 'Kartu pesanan',
      'ui.dialog': 'Kotak dialog',
      'ui.fact': 'Kartu fakta',
      'ui.feedback': 'Tanggapan',
      'ui.buttons': 'Tombol',

      'g.newOrder': 'Pesanan Baru!',
      'g.orderMsg': 'Mama dengar rendang itu enak sekali. Tolong bawakan satu, ya!',
      'g.clue': 'Petunjuk',
      'g.clueText': 'Cari di Sumatera, di daerah yang atap rumahnya mirip tanduk kerbau.',
      'g.accept': 'Terima',
      'g.later': 'Nanti dulu',
      'g.oyenLine': 'Aku? Makan paket pelanggan? Nggak mungkin… Cuma cium baunya sedikit.',
      'g.didYouKnow': 'Tahukah Kamu?',
      'g.factRendang': 'Rendang dimasak berjam-jam sampai kuahnya kering dan bumbunya meresap. Makanya rendang awet dibawa jauh.',
      'g.saved': 'Disimpan di Buku Oyen',
      'g.delivered': 'Terkirim!',
      'g.wrong': 'Hmm, rendang bukan dari sini. Lihat petunjuknya lagi, yuk!',
      'g.fly': 'Ayo Terbang!',
      'g.map': 'Peta',
      'g.book': 'Buku Oyen',
      'g.pause': 'Jeda',

      'voice.h': 'Contoh kalimat',
      'voice.p': 'Dua bahasa berdampingan supaya gampang dibandingkan.',
      'voice.when': 'Saat',

      'q.h': 'Yang perlu kamu putuskan',
      'q.p': 'Jawab ini dulu, lalu saya lanjut ke gameplay.',
      'q.1': 'Gaya: piksel 2D seperti ini, atau balok 3D seperti Awuu dan Warung Meong?',
      'q.2': 'Oyen jadi satu-satunya tokoh utama, atau pemain bisa pilih kurir?',
      'q.3': "Bahasa santai ('nggak', 'yuk') sudah pas, atau mau lebih baku?",
      'q.4': 'Logat daerah: semua tokoh pakai bahasa Indonesia standar supaya tidak jadi karikatur. Setuju?',
      'q.5': 'Sapaan daerah (Uni, Mas, Bli, Daeng, Mama) tetap dipakai di versi Inggris?',

      'foot': 'Nusantara Express · lembar aset v0.1 · 30 September 2026 · Data peta: Natural Earth · Huruf: Pixelify Sans dan Nunito (OFL)'
    },
    en: {
      'meta.sheet': 'Asset sheet v0.1',
      'lang.label': 'Language',
      'hero.tagline': 'Deliver local dishes across the islands with Oyen!',
      'hero.note': 'This sheet is a tone check: art style, characters and voice. No gameplay yet.',
      'intro': 'Every image here is drawn in code on one shared palette, so the game runs offline with no image files. The default language is Indonesian; tap ID above to switch back.',

      'tone.h': 'Tone',
      'tone.p': 'Three rules behind every picture and every line.',
      'tone.1.h': 'Warm and playful',
      'tone.1.p': "Oyen is a little clumsy and always hungry. The jokes are gentle and never at anyone's expense.",
      'tone.2.h': 'Learn by traveling',
      'tone.2.p': 'Every fact is tied to a place on the map. Kids remember rendang because they flew to Padang, not because they memorized it.',
      'tone.3.h': 'Mistakes are fine',
      'tone.3.p': 'Wrong island? Oyen gives a hint and you try again. No lives lost, no countdown.',
      'pal.h': 'Palette',
      'pal.p': '41 colors shared by every asset. These are the nine you see most.',

      'chars.h': 'Characters',
      'chars.p': 'Oyen is the hero. Each region has one customer dressed in its traditional clothes.',
      'oyen.role': 'Courier and pilot',
      'oyen.bio': 'The orange cat who runs Nusantara Express. Flies Si Capung, carries a parcel bag, and can never resist sniffing the orders.',
      'oyen.tag': 'Main character',

      'veh.h': 'Vehicles',
      'veh.p': 'Start with a small plane. The ship unlocks later for long sea routes.',
      'veh.capung': 'A little seaplane. It can land on the water near any island.',
      'veh.pinisi': 'The Bugis sailing ship. Pinisi boatbuilding has been on the UNESCO heritage list since 2017.',
      'veh.start': 'Starter vehicle',
      'veh.unlock': 'Unlocks later',

      'food.h': 'Local dishes',
      'food.p': 'The deliveries for chapter one. Kids need to know where a dish comes from to pick it up.',

      'house.h': 'Traditional houses',
      'house.p': "Rewards for finishing each region. They go into Oyen's base like building blocks.",

      'map.h': 'Map of the islands',
      'map.p': 'Eight delivery stops for chapter one. The dotted line is a sample route from Padang to Jayapura.',
      'map.note': 'Island shapes come from Natural Earth data. Neighbouring countries are shaded grey.',
      'map.hint': 'Swipe the map sideways to see all of it.',

      'ui.h': 'Interface',
      'ui.p': 'Every word below switches when you change the language.',
      'ui.hud': 'Top bar',
      'ui.order': 'Order card',
      'ui.dialog': 'Dialog box',
      'ui.fact': 'Fact card',
      'ui.feedback': 'Feedback',
      'ui.buttons': 'Buttons',

      'g.newOrder': 'New Order!',
      'g.orderMsg': 'Mama heard rendang is really tasty. Please bring one!',
      'g.clue': 'Clue',
      'g.clueText': 'Look in Sumatra, where the roofs look like buffalo horns.',
      'g.accept': 'Accept',
      'g.later': 'Not now',
      'g.oyenLine': "Me? Eat a customer's order? Never… Just a tiny sniff.",
      'g.didYouKnow': 'Did You Know?',
      'g.factRendang': 'Rendang cooks for hours until the sauce dries and the spices soak in. That is why it keeps well on long trips.',
      'g.saved': "Saved to Oyen's Notebook",
      'g.delivered': 'Delivered!',
      'g.wrong': "Hmm, rendang isn't from here. Let's read the clue again!",
      'g.fly': "Let's Fly!",
      'g.map': 'Map',
      'g.book': "Oyen's Notebook",
      'g.pause': 'Pause',

      'voice.h': 'Sample lines',
      'voice.p': 'Both languages side by side so they are easy to compare.',
      'voice.when': 'When',

      'q.h': 'Your calls',
      'q.p': 'Answer these and I will move on to gameplay.',
      'q.1': 'Style: 2D pixel like this, or blocky 3D like Awuu and Warung Meong?',
      'q.2': 'Oyen as the only hero, or let the player pick a courier?',
      'q.3': "Is the casual Indonesian ('nggak', 'yuk') right, or should it be more formal?",
      'q.4': 'Regional dialects: every character speaks standard Indonesian so no one becomes a caricature. Agree?',
      'q.5': 'Keep the regional titles (Uni, Mas, Bli, Daeng, Mama) in the English version?',

      'foot': 'Nusantara Express · asset sheet v0.1 · 30 September 2026 · Map data: Natural Earth · Type: Pixelify Sans and Nunito (OFL)'
    }
  };

  // Bilingual content records. Proper names stay the same in both languages.
  NX.CONTENT = {
    people: [
      { spr: 'uniRani', name: 'Uni Rani', place: 'Padang, Sumatera Barat',
        wear: { id: 'Tengkuluak tanduak dan songket', en: 'Tengkuluak headcloth and songket' },
        title: { id: 'Uni = kakak perempuan (Minang)', en: 'Uni = big sister (Minang)' } },
      { spr: 'masBayu', name: 'Mas Bayu', place: 'Yogyakarta',
        wear: { id: 'Blangkon, surjan lurik, jarik batik', en: 'Blangkon, striped surjan, batik jarik' },
        title: { id: 'Mas = kakak laki-laki (Jawa)', en: 'Mas = big brother (Javanese)' } },
      { spr: 'bliMade', name: 'Bli Made', place: 'Denpasar, Bali',
        wear: { id: 'Udeng, kemeja putih, kamen', en: 'Udeng, white shirt, kamen' },
        title: { id: 'Bli = kakak laki-laki (Bali)', en: 'Bli = big brother (Balinese)' } },
      { spr: 'daengIcal', name: 'Daeng Ical', place: 'Makassar, Sulawesi Selatan',
        wear: { id: "Songkok recca, jas tutu, lipa' sabbe", en: "Songkok recca cap, jas tutu, lipa' sabbe" },
        title: { id: 'Daeng = sapaan hormat (Makassar)', en: 'Daeng = respectful title (Makassar)' } },
      { spr: 'mamaYosina', name: 'Mama Yosina', place: 'Jayapura, Papua',
        wear: { id: 'Noken dan baju bermotif cerah', en: 'Noken bag and a bright print dress' },
        title: { id: 'Mama = sapaan hangat untuk ibu (Papua)', en: 'Mama = a warm way to address women (Papua)' } }
    ],
    food: [
      { spr: 'rendang', name: 'Rendang', place: 'Padang, Sumatera Barat', lon: 100.35, lat: -0.95,
        d: { id: 'Daging sapi dimasak berjam-jam dengan santan dan rempah.', en: 'Beef slow-cooked for hours in coconut milk and spices.' } },
      { spr: 'pempek', name: 'Pempek', place: 'Palembang, Sumatera Selatan', lon: 104.76, lat: -2.99,
        d: { id: 'Ikan dan sagu, dicocol kuah cuko yang asam, manis, dan pedas.', en: 'Fish and sago cakes dipped in tangy, sweet, spicy cuko.' } },
      { spr: 'kerakTelor', name: 'Kerak Telor', place: 'Jakarta', lon: 106.85, lat: -6.21,
        d: { id: 'Ketan dan telur khas Betawi, dimasak di wajan yang dibalik ke arah bara.', en: 'A Betawi dish of sticky rice and egg, cooked in a wok flipped over the coals.' } },
      { spr: 'gudeg', name: 'Gudeg', place: 'Yogyakarta', lon: 110.37, lat: -7.8,
        d: { id: 'Nangka muda dimasak lama dengan gula aren dan santan. Rasanya manis.', en: "Young jackfruit stewed with palm sugar and coconut milk. It's sweet." } },
      { spr: 'ayamBetutu', name: 'Ayam Betutu', place: 'Denpasar, Bali', lon: 115.22, lat: -8.65,
        d: { id: 'Ayam berbumbu base genep, dimasak lama sampai empuk.', en: 'Chicken rubbed with base genep spice paste, cooked slowly until tender.' } },
      { spr: 'sotoBanjar', name: 'Soto Banjar', place: 'Banjarmasin, Kalimantan Selatan', lon: 114.59, lat: -3.32,
        d: { id: 'Sup ayam bening yang harum kayu manis dan cengkih.', en: 'Clear chicken soup fragrant with cinnamon and cloves.' } },
      { spr: 'cotoMakassar', name: 'Coto Makassar', place: 'Makassar, Sulawesi Selatan', lon: 119.43, lat: -5.15,
        d: { id: 'Sup daging kental dengan kacang tanah, dimakan bersama ketupat.', en: 'Thick beef soup with ground peanuts, eaten with ketupat.' } },
      { spr: 'papeda', name: 'Papeda', place: 'Jayapura, Papua', lon: 140.72, lat: -2.53,
        d: { id: 'Bubur sagu yang lengket, dimakan dengan ikan kuah kuning.', en: 'Sticky sago porridge, eaten with yellow fish soup.' } }
    ],
    houses: [
      { spr: 'rumahGadang', name: 'Rumah Gadang', place: 'Sumatera Barat',
        d: { id: 'Ujung atapnya melengkung seperti tanduk kerbau. Namanya gonjong.', en: "Its roof tips curve up like buffalo horns. They're called gonjong." } },
      { spr: 'rumahBetang', name: 'Rumah Betang', place: 'Kalimantan',
        d: { id: 'Rumah panjang suku Dayak di atas tiang tinggi. Banyak keluarga tinggal bersama.', en: 'The Dayak longhouse on tall stilts, where many families live together.' } },
      { spr: 'joglo', name: 'Joglo', place: 'Jawa Tengah, Yogyakarta',
        d: { id: 'Atap tengahnya tinggi, ditopang empat tiang utama bernama saka guru.', en: 'The tall centre roof rests on four main pillars called saka guru.' } },
      { spr: 'tongkonan', name: 'Tongkonan', place: 'Toraja, Sulawesi Selatan',
        d: { id: 'Atapnya melengkung seperti perahu. Tanduk kerbau dipasang di tiang depan.', en: 'Its roof curves like a boat. Buffalo horns are stacked on the front pole.' } },
      { spr: 'honai', name: 'Honai', place: 'Lembah Baliem, Papua',
        d: { id: 'Rumah bulat beratap jerami tanpa jendela, supaya hangat di pegunungan.', en: 'A round thatched house with no windows, to stay warm in the highlands.' } }
    ],
    palette: [
      { c: 'k', id: 'Tinta', en: 'Ink' }, { c: 'A', id: 'Laut', en: 'Sea' }, { c: 'a', id: 'Langit', en: 'Sky' },
      { c: 'n', id: 'Pasir', en: 'Sand' }, { c: 'g', id: 'Hutan', en: 'Forest' }, { c: 'o', id: 'Oyen', en: 'Oyen' },
      { c: 'r', id: 'Genteng', en: 'Roof tile' }, { c: 'Y', id: 'Emas', en: 'Gold' }, { c: 'b', id: 'Kayu', en: 'Wood' }
    ],
    voice: [
      { when: { id: 'Layar judul', en: 'Title screen' }, id: 'Ayo terbang, Oyen!', en: "Let's fly, Oyen!" },
      { when: { id: 'Oyen memperkenalkan diri', en: 'Oyen says hello' },
        id: 'Halo! Aku Oyen, kurir paling cepat se-Nusantara. Yah, paling cepat kalau lagi nggak ketiduran.',
        en: "Hi! I'm Oyen, the fastest courier in the islands. Well, the fastest when I'm not napping." },
      { when: { id: 'Ambil pesanan (Uni Rani)', en: 'Pick-up (Uni Rani)' },
        id: 'Rendang ini dimasak berjam-jam, lho. Jangan dimakan di jalan, ya!',
        en: "This rendang took hours to cook. Don't eat it on the way!" },
      { when: { id: 'Oyen menjawab', en: 'Oyen answers' },
        id: 'Aku? Makan paket pelanggan? Nggak mungkin… Cuma cium baunya sedikit.',
        en: "Me? Eat a customer's order? Never… Just a tiny sniff." },
      { when: { id: 'Salah pulau', en: 'Wrong island' },
        id: 'Hmm, rendang bukan dari sini. Lihat petunjuknya lagi, yuk!',
        en: "Hmm, rendang isn't from here. Let's read the clue again!" },
      { when: { id: 'Awan hujan di rute', en: 'Rain cloud on the route' },
        id: 'Awan hujan di depan! Terbang lebih rendah, yuk.',
        en: "Rain cloud ahead! Let's fly lower." },
      { when: { id: 'Pesanan sampai (Mama Yosina)', en: 'Delivered (Mama Yosina)' },
        id: 'Wah, enak sekali! Terima kasih, Oyen. Nanti Mama kirim papeda untuk Uni Rani.',
        en: 'Wow, so tasty! Thank you, Oyen. Mama will send some papeda back to Uni Rani.' },
      { when: { id: 'Rumah adat terbuka', en: 'House unlocked' },
        id: 'Rumah Gadang terbuka! Mau dipasang di markas Oyen?',
        en: "Rumah Gadang unlocked! Put it in Oyen's base?" },
      { when: { id: 'Selesai main', en: 'End of session' },
        id: 'Oyen mau tidur siang dulu. Sampai besok!',
        en: "Oyen's off for a nap. See you tomorrow!" }
    ]
  };
})(NX);
