const express = require("express");
const { requireReportsOcrToken } = require("../middleware/auth");
const { normalizeReportType } = require("../utils/reportTypes");
const { extractReportWithOpenAI } = require("../services/openaiExtractor");

const router = express.Router();

router.post("/extract", requireReportsOcrToken, async (req, res) => {
  const reportType = normalizeReportType(req.body?.report_type);
  const fileUrl = (req.body?.file_url || "").toString().trim();
  const fileName = (req.body?.file_name || "").toString().trim();

  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      message: "file_url is required",
      report_type: reportType,
      fields: [],
      issues: ["file_url is required"],
      parameters: [],
    });
  }

  try {
    const startedAt = Date.now();
    const result = await extractReportWithOpenAI({
      reportType,
      fileUrl,
      fileName,
    });
    res.set("X-Reports-OCR-Duration-Ms", String(Date.now() - startedAt));
    return res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 502;
    console.error("Report extraction failed:", error);
    return res.status(statusCode).json({
      success: false,
      report_type: reportType,
      fields: [],
      lft_score: null,
      cbc_score: null,
      status: null,
      issues: [error.message || "Report extraction failed"],
      parameters: [],
      raw_text_summary: null,
    });
  }
});

module.exports = router;
