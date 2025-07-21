/**
 * Enhanced DAO Governor for XRPL Liquidity Provider Bot
 * 
 * Enables community governance through XRPL-native voting:
 * - Creates on-chain proposals as NFTokens
 * - Allows users to stake XRP for voting power with on-chain transactions
 * - Auto-tallies votes via ledger events (no polling waste)
 * - Implements Vote Boost for eco-RWA backers (1.5x stake weight)
 * - Uses sentiment analysis to amplify eco-friendly votes
 * - Mints NFT Governance Badges with yield metadata as rewards
 */

const xrpl = require('xrpl');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // For sentiment analysis API calls

class DAOGovernor {
  /**
   * Initialize the Enhanced DAO Governor
   * @param {Object} options Configuration options
   * @param {xrpl.Client} options.client XRPL client instance
   * @param {xrpl.Wallet} options.wallet XRPL wallet for transactions
   * @param {string} options.daoAddress DAO treasury address for on-chain staking (default: wallet address)
   * @param {string} options.storageDir Directory to store proposal data
   * @param {number} options.minStake Minimum XRP stake to vote (default: 20)
   * @param {number} options.rewardThreshold Minimum stake to qualify for rewards (default: 50)
   * @param {number} options.transferFee Fee percentage for NFT transfers (default: 1000 = 10%)
   * @param {number} options.ecoBoostMultiplier Multiplier for eco-friendly votes (default: 1.5)
   * @param {boolean} options.useSentimentAnalysis Whether to use sentiment analysis for vote boosting (default: true)
   * @param {string} options.sentimentApiKey API key for sentiment analysis service (optional)
   * @param {string} options.sentimentHashtag Hashtag to track for sentiment analysis (default: #XRPLGreenDeFi)
   */
  constructor(options = {}) {
    this.client = options.client;
    this.wallet = options.wallet;
    this.daoAddress = options.daoAddress || this.wallet.address;
    this.storageDir = options.storageDir || path.join(__dirname, '../../data/dao');
    this.minStake = options.minStake || 20;
    this.rewardThreshold = options.rewardThreshold || 50;
    this.transferFee = options.transferFee || 1000; // 10% royalties for passive income
    this.daoTreasuryFee = options.daoTreasuryFee || 500; // 5% to DAO treasury for $5K/month funding
    this.ecoBoostMultiplier = options.ecoBoostMultiplier || 1.75; // 🚀 Revolutionary 1.75x eco-boost
    this.useSentimentAnalysis = options.useSentimentAnalysis !== false;
    this.sentimentApiKey = options.sentimentApiKey;
    this.sentimentHashtag = options.sentimentHashtag || '#XRPLGreenDeFi';
    this.sentimentOracle = options.sentimentOracle;
    
    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    
    // Track active proposals
    this.activeProposals = new Map();
    
    // Cache for sentiment scores
    this.sentimentCache = {
      lastChecked: 0,
      score: 0.5 // Default neutral score
    };
    
    // Load existing proposals
    this._loadProposals();
    
    console.log(`Enhanced DAO Governor initialized with eco-boost multiplier: ${this.ecoBoostMultiplier}x`);
    console.log(`On-chain staking enabled with DAO address: ${this.daoAddress}`);
    console.log(`Sentiment analysis ${this.useSentimentAnalysis ? 'enabled' : 'disabled'} for hashtag: ${this.sentimentHashtag}`);
  }
  
  /**
   * Load existing proposals from storage
   * @private
   */
  _loadProposals() {
    try {
      const proposalsFile = path.join(this.storageDir, 'proposals.json');
      if (fs.existsSync(proposalsFile)) {
        const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
        proposals.forEach(p => {
          this.activeProposals.set(p.id, p);
        });
        console.log(`Loaded ${this.activeProposals.size} existing proposals`);
      }
    } catch (error) {
      console.warn('Error loading proposals:', error.message);
    }
  }
  
  /**
   * Get sentiment score for eco-boost calculation with oracle network integration
   * Caches results for 15 minutes to avoid excessive API calls
   * @private
   * @param {Object} options Options for sentiment analysis
   * @param {boolean} options.useRealData Whether to use real sentiment data
   * @param {string} options.asset Asset to get sentiment for (default: XRP)
   * @param {boolean} options.bypassCache Whether to bypass the cache
   * @returns {Promise<number>} Sentiment score between 0 and 1
   */
  async _getSentimentScore(options = {}) {
    try {
      const { 
        useRealData = true, 
        asset = 'XRP', 
        bypassCache = false 
      } = options;
      
      // Use cached value if less than 15 minutes old and not bypassing cache
      const now = Date.now();
      if (!bypassCache && now - this.sentimentCache.lastChecked < 15 * 60 * 1000) {
        console.log(`Using cached sentiment score: ${this.sentimentCache.score.toFixed(2)} (from ${Math.round((now - this.sentimentCache.lastChecked) / 60000)} minutes ago)`);
        return this.sentimentCache.score;
      }
      
      // If we have a sentiment oracle network connection, use it
      if (this.sentimentOracle && useRealData) {
        try {
          const sentimentData = await this.sentimentOracle.getSentiment(asset, this.sentimentHashtag);
          
          // Cache the result
          const score = sentimentData.score;
          this.sentimentCache = {
            lastChecked: now,
            score,
            source: 'oracle',
            asset
          };
          
          console.log(`Real-time sentiment data from oracle network for ${asset} (${this.sentimentHashtag}): ${score.toFixed(2)}`);
          console.log(`Sentiment details: Positive: ${sentimentData.positive?.toFixed(2) || 'N/A'}, Negative: ${sentimentData.negative?.toFixed(2) || 'N/A'}, Volume: ${sentimentData.volume || 'N/A'}`);
          
          return score;
        } catch (oracleError) {
          console.warn('Sentiment oracle error, falling back to API:', oracleError.message);
          // Fall through to API
        }
      }
      
      // If sentiment analysis is enabled and API key is available, use the API
      if (this.useSentimentAnalysis && this.sentimentApiKey && useRealData) {
        try {
          // Call sentiment analysis API
          const response = await axios.get('https://api.sentiment-analysis.example/analyze', {
            params: {
              query: `${this.sentimentHashtag} ${asset}`,
              limit: 200,
              api_key: this.sentimentApiKey,
              timeframe: '24h'
            }
          });
          
          // Calculate normalized score (0-1)
          let score = 0.5; // Neutral default
          
          if (response.data && response.data.results) {
            // Extract sentiment metrics from API response
            const { positive, negative, neutral, volume } = response.data.results;
            const total = positive + negative + neutral;
            
            if (total > 0) {
              // Calculate weighted score with volume consideration
              score = (positive * 1 + neutral * 0.5) / total;
              
              // Adjust confidence based on volume
              if (volume < 50) {
                // Low volume, regress toward mean
                score = score * 0.7 + 0.5 * 0.3;
              }
            }
            
            // Cache the result
            this.sentimentCache = {
              lastChecked: now,
              score,
              source: 'api',
              asset,
              volume
            };
            
            console.log(`Sentiment analysis API for ${asset} (${this.sentimentHashtag}): ${score.toFixed(2)} (volume: ${volume || 'unknown'})`);
            return score;
          }
        } catch (apiError) {
          console.warn('Sentiment API error, falling back to synthetic data:', apiError.message);
          // Fall through to synthetic data
        }
      }
      
      // Generate synthetic sentiment based on recent market activity
      // This is a fallback when real data sources are unavailable
      const dayOfYear = Math.floor((now - new Date(now).setMonth(0, 0)) / 86400000);
      const hourOfDay = new Date(now).getHours();
      
      // Create some cyclical patterns with noise
      const dailyCycle = Math.sin(dayOfYear / 14) * 0.2; // ~14 day cycle
      const hourlyCycle = Math.sin(hourOfDay / 12 * Math.PI) * 0.1; // 12 hour cycle
      const noise = (Math.random() - 0.5) * 0.15; // Random noise
      
      // Base sentiment with some seasonality and randomness
      let baseSentiment = 0.65; // Slightly positive base sentiment
      
      // Asset-specific adjustments
      if (asset === 'RLUSD') {
        baseSentiment = 0.55; // Slightly lower for stablecoins
      } else if (asset === 'XRP') {
        baseSentiment += 0.05; // Slightly higher for XRP in XRPL context
      }
      
      // Add cyclical patterns and noise
      let score = baseSentiment + dailyCycle + hourlyCycle + noise;
      
      // Ensure sentiment is between 0 and 1
      score = Math.max(0.1, Math.min(0.9, score));
      
      // Cache the synthetic result
      this.sentimentCache = {
        lastChecked: now,
        score,
        source: 'synthetic',
        asset
      };
      
      console.log(`Synthetic sentiment generated for ${asset}: ${score.toFixed(2)}`);
      return score;
    } catch (error) {
      console.error('Error getting sentiment score:', error);
      // Default to neutral sentiment on error
      return 0.5;
    }
  }
  
