/**
 * Simple RLUSD-Weighted Dynamic Allocation Demo
 * 
 * This script demonstrates the core concepts of the RLUSD-weighted
 * dynamic allocation strategy for high-volatility scenarios.
 */

console.log('='.repeat(80));
console.log('SIMPLE RLUSD-WEIGHTED DYNAMIC ALLOCATION DEMO');
console.log('July 16, 2025 - High Volatility Scenario');
console.log('='.repeat(80));

// Capital to allocate
const capital = 10000; // 10,000 XRP

// Sample liquidity pools
const pools = [
  {
    name: 'XRP/RLUSD',
    isStable: false,
    isEco: false,
    baseAPY: 0.25 // 25% base APY
  },
  {
    name: 'RLUSD/USD',
    isStable: true,
    isEco: false,
    baseAPY: 0.12 // 12% base APY
  },
  {
    name: 'XRP/ETH',
    isStable: false,
    isEco: false,
    baseAPY: 0.18 // 18% base APY
  },
  {
    name: 'XRP/GreenToken',
    isStable: false,
    isEco: true, // Eco-friendly token
    baseAPY: 0.15 // 15% base APY
  }
];

// Configuration
const ecoBoostMultiplier = 1.24;
const highVolThreshold = 0.5;
const rlusdHighVolAllocation = 0.8;

console.log(`\nOptimizing allocation for ${capital} XRP across ${pools.length} pools`);
console.log('Available pools:');
pools.forEach(pool => {
  console.log(`- ${pool.name} (Base APY: ${(pool.baseAPY * 100).toFixed(2)}%, Eco: ${pool.isEco ? 'Yes' : 'No'}, Stable: ${pool.isStable ? 'Yes' : 'No'})`);
});

// Dynamic allocation function
function dynamicAllocate(capital, pools, vol, sentiment) {
  // Find RLUSD pool index
  let rlusdIndex = pools.findIndex(p => p.name.includes('RLUSD'));
  if (rlusdIndex === -1) {
    console.warn('No RLUSD pool found, using first stable pool as fallback');
    rlusdIndex = pools.findIndex(p => p.isStable) || 0;
  }
  
  // Initialize allocations array
  const allocations = new Array(pools.length).fill(0);
  
  // High volatility strategy: Concentrate in RLUSD for stability
  if (vol > highVolThreshold) {
    console.log(`HIGH VOLATILITY DETECTED (${vol.toFixed(2)} > ${highVolThreshold.toFixed(2)})`);
    console.log(`Applying RLUSD-Weighted Dynamic Allocation (${rlusdHighVolAllocation * 100}% to RLUSD)`);
    
    // Allocate majority to RLUSD for hedging
    allocations[rlusdIndex] = capital * rlusdHighVolAllocation;
    
    // Distribute remaining with eco-bonus
    const remaining = capital * (1 - rlusdHighVolAllocation);
    let totalWeight = 0;
    
    // Calculate weights for remaining pools
    const weights = pools.map((pool, i) => {
      if (i === rlusdIndex) return 0;
      
      // Base weight
      let weight = 1;
      
      // Apply eco boost
      if (pool.isEco) {
        weight *= ecoBoostMultiplier;
      }
      
      // Apply sentiment boost for certain assets
      if (pool.name.includes('XRP') && sentiment > 0.6) {
        weight *= (1 + (sentiment - 0.6) * 2); // Up to 2x boost at sentiment = 1.0
      }
      
      totalWeight += weight;
      return weight;
    });
    
    // Distribute remaining capital proportionally
    pools.forEach((pool, i) => {
      if (i !== rlusdIndex && totalWeight > 0) {
        allocations[i] = remaining * (weights[i] / totalWeight);
      }
    });
  } else {
    // Normal volatility: Use more balanced approach
    console.log(`Normal volatility level (${vol.toFixed(2)} <= ${highVolThreshold.toFixed(2)})`);
    console.log('Using balanced allocation strategy');
    
    // Calculate base weights
    const weights = pools.map(pool => {
      let weight = 1;
      
      // Apply eco boost
      if (pool.isEco) {
        weight *= (ecoBoostMultiplier - 0.5); // Smaller eco boost in normal vol
      }
      
      // Apply sentiment boost
      if (pool.name.includes('XRP')) {
        weight *= (1 + (sentiment - 0.5)); // Sentiment-based boost
      }
      
      // Apply stability premium for RLUSD in normal conditions
      if (pool.name.includes('RLUSD')) {
        weight *= 1.2; // 20% premium for stability
      }
      
      return weight;
    });
    
    // Calculate total weight
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    // Distribute capital proportionally
    pools.forEach((pool, i) => {
      allocations[i] = capital * (weights[i] / totalWeight);
    });
  }
  
  return allocations;
}

