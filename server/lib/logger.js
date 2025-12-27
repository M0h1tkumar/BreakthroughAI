const util = require("util");

function _format(level, msg, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${util.inspect(meta, { depth: 2 })}` : "";
  return `${timestamp} [${level}] ${msg}${metaStr}`;
}

module.exports = {
  info: (msg, meta) => console.log(_format("INFO", msg, meta)),
  warn: (msg, meta) => console.warn(_format("WARN", msg, meta)),
  error: (msg, meta) => console.error(_format("ERROR", msg, meta)),
  debug: (msg, meta) => console.debug(_format("DEBUG", msg, meta)),
};
