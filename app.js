// Global state management
const state = {
    currentSection: 'hero',
    typingComplete: false,
    skillsAnimated: false,
    particles: []
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

// Particle system
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particles');
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        const particleCount = window.innerWidth < 768 ? 30 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            // Random animation duration
            const duration = 3 + Math.random() * 6;
            particle.style.animationDuration = duration + 's';
            
            // Random delay
            const delay = Math.random() * 5;
            particle.style.animationDelay = delay + 's';
            
            this.container.appendChild(particle);
            this.particles.push({
                element: particle,
                x: x,
                y: y,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5
            });
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around screen
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;

            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        requestAnimationFrame(() => this.animate());
    }

    resize() {
        // Remove existing particles
        this.particles.forEach(particle => {
            particle.element.remove();
        });
        this.particles = [];
        
        // Create new particles for new screen size
        this.createParticles();
    }
}

// Typing animation
class TypingAnimation {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
    }

    start() {
        return new Promise((resolve) => {
            this.element.textContent = '';
            this.typeNextCharacter(resolve);
        });
    }

    typeNextCharacter(callback) {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text[this.currentIndex];
            this.currentIndex++;
            setTimeout(() => this.typeNextCharacter(callback), this.speed);
        } else {
            callback();
        }
    }
}

// Navigation functionality
class Navigation {
    constructor() {
        this.nav = document.getElementById('nav');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section, .hero');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveSection();
    }

    bindEvents() {
        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Update active section on scroll
        window.addEventListener('scroll', throttle(() => {
            this.updateActiveSection();
        }, 100));

        // Mobile menu toggle (if needed)
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.navMenu.classList.toggle('active');
            });
        }
    }

    updateActiveSection() {
        const scrollPosition = window.scrollY + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                this.navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                state.currentSection = sectionId;
            }
        });
    }
}

// Skills animation
class SkillsAnimation {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.skillsSection = document.getElementById('skills');
        this.observer = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.skillsAnimated) {
                    this.animateSkills();
                    state.skillsAnimated = true;
                }
            });
        }, options);

        if (this.skillsSection) {
            this.observer.observe(this.skillsSection);
        }
    }

    animateSkills() {
        this.skillBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            
            setTimeout(() => {
                bar.style.width = width + '%';
            }, index * 100);
        });
    }
}

// Scroll effects
class ScrollEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupRevealAnimations();
    }

    setupParallax() {
        const hero = document.querySelector('.hero');
        
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        }, 16));
    }

    setupRevealAnimations() {
        const elementsToReveal = document.querySelectorAll('.project-card, .cert-card, .course-item, .achievement-card');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        elementsToReveal.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            revealObserver.observe(element);
        });
    }
}