// Calculate expected yield
function calculateExpectedYield(allocations, pools, vol) {
  // Base APY for each pool
  const baseAPYs = pools.map(pool => {
    // Estimate base APY based on pool characteristics
    let baseAPY = pool.baseAPY || 0.15; // 15% default
    
    // Adjust for volatility
    if (vol > 0.7) {
      // High volatility can increase fees but also IL
      baseAPY *= (1 + vol * 0.5); // Up to 50% boost at max vol
    }
    
    return baseAPY;
  });
  
  // Calculate weighted average APY
  let totalCapital = allocations.reduce((sum, a) => sum + a, 0);
  let weightedAPY = 0;
  
  if (totalCapital > 0) {
    weightedAPY = allocations.reduce((sum, allocation, i) => {
      return sum + (allocation / totalCapital) * baseAPYs[i];
    }, 0);
  }
  
  // Calculate IL risk
  const ilRisk = allocations.reduce((sum, allocation, i) => {
    const pool = pools[i];
    let poolRisk = 0;
    
    // Stable pairs have lower IL risk
    if (pool.isStable) {
      poolRisk = 0.05;
    } 
    // XRP pairs have higher IL risk in high vol
    else if (pool.name.includes('XRP')) {
      poolRisk = 0.2 + vol * 0.3; // Up to 0.5 at max vol
    }
    // Other pairs have moderate IL risk
    else {
      poolRisk = 0.1 + vol * 0.2; // Up to 0.3 at max vol
    }
    
    return sum + (allocation / totalCapital) * poolRisk;
  }, 0);
  
  // Adjust for IL
  const netAPY = Math.max(0, weightedAPY - ilRisk * vol * 0.5);
  
  return {
    baseAPY: weightedAPY,
    ilRisk,
    netAPY,
    projectedAnnualYield: netAPY * totalCapital
  };
}

// Test with normal volatility
console.log('\n1. NORMAL VOLATILITY SCENARIO');
console.log('-'.repeat(50));
const normalVol = 0.3;
const normalSentiment = 0.6;
const normalAllocations = dynamicAllocate(capital, pools, normalVol, normalSentiment);

console.log('\nAllocation Results:');
pools.forEach((pool, i) => {
  const allocation = normalAllocations[i];
  const percentage = (allocation / capital) * 100;
  console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
});

const normalYield = calculateExpectedYield(normalAllocations, pools, normalVol);
console.log('\nYield Projection:');
console.log(`- Base APY: ${(normalYield.baseAPY * 100).toFixed(2)}%`);
console.log(`- IL Risk: ${(normalYield.ilRisk * 100).toFixed(2)}%`);
console.log(`- Net APY: ${(normalYield.netAPY * 100).toFixed(2)}%`);
console.log(`- Projected Annual Yield: ${normalYield.projectedAnnualYield.toFixed(2)} XRP`);

// Test with high volatility (July 16, 2025 scenario)
console.log('\n2. HIGH VOLATILITY SCENARIO (July 16, 2025)');
console.log('-'.repeat(50));
const highVol = 0.96;
const highSentiment = 0.7;
const highVolAllocations = dynamicAllocate(capital, pools, highVol, highSentiment);

console.log('\nAllocation Results:');
pools.forEach((pool, i) => {
  const allocation = highVolAllocations[i];
  const percentage = (allocation / capital) * 100;
  console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
});

const highVolYield = calculateExpectedYield(highVolAllocations, pools, highVol);
console.log('\nYield Projection:');
console.log(`- Base APY: ${(highVolYield.baseAPY * 100).toFixed(2)}%`);
console.log(`- IL Risk: ${(highVolYield.ilRisk * 100).toFixed(2)}%`);
console.log(`- Net APY: ${(highVolYield.netAPY * 100).toFixed(2)}%`);
console.log(`- Projected Annual Yield: ${highVolYield.projectedAnnualYield.toFixed(2)} XRP`);

