export const enforcementErrorCodes = Object.freeze({
  POLICY_FILE_MISSING: "POLICY_FILE_MISSING",
  POLICY_FILE_INVALID_JSON: "POLICY_FILE_INVALID_JSON",
  POLICY_FILE_INVALID_SCHEMA: "POLICY_FILE_INVALID_SCHEMA",
  EVIDENCE_FILE_MISSING: "EVIDENCE_FILE_MISSING",
  EVIDENCE_FILE_INVALID_JSON: "EVIDENCE_FILE_INVALID_JSON",
  EVIDENCE_FILE_INVALID_SCHEMA: "EVIDENCE_FILE_INVALID_SCHEMA",
  ACKNOWLEDGMENT_RECORDS_INVALID: "ACKNOWLEDGMENT_RECORDS_INVALID",
  UNLINKED_DIFF_DETECTED: "UNLINKED_DIFF_DETECTED",
  ACKNOWLEDGED_DIFF_DETECTED: "ACKNOWLEDGED_DIFF_DETECTED"
});

const enforcementGuidanceByCode = Object.freeze({
  POLICY_FILE_MISSING: {
    status: "fail",
    message: "Axis policy file is missing. Initialize repository or add .axis/policy.json."
  },
  POLICY_FILE_INVALID_JSON: {
    status: "fail",
    message: "Axis policy file is invalid JSON. Fix .axis/policy.json formatting."
  },
  POLICY_FILE_INVALID_SCHEMA: {
    status: "fail",
    message: "Axis policy file fails schema validation. Correct invalid fields in .axis/policy.json."
  },
  EVIDENCE_FILE_MISSING: {
    status: "fail",
    message: "No Axis evidence link record found. Create .axis/evidence record for this session."
  },
  EVIDENCE_FILE_INVALID_JSON: {
    status: "fail",
    message: "Axis evidence record is invalid JSON. Fix the selected evidence file."
  },
  EVIDENCE_FILE_INVALID_SCHEMA: {
    status: "fail",
    message: "Axis evidence record fails schema validation. Correct required linkage fields."
  },
  ACKNOWLEDGMENT_RECORDS_INVALID: {
    status: "fail",
    message: "One or more acknowledgment records are invalid. Fix .axis/acknowledgments files."
  },
  UNLINKED_DIFF_DETECTED: {
    status: "fail",
    message: "Changed files are not linked to active Axis evidence. Link files, acknowledge, or rollback."
  },
  ACKNOWLEDGED_DIFF_DETECTED: {
    status: "warn",
    message: "Changed files are currently acknowledged. Resolve or refresh acknowledgments before expiry."
  }
});

export function mapEnforcementCodeToGuidance(code) {
  return enforcementGuidanceByCode[code] ?? {
    status: "fail",
    message: "Axis enforcement failed. Review logs and remediation guidance."
  };
}

export function buildEnforcementMessages(codes) {
  const uniqueCodes = [...new Set(codes)];
  return uniqueCodes.map((code) => ({
    code,
    ...mapEnforcementCodeToGuidance(code)
  }));
}
