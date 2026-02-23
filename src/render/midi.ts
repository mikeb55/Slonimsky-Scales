import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Midi } = require("@tonejs/midi");

export interface MidiWriteOptions {
  bpm?: number;
  outPath: string;
  noteLengthBeats?: number;
  velocity?: number;
}

export function writeMidi(
  sequence: number[],
  opts: MidiWriteOptions
): void {
  const bpm = opts.bpm ?? 90;
  const noteLengthBeats = opts.noteLengthBeats ?? 0.5;
  const velocity = opts.velocity ?? 80;

  const midi = new Midi();
  const track = midi.addTrack();
  track.name = "Slonimsky Pattern";

  const secondsPerBeat = 60 / bpm;
  let time = 0;

  for (const midiNote of sequence) {
    track.addNote({
      midi: midiNote,
      time,
      duration: noteLengthBeats * secondsPerBeat,
      velocity: velocity / 127,
    });
    time += noteLengthBeats * secondsPerBeat;
  }

  const dir = dirname(opts.outPath);
  if (dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(opts.outPath, Buffer.from(midi.toArray()));
}
