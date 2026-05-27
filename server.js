require("dotenv").config();

const app = require("./src/app");
const { PORT } = require("./src/config");

app.listen(PORT, () => {
  console.log(`Reports_OCR listening on http://localhost:${PORT}`);
  console.log(`health: http://localhost:${PORT}/health`);
});
