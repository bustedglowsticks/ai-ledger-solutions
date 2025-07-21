/**
 * Market Data Service
 * 
 * Provides market data for XRPL assets
 * Used as a fallback when live data is unavailable
 */

const logger = require('../utils/logger');

class MarketData {
  constructor() {
    this.initialized = false;
    this.lastUpdate = null;
    this.mockData = null;
  }

  /**
   * Initialize the market data service
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('Market Data: Initializing service');
      
      // Generate initial mock data
      this.mockData = this._generateMockData();
      this.lastUpdate = Date.now();
      this.initialized = true;
      
      logger.info('Market Data: Initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Market Data: Initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get latest market data
   * @returns {Promise<Object>} Market data
   */
  async getMarketData() {
    try {
      // Refresh mock data if older than 5 minutes
      if (!this.lastUpdate || Date.now() - this.lastUpdate > 300000) {
        this.mockData = this._generateMockData();
        this.lastUpdate = Date.now();
      }
      
      return this.mockData;
    } catch (error) {
      logger.error(`Market Data: Error getting market data: ${error.message}`);
      return this._generateMockData(); // Fallback to fresh mock data
    }
  }

  /**
   * Generate mock market data
   * @returns {Object} Mock market data
   * @private
   */
  _generateMockData() {
    const xrpPrice = 3.44 + (Math.random() * 0.2 - 0.1); // Around $3.44
    
    return {
      timestamp: Date.now(),
      prices: {
        'XRP/USD': xrpPrice,
        'XRP/EUR': xrpPrice * 0.92,
        'XRP/BTC': xrpPrice * 0.000023
      },
      volumes: {
        'XRP/USD': 1200000000 + (Math.random() * 200000000),
        'XRP/EUR': 800000000 + (Math.random() * 150000000),
        'XRP/BTC': 500000000 + (Math.random() * 100000000)
      },
      marketCap: {
        'XRP': 172000000000 + (Math.random() * 5000000000)
      },
      trends: {
        'XRP': Math.random() > 0.6 ? 'up' : 'down',
        'crypto': Math.random() > 0.5 ? 'up' : 'down'
      }
    };
  }
}

// Export a singleton instance
module.exports = new MarketData();
