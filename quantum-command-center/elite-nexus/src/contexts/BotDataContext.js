import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BotDataContext = createContext();

export const useBotData = () => {
  const context = useContext(BotDataContext);
  if (!context) {
    throw new Error('useBotData must be used within a BotDataProvider');
  }
  return context;
};

export const BotDataProvider = ({ children }) => {
  const { user, godMode } = useAuth();
  const [bots, setBots] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [loading, setLoading] = useState(false);

  // Elite bot data with enhanced metrics
  const eliteBots = [
    {
      id: 'bot-001',
      name: 'Quantum Yield Nexus',
      adminId: 'admin-001',
      adminName: 'Alpha Admin',
      yield: 67.5,
      volatility: 0.13,
      commissions: 2500,
      status: 'active',
      walletAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
      lastTransaction: '2025-01-17T10:30:00Z',
      ecoScore: 85,
      rwaBonus: 24,
      position: { x: 100, y: 100 },
      size: 80,
      color: '#22c55e',
      category: 'liquidity-provider',
      performance: {
        daily: 2.3,
        weekly: 15.8,
        monthly: 67.5,
        sharpe: 2.1,
        maxDrawdown: 8.2
      }
    },
    {
      id: 'bot-002',
      name: 'XRPL Royalty Engine',
      adminId: 'admin-001',
      adminName: 'Alpha Admin',
      yield: 84.2,
      volatility: 0.08,
      commissions: 3200,
      status: 'active',
      walletAddress: 'rDNvpKBWqCQxYLQgfYWZKxqHrNhAUxDkw6',
      lastTransaction: '2025-01-17T10:45:00Z',
      ecoScore: 92,
      rwaBonus: 18,
      position: { x: 200, y: 150 },
      size: 95,
      color: '#16a34a',
      category: 'arbitrage',
      performance: {
        daily: 3.1,
        weekly: 18.7,
        monthly: 84.2,
        sharpe: 2.8,
        maxDrawdown: 5.1
      }
    },
    {
      id: 'bot-003',
      name: 'DeFi Arbitrage Alpha',
      adminId: 'admin-002',
      adminName: 'Beta Admin',
      yield: 45.8,
      volatility: 0.22,
      commissions: 1800,
      status: 'active',
      walletAddress: 'rGWrZyQqhTp9Xu7G5Pkayo62X1xzrHzgon',
      lastTransaction: '2025-01-17T09:15:00Z',
      ecoScore: 78,
      rwaBonus: 12,
      position: { x: 300, y: 200 },
      size: 65,
      color: '#eab308',
      category: 'cross-chain',
      performance: {
        daily: 1.8,
        weekly: 12.3,
        monthly: 45.8,
        sharpe: 1.6,
        maxDrawdown: 15.4
      }
    },
    {
      id: 'bot-004',
      name: 'Liquidity Harvester Pro',
      adminId: 'admin-002',
      adminName: 'Beta Admin',
      yield: 52.3,
      volatility: 0.15,
      commissions: 1200,
      status: 'active',
      walletAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      lastTransaction: '2025-01-17T08:30:00Z',
      ecoScore: 88,
      rwaBonus: 20,
      position: { x: 150, y: 250 },
      size: 70,
      color: '#22c55e',
      category: 'amm-provider',
      performance: {
        daily: 2.1,
        weekly: 14.2,
        monthly: 52.3,
        sharpe: 1.9,
        maxDrawdown: 11.8
      }
    },
    {
      id: 'bot-005',
      name: 'Cross-Chain Optimizer',
      adminId: 'admin-003',
      adminName: 'Gamma Admin',
      yield: 38.7,
      volatility: 0.18,
      commissions: 950,
      status: 'paused',
      walletAddress: 'rLNaPoKeeBjZe3enjHAiNnPgRGNd4pHyeJ',
      lastTransaction: '2025-01-17T07:45:00Z',
      ecoScore: 65,
      rwaBonus: 8,
      position: { x: 250, y: 300 },
      size: 55,
      color: '#f59e0b',
      category: 'bridge-arbitrage',
      performance: {
        daily: 1.2,
        weekly: 8.9,
        monthly: 38.7,
        sharpe: 1.3,
        maxDrawdown: 18.9
      }
    },
    {
      id: 'bot-006',
      name: 'AMM Pool Dominator',
      adminId: 'admin-003',
      adminName: 'Gamma Admin',
      yield: 71.2,
      volatility: 0.11,
      commissions: 2800,
      status: 'active',
      walletAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
      lastTransaction: '2025-01-17T10:00:00Z',
      ecoScore: 90,
      rwaBonus: 22,
      position: { x: 350, y: 120 },
      size: 85,
      color: '#16a34a',
      category: 'amm-provider',
      performance: {
        daily: 2.7,
        weekly: 16.8,
        monthly: 71.2,
        sharpe: 2.4,
        maxDrawdown: 7.3
      }
    },
    {
      id: 'bot-007',
      name: 'Eco-RWA Solar Nexus',
      adminId: 'admin-001',
      adminName: 'Alpha Admin',
      yield: 89.3,
      volatility: 0.09,
      commissions: 4200,
      status: 'active',
      walletAddress: 'rEcoRWASolarNexusXRPLTokenization123',
      lastTransaction: '2025-01-17T11:00:00Z',
      ecoScore: 98,
      rwaBonus: 35,
      position: { x: 400, y: 180 },
      size: 100,
      color: '#10b981',
      category: 'eco-rwa',
      performance: {
        daily: 3.8,
        weekly: 22.1,
        monthly: 89.3,
        sharpe: 3.2,
        maxDrawdown: 4.1
      }
    }
  ];

  // Commission flow data
  const eliteCommissions = [
    {
      id: 'comm-001',
      botId: 'bot-001',
      adminId: 'admin-001',
      amount: 375,
      masterCut: 125,
      adminCut: 250,
      timestamp: '2025-01-17T10:30:00Z',
      txHash: '0x1234567890abcdef',
      status: 'completed'
    },
    {
      id: 'comm-002',
      botId: 'bot-002',
      adminId: 'admin-001',
      amount: 480,
      masterCut: 160,
      adminCut: 320,
      timestamp: '2025-01-17T10:45:00Z',
      txHash: '0xabcdef1234567890',
      status: 'completed'
    },
    {
      id: 'comm-003',
      botId: 'bot-007',
      adminId: 'admin-001',
      amount: 630,
      masterCut: 210,
      adminCut: 420,
      timestamp: '2025-01-17T11:00:00Z',
      txHash: '0xeco123456789abcd',
      status: 'pending'
    }
  ];

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (godMode) {
        // Master sees all bots
        setBots(eliteBots);
        setCommissions(eliteCommissions);
      } else if (user?.role === 'admin') {
        // Admin sees only their bots
        const adminBots = eliteBots.filter(bot => bot.adminId === user.id);
        const adminCommissions = eliteCommissions.filter(comm => comm.adminId === user.id);
        setBots(adminBots);
        setCommissions(adminCommissions);
      }
      setLoading(false);
    }, 1000);
  }, [user, godMode]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        timestamp: new Date().toISOString(),
        totalYield: bots.reduce((sum, bot) => sum + bot.yield, 0),
        totalCommissions: commissions.reduce((sum, comm) => sum + comm.amount, 0),
        activeBots: bots.filter(bot => bot.status === 'active').length,
        networkStatus: 'connected'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [bots, commissions]);

  const getFilteredBots = (adminId = null) => {
    if (!adminId) return bots;
    return bots.filter(bot => bot.adminId === adminId);
  };

  const getBotsByCategory = (category) => {
    return bots.filter(bot => bot.category === category);
  };

  const getTopPerformers = (limit = 5) => {
    return [...bots]
      .sort((a, b) => b.yield - a.yield)
      .slice(0, limit);
  };

  const getEcoRWABots = () => {
    return bots.filter(bot => bot.category === 'eco-rwa' || bot.ecoScore > 85);
  };

  const getTotalStats = () => {
    return {
      totalBots: bots.length,
      activeBots: bots.filter(bot => bot.status === 'active').length,
      totalYield: bots.reduce((sum, bot) => sum + bot.yield, 0),
      avgYield: bots.length > 0 ? bots.reduce((sum, bot) => sum + bot.yield, 0) / bots.length : 0,
      totalCommissions: commissions.reduce((sum, comm) => sum + comm.amount, 0),
      ecoBonus: bots.reduce((sum, bot) => sum + (bot.rwaBonus || 0), 0)
    };
  };

  const value = {
    bots,
    commissions,
    realTimeData,
    loading,
    getFilteredBots,
    getBotsByCategory,
    getTopPerformers,
    getEcoRWABots,
    getTotalStats,
    setBots,
    setCommissions
  };

  return (
    <BotDataContext.Provider value={value}>
      {children}
    </BotDataContext.Provider>
  );
};
