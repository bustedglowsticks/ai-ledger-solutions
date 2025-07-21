/**
 * Phase 3: Commission Constellation Engine - Elite Rocket Animations
 * Hyper-precise GSAP commission flows with AI-driven boost alerts
 */

class CommissionConstellation {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            userRole: options.userRole || 'master',
            userId: options.userId || 'default',
            enableAI: options.enableAI !== false,
            enableXPosting: options.enableXPosting || false,
            updateInterval: options.updateInterval || 2000,
            ...options
        };
        
        this.xrplClient = null;
        this.aiModel = null;
        this.activeFlows = new Map();
        this.walletNodes = new Map();
        this.botSources = new Map();
        this.activePopover = null;
        this.stats = {
            totalCommissions: 0,
            ecoCommissions: 0,
            referralCommissions: 0,
            highValueFlows: 0
        };
        
        this.init();
    }
    
    async init() {
        this.createConstellationStructure();
        this.setupEventListeners();
        await this.initializeAI();
        await this.connectXRPL();
        this.startMockDataLoop();
        this.updateStatsDisplay();
        console.log('🚀 Phase 3: Commission Constellation Engine Initialized');
    }

    createConstellationStructure() {
        this.container.innerHTML = `
            <div class="commission-constellation">
                <div class="constellation-header">
                    <h2 class="constellation-title">Commission Constellation</h2>
                    <div class="constellation-controls">
                        <button class="constellation-toggle active" data-filter="all">All Flows</button>
                        <button class="constellation-toggle" data-filter="eco">Eco RWA</button>
                        <button class="constellation-toggle" data-filter="referrals">Referrals</button>
                    </div>
                </div>
                <div class="commission-canvas" id="canvas-${this.containerId}">
                    <svg class="commission-svg" id="svg-${this.containerId}"></svg>
                    <div class="wallet-node main-wallet" data-wallet="main">💰</div>
                    ${this.options.userRole === 'master' ? `<div class="wallet-node referral-wallet" data-wallet="referral">🤝</div>` : ''}
                </div>
                <div class="constellation-stats" id="stats-${this.containerId}"></div>
            </div>
        `;
        this.createBotSourceNodes();
        this.createWalletNodes();
    }

    createBotSourceNodes() {
        const botData = [
            { id: 'q-alpha', name: 'QA', type: 'eco-bot', top: '20%', left: '10%' },
            { id: 'h-beta', name: 'HB', type: 'high-yield', top: '50%', left: '5%' },
            { id: 'e-gamma', name: 'EG', type: 'eco-bot', top: '80%', left: '10%' },
            { id: 'r-delta', name: 'RD', type: 'referral', top: '65%', left: '20%' },
        ];

        const canvas = document.getElementById(`canvas-${this.containerId}`);
        botData.forEach(bot => {
            if (this.options.userRole !== 'master' && bot.type === 'referral') return;

            const node = document.createElement('div');
            node.className = `bot-source ${bot.type}`;
            node.style.top = bot.top;
            node.style.left = bot.left;
            node.dataset.botId = bot.id;
            node.textContent = bot.name;
            canvas.appendChild(node);
            this.botSources.set(bot.id, node);
        });
    }

    createWalletNodes() {
        this.container.querySelectorAll('.wallet-node').forEach(node => {
            this.walletNodes.set(node.dataset.wallet, node);
        });
    }

    setupEventListeners() {
        // Filter toggles
        this.container.querySelectorAll('.constellation-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.container.querySelectorAll('.constellation-toggle').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filterFlows(e.target.dataset.filter);
            });
        });

        // Wallet node popovers
        this.walletNodes.forEach((node, walletId) => {
            node.addEventListener('click', (e) => this.showWalletPopover(e, walletId));
        });
    }

    async initializeAI() {
        if (!this.options.enableAI || typeof tf === 'undefined') {
            console.warn('TensorFlow.js not found. AI features disabled.');
            return;
        }
        // Simple mock model for predicting high-yield moments
        this.aiModel = tf.sequential();
        this.aiModel.add(tf.layers.dense({ units: 8, inputShape: [2], activation: 'relu' }));
        this.aiModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        this.aiModel.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
        console.log('🤖 AI Model for Boost Alerts Initialized.');
    }

    async connectXRPL() {
        try {
            const { Client } = window.xrpl || {};
            if (!Client) {
                console.warn('XRPL client not available, using mock data.');
                return;
            }
            this.xrplClient = new Client('wss://xrplcluster.com');
            await this.xrplClient.connect();
            
            const accounts = ['rDAOTreasuryMain', 'rReferralTreasury'];
            await this.xrplClient.request({ command: 'subscribe', accounts: accounts });
            
            this.xrplClient.on('transaction', (tx) => {
                this.handleXRPLTransaction(tx);
            });
            console.log('✅ XRPL Connection Established for Commission Constellation.');
        } catch (error) {
            console.warn('XRPL connection failed, using mock data:', error);
        }
    }

    handleXRPLTransaction(txData) {
        const { transaction, meta } = txData;
        if (!transaction || !transaction.Amount || transaction.TransactionType !== 'Payment') return;

        const amount = Number(transaction.Amount) / 1e6; // XRP to number
        const isEco = meta && meta.isEcoRWA; // Hypothetical meta field
        const isReferral = transaction.Destination === 'rReferralTreasury';
        const botId = this.getBotFromTx(transaction);

        this.triggerCommissionFlow({
            id: transaction.hash,
            amount,
            isEco,
            isReferral,
            botId,
            txHash: transaction.hash
        });
    }

    getBotFromTx(tx) {
        // Mock logic to determine which bot initiated the tx
        const botKeys = Array.from(this.botSources.keys());
        return botKeys[tx.Sequence % botKeys.length];
    }

    startMockDataLoop() {
        setInterval(() => {
            const botIds = Array.from(this.botSources.keys());
            const randomBotId = botIds[Math.floor(Math.random() * botIds.length)];
            const isEco = randomBotId.includes('q-alpha') || randomBotId.includes('e-gamma');
            const isReferral = randomBotId.includes('r-delta');

            this.triggerCommissionFlow({
                id: `mock-${Date.now()}`,
                amount: Math.random() * 1000 + 50,
                isEco,
                isReferral,
                botId: randomBotId,
                txHash: `MOCK_${Math.random().toString(36).substring(2, 15)}`
            });
        }, this.options.updateInterval);
    }
}
