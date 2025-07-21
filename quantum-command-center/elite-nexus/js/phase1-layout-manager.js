// Phase 1: Layout Manager - Apple/Bloomberg Fusion Grid System
// Transforms existing dashboard into professional hedge fund interface

class Phase1LayoutManager {
    constructor() {
        this.isInitialized = false;
        this.currentLayout = 'desktop';
        this.components = new Map();
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Initializing Phase 1 Layout Manager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLayout());
        } else {
            this.setupLayout();
        }
    }
    
    setupLayout() {
        console.log('🏗️ Setting up Hedge Empire layout structure...');
        
        // Create main container structure
        this.createMainContainer();
        
        // Reorganize existing content
        this.reorganizeContent();
        
        // Apply responsive handlers
        this.setupResponsiveHandlers();
        
        // Initialize animations
        this.initializeAnimations();
        
        this.isInitialized = true;
        console.log('✅ Phase 1 Layout Manager initialized successfully');
    }
    
    createMainContainer() {
        // Find or create main container
        let container = document.querySelector('.hedge-empire-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'hedge-empire-container fade-in';
            
            // Move all existing body content into container
            const bodyContent = Array.from(document.body.children);
            bodyContent.forEach(child => {
                if (!child.tagName || !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) {
                    container.appendChild(child);
                }
            });
            
            document.body.appendChild(container);
        }
        
        // Create grid sections
        this.createGridSections(container);
    }
    
    createGridSections(container) {
        const sections = [
            { id: 'header', class: 'hedge-empire-header', area: 'header' },
            { id: 'sidebar', class: 'hedge-empire-sidebar', area: 'sidebar' },
            { id: 'main', class: 'hedge-empire-main', area: 'main' },
            { id: 'oracle', class: 'hedge-empire-oracle', area: 'oracle' },
            { id: 'footer', class: 'hedge-empire-footer', area: 'footer' }
        ];
        
        sections.forEach(section => {
            let element = document.getElementById(section.id);
            
            if (!element) {
                element = document.createElement('div');
                element.id = section.id;
                element.className = `${section.class} slide-up`;
                element.style.gridArea = section.area;
                container.appendChild(element);
            } else {
                element.className = `${section.class} slide-up`;
                element.style.gridArea = section.area;
            }
            
            this.components.set(section.id, element);
        });
    }
    
    reorganizeContent() {
        console.log('📦 Reorganizing existing content...');
        
        // Move header content
        this.setupHeader();
        
        // Move oracle content
        this.setupOracle();
        
        // Move main dashboard content
        this.setupMainContent();
        
        // Setup sidebar
        this.setupSidebar();
        
        // Setup footer
        this.setupFooter();
    }
    
    setupHeader() {
        const header = this.components.get('header');
        
        header.innerHTML = `
            <div class="header-brand">
                <div class="brand-logo">⚡</div>
                <div>
                    <div class="brand-title">Elite Asset Command Nexus</div>
                    <div class="brand-subtitle">Hedge Empire Dashboard</div>
                </div>
            </div>
            
            <div class="header-controls">
                <div class="control-group">
                    <div class="status-indicator active">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Live
                    </div>
                    <div class="metric-value" style="font-size: 1rem; margin: 0;">$3.44</div>
                    <div class="metric-change positive">+5.2%</div>
                </div>
                
                <button id="theme-toggle" class="neo-button">
                    <span class="toggle-icon">🌙</span>
                    <span class="toggle-text">Bloomberg</span>
                </button>
                
                <button id="view-toggle" class="neo-button primary">
                    <span>2D/3D Toggle</span>
                </button>
                
                <button id="god-view" class="neo-button success">
                    <span>God View</span>
                </button>
            </div>
        `;
        
        // Attach event listeners
        this.attachHeaderEvents();
    }
    
    setupOracle() {
        const oracle = this.components.get('oracle');
        
        // Move existing oracle content or create placeholder
        const existingOracle = document.getElementById('oracle-dashboard');
        if (existingOracle) {
            oracle.appendChild(existingOracle);
        } else {
            oracle.innerHTML = `
                <div class="sidebar-title">🔮 XRP Buy Timing Oracle</div>
                <div id="oracle-dashboard-placeholder">
                    <div class="neo-card">
                        <div class="metric-card">
                            <div class="metric-value">$3.44</div>
                            <div class="metric-label">Current XRP Price</div>
                            <div class="metric-change positive">+5.2% (24h)</div>
                        </div>
                    </div>
                    
                    <div class="neo-card" style="margin-top: 16px;">
                        <div class="metric-card">
                            <div class="metric-value">77%</div>
                            <div class="metric-label">X Sentiment</div>
                            <div class="metric-change positive">Very Bullish</div>
                        </div>
                    </div>
                    
                    <div class="neo-card" style="margin-top: 16px;">
                        <div class="sidebar-title" style="font-size: 0.875rem; margin-bottom: 12px;">Recommendation</div>
                        <div class="status-indicator active" style="width: 100%; justify-content: center;">
                            <span>STRONG BUY - 74%</span>
                        </div>
                        <button class="neo-button success" style="width: 100%; margin-top: 12px;">
                            Apply Strategy
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    setupMainContent() {
        const main = this.components.get('main');
        
        // Move existing dashboard content
        const existingContent = document.querySelector('.dashboard-container') || 
                               document.querySelector('.elite-command-nexus') ||
                               document.querySelector('main');
        
        if (existingContent) {
            main.appendChild(existingContent);
        } else {
            // Create placeholder content structure
            main.innerHTML = `
                <div class="grid-2" style="margin-bottom: 24px;">
                    <div class="neo-card">
                        <div class="sidebar-title">Portfolio Overview</div>
                        <div class="grid-2" style="gap: 16px; margin-top: 16px;">
                            <div class="metric-card">
                                <div class="metric-value">$127.5K</div>
                                <div class="metric-label">Total Value</div>
                                <div class="metric-change positive">+12.3%</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">62.4%</div>
                                <div class="metric-label">Expected APY</div>
                                <div class="metric-change positive">+8.1%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="neo-card">
                        <div class="sidebar-title">Risk Metrics</div>
                        <div class="grid-2" style="gap: 16px; margin-top: 16px;">
                            <div class="metric-card">
                                <div class="metric-value">24%</div>
                                <div class="metric-label">Volatility</div>
                                <div class="metric-change">Moderate</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">-12.3%</div>
                                <div class="metric-label">Max Drawdown</div>
                                <div class="metric-change negative">5% Risk</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="neo-card">
                    <div class="sidebar-title">Heat Map Visualization</div>
                    <div id="heatmap-container" style="height: 400px; background: var(--accent-bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                        Heat Map Will Load Here
                    </div>
                </div>
            `;
        }
    }
    
    setupSidebar() {
        const sidebar = this.components.get('sidebar');
        
        sidebar.innerHTML = `
            <div class="sidebar-section">
                <div class="sidebar-title">🤖 Active Bots</div>
                <div class="space-y-3">
                    <div class="neo-card" style="padding: 16px;">
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="font-semibold">Quantum CLOB</div>
                                <div class="text-sm text-gray-400">XRP/RLUSD</div>
                            </div>
                            <div class="status-indicator active">Active</div>
                        </div>
                        <div class="mt-2 text-sm">
                            <div>Yield: <span class="text-green-400">+15.2%</span></div>
                            <div>Volume: <span class="text-blue-400">$2.3M</span></div>
                        </div>
                    </div>
                    
                    <div class="neo-card" style="padding: 16px;">
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="font-semibold">AMM Harvester</div>
                                <div class="text-sm text-gray-400">Multi-Pool</div>
                            </div>
                            <div class="status-indicator active">Active</div>
                        </div>
                        <div class="mt-2 text-sm">
                            <div>Yield: <span class="text-green-400">+8.7%</span></div>
                            <div>Volume: <span class="text-blue-400">$1.8M</span></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-section">
                <div class="sidebar-title">⚡ Quick Actions</div>
                <div class="space-y-2">
                    <button class="neo-button primary" style="width: 100%;">Deploy New Bot</button>
                    <button class="neo-button" style="width: 100%;">Rebalance All</button>
                    <button class="neo-button warning" style="width: 100%;">Emergency Stop</button>
                </div>
            </div>
            
            <div class="sidebar-section">
                <div class="sidebar-title">📊 Market Alerts</div>
                <div class="space-y-2">
                    <div class="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg text-sm">
                        <div class="font-semibold text-yellow-400">Volatility Spike</div>
                        <div class="text-yellow-200">XRP vol increased to 24%</div>
                    </div>
                    <div class="p-3 bg-green-900/20 border border-green-600 rounded-lg text-sm">
                        <div class="font-semibold text-green-400">Opportunity</div>
                        <div class="text-green-200">RLUSD spread widening</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupFooter() {
        const footer = this.components.get('footer');
        
        footer.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="status-indicator active">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    System Operational
                </div>
                <div class="text-sm text-gray-400">
                    Last Update: ${new Date().toLocaleTimeString()}
                </div>
            </div>
            
            <div class="flex items-center gap-6">
                <div class="text-sm">
                    <span class="text-gray-400">Total PnL:</span>
                    <span class="text-green-400 font-semibold ml-2">+$23,847</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-400">Active Positions:</span>
                    <span class="text-blue-400 font-semibold ml-2">12</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-400">Uptime:</span>
                    <span class="text-white font-semibold ml-2">99.8%</span>
                </div>
            </div>
        `;
    }
    
    attachHeaderEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // View toggle (2D/3D)
        const viewToggle = document.getElementById('view-toggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => this.toggleVisualization());
        }
        
        // God view
        const godView = document.getElementById('god-view');
        if (godView) {
            godView.addEventListener('click', () => this.activateGodView());
        }
    }
    
    toggleTheme() {
        const currentTheme = localStorage.getItem('eliteNexusTheme') || 'apple';
        const newTheme = currentTheme === 'apple' ? 'bloomberg' : 'apple';
        
        localStorage.setItem('eliteNexusTheme', newTheme);
        
        // Apply theme changes
        if (newTheme === 'bloomberg') {
            document.body.classList.add('theme-bloomberg');
            document.body.classList.remove('theme-apple');
        } else {
            document.body.classList.add('theme-apple');
            document.body.classList.remove('theme-bloomberg');
        }
        
        // Update button text
        const toggleBtn = document.getElementById('theme-toggle');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (newTheme === 'bloomberg') {
            toggleText.textContent = 'Apple';
            toggleIcon.textContent = '☀️';
        } else {
            toggleText.textContent = 'Bloomberg';
            toggleIcon.textContent = '🌙';
        }
        
        console.log(`🎨 Switched to ${newTheme} theme`);
    }
    
    toggleVisualization() {
        // Trigger visualization toggle
        if (window.visualizationToggle) {
            window.visualizationToggle.toggle();
        }
        console.log('🔄 Toggled 2D/3D visualization');
    }
    
    activateGodView() {
        // Activate god view mode
        document.body.classList.toggle('god-view-active');
        
        const godBtn = document.getElementById('god-view');
        if (document.body.classList.contains('god-view-active')) {
            godBtn.textContent = 'Exit God View';
            godBtn.classList.add('danger');
            godBtn.classList.remove('success');
        } else {
            godBtn.textContent = 'God View';
            godBtn.classList.add('success');
            godBtn.classList.remove('danger');
        }
        
        console.log('👁️ Toggled God View mode');
    }
    
    setupResponsiveHandlers() {
        const mediaQueries = [
            { query: '(max-width: 768px)', layout: 'mobile' },
            { query: '(max-width: 1200px)', layout: 'tablet' },
            { query: '(min-width: 1201px)', layout: 'desktop' }
        ];
        
        mediaQueries.forEach(({ query, layout }) => {
            const mq = window.matchMedia(query);
            mq.addListener(() => {
                if (mq.matches) {
                    this.currentLayout = layout;
                    this.applyResponsiveLayout(layout);
                }
            });
            
            if (mq.matches) {
                this.currentLayout = layout;
                this.applyResponsiveLayout(layout);
            }
        });
    }
    
    applyResponsiveLayout(layout) {
        const container = document.querySelector('.hedge-empire-container');
        if (!container) return;
        
        container.className = `hedge-empire-container fade-in layout-${layout}`;
        console.log(`📱 Applied ${layout} layout`);
    }
    
    initializeAnimations() {
        // Add staggered animations to cards
        const cards = document.querySelectorAll('.neo-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('scale-in');
        });
        
        // Add hover animations
        this.setupHoverAnimations();
    }
    
    setupHoverAnimations() {
        const buttons = document.querySelectorAll('.neo-button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Public API methods
    updateMetric(id, value, change = null) {
        const element = document.querySelector(`[data-metric="${id}"]`);
        if (element) {
            const valueEl = element.querySelector('.metric-value');
            const changeEl = element.querySelector('.metric-change');
            
            if (valueEl) valueEl.textContent = value;
            if (changeEl && change) {
                changeEl.textContent = change;
                changeEl.className = `metric-change ${change.startsWith('+') ? 'positive' : 'negative'}`;
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-up`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize and expose globally
window.Phase1LayoutManager = Phase1LayoutManager;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.phase1Layout = new Phase1LayoutManager();
        console.log('🚀 Phase 1 Layout Manager loaded!');
    }, 500);
});

console.log('🎨 Phase 1 Layout Manager module loaded!');
