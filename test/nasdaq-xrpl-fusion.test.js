/**
 * NASDAQ-XRPL Fusion Strategy Tests
 * 
 * Tests the hybrid strategy that combines NASDAQ futures trading with XRPL liquidity provision
 * to maximize yield through cross-market arbitrage and hedging.
 * 
 * Validates:
 * - Strategy initialization and configuration
 * - Market condition detection (dips, sentiment triggers)
 * - Rebalancing logic and execution
 * - Leverage application based on sentiment
 * - Yield calculation and optimization
 */

const expect = require('expect');
const sinon = require('sinon');
const NasdaqXrplFusionStrategy = require('../strategies/nasdaq-xrpl-fusion');

describe('NASDAQ-XRPL Fusion Strategy', () => {
  let strategy;
  let mockXrplClient;
  let mockNasdaqClient;
  let mockSentimentOracle;
  let mockHyperAdaptive;
  let mockCircuitBreaker;
  
  beforeEach(() => {
    // Create mocks
    mockXrplClient = {
      connect: sinon.stub().resolves(),
      getMarketData: sinon.stub().resolves({
        'XRP/USD': { lastPrice: 3.25, volume: 1500000 },
        'RLUSD/XRP': { lastPrice: 0.31, volume: 750000 }
      }),
      increasePosition: sinon.stub().resolves({ success: true }),
      decreasePosition: sinon.stub().resolves({ success: true })
    };
    
    mockNasdaqClient = {
      connect: sinon.stub().resolves(),
      getCurrentMarketData: sinon.stub().resolves({
        price: 23000,
        volume: 15000,
        volatility: 0.1738
      }),
      increasePosition: sinon.stub().resolves({ success: true }),
      decreasePosition: sinon.stub().resolves({ success: true }),
      setLeverage: sinon.stub().resolves({ success: true }),
      on: sinon.stub()
    };
    
    mockSentimentOracle = {
      initialize: sinon.stub().resolves(),
      getLatestSentiment: sinon.stub().resolves({
        aggregateScore: 0.65,
        sources: {
          twitter: 0.7,
          reddit: 0.6,
          news: 0.65
        }
      }),
      on: sinon.stub()
    };
    
    mockHyperAdaptive = {
      initialize: sinon.stub().resolves(),
      optimizeAllocation: sinon.stub().resolves({
        success: true,
        allocation: {
          nasdaq: 0.6,
          xrpl: 0.4
        }
      }),
      optimizeParameters: sinon.stub().resolves({
        success: true,
        parameters: {
          leverageMultiplier: 2.2,
          sentimentThreshold: 0.65,
          nasdaqDipThreshold: 0.0012,
          xrplAllocationOnDip: 0.75,
          rlusdPairWeight: 0.65
        },
        expectedImprovement: 0.15
      }),
      on: sinon.stub()
    };
    
    mockCircuitBreaker = {
      checkThresholds: sinon.stub().resolves({ triggered: false })
    };
    
    // Initialize strategy
    strategy = new NasdaqXrplFusionStrategy({
      xrplClient: mockXrplClient,
      nasdaqClient: mockNasdaqClient,
      sentimentOracle: mockSentimentOracle,
      hyperAdaptive: mockHyperAdaptive,
      circuitBreaker: mockCircuitBreaker
    });
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initSpy = sinon.spy(strategy, 'emit');
      
      await strategy.initialize();
      
      expect(mockXrplClient.connect.calledOnce).to.be.true;
      expect(mockNasdaqClient.connect.calledOnce).to.be.true;
      expect(mockSentimentOracle.initialize.calledOnce).to.be.true;
      expect(mockHyperAdaptive.initialize.calledOnce).to.be.true;
      
      expect(initSpy.calledWith('initialized')).to.be.true;
    });
    
    it('should set up event listeners', async () => {
      await strategy.initialize();
      
      expect(mockSentimentOracle.on.calledWith('sentiment-update')).to.be.true;
      expect(mockNasdaqClient.on.calledWith('price-update')).to.be.true;
      expect(mockHyperAdaptive.on.calledWith('optimization-complete')).to.be.true;
    });
    
    it('should optimize parameters during initialization', async () => {
      await strategy.initialize();
      
      expect(mockHyperAdaptive.optimizeParameters.calledOnce).to.be.true;
    });
  });
  
  describe('Strategy Execution', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should execute strategy and maintain position when no signals', async () => {
      // Set up conditions for no rebalance
      strategy.state.lastRebalance = Date.now(); // Recent rebalance
      mockSentimentOracle.getLatestSentiment.resolves({
        aggregateScore: 0.5 // Below threshold
      });
      
      const result = await strategy.executeStrategy();
      
      expect(result.action).to.equal('hold');
      expect(mockXrplClient.increasePosition.called).to.be.false;
      expect(mockXrplClient.decreasePosition.called).to.be.false;
      expect(mockNasdaqClient.increasePosition.called).to.be.false;
      expect(mockNasdaqClient.decreasePosition.called).to.be.false;
    });
    
    it('should rebalance on strong sentiment signal', async () => {
      // Set up conditions for rebalance
      strategy.state.lastRebalance = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      mockSentimentOracle.getLatestSentiment.resolves({
        aggregateScore: 0.85 // Strong sentiment
      });
      
      const result = await strategy.executeStrategy();
      
      expect(result.action).to.equal('rebalanced');
      expect(result.leverageApplied).to.be.true;
      expect(mockNasdaqClient.setLeverage.calledOnce).to.be.true;
    });
    
    it('should rebalance on NASDAQ dip', async () => {
      // Set up conditions for NASDAQ dip
      strategy.state.lastRebalance = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      strategy.state.nasdaqPriceHistory = [
        { price: 23500, timestamp: Date.now() - 3600000 } // Previous price higher
      ];
      mockNasdaqClient.getCurrentMarketData.resolves({
        price: 23000, // 2.1% dip
        volume: 15000,
        volatility: 0.1738
      });
      
      const checkNasdaqDipSpy = sinon.spy(strategy, 'checkNasdaqDip');
      const rebalanceOnDipSpy = sinon.spy(strategy, 'rebalanceOnNasdaqDip');
      
      await strategy.executeStrategy();
      
      expect(checkNasdaqDipSpy.called).to.be.true;
      expect(rebalanceOnDipSpy.called).to.be.true;
      expect(mockXrplClient.increasePosition.called).to.be.true;
    });
  });
  
  describe('Market Condition Detection', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should detect NASDAQ dips correctly', () => {
      // Set up price history
      strategy.state.nasdaqPriceHistory = [
        { price: 23500, timestamp: Date.now() - 3600000 } // Previous price
      ];
      
      const currentData = { price: 23000 }; // 2.1% dip
      
      const dipPercentage = strategy.checkNasdaqDip(currentData);
      
      expect(dipPercentage).to.be.approximately(-0.021, 0.001);
    });
    
    it('should detect arbitrage opportunities', async () => {
      const nasdaqData = {
        price: 23000,
        volume: 15000
      };
      
      const xrplData = {
        'XRP/USD': { lastPrice: 3.25 },
        'RLUSD/XRP': { lastPrice: 0.31 }
      };
      
      // Set initial price history
      strategy.state.nasdaqPriceHistory = [
        { price: 22000, timestamp: Date.now() - 86400000 } // Previous day price
      ];
      
      const opportunity = strategy.checkArbitrageOpportunity(nasdaqData, xrplData);
      
      expect(opportunity).to.be.a('number');
      expect(opportunity).to.be.gte(0);
      expect(opportunity).to.be.lte(1);
    });
    
    it('should process sentiment triggers', () => {
      const emitSpy = sinon.spy(strategy, 'emit');
      const executeSpy = sinon.stub(strategy, 'executeStrategy').resolves();
      
      const sentimentData = {
        aggregateScore: 0.8, // Above threshold
        sources: {
          twitter: 0.85,
          reddit: 0.75
        }
      };
      
      strategy.checkSentimentTriggers(sentimentData);
      
      expect(emitSpy.calledWith('sentiment-trigger')).to.be.true;
      expect(executeSpy.calledOnce).to.be.true;
    });
  });
  
  describe('Portfolio Rebalancing', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should calculate optimal allocation based on market conditions', async () => {
      const nasdaqData = {
        price: 23000,
        volume: 15000
      };
      
      const xrplData = {
        'XRP/USD': { lastPrice: 3.25 },
        'RLUSD/XRP': { lastPrice: 0.31 }
      };
      
      const sentimentData = {
        aggregateScore: 0.75
      };
      
      const allocation = await strategy.calculateOptimalAllocation(
        nasdaqData,
        xrplData,
        sentimentData
      );
      
      expect(allocation).to.have.property('nasdaq');
      expect(allocation).to.have.property('xrpl');
      expect(allocation.nasdaq + allocation.xrpl).to.be.approximately(1.0, 0.001);
      expect(mockHyperAdaptive.optimizeAllocation.calledOnce).to.be.true;
    });
    
    it('should execute rebalance with minimum change threshold', async () => {
      // Set current allocation
      strategy.state.currentAllocation = {
        nasdaq: 0.7,
        xrpl: 0.3
      };
      
      // Target allocation with significant change
      const targetAllocation = {
        nasdaq: 0.5,
        xrpl: 0.5
      };
      
      const result = await strategy.executeRebalance(targetAllocation);
      
      expect(result.success).to.be.true;
      expect(mockNasdaqClient.decreasePosition.calledOnce).to.be.true;
      expect(mockXrplClient.increasePosition.calledOnce).to.be.true;
    });
    
    it('should not execute trades for small allocation changes', async () => {
      // Set current allocation
      strategy.state.currentAllocation = {
        nasdaq: 0.7,
        xrpl: 0.3
      };
      
      // Target allocation with minimal change
      const targetAllocation = {
        nasdaq: 0.705,
        xrpl: 0.295
      };
      
      const result = await strategy.executeRebalance(targetAllocation);
      
      expect(result.success).to.be.true;
      expect(mockNasdaqClient.increasePosition.called).to.be.false;
      expect(mockXrplClient.decreasePosition.called).to.be.false;
    });
  });
  
  describe('Leverage Strategy', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should apply leverage based on sentiment strength', async () => {
      const nasdaqData = {
        price: 23000,
        volume: 15000
      };
      
      const sentimentData = {
        aggregateScore: 0.85 // Strong sentiment
      };
      
      const result = await strategy.applyLeverageStrategy(nasdaqData, sentimentData);
      
      expect(result.action).to.equal('leverage_applied');
      expect(result.leverage).to.be.approximately(2.0, 0.2);
      expect(mockNasdaqClient.setLeverage.calledOnce).to.be.true;
    });
    
    it('should not apply leverage when sentiment is below threshold', async () => {
      const nasdaqData = {
        price: 23000,
        volume: 15000
      };
      
      const sentimentData = {
        aggregateScore: 0.5 // Below threshold
      };
      
      const result = await strategy.applyLeverageStrategy(nasdaqData, sentimentData);
      
      expect(result.action).to.equal('no_leverage');
      expect(mockNasdaqClient.setLeverage.called).to.be.false;
    });
  });
  
  describe('Yield Calculation', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should calculate expected yield based on allocation', () => {
      const allocation = {
        nasdaq: 0.6,
        xrpl: 0.4
      };
      
      const yieldResult = strategy.calculateExpectedYield(allocation);
      
      expect(yieldResult).to.have.property('expectedAnnualYield');
      expect(yieldResult).to.have.property('riskStdDev');
      expect(yieldResult).to.have.property('sharpeRatio');
      expect(yieldResult).to.have.property('nasdaqContribution');
      expect(yieldResult).to.have.property('xrplContribution');
      
      // Verify yield is higher than base simulation
      expect(yieldResult.expectedAnnualYield).to.be.greaterThan(strategy.state.simulationResults.meanAnnualYield);
    });
    
    it('should show improved yield with optimal allocation', () => {
      // Conservative allocation
      const conservativeAllocation = {
        nasdaq: 1.0,
        xrpl: 0.0
      };
      
      // Optimal allocation
      const optimalAllocation = {
        nasdaq: 0.3,
        xrpl: 0.7
      };
      
      const conservativeYield = strategy.calculateExpectedYield(conservativeAllocation);
      const optimalYield = strategy.calculateExpectedYield(optimalAllocation);
      
      expect(optimalYield.expectedAnnualYield).to.be.greaterThan(conservativeYield.expectedAnnualYield);
      expect(optimalYield.sharpeRatio).to.be.greaterThan(conservativeYield.sharpeRatio);
    });
  });
  
  describe('Parameter Optimization', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });
    
    it('should optimize strategy parameters', async () => {
      const initialParams = { ...strategy.options };
      
      await strategy.optimizeParameters();
      
      expect(mockHyperAdaptive.optimizeParameters.calledOnce).to.be.true;
      expect(strategy.options).to.not.deep.equal(initialParams);
    });
    
    it('should update parameters from hyper-adaptive system', () => {
      const newParameters = {
        leverageMultiplier: 2.5,
        sentimentThreshold: 0.6,
        nasdaqDipThreshold: 0.0015,
        xrplAllocationOnDip: 0.8,
        rlusdPairWeight: 0.7
      };
      
      const optimizationResult = {
        strategy: 'nasdaq-xrpl-fusion',
        parameters: newParameters,
        expectedImprovement: 0.2
      };
      
      const emitSpy = sinon.spy(strategy, 'emit');
      
      strategy.updateOptimizedParameters(optimizationResult);
      
      expect(strategy.options.leverageMultiplier).to.equal(2.5);
      expect(strategy.options.sentimentThreshold).to.equal(0.6);
      expect(emitSpy.calledWith('parameters-updated')).to.be.true;
    });
  });
  
  describe('Statistics and Reporting', () => {
    beforeEach(async () => {
      await strategy.initialize();
      
      // Add some yield history
      strategy.state.yieldHistory = [
        { yield: 0.02, timestamp: Date.now() - 86400000 * 7 },
        { yield: 0.03, timestamp: Date.now() - 86400000 * 6 },
        { yield: 0.025, timestamp: Date.now() - 86400000 * 5 }
      ];
      
      // Add sentiment scores
      strategy.state.sentimentScores = [
        { score: 0.7, timestamp: Date.now() - 86400000 * 3 },
        { score: 0.65, timestamp: Date.now() - 86400000 * 2 },
        { score: 0.75, timestamp: Date.now() - 86400000 * 1 }
      ];
    });
    
    it('should provide comprehensive strategy statistics', () => {
      const stats = strategy.getStats();
      
      expect(stats).to.have.property('currentAllocation');
      expect(stats).to.have.property('actualYield');
      expect(stats).to.have.property('expectedYield');
      expect(stats).to.have.property('baselineSimulation');
      expect(stats).to.have.property('optimizedProjection');
      expect(stats).to.have.property('parameters');
      expect(stats).to.have.property('sentimentAverage');
      
      // Verify sentiment average calculation
      expect(stats.sentimentAverage).to.be.approximately(0.7, 0.01);
    });
  });
});