// Form handling (if contact form is added later)
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        // Handle form submission
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        this.showMessage('Message sent successfully!', 'success');
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message--${type}`;
        messageEl.textContent = message;
        
        this.form.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Main application initialization
class App {
    constructor() {
        this.particleSystem = null;
        this.navigation = null;
        this.skillsAnimation = null;
        this.scrollEffects = null;
        this.contactForm = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize all components
        this.particleSystem = new ParticleSystem();
        this.navigation = new Navigation();
        this.skillsAnimation = new SkillsAnimation();
        this.scrollEffects = new ScrollEffects();
        this.contactForm = new ContactForm();
        
        // Start typing animations
        this.startTypingAnimations();
        
        // Setup resize handler
        this.setupResizeHandler();
        
        // Setup smooth scroll for all internal links
        this.setupSmoothScroll();
        
        console.log('Portfolio app initialized successfully!');
    }

    async startTypingAnimations() {
        const nameElement = document.getElementById('typingName');
        const titleElement = document.getElementById('typingTitle');
        
        if (nameElement && titleElement) {
            const nameAnimation = new TypingAnimation(nameElement, 'Rubén Alejandro Elizondo Rojas', 80);
            await nameAnimation.start();
            
            // Wait a moment before starting title
            setTimeout(async () => {
                const titleAnimation = new TypingAnimation(titleElement, 'Systems Engineer', 100);
                await titleAnimation.start();
                state.typingComplete = true;
            }, 500);
        }
    }

    setupResizeHandler() {
        const resizeHandler = debounce(() => {
            if (this.particleSystem) {
                this.particleSystem.resize();
            }
            
            // Update navigation on resize
            if (this.navigation) {
                this.navigation.updateActiveSection();
            }
        }, 250);

        window.addEventListener('resize', resizeHandler);
    }

    setupSmoothScroll() {
        // Smooth scroll for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Performance optimizations
const performanceOptimizations = {
    // Preload critical resources
    preloadResources() {
        const criticalLinks = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        ];
        
        criticalLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    },
    
    // Optimize images (if any are added later)
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    },
    
    // Enable GPU acceleration for animations
    enableGPUAcceleration() {
        const animatedElements = document.querySelectorAll('.tech-orbit, .particle, .skill-progress');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform';
            element.style.transform = 'translateZ(0)';
        });
    }
};

// Error handling
const errorHandler = {
    init() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError(e.reason);
        });
    },
    
    logError(error) {
        // In a real application, you might send this to a logging service
        const errorLog = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        console.log('Error logged:', errorLog);
    }
};

// Analytics (placeholder for future implementation)
const analytics = {
    init() {
        this.trackPageView();
        this.setupScrollTracking();
        this.setupInteractionTracking();
    },
    
    trackPageView() {
        console.log('Page view tracked:', window.location.href);
    },
    
    setupScrollTracking() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                console.log('Max scroll depth:', maxScroll + '%');
            }
        }, 1000));
    },
    
    setupInteractionTracking() {
        // Track button clicks
        document.querySelectorAll('.btn-primary, .btn-outline').forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('Button clicked:', e.target.textContent.trim());
            });
        });
        
        // Track navigation usage
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.getAttribute('data-section');
                console.log('Navigation clicked:', section);
            });
        });
        
        // Track project and certification card interactions
        document.querySelectorAll('.project-card, .cert-card, .achievement-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const cardTitle = e.target.querySelector('h3, h4')?.textContent;
                console.log('Card hovered:', cardTitle);
            });
        });
    }
};

// Accessibility enhancements
const accessibility = {
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close any open modals or menus
            if (e.key === 'Escape') {
                const openMenus = document.querySelectorAll('.nav-menu.active');
                openMenus.forEach(menu => menu.classList.remove('active'));
            }
            
            // Arrow key navigation for nav links
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('nav-link')) {
                    e.preventDefault();
                    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
                    const currentIndex = navLinks.indexOf(focusedElement);
                    let nextIndex;
                    
                    if (e.key === 'ArrowUp') {
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
                    } else {
                        nextIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
                    }
                    
                    navLinks[nextIndex].focus();
                }
            }
        });
    },
    
    setupFocusManagement() {
        // Ensure all interactive elements are focusable
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
        
        // Add focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },
    
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable animations for users who prefer reduced motion
            const animatedElements = document.querySelectorAll('[class*="animate"], .particle, .tech-orbit');
            animatedElements.forEach(element => {
                element.style.animation = 'none';
                element.style.transition = 'none';
            });
        }
    }
};

// Initialize application
function initializePortfolio() {
    // Initialize error handling first
    errorHandler.init();
    
    // Apply performance optimizations
    performanceOptimizations.preloadResources();
    performanceOptimizations.optimizeImages();
    performanceOptimizations.enableGPUAcceleration();
    
    // Initialize accessibility features
    accessibility.init();
    
    // Initialize analytics
    analytics.init();
    
    // Initialize main app
    new App();
    
    // Add loading complete class to body
    document.body.classList.add('loaded');
}

// Start the application
initializePortfolio();

// Export for potential external use
if (typeof window !== 'undefined') {
    window.PortfolioApp = {
        state,
        ParticleSystem,
        TypingAnimation,
        Navigation,
        SkillsAnimation,
        ScrollEffects,
        ContactForm,
        App
    };
}