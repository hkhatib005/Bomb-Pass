import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '../content/categories';
import { pickRandom, shuffle } from '../lib/random';
import type { Category, Player } from '../types/game';

export type ChameleonPhase = 'reveal' | 'discussion' | 'voting' | 'results';

const DISCUSSION_DURATION_MS = 90_000;
const DISCUSSION_TICK_MS = 250;

export interface ChameleonResult {
  chameleonId: string;
  secretWord: string;
  votes: Record<string, string>;
  voteTally: Record<string, number>;
  mostVotedIds: string[];
  chameleonCaught: boolean;
}

export interface ChameleonRoundView {
  phase: ChameleonPhase;
  category: Category;
  words: string[];
  secretWord: string;
  chameleonId: string;
  currentRevealer: Player | null;
  currentVoter: Player | null;
  votableTargets: Player[];
  discussionSecondsRemaining: number;
  advanceReveal: () => void;
  startVoting: () => void;
  castVote: (votedForId: string) => void;
  result: ChameleonResult | null;
}

export function useChameleonRound(roster: Player[]): ChameleonRoundView {
  const [category] = useState<Category>(() => pickRandom(CATEGORIES));
  const [words] = useState<string[]>(() => shuffle(category.items).slice(0, 16));
  const [secretWord] = useState<string>(() => pickRandom(words));
  const [chameleonId] = useState<string>(() => (roster.length > 0 ? pickRandom(roster).id : ''));

  const [phase, setPhase] = useState<ChameleonPhase>('reveal');
  const [revealIndex, setRevealIndex] = useState(0);
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [discussionSecondsRemaining, setDiscussionSecondsRemaining] = useState(
    Math.ceil(DISCUSSION_DURATION_MS / 1000)
  );

  const discussionEndsAtRef = useRef(0);

  const startVoting = useCallback(() => {
    setPhase((current) => (current === 'discussion' ? 'voting' : current));
  }, []);

  const advanceReveal = useCallback(() => {
    setRevealIndex((index) => {
      const next = index + 1;
      if (next >= roster.length) {
        discussionEndsAtRef.current = Date.now() + DISCUSSION_DURATION_MS;
        setDiscussionSecondsRemaining(Math.ceil(DISCUSSION_DURATION_MS / 1000));
        setPhase('discussion');
        return index;
      }
      return next;
    });
  }, [roster.length]);

  useEffect(() => {
    if (phase !== 'discussion') return;
    const interval = setInterval(() => {
      const remainingMs = discussionEndsAtRef.current - Date.now();
      if (remainingMs <= 0) {
        setDiscussionSecondsRemaining(0);
        startVoting();
        return;
      }
      setDiscussionSecondsRemaining(Math.ceil(remainingMs / 1000));
    }, DISCUSSION_TICK_MS);
    return () => clearInterval(interval);
  }, [phase, startVoting]);

  const castVote = useCallback(
    (votedForId: string) => {
      if (phase !== 'voting') return;
      const voter = roster[voteIndex];
      if (!voter) return;

      setVotes((prev) => ({ ...prev, [voter.id]: votedForId }));
      setVoteIndex((index) => {
        const next = index + 1;
        if (next >= roster.length) setPhase('results');
        return next;
      });
    },
    [phase, roster, voteIndex]
  );

  const result = useMemo<ChameleonResult | null>(() => {
    if (phase !== 'results') return null;

    const voteTally: Record<string, number> = {};
    roster.forEach((p) => {
      voteTally[p.id] = 0;
    });
    Object.values(votes).forEach((votedForId) => {
      voteTally[votedForId] = (voteTally[votedForId] ?? 0) + 1;
    });

    const maxVotes = Math.max(0, ...Object.values(voteTally));
    const mostVotedIds = roster.filter((p) => voteTally[p.id] === maxVotes && maxVotes > 0).map((p) => p.id);

    return {
      chameleonId,
      secretWord,
      votes,
      voteTally,
      mostVotedIds,
      chameleonCaught: mostVotedIds.includes(chameleonId),
    };
  }, [phase, roster, votes, chameleonId, secretWord]);

  return {
    phase,
    category,
    words,
    secretWord,
    chameleonId,
    currentRevealer: roster[revealIndex] ?? null,
    currentVoter: roster[voteIndex] ?? null,
    votableTargets: roster.filter((p) => p.id !== roster[voteIndex]?.id),
    discussionSecondsRemaining,
    advanceReveal,
    startVoting,
    castVote,
    result,
  };
}
