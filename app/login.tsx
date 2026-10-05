import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Button } from '../components/Button';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { colors, radius } from '../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setNote({ text: 'Enter your email and password.', error: true });
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setNote({ text: 'Supabase isn\u2019t configured yet \u2014 check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.', error: true });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setNote({ text: error.message, error: true });
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Welcome back</Text>
        <Text style={styles.h1}>Log in to Pitch</Text>

        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.fieldLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.inkFaint}
          secureTextEntry
        />

        <Button label="Log in" onPress={handleLogin} loading={loading} />
        {note && <Text style={[styles.note, note.error && styles.noteError]}>{note.text}</Text>}

        <Link href="/signup" style={styles.switchLink}>
          Don't have an account? <Text style={styles.switchLinkStrong}>Sign up</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  content: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingTop: 32, paddingBottom: 32 },
  eyebrow: { color: colors.accent, fontWeight: '600', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  h1: { color: colors.ink, fontSize: 26, fontWeight: '700', marginBottom: 24 },
  fieldLabel: { color: colors.inkSoft, fontWeight: '600', fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    minHeight: 50,
    marginBottom: 16,
    color: colors.ink,
    backgroundColor: colors.bgPanel,
    fontSize: 15,
  },
  note: { color: colors.inkFaint, marginTop: 8, textAlign: 'center' },
  noteError: { color: colors.coral },
  switchLink: { color: colors.inkSoft, marginTop: 20, textAlign: 'center' },
  switchLinkStrong: { color: colors.accent, fontWeight: '600' },
});
