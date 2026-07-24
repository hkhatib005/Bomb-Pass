import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { CHALLENGE_CATEGORIES } from '../content/challenges';
import { usePromptDeck } from '../hooks/usePromptDeck';
import { usePurchases } from '../hooks/usePurchases';

const RAW_ITEMS = CHALLENGE_CATEGORIES.find((c) => c.id === 'truth-or-dare-quick')!.items;
const TRUTHS = RAW_ITEMS.filter((item) => item.startsWith('TRUTH:')).map((item) => item.replace(/^TRUTH:\s*/, ''));
const DARES = RAW_ITEMS.filter((item) => item.startsWith('DARE:')).map((item) => item.replace(/^DARE:\s*/, ''));

type Choice = 'truth' | 'dare' | null;

/** Pro-only game — no free rounds, unlike Bomb Pass/Chameleon's shared daily pool. */
export default function TruthOrDareScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>(null);
  const truthDeck = usePromptDeck(TRUTHS);
  const dareDeck = usePromptDeck(DARES);
  const { isReady, isPro } = usePurchases();

  useEffect(() => {
    if (isReady && !isPro) {
      router.replace('/go-pro');
    }
  }, [isReady, isPro, router]);

  const reveal = (next: Choice) => {
    setChoice(next);
  };

  const nextPrompt = () => {
    if (choice === 'truth') truthDeck.next();
    if (choice === 'dare') dareDeck.next();
  };

  if (!isReady || !isPro) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Truth or Dare</Text>
        <View style={styles.backButton} />
      </View>

      {choice === null ? (
        <View style={styles.center}>
          <Text style={styles.eyebrow}>🎯 PICK ONE</Text>
          <Text style={styles.prompt}>Truth or Dare?</Text>
          <View style={styles.choiceRow}>
            <Pressable style={[styles.choiceButton, styles.truthButton]} onPress={() => reveal('truth')}>
              <Text style={styles.truthButtonText}>Truth</Text>
            </Pressable>
            <Pressable style={[styles.choiceButton, styles.dareButton]} onPress={() => reveal('dare')}>
              <Text style={styles.dareButtonText}>Dare</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.center}>
            <Text style={[styles.eyebrow, choice === 'dare' && styles.eyebrowDare]}>
              {choice === 'truth' ? 'TRUTH' : 'DARE'}
            </Text>
            <Text style={styles.prompt}>{choice === 'truth' ? truthDeck.current : dareDeck.current}</Text>
          </View>

          <View style={styles.footerRow}>
            <Pressable style={styles.secondaryButton} onPress={() => setChoice(null)}>
              <Text style={styles.secondaryButtonText}>Choose Again</Text>
            </Pressable>
            <Pressable style={styles.nextButton} onPress={nextPrompt}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </>
      )}
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
    color: colors.mint,
    letterSpacing: 2,
  },
  eyebrowDare: {
    color: colors.flame,
  },
  prompt: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  truthButton: {
    backgroundColor: colors.mint,
  },
  truthButtonText: {
    color: colors.mintInk,
    fontSize: 18,
    fontWeight: '800',
  },
  dareButton: {
    backgroundColor: colors.flame,
  },
  dareButtonText: {
    color: colors.flameInk,
    fontSize: 18,
    fontWeight: '800',
  },
  footerRow: {
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.inkDim,
    fontSize: 14,
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: colors.spark,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.flameInk,
    fontSize: 18,
    fontWeight: '800',
  },
});
