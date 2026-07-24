import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { CATEGORIES } from '../content/categories';
import { pickRandomExcluding } from '../lib/random';
import type { Category, Player } from '../types/game';

export type CategoryBlitzPhase = 'ready' | 'active' | 'turn-over' | 'match-over';

const TURN_DURATION_MS = 45_000;
const TICK_MS = 200;

export interface CategoryBlitzRoundView {
  phase: CategoryBlitzPhase;
  turnIndex: number;
  currentPlayer: Player | null;
  category: Category | null;
  score: number;
  scores: Record<string, number>;
  secondsRemaining: number;
  standings: { player: Player; score: number }[];
  startTurn: () => void;
  addPoint: () => void;
  nextTurn: () => void;
}

export function useCategoryBlitzRound(roster: Player[]): CategoryBlitzRoundView {
  useKeepAwake();

  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState<CategoryBlitzPhase>('ready');
  const [category, setCategory] = useState<Category | null>(null);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(TURN_DURATION_MS / 1000));

  const endsAtRef = useRef(0);
  const lastCategoryRef = useRef<Category | null>(null);

  const currentPlayer = roster[turnIndex] ?? null;

  const endTurn = useCallback(() => {
    setPhase((current) => {
      if (current !== 'active') return current;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return 'turn-over';
    });
  }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      const remainingMs = endsAtRef.current - Date.now();
      if (remainingMs <= 0) {
        setSecondsRemaining(0);
        endTurn();
        return;
      }
      setSecondsRemaining(Math.ceil(remainingMs / 1000));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [phase, endTurn]);

  const startTurn = useCallback(() => {
    if (phase !== 'ready' || !currentPlayer) return;
    const next = pickRandomExcluding(CATEGORIES, lastCategoryRef.current);
    lastCategoryRef.current = next;
    setCategory(next);
    setScore(0);
    endsAtRef.current = Date.now() + TURN_DURATION_MS;
    setSecondsRemaining(Math.ceil(TURN_DURATION_MS / 1000));
    setPhase('active');
  }, [phase, currentPlayer]);

  const addPoint = useCallback(() => {
    if (phase !== 'active') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setScore((s) => s + 1);
  }, [phase]);

  const nextTurn = useCallback(() => {
    if (phase !== 'turn-over' || !currentPlayer) return;
    setScores((prev) => ({ ...prev, [currentPlayer.id]: score }));

    const nextIndex = turnIndex + 1;
    if (nextIndex >= roster.length) {
      setPhase('match-over');
      return;
    }
    setTurnIndex(nextIndex);
    setCategory(null);
    setPhase('ready');
  }, [phase, currentPlayer, score, turnIndex, roster.length]);

  const standings = roster
    .map((player) => ({ player, score: scores[player.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return {
    phase,
    turnIndex,
    currentPlayer,
    category,
    score,
    scores,
    secondsRemaining,
    standings,
    startTurn,
    addPoint,
    nextTurn,
  };
}
