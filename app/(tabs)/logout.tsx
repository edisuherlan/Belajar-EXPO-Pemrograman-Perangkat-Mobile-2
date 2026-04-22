/**
 * =============================================================================
 * logout.tsx — Tab Logout (Konfirmasi sebelum keluar)
 * =============================================================================
 *
 * Ini halaman yang tampil waktu user tap tab "Logout" di bar bawah. Bedanya sama
 * tab lain: di sini kita enggak nampilin konten banyak-banyak. Langsung aja
 * keluar dialog tanya: "Yakin mau logout?" — biar user enggak ke-logout
 * gegara salah pencet.
 *
 * Alurnya simpel:
 *   • User tap tab Logout → layar ini dapat fokus → dialog muncul.
 *   • User pilih "Batal" → kita panggil router.back(), balik ke tab yang tadi.
 *   • User pilih "Ya, Logout" → router.replace('/login'), keluar ke halaman login.
 *   • Kalau user tap di luar dialog (di Android) → onDismiss jalan, kita back juga.
 *
 * Kenapa pakai useFocusEffect? Soalnya setiap kali tab ini "kefokus" (user
 * tap tab Logout), kita mau dialog keluar. Kalau pakai useEffect doang, bisa
 * cuma jalan sekali pas mount; useFocusEffect jalan tiap kali layar ini
 * jadi fokus, jadi pas user tap tab Logout lagi nanti dialog keluar lagi.
 *
 * ----- Struktur file -----
 * 1. Import: useFocusEffect, router, useCallback, Alert, StyleSheet, Text, View.
 * 2. LogoutScreen: useFocusEffect + Alert di dalamnya, terus return tampilan
 *    sementara (tulisan "Memuat…") karena dialog langsung nutup layar.
 * 3. styles: buat container & teks.
 * =============================================================================
 */

/* ----- useFocusEffect: jalanin efek tiap kali layar ini dapat fokus -----
   Dari @react-navigation/native. Bedanya sama useEffect: useEffect jalan
   pas component mount (sekali). useFocusEffect jalan tiap kali user
   "masuk" ke layar ini (misal tap tab Logout). Cocok buat nampilin
   dialog konfirmasi tiap kali user buka tab ini. */
import { useFocusEffect } from '@react-navigation/native';
/* router: buat pindah halaman (back ke tab sebelumnya atau ke /login). */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * LogoutScreen — Satu-satunya job: tampilin dialog konfirmasi, terus
 * navigasi sesuai pilihan user (Batal = back, Ya = ke login).
 */
export default function LogoutScreen() {
  /*
    useFocusEffect(useCallback(() => { ... }, []))
    — useCallback bikin fungsi kita "stabil" (referensi enggak berubah tiap render),
      jadi React enggak ngerun efek berkali-kali tanpa perlu. Dependency [] = kosong
      artinya fungsi ini cuma dibikin sekali.
    — Isi efek: panggil Alert.alert(...). Alert = dialog native (bukan Modal
      custom); tampil di atas layar, gaya sistem (iOS/Android).
  */
  useFocusEffect(
    useCallback(() => {
      Alert.alert(
        /* Judul dialog. */
        'Yakin mau logout?',
        /* Pesan tambahan di bawah judul. */
        'Kamu akan kembali ke halaman login.',
        /* Array tombol. Urutan: Batal dulu (biasanya kiri), Ya dulu (kanan). */
        [
          {
            text: 'Batal',
            style: 'cancel', /* Gaya "batal" (biasanya tidak bold). */
            onPress: () => router.back(), /* Kembali ke tab sebelumnya. */
          },
          {
            text: 'Ya, Logout',
            style: 'destructive', /* Bisa tampil merah (tindakan "berbahaya"). */
            onPress: async () => {
              if (supabase) {
                await supabase.auth.signOut();
              }
              router.replace('/login');
            },
          },
        ],
        /* Opsi: cancelable = true = user bisa nutup dialog dengan tap di luar (Android).
           onDismiss = jalan kalau dialog ditutup tanpa pilih tombol (misal tap luar);
           kita tetap back biar user enggak nangkring di layar logout. */
        { cancelable: true, onDismiss: () => router.back() }
      );
    }, [])
  );

  /*
    Return: tampilan sementara waktu dialog belum/sudah ditutup.
    Karena dialog (Alert) langsung muncul, user hampir enggak sempat liat
    ini. Tapi kita tetep kasih View + Text biar layar enggak kosong dan
    React punya sesuatu buat di-render. Bisa aja nanti diganti loading
    spinner kalau mau.
  */
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Memuat…</Text>
    </View>
  );
}

/* =============================================================================
   STYLE — Tampilan layar sementara (container + teks)
   =============================================================================
   container: full screen (flex: 1), isi di tengah (justifyContent & alignItems
   center), background abu-abu muda biar enggak silau.
   text: ukuran 16, warna abu. "Memuat…" cuma placeholder; user lebih sering
   liat dialog daripada ini.
   ============================================================================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
