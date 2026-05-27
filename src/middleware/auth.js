const { REPORTS_OCR_TOKEN } = require("../config");

function safeEqualText(a, b) {
  const left = (a || "").toString();
  const right = (b || "").toString();
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

function requireReportsOcrToken(req, res, next) {
  if (!REPORTS_OCR_TOKEN) {
    return res.status(503).json({
      success: false,
      message: "REPORTS_OCR_TOKEN is not configured",
    });
  }
  const token = req.get("x-reports-ocr-token") || "";
  if (!safeEqualText(token, REPORTS_OCR_TOKEN)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return next();
}

module.exports = { requireReportsOcrToken };
