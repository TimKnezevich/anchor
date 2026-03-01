import { startMcpRuntime } from "./run-mcp-server.mjs";

const runtime = await startMcpRuntime({ profile: "local" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await runtime.stop();
    process.exit(0);
  });
}
