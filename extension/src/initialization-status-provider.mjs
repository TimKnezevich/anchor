import { existsSync } from "node:fs";
import { join } from "node:path";

const axisMarkers = [".axis", "axis.json", "docs/SPEC-v0.md"];

function resolveWorkspaceRoot(vscodeApi) {
  const folder = vscodeApi.workspace.workspaceFolders?.[0];
  return folder?.uri?.fsPath ?? null;
}

function findMarkers(rootPath) {
  return axisMarkers.filter((marker) => existsSync(join(rootPath, marker)));
}

export async function resolveInitializationStatus(vscodeApi, transport) {
  const rootPath = resolveWorkspaceRoot(vscodeApi);
  if (!rootPath) {
    return {
      state: "error",
      label: "Initialization: No Workspace",
      detail: "Open a workspace folder to check Axis initialization."
    };
  }

  const markers = findMarkers(rootPath);
  if (markers.length === 0) {
    return {
      state: "uninitialized",
      label: "Initialization: Not Initialized",
      detail: "Run 'Axis: Initialize Repository' to bootstrap Axis files."
    };
  }

  try {
    const health = typeof transport.healthCheck === "function"
      ? await transport.healthCheck()
      : { ok: true };
    if (health?.ok) {
      return {
        state: "initialized",
        label: "Initialization: Ready",
        detail: "Axis markers detected and MCP runtime reachable."
      };
    }

    return {
      state: "error",
      label: "Initialization: Runtime Unavailable",
      detail: "Axis markers detected but MCP runtime is not reachable."
    };
  } catch {
    return {
      state: "error",
      label: "Initialization: Runtime Unavailable",
      detail: "Axis markers detected but MCP runtime is not reachable."
    };
  }
}
