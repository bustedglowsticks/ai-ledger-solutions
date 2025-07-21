/**
 * Stake-to-Yield Marketplace Hub Tests
 * 
 * Tests the integration of all three core modules:
 * - TestnetConnector
 * - StakingMechanism
 * - NFTMarketplace
 * 
 * Along with ETF Alert System and Premium Tiers System
 */

const expect = require('expect');
const sinon = require('sinon');
const xrpl = require('xrpl');
const StakeToYieldMarketplaceHub = require('../examples/stake-to-yield-marketplace-hub');

// Mock modules
const TestnetConnector = require('../modules/testnet-connector');
const StakingMechanism = require('../modules/staking-mechanism');
const NFTMarketplace = require('../modules/nft-marketplace');
const ETFAlertSystem = require('../strategies/etf-alert-system');
const PremiumTiersSystem = require('../monetization/premium-tiers');

describe('Stake-to-Yield Marketplace Hub', () => {
  let hub;
  let mockXrplClient;
  let mockWallet;
  
  // Create module mocks
  let testnetConnectorMock;
  let stakingMechanismMock;
  let nftMarketplaceMock;
  let etfAlertSystemMock;
  let premiumTiersSystemMock;
  
  beforeEach(() => {
    // Mock XRPL client
    mockXrplClient = {
      connect: sinon.stub().resolves(),
      disconnect: sinon.stub().resolves(),
      request: sinon.stub().resolves({ result: { status: 'success' } })
    };
    
    // Mock wallet
    mockWallet = {
      address: 'rTEST123456789',
      seed: 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r',
      publicKey: 'ED123456789'
    };
    
    // Mock TestnetConnector
    testnetConnectorMock = sinon.createStubInstance(TestnetConnector);
    testnetConnectorMock.initialize = sinon.stub().resolves();
    testnetConnectorMock.getOrCreateWallet = sinon.stub().resolves(mockWallet);
    testnetConnectorMock.fundFromFaucet = sinon.stub().resolves({ success: true });
    
    // Mock StakingMechanism
    stakingMechanismMock = sinon.createStubInstance(StakingMechanism);
    stakingMechanismMock.initialize = sinon.stub().resolves();
    stakingMechanismMock.start = sinon.stub().resolves();
    stakingMechanismMock.on = sinon.stub();
    stakingMechanismMock.getActiveStakers = sinon.stub().returns([]);
    stakingMechanismMock.getStats = sinon.stub().returns({
      totalStaked: 10000,
      activeStakers: 5,
      ecoStakers: 3
    });
    
    // Mock NFTMarketplace
    nftMarketplaceMock = sinon.createStubInstance(NFTMarketplace);
    nftMarketplaceMock.initialize = sinon.stub().resolves();
    nftMarketplaceMock.start = sinon.stub().resolves();
    nftMarketplaceMock.on = sinon.stub();
    nftMarketplaceMock.mintNFT = sinon.stub().resolves({
      tokenId: 'NFT123456789',
      metadata: { name: 'Test NFT' }
    });
    nftMarketplaceMock.listNFT = sinon.stub().resolves({ success: true });
    nftMarketplaceMock.getStats = sinon.stub().returns({
      totalMinted: 10,
      totalListed: 8,
      totalSold: 5,
      totalRevenue: 500
    });
    
    // Mock ETFAlertSystem
    etfAlertSystemMock = sinon.createStubInstance(ETFAlertSystem);
    etfAlertSystemMock.initialize = sinon.stub().resolves();
    etfAlertSystemMock.on = sinon.stub();
    etfAlertSystemMock.getStatus = sinon.stub().returns({
      alertActive: false,
      preemptiveMode: false,
      currentSentiment: 0.5,
      currentVolatility: 0.5
    });
    
    // Mock PremiumTiersSystem
    premiumTiersSystemMock = sinon.createStubInstance(PremiumTiersSystem);
    premiumTiersSystemMock.initialize = sinon.stub().resolves();
    premiumTiersSystemMock.processYieldFees = sinon.stub().resolves({
      fee: 5,
      net: 95,
      percentage: 0.05
    });
    premiumTiersSystemMock.getStats = sinon.stub().returns({
      totalUsers: 50,
      activeSubscriptions: 30,
      monthlyRevenue: 1500
    });
    
    // Create hub instance with test config
    hub = new StakeToYieldMarketplaceHub({
      appName: 'Test Stake-to-Yield Hub',
      version: 'test-1.0.0',
      testnetUrl: 'wss://test.altnet.rippletest.net',
      environment: 'testnet',
      defaultCapital: 1000
    });
    
    // Replace xrpl.Client with our mock
    sinon.stub(xrpl, 'Client').returns(mockXrplClient);
    
    // Replace module constructors with our mocks
    sinon.stub(TestnetConnector.prototype, 'constructor').returns(testnetConnectorMock);
    sinon.stub(StakingMechanism.prototype, 'constructor').returns(stakingMechanismMock);
    sinon.stub(NFTMarketplace.prototype, 'constructor').returns(nftMarketplaceMock);
    sinon.stub(ETFAlertSystem.prototype, 'constructor').returns(etfAlertSystemMock);
    sinon.stub(PremiumTiersSystem.prototype, 'constructor').returns(premiumTiersSystemMock);
    
    // Replace module instances
    hub.modules.testnetConnector = testnetConnectorMock;
    hub.modules.stakingMechanism = stakingMechanismMock;
    hub.modules.nftMarketplace = nftMarketplaceMock;
    hub.modules.etfAlertSystem = etfAlertSystemMock;
    hub.modules.premiumTiersSystem = premiumTiersSystemMock;
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('Initialization', () => {
    it('should initialize all modules successfully', async () => {
      await hub.initialize();
      
      expect(mockXrplClient.connect.calledOnce).toBe(true);
      expect(hub.modules.testnetConnector.initialize.calledOnce).toBe(true);
      expect(hub.modules.stakingMechanism.initialize.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.initialize.calledOnce).toBe(true);
      expect(hub.modules.etfAlertSystem.initialize.calledOnce).toBe(true);
      expect(hub.modules.premiumTiersSystem.initialize.calledOnce).toBe(true);
      expect(hub.wallet).to.equal(mockWallet);
    });
    
    it('should handle initialization errors gracefully', async () => {
      // Make testnetConnector.initialize throw an error
      hub.modules.testnetConnector.initialize.rejects(new Error('Initialization failed'));
      
      try {
        await hub.initialize();
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Error initializing');
      }
    });
  });
  
  describe('Starting the Hub', () => {
    beforeEach(async () => {
      await hub.initialize();
    });
    
    it('should start all modules successfully', async () => {
      // Mock account_info response
      mockXrplClient.request.withArgs({
        command: 'account_info',
        account: mockWallet.address
      }).resolves({
        result: {
          account_data: {
            Balance: '100000000' // 100 XRP in drops
          }
        }
      });
      
      await hub.start();
      
      expect(hub.modules.testnetConnector.start.calledOnce).toBe(true);
      expect(hub.modules.stakingMechanism.start.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.start.calledOnce).toBe(true);
      expect(hub.isRunning).toBe(true);
    });
    
    it('should request funds from faucet if balance is low', async () => {
      // Mock low balance response
      mockXrplClient.request.withArgs({
        command: 'account_info',
        account: mockWallet.address
      }).resolves({
        result: {
          account_data: {
            Balance: '10000000' // 10 XRP in drops (below 100 threshold)
          }
        }
      });
      
      await hub.start();
      
      expect(hub.modules.testnetConnector.fundFromFaucet.calledOnce).toBe(true);
      expect(hub.modules.testnetConnector.fundFromFaucet.firstCall.args[0]).to.equal(mockWallet.address);
    });
    
    it('should set up event listeners for all modules', async () => {
      // Mock account_info response
      mockXrplClient.request.withArgs({
        command: 'account_info',
        account: mockWallet.address
      }).resolves({
        result: {
          account_data: {
            Balance: '100000000' // 100 XRP in drops
          }
        }
      });
      
      await hub.start();
      
      expect(hub.modules.stakingMechanism.on.called).toBe(true);
      expect(hub.modules.nftMarketplace.on.called).toBe(true);
      expect(hub.modules.etfAlertSystem.on.called).toBe(true);
    });
  });
  
  describe('Event Handling', () => {
    beforeEach(async () => {
      await hub.initialize();
      
      // Mock account_info response
      mockXrplClient.request.withArgs({
        command: 'account_info',
        account: mockWallet.address
      }).resolves({
        result: {
          account_data: {
            Balance: '100000000' // 100 XRP in drops
          }
        }
      });
      
      await hub.start();
    });
    
    it('should handle staking events correctly', () => {
      // Get the stake event handler
      const stakeHandler = hub.modules.stakingMechanism.on.args.find(args => args[0] === 'stake')[1];
      
      // Trigger a stake event
      const stakeData = {
        address: 'rStaker123',
        amount: 1000
      };
      
      stakeHandler(stakeData);
      
      // Check that stats were updated
      expect(hub.stats.totalStaked).to.equal(1000);
      expect(hub.modules.premiumTiersSystem.processYieldFees.calledOnce).toBe(true);
    });
    
    it('should handle NFT minting events correctly', () => {
      // Get the nftMinted event handler
      const nftMintedHandler = hub.modules.nftMarketplace.on.args.find(args => args[0] === 'nftMinted')[1];
      
      // Trigger an NFT minted event
      const nftData = {
        tokenId: 'NFT123456789',
        metadata: { name: 'Test NFT' }
      };
      
      nftMintedHandler(nftData);
      
      // Check that stats were updated
      expect(hub.stats.totalNFTsMinted).to.equal(1);
    });
    
    it('should handle NFT sale events correctly', () => {
      // Get the nftSold event handler
      const nftSoldHandler = hub.modules.nftMarketplace.on.args.find(args => args[0] === 'nftSold')[1];
      
      // Trigger an NFT sold event
      const saleData = {
        tokenId: 'NFT123456789',
        price: 100
      };
      
      nftSoldHandler(saleData);
      
      // Check that stats were updated
      expect(hub.stats.totalNFTsSold).to.equal(1);
      expect(hub.stats.totalRevenue).to.equal(100);
    });
    
    it('should handle ETF alerts correctly', () => {
      // Get the alert event handler
      const alertHandler = hub.modules.etfAlertSystem.on.args.find(args => args[0] === 'alert')[1];
      
      // Create spy on handleETFAlert
      const handleETFAlertSpy = sinon.spy(hub, 'handleETFAlert');
      
      // Trigger an ETF alert event
      const alertData = {
        type: 'surge',
        sentiment: 0.85,
        volatility: 0.98
      };
      
      alertHandler(alertData);
      
      // Check that alert was handled
      expect(handleETFAlertSpy.calledOnce).toBe(true);
      expect(handleETFAlertSpy.firstCall.args[0]).to.deep.equal(alertData);
    });
  });
  
  describe('ETF Alert Handling', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    it('should handle surge alerts with high RLUSD weight', async () => {
      const alertData = {
        type: 'surge',
        sentiment: 0.85,
        volatility: 0.98
      };
      
      // Mock getAMMPools
      hub.getAMMPools = sinon.stub().resolves([
        { name: 'XRP/RLUSD', apy: 0.65, isStable: false, isEco: false },
        { name: 'RLUSD/USD', apy: 0.45, isStable: true, isEco: false }
      ]);
      
      await hub.handleETFAlert(alertData);
      
      // Should use high RLUSD weight for surge alerts
      expect(hub.getAMMPools.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.mintNFT.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.listNFT.calledOnce).toBe(true);
    });
    
    it('should handle preemptive alerts with medium RLUSD weight', async () => {
      const alertData = {
        type: 'preemptive',
        sentiment: 0.75,
        volatility: 0.70
      };
      
      // Mock getAMMPools
      hub.getAMMPools = sinon.stub().resolves([
        { name: 'XRP/RLUSD', apy: 0.65, isStable: false, isEco: false },
        { name: 'RLUSD/USD', apy: 0.45, isStable: true, isEco: false }
      ]);
      
      await hub.handleETFAlert(alertData);
      
      // Should use medium RLUSD weight for preemptive alerts
      expect(hub.getAMMPools.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.mintNFT.called).toBe(false); // No NFT for preemptive alerts
    });
  });
  
  describe('Yield Processing', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    it('should process yield fees correctly', async () => {
      const result = await hub.processYieldFees('rUser123', 100);
      
      expect(hub.modules.premiumTiersSystem.processYieldFees.calledOnce).toBe(true);
      expect(hub.modules.premiumTiersSystem.processYieldFees.firstCall.args[0]).to.equal('rUser123');
      expect(hub.modules.premiumTiersSystem.processYieldFees.firstCall.args[1]).to.equal(100);
      expect(hub.stats.totalYield).to.equal(100);
      expect(result).to.deep.equal({
        fee: 5,
        net: 95,
        percentage: 0.05
      });
    });
  });
  
  describe('NFT Minting', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    it('should mint and list yield proof NFTs', async () => {
      const yieldData = {
        type: 'surge',
        sentiment: 0.85,
        volatility: 0.98
      };
      
      const nft = await hub.mintYieldProofNFT(yieldData);
      
      expect(hub.modules.nftMarketplace.mintNFT.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.listNFT.calledOnce).toBe(true);
      
      // Check NFT metadata
      const metadata = hub.modules.nftMarketplace.mintNFT.firstCall.args[0];
      expect(metadata.name).to.include('Yield Proof');
      expect(metadata.attributes).to.be.an('array');
      expect(metadata.attributes.find(attr => attr.trait_type === 'Event Type').value).to.equal('surge');
      expect(metadata.attributes.find(attr => attr.trait_type === 'Sentiment').value).to.equal('0.85');
      expect(metadata.attributes.find(attr => attr.trait_type === 'Volatility').value).to.equal('0.98');
      
      // Check NFT listing
      expect(hub.modules.nftMarketplace.listNFT.firstCall.args[0]).to.equal('NFT123456789');
      expect(hub.modules.nftMarketplace.listNFT.firstCall.args[1]).to.equal(98); // volatility * 100
    });
  });
  
  describe('System Statistics', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
      
      // Set some stats
      hub.stats.totalStaked = 10000;
      hub.stats.totalNFTsMinted = 20;
      hub.stats.totalNFTsSold = 15;
      hub.stats.totalRevenue = 1500;
      hub.stats.totalYield = 5000;
      hub.stats.activeUsers = 50;
    });
    
    it('should report accurate system statistics', () => {
      const stats = hub.getStats();
      
      expect(stats.totalStaked).to.equal(10000);
      expect(stats.totalNFTsMinted).to.equal(20);
      expect(stats.totalNFTsSold).to.equal(15);
      expect(stats.totalRevenue).to.equal(1500);
      expect(stats.totalYield).to.equal(5000);
      expect(stats.activeUsers).to.equal(50);
      expect(stats.uptime).to.be.a('number');
      
      // Should include stats from modules
      expect(stats.stakingStats).to.deep.equal({
        totalStaked: 10000,
        activeStakers: 5,
        ecoStakers: 3
      });
      
      expect(stats.nftStats).to.deep.equal({
        totalMinted: 10,
        totalListed: 8,
        totalSold: 5,
        totalRevenue: 500
      });
      
      expect(stats.etfAlertStats).to.deep.equal({
        alertActive: false,
        preemptiveMode: false,
        currentSentiment: 0.5,
        currentVolatility: 0.5
      });
      
      expect(stats.premiumTiersStats).to.deep.equal({
        totalUsers: 50,
        activeSubscriptions: 30,
        monthlyRevenue: 1500
      });
    });
  });
  
  describe('Stopping the Hub', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    it('should stop all modules and disconnect from XRPL', async () => {
      await hub.stop();
      
      expect(hub.modules.testnetConnector.stop.calledOnce).toBe(true);
      expect(hub.modules.stakingMechanism.stop.calledOnce).toBe(true);
      expect(hub.modules.nftMarketplace.stop.calledOnce).toBe(true);
      expect(mockXrplClient.disconnect.calledOnce).toBe(true);
      expect(hub.isRunning).toBe(false);
    });
    
    it('should handle stop errors gracefully', async () => {
      // Make testnetConnector.stop throw an error
      hub.modules.testnetConnector.stop.rejects(new Error('Stop failed'));
      
      try {
        await hub.stop();
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Error stopping');
      }
    });
  });
});
