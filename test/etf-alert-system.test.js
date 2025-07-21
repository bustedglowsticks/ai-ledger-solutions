/**
 * ETF Alert System Tests
 * 
 * Tests the ETF Alert System's ability to:
 * - Detect ETF inflows and sentiment spikes
 * - Trigger appropriate rebalancing strategies
 * - Integrate with XRPL client for real-time monitoring
 * - Handle volatility changes and adapt allocation
 */

const expect = require('expect');
const sinon = require('sinon');
const xrpl = require('xrpl');
const ETFAlertSystem = require('../strategies/etf-alert-system');

describe('ETF Alert System', () => {
  let etfAlertSystem;
  let mockXrplClient;
  
  beforeEach(() => {
    // Create mock XRPL client
    mockXrplClient = {
      request: sinon.stub(),
      on: sinon.stub(),
      getAMMPools: sinon.stub().resolves([
        { name: 'XRP/RLUSD', apy: 0.65, isStable: false, isEco: false },
        { name: 'RLUSD/USD', apy: 0.45, isStable: true, isEco: false },
        { name: 'XRP/GreenToken', apy: 0.60, isStable: false, isEco: true },
        { name: 'RLUSD/SolarRWA', apy: 0.75, isStable: true, isEco: true }
      ]),
      submitAllocation: sinon.stub().resolves({ success: true })
    };
    
    // Initialize ETF Alert System with test config
    etfAlertSystem = new ETFAlertSystem({
      sentimentThreshold: 0.7,
      volatilityThreshold: 0.96,
      rlusdHighVolWeight: 0.8,
      rlusdNormalWeight: 0.4,
      capital: 10000,
      sentimentApiEndpoint: 'mock://api.sentiment-oracle.xrpl/v1/search'
    });
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      
      await etfAlertSystem.initialize(mockXrplClient);
      
      expect(mockXrplClient.request.calledOnce).to.be.true;
      expect(mockXrplClient.on.calledOnce).to.be.true;
      expect(mockXrplClient.on.firstCall.args[0]).to.equal('transaction');
    });
    
    it('should handle initialization errors gracefully', async () => {
      mockXrplClient.request.rejects(new Error('Subscription failed'));
      
      try {
        await etfAlertSystem.initialize(mockXrplClient);
      } catch (error) {
        expect(error.message).to.include('Failed to subscribe');
      }
    });
  });
  
  describe('Transaction Processing', () => {
    beforeEach(async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      await etfAlertSystem.initialize(mockXrplClient);
    });
    
    it('should process ETF inflow transactions', () => {
      // Create spy on processETFTransaction
      const processETFTransactionSpy = sinon.spy(etfAlertSystem, 'processETFTransaction');
      
      // Mock transaction from ETF wallet
      const mockTransaction = {
        transaction: {
          TransactionType: 'Payment',
          Account: 'rETF2025BlackRock',
          Amount: '1000000000' // 1000 XRP in drops
        }
      };
      
      // Trigger transaction handler
      const transactionHandler = mockXrplClient.on.firstCall.args[1];
      transactionHandler(mockTransaction);
      
      expect(processETFTransactionSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.etfInflows.get('rETF2025BlackRock')).to.equal(1000);
    });
    
    it('should ignore non-ETF transactions', () => {
      // Create spy on processETFTransaction
      const processETFTransactionSpy = sinon.spy(etfAlertSystem, 'processETFTransaction');
      
      // Mock transaction from non-ETF wallet
      const mockTransaction = {
        transaction: {
          TransactionType: 'Payment',
          Account: 'rNonETFWallet',
          Amount: '1000000000' // 1000 XRP in drops
        }
      };
      
      // Trigger transaction handler
      const transactionHandler = mockXrplClient.on.firstCall.args[1];
      transactionHandler(mockTransaction);
      
      expect(processETFTransactionSpy.called).to.be.false;
    });
    
    it('should trigger alert check on significant inflow', () => {
      // Create spy on checkForAlertTrigger
      const checkForAlertTriggerSpy = sinon.spy(etfAlertSystem, 'checkForAlertTrigger');
      
      // Mock large transaction from ETF wallet (>1M XRP)
      const mockTransaction = {
        transaction: {
          TransactionType: 'Payment',
          Account: 'rETF2025BlackRock',
          Amount: '2000000000000' // 2M XRP in drops
        }
      };
      
      // Trigger transaction handler
      const transactionHandler = mockXrplClient.on.firstCall.args[1];
      transactionHandler(mockTransaction);
      
      expect(checkForAlertTriggerSpy.calledOnce).to.be.true;
      expect(checkForAlertTriggerSpy.firstCall.args[0]).to.be.true; // forceCheck = true
    });
  });
  
  describe('Sentiment and Volatility Handling', () => {
    beforeEach(async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      await etfAlertSystem.initialize(mockXrplClient);
    });
    
    it('should update volatility correctly', () => {
      etfAlertSystem.updateVolatility(0.95);
      expect(etfAlertSystem.currentVolatility).to.equal(0.95);
      
      etfAlertSystem.updateVolatility(1.2);
      expect(etfAlertSystem.currentVolatility).to.equal(1.2);
    });
    
    it('should trigger preemptive shift when sentiment exceeds threshold but volatility is normal', () => {
      // Create spy on triggerPreemptiveShift
      const triggerPreemptiveShiftSpy = sinon.spy(etfAlertSystem, 'triggerPreemptiveShift');
      
      // Set high sentiment but normal volatility
      etfAlertSystem.currentSentiment = 0.75; // Above threshold (0.7)
      etfAlertSystem.currentVolatility = 0.65; // Below threshold (0.96)
      etfAlertSystem.preemptiveMode = false;
      
      // Force check
      etfAlertSystem.checkForAlertTrigger(true);
      
      expect(triggerPreemptiveShiftSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.preemptiveMode).to.be.true;
    });
    
    it('should trigger full alert when both sentiment and volatility exceed thresholds', () => {
      // Create spy on triggerRebalance
      const triggerRebalanceSpy = sinon.spy(etfAlertSystem, 'triggerRebalance');
      
      // Set high sentiment and high volatility
      etfAlertSystem.currentSentiment = 0.85; // Above threshold (0.7)
      etfAlertSystem.currentVolatility = 0.98; // Above threshold (0.96)
      etfAlertSystem.alertActive = false;
      
      // Force check
      etfAlertSystem.checkForAlertTrigger(true);
      
      expect(triggerRebalanceSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.alertActive).to.be.true;
      expect(etfAlertSystem.preemptiveMode).to.be.false;
    });
    
    it('should deactivate alert when conditions return to normal', () => {
      // Create spy on triggerNormalRebalance
      const triggerNormalRebalanceSpy = sinon.spy(etfAlertSystem, 'triggerNormalRebalance');
      
      // Set normal sentiment and volatility, but alert active
      etfAlertSystem.currentSentiment = 0.5; // Below threshold (0.7)
      etfAlertSystem.currentVolatility = 0.5; // Below threshold (0.96)
      etfAlertSystem.alertActive = true;
      
      // Force check
      etfAlertSystem.checkForAlertTrigger(true);
      
      expect(triggerNormalRebalanceSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.alertActive).to.be.false;
    });
  });
  
  describe('Rebalancing Strategies', () => {
    beforeEach(async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      await etfAlertSystem.initialize(mockXrplClient);
    });
    
    it('should execute preemptive shift with intermediate RLUSD weight', async () => {
      await etfAlertSystem.triggerPreemptiveShift();
      
      expect(mockXrplClient.getAMMPools.calledOnce).to.be.true;
      expect(mockXrplClient.submitAllocation.calledOnce).to.be.true;
      
      // Verify RLUSD weight is between normal and high
      const expectedWeight = (etfAlertSystem.config.rlusdHighVolWeight + etfAlertSystem.config.rlusdNormalWeight) / 2;
      expect(expectedWeight).to.be.approximately(0.6, 0.01);
    });
    
    it('should execute high volatility rebalance with high RLUSD weight', async () => {
      await etfAlertSystem.triggerRebalance();
      
      expect(mockXrplClient.getAMMPools.calledOnce).to.be.true;
      expect(mockXrplClient.submitAllocation.calledOnce).to.be.true;
      
      // Verify high RLUSD weight is used
      expect(etfAlertSystem.config.rlusdHighVolWeight).to.equal(0.8);
    });
    
    it('should execute normal rebalance with normal RLUSD weight', async () => {
      await etfAlertSystem.triggerNormalRebalance();
      
      expect(mockXrplClient.getAMMPools.calledOnce).to.be.true;
      expect(mockXrplClient.submitAllocation.calledOnce).to.be.true;
      
      // Verify normal RLUSD weight is used
      expect(etfAlertSystem.config.rlusdNormalWeight).to.equal(0.4);
    });
    
    it('should handle rebalancing errors gracefully', async () => {
      mockXrplClient.getAMMPools.rejects(new Error('Failed to get pools'));
      
      try {
        await etfAlertSystem.triggerRebalance();
      } catch (error) {
        expect(error.message).to.include('Error triggering ETF surge rebalance');
      }
    });
  });
  
  describe('Status Reporting', () => {
    beforeEach(async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      await etfAlertSystem.initialize(mockXrplClient);
    });
    
    it('should report accurate status', () => {
      // Set up test state
      etfAlertSystem.alertActive = true;
      etfAlertSystem.preemptiveMode = false;
      etfAlertSystem.currentSentiment = 0.85;
      etfAlertSystem.currentVolatility = 0.98;
      etfAlertSystem.etfInflows.set('rETF2025BlackRock', 2000000);
      etfAlertSystem.lastRebalance = Date.now();
      
      const status = etfAlertSystem.getStatus();
      
      expect(status.alertActive).to.be.true;
      expect(status.preemptiveMode).to.be.false;
      expect(status.currentSentiment).to.equal(0.85);
      expect(status.currentVolatility).to.equal(0.98);
      expect(status.etfInflows.rETF2025BlackRock).to.equal(2000000);
      expect(status.lastRebalance).to.be.a('string');
    });
  });
  
  describe('Integration Tests', () => {
    beforeEach(async () => {
      mockXrplClient.request.resolves({ result: { status: 'success' } });
      await etfAlertSystem.initialize(mockXrplClient);
    });
    
    it('should follow the complete alert lifecycle', async () => {
      // Create spies
      const checkForAlertTriggerSpy = sinon.spy(etfAlertSystem, 'checkForAlertTrigger');
      const triggerPreemptiveShiftSpy = sinon.spy(etfAlertSystem, 'triggerPreemptiveShift');
      const triggerRebalanceSpy = sinon.spy(etfAlertSystem, 'triggerRebalance');
      const triggerNormalRebalanceSpy = sinon.spy(etfAlertSystem, 'triggerNormalRebalance');
      
      // Step 1: Normal conditions
      etfAlertSystem.currentSentiment = 0.5;
      etfAlertSystem.currentVolatility = 0.5;
      etfAlertSystem.checkForAlertTrigger(true);
      expect(etfAlertSystem.alertActive).to.be.false;
      expect(etfAlertSystem.preemptiveMode).to.be.false;
      
      // Step 2: Rising sentiment triggers preemptive mode
      etfAlertSystem.currentSentiment = 0.75;
      etfAlertSystem.currentVolatility = 0.5;
      etfAlertSystem.checkForAlertTrigger(true);
      expect(triggerPreemptiveShiftSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.preemptiveMode).to.be.true;
      expect(etfAlertSystem.alertActive).to.be.false;
      
      // Step 3: Rising volatility triggers full alert
      etfAlertSystem.currentSentiment = 0.75;
      etfAlertSystem.currentVolatility = 0.98;
      etfAlertSystem.checkForAlertTrigger(true);
      expect(triggerRebalanceSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.alertActive).to.be.true;
      expect(etfAlertSystem.preemptiveMode).to.be.false;
      
      // Step 4: Conditions return to normal
      etfAlertSystem.currentSentiment = 0.5;
      etfAlertSystem.currentVolatility = 0.5;
      etfAlertSystem.checkForAlertTrigger(true);
      expect(triggerNormalRebalanceSpy.calledOnce).to.be.true;
      expect(etfAlertSystem.alertActive).to.be.false;
      expect(etfAlertSystem.preemptiveMode).to.be.false;
    });
  });
});
