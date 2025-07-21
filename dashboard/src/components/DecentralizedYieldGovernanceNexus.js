import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, 
  Coins, 
  Trophy, 
  Leaf, 
  TrendingUp, 
  Users, 
  Zap, 
  Crown,
  Sparkles,
  DollarSign,
  Target,
  Award,
  Activity,
  BarChart3,
  Wallet
} from 'lucide-react';

const DecentralizedYieldGovernanceNexus = () => {
  const [activeProposals, setActiveProposals] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [daoStats, setDaoStats] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(50);
  const [selectedOption, setSelectedOption] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  // Mock data for revolutionary DAO governance
  useEffect(() => {
    const mockProposals = [
      {
        id: 'nexus-2025-q1',
        title: '🚀 Q1 2025 Nexus Optimization Strategy',
        description: 'Revolutionary parameter optimization for maximum yield with eco-sustainability focus',
        options: [
          { id: 'eco-focus', name: 'Eco-Focus (75% APY)', votes: 1250, isEco: true },
          { id: 'high-vol', name: 'High-Vol Surge (85% APY)', votes: 890, isEco: false },
          { id: 'rlusd-hedge', name: 'RLUSD Hedge (70% APY)', votes: 650, isEco: false }
        ],
        totalStaked: 2790,
        timeRemaining: '2d 14h 32m',
        sentimentScore: 0.82,
        ecoBoostActive: true,
        status: 'active'
      },
      {
        id: 'treasury-2025',
        title: '💰 DAO Treasury Allocation 2025',
        description: 'Community-driven treasury management for $5K/month referral funding',
        options: [
          { id: 'referrals', name: 'Referral Program (60%)', votes: 2100, isEco: false },
          { id: 'eco-grants', name: 'Eco-Grants (40%)', votes: 1800, isEco: true },
          { id: 'nft-rewards', name: 'NFT Rewards (50%)', votes: 1400, isEco: false }
        ],
        totalStaked: 5300,
        timeRemaining: '5d 8h 15m',
        sentimentScore: 0.75,
        ecoBoostActive: true,
        status: 'active'
      }
    ];

    const mockNFTs = [
      {
        id: 'nft-1',
        type: 'XRPLYieldGovernanceNexusBadge',
        rarity: 'Legendary',
        marketValue: 95,
        yieldData: { meanYield: 67.5, confidence: 0.95 },
        attributes: { badge: 'Eco-Nexus-Champion', tier: 8, ecoBonus: 0.24 },
        royalties: { passiveIncomeEnabled: true, totalFee: 0.15 }
      },
      {
        id: 'nft-2',
        type: 'XRPLYieldGovernanceNexusBadge',
        rarity: 'Epic',
        marketValue: 72,
        yieldData: { meanYield: 58.2, confidence: 0.92 },
        attributes: { badge: 'Yield-Nexus-Hunter', tier: 6, ecoBonus: 0 },
        royalties: { passiveIncomeEnabled: true, totalFee: 0.15 }
      }
    ];

    const mockStats = {
      totalVotes: 8090,
      activeMembers: 1247,
      nftsMinted: 3456,
      treasuryBalance: 125000,
      monthlyReferrals: 5200,
      ecoBoostActive: true,
      avgAPY: 72.3,
      confidenceLevel: 0.95
    };

    setActiveProposals(mockProposals);
    setUserNFTs(mockNFTs);
    setDaoStats(mockStats);
  }, []);

  const handleVote = async (proposalId, option) => {
    setIsVoting(true);
    
    // Simulate voting process
    setTimeout(() => {
      console.log(`🗳️ Revolutionary vote cast: ${stakeAmount} XRP on ${option} for ${proposalId}`);
      setIsVoting(false);
      setSelectedProposal(null);
      
      // Update proposal votes (mock)
      setActiveProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const updatedOptions = p.options.map(opt => {
            if (opt.id === option) {
              return { ...opt, votes: opt.votes + stakeAmount };
            }
            return opt;
          });
          return { ...p, options: updatedOptions, totalStaked: p.totalStaked + stakeAmount };
        }
        return p;
      }));
    }, 2000);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Mythical': return 'from-purple-500 to-pink-500';
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-blue-400 to-purple-500';
      default: return 'from-green-400 to-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-gray-900 to-nexus-dark p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-tech font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexus-green via-nexus-blue to-nexus-purple mb-4">
            🔮 Decentralized Yield Governance Nexus
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Revolutionary community-driven governance with XRPL-native staking, sentiment-weighted voting, and tradable NFT rewards
          </p>
        </motion.div>

        {/* DAO Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nexus-card p-6 text-center"
          >
            <Users className="w-8 h-8 text-nexus-blue mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-blue">{daoStats.activeMembers?.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Active Members</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="nexus-card p-6 text-center"
          >
            <Vote className="w-8 h-8 text-nexus-green mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-green">{daoStats.totalVotes?.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Votes Cast</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="nexus-card p-6 text-center"
          >
            <Trophy className="w-8 h-8 text-nexus-purple mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-purple">{daoStats.nftsMinted?.toLocaleString()}</div>
            <div className="text-sm text-gray-400">NFTs Minted</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="nexus-card p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 text-nexus-green mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-green">{daoStats.avgAPY?.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Avg APY Achieved</div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Proposals */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-tech font-bold text-nexus-green mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6" />
            <span>🗳️ Active Governance Proposals</span>
          </h2>

          <div className="space-y-6">
            {activeProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nexus-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-tech font-bold text-white mb-2">{proposal.title}</h3>
                    <p className="text-gray-300 mb-4">{proposal.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Time Remaining</div>
                    <div className="text-nexus-blue font-tech font-bold">{proposal.timeRemaining}</div>
                  </div>
                </div>

                {/* Sentiment & Eco-Boost Indicators */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-nexus-blue" />
                    <span className="text-sm text-gray-400">Sentiment:</span>
                    <span className="text-nexus-blue font-tech">{(proposal.sentimentScore * 100).toFixed(0)}%</span>
                  </div>
                  {proposal.ecoBoostActive && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-nexus-green" />
                      <span className="text-sm text-nexus-green font-tech">1.75x Eco-Boost Active</span>
                    </div>
                  )}
                </div>

                {/* Voting Options */}
                <div className="space-y-3 mb-4">
                  {proposal.options.map((option) => {
                    const percentage = (option.votes / proposal.totalStaked * 100).toFixed(1);
                    return (
                      <div key={option.id} className="relative">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-tech">{option.name}</span>
                            {option.isEco && <Leaf className="w-4 h-4 text-nexus-green" />}
                          </div>
                          <span className="text-nexus-blue font-tech">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`h-2 rounded-full ${option.isEco ? 'bg-nexus-green' : 'bg-nexus-blue'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vote Button */}
                <button
                  onClick={() => setSelectedProposal(proposal)}
                  className="w-full bg-gradient-to-r from-nexus-blue to-nexus-purple text-white font-tech font-bold py-3 px-6 rounded-lg hover:from-nexus-purple hover:to-nexus-blue transition-all duration-300 transform hover:scale-105"
                >
                  🗳️ Stake & Vote
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* NFT Collection & Treasury */}
        <div className="space-y-8">
          {/* User NFT Collection */}
          <div>
            <h2 className="text-2xl font-tech font-bold text-nexus-purple mb-6 flex items-center space-x-2">
              <Crown className="w-6 h-6" />
              <span>🏆 Your NFT Collection</span>
            </h2>

            <div className="space-y-4">
              {userNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`nexus-card p-4 bg-gradient-to-r ${getRarityColor(nft.rarity)} bg-opacity-20 border border-opacity-30`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-gray-400">Nexus Badge</div>
                      <div className="font-tech font-bold text-white">{nft.rarity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Est. Value</div>
                      <div className="text-nexus-green font-tech font-bold">${nft.marketValue}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Yield:</span>
                      <span className="text-nexus-blue font-tech">{nft.yieldData.meanYield.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-nexus-purple font-tech">{(nft.yieldData.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Royalties:</span>
                      <span className="text-nexus-green font-tech">{(nft.royalties.totalFee * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{nft.attributes.badge}</span>
                      {nft.attributes.ecoBonus > 0 && (
                        <div className="flex items-center space-x-1">
                          <Leaf className="w-3 h-3 text-nexus-green" />
                          <span className="text-xs text-nexus-green">+{(nft.attributes.ecoBonus * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* DAO Treasury Stats */}
          <div>
            <h2 className="text-2xl font-tech font-bold text-nexus-green mb-6 flex items-center space-x-2">
              <Wallet className="w-6 h-6" />
              <span>💰 DAO Treasury</span>
            </h2>

            <div className="nexus-card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Treasury Balance:</span>
                <span className="text-nexus-green font-tech font-bold">{daoStats.treasuryBalance?.toLocaleString()} XRP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Monthly Referrals:</span>
                <span className="text-nexus-blue font-tech font-bold">${daoStats.monthlyReferrals?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Confidence Level:</span>
                <span className="text-nexus-purple font-tech font-bold">{(daoStats.confidenceLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Modal */}
      <AnimatePresence>
        {selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="nexus-card p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-tech font-bold text-white mb-4">
                🗳️ Cast Your Vote
              </h3>
              <p className="text-gray-300 mb-6">{selectedProposal.title}</p>

              {/* Stake Amount */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Stake Amount (XRP)</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                  min="20"
                  max="1000"
                />
              </div>

              {/* Vote Options */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Select Option</label>
                <div className="space-y-2">
                  {selectedProposal.options.map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="voteOption"
                        value={option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="text-nexus-blue focus:ring-nexus-blue"
                      />
                      <span className="text-white flex items-center space-x-2">
                        <span>{option.name}</span>
                        {option.isEco && <Leaf className="w-4 h-4 text-nexus-green" />}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="flex-1 bg-gray-600 text-white font-tech py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVote(selectedProposal.id, selectedOption)}
                  disabled={!selectedOption || isVoting}
                  className="flex-1 bg-gradient-to-r from-nexus-blue to-nexus-purple text-white font-tech py-3 px-6 rounded-lg hover:from-nexus-purple hover:to-nexus-blue transition-all duration-300 disabled:opacity-50"
                >
                  {isVoting ? '🔄 Voting...' : '🗳️ Vote Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecentralizedYieldGovernanceNexus;
