/*
 * QUANTUM YIELD NEXUS DASHBOARD - ADMIN COMMAND CENTER
 * Revolutionary 3D interactive dashboard with Three.js orbital bot clusters
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  Zap, 
  Download,
  Settings,
  Eye,
  BarChart3,
  Cpu,
  Leaf,
  DollarSign,
  Users,
  Globe
} from 'lucide-react';
import ThreeJSHeatMap from './ThreeJSHeatMap';
import LedgerFlowVisualization from './LedgerFlowVisualization';
import AIOverlay from './AIOverlay';
import BotHeatMap3D from './BotHeatMap3D';

const AdminDashboard = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    bots: [],
    commissions: [],
    performance: {},
    nexusMetrics: {}
  });

  // Redirect if not admin
  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        bots: generateBotData(),
        commissions: generateCommissionData(),
        performance: generatePerformanceData(),
        nexusMetrics: generateNexusMetrics()
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateBotData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `bot-${i + 1}`,
      name: `Nexus Bot ${i + 1}`,
      yield: 60 + Math.random() * 40, // 60-100% yield
      volatility: Math.random(),
      status: Math.random() > 0.1 ? 'active' : 'maintenance',
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      commissionFlow: Math.random() * 1000,
      aiConfidence: 85 + Math.random() * 15,
      ecoScore: Math.random() * 100,
      carbonOffset: Math.random() * 10
    }));
  };

  const generateCommissionData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      amount: Math.random() * 500,
      timestamp: Date.now() - Math.random() * 3600000,
      botId: `bot-${Math.floor(Math.random() * 12) + 1}`,
      wallet: `wallet-${Math.floor(Math.random() * 5) + 1}`,
      type: Math.random() > 0.5 ? 'nft_royalty' : 'trading_fee'
    }));
  };

  const generatePerformanceData = () => ({
    totalRevenue: 125000 + Math.random() * 50000,
    monthlyGrowth: 15 + Math.random() * 10,
    activeUsers: 180 + Math.floor(Math.random() * 50),
    botAccuracy: 95 + Math.random() * 4,
    nexusMultiplier: 2.5 + Math.random() * 1.5
  });

  const generateNexusMetrics = () => ({
    multiChainAccuracy: 98 + Math.random() * 2,
    aiOptimization: 90 + Math.random() * 10,
    treasuryBalance: 500000 + Math.random() * 200000,
    ecoImpact: 85 + Math.random() * 15,
    carbonOffset: 150 + Math.random() * 50,
    infiniteCompounding: 3.2 + Math.random() * 0.8
  });

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      bots: realTimeData.bots,
      performance: realTimeData.performance,
      nexusMetrics: realTimeData.nexusMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Nexus Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'heatmap', label: '3D Heat Map', icon: <Cpu className="w-5 h-5" /> },
    { id: 'flows', label: 'Ledger Flows', icon: <Activity className="w-5 h-5" /> },
    { id: 'ai', label: 'AI Overlays', icon: <Eye className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-gray-900 to-nexus-gray">
      {/* Header */}
      <div className="border-b border-nexus-blue/30 bg-nexus-dark/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-nexus-blue quantum-glow" />
              <div>
                <h1 className="text-2xl font-tech font-bold text-nexus-green">
                  QUANTUM NEXUS COMMAND CENTER
                </h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {user.email} • Multi-Chain Entangled • AI-Self-Optimizing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="nexus-button flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-400">System Status</div>
                <div className="text-nexus-green font-tech font-bold">OPERATIONAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-nexus-blue/20">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-nexus-green text-nexus-green'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="font-tech">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="nexus-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-nexus-green" />
                  <div className="text-right">
                    <div className="text-2xl font-tech font-bold text-nexus-green">
                      ${realTimeData.performance.totalRevenue?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total Revenue</div>
                  </div>
                </div>
                <div className="w-full bg-nexus-gray rounded-full h-2">
                  <div className="bg-nexus-green h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                </div>
              </div>

              <div className="nexus-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-nexus-blue" />
                  <div className="text-right">
                    <div className="text-2xl font-tech font-bold text-nexus-blue">
                      {realTimeData.performance.monthlyGrowth?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Monthly Growth</div>
                  </div>
                </div>
                <div className="w-full bg-nexus-gray rounded-full h-2">
                  <div className="bg-nexus-blue h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>

              <div className="nexus-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Cpu className="w-8 h-8 text-nexus-purple" />
                  <div className="text-right">
                    <div className="text-2xl font-tech font-bold text-nexus-purple">
                      {realTimeData.nexusMetrics.multiChainAccuracy?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Multi-Chain Accuracy</div>
                  </div>
                </div>
                <div className="w-full bg-nexus-gray rounded-full h-2">
                  <div className="bg-nexus-purple h-2 rounded-full animate-pulse" style={{width: '98%'}}></div>
                </div>
              </div>

              <div className="nexus-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Leaf className="w-8 h-8 text-nexus-green" />
                  <div className="text-right">
                    <div className="text-2xl font-tech font-bold text-nexus-green">
                      {realTimeData.nexusMetrics.carbonOffset?.toFixed(1)}kg
                    </div>
                    <div className="text-sm text-gray-400">Carbon Offset</div>
                  </div>
                </div>
                <div className="w-full bg-nexus-gray rounded-full h-2">
                  <div className="bg-nexus-green h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>

            {/* Bot Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="nexus-card p-6">
                <h3 className="text-xl font-tech font-bold mb-4 text-nexus-green">
                  Active Nexus Bots
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {realTimeData.bots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-3 bg-nexus-gray/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          bot.status === 'active' ? 'bg-nexus-green animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="font-tech font-bold">{bot.name}</div>
                          <div className="text-sm text-gray-400">
                            AI: {bot.aiConfidence.toFixed(1)}% • Eco: {bot.ecoScore.toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-nexus-green font-tech font-bold">
                          {bot.yield.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          ${bot.commissionFlow.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nexus-card p-6">
                <h3 className="text-xl font-tech font-bold mb-4 text-nexus-blue">
                  Nexus Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Treasury Balance</span>
                    <span className="font-tech font-bold text-nexus-green">
                      ${realTimeData.nexusMetrics.treasuryBalance?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">AI Optimization</span>
                    <span className="font-tech font-bold text-nexus-blue">
                      {realTimeData.nexusMetrics.aiOptimization?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Infinite Compounding</span>
                    <span className="font-tech font-bold text-nexus-purple">
                      {realTimeData.nexusMetrics.infiniteCompounding?.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Eco Impact Score</span>
                    <span className="font-tech font-bold text-nexus-green">
                      {realTimeData.nexusMetrics.ecoImpact?.toFixed(0)}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nexus-card p-6 mb-6">
              <h3 className="text-2xl font-tech font-bold mb-4 text-nexus-green">
                3D Interactive Bot Heat Map
              </h3>
              <p className="text-gray-400 mb-6">
                Orbital bot clusters colored by yield/volatility with interactive zoom and commission flow trails
              </p>
              <ThreeJSHeatMap bots={realTimeData.bots} />
            </div>
          </motion.div>
        )}

        {activeTab === 'flows' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nexus-card p-6">
              <h3 className="text-2xl font-tech font-bold mb-4 text-nexus-blue">
                Real-Time Ledger & Commission Flows
              </h3>
              <p className="text-gray-400 mb-6">
                Live XRPL ledger animations with commission flows as particle streams
              </p>
              <LedgerFlowVisualization commissions={realTimeData.commissions} />
            </div>
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nexus-card p-6">
              <h3 className="text-2xl font-tech font-bold mb-4 text-nexus-purple">
                AI-Driven Overlays & Predictions
              </h3>
              <p className="text-gray-400 mb-6">
                Hover for predicted APYs with 60%+ forecasts from Monte Carlo simulations
              </p>
              <BotHeatMap3D bots={realTimeData.bots} />
              <AIOverlay bots={realTimeData.bots} performance={realTimeData.performance} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
