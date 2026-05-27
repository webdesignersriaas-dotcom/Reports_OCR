const OpenAI = require("openai");
const { OPENAI_API_KEY, OPENAI_MODEL } = require("../config");
const { expectedFieldsForReportType } = require("../utils/reportTypes");
const { normalizeExtractionResult } = require("../utils/normalize");

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "fields",
    "lft_score",
    "cbc_score",
    "status",
    "issues",
    "parameters",
    "raw_text_summary",
  ],
  properties: {
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "label", "value", "unit", "status", "score", "confidence"],
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          value: { type: ["string", "number", "null"] },
          unit: { type: "string" },
          status: {
            type: "string",
            enum: ["NORMAL", "LOW", "HIGH", "BORDERLINE", "ABNORMAL", "CRITICAL", "UNKNOWN"],
          },
          score: { type: "integer", minimum: 0, maximum: 100 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
    lft_score: { type: ["number", "null"] },
    cbc_score: { type: ["number", "null"] },
    status: { type: ["string", "null"] },
    issues: { type: "array", items: { type: "string" } },
    parameters: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "label", "value", "unit", "status", "score", "weight", "confidence"],
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          value: { type: ["string", "number", "null"] },
          unit: { type: "string" },
          status: {
            type: "string",
            enum: ["NORMAL", "LOW", "HIGH", "BORDERLINE", "ABNORMAL", "CRITICAL", "UNKNOWN"],
          },
          score: { type: "integer", minimum: 0, maximum: 100 },
          weight: { type: "integer", minimum: 0, maximum: 100 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
    raw_text_summary: { type: ["string", "null"] },
  },
};

function fileContentPart(fileUrl, fileName) {
  const lower = `${fileName || fileUrl}`.toLowerCase();
  if (lower.includes(".pdf") || lower.includes("application/pdf")) {
    return { type: "input_file", file_url: fileUrl };
  }
  return { type: "input_image", image_url: fileUrl };
}

function buildPrompt(reportType, expectedFields) {
  const fieldList = expectedFields.map(([key, label]) => `${key}: ${label}`).join("\n");
  return [
    "Extract medical lab report values from the attached report.",
    "Return only values visible in the report. Do not invent missing values.",
    "Use the exact field keys requested when possible.",
    "Set confidence lower when text is blurry or ambiguous.",
    "Classify status using NORMAL, LOW, HIGH, BORDERLINE, ABNORMAL, CRITICAL, or UNKNOWN.",
    "Scores must be 0-100 where 100 is best/normal and lower is worse.",
    `Report type: ${reportType}`,
    `Expected fields:\n${fieldList || "Infer relevant report fields."}`,
  ].join("\n\n");
}

async function extractReportWithOpenAI({ reportType, fileUrl, fileName }) {
  if (!client) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured"), {
      statusCode: 503,
    });
  }
  const expectedFields = expectedFieldsForReportType(reportType);
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildPrompt(reportType, expectedFields) },
          fileContentPart(fileUrl, fileName),
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "report_ocr_extraction",
        strict: true,
        schema: extractionSchema,
      },
    },
  });

  const outputText = response.output_text || "";
  if (!outputText.trim()) {
    throw new Error("OpenAI returned an empty extraction response");
  }
  const raw = JSON.parse(outputText);
  return normalizeExtractionResult(raw, reportType, expectedFields);
}

module.exports = { extractReportWithOpenAI };
