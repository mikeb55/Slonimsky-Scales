#!/usr/bin/env node
import { Command } from "commander";
import { listPatterns, getPatternById } from "../library/load.js";
import { realizePattern } from "../core/realize.js";
import { applyEcmOrbitStyle } from "../styles/ecm_orbit.js";
import { writeMidi } from "../render/midi.js";
import { guitarLfvMap, guitarLfvText } from "../render/guitar_lfv.js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const PITCH_TO_MIDI: Record<string, number> = {};
const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
for (let oct = -1; oct <= 9; oct++) {
  for (let i = 0; i < 12; i++) {
    PITCH_TO_MIDI[names[i] + oct] = (oct + 1) * 12 + i;
    PITCH_TO_MIDI[flatNames[i] + oct] = (oct + 1) * 12 + i;
  }
}

function parseRoot(s: string): number {
  const m = s.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!m) throw new Error(`Invalid root: ${s}`);
  const name = m[1];
  const oct = parseInt(m[2], 10);
  const key = name.charAt(0).toUpperCase() + (name.slice(1) || "");
  const midi = PITCH_TO_MIDI[key + oct];
  if (midi == null) throw new Error(`Invalid root: ${s}`);
  return midi;
}

function midiToPitchName(midi: number): string {
  const oct = Math.floor(midi / 12) - 1;
  const pc = midi % 12;
  return names[pc] + oct;
}

const program = new Command();

program
  .name("slon")
  .description("Slonimsky-inspired pattern engine CLI")
  .version("1.0.0");

program
  .command("list")
  .description("List patterns")
  .option("--tag <tag>", "Filter by tag")
  .option("--kind <kind>", "Filter by kind")
  .action((opts) => {
    const list = listPatterns({
      tag: opts.tag,
      kind: opts.kind,
    });
    for (const p of list) {
      console.log(`${p.id}. ${p.name} [${p.kind}] ${p.tags.join(", ")}`);
    }
  });

program
  .command("show")
  .description("Show pattern details")
  .requiredOption("--id <id>", "Pattern ID")
  .action((opts) => {
    const p = getPatternById(parseInt(opts.id, 10));
    if (!p) {
      console.error("Pattern not found");
      process.exit(1);
    }
    console.log(JSON.stringify(p, null, 2));
  });

program
  .command("gen")
  .description("Generate a sequence")
  .requiredOption("--id <id>", "Pattern ID")
  .requiredOption("--root <pitch>", "Root pitch (e.g. D3)")
  .requiredOption("--out <path>", "Output path (.mid or .json)")
  .option("--len <n>", "Length", "16")
  .option("--dir <dir>", "Direction: up | down | pendulum", "up")
  .option("--style <name>", "Style preset (e.g. ecm_orbit)")
  .option("--range <min-max>", "MIDI range (e.g. 55-79)")
  .option("--seed <n>", "Seed for determinism")
  .action((opts) => {
    const rootMidi = parseRoot(opts.root);
    const len = parseInt(opts.len, 10);
    const seed = opts.seed != null ? parseInt(opts.seed, 10) : undefined;

    let seq = realizePattern({
      patternId: parseInt(opts.id, 10),
      rootMidi,
      length: len,
      direction: opts.dir,
      seed,
    });

    if (opts.style === "ecm_orbit") {
      const [minMidi, maxMidi] = opts.range
        ? opts.range.split("-").map((x: string) => parseInt(x, 10))
        : [55, 79];
      seq = applyEcmOrbitStyle(seq, { minMidi, maxMidi });
    } else if (opts.range) {
      const [minMidi, maxMidi] = opts.range.split("-").map((x: string) => parseInt(x, 10));
      seq = seq.map((n) => Math.max(minMidi, Math.min(maxMidi, n)));
    }

    const outPath = opts.out;
    const dir = dirname(outPath);
    if (dir && dir !== ".") mkdirSync(dir, { recursive: true });

    if (outPath.endsWith(".mid")) {
      writeMidi(seq, { outPath, bpm: 90, noteLengthBeats: 0.5 });
      console.log(`Wrote MIDI to ${outPath}`);
    } else if (outPath.endsWith(".json")) {
      const data = {
        midi: seq,
        pitchNames: seq.map(midiToPitchName),
      };
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`Wrote JSON to ${outPath}`);
    } else {
      console.error("Output must end with .mid or .json");
      process.exit(1);
    }
  });

program
  .command("guitar")
  .description("Guitar LFV map")
  .requiredOption("--id <id>", "Pattern ID")
  .requiredOption("--root <pitch>", "Root pitch (e.g. D3)")
  .requiredOption("--out <path>", "Output path (.json or .txt)")
  .option("--len <n>", "Length", "12")
  .option("--lfv <min-max>", "Fret range (e.g. 5-9)", "5-9")
  .action((opts) => {
    const rootMidi = parseRoot(opts.root);
    const len = parseInt(opts.len, 10);
    const [minFret, maxFret] = opts.lfv.split("-").map((x: string) => parseInt(x, 10));

    const seq = realizePattern({
      patternId: parseInt(opts.id, 10),
      rootMidi,
      length: len,
    });

    const outPath = opts.out;
    const dir = dirname(outPath);
    if (dir && dir !== ".") mkdirSync(dir, { recursive: true });

    if (outPath.endsWith(".json")) {
      const map = guitarLfvMap(seq, minFret, maxFret);
      writeFileSync(outPath, JSON.stringify(map, null, 2));
      console.log(`Wrote LFV JSON to ${outPath}`);
    } else {
      const text = guitarLfvText(seq, minFret, maxFret);
      writeFileSync(outPath, text);
      console.log(`Wrote LFV text to ${outPath}`);
    }
  });

program.parse();
