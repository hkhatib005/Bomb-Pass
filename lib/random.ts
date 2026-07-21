export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Picks a random item, avoiding `exclude` when the list has more than one option. */
export function pickRandomExcluding<T>(items: T[], exclude: T | null): T {
  if (items.length <= 1 || exclude === null) return pickRandom(items);
  const candidates = items.filter((item) => item !== exclude);
  return pickRandom(candidates.length > 0 ? candidates : items);
}

/** Fisher-Yates shuffle; does not mutate the input array. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
