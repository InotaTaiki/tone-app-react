import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSession } from '../lib/useSession';
import { colors } from '../theme/colors';

// Same mark used in the web app's nav (base.html): a speech-bubble glyph
// with three dots, drawn here with react-native-svg instead of inline SVG.
function LogoMark() {
  return (
    <Svg viewBox="0 0 32 32" width={22} height={22} fill="none">
      <Path
        d="M6 8C6 6.34315 7.34315 5 9 5H23C24.6569 5 26 6.34315 26 8V17C26 18.6569 24.6569 20 23 20H14L8 25V20H9C7.34315 20 6 18.6569 6 17V8Z"
        fill={colors.white}
      />
      <Circle cx={11.5} cy={12.5} r={1.4} fill={colors.ink} />
      <Circle cx={16} cy={12.5} r={1.4} fill={colors.ink} />
      <Circle cx={20.5} cy={12.5} r={1.4} fill={colors.ink} />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? '/(tabs)' : '/login');
  }, [loading, session]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ============ NAV (mirrors base.html's header) ============ */}
        <View style={styles.nav}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <LogoMark />
            </View>
            <Text style={styles.brand}>Pitch</Text>
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
              {loading ? 'Getting your space ready' : 'Opening your next step'}
            </Text>
            <Text style={styles.loadingText}>
              {loading ? 'Checking your sign-in status' : 'Just a moment'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  // Nav
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
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  brand: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  navLinks: { flexDirection: 'row', gap: 18 },
  navLink: { color: colors.inkSoft, fontSize: 13, fontWeight: '500' },
  navLinkCurrent: { color: colors.ink, fontWeight: '700' },

  // Hero — matches index.html's .intro block
  hero: { flex: 1, justifyContent: 'center', paddingBottom: 90 },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 14,
    textAlign: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleAccent: { color: colors.accent, fontStyle: 'italic' },
  subtitle: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 18,
  },

  // Loading footer — kept from the redirect-gate behavior
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 16,
    gap: 12,
  },
  loadingCopy: { gap: 2 },
  loadingTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  loadingText: { color: colors.inkFaint, fontSize: 11 },
});