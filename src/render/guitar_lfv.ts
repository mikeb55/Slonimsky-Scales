const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4 (MIDI)

export interface LfvCandidate {
  midi: number;
  stringIndex: number;
  fret: number;
  stringName: string;
}

const STRING_NAMES = ["E2", "A2", "D3", "G3", "B3", "E4"];

function midiToFret(stringMidi: number, targetMidi: number): number {
  return targetMidi - stringMidi;
}

export function guitarLfvMap(
  sequence: number[],
  minFret: number,
  maxFret: number
): Array<{ midi: number; candidates: LfvCandidate[] }> {
  const result: Array<{ midi: number; candidates: LfvCandidate[] }> = [];

  for (const midi of sequence) {
    const candidates: LfvCandidate[] = [];
    for (let s = 0; s < STANDARD_TUNING.length; s++) {
      const fret = midiToFret(STANDARD_TUNING[s], midi);
      if (fret >= minFret && fret <= maxFret && fret >= 0) {
        candidates.push({
          midi,
          stringIndex: s,
          fret,
          stringName: STRING_NAMES[s],
        });
      }
    }
    result.push({ midi, candidates });
  }
  return result;
}

export function guitarLfvText(
  sequence: number[],
  minFret: number,
  maxFret: number
): string {
  const map = guitarLfvMap(sequence, minFret, maxFret);
  const lines: string[] = [];
  for (const { midi, candidates } of map) {
    const pitch = midiToPitchName(midi);
    const candStr = candidates
      .map((c) => `${c.stringName}:${c.fret}`)
      .join(" | ");
    lines.push(`${pitch} (${midi}): ${candStr || "no candidate"}`);
  }
  return lines.join("\n");
}

function midiToPitchName(midi: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const oct = Math.floor(midi / 12) - 1;
  const pc = midi % 12;
  return names[pc] + oct;
}
