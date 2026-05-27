function normalizeStatus(raw) {
  const value = (raw || "").toString().trim().toUpperCase();
  if (!value) return "UNKNOWN";
  if (["NORMAL", "OK", "GOOD"].includes(value)) return "NORMAL";
  if (["BORDERLINE", "LOW", "HIGH", "ABNORMAL", "CRITICAL"].includes(value)) {
    return value;
  }
  return value;
}

function humanizeKey(key) {
  return (key || "")
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function canonicalKey(rawKey, expectedByKey) {
  const key = (rawKey || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!key) return "";
  if (expectedByKey.has(key)) return key;
  if (key === "total_motility" || key === "progressive_motility" || key.includes("motility")) {
    return "motility";
  }
  if (key === "normal_forms" || key.includes("morphology") || key.includes("normal_form")) {
    return "morphology";
  }
  if (key === "total_testosterone" || (key.includes("testosterone") && !key.includes("free"))) {
    return "testosterone";
  }
  if (key.includes("sperm") && key.includes("count")) return "sperm_count";
  if (key === "grade") return "varicocele_grade";
  if (key === "structure") return "testis_structure";
  if (key.includes("testis") && key.includes("structure")) {
    return "testis_structure";
  }
  if (key.includes("varicocele") && key.includes("grade")) {
    return "varicocele_grade";
  }
  return key;
}

function normalizedValueWithUnit(value, unit) {
  if (value == null) return null;
  const text = value.toString().trim();
  const unitText = unit == null ? "" : unit.toString().trim();
  if (!text) return text;
  if (!unitText || /^[.;:,-]+$/.test(unitText)) return text;
  if (text.toLowerCase().includes(unitText.toLowerCase())) return text;
  return `${text} ${unitText}`;
}

function normalizeFieldRows(rawFields, expectedFields) {
  const expectedByKey = new Map(expectedFields.map(([key, label]) => [key, label]));
  const outByKey = new Map();

  for (const raw of Array.isArray(rawFields) ? rawFields : []) {
    if (!raw || typeof raw !== "object") continue;
    const key = canonicalKey(raw.key || raw.name || raw.metric || raw.label, expectedByKey);
    if (!key) continue;
    const label = (expectedByKey.get(key) || raw.label || humanizeKey(key))
      .toString()
      .trim();
    const unit = raw.unit == null ? "" : raw.unit.toString().trim();
    const value = normalizedValueWithUnit(raw.value, unit);
    const score = Number.isFinite(Number(raw.score))
      ? Math.max(0, Math.min(100, Math.round(Number(raw.score))))
      : null;
    const confidence = Number.isFinite(Number(raw.confidence))
      ? Math.max(0, Math.min(1, Number(raw.confidence)))
      : null;
    outByKey.set(key, {
      key,
      label,
      value,
      unit,
      status: normalizeStatus(raw.status),
      score: score ?? 70,
      confidence: confidence ?? 0.6,
    });
  }

  for (const [key, label] of expectedFields) {
    if (!outByKey.has(key)) {
      outByKey.set(key, {
        key,
        label,
        value: null,
        unit: "",
        status: "UNKNOWN",
        score: 70,
        confidence: 0,
      });
    }
  }

  return [...outByKey.values()].filter((row) => {
    return row.value != null && row.value.toString().trim() !== "";
  });
}

function normalizeExtractionResult(raw, reportType, expectedFields) {
  const source = raw && typeof raw === "object" ? raw : {};
  const fields = normalizeFieldRows(source.fields, expectedFields);
  return {
    success: true,
    report_type: reportType,
    fields,
    lft_score: source.lft_score ?? null,
    cbc_score: source.cbc_score ?? null,
    status: source.status ?? null,
    issues: Array.isArray(source.issues) ? source.issues.map(String) : [],
    parameters: Array.isArray(source.parameters) ? source.parameters : [],
    raw_text_summary: source.raw_text_summary ?? null,
  };
}

module.exports = { normalizeExtractionResult };
