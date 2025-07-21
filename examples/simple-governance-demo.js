/**
 * Simple XRPL DAO Governance Demo
 * 
 * This script demonstrates the key features of the DAO Governor:
 * 1. Creating a proposal with eco-friendly options
 * 2. Casting votes with eco-boost consideration
 * 3. Tallying votes and determining the winner
 * 4. Running a simulation based on governance decisions
 * 5. Minting NFT rewards with yield metadata
 */

console.log('Starting Simple DAO Governance Demo');
console.log('===================================');

// Mock eco-friendly proposal
const proposal = {
  id: 'PROP_2025Q3',
  title: 'Q3 2025 Liquidity Strategy',
  description: 'Select the optimal liquidity strategy for Q3 2025',
  options: ['High Yield Strategy', 'Balanced Approach', 'Eco-Friendly Focus', 'RLUSD Hedge'],
  ecoOptions: [false, true, true, false], // Mark which options are eco-friendly
  votes: {},
  voters: {}
};

console.log(`\nProposal: ${proposal.title}`);
console.log(`Options: ${proposal.options.join(', ')}`);
console.log(`Eco-friendly options: ${proposal.options.filter((_, i) => proposal.ecoOptions[i]).join(', ')}`);

// Cast votes with eco-boost
console.log('\nCasting votes with eco-boost consideration:');

// Configuration
const ecoBoostMultiplier = 1.5; // 50% boost for eco-friendly votes
const voters = [
  { address: 'rVoter1', option: 'High Yield Strategy', stake: 100, isEco: false },
  { address: 'rVoter2', option: 'Eco-Friendly Focus', stake: 80, isEco: true },
  { address: 'rVoter3', option: 'Eco-Friendly Focus', stake: 50, isEco: true },
  { address: 'rVoter4', option: 'Balanced Approach', stake: 30, isEco: true }
];

// Initialize vote counts
proposal.options.forEach(option => {
  proposal.votes[option] = 0;
});

// Process votes
voters.forEach(voter => {
  const optionIndex = proposal.options.indexOf(voter.option);
  const isEcoOption = proposal.ecoOptions[optionIndex];
  
  // Calculate eco-boost
  let boostMultiplier = 1.0;
  if (isEcoOption) {
    boostMultiplier = ecoBoostMultiplier;
    console.log(`Applying eco-boost (${boostMultiplier}x) for ${voter.address} voting for eco-friendly option: ${voter.option}`);
  }
  
  const boostedStake = voter.stake * boostMultiplier;
  
  // Record vote
  proposal.voters[voter.address] = {
    option: voter.option,
    stake: voter.stake,
    boostedStake,
    isEcoOption
  };
  
  // Update vote counts
  proposal.votes[voter.option] += boostedStake;
  
  console.log(`${voter.address} voted for "${voter.option}" with ${voter.stake} XRP stake (boosted to ${boostedStake} voting power)`);
});

// Tally votes
console.log('\nTallying votes:');

// Calculate raw votes (without eco-boost)
const rawVotes = {};
let totalRawVotes = 0;

Object.entries(proposal.voters).forEach(([voter, data]) => {
  rawVotes[data.option] = (rawVotes[data.option] || 0) + data.stake;
  totalRawVotes += data.stake;
});

// Calculate total boosted votes
let totalVotes = 0;
Object.values(proposal.votes).forEach(voteCount => {
  totalVotes += voteCount;
});

// Find winning option
let winningOption = proposal.options[0];
let maxVotes = 0;

Object.entries(proposal.votes).forEach(([option, voteCount]) => {
  if (voteCount > maxVotes) {
    maxVotes = voteCount;
    winningOption = option;
  }
});

// Calculate eco-boost impact
const ecoBoostImpact = {};
proposal.options.forEach(option => {
  ecoBoostImpact[option] = proposal.votes[option] - (rawVotes[option] || 0);
});

// Calculate eco percentage
const ecoVotes = Object.entries(proposal.voters)
  .filter(([_, data]) => data.isEcoOption)
  .reduce((sum, [_, data]) => sum + data.boostedStake, 0);

const ecoPercentage = totalVotes > 0 ? (ecoVotes / totalVotes) * 100 : 0;

// Check if winning option is eco-friendly
const winningOptionIndex = proposal.options.indexOf(winningOption);
const isWinnerEco = proposal.ecoOptions[winningOptionIndex];

// Display results
console.log('\nVote Tally Results:');
console.log(`Winning Option: "${winningOption}" (${isWinnerEco ? 'Eco-friendly ✅' : 'Standard'})`);
console.log('Vote Distribution:');

