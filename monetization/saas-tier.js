/**
 * Premium Tier Structure for Cross-Market Yield Optimizer
 * 
 * Implements a tiered subscription model for the Cross-Market Yield Optimizer,
 * providing different levels of access to features, alerts, and yield opportunities.
 * Includes referral staking and eco-badges NFTs for community engagement.
 * 
 * Features:
 * - Multiple subscription tiers (Free, Premium, Enterprise)
 * - Feature access control based on tier
 * - Referral staking system (earn 15% from user yields)
 * - Eco-badges NFTs for top users
 * - Usage tracking and analytics
 * - Payment processing integration
 * 
 * Enables passive income generation through subscriptions and referrals,
 * targeting $5K/month from 100 sign-ups.
 */

// Constants
const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

const TIER_PRICES = {
  [TIERS.FREE]: 0,
  [TIERS.PREMIUM]: 49,
  [TIERS.PREMIUM + '_annual']: 499,
  [TIERS.ENTERPRISE]: 99,
  [TIERS.ENTERPRISE + '_annual']: 999
};

const REFERRAL_COMMISSION_RATE = 0.15; // 15% commission
const ECO_BADGE_THRESHOLD = 5000; // $5000 in yield

/**
 * Premium Tier Manager
 * Handles subscription management, feature access, and referral tracking
 */
class PremiumTierManager {
  /**
   * Initialize the Premium Tier Manager
   * 
   * @param {Object} options - Configuration options
   * @param {Object} options.paymentProcessor - Payment processor integration
   * @param {Object} options.nftMinter - NFT minting integration
   * @param {Object} options.analyticsTracker - Analytics tracking integration
   */
  constructor(options = {}) {
    this.options = {
      paymentProcessor: null,
      nftMinter: null,
      analyticsTracker: null,
      ...options
    };
    
    // Internal state
    this.users = new Map();
    this.referrals = new Map();
    this.subscriptions = new Map();
    this.yieldTracking = new Map();
    
    // Bind methods
    this.registerUser = this.registerUser.bind(this);
    this.upgradeUser = this.upgradeUser.bind(this);
    this.checkAccess = this.checkAccess.bind(this);
    this.trackYield = this.trackYield.bind(this);
    this.processReferralRewards = this.processReferralRewards.bind(this);
  }
  
  /**
   * Register a new user
   * 
   * @param {Object} userData - User data
   * @param {string} userData.userId - Unique user ID
   * @param {string} userData.email - User email
   * @param {string} userData.referredBy - ID of referring user (optional)
   * @returns {Object} Registered user data
   */
  registerUser(userData) {
    if (!userData.userId || !userData.email) {
      throw new Error('User ID and email are required');
    }
    
    // Check if user already exists
    if (this.users.has(userData.userId)) {
      throw new Error('User already exists');
    }
    
    // Create user record
    const user = {
      userId: userData.userId,
      email: userData.email,
      tier: TIERS.FREE,
      createdAt: Date.now(),
      referredBy: userData.referredBy || null,
      referralCode: this._generateReferralCode(userData.userId),
      referrals: [],
      features: this._getFeaturesForTier(TIERS.FREE)
    };
    
    // Store user
    this.users.set(userData.userId, user);
    
    // Track referral
    if (userData.referredBy && this.users.has(userData.referredBy)) {
      const referrer = this.users.get(userData.referredBy);
      referrer.referrals.push(userData.userId);
      this.users.set(userData.referredBy, referrer);
    }
    
    // Initialize yield tracking
    this.yieldTracking.set(userData.userId, {
      total: 0,
      history: [],
      lastUpdated: Date.now()
    });
    
    // Track analytics
    if (this.options.analyticsTracker) {
      this.options.analyticsTracker.trackEvent('user_registered', {
        userId: userData.userId,
        referredBy: userData.referredBy
      });
    }
    
    return user;
  }
  
