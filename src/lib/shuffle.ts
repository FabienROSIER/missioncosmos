/** Mélange Fisher–Yates (copie). */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** Permutation aléatoire des indices 0..n-1. */
export function shuffledIndices(length: number): number[] {
  return shuffleArray(Array.from({ length }, (_, i) => i));
}
