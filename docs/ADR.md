# ADR Log

This file records architecture and development decisions for Axis.

## How to Use This File
- Add a new entry at the bottom for each decision.
- Keep entries short and plain.
- If a choice affects behavior, data model, API shape, workflow, or validation, log it.
- When in doubt, log it.

## Entry Template
```md
## ADR-XXXX: Short Title
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded
- Context:
  - Why this decision is needed.
- Decision:
  - What we decided.
- Consequences:
  - What this changes now.
  - Tradeoffs or follow-up work.
- Related:
  - docs/FILE.md
```

## ADR-0001: Keep a Single ADR Log and Update It Liberally
- Date: 2026-03-01
- Status: accepted
- Context:
  - Project work is moving fast and decisions can be made during implementation details.
  - Unlogged decisions create confusion and rework.
- Decision:
  - Use `docs/ADR.md` as the central decision log.
  - Agents must update this file whenever they make a development decision.
  - \"Decision\" is interpreted broadly and includes technical and workflow-level choices.
- Consequences:
  - Better traceability for why behavior changed.
  - Slight overhead on each change, but lower ambiguity later.
- Related:
  - `AGENTS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SPEC-v0.md`

## ADR-0002: Organize Delivery Plan by Discrete Features
- Date: 2026-03-01
- Status: accepted
- Context:
  - Implementation phases should be easy to execute in logical chunks.
  - Broad foundations (repo structure and architecture) must come before detailed runtime work.
- Decision:
  - Rewrite the implementation plan so phases are grouped by major discrete features.
  - Start with broad foundation features, then move to model, API, runtime, extension workflow, and UI features.
  - Keep phase language plain and direct.
- Consequences:
  - Planning and execution are easier to track and assign.
  - More phases in the plan, but each phase has a clearer scope.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`

## ADR-0003: Track Work with Per-Phase TODO Files
- Date: 2026-03-01
- Status: accepted
- Context:
  - A single checklist across all phases forces repeated context loading of old tasks.
  - Work should be tracked in smaller phase-scoped units.
- Decision:
  - Use one TODO file per phase under `docs/todos/`.
  - Do not use a monolithic all-phase checklist.
  - Update only the active phase tracker during implementation.
- Consequences:
  - Lower context overhead while implementing.
  - Progress history is split and easier to scan by phase.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/README.md`

## ADR-0004: Require Testable Task Breakdown Per Phase
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase TODOs should be executable in small, verifiable units.
  - Large tasks without clear tests are harder to validate and track.
- Decision:
  - Before starting a phase, split its TODO list into small tasks.
  - Each task must be small enough for one test to verify in one step.
  - If needed, split large tasks into sub-tasks.
  - Sub-tasks may be completed without tests.
  - Every task must have an associated test.
  - Every task and sub-task must be checked off when done.
  - After completing a task and its test, run tests plus typecheck and lint.
- Consequences:
  - Better step-by-step verification and progress tracking.
  - More upfront planning work in each phase file.
- Related:
  - `AGENTS.md`
  - `docs/todos/README.md`

## ADR-0005: Use a Comprehensive Root .gitignore Baseline
- Date: 2026-03-01
- Status: accepted
- Context:
  - The project will include a VS Code extension, server code, tests, and local tooling.
  - We need to avoid committing generated files, caches, local secrets, and editor noise.
- Decision:
  - Add a thorough root `.gitignore` with standard entries for OS/editor files, Node/TypeScript outputs, VS Code extension artifacts, test outputs, local env/secrets, and common tooling caches.
- Consequences:
  - Cleaner diffs and fewer accidental commits of local/generated files.
  - May require occasional allow-listing if a generated file should be committed.
- Related:
  - `.gitignore`
  - `AGENTS.md`

## ADR-0006: Require Thorough Error Handling and Logging in All New Code
- Date: 2026-03-01
- Status: accepted
- Context:
  - This project coordinates stateful workflows where silent failures cause drift and hard-to-debug behavior.
  - Consistent logging and error handling is needed across server and extension layers.
- Decision:
  - Require thorough error handling and logging at all levels for all new code.
  - This includes API handlers, core logic, storage adapters, extension commands, and background workflows.
- Consequences:
  - Better operational visibility and easier debugging.
  - Slightly more implementation overhead per feature.
- Related:
  - `AGENTS.md`
  - `docs/ARCHITECTURE.md`

## ADR-0007: Build Centralized Error and Logging System Early in Phase 1
- Date: 2026-03-01
- Status: accepted
- Context:
  - Error handling and logging quality is a hard rule for all new code.
  - Waiting until later phases would cause rework and inconsistent patterns.
- Decision:
  - Move centralized error/logging system development to the start of Phase 1.
  - Define shared error and logging conventions before broader implementation.
- Consequences:
  - Early consistency across server and extension layers.
  - Slightly more upfront setup work in Phase 1.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-01-repo-structure-and-architecture.md`
  - `AGENTS.md`

## ADR-0008: Enforce Language-Appropriate Naming Conventions
- Date: 2026-03-01
- Status: accepted
- Context:
  - Mixed or inconsistent naming styles make code harder to read and maintain.
  - This repo will contain multiple code types that use different naming standards.
- Decision:
  - Require naming to follow conventions of the target language/file type.
  - Use styles like `snake_case`, `camelCase`, `PascalCase`, and `kebab-case` where they are standard.
  - Do not mix naming styles arbitrarily.
- Consequences:
  - Better readability and consistency across the codebase.
  - Slightly stricter review expectations for naming.
- Related:
  - `AGENTS.md`

## ADR-0009: Enforce File Structure Conventions and File Size Limits
- Date: 2026-03-01
- Status: accepted
- Context:
  - Consistent project structure improves maintainability across mixed code types.
  - Very large files are harder to review, test, and modify safely.
- Decision:
  - Follow standard file/folder structure conventions for the language/framework when they exist.
  - Aim to keep files under 400 lines.
  - For files between 400 and 1000 lines, perform a split/refactor evaluation and flag it to the developer.
  - Allow refactoring between tasks to satisfy structure and size constraints.
- Consequences:
  - Better maintainability and easier reviews.
  - Additional refactor work may be introduced during implementation phases.
- Related:
  - `AGENTS.md`
