import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { API_URL } from '../../lib/config';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/useSession';
import { colors, radius, shadow } from '../../theme/colors';

export default function SettingsScreen() {
  const { session, loading } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace('/login');
  }, [loading, session]);

  if (loading || !session) return null;

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    router.replace('/(tabs)');
  }

  function confirmDelete() {
    setError(null);
    setConfirmingDelete(true);
  }

  async function handleDelete() {
    if (!supabase || !session) return;
    setConfirmingDelete(false);
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/account/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result: { error?: string; deleted?: boolean } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? 'Account deletion failed.');
        return;
      }
      await supabase.auth.signOut();
      router.replace('/(tabs)');
    } catch {
      setError('Could not reach the server to delete your account.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.h1}>Settings</Text>

        <View style={styles.panel}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{session?.user.user_metadata?.full_name ?? '—'}</Text>
          <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
          <Text style={styles.value}>{session?.user.email ?? '—'}</Text>
        </View>

        <Button label="Log out" variant="ghost" onPress={handleLogout} />

        <View style={styles.dangerPanel}>
          <Text style={styles.dangerLabel}>Danger zone</Text>
          <Text style={styles.dangerCopy}>
            Deleting your account permanently removes your access and cannot be undone.
          </Text>
          <Button label="Delete account" variant="danger" onPress={confirmDelete} loading={deleting} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <Modal
        visible={confirmingDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmingDelete(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmation}>
            <Text style={styles.confirmationTitle}>Delete your account?</Text>
            <Text style={styles.confirmationCopy}>
              This action cannot be undone. Your account will be permanently deleted.
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmingDelete(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: deleting }}
                disabled={deleting}
                onPress={handleDelete}
                style={[styles.confirmDeleteButton, deleting && styles.disabledButton]}
              >
                <Text style={styles.confirmDeleteLabel}>
                  {deleting ? 'Deleting…' : 'Delete account'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingTop: 20, paddingBottom: 40 },
  eyebrow: { color: colors.accent, fontWeight: '600', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  h1: { color: colors.ink, fontSize: 26, fontWeight: '700', marginBottom: 20 },
  panel: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    ...shadow.panel,
  },
  label: { color: colors.inkSoft, fontWeight: '600', fontSize: 12, textTransform: 'uppercase' },
  value: { color: colors.ink, fontSize: 16, marginTop: 2 },
  dangerPanel: {
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 8,
  },
  dangerLabel: { color: colors.coral, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  dangerCopy: { color: colors.inkSoft, fontSize: 13, marginBottom: 12 },
  error: { color: colors.coral, marginTop: 12, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  confirmation: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: 20,
  },
  confirmationTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  confirmationCopy: { color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
  confirmationActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelButton: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
  cancelLabel: { color: colors.inkSoft, fontWeight: '600' },
  confirmDeleteButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.coral,
  },
  confirmDeleteLabel: { color: colors.white, fontWeight: '700' },
  disabledButton: { opacity: 0.6 },
});
