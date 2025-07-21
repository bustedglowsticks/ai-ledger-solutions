#!/usr/bin/env node

/**
 * Supreme Test Runner
 * 
 * This script provides a comprehensive test runner for the XRPL Yield DAO Bot
 * with options for:
 * - Running specific test suites
 * - Generating coverage reports
 * - Watching for changes
 * - Verbose output
 * - CI mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch') || args.includes('-w'),
  coverage: args.includes('--coverage') || args.includes('-c'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  ci: args.includes('--ci'),
  suite: null
};

// Check for specific test suite
const suiteIndex = args.findIndex(arg => arg === '--suite' || arg === '-s');
if (suiteIndex !== -1 && args[suiteIndex + 1]) {
  options.suite = args[suiteIndex + 1];
}

// Banner
console.log(chalk.cyan('╔════════════════════════════════════════════════════════╗'));
console.log(chalk.cyan('║                                                        ║'));
console.log(chalk.cyan('║  ') + chalk.yellow('XRPL Yield DAO Bot') + chalk.cyan(' - ') + chalk.green('Supreme Test Runner') + chalk.cyan('        ║'));
console.log(chalk.cyan('║                                                        ║'));
console.log(chalk.cyan('╚════════════════════════════════════════════════════════╝'));

// Build the mocha command
let mochaArgs = ['--require', 'chai/register-expect'];

if (options.watch) {
  mochaArgs.push('--watch');
}

if (options.coverage) {
  console.log(chalk.yellow('Generating coverage report...'));
  mochaArgs = ['nyc', '--reporter=lcov', '--reporter=text', 'mocha', ...mochaArgs];
} else {
  mochaArgs = ['mocha', ...mochaArgs];
}

// Add reporter options
if (options.ci) {
  mochaArgs.push('--reporter', 'mocha-junit-reporter');
  mochaArgs.push('--reporter-options', 'mochaFile=./test-results.xml');
} else if (options.verbose) {
  mochaArgs.push('--reporter', 'spec');
} else {
  mochaArgs.push('--reporter', 'min');
}

// Add test files
if (options.suite) {
  const suiteMap = {
    'unit': './test/*.test.js',
    'integration': './test/integration/*.test.js',
    'etf': './test/etf-alert-system.test.js',
    'premium': './test/premium-tiers-system.test.js',
    'marketplace': './test/stake-to-yield-marketplace-hub.test.js',
    'full': './test/integration/full-system-integration.test.js'
  };
  
  if (suiteMap[options.suite]) {
    mochaArgs.push(suiteMap[options.suite]);
    console.log(chalk.yellow(`Running ${options.suite} test suite...`));
  } else {
    console.error(chalk.red(`Unknown test suite: ${options.suite}`));
    console.log(chalk.yellow('Available suites:'));
    Object.keys(suiteMap).forEach(suite => {
      console.log(chalk.yellow(`  - ${suite}`));
    });
    process.exit(1);
  }
} else {
  mochaArgs.push('./test/**/*.test.js');
  console.log(chalk.yellow('Running all tests...'));
}

// Log the command
if (options.verbose) {
  console.log(chalk.gray('Running command:'), chalk.gray(`npx ${mochaArgs.join(' ')}`));
}

// Run the tests
const testProcess = spawn('npx', mochaArgs, { stdio: 'inherit' });

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log(chalk.green('✓ All tests passed!'));
    
    if (options.coverage) {
      console.log(chalk.yellow('Coverage report generated in ./coverage/'));
      
      // Check coverage thresholds
      try {
        const coverageSummary = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));
        const total = coverageSummary.total;
        
        console.log(chalk.cyan('Coverage Summary:'));
        console.log(chalk.cyan('  Statements: ') + getCoverageColor(total.statements.pct) + '%');
        console.log(chalk.cyan('  Branches:   ') + getCoverageColor(total.branches.pct) + '%');
        console.log(chalk.cyan('  Functions:  ') + getCoverageColor(total.functions.pct) + '%');
        console.log(chalk.cyan('  Lines:      ') + getCoverageColor(total.lines.pct) + '%');
        
        // Check if coverage meets thresholds
        const thresholds = {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        };
        
        let failedThresholds = false;
        
        Object.keys(thresholds).forEach(key => {
          if (total[key].pct < thresholds[key]) {
            console.log(chalk.red(`✗ ${key} coverage (${total[key].pct}%) is below threshold (${thresholds[key]}%)`));
            failedThresholds = true;
          }
        });
        
        if (failedThresholds && options.ci) {
          process.exit(1);
        }
      } catch (err) {
        console.error(chalk.red('Error reading coverage report:'), err.message);
      }
    }
  } else {
    console.error(chalk.red('✗ Tests failed!'));
    process.exit(code);
  }
});

// Helper function to color coverage percentages
function getCoverageColor(percentage) {
  if (percentage >= 90) {
    return chalk.green(percentage);
  } else if (percentage >= 70) {
    return chalk.yellow(percentage);
  } else {
    return chalk.red(percentage);
  }
}
