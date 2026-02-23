import type { Pattern } from "../library/schema.js";
import { getPatternById } from "../library/load.js";
import { transpose } from "./transform.js";
import { createSeededRng } from "./determinism.js";

export type Direction = "up" | "down" | "pendulum";

export interface RealizeOptions {
  patternId: number;
  rootMidi: number;
  length?: number;
  direction?: Direction;
  seed?: number;
}

export function realizePattern(opts: RealizeOptions): number[] {
  const pattern = getPatternById(opts.patternId);
  if (!pattern) throw new Error(`Pattern ${opts.patternId} not found`);

  const length = opts.length ?? pattern.defaultLength;
  const direction = opts.direction ?? "up";
  const rng = opts.seed != null ? createSeededRng(opts.seed) : null;

  const intervals = [...pattern.intervals];
  if (intervals.length === 0) return [];

  let acc = opts.rootMidi;
  const out: number[] = [acc];
  let idx = 0;
  let step = 1;

  if (direction === "down") step = -1;
  if (direction === "pendulum") {
    const r = rng ? rng() : 0.5;
    step = r < 0.5 ? 1 : -1;
  }

  while (out.length < length) {
    const interval = intervals[idx % intervals.length];
    const delta = step * interval;
    acc += delta;

    if (pattern.wrap && pattern.octaveSpan > 0) {
      acc = ((acc - opts.rootMidi) % pattern.octaveSpan) + opts.rootMidi;
      if (acc < opts.rootMidi) acc += pattern.octaveSpan;
    }

    out.push(acc);
    idx++;

    if (direction === "pendulum" && rng && idx % 2 === 0) {
      step = -step;
    }
  }

  return out;
}
