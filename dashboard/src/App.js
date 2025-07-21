/*
 * QUANTUM YIELD NEXUS DASHBOARD - MAIN APP COMPONENT
 * Ultra-professional landing page with navigation to admin/public dashboards
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3,
  Cpu,
  Leaf,
  Vote,
  Crown
} from 'lucide-react';

function App() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    botAccuracy: 0,
    carbonOffset: 0
  });

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        totalRevenue: prev.totalRevenue + Math.random() * 1000,
        activeUsers: Math.floor(Math.random() * 50) + 150,
        botAccuracy: 95 + Math.random() * 4,
        carbonOffset: prev.carbonOffset + Math.random() * 0.5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Multi-Chain Oracle Fusion",
      description: "Chainlink 99% + Polkadot 98% entanglement with 100ms latency",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI-Self-Optimizing Treasuries",
      description: "25% NFT royalties auto-compounding at 35% APY with dynamic RWA splits",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Eco-Bounty NFT Airdrops",
      description: "$250 per green proposal with 2.5x community boost multipliers",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Carbon-Verified K8s Scaling",
      description: "40% faster rebalances with real-time carbon offset verification",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen matrix-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-tech font-black mb-6 bg-nexus-gradient bg-clip-text text-transparent">
              QUANTUM YIELD
            </h1>
            <h2 className="text-4xl md:text-6xl font-tech font-bold mb-8 text-nexus-green quantum-glow">
              NEXUS DASHBOARD
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Ultra-professional 3D interactive command center for multi-chain $2M+/year evolution
              with AI-self-optimizing treasuries, eco-bounty airdrops, and carbon-verified scaling
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link to="/admin" className="nexus-button text-lg px-8 py-4">
                <Shield className="w-6 h-6 mr-2 inline" />
                Admin Command Center
              </Link>
              <Link to="/public" className="nexus-button text-lg px-8 py-4">
                <Globe className="w-6 h-6 mr-2 inline" />
                Public Dashboard
              </Link>
              <Link
                to="/dao"
                className="bg-gradient-to-r from-nexus-purple to-nexus-blue text-white font-tech font-bold py-4 px-8 rounded-lg hover:from-nexus-blue hover:to-nexus-purple transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Vote className="w-5 h-5" />
                <span>🗳️ Yield Vote DAO</span>
              </Link>
              <Link
                to="/nexus-dao"
                className="bg-gradient-to-r from-nexus-green to-nexus-purple text-white font-tech font-bold py-4 px-8 rounded-lg hover:from-nexus-purple hover:to-nexus-green transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 border-2 border-nexus-green animate-pulse"
              >
                <Crown className="w-5 h-5" />
                <span>🔮 Nexus Governance (NEW!)</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="nexus-card p-6 text-center">
            <div className="text-3xl font-tech font-bold text-nexus-green mb-2">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Revenue</div>
            <div className="w-full bg-nexus-gray rounded-full h-2 mt-3">
              <div className="bg-nexus-green h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
          </div>
          
          <div className="nexus-card p-6 text-center">
            <div className="text-3xl font-tech font-bold text-nexus-blue mb-2">
              {stats.activeUsers}
            </div>
            <div className="text-gray-400">Active Users</div>
            <Activity className="w-6 h-6 mx-auto mt-2 text-nexus-blue animate-pulse" />
          </div>
          
          <div className="nexus-card p-6 text-center">
            <div className="text-3xl font-tech font-bold text-nexus-purple mb-2">
              {stats.botAccuracy.toFixed(1)}%
            </div>
            <div className="text-gray-400">Bot Accuracy</div>
            <BarChart3 className="w-6 h-6 mx-auto mt-2 text-nexus-purple animate-bounce-slow" />
          </div>
          
          <div className="nexus-card p-6 text-center">
            <div className="text-3xl font-tech font-bold text-nexus-green mb-2">
              {stats.carbonOffset.toFixed(1)}kg
            </div>
            <div className="text-gray-400">Carbon Offset</div>
            <Leaf className="w-6 h-6 mx-auto mt-2 text-nexus-green animate-pulse" />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
              className="nexus-card p-8 hover:scale-105 transition-transform duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-tech font-bold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="nexus-card p-12 hologram-effect"
        >
          <h3 className="text-4xl font-tech font-bold mb-6 text-nexus-green">
            Ready for $2M+/Year Nexus Domination?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the quantum singularity evolution with multi-chain entangled intelligence,
            AI-self-optimizing treasuries, and infinite-compounding mechanics.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/login" className="nexus-button text-lg px-8 py-4">
              Access Admin Portal
            </Link>
            <Link to="/public" className="nexus-button text-lg px-8 py-4">
              Explore Public Data
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-nexus-blue/30 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Quantum Yield Nexus Dashboard • Multi-Chain Entangled • AI-Self-Optimizing • Eco-Beloved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
