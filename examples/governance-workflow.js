/**
 * XRPL DAO Governor Complete Workflow Example
 * 
 * This script demonstrates the full governance workflow:
 * 1. Initialize DAO Governor with XRPL testnet connection
 * 2. Create a new proposal with eco-friendly options
 * 3. Cast votes from multiple participants with varying stake amounts
 * 4. Tally votes with eco-boost consideration
 * 5. Run Monte Carlo simulation based on winning option
 * 6. Mint NFT rewards with yield metadata
 */

const xrpl = require('xrpl');
const fs = require('fs');
const { DAOGovernor } = require('../src/dao/dao-governor');
const { MonteCarloForecaster } = require('../src/forecaster/monte-carlo-forecaster');
const { SentimentOracleNetwork } = require('../src/oracle/sentiment-oracle');

// Mock sentiment oracle for demonstration
class MockSentimentOracle {
  async getSentiment(asset, hashtag) {
    console.log(`Getting sentiment for ${asset} with hashtag ${hashtag}`);
    return {
      score: 0.78,
      positive: 68,
      negative: 12,
      neutral: 20,
      volume: 100
    };
  }
}

// Mock XRPL client for demonstration
class MockXrplClient {
  constructor(server) {
    this.server = server;
    this.connected = false;
    console.log(`Mock XRPL client created for ${server}`);
  }
  
  async connect() {
    this.connected = true;
    return { status: 'connected' };
  }
  
  async disconnect() {
    this.connected = false;
    return { status: 'disconnected' };
  }
  
  async fundWallet(wallet) {
    console.log(`Mock funding wallet ${wallet.address}`);
    return { 
      wallet, 
      balance: '10000' 
    };
  }
  
  async request(req) {
    console.log(`Mock XRPL request: ${req.command}`);
    // Return mock data based on command
    if (req.command === 'account_nfts') {
      return { 
        result: { 
          account_nfts: [
            { NFTokenID: 'MOCK_NFT_' + Math.random().toString(36).substring(2, 10), nft_serial: 1 }
          ] 
        } 
      };
    }
    return { result: { status: 'success', mock: true } };
  }
  
  async submitAndWait(txBlob) {
    console.log('Mock submit and wait for transaction');
    return { 
      result: { 
        meta: { 
          TransactionResult: 'tesSUCCESS',
          nftoken_id: 'MOCK_NFT_' + Math.random().toString(36).substring(2, 10)
        } 
      } 
    };
  }
}

// Mock XRPL wallet for demonstration
class MockWallet {
  constructor(seed) {
    this.seed = seed || 'mock_seed_' + Math.random().toString(36).substring(2, 10);
    this.address = 'r' + Math.random().toString(36).substring(2, 10);
  }
  
  static generate() {
    return new MockWallet();
  }
  
  sign(tx) {
    return { tx_blob: 'mock_signed_tx_' + Math.random().toString(36).substring(2, 10) };
  }
}

// Override xrpl classes with mocks
xrpl.Client = MockXrplClient;
xrpl.Wallet = MockWallet;
xrpl.convertStringToHex = (str) => 'HEX_' + str.substring(0, 10);

