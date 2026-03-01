import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const include = new Set([".js", ".mjs", ".cjs"]);
const exclude = new Set([".git", "node_modules"]);

function walk(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (exclude.has(entry)) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (include.has(extname(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = walk(root);
let failures = 0;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    failures += 1;
    const name = relative(root, file);
    process.stderr.write(`Typecheck failed for ${name}\n`);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  }
}

if (failures > 0) {
  process.stderr.write(`Typecheck failed for ${failures} file(s).\n`);
  process.exit(1);
}

process.stdout.write(`Typecheck passed for ${files.length} file(s).\n`);
