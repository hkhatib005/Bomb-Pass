export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Pack {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
}

export type CategoryKind = 'freeform' | 'challenge';

export interface Category {
  id: string;
  name: string;
  /** Pack id this category belongs to. */
  pack: string;
  difficulty: Difficulty;
  /**
   * 'freeform' (default when absent): players name anything belonging to
   * the category — `items` is the pool of valid answers.
   * 'challenge': one specific prompt from `items` is shown and must be
   * solved/answered — e.g. a math problem or a riddle. Not used by games
   * (like Chameleon) that need a single shared "secret word" concept.
   */
  kind?: CategoryKind;
  items: string[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  isFree: boolean;
  /** Entry route for this game's screen flow. Absent while the game has no UI built yet. */
  route?: string;
}

export interface Player {
  id: string;
  name: string;
}

export type RoundStatus = 'idle' | 'active' | 'ended';

/**
 * Generic pass-the-phone round state. `endsAt` is always an absolute
 * timestamp (Date.now() + duration) rather than a decrementing counter,
 * so a round can't be paused or cheated by backgrounding the app.
 */
export interface RoundState {
  status: RoundStatus;
  categoryId: string | null;
  holderId: string | null;
  startedAt: number | null;
  endsAt: number | null;
}
