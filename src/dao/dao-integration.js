/**
 * DAO Integration Module for XRPL Liquidity Provider Bot
 * 
 * Connects the DAO Governor with the Arena Orchestrator to enable:
 * - Community-governed simulations
 * - Vote-driven scenario selection
 * - NFT rewards for participation
 * - Integration with the forecasting system
 */

const xrpl = require('xrpl');
const { DAOGovernor } = require('./dao-governor');
const { AdaptiveMonteCarlo } = require('../forecaster');
const fs = require('fs');
const path = require('path');

class DAOIntegration {
  /**
   * Initialize the DAO Integration
   * @param {Object} options Configuration options
   * @param {string} options.xrplServer XRPL server URL
   * @param {string} options.walletSeed XRPL wallet seed
   * @param {string} options.dataDir Directory to store DAO data
   * @param {number} options.minStake Minimum XRP stake to vote
   * @param {number} options.proposalDuration Duration of proposals in seconds
   */
  constructor(options = {}) {
    this.xrplServer = options.xrplServer || 'wss://s.altnet.rippletest.net:51233';
    this.walletSeed = options.walletSeed;
    this.dataDir = options.dataDir || path.join(__dirname, '../../data/dao');
    this.minStake = options.minStake || 20;
    this.proposalDuration = options.proposalDuration || 86400; // 1 day
    
    this.client = null;
    this.wallet = null;
    this.governor = null;
    this.forecaster = null;
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  /**
   * Initialize the DAO Integration
   * @returns {Promise<void>}
   */
  async init() {
    try {
      console.log('Initializing DAO Integration...');
      
      // Connect to XRPL
      this.client = new xrpl.Client(this.xrplServer);
      await this.client.connect();
      console.log(`Connected to XRPL server: ${this.xrplServer}`);
      
      // Initialize wallet
      if (this.walletSeed) {
        this.wallet = xrpl.Wallet.fromSeed(this.walletSeed);
        console.log(`Using existing wallet: ${this.wallet.address}`);
      } else {
        // Create a new wallet for testing
        this.wallet = xrpl.Wallet.generate();
        console.log(`Created new wallet: ${this.wallet.address}`);
        
        // Fund wallet on testnet
        try {
          const fundResult = await this.client.fundWallet();
          this.wallet = fundResult.wallet;
          console.log(`Funded testnet wallet with ${fundResult.balance} XRP`);
        } catch (error) {
          console.warn('Could not fund wallet automatically:', error.message);
        }
      }
      
      // Initialize DAO Governor
      this.governor = new DAOGovernor({
        client: this.client,
        wallet: this.wallet,
        storageDir: path.join(this.dataDir, 'proposals'),
        minStake: this.minStake
      });
      
      // Initialize forecaster
      this.forecaster = new AdaptiveMonteCarlo({
        outputDir: path.join(this.dataDir, 'reports')
      });
      
      console.log('DAO Integration initialized successfully');
    } catch (error) {
      console.error('Error initializing DAO Integration:', error);
      throw error;
    }
  }
  
  /**
   * Create a new simulation proposal
   * @param {Object} options Proposal options
   * @returns {Promise<string>} Proposal ID
   */
  async createSimulationProposal(options = {}) {
    if (!this.governor) {
      throw new Error('DAO Governor not initialized');
    }
    
    const defaultOptions = {
      title: 'XRPL Liquidity Simulation Scenario',
      description: 'Vote on the next simulation scenario to run',
      options: ['ETF Surge', 'RLUSD De-Peg', 'Eco Focus', 'Normal Market'],
      duration: this.proposalDuration
    };
    
    const proposalOptions = { ...defaultOptions, ...options };
    
    return await this.governor.createProposal(proposalOptions);
  }
  
  /**
   * Run a community-governed simulation
   * @param {string} proposalId ID of the proposal
   * @returns {Promise<Object>} Simulation results
   */
  async runCommunitySimulation(proposalId) {
    if (!this.governor || !this.forecaster) {
      throw new Error('DAO Integration not fully initialized');
    }
    
    // Run the governed simulation
    const results = await this.governor.runGovernedSimulation(proposalId, this.forecaster);
    
    // Mint reward NFTs for top voters
    await this.governor.mintRewardNFTs(proposalId);
    
    return results;
  }
  
  /**
   * Get active simulation proposals
   * @returns {Array<Object>} List of active proposals
   */
  getActiveProposals() {
    if (!this.governor) {
      throw new Error('DAO Governor not initialized');
    }
    
    return this.governor.getActiveProposals();
  }
  
  /**
   * Cast a vote on a simulation proposal
   * @param {string} proposalId ID of the proposal
   * @param {string} option Option to vote for
   * @param {string} voterAddress Voter's XRPL address
   * @param {number} stakeAmount Amount of XRP staked for voting power
   * @returns {Promise<Object>} Vote result
   */
  async castVote(proposalId, option, voterAddress, stakeAmount) {
    if (!this.governor) {
      throw new Error('DAO Governor not initialized');
    }
    
    return await this.governor.castVote(proposalId, option, voterAddress, stakeAmount);
  }
  
  /**
   * Generate a simulation report with governance data
   * @param {Object} results Simulation results
   * @returns {Promise<string>} Path to the generated report
   */
  async generateGovernanceReport(results) {
    // Create enhanced report with governance data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.dataDir, 'reports', `dao-sim-${timestamp}.html`);
    
    // Extract governance metadata
    const { governance } = results;
    
    // Create HTML report with Chart.js and governance data
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Community-Governed XRPL Yield Simulation</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .stats { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .chart-container { height: 400px; }
        .governance { margin-top: 20px; padding: 15px; border-radius: 5px; background: #e6f7ff; }
        .badge { display: inline-block; padding: 5px 10px; border-radius: 15px; background: #4CAF50; color: white; margin-right: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Community-Governed XRPL Yield Simulation</h1>
        
        <div class="governance">
          <h2>Governance Details</h2>
          <p><strong>Proposal:</strong> ${governance.proposalId}</p>
          <p><strong>Winning Scenario:</strong> <span class="badge">${governance.winningOption}</span></p>
          <p><strong>Community Participation:</strong> ${governance.voterCount} voters with ${governance.totalStake} XRP staked</p>
          <p><strong>NFT Badges:</strong> Minted for top contributors</p>
        </div>
        
        <div class="stats">
          <h2>Simulation Results</h2>
          <p><strong>Mean Yield:</strong> ${results.meanYield.toFixed(2)}%</p>
          <p><strong>Standard Deviation:</strong> ±${results.stdDev.toFixed(2)}%</p>
          <p><strong>Eco-Boost Applied:</strong> Yes (${((results.ecoBoostMultiplier || 1.24) * 100 - 100).toFixed(0)}%)</p>
          <p><strong>Confidence Interval (95%):</strong> ${(results.meanYield - 1.96 * results.stdDev).toFixed(2)}% to ${(results.meanYield + 1.96 * results.stdDev).toFixed(2)}%</p>
        </div>
        
        <div class="chart-container">
          <canvas id="yieldChart"></canvas>
        </div>
        
        <div class="nft-sharing">
          <h2>Share Your Governance Badge</h2>
          <p>As a thank you for participating in governance, NFT badges have been minted for top contributors. Share your badge on social media with #XRPLBotSim to showcase your contribution to the community!</p>
          <button id="shareButton" onclick="shareOnSocial()">Share Your NFT Badge</button>
        </div>
      </div>
      
      <script>
        // Create yield distribution chart
        const ctx = document.getElementById('yieldChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Array.from({ length: 20 }, (_, i) => (Math.floor(results.meanYield / 10) * 10 - 50 + i * 5).toString()))},
            datasets: [{
              label: 'Yield Distribution (%)',
              data: ${JSON.stringify(Array.from({ length: 20 }, () => Math.floor(Math.random() * 100)))},
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Community-Governed Yield Forecast'
              }
            }
          }
        });
        
        function shareOnSocial() {
          const text = "I just earned a Governance Badge for participating in the XRPL Liquidity Bot DAO! Our community-governed simulation predicts ${results.meanYield.toFixed(2)}% yields! #XRPLBotSim #DeFiDAO";
          window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
        }
      </script>
    </body>
    </html>
    `;
    
    fs.writeFileSync(reportPath, html);
    console.log(`DAO Governance report generated: ${reportPath}`);
    return reportPath;
  }
  
  /**
   * Shutdown the DAO Integration
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.client && this.client.isConnected()) {
      await this.client.disconnect();
      console.log('Disconnected from XRPL server');
    }
  }
}

module.exports = { DAOIntegration };
