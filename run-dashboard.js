/**
 * Dashboard Runner
 * 
 * This is a simple wrapper script to start the institutional dashboard
 * from the root directory, making it easier to deploy to Render.com
 */

const InstitutionalDashboard = require('./src/institutional-dashboard');

// Create and start the dashboard
const dashboard = new InstitutionalDashboard();
const port = process.env.PORT || 10001;
dashboard.start(port);

console.log(`🚀 Institutional Dashboard started on port ${port}!`);
