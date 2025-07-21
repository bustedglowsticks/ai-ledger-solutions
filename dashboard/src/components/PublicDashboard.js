/*
 * QUANTUM YIELD NEXUS DASHBOARD - PUBLIC DASHBOARD
 * Public-facing dashboard with limited data access and engagement features
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Leaf, 
  Users, 
  DollarSign,
  Zap,
  Shield,
  Eye
} from 'lucide-react';

const PublicDashboard = () => {
  const [publicStats, setPublicStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    avgYield: 0,
    carbonOffset: 0,
    activeBots: 0,
    communityScore: 0
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [ecoMetrics, setEcoMetrics] = useState({
    greenProposals: 0,
    ecoMultiplier: 0,
    sustainabilityScore: 0
  });

  useEffect(() => {
    // Simulate real-time public data updates
    const interval = setInterval(() => {
      setPublicStats(prev => ({
        totalUsers: 180 + Math.floor(Math.random() * 20),
        totalVolume: 1250000 + Math.random() * 100000,
        avgYield: 75 + Math.random() * 15,
        carbonOffset: 180 + Math.random() * 20,
        activeBots: 12 + Math.floor(Math.random() * 3),
        communityScore: 85 + Math.random() * 10
      }));

      setEcoMetrics({
        greenProposals: 45 + Math.floor(Math.random() * 10),
        ecoMultiplier: 2.3 + Math.random() * 0.4,
        sustainabilityScore: 88 + Math.random() * 8
      });

      // Generate performance chart data
      const newData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        yield: 70 + Math.random() * 20,
        volume: 50000 + Math.random() * 30000
      }));
      setPerformanceData(newData);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Multi-Chain Oracle Fusion",
      value: "98% Accuracy",
      description: "Chainlink + Polkadot entangled intelligence",
      color: "text-nexus-blue"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Self-Optimizing",
      value: "35% APY",
      description: "Auto-compounding treasury with dynamic RWA splits",
      color: "text-nexus-green"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Eco-Bounty System",
      value: "$250/Proposal",
      description: "NFT airdrops for green community contributions",
      color: "text-nexus-green"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Carbon-Verified K8s",
      value: "40% Faster",
      description: "Real-time scaling with carbon offset tracking",
      color: "text-nexus-purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-gray-900 to-nexus-gray">
      {/* Header */}
      <div className="border-b border-nexus-blue/30 bg-nexus-dark/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Globe className="w-8 h-8 text-nexus-blue quantum-glow" />
              <div>
                <h1 className="text-2xl font-tech font-bold text-nexus-green">
                  QUANTUM NEXUS PUBLIC
                </h1>
                <p className="text-sm text-gray-400">
                  Multi-Chain Entangled • AI-Self-Optimizing • Eco-Beloved
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="nexus-button flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Admin Access</span>
              </Link>
              <Link to="/" className="text-nexus-blue hover:text-nexus-green transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-tech font-bold mb-4 bg-nexus-gradient bg-clip-text text-transparent">
            LIVE NEXUS METRICS
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time performance data from our quantum-entangled yield optimization system
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nexus-card p-6 text-center"
          >
            <Users className="w-8 h-8 text-nexus-blue mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-blue mb-1">
              {publicStats.totalUsers}
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nexus-card p-6 text-center"
          >
            <DollarSign className="w-8 h-8 text-nexus-green mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-green mb-1">
              ${(publicStats.totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400">Total Volume</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nexus-card p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 text-nexus-purple mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-purple mb-1">
              {publicStats.avgYield.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Avg Yield</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nexus-card p-6 text-center"
          >
            <Leaf className="w-8 h-8 text-nexus-green mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-green mb-1">
              {publicStats.carbonOffset.toFixed(0)}kg
            </div>
            <div className="text-sm text-gray-400">Carbon Offset</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="nexus-card p-6 text-center"
          >
            <Activity className="w-8 h-8 text-nexus-blue mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-blue mb-1">
              {publicStats.activeBots}
            </div>
            <div className="text-sm text-gray-400">Active Bots</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="nexus-card p-6 text-center"
          >
            <BarChart3 className="w-8 h-8 text-nexus-purple mx-auto mb-2" />
            <div className="text-2xl font-tech font-bold text-nexus-purple mb-1">
              {publicStats.communityScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Community Score</div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="nexus-card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-tech font-bold text-white mb-2">
                {feature.title}
              </h3>
              <div className={`text-2xl font-tech font-bold ${feature.color} mb-2`}>
                {feature.value}
              </div>
              <p className="text-sm text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Performance Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="nexus-card p-6"
          >
            <h3 className="text-xl font-tech font-bold text-nexus-green mb-4">
              24-Hour Yield Performance
            </h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {performanceData.slice(0, 24).map((data, index) => (
                <div
                  key={index}
                  className="bg-nexus-green/30 hover:bg-nexus-green/50 transition-colors rounded-t"
                  style={{
                    height: `${(data.yield / 100) * 100}%`,
                    width: '100%'
                  }}
                  title={`Hour ${data.hour}: ${data.yield.toFixed(1)}%`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="nexus-card p-6"
          >
            <h3 className="text-xl font-tech font-bold text-nexus-blue mb-4">
              Eco-Impact Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Green Proposals</span>
                <span className="text-nexus-green font-tech font-bold">
                  {ecoMetrics.greenProposals}
                </span>
              </div>
              <div className="w-full bg-nexus-gray rounded-full h-2">
                <div 
                  className="bg-nexus-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(ecoMetrics.greenProposals / 60) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Eco Multiplier</span>
                <span className="text-nexus-blue font-tech font-bold">
                  {ecoMetrics.ecoMultiplier.toFixed(1)}x
                </span>
              </div>
              <div className="w-full bg-nexus-gray rounded-full h-2">
                <div 
                  className="bg-nexus-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(ecoMetrics.ecoMultiplier / 3) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sustainability Score</span>
                <span className="text-nexus-purple font-tech font-bold">
                  {ecoMetrics.sustainabilityScore.toFixed(0)}/100
                </span>
              </div>
              <div className="w-full bg-nexus-gray rounded-full h-2">
                <div 
                  className="bg-nexus-purple h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ecoMetrics.sustainabilityScore}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="nexus-card p-8 text-center hologram-effect"
        >
          <h3 className="text-3xl font-tech font-bold text-nexus-green mb-4">
            Ready to Join the Quantum Revolution?
          </h3>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            Experience the future of DeFi with our multi-chain entangled intelligence,
            AI-self-optimizing treasuries, and eco-beloved sustainability features.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/login" className="nexus-button text-lg px-8 py-4">
              <Eye className="w-5 h-5 mr-2" />
              Access Full Dashboard
            </Link>
            <Link to="/" className="nexus-button text-lg px-8 py-4">
              <Globe className="w-5 h-5 mr-2" />
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-nexus-blue/30 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 mb-2">
            © 2025 Quantum Yield Nexus • Multi-Chain Entangled • AI-Self-Optimizing • Eco-Beloved
          </p>
          <p className="text-sm text-gray-500">
            Real-time data updates every 3 seconds • Carbon-verified infrastructure • Community-driven
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicDashboard;