  /**
   * Upgrade a user to a premium tier
   * 
   * @param {string} userId - User ID
   * @param {string} tier - Target tier (premium or enterprise)
   * @param {boolean} isAnnual - Whether this is an annual subscription
   * @param {Object} paymentDetails - Payment details
   * @returns {Object} Updated user data
   */
  async upgradeUser(userId, tier, isAnnual = false, paymentDetails = {}) {
    // Validate inputs
    if (!this.users.has(userId)) {
      throw new Error('User not found');
    }
    
    if (![TIERS.PREMIUM, TIERS.ENTERPRISE].includes(tier)) {
      throw new Error('Invalid tier');
    }
    
    const user = this.users.get(userId);
    
    // Calculate price
    const tierKey = isAnnual ? `${tier}_annual` : tier;
    const price = TIER_PRICES[tierKey];
    
    // Process payment
    if (this.options.paymentProcessor) {
      try {
        const paymentResult = await this.options.paymentProcessor.processPayment({
          userId,
          amount: price,
          description: `${tier} subscription (${isAnnual ? 'annual' : 'monthly'})`,
          ...paymentDetails
        });
        
        if (!paymentResult.success) {
          throw new Error(`Payment failed: ${paymentResult.message}`);
        }
      } catch (error) {
        throw new Error(`Payment processing error: ${error.message}`);
      }
    }
    
    // Update user tier
    user.tier = tier;
    user.features = this._getFeaturesForTier(tier);
    user.subscriptionType = isAnnual ? 'annual' : 'monthly';
    
    // Create or update subscription
    const subscription = {
      userId,
      tier,
      isAnnual,
      price,
      startDate: Date.now(),
      endDate: Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000,
      status: 'active'
    };
    
    this.subscriptions.set(userId, subscription);
    
    // Update user record
    this.users.set(userId, user);
    
    // Process referral commission
    if (user.referredBy) {
      await this._processReferralCommission(user.referredBy, price);
    }
    
    // Track analytics
    if (this.options.analyticsTracker) {
      this.options.analyticsTracker.trackEvent('user_upgraded', {
        userId,
        tier,
        isAnnual,
        price
      });
    }
    
    return user;
  }
  
  /**
   * Check if a user has access to a specific feature
   * 
   * @param {string} userId - User ID
   * @param {string} feature - Feature to check access for
   * @returns {boolean} Whether the user has access
   */
  checkAccess(userId, feature) {
    if (!this.users.has(userId)) {
      return false;
    }
    
    const user = this.users.get(userId);
    
    // Check if subscription is active
    if (user.tier !== TIERS.FREE) {
      const subscription = this.subscriptions.get(userId);
      if (!subscription || subscription.status !== 'active' || subscription.endDate < Date.now()) {
        // Subscription expired - downgrade to free
        user.tier = TIERS.FREE;
        user.features = this._getFeaturesForTier(TIERS.FREE);
        this.users.set(userId, user);
      }
    }
    
    return user.features.includes(feature);
  }
  
  /**
   * Get access level for a user
   * 
   * @param {string} userId - User ID
   * @param {string} level - Default access level
   * @returns {Object} Access configuration
   */
  getAccess(userId, level = TIERS.FREE) {
    if (!this.users.has(userId)) {
      // Default access for non-registered users
      return {
        alerts: false,
        nasdaqFusion: false,
        yieldCut: 0
      };
    }
    
    const user = this.users.get(userId);
    
    switch (user.tier) {
      case TIERS.PREMIUM:
        return {
          alerts: true,
          nasdaqFusion: true,
          yieldCut: REFERRAL_COMMISSION_RATE
        };
      case TIERS.ENTERPRISE:
        return {
          alerts: true,
          nasdaqFusion: true,
          customSims: true,
          daoVoting: true,
          yieldCut: REFERRAL_COMMISSION_RATE
        };
      case TIERS.FREE:
      default:
        return {
          alerts: false,
          nasdaqFusion: false,
          yieldCut: 0
        };
    }
  }
  
  /**
   * Track yield generated by a user
   * 
   * @param {string} userId - User ID
   * @param {number} amount - Yield amount
   * @param {Object} details - Additional details
   * @returns {Object} Updated yield tracking data
   */
  async trackYield(userId, amount, details = {}) {
    if (!this.users.has(userId)) {
      throw new Error('User not found');
    }
    
    if (!this.yieldTracking.has(userId)) {
      this.yieldTracking.set(userId, {
        total: 0,
        history: [],
        lastUpdated: Date.now()
      });
    }
    
    const tracking = this.yieldTracking.get(userId);
    
    // Update total yield
    tracking.total += amount;
    
    // Add to history
    tracking.history.push({
      amount,
      timestamp: Date.now(),
      ...details
    });
    
    // Keep history manageable
    if (tracking.history.length > 100) {
      tracking.history = tracking.history.slice(-100);
    }
    
    tracking.lastUpdated = Date.now();
    
    // Update tracking record
    this.yieldTracking.set(userId, tracking);
    
    // Check for eco-badge eligibility
    if (tracking.total >= ECO_BADGE_THRESHOLD) {
      await this._checkAndMintEcoBadge(userId, tracking.total);
    }
    
    // Process referral rewards
    const user = this.users.get(userId);
    if (user.referredBy) {
      await this._processReferralYield(user.referredBy, amount);
    }
    
    return tracking;
  }
  
