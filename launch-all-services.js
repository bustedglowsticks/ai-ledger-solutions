const { spawn } = require('child_process');
const path = require('path');

console.log('🔥 LAUNCHING ALL BEAST MODE SERVICES! 🔥');
console.log('🏛️ Professional Website + Testnet Dashboard');
console.log('💰 Institutional-Grade Performance Monitoring');
console.log('');

// Start the testnet dashboard
const dashboardProcess = spawn('node', ['simple-testnet-dashboard.js'], {
    cwd: path.join(__dirname),
    stdio: 'inherit'
});

// Wait a moment, then start the professional website
setTimeout(() => {
    const websiteProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'professional-website'),
        stdio: 'inherit'
    });

    console.log('✅ All services starting...');
    console.log('🌐 Testnet Dashboard: http://localhost:3006');
    console.log('🏛️ Professional Website: http://localhost:3003');
    console.log('');
    console.log('📋 SERVICE STATUS:');
    console.log('   🔥 Testnet Dashboard - Live XRPL Data');
    console.log('   🏛️ Professional Website - IBM-Style Interface');
    console.log('   💰 Subscription Tiers - Institutional Clients');
    console.log('   📊 Real-Time Performance - Live Updates');
    console.log('');
    console.log('🎯 READY FOR INSTITUTIONAL DOMINATION! 🔥');
    console.log('');

    // Handle website process events
    websiteProcess.on('error', (error) => {
        console.error('❌ Error starting website:', error.message);
    });

    websiteProcess.on('close', (code) => {
        console.log(`Website process exited with code ${code}`);
    });

    // Graceful shutdown for website
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down website...');
        websiteProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down website...');
        websiteProcess.kill('SIGTERM');
    });

}, 2000);

// Handle dashboard process events
dashboardProcess.on('error', (error) => {
    console.error('❌ Error starting dashboard:', error.message);
});

dashboardProcess.on('close', (code) => {
    console.log(`Dashboard process exited with code ${code}`);
});

// Graceful shutdown for dashboard
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard...');
    dashboardProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down dashboard...');
    dashboardProcess.kill('SIGTERM');
    process.exit(0);
}); 