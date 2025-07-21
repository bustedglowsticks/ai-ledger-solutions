/**
 * XRPL Liquidity Provider Bot - Main Entry Point
 */

// Import required modules
const dotenv = require('dotenv');
const { SimplifiedOrchestrator } = require('./test/simplified-orchestrator');
const logger = console; // Replace with your preferred logging solution
const api = require('./api/institutional-endpoint');
const InstitutionalDashboard = require('./institutional-dashboard');

// Load environment variables
dotenv.config();

/**
 * Main function
 */
async function main() {
  try {
    logger.info('Starting XRPL Liquidity Provider Bot...');
    
    // Create Simplified Orchestrator with configuration from environment variables
    const orchestrator = new SimplifiedOrchestrator({
      capital: parseInt(process.env.CAPITAL || '10000'),
      simCount: parseInt(process.env.SIMULATION_COUNT || '500'),
      autoUpdateInterval: parseInt(process.env.UPDATE_INTERVAL || '60000'),
      autoRebalance: process.env.AUTO_REBALANCE === 'true',
      autoNftMint: process.env.AUTO_NFT_MINT === 'true',
      xrplServer: process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233',
      walletSeed: process.env.XRPL_WALLET_SEED,
      dashboardPort: parseInt(process.env.DASHBOARD_PORT || '8080'),
      prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090')
    });
    
    // Initialize the orchestrator
    await orchestrator.init();
    
    // Start auto-update
    orchestrator.startAutoUpdate();

    const dashboard = new InstitutionalDashboard();
    dashboard.start(3001);
    
    logger.info('XRPL Liquidity Provider Bot (Simplified Mode) started successfully');
    
    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Shutting down XRPL Liquidity Provider Bot...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Shutting down XRPL Liquidity Provider Bot...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Error starting XRPL Liquidity Provider Bot: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Unhandled error in main: ${error.message}`);
  process.exit(1);
});
