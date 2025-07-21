/**
 * Premium Tiers System Tests
 * 
 * Tests the Premium Tiers System's ability to:
 * - Register users and manage subscriptions
 * - Process yield fees based on tier levels
 * - Handle referrals and eco-staking bonuses
 * - Generate authentication tokens
 * - Track revenue and system statistics
 */

const { expect } = require('expect'); // Use Jest expect
const sinon = require('sinon');
const jwt = { sign: jest.fn() };
const PremiumTiersSystem = require('../monetization/premium-tiers');

describe('Premium Tiers System', () => {
  let premiumTiersSystem;
  let mockXrplClient;
  
  beforeEach(() => {
    // Create mock XRPL client
    mockXrplClient = {
      request: sinon.stub().resolves({ result: { status: 'success' } }),
      on: sinon.stub(),
      submitTransaction: sinon.stub().resolves({ result: { status: 'success' } })
    };
    
    // Initialize Premium Tiers System with test config
    premiumTiersSystem = new PremiumTiersSystem({
      tiers: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          features: ['Basic yield optimization'],
          limits: { maxCapital: 5000, maxPools: 3 }
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 49.99,
          features: ['Federated AI access', 'ETF surge notifications'],
          limits: { maxCapital: 100000, maxPools: 10 },
          yieldFee: 0.15 // 15% yield fee
        }
      ],
      referralBonus: 0.20,
      ecoBonus: 0.24,
      jwtSecret: 'test-secret'
    });
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      expect(premiumTiersSystem.xrplClient).to.equal(mockXrplClient);
    });
    
    it('should create sample users for demonstration', async () => {
      const createSampleUsersSpy = sinon.spy(premiumTiersSystem, 'createSampleUsers');
      
      // Mock loadUsers to call createSampleUsers
      sinon.stub(premiumTiersSystem, 'loadUsers').callsFake(async () => {
        await premiumTiersSystem.createSampleUsers();
      });
      
      await premiumTiersSystem.initialize(mockXrplClient);
      
      expect(createSampleUsersSpy.calledOnce).to.be.true;
      expect(premiumTiersSystem.users.size).to.be.greaterThan(0);
    });
  });
  
  describe('User Registration', () => {
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
    });
    
    it('should register a new user', () => {
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      const newUser = premiumTiersSystem.registerUser(userData);
      
      expect(newUser).to.have.property('id');
      expect(newUser.email).to.equal('test@example.com');
      expect(newUser.walletAddress).to.equal('rTestUser123');
      expect(newUser.name).to.equal('Test User');
      expect(premiumTiersSystem.users.has(newUser.id)).to.be.true;
    });
    
    it('should generate a referral code for new users', () => {
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      const newUser = premiumTiersSystem.registerUser(userData);
      
      expect(newUser.referralCode).to.be.a('string');
      expect(newUser.referralCode.length).to.be.greaterThan(5);
    });
    
    it('should track referrals correctly', () => {
      // Create referrer
      const referrerData = {
        email: 'referrer@example.com',
        walletAddress: 'rReferrer123',
        name: 'Referrer User'
      };
      
      const referrer = premiumTiersSystem.registerUser(referrerData);
      
      // Create referred user
      const userData = {
        email: 'referred@example.com',
        walletAddress: 'rReferred123',
        name: 'Referred User'
      };
      
      const newUser = premiumTiersSystem.registerUser(userData, referrer.referralCode);
      
      // Check referral tracking
      expect(premiumTiersSystem.referrals.has(referrer.id)).to.be.true;
      expect(premiumTiersSystem.referrals.get(referrer.id)).to.include(newUser.id);
      expect(newUser.referredBy).to.equal(referrer.id);
    });
  });
  
  describe('Subscription Management', () => {
    let testUser;
    
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      
      // Create test user
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      testUser = premiumTiersSystem.registerUser(userData);
    });
    
    it('should subscribe user to a premium tier', () => {
      const subscription = premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      expect(subscription.userId).toBe(testUser.id);
      expect(subscription.tierId).toBe('pro');
      expect(subscription.isActive).toBe(true);
      expect(subscription.startDate).toBeDefined();
      expect(subscription.endDate).toBeDefined();
      expect(premiumTiersSystem.subscriptions.has(testUser.id)).toBe(true);
    });
    
    it('should update monthly revenue when user subscribes', () => {
      const initialRevenue = premiumTiersSystem.monthlyRevenue;
      const subscription = premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      const proTier = premiumTiersSystem.config.tiers.find(t => t.id === 'pro');
      expect(premiumTiersSystem.monthlyRevenue).to.equal(initialRevenue + proTier.price);
    });
    
    it('should process referral bonus when referred user subscribes', () => {
      // Create referrer
      const referrerData = {
        email: 'referrer@example.com',
        walletAddress: 'rReferrer123',
        name: 'Referrer User'
      };
      
      const referrer = premiumTiersSystem.registerUser(referrerData);
      
      // Create referred user with referral code
      const userData = {
        email: 'referred@example.com',
        walletAddress: 'rReferred123',
        name: 'Referred User'
      };
      
      const referred = premiumTiersSystem.registerUser(userData, referrer.referralCode);
      
      // Process referral bonus spy
      const processReferralBonusSpy = sinon.spy(premiumTiersSystem, 'processReferralBonus');
      
      // Subscribe referred user
      const subscription = premiumTiersSystem.subscribe(referred.id, 'pro');
      
      expect(processReferralBonusSpy.calledOnce).to.be.true;
      expect(processReferralBonusSpy.firstCall.args[0]).to.equal(referrer.id);
      
      const proTier = premiumTiersSystem.config.tiers.find(t => t.id === 'pro');
      expect(processReferralBonusSpy.firstCall.args[1]).to.equal(proTier.price);
    });
  });
  
  describe('XRP Staking', () => {
    let testUser;
    
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      
      // Create test user
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      testUser = premiumTiersSystem.registerUser(userData);
    });
    
    it('should stake XRP correctly', () => {
      const stakeAmount = 1000;
      const updatedUser = premiumTiersSystem.stakeXRP(testUser.id, stakeAmount);
      
      expect(updatedUser.stakedXRP).to.equal(stakeAmount);
      expect(updatedUser.totalStaked).to.equal(stakeAmount);
      expect(updatedUser.isEcoStaker).to.be.false;
    });
    
    it('should mark eco-friendly staking correctly', () => {
      const stakeAmount = 1000;
      const updatedUser = premiumTiersSystem.stakeXRP(testUser.id, stakeAmount, true);
      
      expect(updatedUser.stakedXRP).to.equal(stakeAmount);
      expect(updatedUser.totalStaked).to.equal(stakeAmount);
      expect(updatedUser.isEcoStaker).to.be.true;
    });
    
    it('should check for tier upgrades after staking', () => {
      const checkTierUpgradesSpy = sinon.spy(premiumTiersSystem, 'checkTierUpgrades');
      
      const stakeAmount = 1000;
      premiumTiersSystem.stakeXRP(testUser.id, stakeAmount);
      
      expect(checkTierUpgradesSpy.calledOnce).to.be.true;
      expect(checkTierUpgradesSpy.firstCall.args[0]).to.equal(testUser.id);
    });
  });
  
  describe('Yield Fee Processing', () => {
    let testUser;
    
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      
      // Create test user
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      testUser = premiumTiersSystem.registerUser(userData);
    });
    
    it('should process yield fees based on tier', async () => {
      // Subscribe user to Pro tier
      premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      // Process yield fees
      const yieldAmount = 1000;
      const feeResult = await premiumTiersSystem.processYieldFees(testUser.id, yieldAmount);
      
      // Pro tier has 15% yield fee
      expect(feeResult.percentage).to.equal(0.15);
      expect(feeResult.fee).to.equal(yieldAmount * 0.15);
      expect(feeResult.net).to.equal(yieldAmount - (yieldAmount * 0.15));
    });
    
    it('should apply eco discount for eco stakers', async () => {
      // Subscribe user to Pro tier
      premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      // Make user an eco staker
      premiumTiersSystem.stakeXRP(testUser.id, 1000, true);
      
      // Process yield fees
      const yieldAmount = 1000;
      const feeResult = await premiumTiersSystem.processYieldFees(testUser.id, yieldAmount);
      
      // Pro tier has 15% yield fee, but eco stakers get 24% discount
      const expectedFee = yieldAmount * 0.15 * (1 - 0.24);
      expect(feeResult.fee).to.be.approximately(expectedFee, 0.01);
      expect(feeResult.net).to.be.approximately(yieldAmount - expectedFee, 0.01);
    });
    
    it('should not charge fees for free tier users', async () => {
      // User is on free tier by default
      
      // Process yield fees
      const yieldAmount = 1000;
      const feeResult = await premiumTiersSystem.processYieldFees(testUser.id, yieldAmount);
      
      expect(feeResult.fee).to.equal(0);
      expect(feeResult.net).to.equal(yieldAmount);
    });
    
    it('should track total yield fees collected', async () => {
      // Subscribe user to Pro tier
      premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      // Process yield fees
      const yieldAmount = 1000;
      const initialYieldFees = premiumTiersSystem.yieldFeesCollected;
      const feeResult = await premiumTiersSystem.processYieldFees(testUser.id, yieldAmount);
      
      expect(premiumTiersSystem.yieldFeesCollected).to.equal(initialYieldFees + feeResult.fee);
    });
  });
  
  describe('Authentication', () => {
    let testUser;
    
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      
      // Create test user
      const userData = {
        email: 'test@example.com',
        walletAddress: 'rTestUser123',
        name: 'Test User'
      };
      
      testUser = premiumTiersSystem.registerUser(userData);
    });
    
    it('should generate valid JWT token', () => {
      const token = premiumTiersSystem.generateAuthToken(testUser.id);
      
      expect(token).to.be.a('string');
      
      // Verify token
      const decoded = jwt.verify(token, premiumTiersSystem.config.jwtSecret);
      expect(decoded.userId).to.equal(testUser.id);
      expect(decoded.email).to.equal(testUser.email);
      expect(decoded.walletAddress).to.equal(testUser.walletAddress);
    });
    
    it('should include tier information in token', () => {
      // Subscribe user to Pro tier
      premiumTiersSystem.subscribe(testUser.id, 'pro');
      
      const token = premiumTiersSystem.generateAuthToken(testUser.id);
      
      // Verify token
      const decoded = jwt.verify(token, premiumTiersSystem.config.jwtSecret);
      expect(decoded.tier).to.equal('pro');
      expect(decoded.limits).to.deep.equal({ maxCapital: 100000, maxPools: 10 });
    });
  });
  
  describe('System Statistics', () => {
    beforeEach(async () => {
      await premiumTiersSystem.initialize(mockXrplClient);
      
      // Create test users
      const user1 = premiumTiersSystem.registerUser({
        email: 'user1@example.com',
        walletAddress: 'rUser1',
        name: 'User 1'
      });
      
      const user2 = premiumTiersSystem.registerUser({
        email: 'user2@example.com',
        walletAddress: 'rUser2',
        name: 'User 2'
      });
      
      // Subscribe users
      premiumTiersSystem.subscribe(user1.id, 'pro');
      
      // Stake XRP
      premiumTiersSystem.stakeXRP(user2.id, 1000, true);
      
      // Process yield fees
      await premiumTiersSystem.processYieldFees(user1.id, 1000);
    });
    
    it('should report accurate system statistics', () => {
      const stats = premiumTiersSystem.getStats();
      
      expect(stats.totalUsers).to.equal(premiumTiersSystem.users.size);
      expect(stats.activeSubscriptions).to.equal(1);
      expect(stats.tierCounts).to.have.property('pro', 1);
      expect(stats.tierCounts).to.have.property('free', 1);
      expect(stats.ecoStakers).to.equal(1);
      expect(stats.totalRevenue).to.be.a('number');
      expect(stats.monthlyRevenue).to.be.a('number');
      expect(stats.yieldFeesCollected).to.be.a('number');
    });
  });
});
