console.log(' [STARTUP] Executing run-dashboard.js...');

/**
 * Production Dashboard Runner
 * 
 * This script starts the simple-dashboard Express server for production environments like Render.
 * It ensures the server listens on the correct host and port.
 */

const app = require('./institutional-dashboard'); // Import the Express app

// Render provides the PORT environment variable
const PORT = process.env.PORT || 3001;
// We must listen on 0.0.0.0 for Render to route traffic correctly
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(` AI Ledger Dashboard server listening on http://${HOST}:${PORT}`);
});
