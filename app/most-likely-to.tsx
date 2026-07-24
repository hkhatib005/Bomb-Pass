import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { CHALLENGE_CATEGORIES } from '../content/challenges';
import { usePromptDeck } from '../hooks/usePromptDeck';
import { usePurchases } from '../hooks/usePurchases';

const PROMPTS = CHALLENGE_CATEGORIES.find((c) => c.id === 'most-likely-to-quick')!.items;

/** Pro-only game — no free rounds, unlike Bomb Pass/Chameleon's shared daily pool. */
export default function MostLikelyToScreen() {
  const router = useRouter();
  const { current, next } = usePromptDeck(PROMPTS);
  const { isReady, isPro } = usePurchases();

  useEffect(() => {
    if (isReady && !isPro) {
      router.replace('/go-pro');
    }
  }, [isReady, isPro, router]);

  if (!isReady || !isPro) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Most Likely To</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.center}>
        <Text style={styles.eyebrow}>👉 MOST LIKELY TO</Text>
        <Text style={styles.prompt}>{current}</Text>
        <Text style={styles.hint}>Everyone point at once — most fingers wins.</Text>
      </View>

      <Pressable style={styles.nextButton} onPress={next}>
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.spark,
    letterSpacing: 2,
  },
  prompt: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 36,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.inkFaint,
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: colors.spark,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    color: colors.flameInk,
    fontSize: 18,
    fontWeight: '800',
  },
});
