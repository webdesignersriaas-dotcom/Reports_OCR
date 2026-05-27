const REPORT_FIELDS = {
  lft: [
    ["total_protein", "Total Protein"],
    ["albumin", "Albumin"],
    ["globulin", "Globulin"],
    ["bilirubin", "Bilirubin"],
    ["sgot_ast", "SGOT / AST"],
    ["sgpt_alt", "SGPT / ALT"],
    ["alp", "ALP"],
  ],
  kft: [
    ["creatinine", "Creatinine"],
    ["urea", "Urea"],
    ["uric_acid", "Uric Acid"],
  ],
  cbc: [
    ["hemoglobin", "Hemoglobin"],
    ["wbc", "WBC"],
    ["platelets", "Platelets"],
  ],
  semen: [
    ["sperm_count", "Sperm Count"],
    ["motility", "Motility"],
    ["morphology", "Morphology"],
    ["volume", "Volume"],
  ],
  hormone: [
    ["testosterone", "Testosterone"],
    ["fsh", "FSH"],
    ["lh", "LH"],
  ],
  varicocele_usg: [
    ["varicocele_grade", "Varicocele Grade"],
    ["testis_size", "Testis Size"],
    ["testis_structure", "Testis Structure"],
    ["hydrocele", "Hydrocele"],
    ["cyst", "Cyst"],
  ],
  varicocele_doppler: [
    ["varicocele_grade", "Varicocele Grade"],
    ["vein_dilation", "Vein Dilation"],
    ["reflux", "Reflux"],
    ["blood_flow", "Blood Flow"],
  ],
};

function normalizeReportType(raw) {
  const value = (raw || "").toString().trim().toLowerCase();
  if (["lft", "thyroid", "lft_thyroid", "lab_lft_thyroid"].includes(value)) {
    return "lft";
  }
  if (["kft", "kidney", "kft_report"].includes(value)) return "kft";
  if (["cbc", "cbc_report"].includes(value)) return "cbc";
  if (["semen", "semen_report"].includes(value)) return "semen";
  if (["hormone", "hormone_report"].includes(value)) return "hormone";
  if (["varicocele_usg", "usg"].includes(value)) return "varicocele_usg";
  if (["varicocele_doppler", "doppler"].includes(value)) {
    return "varicocele_doppler";
  }
  return value || "unknown";
}

function expectedFieldsForReportType(reportType) {
  return REPORT_FIELDS[reportType] || [];
}

module.exports = { normalizeReportType, expectedFieldsForReportType };
