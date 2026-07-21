import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { getGameById } from '../../content/games';
import { useBombPassRound } from '../../hooks/useBombPassRound';
import { useBombPassSession } from '../../hooks/useBombPassSession';

const MIN_PLAYERS = getGameById('bomb-pass')!.minPlayers;

export default function BombPassRoundScreen() {
  const router = useRouter();
  const session = useBombPassSession();
  const round = useBombPassRound(session.players);

  useEffect(() => {
    if (session.players.length < MIN_PLAYERS) {
      router.replace('/bomb-pass/setup');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (round.phase === 'match-over' && round.winner) {
      session.setMatchResult({ winnerId: round.winner.id, eliminationOrder: round.eliminationOrder });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.phase]);

  if (session.players.length < MIN_PLAYERS) return null;

  const overlayVisible = round.phase !== 'active';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Pressable
        style={styles.tapTarget}
        onPress={round.pass}
        disabled={round.phase !== 'active'}
        android_disableSound
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.livesRow}
          pointerEvents="none"
        >
          {round.players.map((p) => (
            <View key={p.id} style={styles.lifeGroup}>
              <Text style={[styles.lifePlayerName, p.eliminated && styles.eliminatedText]} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.lifeHearts}>{p.eliminated ? '💀' : '❤️'.repeat(p.lives)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.center}>
          {round.category?.kind === 'challenge' ? (
            <>
              <Text style={styles.categoryLabel}>{round.category.name.toUpperCase()}</Text>
              <Text style={styles.promptText}>{round.currentPrompt}</Text>
            </>
          ) : (
            <>
              <Text style={styles.categoryLabel}>CATEGORY</Text>
              <Text style={styles.categoryName}>{round.category?.name ?? ''}</Text>
            </>
          )}

          <Text style={styles.holderLabel}>Holding the bomb</Text>
          <Text style={styles.holderName}>{round.holder?.name ?? ''}</Text>
        </View>

        <Text style={[styles.tapHint, round.isCoolingDown && styles.tapHintCooldown]}>
          {round.isCoolingDown ? 'PASS THE PHONE…' : 'TAP ANYWHERE TO PASS'}
        </Text>
      </Pressable>

      {overlayVisible && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>💥</Text>
          {round.phase === 'match-over' ? (
            <>
              <Text style={styles.overlayTitle}>{round.winner?.name} wins!</Text>
              <Pressable style={styles.overlayButton} onPress={() => router.replace('/bomb-pass/results')}>
                <Text style={styles.overlayButtonText}>See Results</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.overlayTitle}>{round.lastHit?.name} got hit!</Text>
              <Text style={styles.overlaySubtitle}>
                {round.lastHit
                  ? round.lastHit.eliminated
                    ? 'Out of lives — eliminated!'
                    : `${round.lastHit.lives} ${round.lastHit.lives === 1 ? 'life' : 'lives'} left`
                  : ''}
              </Text>
              <Pressable style={styles.overlayButton} onPress={round.continueAfterDetonation}>
                <Text style={styles.overlayButtonText}>Continue</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.liveBg,
  },
  tapTarget: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  lifeGroup: {
    alignItems: 'center',
    minWidth: 64,
  },
  lifePlayerName: {
    color: colors.inkDim,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
    color: colors.inkFaint,
  },
  lifeHearts: {
    fontSize: 16,
  },
  center: {
    alignItems: 'center',
    gap: 6,
  },
  categoryLabel: {
    color: colors.spark,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  categoryName: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  promptText: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  holderLabel: {
    color: colors.inkDim,
    fontSize: 14,
    fontWeight: '600',
  },
  holderName: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  tapHint: {
    textAlign: 'center',
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tapHintCooldown: {
    color: colors.inkFaint,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 11, 16, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  overlayEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  overlayTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  overlaySubtitle: {
    color: colors.inkDim,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  overlayButton: {
    backgroundColor: colors.flame,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginTop: 32,
  },
  overlayButtonText: {
    color: colors.flameInk,
    fontSize: 18,
    fontWeight: '800',
  },
});
