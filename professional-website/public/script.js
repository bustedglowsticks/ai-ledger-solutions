// Professional Website JavaScript
class ProfessionalWebsite {
    constructor() {
        this.subscriptionTiers = {};
        this.performanceData = {};
        this.init();
    }

    async init() {
        await this.loadSubscriptionTiers();
        await this.loadPerformanceData();
        this.setupEventListeners();
        this.setupAnimations();
        this.startPerformanceUpdates();
    }

    async loadSubscriptionTiers() {
        try {
            const response = await fetch('/api/subscription-tiers');
            this.subscriptionTiers = await response.json();
            this.renderPricingCards();
        } catch (error) {
            console.error('Error loading subscription tiers:', error);
            this.renderPricingCards(); // Fallback to static data
        }
    }

    async loadPerformanceData() {
        try {
            const response = await fetch('/api/performance');
            this.performanceData = await response.json();
            this.updatePerformanceDisplay();
        } catch (error) {
            console.error('Error loading performance data:', error);
        }
    }

    renderPricingCards() {
        const pricingGrid = document.getElementById('pricingGrid');
        if (!pricingGrid) return;

        const tiers = this.subscriptionTiers;
        const tierOrder = ['starter', 'professional', 'institutional', 'enterprise'];

        pricingGrid.innerHTML = tierOrder.map(tierKey => {
            const tier = tiers[tierKey];
            if (!tier) return '';

            const isFeatured = tierKey === 'institutional';
            const priceDisplay = tier.price === 'Custom' ? 'Custom' : `$${tier.price}`;
            const periodDisplay = tier.period === 'custom' ? '' : `/${tier.period}`;

            return `
                <div class="pricing-card ${isFeatured ? 'featured' : ''}">
                    <div class="pricing-header">
                        <div class="pricing-name">${tier.name}</div>
                        <div class="pricing-price">${priceDisplay}</div>
                        <div class="pricing-period">${periodDisplay}</div>
                    </div>
                    <ul class="pricing-features">
                        ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <button class="pricing-button" onclick="website.handleSubscription('${tierKey}')">
                        Get Started
                    </button>
                </div>
            `;
        }).join('');
    }

    updatePerformanceDisplay() {
        const currentAPY = document.getElementById('currentAPY');
        const totalYield = document.getElementById('totalYield');
        const winRate = document.getElementById('winRate');

        if (currentAPY && this.performanceData.currentAPY) {
            currentAPY.textContent = `${this.performanceData.currentAPY.toFixed(1)}%`;
        }

        if (totalYield && this.performanceData.totalYield) {
            totalYield.textContent = `${this.performanceData.totalYield.toFixed(1)} XRP`;
        }

        if (winRate && this.performanceData.winRate) {
            winRate.textContent = `${this.performanceData.winRate.toFixed(1)}%`;
        }
    }

    setupEventListeners() {
        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.solution-card, .pricing-card, .performance-card, .tech-item').forEach(el => {
            observer.observe(el);
        });
    }

    startPerformanceUpdates() {
        // Update performance data every 30 seconds
        setInterval(async () => {
            await this.loadPerformanceData();
        }, 30000);
    }

    async handleSubscription(tier) {
        try {
            // Show subscription modal or redirect to contact form
            const tierName = this.subscriptionTiers[tier]?.name || tier;
            
            // Scroll to contact form and pre-select tier
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Pre-select the tier in the contact form
                const tierSelect = document.getElementById('tier');
                if (tierSelect) {
                    tierSelect.value = tier;
                }
            }

            // Show success message
            this.showNotification(`Subscription request for ${tierName} tier initiated. Please fill out the contact form below.`, 'success');
        } catch (error) {
            console.error('Error handling subscription:', error);
            this.showNotification('Error processing subscription request. Please try again.', 'error');
        }
    }

    async handleContactForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            tier: formData.get('tier'),
            message: formData.get('message')
        };

        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                event.target.reset();
            } else {
                this.showNotification('Error sending message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Error sending message. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00c851' : type === 'error' ? '#ff4444' : '#0066cc'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Performance chart functionality
    createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Sample performance data
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'APY Performance',
                data: [280, 320, 350, 340, 360, 350.5],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(0, 102, 204, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 102, 204, 0.0)');

        data.datasets[0].backgroundColor = gradient;

        // Chart configuration
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 250,
                        max: 400,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: '#666666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666666'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        };

        // Create chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, config);
        } else {
            // Fallback: simple canvas drawing
            this.drawSimpleChart(ctx, data);
        }
    }

    drawSimpleChart(ctx, data) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate scales
        const values = data.datasets[0].data;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        const xScale = (width - 2 * padding) / (values.length - 1);
        const yScale = (height - 2 * padding) / range;

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 3;

        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (value - min) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (value - min) * yScale;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#0066cc';
            ctx.fill();
        });
    }
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.website = new ProfessionalWebsite();
    
    // Create performance chart after a short delay
    setTimeout(() => {
        window.website.createPerformanceChart();
    }, 1000);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }

        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style); 