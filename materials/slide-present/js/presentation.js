/**
 * Presentation Engine
 * Loads slides.json (or accepts inline data), renders slides using SlideRenderer,
 * and provides navigation, transitions, keyboard, touch, fullscreen, theme toggle.
 *
 * Requires: slide-renderer.js loaded before this file
 */
const Presentation = {
  data: null,
  slides: [],
  currentSlide: 1,
  totalSlides: 0,
  storageKey: 'presentation-current-slide',
  transition: 'fade',

  container: null,
  slidesContainer: null,
  progressBar: null,
  progressBarFill: null,

  touchStartX: 0,
  touchEndX: 0,
  swipeThreshold: 50,

  /**
   * Initialize from a data object or by fetching slides.json
   * @param {Object} [inlineData] — optional pre-loaded {meta, slides} object
   */
  async init(inlineData) {
    this.container = document.getElementById('presentation');
    this.slidesContainer = document.getElementById('slides-container');
    this.progressBar = document.getElementById('progress-bar');
    this.progressBarFill = document.getElementById('progress-bar-fill');

    this.container.classList.add('loading');

    try {
      if (inlineData) {
        this.data = inlineData;
      } else {
        await this.loadData();
      }

      this.data.slides = this.flattenSlides(this.data.slides);
      this.totalSlides = this.data.slides.length;

      this.transition = this.data.meta?.transition || 'fade';
      this.container.classList.add(`transition-${this.transition}`);

      this.applyThemeColor(this.data.meta?.themeColor);

      // Hide PDF button if disabled in meta
      if (this.data.meta?.allowPdfExport === false) {
        const pdfBtn = document.getElementById('generate-pdf');
        if (pdfBtn) pdfBtn.style.display = 'none';
      }

      this.renderSlides();
      this.bindEvents();
      this.updateNavButtons();
      this.updateProgressBar();

      document.querySelector('.total-slides').textContent = this.totalSlides;

      if (!inlineData) this.restoreSavedSlide();

      this.container.classList.remove('loading');
    } catch (error) {
      console.error('Failed to initialize presentation:', error);
      this.showError('Failed to load presentation data');
    }
  },

  async loadData() {
    const response = await fetch('slides.json');
    if (!response.ok) throw new Error('Failed to load slides.json');
    this.data = await response.json();
  },

  flattenSlides(slides) {
    const flattened = [];
    for (const slide of slides) {
      if (slide.type === 'section' && slide.slides && slide.slides.length > 0) {
        flattened.push({ type: 'section', number: slide.number, title: slide.title, subtitle: slide.subtitle });
        for (const nestedSlide of slide.slides) {
          flattened.push({ ...nestedSlide, section: slide.number });
        }
      } else {
        flattened.push(slide);
      }
    }
    return flattened;
  },

  renderSlides() {
    this.slidesContainer.innerHTML = '';
    SlideRenderer.resetCounters();
    this.data.slides.forEach((slide, index) => {
      const slideEl = document.createElement('div');
      slideEl.className = `slide${index === 0 ? ' active' : ''}`;
      slideEl.dataset.slide = index + 1;
      slideEl.innerHTML = SlideRenderer.renderSlide(slide);
      this.slidesContainer.appendChild(slideEl);
    });
    this.slides = document.querySelectorAll('.slide');
    if (typeof hljs !== 'undefined') {
      this.slidesContainer.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    }
  },

  showError(message) {
    this.container.classList.remove('loading');
    this.slidesContainer.innerHTML = `
      <div class="slide active">
        <div class="slide-content">
          <h2 class="slide-title">Error</h2>
          <p class="slide-text">${SlideRenderer.esc(message)}</p>
        </div>
      </div>`;
  },

  updateProgressBar() {
    if (!this.progressBarFill) return;
    const progress = (this.currentSlide / this.totalSlides) * 100;
    this.progressBarFill.style.width = `${progress}%`;
  },

  bindEvents() {
    document.getElementById('nav-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('nav-next')?.addEventListener('click', () => this.next());
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('generate-pdf')?.addEventListener('click', () => this.generatePDF());
    document.getElementById('sync-toggle')?.addEventListener('click', () => this.toggleSync());
    document.getElementById('laser-toggle')?.addEventListener('click', () => this.toggleLaser());
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('slide-present-session');
      // Navigate to base URL without query params
      window.location.href = window.location.pathname;
    });

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    if (this.slidesContainer) {
      this.slidesContainer.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      this.slidesContainer.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        const diff = this.touchStartX - this.touchEndX;
        if (Math.abs(diff) > this.swipeThreshold) {
          if (diff > 0) this.next(); else this.prev();
        }
      });
    }

    const jumpInput = document.getElementById('slide-jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const num = parseInt(jumpInput.value, 10);
          if (num >= 1 && num <= this.totalSlides) this.goToSlide(num);
          jumpInput.value = '';
          jumpInput.blur();
        }
      });
    }

    if (this.progressBar) {
      this.progressBar.addEventListener('click', (e) => {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const slideNum = Math.ceil(percentage * this.totalSlides);
        this.goToSlide(Math.max(1, Math.min(slideNum, this.totalSlides)));
      });
    }

    // TOC item click
    if (this.slidesContainer) {
      this.slidesContainer.addEventListener('click', (e) => {
        const tocItem = e.target.closest('[data-goto-slide]');
        if (tocItem) {
          const slideNum = parseInt(tocItem.dataset.gotoSlide, 10);
          if (slideNum >= 1 && slideNum <= this.totalSlides) this.goToSlide(slideNum);
        }
      });
    }

    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
  },

  goToSlide(n) {
    if (n < 1 || n > this.totalSlides) return;
    const previousSlide = this.currentSlide;
    const direction = n > previousSlide ? 'next' : 'prev';

    if (this.transition === 'slide') {
      this.slides.forEach(slide => slide.classList.remove('active', 'exit-left'));
      if (direction === 'next' && previousSlide !== n) {
        this.slides[previousSlide - 1]?.classList.add('exit-left');
      }
    } else {
      this.slides.forEach(slide => slide.classList.remove('active'));
    }

    this.slides[n - 1].classList.add('active');
    this.currentSlide = n;
    document.querySelector('.current-slide').textContent = n;
    this.updateNavButtons();
    this.updateProgressBar();
    this.saveCurrentSlide();
  },

  showSlideIndicator(n) {
    let el = document.getElementById('slide-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'slide-toast';
      el.className = 'slide-toast';
      this.container.appendChild(el);
    }
    el.textContent = `${n} / ${this.totalSlides}`;
    el.classList.remove('visible');
    void el.offsetWidth; // reflow
    el.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('visible'), 800);
  },

  saveCurrentSlide() {
    try { localStorage.setItem(this.storageKey, this.currentSlide.toString()); } catch (e) {}
  },

  restoreSavedSlide() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1 && num <= this.totalSlides) this.goToSlide(num);
      }
    } catch (e) {}
  },

  prev() { if (this.currentSlide > 1) this.goToSlide(this.currentSlide - 1); },
  next() { if (this.currentSlide < this.totalSlides) this.goToSlide(this.currentSlide + 1); },

  updateNavButtons() {
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    if (prevBtn) prevBtn.disabled = this.currentSlide === 1;
    if (nextBtn) nextBtn.disabled = this.currentSlide === this.totalSlides;
  },

  handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); this.prev(); break;
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); this.next(); break;
      case 'Home': e.preventDefault(); this.goToSlide(1); break;
      case 'End': e.preventDefault(); this.goToSlide(this.totalSlides); break;
      case 'f': case 'F': this.toggleFullscreen(); break;
      case 'l': case 'L': this.toggleLaser(); break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
    }
  },

  applyThemeColor(color) {
    if (!color) return;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const lighten = (c, f) => Math.min(255, Math.round(c + (255 - c) * f));
    const light = `rgb(${lighten(r, 0.3)}, ${lighten(g, 0.3)}, ${lighten(b, 0.3)})`;
    const secondary = `rgb(${lighten(r, 0.45)}, ${lighten(g, 0.45)}, ${lighten(b, 0.45)})`;
    const accent = `rgb(${lighten(r, 0.6)}, ${lighten(g, 0.6)}, ${lighten(b, 0.6)})`;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', color);
    root.style.setProperty('--color-primary-light', light);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-accent', accent);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('presentation-theme', newTheme);
  },

  toggleFullscreen() {
    const docEl = document.documentElement;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFullscreen) {
      if (docEl.requestFullscreen) docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  },

  // --- Laser Pointer ---
  _laserActive: false,
  _laserPoints: [],
  _laserRAF: null,
  _TRAIL_MS: 150,
  _TRAIL_MAX: 20,

  toggleLaser() {
    const btn = document.getElementById('laser-toggle');
    const svg = document.getElementById('laser-svg');
    if (!svg) return;

    this._laserActive = !this._laserActive;
    btn.classList.toggle('active', this._laserActive);

    if (this._laserActive) {
      svg.classList.add('active');
      document.body.classList.add('laser-active');
      this._laserPoints = [];

      this._laserLastPos = null;

      this._laserMoveHandler = (e) => {
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (x == null) return;
        this._laserLastPos = { x, y };
        this._laserPoints.push({ x, y, t: Date.now() });
        if (this._laserPoints.length > this._TRAIL_MAX) this._laserPoints.shift();
      };

      document.addEventListener('mousemove', this._laserMoveHandler);
      document.addEventListener('touchmove', this._laserMoveHandler, { passive: true });
      this._drawLaserLoop();
    } else {
      svg.classList.remove('active');
      document.body.classList.remove('laser-active');
      document.removeEventListener('mousemove', this._laserMoveHandler);
      document.removeEventListener('touchmove', this._laserMoveHandler);
      if (this._laserRAF) cancelAnimationFrame(this._laserRAF);
      this._laserPoints = [];
    }
  },

  _drawLaserLoop() {
    const now = Date.now();
    const trail = document.getElementById('laser-trail');
    const glow = document.getElementById('laser-dot-glow');
    const core = document.getElementById('laser-dot-core');

    // Expire old points
    this._laserPoints = this._laserPoints.filter(p => now - p.t < this._TRAIL_MS);

    // Draw trail from active points
    if (this._laserPoints.length > 1) {
      let d = `M${this._laserPoints[0].x},${this._laserPoints[0].y}`;
      for (let i = 1; i < this._laserPoints.length; i++) {
        const prev = this._laserPoints[i - 1];
        const curr = this._laserPoints[i];
        const mx = (prev.x + curr.x) / 2;
        const my = (prev.y + curr.y) / 2;
        d += ` Q${prev.x},${prev.y} ${mx},${my}`;
      }
      const last = this._laserPoints[this._laserPoints.length - 1];
      d += ` L${last.x},${last.y}`;
      trail.setAttribute('d', d);
    } else {
      trail.setAttribute('d', '');
    }

    // Dot always stays at last known mouse position
    const pos = this._laserLastPos;
    if (pos) {
      glow.setAttribute('cx', pos.x);
      glow.setAttribute('cy', pos.y);
      core.setAttribute('cx', pos.x);
      core.setAttribute('cy', pos.y);
      glow.style.opacity = '1';
      core.style.opacity = '1';
    }

    if (this._laserActive) {
      this._laserRAF = requestAnimationFrame(() => this._drawLaserLoop());
    }
  },

  // --- Live Sync ---
  _syncChannel: null,
  _syncActive: false,

  toggleSync() {
    const btn = document.getElementById('sync-toggle');
    const indicator = document.getElementById('sync-indicator');

    if (this._syncActive) {
      // Turn off
      this._syncActive = false;
      if (this._syncChannel) { this._syncChannel.close(); this._syncChannel = null; }
      btn.classList.remove('active');
      btn.title = 'Live sync with Slide Maker';
      indicator.classList.remove('visible');
    } else {
      // Turn on
      this._syncActive = true;
      btn.classList.add('active');
      btn.title = 'Live sync ON — click to disconnect';
      indicator.classList.add('visible');

      try {
        this._syncChannel = new BroadcastChannel('slide-maker-preview');
      } catch (e) {
        // BroadcastChannel not supported
        this._syncActive = false;
        btn.classList.remove('active');
        indicator.classList.remove('visible');
        return;
      }
      this._syncChannel.onmessage = (e) => {
        const msg = e.data;
        if (msg && msg.type === 'reload') {
          const raw = localStorage.getItem('slide-present-data');
          if (raw) {
            try {
              const data = JSON.parse(raw);
              this.data = data;
              this.data.slides = this.flattenSlides(data.slides);
              this.totalSlides = this.data.slides.length;
              this.applyThemeColor(data.meta?.themeColor);
              this.renderSlides();
              document.querySelector('.total-slides').textContent = this.totalSlides;
              const target = msg.slide || this.currentSlide;
              this.goToSlide(Math.min(target, this.totalSlides));
            } catch (err) {}
          }
        }
      };
    }
  },

  handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen) this.container.classList.add('is-fullscreen');
    else this.container.classList.remove('is-fullscreen');
  },

  /**
   * Generate and download presentation as PDF
   */
  async generatePDF() {
    const btn = document.getElementById('generate-pdf');
    if (!btn || btn.classList.contains('generating')) return;

    btn.classList.add('generating');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'pdf-overlay';
    overlay.innerHTML = `
      <div class="pdf-overlay-spinner"></div>
      <div class="pdf-overlay-text">Generating PDF...</div>
      <div class="pdf-overlay-progress">Slide 0 / ${this.totalSlides}</div>
    `;
    document.body.appendChild(overlay);
    const progressText = overlay.querySelector('.pdf-overlay-progress');

    try {
      const filename = `${this.data.meta?.title || 'presentation'}.pdf`;
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff';

      const { jsPDF } = window.jspdf;
      const pdfWidth = 1920;
      const pdfHeight = 1080;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
        hotfixes: ['px_scaling']
      });

      const currentSlideNum = this.currentSlide;

      // Create temporary container mimicking fullscreen
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'presentation is-fullscreen printing';
      pdfContainer.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: ${pdfWidth}px; height: ${pdfHeight}px;
        z-index: -9999; overflow: hidden;
        background-color: ${bgColor};
      `;

      const slidesContainer = document.createElement('div');
      slidesContainer.className = 'slides-container';
      slidesContainer.style.cssText = 'width:100%;height:100%;position:relative;';
      pdfContainer.appendChild(slidesContainer);
      document.body.appendChild(pdfContainer);

      this.container.classList.add('printing');

      for (let i = 0; i < this.slides.length; i++) {
        progressText.textContent = `Slide ${i + 1} / ${this.totalSlides}`;

        // Clone slide
        const slideClone = this.slides[i].cloneNode(true);
        slideClone.classList.add('active');
        slideClone.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;opacity:1;pointer-events:auto;';

        slidesContainer.innerHTML = '';
        slidesContainer.appendChild(slideClone);

        // Page number indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'pdf-page-indicator';
        pageIndicator.innerHTML = `<span class="current-slide">${i + 1}</span> / ${this.totalSlides}`;
        pageIndicator.style.cssText = `
          position:absolute;bottom:24px;right:32px;font-size:14px;font-weight:500;
          color:var(--color-text-muted);background-color:var(--color-bg-secondary);
          padding:6px 16px;border-radius:9999px;border:1px solid var(--color-border);
          opacity:0.8;z-index:100;
        `;
        const numSpan = pageIndicator.querySelector('.current-slide');
        if (numSpan) numSpan.style.cssText = 'color:var(--color-primary);font-weight:700;';
        pdfContainer.appendChild(pageIndicator);

        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(pdfContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          logging: false,
          width: pdfWidth,
          height: pdfHeight,
          imageTimeout: 5000,
          removeContainer: true
        });

        if (pageIndicator.parentNode) pageIndicator.parentNode.removeChild(pageIndicator);

        const imgData = canvas.toDataURL('image/jpeg', 1);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // Cleanup
      document.body.removeChild(pdfContainer);
      this.container.classList.remove('printing');

      // Restore original slide
      this.slides.forEach(s => s.classList.remove('active'));
      this.slides[currentSlideNum - 1].classList.add('active');

      pdf.save(filename);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      if (overlay?.parentNode) overlay.parentNode.removeChild(overlay);
      btn.classList.remove('generating');
    }
  }
};
