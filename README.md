# Belajar Expo – Pemrograman Perangkat Mobile 2

Repo ini berisi **project praktikum** untuk mata kuliah **Pemrograman Perangkat Mobile 2**, pakai **Expo** dan **React Native**. Di sini kamu bisa jalankan app, lihat contoh kode, dan ikuti panduan praktikum—**Praktikum 2** (Functional Component, props, useState), **Praktikum 3** (CRUD, Login, Logout), **koneksi ke database cloud Supabase** (tab **Cloud**: CRUD ke tabel `mahasiswa`), serta **Login sungguhan** lewat **Supabase Auth** (email + password, sesi tersimpan di perangkat).

---

## Isi Repo Ini Apa Saja?

Singkatnya: **satu app Expo** yang saat dibuka selalu tampil **halaman Login** dulu. Jika **Supabase sudah dikonfigurasi** di `.env`, login memakai **Supabase Auth** (email + password). Jika belum, **Masuk** tetap bisa dipakai sebagai **demo lokal** (tanpa server). Setelah masuk, kamu berada di **tab utama**: Home, Explore, Praktikum, Modul, **Cloud**, dan Logout.

| Tab | Fungsi singkat |
|-----|----------------|
| **Home / Explore** | Contoh layar dari template Expo |
| **Praktikum** | Functional Component: Header, Card, Counter, dll. |
| **Modul** | **CRUD data mahasiswa** di **memori lokal** (useState)—tambah, ubah, hapus, pagination; tabel atau kartu sesuai lebar layar |
| **Cloud** | **CRUD data mahasiswa** di **Supabase**—tabel `public.mahasiswa`; tambah/ubah/hapus, pull-to-refresh, muat ulang |
| **Logout** | Konfirmasi lalu **keluar sesi** (Supabase `signOut` jika tersedia) dan kembali ke login |

Teori dan langkah belajarnya ada di **`doc/`**: **PRAKTIKUM_02** (Functional Component) dan **PRAKTIKUM_03** (CRUD, Login, Logout). Component praktikum 2 ada di **`components/praktikum/`**. Kalau kamu baru pertama kali pakai Expo/React Native, repo ini cocok buat starting point: struktur project rapi, ada contoh yang bisa di-run langsung, dan ada penjelasan per file biar enggak bingung "ini file buat apa sih".

---

## Supabase + Expo (untuk Mahasiswa): Ringkasan Konsep

**Supabase** = layanan **backend-as-a-service**: database **PostgreSQL** di internet, API otomatis, bisa diakses dari app (termasuk Expo) pakai **URL project** dan **kunci anon (JWT)**.

**Bedanya tab Modul vs tab Cloud**

- **Modul:** Data disimpan di **state React** (`useState`) di HP. Kalau app ditutup, data contoh bisa kembali ke default (tergantung kode). **Tidak** perlu internet untuk CRUD lokal.
- **Cloud:** Data diambil dari **tabel nyata** di server Supabase. Perlu **internet**, **project Supabase**, tabel sudah dibuat (pakai SQL), dan **file `.env`** berisi URL + anon key.

**Yang aman dipakai di app (client)**

- **URL project** dan **anon public key** — memang didesain untuk dipakai di aplikasi, **asalkan** di Supabase sudah diatur **Row Level Security (RLS)** dan policy yang wajar. Di project contoh ini, policy mengizinkan **`anon` dan `authenticated`** (lihat `doc/supabase_mahasiswa.sql`) agar tab **Cloud** jalan baik **sebelum** maupun **sesudah** login; untuk produksi harus diperketat (misalnya per `auth.uid()`).

**Yang jangan dibundel ke app**

- **Secret key** (`sb_secret_...`) — hanya untuk server, Edge Function, atau skrip admin. Simpan di `.env` tanpa awalan `EXPO_PUBLIC_` dan **jangan** di-import ke layar yang di-build ke HP.

