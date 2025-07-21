/**
 * XRPL Liquidity Provider Bot - Test Scenarios
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Live Validation Arena - Test Scenarios
 * 
 * Defines standard and stress test scenarios for dynamic allocation testing.
 */

// Base pool definitions
const basePools = [
  {
    id: 'XRP_RLUSD',
    asset1: { currency: 'XRP' },
    asset2: { currency: 'RLUSD', issuer: 'rXrpLUSD...' },
    volume24h: 5000000,
    volatility: 0.45,
    currentApy: 45.2,
    depth: 2000000,
    active: true,
    isStablecoinPool: true,
    isEcoRwa: false,
    rwaType: null,
    clawbackRisk: 0.05
  },
  {
    id: 'XRP_SOLAR',
    asset1: { currency: 'XRP' },
    asset2: { currency: 'SOLAR', issuer: 'rSolar...' },
    volume24h: 1200000,
    volatility: 0.35,
    currentApy: 52.8,
    depth: 800000,
    active: true,
    isStablecoinPool: false,
    isEcoRwa: true,
    rwaType: 'solar',
    clawbackRisk: 0.12
  },
  {
    id: 'RLUSD_GOLD',
    asset1: { currency: 'RLUSD', issuer: 'rXrpLUSD...' },
    asset2: { currency: 'GOLD', issuer: 'rGold...' },
    volume24h: 3200000,
    volatility: 0.25,
    currentApy: 38.5,
    depth: 1500000,
    active: true,
    isStablecoinPool: true,
    isEcoRwa: true,
    rwaType: 'gold',
    clawbackRisk: 0.08
  },
  {
    id: 'XRP_ETH',
    asset1: { currency: 'XRP' },
    asset2: { currency: 'ETH', issuer: 'rEth...' },
    volume24h: 4800000,
    volatility: 0.55,
    currentApy: 58.2,
    depth: 2500000,
    active: true,
    isStablecoinPool: false,
    isEcoRwa: false,
    rwaType: null,
    clawbackRisk: 0.15
  },
  {
    id: 'XRP_CARBON',
    asset1: { currency: 'XRP' },
    asset2: { currency: 'CARBON', issuer: 'rCarbon...' },
    volume24h: 980000,
    volatility: 0.40,
    currentApy: 62.5,
    depth: 650000,
    active: true,
    isStablecoinPool: false,
    isEcoRwa: true,
    rwaType: 'carbon',
    clawbackRisk: 0.10
  }
];

// Standard test scenarios
const standardScenarios = [
  {
    name: 'Baseline Allocation',
    description: 'Standard allocation with normal market conditions',
    capital: 100000,
    pools: basePools,
    volatilityChanges: {}
  },
  {
    name: 'Eco-Bonus Impact',
    description: 'Testing the impact of eco-bonuses on allocation',
    capital: 100000,
    pools: basePools.map(pool => ({
      ...pool,
      // Boost APY for eco pools to test eco-bonus impact
      currentApy: pool.isEcoRwa ? pool.currentApy * 1.1 : pool.currentApy
    })),
    volatilityChanges: {}
  },
  {
    name: 'Volatility Shift',
    description: 'Testing rebalancing when volatility increases',
    capital: 100000,
    pools: basePools,
    volatilityChanges: {
      'XRP_RLUSD': 0.3, // Increase volatility by 0.3
      'XRP_ETH': 0.2    // Increase volatility by 0.2
    }
  },
  {
    name: 'Stablecoin Preference',
    description: 'Testing preference for stablecoin pools',
    capital: 100000,
    pools: basePools.map(pool => ({
      ...pool,
      // Slightly lower APY for stablecoin pools to test preference
      currentApy: pool.isStablecoinPool ? pool.currentApy * 0.95 : pool.currentApy
    })),
    volatilityChanges: {}
  },
  {
    name: 'Capital Scaling',
    description: 'Testing allocation with different capital amounts',
    capital: 500000, // 5x more capital
    pools: basePools,
    volatilityChanges: {}
  }
];

// Stress test scenarios
const stressScenarios = [
  {
    name: 'ETF Approval Spike',
    description: 'Simulating market conditions after XRP ETF approval with $3.7B inflows',
    capital: 100000,
    pools: basePools.map(pool => {
      // XRP pairs have much higher volatility and volume
      const isXrpPair = pool.id.startsWith('XRP_');
      return {
        ...pool,
        volatility: isXrpPair ? Math.min(0.96, pool.volatility * 2.5) : pool.volatility * 1.2,
        volume24h: isXrpPair ? pool.volume24h * 4 : pool.volume24h * 1.5,
        currentApy: isXrpPair ? pool.currentApy * 1.8 : pool.currentApy * 1.2,
        depth: isXrpPair ? pool.depth * 3 : pool.depth * 1.3
      };
    }),
    volatilityChanges: {
      'XRP_RLUSD': 0.5,  // Extreme volatility increase
      'XRP_ETH': 0.4,    // Major volatility increase
      'XRP_SOLAR': 0.35, // Significant volatility increase
      'XRP_CARBON': 0.3  // Moderate volatility increase
    }
  },
  {
    name: 'RLUSD De-peg Event',
    description: 'Simulating RLUSD de-pegging event with extreme volatility',
    capital: 100000,
    pools: basePools.map(pool => {
      // RLUSD pairs have extreme volatility
      const isRlusdPair = pool.id.includes('RLUSD');
      return {
        ...pool,
        volatility: isRlusdPair ? Math.min(0.98, pool.volatility * 3) : pool.volatility,
        volume24h: isRlusdPair ? pool.volume24h * 2.5 : pool.volume24h,
        currentApy: isRlusdPair ? pool.currentApy * 2.2 : pool.currentApy,
        clawbackRisk: isRlusdPair ? pool.clawbackRisk * 3 : pool.clawbackRisk
      };
    }),
    volatilityChanges: {
      'XRP_RLUSD': 0.6,  // Extreme volatility increase
      'RLUSD_GOLD': 0.5  // Extreme volatility increase
    }
  },
  {
    name: 'Eco-RWA Boom',
    description: 'Simulating surge in eco-friendly RWA demand',
    capital: 100000,
    pools: basePools.map(pool => {
      // Eco-RWA pools have higher APY and volume
      return {
        ...pool,
        volume24h: pool.isEcoRwa ? pool.volume24h * 3 : pool.volume24h,
        currentApy: pool.isEcoRwa ? pool.currentApy * 1.7 : pool.currentApy,
        depth: pool.isEcoRwa ? pool.depth * 2 : pool.depth
      };
    }),
    volatilityChanges: {
      'XRP_SOLAR': 0.2,   // Moderate volatility increase
      'XRP_CARBON': 0.25, // Moderate volatility increase
      'RLUSD_GOLD': 0.15  // Slight volatility increase
    }
  },
  {
    name: 'Market Crash',
    description: 'Simulating market-wide crash with extreme volatility',
    capital: 100000,
    pools: basePools.map(pool => {
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
    }
  },
  {
    name: 'Federation Disagreement',
    description: 'Simulating scenario where federation peers have conflicting data',
    capital: 100000,
    pools: basePools,
    volatilityChanges: {
      'XRP_RLUSD': 0.25,
      'XRP_ETH': 0.2
    },
    federationConflict: true // Flag for test runner to simulate conflicting federation data
  }
];

module.exports = {
  basePools,
  standardScenarios,
  stressScenarios,
  testScenarios: {
    standardScenarios,
    stressScenarios
  }
};
