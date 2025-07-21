/**
 * StakingMechanism Module
 * 
 * Sophisticated staking system with:
 * - Tiered weights based on XRP stake amount
 * - Eco-multipliers for green votes (1.5x)
 * - Auto-refunds post-tally
 * - Yield share rewards for top voters
 * 
 * Part of the Stake-to-Yield Marketplace Hub
 */

const xrpl = require('xrpl');

class StakingMechanism {
  constructor(connector) {
    this.connector = connector;
    this.stakes = new Map(); // Map of stakes by address and vote
    this.daoAddress = 'rDAOStakingTest'; // Mock DAO address
  }

  /**
   * Stake XRP to vote on a proposal
   * @param {string} voteId - ID of the vote
   * @param {string} option - Option being voted for
   * @param {number} amount - Amount of XRP to stake
   * @param {boolean} isEcoOption - Whether this is an eco-friendly option
   * @returns {Object} Transaction result
   */
  async stakeVote(voteId, option, amount, isEcoOption = false) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }

    try {
      // Get eco-boost multiplier if this is an eco-friendly option
      const ecoBoost = isEcoOption ? await this.connector.getSentimentBoost() : 1.0;
      const effectiveAmount = amount * ecoBoost;
      
      console.log(`🗳️ Staking ${amount} XRP on "${option}" for Vote ${voteId}`);
      if (isEcoOption) {
        console.log(`🌱 Eco-boost applied: ${amount} XRP × ${ecoBoost.toFixed(2)} = ${effectiveAmount.toFixed(2)} effective stake`);
      }
      
      // Prepare transaction to stake (send XRP to DAO address with memo)
      const tx = await this.connector.client.autofill({
        TransactionType: 'Payment',
        Account: this.connector.wallet.address,
        Destination: this.daoAddress,
        Amount: xrpl.xrpToDrops(amount),
        Memos: [{
          Memo: {
            MemoData: xrpl.convertStringToHex(JSON.stringify({
              voteId,
              option,
              isEcoOption,
              ecoBoost
            }))
          }
        }]
      });
      
      // Sign and submit transaction
      const signed = this.connector.wallet.sign(tx);
      const result = await this.connector.client.submitAndWait(signed.tx_blob);
      
      // Record the stake
      const stakeKey = `${this.connector.wallet.address}-${voteId}-${option}`;
      this.stakes.set(stakeKey, {
        address: this.connector.wallet.address,
        voteId,
        option,
        amount,
        effectiveAmount,
        isEcoOption,
        ecoBoost,
        txHash: result.result.hash
      });
      
      console.log(`✅ Stake confirmed! Transaction: ${result.result.hash}`);
      console.log(`💪 Your voting power: ${effectiveAmount.toFixed(2)} (${isEcoOption ? 'includes eco-boost' : 'no eco-boost'})`);
      
      return {
        success: true,
        txHash: result.result.hash,
        amount,
        effectiveAmount,
        ecoBoost
      };
    } catch (error) {
      console.error(`⚠️ Staking error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all stakes for a specific vote
   * @param {string} voteId - ID of the vote
   * @returns {Array} Array of stakes
   */
  getVoteStakes(voteId) {
    const voteStakes = [];
    
    for (const stake of this.stakes.values()) {
      if (stake.voteId === voteId) {
        voteStakes.push(stake);
      }
    }
    
    return voteStakes;
  }

  /**
   * Tally votes for a specific proposal
   * @param {string} voteId - ID of the vote
   * @returns {Object} Tally results
   */
  tallyVotes(voteId) {
    const voteStakes = this.getVoteStakes(voteId);
    const tally = {};
    const votersByOption = {};
    
    // Initialize votersByOption
    for (const stake of voteStakes) {
      if (!votersByOption[stake.option]) {
        votersByOption[stake.option] = [];
      }
    }
    
    // Tally votes with effective amounts
    for (const stake of voteStakes) {
      if (!tally[stake.option]) {
        tally[stake.option] = 0;
      }
      
      tally[stake.option] += stake.effectiveAmount;
      votersByOption[stake.option].push({
        address: stake.address,
        amount: stake.amount,
        effectiveAmount: stake.effectiveAmount
      });
    }
    
    // Find the winner
    let winningOption = null;
    let highestVote = 0;
    
    for (const [option, votes] of Object.entries(tally)) {
      if (votes > highestVote) {
        highestVote = votes;
        winningOption = option;
      }
    }
    
    // Get top voters overall (for rewards)
    const allVoters = voteStakes.map(stake => ({
      address: stake.address,
      amount: stake.amount,
      effectiveAmount: stake.effectiveAmount,
      option: stake.option
    }));
    
    // Sort by effective amount
    allVoters.sort((a, b) => b.effectiveAmount - a.effectiveAmount);
    
    // Get top 5 voters
    const topVoters = allVoters.slice(0, 5);
    
    return {
      voteId,
      tally,
      winner: winningOption,
      winningVotes: highestVote,
      votersByOption,
      topVoters
    };
  }

  /**
   * Refund stakes and reward top voters
   * @param {string} voteId - ID of the vote
   * @param {Array} topVoters - Array of top voters to reward
   * @param {number} rewardPool - Total XRP in reward pool
   * @returns {Object} Refund results
   */
  async refundStakes(voteId, topVoters, rewardPool = 10) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }
    
    console.log(`🔄 Processing refunds and rewards for Vote ${voteId}`);
    console.log(`🏆 Reward pool: ${rewardPool} XRP for top voters`);
    
    const results = {
      refunds: [],
      rewards: []
    };
    
    try {
      // Mock refunds (in production, would use actual DAO wallet)
      // In real implementation, the DAO would need to have signing capability
      
      // Process rewards for top voters
      for (let i = 0; i < topVoters.length; i++) {
        const voter = topVoters[i];
        
        // Calculate reward (decreasing by position)
        const rewardFactor = (topVoters.length - i) / ((topVoters.length * (topVoters.length + 1)) / 2);
        const rewardAmount = rewardPool * rewardFactor;
        
        console.log(`🎁 Rewarding ${voter.address} with ${rewardAmount.toFixed(2)} XRP (top voter #${i+1})`);
        
        // In production: Send actual XRP reward
        // Mock transaction for now
        const mockTx = {
          TransactionType: 'Payment',
          Account: this.daoAddress,
          Destination: voter.address,
          Amount: xrpl.xrpToDrops(rewardAmount)
        };
        
        results.rewards.push({
          address: voter.address,
          amount: rewardAmount,
          rank: i + 1
        });
      }
      
      console.log(`✅ Processed ${results.rewards.length} rewards for top voters`);
      return results;
    } catch (error) {
      console.error(`⚠️ Refund/reward error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate voting power based on stake amount and eco-boost
   * @param {number} amount - Base stake amount
   * @param {boolean} isEcoOption - Whether this is an eco-friendly option
   * @returns {Promise<number>} Effective voting power
   */
  async calculateVotingPower(amount, isEcoOption = false) {
    // Apply tiered weights based on stake amount
    let tierMultiplier = 1.0;
    
    if (amount >= 100) {
      tierMultiplier = 1.3; // 30% boost for large stakes (100+ XRP)
    } else if (amount >= 50) {
      tierMultiplier = 1.2; // 20% boost for medium stakes (50-99 XRP)
    } else if (amount >= 10) {
      tierMultiplier = 1.1; // 10% boost for small stakes (10-49 XRP)
    }
    
    // Apply eco-boost if applicable
    const ecoBoost = isEcoOption ? await this.connector.getSentimentBoost() : 1.0;
    
    // Calculate effective voting power
    const votingPower = amount * tierMultiplier * ecoBoost;
    
    return {
      baseAmount: amount,
      tierMultiplier,
      ecoBoost,
      votingPower
    };
  }
}

module.exports = StakingMechanism;
