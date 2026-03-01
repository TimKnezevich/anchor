# Enforcement Error Codes

These deterministic codes are used by enforcement CLI and extension messaging.

## Codes
- `POLICY_FILE_MISSING`
- `POLICY_FILE_INVALID_JSON`
- `POLICY_FILE_INVALID_SCHEMA`
- `EVIDENCE_FILE_MISSING`
- `EVIDENCE_FILE_INVALID_JSON`
- `EVIDENCE_FILE_INVALID_SCHEMA`
- `ACKNOWLEDGMENT_RECORDS_INVALID`
- `UNLINKED_DIFF_DETECTED`
- `ACKNOWLEDGED_DIFF_DETECTED`

## Guidance Source
- Shared mapper: `shared/observability/src/enforcement-message-mapper.mjs`
- Extension consumer: `extension/src/conflict-messages.mjs`
- CLI consumer: `scripts/axis-validate-diff.mjs`
