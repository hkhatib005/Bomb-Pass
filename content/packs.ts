import type { Pack } from '../types/game';

export const PACKS: Pack[] = [
  {
    id: 'party-classics',
    name: 'Party Classics',
    description: 'Easy, universally-known categories. The perfect place to start.',
    isFree: true,
  },
  {
    id: 'pop-culture',
    name: 'Pop Culture',
    description: 'Movies, music, and internet culture.',
    isFree: true,
  },
  {
    id: 'around-the-world',
    name: 'Around the World',
    description: 'Geography, languages, and landmarks from every continent.',
    isFree: false,
  },
  {
    id: 'food-and-snacks',
    name: 'Food & Snacks',
    description: 'For food fans. Toppings, spices, desserts, and more.',
    isFree: false,
  },
  {
    id: 'quick-challenges',
    name: 'Quick Challenges',
    description: 'Solve-it-yourself prompts — math, riddles, would-you-rathers, and dares. Available free, app-wide.',
    isFree: true,
  },
];
