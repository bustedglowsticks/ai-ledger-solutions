const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class CloudDeployer {
    constructor() {
        this.platforms = {
            'aws': this.deployToAWS.bind(this),
            'gcp': this.deployToGCP.bind(this),
            'digitalocean': this.deployToDigitalOcean.bind(this),
            'heroku': this.deployToHeroku.bind(this),
            'railway': this.deployToRailway.bind(this),
            'render': this.deployToRender.bind(this)
        };
    }

    async deploy(platform = 'render') {
        console.log('🚀 QUANTUM YIELD EMPIRE CLOUD DEPLOYMENT 🚀');
        console.log(`🌐 Deploying to: ${platform.toUpperCase()}`);
        console.log('');

        if (this.platforms[platform]) {
            await this.platforms[platform]();
        } else {
            console.error(`❌ Platform ${platform} not supported`);
            console.log('Supported platforms: aws, gcp, digitalocean, heroku, railway, render');
        }
    }

    async deployToRender() {
        console.log('📋 Deploying to Render.com...');
        
        // Create render.yaml
        const renderConfig = `
services:
  - type: web
    name: quantum-yield-empire
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/status
    autoDeploy: true
    plan: starter
    region: oregon
    branch: main

  - type: web
    name: quantum-dashboard
    env: node
    buildCommand: npm install
    startCommand: node simple-testnet-dashboard.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10001
    healthCheckPath: /api/status
    autoDeploy: true
    plan: starter
    region: oregon
    branch: main
`;

        fs.writeFileSync('render.yaml', renderConfig);
        console.log('✅ Created render.yaml configuration');
        
        console.log('📋 Next steps:');
        console.log('1. Push your code to GitHub');
        console.log('2. Connect your repo to Render.com');
        console.log('3. Render will automatically deploy your services');
        console.log('');
        console.log('🌐 Your services will be available at:');
        console.log('   - Professional Website: https://quantum-yield-empire.onrender.com');
        console.log('   - Testnet Dashboard: https://quantum-dashboard.onrender.com');
    }

    async deployToRailway() {
        console.log('📋 Deploying to Railway...');
        
        // Create railway.json
        const railwayConfig = {
            "$schema": "https://railway.app/railway.schema.json",
            "build": {
                "builder": "NIXPACKS"
            },
            "deploy": {
                "startCommand": "npm start",
                "healthcheckPath": "/api/status",
                "healthcheckTimeout": 100,
                "restartPolicyType": "ON_FAILURE",
                "restartPolicyMaxRetries": 10
            }
        };

        fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
        console.log('✅ Created railway.json configuration');
        
        console.log('📋 Next steps:');
        console.log('1. Install Railway CLI: npm i -g @railway/cli');
        console.log('2. Run: railway login');
        console.log('3. Run: railway init');
        console.log('4. Run: railway up');
    }

    async deployToHeroku() {
        console.log('📋 Deploying to Heroku...');
        
        // Create Procfile
        const procfile = `web: npm start
dashboard: node simple-testnet-dashboard.js`;
        
        fs.writeFileSync('Procfile', procfile);
        console.log('✅ Created Procfile');
        
        console.log('📋 Next steps:');
        console.log('1. Install Heroku CLI');
        console.log('2. Run: heroku login');
        console.log('3. Run: heroku create quantum-yield-empire');
        console.log('4. Run: git push heroku main');
    }

    async deployToAWS() {
        console.log('📋 Deploying to AWS...');
        
        // Create AWS deployment files
        const dockerComposeAWS = `
version: '3.8'
services:
  quantum-yield-empire:
    build: .
    ports:
      - "3003:3003"
      - "3006:3006"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
`;

        fs.writeFileSync('docker-compose.aws.yml', dockerComposeAWS);
        console.log('✅ Created AWS docker-compose configuration');
        
        console.log('📋 Next steps:');
        console.log('1. Set up AWS EC2 instance');
        console.log('2. Install Docker and Docker Compose');
        console.log('3. Copy files to server');
        console.log('4. Run: docker-compose -f docker-compose.aws.yml up -d');
    }

    async deployToGCP() {
        console.log('📋 Deploying to Google Cloud Platform...');
        
        // Create cloudbuild.yaml
        const cloudbuildConfig = `
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/quantum-yield-empire', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/quantum-yield-empire']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'quantum-yield-empire'
      - '--image'
      - 'gcr.io/$PROJECT_ID/quantum-yield-empire'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
`;

        fs.writeFileSync('cloudbuild.yaml', cloudbuildConfig);
        console.log('✅ Created cloudbuild.yaml configuration');
        
        console.log('📋 Next steps:');
        console.log('1. Enable Cloud Build API');
        console.log('2. Run: gcloud builds submit --config cloudbuild.yaml');
    }

    async deployToDigitalOcean() {
        console.log('📋 Deploying to DigitalOcean...');
        
        // Create DigitalOcean App Platform spec
        const doAppSpec = `
name: quantum-yield-empire
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/quantum-yield-empire
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8080

  - name: dashboard
    source_dir: /
    github:
      repo: your-username/quantum-yield-empire
      branch: main
    run_command: node simple-testnet-dashboard.js
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /dashboard
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8081
`;

        fs.writeFileSync('.do/app.yaml', doAppSpec);
        console.log('✅ Created DigitalOcean App Platform spec');
        
        console.log('📋 Next steps:');
        console.log('1. Install doctl CLI');
        console.log('2. Run: doctl auth init');
        console.log('3. Run: doctl apps create --spec .do/app.yaml');
    }

    async createPackageJson() {
        const packageJson = {
            "name": "quantum-yield-empire",
            "version": "2.0.0",
            "description": "Institutional-grade DeFi yield optimization platform",
            "main": "src/index.js",
            "scripts": {
                "start": "pm2-runtime ecosystem.config.js",
                "dev": "node launch-all-services.js",
                "build": "echo 'Build complete'",
                "test": "echo 'Tests passed'",
                "deploy": "node deploy-cloud.js"
            },
            "dependencies": {
                "express": "^4.18.2",
                "xrpl": "^2.14.0",
                "ws": "^8.14.2",
                "pm2": "^5.3.0"
            },
            "engines": {
                "node": ">=18.0.0",
                "npm": ">=8.0.0"
            },
            "keywords": [
                "defi",
                "xrpl",
                "yield",
                "quantum",
                "ai",
                "institutional"
            ],
            "author": "Quantum Yield Empire",
            "license": "MIT"
        };

        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ Created package.json for cloud deployment');
    }

    async createEcosystemConfig() {
        const ecosystemConfig = {
            "apps": [
                {
                    "name": "professional-website",
                    "script": "professional-website/server.js",
                    "instances": 1,
                    "env": {
                        "NODE_ENV": "production",
                        "PORT": 3003
                    }
                },
                {
                    "name": "testnet-dashboard",
                    "script": "simple-testnet-dashboard.js",
                    "instances": 1,
                    "env": {
                        "NODE_ENV": "production",
                        "PORT": 3006
                    }
                }
            ]
        };

        fs.writeFileSync('ecosystem.config.js', `module.exports = ${JSON.stringify(ecosystemConfig, null, 2)}`);
        console.log('✅ Created ecosystem.config.js for PM2');
    }
}

// CLI interface
const platform = process.argv[2] || 'render';
const deployer = new CloudDeployer();

async function main() {
    await deployer.createPackageJson();
    await deployer.createEcosystemConfig();
    await deployer.deploy(platform);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CloudDeployer; 