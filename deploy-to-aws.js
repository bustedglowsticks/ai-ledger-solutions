/**
 * AWS Deployment Package Generator for XRPL Bot
 * 
 * This script prepares the necessary files for AWS Elastic Beanstalk deployment.
 * It creates the required configuration files and provides instructions for deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create .ebextensions directory if it doesn't exist
const ebextensionsDir = path.join(__dirname, '.ebextensions');
if (!fs.existsSync(ebextensionsDir)) {
  fs.mkdirSync(ebextensionsDir);
  console.log('Created .ebextensions directory');
}

// Create Node.js configuration
const nodeConfigContent = `
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeVersion: 18.x
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    BOT_PORT: 8080
    DASHBOARD_PORT: 3001
`;

fs.writeFileSync(
  path.join(ebextensionsDir, '01_nodeconfig.config'),
  nodeConfigContent
);
console.log('Created .ebextensions/01_nodeconfig.config');

// Create nginx configuration to proxy dashboard requests
const nginxConfigContent = `
files:
  "/etc/nginx/conf.d/proxy.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      upstream dashboard {
        server 127.0.0.1:3001;
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
`;

fs.writeFileSync(
  path.join(ebextensionsDir, '02_nginx.config'),
  nginxConfigContent
);
console.log('Created .ebextensions/02_nginx.config');

// Create Procfile for Elastic Beanstalk
const procfileContent = `
web: node src/index.js
dashboard: node src/run-dashboard.js
`;

fs.writeFileSync(path.join(__dirname, 'Procfile'), procfileContent);
console.log('Created Procfile for Elastic Beanstalk');

// Create AWS deployment instructions
const readmeContent = `
# AWS Deployment Instructions for XRPL Bot

## Prerequisites
1. Install AWS CLI: https://aws.amazon.com/cli/
2. Install EB CLI: \`pip install awsebcli\`
3. Configure AWS credentials: \`aws configure\`

## Deployment Steps

### Initial Deployment
1. Navigate to the project directory:
   \`\`\`
   cd ${__dirname}
   \`\`\`

2. Initialize EB application:
   \`\`\`
   eb init xrpl-liquidity-bot --platform node.js --region us-east-1
   \`\`\`
   
   Follow the prompts to select your region and configure settings.

3. Create environment and deploy:
   \`\`\`
   eb create xrpl-production
   \`\`\`

### Subsequent Deployments
To deploy updates:
\`\`\`
eb deploy
\`\`\`

## Accessing Your Application
After deployment, your application will be available at:
- Bot API: http://YOUR_EB_URL/
- Institutional Dashboard: http://YOUR_EB_URL/dashboard/

## Environment Variables
Set these in the AWS Elastic Beanstalk Console under Configuration > Software:
- XRPL_WALLET_SEED
- XRPL_WALLET_ADDRESS
- XRPL_SERVER
- MAX_TRANSACTION_AMOUNT
- MAX_DAILY_VOLUME
- STOP_LOSS_PERCENTAGE
- EMERGENCY_SHUTDOWN_THRESHOLD
- ALERT_THRESHOLD
- ALERT_WEBHOOK_URL
- ALERT_EMAIL

## Monitoring and Logs
- View logs: \`eb logs\`
- SSH into instance: \`eb ssh\`
`;

fs.writeFileSync(path.join(__dirname, 'AWS-DEPLOYMENT.md'), readmeContent);
console.log('Created AWS-DEPLOYMENT.md with instructions');

// Create a consolidated package.json with all dependencies
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  let packageJson = {};
  
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } else {
    packageJson = {
      name: 'xrpl-liquidity-bot',
      version: '1.0.0',
      description: 'XRPL Liquidity Provider Bot with Institutional Dashboard',
      main: 'src/index.js',
      engines: {
        node: '>=18.0.0'
      }
    };
  }
  
  // Ensure all required scripts are present
  packageJson.scripts = {
    ...(packageJson.scripts || {}),
    start: 'node src/index.js',
    'start-dashboard': 'node src/run-dashboard.js'
  };
  
  // Ensure all required dependencies are present
  packageJson.dependencies = {
    ...(packageJson.dependencies || {}),
    axios: '^1.3.4',
    cors: '^2.8.5',
    dotenv: '^16.0.3',
    express: '^4.18.2',
    ws: '^8.13.0',
    xrpl: '^2.7.0'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with required dependencies');
} catch (error) {
  console.error('Error updating package.json:', error);
}

// Create .npmrc to ensure dependencies are installed correctly
const npmrcContent = `
# Force npm to run node-gyp with python 2.7
python=python2.7
# Set progress to false to speed up installations
progress=false
`;

fs.writeFileSync(path.join(__dirname, '.npmrc'), npmrcContent);
console.log('Created .npmrc file');

// Create .ebignore to exclude unnecessary files
const ebignoreContent = `
.git
.gitignore
node_modules
npm-debug.log
test
tests
*.test.js
*.spec.js
.env
.env.*
!.env.production
`;

fs.writeFileSync(path.join(__dirname, '.ebignore'), ebignoreContent);
console.log('Created .ebignore file');

console.log('\n✅ AWS deployment package preparation complete!');
console.log('\n📋 Next steps:');
console.log('1. Install AWS CLI and EB CLI');
console.log('2. Configure AWS credentials with aws configure');
console.log('3. Follow the instructions in AWS-DEPLOYMENT.md');
console.log('\n🚀 After deployment, your application will be available at:');
console.log('- Bot API: http://YOUR_EB_URL/');
console.log('- Institutional Dashboard: http://YOUR_EB_URL/dashboard/');
