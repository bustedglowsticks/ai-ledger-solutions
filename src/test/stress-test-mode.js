/**
 * XRPL Liquidity Provider Bot - Stress Test Mode
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Live Validation Arena - Stress Test Mode
 * 
 * Provides advanced stress testing capabilities for the Live Validation Arena,
 * simulating extreme market conditions like ETF approval spikes, RLUSD de-pegging,
 * and other high-volatility scenarios.
 */

const logger = require('../utils/logger');

/**
 * Stress Test Mode
 * 
 * Enhances test scenarios with extreme market conditions
 * to validate system resilience and optimization capabilities.
 */
class StressTestMode {
  /**
   * Create a new Stress Test Mode
   * @param {Object} options - Stress test options
   */
  constructor(options = {}) {
    this.options = {
      etfInflowAmount: options.etfInflowAmount || 3700000000, // $3.7B default ETF inflow
      depegPercentage: options.depegPercentage || 0.15, // 15% default de-peg
      volatilityMultiplier: options.volatilityMultiplier || 2.5, // 2.5x default volatility multiplier
      apyMultiplier: options.apyMultiplier || 1.8, // 1.8x default APY multiplier for volatile conditions
      volumeMultiplier: options.volumeMultiplier || 4.0, // 4x default volume multiplier
      depthMultiplier: options.depthMultiplier || 3.0, // 3x default depth multiplier
      clawbackRiskMultiplier: options.clawbackRiskMultiplier || 3.0, // 3x default clawback risk multiplier
      rlusdAllocationPercentage: options.rlusdAllocationPercentage || 0.7, // 70% default RLUSD allocation
      ...options
    };
    
    // Bind methods
    this.enhanceScenario = this.enhanceScenario.bind(this);
    this.applyEtfApprovalSpike = this.applyEtfApprovalSpike.bind(this);
    this.applyRlusdDepeg = this.applyRlusdDepeg.bind(this);
    this.applyMarketCrash = this.applyMarketCrash.bind(this);
    this.applyFederationDisagreement = this.applyFederationDisagreement.bind(this);
  }
  
  /**
   * Enhance a test scenario with stress test conditions
   * @param {Object} scenario - Original test scenario
   * @param {string} stressType - Type of stress test to apply
   * @returns {Object} - Enhanced scenario
   */
  enhanceScenario(scenario, stressType) {
    logger.info(`Stress Test Mode: Enhancing scenario "${scenario.name}" with ${stressType} conditions`);
    
    let enhancedScenario = { ...scenario };
    
    switch (stressType) {
      case 'etf-approval':
        enhancedScenario = this.applyEtfApprovalSpike(enhancedScenario);
        break;
        
      case 'rlusd-depeg':
        enhancedScenario = this.applyRlusdDepeg(enhancedScenario);
        break;
        
      case 'market-crash':
        enhancedScenario = this.applyMarketCrash(enhancedScenario);
        break;
        
      case 'federation-disagreement':
        enhancedScenario = this.applyFederationDisagreement(enhancedScenario);
        break;
        
      default:
        logger.warn(`Stress Test Mode: Unknown stress test type "${stressType}"`);
    }
    
    return enhancedScenario;
  }
  
  /**
   * Apply ETF approval spike conditions to a scenario
   * @param {Object} scenario - Original scenario
   * @returns {Object} - Enhanced scenario
   */
  applyEtfApprovalSpike(scenario) {
    logger.info('Stress Test Mode: Applying ETF approval spike conditions');
    
    // Create a deep copy to avoid modifying the original
    const enhancedScenario = {
      ...scenario,
      name: `${scenario.name} (ETF Approval Spike)`,
      description: `${scenario.description} with ETF approval spike conditions ($${(this.options.etfInflowAmount / 1000000000).toFixed(1)}B inflows)`,
      pools: scenario.pools.map(pool => {
        // XRP pairs have much higher volatility and volume
        const isXrpPair = pool.id.startsWith('XRP_');
        
        return {
          ...pool,
          volatility: isXrpPair 
            ? Math.min(0.96, pool.volatility * this.options.volatilityMultiplier) 
            : pool.volatility * 1.2,
          volume24h: isXrpPair 
            ? pool.volume24h * this.options.volumeMultiplier 
            : pool.volume24h * 1.5,
          currentApy: isXrpPair 
            ? pool.currentApy * this.options.apyMultiplier 
            : pool.currentApy * 1.2,
          depth: isXrpPair 
            ? pool.depth * this.options.depthMultiplier 
            : pool.depth * 1.3
        };
      }),
      volatilityChanges: {
        'XRP_RLUSD': 0.5,  // Extreme volatility increase
        'XRP_ETH': 0.4,    // Major volatility increase
        'XRP_SOLAR': 0.35, // Significant volatility increase
        'XRP_CARBON': 0.3  // Moderate volatility increase
      },
      etfApprovalSpike: true,
      etfInflowAmount: this.options.etfInflowAmount
    };
    
    return enhancedScenario;
  }
  
