import { describe, it, expect } from "vitest";
import { loadPatterns, getPatternById, listPatterns } from "../src/library/load.js";

describe("pattern loading", () => {
  it("loads patterns from library", () => {
    const patterns = loadPatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(12);
  });

  it("getPatternById returns pattern", () => {
    const p = getPatternById(1);
    expect(p).toBeDefined();
    expect(p!.id).toBe(1);
    expect(p!.intervals).toBeInstanceOf(Array);
    expect(p!.intervals.length).toBeGreaterThan(0);
  });

  it("getPatternById returns undefined for missing", () => {
    expect(getPatternById(9999)).toBeUndefined();
  });

  it("listPatterns filters by tag", () => {
    const list = listPatterns({ tag: "symmetric" });
    expect(list.length).toBeGreaterThan(0);
    list.forEach((p) => expect(p.tags).toContain("symmetric"));
  });

  it("listPatterns filters by kind", () => {
    const list = listPatterns({ kind: "equal_division" });
    expect(list.length).toBeGreaterThan(0);
    list.forEach((p) => expect(p.kind).toBe("equal_division"));
  });
});
