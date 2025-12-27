const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
require("dotenv").config();
const logger = require("./lib/logger");
const db = require("./lib/db");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com"
        : "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount routes (these modules should handle DB fallback if needed)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/prescriptions", require("./routes/prescriptions"));
app.use("/api/medicines", require("./routes/medicines"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/docs", require("./routes/docs"));

// Health check includes fallback file status
app.get("/api/health", (req, res) => {
  const fallbackPath = "./data/fallback.json";
  let fallbackExists = false;
  try {
    fallbackExists = fs.existsSync(fallbackPath);
  } catch (e) {
    fallbackExists = false;
  }
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: db.isConnected() ? "Connected" : "Disconnected",
    fallbackStore: fallbackExists,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", err && err.message ? err.message : err);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err && err.message
          ? err.message
          : err
        : {},
  });
});

const PORT = process.env.PORT || 5000;

let server;

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      try {
        await db.connect(process.env.MONGODB_URI, {
          retries: 3,
          retryDelay: 2000,
        });
      } catch (err) {
        logger.warn(
          "Proceeding with fallback store because MongoDB is unavailable",
          { err: err.message }
        );
      }
    }

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down");
  if (server) server.close(() => process.exit(0));
});

// mount error handler last
const { handleError } = require("./middleware/errorHandler");
app.use(handleError);
