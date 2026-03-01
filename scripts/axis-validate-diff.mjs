import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  appendEnforcementAuditEvent,
  buildEnforcementMessages,
  enforcementErrorCodes
} from "../shared/observability/src/index.mjs";
import {
  normalizeAxisPolicy,
  validateAxisEvidenceLinkRecord,
  validateAxisPolicy
} from "../shared/policy/src/index.mjs";
import { collectActiveAcknowledgments } from "./axis-acknowledgment-lib.mjs";

const exitCodes = Object.freeze({
  pass: 0,
  warn: 10,
  fail: 20
});

function readJson(path) {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw);
}

function parseArgs(argv) {
  const options = {
    cwd: process.cwd(),
    evidenceFile: null,
    includeStaged: true,
    includeWorking: true,
    json: false,
    baseRef: null,
    headRef: "HEAD",
    strict: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--cwd") {
      options.cwd = resolve(argv[index + 1] ?? process.cwd());
      index += 1;
      continue;
    }

    if (arg === "--evidence-file") {
      options.evidenceFile = resolve(options.cwd, argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (arg === "--staged-only") {
      options.includeStaged = true;
      options.includeWorking = false;
      continue;
    }

    if (arg === "--working-only") {
      options.includeStaged = false;
      options.includeWorking = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--base-ref") {
      options.baseRef = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--head-ref") {
      options.headRef = argv[index + 1] ?? "HEAD";
      index += 1;
      continue;
    }

    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
  }

  return options;
}

function collectGitDiffFiles(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? "";
    throw new Error(`git diff failed (${args.join(" ")}): ${stderr}`);
  }

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function collectChangedFiles(cwd, options = {}) {
  if (typeof options.baseRef === "string" && options.baseRef.trim() !== "") {
    const headRef = options.headRef ?? "HEAD";
    return collectGitDiffFiles(cwd, [
      "diff",
      "--name-only",
      "--diff-filter=ACMRTUXB",
      `${options.baseRef}...${headRef}`
    ]).sort();
  }

  const includeStaged = options.includeStaged !== false;
  const includeWorking = options.includeWorking !== false;
  const files = new Set();

  if (includeStaged) {
    for (const filePath of collectGitDiffFiles(cwd, ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB"])) {
      files.add(filePath);
    }
  }

  if (includeWorking) {
    for (const filePath of collectGitDiffFiles(cwd, ["diff", "--name-only", "--diff-filter=ACMRTUXB"])) {
      files.add(filePath);
    }
  }

  return [...files].sort();
}

function resolvePolicy(cwd, issues) {
  const policyPath = join(cwd, ".axis", "policy.json");
  if (!existsSync(policyPath)) {
    issues.push(enforcementErrorCodes.POLICY_FILE_MISSING);
    return null;
  }

  let policy;
  try {
    policy = normalizeAxisPolicy(readJson(policyPath));
  } catch {
    issues.push(enforcementErrorCodes.POLICY_FILE_INVALID_JSON);
    return null;
  }

  const validation = validateAxisPolicy(policy);
  if (!validation.ok) {
    issues.push(enforcementErrorCodes.POLICY_FILE_INVALID_SCHEMA);
    for (const error of validation.errors) {
      issues.push(`POLICY_VALIDATION:${error}`);
    }
    return null;
  }

  return policy;
}

function readEvidenceRecord(cwd, evidenceFile, issues) {
  const evidencePath = evidenceFile
    ?? findLatestEvidenceRecordPath(cwd);
  if (!evidencePath) {
    issues.push(enforcementErrorCodes.EVIDENCE_FILE_MISSING);
    return null;
  }

  let evidence;
  try {
    evidence = readJson(evidencePath);
  } catch {
    issues.push(enforcementErrorCodes.EVIDENCE_FILE_INVALID_JSON);
    return null;
  }

  const validation = validateAxisEvidenceLinkRecord(evidence);
  if (!validation.ok) {
    issues.push(enforcementErrorCodes.EVIDENCE_FILE_INVALID_SCHEMA);
    for (const error of validation.errors) {
      issues.push(`EVIDENCE_VALIDATION:${error}`);
    }
    return null;
  }

  return evidence;
}

function findLatestEvidenceRecordPath(cwd) {
  const evidenceDir = join(cwd, ".axis", "evidence");
  if (!existsSync(evidenceDir)) {
    return null;
  }

  const candidates = readdirSync(evidenceDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(evidenceDir, name));

  if (candidates.length === 0) {
    return null;
  }

  let latest = null;
  for (const filePath of candidates) {
    try {
      const evidence = readJson(filePath);
      const score = Date.parse(evidence.recorded_at ?? "");
      if (Number.isNaN(score)) {
        continue;
      }

      if (!latest || score > latest.score) {
        latest = { filePath, score };
      }
    } catch {
      // Ignore invalid JSON here; validation path will report once selected.
    }
  }

  return latest?.filePath ?? candidates.sort()[0];
}

function toStatus(policyMode, unlinkedCount, issues) {
  if (issues.length > 0) {
    return "fail";
  }

  if (unlinkedCount === 0) {
    return "pass";
  }

  return policyMode === "warn" ? "warn" : "fail";
}

export function evaluateAxisDiff(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const issues = [];

  const changedFiles = collectChangedFiles(cwd, {
    includeStaged: options.includeStaged,
    includeWorking: options.includeWorking,
    baseRef: options.baseRef,
    headRef: options.headRef
  });

  const policy = resolvePolicy(cwd, issues);
  const evidence = readEvidenceRecord(cwd, options.evidenceFile, issues);
  const acknowledgmentSet = collectActiveAcknowledgments(cwd, options.nowIso);
  if (acknowledgmentSet.invalid.length > 0) {
    issues.push(enforcementErrorCodes.ACKNOWLEDGMENT_RECORDS_INVALID);
  }

  const acknowledgedFiles = new Set(
    acknowledgmentSet.active
      .flatMap((record) => record.files)
  );
  const linkedFiles = evidence?.files ?? [];
  const unlinkedFiles = changedFiles.filter((filePath) => !linkedFiles.includes(filePath));
  const acknowledgedUnlinkedFiles = unlinkedFiles.filter((filePath) => acknowledgedFiles.has(filePath));
  const remainingUnlinkedFiles = unlinkedFiles.filter((filePath) => !acknowledgedFiles.has(filePath));
  const status = toStatus(policy?.enforcement_mode ?? "enforce", remainingUnlinkedFiles.length, issues);
  const effectiveStatus = options.strict === true && status === "warn"
    ? "fail"
    : status;
  const enforcementCodes = [];
  if (remainingUnlinkedFiles.length > 0) {
    enforcementCodes.push(enforcementErrorCodes.UNLINKED_DIFF_DETECTED);
  }
  if (acknowledgedUnlinkedFiles.length > 0) {
    enforcementCodes.push(enforcementErrorCodes.ACKNOWLEDGED_DIFF_DETECTED);
  }
  for (const issue of issues) {
    if (Object.values(enforcementErrorCodes).includes(issue)) {
      enforcementCodes.push(issue);
    }
  }
  const guidance = buildEnforcementMessages(enforcementCodes);

  return {
    status: effectiveStatus,
    exit_code: exitCodes[effectiveStatus],
    policy_mode: policy?.enforcement_mode ?? null,
    strict_mode: options.strict === true,
    changed_files: changedFiles,
    linked_files: linkedFiles,
    unlinked_files: remainingUnlinkedFiles,
    acknowledged_unlinked_files: acknowledgedUnlinkedFiles,
    active_acknowledgments: acknowledgmentSet.active.length,
    expired_acknowledgments: acknowledgmentSet.expired.length,
    enforcement_codes: [...new Set(enforcementCodes)],
    guidance,
    evidence_context: evidence
      ? {
          task_id: evidence.task_id,
          work_session_id: evidence.work_session_id,
          actor: evidence.actor
        }
      : null,
    issues
  };
}

function printHuman(result) {
  const summary = `axis-validate-diff: ${result.status.toUpperCase()} (changed=${result.changed_files.length}, unlinked=${result.unlinked_files.length})`;
  console.log(summary);

  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      console.log(`issue: ${issue}`);
    }
  }

  if (result.unlinked_files.length > 0) {
    for (const filePath of result.unlinked_files) {
      console.log(`unlinked: ${filePath}`);
    }
  }

  if (result.acknowledged_unlinked_files.length > 0) {
    for (const filePath of result.acknowledged_unlinked_files) {
      console.log(`acknowledged: ${filePath}`);
    }
  }

  if (result.guidance.length > 0) {
    for (const item of result.guidance) {
      console.log(`guidance[${item.code}]: ${item.message}`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = evaluateAxisDiff(options);

  appendEnforcementAuditEvent(options.cwd, {
    event_type: "diff_validation",
    task_id: result.evidence_context?.task_id ?? null,
    work_session_id: result.evidence_context?.work_session_id ?? null,
    actor: result.evidence_context?.actor ?? null,
    status: result.status,
    details: {
      changed_count: result.changed_files.length,
      unlinked_count: result.unlinked_files.length,
      acknowledged_unlinked_count: result.acknowledged_unlinked_files.length,
      codes: result.enforcement_codes
    }
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }

  process.exitCode = result.exit_code;
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
