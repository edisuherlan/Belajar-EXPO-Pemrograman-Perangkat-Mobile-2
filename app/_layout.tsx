/**
 * _layout.tsx — Root layout: tema, stack navigasi, dan proteksi rute saat Supabase Auth aktif.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const authEnabled = supabase !== null;
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!authEnabled);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authEnabled || !authReady || !navigationState?.key) return;

    const root = segments[0];
    if (root === 'modal') return;

    if (!session && root === '(tabs)') {
      router.replace('/login');
    } else if (session && root === 'login') {
      router.replace('/(tabs)');
    }
  }, [authEnabled, authReady, session, segments, router, navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {authEnabled && !authReady ? (
          <View style={styles.authOverlay} pointerEvents="auto">
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : null}
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  authOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
