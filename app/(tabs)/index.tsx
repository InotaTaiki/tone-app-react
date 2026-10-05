import { IBMPlexMono_500Medium, useFonts as useIbmPlexMono } from '@expo-google-fonts/ibm-plex-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInter } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, useFonts as useSpaceGrotesk } from '@expo-google-fonts/space-grotesk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --------------------------------------------------------------------
// Everything this screen needs lives in this one file on purpose —
// no "../lib/..." or "../theme/..." imports, so it drops into any
// project structure without needing matching folders to exist.
// --------------------------------------------------------------------

// Colors, ported directly from style.css's :root custom properties.
const colors = {
  accent: '#5B4FE8',
  bg: '#F5F3FB',
  bgPanel: '#FFFFFF',
  border: '#DEDAF0',
  ink: '#1B1930',
  inkSoft: '#5B5876',
  inkFaint: '#8C89A6',
};

// Same env var names used elsewhere in the app (EXPO_PUBLIC_SUPABASE_URL /
// EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env). If your project already
// creates a Supabase client somewhere else, that's fine — this one is
// independent and only used to decide where to redirect.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase =
  typeof window !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

// Rasterized PNG of the nav's speech-bubble mark (base.html's inline SVG),
// so no react-native-svg dependency is needed. Must sit at app/../assets/logo.png
// relative to this file — adjust the require path if your assets folder
// lives somewhere else.
const logo = require('../../assets/logo.png');

export default function WelcomeScreen() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) {
      setHasSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  // Exactly the three families style.css declares:
  //   --font-display: "Space Grotesk"  (h1/h2/h3, .logo__word)
  //   --font-body:    "Inter"          (default body text)
  //   --font-mono:    "IBM Plex Mono"  (.eyebrow, .tone-readout, .pill)
  const [spaceGroteskLoaded] = useSpaceGrotesk({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const [ibmPlexMonoLoaded] = useIbmPlexMono({ IBMPlexMono_500Medium });
  const fontsLoaded = spaceGroteskLoaded && interLoaded && ibmPlexMonoLoaded;

  useEffect(() => {
    if (hasSession === null) return;
    router.replace(hasSession ? '/(tabs)' : '/login');
  }, [hasSession]);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fontLoading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ============ NAV (mirrors base.html's header) ============ */}
        <View style={styles.nav}>
          <View style={styles.brandLockup}>
            <Image source={logo} style={styles.brandMark} />
            <Text style={styles.brand}>pitch</Text>
          </View>
          <View style={styles.navLinks}>
            <Text style={[styles.navLink, styles.navLinkCurrent]}>Write</Text>
            <Text style={styles.navLink}>How it works</Text>
            <Text style={styles.navLink}>Saved chats</Text>
          </View>
        </View>

        {/* ============ HERO (mirrors index.html's intro strip) ============ */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>TONE CONSISTENCY, ON DEMAND</Text>
          <Text style={styles.title}>
            One voice, <Text style={styles.titleAccent}>every</Text> time you write.
          </Text>
          <Text style={styles.subtitle}>
            Draft the email to your boss, the essay for English class, or the cover letter.
            Then let Pitch tune the register without touching your meaning.
          </Text>
        </View>

        <View style={styles.loading} accessibilityRole="progressbar" accessibilityLabel="Checking your sign-in status">
          <ActivityIndicator color={colors.accent} size="small" />
          <View style={styles.loadingCopy}>
            <Text style={styles.loadingTitle}>
              {hasSession === null ? 'Getting your space ready' : 'Opening your next step'}
            </Text>
            <Text style={styles.loadingText}>
              {hasSession === null ? 'Checking your sign-in status' : 'Just a moment'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  fontLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 48,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 30, height: 30, borderRadius: 9 },
  brand: { color: colors.ink, fontSize: 18, fontFamily: 'SpaceGrotesk_700Bold' },
  navLinks: { flexDirection: 'row', gap: 18 },
  navLink: { color: colors.inkSoft, fontSize: 13, fontFamily: 'Inter_500Medium' },
  navLinkCurrent: { color: colors.ink, fontFamily: 'Inter_600SemiBold' },
  hero: { flex: 1, justifyContent: 'center', paddingBottom: 90 },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: 'IBMPlexMono_500Medium',
    letterSpacing: 0.6,
    marginBottom: 14,
    textAlign: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'SpaceGrotesk_700Bold',
    textAlign: 'center',
  },
  titleAccent: { color: colors.accent, fontStyle: 'italic' },
  subtitle: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 18,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 16,
    gap: 12,
  },
  loadingCopy: { gap: 2 },
  loadingTitle: { color: colors.ink, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  loadingText: { color: colors.inkFaint, fontSize: 11, fontFamily: 'Inter_400Regular' },
});