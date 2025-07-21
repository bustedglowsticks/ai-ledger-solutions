const { spawn } = require('child_process');
const path = require('path');

console.log('🔥 LAUNCHING PROFESSIONAL WEBSITE SUITE! 🔥');
console.log('🏛️ IBM-Style Professional Interface');
console.log('💰 Institutional-Grade Subscription Tiers');
console.log('⚡ Real-Time Performance Integration');
console.log('');

// Start the professional website
const websiteProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'professional-website'),
    stdio: 'inherit'
});

console.log('✅ Professional Website Starting...');
console.log('🌐 Website will be available at: http://localhost:3003');
console.log('');
console.log('📋 WEBSITE FEATURES:');
console.log('   🏠 Professional Homepage with IBM-style design');
console.log('   💰 4-Tier Subscription System (Starter to Enterprise)');
console.log('   📊 Real-time Performance Integration');
console.log('   📱 Responsive Design for all devices');
console.log('   🎯 Contact Form with Tier Selection');
console.log('   ⚡ Interactive Animations and Effects');
console.log('');
console.log('💰 SUBSCRIPTION TIERS:');
console.log('   🚀 Starter: $99/month - Basic Bot Access');
console.log('   ⚡ Professional: $299/month - Advanced Features');
console.log('   🏛️ Institutional: $999/month - Full Beast Mode');
console.log('   🌟 Enterprise: Custom - White Label Solutions');
console.log('');
console.log('🎯 TARGET AUDIENCE:');
console.log('   • Institutional Investors');
console.log('   • Hedge Funds');
console.log('   • Family Offices');
console.log('   • High-Net-Worth Individuals');
console.log('   • DeFi Protocols');
console.log('');
console.log('🔥 READY TO DOMINATE THE INSTITUTIONAL MARKET! 🔥');
console.log('');

// Handle process events
websiteProcess.on('error', (error) => {
    console.error('❌ Error starting website:', error.message);
});

websiteProcess.on('close', (code) => {
    console.log(`Website process exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down professional website...');
    websiteProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down professional website...');
    websiteProcess.kill('SIGTERM');
    process.exit(0);
}); 