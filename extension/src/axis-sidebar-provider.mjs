export class AxisSidebarProvider {
  constructor() {
    this.status = {
      state: "checking",
      label: "Initialization: Checking",
      detail: "Checking Axis initialization status."
    };
    this.listeners = new Set();
    this.onDidChangeTreeData = (listener) => {
      this.listeners.add(listener);
      return {
        dispose: () => this.listeners.delete(listener)
      };
    };
  }

  refreshStatus(status) {
    this.status = status;
    for (const listener of this.listeners) {
      listener(undefined);
    }
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element) {
      return [];
    }

    return [
      {
        id: "axis.initializationStatus",
        label: this.status.label,
        description: this.status.detail,
        tooltip: this.status.detail,
        contextValue: `axisStatus:${this.status.state}`
      },
      {
        id: "axis.initializeRepository",
        label: "Initialize Repository",
        command: {
          command: "axis.initializeRepository",
          title: "Axis: Initialize Repository"
        },
        contextValue: "axisCommand"
      },
      {
        id: "axis.checkConnection",
        label: "Check Connection",
        command: {
          command: "axis.checkConnection",
          title: "Axis: Check Connection"
        },
        contextValue: "axisCommand"
      },
      {
        id: "axis.openGraphExplorer",
        label: "Open Graph Explorer",
        command: {
          command: "axis.openGraphExplorer",
          title: "Axis: Open Graph Explorer"
        },
        contextValue: "axisCommand"
      }
    ];
  }
}
