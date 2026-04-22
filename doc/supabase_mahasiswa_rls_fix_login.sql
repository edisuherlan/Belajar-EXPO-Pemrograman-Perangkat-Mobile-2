-- =============================================================================
-- Perbaikan RLS setelah Supabase Auth (tab Cloud kosong padahal ada data)
-- =============================================================================
-- Penyebab: JWT user yang login punya role "authenticated", bukan "anon".
-- Policy lama hanya TO anon → SELECT dianggap tanpa hak → 0 baris.
--
-- Cara pakai: SQL Editor → tempel → Run (aman di-run berulang).
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
