const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 QUANTUM YIELD EMPIRE - GITHUB SETUP 🚀');
console.log('🌐 Let\'s get your code on GitHub for Render.com deployment!');
console.log('');

console.log('📋 STEP 1: Create GitHub Repository');
console.log('1. Go to: https://github.com');
console.log('2. Sign in to your account');
console.log('3. Click "New" or "+" button');
console.log('4. Repository name: quantum-yield-empire');
console.log('5. Description: Institutional-grade DeFi yield optimization platform');
console.log('6. Make it: Public');
console.log('7. Don\'t initialize with README (we already have one)');
console.log('8. Click "Create repository"');
console.log('');

rl.question('✅ Have you created the GitHub repository? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Please create the GitHub repository first, then run this script again.');
        rl.close();
        return;
    }

    console.log('');
    console.log('📋 STEP 2: Get Your GitHub Username');
    console.log('We need your GitHub username to set up the remote repository.');
    console.log('');

    rl.question('🔗 Enter your GitHub username: ', (username) => {
        if (!username || username.trim() === '') {
            console.log('❌ Username cannot be empty. Please run the script again.');
            rl.close();
            return;
        }

        const repoUrl = `https://github.com/${username.trim()}/quantum-yield-empire.git`;
        
        console.log('');
        console.log('🚀 Setting up GitHub remote...');
        console.log(`Repository URL: ${repoUrl}`);
        console.log('');

        // Add the remote
        exec(`git remote add origin ${repoUrl}`, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Error adding remote:', error.message);
                rl.close();
                return;
            }

            console.log('✅ Remote added successfully!');
            console.log('');

            // Check if we need to commit
            exec('git status --porcelain', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Error checking git status:', error.message);
                    rl.close();
                    return;
                }

                if (stdout.trim() === '') {
                    console.log('✅ All changes are already committed!');
                    pushToGitHub();
                } else {
                    console.log('📝 Committing changes...');
                    commitAndPush();
                }
            });
        });
    });
});

function commitAndPush() {
    exec('git add .', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error adding files:', error.message);
            rl.close();
            return;
        }

        console.log('✅ Files added to staging area');
        
        exec('git commit -m "🚀 QUANTUM YIELD EMPIRE - READY FOR RENDER.COM DEPLOYMENT 🚀"', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Error committing:', error.message);
                rl.close();
                return;
            }

            console.log('✅ Changes committed successfully!');
            pushToGitHub();
        });
    });
}

function pushToGitHub() {
    console.log('');
    console.log('🚀 Pushing to GitHub...');
    
    exec('git push -u origin main', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error pushing to GitHub:', error.message);
            console.log('');
            console.log('💡 This might be because:');
            console.log('   - The repository doesn\'t exist yet');
            console.log('   - You need to authenticate with GitHub');
            console.log('   - The branch name is different (try "master" instead of "main")');
            console.log('');
            console.log('🔧 Try these steps:');
            console.log('   1. Make sure the repository exists on GitHub');
            console.log('   2. Try: git push -u origin master');
            console.log('   3. Or authenticate with: git config --global credential.helper store');
            rl.close();
            return;
        }

        console.log('✅ Successfully pushed to GitHub!');
        console.log('');
        console.log('🎉 QUANTUM YIELD EMPIRE IS NOW ON GITHUB! 🎉');
        console.log('');
        console.log('📋 NEXT STEPS:');
        console.log('1. Go to: https://render.com');
        console.log('2. Sign up/Login with your GitHub account');
        console.log('3. Click "New +" → "Blueprint"');
        console.log('4. Select your quantum-yield-empire repository');
        console.log('5. Render will automatically deploy your services!');
        console.log('');
        console.log('🌐 Your services will be available at:');
        console.log('   • Professional Website: https://quantum-yield-empire.onrender.com');
        console.log('   • Testnet Dashboard: https://quantum-dashboard.onrender.com');
        console.log('');
        console.log('🔥 READY TO DOMINATE THE CLOUD! 🔥');
        
        rl.close();
    });
} 