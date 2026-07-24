import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Free (non-Pro) rounds allowed per day, shared across every game — not per game. */
export const FREE_ROUNDS_PER_DAY = 2;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function storageKey(): string {
  return `daily-rounds:${todayString()}`;
}

interface DailyRoundsContextValue {
  loaded: boolean;
  usedToday: number;
  consumeRound: () => void;
}

const DailyRoundsContext = createContext<DailyRoundsContextValue | null>(null);

export function DailyRoundsProvider({ children }: { children: ReactNode }) {
  const [usedToday, setUsedToday] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey()).then((value) => {
      setUsedToday(value ? parseInt(value, 10) || 0 : 0);
      setLoaded(true);
    });
  }, []);

  // Persists on every change rather than inside the setState updater, so the
  // write only ever happens after the real stored value has been loaded.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(storageKey(), String(usedToday)).catch(() => {});
  }, [usedToday, loaded]);

  const consumeRound = useCallback(() => {
    setUsedToday((prev) => prev + 1);
  }, []);

  const value = useMemo(() => ({ loaded, usedToday, consumeRound }), [loaded, usedToday, consumeRound]);

  return <DailyRoundsContext.Provider value={value}>{children}</DailyRoundsContext.Provider>;
}

export interface DailyRoundsView {
  loaded: boolean;
  remaining: number;
  canPlay: boolean;
  /** Records one play against today's shared count. No-op for Pro users. */
  consumeRound: () => void;
}

/** Game-wide (not per-game) daily free-round allowance — shared context so every screen stays in sync. */
export function useDailyRounds(isPro: boolean): DailyRoundsView {
  const ctx = useContext(DailyRoundsContext);
  if (!ctx) {
    throw new Error('useDailyRounds must be used within a DailyRoundsProvider');
  }

  const remaining = isPro ? Infinity : Math.max(0, FREE_ROUNDS_PER_DAY - ctx.usedToday);
  const canPlay = isPro || remaining > 0;

  return {
    loaded: ctx.loaded,
    remaining,
    canPlay,
    consumeRound: () => {
      if (!isPro) ctx.consumeRound();
    },
  };
}