Object.entries(proposal.votes).forEach(([option, votes]) => {
  const rawVoteCount = rawVotes[option] || 0;
  const boost = ecoBoostImpact[option];
  const isEco = proposal.ecoOptions[proposal.options.indexOf(option)];
  
  console.log(`  "${option}": ${votes.toFixed(2)} votes (Raw: ${rawVoteCount.toFixed(2)}, Eco-boost: +${boost.toFixed(2)}) ${isEco ? '🌱' : ''}`);
});

console.log(`\nTotal Votes: ${totalVotes.toFixed(2)} (Raw: ${totalRawVotes.toFixed(2)}, Eco-boost: +${(totalVotes - totalRawVotes).toFixed(2)})`);
console.log(`Eco-friendly Voting: ${ecoPercentage.toFixed(2)}% of total votes`);

// Run simulation based on governance decision
console.log('\nRunning Monte Carlo simulation based on governance decision:');

// Mock sentiment score (0-1)
const sentimentScore = 0.78;

// Map winning option to simulation parameters
let simParams = {
  vol: 0.13,
  ecoBoostMultiplier: isWinnerEco ? 1.24 + (ecoPercentage / 100) * 0.3 : 1.24,
  iterations: 100,
  strategy: 'balanced',
  hedgeRatio: 0.4
};

// Adjust parameters based on winning option
if (winningOption === 'High Yield Strategy') {
  simParams.strategy = 'aggressive';
  simParams.vol = 0.25;
} else if (winningOption === 'Eco-Friendly Focus') {
  simParams.strategy = 'eco-weighted';
  simParams.ecoFocus = true;
  simParams.ecoBoostMultiplier = 1.35 + (ecoPercentage / 100) * 0.7;
} else if (winningOption === 'RLUSD Hedge') {
  simParams.strategy = 'defensive';
  simParams.hedge = 'RLUSD';
  simParams.hedgeRatio = 0.6;
}

// Add sentiment-based AI boost if sentiment is high
if (sentimentScore > 0.7) {
  simParams.aiBoost = 0.15 * (sentimentScore - 0.7) / 0.3;
  console.log(`Adding AI boost of ${simParams.aiBoost.toFixed(2)} based on high sentiment (${sentimentScore.toFixed(2)})`);
}

console.log('Simulation parameters:', simParams);

// Mock simulation results
const simulationResults = {
  meanYield: 35.8 + (isWinnerEco ? 5.2 : 0) + (simParams.aiBoost || 0) * 20,
  maxYield: 48.6 + (isWinnerEco ? 7.5 : 0) + (simParams.aiBoost || 0) * 25,
  yieldStdDev: 8.4,
  volatility: 0.23,
  successProbability: 0.92,
  strategy: simParams.strategy
};

console.log('\nSimulation Results:');
console.log(`Mean Yield: ${simulationResults.meanYield.toFixed(2)}% (±${simulationResults.yieldStdDev.toFixed(2)}%)`);
console.log(`Max Yield: ${simulationResults.maxYield.toFixed(2)}%`);
console.log(`Strategy: ${simulationResults.strategy}`);
console.log(`Success Probability: ${(simulationResults.successProbability * 100).toFixed(2)}%`);

// Mint NFT rewards for top voters
console.log('\nMinting NFT Governance Badges with yield metadata:');

// Get top voters who voted for the winning option
const topVoters = Object.entries(proposal.voters)
  .filter(([_, data]) => data.option === winningOption)
  .sort((a, b) => b[1].boostedStake - a[1].boostedStake)
  .slice(0, 3);

const rewardNFTs = [];

for (const [address, data] of topVoters) {
  const nftTokenId = 'NFT_' + Math.random().toString(36).substring(2, 10);
  
  const nft = {
    recipient: address,
    nftTokenId,
    metadata: {
      proposalId: proposal.id,
      winningOption,
      yield: {
        meanYield: simulationResults.meanYield,
        maxYield: simulationResults.maxYield
      },
      ecoScore: data.isEcoOption ? 85 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 30),
      rarity: data.isEcoOption ? 'Rare' : 'Common',
      timestamp: Date.now()
    }
  };
  
  rewardNFTs.push(nft);
  
  console.log(`\nMinted NFT for ${address}:`);
  console.log(`Token ID: ${nftTokenId}`);
  console.log(`Yield Data: ${nft.metadata.yield.meanYield.toFixed(2)}% mean, ${nft.metadata.yield.maxYield.toFixed(2)}% max`);
  console.log(`Eco Score: ${nft.metadata.ecoScore}`);
  console.log(`Rarity: ${nft.metadata.rarity}`);
}

console.log('\nGovernance Workflow Complete!');
console.log('===========================');
