console.log(' [STARTUP] Executing run-dashboard.js...');

/**
 * Production Dashboard Runner
 * 
 * This script starts the simple-dashboard Express server for production environments like Render.
 * It ensures the server listens on the correct host and port.
 */

// Try to import from current directory first, then from parent if that fails
let InstitutionalDashboard;
try {
  InstitutionalDashboard = require('./institutional-dashboard');
} catch (e) {
  // If not found in current directory, try to import from self (for when run-dashboard.js is in src directory)
  InstitutionalDashboard = require('./src/institutional-dashboard');
}

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
