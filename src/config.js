function trim(value) {
  return (value || "").toString().trim();
}

module.exports = {
  PORT: Number(process.env.PORT || 3105),
  OPENAI_API_KEY: trim(process.env.OPENAI_API_KEY),
  OPENAI_MODEL: trim(process.env.OPENAI_MODEL) || "gpt-4o-mini",
  REPORTS_OCR_TOKEN: trim(process.env.REPORTS_OCR_TOKEN),
  MAX_FILE_BYTES: Number(process.env.MAX_FILE_BYTES || 25 * 1024 * 1024),
};
