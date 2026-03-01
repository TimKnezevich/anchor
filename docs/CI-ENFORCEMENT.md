# CI Enforcement Gate

This document defines the CI gate for Axis diff enforcement.

## Workflow
- Workflow file: `.github/workflows/ci.yml`
- Step: `Axis diff enforcement (CI strict)`
- Report artifact: `axis-ci-enforcement-report`
- Report path in runner: `dist/axis-ci-enforcement-report.json`

## Behavior
1. CI runs `scripts/axis-validate-diff.mjs` in strict mode.
2. CI compares `origin/main...HEAD` changed files.
3. CI fails when enforcement exit code is non-zero.
4. CI uploads report artifact even when enforcement fails.

## Branch and PR Gate
1. Require workflow `CI / validate` as a required status check for protected branches.
2. Block direct pushes to `main` and require pull requests.
3. Require branch to be up-to-date before merge.
4. Do not allow bypass for failed Axis enforcement checks.
