import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { useChameleonSession } from '../../hooks/useChameleonSession';

export default function ChameleonResultsScreen() {
  const router = useRouter();
  const session = useChameleonSession();
  const { matchResult, players } = session;

  if (!matchResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>No results yet</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/chameleon/setup')}>
          <Text style={styles.primaryButtonText}>Back to Setup</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const chameleon = players.find((p) => p.id === matchResult.chameleonId);
  const mostVotedNames = matchResult.mostVotedIds
    .map((id) => players.find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const playAgain = () => {
    session.setMatchResult(null);
    router.replace('/chameleon/round');
  };

  const backHome = () => {
    session.reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headline}>
        <Text style={styles.headlineEmoji}>{matchResult.chameleonCaught ? '🕵️' : '🦎'}</Text>
        <Text style={styles.headlineTitle}>
          {matchResult.chameleonCaught ? 'The Chameleon was caught!' : 'The Chameleon got away!'}
        </Text>
        <Text style={styles.headlineSubtitle}>
          {matchResult.chameleonCaught
            ? 'Everyone else wins.'
            : `${chameleon?.name ?? 'The Chameleon'} wins.`}
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>The Chameleon was</Text>
        <Text style={styles.detailValue}>{chameleon?.name}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>{matchResult.categoryName} — Secret word</Text>
        <Text style={styles.detailValue}>{matchResult.secretWord}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>Most votes</Text>
        <Text style={styles.detailValue}>{mostVotedNames.join(', ') || '—'}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.primaryButton} onPress={backHome}>
          <Text style={styles.primaryButtonText}>Back to Games</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={playAgain}>
          <Text style={styles.secondaryButtonText}>Play Again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 40,
  },
  headline: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 28,
  },
  headlineEmoji: {
    fontSize: 64,
  },
  headlineTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 12,
    textAlign: 'center',
  },
  headlineSubtitle: {
    fontSize: 16,
    color: colors.inkDim,
    marginTop: 6,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  detailLabel: {
    color: colors.inkDim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  buttonGroup: {
    marginTop: 'auto',
    marginBottom: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.mint,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.mintInk,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.inkDim,
    fontSize: 16,
    fontWeight: '700',
  },
});
