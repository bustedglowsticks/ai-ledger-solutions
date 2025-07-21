/**
 * RLUSD-Weighted Dynamic Allocation Demo
 * 
 * This script demonstrates the enhanced yield optimizer with RLUSD-weighted
 * dynamic allocation strategy for high-volatility scenarios.
 * 
 * Features showcased:
 * - 80% RLUSD allocation during high volatility (>0.5)
 * - Eco-friendly asset boosting (24% bonus)
 * - Sentiment-weighted adjustments
 * - Simulation with July 16, 2025 market conditions
 */

const { YieldOptimizer } = require('../src/optimizer/yield-optimizer');

// Mock DAOGovernor class if not available
class MockDAOGovernor {
  constructor(options = {}) {
    this.sentimentOracle = options.sentimentOracle;
    this.getActiveProposals = options.getActiveProposals || (async () => []);
    this.tallyVotes = options.tallyVotes || (async () => ({}));
    console.log('Initialized Mock DAO Governor');
  }
}

// Mock SentimentOracleNetwork class if not available
class MockSentimentOracle {
  constructor(options = {}) {
    this.getSentiment = options.getSentiment || (async () => ({ score: 0.5 }));
    console.log('Initialized Mock Sentiment Oracle');
  }
}

// Use actual classes if available, otherwise use mocks
let DAOGovernor, SentimentOracleNetwork;
try {
  DAOGovernor = require('../src/dao/dao-governor').DAOGovernor;
} catch (e) {
  console.log('Using mock DAOGovernor');
  DAOGovernor = MockDAOGovernor;
}

try {
  SentimentOracleNetwork = require('../src/oracle/sentiment-oracle').SentimentOracleNetwork;
} catch (e) {
  console.log('Using mock SentimentOracleNetwork');
  SentimentOracleNetwork = MockSentimentOracle;
}

// Mock XRPL client
const mockClient = {
  connect: async () => console.log('Connected to mock XRPL network'),
  disconnect: async () => console.log('Disconnected from mock XRPL network')
};

// Create mock sentiment oracle
const sentimentOracle = new SentimentOracleNetwork({
  getSentiment: async (asset) => {
    console.log(`Getting sentiment for ${asset}`);
    // July 16, 2025 sentiment data (high for XRP due to ETF hype)
    return { score: 0.7, source: 'mock', timestamp: Date.now() };
  }
});

// Create mock DAO governor with sentiment oracle
const daoGovernor = new DAOGovernor({
  client: mockClient,
  sentimentOracle,
  getActiveProposals: async () => {
    return [{
      id: 'PROP_2025Q3',
      title: 'Q3 2025 Liquidity Strategy',
      created: Date.now(),
      metadata: { category: 'yield-optimization' }
    }];
  },
  tallyVotes: async (proposalId) => {
    return {
      winningOption: 'Balanced Approach',
      votes: { 'Balanced Approach': 1200, 'High RLUSD Allocation': 800, 'Eco-Friendly Focus': 1000 }
    };
  }
});

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

