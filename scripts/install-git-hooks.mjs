import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const options = {
    cwd: process.cwd()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cwd") {
      options.cwd = resolve(argv[index + 1] ?? process.cwd());
      index += 1;
    }
  }

  return options;
}

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? result.stdout?.trim() ?? "unknown git error";
    throw new Error(`git ${args.join(" ")} failed: ${stderr}`);
  }

  return result.stdout.trim();
}

export function installGitHooks(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const hooksDir = resolve(cwd, ".githooks");

  if (!existsSync(hooksDir)) {
    throw new Error(`Missing hooks directory: ${hooksDir}`);
  }

  runGit(cwd, ["config", "core.hooksPath", ".githooks"]);

  return {
    ok: true,
    cwd,
    hooks_path: ".githooks"
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = installGitHooks(options);
  console.log(JSON.stringify(result, null, 2));
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
