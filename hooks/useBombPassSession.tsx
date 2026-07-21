import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Player } from '../types/game';

export interface BombPassMatchResult {
  winnerId: string;
  /** Player ids in the order they were eliminated (first out, first in this list). */
  eliminationOrder: string[];
}

interface BombPassSessionValue {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  matchResult: BombPassMatchResult | null;
  setMatchResult: (result: BombPassMatchResult | null) => void;
  reset: () => void;
}

const BombPassSessionContext = createContext<BombPassSessionValue | null>(null);

export function BombPassSessionProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchResult, setMatchResult] = useState<BombPassMatchResult | null>(null);

  const value = useMemo<BombPassSessionValue>(
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

  return <BombPassSessionContext.Provider value={value}>{children}</BombPassSessionContext.Provider>;
}

export function useBombPassSession(): BombPassSessionValue {
  const ctx = useContext(BombPassSessionContext);
  if (!ctx) {
    throw new Error('useBombPassSession must be used within a BombPassSessionProvider');
  }
  return ctx;
}
