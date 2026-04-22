-- =============================================================================
-- Tabel: mahasiswa — Supabase SQL Editor
-- =============================================================================
-- Cara pakai:
--   1. Buka Supabase Dashboard → SQL Editor → New query.
--   2. Tempel seluruh isi file ini → Run.
--
-- Isi kolom selaras dengan data di app (modul.tsx): nim, nama, prodi.
-- Kolom id pakai UUID (standar Postgres/Supabase). Di app nanti id dibaca
-- sebagai string (mis. "a1b2c3d4-...").
-- Kolom kelas disiapkan untuk pengembangan; kalau belum dipakai di app,
-- boleh dikosongkan atau dihapus dari INSERT.
-- =============================================================================

-- Hapus tabel jika sudah ada (hati-hati di production — backup dulu)
-- DROP TABLE IF EXISTS public.mahasiswa;

CREATE TABLE IF NOT EXISTS public.mahasiswa (
  -- Primary key: UUID otomatis saat INSERT (tanpa kirim id dari client)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nomor Induk Mahasiswa — unik per orang
  nim varchar(32) NOT NULL,

  -- Nama lengkap
  nama text NOT NULL,

  -- Program studi
  prodi text NOT NULL,

  -- Kelas (contoh: A, B, 2021-A); boleh NULL jika belum dipakai
  kelas varchar(32),

  -- Waktu dibuat / diubah (Supabase sering pakai ini untuk sinkronisasi)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT mahasiswa_nim_unique UNIQUE (nim)
);

-- Komentar di katalog Postgres (muncul di Table Editor)
COMMENT ON TABLE public.mahasiswa IS 'Data mahasiswa untuk aplikasi mobile (CRUD).';
COMMENT ON COLUMN public.mahasiswa.nim IS 'Nomor Induk Mahasiswa (unik).';
COMMENT ON COLUMN public.mahasiswa.kelas IS 'Kelas / kelompok (opsional).';

-- Index untuk filter/urut berdasarkan nim dan nama
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON public.mahasiswa (nim);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nama ON public.mahasiswa (nama);

-- =============================================================================
-- Trigger: otomatis isi updated_at saat baris di-UPDATE
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mahasiswa_updated_at ON public.mahasiswa;
CREATE TRIGGER trg_mahasiswa_updated_at
  BEFORE UPDATE ON public.mahasiswa
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- Row Level Security (RLS) — WAJIB dipertimbangkan sebelum production
-- =============================================================================
-- Satu policy untuk anon DAN authenticated: setelah login Supabase Auth,
-- request memakai JWT role "authenticated"; sebelum login role "anon".
-- Tanpa "authenticated", tab Cloud tampil kosong walau data ada di tabel.
-- =============================================================================
ALTER TABLE public.mahasiswa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_anon_select_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_anon_insert_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_anon_update_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_anon_delete_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_authenticated_select_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_authenticated_insert_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_authenticated_update_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_authenticated_delete_mahasiswa" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_mahasiswa_select_clients" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_mahasiswa_insert_clients" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_mahasiswa_update_clients" ON public.mahasiswa;
DROP POLICY IF EXISTS "dev_mahasiswa_delete_clients" ON public.mahasiswa;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mahasiswa TO anon, authenticated;

CREATE POLICY "dev_mahasiswa_select_clients"
  ON public.mahasiswa FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "dev_mahasiswa_insert_clients"
  ON public.mahasiswa FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "dev_mahasiswa_update_clients"
  ON public.mahasiswa FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_mahasiswa_delete_clients"
  ON public.mahasiswa FOR DELETE
  TO anon, authenticated
  USING (true);

-- =============================================================================
-- Data awal (opsional) — hapus blok ini jika tidak perlu
-- =============================================================================
INSERT INTO public.mahasiswa (nim, nama, prodi, kelas) VALUES
  ('210001', 'Ahmad Rizki', 'Teknik Informatika', 'A'),
  ('210002', 'Budi Santoso', 'Sistem Informasi', 'B'),
  ('210003', 'Citra Dewi', 'Teknik Informatika', 'A')
ON CONFLICT (nim) DO NOTHING;
