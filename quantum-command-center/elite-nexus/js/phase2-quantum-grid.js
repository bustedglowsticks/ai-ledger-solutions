/**
 * Phase 2: Quantum Performance Grid - Hedge Fund Grade Heat Map
 * Finviz-style interactive bot performance visualization with real-time XRPL data
 */

class QuantumPerformanceGrid {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            userRole: options.userRole || 'user',
            userId: options.userId || 'default',
            updateInterval: options.updateInterval || 5000,
            enableDragDrop: options.enableDragDrop !== false,
            enableAnimations: options.enableAnimations !== false,
            ...options
        };
        
        this.bots = [];
        this.xrplClient = null;
        this.animationQueue = [];
        this.draggedBot = null;
        this.activePopover = null;
        
        this.init();
    }
    
    async init() {
        this.createGridStructure();
        this.setupEventListeners();
        await this.connectXRPL();
        this.loadBotData();
        this.startUpdateLoop();
        
        // Initialize GSAP for animations
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(MotionPathPlugin);
        }
    }
    
    createGridStructure() {
        this.container.innerHTML = `
            <div class="quantum-performance-grid">
                <div class="quantum-grid-header">
                    <h2 class="quantum-grid-title">Quantum Performance Grid</h2>
                    <div class="grid-controls">
                        <button class="grid-toggle active" data-view="performance">Performance</button>
                        <button class="grid-toggle" data-view="commissions">Commissions</button>
                        <button class="grid-toggle" data-view="eco-rwa">Eco RWA</button>
                        <button class="grid-toggle" data-refresh="true">🔄 Refresh</button>
                    </div>
                </div>
                
                ${this.options.userRole === 'master' ? `
                    <div class="view-filter">
                        <div class="filter-chip active" data-filter="all">All Bots</div>
                        <div class="filter-chip" data-filter="high-yield">High Yield</div>
                        <div class="filter-chip" data-filter="eco-rwa">Eco RWA</div>
                        <div class="filter-chip" data-filter="referrals">Referrals</div>
                    </div>
                ` : ''}
                
                <div class="heat-map-container" id="heat-map-${this.containerId}">
                    <div class="bot-grid" id="bot-grid-${this.containerId}"></div>
                    <div class="reallocation-zones" id="reallocation-zones-${this.containerId}">
                        <div class="reallocation-zone" data-allocation="conservative">
                            Conservative (80% RLUSD)
                        </div>
                        <div class="reallocation-zone" data-allocation="balanced">
                            Balanced (60% RLUSD)
                        </div>
                        <div class="reallocation-zone" data-allocation="aggressive">
                            Aggressive (40% RLUSD)
                        </div>
                    </div>
                </div>
                
                <svg class="commission-flow-container" id="commission-svg-${this.containerId}">
                    <!-- Commission flow paths will be dynamically added -->
                </svg>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Grid control toggles
        this.container.querySelectorAll('.grid-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (e.target.dataset.refresh) {
                    this.refreshData();
                    return;
                }
                
                this.container.querySelectorAll('.grid-toggle').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.updateGridView(e.target.dataset.view);
            });
        });
        
        // Filter chips (master view only)
        this.container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.filterBots(e.target.dataset.filter);
            });
        });
        
        // Drag and drop setup
        if (this.options.enableDragDrop) {
            this.setupDragDrop();
        }
    }
    
    async connectXRPL() {
        try {
            // Use public XRPL endpoint for real-time data
            const { Client } = window.xrpl || {};
            if (!Client) {
                console.warn('XRPL client not available, using mock data');
                return;
            }
            
            this.xrplClient = new Client('wss://xrplcluster.com');
            await this.xrplClient.connect();
            
            // Subscribe to account transactions for commission tracking
            const accounts = this.getMonitoredAccounts();
            if (accounts.length > 0) {
                await this.xrplClient.request({
                    command: 'subscribe',
                    accounts: accounts
                });
                
                this.xrplClient.on('transaction', (tx) => {
                    this.handleXRPLTransaction(tx);
                });
            }
            
            console.log('✅ XRPL connection established');
        } catch (error) {
            console.warn('XRPL connection failed, using mock data:', error);
        }
    }
    
    loadBotData() {
        // Load bot data based on user role
        const mockBots = this.generateMockBotData();
        this.bots = this.options.userRole === 'master' ? mockBots : mockBots.slice(0, 2);
        this.renderBotGrid();
    }
    
    generateMockBotData() {
        const baseData = [
            {
                id: 'quantum-alpha',
                name: 'Quantum Alpha',
                yield: 62.5,
                volatility: 0.13,
                commissions: 1250,
                status: 'active',
                allocation: { rlusd: 80, xrp: 20 },
                ecoRwa: true,
                ecoBonus: 24,
                recentTxs: 47,
                predictedApy: 68.2
            },
            {
                id: 'hedge-beta',
                name: 'Hedge Beta',
                yield: 45.8,
                volatility: 0.09,
                commissions: 890,
                status: 'active',
                allocation: { rlusd: 60, xrp: 40 },
                ecoRwa: false,
                ecoBonus: 0,
                recentTxs: 32,
                predictedApy: 52.1
            },
            {
                id: 'eco-gamma',
                name: 'Eco Gamma',
                yield: 71.2,
                volatility: 0.15,
                commissions: 1680,
                status: 'active',
                allocation: { rlusd: 85, xrp: 15 },
                ecoRwa: true,
                ecoBonus: 24,
                recentTxs: 63,
                predictedApy: 78.9
            }
        ];
        
        if (this.options.userRole === 'master') {
            baseData.push(
                {
                    id: 'referral-delta',
                    name: 'Referral Delta',
                    yield: 38.4,
                    volatility: 0.07,
                    commissions: 2340,
                    status: 'active',
                    allocation: { rlusd: 70, xrp: 30 },
                    ecoRwa: false,
                    ecoBonus: 0,
                    recentTxs: 28,
                    predictedApy: 41.7,
                    isReferral: true,
                    referralCut: 15
                }
            );
        }
        
        return baseData;
    }
    
    renderBotGrid() {
        const gridContainer = document.getElementById(`bot-grid-${this.containerId}`);
        gridContainer.innerHTML = '';
        
        this.bots.forEach(bot => {
            const botTile = this.createBotTile(bot);
            gridContainer.appendChild(botTile);
        });
    }
    
    createBotTile(bot) {
        const tile = document.createElement('div');
        tile.className = `bot-tile ${this.getYieldClass(bot.yield)} ${this.getVolatilityClass(bot.volatility)}`;
        tile.dataset.botId = bot.id;
        tile.draggable = this.options.enableDragDrop;
        
        if (bot.ecoRwa) {
            tile.classList.add('eco-rwa');
        }
        
        tile.innerHTML = `
            <div class="bot-tile-header">
                <span class="bot-name">${bot.name}</span>
                <div class="bot-status"></div>
            </div>
            <div class="bot-metrics">
                <div class="metric-row">
                    <span>Yield:</span>
                    <span class="metric-value">${bot.yield.toFixed(1)}%</span>
                </div>
                <div class="metric-row">
                    <span>Vol:</span>
                    <span class="metric-value">${(bot.volatility * 100).toFixed(1)}%</span>
                </div>
                <div class="metric-row">
                    <span>Comm:</span>
                    <span class="metric-value">$${bot.commissions}</span>
                </div>
                ${bot.ecoRwa ? `
                    <div class="metric-row">
                        <span>Eco:</span>
                        <span class="metric-value">+${bot.ecoBonus}%</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add hover events for popover
        tile.addEventListener('mouseenter', (e) => this.showPopover(e, bot));
        tile.addEventListener('mouseleave', () => this.hidePopover());
        
        return tile;
    }
    
    getYieldClass(yield) {
        if (yield >= 60) return 'yield-high';
        if (yield >= 40) return 'yield-medium';
        return 'yield-low';
    }
    
    getVolatilityClass(volatility) {
        if (volatility >= 0.12) return 'vol-high';
        if (volatility >= 0.08) return 'vol-medium';
        return 'vol-low';
    }
    
    showPopover(event, bot) {
        this.hidePopover(); // Hide any existing popover
        
        const popover = document.createElement('div');
        popover.className = 'bot-popover';
        popover.innerHTML = `
            <div class="popover-header">
                <span class="popover-title">${bot.name}</span>
                <button class="popover-close">×</button>
            </div>
            <div class="popover-content">
                <div class="popover-metric">
                    <span class="popover-metric-label">Current Yield:</span>
                    <span class="popover-metric-value">${bot.yield.toFixed(1)}%</span>
                </div>
                <div class="popover-metric">
                    <span class="popover-metric-label">Predicted APY:</span>
                    <span class="popover-metric-value">${bot.predictedApy.toFixed(1)}%</span>
                </div>
                <div class="popover-metric">
                    <span class="popover-metric-label">Recent Txs:</span>
                    <span class="popover-metric-value">${bot.recentTxs}</span>
                </div>
                <div class="popover-metric">
                    <span class="popover-metric-label">RLUSD Allocation:</span>
                    <span class="popover-metric-value">${bot.allocation.rlusd}%</span>
                </div>
                ${bot.ecoRwa ? `
                    <div class="popover-metric">
                        <span class="popover-metric-label">Eco Bonus:</span>
                        <span class="popover-metric-value">+${bot.ecoBonus}% (Solar RWA)</span>
                    </div>
                ` : ''}
                ${bot.isReferral ? `
                    <div class="popover-metric">
                        <span class="popover-metric-label">Referral Cut:</span>
                        <span class="popover-metric-value">${bot.referralCut}%</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Position popover
        const rect = event.target.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;
        popover.style.top = `${rect.top}px`;
        
        document.body.appendChild(popover);
        this.activePopover = popover;
        
        // Show with animation
        requestAnimationFrame(() => {
            popover.classList.add('visible');
        });
        
        // Close button
        popover.querySelector('.popover-close').addEventListener('click', () => {
            this.hidePopover();
        });
    }
    
    hidePopover() {
        if (this.activePopover) {
            this.activePopover.remove();
            this.activePopover = null;
        }
    }
    
    setupDragDrop() {
        // Bot tile drag events
        this.container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('bot-tile')) {
                this.draggedBot = e.target.dataset.botId;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        this.container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('bot-tile')) {
                e.target.classList.remove('dragging');
                this.draggedBot = null;
            }
        });
        
        // Drop zone events
        this.container.querySelectorAll('.reallocation-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedBot) {
                    this.reallocateBot(this.draggedBot, zone.dataset.allocation);
                }
            });
        });
    }
    
    reallocateBot(botId, allocation) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return;
        
        const allocations = {
            conservative: { rlusd: 80, xrp: 20 },
            balanced: { rlusd: 60, xrp: 40 },
            aggressive: { rlusd: 40, xrp: 60 }
        };
        
        bot.allocation = allocations[allocation];
        
        // Animate commission flow
        this.animateCommissionFlow(botId, allocation);
        
        // Update display
        this.renderBotGrid();
        
        console.log(`🔄 Reallocated ${bot.name} to ${allocation}: ${bot.allocation.rlusd}% RLUSD`);
    }
    
    animateCommissionFlow(botId, allocation) {
        if (!this.options.enableAnimations || typeof gsap === 'undefined') return;
        
        const svg = document.getElementById(`commission-svg-${this.containerId}`);
        const botTile = document.querySelector(`[data-bot-id="${botId}"]`);
        const walletTarget = document.querySelector('.wallet-display') || 
                           document.querySelector('.header-wallet') ||
                           { getBoundingClientRect: () => ({ left: window.innerWidth - 100, top: 50 }) };
        
        if (!botTile) return;
        
        const botRect = botTile.getBoundingClientRect();
        const walletRect = walletTarget.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        
        // Create commission line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = botRect.left - svgRect.left + botRect.width / 2;
        const startY = botRect.top - svgRect.top + botRect.height / 2;
        const endX = walletRect.left - svgRect.left + walletRect.width / 2;
        const endY = walletRect.top - svgRect.top + walletRect.height / 2;
        
        // Create curved path
        const controlX = startX + (endX - startX) * 0.5;
        const controlY = startY - 100; // Arc upward
        
        line.setAttribute('d', `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`);
        line.className = 'commission-line';
        svg.appendChild(line);
        
        // Animate line drawing
        gsap.fromTo(line, 
            { strokeDashoffset: 100 },
            { 
                strokeDashoffset: 0, 
                duration: 1.5, 
                ease: 'power2.out',
                onComplete: () => {
                    // Create wallet burst effect
                    this.createWalletBurst(endX, endY);
                    
                    // Remove line after animation
                    setTimeout(() => line.remove(), 1000);
                }
            }
        );
        
        // Create moving particle
        const particle = document.createElement('div');
        particle.className = 'commission-particle';
        document.body.appendChild(particle);
        
        gsap.set(particle, { x: startX, y: startY });
        gsap.to(particle, {
            motionPath: {
                path: line,
                autoRotate: true
            },
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
    }
    
    createWalletBurst(x, y) {
        const burst = document.createElement('div');
        burst.className = 'wallet-burst';
        burst.style.left = `${x - 20}px`;
        burst.style.top = `${y - 20}px`;
        document.body.appendChild(burst);
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(burst,
                { scale: 0, opacity: 1 },
                { 
                    scale: 2, 
                    opacity: 0, 
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => burst.remove()
                }
            );
        } else {
            setTimeout(() => burst.remove(), 600);
        }
    }
    
    handleXRPLTransaction(tx) {
        const transaction = tx.transaction;
        if (!transaction || !transaction.Amount) return;
        
        const amount = parseInt(transaction.Amount) / 1000000; // Convert drops to XRP
        
        // Find relevant bot based on transaction
        const relevantBot = this.bots.find(bot => 
            transaction.Account === this.getBotAccount(bot.id) ||
            transaction.Destination === this.getBotAccount(bot.id)
        );
        
        if (relevantBot) {
            // Update commission data
            relevantBot.commissions += Math.round(amount * 0.15); // 15% commission
            relevantBot.recentTxs += 1;
            
            // Animate commission flow
            this.animateCommissionFlow(relevantBot.id, 'live-tx');
            
            // Update display
            this.renderBotGrid();
            
            console.log(`💰 Commission flow: $${amount.toFixed(2)} from ${relevantBot.name}`);
        }
    }
    
    getMonitoredAccounts() {
        // Return XRPL accounts to monitor (mock for demo)
        return this.bots.map(bot => this.getBotAccount(bot.id)).filter(Boolean);
    }
    
    getBotAccount(botId) {
        // Mock XRPL account mapping
        const accounts = {
            'quantum-alpha': 'rQuantumAlpha1234567890',
            'hedge-beta': 'rHedgeBeta1234567890',
            'eco-gamma': 'rEcoGamma1234567890'
        };
        return accounts[botId];
    }
    
    updateGridView(view) {
        // Update grid display based on selected view
        const tiles = this.container.querySelectorAll('.bot-tile');
        
        tiles.forEach(tile => {
            const botId = tile.dataset.botId;
            const bot = this.bots.find(b => b.id === botId);
            
            switch (view) {
                case 'performance':
                    // Default view - show all performance metrics
                    break;
                case 'commissions':
                    // Highlight commission data
                    tile.style.borderColor = bot.commissions > 1000 ? '#2196F3' : 'rgba(255,255,255,0.1)';
                    break;
                case 'eco-rwa':
                    // Highlight eco RWA bots
                    tile.style.display = bot.ecoRwa ? 'flex' : 'none';
                    break;
            }
        });
    }
    
    filterBots(filter) {
        const tiles = this.container.querySelectorAll('.bot-tile');
        
        tiles.forEach(tile => {
            const botId = tile.dataset.botId;
            const bot = this.bots.find(b => b.id === botId);
            let show = true;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'high-yield':
                    show = bot.yield >= 60;
                    break;
                case 'eco-rwa':
                    show = bot.ecoRwa;
                    break;
                case 'referrals':
                    show = bot.isReferral;
                    break;
            }
            
            tile.style.display = show ? 'flex' : 'none';
        });
    }
    
    refreshData() {
        console.log('🔄 Refreshing Quantum Performance Grid...');
        this.loadBotData();
        
        // Animate refresh
        const grid = document.getElementById(`bot-grid-${this.containerId}`);
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(grid, 
                { opacity: 0.5, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
            );
        }
    }
    
    startUpdateLoop() {
        setInterval(() => {
            // Update bot data with small variations (simulate live data)
            this.bots.forEach(bot => {
                bot.yield += (Math.random() - 0.5) * 2; // ±1% variation
                bot.volatility += (Math.random() - 0.5) * 0.02; // ±1% variation
                bot.commissions += Math.floor(Math.random() * 50); // Random commission increases
                
                // Clamp values
                bot.yield = Math.max(0, Math.min(100, bot.yield));
                bot.volatility = Math.max(0.01, Math.min(0.5, bot.volatility));
            });
            
            this.renderBotGrid();
        }, this.options.updateInterval);
    }
    
    destroy() {
        if (this.xrplClient) {
            this.xrplClient.disconnect();
        }
        this.hidePopover();
        this.container.innerHTML = '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize if container exists
    const container = document.getElementById('quantum-performance-grid');
    if (container) {
        window.quantumGrid = new QuantumPerformanceGrid('quantum-performance-grid', {
            userRole: localStorage.getItem('userRole') || 'user',
            userId: localStorage.getItem('userId') || 'demo-user',
            enableAnimations: true,
            enableDragDrop: true
        });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantumPerformanceGrid;
}
