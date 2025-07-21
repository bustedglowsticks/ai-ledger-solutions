/*
 * 🚀 QUANTUM BOT COMMAND CENTER - SIMPLIFIED BACKEND
 * Demo version without MongoDB dependency
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'quantum-bot-command-secret-2025';

// In-memory data store (for demo purposes)
let users = [
  {
    id: 'master-1',
    email: 'master@quantumbotcommand.com',
    password: '$2b$10$rQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ', // QuantumMaster2025!
    role: 'master',
    name: 'Master Admin',
    bots: [
      {
        id: 'master-bot-1',
        name: 'Quantum Yield Nexus',
        yield: 67.5,
        volatility: 0.13,
        commissions: 2500,
        status: 'active'
      },
      {
        id: 'master-bot-2',
        name: 'XRPL Royalty Engine',
        yield: 84.2,
        volatility: 0.08,
        commissions: 3200,
        status: 'active'
      },
      {
        id: 'master-bot-3',
        name: 'DeFi Arbitrage Alpha',
        yield: 45.8,
        volatility: 0.22,
        commissions: 1800,
        status: 'active'
      }
    ],
    totalCommissions: 7500,
    isActive: true
  },
  {
    id: 'admin-1',
    email: 'admin@quantumbotcommand.com',
    password: '$2b$10$rQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ9kVQZ', // AdminDemo2025!
    role: 'admin',
    name: 'Demo Admin',
    parent: 'master-1',
    bots: [
      {
        id: 'admin-bot-1',
        name: 'Liquidity Harvester Pro',
        yield: 52.3,
        volatility: 0.15,
        commissions: 1200,
        status: 'active'
      },
      {
        id: 'admin-bot-2',
        name: 'Cross-Chain Optimizer',
        yield: 38.7,
        volatility: 0.18,
        commissions: 950,
        status: 'paused'
      }
    ],
    totalCommissions: 2150,
    isActive: true
  }
];

// 🔐 LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user (simplified - in production use bcrypt.compare)
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 📊 DASHBOARD DATA ENDPOINT
app.get('/api/dashboard', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user's bots or all bots for master
    let botsData = [];
    if (user.role === 'master') {
      // Master sees all bots across all users
      botsData = users.flatMap(u => 
        u.bots.map(bot => ({
          ...bot,
          owner: u.name,
          ownerEmail: u.email
        }))
      );
    } else {
      // Admin sees only their bots
      botsData = user.bots;
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        totalCommissions: user.totalCommissions
      },
      bots: botsData,
      stats: {
        totalBots: botsData.length,
        activeBots: botsData.filter(b => b.status === 'active').length,
        totalYield: botsData.reduce((sum, b) => sum + b.yield, 0),
        totalCommissions: botsData.reduce((sum, b) => sum + b.commissions, 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 🚀 COMMISSION FLOW DATA ENDPOINT
app.get('/api/commission-flow', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate commission flow data for animations
    const flows = user.bots.map(bot => ({
      id: bot.id,
      name: bot.name,
      amount: bot.commissions,
      fromX: Math.random() * 800 + 100,
      fromY: Math.random() * 400 + 100,
      toX: 500, // User center position
      toY: 300,
      status: bot.status,
      timestamp: Date.now()
    }));
    
    res.json({
      success: true,
      flows,
      totalAmount: flows.reduce((sum, f) => sum + f.amount, 0),
      userPosition: { x: 500, y: 300 }
    });
    
  } catch (error) {
    console.error('❌ Commission flow error:', error);
    res.status(500).json({ error: 'Failed to fetch commission flow data' });
  }
});

// 🎯 HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quantum Bot Command Center Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Quantum Bot Command Center Backend (Demo) running on port ${PORT}`);
  console.log(`📊 In-memory data store ready (no MongoDB required)`);
  console.log(`🎯 Frontend dashboard: http://localhost:3000`);
  console.log(`\n🔑 Demo Login Credentials:`);
  console.log(`   Master Admin:`);
  console.log(`     Email: master@quantumbotcommand.com`);
  console.log(`     Password: QuantumMaster2025!`);
  console.log(`   Demo Admin:`);
  console.log(`     Email: admin@quantumbotcommand.com`);
  console.log(`     Password: AdminDemo2025!`);
  console.log(`\n✅ Ready for frontend connection!`);
});

module.exports = app;
