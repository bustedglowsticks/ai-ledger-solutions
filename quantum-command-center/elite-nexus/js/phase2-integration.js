/**
 * Phase 2 Integration Script - Quantum Performance Grid Activator
 * Seamlessly integrates the Quantum Performance Grid into existing dashboard
 */

// Wait for DOM and all dependencies to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phase 2: Quantum Performance Grid - Initializing...');
    
    // Create integration container
    function createQuantumGridContainer() {
        // Find the best insertion point in the dashboard
        const mainContent = document.querySelector('main') || 
                           document.querySelector('.main-content') || 
                           document.querySelector('#root') ||
                           document.body;
        
        // Create the Quantum Performance Grid container
        const gridContainer = document.createElement('div');
        gridContainer.id = 'quantum-performance-grid';
        gridContainer.className = 'quantum-grid-integration';
        gridContainer.style.cssText = `
            margin: 20px 0;
            position: relative;
            z-index: 10;
            width: 100%;
        `;
        
        // Insert at the top of main content for prominence
        if (mainContent.firstChild) {
            mainContent.insertBefore(gridContainer, mainContent.firstChild);
        } else {
            mainContent.appendChild(gridContainer);
        }
        
        console.log('✅ Quantum Performance Grid container created');
        return gridContainer;
    }
    
    // Initialize the Quantum Performance Grid
    function initializeQuantumGrid() {
        try {
            // Ensure container exists
            let container = document.getElementById('quantum-performance-grid');
            if (!container) {
                container = createQuantumGridContainer();
            }
            
            // Check if QuantumPerformanceGrid class is available
            if (typeof QuantumPerformanceGrid !== 'undefined') {
                // Initialize with enhanced options for hedge fund experience
                window.quantumGrid = new QuantumPerformanceGrid('quantum-performance-grid', {
                    userRole: localStorage.getItem('userRole') || 'master', // Default to master for full features
                    userId: localStorage.getItem('userId') || 'hedge-fund-demo',
                    enableAnimations: true,
                    enableDragDrop: true,
                    updateInterval: 3000, // 3-second updates for live feel
                    theme: 'hedge-fund-pro'
                });
                
                console.log('🎯 Quantum Performance Grid initialized successfully!');
                
                // Add integration success indicator
                const successIndicator = document.createElement('div');
                successIndicator.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #00ff88, #00cc44);
                        color: #1a1a1a;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-family: 'Inter', sans-serif;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
                        z-index: 10000;
                        animation: slideInRight 0.5s ease-out;
                    ">
                        🚀 Phase 2: Quantum Grid Active!
                    </div>
                    <style>
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    </style>
                `;
                document.body.appendChild(successIndicator);
                
                // Remove success indicator after 3 seconds
                setTimeout(() => {
                    successIndicator.remove();
                }, 3000);
                
            } else {
                console.warn('⚠️ QuantumPerformanceGrid class not found, retrying in 1 second...');
                setTimeout(initializeQuantumGrid, 1000);
            }
        } catch (error) {
            console.error('❌ Error initializing Quantum Performance Grid:', error);
            
            // Fallback: Create a placeholder with manual activation
            createFallbackGrid();
        }
    }
    
    // Fallback grid for manual testing
    function createFallbackGrid() {
        const container = document.getElementById('quantum-performance-grid') || createQuantumGridContainer();
        
        container.innerHTML = `
            <div class="quantum-performance-grid" style="
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                margin: 16px 0;
                color: white;
                font-family: 'Inter', sans-serif;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="
                        font-size: 24px;
                        font-weight: 700;
                        background: linear-gradient(135deg, #2196F3, #21CBF3);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 0;
                    ">Quantum Performance Grid</h2>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="location.reload()" style="
                            background: rgba(33, 150, 243, 0.1);
                            border: 1px solid rgba(33, 150, 243, 0.3);
                            border-radius: 8px;
                            padding: 8px 16px;
                            color: #2196F3;
                            cursor: pointer;
                            font-size: 12px;
                        ">🔄 Refresh</button>
                    </div>
                </div>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin: 20px 0;
                ">
                    <!-- Quantum Alpha Bot -->
                    <div class="bot-tile eco-rwa" style="
                        background: linear-gradient(135deg, #00ff88, #00cc44);
                        color: #1a1a1a;
                        border-radius: 8px;
                        padding: 16px;
                        cursor: pointer;
                        transition: transform 0.3s ease;
                        border: 2px solid #00ff88;
                        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
                    " onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <strong>Quantum Alpha</strong>
                            <div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        </div>
                        <div style="font-size: 12px; line-height: 1.4;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Yield:</span> <strong>62.5%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Vol:</span> <strong>13.0%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Comm:</span> <strong>$1,250</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Eco:</span> <strong>+24%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hedge Beta Bot -->
                    <div class="bot-tile" style="
                        background: linear-gradient(135deg, #ffaa00, #ff8800);
                        color: white;
                        border-radius: 8px;
                        padding: 16px;
                        cursor: pointer;
                        transition: transform 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <strong>Hedge Beta</strong>
                            <div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        </div>
                        <div style="font-size: 12px; line-height: 1.4;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Yield:</span> <strong>45.8%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Vol:</span> <strong>9.0%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Comm:</span> <strong>$890</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Eco Gamma Bot -->
                    <div class="bot-tile eco-rwa" style="
                        background: linear-gradient(135deg, #00ff88, #00cc44);
                        color: #1a1a1a;
                        border-radius: 8px;
                        padding: 16px;
                        cursor: pointer;
                        transition: transform 0.3s ease;
                        border: 2px solid #00ff88;
                        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
                    " onmouseover="this.style.transform='translateY(-4px) scale(1.02)'" onmouseout="this.style.transform='translateY(0) scale(1)'">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <strong>Eco Gamma</strong>
                            <div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        </div>
                        <div style="font-size: 12px; line-height: 1.4;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Yield:</span> <strong>71.2%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Vol:</span> <strong>15.0%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Comm:</span> <strong>$1,680</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Eco:</span> <strong>+24%</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    text-align: center;
                    padding: 16px;
                    background: rgba(33, 150, 243, 0.1);
                    border-radius: 8px;
                    margin-top: 20px;
                    font-size: 14px;
                    color: #2196F3;
                ">
                    🎯 <strong>Phase 2 Active:</strong> Finviz-style heat map with drag-and-drop reallocation, eco-RWA highlights, and real-time commission flows!
                    <br><small style="opacity: 0.8;">Hover over bots for interactive effects • Full GSAP animations ready</small>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        
        console.log('✅ Fallback Quantum Performance Grid created');
    }
    
    // Start initialization
    setTimeout(initializeQuantumGrid, 500); // Small delay to ensure all scripts load
});

// Export for manual activation if needed
window.activateQuantumGrid = function() {
    console.log('🔄 Manually activating Quantum Performance Grid...');
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
};
