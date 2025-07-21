/**
 * Full System Integration Test
 * 
 * This test validates the complete integration of all system components:
 * - Testnet Connector
 * - Staking Mechanism
 * - NFT Marketplace
 * - ETF Alert System
 * - Premium Tiers System
 * - Stake-to-Yield Marketplace Hub
 * 
 * It simulates a full user journey from registration through staking,
 * yield generation, ETF alert handling, and NFT minting.
 */

const expect = require('expect');
const xrpl = require('xrpl');

// Core modules
const TestnetConnector = require('../../modules/testnet-connector');
const StakingMechanism = require('../../modules/staking-mechanism');
const NFTMarketplace = require('../../modules/nft-marketplace');

// Strategy and monetization modules
const ETFAlertSystem = require('../../strategies/etf-alert-system');
const PremiumTiersSystem = require('../../monetization/premium-tiers');

// Main hub
const StakeToYieldMarketplaceHub = require('../../examples/stake-to-yield-marketplace-hub');

describe('Full System Integration', function() {
  // Increase timeout for integration tests
  this.timeout(30000);
  
  let hub;
  let mockXrplClient;
  let mockWallet;
  let testUser;
  
  beforeEach(async () => {
    // Mock XRPL client
    mockXrplClient = {
      connect: jest.fn().mockResolvedValue(),
      disconnect: jest.fn().mockResolvedValue(),
      request: jest.fn(),
      submit: jest.fn(),
      on: jest.fn()
    };
    
    // Mock wallet
    mockWallet = {
      address: 'rTEST123456789',
      seed: 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r',
      publicKey: 'ED123456789'
    };
    
    // Replace xrpl.Client with our mock
    jest.mock('xrpl', () => ({
      Client: jest.fn(() => mockXrplClient)
    }));
    
    // Set up common request responses
    mockXrplClient.request.mockResolvedOnce({
      result: {
        account_data: {
          Balance: '100000000' // 100 XRP in drops
        }
      }
    });
    
    mockXrplClient.request.mockResolvedOnce({
      result: {
        lines: []
      }
    });
    
    mockXrplClient.request.mockResolvedOnce({
      result: {
        account_nfts: []
      }
    });
    
    mockXrplClient.request.mockResolvedOnce({
      result: {
        amm: {
          amount: '1000000000',
          amount2: '1000000000',
          lp_token: {
            currency: 'LP',
            issuer: 'rLP12345'
          },
          trading_fee: 500 // 0.5%
        }
      }
    });
    
    mockXrplClient.submit.mockResolvedOnce({
      result: {
        engine_result: 'tesSUCCESS',
        tx_json: {
          hash: 'TRANSACTION_HASH'
        }
      }
    });
    
    // Create hub instance with real modules (not mocks)
    hub = new StakeToYieldMarketplaceHub({
      appName: 'Integration Test Hub',
      version: 'test-1.0.0',
      testnetUrl: 'wss://test.altnet.rippletest.net',
      environment: 'testnet',
      defaultCapital: 1000
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Complete User Journey', () => {
    it('should handle a complete user journey from registration to yield generation', async () => {
      // 1. Initialize the hub
      await hub.initialize();
      
      // Verify initialization
      expect(hub.wallet).to.not.be.undefined;
      expect(hub.modules.testnetConnector).to.be.an.instanceof(TestnetConnector);
      expect(hub.modules.stakingMechanism).to.be.an.instanceof(StakingMechanism);
      expect(hub.modules.nftMarketplace).to.be.an.instanceof(NFTMarketplace);
      expect(hub.modules.etfAlertSystem).to.be.an.instanceof(ETFAlertSystem);
      expect(hub.modules.premiumTiersSystem).to.be.an.instanceof(PremiumTiersSystem);
      
      // 2. Start the hub
      await hub.start();
      expect(hub.isRunning).to.be.true;
      
      // 3. Register a test user
      testUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      });
      
      expect(testUser).to.have.property('id');
      expect(testUser.email).to.equal('test@example.com');
      
      // 4. Subscribe user to Pro tier
      const subscription = hub.modules.premiumTiersSystem.subscribe(testUser.id, 'pro');
      expect(subscription.tierId).to.equal('pro');
      expect(subscription.isActive).to.be.true;
      
      // 5. Stake XRP as eco-staker
      const stakeAmount = 5000;
      const updatedUser = hub.modules.premiumTiersSystem.stakeXRP(testUser.id, stakeAmount, true);
      expect(updatedUser.stakedXRP).to.equal(stakeAmount);
      expect(updatedUser.isEcoStaker).to.be.true;
      
      // 6. Simulate staking event
      const stakeEvent = {
        userId: testUser.id,
        address: testUser.walletAddress,
        amount: stakeAmount,
        isEco: true
      };
      
      // Get the stake event handler and call it
      const stakeHandler = hub.modules.stakingMechanism.on.mock.calls.find(args => args[0] === 'stake')?.[1];
      if (stakeHandler) {
        stakeHandler(stakeEvent);
      }
      
      // 7. Process yield
      const yieldAmount = 500;
      const yieldResult = await hub.processYieldFees(testUser.id, yieldAmount);
      
      // Pro tier has yield fee, but eco-stakers get a discount
      expect(yieldResult.fee).to.be.lessThan(yieldAmount * 0.15); // Less than standard 15% fee
      expect(yieldResult.net).to.be.greaterThan(yieldAmount * 0.85); // More than standard 85% net
      
      // 8. Simulate ETF surge alert
      const etfAlertData = {
        type: 'surge',
        sentiment: 0.92,
        volatility: 0.85,
        source: 'Twitter',
        timestamp: Date.now()
      };
      
      // Get the alert event handler and call it
      const alertHandler = hub.modules.etfAlertSystem.on.mock.calls.find(args => args[0] === 'alert')?.[1];
      if (alertHandler) {
        alertHandler(etfAlertData);
      }
      
      // 9. Mint yield proof NFT
      const nft = await hub.mintYieldProofNFT(etfAlertData);
      expect(nft).to.have.property('tokenId');
      
      // 10. Simulate NFT sale
      const saleData = {
        tokenId: nft.tokenId,
        buyer: 'rBuyer123',
        price: 100
      };
      
      // Get the nftSold event handler and call it
      const nftSoldHandler = hub.modules.nftMarketplace.on.mock.calls.find(args => args[0] === 'nftSold')?.[1];
      if (nftSoldHandler) {
        nftSoldHandler(saleData);
      }
      
      // 11. Check system statistics
      const stats = hub.getStats();
      expect(stats.totalStaked).to.be.at.least(stakeAmount);
      expect(stats.totalYield).to.be.at.least(yieldAmount);
      expect(stats.totalNFTsMinted).to.be.at.least(1);
      expect(stats.totalNFTsSold).to.be.at.least(1);
      expect(stats.totalRevenue).to.be.at.least(100);
      
      // 12. Stop the hub
      await hub.stop();
      expect(hub.isRunning).to.be.false;
    });
  });
  
  describe('ETF Alert Handling and Rebalancing', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
      
      // Register test user
      testUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      });
      
      // Subscribe to Pro tier
      hub.modules.premiumTiersSystem.subscribe(testUser.id, 'pro');
    });
    
    afterEach(async () => {
      await hub.stop();
    });
    
    it('should handle ETF surge alerts with rebalancing', async () => {
      // Mock AMM pools
      const mockPools = [
        { name: 'XRP/RLUSD', apy: 0.65, isStable: false, isEco: false },
        { name: 'RLUSD/USD', apy: 0.45, isStable: true, isEco: false },
        { name: 'XRP/USD', apy: 0.35, isStable: false, isEco: true }
      ];
      
      // Stub getAMMPools method
      hub.getAMMPools = jest.fn().mockResolvedValue(mockPools);
      
      // Spy on rebalancePortfolio method
      const rebalanceSpy = jest.spyOn(hub, 'rebalancePortfolio');
      
      // Simulate ETF surge alert
      const etfAlertData = {
        type: 'surge',
        sentiment: 0.95,
        volatility: 0.90,
        source: 'Bloomberg',
        timestamp: Date.now()
      };
      
      await hub.handleETFAlert(etfAlertData);
      
      // Verify rebalancing was called with correct weights
      expect(rebalanceSpy).toHaveBeenCalledWith(expect.objectContaining({
        RLUSD: expect.any(Number),
        XRP: expect.any(Number),
        USD: expect.any(Number)
      }));
      
      const weights = rebalanceSpy.mock.calls[0][0];
      expect(weights.RLUSD).to.be.greaterThan(0.5); // High RLUSD weight during surge
      expect(weights.XRP).to.be.lessThan(0.5);
      expect(weights.USD).to.be.lessThan(0.3);
      
      // Verify NFT was minted for surge alert
      expect(hub.stats.totalNFTsMinted).to.equal(1);
    });
    
    it('should handle ETF preemptive alerts with moderate rebalancing', async () => {
      // Mock AMM pools
      const mockPools = [
        { name: 'XRP/RLUSD', apy: 0.65, isStable: false, isEco: false },
        { name: 'RLUSD/USD', apy: 0.45, isStable: true, isEco: false },
        { name: 'XRP/USD', apy: 0.35, isStable: false, isEco: true }
      ];
      
      // Stub getAMMPools method
      hub.getAMMPools = jest.fn().mockResolvedValue(mockPools);
      
      // Spy on rebalancePortfolio method
      const rebalanceSpy = jest.spyOn(hub, 'rebalancePortfolio');
      
      // Simulate ETF preemptive alert
      const etfAlertData = {
        type: 'preemptive',
        sentiment: 0.75,
        volatility: 0.60,
        source: 'Reddit',
        timestamp: Date.now()
      };
      
      await hub.handleETFAlert(etfAlertData);
      
      // Verify rebalancing was called with correct weights
      expect(rebalanceSpy).toHaveBeenCalledWith(expect.objectContaining({
        RLUSD: expect.any(Number),
        XRP: expect.any(Number),
        USD: expect.any(Number)
      }));
      
      const weights = rebalanceSpy.mock.calls[0][0];
      expect(weights.RLUSD).to.be.greaterThan(0.3); // Moderate RLUSD weight during preemptive
      expect(weights.RLUSD).to.be.lessThan(0.6); 
      expect(weights.XRP).to.be.greaterThan(0.2);
      expect(weights.USD).to.be.greaterThan(0.1);
      
      // Verify no NFT was minted for preemptive alert
      expect(hub.stats.totalNFTsMinted).to.equal(0);
    });
  });
  
  describe('Premium Tier Benefits and Yield Processing', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    afterEach(async () => {
      await hub.stop();
    });
    
    it('should apply different yield fees based on tier and eco-staking status', async () => {
      // Register users
      const freeUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'free@example.com',
        walletAddress: 'rFreeUser',
        name: 'Free User'
      });
      
      const proUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'pro@example.com',
        walletAddress: 'rProUser',
        name: 'Pro User'
      });
      
      const ecoProUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'ecopro@example.com',
        walletAddress: 'rEcoProUser',
        name: 'Eco Pro User'
      });
      
      // Subscribe pro users
      hub.modules.premiumTiersSystem.subscribe(proUser.id, 'pro');
      hub.modules.premiumTiersSystem.subscribe(ecoProUser.id, 'pro');
      
      // Make one user an eco-staker
      hub.modules.premiumTiersSystem.stakeXRP(ecoProUser.id, 5000, true);
      
      // Process yield for all users
      const yieldAmount = 1000;
      
      const freeResult = await hub.processYieldFees(freeUser.id, yieldAmount);
      const proResult = await hub.processYieldFees(proUser.id, yieldAmount);
      const ecoProResult = await hub.processYieldFees(ecoProUser.id, yieldAmount);
      
      // Free user should have no fees
      expect(freeResult.fee).to.equal(0);
      expect(freeResult.net).to.equal(yieldAmount);
      
      // Pro user should have standard fees
      expect(proResult.fee).to.be.greaterThan(0);
      expect(proResult.net).to.be.lessThan(yieldAmount);
      
      // Eco Pro user should have discounted fees
      expect(ecoProResult.fee).to.be.greaterThan(0);
      expect(ecoProResult.fee).to.be.lessThan(proResult.fee);
      expect(ecoProResult.net).to.be.greaterThan(proResult.net);
    });
    
    it('should enforce tier limits on capital and pools', async () => {
      // Register free user
      const freeUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'free@example.com',
        walletAddress: 'rFreeUser',
        name: 'Free User'
      });
      
      // Register pro user
      const proUser = hub.modules.premiumTiersSystem.registerUser({
        email: 'pro@example.com',
        walletAddress: 'rProUser',
        name: 'Pro User'
      });
      
      // Subscribe pro user
      hub.modules.premiumTiersSystem.subscribe(proUser.id, 'pro');
      
      // Check capital limits
      const freeCapitalCheck = hub.checkCapitalLimit(freeUser.id, 6000);
      const proCapitalCheck = hub.checkCapitalLimit(proUser.id, 90000);
      
      expect(freeCapitalCheck.allowed).to.be.false; // Free tier has 5000 limit
      expect(proCapitalCheck.allowed).to.be.true;  // Pro tier has 100000 limit
      
      // Check pool limits
      const freePools = ['XRP/RLUSD', 'RLUSD/USD', 'XRP/USD', 'BTC/XRP'];
      const proPools = ['XRP/RLUSD', 'RLUSD/USD', 'XRP/USD', 'BTC/XRP', 'ETH/XRP', 
                       'LTC/XRP', 'XRP/EUR', 'XRP/JPY', 'XRP/GBP'];
      
      const freePoolCheck = hub.checkPoolLimit(freeUser.id, freePools);
      const proPoolCheck = hub.checkPoolLimit(proUser.id, proPools);
      
      expect(freePoolCheck.allowed).to.be.false; // Free tier has 3 pool limit
      expect(proPoolCheck.allowed).to.be.true;  // Pro tier has 10 pool limit
    });
  });
  
  describe('Referral and Eco-Staking Bonus System', () => {
    beforeEach(async () => {
      await hub.initialize();
      await hub.start();
    });
    
    afterEach(async () => {
      await hub.stop();
    });
    
    it('should correctly apply referral bonuses', async () => {
      // Register referrer
      const referrer = hub.modules.premiumTiersSystem.registerUser({
        email: 'referrer@example.com',
        walletAddress: 'rReferrer',
        name: 'Referrer'
      });
      
      // Register referred user with referral code
      const referred = hub.modules.premiumTiersSystem.registerUser({
        email: 'referred@example.com',
        walletAddress: 'rReferred',
        name: 'Referred User'
      }, referrer.referralCode);
      
      // Subscribe referred user to Pro tier
      hub.modules.premiumTiersSystem.subscribe(referred.id, 'pro');
      
      // Check referral tracking
      const referrals = hub.modules.premiumTiersSystem.getReferrals(referrer.id);
      expect(referrals).to.include(referred.id);
      
      // Check referral bonus was applied
      const referrerBonus = hub.modules.premiumTiersSystem.getUserBonus(referrer.id);
      expect(referrerBonus).to.be.greaterThan(0);
      
      // Process yield for referrer
      const yieldAmount = 1000;
      const yieldResult = await hub.processYieldFees(referrer.id, yieldAmount);
      
      // Referrer should get bonus on yield fees
      expect(yieldResult.fee).to.be.lessThan(yieldAmount * 0.15); // Less than standard fee
    });
    
    it('should correctly apply eco-staking bonuses', async () => {
      // Register user
      const user = hub.modules.premiumTiersSystem.registerUser({
        email: 'user@example.com',
        walletAddress: 'rUser',
        name: 'Regular User'
      });
      
      // Subscribe to Pro tier
      hub.modules.premiumTiersSystem.subscribe(user.id, 'pro');
      
      // Process yield before eco-staking
      const yieldAmount = 1000;
      const beforeResult = await hub.processYieldFees(user.id, yieldAmount);
      
      // Make user an eco-staker
      hub.modules.premiumTiersSystem.stakeXRP(user.id, 5000, true);
      
      // Process yield after eco-staking
      const afterResult = await hub.processYieldFees(user.id, yieldAmount);
      
      // Eco-staker should get discount on yield fees
      expect(afterResult.fee).to.be.lessThan(beforeResult.fee);
      expect(afterResult.net).to.be.greaterThan(beforeResult.net);
    });
  });
});
