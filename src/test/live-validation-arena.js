/**
 * XRPL Liquidity Provider Bot - Live Validation Arena
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Live Validation Arena - Main Integration
 * 
 * Integrates all components of the Live Validation Arena:
 * - Enhanced test runner
 * - WebSocket server for real-time dashboard
 * - Stress test mode
 * - Federation auto-tuning
 * - Prometheus metrics exporter
 * - Report exporter
 */

const logger = require('../utils/logger');
const EnhancedTestRunner = require('./enhanced-test-runner-class');
const WebSocketServer = require('../server/websocket-server');
const StressTestMode = require('./stress-test-mode');
const FederationTuner = require('./federation-tuner');
const PrometheusExporter = require('../metrics/prometheus-exporter');
const ReportExporter = require('./report-exporter');
const TestScenarios = require('./test-scenarios');
const path = require('path');
const fs = require('fs');

/**
 * Live Validation Arena
 * 
 * Integrates all components of the Live Validation Arena for a fused
 * validation and visualization system.
 */
class LiveValidationArena {
  /**
   * Create a new Live Validation Arena
   * @param {Object} options - Arena options
   */
  constructor(options = {}) {
    this.options = {
      dashboardPort: options.dashboardPort || 8080,
      metricsPort: options.metricsPort || 9090,
      reportsDir: options.reportsDir || path.join(process.cwd(), 'reports'),
      publicDir: options.publicDir || path.join(process.cwd(), 'public'),
      autoTuneFederation: options.autoTuneFederation !== false,
      enableStressTests: options.enableStressTests !== false,
      enableMetricsExport: options.enableMetricsExport !== false,
      enableReportExport: options.enableReportExport !== false,
      ...options
    };
    
    // Create components
    this.testRunner = new EnhancedTestRunner(options.testRunnerOptions);
    this.wsServer = new WebSocketServer({
      port: this.options.dashboardPort,
      staticDir: this.options.publicDir
    });
    
    // Create optional components
    this.stressTestMode = this.options.enableStressTests
      ? new StressTestMode(options.stressTestOptions)
      : null;
      
    this.federationTuner = this.options.autoTuneFederation
      ? new FederationTuner(options.federationTunerOptions)
      : null;
      
    this.metricsExporter = this.options.enableMetricsExport
      ? new PrometheusExporter({
          port: this.options.metricsPort,
          ...options.metricsExporterOptions
        })
      : null;
      
    this.reportExporter = this.options.enableReportExport
      ? new ReportExporter({
          outputDir: this.options.reportsDir,
          ...options.reportExporterOptions
        })
      : null;
    
    // Test results storage
    this.testResults = [];
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.runTest = this.runTest.bind(this);
    this.runStressTest = this.runStressTest.bind(this);
    this.exportReport = this.exportReport.bind(this);
    this.shutdown = this.shutdown.bind(this);
  }
  
