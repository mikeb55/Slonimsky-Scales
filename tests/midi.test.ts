import { describe, it, expect } from "vitest";
import { writeMidi } from "../src/render/midi.js";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

describe("midi renderer", () => {
  const outPath = join(process.cwd(), "dist", "test_output.mid");

  it("writes non-empty MIDI file", () => {
    const seq = [60, 64, 67, 72];
    writeMidi(seq, { outPath });
    expect(existsSync(outPath)).toBe(true);
    const buf = readFileSync(outPath);
    expect(buf.length).toBeGreaterThan(0);
    expect(buf[0]).toBe(0x4d);
    expect(buf[1]).toBe(0x54);
    expect(buf[2]).toBe(0x68);
    expect(buf[3]).toBe(0x64);
  });

  it("creates directory if needed", () => {
    const deepPath = join(process.cwd(), "dist", "sub", "dir", "test.mid");
    writeMidi([60], { outPath: deepPath });
    expect(existsSync(deepPath)).toBe(true);
  });
});
