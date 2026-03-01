import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const axisMarkers = [".axis", "axis.json", "docs/SPEC-v0.md"];

function workspaceRoot(vscodeApi) {
  const folder = vscodeApi.workspace.workspaceFolders?.[0];
  return folder?.uri?.fsPath ?? null;
}

function looksLikeAxisRepo(rootPath) {
  return axisMarkers.some((marker) => existsSync(join(rootPath, marker)));
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

export class RuntimeAutoStarter {
  constructor(vscodeApi, logger, transport, options = {}) {
    this.vscodeApi = vscodeApi;
    this.logger = logger;
    this.transport = transport;
    this.options = options;
    this.process = null;
  }

  async ensureStartedIfNeeded() {
    if (this.process) {
      return false;
    }

    const rootPath = workspaceRoot(this.vscodeApi);
    if (!rootPath || !looksLikeAxisRepo(rootPath)) {
      return false;
    }

    try {
      const health = await this.transport.healthCheck();
      if (health?.ok) {
        return false;
      }
    } catch {
      // Continue to startup path.
    }

    const child = spawn(npmCommand(), ["run", "runtime:start:local"], {
      cwd: rootPath,
      env: process.env,
      stdio: "ignore"
    });

    child.on("error", (error) => {
      this.logger.error("Axis runtime auto-start failed", { cwd: rootPath }, error);
    });

    child.on("exit", (code) => {
      this.logger.info("Axis runtime auto-start process exited", {
        cwd: rootPath,
        exit_code: code
      });
      this.process = null;
    });

    this.process = child;
    this.logger.info("Axis runtime auto-start launched", { cwd: rootPath });
    return true;
  }

  dispose() {
    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM");
      this.logger.info("Axis runtime auto-start process terminated", {});
      this.process = null;
    }
  }
}
