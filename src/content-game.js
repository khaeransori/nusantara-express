// Nusantara Express: game data and every in-game line, Indonesian (default) + English.
// Titles (Uni, Mas, Bli, Daeng, Mama, Ayuk, Mpok, Acil) stay the same in English.
(function (NX) {
  NX.START_CITY = 'jakarta';

  NX.CITIES = {
    padang: { name: 'Padang', lon: 100.35, lat: -0.95, island: 'sumatera', npc: 'uniRani' },
    palembang: { name: 'Palembang', lon: 104.76, lat: -2.99, island: 'sumatera', npc: 'ayukIna' },
    jakarta: { name: 'Jakarta', lon: 106.85, lat: -6.21, island: 'jawa', npc: 'mpokSiti' },
    yogyakarta: { name: 'Yogyakarta', lon: 110.37, lat: -7.8, island: 'jawa', npc: 'masBayu' },
    denpasar: { name: 'Denpasar', lon: 115.22, lat: -8.65, island: 'bali', npc: 'bliMade' },
    banjarmasin: { name: 'Banjarmasin', lon: 114.59, lat: -3.32, island: 'kalimantan', npc: 'acilAisyah' },
    makassar: { name: 'Makassar', lon: 119.43, lat: -5.15, island: 'sulawesi', npc: 'daengIcal' },
    jayapura: { name: 'Jayapura', lon: 140.72, lat: -2.53, island: 'papua', npc: 'mamaYosina' }
  };

  NX.ISLANDS = {
    sumatera: { name: 'Sumatera', lon: 98.6, lat: 2.6, house: 'rumahGadang' },
    kalimantan: { name: 'Kalimantan', lon: 113.8, lat: 0.6, house: 'rumahBetang' },
    jawa: { name: 'Jawa', lon: 107.9, lat: -9.5, house: 'joglo' },
    bali: { name: 'Bali', lon: 115.3, lat: -6.4 },
    sulawesi: { name: 'Sulawesi', lon: 121.4, lat: -1.9, house: 'tongkonan' },
    papua: { name: 'Papua', lon: 137.6, lat: -4.6, house: 'honai' }
  };

  NX.NPCS = {
    uniRani: { name: 'Uni Rani',
      ask: { id: 'Uni ingin mencoba {dish}. Tolong bawakan satu, ya, Oyen!', en: 'Uni would love to try {dish}. Please bring one, Oyen!' },
      thanks: { id: 'Wah, {dish}! Terima kasih, Oyen. Uni sudah lama penasaran rasanya.', en: 'Oh, {dish}! Thank you, Oyen. Uni has been curious about it for ages.' } },
    masBayu: { name: 'Mas Bayu',
      ask: { id: 'Mas penasaran sama {dish}. Bisa tolong ambilkan?', en: "I'm curious about {dish}. Could you fetch some?" },
      thanks: { id: 'Pas sekali, Mas lagi lapar. Terima kasih, Oyen!', en: "Perfect timing, I'm starving. Thank you, Oyen!" } },
    bliMade: { name: 'Bli Made',
      ask: { id: 'Bli mau makan {dish} bersama keluarga. Tolong, ya!', en: "I'd like to eat {dish} with my family. Please!" },
      thanks: { id: '{Dish} datang! Nanti Bli bagi dengan tetangga. Terima kasih, Oyen!', en: "{Dish} is here! I'll share it with the neighbours. Thank you, Oyen!" } },
    daengIcal: { name: 'Daeng Ical',
      ask: { id: 'Daeng dengar {dish} itu enak. Tolong antarkan satu, ya!', en: 'I heard {dish} is delicious. Please bring one!' },
      thanks: { id: 'Mantap! Terima kasih, Oyen. Kapan-kapan mampir ke Pantai Losari, ya.', en: 'Excellent! Thank you, Oyen. Drop by Losari Beach some time.' } },
    mamaYosina: { name: 'Mama Yosina',
      ask: { id: 'Mama dengar {dish} itu enak sekali. Tolong bawakan satu, ya!', en: 'Mama heard {dish} is really tasty. Please bring one!' },
      thanks: { id: 'Wah, enak sekali! Terima kasih, Oyen. Mama senang sekali.', en: 'Wow, so tasty! Thank you, Oyen. Mama is so happy.' } },
    ayukIna: { name: 'Ayuk Ina',
      ask: { id: 'Ayuk belum pernah makan {dish}. Tolong bawakan, ya, Oyen!', en: "Ayuk has never had {dish}. Please bring some, Oyen!" },
      thanks: { id: 'Hore, {dish}! Terima kasih, Oyen. Ayuk cicip sekarang, ah.', en: 'Hooray, {dish}! Thank you, Oyen. Ayuk is tasting it right now.' } },
    mpokSiti: { name: 'Mpok Siti',
      ask: { id: 'Mpok lagi kepingin {dish}. Tolong antarkan, ya!', en: 'Mpok is craving {dish}. Please bring some!' },
      thanks: { id: 'Aduh, cepat sekali! Terima kasih, Oyen. Mpok suka!', en: 'My, that was quick! Thank you, Oyen. Mpok loves it!' } },
    acilAisyah: { name: 'Acil Aisyah',
      ask: { id: 'Acil mau coba {dish}. Tolong bawakan ke Banjarmasin, ya!', en: 'Acil wants to try {dish}. Please bring it to Banjarmasin!' },
      thanks: { id: 'Terima kasih, Oyen! Nanti Acil ceritakan ke teman-teman di pasar terapung.', en: 'Thank you, Oyen! Acil will tell her friends at the floating market.' } }
  };

  // city = where the dish comes from (pickup). clue = first clue, hint = after a wrong guess.
  NX.DISHES = {
    rendang: { low: 'rendang', name: 'Rendang', city: 'padang',
      clue: { id: 'Cari di Sumatera, di daerah yang atap rumahnya mirip tanduk kerbau.', en: 'Look in Sumatra, where the roofs look like buffalo horns.' },
      hint: { id: 'Rendang berasal dari Padang, di pantai barat Sumatera.', en: "Rendang comes from Padang, on Sumatra's west coast." },
      pickup: { id: 'Rendang ini dimasak berjam-jam, lho. Jangan dimakan di jalan, ya!', en: "This rendang took hours to cook. Don't eat it on the way!" },
      fact: { id: 'Rendang dimasak berjam-jam sampai kuahnya kering dan bumbunya meresap. Makanya rendang awet dibawa jauh.', en: 'Rendang cooks for hours until the sauce dries and the spices soak in. That is why it keeps well on long trips.' } },
    pempek: { low: 'pempek', name: 'Pempek', city: 'palembang',
      clue: { id: 'Cari di Sumatera, di kota yang dilewati Sungai Musi.', en: 'Look in Sumatra, in the city on the Musi River.' },
      hint: { id: 'Pempek berasal dari Palembang, di Sumatera bagian selatan.', en: 'Pempek comes from Palembang, in southern Sumatra.' },
      pickup: { id: 'Cukonya jangan lupa! Pempek tanpa cuko itu kurang seru.', en: "Don't forget the cuko! Pempek without cuko is no fun." },
      fact: { id: 'Pempek besar yang berisi telur utuh namanya pempek kapal selam.', en: 'The big pempek with a whole egg inside is called kapal selam, which means submarine.' } },
    kerakTelor: { low: 'kerak telor', name: 'Kerak Telor', city: 'jakarta',
      clue: { id: 'Makanan khas Betawi. Cari di kota besar di pantai utara Pulau Jawa.', en: "A Betawi dish. Look for the big city on Java's north coast." },
      hint: { id: 'Kerak telor berasal dari Jakarta.', en: 'Kerak telor comes from Jakarta.' },
      pickup: { id: 'Kerak telornya baru diangkat dari arang. Masih renyah!', en: 'Fresh off the charcoal. Still crispy!' },
      fact: { id: 'Kerak telor dimasak di wajan yang dibalik menghadap bara arang, supaya bagian atasnya ikut matang.', en: 'Kerak telor is cooked in a wok turned upside down over the coals, so the top cooks too.' } },
    gudeg: { low: 'gudeg', name: 'Gudeg', city: 'yogyakarta',
      clue: { id: 'Manis dari nangka muda. Cari di Pulau Jawa, di kota yang punya keraton sultan.', en: "Sweet young jackfruit. Look on Java, in the city with a sultan's palace." },
      hint: { id: 'Gudeg berasal dari Yogyakarta.', en: 'Gudeg comes from Yogyakarta.' },
      pickup: { id: 'Gudeg ini manis dan masih hangat. Hati-hati di jalan, Oyen!', en: "This gudeg is sweet and still warm. Safe travels, Oyen!" },
      fact: { id: 'Gudeg dimasak berjam-jam dengan daun jati. Daun itulah yang membuat warnanya cokelat kemerahan.', en: 'Gudeg simmers for hours with teak leaves. The leaves give it its reddish-brown color.' } },
    ayamBetutu: { low: 'ayam betutu', name: 'Ayam Betutu', city: 'denpasar',
      clue: { id: 'Cari di Pulau Dewata, pulau kecil di sebelah timur Jawa.', en: 'Look on the Island of the Gods, the small island just east of Java.' },
      hint: { id: 'Ayam betutu berasal dari Bali. Kotanya Denpasar.', en: 'Ayam betutu comes from Bali. The city is Denpasar.' },
      pickup: { id: 'Bumbunya meresap sampai ke tulang. Selamat jalan, Oyen!', en: 'The spices go right down to the bone. Safe flight, Oyen!' },
      fact: { id: 'Base genep artinya bumbu lengkap. Isinya banyak rempah, seperti kunyit, jahe, lengkuas, dan kencur.', en: "Base genep means 'complete spice paste'. It holds lots of spices, like turmeric, ginger, galangal and kencur." } },
    sotoBanjar: { low: 'soto Banjar', name: 'Soto Banjar', city: 'banjarmasin',
      clue: { id: 'Cari di Kalimantan, di kota seribu sungai.', en: 'Look in Kalimantan, the city of a thousand rivers.' },
      hint: { id: 'Soto banjar berasal dari Banjarmasin, di Kalimantan Selatan.', en: 'Soto banjar comes from Banjarmasin, in South Kalimantan.' },
      pickup: { id: 'Sotonya Acil bungkus rapat, biar kuahnya tidak tumpah.', en: "Acil wrapped the soup tight so it won't spill." },
      fact: { id: 'Soto banjar biasanya dimakan dengan ketupat dan perkedel kentang.', en: 'Soto banjar is usually eaten with ketupat and potato fritters.' } },
    cotoMakassar: { low: 'coto Makassar', name: 'Coto Makassar', city: 'makassar',
      clue: { id: 'Cari di Sulawesi, pulau yang bentuknya mirip huruf K.', en: 'Look on Sulawesi, the island shaped like the letter K.' },
      hint: { id: 'Namanya sudah jadi petunjuk: coto dari Makassar!', en: 'The name is the clue: coto comes from Makassar!' },
      pickup: { id: 'Cotonya jangan tumpah, ya! Ketupatnya Daeng bungkus terpisah.', en: "Don't spill the coto! Daeng packed the ketupat separately." },
      fact: { id: 'Coto makassar disantap dengan ketupat atau burasa, nasi santan yang dibungkus daun pisang.', en: 'Coto makassar is eaten with ketupat or burasa, coconut rice wrapped in banana leaves.' } },
    papeda: { low: 'papeda', name: 'Papeda', city: 'jayapura',
      clue: { id: 'Cari di pulau paling timur, tempat rumah Honai.', en: 'Look on the easternmost island, home of the Honai.' },
      hint: { id: 'Papeda berasal dari Papua. Kotanya Jayapura.', en: 'Papeda comes from Papua. The city is Jayapura.' },
      pickup: { id: 'Papeda paling enak dimakan hangat. Terbang cepat, ya, Oyen!', en: 'Papeda is best eaten warm. Fly fast, Oyen!' },
      fact: { id: 'Papeda digulung pakai dua batang kayu kecil, lalu diseruput dengan kuah ikan kuning.', en: 'People twirl papeda around two little sticks, then slurp it with yellow fish soup.' } }
  };

  // Chapter 1: every dish once, starting close to home and growing in distance.
  NX.CHAPTER1 = [
    { dish: 'gudeg', to: 'denpasar' },
    { dish: 'kerakTelor', to: 'yogyakarta' },
    { dish: 'rendang', to: 'jayapura' },
    { dish: 'papeda', to: 'padang' },
    { dish: 'pempek', to: 'makassar' },
    { dish: 'sotoBanjar', to: 'yogyakarta' },
    { dish: 'cotoMakassar', to: 'jayapura' },
    { dish: 'ayamBetutu', to: 'makassar' }
  ];

  NX.OYEN = {
    intro: [
      { id: 'Halo! Aku Oyen, kurir paling cepat se-Nusantara. Yah, paling cepat kalau lagi nggak ketiduran.', en: "Hi! I'm Oyen, the fastest courier in the islands. Well, the fastest when I'm not napping." },
      { id: 'Tugasku mengambil makanan khas dari daerah asalnya, lalu mengantarnya ke pelanggan.', en: 'My job: pick up each dish where it comes from, then fly it to the customer.' },
      { id: 'Kalau bingung, baca petunjuknya. Aku juga suka bingung, kok.', en: 'If you get stuck, read the clue. I get stuck too sometimes.' }
    ],
    accept: [
      { id: 'Siap! Kurir paling cepat se-Nusantara berangkat!', en: 'On it! The fastest courier in the islands is on the way!' },
      { id: 'Meluncur! Pegangan yang erat, Si Capung!', en: 'Here we go! Hold on tight, Si Capung!' },
      { id: 'Oke! Sekarang, {dish} itu dari mana, ya?', en: 'Okay! Now, where does {dish} come from?' }
    ],
    afterPickup: [
      { id: 'Aku? Makan paket pelanggan? Nggak mungkin… Cuma cium baunya sedikit.', en: "Me? Eat a customer's order? Never… Just a tiny sniff." },
      { id: 'Hmm, harum sekali… Fokus, Oyen. Fokus.', en: 'Mmm, smells so good… Focus, Oyen. Focus.' },
      { id: 'Paket aman di tas. Ayo antar!', en: "Order's safe in the bag. Let's deliver it!" }
    ]
  };

  // UI strings. {x} placeholders are filled at runtime.
  NX.GT = {
    id: {
      play: 'Ayo Terbang!', resume: 'Lanjut Terbang!', tagline: 'Antar makanan khas ke seluruh Nusantara bersama Oyen!',
      sound: 'Suara', on: 'Nyala', off: 'Mati', lang: 'Bahasa',
      book: 'Buku', base: 'Markas', pause: 'Jeda', back: 'Kembali ke peta',
      chapter: 'Bab 1', free: 'Bebas',
      newOrder: 'Pesanan Baru!', clue: 'Petunjuk', extra: 'Petunjuk tambahan', accept: 'Terima', ok: 'Oke',
      pickupTask: 'Ambil {dish}', pickupHelp: 'Ketuk kota asal {dish} di peta.',
      deliverTask: 'Antar ke {name}', deliverHelp: 'Ketuk {city} untuk terbang.',
      wrong: 'Hmm, {dish} bukan dari {city}. Lihat petunjuknya lagi, yuk!',
      notHere: 'Pesanan ini untuk {name} di {city}.',
      sameCity: 'Pas sekali, kita sudah di {city}!',
      ready: '{dish} siap diantar!',
      tapToFly: 'Ketuk untuk terbang', howTo: 'Geser jarimu ke atas dan ke bawah. Ambil koin, hindari awan hujan!',
      rainWarn: 'Awan hujan di depan! Terbang lebih rendah, yuk.', bump: 'Brrr! Basah!', fish: 'Nyam! Ikan!', landing: 'Mendarat!',
      coinsGot: '+{n} koin',
      delivered: 'Terkirim!', didYouKnow: 'Tahukah Kamu?', newCard: 'Kartu baru di Buku Oyen!',
      unlocked: '{house} terbuka! Mau dipasang di markas Oyen?', place: 'Pasang!', later: 'Nanti',
      chapterDone: 'Bab 1 selesai! Semua makanan khas sudah sampai ke pelanggannya.',
      afterChapter: 'Oyen mau tidur siang dulu… Eh, ada pesanan baru!',
      bookTitle: 'Buku Oyen', tabFood: 'Makanan', tabHouse: 'Rumah adat', locked: 'Belum ditemukan',
      baseTitle: 'Markas Oyen', lockedHouse: 'Antar makanan dari {island} untuk membuka {house}.',
      paused: 'Jeda', continue: 'Lanjut', toTitle: 'Layar judul', restart: 'Mulai dari awal',
      sure: 'Yakin? Semua koin, bintang, dan kartu akan hilang.', yesRestart: 'Ya, mulai lagi', cancel: 'Batal',
      rotate: 'Putar HP-mu biar layarnya lebih lebar.', keep: 'Lanjut saja',
      from: 'Dari', to: 'Ke', full: 'Layar penuh'
    },
    en: {
      play: "Let's Fly!", resume: 'Keep Flying!', tagline: 'Deliver local dishes across the islands with Oyen!',
      sound: 'Sound', on: 'On', off: 'Off', lang: 'Language',
      book: 'Notebook', base: 'Base', pause: 'Pause', back: 'Back to map',
      chapter: 'Chapter 1', free: 'Free play',
      newOrder: 'New Order!', clue: 'Clue', extra: 'Extra clue', accept: 'Accept', ok: 'Okay',
      pickupTask: 'Pick up {dish}', pickupHelp: 'Tap the city {dish} comes from.',
      deliverTask: 'Deliver to {name}', deliverHelp: 'Tap {city} to fly.',
      wrong: "Hmm, {dish} isn't from {city}. Let's read the clue again!",
      notHere: 'This order is for {name} in {city}.',
      sameCity: "Lucky us, we're already in {city}!",
      ready: '{dish} is ready to go!',
      tapToFly: 'Tap to fly', howTo: 'Slide your finger up and down. Grab the coins, dodge the rain clouds!',
      rainWarn: "Rain cloud ahead! Let's fly lower.", bump: 'Brrr! Soggy!', fish: 'Yum! Fish!', landing: 'Landing!',
      coinsGot: '+{n} coins',
      delivered: 'Delivered!', didYouKnow: 'Did You Know?', newCard: "New card in Oyen's Notebook!",
      unlocked: "{house} unlocked! Put it in Oyen's base?", place: 'Place it!', later: 'Later',
      chapterDone: 'Chapter 1 complete! Every dish reached its customer.',
      afterChapter: "Oyen's off for a nap… Oh wait, a new order!",
      bookTitle: "Oyen's Notebook", tabFood: 'Dishes', tabHouse: 'Houses', locked: 'Not found yet',
      baseTitle: "Oyen's Base", lockedHouse: 'Deliver a dish from {island} to unlock {house}.',
      paused: 'Paused', continue: 'Continue', toTitle: 'Title screen', restart: 'Start over',
      sure: 'Sure? All coins, stars and cards will be gone.', yesRestart: 'Yes, start over', cancel: 'Cancel',
      rotate: 'Turn your phone sideways for a wider view.', keep: 'Keep going',
      from: 'From', to: 'To', full: 'Full screen'
    }
  };
})(NX);
