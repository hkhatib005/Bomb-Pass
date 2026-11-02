import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { usePurchases } from '../hooks/usePurchases';

function initialsFor(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
  return (email?.[0] ?? '?').toUpperCase();
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, displayName, loading, signInWithApple, signOut, updateDisplayName, deleteAccount } = useAuth();
  const { isPro } = usePurchases();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.flame} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Optional Account</Text>
        <View style={styles.backButton} />
      </View>

      {user ? (
        <SignedInView
          email={user.email ?? ''}
          displayName={displayName}
          isPro={isPro}
          onUpdateName={updateDisplayName}
          onSignOut={signOut}
          onDeleteAccount={deleteAccount}
          onGoPro={() => router.push('/go-pro')}
        />
      ) : (
        <SignedOutView onSignInWithApple={signInWithApple} onContinueWithoutAccount={() => router.back()} />
      )}
    </SafeAreaView>
  );
}

function SignedInView({
  email,
  displayName,
  isPro,
  onUpdateName,
  onSignOut,
  onDeleteAccount,
  onGoPro,
}: {
  email: string;
  displayName: string | null;
  isPro: boolean;
  onUpdateName: (name: string) => Promise<{ error: string | null }>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<{ error: string | null }>;
  onGoPro: () => void;
}) {
  const [name, setName] = useState(displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Resyncs if displayName arrives asynchronously after mount — e.g. Apple's
  // fullName is only applied via a follow-up updateUser call after sign-in,
  // which can resolve after this view has already rendered with the old value.
  useEffect(() => {
    setName(displayName ?? '');
  }, [displayName]);

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === displayName) return;
    setSaving(true);
    const { error } = await onUpdateName(trimmed);
    setSaving(false);
    if (error) Alert.alert('Couldn’t update name', error);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account and profile. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const { error } = await onDeleteAccount();
            setDeleting(false);
            if (error) Alert.alert('Couldn’t delete account', error);
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsFor(displayName, email)}</Text>
        </View>
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarName}>{displayName || 'Player'}</Text>
          {email.length > 0 && <Text style={styles.avatarEmail}>{email}</Text>}
        </View>
      </View>

      <View style={[styles.proCard, isPro && styles.proCardActive]}>
        <Text style={styles.proCardTitle}>{isPro ? 'Pro member' : 'Free plan'}</Text>
        <Text style={styles.proCardBody}>
          {isPro ? 'All games are unlocked on this account.' : 'Unlock every game with House Party Pro.'}
        </Text>
        {!isPro && (
          <Pressable style={styles.proCardButton} onPress={onGoPro}>
            <Text style={styles.proCardButtonText}>Go Pro</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionLabel}>Display name</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.inkFaint}
          maxLength={24}
          onBlur={saveName}
          returnKeyType="done"
          onSubmitEditing={saveName}
        />
        {saving && <ActivityIndicator color={colors.inkDim} />}
      </View>

      <Pressable style={styles.signOutButton} onPress={confirmSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={confirmDeleteAccount} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function SignedOutView({
  onSignInWithApple,
  onContinueWithoutAccount,
}: {
  onSignInWithApple: () => Promise<{ error: string | null }>;
  onContinueWithoutAccount: () => void;
}) {
  const [appleBusy, setAppleBusy] = useState(false);
  // Tri-state: null while we're checking, so the button doesn't flash in and out.
  const [appleAvailable, setAppleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setAppleAvailable(false);
      return;
    }
    let cancelled = false;
    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (!cancelled) setAppleAvailable(available);
      })
      .catch(() => {
        if (!cancelled) setAppleAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submitApple = async () => {
    setAppleBusy(true);
    try {
      const result = await onSignInWithApple();
      if (result.error) Alert.alert('Sign in with Apple failed', result.error);
    } finally {
      setAppleBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your account is optional</Text>
      <Text style={styles.subtitle}>
        Play and purchases work fully signed out. Sign in with Apple only if you want your Pro unlock and
        display name to follow you to another device.
      </Text>

      {appleAvailable === null ? (
        <ActivityIndicator color={colors.inkDim} style={styles.appleCheckIndicator} />
      ) : appleAvailable ? (
        <>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={14}
            style={styles.appleButton}
            onPress={submitApple}
          />
          {appleBusy && <ActivityIndicator color={colors.inkDim} style={styles.appleBusyIndicator} />}
        </>
      ) : (
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableText}>
            Sign in with Apple isn’t available on this device right now. You can still play and go Pro
            without an account.
          </Text>
        </View>
      )}

      <Pressable style={styles.continueButton} onPress={onContinueWithoutAccount}>
        <Text style={styles.continueButtonText}>Continue without an account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkDim,
    marginTop: 6,
    marginBottom: 28,
    lineHeight: 20,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  appleCheckIndicator: {
    marginTop: 12,
  },
  appleBusyIndicator: {
    marginTop: 12,
  },
  unavailableCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 18,
  },
  unavailableText: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  continueButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.flame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.flameInk,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  avatarEmail: {
    fontSize: 13,
    color: colors.inkFaint,
    marginTop: 2,
  },
  proCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
  },
  proCardActive: {
    borderColor: colors.mint,
  },
  proCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  proCardBody: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    marginTop: 6,
  },
  proCardButton: {
    backgroundColor: colors.spark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  proCardButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.flameInk,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkFaint,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.ink,
  },
  signOutButton: {
    marginTop: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkFaint,
  },
});
