/**
 * Kong Vungsovanreach Portfolio v2
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    navbar: document.getElementById('navbar'),
    navMenu: document.getElementById('nav-menu'),
    navToggle: document.getElementById('nav-toggle'),
    navClose: document.getElementById('nav-close'),
    navLinks: document.querySelectorAll('.nav-link'),
    themeToggle: document.getElementById('theme-toggle'),
    scrollTop: document.getElementById('scroll-top'),
    typingText: document.getElementById('typing-text'),
    particles: document.getElementById('particles'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('[data-tab-content]'),
    animatedElements: document.querySelectorAll('.animate-on-scroll'),
    statNumbers: document.querySelectorAll('.stat-number'),
    cursor: document.querySelector('.cursor'),
    cursorFollower: document.querySelector('.cursor-follower')
  };

  // ==================== Configuration ====================
  const config = {
    typingStrings: [
      'AI Researcher',
      'Software Engineer'
    ],
    typingSpeed: 80,
    typingDelay: 2000,
    particleCount: 15 // Reduced for better performance
  };

  // ==================== Theme Management ====================
  const ThemeManager = {
    init() {
      const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      this.setTheme(savedTheme);

      elements.themeToggle.addEventListener('click', () => this.toggle());

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },

    toggle() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    }
  };

  // ==================== Navigation ====================
  const Navigation = {
    init() {
      // Mobile menu toggle
      elements.navToggle?.addEventListener('click', () => this.openMenu());
      elements.navClose?.addEventListener('click', () => this.closeMenu());

      // Close menu on link click
      elements.navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (elements.navMenu.classList.contains('active') &&
            !elements.navMenu.contains(e.target) &&
            !elements.navToggle.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Navbar scroll effect
      window.addEventListener('scroll', () => this.handleScroll());

      // Active link on scroll
      window.addEventListener('scroll', () => this.updateActiveLink());
    },

    openMenu() {
      elements.navMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.createOverlay();
    },

    closeMenu() {
      elements.navMenu.classList.remove('active');
      document.body.style.overflow = '';
      this.removeOverlay();
    },

    createOverlay() {
      // Remove any existing overlay first to prevent duplicates
      const existingOverlay = document.querySelector('.nav-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }

      const overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      // Use both click and touchend for better mobile support
      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMenu();
      };

      overlay.addEventListener('click', closeHandler);
      overlay.addEventListener('touchend', closeHandler, { passive: false });

      document.body.appendChild(overlay);

      // Force reflow before adding active class for transition to work
      overlay.offsetHeight;
      overlay.classList.add('active');
    },

    removeOverlay() {
      const overlay = document.querySelector('.nav-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        // Remove after transition completes
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.remove();
          }
        }, 300);
      }
    },

    handleScroll() {
      if (window.scrollY > 50) {
        elements.navbar.classList.add('scrolled');
      } else {
        elements.navbar.classList.remove('scrolled');
      }
    },

    updateActiveLink() {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }
  };

  // ==================== Typing Animation ====================
  const TypingAnimation = {
    currentIndex: 0,
    currentChar: 0,
    isDeleting: false,
    timeout: null,

    init() {
      if (!elements.typingText) return;
      this.type();
    },

    type() {
      const currentString = config.typingStrings[this.currentIndex];

      if (this.isDeleting) {
        elements.typingText.textContent = currentString.substring(0, this.currentChar - 1);
        this.currentChar--;
      } else {
        elements.typingText.textContent = currentString.substring(0, this.currentChar + 1);
        this.currentChar++;
      }

      let typeSpeed = config.typingSpeed;

      if (this.isDeleting) {
        typeSpeed /= 2;
      }

      if (!this.isDeleting && this.currentChar === currentString.length) {
        typeSpeed = config.typingDelay;
        this.isDeleting = true;
      } else if (this.isDeleting && this.currentChar === 0) {
        this.isDeleting = false;
        this.currentIndex = (this.currentIndex + 1) % config.typingStrings.length;
        typeSpeed = 500;
      }

      this.timeout = setTimeout(() => this.type(), typeSpeed);
    }
  };

  // ==================== Particle Animation ====================
  const ParticleAnimation = {
    init() {
      if (!elements.particles) return;
      this.createParticles();
    },

    createParticles() {
      for (let i = 0; i < config.particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.animationDuration = `${4 + Math.random() * 4}s`;
        elements.particles.appendChild(particle);
      }
    }
  };

  // ==================== Tab System ====================
  const TabSystem = {
    init() {
      elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => this.switchTab(btn));
      });
    },

    switchTab(clickedBtn) {
      const targetTab = clickedBtn.getAttribute('data-tab');

      // Update buttons
      elements.tabBtns.forEach(btn => btn.classList.remove('active'));
      clickedBtn.classList.add('active');

      // Update content
      elements.tabContents.forEach(content => {
        content.classList.add('hidden');
        if (content.id === targetTab) {
          content.classList.remove('hidden');
          // Re-trigger animations for visible items
          content.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 100);
          });
        }
      });
    }
  };

  // ==================== Scroll Animations ====================
  const ScrollAnimations = {
    observer: null,
    animatedStats: new Set(), // Track animated stats to prevent re-animation

    init() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');

              // Animate numbers if it's a stat (only once)
              if (entry.target.querySelector('.stat-number') && !this.animatedStats.has(entry.target)) {
                this.animatedStats.add(entry.target);
                this.animateNumbers(entry.target);
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      elements.animatedElements.forEach(el => this.observer.observe(el));
    },

    animateNumbers(container) {
      const numbers = container.querySelectorAll('.stat-number');
      numbers.forEach(num => {
        // Skip if already animated
        if (num.dataset.animated) return;
        num.dataset.animated = 'true';

        const target = parseInt(num.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateNumber = () => {
          current += step;
          if (current < target) {
            num.textContent = Math.floor(current);
            requestAnimationFrame(updateNumber);
          } else {
            num.textContent = target;
          }
        };

        updateNumber();
      });
    }
  };

  // ==================== Scroll to Top ====================
  const ScrollToTop = {
    init() {
      window.addEventListener('scroll', () => this.toggleVisibility());
      elements.scrollTop?.addEventListener('click', () => this.scrollToTop());
    },

    toggleVisibility() {
      if (window.scrollY > 500) {
        elements.scrollTop?.classList.add('visible');
      } else {
        elements.scrollTop?.classList.remove('visible');
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ==================== Custom Cursor ====================
  const CustomCursor = {
    init() {
      if (!elements.cursor || !elements.cursorFollower) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      document.addEventListener('mousemove', (e) => this.moveCursor(e));

      // Add hover effect to interactive elements
      const interactiveElements = document.querySelectorAll('a, button, .btn, .social-link, .skill-tag');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => elements.cursorFollower.classList.add('hovering'));
        el.addEventListener('mouseleave', () => elements.cursorFollower.classList.remove('hovering'));
      });
    },

    moveCursor(e) {
      elements.cursor.style.left = `${e.clientX}px`;
      elements.cursor.style.top = `${e.clientY}px`;

      // Follower with slight delay
      setTimeout(() => {
        elements.cursorFollower.style.left = `${e.clientX}px`;
        elements.cursorFollower.style.top = `${e.clientY}px`;
      }, 50);
    }
  };

  // ==================== Smooth Scroll ====================
  const SmoothScroll = {
    init() {
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
    }
  };

  // ==================== Parallax Effect ====================
  const ParallaxEffect = {
    init() {
      window.addEventListener('scroll', () => this.handleParallax());
    },

    handleParallax() {
      const scrolled = window.scrollY;
      const heroGradient = document.querySelector('.hero-gradient');

      if (heroGradient) {
        heroGradient.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }
  };

  // ==================== Button Ripple Effect ====================
  const ButtonRipple = {
    init() {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.createRipple(e, btn));
      });
    },

    createRipple(e, btn) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    }
  };

  // ==================== Magnetic Effect for Social Links ====================
  const MagneticEffect = {
    init() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      document.querySelectorAll('.social-link, .social-card').forEach(el => {
        el.addEventListener('mousemove', (e) => this.handleMove(e, el));
        el.addEventListener('mouseleave', (e) => this.handleLeave(e, el));
      });
    },

    handleMove(e, el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    },

    handleLeave(e, el) {
      el.style.transform = 'translate(0, 0)';
    }
  };

  // ==================== Tilt Effect for Cards ====================
  const TiltEffect = {
    init() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      document.querySelectorAll('.skill-category, .contact-card, .timeline-content').forEach(el => {
        el.addEventListener('mousemove', (e) => this.handleMove(e, el));
        el.addEventListener('mouseleave', (e) => this.handleLeave(e, el));
      });
    },

    handleMove(e, el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    },

    handleLeave(e, el) {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    }
  };

  // ==================== Year Update ====================
  const YearUpdate = {
    init() {
      const yearEl = document.getElementById('current-year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    }
  };

  // ==================== Reduced Motion Check ====================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==================== Initialize ====================
  function init() {
    ThemeManager.init();
    Navigation.init();
    YearUpdate.init();

    // Only init animations if user doesn't prefer reduced motion
    if (!prefersReducedMotion) {
      TypingAnimation.init();
      ParticleAnimation.init();
      CustomCursor.init();
      ParallaxEffect.init();
      ButtonRipple.init();
      MagneticEffect.init();
      TiltEffect.init();
    } else {
      // Set static text if reduced motion
      if (elements.typingText) {
        elements.typingText.textContent = config.typingStrings[0];
      }
    }

    TabSystem.init();
    ScrollAnimations.init();
    ScrollToTop.init();
    SmoothScroll.init();

    // Remove loading state
    document.body.classList.add('loaded');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging (optional)
  window.Portfolio = {
    ThemeManager,
    Navigation,
    TypingAnimation
  };

})();
