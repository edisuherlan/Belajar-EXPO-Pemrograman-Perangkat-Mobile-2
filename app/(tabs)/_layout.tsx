/**
 * =============================================================================
 * _layout.tsx (di dalam folder (tabs)) — Layout Tab Bar
 * =============================================================================
 *
 * File ini mendefinisikan LAYOUT untuk tab navigator: bar tab di bawah layar
 * dengan beberapa tab (Home, Explore, Praktikum, Modul). Setiap tab
 * menampilkan satu screen sesuai nama file di folder ini: index.tsx, explore.tsx,
 * praktikum.tsx, modul.tsx.
 *
 * Istilah penting:
 *   • _layout = file khusus Expo Router untuk layout, bukan halaman yang punya
 *     URL sendiri. Underscore di depan = "file layout".
 *   • (tabs) = route group. Tanda kurung bikin folder ini satu "grup" di router;
 *     URL-nya tetep /(tabs) atau sesuai konfigurasi, nama "(tabs)" enggak
 *     harus keluar di alamat.
 *
 * ----- Isi file -----
 * 1. Import: Tabs dari expo-router, HapticTab (getar halus), IconSymbol, Colors,
 *    useColorScheme.
 * 2. TabLayout: komponen yang me-render <Tabs> dan tiap <Tabs.Screen>.
 *    name di Screen harus sama dengan nama file .tsx (tanpa .tsx) di folder (tabs).
 * =============================================================================
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * TabLayout — Komponen yang bikin tab bar dan konfigurasi tiap tab.
 * =============================================================================
 * useColorScheme() = deteksi tema HP (terang/gelap). Dipakai di screenOptions
 * biar warna tab yang aktif (tabBarActiveTintColor) ikut tema. colorScheme ?? 'light'
 * = kalau null/undefined, pakai 'light'.
 * =============================================================================
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    /*
      Tabs = navigator yang punya beberapa "tab" (tab di bawah layar).
      Setiap Tabs.Screen = satu tab. Properti "name" HARUS sama dengan nama
      file .tsx di folder (tabs): name="modul" → file modul.tsx harus ada.
      screenOptions dipakai oleh semua tab: warna aktif, sembunyikan header,
      dan tabBarButton pakai HapticTab biar pas tap ada getar halus.
    */
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      {/* TAB 1: Home — name="index" artinya file index.tsx. index = halaman
          default waktu user buka grup (tabs). title = teks di bawah ikon. */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* TAB 2: Explore — name="explore" → file explore.tsx. tabBarIcon dapat
          color dari sistem (warna tab aktif/tidak). */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />

      {/* TAB 3: Praktikum — name="praktikum" → file praktikum.tsx. */}
      <Tabs.Screen
        name="praktikum"
        options={{
          title: 'Praktikum',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="graduationcap.fill" color={color} />,
        }}
      />

      {/* TAB 4: Modul — name="modul" → file modul.tsx. */}
      <Tabs.Screen
        name="modul"
        options={{
          title: 'Modul',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />

      {/* TAB: CRUD data mahasiswa di Supabase — file mahasiswa-cloud.tsx */}
      <Tabs.Screen
        name="mahasiswa-cloud"
        options={{
          title: 'Cloud',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cloud.fill" color={color} />,
        }}
      />

      {/* TAB 5: Logout — tap → modal konfirmasi "Yakin mau logout?" → Batal / Ya, Logout. */}
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="rectangle.portrait.and.arrow.right" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