File **`lib/supabase.ts`** membuat **satu klien** Supabase memakai variabel dari `.env`. Halaman **`app/(tabs)/mahasiswa-cloud.tsx`** memanggil API tabel `mahasiswa` (baca & tulis).

---

## Login dengan Supabase Auth (bab khusus)

Bagian ini merangkum **fitur login** yang menghubungkan halaman **`app/login.tsx`** ke **Supabase Authentication**, plus **proteksi rute** dan dampaknya ke tab **Cloud**.

### Apa yang berubah dibanding demo lama?

| Situasi | Perilaku |
|--------|----------|
| **`.env` berisi** `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Login **wajib** memakai **email + password** user yang terdaftar di Supabase (**Authentication → Users**). Sesi disimpan di HP (**AsyncStorage**) sehingga tidak perlu login ulang setiap buka app. |
| **`.env` belum lengkap** (tanpa URL/key) | Tombol **Masuk** tetap mengarah ke tab utama (**mode demo**), sama seperti perilaku lama—berguna jika belum punya project Supabase. |

### Alur dari sisi pengguna

1. Buka app → layar **Login** (entry point `app/_layout.tsx`, `initialRouteName: 'login'`).
2. Isi **email** dan **password** akun Supabase Auth → **Masuk** → `signInWithPassword`.
3. Jika sukses, app pindah ke **`/(tabs)`**. Jika gagal (salah password, user tidak ada), pesan error dari server ditampilkan di form.
4. **Logout** (tab bawah): dialog konfirmasi → **`auth.signOut()`** → kembali ke **`/login`**.

### Alur dari sisi kode (file utama)

| File | Peran |
|------|--------|
| **`lib/supabase.ts`** | `createClient` dengan **`AsyncStorage`**, **`persistSession: true`**, **`autoRefreshToken: true`** agar token login tersimpan di perangkat. |
| **`app/login.tsx`** | Memanggil **`supabase.auth.signInWithPassword({ email, password })`** bila Supabase terkonfigurasi; indikator loading; pesan error. |
| **`app/_layout.tsx`** | **`getSession`** saat startup + **`onAuthStateChange`**: jika **ada sesi** tapi rute di **`/login`** → alihkan ke **`/(tabs)`**; jika **tidak ada sesi** tapi user di grup **`(tabs)`** → alihkan ke **`/login`**. Overlay singkat sampai sesi selesai dibaca dari storage. |
| **`app/(tabs)/logout.tsx`** | Setelah konfirmasi, **`supabase.auth.signOut()`** (jika klien ada) lalu **`router.replace('/login')`**. |

### Menyiapkan akun di Supabase Dashboard

1. **Authentication** → **Users** → **Add user** → isi **email** dan **password** (bukan NIM; Auth standar memakai email).
2. Pastikan project memakai URL + anon key yang sama dengan yang ada di **`.env`** lokal.

### Tab Cloud setelah login (penting: RLS)

JWT pengguna yang sudah login memakai role **`authenticated`**, **bukan** `anon`. Kalau di database policy RLS **hanya** `TO anon`, query ke tabel `mahasiswa` bisa mengembalikan **kosong** walau data ada.

**Solusi:** jalankan skrip SQL yang mengizinkan **keduanya** (`anon` dan `authenticated`):

- **`doc/supabase_mahasiswa.sql`** — skrip lengkap (tabel + policy terbaru `dev_mahasiswa_*_clients`).
- **`doc/supabase_mahasiswa_rls_fix_login.sql`** — **hanya perbaikan RLS** untuk project yang sudah punya tabel; tempel di **SQL Editor** → **Run** (aman diulang).

Di **`app/(tabs)/mahasiswa-cloud.tsx`**, sebelum `select`, app memanggil **`getSession()`** agar klien sudah memasang JWT; jika ada error hak akses, teks bantuan mengarah ke skrip di atas.

### Dependensi tambahan

- **`@react-native-async-storage/async-storage`** — penyimpanan sesi auth (terpasang lewat `npx expo install @react-native-async-storage/async-storage`).

### Ringkasan satu kalimat

**Login** memakai **Supabase Auth** + **sesi di AsyncStorage**; **root layout** menjaga agar tab hanya bisa diakses saat login; **logout** membersihkan sesi; **Cloud** butuh policy RLS untuk **`authenticated`** (pakai skrip SQL di atas).

**Panduan detail (per file, langkah A–G, checklist uji, troubleshooting):** [`doc/PANDUAN_PERUBAHAN_LOGIN_SUPABASE_DAN_CLOUD.md`](doc/PANDUAN_PERUBAHAN_LOGIN_SUPABASE_DAN_CLOUD.md)

---

## Setup Supabase (Langkah demi Langkah)

Ikuti urutan ini supaya tab **Cloud** bisa menampilkan data.

### 1) Buat project di Supabase

1. Buka [supabase.com](https://supabase.com), login, lalu **New project** (pilih organisasi, password database, region, dll.).
2. Tunggu sampai project **Ready**. Setelah itu, baru kamu bisa ambil URL dan API key (langkah di bawah).

#### Cara melihat & menyalin API Key di dashboard Supabase

Supabase tidak menyebut satu tombol “API key” saja — ada **URL project** dan beberapa **kunci** dengan fungsi beda. Ikuti ini supaya tidak salah tempel ke `.env`:

1. **Masuk ke project kamu**  
   Di dashboard Supabase, klik **nama project** yang mau dipakai (kalau punya banyak project).

2. **Buka menu pengaturan API**  
   - Klik ikon **Settings** (gerigi / *gear*) di **sidebar kiri** (biasanya paling bawah), **atau**  
   - Dari menu project, cari **Project Settings** → bagian yang berhubungan dengan **API**.

3. **Buka bagian API / Data API**  
   Di sidebar pengaturan project, pilih **“API”** atau **“Data API”** (nama bisa sedikit beda tergantung versi tampilan dashboard). Di halaman ini kamu akan melihat informasi koneksi ke backend.

4. **Yang perlu kamu catat untuk project Expo ini**

   | Di dashboard Supabase (istilah umum) | Isi ke file `.env` (lihat `.env.example`) |
   |--------------------------------------|-------------------------------------------|
   | **Project URL** — alamat `https://xxxx.supabase.co` | `EXPO_PUBLIC_SUPABASE_URL` |
   | **anon** / **anon public** — biasanya **JWT** (string panjang diawali `eyJ...`) | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
   | *(Opsional)* **Publishable key** — format baru `sb_publishable_...` | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
   | *(Jangan dipakai di app HP)* **Secret key** — `sb_secret_...` | `SUPABASE_SECRET_KEY` (hanya untuk server/skrip admin) |

