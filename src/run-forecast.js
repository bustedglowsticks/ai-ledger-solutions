#!/usr/bin/env node

/**
 * Command-line interface for the Adaptive Monte Carlo Forecaster
 * 
 * Usage:
 *   node run-forecast.js --capital 10000 --sims 1000 --eco-boost 1.24 --threshold 60
 */

const { AdaptiveMonteCarlo } = require('./forecaster');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  capital: 10000,
  simCount: 1000,
  workerCount: 0, // 0 means auto-detect CPU cores
  ecoBoostMultiplier: 1.24,
  deployThreshold: 60,
  outputDir: path.join(__dirname, '../reports')
};

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--capital':
    case '-c':
      options.capital = parseInt(args[++i], 10);
      break;
    case '--sims':
    case '-s':
      options.simCount = parseInt(args[++i], 10);
      break;
    case '--workers':
    case '-w':
      options.workerCount = parseInt(args[++i], 10);
      break;
    case '--eco-boost':
    case '-e':
      options.ecoBoostMultiplier = parseFloat(args[++i]);
      break;
    case '--threshold':
    case '-t':
      options.deployThreshold = parseInt(args[++i], 10);
      break;
    case '--output':
    case '-o':
      options.outputDir = args[++i];
      break;
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
      break;
    default:
      console.error(`Unknown option: ${arg}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
Adaptive Monte Carlo Forecaster - XRPL Liquidity Provider Bot

Usage:
  node run-forecast.js [options]

Options:
  --capital, -c     Initial capital amount (default: 10000)
  --sims, -s        Number of simulations to run (default: 1000)
  --workers, -w     Number of worker threads (default: auto-detect)
  --eco-boost, -e   Eco-friendly asset boost multiplier (default: 1.24)
  --threshold, -t   Yield threshold for deployment recommendation (default: 60%)
  --output, -o      Output directory for reports (default: ../reports)
  --help, -h        Show this help message

Example:
  node run-forecast.js --capital 20000 --sims 2000 --eco-boost 1.3
  `);
}

// Run the forecast
console.log('XRPL Liquidity Provider Bot - Adaptive Monte Carlo Forecaster');
console.log('===========================================================');
console.log(`Capital: $${options.capital.toLocaleString()}`);
console.log(`Simulations: ${options.simCount.toLocaleString()}`);
console.log(`Eco-Boost: ${((options.ecoBoostMultiplier - 1) * 100).toFixed(0)}%`);
console.log(`Deploy Threshold: ${options.deployThreshold}%`);
console.log('===========================================================');

const forecaster = new AdaptiveMonteCarlo(options);
forecaster.forecast()
  .then(result => {
    console.log('\nForecast Summary:');
    console.log(`Mean Yield: ${result.meanYield.toFixed(2)}%`);
    console.log(`Standard Deviation: ±${result.stdDev.toFixed(2)}%`);
    console.log(`Deployment Status: ${result.deployReady ? 'READY ✅' : 'NOT READY ❌'}`);
    console.log(`Report: ${result.reportPath}`);
    
    // Open the report in the default browser on supported platforms
    const { platform } = process;
    const open = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    const { exec } = require('child_process');
    exec(`${open} "${result.reportPath}"`);
  })
  .catch(error => {
    console.error('Error running forecast:', error);
    process.exit(1);
  });
