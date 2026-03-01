const requiredSteps = Object.freeze([
  "read_axis_before_intent",
  "write_intent",
  "read_axis_after_intent",
  "modify_code",
  "confirm_with_axis",
  "read_axis_and_report"
]);

export class OrchestratorLoopGuard {
  constructor() {
    this.steps = [];
    this.active = false;
  }

  begin() {
    this.steps = [];
    this.active = true;
  }

  mark(step) {
    if (!this.active) {
      throw new Error("Loop guard is not active.");
    }

    this.steps.push(step);
    const expected = requiredSteps[this.steps.length - 1];
    if (step !== expected) {
      throw new Error(
        `Loop step order violation. Expected '${expected}' but got '${step}'.`
      );
    }
  }

  end() {
    if (!this.active) {
      throw new Error("Loop guard is not active.");
    }

    const ok = requiredSteps.every((step, index) => this.steps[index] === step);
    this.active = false;

    if (!ok) {
      throw new Error("Loop did not complete all required steps.");
    }

    return {
      ok: true,
      steps: [...this.steps]
    };
  }
}
