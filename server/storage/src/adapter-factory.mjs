import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";
import { MemoryStorageAdapter } from "./memory-storage-adapter.mjs";
import { SqliteStorageAdapter } from "./sqlite-storage-adapter.mjs";

export function createStorageAdapter(options = {}) {
  const adapter = options.adapter ?? "memory";

  if (adapter === "memory") {
    return new MemoryStorageAdapter();
  }

  if (adapter === "sqlite") {
    return new SqliteStorageAdapter({
      dbPath: options.dbPath,
      migrationsDir: options.migrationsDir,
      dbFactory: options.dbFactory
    });
  }

  throw new AxisError(`Unsupported storage adapter '${adapter}'.`, {
    code: errorCodes.VALIDATION_ERROR,
    details: {
      adapter,
      supported: ["memory", "sqlite"]
    }
  });
}
