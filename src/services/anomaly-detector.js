/**
 * Anomaly Detector Service
 * 
 * Uses TensorFlow.js to detect anomalies in market data
 * Triggers rebalancing when volatility thresholds are exceeded
 */

const logger = require('../utils/logger');
const ammMath = require('../utils/amm-math');

// Simulate TensorFlow.js for now
// In a real implementation, you would use: const tf = require('@tensorflow/tfjs-node');
const tf = {
  tensor2d: (data) => ({
    data: () => Promise.resolve(data.flat())
  }),
  loadLayersModel: async (path) => ({
    predict: (tensor) => tensor
  })
};

class AnomalyDetector {
  constructor(config = {}) {
    this.config = {
      modelPath: config.modelPath || 'file:///models/anomaly-detector',
      volatilityThreshold: config.volatilityThreshold || 0.96,
      sentimentThreshold: config.sentimentThreshold || 0.8,
      rebalanceThreshold: config.rebalanceThreshold || 0.8,
      ecoWeighting: config.ecoWeighting || true,
      ...config
    };
    
    this.model = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the anomaly detector
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('Anomaly Detector: Initializing service');
      
      // Load TensorFlow.js model
      this.model = await tf.loadLayersModel(this.config.modelPath);
      
      this.initialized = true;
      
      logger.info('Anomaly Detector: Initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Anomaly Detector: Initialization failed: ${error.message}`);
      
      // Create a fallback model
      this.model = {
        predict: (tensor) => tensor
      };
      
      return false;
    }
  }
  
  /**
   * Detect anomalies in market data
   * @param {Object} marketData - Market data from Data Harvester
   * @returns {Promise<Object>} Anomaly detection results
   */
  async detectAnomalies(marketData) {
    try {
      logger.info('Anomaly Detector: Detecting anomalies in market data');
      
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Extract features for anomaly detection
      const features = this._extractFeatures(marketData);
      
      // Convert features to tensor
      const featureTensor = tf.tensor2d([features]);
      
      // Run prediction
      const anomalyScores = await this.model.predict(featureTensor).data();
      const anomalyScore = anomalyScores[0];
      
      // Determine if rebalance is needed
      const needsRebalance = anomalyScore > this.config.rebalanceThreshold;
      
      // Generate insights
      const insights = this._generateInsights(marketData, anomalyScore);
      
      logger.info(`Anomaly Detector: Anomaly score ${anomalyScore.toFixed(4)}, rebalance needed: ${needsRebalance}`);
      
      return {
        anomalyScore,
        needsRebalance,
        insights,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`Anomaly Detector: Error detecting anomalies: ${error.message}`);
      
      // Return default result
      return {
        anomalyScore: 0.5,
        needsRebalance: false,
        insights: {
          message: 'Error detecting anomalies, using default values',
          recommendations: []
        },
        timestamp: Date.now(),
        error: error.message
      };
    }
  }
  
  /**
   * Extract features for anomaly detection
   * @param {Object} marketData - Market data from Data Harvester
   * @returns {Array<number>} Feature vector
   * @private
   */
  _extractFeatures(marketData) {
    try {
      // Extract volatility metrics
      const volatility = marketData.volatility || {};
      const shortTermVol = volatility.shortTerm || 0.5;
      const mediumTermVol = volatility.mediumTerm || 0.4;
      const longTermVol = volatility.longTerm || 0.3;
      
      // Extract sentiment metrics
      const sentiment = marketData.sentiment || {};
      const overallSentiment = sentiment.overall || 0.5;
      
      // Extract AMM metrics
      const amm = marketData.amm || { pools: [] };
      const pools = amm.pools || [];
      
      // Calculate average APY and liquidity
      let avgApy = 0;
      let totalLiquidity = 0;
      
      if (pools.length > 0) {
        avgApy = pools.reduce((sum, pool) => sum + (pool.apy || 0), 0) / pools.length;
        totalLiquidity = pools.reduce((sum, pool) => sum + (pool.liquidity || 0), 0);
      }
      
      // Extract order book metrics
      const orderBooks = marketData.orderBooks || {};
      const xrpUsdBook = orderBooks['XRP/USD'] || { bids: [], asks: [] };
      
      // Calculate spread
      let spread = 0;
      if (xrpUsdBook.asks.length > 0 && xrpUsdBook.bids.length > 0) {
        const lowestAsk = xrpUsdBook.asks[0].price;
        const highestBid = xrpUsdBook.bids[0].price;
        spread = (lowestAsk - highestBid) / lowestAsk;
      }
      
      // Combine features
      return [
        shortTermVol,
        mediumTermVol,
        longTermVol,
        overallSentiment,
        avgApy / 100, // Normalize APY
        totalLiquidity / 10000000, // Normalize liquidity
        spread
      ];
    } catch (error) {
      logger.error(`Anomaly Detector: Error extracting features: ${error.message}`);
      
      // Return default features
      return [0.5, 0.4, 0.3, 0.5, 0.5, 1.0, 0.01];
    }
  }
  
