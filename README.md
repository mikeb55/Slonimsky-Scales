# Slonominsky-Scales

A reusable Slonimsky-inspired scale/pattern engine. Stores abstract interval structures (no copyrighted content), realizes them deterministically, and exports to MIDI or guitar LFV maps.

## What It Is

- Machine-readable pattern library (JSON)
- Deterministic pattern realization (interval math)
- CLI tool `slon` to list patterns and generate outputs
- Two renderers: MIDI export, Guitar LFV map (text/JSON)
- ECM Orbit style preset for spacious, single-line outputs
- GCE >= 9.0 evaluation hook for future composition features

## Installation

```bash
npm install
npm run build
```

## CLI Examples

List all patterns:

```bash
npx slon list
```

Filter by tag or kind:

```bash
npx slon list --tag symmetric
npx slon list --kind interpolation
```

Show pattern details:

```bash
npx slon show --id 3
```

Generate a sequence (MIDI or JSON):

```bash
npx slon gen --id 3 --root D3 --len 16 --dir up --style ecm_orbit --range 55-79 --out ./out/seed.mid
npx slon gen --id 1 --root D3 --len 16 --out ./out/seed.json
```

Guitar LFV map:

```bash
npx slon guitar --id 3 --root D3 --len 12 --lfv 5-9 --out ./out/lfv.json
```

## Pattern JSON Format

Patterns live in `src/library/patterns/*.json`. Schema:

- `id`: number
- `name`: string
- `description`: string
- `tags`: string[]
- `kind`: "equal_division" | "interpolation" | "cell" | "symmetry" | "hybrid"
- `intervals`: number[] (semitone steps between notes)
- `wrap`: boolean
- `octaveSpan`: number (default 12)
- `defaultLength`: number
- `source`: { title, author, note }

## ECM Orbit Style Preset

The `ecm_orbit` style constrains outputs for spacious ECM aesthetic:

- Single-line only (no chords, no density stacking)
- Register bounds (minMidi, maxMidi)
- Max leap constraint (default 9 semitones)
- Prefer repeated tones and small motions
- Avoid continuous stepwise streams
- No density stacking (explicit rule)

## Copyright Note

This engine stores **abstract interval data only**. No verbatim excerpts from Slonimsky's Thesaurus. Pattern definitions are original interval structures inspired by the concepts.

## Development

```bash
npm test
npm run build
```

## License

MIT
