import { describe, it, expect } from "vitest";
import { guitarLfvMap, guitarLfvText } from "../src/render/guitar_lfv.js";

describe("guitar LFV", () => {
  it("returns candidates within fret range", () => {
    const seq = [55, 57, 59, 60];
    const map = guitarLfvMap(seq, 5, 9);
    expect(map.length).toBe(4);
    for (const { candidates } of map) {
      for (const c of candidates) {
        expect(c.fret).toBeGreaterThanOrEqual(5);
        expect(c.fret).toBeLessThanOrEqual(9);
      }
    }
  });

  it("guitarLfvText produces readable output", () => {
    const seq = [55, 57];
    const text = guitarLfvText(seq, 5, 9);
    expect(text).toContain("55");
    expect(text.split("\n").length).toBe(2);
  });
});
