import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { CATEGORIES } from '../content/categories';
import { CHALLENGE_CATEGORIES } from '../content/challenges';
import { pickRandom, pickRandomExcluding, randomIntBetween } from '../lib/random';
import type { Category, Player } from '../types/game';

// Bomb Pass draws from every category — freeform ("name something in X") and
// challenge ("solve this specific prompt") alike. Chameleon only uses the
// freeform CATEGORIES export, since a challenge has no single "secret word".
const ALL_CATEGORIES: Category[] = [...CATEGORIES, ...CHALLENGE_CATEGORIES];

export type BombPassPhase = 'active' | 'detonated' | 'match-over';

export interface BombPassPlayerState {
  id: string;
  name: string;
  lives: number;
  eliminated: boolean;
}

export interface BombPassRoundView {
  phase: BombPassPhase;
  players: BombPassPlayerState[];
  holder: BombPassPlayerState | null;
  category: Category | null;
  /** For a 'challenge' category: the one specific prompt to solve this round. Null for freeform categories. */
  currentPrompt: string | null;
  roundNumber: number;
  lastHit: BombPassPlayerState | null;
  winner: BombPassPlayerState | null;
  eliminationOrder: string[];
  /** True for ~1s right after a pass, while a repeat tap is ignored. */
  isCoolingDown: boolean;
  /** Passes the bomb to the next player. No-op outside the cooldown window or an active round. */
  pass: () => void;
  /** Advances from the post-detonation overlay into the next mini-round. */
  continueAfterDetonation: () => void;
}

const MIN_FUSE_MS = 15000;
const MAX_FUSE_MS = 45000;
const CHECK_INTERVAL_MS = 100;
const PASS_COOLDOWN_MS = 1000;
const TICK_MIN_INTERVAL_MS = 90;
const TICK_MAX_INTERVAL_MS = 800;
const STARTING_LIVES = 3;

/** Ticks speed up as the fuse burns down; randomness keeps the exact moment unpredictable. */
function computeTickInterval(remainingMs: number, totalMs: number): number {
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const base = TICK_MIN_INTERVAL_MS + (TICK_MAX_INTERVAL_MS - TICK_MIN_INTERVAL_MS) * fraction;
  const jitter = base * (Math.random() * 0.3 - 0.15);
  return Math.max(50, base + jitter);
}

/**
 * Next alive player after `currentId`, walking the roster's original order.
 * Unlike filtering to alive ids first, this still resolves correctly when
 * `currentId` was just eliminated (and so is no longer alive itself).
 */
function getNextAliveId(players: BombPassPlayerState[], currentId: string | null): string | null {
  if (players.length === 0) return null;
  const startIdx = currentId !== null ? players.findIndex((p) => p.id === currentId) : -1;
  for (let offset = 1; offset <= players.length; offset++) {
    const candidate = players[(startIdx + offset + players.length) % players.length];
    if (candidate && !candidate.eliminated) return candidate.id;
  }
  return null;
}

