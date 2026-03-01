import { startMcpRuntime } from "./run-mcp-server.mjs";

const runtime = await startMcpRuntime({ profile: "shared" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await runtime.stop();
    process.exit(0);
  });
}
