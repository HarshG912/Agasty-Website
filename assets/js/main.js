/**
 * Agasty Enterprises - Main Interactive Controller
 * Features: Background Particle Canvas, Motion Video Reels, Deflection Physics Simulator,
 * Project Estimator, Dynamic Spotlight, and Smooth UI Interactions.
 */

function initApp() {
    try { initParticleCanvas(); } catch (e) { console.warn('initParticleCanvas error:', e); }
    try { initDeflectionSimulator(); } catch (e) { console.warn('initDeflectionSimulator error:', e); }
    try { initProjectEstimator(); } catch (e) { console.warn('initProjectEstimator error:', e); }
    try { initSpotlight(); } catch (e) { console.warn('initSpotlight error:', e); }
    try { initMobileNav(); } catch (e) { console.warn('initMobileNav error:', e); }
    try { initFaqAccordion(); } catch (e) { console.warn('initFaqAccordion error:', e); }
    try { initStatsCounter(); } catch (e) { console.warn('initStatsCounter error:', e); }
    try { initEmbeddedFormModal(); } catch (e) { console.warn('initEmbeddedFormModal error:', e); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/* ----------------------------------------------------
   1. Interactive Neural Starfield / Particle Background
   ---------------------------------------------------- */
function initParticleCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = window.innerWidth < 768 ? 40 : 85;
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.6 + 0.8;
            this.baseAlpha = Math.random() * 0.4 + 0.2;
            this.color = Math.random() > 0.6 ? '#60a5fa' : (Math.random() > 0.5 ? '#a855f7' : '#38bdf8');
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Mouse proximity influence
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x -= (dx / dist) * force * 1.5;
                this.y -= (dy / dist) * force * 1.5;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.baseAlpha;
            ctx.fill();
        }
    }

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = '#3b82f6';
                    ctx.globalAlpha = (1 - dist / 100) * 0.12;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ----------------------------------------------------
   2. Interactive Deflection Physics Simulator (Deflection App Demo)
   ---------------------------------------------------- */
