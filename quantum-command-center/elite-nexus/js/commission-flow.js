/**
 * Commission Flow Module for Elite Asset Command Nexus
 * Overlord Edition - Phase 3
 * 
 * Features:
 * - 2D GSAP lines arcing from bots to wallets
 * - Particle trails and landing bursts
 * - Interactive wallet popups with XRPL transaction details
 * - Timeline visualization for commission history
 */

// Create SVG container for commission paths if needed
function ensureSvgContainer() {
    const containerId = 'commission-svg-container';
    let container = document.getElementById(containerId);
    
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }
    
    return container;
}

// Generate and animate a commission path from bot to wallet
function animateCommission(fromPos, toPos, amount, botName) {
    const container = ensureSvgContainer();
    
    // Create SVG for the path
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    
    // Calculate control point for curved path (arc upward)
    const controlX = (fromPos.x + toPos.x) / 2;
    const controlY = Math.min(fromPos.y, toPos.y) - 100 - Math.random() * 50;
    
    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${fromPos.x},${fromPos.y} Q ${controlX},${controlY} ${toPos.x},${toPos.y}`);
    path.classList.add('commission-line');
    path.setAttribute('data-amount', amount);
    path.setAttribute('data-bot', botName);
    path.setAttribute('data-from-x', fromPos.x);
    path.setAttribute('data-from-y', fromPos.y);
    path.setAttribute('data-to-x', toPos.x);
    path.setAttribute('data-to-y', toPos.y);
    path.style.pointerEvents = 'auto';
    path.style.cursor = 'pointer';
    
    // Add click handler for wallet popup
    path.addEventListener('click', (e) => {
        showWalletPopup(toPos.x, toPos.y, amount, botName);
        e.stopPropagation();
    });
    
    svg.appendChild(path);
    container.appendChild(svg);
    
    // Animate the path drawing
    gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.out',
        onComplete: () => {
            // Create burst at destination
            createCommissionBurst(toPos.x, toPos.y);
            
            // Animate particles along the path
            animateParticlesAlongPath(path, 5);
            
            // Fade out path after a while
            gsap.to(path, {
                opacity: 0.3,
                duration: 5,
                delay: 3
            });
        }
    });
}

// Create and animate commission burst effect
function createCommissionBurst(x, y) {
    const burst = document.createElement('div');
    burst.className = 'commission-burst';
    document.body.appendChild(burst);
    
    gsap.set(burst, {
        left: x - 12,
        top: y - 12,
        scale: 0.5,
        opacity: 0
    });
    
    gsap.to(burst, {
        duration: 0.5,
        scale: 2,
        opacity: 0.8,
        ease: 'power2.out',
        onComplete: () => {
            gsap.to(burst, {
                duration: 0.5,
                scale: 3,
                opacity: 0,
                ease: 'power2.in',
                onComplete: () => {
                    document.body.removeChild(burst);
                }
            });
        }
    });
    
    // Log the commission event
    console.log(`Commission Landed - $${parseFloat(amount).toFixed(2)} In!`);
}

// Animate particles along the path
function animateParticlesAlongPath(path, count) {
    const pathLength = path.getTotalLength();
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'commission-particle';
        document.body.appendChild(particle);
        
        // Random delay for each particle
        const delay = i * 0.2 + Math.random() * 0.3;
        
        gsap.set(particle, { opacity: 0 });
        
        gsap.to(particle, {
            duration: 2,
            delay: delay,
            ease: 'none',
            motionPath: {
                path: path,
                align: path,
                alignOrigin: [0.5, 0.5]
            },
            opacity: 1,
            onStart: () => {
                gsap.to(particle, { opacity: 1, duration: 0.2 });
            },
            onComplete: () => {
                gsap.to(particle, {
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        document.body.removeChild(particle);
                    }
                });
            }
        });
    }
}

// Show wallet popup with transaction details
function showWalletPopup(x, y, amount, botName) {
    // Close any existing popup
    const existing = document.querySelector('.wallet-popup');
    if (existing) {
        document.body.removeChild(existing);
    }
    
    // Create wallet popup
    const popup = document.createElement('div');
    popup.className = 'wallet-popup';
    document.body.appendChild(popup);
    
    // Set position near the endpoint
    gsap.set(popup, {
        left: x + 20,
        top: y - 100,
        opacity: 0,
        transformOrigin: 'top left'
    });
    
    // Generate mock XRPL transactions
    const txCount = 3 + Math.floor(Math.random() * 3); // 3-5 transactions
    const transactions = [];
    
    for (let i = 0; i < txCount; i++) {
        const txType = i === 0 ? 'Commission Payment' : ['Payment', 'TrustSet', 'OfferCreate'][Math.floor(Math.random() * 3)];
        const txAmount = i === 0 ? amount : (Math.random() * 1000 + 100).toFixed(2);
        
        transactions.push({
            type: txType,
            amount: txAmount,
            from: i === 0 ? botName : `r${generateRandomHash(24)}`,
            to: `r${generateRandomHash(24)}`,
            time: new Date(Date.now() - i * 60000 * (Math.random() * 10 + 1)).toLocaleTimeString(),
            status: 'Validated',
            ledgerIndex: 8000000 + Math.floor(Math.random() * 10000)
        });
    }
    
    // Create popup content
    popup.innerHTML = `
        <div class="wallet-header">
            <div class="wallet-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10zm-10 6c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                </svg>
                Wallet Transactions
            </div>
            <div class="close-wallet">✕</div>
        </div>
        
        <div class="transaction-list">
            ${transactions.map(tx => `
                <div class="transaction-item">
                    <div class="transaction-row">
                        <span class="transaction-label">Type</span>
                        <span class="transaction-value">${tx.type}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="transaction-label">Amount</span>
                        <span class="transaction-value">$${tx.amount}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="transaction-label">Time</span>
                        <span class="transaction-value">${tx.time}</span>
                    </div>
                    <div class="transaction-row">
                        <span class="transaction-label">Status</span>
                        <span class="transaction-value">${tx.status}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="commission-timeline">
            <div class="transaction-label">24h Commission History</div>
            ${generateTimelineMarkers()}
        </div>
    `;
    
    // Add close button handler
    popup.querySelector('.close-wallet').addEventListener('click', () => {
        gsap.to(popup, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            onComplete: () => {
                document.body.removeChild(popup);
            }
        });
    });
    
    // Animate popup appearance
    gsap.to(popup, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.2)'
    });
    
    // Add click outside to close
    const closeOnClickOutside = (e) => {
        if (!popup.contains(e.target) && !e.target.classList.contains('commission-line')) {
            gsap.to(popup, {
                opacity: 0,
                y: 10,
                duration: 0.3,
                onComplete: () => {
                    document.body.removeChild(popup);
                    document.removeEventListener('click', closeOnClickOutside);
                }
            });
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeOnClickOutside);
    }, 100);
}

// Generate random hash for XRPL addresses
function generateRandomHash(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate timeline markers for commission history
function generateTimelineMarkers() {
    let markers = '';
    const markerCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < markerCount; i++) {
        const position = (i / markerCount) * 100;
        const amount = (Math.random() * 400 + 100).toFixed(0);
        markers += `
            <div class="timeline-marker" style="left: ${position}%"></div>
            <div class="timeline-label" style="left: ${position}%">$${amount}</div>
        `;
    }
    
    return markers;
}
