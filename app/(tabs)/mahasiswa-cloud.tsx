/**
 * mahasiswa-cloud.tsx — CRUD tabel public.mahasiswa di Supabase.
 * Route: /(tabs)/mahasiswa-cloud
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type MahasiswaRow = {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  kelas: string | null;
  created_at: string;
  updated_at: string;
};

export default function MahasiswaCloudScreen() {
  const [rows, setRows] = useState<MahasiswaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modeForm, setModeForm] = useState<'tambah' | 'ubah'>('tambah');
  const [editing, setEditing] = useState<MahasiswaRow | null>(null);
  const [formNim, setFormNim] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formProdi, setFormProdi] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [saving, setSaving] = useState(false);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isNarrow = width < 420;
  const padH = Math.max(16, Math.min(24, width * 0.045));

  const loadData = useCallback(async () => {
    if (!supabase) {
      setRows([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError(null);
    /* Pastikan sesi Auth sudah terpasang di klien sebelum query (setelah login). */
    await supabase.auth.getSession();

    const { data, error: qErr } = await supabase
      .from('mahasiswa')
      .select('id,nim,nama,prodi,kelas,created_at,updated_at')
      .order('nim', { ascending: true });

    if (qErr) {
      let msg = qErr.message;
      if (
        qErr.code === '42501' ||
        /permission denied|row-level security|rls/i.test(msg)
      ) {
        msg +=
          '\n\nSetelah login, JWT memakai role "authenticated". Pastikan policy RLS tabel mahasiswa mengizinkan anon dan authenticated (jalankan doc/supabase_mahasiswa_rls_fix_login.sql di SQL Editor).';
      }
      setError(msg);
      setRows([]);
    } else {
      setRows((data as MahasiswaRow[]) ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBukaTambah = () => {
    setModeForm('tambah');
    setEditing(null);
    setFormNim('');
    setFormNama('');
    setFormProdi('');
    setFormKelas('');
    setModalVisible(true);
  };

  const handleBukaUbah = (m: MahasiswaRow) => {
    setModeForm('ubah');
    setEditing(m);
    setFormNim(m.nim);
    setFormNama(m.nama);
    setFormProdi(m.prodi);
    setFormKelas(m.kelas ?? '');
    setModalVisible(true);
  };

  const handleTutupModal = () => {
    setModalVisible(false);
    setEditing(null);
    setFormNim('');
    setFormNama('');
    setFormProdi('');
    setFormKelas('');
  };

  const handleSimpan = async () => {
    if (!supabase) return;
    const nim = formNim.trim();
    const nama = formNama.trim();
    const prodi = formProdi.trim();
    const kelasRaw = formKelas.trim();
    if (!nim || !nama || !prodi) {
      Alert.alert('Perhatian', 'NIM, Nama, dan Prodi wajib diisi.');
      return;
    }
    const kelas = kelasRaw.length === 0 ? null : kelasRaw;

    setSaving(true);
    let ok = false;
    try {
      if (modeForm === 'tambah') {
        const { error: insErr } = await supabase.from('mahasiswa').insert({
          nim,
          nama,
          prodi,
          kelas,
        });
        if (insErr) {
          Alert.alert('Gagal menambah', insErr.message);
          return;
        }
      } else {
        if (!editing) return;
        const { error: updErr } = await supabase
          .from('mahasiswa')
          .update({ nim, nama, prodi, kelas })
          .eq('id', editing.id);
        if (updErr) {
          Alert.alert('Gagal mengubah', updErr.message);
          return;
        }
      }
      ok = true;
    } finally {
      setSaving(false);
    }
    if (ok) {
      handleTutupModal();
      setLoading(true);
      await loadData();
    }
  };

  const handleHapus = (m: MahasiswaRow) => {
    const client = supabase;
    if (!client) return;
    Alert.alert('Konfirmasi Hapus', `Yakin hapus ${m.nama} (${m.nim})?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const { error: delErr } = await client.from('mahasiswa').delete().eq('id', m.id);
          if (delErr) {
            Alert.alert('Gagal menghapus', delErr.message);
            return;
          }
          setLoading(true);
          await loadData();
        },
      },
    ]);
  };

  const configured = isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: padH, paddingBottom: 32 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={configured} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Data Mahasiswa (Cloud)</Text>
        <Text style={styles.subtitle}>
          CRUD ke tabel <Text style={styles.mono}>public.mahasiswa</Text> di Supabase
        </Text>

        {!configured ? (
          <Text style={styles.errText}>
            Tambahkan URL dan anon key ke <Text style={styles.mono}>.env</Text>, lalu restart Expo.
          </Text>
        ) : null}

        {configured && !loading ? (
          <Pressable
            style={({ pressed }) => [styles.btnTambah, pressed && styles.btnPressed]}
            onPress={handleBukaTambah}>
            <Text style={styles.btnTambahText}>+ Tambah Mahasiswa</Text>
          </Pressable>
        ) : null}

        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.muted}>Memuat data…</Text>
          </View>
        ) : null}

        {error && configured ? <Text style={styles.errText}>{error}</Text> : null}

        {!loading && configured && !error ? (
          <Text style={styles.count}>Total {rows.length} mahasiswa</Text>
        ) : null}

        {!loading && configured && !error && rows.length === 0 ? (
          <Text style={styles.muted}>
            Belum ada data. Tap &quot;+ Tambah Mahasiswa&quot; atau tambah lewat Table Editor.
          </Text>
        ) : null}

        {!loading && configured && !error && rows.length > 0 && isNarrow ? (
          <View style={styles.cardList}>
            {rows.map((m, index) => (
              <View key={m.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>No</Text>
                  <Text style={styles.cardValue}>{index + 1}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>NIM</Text>
                  <Text style={styles.cardValue}>{m.nim}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Nama</Text>
                  <Text style={[styles.cardValue, styles.cardValueBold]}>{m.nama}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Prodi</Text>
                  <Text style={styles.cardValue}>{m.prodi}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Kelas</Text>
                  <Text style={styles.cardValue}>{m.kelas ?? '—'}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    style={({ pressed }) => [styles.btnAksi, pressed && styles.btnPressed]}
                    onPress={() => handleBukaUbah(m)}>
                    <Text style={styles.btnAksiText}>Ubah</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.btnAksi,
                      styles.btnHapus,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => handleHapus(m)}>
                    <Text style={styles.btnAksiText}>Hapus</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {!loading && configured && !error && rows.length > 0 && !isNarrow ? (
          <>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.cellNo, styles.headerText]}>No</Text>
              <Text style={[styles.cell, styles.cellNim, styles.headerText]}>NIM</Text>
              <Text style={[styles.cell, styles.cellNama, styles.headerText]}>Nama</Text>
              <Text style={[styles.cell, styles.cellProdi, styles.headerText]}>Prodi</Text>
              <Text style={[styles.cell, styles.cellKelas, styles.headerText]}>Kelas</Text>
              <Text style={[styles.cell, styles.cellAksi, styles.headerText]}>Aksi</Text>
            </View>
            {rows.map((m, index) => (
              <View key={m.id} style={styles.row}>
                <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.cellNim]}>{m.nim}</Text>
                <Text style={[styles.cell, styles.cellNama]}>{m.nama}</Text>
                <Text style={[styles.cell, styles.cellProdi]}>{m.prodi}</Text>
                <Text style={[styles.cell, styles.cellKelas]}>{m.kelas ?? '—'}</Text>
                <View style={styles.cellAksi}>
                  <Pressable
                    style={({ pressed }) => [styles.btnAksiSm, pressed && styles.btnPressed]}
                    onPress={() => handleBukaUbah(m)}>
                    <Text style={styles.btnAksiTextSm}>Ubah</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.btnAksiSm,
                      styles.btnHapus,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => handleHapus(m)}>
                    <Text style={styles.btnAksiTextSm}>Hapus</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {configured && !loading ? (
          <Pressable
            style={({ pressed }) => [styles.btnRefresh, pressed && styles.btnPressed]}
            onPress={onRefresh}>
            <Text style={styles.btnRefreshText}>Muat ulang</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saving) handleTutupModal();
        }}>
        <Pressable
          style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
          onPress={() => {
            if (!saving) handleTutupModal();
          }}>
          <Pressable
            style={[styles.modalBox, { width: width * 0.92, maxWidth: 400 }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {modeForm === 'tambah' ? 'Tambah Mahasiswa' : 'Ubah Mahasiswa'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="NIM"
              value={formNim}
              onChangeText={setFormNim}
              editable={modeForm === 'tambah' && !saving}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Nama"
              value={formNama}
              onChangeText={setFormNama}
              editable={!saving}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Prodi"
              value={formProdi}
              onChangeText={setFormProdi}
              editable={!saving}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Kelas (opsional)"
              value={formKelas}
              onChangeText={setFormKelas}
              editable={!saving}
              placeholderTextColor="#999"
            />
            {saving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator color="#0a7ea4" />
                <Text style={styles.muted}>Menyimpan…</Text>
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.btnModal,
                  styles.btnBatal,
                  pressed && styles.btnPressed,
                  saving && styles.btnDisabled,
                ]}
                onPress={handleTutupModal}
                disabled={saving}>
                <Text style={styles.btnBatalText}>Batal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.btnModal,
                  styles.btnSimpan,
                  pressed && styles.btnPressed,
                  saving && styles.btnDisabled,
                ]}
                onPress={handleSimpan}
                disabled={saving}>
                <Text style={styles.btnSimpanText}>Simpan</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flex: 1 },
  content: { paddingTop: 20, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#5c5c5c', marginBottom: 16 },
  mono: { fontFamily: 'monospace', fontSize: 14, color: '#333' },
  count: { fontSize: 14, color: '#333', marginBottom: 14, fontWeight: '500' },
  muted: { fontSize: 15, color: '#666', marginTop: 8 },
  errText: { fontSize: 15, color: '#b71c1c', marginBottom: 12, lineHeight: 22 },
  centerBox: { paddingVertical: 32, alignItems: 'center', gap: 12 },
  btnTambah: {
    alignSelf: 'flex-start',
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnTambahText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnPressed: { opacity: 0.85 },
  cardList: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel: { fontSize: 13, color: '#6c6c6c', flex: 0.4 },
  cardValue: { fontSize: 14, color: '#1a1a1a', flex: 0.6, textAlign: 'right' },
  cardValueBold: { fontWeight: '600' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerRow: {
    backgroundColor: '#0a7ea4',
    borderBottomColor: '#086890',
    paddingVertical: 12,
  },
  headerText: { color: '#fff', fontWeight: 'bold' },
  cell: { fontSize: 12, color: '#333' },
  cellNo: { width: 28, textAlign: 'center' },
  cellNim: { width: 56 },
  cellNama: { flex: 1, minWidth: 56 },
  cellProdi: { width: 88 },
  cellKelas: { width: 40, textAlign: 'center' },
  cellAksi: { width: 108, flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  btnAksi: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAksiSm: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnHapus: { backgroundColor: '#c62828' },
  btnAksiText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnAksiTextSm: { color: '#fff', fontSize: 11, fontWeight: '600' },
  btnRefresh: {
    alignSelf: 'flex-start',
    marginTop: 20,
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnRefreshText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnBatal: { backgroundColor: '#e0e0e0' },
  btnBatalText: { color: '#333', fontWeight: '600' },
  btnSimpan: { backgroundColor: '#0a7ea4' },
  btnSimpanText: { color: '#fff', fontWeight: '600' },
  btnDisabled: { opacity: 0.55 },
});
