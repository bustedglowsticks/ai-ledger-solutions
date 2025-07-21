/**
 * XRPL Bot Institutional Dashboard Runner
 * 
 * This script launches the institutional dashboard for monitoring the XRPL bot.
 * The dashboard connects to the deployed bot on Render and displays real-time data.
 */

const InstitutionalDashboard = require('./institutional-dashboard');

// Create and start the dashboard
const dashboard = new InstitutionalDashboard();
dashboard.start(3001);

console.log('🚀 Institutional Dashboard started!');
console.log('📊 View live XRPL bot data at http://localhost:3001');