  /**
   * Initialize the Live Validation Arena
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('Live Validation Arena: Initializing...');
      
      // Initialize WebSocket server
      await this.wsServer.initialize();
      
      // Initialize test runner
      await this.testRunner.initialize();
      
      // Initialize optional components
      if (this.federationTuner) {
        await this.federationTuner.initialize();
      }
      
      if (this.metricsExporter) {
        await this.metricsExporter.initialize();
      }
      
      // Create reports directory if it doesn't exist
      if (this.options.enableReportExport && !fs.existsSync(this.options.reportsDir)) {
        fs.mkdirSync(this.options.reportsDir, { recursive: true });
      }
      
      logger.info('Live Validation Arena: Initialized successfully');
      logger.info(`Live Validation Arena: Dashboard available at http://localhost:${this.options.dashboardPort}`);
      
      if (this.metricsExporter) {
        logger.info(`Live Validation Arena: Metrics available at http://localhost:${this.options.metricsPort}/metrics`);
      }
      
      return true;
    } catch (error) {
      logger.error(`Live Validation Arena: Initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Run a test scenario
   * @param {Object} scenario - Test scenario
   * @param {Object} options - Test options
   * @returns {Promise<Object>} - Test result
   */
  async runTest(scenario, options = {}) {
    try {
      logger.info(`Live Validation Arena: Running test "${scenario.name}"...`);
      
      // Set up WebSocket event handler
      this.testRunner.on('progress', (data) => {
        this.wsServer.broadcast('test-progress', data);
      });
      
      // Run the test
      const result = await this.testRunner.runTest(scenario, options);
      
      // Store test result
      this.testResults.push(result);
      
      // Broadcast test completion
      this.wsServer.broadcast('test-complete', {
        testId: result.testId,
        name: result.name,
        timestamp: result.timestamp,
        success: true
      });
      
      // Update federation weights if enabled
      if (this.federationTuner && this.options.autoTuneFederation) {
        await this.federationTuner.tuneWeights(this.testResults);
      }
      
      // Update metrics if enabled
      if (this.metricsExporter) {
        this.metricsExporter.updateMetrics(this.testResults);
      }
      
      // Export report if enabled
      if (this.reportExporter && this.options.enableReportExport) {
        await this.exportReport(result);
      }
      
      logger.info(`Live Validation Arena: Test "${scenario.name}" completed successfully`);
      return result;
    } catch (error) {
      logger.error(`Live Validation Arena: Test failed: ${error.message}`);
      
      // Broadcast test failure
      this.wsServer.broadcast('test-error', {
        name: scenario.name,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Run a stress test scenario
   * @param {Object} scenario - Base test scenario
   * @param {string} stressType - Type of stress test
   * @param {Object} options - Test options
   * @returns {Promise<Object>} - Test result
   */
  async runStressTest(scenario, stressType, options = {}) {
    try {
      if (!this.stressTestMode) {
        throw new Error('Stress test mode is not enabled');
      }
      
      logger.info(`Live Validation Arena: Running stress test "${stressType}" on scenario "${scenario.name}"...`);
      
      // Enhance scenario with stress test conditions
      const enhancedScenario = this.stressTestMode.enhanceScenario(scenario, stressType);
      
      // Run the enhanced scenario
      return await this.runTest(enhancedScenario, options);
    } catch (error) {
      logger.error(`Live Validation Arena: Stress test failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Export a test report
   * @param {Object} result - Test result
   * @param {string} format - Export format (html, json, csv, pdf)
   * @returns {Promise<string>} - Path to exported file
   */
  async exportReport(result, format = 'html') {
    try {
      if (!this.reportExporter) {
        throw new Error('Report exporter is not enabled');
      }
      
      logger.info(`Live Validation Arena: Exporting ${format} report for test "${result.name}"...`);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `report-${result.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.${format}`;
      
      // Export report based on format
      let exportPath;
      switch (format.toLowerCase()) {
        case 'json':
          exportPath = await this.reportExporter.exportJson(result, filename);
          break;
          
        case 'csv':
          exportPath = await this.reportExporter.exportCsv(result, filename);
          break;
          
        case 'pdf':
          exportPath = await this.reportExporter.exportPdf(result, filename);
          break;
          
        case 'html':
        default:
          exportPath = await this.reportExporter.exportHtml(result, filename);
          break;
      }
      
      // Broadcast report export
      this.wsServer.broadcast('report-exported', {
        testId: result.testId,
        name: result.name,
        format,
        path: exportPath
      });
      
      logger.info(`Live Validation Arena: Report exported to ${exportPath}`);
      return exportPath;
    } catch (error) {
      logger.error(`Live Validation Arena: Report export failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Share a test report to the community platform
   * @param {Object} result - Test result
   * @param {Object} options - Sharing options
   * @returns {Promise<Object>} - Sharing result
   */
  async shareReport(result, options = {}) {
    try {
      if (!this.reportExporter) {
        throw new Error('Report exporter is not enabled');
      }
      
      logger.info(`Live Validation Arena: Sharing report for test "${result.name}" to community platform...`);
      
      // Share report
      const sharingResult = await this.reportExporter.shareToCommunity(result, options);
      
      // Generate sharing link
      const sharingLink = this.reportExporter.generateSharingLink(sharingResult.reportId);
      
      // Broadcast report sharing
      this.wsServer.broadcast('report-shared', {
        testId: result.testId,
        name: result.name,
        reportId: sharingResult.reportId,
        sharingLink
      });
      
      logger.info(`Live Validation Arena: Report shared to community platform: ${sharingLink}`);
      return sharingResult;
    } catch (error) {
      logger.error(`Live Validation Arena: Report sharing failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Shutdown the Live Validation Arena
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      logger.info('Live Validation Arena: Shutting down...');
      
      // Shutdown WebSocket server
      await this.wsServer.stop();
      
      // Shutdown metrics exporter if enabled
      if (this.metricsExporter) {
        await this.metricsExporter.stopServer();
      }
      
      logger.info('Live Validation Arena: Shutdown complete');
    } catch (error) {
      logger.error(`Live Validation Arena: Shutdown failed: ${error.message}`);
    }
  }
  
  /**
   * Run a complete test suite with all scenarios
   * @param {Object} options - Test options
   * @returns {Promise<Array>} - Test results
   */
  async runTestSuite(options = {}) {
    try {
      logger.info('Live Validation Arena: Running complete test suite...');
      
      // Get all scenarios
      const scenarios = TestScenarios.getAllScenarios();
      
      // Run each scenario
      const results = [];
      for (const scenario of scenarios) {
        const result = await this.runTest(scenario, options);
        results.push(result);
      }
      
      // Run stress tests if enabled
      if (this.stressTestMode && this.options.enableStressTests) {
        // Get base scenario for stress tests
        const baseScenario = TestScenarios.getScenario('standard');
        
        // Run each stress test type
        const stressTypes = ['etf-approval', 'rlusd-depeg', 'market-crash', 'federation-disagreement'];
        for (const stressType of stressTypes) {
          const result = await this.runStressTest(baseScenario, stressType, options);
          results.push(result);
        }
      }
      
      logger.info(`Live Validation Arena: Test suite completed with ${results.length} tests`);
      return results;
    } catch (error) {
      logger.error(`Live Validation Arena: Test suite failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = LiveValidationArena;

// Example usage
if (require.main === module) {
  const run = async () => {
    try {
      // Create Live Validation Arena
      const arena = new LiveValidationArena();
      
      // Initialize
      await arena.initialize();
      
      // Run test suite
      await arena.runTestSuite();
      
      // Keep the server running
      logger.info('Live Validation Arena: Server running. Press Ctrl+C to exit.');
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };
  
  run();
}
