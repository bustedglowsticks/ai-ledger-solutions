#!/usr/bin/env node

/**
 * Command-line interface for the DAO-Governed Yield Arena
 * 
 * Usage:
 *   node run-dao-arena.js --action create-proposal --title "ETF Impact Simulation"
 *   node run-dao-arena.js --action list-proposals
 *   node run-dao-arena.js --action cast-vote --proposal-id prop-123 --option "ETF Surge" --address rXYZ... --stake 50
 *   node run-dao-arena.js --action run-simulation --proposal-id prop-123
 */

const { DAOIntegration } = require('./dao/dao-integration');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  action: null,
  proposalId: null,
  title: 'XRPL Liquidity Simulation Scenario',
  description: 'Vote on the next simulation scenario to run',
  options: ['ETF Surge', 'RLUSD De-Peg', 'Eco Focus', 'Normal Market'],
  option: null,
  address: null,
  stake: 20,
  duration: 86400, // 1 day in seconds
  xrplServer: process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233',
  walletSeed: process.env.XRPL_WALLET_SEED,
  dataDir: path.join(__dirname, '../data/dao')
};

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--action':
      options.action = args[++i];
      break;
    case '--proposal-id':
      options.proposalId = args[++i];
      break;
    case '--title':
      options.title = args[++i];
      break;
    case '--description':
      options.description = args[++i];
      break;
    case '--options':
      options.options = args[++i].split(',');
      break;
    case '--option':
      options.option = args[++i];
      break;
    case '--address':
      options.address = args[++i];
      break;
    case '--stake':
      options.stake = parseFloat(args[++i]);
      break;
    case '--duration':
      options.duration = parseInt(args[++i], 10);
      break;
    case '--xrpl-server':
      options.xrplServer = args[++i];
      break;
    case '--wallet-seed':
      options.walletSeed = args[++i];
      break;
    case '--data-dir':
      options.dataDir = args[++i];
      break;
    case '--help':
      showHelp();
      process.exit(0);
      break;
    default:
      if (arg.startsWith('--')) {
        console.error(`Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
      }
  }
}

function showHelp() {
  console.log(`
DAO-Governed Yield Arena - XRPL Liquidity Provider Bot

Usage:
  node run-dao-arena.js --action <action> [options]

Actions:
  create-proposal    Create a new simulation proposal
  list-proposals     List active proposals
  cast-vote          Cast a vote on a proposal
  run-simulation     Run a community-governed simulation
  tally-votes        Tally votes for a proposal
  mint-rewards       Mint NFT rewards for top voters

Options:
  --proposal-id      ID of the proposal (required for cast-vote, run-simulation, tally-votes, mint-rewards)
  --title            Title of the proposal (for create-proposal)
  --description      Description of the proposal (for create-proposal)
  --options          Comma-separated list of voting options (for create-proposal)
  --option           Option to vote for (for cast-vote)
  --address          Voter's XRPL address (for cast-vote)
  --stake            Amount of XRP to stake (for cast-vote)
  --duration         Duration of the proposal in seconds (for create-proposal)
  --xrpl-server      XRPL server URL (default: from .env or testnet)
  --wallet-seed      XRPL wallet seed (default: from .env)
  --data-dir         Directory to store DAO data (default: ../data/dao)
  --help             Show this help message

Examples:
  node run-dao-arena.js --action create-proposal --title "ETF Impact Simulation"
  node run-dao-arena.js --action list-proposals
  node run-dao-arena.js --action cast-vote --proposal-id prop-123 --option "ETF Surge" --address rXYZ... --stake 50
  node run-dao-arena.js --action run-simulation --proposal-id prop-123
  `);
}

// Validate required options
function validateOptions() {
  if (!options.action) {
    console.error('Error: --action is required');
    showHelp();
    process.exit(1);
  }
  
  switch (options.action) {
    case 'create-proposal':
      // No additional validation needed
      break;
    case 'list-proposals':
      // No additional validation needed
      break;
    case 'cast-vote':
      if (!options.proposalId) {
        console.error('Error: --proposal-id is required for cast-vote');
        process.exit(1);
      }
      if (!options.option) {
        console.error('Error: --option is required for cast-vote');
        process.exit(1);
      }
      if (!options.address) {
        console.error('Error: --address is required for cast-vote');
        process.exit(1);
      }
      break;
    case 'run-simulation':
    case 'tally-votes':
    case 'mint-rewards':
      if (!options.proposalId) {
        console.error(`Error: --proposal-id is required for ${options.action}`);
        process.exit(1);
      }
      break;
    default:
      console.error(`Error: Unknown action: ${options.action}`);
      showHelp();
      process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Validate options
    validateOptions();
    
    console.log('XRPL Liquidity Provider Bot - DAO-Governed Yield Arena');
    console.log('===========================================================');
    
    // Initialize DAO Integration
    const daoIntegration = new DAOIntegration({
      xrplServer: options.xrplServer,
      walletSeed: options.walletSeed,
      dataDir: options.dataDir,
      minStake: 20,
      proposalDuration: options.duration
    });
    
    // Initialize
    await daoIntegration.init();
    
    // Execute action
    switch (options.action) {
      case 'create-proposal':
        const proposalId = await daoIntegration.createSimulationProposal({
          title: options.title,
          description: options.description,
          options: options.options,
          duration: options.duration
        });
        
        console.log(`\nProposal created successfully!`);
        console.log(`Proposal ID: ${proposalId}`);
        console.log(`Title: ${options.title}`);
        console.log(`Options: ${options.options.join(', ')}`);
        console.log(`Duration: ${options.duration} seconds (${Math.floor(options.duration / 86400)} days)`);
        console.log(`\nShare this Proposal ID with your community to start voting!`);
        break;
        
      case 'list-proposals':
        const proposals = daoIntegration.getActiveProposals();
        
        console.log(`\nActive Proposals (${proposals.length}):`);
        
        if (proposals.length === 0) {
          console.log('No active proposals found.');
        } else {
          proposals.forEach((proposal, index) => {
            console.log(`\n${index + 1}. ${proposal.title} (ID: ${proposal.id})`);
            console.log(`   Options: ${proposal.options.join(', ')}`);
            console.log(`   Votes: ${JSON.stringify(proposal.votes)}`);
            console.log(`   Expires: ${new Date(proposal.expiresAt).toLocaleString()}`);
          });
        }
        break;
        
      case 'cast-vote':
        const voteResult = await daoIntegration.castVote(
          options.proposalId,
          options.option,
          options.address,
          options.stake
        );
        
        console.log(`\nVote cast successfully!`);
        console.log(`Proposal: ${options.proposalId}`);
        console.log(`Option: ${options.option}`);
        console.log(`Address: ${options.address}`);
        console.log(`Stake: ${options.stake} XRP`);
        console.log(`\nCurrent Tally:`);
        
        Object.entries(voteResult.currentTally).forEach(([option, votes]) => {
          console.log(`   ${option}: ${votes} XRP`);
        });
        break;
        
      case 'run-simulation':
        console.log(`\nRunning community-governed simulation for proposal: ${options.proposalId}`);
        console.log('This may take a few minutes...');
        
        const simResults = await daoIntegration.runCommunitySimulation(options.proposalId);
        const reportPath = await daoIntegration.generateGovernanceReport(simResults);
        
        console.log(`\nSimulation completed successfully!`);
        console.log(`Mean Yield: ${simResults.meanYield.toFixed(2)}%`);
        console.log(`Winning Option: ${simResults.governance.winningOption}`);
        console.log(`Report: ${reportPath}`);
        
        // Open the report in the default browser
        const { platform } = process;
        const open = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${open} "${reportPath}"`);
        break;
        
      case 'tally-votes':
        const tally = await daoIntegration.governor.tallyVotes(options.proposalId);
        
        console.log(`\nVote Tally for Proposal: ${options.proposalId}`);
        console.log(`Title: ${tally.title}`);
        console.log(`Winning Option: ${tally.winningOption}`);
        console.log(`Total Votes: ${tally.totalVotes} XRP`);
        console.log(`\nVotes by Option:`);
        
        Object.entries(tally.votes).forEach(([option, votes]) => {
          const percentage = tally.totalVotes > 0 ? (votes / tally.totalVotes * 100).toFixed(2) : '0.00';
          console.log(`   ${option}: ${votes} XRP (${percentage}%)`);
        });
        
        console.log(`\nTop Voters: ${tally.topVoters.length}`);
        tally.topVoters.forEach((voter, index) => {
          console.log(`   ${index + 1}. ${voter}`);
        });
        break;
        
      case 'mint-rewards':
        console.log(`\nMinting NFT rewards for top voters of proposal: ${options.proposalId}`);
        
        const mintedNFTs = await daoIntegration.governor.mintRewardNFTs(options.proposalId);
        
        console.log(`\nMinted ${mintedNFTs.length} NFT Governance Badges!`);
        mintedNFTs.forEach((nft, index) => {
          console.log(`   ${index + 1}. Recipient: ${nft.recipient}`);
          console.log(`      NFT Token ID: ${nft.nftTokenId}`);
        });
        break;
    }
    
    // Shutdown
    await daoIntegration.shutdown();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