5. **Kalau ada dua tab kunci (“API Keys” baru vs “Legacy”)**  
   Dashboard terbaru sering punya tab **Publishable and secret API keys** (format `sb_publishable_...` / `sb_secret_...`) dan tab terpisah untuk **Legacy anon / service_role** (JWT lama). Untuk tab **Cloud** di app ini, yang **wajib** biasanya adalah **Project URL** + **anon (JWT)**. Publishable key opsional kecuali nanti materi atau library kamu mengharuskan format baru itu.

6. **Menyalin dengan aman**  
   - Klik ikon **salin** (clipboard) di samping nilai, atau blok teks lalu salin.  
   - **Jangan** share screenshot yang terlihat **secret key** ke forum publik atau tugas yang bisa dibaca semua orang. Untuk tugas LMS, cukup jelaskan bahwa kunci disimpan di `.env` lokal.

7. **Project reference**  
   Potongan teks di tengah URL (`https://<ini>.supabase.co`) adalah **project reference** — sama dengan yang sering muncul di dalam payload JWT anon. Itu membantu memastikan URL dan anon key dari **project yang sama**.

Setelah URL dan anon key tercatat, lanjut isi **`.env`** (langkah 3 di bawah).

### 2) Buat tabel `mahasiswa` di SQL Editor

