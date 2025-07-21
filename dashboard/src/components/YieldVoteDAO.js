/*
 * YIELD VOTE DAO DASHBOARD COMPONENT
 * Revolutionary React interface for community-governed simulation arena
 * Features XRPL-native staking, NFT rewards, and eco-weighted voting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, 
  Trophy, 
  Coins, 
  Users, 
  TrendingUp, 
  Leaf, 
  Zap, 
  Clock, 
  Award,
  DollarSign,
  BarChart3,
  Sparkles,
  Shield,
  Target,
  Rocket
} from 'lucide-react';

const YieldVoteDAO = () => {
  const [activeVotes, setActiveVotes] = useState([]);
  const [userStakes, setUserStakes] = useState([]);
  const [nftCollection, setNftCollection] = useState([]);
  const [daoStats, setDaoStats] = useState({});
  const [selectedVote, setSelectedVote] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Mock data for demonstration
  const mockActiveVotes = [
    {
      id: 'vote-2025-001',
      title: '🚀 XRPL Bot Optimization Strategy',
      description: 'Community decides optimal parameters for Q1 2025 yield maximization',
      options: [
        {
          name: '🌱 Eco-Stable (80% RLUSD)',
          params: { rlusdWeight: 0.8, volatility: 0.13, ecoFriendly: true },
          expectedYield: 68,
          votes: 45.2,
          stakers: 12,
          description: 'Prioritizes sustainability and stability'
        },
        {
          name: '⚡ High-Yield Aggressive',
          params: { rlusdWeight: 0.6, volatility: 0.96, ecoFriendly: false },
          expectedYield: 92,
          votes: 32.8,
          stakers: 8,
          description: 'Maximum yield through aggressive arbitrage'
        },
        {
          name: '⚖️ Balanced Approach',
          params: { rlusdWeight: 0.7, volatility: 0.55, ecoFriendly: true },
          expectedYield: 78,
          votes: 67.5,
          stakers: 15,
          description: 'Optimal balance of yield and sustainability'
        }
      ],
      totalStaked: 145.5,
      timeRemaining: 2847000, // ~47 minutes
      status: 'active',
      ecoBoost: 1.5,
      category: 'optimization'
    },
    {
      id: 'vote-2025-002',
      title: '🎯 Risk Management Parameters',
      description: 'Vote on circuit breaker thresholds for volatile market conditions',
      options: [
        {
          name: '🛡️ Conservative (5% threshold)',
          params: { stopLoss: 0.05, volatilityLimit: 0.3 },
          expectedYield: 55,
          votes: 28.3,
          stakers: 7,
          description: 'Lower risk with stable returns'
        },
        {
          name: '🎲 Moderate (10% threshold)',
          params: { stopLoss: 0.10, volatilityLimit: 0.6 },
          expectedYield: 72,
          votes: 41.7,
          stakers: 11,
          description: 'Balanced risk-reward profile'
        }
      ],
      totalStaked: 70.0,
      timeRemaining: 5432000, // ~1.5 hours
      status: 'active',
      ecoBoost: 1.0,
      category: 'risk'
    }
  ];

  const mockNFTCollection = [
    {
      id: 'nft-001',
      tier: 'gold',
      yield: 78.5,
      winner: '⚖️ Balanced Approach',
      voterRank: 1,
      contribution: 25.0,
      estimatedValue: 100,
      timestamp: Date.now() - 86400000,
      metadata: { ecoBoost: 1.5, voteId: 'vote-2024-015' }
    },
    {
      id: 'nft-002',
      tier: 'silver',
      yield: 65.2,
      winner: '🌱 Eco-Stable',
      voterRank: 3,
      contribution: 15.0,
      estimatedValue: 75,
      timestamp: Date.now() - 172800000,
      metadata: { ecoBoost: 1.5, voteId: 'vote-2024-014' }
    }
  ];

  const mockDAOStats = {
    totalVotes: 47,
    totalNFTs: 156,
    totalValue: 12450,
    averageYield: 71.3,
    communityMembers: 234,
    activeStakers: 45,
    ecoVotesPercentage: 68
  };

  // Initialize mock data
  useEffect(() => {
    setActiveVotes(mockActiveVotes);
    setNftCollection(mockNFTCollection);
    setDaoStats(mockDAOStats);
  }, []);

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#CD7F32';
  };

  // Handle vote staking
  const handleStakeVote = async (voteId, option) => {
    setLoading(true);
    try {
      // Mock staking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update vote data
      setActiveVotes(prev => prev.map(vote => {
        if (vote.id === voteId) {
          const updatedOptions = vote.options.map(opt => {
            if (opt.name === option) {
              return {
                ...opt,
                votes: opt.votes + stakeAmount,
                stakers: opt.stakers + 1
              };
            }
            return opt;
          });
          return {
            ...vote,
            options: updatedOptions,
            totalStaked: vote.totalStaked + stakeAmount
          };
        }
        return vote;
      }));

      // Add to user stakes
      setUserStakes(prev => [...prev, {
        voteId,
        option,
        amount: stakeAmount,
        timestamp: Date.now()
      }]);

      setSelectedVote(null);
      setStakeAmount(10);
      setSelectedOption('');
      
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vote card component
  const VoteCard = ({ vote }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="nexus-card p-6 hover:border-nexus-green/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-tech font-bold text-nexus-green mb-2">
            {vote.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3">{vote.description}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-nexus-blue" />
              <span className="text-nexus-blue">{vote.totalStaked} XRP</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-nexus-purple" />
              <span className="text-nexus-purple">{vote.options.reduce((sum, opt) => sum + opt.stakers, 0)} voters</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500">{formatTimeRemaining(vote.timeRemaining)}</span>
            </div>
          </div>
        </div>
        {vote.ecoBoost > 1 && (
          <div className="flex items-center space-x-1 bg-nexus-green/20 px-2 py-1 rounded">
            <Leaf className="w-4 h-4 text-nexus-green" />
            <span className="text-nexus-green text-sm font-tech">{vote.ecoBoost}x Eco</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {vote.options.map((option, index) => {
          const percentage = (option.votes / vote.totalStaked) * 100;
          return (
            <div key={index} className="bg-nexus-dark/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-tech text-white">{option.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-nexus-green text-sm">{option.expectedYield}% APY</span>
                  <span className="text-gray-400 text-sm">{option.votes} XRP</span>
                </div>
              </div>
              <div className="w-full bg-nexus-gray rounded-full h-2 mb-2">
                <div 
                  className="bg-nexus-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs">{option.description}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setSelectedVote(vote)}
        className="w-full bg-nexus-green hover:bg-nexus-green/80 text-black font-tech py-2 px-4 rounded transition-colors"
      >
        <Vote className="w-4 h-4 inline mr-2" />
        Stake & Vote
      </button>
    </motion.div>
  );

  // NFT card component
  const NFTCard = ({ nft }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="nexus-card p-4 hover:border-nexus-purple/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getTierColor(nft.tier) + '20' }}
        >
          <Trophy 
            className="w-6 h-6" 
            style={{ color: getTierColor(nft.tier) }}
          />
        </div>
        <div className="text-right">
          <div className="text-nexus-green font-tech font-bold">{nft.estimatedValue} XRP</div>
          <div className="text-gray-400 text-sm capitalize">{nft.tier} Tier</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Yield:</span>
          <span className="text-nexus-green font-tech">{nft.yield.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Winner:</span>
          <span className="text-white text-xs">{nft.winner}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Rank:</span>
          <span className="text-nexus-blue">#{nft.voterRank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Contribution:</span>
          <span className="text-nexus-purple">{nft.contribution} XRP</span>
        </div>
      </div>

      {nft.metadata.ecoBoost > 1 && (
        <div className="mt-3 flex items-center justify-center space-x-1 bg-nexus-green/20 py-1 rounded">
          <Leaf className="w-3 h-3 text-nexus-green" />
          <span className="text-nexus-green text-xs">Eco Boost Applied</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="nexus-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-tech font-bold text-nexus-green mb-2">
              🗳️ Yield Vote DAO
            </h2>
            <p className="text-gray-400">
              Community-governed simulation arena with XRPL-native staking and NFT rewards
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowRewards(!showRewards)}
              className={`px-4 py-2 rounded font-tech transition-colors ${
                showRewards 
                  ? 'bg-nexus-purple text-black' 
                  : 'bg-nexus-gray text-white hover:bg-nexus-purple/20'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              My NFTs
            </button>
          </div>
        </div>
      </div>

      {/* DAO Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="nexus-card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nexus-green/20 rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-nexus-green" />
            </div>
            <div>
              <div className="text-2xl font-tech font-bold text-nexus-green">
                {daoStats.totalVotes}
              </div>
              <div className="text-gray-400 text-sm">Total Votes</div>
            </div>
          </div>
        </div>

        <div className="nexus-card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nexus-blue/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-nexus-blue" />
            </div>
            <div>
              <div className="text-2xl font-tech font-bold text-nexus-blue">
                {daoStats.communityMembers}
              </div>
              <div className="text-gray-400 text-sm">Community</div>
            </div>
          </div>
        </div>

        <div className="nexus-card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nexus-purple/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-nexus-purple" />
            </div>
            <div>
              <div className="text-2xl font-tech font-bold text-nexus-purple">
                {daoStats.totalNFTs}
              </div>
              <div className="text-gray-400 text-sm">NFTs Minted</div>
            </div>
          </div>
        </div>

        <div className="nexus-card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-tech font-bold text-yellow-500">
                {daoStats.averageYield.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">Avg Yield</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Votes or NFT Collection */}
      <AnimatePresence mode="wait">
        {!showRewards ? (
          <motion.div
            key="votes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-tech font-bold text-white">Active Governance Votes</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Leaf className="w-4 h-4 text-nexus-green" />
                <span>{daoStats.ecoVotesPercentage}% eco-friendly votes</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeVotes.map(vote => (
                <VoteCard key={vote.id} vote={vote} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="nfts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-tech font-bold text-white">My NFT Collection</h3>
              <div className="text-nexus-green font-tech">
                Total Value: {nftCollection.reduce((sum, nft) => sum + nft.estimatedValue, 0)} XRP
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nftCollection.map(nft => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting Modal */}
      <AnimatePresence>
        {selectedVote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedVote(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="nexus-card p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-tech font-bold text-nexus-green mb-4">
                Stake & Vote
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-tech text-gray-400 mb-2">
                    Select Option
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full bg-nexus-dark border border-nexus-blue/30 rounded px-3 py-2 text-white font-tech"
                  >
                    <option value="">Choose voting option...</option>
                    {selectedVote.options.map((option, index) => (
                      <option key={index} value={option.name}>
                        {option.name} ({option.expectedYield}% APY)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-tech text-gray-400 mb-2">
                    Stake Amount (XRP)
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    min="5"
                    max="1000"
                    className="w-full bg-nexus-dark border border-nexus-blue/30 rounded px-3 py-2 text-white font-tech"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Minimum: 5 XRP • Higher stakes = higher NFT rewards
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setSelectedVote(null)}
                    className="px-4 py-2 bg-nexus-gray text-white rounded font-tech hover:bg-nexus-gray/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStakeVote(selectedVote.id, selectedOption)}
                    disabled={!selectedOption || stakeAmount < 5 || loading}
                    className="px-6 py-2 bg-nexus-green text-black rounded font-tech hover:bg-nexus-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Staking...</span>
                      </div>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 inline mr-2" />
                        Stake {stakeAmount} XRP
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <div className="nexus-card p-6">
        <h3 className="text-xl font-tech font-bold text-nexus-green mb-4">
          🎯 How Yield Vote DAO Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-nexus-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Vote className="w-6 h-6 text-nexus-blue" />
            </div>
            <h4 className="font-tech font-bold text-white mb-2">1. Stake & Vote</h4>
            <p className="text-gray-400 text-sm">
              Stake XRP on simulation parameters via XRPL Payment transactions with memos
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-nexus-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-6 h-6 text-nexus-green" />
            </div>
            <h4 className="font-tech font-bold text-white mb-2">2. Eco Boost</h4>
            <p className="text-gray-400 text-sm">
              Eco-friendly options get 1.5x voting power based on #XRPLGreenDeFi sentiment
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-nexus-purple/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-nexus-purple" />
            </div>
            <h4 className="font-tech font-bold text-white mb-2">3. Earn NFTs</h4>
            <p className="text-gray-400 text-sm">
              Top contributors receive tradable NFT badges worth $50-100 with yield metadata
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldVoteDAO;
