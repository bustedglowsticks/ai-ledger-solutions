/**
 * XRPL Liquidity Provider Bot - Live Validation Arena Orchestrator
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Supreme Integration for Wilder Testing (Lightweight Version)
 * 
 * Fuses all components of the Live Validation Arena:
 * - Adaptive Chaos Mode with live XRPL testnet data
 * - Interactive Yield Playground with real-time visualization
 * - Eco-Impact Federation Tuner with sentiment analysis
 * - NFT export for community sharing and engagement
 * - Live XRPL testnet hooks for real-world data
 */

const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;
const xrpl = require('xrpl');
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

// Import supreme enhancement modules
const WebSocketServer = require('../server/websocket-server');

// Import Live Data Fusion modules
const LiveDataFusion = require('./live-data-fusion');
const dataHarvester = require('../services/data-harvester');
const anomalyDetector = require('../services/anomaly-detector');
const nftExporter = require('../services/nft-exporter');

// Try to import modules with error handling
let AdaptiveChaosMode, EnhancedTestRunner;
let StressTestMode, PrometheusExporter, ReportExporter, TestScenarios;

// Import TensorFlow-free modules
const EcoImpactFederationTunerLite = require('./eco-impact-federation-tuner-lite');
const EnhancedTestRunnerClass = require('./enhanced-test-runner-class');
const YieldOptimizerLite = require('../optimizers/yield-optimizer-lite');

try {
  AdaptiveChaosMode = require('./adaptive-chaos-mode');
  EcoImpactFederationTuner = require('./eco-impact-federation-tuner');
  EnhancedTestRunner = require('./enhanced-test-runner');
  StressTestMode = require('./stress-test-mode');
  PrometheusExporter = require('../metrics/prometheus-exporter');
  ReportExporter = require('./report-exporter');
  TestScenarios = require('./test-scenarios');
} catch (error) {
  logger.warn(`Module import warning: ${error.message}`);
}

/**
 * Arena Orchestrator
 * 
 * Supreme integration of all Live Validation Arena components
 * with live XRPL testnet data and NFT export capabilities
 */