export function useBombPassRound(roster: Player[]): BombPassRoundView {
  useKeepAwake();

  const [players, setPlayers] = useState<BombPassPlayerState[]>(() =>
    roster.map((p) => ({ id: p.id, name: p.name, lives: STARTING_LIVES, eliminated: false }))
  );
  const [holderId, setHolderId] = useState<string | null>(() => (roster.length > 0 ? pickRandom(roster).id : null));
  const [category, setCategory] = useState<Category | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [phase, setPhase] = useState<BombPassPhase>('active');
  const [roundNumber, setRoundNumber] = useState(1);
  const [eliminationOrder, setEliminationOrder] = useState<string[]>([]);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
    };
  }, []);

  // Absolute timestamps, never decrementing counters, so backgrounding the
  // app can't pause or otherwise be exploited to dodge the fuse.
  const endsAtRef = useRef(0);
  const fuseTotalRef = useRef(0);
  const canPassAtRef = useRef(0);
  const nextTickAtRef = useRef(0);

  const tickSoundRef = useRef<Audio.Sound | null>(null);
  const explosionSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    (async () => {
      const [tickResult, explosionResult] = await Promise.allSettled([
        Audio.Sound.createAsync(require('../assets/audio/tick.wav')),
        Audio.Sound.createAsync(require('../assets/audio/explosion.wav')),
      ]);
      const tick = tickResult.status === 'fulfilled' ? tickResult.value.sound : null;
      const explosion = explosionResult.status === 'fulfilled' ? explosionResult.value.sound : null;
      if (cancelled) {
        tick?.unloadAsync();
        explosion?.unloadAsync();
        return;
      }
      tickSoundRef.current = tick;
      explosionSoundRef.current = explosion;
    })();
    return () => {
      cancelled = true;
      tickSoundRef.current?.unloadAsync();
      explosionSoundRef.current?.unloadAsync();
    };
  }, []);

  const startFuse = useCallback((excludeCategory: Category | null) => {
    const fuseMs = randomIntBetween(MIN_FUSE_MS, MAX_FUSE_MS);
    const now = Date.now();
    fuseTotalRef.current = fuseMs;
    endsAtRef.current = now + fuseMs;
    nextTickAtRef.current = now + computeTickInterval(fuseMs, fuseMs);
    canPassAtRef.current = now;
    const nextCategory = pickRandomExcluding(ALL_CATEGORIES, excludeCategory);
    setCategory(nextCategory);
    setCurrentPrompt(nextCategory.kind === 'challenge' ? pickRandom(nextCategory.items) : null);
  }, []);

  // Start the very first fuse on mount.
  useEffect(() => {
    startFuse(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detonate = useCallback(() => {
    if (phase !== 'active' || !holderId) return;

    explosionSoundRef.current?.replayAsync().catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const next = players.map((p) => {
      if (p.id !== holderId) return p;
      const lives = p.lives - 1;
      return { ...p, lives, eliminated: lives <= 0 };
    });

    setPlayers(next);

    const hit = next.find((p) => p.id === holderId);
    if (hit?.eliminated) {
      setEliminationOrder((order) => [...order, holderId]);
    }

    const alive = next.filter((p) => !p.eliminated);
    setPhase(alive.length <= 1 ? 'match-over' : 'detonated');
  }, [phase, holderId, players]);

  // 100ms polling loop: checks elapsed time against the absolute end
  // timestamp and schedules the next accelerating tick.
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      const now = Date.now();

      if (now >= endsAtRef.current) {
        detonate();
        return;
      }

      if (now >= nextTickAtRef.current) {
        tickSoundRef.current?.replayAsync().catch(() => {});
        const remaining = endsAtRef.current - now;
        nextTickAtRef.current = now + computeTickInterval(remaining, fuseTotalRef.current);
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [phase, detonate]);

  const pass = useCallback(() => {
    if (phase !== 'active') return;
    const now = Date.now();
    if (now < canPassAtRef.current) return;

    const nextId = getNextAliveId(players, holderId);
    if (!nextId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setHolderId(nextId);
    canPassAtRef.current = Date.now() + PASS_COOLDOWN_MS;

    setIsCoolingDown(true);
    if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
    cooldownTimeoutRef.current = setTimeout(() => setIsCoolingDown(false), PASS_COOLDOWN_MS);
  }, [phase, holderId, players]);

  const continueAfterDetonation = useCallback(() => {
    if (phase !== 'detonated') return;
    // holderId still points at whoever was just hit: pass() is a no-op
    // outside the 'active' phase, so it hasn't moved since detonation.
    const nextId = getNextAliveId(players, holderId);
    if (!nextId) return;

    setRoundNumber((n) => n + 1);
    startFuse(category);
    setHolderId(nextId);
    setPhase('active');
  }, [phase, players, holderId, category, startFuse]);

  const holder = players.find((p) => p.id === holderId) ?? null;

  return {
    phase,
    players,
    holder,
    category,
    currentPrompt,
    roundNumber,
    lastHit: phase !== 'active' ? holder : null,
    winner: phase === 'match-over' ? players.find((p) => !p.eliminated) ?? null : null,
    eliminationOrder,
    isCoolingDown,
    pass,
    continueAfterDetonation,
  };
}
