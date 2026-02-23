import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { patternSchema, type Pattern } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _patterns: Pattern[] | null = null;

function getPatternsDir(): string {
  const distDir = join(__dirname, "patterns");
  if (existsSync(distDir)) return distDir;
  const srcDir = join(process.cwd(), "src", "library", "patterns");
  if (existsSync(srcDir)) return srcDir;
  return distDir;
}

export function loadPatterns(): Pattern[] {
  if (_patterns) return _patterns;
  const patternsDir = getPatternsDir();
  const files = readdirSync(patternsDir).filter((f) => f.endsWith(".json"));
  const loaded: Pattern[] = [];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(patternsDir, f), "utf-8"));
    const parsed = Array.isArray(raw) ? raw : [raw];
    for (const p of parsed) {
      loaded.push(patternSchema.parse(p));
    }
  }
  _patterns = loaded;
  return _patterns;
}

export function getPatternById(id: number): Pattern | undefined {
  return loadPatterns().find((p) => p.id === id);
}

export function listPatterns(filters?: {
  tag?: string;
  kind?: string;
}): Pattern[] {
  let list = loadPatterns();
  if (filters?.tag) {
    list = list.filter((p) => p.tags.includes(filters.tag!));
  }
  if (filters?.kind) {
    list = list.filter((p) => p.kind === filters.kind);
  }
  return list;
}
