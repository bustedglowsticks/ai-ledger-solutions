console.log(' [STARTUP] Executing run-dashboard.js...');

/**
 * Production Dashboard Runner
 * 
 * This script starts the simple-dashboard Express server for production environments like Render.
 * It ensures the server listens on the correct host and port.
 */

const InstitutionalDashboard = require('./institutional-dashboard'); // Import the dashboard class

// Create dashboard instance
const dashboard = new InstitutionalDashboard();

// Render provides the PORT environment variable
const PORT = process.env.PORT || 3001;
// We must listen on 0.0.0.0 for Render to route traffic correctly
const HOST = '0.0.0.0';

// Start the dashboard with specific port and host
dashboard.app.listen(PORT, HOST, () => {
  console.log(`AI Ledger Dashboard server listening on http://${HOST}:${PORT}`);
});
