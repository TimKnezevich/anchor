import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../shared/observability/src/index.mjs";
import { createStorageAdapter } from "../server/storage/src/index.mjs";
import { devSeed } from "../server/storage/seeds/dev-seed.mjs";

const logger = createLogger({ service: "axis-db-seed" });
const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "server", "storage", "migrations");

const adapterName = process.env.AXIS_STORAGE_ADAPTER ?? "memory";
const dbPath = process.env.AXIS_SQLITE_PATH ?? join(here, "..", "axis-dev.sqlite");

const adapter = createStorageAdapter({
  adapter: adapterName,
  dbPath,
  migrationsDir
});

try {
  adapter.initialize();

  for (const clause of devSeed.clauses) {
    adapter.upsertClause(clause);
  }

  for (const node of devSeed.nodes) {
    adapter.upsertNode(node);
  }

  logger.info("Seed complete", {
    adapter: adapterName,
    clauses: devSeed.clauses.length,
    nodes: devSeed.nodes.length
  });
} catch (error) {
  logger.error("Seed failed", { adapter: adapterName }, error);
  process.exitCode = 1;
}
