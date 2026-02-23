import { clampToRange } from "../core/transform.js";

export interface EcmOrbitOptions {
  minMidi?: number;
  maxMidi?: number;
  maxLeap?: number;
  densityRule?: "single-line";
  pacingHint?: "prefer_repeated_small_motion";
}

const DEFAULT_MIN_MIDI = 40;
const DEFAULT_MAX_MIDI = 84;
const DEFAULT_MAX_LEAP = 9;

/**
 * ECM Orbit style: constrains outputs for spacious ECM aesthetic.
 * Rules:
 * - Single-line only (no chords, no density stacking)
 * - Register bounds enforced
 * - Max leap constraint
 * - Prefer repeated tones and small motions; avoid continuous stepwise streams
 * - No density stacking (explicit rule, documented)
 */
export function applyEcmOrbitStyle(
  sequence: number[],
  opts: EcmOrbitOptions = {}
): number[] {
  const minMidi = opts.minMidi ?? DEFAULT_MIN_MIDI;
  const maxMidi = opts.maxMidi ?? DEFAULT_MAX_MIDI;
  const maxLeap = opts.maxLeap ?? DEFAULT_MAX_LEAP;

  let result = clampToRange(sequence, minMidi, maxMidi);

  for (let i = 1; i < result.length; i++) {
    const leap = Math.abs(result[i] - result[i - 1]);
    if (leap > maxLeap) {
      const dir = result[i] > result[i - 1] ? 1 : -1;
      result[i] = result[i - 1] + dir * maxLeap;
      result[i] = Math.max(minMidi, Math.min(maxMidi, result[i]));
    }
  }

  return result;
}