class ArenaOrchestrator {
  /**
   * Create a new Arena Orchestrator
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      capital: config.capital || 10000,
      simCount: config.simCount || 500,
      xrplTestnetUrl: config.xrplTestnetUrl || 'wss://s.altnet.rippletest.net:51233',
      dashboardWsUrl: config.dashboardWsUrl || 'ws://localhost:3000',
      walletSeed: config.walletSeed || process.env.XRPL_WALLET_SEED,
      autoNftMint: config.autoNftMint !== undefined ? config.autoNftMint : true,
      autoUpdateInterval: config.autoUpdateInterval || 60000, // 1 minute
      sentimentApiUrl: config.sentimentApiUrl || 'https://api.sentiment.example.com/v1/analyze',
      sentimentApiKey: config.sentimentApiKey || process.env.SENTIMENT_API_KEY,
      ...config
    };
    
    // Components
    this.adaptiveChaos = null;
    this.ecoImpactTuner = null;
    this.testRunner = null;
    this.wsServer = null;
    this.prometheusExporter = null;
    this.reportExporter = null;
    
    // Live Data Fusion component
    this.liveDataFusion = null; // Will be initialized in init()
    
    // XRPL client
    this.xrplClient = null;
    this.wallet = null;
    
    // WebSocket client for dashboard
    this.dashboardWs = null;
    
    // State
    this.isRunning = false;
    this.latestLedgerData = null;
    this.latestSentimentData = null;
    this.latestTestResults = null;
    this.latestAllocation = null;
    this.latestYield = null;
    this.latestEcoScore = null;
    this.autoUpdateInterval = null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.connectXrpl = this.connectXrpl.bind(this);
    this.connectDashboard = this.connectDashboard.bind(this);
    this.fetchLiveData = this.fetchLiveData.bind(this);
    this.analyzeSentiment = this.analyzeSentiment.bind(this);
    this.runFusedValidation = this.runFusedValidation.bind(this);
    this.mintEcoNFT = this.mintEcoNFT.bind(this);
    this.handleLedgerClosed = this.handleLedgerClosed.bind(this);
    this.startAutoUpdate = this.startAutoUpdate.bind(this);
    this.stopAutoUpdate = this.stopAutoUpdate.bind(this);
  }
  
  /**
   * Initialize the Arena Orchestrator
   * @returns {Promise<void>}
   */
  async init() {
    try {
      logger.info('Arena Orchestrator: Initializing...');
      
      // Initialize components
      // Use lightweight version of AdaptiveChaosMode
      this.adaptiveChaos = {
        generateAdaptiveScenario: this.generateLightweightAdaptiveScenario.bind(this)
      };
      
      // Create eco-impact federation tuner (TensorFlow-free version)
      this.ecoImpactTuner = new EcoImpactFederationTunerLite({
        configPath: path.join(process.cwd(), 'config', 'federation.json'),
        ecoBonus: 1.24,
        sustainabilityThreshold: 0.6
      });
      
      this.testRunner = new EnhancedTestRunnerClass({
        capital: this.config.capital,
        live: true,
        reportDir: path.join(process.cwd(), 'reports')
      });
      
      this.wsServer = new WebSocketServer({
        port: 3000
      });
      
      this.prometheusExporter = new PrometheusExporter({
        port: 9090
      });
      
      this.reportExporter = new ReportExporter();
      
      // Connect to XRPL testnet
      await this.connectXrpl();
      
      // Connect to dashboard WebSocket
      this.connectDashboard();
      
      // Start WebSocket server
      await this.wsServer.start();
      
      // Start Prometheus exporter
      await this.prometheusExporter.start();
      
      // Initialize Live Data Fusion
      logger.info('Arena Orchestrator: Initializing Live Data Fusion...');
      this.liveDataFusion = new LiveDataFusion({
        updateInterval: this.config.autoUpdateInterval,
        autoRebalance: true,
        autoMintNFT: this.config.autoNftMint,
        initialCapital: this.config.capital,
        ecoWeighting: true
      });
      
      // Register event handlers
      this.liveDataFusion.registerEventHandlers({
        onUpdate: this.handleLiveDataUpdate.bind(this),
        onAnomaly: this.handleAnomaly.bind(this),
        onRebalance: this.handleRebalance.bind(this),
        onNFTMint: this.handleNFTMint.bind(this)
      });
      
      // Initialize and start Live Data Fusion
      await this.liveDataFusion.initialize();
      await this.liveDataFusion.start();
      logger.info('Arena Orchestrator: Live Data Fusion initialized successfully');
      
      // Start auto-update if enabled
      if (this.config.autoUpdateInterval > 0) {
        this.startAutoUpdate();
      }
      
      logger.info('Arena Orchestrator: Initialized successfully');
      
      // Initial validation run
      await this.runFusedValidation();
      
      return true;
    } catch (error) {
      logger.error(`Arena Orchestrator: Initialization failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Connect to XRPL testnet
   * @returns {Promise<void>}
   */
  async connectXrpl() {
    try {
      logger.info(`Arena Orchestrator: Connecting to XRPL testnet at ${this.config.xrplTestnetUrl}`);
      
      this.xrplClient = new xrpl.Client(this.config.xrplTestnetUrl);
      await this.xrplClient.connect();
      
      // Set up wallet if seed is provided
      if (this.config.walletSeed) {
        this.wallet = xrpl.Wallet.fromSeed(this.config.walletSeed);
        logger.info(`Arena Orchestrator: Wallet initialized with address ${this.wallet.address}`);
      } else {
        // Generate a new wallet for testing
        this.wallet = xrpl.Wallet.generate();
        logger.info(`Arena Orchestrator: Generated new wallet with address ${this.wallet.address}`);
        
        // Fund the wallet from testnet faucet
        try {
          const fundResult = await this.xrplClient.fundWallet();
          this.wallet = fundResult.wallet;
          logger.info(`Arena Orchestrator: Funded wallet with ${fundResult.balance} XRP`);
        } catch (fundError) {
          logger.warn(`Arena Orchestrator: Failed to fund wallet: ${fundError.message}`);
        }
      }
      
      // Subscribe to ledger close events
      this.xrplClient.on('ledgerClosed', this.handleLedgerClosed);
      
      logger.info('Arena Orchestrator: Connected to XRPL testnet');
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to connect to XRPL testnet: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Connect to dashboard WebSocket
   */
  connectDashboard() {
    try {
      logger.info(`Arena Orchestrator: Connecting to dashboard WebSocket at ${this.config.dashboardWsUrl}`);
      
      this.dashboardWs = new WebSocket(this.config.dashboardWsUrl);
      
      this.dashboardWs.on('open', () => {
        logger.info('Arena Orchestrator: Connected to dashboard WebSocket');
      });
      
      this.dashboardWs.on('close', () => {
        logger.info('Arena Orchestrator: Disconnected from dashboard WebSocket');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectDashboard(), 5000);
      });
      
      this.dashboardWs.on('error', (error) => {
        logger.error(`Arena Orchestrator: Dashboard WebSocket error: ${error.message}`);
      });
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to connect to dashboard WebSocket: ${error.message}`);
    }
  }
  