// Run the demo
async function runDemo() {
  console.log('='.repeat(80));
  console.log('RLUSD-WEIGHTED DYNAMIC ALLOCATION DEMO');
  console.log('July 16, 2025 - High Volatility Scenario');
  console.log('='.repeat(80));
  
  // Initialize optimizer
  const optimizer = new YieldOptimizer({
    client: mockClient,
    daoGovernor,
    ecoBoostMultiplier: 1.24,
    highVolThreshold: 0.5,
    rlusdHighVolAllocation: 0.8,
    useRealData: false
  });
  
  // Capital to allocate
  const capital = 10000; // 10,000 XRP
  
  console.log(`\nOptimizing allocation for ${capital} XRP across ${pools.length} pools`);
  console.log('Available pools:');
  pools.forEach(pool => {
    console.log(`- ${pool.name} (Base APY: ${(pool.baseAPY * 100).toFixed(2)}%, Eco: ${pool.isEco ? 'Yes' : 'No'}, Stable: ${pool.isStable ? 'Yes' : 'No'})`);
  });
  
  // Test with normal volatility
  console.log('\n1. NORMAL VOLATILITY SCENARIO');
  console.log('-'.repeat(50));
  const normalResult = await optimizer.optimizeAllocation(capital, pools, { vol: 0.3, sentiment: 0.6 });
  
  console.log('\nAllocation Results:');
  pools.forEach((pool, i) => {
    const allocation = normalResult.allocations[i];
    const percentage = (allocation / capital) * 100;
    console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
  });
  
  console.log('\nYield Projection:');
  console.log(`- Base APY: ${(normalResult.expectedYield.baseAPY * 100).toFixed(2)}%`);
  console.log(`- IL Risk: ${(normalResult.expectedYield.ilRisk * 100).toFixed(2)}%`);
  console.log(`- Net APY: ${(normalResult.expectedYield.netAPY * 100).toFixed(2)}%`);
  console.log(`- Projected Annual Yield: ${normalResult.expectedYield.projectedAnnualYield.toFixed(2)} XRP`);
  
  // Test with high volatility (July 16, 2025 scenario)
  console.log('\n2. HIGH VOLATILITY SCENARIO (July 16, 2025)');
  console.log('-'.repeat(50));
  const highVolResult = await optimizer.optimizeAllocation(capital, pools, { vol: 0.96, sentiment: 0.7 });
  
  console.log('\nAllocation Results:');
  pools.forEach((pool, i) => {
    const allocation = highVolResult.allocations[i];
    const percentage = (allocation / capital) * 100;
    console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
  });
  
  console.log('\nYield Projection:');
  console.log(`- Base APY: ${(highVolResult.expectedYield.baseAPY * 100).toFixed(2)}%`);
  console.log(`- IL Risk: ${(highVolResult.expectedYield.ilRisk * 100).toFixed(2)}%`);
  console.log(`- Net APY: ${(highVolResult.expectedYield.netAPY * 100).toFixed(2)}%`);
  console.log(`- Projected Annual Yield: ${highVolResult.expectedYield.projectedAnnualYield.toFixed(2)} XRP`);
  
  // Run simulation
  console.log('\n3. MONTE CARLO SIMULATION');
  console.log('-'.repeat(50));
  console.log('Running 1000 simulations over 30 days with July 16, 2025 market conditions...');
  
  const simulationResults = await optimizer.runSimulation(capital, pools, {
    days: 30,
    iterations: 1000
  });
  
  console.log('\nSimulation Results:');
  console.log(`- Mean Annualized Return: ${(simulationResults.meanAnnualizedReturn * 100).toFixed(2)}%`);
  console.log(`- Standard Deviation: ${(simulationResults.stdDev * 100).toFixed(2)}%`);
  console.log(`- Min Return: ${(simulationResults.minReturn * 100).toFixed(2)}%`);
  console.log(`- Max Return: ${(simulationResults.maxReturn * 100).toFixed(2)}%`);
  console.log(`- Sharpe Ratio: ${simulationResults.sharpeRatio.toFixed(2)}`);
  console.log(`- Success Rate: ${(simulationResults.successRate * 100).toFixed(2)}%`);
  
  // Calculate potential annual passive income
  const annualPassiveIncome = capital * simulationResults.meanAnnualizedReturn;
  console.log(`\nWith ${capital} XRP capital, projected annual passive income: ${annualPassiveIncome.toFixed(2)} XRP`);
  
  // Extrapolate to higher APY scenarios
  console.log('\n4. OPTIMISTIC 2025 SCENARIO PROJECTIONS');
  console.log('-'.repeat(50));
  
  const optimisticAPYs = [0.4, 0.6, 0.8];
  console.log('Projecting returns with higher base APYs (2025 optimistic scenarios):');
  
  optimisticAPYs.forEach(apy => {
    const annualReturn = apy * (1 - highVolResult.expectedYield.ilRisk * 0.5);
    const annualYield = capital * annualReturn;
    console.log(`- Base APY ${(apy * 100).toFixed(0)}%: ${(annualReturn * 100).toFixed(2)}% net APY, ${annualYield.toFixed(2)} XRP annual yield`);
  });
  
  console.log('\n5. DAO GOVERNANCE INTEGRATION');
  console.log('-'.repeat(50));
  
  // Demonstrate how DAO governance affects allocation strategy
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
    
    // Calculate allocation with these parameters
    const result = await optimizer.dynamicAllocate(
      capital,
      pools,
      0.96, // July 16 volatility
      0.7,  // July 16 sentiment
      option.highVolThreshold,
      option.rlusdHighVolAllocation,
      option.ecoBoostMultiplier
    );
    
    console.log('\nResulting Allocation:');
    pools.forEach((pool, i) => {
      const allocation = result[i];
      const percentage = (allocation / capital) * 100;
      console.log(`- ${pool.name}: ${allocation.toFixed(2)} XRP (${percentage.toFixed(2)}%)`);
    });
  }
  
  console.log('\nDemo complete!');
  console.log('='.repeat(80));
}

// Run the demo
runDemo().catch(error => {
  console.error('Error in demo:', error);
  console.error(error.stack);
});
