/**
 * Enhanced NASDAQ-XRPL Fusion Strategy Tests
 * 
 * Tests the supercharged version of the NASDAQ-XRPL Fusion Strategy with:
 * 1. Live E-mini futures data integration
 * 2. AI-sentiment thresholding (boost to 0.8 for ETF hype)
 * 3. Green RWA Layer (eco-asset weighting +24%)
 */

const expect = require('expect');
const EnhancedNasdaqXrplFusionStrategy = require('../strategies/nasdaq-xrpl-fusion-enhanced');

describe('Enhanced NASDAQ-XRPL Fusion Strategy', () => {
  let strategy;
  let mockXrplClient;
  let mockNasdaqClient;
  let mockSentimentOracle;
  let mockHyperAdaptive;
  let mockCircuitBreaker;
  
  beforeEach(() => {
    // Create mocks
    mockXrplClient = {
      connect: jest.fn().mockResolvedValue(),
      getMarketData: jest.fn().mockResolvedValue({
        'XRP/USD': { lastPrice: 3.25, volume: 1500000 },
        'RLUSD/XRP': { lastPrice: 0.31, volume: 750000 }
      }),
      increasePosition: jest.fn().mockResolvedValue({ success: true }),
      decreasePosition: jest.fn().mockResolvedValue({ success: true })
    };
    
    mockNasdaqClient = {
      connect: jest.fn().mockResolvedValue(),
      getCurrentMarketData: jest.fn().mockResolvedValue({
        price: 23000,
        volume: 15000,
        volatility: 0.1738
      }),
      increasePosition: jest.fn().mockResolvedValue({ success: true }),
      decreasePosition: jest.fn().mockResolvedValue({ success: true }),
      setLeverage: jest.fn().mockResolvedValue({ success: true }),
      on: jest.fn(),
      subscribeToLiveData: jest.fn().mockResolvedValue({
        on: jest.fn()
      }),
      subscribeToEtfFlows: jest.fn().mockResolvedValue({
        on: jest.fn()
      }),
      subscribeToSectorData: jest.fn().mockResolvedValue({
        on: jest.fn()
      }),
      subscribeToRwaMetrics: jest.fn().mockResolvedValue()
    };
    
    mockSentimentOracle = {
      initialize: jest.fn().mockResolvedValue(),
      getLatestSentiment: jest.fn().mockResolvedValue({
        aggregateScore: 0.85,
        sources: {
          twitter: 0.9,
          reddit: 0.8,
          news: 0.85
        }
      }),
      on: jest.fn(),
      loadEnhancedModel: jest.fn().mockResolvedValue({
        on: jest.fn()
      })
    };
    
    mockHyperAdaptive = {
      initialize: jest.fn().mockResolvedValue(),
      optimizeAllocation: jest.fn().mockResolvedValue({
        success: true,
        allocation: {
          nasdaq: 0.4,
          xrpl: 0.6
        }
      }),
      optimizeParameters: jest.fn().mockResolvedValue({
        success: true,
        parameters: {
          leverageMultiplier: 2.5,
          sentimentThreshold: 0.8,
          nasdaqDipThreshold: 0.0008,
          xrplAllocationOnDip: 0.75,
          rlusdPairWeight: 0.65
        },
        expectedImprovement: 0.2
      }),
      on: jest.fn()
    };
    
    mockCircuitBreaker = {
      checkThresholds: jest.fn().mockResolvedValue({ triggered: false })
    };
    
    // Initialize strategy
    strategy = new EnhancedNasdaqXrplFusionStrategy({
      xrplClient: mockXrplClient,
      nasdaqClient: mockNasdaqClient,
      sentimentOracle: mockSentimentOracle,
      hyperAdaptive: mockHyperAdaptive,
      circuitBreaker: mockCircuitBreaker
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Enhanced Initialization', () => {
    it('should initialize with enhanced components', async () => {
      const initSpy = jest.spyOn(strategy, 'emit');
      
      await strategy.initialize();
      
      expect(mockXrplClient.connect).toHaveBeenCalledTimes(1);
      expect(mockNasdaqClient.connect).toHaveBeenCalledTimes(1);
      expect(mockSentimentOracle.initialize).toHaveBeenCalledTimes(1);
      expect(mockHyperAdaptive.initialize).toHaveBeenCalledTimes(1);
      
      // Enhanced components
      expect(mockNasdaqClient.subscribeToLiveData).toHaveBeenCalledTimes(1);
      expect(mockNasdaqClient.subscribeToEtfFlows).toHaveBeenCalledTimes(1);
      expect(mockNasdaqClient.subscribeToSectorData).toHaveBeenCalledTimes(1);
      expect(mockSentimentOracle.loadEnhancedModel).toHaveBeenCalledTimes(3);
      
      expect(initSpy).toHaveBeenCalledWith('enhanced-initialized');
    });
  });
  
  describe('Live E-mini Data Integration', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up E-mini data
      strategy.state.latestEminiData = {
        lastPrice: 5300,
        previousClose: 5250,
        volume: 150000,
        timestamp: Date.now(),
        orderBook: {
          bids: [
            { price: 5299, volume: 50 },
            { price: 5298, volume: 75 }
          ],
          asks: [
            { price: 5301, volume: 40 },
            { price: 5302, volume: 60 }
          ]
        }
      };
    });
    
    it('should detect E-mini price changes correctly', () => {
      const priceChange = strategy.calculateEminiPriceChange(strategy.state.latestEminiData);
      
      expect(priceChange).toBeCloseTo(0.0095, 0.0001); // ~0.95% increase
    });
    
    it('should adjust allocation based on E-mini data', () => {
      const baseAllocation = {
        nasdaq: 0.5,
        xrpl: 0.5
      };
      
      const adjusted = strategy.adjustAllocationForEminiData(baseAllocation, strategy.state.latestEminiData);
      
      // Should reduce XRPL allocation on market rise
      expect(adjusted.xrpl).toBeLessThan(baseAllocation.xrpl);
      expect(adjusted.nasdaq).toBeGreaterThan(baseAllocation.nasdaq);
      expect(adjusted.nasdaq + adjusted.xrpl).toBeCloseTo(1.0, 0.0001);
    });
    
    it('should consider order book imbalance in allocation', () => {
      // Create imbalanced order book (strong buying pressure)
      const imbalancedData = {
        ...strategy.state.latestEminiData,
        orderBook: {
          bids: [
            { price: 5299, volume: 200 },
            { price: 5298, volume: 150 }
          ],
          asks: [
            { price: 5301, volume: 40 },
            { price: 5302, volume: 60 }
          ]
        }
      };
      
      const baseAllocation = {
        nasdaq: 0.5,
        xrpl: 0.5
      };
      
      const adjusted = strategy.adjustAllocationForEminiData(baseAllocation, imbalancedData);
      
      // Should increase NASDAQ allocation on strong buying pressure
      expect(adjusted.nasdaq).toBeGreaterThan(baseAllocation.nasdaq);
    });
  });
  
  describe('ETF Flow Processing', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up ETF flow data
      strategy.state.latestEtfFlowData = {
        timestamp: Date.now(),
        flows: {
          'SPY': { netFlow: 250000000, aum: 5000000000 },
          'QQQ': { netFlow: 150000000, aum: 3000000000 },
          'XRPL': { netFlow: 75000000, aum: 1000000000 },
          'CRYPTO': { netFlow: 100000000, aum: 2000000000 }
        }
      };
    });
    
    it('should detect significant ETF flows', () => {
      const significantFlows = strategy.detectSignificantEtfFlows(strategy.state.latestEtfFlowData);
      
      expect(significantFlows.length).toBeGreaterThan(0);
      expect(significantFlows.some(flow => flow.symbol === 'XRPL')).toBeTruthy();
      expect(significantFlows.some(flow => flow.direction === 'inflow')).toBeTruthy();
    });
    
    it('should adjust allocation based on ETF flows', () => {
      const baseAllocation = {
        nasdaq: 0.6,
        xrpl: 0.4
      };
      
      const adjusted = strategy.adjustAllocationForEtfFlows(baseAllocation, strategy.state.latestEtfFlowData);
      
      // Should increase XRPL allocation on strong crypto inflows
      expect(adjusted.xrpl).toBeGreaterThan(baseAllocation.xrpl);
      expect(adjusted.nasdaq).toBeLessThan(baseAllocation.nasdaq);
    });
  });
  
  describe('Green RWA Layer', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up eco-asset data
      strategy.state.latestEcoAssetData = {
        timestamp: Date.now(),
        assets: {
          'SOLAR': {
            price: 45.75,
            allocation: 0.2,
            priceChange24h: 0.03,
            volumeChange24h: 0.15,
            sentimentScore: 0.75
          },
          'WIND': {
            price: 32.50,
            allocation: 0.15,
            priceChange24h: 0.02,
            volumeChange24h: 0.10,
            sentimentScore: 0.7
          },
          'CARBON_CREDITS': {
            price: 28.25,
            allocation: 0.1,
            priceChange24h: 0.04,
            volumeChange24h: 0.2,
            sentimentScore: 0.8
          }
        }
      };
    });
    
    it('should initialize Green RWA weights correctly', () => {
      expect(strategy.state.greenRwaWeights.get('SOLAR')).toBe(1.24); // 24% boost
      expect(strategy.state.greenRwaWeights.get('WIND')).toBe(1.22); // 22% boost
      expect(strategy.state.greenRwaWeights.get('CARBON_CREDITS')).toBe(1.20); // 20% boost
    });
    
    it('should detect eco-asset opportunities', () => {
      const opportunities = strategy.detectEcoAssetOpportunities(strategy.state.latestEcoAssetData);
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities.some(opp => opp.asset === 'CARBON_CREDITS')).toBeTruthy();
    });
    
    it('should apply Green RWA weights to allocation', () => {
      const baseAllocation = {
        nasdaq: 0.6,
        xrpl: 0.4
      };
      
      const weighted = strategy.applyGreenRwaWeights(baseAllocation, {});
      
      // Should increase XRPL allocation due to eco premium
      expect(weighted.xrpl).toBeGreaterThan(baseAllocation.xrpl);
      expect(weighted.nasdaq).toBeLessThan(baseAllocation.nasdaq);
    });
    
    it('should update RWA exposure correctly', () => {
      strategy.updateRwaExposure(strategy.state.latestEcoAssetData);
      
      expect(strategy.state.rwaExposure.total).toBeGreaterThan(0);
      expect(strategy.state.rwaExposure.byAsset.size).toBe(3);
      expect(strategy.state.rwaExposure.byAsset.get('SOLAR').weight).toBe(1.24);
    });
  });
  
  describe('AI Sentiment Thresholding', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should process ETF hype signals', () => {
      const emitSpy = jest.spyOn(strategy, 'emit');
      const executeSpy = jest.fn(strategy.executeStrategy).mockResolvedValue();
      
      const signal = {
        score: 0.85,
        keywords: ['#NasdaqETF2025', '#XRPLyield'],
        timestamp: Date.now()
      };
      
      strategy.processEtfHypeSignal(signal);
      
      expect(emitSpy).toHaveBeenCalledWith('etf-hype-detected');
      expect(strategy.options.sentimentThreshold).toBeCloseTo(0.775, 0.001);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should not process weak ETF hype signals', () => {
      const emitSpy = jest.spyOn(strategy, 'emit');
      const executeSpy = jest.fn(strategy.executeStrategy).mockResolvedValue();
      
      const signal = {
        score: 0.65, // Below threshold
        keywords: ['#NasdaqETF2025', '#XRPLyield'],
        timestamp: Date.now()
      };
      
      strategy.processEtfHypeSignal(signal);
      
      expect(emitSpy).toHaveBeenCalledWith('etf-hype-detected');
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Enhanced Yield Calculation', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up eco-asset data
      strategy.state.latestEcoAssetData = {
        timestamp: Date.now(),
        assets: {
          'SOLAR': {
            price: 45.75,
            allocation: 0.2,
            priceChange24h: 0.03,
            volumeChange24h: 0.15,
            sentimentScore: 0.75
          },
          'WIND': {
            price: 32.50,
            allocation: 0.15,
            priceChange24h: 0.02,
            volumeChange24h: 0.10,
            sentimentScore: 0.7
          }
        }
      };
    });
    
    it('should calculate enhanced yield with premiums', () => {
      const allocation = {
        nasdaq: 0.4,
        xrpl: 0.6
      };
      
      const enhancedYield = strategy.calculateEnhancedYield(allocation);
      
      expect(enhancedYield.expectedAnnualYield).toBeGreaterThan(0);
      expect(enhancedYield.enhancements).toHaveProperty('liveDataPremium');
      expect(enhancedYield.enhancements).toHaveProperty('aiSentimentPremium');
      expect(enhancedYield.enhancements).toHaveProperty('greenRwaPremium');
      expect(enhancedYield.totalPremium).toBeGreaterThan(0);
    });
    
    it('should show higher yield with all enhancements active', () => {
      // Set high sentiment threshold
      strategy.options.sentimentThreshold = 0.85;
      
      const allocation = {
        nasdaq: 0.3,
        xrpl: 0.7
      };
      
      const enhancedYield = strategy.calculateEnhancedYield(allocation);
      const baseYield = 0.25; // Mock base yield instead of super
      
      expect(enhancedYield.expectedAnnualYield).toBeGreaterThan(baseYield);
      expect(enhancedYield.sharpeRatio).toBeGreaterThan(1.5);
    });
  });
  
  describe('Enhanced Strategy Execution', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up necessary state
      strategy.state.latestEminiData = {
        lastPrice: 5300,
        previousClose: 5350, // 0.93% dip
        volume: 150000
      };
      
      strategy.state.latestEtfFlowData = {
        flows: {
          'XRPL': { netFlow: 75000000, aum: 1000000000 }
        }
      };
      
      strategy.state.latestEcoAssetData = {
        assets: {
          'SOLAR': {
            price: 45.75,
            allocation: 0.2
          }
        }
      };
    });
    
    it('should execute enhanced strategy with all data sources', async () => {
      // Mock the base executeStrategy method
      const superExecuteStub = jest.spyOn(Object.getPrototypeOf(EnhancedNasdaqXrplFusionStrategy.prototype), 'executeStrategy').mockResolvedValue({
        action: 'rebalanced',
        allocation: {
          nasdaq: 0.4,
          xrpl: 0.6
        }
      });
      
      const result = await strategy.executeStrategy();
      
      expect(result.action).toBe('rebalanced');
      expect(result).toHaveProperty('expectedYield');
      expect(result).toHaveProperty('enhancements');
      expect(result.enhancements.liveEminiData).toBeTruthy();
      expect(result.enhancements.etfFlowData).toBeTruthy();
      expect(result.enhancements.ecoAssetData).toBeTruthy();
      
      superExecuteStub.mockRestore();
    });
  });
  
  describe('Enhanced Statistics and Reporting', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Set up necessary state
      strategy.state.currentAllocation = {
        nasdaq: 0.4,
        xrpl: 0.6
      };
      
      strategy.state.latestEminiData = {
        lastPrice: 5300,
        previousClose: 5250,
        volume: 150000
      };
      
      strategy.state.latestEcoAssetData = {
        assets: {
          'SOLAR': {
            price: 45.75,
            allocation: 0.2
          }
        }
      };
      
      strategy.state.rwaExposure = {
        total: 9.15,
        byAsset: new Map([
          ['SOLAR', { exposure: 9.15, weight: 1.24 }]
        ]),
        lastUpdated: Date.now()
      };
    });
    
    it('should provide comprehensive enhanced statistics', () => {
      // Mock the base getStats method
      const superGetStatsStub = jest.spyOn(Object.getPrototypeOf(EnhancedNasdaqXrplFusionStrategy.prototype), 'getStats').mockReturnValue({
        currentAllocation: strategy.state.currentAllocation,
        actualYield: 0.25,
        expectedYield: 0.30
      });
      
      const stats = strategy.getStats();
      
      expect(stats).toHaveProperty('enhancedYield');
      expect(stats).toHaveProperty('greenRwaExposure');
      expect(stats).toHaveProperty('liveDataFeeds');
      expect(stats).toHaveProperty('aiSentimentModels');
      expect(stats).toHaveProperty('optimizedParameters');
      
      expect(stats.greenRwaExposure.total).toBe(9.15);
      expect(stats.liveDataFeeds.emini).toBeTruthy();
      expect(stats.liveDataFeeds.ecoAssets).toBeTruthy();
      
      superGetStatsStub.mockRestore();
    });
  });
  
  describe('Integration Simulation', () => {
    it('should simulate enhanced strategy performance', async () => {
      // This test simulates a full run of the enhanced strategy
      // with realistic market conditions from July 16, 2025
      
      // Set up realistic market data
      const nasdaqData = {
        price: 23000, // Current price
        previousClose: 23042, // 0.18% dip today
        volume: 15000000,
        volatility: 0.1738
      };
      
      const xrplData = {
        'XRP/USD': { lastPrice: 3.25, volume: 1500000 },
        'RLUSD/XRP': { lastPrice: 0.31, volume: 750000 }
      };
      
      const sentimentData = {
        aggregateScore: 0.85, // Strong ETF hype
        sources: {
          twitter: 0.9,
          reddit: 0.8,
          news: 0.85
        }
      };
      
      // Set up E-mini data
      strategy.state.latestEminiData = {
        lastPrice: 5300,
        previousClose: 5310, // 0.19% dip (similar to NASDAQ)
        volume: 150000,
        orderBook: {
          bids: [
            { price: 5299, volume: 50 },
            { price: 5298, volume: 75 }
          ],
          asks: [
            { price: 5301, volume: 40 },
            { price: 5302, volume: 60 }
          ]
        }
      };
      
      // Set up ETF flow data
      strategy.state.latestEtfFlowData = {
        flows: {
          'SPY': { netFlow: 250000000, aum: 5000000000 },
          'QQQ': { netFlow: 150000000, aum: 3000000000 },
          'XRPL': { netFlow: 75000000, aum: 1000000000 },
          'CRYPTO': { netFlow: 100000000, aum: 2000000000 }
        }
      };
      
      // Set up eco-asset data
      strategy.state.latestEcoAssetData = {
        assets: {
          'SOLAR': {
            price: 45.75,
            allocation: 0.2,
            priceChange24h: 0.03,
            volumeChange24h: 0.15,
            sentimentScore: 0.75
          },
          'WIND': {
            price: 32.50,
            allocation: 0.15,
            priceChange24h: 0.02,
            volumeChange24h: 0.10,
            sentimentScore: 0.7
          },
          'CARBON_CREDITS': {
            price: 28.25,
            allocation: 0.1,
            priceChange24h: 0.04,
            volumeChange24h: 0.2,
            sentimentScore: 0.8
          }
        }
      };
      
      // Initialize strategy
      await strategy.initialize();
      
      // Calculate optimal allocation
      const allocation = await strategy.calculateOptimalAllocation(
        nasdaqData,
        xrplData,
        sentimentData
      );
      
      // Calculate enhanced yield
      const enhancedYield = strategy.calculateEnhancedYield(allocation);
      
      // Verify results
      expect(allocation.xrpl).toBeGreaterThan(0.5); // XRPL allocation should be high due to dip + sentiment
      expect(enhancedYield.expectedAnnualYield).toBeGreaterThan(0.3); // Should exceed 30%
      expect(enhancedYield.sharpeRatio).toBeGreaterThan(1.5); // Should have good risk-adjusted return
      
      // Verify enhancement premiums
      expect(enhancedYield.enhancements.liveDataPremium).toBe(0.05); // 5% premium
      expect(enhancedYield.enhancements.aiSentimentPremium).toBeGreaterThan(0.05); // High due to strong sentiment
      expect(enhancedYield.enhancements.greenRwaPremium).toBeGreaterThan(0); // Positive due to eco-assets
      
      // Total premium should be significant
      expect(enhancedYield.totalPremium).toBeGreaterThan(0.15); // At least 15% premium
    });
  });
});