function initDeflectionSimulator() {
    const canvas = document.getElementById('beamCanvas');
    const loadSlider = document.getElementById('loadSlider');
    const spanSlider = document.getElementById('spanSlider');
    const liveDeflectionValue = document.getElementById('liveDeflectionValue');
    const liveFrequencyValue = document.getElementById('liveFrequencyValue');
    const liveGyroValue = document.getElementById('liveGyroValue');
    const liveStressValue = document.getElementById('liveStressValue');

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let load = loadSlider ? parseFloat(loadSlider.value) : 15; // kN
    let span = spanSlider ? parseFloat(spanSlider.value) : 12; // meters
    let time = 0;
    let mouseHover = false;
    let hoverX = 0;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        hoverX = e.clientX - rect.left;
        mouseHover = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseHover = false;
    });

    if (loadSlider) {
        loadSlider.addEventListener('input', (e) => {
            load = parseFloat(e.target.value);
            document.getElementById('loadDisplay').textContent = `${load} kN`;
        });
    }

    if (spanSlider) {
        spanSlider.addEventListener('input', (e) => {
            span = parseFloat(e.target.value);
            document.getElementById('spanDisplay').textContent = `${span} m`;
        });
    }

    function render() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        time += 0.04;

        // Cantilever / Simple Support Beam Simulation
        const startX = 60;
        const endX = w - 60;
        const beamY = h / 2 - 10;
        const beamLength = endX - startX;

        // Calculate maximum physical deflection: y = (P * L^3) / (48 * E * I)
        // Scaled visually for UI engagement
        const baseDeflection = (load * Math.pow(span, 1.4)) * 0.06;
        const vibration = Math.sin(time * 3.5) * (load * 0.12);
        const currentDeflectionMM = (baseDeflection * 0.35 + Math.abs(vibration) * 0.05).toFixed(2);
        const naturalFreqHZ = (28.4 / Math.sqrt(Math.max(span, 1))).toFixed(1);
        const simulatedGyro = (Math.sin(time * 4) * 0.042 * (load / 10)).toFixed(4);
        const simulatedStress = ((load * span * 2.8) / 10).toFixed(1);

        // Update live metrics on dashboard
        if (liveDeflectionValue) liveDeflectionValue.textContent = `${currentDeflectionMM} mm`;
        if (liveFrequencyValue) liveFrequencyValue.textContent = `${naturalFreqHZ} Hz`;
        if (liveGyroValue) liveGyroValue.textContent = `±${simulatedGyro}°/s`;
        if (liveStressValue) liveStressValue.textContent = `${simulatedStress} MPa`;

        // Draw Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw Supports
        // Left Pin Support (Triangle)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(startX, beamY + 12);
        ctx.lineTo(startX - 14, beamY + 36);
        ctx.lineTo(startX + 14, beamY + 36);
        ctx.closePath();
        ctx.fill();

        // Right Roller Support (Circles)
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(endX - 7, beamY + 24, 7, 0, Math.PI * 2);
        ctx.arc(endX + 7, beamY + 24, 7, 0, Math.PI * 2);
        ctx.fill();

        // Neutral Baseline (Dashed)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, beamY + 6);
        ctx.lineTo(endX, beamY + 6);
        ctx.stroke();
        ctx.setLineDash([]);

        // Deflected Beam Curve
        ctx.beginPath();
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';

        // Gradient for beam indicating strain
        const beamGradient = ctx.createLinearGradient(startX, beamY, endX, beamY);
        beamGradient.addColorStop(0, '#3b82f6');
        beamGradient.addColorStop(0.5, '#ec4899');
        beamGradient.addColorStop(1, '#8b5cf6');
        ctx.strokeStyle = beamGradient;

        const points = [];
        const segments = 40;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + t * beamLength;
            // Elastic deflection curve for simply supported beam: y(x) = (P*x / 48EI) * (3L^2 - 4x^2)
            const curve = 4 * t * (1 - t);
            const dynamicDrop = (baseDeflection + vibration) * curve;
            const y = beamY + dynamicDrop;
            points.push({ x, y });
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Load Indicator Arrow at Center (or mouse if hovering)
        const loadPointT = mouseHover && hoverX >= startX && hoverX <= endX ? (hoverX - startX) / beamLength : 0.5;
        const loadPointX = startX + loadPointT * beamLength;
        const loadPointY = beamY + (baseDeflection + vibration) * (4 * loadPointT * (1 - loadPointT));

        // Pulsing load arrow
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;

        // Arrow line
        ctx.beginPath();
        ctx.moveTo(loadPointX, loadPointY - 45);
        ctx.lineTo(loadPointX, loadPointY - 4);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(loadPointX - 8, loadPointY - 14);
        ctx.lineTo(loadPointX, loadPointY);
        ctx.lineTo(loadPointX + 8, loadPointY - 14);
        ctx.closePath();
        ctx.fill();

        // Sensor Tag at max deflection
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(loadPointX, loadPointY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText(`SENSOR_01: -${currentDeflectionMM}mm`, loadPointX - 45, loadPointY + 28);

        requestAnimationFrame(render);
    }

    render();
}

/* ----------------------------------------------------
   4. Interactive Project Scope & Timeline Estimator
   ---------------------------------------------------- */
function initProjectEstimator() {
    const options = document.querySelectorAll('.estimator-option');
    const estimatedTimeEl = document.getElementById('estimatedTime');
    const estimatedTierEl = document.getElementById('estimatedTier');
    const estimatedDeliverablesEl = document.getElementById('estimatedDeliverables');
    const inquiryButton = document.getElementById('estimatorCta');

    if (!options.length) return;

    let selectedFeatures = new Set(['ai-agent', 'mobile']);

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const val = opt.getAttribute('data-value');
            if (selectedFeatures.has(val)) {
                if (selectedFeatures.size > 1) { // keep at least 1
                    selectedFeatures.delete(val);
                    opt.classList.remove('border-blue-500', 'bg-blue-600/20', 'text-white');
                    opt.classList.add('border-slate-800', 'bg-slate-900/50', 'text-slate-400');
                }
            } else {
                selectedFeatures.add(val);
                opt.classList.add('border-blue-500', 'bg-blue-600/20', 'text-white');
                opt.classList.remove('border-slate-800', 'bg-slate-900/50', 'text-slate-400');
            }
            updateEstimates();
        });
    });

    function updateEstimates() {
        const count = selectedFeatures.size;
        let weeks = '2 - 3 Weeks';
        let tier = 'High Velocity MVP';
        let deliverables = ['Clean Architecture Core', 'CI/CD Automated Pipeline', 'Cloud Deployment'];

        if (count >= 4) {
            weeks = '6 - 10 Weeks';
            tier = 'Enterprise Production Suite';
            deliverables = ['Distributed Edge Architecture', 'Custom AI Agent Mesh', 'Multi-Platform Sync', 'SLA & 24/7 Monitoring'];
        } else if (count >= 2) {
            weeks = '3 - 5 Weeks';
            tier = 'Advanced Growth Solution';
            deliverables = ['Production Sensor Fusion / Backend', 'AI Workflow Integration', 'Telemetry Dashboard'];
        }

        if (estimatedTimeEl) estimatedTimeEl.textContent = weeks;
        if (estimatedTierEl) estimatedTierEl.textContent = tier;
        if (estimatedDeliverablesEl) {
            estimatedDeliverablesEl.innerHTML = deliverables
                .map(d => `<li class="flex items-center gap-2"><i class="fas fa-check-circle text-blue-400 text-xs"></i> <span>${d}</span></li>`)
                .join('');
        }

        if (inquiryButton) {
            const selectedList = Array.from(selectedFeatures).join('+');
            const targetUrl = `https://n8n.agasty.cloud/form/0cb7287e-cd6f-48e4-9029-9852894f781b?tier=${encodeURIComponent(tier)}&features=${encodeURIComponent(selectedList)}`;
            inquiryButton.setAttribute('data-form-url', targetUrl);
        }
    }

    updateEstimates();
}

