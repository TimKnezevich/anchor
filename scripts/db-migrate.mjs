import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../shared/observability/src/index.mjs";
import { createStorageAdapter } from "../server/storage/src/index.mjs";

const logger = createLogger({ service: "axis-db-migrate" });
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
  const result = adapter.migrate();
  logger.info("Database migrations complete", result);
} catch (error) {
  logger.error("Database migration failed", { adapter: adapterName }, error);
  process.exitCode = 1;
}
