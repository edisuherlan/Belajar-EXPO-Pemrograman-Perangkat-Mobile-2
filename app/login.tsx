/**
 * login.tsx — Login dengan Supabase Auth (email + password).
 * Tanpa konfigurasi .env: mode demo (Masuk tanpa server).
 */

import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleMasuk = async () => {
    setError(null);
    if (!configured || !supabase) {
      router.replace('/(tabs)');
      return;
    }

    const e = email.trim();
    if (!e || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: e,
      password,
    });
    setLoading(false);

    if (signErr) {
      setError(signErr.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>Selamat Datang</Text>
            <Text style={styles.subtitle}>
              {configured
                ? 'Masuk dengan akun Supabase (email terdaftar di Authentication).'
                : 'Supabase belum dikonfigurasi — Masuk untuk demo lokal.'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={configured ? 'Email' : 'Email (opsional, demo)'}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder={configured ? 'Password' : 'Password (opsional, demo)'}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {error ? <Text style={styles.errText}>{error}</Text> : null}

            {!configured ? (
              <Text style={styles.hint}>
                Untuk login sungguhan: isi <Text style={styles.mono}>EXPO_PUBLIC_SUPABASE_URL</Text> dan{' '}
                <Text style={styles.mono}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text> di <Text style={styles.mono}>.env</Text>,
                lalu buat user di Supabase → Authentication → Users.
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.btnMasuk,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
              onPress={handleMasuk}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnMasukText}>Masuk</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e8ecf0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c6c6c',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  errText: {
    color: '#b71c1c',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  btnMasuk: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnMasukText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
