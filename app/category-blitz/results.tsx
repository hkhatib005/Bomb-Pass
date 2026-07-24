import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { useCategoryBlitzSession } from '../../hooks/useCategoryBlitzSession';

export default function CategoryBlitzResultsScreen() {
  const router = useRouter();
  const session = useCategoryBlitzSession();
  const { matchResult, players } = session;

  if (!matchResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>No results yet</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/category-blitz/setup')}>
          <Text style={styles.primaryButtonText}>Back to Setup</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const standings = players
    .map((p) => ({ player: p, score: matchResult.scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const winner = standings[0]?.player;

  const playAgain = () => {
    session.setMatchResult(null);
    router.replace('/category-blitz/round');
  };

  const backHome = () => {
    session.reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.winnerBlock}>
        <Text style={styles.winnerEmoji}>🏆</Text>
        <Text style={styles.winnerName}>{winner?.name} wins!</Text>
      </View>

      <View style={styles.standingsList}>
        {standings.map(({ player, score }, index) => (
          <View key={player.id} style={styles.standingRow}>
            <Text style={styles.standingPlace}>#{index + 1}</Text>
            <Text style={styles.standingName}>{player.name}</Text>
            <Text style={styles.standingScore}>{score}</Text>
          </View>
        ))}
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
  winnerBlock: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  winnerEmoji: {
    fontSize: 72,
  },
  winnerName: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 12,
    textAlign: 'center',
  },
  standingsList: {
    gap: 10,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 14,
  },
  standingPlace: {
    color: colors.spark,
    fontWeight: '800',
    fontSize: 16,
    width: 28,
  },
  standingName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  standingScore: {
    color: colors.inkDim,
    fontSize: 17,
    fontWeight: '800',
  },
  buttonGroup: {
    marginTop: 'auto',
    marginBottom: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.spark,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.flameInk,
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
