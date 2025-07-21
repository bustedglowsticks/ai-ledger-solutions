/**
 * AWS Deployment Script for XRPL Bot and Dashboards
 * 
 * This script prepares the application for deployment to AWS Elastic Beanstalk
 * or AWS Lambda depending on the deployment strategy selected.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // AWS deployment options
  aws: {
    region: 'us-east-1', // Change to your preferred AWS region
    applicationName: 'xrpl-liquidity-bot',
    environmentName: 'production',
    s3Bucket: 'xrpl-bot-deployments', // Will be created if it doesn't exist
  },
  
  // Deployment strategy: 'beanstalk' for Elastic Beanstalk or 'lambda' for Lambda
  deploymentStrategy: 'beanstalk',
  
  // Components to deploy
  components: {
    bot: true,              // The XRPL trading bot itself
    institutionalDashboard: true,  // Institutional monitoring dashboard
    publicDashboard: false,  // Public-facing statistics dashboard (if applicable)
  },
  
  // Port configurations
  ports: {
    bot: process.env.BOT_PORT || 8080,
    institutionalDashboard: process.env.DASHBOARD_PORT || 3001,
    publicDashboard: process.env.PUBLIC_DASHBOARD_PORT || 3002,
  }
};

/**
 * Prepares the application for AWS Elastic Beanstalk deployment
 */
function prepareForBeanstalk() {
  console.log('Preparing for AWS Elastic Beanstalk deployment...');
  
  // Create Procfile for Elastic Beanstalk
  const procfileContent = [
    'web: node src/index.js',
    'dashboard: node src/run-dashboard.js'
  ].join('\n');
  
  fs.writeFileSync(path.join(__dirname, 'Procfile'), procfileContent);
  console.log('Created Procfile for Elastic Beanstalk');
  
  // Create .ebextensions configuration
  const ebextensionsDir = path.join(__dirname, '.ebextensions');
  if (!fs.existsSync(ebextensionsDir)) {
    fs.mkdirSync(ebextensionsDir);
  }
  
  // Create Node.js configuration
  const nodeConfigContent = {
    option_settings: {
      'aws:elasticbeanstalk:container:nodejs': {
        NodeVersion: '18.x',
        ProxyServer: 'nginx'
      },
      'aws:elasticbeanstalk:application:environment': {
        NODE_ENV: 'production',
        BOT_PORT: config.ports.bot,
        DASHBOARD_PORT: config.ports.institutionalDashboard
      }
    }
  };
  
  fs.writeFileSync(
    path.join(ebextensionsDir, '01_nodeconfig.config'),
    JSON.stringify(nodeConfigContent, null, 2)
  );
  console.log('Created .ebextensions/01_nodeconfig.config');
  
  // Create nginx configuration to proxy dashboard requests
  const nginxConfigContent = {
    files: {
      '/etc/nginx/conf.d/proxy.conf': {
        content: `
upstream dashboard {
  server 127.0.0.1:${config.ports.institutionalDashboard};
  keepalive 256;
}

server {
  listen 80;
  
  location /dashboard/ {
    proxy_pass http://dashboard/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
`
      }
    }
  };
  
  fs.writeFileSync(
    path.join(ebextensionsDir, '02_nginx.config'),
    JSON.stringify(nginxConfigContent, null, 2)
  );
  console.log('Created .ebextensions/02_nginx.config');
  
  // Create package.json if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    const packageJson = {
      name: 'xrpl-liquidity-bot',
      version: '1.0.0',
      description: 'XRPL Liquidity Provider Bot with Institutional Dashboard',
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        'start-dashboard': 'node src/run-dashboard.js'
      },
      engines: {
        node: '>=18.0.0'
      },
      dependencies: {
        axios: '^1.3.4',
        cors: '^2.8.5',
        dotenv: '^16.0.3',
        express: '^4.18.2',
        ws: '^8.13.0',
        xrpl: '^2.7.0'
      }
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    console.log('Created package.json');
  }
  
  console.log('Elastic Beanstalk preparation complete!');
}

/**
 * Prepares the application for AWS Lambda deployment
 */
