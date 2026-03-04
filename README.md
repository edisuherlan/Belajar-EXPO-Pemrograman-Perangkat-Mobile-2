# Belajar Expo – Pemrograman Perangkat Mobile 2

Repo ini berisi **project praktikum** untuk mata kuliah **Pemrograman Perangkat Mobile 2**, pakai **Expo** dan **React Native**. Di sini kamu bisa jalankan app, lihat contoh kode, dan ikuti panduan praktikum—**Praktikum 2** (Functional Component, props, useState) dan **Praktikum 3** (CRUD, Login, Logout)—dengan narasi yang santai dan gampang diikuti.

---

## Isi Repo Ini Apa Saja?

Singkatnya: **satu app Expo** yang saat dibuka selalu tampil **halaman Login** dulu (demo). Setelah tap **Masuk**, kamu masuk ke **tab utama**: Home, Explore, Praktikum, Modul, dan Logout. Di **tab Praktikum** ada materi Functional Component (Header, Card, CustomButton, Counter). Di **tab Modul** ada **CRUD data mahasiswa** (tambah, ubah, hapus, pagination; tampil tabel atau kartu sesuai lebar layar). Di **tab Logout** muncul konfirmasi "Yakin mau logout?" sebelum kembali ke halaman login.

Teori dan langkah belajarnya ada di **`doc/`**: **PRAKTIKUM_02** (Functional Component) dan **PRAKTIKUM_03** (CRUD, Login, Logout). Component praktikum 2 ada di **`components/praktikum/`**. Kalau kamu baru pertama kali pakai Expo/React Native, repo ini cocok buat starting point: struktur project rapi, ada contoh yang bisa di-run langsung, dan ada penjelasan per file biar enggak bingung "ini file buat apa sih".

---

## Yang Perlu Terpasang di Komputer Kamu

- **Node.js** (versi LTS cukup). Kalau belum: [nodejs.org](https://nodejs.org)
- **npm** (biasanya ikut Node.js)
- Buat jalanin di HP: **Expo Go** ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779))
- Opsional: **Android Studio** atau **Xcode** (macOS) kalau mau pakai emulator

---

## Cara Jalanin Project

### 1. Clone repo ini

```bash
git clone https://github.com/edisuherlan/Belajar-EXPO-Pemrograman-Perangkat-Mobile-2.git
cd Belajar-EXPO-Pemrograman-Perangkat-Mobile-2
```

### 2. Install dependency

```bash
npm install
```

Tunggu sampai selesai (bisa agak lama pertama kali).

### 3. Jalankan app

```bash
npm start
```

Nanti muncul QR code dan menu di terminal. Kamu bisa:

- **Android:** tekan `a` di terminal, atau scan QR pakai Expo Go (Android)
- **iOS:** tekan `i` di terminal (butuh Mac), atau scan QR pakai Expo Go (iPhone)
- **Web:** tekan `w` di terminal — app terbuka di browser

Kalau pakai **Expo Go** di HP, pastikan HP dan laptop satu jaringan WiFi, lalu scan QR code yang muncul.

**Alur app:** Buka app → **Login** (isi form bebas, tap Masuk) → **Tab utama** (Home, Explore, Praktikum, Modul, Logout). Coba **Modul** untuk CRUD mahasiswa, dan **Logout** untuk lihat konfirmasi sebelum keluar.

---

## Struktur Project (Yang Penting Saja)

Agar enggak bingung "file mana buat apa", ini ringkasannya:

```
Belajar-EXPO-Pemrograman-Perangkat-Mobile-2/
├── app/                    # Halaman-halaman app (Expo Router)
│   ├── _layout.tsx         # Root layout: Stack (login → tabs → modal), initialRouteName login
│   ├── login.tsx           # Halaman Login (pertama kali dibuka) — demo, Masuk → tab utama
│   └── (tabs)/             # Tab bawah: Home, Explore, Praktikum, Modul, Logout
│       ├── _layout.tsx     # Definisi tab (ikon, judul)
│       ├── index.tsx       # Tab "Home"
│       ├── explore.tsx     # Tab "Explore"
│       ├── praktikum.tsx   # Tab "Praktikum" — Functional Component (Header, Card, Counter, dll.)
│       ├── modul.tsx       # Tab "Modul" — CRUD data mahasiswa (tambah/ubah/hapus, pagination)
│       └── logout.tsx      # Tab "Logout" — konfirmasi "Yakin mau logout?" → login
│
├── components/
│   ├── praktikum/          # Component praktikum 2 (Functional Component)
│   │   ├── Header.tsx
│   │   ├── CustomButton.tsx
│   │   ├── CardWithProps.tsx
│   │   ├── Counter.tsx
│   │   └── HelloFunctional.tsx
│   └── ui/
│       ├── icon-symbol.tsx       # Ikon (Android/web: Material Icons)
│       └── icon-symbol.ios.tsx   # Ikon iOS (SF Symbols)
│
├── doc/                    # Panduan & materi
│   ├── PRAKTIKUM_02_Functional_Component.md   # Panduan Functional Component, props, useState
│   ├── PRAKTIKUM_03_CRUD_Login_Logout.md      # Panduan CRUD, Login, Logout
│   └── Slide_Pertemuan_2_Pemrograman_Mobile_II.pptx   # Slide materi (jika ada)
│
├── package.json            # Daftar dependency & script (npm start, dll.)
└── README.md               # File ini
```

