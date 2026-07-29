import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GAMES } from '../content/games';

/** Free (non-Pro) rounds allowed per day, per game — Bomb Pass and Chameleon each get their own pool. */
export const FREE_ROUNDS_PER_DAY = 2;

const TRIAL_GAME_IDS = GAMES.filter((g) => g.hasFreeTrial).map((g) => g.id);

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Doubles as both the AsyncStorage key and the in-memory state key. Embedding
 * today's date in the key (recomputed on every call) means a date rollover
 * while the app is open just produces a new, never-seen key — the count
 * naturally reads back as 0 with no explicit "is it still today" check needed.
 */
function storageKey(gameId: string): string {
  return `daily-rounds:${gameId}:${todayString()}`;
}

interface DailyRoundsContextValue {
  loaded: boolean;
  usedByKey: Record<string, number>;
  consumeRound: (gameId: string) => void;
}

const DailyRoundsContext = createContext<DailyRoundsContextValue | null>(null);

export function DailyRoundsProvider({ children }: { children: ReactNode }) {
  const [usedByKey, setUsedByKey] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(
      TRIAL_GAME_IDS.map((id) => {
        const key = storageKey(id);
        return AsyncStorage.getItem(key).then((value) => [key, value ? parseInt(value, 10) || 0 : 0] as const);
      })
    ).then((pairs) => {
      setUsedByKey(Object.fromEntries(pairs));
      setLoaded(true);
    });
  }, []);

  // Persists on every change rather than inside the setState updater, so the
  // write only ever happens after the real stored values have been loaded.
  useEffect(() => {
    if (!loaded) return;
    for (const [key, count] of Object.entries(usedByKey)) {
      AsyncStorage.setItem(key, String(count)).catch(() => {});
    }
  }, [usedByKey, loaded]);

  const consumeRound = useCallback((gameId: string) => {
    const key = storageKey(gameId);
    setUsedByKey((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }, []);

  const value = useMemo(() => ({ loaded, usedByKey, consumeRound }), [loaded, usedByKey, consumeRound]);

  return <DailyRoundsContext.Provider value={value}>{children}</DailyRoundsContext.Provider>;
}

export interface DailyRoundsView {
  loaded: boolean;
  remaining: number;
  canPlay: boolean;
  /** Records one play against this game's own daily count. No-op for Pro users. */
  consumeRound: () => void;
}

/** Per-game daily free-round allowance — shared context so every screen stays in sync. */
export function useDailyRounds(gameId: string, isPro: boolean): DailyRoundsView {
  const ctx = useContext(DailyRoundsContext);
  if (!ctx) {
    throw new Error('useDailyRounds must be used within a DailyRoundsProvider');
  }

  const usedToday = ctx.usedByKey[storageKey(gameId)] ?? 0;
  const remaining = isPro ? Infinity : Math.max(0, FREE_ROUNDS_PER_DAY - usedToday);
  const canPlay = isPro || remaining > 0;

  return {
    loaded: ctx.loaded,
    remaining,
    canPlay,
    consumeRound: () => {
      if (!isPro) ctx.consumeRound(gameId);
    },
  };
}
