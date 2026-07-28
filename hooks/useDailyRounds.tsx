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

function storageKey(gameId: string): string {
  return `daily-rounds:${gameId}:${todayString()}`;
}

interface DailyRoundsContextValue {
  loaded: boolean;
  usedByGame: Record<string, number>;
  consumeRound: (gameId: string) => void;
}

const DailyRoundsContext = createContext<DailyRoundsContextValue | null>(null);

export function DailyRoundsProvider({ children }: { children: ReactNode }) {
  const [usedByGame, setUsedByGame] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(
      TRIAL_GAME_IDS.map((id) =>
        AsyncStorage.getItem(storageKey(id)).then((value) => [id, value ? parseInt(value, 10) || 0 : 0] as const)
      )
    ).then((pairs) => {
      setUsedByGame(Object.fromEntries(pairs));
      setLoaded(true);
    });
  }, []);

  // Persists on every change rather than inside the setState updater, so the
  // write only ever happens after the real stored values have been loaded.
  useEffect(() => {
    if (!loaded) return;
    for (const [gameId, count] of Object.entries(usedByGame)) {
      AsyncStorage.setItem(storageKey(gameId), String(count)).catch(() => {});
    }
  }, [usedByGame, loaded]);

  const consumeRound = useCallback((gameId: string) => {
    setUsedByGame((prev) => ({ ...prev, [gameId]: (prev[gameId] ?? 0) + 1 }));
  }, []);

  const value = useMemo(() => ({ loaded, usedByGame, consumeRound }), [loaded, usedByGame, consumeRound]);

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

  const usedToday = ctx.usedByGame[gameId] ?? 0;
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
