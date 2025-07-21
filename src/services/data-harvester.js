/**
 * Data Harvester Service
 * 
 * Pulls live XRPL testnet data and enriches it with sentiment analysis
 * Includes Redis caching for performance optimization and mock fallback
 */

const xrpl = require('xrpl');
const logger = require('../utils/logger');
const marketData = require('./market-data');

// Redis client setup - would need to be installed with: npm i redis
// For now, we'll simulate Redis with an in-memory cache
const redisCache = {
  data: {},
  set: function(key, value, expType, expValue) {
    this.data[key] = {
      value: value,
      expiry: expType === 'EX' ? Date.now() + (expValue * 1000) : null
    };
    return Promise.resolve(true);
  },
  get: function(key) {
    const item = this.data[key];
    if (!item) return Promise.resolve(null);
    if (item.expiry && item.expiry < Date.now()) {
      delete this.data[key];
      return Promise.resolve(null);
    }
    return Promise.resolve(item.value);
  }
};

class DataHarvester {
  constructor(config = {}) {
    this.config = {
      xrplTestnetUrl: config.xrplTestnetUrl || 'wss://s.altnet.rippletest.net:51233',
      cacheExpiry: config.cacheExpiry || 60, // 60 seconds
      sentimentSources: config.sentimentSources || ['#XRPL', '#XRP', '#XRPL2025', 'ETF'],
      ...config
    };
    
    this.xrplClient = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the data harvester
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('Data Harvester: Initializing service');
      
      // Create XRPL client
      this.xrplClient = new xrpl.Client(this.config.xrplTestnetUrl);
      
      // Initialize market data service as fallback
      await marketData.initialize();
      
      this.initialized = true;
      
      logger.info('Data Harvester: Initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Data Harvester: Initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Harvest live data from XRPL testnet
   * @param {string|number} ledgerIndex - Ledger index to fetch (default: 'validated')
   * @returns {Promise<Object>} Harvested data
   */
  async harvestLiveData(ledgerIndex = 'validated') {
    try {
      logger.info(`Data Harvester: Harvesting live data for ledger ${ledgerIndex}`);
      
      // Check cache first
      const cacheKey = `live_data_${ledgerIndex}`;
      const cachedData = await redisCache.get(cacheKey);
      
      if (cachedData) {
        logger.info('Data Harvester: Using cached data');
        return JSON.parse(cachedData);
      }
      
      // Connect to XRPL
      if (!this.xrplClient.isConnected()) {
        await this.xrplClient.connect();
      }
      
      // Fetch ledger data
      const ledgerResponse = await this.xrplClient.request({
        command: 'ledger',
        ledger_index: ledgerIndex,
        transactions: true,
        expand: true
      });
      
      if (!ledgerResponse.result || !ledgerResponse.result.ledger) {
        throw new Error('Invalid ledger response');
      }
      
      const ledger = ledgerResponse.result.ledger;
      
      // Calculate volatility metrics
      const volatilityMetrics = this._calculateVolatilityMetrics(ledger);
      
      // Fetch sentiment data
      const sentimentData = await this._fetchSentimentData();
      
      // Fetch AMM data
      const ammData = await this._fetchAMMData();
      
      // Fetch order book data for key pairs
      const orderBookData = await this._fetchOrderBookData();
      
      // Combine all data
      const harvestedData = {
        timestamp: Date.now(),
        ledgerIndex: ledger.ledger_index,
        ledgerHash: ledger.hash,
        closeTime: ledger.close_time,
        volatility: volatilityMetrics,
        sentiment: sentimentData,
        amm: ammData,
        orderBooks: orderBookData
      };
      
      // Cache the result
      await redisCache.set(cacheKey, JSON.stringify(harvestedData), 'EX', this.config.cacheExpiry);
      
      logger.info(`Data Harvester: Successfully harvested data for ledger ${ledgerIndex}`);
      return harvestedData;
    } catch (error) {
      logger.error(`Data Harvester: Failed to harvest live data: ${error.message}`);
      
      // Fall back to cached or mock data
      return this.getCachedOrMockData();
    } finally {
      // Disconnect from XRPL if connected
      if (this.xrplClient && this.xrplClient.isConnected()) {
        await this.xrplClient.disconnect();
      }
    }
  }
  
  /**
   * Get cached data or generate mock data as fallback
   * @returns {Promise<Object>} Cached or mock data
   */
  async getCachedOrMockData() {
    try {
      logger.info('Data Harvester: Attempting to retrieve cached data');
      
      // Try to get any cached data first
      const cachedData = await redisCache.get('live_data_any');
      
      if (cachedData) {
        logger.info('Data Harvester: Using cached fallback data');
        return JSON.parse(cachedData);
      }
      
      // Generate mock data
      logger.info('Data Harvester: Generating mock data');
      
      const mockData = {
        timestamp: Date.now(),
        ledgerIndex: 1000000 + Math.floor(Math.random() * 10000),
        ledgerHash: 'MOCK_HASH_' + Date.now().toString(16),
        closeTime: Math.floor(Date.now() / 1000),
        volatility: {
          shortTerm: 0.96, // High volatility for testing
          mediumTerm: 0.85,
          longTerm: 0.65,
          anomalyScore: 0.9,
          trend: 'increasing'
        },
        sentiment: {
          overall: 0.7, // Positive sentiment
          sources: {
            '#XRPL': 0.75,
            '#XRP': 0.8,
            '#XRPL2025': 0.9,
            'ETF': 0.65
          },
          trending: ['ETF approval', 'liquidity', 'eco-friendly'],
          volume: 'high'
        },
        amm: {
          pools: [
            {
              id: 'XRP/USD',
              liquidity: 10000000,
              volume24h: 5000000,
              apy: 58.5,
              volatility: 0.85
            },
            {
              id: 'XRP/EUR',
              liquidity: 8000000,
              volume24h: 3500000,
              apy: 42.3,
              volatility: 0.75
            }
          ]
        },
        orderBooks: {
          'XRP/USD': {
            bids: Array(10).fill().map((_, i) => ({
              price: 1.0 - (i * 0.01),
              amount: 10000 + Math.random() * 50000
            })),
            asks: Array(10).fill().map((_, i) => ({
              price: 1.0 + (i * 0.01),
              amount: 10000 + Math.random() * 50000
            }))
          }
        }
      };
      
      // Cache this mock data
      await redisCache.set('live_data_any', JSON.stringify(mockData), 'EX', this.config.cacheExpiry * 2);
      
      return mockData;
    } catch (error) {
      logger.error(`Data Harvester: Failed to get cached or mock data: ${error.message}`);
      
      // Return minimal mock data
      return {
        timestamp: Date.now(),
        volatility: { shortTerm: 0.96 },
        sentiment: { overall: 0.7 }
      };
    }
  }
  
  /**
   * Calculate volatility metrics from ledger data
   * @param {Object} ledger - Ledger data
   * @returns {Object} Volatility metrics
   * @private
   */
  _calculateVolatilityMetrics(ledger) {
    try {
      // Extract transactions
      const transactions = ledger.transactions || [];
      
      // Filter for relevant transaction types
      const relevantTxs = transactions.filter(tx => 
        ['Payment', 'OfferCreate', 'OfferCancel', 'AMMDeposit', 'AMMWithdraw'].includes(tx.TransactionType)
      );
      
      // Calculate metrics
      const txCount = relevantTxs.length;
      const offerCreateCount = relevantTxs.filter(tx => tx.TransactionType === 'OfferCreate').length;
      const offerCancelCount = relevantTxs.filter(tx => tx.TransactionType === 'OfferCancel').length;
      const paymentCount = relevantTxs.filter(tx => tx.TransactionType === 'Payment').length;
      
      // Calculate volatility score (simplified)
      const baseVolatility = txCount > 0 ? offerCancelCount / txCount : 0;
      const activityLevel = Math.min(1, txCount / 100); // Normalize
      
      // Combine metrics
      const shortTermVol = Math.min(0.99, baseVolatility + (activityLevel * 0.5));
      const mediumTermVol = shortTermVol * 0.9;
      const longTermVol = shortTermVol * 0.7;
      
      // Detect anomalies
      const anomalyScore = offerCancelCount > offerCreateCount ? 0.8 : 0.3;
      
      return {
        shortTerm: shortTermVol,
        mediumTerm: mediumTermVol,
        longTerm: longTermVol,
        anomalyScore: anomalyScore,
        trend: anomalyScore > 0.5 ? 'increasing' : 'stable',
        metrics: {
          transactionCount: txCount,
          offerCreateCount,
          offerCancelCount,
          paymentCount,
          offerCancelRatio: offerCancelCount / (offerCreateCount || 1)
        }
      };
    } catch (error) {
      logger.error(`Data Harvester: Error calculating volatility metrics: ${error.message}`);
      
      // Return default metrics
      return {
        shortTerm: 0.5,
        mediumTerm: 0.4,
        longTerm: 0.3,
        anomalyScore: 0.2,
        trend: 'stable'
      };
    }
  }
  
  /**
   * Fetch sentiment data from various sources
   * @returns {Promise<Object>} Sentiment data
   * @private
   */
  async _fetchSentimentData() {
    try {
      logger.info('Data Harvester: Fetching sentiment data');
      
      // In a real implementation, this would call an external API
      // For now, we'll simulate sentiment analysis
      
      const sources = this.config.sentimentSources;
      const sentimentScores = {};
      let overallSentiment = 0;
      
      for (const source of sources) {
        // Simulate sentiment score (0.0-1.0)
        const score = 0.5 + (Math.random() * 0.5); // Biased positive for testing
        sentimentScores[source] = score;
        overallSentiment += score;
      }
      
      overallSentiment /= sources.length;
      
      // Generate trending topics
      const trendingTopics = [
        'ETF approval',
        'liquidity',
        'eco-friendly',
        'XRPL2025',
        'green blockchain'
      ].sort(() => Math.random() - 0.5).slice(0, 3);
      
      return {
        overall: overallSentiment,
        sources: sentimentScores,
        trending: trendingTopics,
        volume: overallSentiment > 0.7 ? 'high' : 'moderate'
      };
    } catch (error) {
      logger.error(`Data Harvester: Error fetching sentiment data: ${error.message}`);
      
      // Return default sentiment
      return {
        overall: 0.6,
        sources: this.config.sentimentSources.reduce((acc, source) => {
          acc[source] = 0.6;
          return acc;
        }, {}),
        trending: ['XRPL'],
        volume: 'moderate'
      };
    }
  }
  
  /**
   * Fetch AMM data from XRPL
   * @returns {Promise<Object>} AMM data
   * @private
   */
  async _fetchAMMData() {
    try {
      logger.info('Data Harvester: Fetching AMM data');
      
      // In a real implementation, this would use the amm_info command
      // For now, we'll generate mock AMM data
      
      const pools = [
        {
          id: 'XRP/USD',
          liquidity: 10000000 + (Math.random() * 2000000 - 1000000),
          volume24h: 5000000 + (Math.random() * 1000000 - 500000),
          apy: 50 + (Math.random() * 20 - 10),
          volatility: 0.7 + (Math.random() * 0.3)
        },
        {
          id: 'XRP/EUR',
          liquidity: 8000000 + (Math.random() * 1600000 - 800000),
          volume24h: 3500000 + (Math.random() * 700000 - 350000),
          apy: 40 + (Math.random() * 15 - 7.5),
          volatility: 0.6 + (Math.random() * 0.3)
        },
        {
          id: 'XRP/BTC',
          liquidity: 5000000 + (Math.random() * 1000000 - 500000),
          volume24h: 2000000 + (Math.random() * 400000 - 200000),
          apy: 60 + (Math.random() * 25 - 12.5),
          volatility: 0.8 + (Math.random() * 0.2)
        }
      ];
      
      return { pools };
    } catch (error) {
      logger.error(`Data Harvester: Error fetching AMM data: ${error.message}`);
      
      // Return default AMM data
      return {
        pools: [
          {
            id: 'XRP/USD',
            liquidity: 10000000,
            volume24h: 5000000,
            apy: 50,
            volatility: 0.7
          }
        ]
      };
    }
  }
  
  /**
   * Fetch order book data for key pairs
   * @returns {Promise<Object>} Order book data
   * @private
   */
  async _fetchOrderBookData() {
    try {
      logger.info('Data Harvester: Fetching order book data');
      
      // In a real implementation, this would use the book_offers command
      // For now, we'll generate mock order book data
      
      const pairs = ['XRP/USD', 'XRP/EUR', 'XRP/BTC'];
      const orderBooks = {};
      
      for (const pair of pairs) {
        const basePrice = pair === 'XRP/USD' ? 1.0 : (pair === 'XRP/EUR' ? 0.9 : 0.00002);
        
        // Generate bids (buy orders)
        const bids = Array(10).fill().map((_, i) => ({
          price: basePrice * (1 - (i * 0.01)),
          amount: 10000 + Math.random() * 50000
        }));
        
        // Generate asks (sell orders)
        const asks = Array(10).fill().map((_, i) => ({
          price: basePrice * (1 + (i * 0.01)),
          amount: 10000 + Math.random() * 50000
        }));
        
        orderBooks[pair] = { bids, asks };
      }
      
      return orderBooks;
    } catch (error) {
      logger.error(`Data Harvester: Error fetching order book data: ${error.message}`);
      
      // Return default order book data
      return {
        'XRP/USD': {
          bids: [{ price: 0.99, amount: 10000 }],
          asks: [{ price: 1.01, amount: 10000 }]
        }
      };
    }
  }
  
  /**
   * Stop the data harvester
   * @returns {Promise<boolean>} Whether stop was successful
   */
  async stop() {
    try {
      logger.info('Data Harvester: Stopping service');
      
      // Disconnect from XRPL if connected
      if (this.xrplClient && this.xrplClient.isConnected()) {
        await this.xrplClient.disconnect();
      }
      
      this.initialized = false;
      
      logger.info('Data Harvester: Stopped successfully');
      return true;
    } catch (error) {
      logger.error(`Data Harvester: Stop failed: ${error.message}`);
      return false;
    }
  }
}

// Export a singleton instance
module.exports = new DataHarvester();
