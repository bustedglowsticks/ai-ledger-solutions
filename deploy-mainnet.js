/**
 * XRPL Bot Mainnet Deployment Script
 * This script handles the transition from testnet to mainnet for the XRPL liquidity provider bot
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const dotenv = require('dotenv');
const xrpl = require('xrpl');

// Try to load existing environment variables
let envConfig = {};
try {
  if (fs.existsSync('.env')) {
    envConfig = dotenv.parse(fs.readFileSync('.env'));
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

/**
 * Print a styled header
 */
function printHeader(text) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + ' ' + text + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Print a success message
 */
function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

/**
 * Print a warning message
 */
function printWarning(text) {
  console.log(colors.yellow + '⚠ ' + text + colors.reset);
}

/**
 * Print an error message
 */
function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
}

/**
 * Print an info message
 */
function printInfo(text) {
  console.log(colors.blue + 'ℹ ' + text + colors.reset);
}

/**
 * Ask a question and get user input
 */
async function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(colors.cyan + question + defaultText + ': ' + colors.reset, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Validate an XRPL wallet seed
 */
async function validateWalletSeed(seed) {
  try {
    if (!seed.startsWith('s')) {
      return { valid: false, error: 'Wallet seed must start with "s"' };
    }
    
    // Try to derive wallet from seed
    const wallet = xrpl.Wallet.fromSeed(seed);
    return { valid: true, wallet };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Check wallet balance on mainnet
 */
async function checkWalletBalance(walletAddress) {
  try {
    printInfo('Connecting to XRPL mainnet...');
    const client = new xrpl.Client('wss://xrplcluster.com');
    await client.connect();
    
    printInfo(`Checking balance for wallet: ${walletAddress}`);
    const response = await client.getXrpBalance(walletAddress);
    
    await client.disconnect();
    return parseFloat(response);
  } catch (error) {
    printError(`Failed to check wallet balance: ${error.message}`);
    return null;
  }
}

/**
 * Create or update .env file with mainnet configuration
 */
async function updateEnvFile(config) {
  try {
    let envContent = '';
    
    // Add XRPL connection settings
    envContent += '# XRPL Connection\n';
    envContent += `XRPL_SERVER=${config.xrplServer}\n`;
    envContent += `XRPL_WALLET_SEED=${config.walletSeed}\n`;
    envContent += `XRPL_WALLET_ADDRESS=${config.walletAddress}\n\n`;
    
    // Add data harvester settings
    envContent += '# Data Harvester\n';
    envContent += `REDIS_URL=${config.redisUrl}\n`;
    envContent += `SENTIMENT_API_KEY=${config.sentimentApiKey}\n\n`;
    
    // Add monitoring settings
    envContent += '# Monitoring\n';
    envContent += `PROMETHEUS_PORT=${config.prometheusPort}\n`;
    envContent += `DASHBOARD_PORT=${config.dashboardPort}\n`;
    envContent += `ALERT_EMAIL=${config.alertEmail}\n`;
    envContent += `ALERT_WEBHOOK_URL=${config.alertWebhookUrl}\n\n`;
    
    // Add bot configuration
    envContent += '# Bot Configuration\n';
    envContent += `AUTO_REBALANCE=${config.autoRebalance}\n`;
    envContent += `SIMULATION_COUNT=${config.simulationCount}\n`;
    envContent += `CAPITAL=${config.capital}\n`;
    envContent += `UPDATE_INTERVAL=${config.updateInterval}\n`;
    envContent += `TRANSPARENCY_ADDRESS=${config.transparencyAddress}\n`;
    
    // Write to .env.production file
    fs.writeFileSync('.env.production', envContent);
    printSuccess('.env.production file created successfully');
    
    // Copy to .env if confirmed
    if (config.copyToEnv) {
      fs.writeFileSync('.env', envContent);
      printSuccess('.env file updated with mainnet configuration');
    }
  } catch (error) {
    printError(`Failed to update environment files: ${error.message}`);
  }
}

/**
 * Run the deployment process
 */
async function deploy() {
  try {
    printHeader('XRPL BOT MAINNET DEPLOYMENT');
    
    printInfo('This script will help you deploy the XRPL liquidity provider bot to mainnet.');
    printWarning('Make sure you have tested thoroughly on testnet before proceeding.');
    
    const proceed = await askQuestion('Do you want to proceed with mainnet deployment? (yes/no)', 'no');
    if (proceed.toLowerCase() !== 'yes') {
      printInfo('Deployment cancelled. Exiting...');
      rl.close();
      return;
    }
    
    // Collect configuration
    printHeader('CONFIGURATION');
    
    // XRPL Connection
    const xrplServer = await askQuestion('XRPL Mainnet Server URL', 'wss://xrplcluster.com');
    
    let walletSeed = await askQuestion('XRPL Wallet Seed (starts with "s")', envConfig.XRPL_WALLET_SEED || '');
    let validationResult = await validateWalletSeed(walletSeed);
    
    while (!validationResult.valid) {
      printError(`Invalid wallet seed: ${validationResult.error}`);
      walletSeed = await askQuestion('XRPL Wallet Seed (starts with "s")');
      validationResult = await validateWalletSeed(walletSeed);
    }
    
    const walletAddress = validationResult.wallet.address;
    printSuccess(`Wallet address derived: ${walletAddress}`);
    
    // Check wallet balance
    const balance = await checkWalletBalance(walletAddress);
    if (balance !== null) {
      printInfo(`Wallet balance: ${balance} XRP`);
      
      if (balance < 100) {
        printWarning('Wallet balance is below 100 XRP. Consider funding your wallet before deployment.');
        const continueLowBalance = await askQuestion('Continue anyway? (yes/no)', 'no');
        if (continueLowBalance.toLowerCase() !== 'yes') {
          printInfo('Deployment cancelled. Please fund your wallet and try again.');
          rl.close();
          return;
        }
      } else {
        printSuccess('Wallet has sufficient balance for deployment');
      }
    }
    
    // Data harvester
    const redisUrl = await askQuestion('Redis URL', envConfig.REDIS_URL || 'redis://localhost:6379');
    const sentimentApiKey = await askQuestion('Sentiment API Key', envConfig.SENTIMENT_API_KEY || '');
    
    // Monitoring
    const prometheusPort = await askQuestion('Prometheus Port', envConfig.PROMETHEUS_PORT || '9090');
    const dashboardPort = await askQuestion('Dashboard Port', envConfig.DASHBOARD_PORT || '8080');
    const alertEmail = await askQuestion('Alert Email', envConfig.ALERT_EMAIL || '');
    const alertWebhookUrl = await askQuestion('Alert Webhook URL', envConfig.ALERT_WEBHOOK_URL || '');
    
    // Bot configuration
    const autoRebalance = await askQuestion('Auto Rebalance (true/false)', envConfig.AUTO_REBALANCE || 'true');
    const simulationCount = await askQuestion('Simulation Count', envConfig.SIMULATION_COUNT || '500');
    const capital = await askQuestion('Capital', envConfig.CAPITAL || '10000');
    const updateInterval = await askQuestion('Update Interval (ms)', envConfig.UPDATE_INTERVAL || '60000');
    const transparencyAddress = await askQuestion('Transparency Address', envConfig.TRANSPARENCY_ADDRESS || walletAddress);
    
    // Confirm configuration
    printHeader('CONFIGURATION SUMMARY');
    printInfo(`XRPL Server: ${xrplServer}`);
    printInfo(`Wallet Address: ${walletAddress}`);
    printInfo(`Redis URL: ${redisUrl}`);
    printInfo(`Prometheus Port: ${prometheusPort}`);
    printInfo(`Dashboard Port: ${dashboardPort}`);
    printInfo(`Auto Rebalance: ${autoRebalance}`);
    printInfo(`Simulation Count: ${simulationCount}`);
    printInfo(`Capital: ${capital}`);
    printInfo(`Update Interval: ${updateInterval}`);
    printInfo(`Transparency Address: ${transparencyAddress}`);
    
    const confirmConfig = await askQuestion('Is this configuration correct? (yes/no)', 'yes');
    if (confirmConfig.toLowerCase() !== 'yes') {
      printInfo('Configuration not confirmed. Exiting...');
      rl.close();
      return;
    }
    
    // Update environment files
    printHeader('UPDATING ENVIRONMENT FILES');
    
    const copyToEnv = await askQuestion('Update .env file with mainnet configuration? (yes/no)', 'yes');
    
    await updateEnvFile({
      xrplServer,
      walletSeed,
      walletAddress,
      redisUrl,
      sentimentApiKey,
      prometheusPort,
      dashboardPort,
      alertEmail,
      alertWebhookUrl,
      autoRebalance,
      simulationCount,
      capital,
      updateInterval,
      transparencyAddress,
      copyToEnv: copyToEnv.toLowerCase() === 'yes'
    });
    
    // Deploy to mainnet
    printHeader('DEPLOYING TO MAINNET');
    
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      printInfo('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Ask for deployment method
    const deploymentMethod = await askQuestion('Choose deployment method (local/docker/cloud)', 'local');
    
    switch (deploymentMethod.toLowerCase()) {
      case 'local':
        printInfo('Deploying locally...');
        printInfo('To start the bot, run: NODE_ENV=production node src/index.js');
        break;
        
      case 'docker':
        printInfo('Deploying with Docker...');
        printInfo('Building Docker image...');
        execSync('docker build -t xrpl-bot:mainnet .', { stdio: 'inherit' });
        printInfo('To start the bot, run: docker run -d --env-file .env.production --name xrpl-bot xrpl-bot:mainnet');
        break;
        
      case 'cloud':
        printInfo('Deploying to cloud...');
        const cloudProvider = await askQuestion('Choose cloud provider (render/railway/heroku/aws)', 'render');
        
        switch (cloudProvider.toLowerCase()) {
          case 'render':
            printInfo('Deploying to Render...');
            printInfo('To deploy to Render, follow these steps:');
            printInfo('1. Push your code to GitHub');
            printInfo('2. Create a new Web Service on Render');
            printInfo('3. Connect your GitHub repository');
            printInfo('4. Set the environment variables from .env.production');
            printInfo('5. Deploy the service');
            break;
            
          case 'railway':
            printInfo('Deploying to Railway...');
            printInfo('To deploy to Railway, follow these steps:');
            printInfo('1. Install Railway CLI: npm install -g @railway/cli');
            printInfo('2. Login: railway login');
            printInfo('3. Initialize: railway init');
            printInfo('4. Set environment variables: railway vars set $(cat .env.production)');
            printInfo('5. Deploy: railway up');
            break;
            
          case 'heroku':
            printInfo('Deploying to Heroku...');
            printInfo('To deploy to Heroku, follow these steps:');
            printInfo('1. Install Heroku CLI');
            printInfo('2. Login: heroku login');
            printInfo('3. Create app: heroku create xrpl-bot');
            printInfo('4. Set environment variables: heroku config:set $(cat .env.production)');
            printInfo('5. Deploy: git push heroku main');
            break;
            
          case 'aws':
            printInfo('Deploying to AWS...');
            printInfo('To deploy to AWS, follow these steps:');
            printInfo('1. Configure AWS CLI');
            printInfo('2. Follow the AWS deployment guide in DEPLOYMENT.md');
            break;
            
          default:
            printWarning(`Unsupported cloud provider: ${cloudProvider}`);
            break;
        }
        break;
        
      default:
        printWarning(`Unsupported deployment method: ${deploymentMethod}`);
        break;
    }
    
    printHeader('DEPLOYMENT COMPLETE');
    printSuccess('XRPL Bot has been configured for mainnet deployment!');
    printInfo('Next steps:');
    printInfo('1. Start the bot using the method you selected');
    printInfo('2. Monitor the bot performance and logs');
    printInfo('3. Set up monitoring and alerting');
    
  } catch (error) {
    printError(`Deployment failed: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the deployment process
deploy().catch(console.error);
