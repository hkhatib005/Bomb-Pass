import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True only while the initial session is being restored from storage on launch. */
  loading: boolean;
  displayName: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED_ERROR = 'Sign-in isn’t set up yet — see README for Supabase setup.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      displayName: (session?.user?.user_metadata?.display_name as string | undefined) ?? null,
      signUp: async (email, password, displayName) => {
        if (!supabase) return { error: NOT_CONFIGURED_ERROR };
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        return { error: error?.message ?? null };
      },
      signIn: async (email, password) => {
        if (!supabase) return { error: NOT_CONFIGURED_ERROR };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signInWithApple: async () => {
        if (!supabase) return { error: NOT_CONFIGURED_ERROR };
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          if (!credential.identityToken) {
            return { error: 'Apple did not return an identity token.' };
          }

          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });
          if (error) return { error: error.message };

          // Apple only ever includes the name on the user's very first authorization.
          const name = credential.fullName ? AppleAuthentication.formatFullName(credential.fullName).trim() : '';
          if (name) {
            await supabase.auth.updateUser({ data: { display_name: name } });
          }
          return { error: null };
        } catch (err: any) {
          if (err?.code === 'ERR_REQUEST_CANCELED') return { error: null };
          return { error: err?.message ?? 'Sign in with Apple failed.' };
        }
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
      updateDisplayName: async (name) => {
        if (!supabase) return { error: NOT_CONFIGURED_ERROR };
        const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
        return { error: error?.message ?? null };
      },
      deleteAccount: async () => {
        if (!supabase) return { error: NOT_CONFIGURED_ERROR };
        const { error } = await supabase.functions.invoke('delete-account');
        if (error) return { error: error.message };
        await supabase.auth.signOut();
        return { error: null };
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
