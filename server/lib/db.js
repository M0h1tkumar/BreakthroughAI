const mongoose = require("mongoose");
const logger = require("./logger");

async function connect(uri, options = {}) {
  const maxRetries = options.retries || 5;
  const retryDelay = options.retryDelay || 2000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      await mongoose.connect(uri, {
        /* modern driver ignores legacy flags */
      });
      logger.info("✅ MongoDB connected successfully");
      return mongoose.connection;
    } catch (err) {
      logger.warn(
        `MongoDB connection attempt ${attempt} failed: ${err.message}`
      );
      if (attempt >= maxRetries) {
        logger.error("MongoDB connection failed after maximum retries");
        throw err;
      }
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }
}

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

module.exports = { connect, isConnected };
