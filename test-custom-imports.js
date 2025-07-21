/**
 * Test script to identify problematic custom module imports
 */

console.log('Starting custom module import tests...');

try {
  console.log('Testing dotenv import and config...');
  const dotenv = require('dotenv');
  dotenv.config();
  console.log('✅ dotenv configured successfully');
} catch (error) {
  console.error(`❌ dotenv config failed: ${error.message}`);
}

try {
  console.log('Testing ArenaOrchestrator import...');
  const { ArenaOrchestrator } = require('./src/test/live-validation-arena-orchestrator');
  console.log('✅ ArenaOrchestrator imported successfully');
} catch (error) {
  console.error(`❌ ArenaOrchestrator import failed: ${error.message}`);
}

try {
  console.log('Testing api/institutional-endpoint import...');
  const api = require('./src/api/institutional-endpoint');
  console.log('✅ api/institutional-endpoint imported successfully');
} catch (error) {
  console.error(`❌ api/institutional-endpoint import failed: ${error.message}`);
}

try {
  console.log('Testing institutional-dashboard import...');
  const InstitutionalDashboard = require('./src/institutional-dashboard');
  console.log('✅ institutional-dashboard imported successfully');
} catch (error) {
  console.error(`❌ institutional-dashboard import failed: ${error.message}`);
}

console.log('Custom module import tests completed.');
