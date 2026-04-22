# Panduan Perubahan: Login Supabase Auth, Proteksi Rute, dan CRUD Cloud + RLS

Dokumen ini menjelaskan **secara terstruktur** perubahan pada project praktikum Expo yang menghubungkan **halaman login** ke **Supabase Authentication**, menambahkan **proteksi navigasi** berbasis sesi, memperbarui **tab Cloud** (CRUD + kompatibilitas setelah login), serta penyesuaian **basis data (RLS)**. Dokumen ini cocok dipakai dosen atau mahasiswa sebagai **panduan teknis** setelah `git pull` atau clone repo terbaru.

---

## Daftar isi

1. [Ringkasan eksekutif](#1-ringkasan-eksekutif)
2. [Latar belakang masalah](#2-latar-belakang-masalah)
3. [Arsitektur solusi (gambaran alur)](#3-arsitektur-solusi-gambaran-alur)
4. [Perubahan per file](#4-perubahan-per-file)
5. [Dependensi baru](#5-dependensi-baru)
6. [Panduan langkah demi langkah (untuk tim / mahasiswa)](#6-panduan-langkah-demi-langkah-untuk-tim--mahasiswa)
7. [Basis data: SQL yang harus dijalankan](#7-basis-data-sql-yang-harus-dijalankan)
8. [Uji coba (checklist)](#8-uji-coba-checklist)
9. [Gangguan umum dan solusi](#9-gangguan-umum-dan-solusi)
10. [Referensi cepat file](#10-referensi-cepat-file)

---

## 1. Ringkasan eksekutif

| Area | Sebelum | Sesudah |
|------|---------|---------|
| **Login** | Demo: isian bebas, tap Masuk → tab utama tanpa validasi server | Jika **`.env`** berisi URL + anon key: **`signInWithPassword`** ke Supabase Auth; jika tidak: perilaku **demo** tetap ada |
| **Sesi** | Tidak disimpan (`persistSession: false`) | Sesi disimpan di **`AsyncStorage`**, token di-refresh otomatis |
| **Navigasi** | Bebas pindah ke tab setelah Masuk | Jika Supabase aktif: **tanpa sesi** tidak bisa tetap di tab; **dengan sesi** tidak tertahan di layar login |
| **Logout** | Hanya `router.replace('/login')` | **`auth.signOut()`** lalu ke login |
| **Tab Cloud** | CRUD ke tabel `mahasiswa` | Sama, ditambah **`getSession()`** sebelum query + pesan bantuan jika error RLS; **RLS** harus mengizinkan role **`authenticated`** |
| **Dokumen SQL** | Policy terpisah anon / authenticated | Policy **gabungan** `TO anon, authenticated` + file **`supabase_mahasiswa_rls_fix_login.sql`** untuk proyek lama |

---

## 2. Latar belakang masalah

### 2.1 Kebutuhan pembelajaran

Mata kuliah memerlukan contoh **login nyata** ke backend cloud agar mahasiswa memahami:

- Alur **email + password** dan respons error dari server.
- Konsep **sesi** dan **token** pada aplikasi mobile.
- Hubungan antara **JWT pengguna** dan **hak akses ke tabel** (RLS).

### 2.2 Masalah teknis setelah login diaktifkan

Supabase mengirim permintaan ke PostgREST dengan **role JWT** sesuai konteks:

- **Tidak login** (atau klien tanpa sesi user): role **`anon`**.
- **Sudah login** lewat Supabase Auth: role **`authenticated`**.

Policy RLS yang hanya **`TO anon`** membuat query **`SELECT`** ke `public.mahasiswa` dari pengguna terautentikasi **tidak memenuhi policy** → hasilnya sering **0 baris** tanpa pesan error yang jelas di UI. Oleh karena itu policy diperbarui agar **anon dan authenticated** sama-sama diizinkan (mode pembelajaran).

---

## 3. Arsitektur solusi (gambaran alur)

```
[Aplikasi start]
      │
      ▼
┌─────────────────┐     tidak ada URL/key di .env
│ lib/supabase.ts │──────────────────────────────► mode demo (tanpa Auth gate ketat)
│ createClient    │
└────────┬────────┘
         │ ada URL + anon key
         ▼
┌─────────────────┐     getSession() dari AsyncStorage
│ app/_layout.tsx │◄──── onAuthStateChange (login/logout)
│ Auth + Stack    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 login    (tabs)
    │         │
    │         ├── mahasiswa-cloud.tsx → REST + JWT (authenticated)
    │         └── logout → signOut → login
    ▼
signInWithPassword (email, password)
```

**Ringkas:** Satu klien `supabase` dipakai untuk **Auth** dan **data**. Setelah login, JWT user melekat pada klien; query ke `mahasiswa` harus diizinkan RLS untuk role **`authenticated`**.

---

## 4. Perubahan per file

### 4.1 `lib/supabase.ts`

- Import **`AsyncStorage`** dari `@react-native-async-storage/async-storage`.
- Opsi klien: **`storage: AsyncStorage`**, **`persistSession: true`**, **`autoRefreshToken: true`**, **`detectSessionInUrl: false`** (penting untuk React Native, bukan web redirect).
- **Tujuan:** Sesi login bertahan setelah aplikasi ditutup; token diperbarui sebelum kedaluwarsa.

### 4.2 `app/login.tsx`

- Jika **`isSupabaseConfigured()`** benar: validasi email/password tidak kosong → **`supabase.auth.signInWithPassword({ email, password })`**.
- Sukses → **`router.replace('/(tabs)')`**.
- Gagal → tampilkan **`error.message`** di layar (bukan silent fail).
- **Loading** pada tombol Masuk (`ActivityIndicator`) selama request.
- Jika Supabase **tidak** terkonfigurasi: subtitle dan perilaku **demo** (Masuk tanpa server), konsisten untuk lingkungan tanpa `.env`.

### 4.3 `app/_layout.tsx`

- State: **`session`**, **`authReady`**.
- **`supabase.auth.getSession()`** saat mount → set sesi awal, lalu **`authReady = true`**.
- **`onAuthStateChange`**: memperbarui **`session`** saat login/logout/refresh.
- **Efek navigasi** (hanya jika klien Supabase ada dan `authReady`):
  - Segment root **`(tabs)`** tanpa sesi → **`router.replace('/login')`**.
  - Segment **`login`** dengan sesi aktif → **`router.replace('/(tabs)')`**.
- **Overlay** loading hingga `getSession` selesai (menghindari kedipan salah rute).
- **`useRootNavigationState`** dipakai agar redirect tidak jalan sebelum navigator siap.

### 4.4 `app/(tabs)/logout.tsx`

- Import **`supabase`**.
- Pada konfirmasi "Ya, Logout": **`await supabase.auth.signOut()`** (jika klien ada), kemudian **`router.replace('/login')`**.
- **Tujuan:** Sesi server dan storage lokal bersih; guard di root layout tidak mengembalikan user ke tab.

### 4.5 `app/(tabs)/mahasiswa-cloud.tsx`

- Sebelum **`from('mahasiswa').select(...)`**: **`await supabase.auth.getSession()`** agar header Authorization konsisten setelah transisi dari login.
- Jika error query mengindikasikan **hak akses / RLS** (kode `42501` atau teks tertentu), **append** teks bantuan yang menunjuk ke **`doc/supabase_mahasiswa_rls_fix_login.sql`**.
- (Fitur CRUD Cloud dari iterasi sebelumnya tetap: insert, update, delete, modal form.)

### 4.6 `app/(tabs)/_layout.tsx`

- Komentar tab Cloud diperbarui (bukan lagi hanya read-only).

### 4.7 `doc/supabase_mahasiswa.sql`

- **DROP POLICY IF EXISTS** untuk nama policy lama (anon terpisah + authenticated terpisah + nama unified).
- **`GRANT SELECT, INSERT, UPDATE, DELETE`** pada `public.mahasiswa` untuk **`anon`** dan **`authenticated`**.
- Empat policy baru dengan nama `dev_mahasiswa_*_clients`, masing-masing **`TO anon, authenticated`**.

### 4.8 `doc/supabase_mahasiswa_rls_fix_login.sql` (file baru)

- Skrip **mandiri** untuk database yang sudah punya tabel `mahasiswa` tetapi policy lama hanya `anon`.
- Dapat dijalankan berulang (**idempotent** lewat `DROP POLICY IF EXISTS`).

### 4.9 `.env.example`

- Bagian penjelasan **Login / Auth**: membuat user di Dashboard, mengingatkan skrip RLS jika Cloud kosong setelah login.

### 4.10 `README.md`

- Bab khusus **Login dengan Supabase Auth**, tabel file, setup user, RLS, dan sinkronisasi deskripsi tab Cloud (CRUD).

### 4.11 `package.json` / `package-lock.json`

- Dependensi: **`@react-native-async-storage/async-storage`** (disarankan instal dengan **`npx expo install @react-native-async-storage/async-storage`** agar versi cocok dengan SDK Expo).

---

## 5. Dependensi baru

| Paket | Fungsi |
|-------|--------|
| `@react-native-async-storage/async-storage` | Penyimpanan persisten sesi Supabase Auth di perangkat |

Setelah `git pull`, jalankan:

```bash
npm install
```

atau, jika baris dependency belum sinkron:

```bash
npx expo install @react-native-async-storage/async-storage
```

### Yang *tidak* perlu dilakukan (kode)

- **Tidak** menambah plugin Babel, mengubah `babel.config.js` khusus AsyncStorage/Auth, atau menambah plugin di **`app.json` / `app.config.*`** untuk fitur login ini — tidak diperlukan oleh project ini.
- **Tidak** perlu meng-import AsyncStorage di root `App` atau file global lain; cukup pemakaian di **`lib/supabase.ts`** seperti yang sudah ada.

### Expo Go vs development build

| Cara menjalankan | Catatan singkat |
|------------------|------------------|
| **Expo Go** (pindai QR dari `npm start`) | Setelah `npm install`, umumnya cukup. Alur yang disarankan untuk praktikum. |
| **Development build** / APK-IPA sendiri (`expo prebuild`, EAS Build, `expo run:*`) | Setelah `git pull` menarik dependency **native** baru, ikuti pesan CLI: sering perlu **build ulang** binary agar modul seperti AsyncStorage ter-link dengan benar. |

---

## 6. Panduan langkah demi langkah (untuk tim / mahasiswa)

Ikuti urutan ini saat pertama kali menyelaraskan project lokal dengan perubahan terbaru.

### Langkah A — Ambil kode terbaru

```bash
git pull origin main
```

### Langkah B — Pasang dependency

```bash
cd <folder-project>
npm install
```

Pastikan tidak ada error terkait `async-storage`.

### Langkah C — Konfigurasi `.env`

1. Salin **`.env.example`** → **`.env`** (jika belum ada).
2. Isi **`EXPO_PUBLIC_SUPABASE_URL`** dan **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** dari Supabase Dashboard (**Settings → API**).
3. **Jangan** commit `.env` ke Git.

### Langkah D — Basis data dan RLS

1. Buka Supabase → **SQL Editor**.
2. Jika tabel **`mahasiswa`** belum ada: jalankan seluruh **`doc/supabase_mahasiswa.sql`**.
3. Jika tabel **sudah ada** dari skrip lama dan tab Cloud kosong setelah login: jalankan **`doc/supabase_mahasiswa_rls_fix_login.sql`**.
4. Verifikasi di **Table Editor**: ada data contoh (opsional) dan kolom sesuai skema.

### Langkah E — Buat pengguna Auth

1. Supabase → **Authentication** → **Users** → **Add user**.
2. Gunakan **email** dan **password** yang akan dipakai di aplikasi.

### Langkah F — Jalankan aplikasi

```bash
npm start
```

Setelah mengubah `.env`, **restart** Metro (hentikan lalu `npm start` lagi).

### Langkah G — Uji alur lengkap

Lanjut ke [bagian 8](#8-uji-coba-checklist).

---

## 7. Basis data: SQL yang harus dijalankan

| File | Kapan dipakai |
|------|----------------|
| **`doc/supabase_mahasiswa.sql`** | Setup awal project / fresh database: tabel, trigger, RLS policy **anon + authenticated**, data contoh. |
| **`doc/supabase_mahasiswa_rls_fix_login.sql`** | Database sudah ada tetapi Cloud kosong **setelah login**; atau setelah upgrade dari skrip policy hanya `anon`. |

**Prinsip:** JWT user yang login = role **`authenticated`**. Policy **`TO anon` saja** tidak cukup untuk query dari app dalam keadaan sudah login.

---

## 8. Uji coba (checklist)

Gunakan daftar ini untuk memastikan integrasi berhasil.

- [ ] **A1** — App terbuka di layar **Login** terlebih dahulu.
- [ ] **A2** — Tanpa `.env`, tombol **Masuk** (demo) membuka tab utama.
- [ ] **A3** — Dengan `.env`, kredensial **salah** menampilkan pesan error.
- [ ] **A4** — Dengan `.env`, kredensial **benar** masuk ke tab utama.
- [ ] **A5** — Tutup app sepenuhnya, buka lagi: **masih di tab utama** (sesi tersimpan) atau sesuai harapan RLS/sesi.
- [ ] **A6** — Tab **Cloud** menampilkan baris data (bukan kosong diam-diam) setelah login.
- [ ] **A7** — **Tambah / ubah / hapus** di Cloud tersimpan (cek Table Editor).
- [ ] **A8** — **Logout** → kembali login; percobaan akses tab tanpa login harus dialihkan ke login.

---

## 9. Gangguan umum dan solusi

| Gejala | Penyebab yang mungkin | Tindakan |
|--------|----------------------|----------|
| Cloud **kosong** setelah login, tanpa error SQL di UI | RLS tidak mengizinkan **`authenticated`** | Jalankan **`doc/supabase_mahasiswa_rls_fix_login.sql`** |
| **Invalid login credentials** | Email/password salah atau user belum dibuat | Buat user di **Authentication → Users** |
| **Network request failed** | URL salah, tidak ada internet, project Supabase sleep | Cek URL, jaringan, buka dashboard project |
| Login selalu demo | Variabel **`EXPO_PUBLIC_*`** tidak terbaca | Pastikan `.env` ada, nilai benar, **restart** Metro |
| Error modul `AsyncStorage` | Dependency belum terpasang | `npm install` / `npx expo install @react-native-async-storage/async-storage` |
| Error modul `AsyncStorage` di **dev build** lama | Binary tidak berisi native module versi terbaru | `git pull` → `npm install` → **build ulang** dev client (`expo run:android` / `run:ios` atau EAS) |
| Loop redirect atau layar putih | Navigator belum siap | Sudah ditangani dengan `useRootNavigationState` + `authReady`; pastikan pakai commit terbaru |

---

## 10. Referensi cepat file

| Topik | Lokasi |
|-------|--------|
| Klien Supabase + storage sesi | `lib/supabase.ts` |
| Form login + `signInWithPassword` | `app/login.tsx` |
| Guard sesi + Stack root | `app/_layout.tsx` |
| Sign out | `app/(tabs)/logout.tsx` |
| CRUD Cloud + getSession + pesan RLS | `app/(tabs)/mahasiswa-cloud.tsx` |
| SQL skema + RLS unified | `doc/supabase_mahasiswa.sql` |
| SQL patch RLS pasca-login | `doc/supabase_mahasiswa_rls_fix_login.sql` |
| Ringkasan untuk GitHub | `README.md` |
| Contoh variabel lingkungan | `.env.example` |

---

## Penutup

Perubahan ini menyatukan **pengalaman login** dengan **Supabase Auth**, **persistensi sesi** yang layak untuk mobile, **keamanan navigasi** dasar di sisi klien, dan **kebijakan RLS** yang selaras dengan JWT setelah login. Untuk produksi, tim pengembang harus mengganti policy longgar dengan aturan berbasis **`auth.uid()`** atau peran aplikasi yang disetujui stakeholder keamanan.

*Dokumen ini menggambarkan state teknis project pada iterasi yang memuat fitur login Supabase, proteksi rute, perbaikan RLS Cloud, dan dokumentasi terkait.*
