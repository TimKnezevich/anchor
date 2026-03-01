import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const exitCodes = Object.freeze({
  pass: 0,
  fail: 20
});

const requiredPatterns = Object.freeze([
  /axis_task=[^\s]+/i,
  /axis_session=[^\s]+/i
]);

export function validateCommitMessageText(text) {
  const missing = [];

  for (const pattern of requiredPatterns) {
    if (!pattern.test(text)) {
      missing.push(pattern.source);
    }
  }

  return {
    ok: missing.length === 0,
    missing
  };
}

export function validateCommitMessageFile(path) {
  const content = readFileSync(path, "utf8");
  return validateCommitMessageText(content);
}

function main() {
  const messagePath = process.argv[2];
  if (!messagePath) {
    console.error("Usage: node scripts/axis-validate-commit-msg.mjs <commit_msg_file>");
    process.exitCode = exitCodes.fail;
    return;
  }

  const result = validateCommitMessageFile(messagePath);
  if (!result.ok) {
    console.error("Commit message missing required Axis metadata: axis_task=<id> axis_session=<id>");
    process.exitCode = exitCodes.fail;
    return;
  }

  process.exitCode = exitCodes.pass;
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