  /**
   * Apply RLUSD de-peg conditions to a scenario
   * @param {Object} scenario - Original scenario
   * @returns {Object} - Enhanced scenario
   */
  applyRlusdDepeg(scenario) {
    logger.info(`Stress Test Mode: Applying RLUSD de-peg conditions (${this.options.depegPercentage * 100}%)`);
    
    // Create a deep copy to avoid modifying the original
    const enhancedScenario = {
      ...scenario,
      name: `${scenario.name} (RLUSD De-peg)`,
      description: `${scenario.description} with RLUSD de-pegging by ${this.options.depegPercentage * 100}%`,
      pools: scenario.pools.map(pool => {
        // RLUSD pairs have extreme volatility
        const isRlusdPair = pool.id.includes('RLUSD');
        
        return {
          ...pool,
          volatility: isRlusdPair 
            ? Math.min(0.98, pool.volatility * this.options.clawbackRiskMultiplier) 
            : pool.volatility,
          volume24h: isRlusdPair 
            ? pool.volume24h * this.options.volumeMultiplier * 0.6 
            : pool.volume24h,
          currentApy: isRlusdPair 
            ? pool.currentApy * this.options.apyMultiplier * 1.2 
            : pool.currentApy,
          clawbackRisk: isRlusdPair 
            ? Math.min(0.95, pool.clawbackRisk * this.options.clawbackRiskMultiplier) 
            : pool.clawbackRisk
        };
      }),
      volatilityChanges: {
        'XRP_RLUSD': 0.6,  // Extreme volatility increase
        'RLUSD_GOLD': 0.5  // Extreme volatility increase
      },
      rlusdDepeg: true,
      depegPercentage: this.options.depegPercentage,
      // Force high RLUSD allocation to test resilience
      forcedAllocation: {
        'XRP_RLUSD': this.options.rlusdAllocationPercentage * scenario.capital
      }
    };
    
    return enhancedScenario;
  }
  
  /**
   * Apply market crash conditions to a scenario
   * @param {Object} scenario - Original scenario
   * @returns {Object} - Enhanced scenario
   */
  applyMarketCrash(scenario) {
    logger.info('Stress Test Mode: Applying market crash conditions');
    
    // Create a deep copy to avoid modifying the original
    const enhancedScenario = {
      ...scenario,
      name: `${scenario.name} (Market Crash)`,
      description: `${scenario.description} with market-wide crash conditions`,
      pools: scenario.pools.map(pool => {
        return {
          ...pool,
          volatility: Math.min(0.95, pool.volatility * 2),
          volume24h: pool.volume24h * 3,
          currentApy: pool.currentApy * 0.7 // APY drops during crash
        };
      }),
      volatilityChanges: {
        'XRP_RLUSD': 0.4,
        'XRP_ETH': 0.5,
        'XRP_SOLAR': 0.4,
        'XRP_CARBON': 0.35,
        'RLUSD_GOLD': 0.3
      },
      marketCrash: true
    };
    
    return enhancedScenario;
  }
  
  /**
   * Apply federation disagreement conditions to a scenario
   * @param {Object} scenario - Original scenario
   * @returns {Object} - Enhanced scenario
   */
  applyFederationDisagreement(scenario) {
    logger.info('Stress Test Mode: Applying federation disagreement conditions');
    
    // Create a deep copy to avoid modifying the original
    const enhancedScenario = {
      ...scenario,
      name: `${scenario.name} (Federation Disagreement)`,
      description: `${scenario.description} with federation peers providing conflicting data`,
      volatilityChanges: {
        'XRP_RLUSD': 0.25,
        'XRP_ETH': 0.2
      },
      federationConflict: true,
      // Generate conflicting federation data
      conflictingFederationData: {
        'peer1': {
          'XRP_RLUSD': {
            apy: scenario.pools.find(p => p.id === 'XRP_RLUSD')?.currentApy * 1.4 || 0,
            volatility: scenario.pools.find(p => p.id === 'XRP_RLUSD')?.volatility * 0.7 || 0
          },
          'XRP_ETH': {
            apy: scenario.pools.find(p => p.id === 'XRP_ETH')?.currentApy * 1.3 || 0,
            volatility: scenario.pools.find(p => p.id === 'XRP_ETH')?.volatility * 0.8 || 0
          }
        },
        'peer2': {
          'XRP_RLUSD': {
            apy: scenario.pools.find(p => p.id === 'XRP_RLUSD')?.currentApy * 0.7 || 0,
            volatility: scenario.pools.find(p => p.id === 'XRP_RLUSD')?.volatility * 1.5 || 0
          },
          'XRP_ETH': {
            apy: scenario.pools.find(p => p.id === 'XRP_ETH')?.currentApy * 0.8 || 0,
            volatility: scenario.pools.find(p => p.id === 'XRP_ETH')?.volatility * 1.3 || 0
          }
        }
      }
    };
    
    return enhancedScenario;
  }
}

module.exports = StressTestMode;
