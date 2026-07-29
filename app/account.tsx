import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

type Mode = 'signIn' | 'signUp';

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
  const { user, displayName, loading, signIn, signUp, signInWithApple, signOut, updateDisplayName, deleteAccount } =
    useAuth();
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
        <Text style={styles.headerTitle}>Account</Text>
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
        <AuthForm onSignIn={signIn} onSignUp={signUp} onSignInWithApple={signInWithApple} />
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
          <Text style={styles.avatarEmail}>{email}</Text>
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

function AuthForm({
  onSignIn,
  onSignUp,
  onSignInWithApple,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  onSignInWithApple: () => Promise<{ error: string | null }>;
}) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appleBusy, setAppleBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const canSubmit =
    email.trim().length > 3 && password.length >= 6 && (mode === 'signIn' || name.trim().length > 0);

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const result =
      mode === 'signIn'
        ? await onSignIn(email.trim(), password)
        : await onSignUp(email.trim(), password, name.trim());
    setSubmitting(false);
    if (result.error) {
      Alert.alert(mode === 'signIn' ? 'Sign in failed' : 'Sign up failed', result.error);
    } else if (mode === 'signUp') {
      Alert.alert('Check your email', 'Confirm your address to finish creating your account.');
    }
  };

  const submitApple = async () => {
    setAppleBusy(true);
    const result = await onSignInWithApple();
    setAppleBusy(false);
    if (result.error) Alert.alert('Sign in with Apple failed', result.error);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{mode === 'signIn' ? 'Welcome back' : 'Create your account'}</Text>
        <Text style={styles.subtitle}>Sync your stats and Pro unlock across devices.</Text>

        {appleAvailable && (
          <>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={styles.appleButton}
              onPress={submitApple}
            />
            {appleBusy && <ActivityIndicator color={colors.inkDim} style={styles.appleBusyIndicator} />}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        {mode === 'signUp' && (
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor={colors.inkFaint}
            value={name}
            onChangeText={setName}
            maxLength={24}
            returnKeyType="next"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.inkFaint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.inkFaint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={submit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.flameInk} />
          ) : (
            <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
              {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.switchModeButton}
          onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        >
          <Text style={styles.switchModeText}>
            {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  appleButton: {
    width: '100%',
    height: 52,
    marginBottom: 8,
  },
  appleBusyIndicator: {
    marginBottom: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.flame,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.cardRaised,
  },
  submitButtonText: {
    color: colors.flameInk,
    fontSize: 16,
    fontWeight: '800',
  },
  submitButtonTextDisabled: {
    color: colors.inkFaint,
  },
  switchModeButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkDim,
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
