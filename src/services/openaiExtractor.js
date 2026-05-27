const OpenAI = require("openai");
const {
  OPENAI_API_KEY,
  OPENAI_MODEL,
  OPENAI_TIMEOUT_MS,
  OPENAI_MAX_OUTPUT_TOKENS,
} = require("../config");
const { expectedFieldsForReportType } = require("../utils/reportTypes");
const { normalizeExtractionResult } = require("../utils/normalize");

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fields"],
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
    "Extract only the requested lab values visible in the attached report.",
    "Do not invent missing values. Return no row for a missing value.",
    "Use exact requested keys. Keep value numeric/text only; put unit separately.",
    "Status must be NORMAL, LOW, HIGH, BORDERLINE, ABNORMAL, CRITICAL, or UNKNOWN.",
    "Score is 0-100 where 100 is best/normal.",
    `Report type: ${reportType}`,
    `Fields:\n${fieldList || "Infer relevant report fields."}`,
  ].join("\n\n");
}

async function extractReportWithOpenAI({ reportType, fileUrl, fileName }) {
  if (!client) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured"), {
      statusCode: 503,
    });
  }
  const expectedFields = expectedFieldsForReportType(reportType);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  try {
    const response = await client.responses.create(
      {
        model: OPENAI_MODEL,
        max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildPrompt(reportType, expectedFields),
              },
              fileContentPart(fileUrl, fileName),
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "report_ocr_fields",
            strict: true,
            schema: extractionSchema,
          },
        },
      },
      { signal: controller.signal },
    );

    const outputText = response.output_text || "";
    if (!outputText.trim()) {
      throw new Error("OpenAI returned an empty extraction response");
    }
    const raw = JSON.parse(outputText);
    return normalizeExtractionResult(raw, reportType, expectedFields);
  } catch (error) {
    if (error.name === "AbortError") {
      throw Object.assign(new Error("OpenAI extraction timed out"), {
        statusCode: 504,
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { extractReportWithOpenAI };
