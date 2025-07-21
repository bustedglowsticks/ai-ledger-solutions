/**
 * SaaS Tier Structure Tests
 * 
 * Tests the SaaS Tier Structure's ability to:
 * - Register users and manage premium subscriptions
 * - Control feature access based on tier levels
 * - Process referrals and track commissions
 * - Track yield and mint eco-badges
 * - Generate user statistics and analytics
 */

const expect = require('expect');
const sinon = require('sinon');
const { PremiumTierManager, PremiumTier, TIERS } = require('../monetization/saas-tier');

describe('SaaS Tier Structure', () => {
  let tierManager;
  let mockPaymentProcessor;
  let mockNftMinter;
  let mockAnalyticsTracker;
  
  beforeEach(() => {
    // Create mocks
    mockPaymentProcessor = {
      processPayment: sinon.stub().resolves({ success: true, transactionId: 'mock-tx-123' }),
      issueRefund: sinon.stub().resolves({ success: true })
    };
    
    mockNftMinter = {
      mintEcoBadge: sinon.stub().resolves({ tokenId: 'mock-token-123' })
    };
    
    mockAnalyticsTracker = {
      trackEvent: sinon.stub()
    };
    
    // Initialize tier manager
    tierManager = new PremiumTierManager({
      paymentProcessor: mockPaymentProcessor,
      nftMinter: mockNftMinter,
      analyticsTracker: mockAnalyticsTracker
    });
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com'
      };
      
      const user = tierManager.registerUser(userData);
      
      expect(user).to.have.property('userId', 'user-123');
      expect(user).to.have.property('email', 'test@example.com');
      expect(user).to.have.property('tier', TIERS.FREE);
      expect(user).to.have.property('referralCode').that.is.a('string');
      expect(user.features).to.be.an('array');
      
      // Verify user is stored
      expect(tierManager.users.has('user-123')).to.be.true;
      
      // Verify analytics are tracked
      expect(mockAnalyticsTracker.trackEvent.calledWith('user_registered')).to.be.true;
    });
    
    it('should throw an error if user already exists', () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com'
      };
      
      // Register once
      tierManager.registerUser(userData);
      
      // Try to register again
      expect(() => tierManager.registerUser(userData)).to.throw('User already exists');
    });
    
    it('should track referrals correctly', () => {
      // Register referrer
      const referrer = tierManager.registerUser({
        userId: 'referrer-123',
        email: 'referrer@example.com'
      });
      
      // Register referred user
      const referred = tierManager.registerUser({
        userId: 'referred-123',
        email: 'referred@example.com',
        referredBy: 'referrer-123'
      });
      
      // Check referral tracking
      const updatedReferrer = tierManager.users.get('referrer-123');
      expect(updatedReferrer.referrals).to.include('referred-123');
      expect(referred.referredBy).to.equal('referrer-123');
    });
  });
  
  describe('Tier Upgrades', () => {
    let testUser;
    
    beforeEach(() => {
      // Register test user
      testUser = tierManager.registerUser({
        userId: 'test-user',
        email: 'test@example.com'
      });
    });
    
    it('should upgrade a user to premium tier', async () => {
      const result = await tierManager.upgradeUser('test-user', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Verify user tier is updated
      expect(result.tier).to.equal(TIERS.PREMIUM);
      expect(tierManager.users.get('test-user').tier).to.equal(TIERS.PREMIUM);
      
      // Verify features are updated
      expect(result.features.length).to.be.greaterThan(testUser.features.length);
      
      // Verify payment was processed
      expect(mockPaymentProcessor.processPayment.calledOnce).to.be.true;
      expect(mockPaymentProcessor.processPayment.firstCall.args[0]).to.have.property('amount', 49);
      
      // Verify analytics were tracked
      expect(mockAnalyticsTracker.trackEvent.calledWith('user_upgraded')).to.be.true;
    });
    
    it('should apply annual discount for annual subscriptions', async () => {
      const result = await tierManager.upgradeUser('test-user', TIERS.PREMIUM, true, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Verify payment was processed with annual price
      expect(mockPaymentProcessor.processPayment.firstCall.args[0]).to.have.property('amount', 499);
    });
    
    it('should process referral commission when referred user upgrades', async () => {
      // Create referrer
      const referrer = tierManager.registerUser({
        userId: 'referrer',
        email: 'referrer@example.com'
      });
      
      // Create referred user
      const referred = tierManager.registerUser({
        userId: 'referred',
        email: 'referred@example.com',
        referredBy: 'referrer'
      });
      
      // Spy on commission processing
      const commissionSpy = sinon.spy(tierManager, '_processReferralCommission');
      
      // Upgrade referred user
      await tierManager.upgradeUser('referred', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Verify commission was processed
      expect(commissionSpy.calledOnce).to.be.true;
      expect(commissionSpy.firstCall.args[0]).to.equal('referrer');
      expect(commissionSpy.firstCall.args[1]).to.equal(49); // Premium tier price
    });
  });
  
  describe('Feature Access Control', () => {
    let freeUser;
    let premiumUser;
    let enterpriseUser;
    
    beforeEach(async () => {
      // Create users at different tiers
      freeUser = tierManager.registerUser({
        userId: 'free-user',
        email: 'free@example.com'
      });
      
      premiumUser = tierManager.registerUser({
        userId: 'premium-user',
        email: 'premium@example.com'
      });
      await tierManager.upgradeUser('premium-user', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      enterpriseUser = tierManager.registerUser({
        userId: 'enterprise-user',
        email: 'enterprise@example.com'
      });
      await tierManager.upgradeUser('enterprise-user', TIERS.ENTERPRISE, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
    });
    
    it('should control access to basic features', () => {
      // All tiers should have access to basic features
      expect(tierManager.checkAccess('free-user', 'basic_optimization')).to.be.true;
      expect(tierManager.checkAccess('premium-user', 'basic_optimization')).to.be.true;
      expect(tierManager.checkAccess('enterprise-user', 'basic_optimization')).to.be.true;
    });
    
    it('should control access to premium features', () => {
      // Premium features should only be available to premium and enterprise
      expect(tierManager.checkAccess('free-user', 'advanced_optimization')).to.be.false;
      expect(tierManager.checkAccess('premium-user', 'advanced_optimization')).to.be.true;
      expect(tierManager.checkAccess('enterprise-user', 'advanced_optimization')).to.be.true;
    });
    
    it('should control access to enterprise features', () => {
      // Enterprise features should only be available to enterprise
      expect(tierManager.checkAccess('free-user', 'custom_strategies')).to.be.false;
      expect(tierManager.checkAccess('premium-user', 'custom_strategies')).to.be.false;
      expect(tierManager.checkAccess('enterprise-user', 'custom_strategies')).to.be.true;
    });
    
    it('should return correct access configuration', () => {
      const freeAccess = tierManager.getAccess('free-user');
      const premiumAccess = tierManager.getAccess('premium-user');
      const enterpriseAccess = tierManager.getAccess('enterprise-user');
      
      expect(freeAccess.tier).to.equal(TIERS.FREE);
      expect(premiumAccess.tier).to.equal(TIERS.PREMIUM);
      expect(enterpriseAccess.tier).to.equal(TIERS.ENTERPRISE);
      
      // Check limits
      expect(freeAccess.limits.maxPools).to.be.lessThan(premiumAccess.limits.maxPools);
      expect(premiumAccess.limits.maxPools).to.be.lessThan(enterpriseAccess.limits.maxPools);
    });
  });
  
  describe('Yield Tracking', () => {
    let testUser;
    
    beforeEach(() => {
      // Register test user
      testUser = tierManager.registerUser({
        userId: 'test-user',
        email: 'test@example.com'
      });
    });
    
    it('should track yield for a user', async () => {
      const result = await tierManager.trackYield('test-user', 1000, {
        source: 'xrpl_amm',
        timestamp: Date.now()
      });
      
      // Verify yield is tracked
      expect(result.total).to.equal(1000);
      expect(result.history).to.have.lengthOf(1);
      expect(result.history[0].amount).to.equal(1000);
      
      // Verify analytics were tracked
      expect(mockAnalyticsTracker.trackEvent.calledWith('yield_tracked')).to.be.true;
    });
    
    it('should accumulate yield over time', async () => {
      // Track yield multiple times
      await tierManager.trackYield('test-user', 1000, { source: 'xrpl_amm' });
      await tierManager.trackYield('test-user', 2000, { source: 'nasdaq_futures' });
      
      const yieldData = tierManager.yieldTracking.get('test-user');
      
      // Verify total is accumulated
      expect(yieldData.total).to.equal(3000);
      expect(yieldData.history).to.have.lengthOf(2);
    });
    
    it('should mint eco-badge when threshold is reached', async () => {
      // Track enough yield to trigger eco-badge
      await tierManager.trackYield('test-user', 6000, { source: 'xrpl_amm' });
      
      // Verify NFT minting was called
      expect(mockNftMinter.mintEcoBadge.calledOnce).to.be.true;
      
      // Verify user record is updated
      const user = tierManager.users.get('test-user');
      expect(user).to.have.property('ecoBadge');
      expect(user.ecoBadge).to.have.property('tokenId', 'mock-token-123');
    });
    
    it('should process referral yield commission', async () => {
      // Create referrer
      const referrer = tierManager.registerUser({
        userId: 'referrer',
        email: 'referrer@example.com'
      });
      
      // Create referred user with referral
      const referred = tierManager.registerUser({
        userId: 'referred',
        email: 'referred@example.com',
        referredBy: 'referrer'
      });
      
      // Spy on yield referral processing
      const yieldRefSpy = sinon.spy(tierManager, '_processReferralYield');
      
      // Track yield for referred user
      await tierManager.trackYield('referred', 1000, { source: 'xrpl_amm' });
      
      // Verify referral yield was processed
      expect(yieldRefSpy.calledOnce).to.be.true;
      expect(yieldRefSpy.firstCall.args[0]).to.equal('referrer');
      expect(yieldRefSpy.firstCall.args[1]).to.equal(1000);
    });
  });
  
  describe('Referral Rewards Processing', () => {
    beforeEach(() => {
      // Create referrer with multiple referrals
      const referrer = tierManager.registerUser({
        userId: 'referrer',
        email: 'referrer@example.com'
      });
      
      // Create referred users
      for (let i = 1; i <= 3; i++) {
        const referred = tierManager.registerUser({
          userId: `referred-${i}`,
          email: `referred${i}@example.com`,
          referredBy: 'referrer'
        });
        
        // Track some yield
        tierManager.yieldTracking.set(`referred-${i}`, {
          total: i * 1000,
          history: [{ amount: i * 1000, timestamp: Date.now() }],
          lastUpdated: Date.now()
        });
      }
    });
    
    it('should process referral rewards for all users', async () => {
      const results = await tierManager.processReferralRewards();
      
      // Verify results
      expect(results.processed).to.equal(1); // One referrer
      expect(results.totalCommission).to.be.greaterThan(0);
      
      // Verify analytics were tracked
      expect(mockAnalyticsTracker.trackEvent.calledWith('referral_rewards_processed')).to.be.true;
    });
  });
  
  describe('User Statistics', () => {
    let testUser;
    
    beforeEach(async () => {
      // Register and set up test user
      testUser = tierManager.registerUser({
        userId: 'test-user',
        email: 'test@example.com'
      });
      
      // Upgrade to premium
      await tierManager.upgradeUser('test-user', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Track some yield
      await tierManager.trackYield('test-user', 2500, { source: 'xrpl_amm' });
    });
    
    it('should return comprehensive user statistics', () => {
      const stats = tierManager.getUserStats('test-user');
      
      expect(stats).to.have.property('userId', 'test-user');
      expect(stats).to.have.property('tier', TIERS.PREMIUM);
      expect(stats).to.have.property('totalYield', 2500);
      expect(stats).to.have.property('subscriptionStatus', 'active');
      expect(stats).to.have.property('features').that.is.an('array');
    });
    
    it('should return all user tiers', () => {
      const allTiers = tierManager.getAllUserTiers();
      
      expect(allTiers).to.be.an('array');
      expect(allTiers.length).to.equal(1);
      expect(allTiers[0]).to.have.property('userId', 'test-user');
      expect(allTiers[0]).to.have.property('tier', TIERS.PREMIUM);
    });
  });
  
  describe('PremiumTier Class', () => {
    let testUser;
    let premiumTier;
    
    beforeEach(() => {
      // Register test user
      testUser = tierManager.registerUser({
        userId: 'test-user',
        email: 'test@example.com'
      });
      
      // Create PremiumTier instance
      premiumTier = new PremiumTier('test-user', tierManager);
    });
    
    it('should provide simplified access to tier features', () => {
      // Verify access methods work
      expect(premiumTier.hasAccess('basic_optimization')).to.be.true;
      expect(premiumTier.hasAccess('advanced_optimization')).to.be.false;
      
      // Upgrade user
      tierManager.upgradeUser('test-user', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Verify access is updated
      expect(premiumTier.hasAccess('advanced_optimization')).to.be.true;
    });
    
    it('should calculate yield cut correctly', () => {
      // Upgrade to premium
      tierManager.upgradeUser('test-user', TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Calculate cut
      const yieldAmount = 1000;
      const cut = premiumTier.calculateCut(yieldAmount);
      
      // Premium tier should have a yield cut defined
      expect(cut).to.be.a('number');
      expect(cut).to.be.greaterThan(0);
    });
    
    it('should provide access to user statistics', () => {
      const stats = premiumTier.getStats();
      
      expect(stats).to.have.property('userId', 'test-user');
      expect(stats).to.have.property('tier', TIERS.FREE);
    });
    
    it('should allow upgrading through the instance', async () => {
      await premiumTier.upgrade(TIERS.PREMIUM, false, {
        paymentMethod: 'card',
        cardToken: 'tok_visa'
      });
      
      // Verify user is upgraded
      const user = tierManager.users.get('test-user');
      expect(user.tier).to.equal(TIERS.PREMIUM);
    });
  });
});