function prepareForLambda() {
  console.log('Preparing for AWS Lambda deployment...');
  
  // Create serverless.yml for Lambda deployment
  const serverlessContent = `
service: xrpl-liquidity-bot

provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'prod'}
  region: ${config.aws.region}
  memorySize: 1024
  timeout: 30
  environment:
    NODE_ENV: production
    BOT_PORT: ${config.ports.bot}
    DASHBOARD_PORT: ${config.ports.institutionalDashboard}

functions:
  bot:
    handler: src/lambda-bot.handler
    events:
      - schedule: rate(1 minute)
    environment:
      IS_LAMBDA: true

  dashboard:
    handler: src/lambda-dashboard.handler
    events:
      - http:
          path: /
          method: get
          cors: true
      - http:
          path: /api/{proxy+}
          method: any
          cors: true
      - http:
          path: /{proxy+}
          method: any
          cors: true
`;

  fs.writeFileSync(path.join(__dirname, 'serverless.yml'), serverlessContent);
  console.log('Created serverless.yml for Lambda');
  
  // Create Lambda handler for bot
  const lambdaBotContent = `
const { SimplifiedOrchestrator } = require('./test/simplified-orchestrator');

// Lambda handler for the bot
exports.handler = async (event, context) => {
  console.log('XRPL Bot Lambda triggered');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.production' });
    
    // Initialize bot with Lambda-specific configuration
    const config = {
      xrplServer: process.env.XRPL_SERVER || 'wss://s1.ripple.com',
      xrplServerFallbacks: [
        'wss://s1.ripple.com',
        'wss://s2.ripple.com',
        'wss://xrplcluster.com',
        'wss://xrpl.ws'
      ],
      connectionTimeout: 15000,
      walletSeed: process.env.XRPL_WALLET_SEED,
      walletAddress: process.env.XRPL_WALLET_ADDRESS,
      
      // Risk management parameters
      capital: parseFloat(process.env.CAPITAL) || 10000,
      maxTransactionAmount: parseFloat(process.env.MAX_TRANSACTION_AMOUNT) || 1000,
      maxDailyVolume: parseFloat(process.env.MAX_DAILY_VOLUME) || 5000,
      stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE) || 0.05,
      emergencyShutdownThreshold: parseFloat(process.env.EMERGENCY_SHUTDOWN_THRESHOLD) || 0.15,
      alertThreshold: parseFloat(process.env.ALERT_THRESHOLD) || 0.03,
      
      // Lambda-specific settings
      isLambda: true,
      isLiveTrading: process.env.LIVE_TRADING === 'true'
    };
    
    const orchestrator = new SimplifiedOrchestrator(config);
    await orchestrator.initialize();
    
    // Run a single trading cycle
    const result = await orchestrator.runTradingCycle();
    
    // Clean up
    await orchestrator.shutdown();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Trading cycle completed successfully',
        result
      })
    };
  } catch (error) {
    console.error('Error in bot Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error executing trading cycle',
        error: error.message
      })
    };
  }
};
`;

  // Create Lambda handler directory if it doesn't exist
  const srcDir = path.join(__dirname, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(srcDir, 'lambda-bot.js'), lambdaBotContent);
  console.log('Created Lambda handler for bot');
  
  // Create Lambda handler for dashboard
  const lambdaDashboardContent = `
const serverless = require('serverless-http');
const InstitutionalDashboard = require('./institutional-dashboard');

// Initialize the dashboard
const dashboard = new InstitutionalDashboard();
const app = dashboard.app;

// Export the serverless handler
module.exports.handler = serverless(app);
`;

  fs.writeFileSync(path.join(srcDir, 'lambda-dashboard.js'), lambdaDashboardContent);
  console.log('Created Lambda handler for dashboard');
  
  // Create run-dashboard.js if it doesn't exist
  if (!fs.existsSync(path.join(srcDir, 'run-dashboard.js'))) {
    const runDashboardContent = `
const InstitutionalDashboard = require('./institutional-dashboard');

// Start the dashboard server
const dashboard = new InstitutionalDashboard();
dashboard.start(process.env.DASHBOARD_PORT || 3001);
`;

    fs.writeFileSync(path.join(srcDir, 'run-dashboard.js'), runDashboardContent);
    console.log('Created run-dashboard.js');
  }
  
  console.log('Lambda preparation complete!');
}

/**
 * Main deployment function
 */
function deploy() {
  console.log('Starting AWS deployment preparation...');
  
  if (config.deploymentStrategy === 'beanstalk') {
    prepareForBeanstalk();
  } else if (config.deploymentStrategy === 'lambda') {
    prepareForLambda();
  } else {
    console.error('Invalid deployment strategy. Use "beanstalk" or "lambda".');
    process.exit(1);
  }
  
  console.log('\nDeployment preparation complete!');
  console.log('\nTo deploy to AWS:');
  
  if (config.deploymentStrategy === 'beanstalk') {
    console.log('1. Install AWS CLI and EB CLI if not already installed:');
    console.log('   npm install -g aws-cli eb-cli');
    console.log('2. Configure AWS credentials:');
    console.log('   aws configure');
    console.log('3. Initialize EB application:');
    console.log(`   eb init ${config.aws.applicationName} --region ${config.aws.region} --platform node.js`);
    console.log('4. Create environment:');
    console.log(`   eb create ${config.aws.environmentName}`);
    console.log('5. Deploy updates in the future:');
    console.log('   eb deploy');
  } else {
    console.log('1. Install Serverless Framework if not already installed:');
    console.log('   npm install -g serverless');
    console.log('2. Configure AWS credentials:');
    console.log('   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET');
    console.log('3. Deploy to AWS:');
    console.log('   serverless deploy');
  }
  
  console.log('\nAfter deployment, your application will be available at:');
  console.log(`- Bot: http://YOUR_AWS_URL/`);
  console.log(`- Institutional Dashboard: http://YOUR_AWS_URL/dashboard/`);
}

// Run the deployment preparation
deploy();
