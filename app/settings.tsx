import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { usePurchases } from '../hooks/usePurchases';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

interface RowProps {
  icon: string;
  label: string;
  accent?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function Row({ icon, label, accent, onPress, disabled }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.iconWrap, accent && styles.iconWrapAccent]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowChevron}>›</Text>
    </Pressable>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, displayName } = useAuth();
  const { isPro, restore } = usePurchases();
  const [restoring, setRestoring] = useState(false);

  const restorePurchases = async () => {
    setRestoring(true);
    const result = await restore();
    setRestoring(false);
    Alert.alert(result.error ? 'Restore' : 'Restored', result.error ?? 'Your purchase has been restored.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Account</Text>
        <Group>
          <Row
            icon="👤"
            label={user ? displayName || user.email || 'Account' : 'Sign In'}
            onPress={() => router.push('/account')}
          />
        </Group>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Purchases</Text>
        <Group>
          <Row
            icon="⭐"
            label={isPro ? "You're Pro" : 'Upgrade to Premium'}
            accent={!isPro}
            onPress={() => router.push('/go-pro')}
          />
          <View style={styles.divider} />
          <Row
            icon="↺"
            label={restoring ? 'Restoring…' : 'Restore Purchases'}
            onPress={restorePurchases}
            disabled={restoring}
          />
        </Group>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Legal</Text>
        <Group>
          <Row icon="📄" label="Terms of Use" onPress={() => router.push('/legal/terms')} />
          <View style={styles.divider} />
          <Row icon="🔒" label="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
        </Group>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>About</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>House Party</Text>
          <Text style={styles.cardBody}>
            Party games for a phone that gets passed around. Sign in to save your stats and Pro unlock across
            devices — or skip it and everything still works offline.
          </Text>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkFaint,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionLabelSpaced: {
    marginTop: 28,
  },
  group: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 68,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: colors.cardRaised,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapAccent: {
    backgroundColor: 'rgba(255,209,102,0.15)',
  },
  icon: {
    fontSize: 16,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  rowChevron: {
    fontSize: 20,
    color: colors.inkFaint,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  cardBody: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 14,
    fontWeight: '600',
  },
});