  /**
   * Calculate revolutionary eco-boost multiplier with sentiment-weighted 1.75x boost
   * @private
   * @param {boolean} isEcoOption Whether the option is eco-friendly
   * @returns {Promise<number>} Boost multiplier
   */
  async _calculateEcoBoost(isEcoOption) {
    if (!isEcoOption) {
      return 1; // No boost for non-eco options
    }
    
    try {
      const sentimentScore = await this._getSentimentScore();
      
      // 🚀 Revolutionary base eco-boost multiplier (1.75x)
      let boost = this.ecoBoostMultiplier;
      
      // 🌱 REVOLUTIONARY: Auto-boost eco-proposals when #XRPLGreenDeFi sentiment >0.7
      if (sentimentScore > 0.7) {
        boost = this.ecoBoostMultiplier; // Full 1.75x boost for high green sentiment
        console.log(`🌱 Revolutionary eco-boost activated! Sentiment: ${sentimentScore.toFixed(3)} -> ${boost}x multiplier`);
      } else {
        // Reduced boost for lower sentiment
        boost = 1 + (this.ecoBoostMultiplier - 1) * (sentimentScore / 0.7);
        console.log(`🌿 Scaled eco-boost: Sentiment: ${sentimentScore.toFixed(3)} -> ${boost.toFixed(2)}x multiplier`);
      }
      
      // 💰 Additional treasury funding boost for high-engagement eco-proposals
      if (sentimentScore > 0.8) {
        boost *= 1.1; // Extra 10% for exceptional green sentiment (scales DAO treasury)
        console.log(`💰 Treasury funding boost activated! Final multiplier: ${boost.toFixed(2)}x`);
      }
      
      return boost;
    } catch (error) {
      console.warn('Error calculating revolutionary eco-boost, using base multiplier:', error.message);
      return this.ecoBoostMultiplier;
    }
  }
  
  /**
   * Save proposals to storage
   * @private
   */
  _saveProposals() {
    try {
      const proposalsFile = path.join(this.storageDir, 'proposals.json');
      const proposals = Array.from(this.activeProposals.values());
      fs.writeFileSync(proposalsFile, JSON.stringify(proposals, null, 2));
    } catch (error) {
      console.error('Error saving proposals:', error.message);
    }
  }
  
  /**
   * Create a new governance proposal with on-chain NFT representation
   * @param {Object} proposal Proposal details
   * @param {string} proposal.title Title of the proposal
   * @param {string} proposal.description Description of the proposal
   * @param {Array<string>} proposal.options Voting options
   * @param {Array<boolean>} proposal.ecoOptions Array indicating which options are eco-friendly (for boost)
   * @param {number} proposal.duration Duration in seconds (default: 86400 = 1 day)
   * @param {Object} proposal.metadata Additional metadata to include in the NFT
   * @returns {Promise<string>} Proposal ID
   */
  async createProposal(proposal) {
    try {
      // Validate proposal
      if (!proposal.title || !proposal.options || proposal.options.length < 2) {
        throw new Error('Invalid proposal: requires title and at least 2 options');
      }
      
      // Create proposal metadata
      const proposalId = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const proposalData = {
        id: proposalId,
        title: proposal.title,
        description: proposal.description || '',
        options: proposal.options,
        ecoOptions: proposal.ecoOptions || proposal.options.map(() => false),
        createdAt: Date.now(),
        expiresAt: Date.now() + (proposal.duration || 86400) * 1000,
        votes: {},
        voters: {},
        nftTokenId: null,
        metadata: proposal.metadata || {}
      };
      
      // Initialize vote counters
      proposal.options.forEach(option => {
        proposalData.votes[option] = 0;
      });
      
      // Prepare NFT metadata with enhanced information
      const nftMetadata = {
        type: 'dao-proposal',
        id: proposalId,
        title: proposal.title,
        description: proposal.description,
        options: proposal.options,
        ecoOptions: proposalData.ecoOptions,
        createdAt: proposalData.createdAt,
        expiresAt: proposalData.expiresAt,
        creator: this.wallet.address,
        version: '2.0', // Enhanced version
        ...proposal.metadata
      };
      
      // Mint NFToken for the proposal with enhanced metadata
      const tx = await this.client.autofill({
        TransactionType: 'NFTokenMint',
        Account: this.wallet.address,
        URI: xrpl.convertStringToHex(JSON.stringify(nftMetadata)),
        Flags: xrpl.NFTokenMintFlags.tfTransferable,
        TransferFee: this.transferFee,
        NFTokenTaxon: 0 // Required field
      });
      
      const signed = this.wallet.sign(tx);
      const result = await this.client.submitAndWait(signed.tx_blob);
      
      // Extract NFToken ID from result
      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        // Get the NFTokenID from the transaction metadata
        const nftokenID = result.result.meta.nftoken_id || 
                         (result.result.meta.AffectedNodes?.find(node => 
                           node.CreatedNode?.LedgerEntryType === 'NFTokenPage'
                         )?.CreatedNode?.NewFields?.NFTokens?.[0]?.NFToken?.NFTokenID);
        
        if (nftokenID) {
          proposalData.nftTokenId = nftokenID;
        } else {
          // Fallback to querying account NFTs
          const nfts = await this.client.request({
            command: 'account_nfts',
            account: this.wallet.address
          });
          
          // Find the newly minted NFT (most recent one)
          const latestNft = nfts.result.account_nfts.reduce((latest, nft) => {
            if (!latest || nft.nft_serial > latest.nft_serial) {
              return nft;
            }
            return latest;
          }, null);
          
          if (latestNft) {
            proposalData.nftTokenId = latestNft.NFTokenID;
          }
        }
      }
      
      // Store proposal
      this.activeProposals.set(proposalId, proposalData);
      this._saveProposals();
      
      console.log(`Enhanced DAO Proposal Created: ${proposalId} - "${proposal.title}"`);
      console.log(`Options: ${proposal.options.join(', ')}`);
      console.log(`Eco-friendly options: ${proposalData.ecoOptions.map((isEco, i) => isEco ? proposal.options[i] : null).filter(Boolean).join(', ') || 'None'}`);
      console.log(`NFT Token ID: ${proposalData.nftTokenId}`);
      
      // Subscribe to ledger events for this proposal
      this._subscribeToVoteEvents(proposalId);
      
      return proposalId;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }
  
