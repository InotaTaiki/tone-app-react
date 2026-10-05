import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Button } from '../components/Button';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { colors, radius } from '../theme/colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);

  async function handleSignup() {
    if (!name || !email || !password || !confirm) {
      setNote({ text: 'Fill in every field.', error: true });
      return;
    }
    if (password.length < 8) {
      setNote({ text: 'Password must be at least 8 characters.', error: true });
      return;
    }
    if (password !== confirm) {
      setNote({ text: "Passwords don't match.", error: true });
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setNote({ text: 'Supabase isn\u2019t configured yet \u2014 check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.', error: true });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);

    if (error) {
      setNote({ text: error.message, error: true });
      return;
    }

    if (!data.session) {
      setNote({ text: 'Almost there — check your email to confirm your account, then log in.', error: false });
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
        <Text style={styles.eyebrow}>Get started</Text>
        <Text style={styles.h1}>Create your account</Text>

        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.inkFaint} />

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
          placeholder="At least 8 characters"
          placeholderTextColor={colors.inkFaint}
          secureTextEntry
        />

        <Text style={styles.fieldLabel}>Confirm password</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="••••••••"
          placeholderTextColor={colors.inkFaint}
          secureTextEntry
        />

        <Button label="Create account" onPress={handleSignup} loading={loading} />
        {note && <Text style={[styles.note, note.error && styles.noteError]}>{note.text}</Text>}

        <Link href="/login" style={styles.switchLink}>
          Already have an account? <Text style={styles.switchLinkStrong}>Log in</Text>
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
