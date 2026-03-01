export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(commandId, handler) {
    this.commands.set(commandId, handler);
  }

  get(commandId) {
    return this.commands.get(commandId);
  }

  list() {
    return [...this.commands.keys()];
  }
}
