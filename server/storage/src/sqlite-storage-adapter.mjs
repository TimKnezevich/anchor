import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";
import { StorageAdapter } from "./storage-adapter.mjs";

function toJson(value) {
  return JSON.stringify(value ?? null);
}

function fromJson(value) {
  return value ? JSON.parse(value) : null;
}

export class SqliteStorageAdapter extends StorageAdapter {
  constructor(options = {}) {
    super("sqlite");
    this.dbPath = options.dbPath ?? "./axis-dev.sqlite";
    this.migrationsDir = options.migrationsDir;
    this.dbFactory = options.dbFactory ?? null;
    this.db = null;
  }

  initialize() {
    if (this.db !== null) {
      return { ok: true, adapter: this.name, path: this.dbPath };
    }

    const Database = this.dbFactory ?? this.loadDefaultDatabaseDriver();
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    return {
      ok: true,
      adapter: this.name,
      path: this.dbPath
    };
  }

  loadDefaultDatabaseDriver() {
    throw new AxisError("SQLite driver is not available in this environment.", {
      code: errorCodes.INTERNAL_ERROR,
      details: {
        adapter: "sqlite",
        install_hint: "Install better-sqlite3 and provide dbFactory, or run with memory adapter."
      }
    });
  }

  requireDb() {
    if (this.db === null) {
      throw new AxisError("SQLite adapter not initialized.", {
        code: errorCodes.INTERNAL_ERROR,
        details: {
          adapter: this.name,
          path: this.dbPath
        }
      });
    }
  }

  migrate() {
    this.requireDb();

    if (!this.migrationsDir) {
      throw new AxisError("Missing migrationsDir for SQLite migrate.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "migrationsDir" }
      });
    }

    const files = readdirSync(this.migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(this.migrationsDir, file), "utf8");
      this.db.exec(sql);
    }

    return {
      ok: true,
      adapter: this.name,
      migrations: files.length
    };
  }

  getNode(nodeId) {
    this.requireDb();
    const row = this.db.prepare("SELECT payload FROM nodes WHERE id = ?").get(nodeId);
    return row ? fromJson(row.payload) : null;
  }

  upsertNode(node) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO nodes (id, payload) VALUES (?, ?)")
      .run(node.id, toJson(node));
    return node;
  }

  listNodes(nodeIds = null) {
    this.requireDb();

    if (Array.isArray(nodeIds) && nodeIds.length > 0) {
      const query = `SELECT payload FROM nodes WHERE id IN (${nodeIds.map(() => "?").join(",")})`;
      return this.db.prepare(query).all(...nodeIds).map((row) => fromJson(row.payload));
    }

    return this.db.prepare("SELECT payload FROM nodes").all().map((row) => fromJson(row.payload));
  }

  listEdges() {
    this.requireDb();
    return this.db.prepare("SELECT payload FROM edges").all().map((row) => fromJson(row.payload));
  }

  upsertEdge(edge) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO edges (id, payload) VALUES (?, ?)")
      .run(edge.id, toJson(edge));
    return edge;
  }

  upsertSession(session) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO sessions (session_id, payload) VALUES (?, ?)")
      .run(session.session_id, toJson(session));
    return session;
  }

  listSessions() {
    this.requireDb();
    return this.db.prepare("SELECT payload FROM sessions").all().map((row) => fromJson(row.payload));
  }

  attachEvidence(taskId, evidence) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO evidence (id, task_id, payload) VALUES (?, ?, ?)")
      .run(evidence.id, taskId, toJson(evidence));
    return evidence;
  }

  getEvidence(taskId) {
    this.requireDb();
    return this.db
      .prepare("SELECT payload FROM evidence WHERE task_id = ?")
      .all(taskId)
      .map((row) => fromJson(row.payload));
  }

  setValidation(taskId, validation) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO validations (task_id, payload) VALUES (?, ?)")
      .run(taskId, toJson(validation));
    return validation;
  }

  getValidation(taskId) {
    this.requireDb();
    const row = this.db.prepare("SELECT payload FROM validations WHERE task_id = ?").get(taskId);
    return row ? fromJson(row.payload) : null;
  }

  upsertClause(clause) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO clauses (id, payload) VALUES (?, ?)")
      .run(clause.id, toJson(clause));
    return clause;
  }

  getClause(clauseId) {
    this.requireDb();
    const row = this.db.prepare("SELECT payload FROM clauses WHERE id = ?").get(clauseId);
    return row ? fromJson(row.payload) : null;
  }

  listClauses() {
    this.requireDb();
    return this.db.prepare("SELECT payload FROM clauses").all().map((row) => fromJson(row.payload));
  }

  upsertTaskClauseLink(link) {
    this.requireDb();
    this.db
      .prepare("INSERT OR REPLACE INTO task_clause_links (task_id, clause_id, payload) VALUES (?, ?, ?)")
      .run(link.task_id, link.clause_id, toJson(link));
    return link;
  }

  getTaskClauseLinks(taskId) {
    this.requireDb();
    return this.db
      .prepare("SELECT payload FROM task_clause_links WHERE task_id = ?")
      .all(taskId)
      .map((row) => fromJson(row.payload));
  }
}