  /**
   * Handle ledger closed event
   * @param {Object} ledger - Ledger data
   */
  async handleLedgerClosed(ledger) {
    try {
      logger.info(`Arena Orchestrator: Ledger closed - Index: ${ledger.ledger_index}`);
      
      // Fetch live data from the ledger
      const liveData = await this.fetchLiveData(ledger);
      
      // Store latest ledger data
      this.latestLedgerData = {
        ledger_index: ledger.ledger_index,
        close_time: ledger.ledger_time,
        ...liveData
      };
      
      // Send ledger update to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'ledger_update',
          data: this.latestLedgerData
        }));
      }
      
      // Run validation if auto-update is disabled
      // (otherwise it will run on the interval)
      if (!this.autoUpdateInterval) {
        await this.runFusedValidation();
      }
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to handle ledger closed event: ${error.message}`);
    }
  }
  
  /**
   * Start auto-update interval
   */
  startAutoUpdate() {
    if (this.autoUpdateInterval) {
      this.stopAutoUpdate();
    }
    
    logger.info(`Arena Orchestrator: Starting auto-update interval (${this.config.autoUpdateInterval}ms)`);
    
    this.autoUpdateInterval = setInterval(async () => {
      try {
        await this.runFusedValidation();
      } catch (error) {
        logger.error(`Arena Orchestrator: Auto-update failed: ${error.message}`);
      }
    }, this.config.autoUpdateInterval);
  }
  
  /**
   * Stop auto-update interval
   */
  stopAutoUpdate() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = null;
      
      logger.info('Arena Orchestrator: Stopped auto-update interval');
    }
  }
  
  /**
   * Fetch live data from XRPL
   * @param {Object} ledger - Ledger data
   * @returns {Promise<Object>} - Live data
   */
  async fetchLiveData(ledger) {
    try {
      logger.info('Arena Orchestrator: Fetching live data...');
      
      // Use Data Harvester to get live data
      const liveData = await dataHarvester.harvestLiveData(
        ledger ? ledger.ledger_index : 'validated'
      );
      
      // Debug log to validate data quality
      logger.debug(`Arena Orchestrator: Raw harvested data - ${JSON.stringify(liveData).slice(0, 200)}...`);
      
      // Detect anomalies
      const anomalyResult = await anomalyDetector.detectAnomalies(liveData);
      
      // Debug log for anomaly scores
      logger.debug(`Arena Orchestrator: Anomaly score: ${anomalyResult.anomalyScore.toFixed(2)}, needs rebalance: ${anomalyResult.needsRebalance}`);
      
      // Combine data
      const result = {
        timestamp: Date.now(),
        ledgerData: liveData,
        anomalyResult,
        sentiment: liveData.sentiment || await this.analyzeSentiment()
      };
      
      this.latestLedgerData = result;
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'liveData',
          data: result
        }));
      }
      
      logger.info(`Arena Orchestrator: Live data fetched - Volatility: ${liveData.volatility?.shortTerm?.toFixed(2) || 'N/A'}, Anomaly: ${anomalyResult.anomalyScore.toFixed(2)}`);
      return result;
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to fetch live data: ${error.message}`);
      
      // Return cached data if available
      if (this.latestLedgerData) {
        logger.info('Arena Orchestrator: Using cached data as fallback');
        return this.latestLedgerData;
      }
      
      // Return mock data as fallback
      logger.info('Arena Orchestrator: Using mock data as fallback');
      return {
        timestamp: Date.now(),
        ledgerData: {
          volatility: { shortTerm: 0.5, longTerm: 0.3 },
          volume: 1000000,
          txCount: 500,
          pools: [
            { pair: 'XRP/USD', liquidity: 5000000 },
            { pair: 'XRP/EUR', liquidity: 3000000 }
          ]
        },
        anomalyResult: { anomalyScore: 0.3, needsRebalance: false },
        sentiment: { overall: 0.6, topics: ['XRPL', 'Liquidity'], volume: 1000 }
      };
    }
  }
  
  /**
   * Analyze sentiment for XRPL-related topics
   * @param {string} query - Search query
   * @returns {Promise<Object>} - Sentiment analysis results
   */
  async analyzeSentiment(query = '#XRPLGreenDeFi') {
    try {
      logger.info(`Arena Orchestrator: Analyzing sentiment for "${query}"...`);
      
      // Try to use sentiment API if available
      if (this.config.sentimentApiKey) {
        const response = await axios.post(this.config.sentimentApiUrl, {
          query,
          limit: 20
        }, {
          headers: {
            'Authorization': `Bearer ${this.config.sentimentApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.latestSentimentData = response.data;
        return response.data;
      }
      
      // Fallback to mock sentiment data
      const mockSentiments = [
        { score: 0.85, volume: 1200, trend: 'positive' },
        { score: 0.65, volume: 800, trend: 'neutral' },
        { score: 0.92, volume: 1500, trend: 'very_positive' },
        { score: 0.45, volume: 600, trend: 'neutral' },
        { score: 0.25, volume: 300, trend: 'negative' }
      ];
      
      // Select a random sentiment or weight by time of day
      const hour = new Date().getHours();
      const sentimentIndex = Math.min(
        Math.floor(hour / 5), 
        mockSentiments.length - 1
      );
      
      const sentiment = mockSentiments[sentimentIndex];
      
      this.latestSentimentData = sentiment;
      
      logger.info(`Arena Orchestrator: Sentiment analysis complete - Score: ${sentiment.score}, Trend: ${sentiment.trend}`);
      return sentiment;
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to analyze sentiment: ${error.message}`);
      
      // Return neutral sentiment as fallback
      return {
        score: 0.5,
        volume: 500,
        trend: 'neutral'
      };
    }
  }
  
  /**
   * Generate lightweight adaptive scenario without TensorFlow
   * @param {Object} baseScenario - Base scenario to enhance
   * @returns {Promise<Object>} - Enhanced scenario
   */
  async generateLightweightAdaptiveScenario(baseScenario = {}) {
    try {
      logger.info('Arena Orchestrator: Generating lightweight adaptive scenario...');
      
      // Helper function for random number generation
      const getRandomInRange = (min, max) => {
        const range = max - min;
        const byteLength = Math.ceil(Math.log2(range) / 8);
        const randomBytes = crypto.randomBytes(byteLength);
        const randomValue = parseInt(randomBytes.toString('hex'), 16);
        return min + (randomValue % (range + 1));
      };
      
      // Generate adaptive scenario based on live data
      const enhancedScenario = {
        ...baseScenario,
        name: baseScenario.name || `Adaptive Scenario ${Date.now()}`,
        description: baseScenario.description || 'Dynamically generated adaptive scenario',
        capital: baseScenario.capital || this.config.capital,
        pools: baseScenario.pools || [],
        volatilityChanges: {},
        ecoWeights: {},
        sentimentFactors: {}
      };
      
      // Add dynamic pools if none provided
      if (!enhancedScenario.pools.length) {
        const poolCount = getRandomInRange(3, 8);
        
        for (let i = 0; i < poolCount; i++) {
          const volatility = getRandomInRange(10, 90) / 100;
          const currentApy = getRandomInRange(5, 50) / 100;
          const clawbackRisk = getRandomInRange(5, 30) / 100;
          
          enhancedScenario.pools.push({
            id: `pool-${i}`,
            name: `Pool ${i}`,
            assets: [`XRP`, `Token${i}`],
            volatility,
            currentApy,
            clawbackRisk,
            ecoImpact: getRandomInRange(30, 90) / 100,
            liquidity: getRandomInRange(10000, 1000000)
          });
        }
      }
      
      // Apply sentiment factors if available
      if (this.latestSentimentData) {
        enhancedScenario.sentimentFactors = this.latestSentimentData;
      }
      
      // Add XRPL-specific data if available
      if (this.latestLedgerData) {
        enhancedScenario.xrplData = {
          ledgerIndex: this.latestLedgerData.ledgerIndex,
          ledgerHash: this.latestLedgerData.ledgerHash,
          closeTime: this.latestLedgerData.closeTime,
          transactionCount: this.latestLedgerData.transactionCount || 0
        };
      }
      
      logger.info(`Arena Orchestrator: Generated adaptive scenario with ${enhancedScenario.pools.length} pools`);
      return enhancedScenario;
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to generate adaptive scenario: ${error.message}`);
      // Return basic scenario as fallback
      return {
        name: 'Fallback Scenario',
        description: 'Basic fallback scenario',
        volatility: 0.15,
        sentimentScore: 0.7,
        confidenceScores: { yield: 0.8, stability: 0.75, resilience: 0.85 },
        parameters: { rlusdAllocation: 0.5, xrpExposure: 0.4, hedgeRatio: 0.6, rebalanceThreshold: 0.1 }
      };
    }
  }
  
  /**
   * Run fused validation with all components
   * @returns {Promise<Object>} - Validation results
   */
  async runFusedValidation() {
    try {
      if (this.isRunning) {
        logger.warn('Arena Orchestrator: Validation already running, skipping...');
        return;
      }
      
      this.isRunning = true;
      logger.info('Arena Orchestrator: Running fused validation...');
      
      // Get latest data
      const liveData = await this.fetchLiveData();
      logger.debug(`Arena Orchestrator: Live data fetched for validation - ${JSON.stringify(liveData.ledgerData.volatility || {})}`);
      
      // Generate scenario based on live data
      const scenario = await this.generateLightweightAdaptiveScenario({
        volatility: liveData.ledgerData.volatility?.shortTerm || 0.15,
        sentiment: liveData.sentiment?.overall || 0.6
      });
      
      // Initialize components if needed
      if (!this.ecoImpactTuner) {
        this.ecoImpactTuner = new EcoImpactFederationTunerLite();
        await this.ecoImpactTuner.initialize();
      }
      
      if (!this.testRunner) {
        this.testRunner = new EnhancedTestRunnerClass();
        await this.testRunner.initialize();
      }
      
      // Run eco-impact tuning
      const tuningResults = await this.ecoImpactTuner.tune({
        scenario,
        sentiment: liveData.sentiment
      });
      
      // Apply tuning to scenario
      const tunedScenario = {
        ...scenario,
        ecoWeights: tuningResults.weights
      };
      
      // Run test with tuned scenario
      const testResults = await this.testRunner.runTest({
        scenario: tunedScenario,
        capital: this.config.capital,
        simCount: this.config.simCount
      });
      
      // Calculate sustainability report
      const sustainabilityReport = this.ecoImpactTuner.generateSustainabilityReport(
        testResults,
        tuningResults
      );
      
      // Export report if available
      let reportPath = null;
      if (this.reportExporter) {
        reportPath = await this.reportExporter.exportReport({
          testResults,
          tuningResults,
          sustainabilityReport,
          scenario: tunedScenario
        });
      }
      
      // Check if we should rebalance based on anomaly detection
      if (liveData.anomalyResult && liveData.anomalyResult.needsRebalance) {
        logger.info(`Arena Orchestrator: Anomaly detected (score: ${liveData.anomalyResult.anomalyScore.toFixed(2)}), triggering rebalance`);
        
        // Get pools from test results
        const pools = testResults.pools || [];
        
        // Calculate dynamic allocation
        const allocation = await anomalyDetector.dynamicAllocate(
          this.config.capital,
          pools,
          {
            vol: liveData.ledgerData.volatility?.shortTerm || 0.15,
            sentiment: liveData.sentiment?.overall || 0.6
          }
        );
        
        // Update latest allocation
        this.latestAllocation = allocation;
        this.latestYield = allocation.expectedAPY;
        this.latestEcoScore = sustainabilityReport.summary.averageSustainabilityRating;
        
        logger.debug(`Arena Orchestrator: New allocation - APY: ${allocation.expectedAPY.toFixed(2)}%, Stable: ${allocation.stableAllocation.toFixed(2)}%`);
        
        // Mint NFT if auto-mint is enabled
        let nftResult = null;
        if (this.config.autoNftMint) {
          nftResult = await this.mintEcoNFT({
            testResults,
            tuningResults,
            sustainabilityReport,
            allocation
          });
        }
      }
      
      // Store results
      this.latestTestResults = {
        testResults,
        tuningResults,
        sustainabilityReport,
        timestamp: Date.now()
      };
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'testResults',
          data: this.latestTestResults
        }));
      }
      
      logger.info('Arena Orchestrator: Fused validation completed successfully');
      this.isRunning = false;
      
      return this.latestTestResults;
    } catch (error) {
      logger.error(`Arena Orchestrator: Fused validation failed: ${error.message}`);
      this.isRunning = false;
      throw error;
    }

  }
  
  /**
   * Mint eco-impact NFT using the NFT Exporter service
   * @param {Object} data - Data to include in NFT
   * @returns {Promise<Object>} - NFT minting result
   */
  async mintEcoNFT(data) {
    try {
      logger.info('Arena Orchestrator: Minting eco-impact NFT...');
      
      // Check if NFT Exporter is available
      if (!nftExporter) {
        logger.warn('Arena Orchestrator: NFT Exporter not available, initializing...');
        nftExporter = new NFTExporter({
          xrplClient: this.xrplClient,
          wallet: this.wallet,
          ipfsEnabled: this.config.ipfsEnabled || false,
          testMode: this.config.testMode || true
        });
        await nftExporter.initialize();
      }
      
      // Prepare enhanced metadata with eco-impact data
      const metadata = {
        name: `XRPL Eco-Impact Report #${uuidv4().slice(0, 8)}`,
        description: 'XRPL Liquidity Provider Bot Eco-Impact Report',
        timestamp: Date.now(),
        version: '2.0',
        data: {
          yield: data.testResults?.overallYield || data.allocation?.expectedAPY || 0,
          ecoScore: data.sustainabilityReport?.summary?.averageSustainabilityRating || 0,
          carbonOffset: data.sustainabilityReport?.summary?.totalCarbonOffset || 0,
          pools: data.testResults?.pools || [],
          allocation: data.allocation || {}
        },
        attributes: [
          {
            trait_type: 'Yield',
            value: `${(data.testResults?.overallYield || data.allocation?.expectedAPY || 0).toFixed(2)}%`
          },
          {
            trait_type: 'Eco Score',
            value: (data.sustainabilityReport?.summary?.averageSustainabilityRating || 0).toFixed(2)
          },
          {
            trait_type: 'Carbon Offset',
            value: `${(data.sustainabilityReport?.summary?.totalCarbonOffset || 0).toFixed(2)} kg`
          }
        ],
        image: await this.generateNFTImage(data)
      };
      
      // Add community engagement data if available
      if (data.communityData) {
        metadata.community = data.communityData;
      }
      
      // Export NFT with enhanced metadata
      const nftResult = await nftExporter.exportNFT({
        metadata,
        recipient: this.wallet?.address,
        transferable: true,
        storeMetadataOnChain: !this.config.ipfsEnabled
      });
      
      // Log success
      logger.info(`Arena Orchestrator: Eco-impact NFT minted successfully - ID: ${nftResult.nftId}`);
      
      // Broadcast NFT event to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'nftMinted',
          data: {
            nftId: nftResult.nftId,
            metadata: metadata,
            timestamp: Date.now()
          }
        }));
      }
      
      // Return NFT result
      return {
        ...nftResult,
        metadata
      };
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to mint eco-impact NFT: ${error.message}`);
      
      // Return mock result as fallback
      return {
        nftId: `00000000${uuidv4().replace(/-/g, '')}`,
        metadata: {
          name: `XRPL Eco-Impact Report (Mock)`,
          timestamp: Date.now(),
          mockData: true
        },
        txHash: `mock_tx_${Date.now()}`,
        error: error.message
      };
    }
  }
  
  /**
   * Generate NFT image based on eco-impact data
   * @param {Object} data - Eco-impact data
   * @returns {Promise<string>} - Base64 encoded image
   */
  async generateNFTImage(data) {
    try {
      // If image generator service is available, use it
      if (this.config.imageGeneratorUrl) {
        const response = await axios.post(this.config.imageGeneratorUrl, {
          yield: data.testResults?.overallYield || data.allocation?.expectedAPY || 0,
          ecoScore: data.sustainabilityReport?.summary?.averageSustainabilityRating || 0,
          theme: 'eco'
        });
        
        return response.data.image; // Base64 encoded image
      }
      
      // Otherwise return default image
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGYzMjJjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRjYWY1MCI+WFJQTCBFY28tSW1wYWN0IFJlcG9ydDwvdGV4dD48L3N2Zz4=';
    } catch (error) {
      logger.error(`Arena Orchestrator: Failed to generate NFT image: ${error.message}`);
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGYzMjJjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRjYWY1MCI+WFJQTCBFY28tSW1wYWN0IFJlcG9ydDwvdGV4dD48L3N2Zz4=';
    }
  }
  
  /**
   * Handle live data update from Live Data Fusion
   * @param {Object} data - Live data update
   */
  async handleLiveDataUpdate(data) {
    try {
      logger.debug('Arena Orchestrator: Handling live data update...');
      
      // Store latest data
      this.latestLedgerData = data;
      
      // Update metrics
      if (this.prometheusExporter) {
        this.prometheusExporter.exportMetrics({
          timestamp: Date.now(),
          volatility: data.volatility?.shortTerm || 0,
          volume: data.volume || 0,
          txCount: data.txCount || 0,
          sentiment: data.sentiment?.overall || 0
        });
      }
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'liveDataUpdate',
          data: {
            timestamp: Date.now(),
            ledgerData: data
          }
        }));
      }
      
      logger.info(`Arena Orchestrator: Live data updated - Volatility: ${data.volatility?.shortTerm?.toFixed(2) || 'N/A'}, Volume: ${data.volume?.toLocaleString() || 'N/A'}`);
    } catch (error) {
      logger.error(`Arena Orchestrator: Error handling live data update: ${error.message}`);
    }
  }
  
  /**
   * Handle anomaly detection from Live Data Fusion
   * @param {Object} anomaly - Anomaly data
   */
  async handleAnomaly(anomaly) {
    try {
      logger.info(`Arena Orchestrator: Anomaly detected - Score: ${anomaly.anomalyScore.toFixed(2)}, Type: ${anomaly.type}`);
      
      // Store anomaly data
      this.latestAnomaly = anomaly;
      
      // Check if we should trigger rebalance
      if (anomaly.needsRebalance && this.config.autoRebalance) {
        logger.info('Arena Orchestrator: Anomaly requires rebalance, triggering...');
        
        // Trigger rebalance
        await this.liveDataFusion.triggerRebalance({
          anomaly,
          capital: this.config.capital,
          currentAllocation: this.latestAllocation
        });
      }
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'anomalyDetected',
          data: {
            timestamp: Date.now(),
            anomaly
          }
        }));
      }
      
      // Log detailed anomaly data
      logger.debug(`Arena Orchestrator: Anomaly details - ${JSON.stringify(anomaly)}`);
    } catch (error) {
      logger.error(`Arena Orchestrator: Error handling anomaly: ${error.message}`);
    }
  }
  
  /**
   * Handle rebalance event from Live Data Fusion
   * @param {Object} rebalanceData - Rebalance data
   */
  async handleRebalance(rebalanceData) {
    try {
      logger.info(`Arena Orchestrator: Handling rebalance - New allocation: ${JSON.stringify(rebalanceData.allocation)}`);
      
      // Store latest allocation
      this.latestAllocation = rebalanceData.allocation;
      this.latestYield = rebalanceData.expectedAPY;
      
      // Run validation with new allocation
      if (this.config.validateAfterRebalance) {
        await this.runFusedValidation();
      }
      
      // Mint NFT if enabled
      if (this.config.autoNftMint) {
        await this.mintEcoNFT({
          allocation: rebalanceData.allocation,
          sustainabilityReport: rebalanceData.sustainabilityReport || {
            summary: {
              averageSustainabilityRating: rebalanceData.ecoScore || 0,
              totalCarbonOffset: rebalanceData.carbonOffset || 0
            }
          },
          communityData: {
            rebalanceReason: rebalanceData.reason,
            anomalyScore: rebalanceData.anomalyScore
          }
        });
      }
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'rebalanceCompleted',
          data: {
            timestamp: Date.now(),
            allocation: rebalanceData.allocation,
            expectedAPY: rebalanceData.expectedAPY,
            reason: rebalanceData.reason
          }
        }));
      }
      
      logger.info(`Arena Orchestrator: Rebalance completed - Expected APY: ${rebalanceData.expectedAPY.toFixed(2)}%`);
    } catch (error) {
      logger.error(`Arena Orchestrator: Error handling rebalance: ${error.message}`);
    }
  }
  
  /**
   * Handle NFT mint event from Live Data Fusion
   * @param {Object} nftData - NFT data
   */
  async handleNFTMint(nftData) {
    try {
      logger.info(`Arena Orchestrator: NFT minted - ID: ${nftData.nftId}`);
      
      // Store NFT data
      this.latestNFT = nftData;
      
      // Broadcast to dashboard
      if (this.dashboardWs && this.dashboardWs.readyState === WebSocket.OPEN) {
        this.dashboardWs.send(JSON.stringify({
          type: 'nftMinted',
          data: {
            timestamp: Date.now(),
            nft: nftData
          }
        }));
      }
      
      // Export NFT data to report
      if (this.reportExporter) {
        await this.reportExporter.exportNFTData(nftData);
      }
      
      logger.debug(`Arena Orchestrator: NFT details - ${JSON.stringify(nftData)}`);
    } catch (error) {
      logger.error(`Arena Orchestrator: Error handling NFT mint: ${error.message}`);
    }
  }
  
  /**
   * Shutdown the Arena Orchestrator
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      logger.info('Arena Orchestrator: Shutting down...');
      
      // Stop auto-update
      this.stopAutoUpdate();
      
      // Shutdown Live Data Fusion
      if (this.liveDataFusion) {
        logger.info('Arena Orchestrator: Stopping Live Data Fusion...');
        try {
          await this.liveDataFusion.stop();
          await this.liveDataFusion.cleanup();
          logger.info('Arena Orchestrator: Live Data Fusion stopped successfully');
        } catch (fusionError) {
          logger.error(`Arena Orchestrator: Error stopping Live Data Fusion: ${fusionError.message}`);
        }
      }
      
      // Disconnect from XRPL
      if (this.xrplClient && this.xrplClient.isConnected()) {
        logger.info('Arena Orchestrator: Disconnecting from XRPL...');
        await this.xrplClient.disconnect();
      }
      
      // Close dashboard WebSocket
      if (this.dashboardWs) {
        logger.info('Arena Orchestrator: Closing dashboard WebSocket...');
        this.dashboardWs.close();
      }
      
      // Stop WebSocket server
      if (this.wsServer) {
        logger.info('Arena Orchestrator: Stopping WebSocket server...');
        await this.wsServer.stop();
      }
      
      // Stop Prometheus exporter
      if (this.prometheusExporter) {
        logger.info('Arena Orchestrator: Stopping Prometheus exporter...');
        await this.prometheusExporter.stop();
      }
      
      // Clean up NFT Exporter if initialized
      if (nftExporter) {
        logger.info('Arena Orchestrator: Cleaning up NFT Exporter...');
        try {
          await nftExporter.cleanup();
          logger.info('Arena Orchestrator: NFT Exporter cleaned up successfully');
        } catch (nftError) {
          logger.error(`Arena Orchestrator: Error cleaning up NFT Exporter: ${nftError.message}`);
        }
      }
      
      // Final cleanup
      this.latestLedgerData = null;
      this.latestAllocation = null;
      this.latestAnomaly = null;
      this.latestNFT = null;
      
      logger.info('Arena Orchestrator: Shutdown complete');
      return true;
    } catch (error) {
      logger.error(`Arena Orchestrator: Shutdown failed: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Create Arena Orchestrator
    const orchestrator = new ArenaOrchestrator({
      capital: 10000,
      simCount: 500,
      autoUpdateInterval: 60000 // 1 minute
    });
    
    // Initialize orchestrator
    await orchestrator.init();
    
    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal, shutting down...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal, shutting down...');
      await orchestrator.shutdown();
      process.exit(0);
    });
    
    logger.info('Arena Orchestrator running. Press Ctrl+C to exit.');
  } catch (error) {
    logger.error(`Main: ${error.message}`);
    process.exit(1);
  }
}

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  ArenaOrchestrator
};
