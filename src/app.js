const express = require("express");
const cors = require("cors");

const {
  OPENAI_API_KEY,
  REPORTS_OCR_TOKEN,
  OPENAI_MODEL,
  OPENAI_TIMEOUT_MS,
  OPENAI_MAX_OUTPUT_TOKENS,
} = require("./config");
const reportsRouter = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "reports-ocr",
    openaiConfigured: Boolean(OPENAI_API_KEY),
    tokenConfigured: Boolean(REPORTS_OCR_TOKEN),
    model: OPENAI_MODEL,
    openaiTimeoutMs: OPENAI_TIMEOUT_MS,
    maxOutputTokens: OPENAI_MAX_OUTPUT_TOKENS,
  });
});

app.use("/api/v1/reports", reportsRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