1. Di dashboard Supabase: **SQL Editor** → query baru.
2. Buka file **`doc/supabase_mahasiswa.sql`** di repo ini, **salin seluruh isinya**, tempel di SQL Editor, lalu **Run**.
3. Cek **Table Editor** → schema **public** → tabel **`mahasiswa`** (ada kolom `id`, `nim`, `nama`, `prodi`, `kelas`, dll.).

### 3) Siapkan file `.env` di project lokal

1. Salin **`/.env.example`** jadi **`/.env`** (nama file persis `.env`).
2. Isi nilai dari dashboard: **Project URL** dan **anon public key** yang sudah kamu lihat dan salin di **Settings → API** (tabel di langkah **1**). Contoh nama variabel ada di `.env.example` dan penjelasan di komentar file tersebut.
3. **Jangan** commit file `.env` ke Git — sudah dicatat di `.gitignore`.

### 4) Install dependency & jalankan app

```bash
npm install
npm start
```

Setelah mengubah `.env`, **restart** Metro (`Ctrl+C` lalu `npm start` lagi) agar variabel `EXPO_PUBLIC_*` terbaca.

### 5) Coba tab Cloud (setelah login)

Login dengan user Auth → buka tab **Cloud**. Kalau konfigurasi benar, muncul baris dari tabel `mahasiswa`. Tarik layar ke bawah (**pull to refresh**) atau tap **Muat ulang**. Kamu bisa **tambah / ubah / hapus** data dari app.

**Kalau Cloud kosong setelah login (tanpa error)**

- Jalankan **`doc/supabase_mahasiswa_rls_fix_login.sql`** di SQL Editor (policy harus **`anon` + `authenticated`**).

**Kalau muncul error**

- Pastikan SQL di langkah (2) sukses dan nama tabel **`mahasiswa`** persis sama.
- Pastikan **RLS + policy** sesuai skrip terbaru di `doc/supabase_mahasiswa.sql` (atau file fix di atas).
- Cek internet dan URL/key di `.env`.

---

## Yang Perlu Terpasang di Komputer Kamu

- **Node.js** (versi LTS cukup). Kalau belum: [nodejs.org](https://nodejs.org)
- **npm** (biasanya ikut Node.js)
- Buat jalanin di HP: **Expo Go** ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779))
- Opsional: **Android Studio** atau **Xcode** (macOS) kalau mau pakai emulator
- Untuk tab **Cloud**: akun **Supabase** (gratis) + project + langkah setup di atas

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

**Library Supabase:** Project ini sudah menyertakan paket **`@supabase/supabase-js`** di **`package.json`**. Kamu **tidak** perlu menjalankan `npm install @supabase/supabase-js` sendiri kalau sudah clone repo terbaru — cukup **`npm install`** seperti di atas, maka library itu ikut terpasang bersama dependency lain. Isi `package.json` itulah yang menentukan apa saja yang di-download ke folder `node_modules/`.

### 3. (Opsional tapi disarankan untuk tab Cloud) File `.env`

Salin `.env.example` → `.env`, lalu isi sesuai project Supabase kamu (lihat bagian **Setup Supabase**).

### 4. Jalankan app

```bash
npm start
```

Nanti muncul QR code dan menu di terminal. Kamu bisa:

- **Android:** tekan `a` di terminal, atau scan QR pakai Expo Go (Android)
- **iOS:** tekan `i` di terminal (butuh Mac), atau scan QR pakai Expo Go (iPhone)
- **Web:** tekan `w` di terminal — app terbuka di browser

Kalau pakai **Expo Go** di HP, pastikan HP dan laptop satu jaringan WiFi, lalu scan QR code yang muncul.

