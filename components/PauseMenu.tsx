import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

interface PauseMenuProps {
  /** Button/primary-action color, matched to the game's own accent (e.g. flame for Bomb Pass, mint for Chameleon). */
  accentColor: string;
  accentInkColor: string;
  /** Called after the user confirms quitting — the screen decides what "quit" means (reset session, navigate home). */
  onQuit: () => void;
}

export function PauseMenu({ accentColor, accentInkColor, onQuit }: PauseMenuProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const confirmQuit = () => {
    Alert.alert('Quit this game?', 'Your progress in this round will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => {
          setVisible(false);
          onQuit();
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.bar}>
        <Pressable
          style={({ pressed }) => [styles.barButton, pressed && styles.barButtonPressed]}
          onPress={() => setVisible(true)}
          hitSlop={10}
        >
          <Text style={styles.barButtonText}>☰</Text>
        </Pressable>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Paused</Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: accentColor }]}
              onPress={() => setVisible(false)}
            >
              <Text style={[styles.primaryButtonText, { color: accentInkColor }]}>Resume</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setVisible(false);
                router.push('/settings');
              }}
            >
              <Text style={styles.secondaryButtonText}>Settings</Text>
            </Pressable>
            <Pressable style={styles.quitButton} onPress={confirmQuit}>
              <Text style={styles.quitButtonText}>Quit to Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  barButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  barButtonText: {
    fontSize: 17,
    color: colors.ink,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.cardRaised,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkDim,
  },
  quitButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  quitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
});
