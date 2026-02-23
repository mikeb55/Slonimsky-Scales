import { describe, it, expect } from "vitest";
import { realizePattern } from "../src/core/realize.js";
import { transpose, invert } from "../src/core/transform.js";

describe("realize", () => {
  it("realizes pattern with default length", () => {
    const seq = realizePattern({ patternId: 1, rootMidi: 60 });
    expect(seq.length).toBeGreaterThan(0);
    expect(seq[0]).toBe(60);
  });

  it("realizes pattern with specified length", () => {
    const seq = realizePattern({ patternId: 1, rootMidi: 60, length: 8 });
    expect(seq.length).toBe(8);
  });

  it("determinism with seed", () => {
    const a = realizePattern({ patternId: 1, rootMidi: 60, length: 16, direction: "pendulum", seed: 42 });
    const b = realizePattern({ patternId: 1, rootMidi: 60, length: 16, direction: "pendulum", seed: 42 });
    expect(a).toEqual(b);
  });

  it("transpose shifts sequence", () => {
    const seq = [60, 64, 67];
    const t = transpose(seq, 2);
    expect(t).toEqual([62, 66, 69]);
  });

  it("invert mirrors around axis", () => {
    const seq = [60, 64, 67];
    const inv = invert(seq, 64);
    expect(inv[0]).toBe(68);
    expect(inv[1]).toBe(64);
    expect(inv[2]).toBe(61);
  });
});
