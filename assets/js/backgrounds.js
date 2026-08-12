/* ============================================================
   ASIAN TIER LIST — ANIMATED BACKGROUNDS
   ============================================================ */

(function() {
    'use strict';
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Add a static background instead
        const style = document.createElement('style');
        style.textContent = `
            body::before {
                content: '';
                position: fixed;
                inset: 0;
                z-index: -1;
                background: radial-gradient(ellipse at center, var(--color-background-secondary), var(--color-background));
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        return;
    }
    
    // Get current page name from URL
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    // Background configurations per page
    const configs = {
        'index.html': {
            type: 'energy',
            colors: ['#e63946', '#457b9d', '#1d3557'],
            particles: 80,
            hexGrid: true
        },
        'rules.html': {
            type: 'tech-grid',
            colors: ['#457b9d', '#1d3557'],
            particles: 40,
            scanLines: true
        },
        'announcements.html': {
            type: 'particles',
            colors: ['#e63946', '#457b9d', '#f1faee'],
            particles: 60,
            float: true
        },
        'staff.html': {
            type: 'spotlight',
            colors: ['#e63946', '#ffd700', '#457b9d'],
            particles: 50,
            glow: true
        },
        'testers.html': {
            type: 'arena',
            colors: ['#457b9d', '#e63946'],
            particles: 55,
            pulse: true
        },
        'leaderboards.html': {
            type: 'data-grid',
            colors: ['#457b9d', '#e63946'],
            particles: 45,
            grid: true
        },
        'stats.html': {
            type: 'data-grid',
            colors: ['#e63946', '#457b9d', '#4ecdc4'],
            particles: 50,
            grid: true,
            pulse: true
        },
        'compare.html': {
            type: 'split-energy',
            colors: ['#457b9d', '#e63946'],
            particles: 60,
            split: true
        },
        'profile.html': {
            type: 'ambient-glow',
            colors: ['#457b9d', '#e63946'],
            particles: 40,
            glow: true
        },
        'reviews.html': {
            type: 'soft-community',
            colors: ['#e63946', '#457b9d', '#f1faee'],
            particles: 45,
            soft: true
        },
        'staff-applications.html': {
            type: 'professional',
            colors: ['#457b9d', '#1d3557'],
            particles: 35,
            clean: true
        },
        'tester-panel.html': {
            type: 'console',
            colors: ['#e63946', '#457b9d'],
            particles: 40,
            scanLines: true
        },
        'owner-panel.html': {
            type: 'command-center',
            colors: ['#e63946', '#1d3557'],
            particles: 30,
            grid: true,
            dark: true
        },
        'support.html': {
            type: 'particles',
            colors: ['#457b9d', '#e63946'],
            particles: 40,
            float: true
        }
    };
    
    // Default config if page not found
    const config = configs[page] || configs['index.html'];
    
    // --- Setup Canvas ---
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;
        pointer-events: none;
    `;
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let W, H;
    
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    // --- Particles ---
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            this.phase = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.phase += 0.01;
            
            if (config.float || config.soft) {
                this.y += Math.sin(this.phase) * 0.1;
                this.x += Math.cos(this.phase * 0.7) * 0.05;
            }
            
            if (this.x < 0) this.x = W;
            if (this.x > W) this.x = 0;
            if (this.y < 0) this.y = H;
            if (this.y > H) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // --- Create Particles ---
    const particles = [];
    const numParticles = config.particles || 50;
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    
    // --- Hex Grid ---
    function drawHexGrid() {
        if (!config.hexGrid && !config.grid) return;
        
        const hexSize = 60;
        const hexHeight = hexSize * Math.sqrt(3);
        const width = W + hexSize * 2;
        const height = H + hexHeight * 2;
        
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = config.colors[0] || '#457b9d';
        ctx.lineWidth = 1;
        
        for (let y = -hexHeight; y < height; y += hexHeight * 0.75) {
            for (let x = -hexSize; x < width; x += hexSize * 1.5) {
                const offsetX = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0 : hexSize * 0.75;
                const cx = x + offsetX;
                const cy = y;
                
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i - Math.PI / 6;
                    const px = cx + hexSize * Math.cos(angle);
                    const py = cy + hexSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }
    
    // --- Scan Lines ---
    function drawScanLines() {
        if (!config.scanLines) return;
        
        const now = Date.now() / 3000;
        const progress = (now % 10) / 10;
        const y = progress * H;
        
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = config.colors[0] || '#457b9d';
        ctx.fillRect(0, y - 1, W, 2);
        ctx.globalAlpha = 0.02;
        for (let i = 0; i < H; i += 3) {
            if (i % 6 === 0) {
                ctx.fillStyle = config.colors[0] || '#457b9d';
                ctx.fillRect(0, i, W, 0.5);
            }
        }
        ctx.globalAlpha = 1;
    }
    
    // --- Split Energy ---
    function drawSplitEnergy() {
        if (!config.split) return;
        
        const gradient = ctx.createLinearGradient(0, 0, W, 0);
        gradient.addColorStop(0, 'rgba(69, 123, 157, 0.05)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(230, 57, 70, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 20]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
    
    // --- Glow Effects ---
    function drawGlow() {
        if (!config.glow && !config.ambient) return;
        
        const time = Date.now() / 5000;
        const x = W / 2 + Math.sin(time) * W * 0.2;
        const y = H / 2 + Math.cos(time * 0.7) * H * 0.15;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.5);
        gradient.addColorStop(0, config.colors[0] + '15');
        gradient.addColorStop(0.5, config.colors[1] + '08');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
    }
    
    // --- Pulse Animation ---
    let pulsePhase = 0;
    function drawPulse() {
        if (!config.pulse) return;
        
        pulsePhase += 0.005;
        const alpha = 0.02 + Math.sin(pulsePhase) * 0.015;
        
        const gradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.4);
        gradient.addColorStop(0, config.colors[0] + Math.round(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
    }
    
    // --- Main Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, W, H);
        
        // Draw background based on type
        switch (config.type) {
            case 'energy':
                drawGlow();
                drawHexGrid();
                drawPulse();
                break;
            case 'tech-grid':
                drawHexGrid();
                drawScanLines();
                break;
            case 'particles':
                break;
            case 'spotlight':
                drawGlow();
                break;
            case 'arena':
                drawPulse();
                break;
            case 'data-grid':
                drawHexGrid();
                drawPulse();
                break;
            case 'split-energy':
                drawSplitEnergy();
                drawPulse();
                break;
            case 'ambient-glow':
                drawGlow();
                break;
            case 'soft-community':
                drawGlow();
                break;
            case 'professional':
                drawHexGrid();
                break;
            case 'console':
                drawScanLines();
                drawPulse();
                break;
            case 'command-center':
                drawHexGrid();
                drawScanLines();
                break;
            default:
                break;
        }
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connections
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = config.colors[0] || '#457b9d';
                    ctx.lineWidth = 0.5;
                    ctx.globalAlpha = 0.05 * (1 - dist / 150);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        resize();
        // Reset particles on resize
        particles.forEach(p => p.reset());
    });
})();