// Extrapolate to higher APY scenarios
console.log('\n3. OPTIMISTIC 2025 SCENARIO PROJECTIONS');
console.log('-'.repeat(50));

const optimisticAPYs = [0.4, 0.6, 0.8];
console.log('Projecting returns with higher base APYs (2025 optimistic scenarios):');

optimisticAPYs.forEach(apy => {
  const annualReturn = apy * (1 - highVolYield.ilRisk * 0.5);
  const annualYield = capital * annualReturn;
  console.log(`- Base APY ${(apy * 100).toFixed(0)}%: ${(annualReturn * 100).toFixed(2)}% net APY, ${annualYield.toFixed(2)} XRP annual yield`);
});

// Demonstrate DAO governance impact
console.log('\n4. DAO GOVERNANCE IMPACT SIMULATION');
console.log('-'.repeat(50));

// Governance options
const governanceOptions = [
  { name: 'High RLUSD Allocation', highVolThreshold: 0.4, rlusdHighVolAllocation: 0.9, ecoBoostMultiplier: 1.15 },
  { name: 'Balanced Approach', highVolThreshold: 0.5, rlusdHighVolAllocation: 0.8, ecoBoostMultiplier: 1.24 },
  { name: 'Eco-Friendly Focus', highVolThreshold: 0.6, rlusdHighVolAllocation: 0.7, ecoBoostMultiplier: 1.35 }
];

console.log('How DAO governance affects allocation strategy:');

for (const option of governanceOptions) {
  console.log(`\nGovernance Option: ${option.name}`);
  console.log(`- High Vol Threshold: ${option.highVolThreshold}`);
  console.log(`- RLUSD High-Vol Allocation: ${(option.rlusdHighVolAllocation * 100).toFixed(0)}%`);
  console.log(`- Eco-Boost Multiplier: ${option.ecoBoostMultiplier.toFixed(2)}x`);
  
  // Custom dynamic allocation function for governance simulation
  function governanceAllocate(capital, pools, vol, sentiment, govOption) {
    const allocations = new Array(pools.length).fill(0);
    const rlusdIndex = pools.findIndex(p => p.name.includes('RLUSD'));
    
    if (vol > govOption.highVolThreshold) {
      // High volatility strategy with governance parameters
      allocations[rlusdIndex] = capital * govOption.rlusdHighVolAllocation;
      
      // Distribute remaining with eco-bonus
      const remaining = capital * (1 - govOption.rlusdHighVolAllocation);
      let totalWeight = 0;
      
      // Calculate weights
      const weights = pools.map((pool, i) => {
        if (i === rlusdIndex) return 0;
        let weight = 1;
        if (pool.isEco) weight *= govOption.ecoBoostMultiplier;
        totalWeight += weight;
        return weight;
      });
      
      // Distribute remaining
      pools.forEach((pool, i) => {
        if (i !== rlusdIndex && totalWeight > 0) {
          allocations[i] = remaining * (weights[i] / totalWeight);
        }
      });
    } else {
      // Normal volatility with balanced approach
      const weights = pools.map(pool => {
        let weight = 1;
        if (pool.isEco) weight *= (govOption.ecoBoostMultiplier - 0.5);
        if (pool.name.includes('RLUSD')) weight *= 1.2;
        return weight;
      });
      
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      pools.forEach((_, i) => {
        allocations[i] = capital * (weights[i] / totalWeight);
      });
    }
    
    return allocations;
  }
  
  // Calculate allocation with these parameters
  const govAllocations = governanceAllocate(capital, pools, highVol, highSentiment, option);
  
  console.log('\nResulting Allocation:');
  pools.forEach((pool, i) => {
    const allocation = govAllocations[i];
    const percentage = (allocation / capital) * 100;
    console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
  });
  
  // Calculate yield with governance parameters
  const govYield = calculateExpectedYield(govAllocations, pools, highVol);
  console.log(`Net APY: ${(govYield.netAPY * 100).toFixed(2)}%, Annual Yield: ${govYield.projectedAnnualYield.toFixed(2)} XRP`);
}

console.log('\nDemo complete!');
console.log('='.repeat(80));
