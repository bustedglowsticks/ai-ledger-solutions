/**
 * XRPL Liquidity Provider Bot - Enhanced Test Runner (Class Version)
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Live Validation Arena - Enhanced Test Runner
 * 
 * Runs dynamic allocation tests with real-time WebSocket streaming
 * and interactive HTML report generation.
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const YieldOptimizer = require('../optimizer/yield-optimizer');
const CoreLogic = require('../core/core-logic');
const logger = require('../utils/logger');
const { generateHtmlReport } = require('./report-generator');
const { testScenarios } = require('./test-scenarios');

/**
 * Enhanced Test Runner Class
 * Class-based implementation of the Enhanced Test Runner
 */
class EnhancedTestRunnerClass {
  /**
   * Create a new Enhanced Test Runner
   * @param {Object} options - Test runner options
   */
  constructor(options = {}) {
    // Parse options
    this.options = {
      live: options.live || false,
      stressTest: options.stressTest || false,
      wsUrl: options.wsUrl || 'ws://localhost:3000/ws',
      reportDir: options.reportDir || './test-reports',
      ...options
    };

    // Configure logger
    logger.level = this.options.live ? 'info' : 'debug';

    // WebSocket connection
    this.ws = null;
    
    // Bind methods
    this.initWebSocket = this.initWebSocket.bind(this);
    this.sendToWebSocket = this.sendToWebSocket.bind(this);
    this.runScenario = this.runScenario.bind(this);
    this.runTests = this.runTests.bind(this);
  }

