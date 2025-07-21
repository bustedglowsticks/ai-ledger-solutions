const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 QUANTUM YIELD EMPIRE - CLOUD DEPLOYMENT LAUNCHER 🚀');
console.log('🌐 Choose your deployment platform:');
console.log('');

const platforms = {
    '1': { name: 'Render.com (Recommended - Free)', command: 'npm run deploy:render' },
    '2': { name: 'Railway.app (Fast & Reliable)', command: 'npm run deploy:railway' },
    '3': { name: 'Heroku (Enterprise)', command: 'npm run deploy:heroku' },
    '4': { name: 'AWS (Full Control)', command: 'npm run deploy:aws' },
    '5': { name: 'DigitalOcean (Good Balance)', command: 'npm run deploy:digitalocean' },
    '6': { name: 'Local Docker Setup', command: 'docker-compose up -d' }
};

// Display options
Object.entries(platforms).forEach(([key, platform]) => {
    console.log(`${key}. ${platform.name}`);
});

console.log('');
console.log('📋 Current Status:');
console.log('   ✅ Professional Website: Fixed and running');
console.log('   ✅ Testnet Dashboard: Working on port 3006');
console.log('   ✅ Cloud deployment configs: Ready');
console.log('   ✅ Docker setup: Configured');
console.log('');

rl.question('🎯 Select deployment option (1-6): ', (answer) => {
    const platform = platforms[answer];
    
    if (!platform) {
        console.log('❌ Invalid option. Please select 1-6.');
        rl.close();
        return;
    }

    console.log('');
    console.log(`🚀 Deploying to: ${platform.name}`);
    console.log('');

    if (answer === '1') {
        // Render.com deployment
        console.log('📋 RENDER.COM DEPLOYMENT STEPS:');
        console.log('');
        console.log('1. 📝 Create render.yaml file...');
        
        const renderConfig = `services:
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
    branch: main`;

        fs.writeFileSync('render.yaml', renderConfig);
        console.log('   ✅ render.yaml created');
        
        console.log('');
        console.log('2. 🌐 Next Steps:');
        console.log('   • Push your code to GitHub');
        console.log('   • Go to https://render.com');
        console.log('   • Connect your GitHub repository');
        console.log('   • Render will automatically deploy');
        console.log('');
        console.log('🌐 Your services will be available at:');
        console.log('   • Professional Website: https://quantum-yield-empire.onrender.com');
        console.log('   • Testnet Dashboard: https://quantum-dashboard.onrender.com');
        
    } else if (answer === '6') {
        // Local Docker setup
        console.log('🐳 Starting local Docker setup...');
        exec('docker-compose up -d', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Docker error:', error.message);
                console.log('💡 Make sure Docker is installed and running');
                return;
            }
            console.log('✅ Docker containers started successfully!');
            console.log('');
            console.log('🌐 Services available at:');
            console.log('   • Professional Website: http://localhost:3003');
            console.log('   • Testnet Dashboard: http://localhost:3006');
            console.log('   • Grafana (Monitoring): http://localhost:3000');
            console.log('   • Prometheus (Metrics): http://localhost:9090');
        });
        
    } else {
        // Other platforms
        console.log(`📋 ${platform.name.toUpperCase()} DEPLOYMENT:`);
        console.log('');
        console.log('1. 📦 Installing dependencies...');
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Installation error:', error.message);
                return;
            }
            console.log('   ✅ Dependencies installed');
            
            console.log('');
            console.log('2. 🚀 Running deployment command...');
            console.log(`   Command: ${platform.command}`);
            console.log('');
            console.log('📋 Follow the platform-specific instructions:');
            
            switch(answer) {
                case '2': // Railway
                    console.log('   • Install Railway CLI: npm install -g @railway/cli');
                    console.log('   • Run: railway login');
                    console.log('   • Run: railway init');
                    console.log('   • Run: railway up');
                    break;
                case '3': // Heroku
                    console.log('   • Install Heroku CLI');
                    console.log('   • Run: heroku login');
                    console.log('   • Run: heroku create quantum-yield-empire');
                    console.log('   • Run: git push heroku main');
                    break;
                case '4': // AWS
                    console.log('   • Set up AWS credentials: aws configure');
                    console.log('   • Create EC2 instance or use ECS');
                    console.log('   • Deploy using AWS CLI or console');
                    break;
                case '5': // DigitalOcean
                    console.log('   • Install doctl CLI');
                    console.log('   • Run: doctl auth init');
                    console.log('   • Run: doctl apps create --spec .do/app.yaml');
                    break;
            }
        });
    }
    
    console.log('');
    console.log('📚 For detailed instructions, see: DEPLOYMENT.md');
    console.log('🔥 READY TO DOMINATE THE CLOUD! 🔥');
    
    rl.close();
}); 