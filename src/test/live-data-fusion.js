/**
 * Live Data Fusion
 * 
 * Integrates Data Harvester, Anomaly Detector, and NFT Exporter
 * for real-time XRPL testnet validation and community engagement
 */

const logger = require('../utils/logger');
const dataHarvester = require('../services/data-harvester');
const anomalyDetector = require('../services/anomaly-detector');
const nftExporter = require('../services/nft-exporter');
const ammMath = require('../utils/amm-math');

class LiveDataFusion {
  constructor(config = {}) {
    this.config = {
      updateInterval: config.updateInterval || 60000, // 1 minute
      autoRebalance: config.autoRebalance !== undefined ? config.autoRebalance : true,
      autoMintNFT: config.autoMintNFT !== undefined ? config.autoMintNFT : false,
      initialCapital: config.initialCapital || 10000000,
      ecoWeighting: config.ecoWeighting !== undefined ? config.ecoWeighting : true,
      ...config
    };
    
    this.updateTimer = null;
    this.lastUpdate = null;
    this.currentData = null;
    this.currentAllocation = null;
    this.initialized = false;
    
    // Event callbacks
    this.onUpdate = null;
    this.onAnomaly = null;
    this.onRebalance = null;
    this.onNFTMint = null;
  }
  
  /**
   * Initialize the Live Data Fusion
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('Live Data Fusion: Initializing service');
      
      // Initialize components
      await dataHarvester.initialize();
      await anomalyDetector.initialize();
      await nftExporter.initialize();
      
      this.initialized = true;
      
      logger.info('Live Data Fusion: Initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Live Data Fusion: Initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Start live data fusion
   * @returns {Promise<boolean>} Whether start was successful
   */
  async start() {
    try {
      logger.info('Live Data Fusion: Starting service');
      
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Perform initial update
      await this.update();
      
      // Set up update timer
      this.updateTimer = setInterval(() => this.update(), this.config.updateInterval);
      
      logger.info('Live Data Fusion: Started successfully');
      return true;
    } catch (error) {
      logger.error(`Live Data Fusion: Start failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Update data and perform analysis
   * @returns {Promise<Object>} Update result
   */
  async update() {
    try {
      logger.info('Live Data Fusion: Updating data');
      
      // Harvest live data
      const liveData = await dataHarvester.harvestLiveData();
      this.currentData = liveData;
      this.lastUpdate = Date.now();
      
      // Detect anomalies
      const anomalyResult = await anomalyDetector.detectAnomalies(liveData);
      
      // Check if rebalance is needed
      if (anomalyResult.needsRebalance && this.config.autoRebalance) {
        await this.rebalance(liveData, anomalyResult);
      }
      
      // Trigger update event
      if (this.onUpdate) {
        this.onUpdate({
          liveData,
          anomalyResult,
          timestamp: this.lastUpdate
        });
      }
      
      // Trigger anomaly event if score is high
      if (anomalyResult.anomalyScore > 0.7 && this.onAnomaly) {
        this.onAnomaly({
          anomalyResult,
          liveData,
          timestamp: this.lastUpdate
        });
      }
      
      logger.info('Live Data Fusion: Update completed successfully');
      
      return {
        liveData,
        anomalyResult,
        timestamp: this.lastUpdate
      };
    } catch (error) {
      logger.error(`Live Data Fusion: Update failed: ${error.message}`);
      
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Rebalance allocation based on market conditions
   * @param {Object} liveData - Live market data
   * @param {Object} anomalyResult - Anomaly detection result
   * @returns {Promise<Object>} Rebalance result
   */
  async rebalance(liveData, anomalyResult) {
    try {
      logger.info('Live Data Fusion: Rebalancing allocation');
      
      // Get pools from live data
      const pools = liveData.amm?.pools || [];
      
      // Calculate dynamic allocation
      const allocation = await anomalyDetector.dynamicAllocate(
        this.config.initialCapital,
        pools,
        {
          vol: liveData.volatility?.shortTerm || 0.5
        }
      );
      
      this.currentAllocation = allocation;
      
      // Trigger rebalance event
      if (this.onRebalance) {
        this.onRebalance({
          allocation,
          anomalyResult,
          liveData,
          timestamp: Date.now()
        });
      }
      
      // Auto-mint NFT if enabled and significant change
      if (this.config.autoMintNFT && this._isSignificantChange(allocation)) {
        await this.mintYieldProofNFT(allocation, anomalyResult);
      }
      
      logger.info('Live Data Fusion: Rebalance completed successfully');
      
      return allocation;
    } catch (error) {
      logger.error(`Live Data Fusion: Rebalance failed: ${error.message}`);
      
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Check if allocation change is significant
   * @param {Object} allocation - New allocation
   * @returns {boolean} Whether change is significant
   * @private
   */
  _isSignificantChange(allocation) {
    // If no previous allocation, consider it significant
    if (!this.currentAllocation) return true;
    
    // Check if stable allocation changed by more than 10%
    const prevStable = this.currentAllocation.stableAllocation || 0;
    const newStable = allocation.stableAllocation || 0;
    
    if (Math.abs(newStable - prevStable) > 10) {
      return true;
    }
    
    // Check if expected APY changed by more than 20%
    const prevAPY = this.currentAllocation.expectedAPY || 0;
    const newAPY = allocation.expectedAPY || 0;
    
    if (Math.abs(newAPY - prevAPY) / Math.max(1, prevAPY) > 0.2) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Mint a Yield Proof NFT
   * @param {Object} allocation - Current allocation
   * @param {Object} anomalyResult - Anomaly detection result
   * @returns {Promise<Object>} NFT minting result
   */
  async mintYieldProofNFT(allocation, anomalyResult) {
    try {
      logger.info('Live Data Fusion: Minting Yield Proof NFT');
      
      // Prepare metadata
      const metadata = {
        yield: allocation.expectedAPY || 0,
        stableAllocation: allocation.stableAllocation || 0,
        ecoScore: this.config.ecoWeighting ? 0.8 : 0.5, // Higher score if eco-weighting is enabled
        anomalyScore: anomalyResult.anomalyScore || 0,
        timestamp: Date.now(),
        distribution: Object.keys(allocation.distribution || {}).reduce((acc, key) => {
          acc[key] = allocation.distribution[key].percentage;
          return acc;
        }, {})
      };
      
      // Generate image data (in a real implementation, this would be a snapshot)
      const imageData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#1a1a2e" />
        <text x="20" y="40" font-family="Arial" font-size="20" fill="#ffffff">Yield Proof NFT</text>
        <text x="20" y="80" font-family="Arial" font-size="16" fill="#ffffff">Yield: ${metadata.yield.toFixed(1)}%</text>
        <text x="20" y="110" font-family="Arial" font-size="16" fill="#ffffff">Eco-Score: ${(metadata.ecoScore * 100).toFixed(0)}%</text>
        <text x="20" y="140" font-family="Arial" font-size="16" fill="#ffffff">Stable Allocation: ${metadata.stableAllocation.toFixed(1)}%</text>
        <text x="20" y="170" font-family="Arial" font-size="16" fill="#ffffff">Timestamp: ${new Date(metadata.timestamp).toISOString()}</text>
        <rect x="20" y="200" width="${Math.min(360, metadata.yield * 3)}" height="20" fill="#4CAF50" />
      </svg>`;
      
      // Mint NFT
      const nftResult = await nftExporter.mintYieldProofNFT(metadata, imageData);
      
      // Trigger NFT mint event
      if (this.onNFTMint) {
        this.onNFTMint({
          nftResult,
          metadata,
          timestamp: Date.now()
        });
      }
      
      logger.info(`Live Data Fusion: NFT minted successfully with ID ${nftResult.nfTokenId}`);
      
      return nftResult;
    } catch (error) {
      logger.error(`Live Data Fusion: NFT minting failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Stop live data fusion
   * @returns {Promise<boolean>} Whether stop was successful
   */
  async stop() {
    try {
      logger.info('Live Data Fusion: Stopping service');
      
      // Clear update timer
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
      
      // Stop components
      await dataHarvester.stop();
      await nftExporter.stop();
      
      this.initialized = false;
      
      logger.info('Live Data Fusion: Stopped successfully');
      return true;
    } catch (error) {
      logger.error(`Live Data Fusion: Stop failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Register event handlers
   * @param {Object} handlers - Event handlers
   * @returns {void}
   */
  registerEventHandlers(handlers) {
    if (handlers.onUpdate) this.onUpdate = handlers.onUpdate;
    if (handlers.onAnomaly) this.onAnomaly = handlers.onAnomaly;
    if (handlers.onRebalance) this.onRebalance = handlers.onRebalance;
    if (handlers.onNFTMint) this.onNFTMint = handlers.onNFTMint;
  }
}

module.exports = LiveDataFusion;
