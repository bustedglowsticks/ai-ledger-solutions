/*
 * LOGGER UTILITY FOR YIELD RECOVERY PROTOCOL
 * Provides structured logging for explosive yield tracking
 */

class Logger {
  constructor(context = 'XRPL-Bot') {
    this.context = context;
  }

  info(message, data = {}) {
    console.log(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`, data);
  }

  error(message, error = null) {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`, error);
  }

  warn(message, data = {}) {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`, data);
  }

  debug(message, data = {}) {
    console.log(`[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`, data);
  }

  success(message, data = {}) {
    console.log(`[${new Date().toISOString()}] [SUCCESS] [${this.context}] 🚀 ${message}`, data);
  }
}

module.exports = Logger;
