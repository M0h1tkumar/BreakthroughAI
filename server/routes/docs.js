const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const router = express.Router();

const spec = fs.readFileSync(
  path.join(__dirname, "..", "openapi.yaml"),
  "utf8"
);
router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: "/openapi.yaml" } })
);
router.get("/openapi.yaml", (req, res) => res.type("yaml").send(spec));

module.exports = router;
