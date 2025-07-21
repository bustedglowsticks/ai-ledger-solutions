/**
 * XRPL Bot Live Trading Script
 * 
 * This script runs the bot in live trading mode with real funds on mainnet.
 * It uses the enhanced SimplifiedOrchestrator with risk management features.
 */

// Load environment variables from .env.production
require('dotenv').config({ path: '.env.production' });

const { SimplifiedOrchestrator } = require('./src/test/simplified-orchestrator');
const Logger = require('./src/utils/logger');
const logger = new Logger('LiveTrading');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Print warning banner
console.log('\n' + colors.bright + colors.red + '!'.repeat(80) + colors.reset);
console.log(colors.bright + colors.red + ' WARNING: LIVE TRADING MODE - USING REAL FUNDS ON MAINNET ' + colors.reset);
console.log(colors.bright + colors.red + '!'.repeat(80) + colors.reset + '\n');

// Check for auto-confirm flag
const autoConfirm = process.argv.includes('--auto-confirm');

// If auto-confirm is enabled, skip the prompt
if (autoConfirm) {
  console.log('Auto-confirm enabled. Starting live trading without prompt...');
  runLiveTrading().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} else {
  // Ask for confirmation before proceeding
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(colors.yellow + 'Are you sure you want to start live trading with real funds? (yes/no): ' + colors.reset, (answer) => {
  if (answer.toLowerCase() === 'yes') {
    readline.close();
    runLiveTrading().catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
  } else {
    console.log(colors.green + 'Live trading canceled. Exiting...' + colors.reset);
    readline.close();
    process.exit(0);
  }
});

/**
 * Main function to run the bot in live trading mode
 */
async function runLiveTrading() {
  try {
    // Configuration for live trading
    const config = {
      // Use mainnet server from environment variables with fallbacks
      xrplServer: process.env.XRPL_SERVER || 'wss://s1.ripple.com',
      xrplServerFallbacks: [
        'wss://s1.ripple.com',
        'wss://s2.ripple.com',
        'wss://xrplcluster.com',
        'wss://xrpl.ws'
      ],
      connectionTimeout: 15000, // Increased timeout to 15 seconds
      walletSeed: process.env.XRPL_WALLET_SEED,
      walletAddress: process.env.XRPL_WALLET_ADDRESS,
      
      // Risk management parameters
      capital: parseFloat(process.env.CAPITAL) || 10000,
      maxTransactionAmount: parseFloat(process.env.MAX_TRANSACTION_AMOUNT) || 1000, // Default 1000 XRP per transaction
      maxDailyVolume: parseFloat(process.env.MAX_DAILY_VOLUME) || 5000, // Default 5000 XRP per day
      stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE) || 0.05, // Default 5% stop loss
      emergencyShutdownThreshold: parseFloat(process.env.EMERGENCY_SHUTDOWN_THRESHOLD) || 0.15, // Default 15% loss triggers shutdown
      alertThreshold: parseFloat(process.env.ALERT_THRESHOLD) || 0.03, // Default 3% loss triggers alert
      
      // Enable live trading mode
      isLiveTrading: true,
      
      // Other configuration
      autoUpdateInterval: parseInt(process.env.UPDATE_INTERVAL) || 60000, // Default 1 minute
      simCount: parseInt(process.env.SIMULATION_COUNT) || 500,
      dashboardPort: parseInt(process.env.DASHBOARD_PORT) || 8080
    };
    
    logger.info('Starting XRPL Bot in LIVE TRADING mode');
    logger.info(`Connected to: ${config.xrplServer}`);
    logger.info(`Wallet address: ${config.walletAddress}`);
    logger.info(`Risk parameters: Max transaction: ${config.maxTransactionAmount} XRP, Daily limit: ${config.maxDailyVolume} XRP`);
    logger.info(`Stop loss: ${config.stopLossPercentage * 100}%, Emergency shutdown: ${config.emergencyShutdownThreshold * 100}%`);
    
    // Initialize the SimplifiedOrchestrator with live trading configuration
    const orchestrator = new SimplifiedOrchestrator(config);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal. Shutting down gracefully...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal. Shutting down gracefully...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
    // Initialize and start the orchestrator
    await orchestrator.init();
    logger.info('Bot initialized successfully and running in LIVE TRADING mode');
    logger.info('Press Ctrl+C to stop the bot');
    
  } catch (error) {
    logger.error(`Failed to start bot in live trading mode: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ask for confirmation before proceeding
rl.question(colors.yellow + 'Are you sure you want to start live trading with real funds? (yes/no): ' + colors.reset, (answer) => {
  if (answer.toLowerCase() === 'yes') {
    rl.close();
    runLiveTrading().catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
  } else {
    console.log(colors.green + 'Live trading canceled. Exiting...' + colors.reset);
    rl.close();
    process.exit(0);
  }
});
