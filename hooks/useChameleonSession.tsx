import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Player } from '../types/game';

export interface ChameleonMatchResult {
  chameleonId: string;
  secretWord: string;
  categoryName: string;
  /** playerId -> the id of the player they voted for. */
  votes: Record<string, string>;
  /** Ids of the player(s) who received the most votes (ties possible). */
  mostVotedIds: string[];
  chameleonCaught: boolean;
}

interface ChameleonSessionValue {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  matchResult: ChameleonMatchResult | null;
  setMatchResult: (result: ChameleonMatchResult | null) => void;
  reset: () => void;
}

const ChameleonSessionContext = createContext<ChameleonSessionValue | null>(null);

export function ChameleonSessionProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchResult, setMatchResult] = useState<ChameleonMatchResult | null>(null);

  const value = useMemo<ChameleonSessionValue>(
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

  return <ChameleonSessionContext.Provider value={value}>{children}</ChameleonSessionContext.Provider>;
}

export function useChameleonSession(): ChameleonSessionValue {
  const ctx = useContext(ChameleonSessionContext);
  if (!ctx) {
    throw new Error('useChameleonSession must be used within a ChameleonSessionProvider');
  }
  return ctx;
}
