import type { Game } from '../types/game';

/**
 * Central game registry. Bomb Pass and Chameleon share a daily pool of free
 * rounds (see hooks/useDailyRounds.tsx); every other game is Pro-only, with
 * no free rounds at all. The `pro` entitlement removes both restrictions.
 */
export const GAMES: Game[] = [
  {
    id: 'bomb-pass',
    title: 'Bomb Pass',
    description: "Pass the phone before the bomb goes off. Name something from the category before time runs out.",
    minPlayers: 3,
    maxPlayers: 12,
    hasFreeTrial: true,
    route: '/bomb-pass/setup',
  },
  {
    id: 'chameleon',
    title: 'Chameleon',
    description: 'Everyone knows the secret word except the chameleon. Find the impostor before they blend in.',
    minPlayers: 3,
    maxPlayers: 10,
    hasFreeTrial: true,
    route: '/chameleon/setup',
  },
  {
    id: 'most-likely-to',
    title: 'Most Likely To',
    description: 'Vote on who in the group is most likely to... Hilarious debates guaranteed.',
    minPlayers: 3,
    maxPlayers: 12,
    hasFreeTrial: false,
    route: '/most-likely-to',
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Impossible choices, instant arguments. Pick a side and defend it.',
    minPlayers: 2,
    maxPlayers: 12,
    hasFreeTrial: false,
    route: '/would-you-rather',
  },
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    description: 'Answer honestly, or take on a dare in front of everyone.',
    minPlayers: 2,
    maxPlayers: 10,
    hasFreeTrial: false,
    route: '/truth-or-dare',
  },
  {
    id: 'category-blitz',
    title: 'Category Blitz',
    description: 'Race the clock to name items from a category before you run out of ideas.',
    minPlayers: 2,
    maxPlayers: 8,
    hasFreeTrial: false,
    route: '/category-blitz/setup',
  },
];

export function getGameById(id: string): Game | undefined {
  return GAMES.find((game) => game.id === id);
}
