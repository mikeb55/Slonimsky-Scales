export function transpose(sequence: number[], semitones: number): number[] {
  return sequence.map((n) => n + semitones);
}

export function invert(sequence: number[], axisMidi: number): number[] {
  return sequence.map((n) => axisMidi * 2 - n);
}

export function rotateIntervals(intervals: number[], n: number): number[] {
  if (intervals.length === 0) return [];
  const k = ((n % intervals.length) + intervals.length) % intervals.length;
  return [...intervals.slice(k), ...intervals.slice(0, k)];
}

export function mirrorIntervals(intervals: number[]): number[] {
  return [...intervals].reverse();
}

export function clampToRange(
  sequence: number[],
  minMidi: number,
  maxMidi: number
): number[] {
  return sequence.map((n) => Math.max(minMidi, Math.min(maxMidi, n)));
}
