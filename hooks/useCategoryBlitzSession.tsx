import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Player } from '../types/game';

export interface CategoryBlitzMatchResult {
  /** Player id -> items named during their one timed turn. */
  scores: Record<string, number>;
}

interface CategoryBlitzSessionValue {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  matchResult: CategoryBlitzMatchResult | null;
  setMatchResult: (result: CategoryBlitzMatchResult | null) => void;
  reset: () => void;
}

const CategoryBlitzSessionContext = createContext<CategoryBlitzSessionValue | null>(null);

export function CategoryBlitzSessionProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchResult, setMatchResult] = useState<CategoryBlitzMatchResult | null>(null);

  const value = useMemo<CategoryBlitzSessionValue>(
    () => ({
      players,
      setPlayers,
      matchResult,
      setMatchResult,
      reset: () => {
        setPlayers([]);
        setMatchResult(null);
      },
    }),
    [players, matchResult]
  );

  return <CategoryBlitzSessionContext.Provider value={value}>{children}</CategoryBlitzSessionContext.Provider>;
}

export function useCategoryBlitzSession(): CategoryBlitzSessionValue {
  const ctx = useContext(CategoryBlitzSessionContext);
  if (!ctx) {
    throw new Error('useCategoryBlitzSession must be used within a CategoryBlitzSessionProvider');
  }
  return ctx;
}