  /**
   * Initialize WebSocket connection
   * @returns {Promise<WebSocket>} - WebSocket connection
   */
  async initWebSocket() {
    if (!this.options.live) return null;
    
    return new Promise((resolve, reject) => {
      try {
        logger.info(`Connecting to WebSocket server at ${this.options.wsUrl}`);
        const socket = new WebSocket(this.options.wsUrl);
        
        socket.on('open', () => {
          logger.info('WebSocket connection established');
          this.ws = socket;
          resolve(socket);
        });
        
        socket.on('error', (error) => {
          logger.error(`WebSocket error: ${error.message}`);
          reject(error);
        });
        
        socket.on('close', () => {
          logger.info('WebSocket connection closed');
        });
      } catch (error) {
        logger.error(`Failed to connect to WebSocket: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Send data to WebSocket server
   * @param {Object} data - Data to send
   */
  sendToWebSocket(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      logger.error(`Failed to send data to WebSocket: ${error.message}`);
    }
  }

  /**
   * Run a test scenario
   * @param {Object} scenario - Test scenario
   * @param {YieldOptimizer} optimizer - Yield optimizer instance
   * @returns {Promise<Object>} - Test results
   */
  async runScenario(scenario, optimizer) {
    logger.info(`Running scenario: ${scenario.name}`);
    
    // Send scenario start to WebSocket
    this.sendToWebSocket({
      type: 'scenario_start',
      name: scenario.name,
      description: scenario.description,
      timestamp: Date.now()
    });
    
    // Run optimization
    const startTime = Date.now();
    const totalCapital = scenario.capital || 100000;
    
    // Predict pool metrics
    const predictedPools = await optimizer.predictPoolMetrics(scenario.pools);
    
    // Get federated insights
    const federatedInsights = await optimizer.getFederatedInsights();
    
    // Run Monte Carlo simulations
    const monteCarloResults = await optimizer.runMonteCarloSimulations();
    
    // Optimize allocation
    const optimizationResult = await optimizer.optimizeAllocation(totalCapital, predictedPools);
    
    // Calculate eco bonuses
    const ecoBonuses = {};
    scenario.pools.forEach(pool => {
      ecoBonuses[pool.id] = optimizer.calculateEcoBonus(pool);
    });
    
    // Test rebalancing if volatility changes
    const volatilityChanges = {};
    const modifiedPools = scenario.pools.map(pool => {
      // Apply volatility changes based on scenario
      const volatilityChange = scenario.volatilityChanges?.[pool.id] || 0;
      volatilityChanges[pool.id] = volatilityChange;
      
      return {
        ...pool,
        lastVolatility: pool.volatility,
        volatility: pool.volatility + volatilityChange,
        lastApy: pool.currentApy,
        lastClawbackRisk: pool.clawbackRisk
      };
    });
    
    // Check if rebalance is needed
    const shouldRebalance = await optimizer.shouldRebalance(modifiedPools);
    
    // Execute rebalance if needed
    let rebalanceResult = null;
    if (shouldRebalance) {
      rebalanceResult = await optimizer.executeRebalance(totalCapital, modifiedPools);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Compile results
    const results = {
      scenario: scenario.name,
      description: scenario.description,
      totalCapital,
      duration,
      optimizationResult,
      ecoBonuses,
      federatedInsights,
      monteCarloResults,
      volatilityChanges,
      shouldRebalance,
      rebalanceResult,
      timestamp: Date.now()
    };
    
    // Send results to WebSocket
    this.sendToWebSocket({
      type: 'scenario_result',
      ...results
    });
    
    logger.info(`Scenario ${scenario.name} completed in ${duration}ms`);
    return results;
  }

  /**
   * Run all test scenarios
   * @returns {Promise<Array>} - Test results
   */
  async runTests() {
    try {
      console.log('=== XRPL Liquidity Provider Bot - Live Validation Arena ===');
      console.log(`Mode: ${this.options.live ? 'Live' : 'Standard'}`);
      console.log(`Stress Test: ${this.options.stressTest ? 'Enabled' : 'Disabled'}`);
      
      // Create output directory
      if (!fs.existsSync(this.options.reportDir)) {
        fs.mkdirSync(this.options.reportDir, { recursive: true });
      }
      
      // Connect to WebSocket if in live mode
      if (this.options.live) {
        await this.initWebSocket();
      }
      
      // Initialize yield optimizer
      console.log('\n1. Initializing yield optimizer...');
      const yieldOptimizer = new YieldOptimizer({
        maxPoolAllocation: 0.5,
        riskTolerance: 0.8,
        ecoRwaBonus: 0.2,
        federationWeight: 0.3,
        monteCarloRuns: this.options.stressTest ? 200 : 100
      });
      await yieldOptimizer.initialize();
      console.log('   ✓ Yield optimizer initialized');
      
      // Send test start to WebSocket
      this.sendToWebSocket({
        type: 'test_start',
        mode: this.options.live ? 'Live' : 'Standard',
        stressTest: this.options.stressTest,
        timestamp: Date.now()
      });
      
      // Select scenarios based on stress test mode
      const scenarios = this.options.stressTest ? 
        testScenarios.stressScenarios : 
        testScenarios.standardScenarios;
      
      // Run all scenarios
      console.log(`\n2. Running ${scenarios.length} test scenarios...`);
      const results = [];
      
      for (const scenario of scenarios) {
        const result = await this.runScenario(scenario, yieldOptimizer);
        results.push(result);
      }
      
      // Generate HTML report
      console.log('\n3. Generating HTML report...');
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const reportFile = path.join(this.options.reportDir, `allocation_report_${timestamp}.html`);
      
      await generateHtmlReport(results, reportFile, {
        title: 'XRPL Liquidity Provider Bot - Allocation Test Report',
        stressTest: this.options.stressTest
      });
      
      console.log(`   ✓ Report generated: ${reportFile}`);
      
      // Send test complete to WebSocket
      this.sendToWebSocket({
        type: 'test_complete',
        resultsCount: results.length,
        reportUrl: `file://${reportFile}`,
        timestamp: Date.now()
      });
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
      }
      
      console.log('\n=== Test Completed Successfully ===');
      console.log(`Results saved to ${reportFile}`);
      
      // Open the report in the default browser if in live mode
      if (this.options.live && process.platform !== 'win32') {
        require('child_process').exec(`open ${reportFile}`);
      } else if (this.options.live) {
        require('child_process').exec(`start ${reportFile}`);
      }
      
      return results;
    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
      console.error(error.stack);
      
      // Send error to WebSocket
      this.sendToWebSocket({
        type: 'test_error',
        error: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
      }
      
      throw error;
    }
  }
}

module.exports = EnhancedTestRunnerClass;