/* ----------------------------------------------------
   5. Dynamic Spotlight Tracking on Cards
   ---------------------------------------------------- */
function initSpotlight() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ----------------------------------------------------
   6. Mobile Navigation Drawer
   ---------------------------------------------------- */
function initMobileNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeBtn = document.getElementById('mobileCloseBtn');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!menuBtn || !drawer) return;

    function openDrawer() {
        drawer.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDrawer();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });
    }

    links.forEach(l => {
        l.addEventListener('click', (e) => {
            const href = l.getAttribute('href');
            closeDrawer();
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                }
            }
        });
    });

    drawer.addEventListener('click', (e) => {
        if (e.target === drawer) {
            closeDrawer();
        }
    });
}

/* ----------------------------------------------------
   7. FAQ Accordion
   ---------------------------------------------------- */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-question');
        const content = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');

        if (!header || !content) return;

        header.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = !content.classList.contains('hidden') && content.style.display !== 'none';
            // Close all
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.add('hidden');
                ans.style.display = 'none';
            });
            document.querySelectorAll('.faq-icon').forEach(ic => ic.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                content.classList.remove('hidden');
                content.style.display = 'block';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

/* ----------------------------------------------------
   8. Stats Counter on Scroll
   ---------------------------------------------------- */
function initStatsCounter() {
    const counters = document.querySelectorAll('.counter-val');
    if (!counters.length) return;

    let started = false;

    function startCounting() {
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const suffix = counter.getAttribute('data-suffix') || '';
            const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
            const duration = 1800;
            const startTime = performance.now();

            function updateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = (ease * target).toFixed(decimals);
                counter.textContent = `${current}${suffix}`;
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            }
            requestAnimationFrame(updateNumber);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                startCounting();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);
}

/* ----------------------------------------------------
   9. Embedded Form Modal Controller
   ---------------------------------------------------- */
function initEmbeddedFormModal() {
    const modal = document.getElementById('formModal');
    const iframe = document.getElementById('modalFormIframe');
    const closeBtn = document.getElementById('formModalClose');
    const defaultUrl = 'https://n8n.agasty.cloud/form/0cb7287e-cd6f-48e4-9029-9852894f781b';

    if (!modal || !iframe) return;

    function openModal(customUrl) {
        // Close mobile drawer if open
        const drawer = document.getElementById('mobileNavDrawer');
        if (drawer) {
            drawer.classList.add('translate-x-full');
        }

        const urlToLoad = customUrl || defaultUrl;
        if (!iframe.src || iframe.src === 'about:blank' || (customUrl && iframe.src !== urlToLoad)) {
            iframe.src = urlToLoad;
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.style.cssText = 'display: flex !important; position: fixed !important; inset: 0 !important; z-index: 99999 !important;';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.style.cssText = 'display: none !important;';
        document.body.style.overflow = '';
    }

    // Expose globally so inline onclick or other scripts can call them directly
    window.openConsultationModal = function(e, customUrl) {
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        }
        openModal(customUrl);
    };

    window.closeConsultationModal = function(e) {
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        }
        closeModal();
    };

    // Global document-level click delegation for .open-form-btn
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-form-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const customUrl = btn.getAttribute('data-form-url');
            openModal(customUrl);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}
