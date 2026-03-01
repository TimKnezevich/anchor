import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createAcknowledgment, parseAckArgs } from "./axis-acknowledgment-lib.mjs";

function main() {
  const options = parseAckArgs(process.argv.slice(2));
  const result = createAcknowledgment(options.cwd, options);
  console.log(JSON.stringify(result, null, 2));
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
