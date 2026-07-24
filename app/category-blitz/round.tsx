import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PauseMenu } from '../../components/PauseMenu';
import { colors } from '../../constants/theme';
import { getGameById } from '../../content/games';
import { useCategoryBlitzRound } from '../../hooks/useCategoryBlitzRound';
import { useCategoryBlitzSession } from '../../hooks/useCategoryBlitzSession';

const MIN_PLAYERS = getGameById('category-blitz')!.minPlayers;

export default function CategoryBlitzRoundScreen() {
  const router = useRouter();
  const session = useCategoryBlitzSession();
  const round = useCategoryBlitzRound(session.players);
  const [handoffAcknowledged, setHandoffAcknowledged] = useState(false);

  useEffect(() => {
    if (session.players.length < MIN_PLAYERS) {
      router.replace('/category-blitz/setup');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHandoffAcknowledged(false);
  }, [round.turnIndex]);

  useEffect(() => {
    if (round.phase === 'match-over') {
      session.setMatchResult({ scores: round.scores });
      router.replace('/category-blitz/results');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.phase]);

  if (session.players.length < MIN_PLAYERS) return null;

  const quitToHome = () => {
    session.reset();
    router.replace('/');
  };
  const pauseMenu = <PauseMenu accentColor={colors.spark} accentInkColor={colors.flameInk} onQuit={quitToHome} />;

  const player = round.currentPlayer;
  if (!player) return null;

  if (!handoffAcknowledged) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {pauseMenu}
        <View style={styles.centerScreen}>
          <Text style={styles.handoffLabel}>Pass the phone to</Text>
          <Text style={styles.handoffName}>{player.name}</Text>
          <Pressable style={styles.primaryButton} onPress={() => setHandoffAcknowledged(true)}>
            <Text style={styles.primaryButtonText}>I'm {player.name}, ready</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (round.phase === 'ready') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {pauseMenu}
        <View style={styles.centerScreen}>
          <Text style={styles.handoffLabel}>Get ready, {player.name}</Text>
          <Text style={styles.readyHint}>45 seconds. Name as many as you can.</Text>
          <Pressable style={styles.primaryButton} onPress={round.startTurn}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (round.phase === 'active') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {pauseMenu}
        <View style={styles.activeHeader}>
          <Text style={styles.categoryLabel}>{round.category?.name}</Text>
          <Text style={styles.timerText}>{round.secondsRemaining}</Text>
        </View>
        <Pressable style={styles.tapTarget} onPress={round.addPoint}>
          <Text style={styles.scoreNumber}>{round.score}</Text>
          <Text style={styles.tapHint}>TAP FOR EACH ANSWER</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // turn-over
  const isLastTurn = round.turnIndex + 1 >= session.players.length;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {pauseMenu}
      <View style={styles.centerScreen}>
        <Text style={styles.handoffLabel}>Time's up, {player.name}!</Text>
        <Text style={styles.scoreBig}>{round.score}</Text>
        <Text style={styles.readyHint}>{round.score === 1 ? 'item named' : 'items named'}</Text>
        <Pressable style={styles.primaryButton} onPress={round.nextTurn}>
          <Text style={styles.primaryButtonText}>{isLastTurn ? 'See Results' : 'Next Player'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  handoffLabel: {
    color: colors.inkDim,
    fontSize: 16,
    fontWeight: '600',
  },
  handoffName: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 24,
    textAlign: 'center',
  },
  readyHint: {
    color: colors.inkDim,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.spark,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  primaryButtonText: {
    color: colors.flameInk,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  activeHeader: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  categoryLabel: {
    color: colors.spark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerText: {
    color: colors.ink,
    fontSize: 48,
    fontWeight: '900',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  tapTarget: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  scoreNumber: {
    color: colors.ink,
    fontSize: 96,
    fontWeight: '900',
    letterSpacing: -2,
  },
  tapHint: {
    color: colors.inkDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scoreBig: {
    color: colors.spark,
    fontSize: 64,
    fontWeight: '900',
    marginBottom: 4,
  },
});
