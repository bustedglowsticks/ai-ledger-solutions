import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  BarChart3, 
  Zap, 
  Settings, 
  Eye, 
  EyeOff, 
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Crown,
  Leaf
} from 'lucide-react';
import EliteHeatMap from './EliteHeatMap';
import RocketCommissionFlow from './RocketCommissionFlow';

const EliteCommandNexus = ({ user, onLogout }) => {
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [godMode, setGodMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedBot, setSelectedBot] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    totalYield: 0,
    totalCommissions: 0,
    activeBots: 0,
    ecoScore: 0
  });

  // Mock bot data with enhanced properties
  const [bots] = useState([
    {
      id: 1,
      name: 'Quantum CLOB Optimizer',
      yield: 89.2,
      volatility: 0.15,
      commissions: 2847,
      status: 'active',
      category: 'liquidity-provider',
      adminName: 'Alice Chen',
      ecoScore: 92,
      rwaBonus: 24,
      lastTransaction: new Date(Date.now() - 300000),
      walletAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
    },
    {
      id: 2,
      name: 'AMM Yield Harvester',
      yield: 76.8,
      volatility: 0.22,
      commissions: 1923,
      status: 'active',
      category: 'amm-provider',
      adminName: 'Bob Martinez',
      ecoScore: 78,
      rwaBonus: 12,
      lastTransaction: new Date(Date.now() - 180000),
      walletAddress: 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w'
    },
    {
      id: 3,
      name: 'Arbitrage Lightning',
      yield: 94.1,
      volatility: 0.31,
      commissions: 3456,
      status: 'active',
      category: 'arbitrage',
      adminName: 'Carol Kim',
      ecoScore: 65,
      rwaBonus: 0,
      lastTransaction: new Date(Date.now() - 120000),
      walletAddress: 'rDNvpqoaWpvGvqvqvqvqvqvqvqvqvqvqvq'
    },
    {
      id: 4,
      name: 'Eco-RWA Staking Bot',
      yield: 67.3,
      volatility: 0.08,
      commissions: 1567,
      status: 'active',
      category: 'eco-rwa',
      adminName: 'David Park',
      ecoScore: 96,
      rwaBonus: 28,
      lastTransaction: new Date(Date.now() - 90000),
      walletAddress: 'rEcoRWAStakingBotXRPLMainnet123456'
    },
    {
      id: 5,
      name: 'Cross-Chain Bridge',
      yield: 52.7,
      volatility: 0.18,
      commissions: 987,
      status: 'paused',
      category: 'arbitrage',
      adminName: 'Eve Wilson',
      ecoScore: 71,
      rwaBonus: 8,
      lastTransaction: new Date(Date.now() - 600000),
      walletAddress: 'rCrossChainBridgeXRPLMainnet789012'
    },
    {
      id: 6,
      name: 'Sentiment Fusion Bot',
      yield: 83.5,
      volatility: 0.25,
      commissions: 2134,
      status: 'active',
      category: 'liquidity-provider',
      adminName: 'Frank Davis',
      ecoScore: 88,
      rwaBonus: 18,
      lastTransaction: new Date(Date.now() - 240000),
      walletAddress: 'rSentimentFusionBotXRPLMainnet345'
    }
  ]);

  // Calculate real-time metrics
  useEffect(() => {
    const activeBots = bots.filter(bot => bot.status === 'active');
    const totalYield = activeBots.reduce((sum, bot) => sum + bot.yield, 0) / activeBots.length;
    const totalCommissions = bots.reduce((sum, bot) => sum + bot.commissions, 0);
    const avgEcoScore = bots.reduce((sum, bot) => sum + bot.ecoScore, 0) / bots.length;

    setRealTimeData({
      totalYield: totalYield.toFixed(1),
      totalCommissions,
      activeBots: activeBots.length,
      ecoScore: avgEcoScore.toFixed(0)
    });
  }, [bots]);

  const toggleGodMode = () => {
    if (user.role === 'master') {
      setGodMode(!godMode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-apple-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-apple-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-apple-gray-900">
                  Elite Yield Command Nexus
                </h1>
              </div>
              
              {godMode && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  <Crown className="w-4 h-4" />
                  <span>God View</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-apple-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === '2d'
                      ? 'bg-white text-apple-blue-600 shadow-sm'
                      : 'text-apple-gray-600 hover:text-apple-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === '3d'
                      ? 'bg-white text-apple-blue-600 shadow-sm'
                      : 'text-apple-gray-600 hover:text-apple-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* God Mode Toggle (Master Only) */}
              {user.role === 'master' && (
                <button
                  onClick={toggleGodMode}
                  className={`p-2 rounded-lg transition-colors ${
                    godMode
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200'
                  }`}
                  title="Toggle God View"
                >
                  {godMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-apple-gray-900">{user.name}</div>
                  <div className="text-xs text-apple-gray-500 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-apple-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-apple-gray-600">Average Yield</p>
                <p className="text-2xl font-bold text-yield-green-600">{realTimeData.totalYield}%</p>
              </div>
              <div className="p-3 bg-yield-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yield-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-apple-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-apple-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-apple-blue-600">${realTimeData.totalCommissions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-apple-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-apple-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-apple-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-apple-gray-600">Active Bots</p>
                <p className="text-2xl font-bold text-apple-gray-900">{realTimeData.activeBots}</p>
              </div>
              <div className="p-3 bg-apple-gray-100 rounded-lg">
                <Activity className="w-6 h-6 text-apple-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-apple-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-apple-gray-600">Eco Score</p>
                <p className="text-2xl font-bold text-yield-green-600">{realTimeData.ecoScore}/100</p>
              </div>
              <div className="p-3 bg-yield-green-100 rounded-lg">
                <Leaf className="w-6 h-6 text-yield-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Heat Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 overflow-hidden">
              <div className="p-6 border-b border-apple-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-apple-gray-900">
                    Bot Performance Heat Map
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-apple-gray-600">View:</span>
                    <span className="text-sm font-medium text-apple-blue-600 capitalize">
                      {viewMode === '2d' ? '2D Grid' : '3D Galaxy'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <EliteHeatMap
                  bots={bots}
                  selectedBot={selectedBot}
                  setSelectedBot={setSelectedBot}
                  viewMode={viewMode}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  godMode={godMode}
                />
              </div>
            </div>
          </div>

          {/* Commission Flow Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 overflow-hidden">
              <div className="p-6 border-b border-apple-gray-200">
                <h2 className="text-lg font-semibold text-apple-gray-900">
                  Commission Flow
                </h2>
                <p className="text-sm text-apple-gray-600 mt-1">
                  Real-time commission tracking
                </p>
              </div>
              <div className="p-0">
                <RocketCommissionFlow
                  bots={bots.filter(bot => bot.status === 'active')}
                  godMode={godMode}
                  masterWallet="rMasterWalletXRPLMainnet123456789"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 p-6">
              <h3 className="text-lg font-semibold text-apple-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-apple-blue-600 text-white py-2 px-4 rounded-lg hover:bg-apple-blue-700 transition-colors text-sm font-medium">
                  Deploy New Bot
                </button>
                <button className="w-full bg-yield-green-600 text-white py-2 px-4 rounded-lg hover:bg-yield-green-700 transition-colors text-sm font-medium">
                  Optimize Yields
                </button>
                <button className="w-full bg-apple-gray-600 text-white py-2 px-4 rounded-lg hover:bg-apple-gray-700 transition-colors text-sm font-medium">
                  Export Report
                </button>
                {godMode && (
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm font-medium">
                    👑 Master Controls
                  </button>
                )}
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 p-6">
              <h3 className="text-lg font-semibold text-apple-gray-900 mb-4">Network Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray-600">XRPL Network</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray-600">Last Ledger</span>
                  <span className="text-sm font-medium text-apple-gray-900">#87,234,567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray-600">Fee (drops)</span>
                  <span className="text-sm font-medium text-apple-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray-600">Reserve</span>
                  <span className="text-sm font-medium text-apple-gray-900">10 XRP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EliteCommandNexus;
