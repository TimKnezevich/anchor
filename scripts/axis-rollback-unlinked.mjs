import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateAxisDiff } from "./axis-validate-diff.mjs";
import { appendEnforcementAuditEvent } from "../shared/observability/src/index.mjs";

function parseArgs(argv) {
  const options = {
    cwd: process.cwd(),
    apply: false,
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--cwd") {
      options.cwd = resolve(argv[index + 1] ?? process.cwd());
      index += 1;
      continue;
    }

    if (arg === "--apply") {
      options.apply = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
    }
  }

  return options;
}

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? "";
    throw new Error(`git command failed (${args.join(" ")}): ${stderr}`);
  }
}

export function rollbackUnlinkedDiff(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const apply = options.apply === true;

  const evaluation = evaluateAxisDiff({
    cwd,
    includeStaged: true,
    includeWorking: true,
    nowIso: options.nowIso
  });

  const unlinkedFiles = evaluation.unlinked_files;
  if (apply && unlinkedFiles.length > 0) {
    runGit(cwd, ["restore", "--staged", "--worktree", "--", ...unlinkedFiles]);
  }

  const result = {
    mode: apply ? "apply" : "preview",
    rolled_back_files: apply ? [...unlinkedFiles] : [],
    preview_files: [...unlinkedFiles],
    count: unlinkedFiles.length,
    status: unlinkedFiles.length === 0 ? "no-op" : (apply ? "rolled_back" : "preview")
  };
  appendEnforcementAuditEvent(cwd, {
    event_type: apply ? "rollback_applied" : "rollback_preview",
    task_id: evaluation.evidence_context?.task_id ?? null,
    work_session_id: evaluation.evidence_context?.work_session_id ?? null,
    actor: evaluation.evidence_context?.actor ?? null,
    status: result.status,
    details: {
      file_count: result.count,
      files: result.preview_files
    }
  });

  return result;
}

function printHuman(result) {
  console.log(`axis-rollback-unlinked: ${result.status} (${result.count} file(s))`);
  if (result.preview_files.length > 0) {
    for (const filePath of result.preview_files) {
      console.log(`file: ${filePath}`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = rollbackUnlinkedDiff(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
