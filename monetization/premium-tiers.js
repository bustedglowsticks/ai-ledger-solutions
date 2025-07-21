/**
 * Premium Tiers System for XRPL Bot
 * 
 * Monetization strategy for Yield DAO Launcher:
 * - $49/mo for federated AI access
 * - 15% yield cut from managed pools
 * - Referral DAOs with XRP staking for bonuses
 * - Eco-RWA integration with 24% green bonuses
 * 
 * Target: 100 users generating $5K/month passive income
 * 2025 Edition - Optimized for ETF-driven XRP ecosystem
 */

const xrpl = require('xrpl');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class PremiumTiersSystem {
  constructor(config = {}) {
    this.config = {
      tiers: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          features: [
            'Basic yield optimization',
            'Public pool access',
            'Standard dashboard'
          ],
          limits: {
            maxCapital: 5000, // Max 5K XRP
            maxPools: 3,
            apiCallsPerDay: 100
          }
        },
        {
          id: 'basic',
          name: 'Basic',
          price: 19.99,
          features: [
            'Advanced yield optimization',
            'Priority pool access',
            'Enhanced dashboard',
            'Email alerts'
          ],
          limits: {
            maxCapital: 25000, // Max 25K XRP
            maxPools: 5,
            apiCallsPerDay: 500
          },
          yieldFee: 0.10 // 10% yield fee
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 49.99,
          features: [
            'Federated AI access',
            'Premium pool access',
            'Real-time alerts',
            'ETF surge notifications',
            'Quantum optimizer access',
            'Weekly strategy reports'
          ],
          limits: {
            maxCapital: 100000, // Max 100K XRP
            maxPools: 10,
            apiCallsPerDay: 2000
          },
          yieldFee: 0.15 // 15% yield fee
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 199.99,
          features: [
            'Custom AI models',
            'Dedicated pools',
            'White-glove service',
            'API integration',
            'Custom reporting',
            'Institutional access',
            'Founder DAO tokens'
          ],
          limits: {
            maxCapital: 1000000, // Max 1M XRP
            maxPools: 'Unlimited',
            apiCallsPerDay: 10000
          },
          yieldFee: 0.20 // 20% yield fee
        }
      ],
      referralBonus: 0.20, // 20% of referred user's subscription
      ecoBonus: 0.24, // 24% bonus for eco-friendly pools
      stakingRequirements: {
        basic: 100,    // 100 XRP to unlock Basic tier benefits
        pro: 1000,     // 1000 XRP to unlock Pro tier benefits
        enterprise: 10000 // 10000 XRP to unlock Enterprise tier benefits
      },
      daoTokenDistribution: {
        users: 0.40,   // 40% to users
        referrers: 0.20, // 20% to referrers
        ecoStakers: 0.20, // 20% to eco-friendly stakers
        treasury: 0.20  // 20% to treasury
      },
      jwtSecret: process.env.JWT_SECRET || 'xrpl-yield-dao-launcher-2025',
      subscriptionRenewalDays: 30,
      ...config
    };
    
    this.users = new Map();
    this.subscriptions = new Map();
    this.referrals = new Map();
    this.daoTokens = new Map();
    this.totalRevenue = 0;
    this.monthlyRevenue = 0;
    this.yieldFeesCollected = 0;
  }

  /**
   * Initialize the Premium Tiers System
   * @param {Object} xrplClient - XRPL client instance
   */
  async initialize(xrplClient) {
    this.xrplClient = xrplClient;
    
    // Load existing users and subscriptions
    await this.loadUsers();
    
    console.log('Premium Tiers System initialized - ready for $5K/month passive income');
    
    // Start monthly revenue tracking
    this.startRevenueTracking();
  }

  /**
   * Load existing users from storage
   */
  async loadUsers() {
    try {
      // In a real implementation, this would load from a database
      console.log('Loading existing users and subscriptions');
      
      // For demo purposes, we'll create some sample users
      this.createSampleUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  /**
   * Create sample users for demonstration
   */
  createSampleUsers() {
    // Create 10 sample users
    for (let i = 1; i <= 10; i++) {
      const userId = `user${i}`;
      const tierIndex = Math.min(Math.floor(Math.random() * 4), 3);
      const tier = this.config.tiers[tierIndex];
      
      // Create user
      this.users.set(userId, {
        id: userId,
        email: `user${i}@example.com`,
        walletAddress: `r${crypto.randomBytes(16).toString('hex')}`,
        staked: Math.random() * 5000,
        isEcoStaker: Math.random() > 0.5,
        referredBy: i > 5 ? `user${i-5}` : null,
        referralCode: `REF${userId.toUpperCase()}`,
        createdAt: new Date().toISOString()
      });
      
      // Create subscription
      if (tier.id !== 'free') {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + this.config.subscriptionRenewalDays);
        
        this.subscriptions.set(userId, {
          userId,
          tierId: tier.id,
          price: tier.price,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: true,
          autoRenew: Math.random() > 0.3
        });
        
        // Track revenue
        this.totalRevenue += tier.price;
        this.monthlyRevenue += tier.price;
      }
      
      // Add referral if applicable
      if (i > 5) {
        const referrerId = `user${i-5}`;
        const referrals = this.referrals.get(referrerId) || [];
        referrals.push(userId);
        this.referrals.set(referrerId, referrals);
      }
      
      // Assign DAO tokens
      this.daoTokens.set(userId, Math.random() * 1000);
    }
    
    console.log(`Created ${this.users.size} sample users`);
    console.log(`Current monthly revenue: $${this.monthlyRevenue.toFixed(2)}`);
  }

  /**
   * Start tracking monthly revenue
   */
  startRevenueTracking() {
    // Reset monthly revenue at the beginning of each month
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1) {
        console.log(`Monthly revenue for previous month: $${this.monthlyRevenue.toFixed(2)}`);
        this.monthlyRevenue = 0;
      }
    }, 86400000); // Check daily
  }

  /**
   * Register a new user
   * @param {Object} userData - User data
   * @param {string} referralCode - Optional referral code
   * @returns {Object} - New user data
   */
  async registerUser(userData, referralCode = null) {
    try {
      const userId = `user${Date.now()}`;
      
      // Check if referral code is valid
      let referrerId = null;
      if (referralCode) {
        for (const [id, user] of this.users.entries()) {
          if (user.referralCode === referralCode) {
            referrerId = id;
            break;
          }
        }
      }
      
      // Create new user
      const newUser = {
        id: userId,
        email: userData.email,
        walletAddress: userData.walletAddress,
        staked: 0,
        isEcoStaker: false,
        referredBy: referrerId,
        referralCode: `REF${userId.toUpperCase()}`,
        createdAt: new Date().toISOString()
      };
      
      this.users.set(userId, newUser);
      
      // Update referrals if applicable
      if (referrerId) {
        const referrals = this.referrals.get(referrerId) || [];
        referrals.push(userId);
        this.referrals.set(referrerId, referrals);
        
        console.log(`User ${userId} registered with referral from ${referrerId}`);
      } else {
        console.log(`User ${userId} registered without referral`);
      }
      
      // Assign initial free subscription
      this.subscriptions.set(userId, {
        userId,
        tierId: 'free',
        price: 0,
        startDate: new Date().toISOString(),
        endDate: null, // Free tier doesn't expire
        isActive: true,
        autoRenew: false
      });
      
      // Assign initial DAO tokens
      this.daoTokens.set(userId, 10); // 10 welcome tokens
      
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to a premium tier
   * @param {string} userId - User ID
   * @param {string} tierId - Tier ID
   * @returns {Object} - Subscription data
   */
  async subscribe(userId, tierId) {
    if (!userId) {
      throw new Error('User ID is required for subscription');
    }
    try {
      // Validate user
      const user = this.users.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Validate tier
      const tier = this.config.tiers.find(t => t.id === tierId);
      if (!tier) {
        throw new Error(`Tier ${tierId} not found`);
      }
      
      // Check staking requirements
      if (tier.id !== 'free' && this.config.stakingRequirements[tier.id]) {
        const requiredStake = this.config.stakingRequirements[tier.id];
        if (user.staked < requiredStake) {
          throw new Error(`Insufficient stake. Required: ${requiredStake} XRP, Current: ${user.staked} XRP`);
        }
      }
      
      // Create subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + this.config.subscriptionRenewalDays);
      
      // Create or update subscription
      const subscription = {
        userId,
        tierId,
        price: tier.price,
        startDate: startDate.toISOString(),
        endDate: tier.id === 'free' ? null : endDate.toISOString(),
        isActive: true,
        autoRenew: tier.id !== 'free'
      };
      
      this.subscriptions.set(userId, subscription);
      
      // Track revenue for paid tiers
      if (tier.id !== 'free') {
        this.totalRevenue += tier.price;
        this.monthlyRevenue += tier.price;
        
        // Process referral bonus if applicable
        if (user.referredBy) {
          await this.processReferralBonus(user.referredBy, tier.price);
        }
        
        console.log(`User ${userId} subscribed to ${tier.name} tier for $${tier.price}`);
        console.log(`Current monthly revenue: $${this.monthlyRevenue.toFixed(2)}`);
      }
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing user:', error);
      throw error;
    }
  }

  /**
   * Process referral bonus
   * @param {string} referrerId - Referrer user ID
   * @param {number} subscriptionPrice - Subscription price
   */
  async processReferralBonus(referrerId, subscriptionPrice) {
    try {
      const referrer = this.users.get(referrerId);
      if (!referrer) {
        return;
      }
      
      // Calculate bonus
      const bonusAmount = subscriptionPrice * this.config.referralBonus;
      
      // Add DAO tokens as bonus
      const currentTokens = this.daoTokens.get(referrerId) || 0;
      const bonusTokens = bonusAmount * 10; // 10 tokens per dollar
      this.daoTokens.set(referrerId, currentTokens + bonusTokens);
      
      console.log(`Referral bonus for ${referrerId}: $${bonusAmount.toFixed(2)} (${bonusTokens} DAO tokens)`);
    } catch (error) {
      console.error('Error processing referral bonus:', error);
    }
  }

  /**
   * Stake XRP for tier benefits and DAO governance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to stake
   * @param {boolean} isEco - Whether staking for eco-friendly pools
   * @returns {Object} - Updated user data
   */
  async stakeXRP(userId, amount, isEco = false) {
    try {
      // Validate user
      const user = this.users.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Update staked amount
      user.staked += amount;
      user.isEcoStaker = isEco || user.isEcoStaker;
      
      // Calculate DAO tokens to mint
      let tokenAmount = amount * 2; // Base: 2 tokens per XRP
      
      // Apply eco bonus if applicable
      if (isEco) {
        tokenAmount *= (1 + this.config.ecoBonus); // 24% eco bonus
      }
      
      // Add DAO tokens
      const currentTokens = this.daoTokens.get(userId) || 0;
      this.daoTokens.set(userId, currentTokens + tokenAmount);
      
      console.log(`User ${userId} staked ${amount} XRP (${isEco ? 'eco' : 'standard'})`);
      console.log(`Minted ${tokenAmount} DAO tokens, new balance: ${currentTokens + tokenAmount}`);
      
      // Check if user unlocked new tier benefits
      await this.checkTierUpgrades(userId);
      
      return user;
    } catch (error) {
      console.error('Error staking XRP:', error);
      throw error;
    }
  }

  /**
   * Check if user qualifies for tier upgrades
   * @param {string} userId - User ID
   */
  async checkTierUpgrades(userId) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return;
      }
      
      // Get current subscription
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return;
      }
      
      // Check if user qualifies for higher tier
      for (const tier of ['enterprise', 'pro', 'basic']) {
        const requiredStake = this.config.stakingRequirements[tier];
        
        if (user.staked >= requiredStake && subscription.tierId !== tier) {
          // User qualifies for higher tier
          const currentTier = this.config.tiers.find(t => t.id === subscription.tierId);
          const newTier = this.config.tiers.find(t => t.id === tier);
          
          console.log(`User ${userId} qualifies for ${newTier.name} tier upgrade (${user.staked} XRP staked)`);
          
          // Notify user about qualification (in real implementation)
          break;
        }
      }
    } catch (error) {
      console.error('Error checking tier upgrades:', error);
    }
  }

  /**
   * Process yield fees from user's profits
   * @param {string} userId - User ID
   * @param {number} yieldAmount - Total yield amount
   * @returns {Object} - Fee details
   */
  async processYieldFees(userId, yieldAmount) {
    try {
      // Validate user
      const user = this.users.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Get subscription
      const subscription = this.subscriptions.get(userId);
      if (!subscription || !subscription.isActive) {
        return { fee: 0, net: yieldAmount };
      }
      
      // Get tier
      const tier = this.config.tiers.find(t => t.id === subscription.tierId);
      if (!tier || !tier.yieldFee) {
        return { fee: 0, net: yieldAmount };
      }
      
      // Calculate fee
      const feePercentage = tier.yieldFee;
      let feeAmount = yieldAmount * feePercentage;
      
      // Apply eco discount if applicable
      if (user.isEcoStaker) {
        feeAmount *= (1 - this.config.ecoBonus); // 24% discount for eco stakers
      }
      
      // Update yield fees collected
      this.yieldFeesCollected += feeAmount;
      
      // Calculate net yield
      const netYield = yieldAmount - feeAmount;
      
      console.log(`Yield fee for ${userId}: ${feeAmount.toFixed(2)} XRP (${feePercentage * 100}% of ${yieldAmount.toFixed(2)} XRP)`);
      console.log(`Net yield: ${netYield.toFixed(2)} XRP`);
      console.log(`Total yield fees collected: ${this.yieldFeesCollected.toFixed(2)} XRP`);
      
      return {
        fee: feeAmount,
        net: netYield,
        percentage: feePercentage
      };
    } catch (error) {
      console.error('Error processing yield fees:', error);
      throw error;
    }
  }

  /**
   * Generate authentication token for user
   * @param {string} userId - User ID
   * @returns {string} - JWT token
   */
  generateAuthToken(userId) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      const subscription = this.subscriptions.get(userId) || { tierId: 'free' };
      const tier = this.config.tiers.find(t => t.id === subscription.tierId);
      
      // Create token payload
      const payload = {
        userId,
        email: user.email,
        walletAddress: user.walletAddress,
        tier: subscription.tierId,
        limits: tier.limits,
        isEcoStaker: user.isEcoStaker,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      };
      
      // Sign token
      const token = jwt.sign(payload, this.config.jwtSecret);
      
      return token;
    } catch (error) {
      console.error('Error generating auth token:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   * @returns {Object} - System stats
   */
  getStats() {
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive && sub.tierId !== 'free');
    
    const tierCounts = {};
    this.config.tiers.forEach(tier => {
      tierCounts[tier.id] = Array.from(this.subscriptions.values())
        .filter(sub => sub.tierId === tier.id && sub.isActive)
        .length;
    });
    
    const ecoStakers = Array.from(this.users.values())
      .filter(user => user.isEcoStaker)
      .length;
    
    return {
      totalUsers: this.users.size,
      activeSubscriptions: activeSubscriptions.length,
      tierCounts,
      totalRevenue: this.totalRevenue,
      monthlyRevenue: this.monthlyRevenue,
      yieldFeesCollected: this.yieldFeesCollected,
      totalReferrals: Array.from(this.referrals.values())
        .reduce((sum, refs) => sum + refs.length, 0),
      ecoStakers,
      totalDaoTokens: Array.from(this.daoTokens.values())
        .reduce((sum, tokens) => sum + tokens, 0)
    };
  }
}

module.exports = PremiumTiersSystem;
