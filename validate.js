#!/usr/bin/env node

"use strict";

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
process.chdir(ROOT);

function run(cmd, msg) {
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
  } catch (e) {
    console.error("\nFAILED:", msg || cmd);
    process.exit(1);
  }
}

function fail(msg) {
  console.error("\nFAILED:", msg);
  process.exit(1);
}

console.log("=== Slonimsky Engine Validation ===\n");

// 1) Confirm package.json exists
if (!fs.existsSync(path.join(ROOT, "package.json"))) {
  fail("package.json not found. Run from project root.");
}
console.log("1) package.json found");

// 2) Delete /dist and /out if they exist
if (fs.existsSync(path.join(ROOT, "dist"))) {
  fs.rmSync(path.join(ROOT, "dist"), { recursive: true, force: true });
  console.log("2) Deleted dist/");
}
if (fs.existsSync(path.join(ROOT, "out"))) {
  fs.rmSync(path.join(ROOT, "out"), { recursive: true, force: true });
  console.log("2) Deleted out/");
}
console.log("2) Cleaned dist and out");

// 3) Run npm install if node_modules missing
if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.log("3) Running npm install...");
  run("npm install", "npm install");
}
console.log("3) Dependencies OK");

// 4) Run npm test
console.log("4) Running npm test...");
run("npm test", "npm test");
console.log("4) Tests passed");

// 5) Run npm run build
console.log("5) Running npm run build...");
run("npm run build", "npm run build");
console.log("5) Build complete");

// 6) Confirm dist/library/patterns exists
const patternsDir = path.join(ROOT, "dist", "library", "patterns");
if (!fs.existsSync(patternsDir)) {
  fail("dist/library/patterns does not exist after build.");
}
console.log("6) dist/library/patterns exists");

// 7) Run demo generation
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
console.log("7) Running demo generation...");
run(
  "node dist/cli/slon.js gen --id 1 --root D3 --len 16 --style ecm_orbit --out out/demo.mid",
  "Demo generation"
);
console.log("7) Demo command completed");

// 8) Confirm out/demo.mid exists and is larger than 100 bytes
const demoPath = path.join(ROOT, "out", "demo.mid");
if (!fs.existsSync(demoPath)) {
  fail("out/demo.mid was not created.");
}
const stat = fs.statSync(demoPath);
if (stat.size <= 100) {
  fail("out/demo.mid exists but is " + stat.size + " bytes (expected > 100).");
}
console.log("8) out/demo.mid exists (" + stat.size + " bytes)");

// 9) Print success
console.log("\nENGINE VALIDATION PASSED\n");
