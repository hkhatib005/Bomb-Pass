import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { getGameById } from '../../content/games';
import { useChameleonRound } from '../../hooks/useChameleonRound';
import { useChameleonSession } from '../../hooks/useChameleonSession';

const MIN_PLAYERS = getGameById('chameleon')!.minPlayers;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function WordGrid({ words, secretWord }: { words: string[]; secretWord: string | null }) {
  return (
    <View style={styles.grid}>
      {words.map((word) => (
        <View key={word} style={styles.gridCell}>
          <Text style={[styles.gridCellText, word === secretWord && styles.gridCellSecretText]}>{word}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ChameleonRoundScreen() {
  const router = useRouter();
  const session = useChameleonSession();
  const round = useChameleonRound(session.players);

  const [handoffAcknowledged, setHandoffAcknowledged] = useState(false);
  const [roleShown, setRoleShown] = useState(false);
  const [voteHandoffAcknowledged, setVoteHandoffAcknowledged] = useState(false);

  useEffect(() => {
    if (session.players.length < MIN_PLAYERS) {
      router.replace('/chameleon/setup');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHandoffAcknowledged(false);
    setRoleShown(false);
  }, [round.currentRevealer?.id]);

  useEffect(() => {
    setVoteHandoffAcknowledged(false);
  }, [round.currentVoter?.id]);

  useEffect(() => {
    if (round.phase === 'results' && round.result) {
      session.setMatchResult({
        chameleonId: round.result.chameleonId,
        secretWord: round.result.secretWord,
        categoryName: round.category.name,
        votes: round.result.votes,
        mostVotedIds: round.result.mostVotedIds,
        chameleonCaught: round.result.chameleonCaught,
      });
      router.replace('/chameleon/results');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.phase]);

  if (session.players.length < MIN_PLAYERS) return null;

  if (round.phase === 'reveal') {
    const revealer = round.currentRevealer;
    if (!revealer) return null;
    const isChameleon = revealer.id === round.chameleonId;

    if (!handoffAcknowledged) {
      return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.centerScreen}>
            <Text style={styles.handoffLabel}>Pass the phone to</Text>
            <Text style={styles.handoffName}>{revealer.name}</Text>
            <Pressable style={styles.primaryButton} onPress={() => setHandoffAcknowledged(true)}>
              <Text style={styles.primaryButtonText}>I'm {revealer.name}, show my role</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    if (!roleShown) {
      return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <Pressable style={styles.tapTarget} onPress={() => setRoleShown(true)}>
            <Text style={styles.tapHint}>🤫 Make sure no one else is looking</Text>
            <Text style={styles.tapHintBig}>TAP TO REVEAL YOUR ROLE</Text>
          </Pressable>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.roleHeader}>
          <Text style={styles.categoryLabel}>{round.category.name}</Text>
          {isChameleon ? (
            <>
              <Text style={styles.roleTitle}>🦎 You are the Chameleon!</Text>
              <Text style={styles.roleSubtitle}>
                You don't know the secret word. Study the grid and blend in.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.roleTitle}>Your secret word</Text>
              <Text style={styles.secretWord}>{round.secretWord}</Text>
            </>
          )}
        </View>
        <WordGrid words={round.words} secretWord={isChameleon ? null : round.secretWord} />
        <Pressable style={styles.primaryButton} onPress={round.advanceReveal}>
          <Text style={styles.primaryButtonText}>Hide &amp; Pass</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (round.phase === 'discussion') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.discussionHeader}>
          <Text style={styles.categoryLabel}>{round.category.name}</Text>
          <Text style={styles.timerText}>{formatTime(round.discussionSecondsRemaining)}</Text>
          <Text style={styles.discussionHint}>Discuss! Everyone but the Chameleon knows the word.</Text>
        </View>
        <WordGrid words={round.words} secretWord={null} />
        <Pressable style={styles.primaryButton} onPress={round.startVoting}>
          <Text style={styles.primaryButtonText}>Start Voting</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (round.phase === 'voting') {
    const voter = round.currentVoter;
    if (!voter) return null;

    if (!voteHandoffAcknowledged) {
      return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.centerScreen}>
            <Text style={styles.handoffLabel}>Pass the phone to</Text>
            <Text style={styles.handoffName}>{voter.name}</Text>
            <Pressable style={styles.primaryButton} onPress={() => setVoteHandoffAcknowledged(true)}>
              <Text style={styles.primaryButtonText}>I'm {voter.name}, ready to vote</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Text style={styles.votingTitle}>Who's the Chameleon?</Text>
        <View style={styles.voteList}>
          {round.votableTargets.map((target) => (
            <Pressable
              key={target.id}
              style={({ pressed }) => [styles.voteRow, pressed && styles.voteRowPressed]}
              onPress={() => round.castVote(target.id)}
            >
              <Text style={styles.voteRowText}>{target.name}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return null;
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
  tapTarget: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  tapHint: {
    color: colors.inkDim,
    fontSize: 15,
  },
  tapHintBig: {
    color: colors.mint,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  roleHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 4,
  },
  categoryLabel: {
    color: colors.mint,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roleTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginTop: 8,
  },
  roleSubtitle: {
    color: colors.inkDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  secretWord: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.mint,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginTop: 24,
  },
  primaryButtonText: {
    color: colors.mintInk,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  discussionHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 4,
  },
  timerText: {
    color: colors.ink,
    fontSize: 44,
    fontWeight: '800',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  discussionHint: {
    color: colors.inkDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    alignContent: 'center',
  },
  gridCell: {
    width: '25%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 8,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridCellSecretText: {
    borderColor: colors.mint,
    backgroundColor: colors.mintInk,
  },
  votingTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  voteList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  voteRow: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  voteRowPressed: {
    backgroundColor: colors.cardRaised,
  },
  voteRowText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
});
