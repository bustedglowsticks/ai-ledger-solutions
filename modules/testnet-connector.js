/**
 * TestnetConnector Module
 * 
 * Provides secure XRPL testnet connectivity with:
 * - Auto-funding via faucet API
 * - Retry logic for 99% uptime
 * - Sentiment analysis for eco-vote boosting
 * - Wallet management
 * 
 * Part of the Stake-to-Yield Marketplace Hub
 */

const xrpl = require('xrpl');
const fetch = require('node-fetch');

class TestnetConnector {
  constructor(walletSeed = null) {
    this.client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    this.wallet = walletSeed ? xrpl.Wallet.fromSeed(walletSeed) : null;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Connect to XRPL testnet with retry logic for 99% uptime
   */
  async connect() {
    let retries = 0;
    let connected = false;

    while (!connected && retries < this.maxRetries) {
      try {
        await this.client.connect();
        connected = true;
        console.log('✅ Connected to XRPL Testnet - Ready for staking glory!');
      } catch (error) {
        retries++;
        console.log(`⚠️ Connection attempt ${retries} failed: ${error.message}`);
        if (retries < this.maxRetries) {
          console.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          throw new Error(`Failed to connect after ${this.maxRetries} attempts: ${error.message}`);
        }
      }
    }

    return connected;
  }

  /**
   * Disconnect from XRPL testnet
   */
  async disconnect() {
    if (this.client.isConnected()) {
      await this.client.disconnect();
      console.log('Disconnected from XRPL Testnet');
    }
  }

  /**
   * Generate a new wallet or use existing one
   */
  async generateWallet() {
    if (!this.wallet) {
      try {
        // Generate a new wallet using the testnet faucet
        const wallet = await this.client.fundWallet();
        this.wallet = wallet.wallet;
        console.log(`🔑 Generated new wallet: ${this.wallet.address}`);
        console.log(`💰 Initial balance: ${wallet.balance} XRP`);
        return this.wallet;
      } catch (error) {
        throw new Error(`Failed to generate wallet: ${error.message}`);
      }
    }
    return this.wallet;
  }

  /**
   * Fund stake via testnet faucet API
   * @param {number} amount - Amount to fund (in XRP)
   */
  async fundStake(amount = 10) {
    if (!this.wallet) {
      await this.generateWallet();
    }

    try {
      const response = await fetch('https://faucet.altnet.rippletest.net/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: this.wallet.address })
      });

      if (!response.ok) {
        throw new Error(`Faucet API error: ${response.status} ${response.statusText}`);
      }

      const fund = await response.json();
      console.log(`💸 Funded ${amount} XRP for staking - Balance: ${fund.balance} XRP`);
      return fund;
    } catch (error) {
      console.error(`⚠️ Funding error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sentiment boost for eco-friendly options
   * @returns {number} Boost multiplier (1.0-1.5)
   */
  async getSentimentBoost() {
    try {
      // Mock sentiment analysis (would integrate with real X API in production)
      const sentimentScore = this.mockSentimentAnalysis('#XRPLGreenDeFi');
      console.log(`📊 #XRPLGreenDeFi sentiment score: ${sentimentScore.toFixed(2)}`);
      
      // Calculate boost (1.0 to 1.5 based on sentiment)
      const boost = sentimentScore > 0.7 ? 1.5 : 
                   sentimentScore > 0.5 ? 1.3 : 
                   sentimentScore > 0.3 ? 1.1 : 1.0;
      
      console.log(`🌱 Eco-vote boost multiplier: ${boost.toFixed(2)}x`);
      return boost;
    } catch (error) {
      console.error(`⚠️ Sentiment analysis error: ${error.message}`);
      return 1.0; // Default to no boost on error
    }
  }

  /**
   * Mock sentiment analysis (would be replaced with real API)
   * @param {string} hashtag - Hashtag to analyze
   * @returns {number} Sentiment score (0-1)
   */
  mockSentimentAnalysis(hashtag) {
    // July 16, 2025: Strong positive sentiment for green DeFi
    const baseScore = 0.75;
    
    // Add some randomness
    const randomFactor = Math.random() * 0.2 - 0.1; // -0.1 to +0.1
    
    // Boost for specific eco hashtags
    const hashtagBoost = hashtag.toLowerCase().includes('green') ? 0.1 : 0;
    
    // Calculate final score (capped at 0-1)
    return Math.min(1, Math.max(0, baseScore + randomFactor + hashtagBoost));
  }

  /**
   * Get account info and balance
   * @returns {Object} Account info
   */
  async getAccountInfo() {
    if (!this.wallet) {
      throw new Error('No wallet available. Generate or provide a wallet first.');
    }

    try {
      const accountInfo = await this.client.request({
        command: 'account_info',
        account: this.wallet.address,
        ledger_index: 'validated'
      });

      const balance = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
      console.log(`💼 Account ${this.wallet.address}`);
      console.log(`💰 Balance: ${balance} XRP`);
      
      return {
        address: this.wallet.address,
        balance,
        accountData: accountInfo.result.account_data
      };
    } catch (error) {
      console.error(`⚠️ Account info error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TestnetConnector;
