import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBotData } from '../contexts/BotDataContext';
import EliteHeatMap from './EliteHeatMap';
import RocketCommissionFlow from './RocketCommissionFlow';
import BotPortfolioGrid from './BotPortfolioGrid';
import GodViewControls from './GodViewControls';
import StatsOverview from './StatsOverview';
import { Crown, Zap, TrendingUp, DollarSign, Activity, Globe } from 'lucide-react';

const MasterView = () => {
  const { user, godMode, toggleGodMode } = useAuth();
  const { bots, getTotalStats, getEcoRWABots, realTimeData } = useBotData();
  const [selectedBot, setSelectedBot] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [filterCategory, setFilterCategory] = useState('all');
  
  const stats = getTotalStats();
  const ecoRWABots = getEcoRWABots();

  useEffect(() => {
    // Redirect if not master
    if (user && user.role !== 'master') {
      window.location.href = `/admin/${user.id}`;
    }
  }, [user]);

  if (!user || user.role !== 'master') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-apple-gray-800">Master Access Required</h1>
          <p className="text-apple-gray-600 mt-2">Only master admins can access this view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-apple-gray-100">
      {/* Header */}
      <header className="apple-card m-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="master-crown">
                👑
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-apple-gray-900">
                Elite Yield Command Nexus
              </h1>
              <p className="text-apple-gray-600 mt-1">
                Master Control Center • {stats.totalBots} Active Bots • ${stats.totalCommissions.toLocaleString()} Revenue
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <GodViewControls 
              godMode={godMode}
              toggleGodMode={toggleGodMode}
              viewMode={viewMode}
              setViewMode={setViewMode}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
            />
            
            <div className="text-right">
              <p className="text-apple-gray-900 font-semibold">{user.name}</p>
              <p className="text-apple-gray-600 text-sm">{user.email}</p>
            </div>
            
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <StatsOverview stats={stats} realTimeData={realTimeData} />

      {/* Main Dashboard Grid */}
      <div className="mx-6 mb-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heat Map - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="apple-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-apple-blue-600" />
                <h2 className="text-xl font-bold text-apple-gray-900">
                  Interactive Bot Performance Heat Map
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === '2d' 
                      ? 'bg-apple-blue-600 text-white' 
                      : 'bg-apple-gray-200 text-apple-gray-700 hover:bg-apple-gray-300'
                  }`}
                >
                  2D Grid
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === '3d' 
                      ? 'bg-apple-blue-600 text-white' 
                      : 'bg-apple-gray-200 text-apple-gray-700 hover:bg-apple-gray-300'
                  }`}
                >
                  3D Galaxy
                </button>
              </div>
            </div>
            
            <EliteHeatMap 
              bots={bots}
              selectedBot={selectedBot}
              setSelectedBot={setSelectedBot}
              viewMode={viewMode}
              filterCategory={filterCategory}
              godMode={godMode}
            />
          </div>
        </div>

        {/* Commission Flow */}
        <div className="apple-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-apple-gray-900">
              Rocket Commission Flow
            </h2>
          </div>
          
          <RocketCommissionFlow 
            bots={bots}
            godMode={godMode}
            masterWallet={user.walletAddress || 'rMasterWallet123...'}
          />
        </div>
      </div>

      {/* Eco-RWA Highlights */}
      {ecoRWABots.length > 0 && (
        <div className="mx-6 mb-6">
          <div className="apple-card p-6 eco-rwa-glow">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                🌱 Eco-RWA Solar Nexus Highlights
              </h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
                +{ecoRWABots.reduce((sum, bot) => sum + bot.rwaBonus, 0)}% Bonus
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ecoRWABots.map(bot => (
                <div key={bot.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">{bot.name}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Eco Score:</span>
                      <span className="text-white font-bold">{bot.ecoScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">RWA Bonus:</span>
                      <span className="text-green-200 font-bold">+{bot.rwaBonus}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Yield:</span>
                      <span className="text-white font-bold">{bot.yield}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bot Portfolio Grid */}
      <div className="mx-6 mb-6">
        <div className="apple-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-apple-blue-600" />
            <h2 className="text-xl font-bold text-apple-gray-900">
              Elite Bot Portfolio
            </h2>
            {godMode && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                God View Active
              </span>
            )}
          </div>
          
          <BotPortfolioGrid 
            bots={bots}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            godMode={godMode}
          />
        </div>
      </div>

      {/* Real-time Status Footer */}
      <footer className="mx-6 mb-6">
        <div className="apple-card p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-apple-gray-600">XRPL Network: Connected</span>
              </div>
              <div className="text-apple-gray-600">
                Last Update: {realTimeData.timestamp ? new Date(realTimeData.timestamp).toLocaleTimeString() : 'Loading...'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-apple-gray-600">
                Total Network Yield: <span className="font-bold text-yield-green-600">{stats.avgYield.toFixed(1)}%</span>
              </span>
              <span className="text-apple-gray-600">
                Commission Revenue: <span className="font-bold text-apple-blue-600">${stats.totalCommissions.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MasterView;
