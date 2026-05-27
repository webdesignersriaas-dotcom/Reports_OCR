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
    ["volume", "Volume"],
    ["sperm_count", "Sperm Count"],
    ["total_motility", "Total Motility"],
    ["progressive_motility", "Progressive Motility"],
    ["normal_forms", "Normal Forms"],
  ],
  hormone: [
    ["testosterone", "Testosterone"],
    ["free_testosterone", "Free Testosterone"],
    ["fsh", "FSH"],
    ["lh", "LH"],
    ["prolactin", "Prolactin"],
  ],
  varicocele_usg: [
    ["grade", "Grade"],
    ["testis_size", "Testis Size"],
    ["structure", "Structure"],
    ["hydrocele", "Hydrocele"],
    ["cyst", "Cyst"],
  ],
  varicocele_doppler: [
    ["grade", "Grade"],
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