  /**
   * Subscribe to ledger events for auto-tallying votes
   * @private
   * @param {string} proposalId ID of the proposal to monitor
   */
  async _subscribeToVoteEvents(proposalId) {
    try {
      // Subscribe to payment transactions to the DAO address
      await this.client.request({
        command: 'subscribe',
        streams: ['transactions'],
        accounts: [this.daoAddress]
      });
      
      // Set up event handler for incoming transactions
      this.client.on('transaction', (tx) => {
        this._processTransactionEvent(tx, proposalId);
      });
      
      console.log(`Subscribed to vote events for proposal ${proposalId}`);
    } catch (error) {
      console.warn(`Failed to subscribe to vote events: ${error.message}`);
    }
  }
  
  /**
   * Process transaction events for auto-tallying
   * @private
   * @param {Object} tx Transaction data
   * @param {string} proposalId ID of the proposal
   */
  async _processTransactionEvent(tx, proposalId) {
    try {
      // Check if this is a payment to the DAO address
      if (tx.transaction.TransactionType === 'Payment' && 
          tx.transaction.Destination === this.daoAddress &&
          tx.meta.TransactionResult === 'tesSUCCESS' &&
          tx.transaction.Memos) {
        
        // Extract memo data
        for (const memoObj of tx.transaction.Memos) {
          if (memoObj.Memo && memoObj.Memo.MemoData) {
            const memoText = xrpl.convertHexToString(memoObj.Memo.MemoData);
            const [votePropId, voteOption] = memoText.split(':');
            
            // Check if this vote is for our proposal
            if (votePropId === proposalId) {
              const stakeAmount = Number(tx.transaction.Amount) / 1000000; // Convert drops to XRP
              const voterAddress = tx.transaction.Account;
              
              console.log(`Auto-detected vote: ${voterAddress} voted for "${voteOption}" with ${stakeAmount} XRP`);
              
              // Process the vote (without creating a new transaction)
              await this._recordVote(proposalId, voteOption, voterAddress, stakeAmount);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error processing transaction event: ${error.message}`);
    }
  }
  
  /**
   * Internal method to record a vote without creating a new transaction
   * Used by both castVote and auto-detection from ledger events
   * @private
   * @param {string} proposalId ID of the proposal
   * @param {string} option Option to vote for
   * @param {string} voterAddress Voter's XRPL address
   * @param {number} stakeAmount Amount of XRP staked for voting power
   * @returns {Promise<Object>} Vote result
   */
  async _recordVote(proposalId, option, voterAddress, stakeAmount) {
    try {
      // Validate proposal exists and is active
      const proposal = this.activeProposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal ${proposalId} not found`);
      }
      
      if (Date.now() > proposal.expiresAt) {
        throw new Error(`Proposal ${proposalId} has expired`);
      }
      
      // Validate option
      if (!proposal.options.includes(option)) {
        throw new Error(`Invalid option: ${option}`);
      }
      
      // Validate stake amount
      if (stakeAmount < this.minStake) {
        throw new Error(`Minimum stake required: ${this.minStake} XRP`);
      }
      
      // Calculate eco-boost if applicable
      const optionIndex = proposal.options.indexOf(option);
      const isEcoOption = proposal.ecoOptions && proposal.ecoOptions[optionIndex];
      const ecoBoost = await this._calculateEcoBoost(isEcoOption);
      const boostedStake = stakeAmount * ecoBoost;
      
      // Check if voter has already voted
      if (proposal.voters[voterAddress]) {
        // Update existing vote
        const previousOption = proposal.voters[voterAddress].option;
        const previousStake = proposal.voters[voterAddress].boostedStake;
        
        // Remove previous vote
        proposal.votes[previousOption] -= previousStake;
        
        // Add new vote with eco-boost
        proposal.votes[option] += boostedStake;
        proposal.voters[voterAddress] = { 
          option, 
          stake: stakeAmount,
          boostedStake,
          ecoBoost: isEcoOption ? ecoBoost : 1.0,
          timestamp: Date.now()
        };
      } else {
        // Add new vote with eco-boost
        proposal.votes[option] += boostedStake;
        proposal.voters[voterAddress] = { 
          option, 
          stake: stakeAmount,
          boostedStake,
          ecoBoost: isEcoOption ? ecoBoost : 1.0,
          timestamp: Date.now()
        };
      }
      
      // Save updated proposal
      this._saveProposals();
      
      const boostMsg = isEcoOption ? ` with ${ecoBoost.toFixed(2)}x eco-boost (effective stake: ${boostedStake.toFixed(2)} XRP)` : '';
      console.log(`Vote recorded on proposal ${proposalId}: ${voterAddress} voted for "${option}" with ${stakeAmount} XRP${boostMsg}`);
      
      return {
        proposalId,
        option,
        voterAddress,
        stakeAmount,
        boostedStake,
        ecoBoost: isEcoOption ? ecoBoost : 1.0,
        currentTally: proposal.votes
      };
    } catch (error) {
      console.error('Error recording vote:', error);
      throw error;
    }
  }
  
  /**
   * Cast a vote on a proposal with on-chain staking
   * @param {string} proposalId ID of the proposal
   * @param {string} option Option to vote for
   * @param {number} stakeAmount Amount of XRP to stake for voting power
   * @param {Object} wallet Wallet to use for the transaction (defaults to DAO wallet)
   * @returns {Promise<Object>} Vote result including transaction details
   */
  async castVote(proposalId, option, stakeAmount, wallet = this.wallet) {
    try {
      // Validate proposal exists and is active
      const proposal = this.activeProposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal ${proposalId} not found`);
      }
      
      if (Date.now() > proposal.expiresAt) {
        throw new Error(`Proposal ${proposalId} has expired`);
      }
      
      // Validate option
      if (!proposal.options.includes(option)) {
        throw new Error(`Invalid option: ${option}`);
      }
      
      // Validate stake amount
      if (stakeAmount < this.minStake) {
        throw new Error(`Minimum stake required: ${this.minStake} XRP`);
      }
      
      // Create on-chain vote transaction (Payment with memo)
      const tx = await this.client.autofill({
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: this.daoAddress,
        Amount: String(Math.floor(stakeAmount * 1000000)), // Convert XRP to drops
        Memos: [{
          Memo: {
            MemoData: xrpl.convertStringToHex(`${proposalId}:${option}`),
            MemoFormat: xrpl.convertStringToHex('text/plain'),
            MemoType: xrpl.convertStringToHex('dao/vote')
          }
        }]
      });
      
      // Sign and submit transaction
      const signed = wallet.sign(tx);
      const result = await this.client.submitAndWait(signed.tx_blob);
      
      if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Vote transaction failed: ${result.result.meta.TransactionResult}`);
      }
      
      // The vote will be recorded by the event listener
      // But we'll also record it directly for immediate feedback
      const voteResult = await this._recordVote(proposalId, option, wallet.address, stakeAmount);
      
      return {
        ...voteResult,
        txHash: result.result.hash,
        ledgerIndex: result.result.ledger_index
      };
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }
  
  /**
   * Tally votes for a proposal with eco-boost consideration
   * @param {string} proposalId ID of the proposal
   * @returns {Promise<Object>} Enhanced tally results
   */
  async tallyVotes(proposalId) {
    try {
      // Validate proposal exists
      const proposal = this.activeProposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal ${proposalId} not found`);
      }
      
      // Find winning option
      let winningOption = null;
      let maxVotes = 0;
      
      Object.entries(proposal.votes).forEach(([option, votes]) => {
        if (votes > maxVotes) {
          winningOption = option;
          maxVotes = votes;
        }
      });
      
      // Calculate raw votes (without eco-boost) for analytics
      const rawVotes = {};
      const ecoBoostImpact = {};
      
      // Initialize with zeros
      proposal.options.forEach(option => {
        rawVotes[option] = 0;
        ecoBoostImpact[option] = 0;
      });
      
      // Calculate raw votes and eco-boost impact
      Object.entries(proposal.voters).forEach(([address, data]) => {
        rawVotes[data.option] += data.stake;
        ecoBoostImpact[data.option] += (data.boostedStake - data.stake);
      });
      
      // Get top voters for rewards, sorted by boosted stake
      const topVoters = Object.entries(proposal.voters)
        .filter(([_, data]) => data.stake >= this.rewardThreshold)
        .sort((a, b) => b[1].boostedStake - a[1].boostedStake)
        .slice(0, 10)
        .map(([address, data]) => ({
          address,
          option: data.option,
          stake: data.stake,
          boostedStake: data.boostedStake,
          ecoBoost: data.ecoBoost
        }));
      
      // Calculate eco-friendly voting statistics
      const ecoOptions = proposal.options.filter((_, i) => proposal.ecoOptions[i]);
      const ecoVotes = ecoOptions.reduce((sum, option) => sum + (proposal.votes[option] || 0), 0);
      const totalVotes = Object.values(proposal.votes).reduce((sum, v) => sum + v, 0);
      const ecoPercentage = totalVotes > 0 ? (ecoVotes / totalVotes) * 100 : 0;
      
      // Get winning option index and check if it's eco-friendly
      const winningIndex = proposal.options.indexOf(winningOption);
      const isWinnerEco = winningIndex >= 0 && proposal.ecoOptions[winningIndex];
      
      const result = {
        proposalId,
        title: proposal.title,
        winningOption,
        isWinnerEco,
        votes: proposal.votes,
        rawVotes,
        ecoBoostImpact,
        totalVotes,
        totalRawVotes: Object.values(rawVotes).reduce((sum, v) => sum + v, 0),
        ecoVotes,
        ecoPercentage,
        topVoters,
        isExpired: Date.now() > proposal.expiresAt,
        metadata: proposal.metadata || {}
      };
      
      console.log(`Enhanced Proposal ${proposalId} tally results:`);
      console.log(`Winning option: "${winningOption}" with ${maxVotes.toFixed(2)} votes (${isWinnerEco ? 'Eco-friendly ✅' : 'Standard'})`);
      console.log(`Total votes: ${result.totalVotes.toFixed(2)} (Raw: ${result.totalRawVotes.toFixed(2)}, Eco-boost: ${(result.totalVotes - result.totalRawVotes).toFixed(2)})`);
      console.log(`Eco-friendly voting: ${ecoPercentage.toFixed(2)}% of total votes`);
      console.log(`Top voters: ${topVoters.length}`);
      
      return result;
    } catch (error) {
      console.error('Error tallying votes:', error);
      throw error;
    }
  }
  
  /**
   * Get all active proposals
   * @returns {Array<Object>} List of active proposals
   */
  getActiveProposals() {
    const now = Date.now();
    return Array.from(this.activeProposals.values())
      .filter(p => p.expiresAt > now)
      .map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        options: p.options,
        votes: p.votes,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        nftTokenId: p.nftTokenId
      }));
  }
  
  /**
   * Mint NFT Governance Badges with yield metadata for top voters
   * @param {string} proposalId ID of the proposal
   * @param {Object} simulationResults Optional simulation results with yield data
   * @returns {Promise<Array<Object>>} Minted NFT details with metadata
      // Calculate eco score based on winning option and voter choices
      const calculateEcoScore = (voter) => {
        const baseScore = isWinnerEco ? 20 : 10;
        const voterBoost = voter.ecoBoost > 1 ? 15 * (voter.ecoBoost - 1) / (this.ecoBoostMultiplier - 1) : 0;
        const optionIndex = tally.metadata?.optionEcoScores ? 
          tally.options.indexOf(voter.option) : -1;
        
        const optionScore = optionIndex >= 0 && tally.metadata?.optionEcoScores ? 
          tally.metadata.optionEcoScores[optionIndex] : 0;
          
        return Math.round(baseScore + voterBoost + optionScore);
      };
      
      const mintedNFTs = [];
      
      // Mint NFT for each top voter with enhanced metadata
      for (const voter of topVoters) {
        // Calculate personalized eco score
        const ecoScore = calculateEcoScore(voter);
        
        // Calculate personalized yield bonus based on stake and eco-boost
        const stakeBonus = Math.min(5, voter.stake / 20); // Up to 5% bonus for stake
        const ecoBonus = voter.ecoBoost > 1 ? (voter.ecoBoost - 1) * 10 : 0; // Up to 5% for eco-boost
        
        // Personalized yield metadata
        const personalYield = {
          ...yieldMetadata,
          meanYield: yieldMetadata.meanYield + stakeBonus + ecoBonus,
          maxYield: yieldMetadata.maxYield + stakeBonus + ecoBonus,
          stakeBonus,
          ecoBonus
        };
        
        // Enhanced NFT metadata with yield data
        const nftMetadata = {
          type: 'governance-badge',
          version: '2.0',
          proposalId,
          proposalTitle: title,
          winningOption,
          isWinnerEco,
          recipient: voter.address,
          stake: voter.stake,
          boostedStake: voter.boostedStake,
          ecoBoost: voter.ecoBoost,
          timestamp: Date.now(),
          yield: personalYield,
          ecoScore,
          rarity: `${topVoters.indexOf(voter) + 1} of ${topVoters.length}`,
          transferable: true
        };
        
        // Mint governance badge with enhanced metadata
        const tx = await this.client.autofill({
          TransactionType: 'NFTokenMint',
          Account: this.wallet.address,
          TransferFee: this.transferFee,
          URI: xrpl.convertStringToHex(JSON.stringify(nftMetadata)),
          NFTokenTaxon: 0 // Required field
        });
        
        const signed = this.wallet.sign(tx);
        const result = await this.client.submitAndWait(signed.tx_blob);
        
        // Extract NFToken ID
        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
          // Get the NFTokenID from the transaction metadata
          const nftokenID = result.result.meta.nftoken_id || 
                          (result.result.meta.AffectedNodes?.find(node => 
                            node.CreatedNode?.LedgerEntryType === 'NFTokenPage'
                          )?.CreatedNode?.NewFields?.NFTokens?.[0]?.NFToken?.NFTokenID);
          
          let tokenId = nftokenID;
          
          if (!tokenId) {
            // Fallback to querying account NFTs
            const nfts = await this.client.request({
              command: 'account_nfts',
              account: this.wallet.address
            });
            
            // Find the newly minted NFT (most recent one)
            const latestNft = nfts.result.account_nfts.reduce((latest, nft) => {
              if (!latest || nft.nft_serial > latest.nft_serial) {
                return nft;
              }
              return latest;
            }, null);
            
            if (latestNft) {
              tokenId = latestNft.NFTokenID;
            }
          }
          
          if (tokenId) {
            const nftDetails = {
              recipient: voter.address,
              nftTokenId: tokenId,
              metadata: nftMetadata
            };
            
            mintedNFTs.push(nftDetails);
            
            // Transfer NFT to voter
            const transferTx = await this.client.autofill({
              TransactionType: 'NFTokenCreateOffer',
              Account: this.wallet.address,
              NFTokenID: tokenId,
              Destination: voter.address,
              Amount: '0',
              Flags: 1 // tfSellNFToken
            });
            
            const signedTransfer = this.wallet.sign(transferTx);
            await this.client.submitAndWait(signedTransfer.tx_blob);
            
            console.log(`Enhanced Governance Badge NFT minted and transferred to ${voter.address}`);
            console.log(`Token ID: ${tokenId}`);
            console.log(`Yield Metadata: ${personalYield.meanYield.toFixed(2)}% mean yield, ${ecoScore} eco-score`);
          }
        }
      }
      
      return mintedNFTs;
    } catch (error) {
      console.error('Error minting reward NFTs:', error);
      throw error;
    }
  }
  
  /**
   * Run a simulation based on the winning option of a proposal
   * @param {string} proposalId ID of the proposal
   * @param {Object} simulationEngine Monte Carlo simulation engine instance
   * @param {Object} options Additional simulation options
   * @param {boolean} options.mintRewards Whether to mint NFT rewards after simulation (default: true)
   * @param {boolean} options.useRealData Whether to use real market data (default: true)
   * @param {number} options.iterations Number of Monte Carlo iterations (default: 1000)
   * @returns {Promise<Object>} Enhanced simulation results with governance data
   */
  async runGovernedSimulation(proposalId, simulationEngine, options = {}) {
    try {
      // Set default options
      const {
        mintRewards = true,
        useRealData = true,
        iterations = 1000
      } = options;
      
      // Get tally results with eco-boost data
      const tally = await this.tallyVotes(proposalId);
      const { winningOption, isWinnerEco, ecoPercentage } = tally;
      
      if (!winningOption) {
        throw new Error('No winning option found');
      }
      
      console.log(`Running enhanced community-governed simulation for option: "${winningOption}"`);
      console.log(`Eco-friendly voting: ${ecoPercentage.toFixed(2)}% of total votes`);
      console.log(`Using ${useRealData ? 'real' : 'synthetic'} market data with ${iterations} iterations`);
      
      // Get sentiment score for simulation parameters
      const sentimentScore = await this._getSentimentScore();
      
      // 🚀 Revolutionary auto-sim triggers with enhanced parameters for 70%+ APY predictions
      let simParams;
      
      switch (winningOption.toLowerCase()) {
        case 'etf surge':
        case 'high vol':
          simParams = { 
            vol: 0.96,
            sentimentBoost: 1.15 * sentimentScore,
            ecoBoostMultiplier: isWinnerEco ? 1.75 + (ecoPercentage / 100) * 0.5 : 1.24, // Revolutionary 1.75x
            iterations: Math.max(iterations, 2000), // Enhanced iterations for 95% confidence
            useRealData,
            strategy: 'aggressive',
            hedgeRatio: 0.2,
            rebalanceThreshold: 0.15,
            apyTarget: 0.7, // 70%+ APY target
            confidenceLevel: 0.95, // 95% confidence requirement
            autoTrigger: true // Revolutionary auto-trigger enabled
          };
          break;
          
        case 'rlusd de-peg':
        case 'rlusd hedge':
          simParams = { 
            vol: 0.13,
            hedge: 'RLUSD',
            sentimentBoost: 0.95 * sentimentScore,
            ecoBoostMultiplier: isWinnerEco ? 1.75 + (ecoPercentage / 100) * 0.5 : 1.24, // Revolutionary 1.75x
            iterations: Math.max(iterations, 1500),
            useRealData,
            strategy: 'defensive',
            hedgeRatio: 0.6,
            rebalanceThreshold: 0.1,
            apyTarget: 0.7, // 70%+ APY target
            confidenceLevel: 0.95,
            autoTrigger: true
          };
          break;
          
        case 'eco focus':
          simParams = { 
            vol: 0.13,
            ecoBoostMultiplier: 1.75 + (ecoPercentage / 100) * 0.7, // Revolutionary eco-focus boost
            ecoFocus: true,
            iterations: Math.max(iterations, 2500), // Extra iterations for eco-precision
            useRealData,
            strategy: 'eco-weighted',
            greenAssetAllocation: 0.7,
            rebalanceThreshold: 0.12,
            apyTarget: 0.75, // Higher 75%+ APY target for eco-focus
            confidenceLevel: 0.95,
            autoTrigger: true,
            sustainabilityBonus: 0.24 // 24% sustainability bonus
          };
          break;
          
        default:
          simParams = { 
            vol: 0.13,
            ecoBoostMultiplier: isWinnerEco ? 1.75 + (ecoPercentage / 100) * 0.3 : 1.24, // Revolutionary default
            iterations: Math.max(iterations, 1000),
            useRealData,
            strategy: 'balanced',
            hedgeRatio: 0.4,
            rebalanceThreshold: 0.12,
            apyTarget: 0.7, // 70%+ APY target
            confidenceLevel: 0.95,
            autoTrigger: true
          };
      }
      
      // Add sentiment-based AI boost if sentiment is high
      if (sentimentScore > 0.7) {
        simParams.aiBoost = 0.15 * (sentimentScore - 0.7) / 0.3; // Scale from 0 to 0.15 based on sentiment
        console.log(`Adding AI boost of ${simParams.aiBoost.toFixed(2)} based on high sentiment`);
      }
      
      // Run simulation with community-voted parameters
      console.log(`Starting Monte Carlo simulation with parameters:`, simParams);
      const results = await simulationEngine.forecast(simParams);
      
      // Identify top voters who voted for the winning option
      const winningVoters = Object.entries(this.activeProposals.get(proposalId).voters)
        .filter(([_, data]) => data.option === winningOption)
        .sort((a, b) => b[1].boostedStake - a[1].boostedStake)
        .slice(0, 10)
        .map(([address, data]) => ({
          address,
          stake: data.stake,
          boostedStake: data.boostedStake
        }));
      
      // Add enhanced governance metadata to results
      results.governance = {
        proposalId,
        winningOption,
        isWinnerEco,
        ecoPercentage,
        sentimentScore,
        voterCount: Object.keys(this.activeProposals.get(proposalId).voters).length,
        totalStake: tally.totalVotes,
        totalRawStake: tally.totalRawVotes,
        ecoBoostImpact: tally.totalVotes - tally.totalRawVotes,
        winningVoters,
        simulationParams: simParams
      };
      
      console.log(`Enhanced community-governed simulation complete:`);
      console.log(`Mean Yield: ${results.meanYield.toFixed(2)}% (±${results.yieldStdDev?.toFixed(2) || 'N/A'}%)`);
      console.log(`Max Yield: ${results.maxYield?.toFixed(2) || 'N/A'}%`);
      console.log(`Eco-Boost Impact: +${(tally.totalVotes - tally.totalRawVotes).toFixed(2)} voting power`);
      
      // Mint NFT rewards for top voters if enabled
      if (mintRewards) {
        console.log('Minting NFT rewards for top voters with yield metadata...');
        const mintedNFTs = await this.mintRewardNFTs(proposalId, results);
        results.governance.rewardNFTs = mintedNFTs;
      }
      
      return results;
    } catch (error) {
      console.error('Error running governed simulation:', error);
      throw error;
    }
  }
}

module.exports = { DAOGovernor };