  /**
   * Generate insights based on anomaly detection
   * @param {Object} marketData - Market data from Data Harvester
   * @param {number} anomalyScore - Anomaly score
   * @returns {Object} Insights
   * @private
   */
  _generateInsights(marketData, anomalyScore) {
    try {
      const volatility = marketData.volatility || {};
      const sentiment = marketData.sentiment || {};
      const amm = marketData.amm || { pools: [] };
      
      const recommendations = [];
      let message = '';
      
      // High volatility scenario
      if (volatility.shortTerm > this.config.volatilityThreshold) {
        message = 'High volatility detected - ETF Alert';
        
        // Add recommendations
        recommendations.push({
          action: 'REBALANCE',
          target: 'RLUSD',
          allocation: 0.7,
          reason: 'Volatility spike protection'
        });
        
        recommendations.push({
          action: 'REDUCE_EXPOSURE',
          pairs: ['XRP/BTC', 'XRP/EUR'],
          reason: 'High correlation during volatility'
        });
      }
      // High sentiment scenario
      else if (sentiment.overall > this.config.sentimentThreshold) {
        message = 'Positive sentiment spike detected';
        
        // Add recommendations
        recommendations.push({
          action: 'INCREASE_EXPOSURE',
          pairs: ['XRP/USD'],
          reason: 'Capitalize on positive sentiment'
        });
        
        // If eco-weighting is enabled
        if (this.config.ecoWeighting) {
          recommendations.push({
            action: 'WEIGHT_ECO_ASSETS',
            increase: true,
            reason: 'Align with green sentiment'
          });
        }
      }
      // Normal scenario
      else {
        message = 'Market conditions normal';
        
        // Add recommendations for optimal allocation
        if (amm.pools.length > 0) {
          const optimalDistribution = ammMath.optimizeLiquidityDistribution(
            amm.pools,
            10000000 // Example total liquidity
          );
          
          recommendations.push({
            action: 'OPTIMIZE_ALLOCATION',
            distribution: optimalDistribution.distribution,
            expectedAPY: optimalDistribution.expectedAPY,
            reason: 'Maximize yield in normal conditions'
          });
        }
      }
      
      return {
        message,
        recommendations,
        anomalyScore,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`Anomaly Detector: Error generating insights: ${error.message}`);
      
      // Return default insights
      return {
        message: 'Unable to generate insights',
        recommendations: [],
        anomalyScore,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Calculate dynamic allocation based on market conditions
   * @param {number} capital - Total capital to allocate
   * @param {Array<Object>} pools - Available liquidity pools
   * @param {Object} conditions - Market conditions
   * @returns {Promise<Object>} Allocation plan
   */
  async dynamicAllocate(capital, pools, conditions) {
    try {
      logger.info('Anomaly Detector: Calculating dynamic allocation');
      
      const { vol = 0.5 } = conditions;
      
      // Determine base allocation strategy based on volatility
      let stableAllocation = 0.4; // Default
      
      if (vol > this.config.volatilityThreshold) {
        // High volatility - allocate more to stablecoins
        stableAllocation = 0.7;
        logger.info('Anomaly Detector: High volatility detected, increasing stable allocation to 70%');
      } else if (vol < 0.3) {
        // Low volatility - reduce stablecoin allocation
        stableAllocation = 0.2;
        logger.info('Anomaly Detector: Low volatility detected, reducing stable allocation to 20%');
      }
      
      // Calculate allocations
      const stableAmount = capital * stableAllocation;
      const remainingAmount = capital - stableAmount;
      
      // Optimize remaining allocation across pools
      const optimalDistribution = ammMath.optimizeLiquidityDistribution(
        pools,
        remainingAmount
      );
      
      // Add stable allocation
      optimalDistribution.distribution['RLUSD'] = {
        amount: stableAmount,
        percentage: stableAllocation * 100
      };
      
      return {
        totalCapital: capital,
        stableAllocation: stableAllocation * 100,
        distribution: optimalDistribution.distribution,
        expectedAPY: optimalDistribution.expectedAPY * (1 - stableAllocation), // Adjust APY for stable allocation
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`Anomaly Detector: Error calculating dynamic allocation: ${error.message}`);
      
      // Return default allocation
      return {
        totalCapital: capital,
        stableAllocation: 50,
        distribution: {
          'RLUSD': {
            amount: capital * 0.5,
            percentage: 50
          },
          'XRP/USD': {
            amount: capital * 0.5,
            percentage: 50
          }
        },
        expectedAPY: 25,
        timestamp: Date.now()
      };
    }
  }
}

// Export a singleton instance
module.exports = new AnomalyDetector();
