/**
 * Seeded xorshift32 PRNG for deterministic pattern variations.
 * Same seed always yields same sequence.
 */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}