**Alur app:** Buka app → **Login** (dengan Supabase: email + password user Auth; tanpa `.env`: isian bebas lalu Masuk demo) → **Tab utama**. Coba **Modul** (CRUD lokal), **Cloud** (CRUD Supabase), dan **Logout** (hapus sesi + kembali ke login).

---

## Struktur Project (Yang Penting Saja)

Agar enggak bingung "file mana buat apa", ini ringkasannya:

```
Belajar-EXPO-Pemrograman-Perangkat-Mobile-2/
├── app/                         # Halaman-halaman app (Expo Router)
│   ├── _layout.tsx              # Root layout: Stack (login → tabs → modal), initialRouteName login
│   ├── login.tsx                # Login — Supabase Auth (email/password) jika .env ada; else demo Masuk
│   └── (tabs)/                  # Tab bawah: Home, Explore, Praktikum, Modul, Cloud, Logout
│       ├── _layout.tsx          # Definisi tab (ikon, judul)
│       ├── index.tsx            # Tab "Home"
│       ├── explore.tsx          # Tab "Explore"
│       ├── praktikum.tsx        # Tab "Praktikum" — Functional Component (Header, Card, Counter, dll.)
│       ├── modul.tsx            # Tab "Modul" — CRUD data mahasiswa lokal (tambah/ubah/hapus, pagination)
│       ├── mahasiswa-cloud.tsx  # Tab "Cloud" — CRUD tabel mahasiswa di Supabase
│       └── logout.tsx           # Tab "Logout" — signOut + kembali ke login
│
├── lib/
│   └── supabase.ts              # Klien Supabase (URL + anon key dari .env)
│
├── components/
│   ├── praktikum/               # Component praktikum 2 (Functional Component)
│   │   ├── Header.tsx
│   │   ├── CustomButton.tsx
│   │   ├── CardWithProps.tsx
│   │   ├── Counter.tsx
│   │   └── HelloFunctional.tsx
│   └── ui/
│       ├── icon-symbol.tsx      # Ikon (Android/web: Material Icons)
│       └── icon-symbol.ios.tsx  # Ikon iOS (SF Symbols)
│
├── doc/                         # Panduan & materi + SQL contoh
│   ├── PRAKTIKUM_02_Functional_Component.md
│   ├── PRAKTIKUM_03_CRUD_Login_Logout.md
│   ├── Panduan_Praktikum_Integrasi_Supabase_Cloud.md  # Langkah A–F, file baru/ubah, checklist
│   ├── NARASI_LMS_Integrasi_Supabase.md                 # Narasi ringkas untuk posting LMS
│   ├── supabase_mahasiswa.sql                        # Skrip SQL: tabel + RLS (anon + authenticated)
│   ├── supabase_mahasiswa_rls_fix_login.sql         # Hanya perbaikan RLS setelah pakai Supabase Auth
│   └── PANDUAN_PERUBAHAN_LOGIN_SUPABASE_DAN_CLOUD.md # Panduan terstruktur: login, rute, RLS, Cloud
│
├── .env.example                 # Contoh variabel lingkungan (aman di-commit; salin ke .env)
├── package.json                 # Daftar dependency & script (npm start, dll.)
└── README.md                    # File ini
```

**Petunjuk cepat**

- Ubah contoh **Praktikum 2** → **`components/praktikum/`** dan **`app/(tabs)/praktikum.tsx`**
- Ubah **CRUD lokal** → **`app/(tabs)/modul.tsx`**
- Ubah **tampilan / query data cloud** → **`app/(tabs)/mahasiswa-cloud.tsx`** dan **`lib/supabase.ts`**
- Ubah **alur login / logout** → **`app/login.tsx`**, **`app/(tabs)/logout.tsx`**, **`app/_layout.tsx`**
- Teori **Praktikum 2 & 3** → **`doc/PRAKTIKUM_02_...`** dan **`doc/PRAKTIKUM_03_...`**
- **Praktikum Supabase / tab Cloud** → **`doc/Panduan_Praktikum_Integrasi_Supabase_Cloud.md`**
- **Skema database cloud** → jalankan **`doc/supabase_mahasiswa.sql`** di Supabase

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

