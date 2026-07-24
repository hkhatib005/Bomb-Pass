import { useCallback, useState } from 'react';
import { shuffle } from '../lib/random';

interface DeckState {
  deck: string[];
  index: number;
}

/** Shuffled, non-repeating cycle through `items` — reshuffles once the deck is exhausted. */
export function usePromptDeck(items: string[]) {
  const [state, setState] = useState<DeckState>(() => ({ deck: shuffle(items), index: 0 }));

  const next = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.deck.length) {
        return { deck: shuffle(items), index: 0 };
      }
      return { ...prev, index: nextIndex };
    });
  }, [items]);

  return { current: state.deck[state.index], next };
}