- **Ubah tampilan/perilaku contoh Praktikum 2** → edit file di **`components/praktikum/`**
- **Ubah isi atau urutan contoh di halaman Praktikum** → edit **`app/(tabs)/praktikum.tsx`**
- **Ubah CRUD / tampilan data mahasiswa** → edit **`app/(tabs)/modul.tsx`**
- **Ubah alur login / logout** → edit **`app/login.tsx`**, **`app/(tabs)/logout.tsx`**, atau **`app/_layout.tsx`**
- **Baca teori & latihan** → **`doc/PRAKTIKUM_02_Functional_Component.md`** dan **`doc/PRAKTIKUM_03_CRUD_Login_Logout.md`**

---

## Praktikum 2: Functional Component

Materi fokus ke **Functional Component**, **props**, dan **useState**. Di **tab "Praktikum"** kamu akan lihat:

**Target Pelajaran Hari Ini**
1. **Header** — judul + subtitle (props)
2. **Card** (CardWithProps) — title + subtitle (props)
3. **CustomButton** — tombol dengan title, onPress, variant (props)
4. **Counter** — angka naik/turun dengan useState (state)

**Contoh Lain**
- **HelloFunctional** — component tanpa props
- **CardWithProps** — beberapa card dengan data berbeda

Panduan lengkap (teori, contoh kode, penjelasan per file, latihan) ada di:

**`doc/PRAKTIKUM_02_Functional_Component.md`**

---

## Praktikum 3: CRUD, Login, dan Logout

Materi fokus ke **CRUD** (Create, Read, Update, Delete), **Login** sebagai halaman pertama, dan **Logout** dengan konfirmasi.

**Yang bisa kamu coba di app**
1. **Login** — Saat app dibuka, tampil form Login. Isi email/NIM & password (bebas), tap **Masuk** → masuk ke tab utama. (Demo: tidak ada cek ke server.)
2. **CRUD di tab Modul** — Tampil data mahasiswa (tabel di layar lebar, kartu di HP). **+ Tambah Mahasiswa** → form modal → Simpan. **Ubah** / **Hapus** per baris; hapus pakai konfirmasi Alert. Pagination 10 data per halaman.
3. **Logout** — Tap tab **Logout** → muncul dialog **"Yakin mau logout?"** → **Batal** (kembali ke tab sebelumnya) atau **Ya, Logout** (kembali ke halaman login).

Panduan lengkap (CRUD, state & modal, Login/Logout, useFocusEffect, navigasi Stack & Tabs, latihan) ada di:

**`doc/PRAKTIKUM_03_CRUD_Login_Logout.md`**

---

## Script yang Bisa Dipakai

| Perintah | Fungsi |
|----------|--------|
| `npm start` | Jalankan Expo (pilih Android / iOS / Web dari menu) |
| `npm run android` | Langsung buka di Android (emulator atau device) |
| `npm run ios` | Langsung buka di iOS simulator (hanya macOS) |
| `npm run web` | Jalankan versi web di browser |
| `npm run lint` | Cek kode pakai ESLint |

---

## Tech Stack (Secara Singkat)

- **Expo SDK ~54** — framework buat bikin app React Native tanpa setup native manual
- **Expo Router ~6** — navigasi based file (folder `app/` = route)
- **React 19** & **React Native 0.81** — UI
- **TypeScript** — typings biar kode lebih aman dan enak dibaca

---

## Kalau Mau Nambah Materi atau Push Perubahan

Setelah clone dan ubah sesuatu:

```bash
git add .
git commit -m "Jelaskan perubahan kamu"
git push origin main
```

Kalau repo ini dipakai bareng (misalnya satu kelas), biasakan pull dulu sebelum mulai kerja: `git pull origin main`.

---

## Ringkasan

- Repo ini = **project Expo** + **Praktikum 2** (Functional Component: Header, Card, CustomButton, Counter) + **Praktikum 3** (CRUD data mahasiswa, Login, Logout) + **panduan di `doc/`**.
- **Alur app:** Buka app → **Login** (Masuk) → **Tab utama** (Home, Explore, Praktikum, **Modul**, **Logout**). Coba Modul untuk CRUD, Logout untuk konfirmasi keluar.
- Jalanin: **clone → npm install → npm start** → pilih platform atau scan QR.
- Belajar: **tab Praktikum** (ikon topi wisuda) + **`doc/PRAKTIKUM_02_Functional_Component.md`**; **tab Modul & Logout** + **`doc/PRAKTIKUM_03_CRUD_Login_Logout.md`**.

Semoga bantu belajarnya. Kalau ada yang kurang jelas, coba run app-nya dulu, baru baca panduan sambil lihat kode—sering itu yang bikin "oh, ternyata gitu"-nya muncul.