1. **Login** — Form email + password. Dengan Supabase terkonfigurasi: **signInWithPassword** ke server. Tanpa `.env`: **Masuk** demo ke tab utama.
2. **CRUD di tab Modul** — Data di **state lokal**. Tampil tabel/kartu. **+ Tambah Mahasiswa** → form modal → Simpan. **Ubah** / **Hapus** per baris; hapus pakai konfirmasi Alert. Pagination 10 data per halaman.
3. **Logout** — Tap tab **Logout** → dialog **"Yakin mau logout?"** → **Batal** atau **Ya, Logout** (kembali ke login).

Panduan lengkap (CRUD, state & modal, Login/Logout, useFocusEffect, navigasi Stack & Tabs, latihan) ada di:

**`doc/PRAKTIKUM_03_CRUD_Login_Logout.md`**

---

## Belajar Expo + Supabase (Checklist Mahasiswa)

Gunakan checklist ini supaya belajarnya runut:

1. Pahami dulu **tab Modul** (CRUD lokal) — ini dasar state & UI.
2. Buat **project Supabase**, jalankan **`doc/supabase_mahasiswa.sql`**, cek data di Table Editor.
3. Isi **`.env`** dari **`.env.example`**, restart Expo.
4. Baca **`lib/supabase.ts`** — bagaimana klien dibuat.
5. Baca **`app/(tabs)/mahasiswa-cloud.tsx`** — `select` / `insert` / `update` / `delete`, `RefreshControl`, tabel/kartu.
6. (Lanjutan) Baca dokumentasi Supabase untuk **insert/update/delete** dan **RLS** sebelum menghubungkan write ke client.

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
- **Supabase (JS client)** — **`@supabase/supabase-js`** + **Supabase Auth** (login) + **PostgREST** (tabel `mahasiswa`)
- **AsyncStorage** — **`@react-native-async-storage/async-storage`** untuk persist sesi login

---

## Kalau Mau Nambah Materi atau Push Perubahan

Setelah clone dan ubah sesuatu:

```bash
git add .
git commit -m "Jelaskan perubahan kamu"
git push origin main
```

Kalau repo ini dipakai bareng (misalnya satu kelas), biasakan pull dulu sebelum mulai kerja: `git pull origin main`.

**Catatan:** File **`.env`** berisi rahasia dan **tidak** ikut ke Git (lihat `.gitignore`). Hanya **`.env.example`** yang di-commit sebagai panduan.

---

## Ringkasan

- Repo ini = **project Expo** + **Praktikum 2** + **Praktikum 3** + **Supabase** (CRUD **Cloud** + **Login Auth**) + **panduan di `doc/`**.
- **Alur app:** **Login** (Auth atau demo) → tab utama. **Modul** = CRUD lokal; **Cloud** = CRUD Supabase; **Logout** = `signOut`.
- **Setup:** Supabase project → SQL **`doc/supabase_mahasiswa.sql`** (atau **`doc/supabase_mahasiswa_rls_fix_login.sql`** jika Cloud kosong setelah login) → buat user di **Authentication** → **`.env`** → `npm install` → `npm start`.
- Jalanin: **clone → npm install → (isi .env) → npm start** → pilih platform atau scan QR.
- Belajar login: **`README.md` (bab Login Supabase Auth)**, **`app/login.tsx`**, **`app/_layout.tsx`**, **`lib/supabase.ts`**; Cloud + SQL seperti di atas.

Semoga bantu belajarnya. Kalau ada yang kurang jelas, coba run app-nya dulu, baru baca panduan sambil lihat kode—sering itu yang bikin "oh, ternyata gitu"-nya muncul.
