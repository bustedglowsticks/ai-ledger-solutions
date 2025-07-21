# 🚀 Quantum Bot Command Center

**Ultra-professional admin hierarchy dashboard with TradingView-style heat maps and rocket commission animations**

## 🎯 Overview

The Quantum Bot Command Center is a scalable, Apple-inspired dashboard designed for managing XRPL bot empires with hierarchical admin systems, dynamic referral commissions, and stunning visualizations. Built for passive income maximization through automated referral and commission management.

## ✨ Key Features

### 🏗️ Admin Hierarchy System
- **Master Admin**: God-view access, commission processing, unlimited invites
- **Admin Users**: Bot management, referral commissions, invite capabilities
- **Secure Invite Flow**: Personalized email invites with claim tokens

### 📊 Professional Visualizations
- **TradingView-Style Heat Maps**: D3.js-powered bot performance visualization
- **Rocket Commission Animations**: GSAP-powered smooth commission flow tracking
- **Real-time Dashboard**: Live yield tracking and performance metrics

### 💰 Commission System
- **15% Admin Commission**: Automatic referral commission tracking
- **5% Master Override**: Additional master admin commission layer
- **On-chain XRPL Payments**: Transparent, automated commission distribution
- **Scaling to $10K/month**: Designed for 100+ admin passive income

### 🎨 Apple-Inspired Design
- **Clean UI/UX**: Modern, professional interface design
- **Responsive Layout**: Mobile-first, cross-platform compatibility
- **Smooth Animations**: GSAP-powered micro-interactions

## 🛠️ Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **MongoDB**: User hierarchy and commission data
- **XRPL.js**: On-chain commission processing
- **Nodemailer**: Personalized invite email system
- **JWT**: Secure authentication system

### Frontend
- **React 18**: Modern component-based UI
- **Tailwind CSS**: Utility-first styling system
- **D3.js**: Professional data visualizations
- **GSAP**: Smooth animation library
- **Axios**: HTTP client for API communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or cloud instance
- XRPL wallet with testnet/mainnet access

### Installation

1. **Clone and setup**:
```bash
cd quantum-command-center
```

2. **Backend setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

3. **Frontend setup**:
```bash
cd ../frontend
npm install
npm start
```

4. **Access the dashboard**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Initial Setup

1. **Create Master Admin**:
```bash
# Run this in backend directory
node scripts/create-master.js
```

2. **Configure XRPL Wallet**:
- Add your XRPL wallet seed to `.env`
- Ensure wallet has sufficient XRP for commission payments

3. **Email Configuration**:
- Set up SMTP credentials in `.env`
- Test invite system functionality

## 📖 Usage Guide

### Master Admin Workflow
1. **Login** to command center
2. **Process Commissions** via dashboard button
3. **Invite Admins** using personalized invite system
4. **Monitor Performance** via heat maps and analytics

### Admin User Workflow
1. **Claim Invite** via email link
2. **View Bot Portfolio** in dashboard
3. **Invite Sub-Admins** to earn referral commissions
4. **Track Earnings** via commission flow visualization

### Bot Integration
```javascript
// Example bot integration
const { QuantumBotClient } = require('./quantum-bot-client');

const bot = new QuantumBotClient({
  userId: 'admin-user-id',
  apiKey: 'dashboard-api-key'
});

// Report bot performance
await bot.reportYield({
  botId: 'bot-001',
  yield: 45.2,
  volatility: 0.18,
  commissions: 12.5
});
```

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/quantum-bot-command-center

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret

# Email System
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# XRPL Integration
XRPL_SERVER=wss://xrplcluster.com/
XRPL_WALLET_SEED=your-wallet-seed

# Commission Rates
ADMIN_COMMISSION_RATE=0.15
MASTER_OVERRIDE_RATE=0.05
```

### Commission Processing
- **Automatic**: Runs every hour via cron job
- **Manual**: Master admin dashboard button
- **On-chain**: All payments recorded on XRPL

## 🎨 Customization

### Heat Map Colors
```javascript
// Modify in BotHeatMap.js
const colorScale = d3.scaleSequential()
  .domain([0, 100])
  .interpolator(d3.interpolateRdYlGn);
```

### Animation Timing
```javascript
// Modify in CommissionFlow.js
gsap.to(rocket.node(), {
  duration: 3 + Math.random() * 2, // Customize speed
  ease: "power2.inOut"
});
```

### UI Theme
```javascript
// Modify in tailwind.config.js
colors: {
  quantum: {
    500: '#0ea5e9', // Primary brand color
    600: '#0284c7'  // Hover state
  }
}
```

## 📊 Performance Metrics

### Scalability Targets
- **100+ Admins**: Hierarchical system design
- **1000+ Bots**: Efficient heat map rendering
- **$10K/month**: Passive income potential
- **<100ms**: Dashboard load time

### Commission Flow
```
Bot Yield (100%) → Admin (15%) → Master (5%) → Remaining (80%)
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Bcrypt Hashing**: Password security
- **Rate Limiting**: API abuse prevention
- **Input Validation**: XSS/injection protection
- **HTTPS Only**: Production security requirement

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB
- [ ] Set up SSL certificates
- [ ] Configure email SMTP
- [ ] Test XRPL mainnet integration
- [ ] Set up monitoring/logging

### Docker Deployment
```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issue for bugs/features
- **Email**: support@quantumbot.com

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Admin hierarchy system
- [x] Heat map visualizations
- [x] Commission flow animations
- [x] Invite system

### Phase 2: Advanced Features 🚧
- [ ] 3D heat map toggle
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API webhooks

### Phase 3: Enterprise Features 🔮
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] Custom branding
- [ ] Enterprise SSO

---

**Built with ❤️ for the XRPL community**

*Maximize your passive income through professional bot management and referral systems.*