  /**
   * Process referral rewards for all users
   * 
   * @returns {Object} Processing results
   */
  async processReferralRewards() {
    const results = {
      processed: 0,
      totalRewards: 0,
      errors: []
    };
    
    for (const [userId, user] of this.users.entries()) {
      if (user.referrals.length > 0) {
        try {
          let userRewards = 0;
          
          // Calculate rewards from each referral
          for (const referralId of user.referrals) {
            if (this.yieldTracking.has(referralId)) {
              const referralTracking = this.yieldTracking.get(referralId);
              
              // Get yield since last processing
              const lastProcessed = this.referrals.get(referralId)?.lastProcessed || 0;
              const newYield = referralTracking.history
                .filter(entry => entry.timestamp > lastProcessed)
                .reduce((sum, entry) => sum + entry.amount, 0);
              
              // Calculate commission
              const commission = newYield * REFERRAL_COMMISSION_RATE;
              userRewards += commission;
              
              // Update referral processing record
              this.referrals.set(referralId, {
                referrerId: userId,
                lastProcessed: Date.now()
              });
            }
          }
          
          if (userRewards > 0) {
            // Process reward payment
            if (this.options.paymentProcessor) {
              await this.options.paymentProcessor.processReward({
                userId,
                amount: userRewards,
                description: 'Referral yield commission'
              });
            }
            
            results.processed++;
            results.totalRewards += userRewards;
          }
        } catch (error) {
          results.errors.push({
            userId,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Get user statistics
   * 
   * @param {string} userId - User ID
   * @returns {Object} User statistics
   */
  getUserStats(userId) {
    if (!this.users.has(userId)) {
      throw new Error('User not found');
    }
    
    const user = this.users.get(userId);
    const yieldData = this.yieldTracking.get(userId) || { total: 0, history: [] };
    const subscription = this.subscriptions.get(userId);
    
    // Calculate referral stats
    let referralCount = user.referrals.length;
    let referralYield = 0;
    
    user.referrals.forEach(referralId => {
      if (this.yieldTracking.has(referralId)) {
        referralYield += this.yieldTracking.get(referralId).total;
      }
    });
    
    const referralCommission = referralYield * REFERRAL_COMMISSION_RATE;
    
    return {
      userId: user.userId,
      tier: user.tier,
      subscriptionStatus: subscription ? subscription.status : 'none',
      subscriptionEnds: subscription ? subscription.endDate : null,
      totalYield: yieldData.total,
      referralCount,
      referralCommission,
      ecoBadgeEligible: yieldData.total >= ECO_BADGE_THRESHOLD,
      registeredDays: Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000))
    };
  }
  
  /**
   * Get all users with their tier information
   * 
   * @returns {Array} User tier data
   */
  getAllUserTiers() {
    const result = [];
    
    for (const [userId, user] of this.users.entries()) {
      const subscription = this.subscriptions.get(userId);
      
      result.push({
        userId,
        email: user.email,
        tier: user.tier,
        subscriptionType: user.subscriptionType || 'none',
        status: subscription ? subscription.status : 'none',
        referralCount: user.referrals.length
      });
    }
    
    return result;
  }
  
  /**
   * Generate a referral code for a user
   * @private
   */
  _generateReferralCode(userId) {
    const prefix = userId.substring(0, 4);
    const timestamp = Date.now().toString(36).substring(4, 8);
    const random = Math.random().toString(36).substring(2, 6);
    
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }
  
  /**
   * Get features available for a specific tier
   * @private
   */
  _getFeaturesForTier(tier) {
    const features = {
      [TIERS.FREE]: [
        'basic_mocks',
        'market_view',
        'limited_alerts'
      ],
      [TIERS.PREMIUM]: [
        'basic_mocks',
        'market_view',
        'all_alerts',
        'nasdaq_fusion',
        'cross_market_arb',
        'referral_staking'
      ],
      [TIERS.ENTERPRISE]: [
        'basic_mocks',
        'market_view',
        'all_alerts',
        'nasdaq_fusion',
        'cross_market_arb',
        'referral_staking',
        'custom_sims',
        'dao_voting',
        'api_access',
        'priority_support'
      ]
    };
    
    return features[tier] || features[TIERS.FREE];
  }
  
  /**
   * Process referral commission for subscription payment
   * @private
   */
  async _processReferralCommission(referrerId, amount) {
    if (!this.users.has(referrerId)) {
      return;
    }
    
    // Calculate commission (one-time payment)
    const commission = amount * REFERRAL_COMMISSION_RATE;
    
    // Process payment to referrer
    if (this.options.paymentProcessor && commission > 0) {
      await this.options.paymentProcessor.processReward({
        userId: referrerId,
        amount: commission,
        description: 'Referral subscription commission'
      });
    }
    
    // Track analytics
    if (this.options.analyticsTracker) {
      this.options.analyticsTracker.trackEvent('referral_commission', {
        referrerId,
        amount: commission
      });
    }
  }
  
  /**
   * Process referral yield commission
   * @private
   */
  async _processReferralYield(referrerId, yieldAmount) {
    if (!this.users.has(referrerId)) {
      return;
    }
    
    // Calculate commission
    const commission = yieldAmount * REFERRAL_COMMISSION_RATE;
    
    // For yield, we typically batch process rewards rather than immediate payment
    // Just track the event for now
    if (this.options.analyticsTracker) {
      this.options.analyticsTracker.trackEvent('referral_yield', {
        referrerId,
        yieldAmount,
        commission
      });
    }
  }
  
  /**
   * Check eligibility and mint eco-badge NFT
   * @private
   */
  async _checkAndMintEcoBadge(userId, totalYield) {
    // Check if user already has the badge
    const user = this.users.get(userId);
    if (user.ecoBadge) {
      return;
    }
    
    // Mint NFT if eligible
    if (this.options.nftMinter && totalYield >= ECO_BADGE_THRESHOLD) {
      try {
        const nftResult = await this.options.nftMinter.mintEcoBadge({
          userId,
          yield: totalYield,
          timestamp: Date.now()
        });
        
        // Update user record
        user.ecoBadge = {
          tokenId: nftResult.tokenId,
          mintedAt: Date.now()
        };
        
        this.users.set(userId, user);
        
        // Track analytics
        if (this.options.analyticsTracker) {
          this.options.analyticsTracker.trackEvent('eco_badge_minted', {
            userId,
            tokenId: nftResult.tokenId,
            yield: totalYield
          });
        }
      } catch (error) {
        console.error(`Failed to mint eco-badge for user ${userId}:`, error);
      }
    }
  }
}

/**
 * Premium Tier for individual user
 * Simplified interface for accessing tier features
 */
class PremiumTier {
  /**
   * Initialize Premium Tier for a user
   * 
   * @param {string} userId - User ID
   * @param {PremiumTierManager} manager - Premium Tier Manager instance
   */
  constructor(userId, manager) {
    this.userId = userId;
    this.manager = manager;
  }
  
  /**
   * Get access configuration for this user
   * 
   * @param {string} level - Default access level
   * @returns {Object} Access configuration
   */
  getAccess(level = 'premium') {
    return this.manager.getAccess(this.userId, level);
  }
  
  /**
   * Check if user has access to a feature
   * 
   * @param {string} feature - Feature to check
   * @returns {boolean} Whether the user has access
   */
  hasAccess(feature) {
    return this.manager.checkAccess(this.userId, feature);
  }
  
  /**
   * Calculate commission cut from yield
   * 
   * @param {number} yield - Yield amount
   * @returns {number} Commission amount
   */
  calculateCut(yield) {
    const access = this.getAccess();
    return yield * access.yieldCut;
  }
  
  /**
   * Track yield for this user
   * 
   * @param {number} amount - Yield amount
   * @param {Object} details - Additional details
   * @returns {Object} Updated yield tracking
   */
  async trackYield(amount, details = {}) {
    return this.manager.trackYield(this.userId, amount, details);
  }
  
  /**
   * Get statistics for this user
   * 
   * @returns {Object} User statistics
   */
  getStats() {
    return this.manager.getUserStats(this.userId);
  }
  
  /**
   * Upgrade to a premium tier
   * 
   * @param {string} tier - Target tier
   * @param {boolean} isAnnual - Whether this is an annual subscription
   * @param {Object} paymentDetails - Payment details
   * @returns {Object} Updated user data
   */
  async upgrade(tier, isAnnual = false, paymentDetails = {}) {
    return this.manager.upgradeUser(this.userId, tier, isAnnual, paymentDetails);
  }
}

module.exports = {
  PremiumTierManager,
  PremiumTier,
  TIERS
};
