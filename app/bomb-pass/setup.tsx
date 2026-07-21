import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { getGameById } from '../../content/games';
import { useBombPassSession } from '../../hooks/useBombPassSession';
import { createId } from '../../lib/id';

const BOMB_PASS_GAME = getGameById('bomb-pass')!;
const MIN_PLAYERS = BOMB_PASS_GAME.minPlayers;
const MAX_PLAYERS = BOMB_PASS_GAME.maxPlayers;

interface DraftPlayer {
  id: string;
  name: string;
}

export default function BombPassSetupScreen() {
  const router = useRouter();
  const session = useBombPassSession();
  const [draftPlayers, setDraftPlayers] = useState<DraftPlayer[]>([
    { id: createId(), name: '' },
    { id: createId(), name: '' },
    { id: createId(), name: '' },
  ]);

  const filledCount = draftPlayers.filter((p) => p.name.trim().length > 0).length;
  const canStart = filledCount >= MIN_PLAYERS;
  const canAddPlayer = draftPlayers.length < MAX_PLAYERS;

  const updateName = (id: string, name: string) => {
    setDraftPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const removePlayer = (id: string) => {
    setDraftPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const addPlayer = () => {
    if (draftPlayers.length >= MAX_PLAYERS) return;
    setDraftPlayers((prev) => [...prev, { id: createId(), name: '' }]);
  };

  const startGame = () => {
    if (!canStart) return;
    const finalPlayers = draftPlayers
      .filter((p) => p.name.trim().length > 0)
      .map((p) => ({ id: p.id, name: p.name.trim() }));
    session.setMatchResult(null);
    session.setPlayers(finalPlayers);
    router.push('/bomb-pass/round');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Who's playing?</Text>
        <Text style={styles.subtitle}>Add at least {MIN_PLAYERS} players to start</Text>

        <FlatList
          data={draftPlayers}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor={colors.inkFaint}
                value={item.name}
                onChangeText={(text) => updateName(item.id, text)}
                maxLength={20}
                returnKeyType="done"
              />
              {draftPlayers.length > 1 && (
                <Pressable style={styles.removeButton} onPress={() => removePlayer(item.id)} hitSlop={12}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </Pressable>
              )}
            </View>
          )}
        />

        <Pressable style={styles.addButton} onPress={addPlayer} disabled={!canAddPlayer}>
          <Text style={[styles.addButtonText, !canAddPlayer && styles.addButtonTextDisabled]}>
            {canAddPlayer ? '+ Add Player' : `Max ${MAX_PLAYERS} players`}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
          onPress={startGame}
          disabled={!canStart}
        >
          <Text style={styles.startButtonText}>
            {canStart ? 'Start Game' : `Add ${MIN_PLAYERS - filledCount} more`}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.inkDim,
    marginTop: 6,
    marginBottom: 16,
  },
  list: {
    gap: 10,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: colors.ink,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.inkDim,
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: colors.flame,
    fontSize: 16,
    fontWeight: '700',
  },
  addButtonTextDisabled: {
    color: colors.inkFaint,
  },
  startButton: {
    backgroundColor: colors.flame,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 12,
  },
  startButtonDisabled: {
    backgroundColor: colors.cardRaised,
  },
  startButtonText: {
    color: colors.flameInk,
    fontSize: 18,
    fontWeight: '800',
  },
});
