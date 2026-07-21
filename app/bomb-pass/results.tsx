import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { useBombPassSession } from '../../hooks/useBombPassSession';

export default function BombPassResultsScreen() {
  const router = useRouter();
  const session = useBombPassSession();
  const { matchResult, players } = session;

  if (!matchResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>No results yet</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/bomb-pass/setup')}>
          <Text style={styles.primaryButtonText}>Back to Setup</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const winner = players.find((p) => p.id === matchResult.winnerId);
  // Elimination order runs first-out to last-out, so standings behind the
  // winner are the reverse of that (last eliminated = runner-up).
  const standings = [winner, ...[...matchResult.eliminationOrder].reverse().map((id) => players.find((p) => p.id === id))].filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  const playAgain = () => {
    session.setMatchResult(null);
    router.replace('/bomb-pass/round');
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
        {standings.map((p, index) => (
          <View key={p.id} style={styles.standingRow}>
            <Text style={styles.standingPlace}>#{index + 1}</Text>
            <Text style={styles.standingName}>{p.name}</Text>
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
