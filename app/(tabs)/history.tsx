import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/useSession';
import { colors, radius, shadow } from '../../theme/colors';

type SavedChat = {
  id: string;
  input_text: string;
  output_text: string;
  tone: string;
  use_case: string | null;
  created_at: string;
};

export default function HistoryScreen() {
  const { session, loading: sessionLoading } = useSession();
  const [chats, setChats] = useState<SavedChat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error: fetchError } = await supabase
      .from('saved_chats')
      .select('id, input_text, output_text, tone, use_case, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(
        fetchError.code === 'PGRST205' || fetchError.code === '42P01'
          ? 'Saved chats are not set up yet — run supabase_saved_chats.sql in your Supabase SQL Editor.'
          : fetchError.code === '42501'
            ? 'Saved chats are blocked by database permissions (check row-level security policies).'
            : 'Could not load saved chats. Pull to refresh.',
      );
      return;
    }
    setError(null);
    setChats(data as SavedChat[]);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDelete(id: string) {
    if (!supabase) return;
    setChats((prev) => prev?.filter((c) => c.id !== id) ?? prev);
    await supabase.from('saved_chats').delete().eq('id', id);
  }

  if (!sessionLoading && !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Log in to see your saved chats.</Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.link}>Go to log in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.listContent}
      data={chats ?? []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.eyebrow}>Your archive</Text>
          <Text style={styles.h1}>Saved chats</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.stateText}>
          {error ?? (chats === null ? 'Loading your saved chats…' : 'No saved chats yet.')}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.tone}>
              {item.tone}
              {item.use_case ? ` · ${item.use_case}` : ''}
            </Text>
            <Pressable onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>Your draft</Text>
          <Text style={styles.body}>{item.input_text}</Text>
          <Text style={[styles.label, { marginTop: 8 }]}>Retuned version</Text>
          <Text style={styles.body}>{item.output_text}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  eyebrow: { color: colors.accent, fontWeight: '600', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  h1: { color: colors.ink, fontSize: 24, fontWeight: '700' },
  stateText: { color: colors.inkFaint, textAlign: 'center', marginTop: 24 },
  link: { color: colors.accent, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  card: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    ...shadow.panel,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tone: { color: colors.accent, fontWeight: '600', fontSize: 12, textTransform: 'uppercase' },
  delete: { color: colors.coral, fontWeight: '600', fontSize: 13 },
  label: { color: colors.inkSoft, fontWeight: '600', fontSize: 12 },
  body: { color: colors.ink, fontSize: 14, marginTop: 2, lineHeight: 20 },
});
