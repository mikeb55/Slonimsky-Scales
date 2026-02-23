export interface NotesMeta {
  rootMidi?: number;
  patternId?: number;
  styleName?: string;
}

export interface GceResult {
  score: number;
  reasons: string[];
}

export function evaluateSeed(params: {
  sequence: number[];
  styleName?: string;
  notesMeta?: NotesMeta;
}): GceResult {
  const { sequence } = params;
  const reasons: string[] = [];
  let score = 10;

  if (sequence.length === 0) {
    return { score: 0, reasons: ["Empty sequence"] };
  }

  const minMidi = Math.min(...sequence);
  const maxMidi = Math.max(...sequence);
  const range = maxMidi - minMidi;
  if (range > 24) {
    score -= 1;
    reasons.push("Wide register spread");
  }
  if (minMidi < 36 || maxMidi > 84) {
    score -= 1;
    reasons.push("Register outside typical bounds");
  }

  let maxLeap = 0;
  let stepwiseRun = 0;
  let maxStepwiseRun = 0;
  for (let i = 1; i < sequence.length; i++) {
    const leap = Math.abs(sequence[i] - sequence[i - 1]);
    maxLeap = Math.max(maxLeap, leap);
    if (leap <= 2) {
      stepwiseRun++;
      maxStepwiseRun = Math.max(maxStepwiseRun, stepwiseRun);
    } else {
      stepwiseRun = 0;
    }
  }
  if (maxLeap > 12) {
    score -= 1.5;
    reasons.push("Large leap detected");
  }
  if (maxStepwiseRun >= 6) {
    score -= 1;
    reasons.push("Long uninterrupted stepwise motion");
  }

  const period = detectPeriodicity(sequence);
  if (period > 0 && sequence.length >= period * 2) {
    score -= 1;
    reasons.push("Perfectly repeating periodicity (asymmetry preferred)");
  }

  score = Math.max(0, Math.min(10, score));
  if (reasons.length === 0) reasons.push("OK");
  return { score, reasons };
}

function detectPeriodicity(seq: number[]): number {
  for (let p = 1; p <= Math.floor(seq.length / 2); p++) {
    let ok = true;
    for (let i = p; i < seq.length && ok; i++) {
      if (seq[i] !== seq[i % p]) ok = false;
    }
    if (ok) return p;
  }
  return 0;
}

export async function generateWithGceGate<T>(
  generateFn: () => T | Promise<T>,
  opts: {
    minScore?: number;
    maxAttempts?: number;
    evaluate?: (result: T) => GceResult;
  }
): Promise<{ result: T; score: number; reasons: string[] } | null> {
  const minScore = opts.minScore ?? 9.0;
  const maxAttempts = opts.maxAttempts ?? 12;
  const evaluate = opts.evaluate;

  if (!evaluate) {
    const result = await generateFn();
    return { result, score: 10, reasons: ["No evaluator provided"] };
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await generateFn();
    const { score, reasons } = evaluate(result);
    if (score >= minScore) {
      return { result, score, reasons };
    }
  }
  return null;
}