async function runGovernanceWorkflow() {
  try {
    console.log('Starting XRPL DAO Governance Workflow Demo');
    console.log('=========================================');
    
    // 1. Connect to XRPL Testnet (mock)
    console.log('\n1. Connecting to XRPL Testnet (mock)...');
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    console.log('Connected to XRPL Testnet (mock)');
    
    // Generate test wallets
    const daoWallet = xrpl.Wallet.generate();
    const voter1 = xrpl.Wallet.generate();
    const voter2 = xrpl.Wallet.generate();
    const voter3 = xrpl.Wallet.generate();
    
    console.log(`DAO Wallet: ${daoWallet.address}`);
    console.log(`Voter 1: ${voter1.address}`);
    console.log(`Voter 2: ${voter2.address}`);
    console.log(`Voter 3: ${voter3.address}`);
    
    // Fund wallets from testnet faucet
    console.log('\nFunding wallets from testnet faucet (mock)...');
    await client.fundWallet(daoWallet);
    await client.fundWallet(voter1);
    await client.fundWallet(voter2);
    await client.fundWallet(voter3);
    console.log('All wallets funded successfully');
    
    // 2. Initialize DAO Governor
    console.log('\n2. Initializing DAO Governor...');
    const sentimentOracle = new MockSentimentOracle();
    
    // Create a mock storage directory
    if (!fs.existsSync('./data/dao')) {
      fs.mkdirSync('./data/dao', { recursive: true });
    }
    
    // Create a mock DAOGovernor class for demonstration
    class MockDAOGovernor {
      constructor(options) {
        this.client = options.client;
        this.wallet = options.wallet;
        this.storageDir = options.storageDir;
        this.ecoBoostMultiplier = options.ecoBoostMultiplier || 1.5;
        this.useSentimentAnalysis = options.useSentimentAnalysis !== false;
        this.sentimentHashtag = options.sentimentHashtag || '#XRPLGreenDeFi';
        this.sentimentOracle = options.sentimentOracle;
        this.proposals = new Map();
        
        console.log(`Mock DAO Governor initialized with eco-boost: ${this.ecoBoostMultiplier}x`);
      }
      
      async createProposal(proposal) {
        const proposalId = 'PROP_' + Math.random().toString(36).substring(2, 10);
        
        this.proposals.set(proposalId, {
          id: proposalId,
          title: proposal.title,
          description: proposal.description,
          options: proposal.options,
          ecoOptions: proposal.ecoOptions,
          created: Date.now(),
          expires: Date.now() + (proposal.duration || 86400) * 1000,
          metadata: proposal.metadata || {},
          voters: {},
          votes: {}
        });
        
        // Initialize vote counts
        proposal.options.forEach(option => {
          this.proposals.get(proposalId).votes[option] = 0;
        });
        
        return proposalId;
      }
      
      async castVote(proposalId, option, stakeAmount, wallet) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        
        const voterAddress = wallet.address;
        const optionIndex = proposal.options.indexOf(option);
        const isEcoOption = proposal.ecoOptions[optionIndex];
        
        // Calculate eco-boost
        let boostMultiplier = 1.0;
        if (isEcoOption) {
          boostMultiplier = this.ecoBoostMultiplier;
          console.log(`Applying eco-boost (${boostMultiplier}x) for eco-friendly option: ${option}`);
        }
        
        const boostedStake = stakeAmount * boostMultiplier;
        
        // Record vote
        proposal.voters[voterAddress] = {
          option,
          stake: stakeAmount,
          boostedStake,
          timestamp: Date.now(),
          isEcoOption
        };
        
        // Update vote counts
        proposal.votes[option] = (proposal.votes[option] || 0) + boostedStake;
        
        return {
          proposalId,
          voter: voterAddress,
          option,
          stake: stakeAmount,
          boostedStake,
          isEcoOption,
          success: true
        };
      }
      
      async tallyVotes(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        
        // Calculate raw votes (without eco-boost)
        const rawVotes = {};
        let totalRawVotes = 0;
        
        Object.entries(proposal.voters).forEach(([voter, data]) => {
          rawVotes[data.option] = (rawVotes[data.option] || 0) + data.stake;
          totalRawVotes += data.stake;
        });
        
        // Calculate boosted votes
        const votes = {};
        let totalVotes = 0;
        
        Object.entries(proposal.voters).forEach(([voter, data]) => {
          votes[data.option] = (votes[data.option] || 0) + data.boostedStake;
          totalVotes += data.boostedStake;
        });
        
        // Find winning option
        let winningOption = proposal.options[0];
        let maxVotes = 0;
        
        Object.entries(votes).forEach(([option, voteCount]) => {
          if (voteCount > maxVotes) {
            maxVotes = voteCount;
            winningOption = option;
          }
        });
        
        // Calculate eco-boost impact
        const ecoBoostImpact = {};
        proposal.options.forEach(option => {
          ecoBoostImpact[option] = (votes[option] || 0) - (rawVotes[option] || 0);
        });
        
        // Calculate eco percentage
        const ecoVotes = Object.entries(proposal.voters)
          .filter(([_, data]) => data.isEcoOption)
          .reduce((sum, [_, data]) => sum + data.boostedStake, 0);
        
        const ecoPercentage = totalVotes > 0 ? (ecoVotes / totalVotes) * 100 : 0;
        
        // Get top voters
        const topVoters = Object.entries(proposal.voters)
          .sort((a, b) => b[1].boostedStake - a[1].boostedStake)
          .slice(0, 5)
          .map(([address, data]) => ({
            address,
            option: data.option,
            stake: data.stake,
            boostedStake: data.boostedStake
          }));
        
        // Check if winning option is eco-friendly
        const winningOptionIndex = proposal.options.indexOf(winningOption);
        const isWinnerEco = proposal.ecoOptions[winningOptionIndex];
        
        return {
          proposalId,
          winningOption,
          isWinnerEco,
          votes,
          rawVotes,
          totalVotes,
          totalRawVotes,
          ecoBoostImpact,
          ecoPercentage,
          topVoters
        };
      }
      
      async runGovernedSimulation(proposalId, simulationEngine, options = {}) {
        const tally = await this.tallyVotes(proposalId);
        const proposal = this.proposals.get(proposalId);
        
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        
        const { winningOption, isWinnerEco, ecoPercentage } = tally;
        const { iterations = 100, useRealData = false, mintRewards = false } = options;
        
        // Get sentiment score (mock)
        const sentimentScore = this.sentimentOracle ? 
          (await this.sentimentOracle.getSentiment('XRP', this.sentimentHashtag)).score : 0.7;
        
        // Map winning option to simulation parameters
        let simParams = {
          vol: 0.13,
          ecoBoostMultiplier: isWinnerEco ? 1.24 + (ecoPercentage / 100) * 0.3 : 1.24,
          iterations,
          useRealData,
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
          console.log(`Adding AI boost of ${simParams.aiBoost.toFixed(2)} based on high sentiment`);
        }
        
        // Run simulation
        console.log(`Running Monte Carlo simulation with parameters:`, simParams);
        const results = await simulationEngine.forecast(simParams);
        
        // Add governance metadata
        results.governance = {
          proposalId,
          winningOption,
          isWinnerEco,
          ecoPercentage,
          sentimentScore,
          voterCount: Object.keys(proposal.voters).length,
          totalStake: tally.totalVotes,
          totalRawStake: tally.totalRawVotes,
          ecoBoostImpact: tally.totalVotes - tally.totalRawVotes,
          simulationParams: simParams
        };
        
        // Mock NFT rewards
        if (mintRewards) {
          const rewardNFTs = [];
          
          // Get top voters
          const topVoters = Object.entries(proposal.voters)
            .filter(([_, data]) => data.option === winningOption)
            .sort((a, b) => b[1].boostedStake - a[1].boostedStake)
            .slice(0, 3);
          
          for (const [address, data] of topVoters) {
            const nftTokenId = 'NFT_' + Math.random().toString(36).substring(2, 10);
            
            rewardNFTs.push({
              recipient: address,
              nftTokenId,
              metadata: {
                proposalId,
                winningOption,
                yield: {
                  meanYield: results.meanYield,
                  maxYield: results.maxYield
                },
                ecoScore: data.isEcoOption ? 85 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 30),
                rarity: data.isEcoOption ? 'Rare' : 'Common',
                timestamp: Date.now()
              }
            });
          }
          
          results.governance.rewardNFTs = rewardNFTs;
        }
        
        return results;
      }
    }
    
    // Override DAOGovernor with our mock implementation
    const DAOGovernor = MockDAOGovernor;
    
    const daoGovernor = new DAOGovernor({
      client,
      wallet: daoWallet,
      storageDir: './data/dao',
      ecoBoostMultiplier: 1.5,
      useSentimentAnalysis: true,
      sentimentHashtag: '#XRPLGreenDeFi',
      sentimentOracle
    });
    
    // Create data directory if needed
    
    // 3. Create a new proposal
    console.log('\n3. Creating a new governance proposal...');
    const proposalOptions = ['High Yield Strategy', 'Balanced Approach', 'Eco-Friendly Focus', 'RLUSD Hedge'];
    const ecoOptions = [false, true, true, false]; // Mark which options are eco-friendly
    
    const proposalId = await daoGovernor.createProposal({
      title: 'Q3 2025 Liquidity Strategy',
      description: 'Select the optimal liquidity strategy for Q3 2025 based on market conditions and community preferences.',
      options: proposalOptions,
      ecoOptions: ecoOptions,
      duration: 3600, // 1 hour for demo purposes
      metadata: {
        category: 'strategy',
        quarter: 'Q3-2025',
        optionEcoScores: [5, 15, 25, 10] // Eco-score for each option (0-100)
      }
    });
    
    console.log(`Created proposal: ${proposalId}`);
    console.log(`Title: Q3 2025 Liquidity Strategy`);
    console.log(`Options: ${proposalOptions.join(', ')}`);
    console.log(`Eco-friendly options: ${proposalOptions.filter((_, i) => ecoOptions[i]).join(', ')}`);
    
    // 4. Cast votes from multiple participants
    console.log('\n4. Casting votes from multiple participants...');
    
    // Voter 1 votes for "High Yield Strategy" with 100 XRP stake
    console.log(`\nVoter 1 (${voter1.address.substring(0, 8)}...) voting for "High Yield Strategy" with 100 XRP stake`);
    await daoGovernor.castVote(proposalId, 'High Yield Strategy', 100, voter1);
    
    // Voter 2 votes for "Eco-Friendly Focus" with 80 XRP stake (gets eco-boost)
    console.log(`Voter 2 (${voter2.address.substring(0, 8)}...) voting for "Eco-Friendly Focus" with 80 XRP stake (eco-friendly option)`);
    await daoGovernor.castVote(proposalId, 'Eco-Friendly Focus', 80, voter2);
    
    // Voter 3 votes for "Eco-Friendly Focus" with 50 XRP stake (gets eco-boost)
    console.log(`Voter 3 (${voter3.address.substring(0, 8)}...) voting for "Eco-Friendly Focus" with 50 XRP stake (eco-friendly option)`);
    await daoGovernor.castVote(proposalId, 'Eco-Friendly Focus', 50, voter3);
    
    // DAO wallet votes for "Balanced Approach" with 30 XRP stake (gets eco-boost)
    console.log(`DAO Wallet (${daoWallet.address.substring(0, 8)}...) voting for "Balanced Approach" with 30 XRP stake (eco-friendly option)`);
    await daoGovernor.castVote(proposalId, 'Balanced Approach', 30, daoWallet);
    
    // 5. Tally votes with eco-boost consideration
    console.log('\n5. Tallying votes with eco-boost consideration...');
    const tallyResults = await daoGovernor.tallyVotes(proposalId);
    
    console.log('\nVote Tally Results:');
    console.log(`Winning Option: "${tallyResults.winningOption}" (${tallyResults.isWinnerEco ? 'Eco-friendly ✅' : 'Standard'})`);
    console.log('Vote Distribution:');
    
    Object.entries(tallyResults.votes).forEach(([option, votes]) => {
      const rawVotes = tallyResults.rawVotes[option];
      const ecoBoost = tallyResults.ecoBoostImpact[option];
      const isEco = proposalOptions.indexOf(option) !== -1 && ecoOptions[proposalOptions.indexOf(option)];
      
      console.log(`  "${option}": ${votes.toFixed(2)} votes (Raw: ${rawVotes.toFixed(2)}, Eco-boost: +${ecoBoost.toFixed(2)}) ${isEco ? '🌱' : ''}`);
    });
    
    console.log(`\nTotal Votes: ${tallyResults.totalVotes.toFixed(2)} (Raw: ${tallyResults.totalRawVotes.toFixed(2)}, Eco-boost: +${(tallyResults.totalVotes - tallyResults.totalRawVotes).toFixed(2)})`);
    console.log(`Eco-friendly Voting: ${tallyResults.ecoPercentage.toFixed(2)}% of total votes`);
    console.log(`Top Voters: ${tallyResults.topVoters.length}`);
    
    // 6. Initialize Monte Carlo Forecaster
    console.log('\n6. Initializing Monte Carlo Forecaster...');
    const forecaster = new MonteCarloForecaster({
      client,
      iterations: 100, // Low for demo
      useRealData: false // Use synthetic data for demo
    });
    
    // 7. Run governance-driven simulation
    console.log('\n7. Running governance-driven Monte Carlo simulation...');
    const simulationResults = await daoGovernor.runGovernedSimulation(proposalId, forecaster, {
      iterations: 100,
      useRealData: false,
      mintRewards: true
    });
    
    console.log('\nSimulation Results:');
    console.log(`Mean Yield: ${simulationResults.meanYield.toFixed(2)}% (±${simulationResults.yieldStdDev?.toFixed(2) || 'N/A'}%)`);
    console.log(`Max Yield: ${simulationResults.maxYield?.toFixed(2) || 'N/A'}%`);
    console.log(`Strategy: ${simulationResults.governance.simulationParams.strategy}`);
    
    if (simulationResults.governance.rewardNFTs) {
      console.log(`\nMinted ${simulationResults.governance.rewardNFTs.length} NFT rewards for top voters`);
      
      // Display first NFT details
      if (simulationResults.governance.rewardNFTs.length > 0) {
        const firstNFT = simulationResults.governance.rewardNFTs[0];
        console.log('\nSample NFT Reward Details:');
        console.log(`Recipient: ${firstNFT.recipient.substring(0, 8)}...`);
        console.log(`Token ID: ${firstNFT.nftTokenId.substring(0, 16)}...`);
        console.log(`Yield Metadata: ${firstNFT.metadata.yield.meanYield.toFixed(2)}% mean yield`);
        console.log(`Eco Score: ${firstNFT.metadata.ecoScore}`);
        console.log(`Rarity: ${firstNFT.metadata.rarity}`);
      }
    }
    
    console.log('\nGovernance Workflow Complete!');
    
    // Disconnect from XRPL
    await client.disconnect();
    
  } catch (error) {
    console.error('Error in governance workflow:', error);
  }
}

// Run the workflow
console.log('Starting governance workflow demo...');
runGovernanceWorkflow()
  .then(() => console.log('Governance workflow completed successfully!'))
  .catch(error => {
    console.error('Error in governance workflow:', error);
    console.error(error.stack);
  });
