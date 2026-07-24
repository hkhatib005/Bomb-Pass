import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { usePurchases } from '../hooks/usePurchases';

interface MenuRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  accent?: boolean;
  onPress: () => void;
}

function MenuRow({ icon, label, sublabel, accent, onPress }: MenuRowProps) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={[styles.iconWrap, accent && styles.iconWrapAccent]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, accent && styles.rowLabelAccent]}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

/** Self-contained hamburger button + slide-up main menu, the app's primary nav surface off Home. */
export function MainMenu() {
  const router = useRouter();
  const { user, displayName } = useAuth();
  const { isPro } = usePurchases();
  const [visible, setVisible] = useState(false);

  const go = (path: string) => {
    setVisible(false);
    router.push(path);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setVisible(true)}
        hitSlop={12}
      >
        <Text style={styles.triggerText}>☰</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Menu</Text>

            <View style={styles.rows}>
              <MenuRow
                icon="👤"
                label={user ? displayName || user.email || 'Account' : 'Sign In'}
                sublabel={user ? 'Manage your account' : 'Save stats across devices'}
                onPress={() => go('/account')}
              />
              <MenuRow
                icon="⭐"
                label={isPro ? "You're Pro" : 'Go Pro'}
                sublabel={isPro ? 'All games unlocked' : 'Unlock every game'}
                accent={!isPro}
                onPress={() => go('/go-pro')}
              />
              <MenuRow icon="⚙" label="Settings" onPress={() => go('/settings')} />
            </View>

            <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerPressed: {
    backgroundColor: colors.cardRaised,
  },
  triggerText: {
    fontSize: 17,
    color: colors.inkDim,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardRaised,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapAccent: {
    backgroundColor: 'rgba(255,209,102,0.15)',
  },
  icon: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  rowLabelAccent: {
    color: colors.spark,
  },
  rowSublabel: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.inkFaint,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkDim,
  },
});
