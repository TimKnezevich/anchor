import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const include = new Set([".js", ".mjs", ".cjs", ".md", ".json"]);
const exclude = new Set([".git", "node_modules"]);
const skipLargeFileCheck = new Set(["package-lock.json"]);

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
const errors = [];
const warnings = [];

for (const file of files) {
  const rel = relative(root, file);
  const baseName = file.split("/").at(-1) ?? "";
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  if (!skipLargeFileCheck.has(baseName) && lines.length > 1000) {
    errors.push(`${rel}: file has ${lines.length} lines (max 1000).`);
  } else if (!skipLargeFileCheck.has(baseName) && lines.length > 400) {
    warnings.push(`${rel}: file has ${lines.length} lines (evaluate split plan).`);
  }

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (/\s+$/.test(line)) {
      errors.push(`${rel}:${lineNo} trailing whitespace.`);
    }

    if (/\t/.test(line)) {
      warnings.push(`${rel}:${lineNo} tab character detected.`);
    }
  });
}

for (const warning of warnings) {
  process.stdout.write(`WARN ${warning}\n`);
}

if (errors.length > 0) {
  for (const error of errors) {
    process.stderr.write(`ERROR ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Lint passed for ${files.length} file(s).\n`);
