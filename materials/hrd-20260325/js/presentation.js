/**
 * Presentation Module
 * Data-driven slide presentation system
 */
const Presentation = {
  // State
  data: null,
  slides: [],
  currentSlide: 1,
  totalSlides: 0,
  storageKey: 'presentation-current-slide',
  transition: 'fade', // fade, slide, zoom, flip, none

  // DOM Elements
  container: null,
  slidesContainer: null,
  progressBar: null,
  progressBarFill: null,

  // Touch handling
  touchStartX: 0,
  touchEndX: 0,
  swipeThreshold: 50,

  /**
   * Initialize the presentation
   */
  async init() {
    this.container = document.getElementById('presentation');
    this.slidesContainer = document.getElementById('slides-container');
    this.progressBar = document.getElementById('progress-bar');
    this.progressBarFill = document.getElementById('progress-bar-fill');

    // Show loading state
    this.container.classList.add('loading');

    try {
      // Load slide data
      await this.loadData();

      // Set transition from meta or default
      this.transition = this.data.meta?.transition || 'fade';
      this.container.classList.add(`transition-${this.transition}`);

      // Render slides
      this.renderSlides();

      // Setup navigation
      this.bindEvents();
      this.updateNavButtons();
      this.updateProgressBar();

      // Update total slides display
      document.querySelector('.total-slides').textContent = this.totalSlides;

      // Restore saved slide position
      this.restoreSavedSlide();

      // Remove loading state
      this.container.classList.remove('loading');
    } catch (error) {
      console.error('Failed to initialize presentation:', error);
      this.showError('Failed to load presentation data');
    }
  },

  /**
   * Load slide data from JSON file
   */
  async loadData() {
    const response = await fetch('slides.json');
    if (!response.ok) {
      throw new Error('Failed to load slides.json');
    }
    this.data = await response.json();

    // Flatten sections into slides array
    this.data.slides = this.flattenSlides(this.data.slides);
    this.totalSlides = this.data.slides.length;
  },

  /**
   * Flatten nested section slides into a single array
   * Automatically assigns section numbers to nested slides
   */
  flattenSlides(slides) {
    const flattened = [];

    for (const slide of slides) {
      if (slide.type === 'section' && slide.slides && slide.slides.length > 0) {
        // Add the section slide itself
        flattened.push({
          type: 'section',
          number: slide.number,
          title: slide.title,
          subtitle: slide.subtitle
        });

        // Add nested slides with section number
        for (const nestedSlide of slide.slides) {
          flattened.push({
            ...nestedSlide,
            section: slide.number
          });
        }
      } else {
        // Regular slide, add as-is
        flattened.push(slide);
      }
    }

    return flattened;
  },

  /**
   * Render all slides based on their type
   */
  renderSlides() {
    this.slidesContainer.innerHTML = '';

    this.data.slides.forEach((slide, index) => {
      const slideEl = document.createElement('div');
      slideEl.className = `slide${index === 0 ? ' active' : ''}`;
      slideEl.dataset.slide = index + 1;

      // Render based on slide type
      slideEl.innerHTML = this.renderSlideContent(slide);

      this.slidesContainer.appendChild(slideEl);
    });

    this.slides = document.querySelectorAll('.slide');
  },

  /**
   * Render slide content based on type
   * @param {Object} slide - Slide data
   * @returns {string} HTML string
   */
  renderSlideContent(slide) {
    const renderers = {
      'title-hero': this.renderTitleHeroSlide,
      toc: this.renderTocSlide,
      section: this.renderSectionSlide,
      content: this.renderContentSlide,
      image: this.renderImageSlide,
      'image-content': this.renderImageContentSlide,
      'two-column': this.renderTwoColumnSlide,
      comparison: this.renderComparisonSlide,
      table: this.renderTableSlide,
      quote: this.renderQuoteSlide,
      'image-grid': this.renderImageGridSlide,
      discussion: this.renderDiscussionSlide,
      connect: this.renderConnectSlide
    };

    const renderer = renderers[slide.type];
    if (renderer) {
      return renderer.call(this, slide);
    }

    console.warn(`Unknown slide type: ${slide.type}`);
    return `<div class="slide-content"><p>Unknown slide type: ${slide.type}</p></div>`;
  },

  /**
   * Render hero title slide (modern, animated)
   */
  renderTitleHeroSlide(slide) {
    const meta = slide.meta || {};
    return `
      <div class="slide-content title-hero-slide">
        <div class="hero-content">
          ${slide.hook ? `<div class="hero-hook"><span>${this.escapeHtml(slide.hook)}</span></div>` : ''}
          <h1 class="hero-title">
            ${this.escapeHtml(slide.title)}
            ${slide.highlight ? `<span class="hero-highlight">${this.escapeHtml(slide.highlight)}</span>` : ''}
          </h1>
          ${slide.subtitle ? `<p class="hero-subtitle">${this.escapeHtml(slide.subtitle)}</p>` : ''}
          <div class="hero-presenter">
            <div class="presenter-info">
              ${meta.presenter ? `<span class="presenter-name">${this.escapeHtml(meta.presenter)}</span>` : ''}
              ${meta.role ? `<span class="presenter-role">${this.escapeHtml(meta.role)}</span>` : ''}
            </div>
            <div class="presenter-meta">
              ${meta.location ? `<span><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(meta.location)}</span>` : ''}
              ${meta.date ? `<span><i class="fa-solid fa-calendar"></i> ${this.escapeHtml(meta.date)}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render table of contents slide
   */
  renderTocSlide(slide) {
    const items = slide.items || [];
    const isTwoColumn = items.length > 5;
    const layoutClass = isTwoColumn ? 'toc-two-column' : 'toc-one-column';
    const rowCount = Math.ceil(items.length / 2);

    const itemsHtml = items.map((item, index) => {
      const num = String(index + 1).padStart(2, '0');
      const slideLink = item.slide ? `data-goto-slide="${item.slide}"` : '';
      const clickable = item.slide ? 'toc-item-clickable' : '';

      return `
        <div class="toc-item ${clickable}" ${slideLink}>
          <span class="toc-number">${num}</span>
          <div class="toc-text">
            <span class="toc-item-title">${this.escapeHtml(item.title)}</span>
            ${item.description ? `<span class="toc-item-desc">${this.escapeHtml(item.description)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const gridStyle = isTwoColumn ? `style="--toc-rows: ${rowCount}"` : '';

    return `
      <div class="slide-content toc-slide">
        ${this.renderSlideTitle(slide.title || 'Table of Contents', slide.section)}
        <div class="toc-list ${layoutClass}" ${gridStyle}>
          ${itemsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render section divider slide
   */
  renderSectionSlide(slide) {
    const number = slide.number ? String(slide.number).padStart(2, '0') : '';
    return `
      <div class="slide-content section-slide">
        ${number ? `<span class="section-number">${number}</span>` : ''}
        <h2 class="section-title">${this.escapeHtml(slide.title)}</h2>
        ${slide.subtitle ? `<p class="section-subtitle">${this.escapeHtml(slide.subtitle)}</p>` : ''}
      </div>
    `;
  },

  /**
   * Render slide title with optional section number
   */
  renderSlideTitle(title, section) {
    const sectionNum = section ? `<span class="title-number">${String(section).padStart(2, '0')}</span>` : '';
    return `<h2 class="slide-title">${sectionNum}${this.escapeHtml(title)}</h2>`;
  },

  /**
   * Render content slide (bullets or text)
   */
  renderContentSlide(slide) {
    let content = '';
    // Check if this is a references slide
    const isReferences = slide.title && slide.title.toLowerCase().includes('reference');
    const refClass = isReferences ? ' references-slide' : '';

    if (slide.text) {
      content += `<p class="slide-text">${this.formatWithCitations(slide.text, isReferences)}</p>`;
    }

    if (slide.bullets && slide.bullets.length > 0) {
      content += `
        <ul class="slide-bullets">
          ${slide.bullets.map(bullet => `<li>${this.formatWithCitations(bullet, isReferences)}</li>`).join('')}
        </ul>
      `;
    }

    return `
      <div class="slide-content content-slide${refClass}">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${content}
      </div>
    `;
  },

  /**
   * Render image slide
   */
  renderImageSlide(slide) {
    const img = slide.image || {};
    return `
      <div class="slide-content image-slide">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text">${this.formatWithCitations(slide.text)}</p>` : ''}
        <img class="slide-image" src="${this.escapeHtml(img.src)}" alt="${this.escapeHtml(img.alt || '')}">
        ${img.caption ? `<p class="image-caption">${this.formatWithCitations(img.caption)}</p>` : ''}
      </div>
    `;
  },

  /**
   * Render image with content slide
   */
  renderImageContentSlide(slide) {
    const img = slide.image || {};
    const content = slide.content || {};
    const layoutClass = slide.layout === 'image-right' ? ' image-right' : '';

    let contentHtml = '';
    if (content.text) {
      contentHtml += `<p class="slide-text">${this.formatWithCitations(content.text)}</p>`;
    }
    if (content.bullets && content.bullets.length > 0) {
      contentHtml += `
        <ul class="slide-bullets">
          ${content.bullets.map(bullet => `<li>${this.formatWithCitations(bullet)}</li>`).join('')}
        </ul>
      `;
    }

    return `
      <div class="slide-content image-content-slide${layoutClass}">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text slide-intro-text">${this.formatWithCitations(slide.text)}</p>` : ''}
        <div class="image-wrapper">
          <img class="slide-image" src="${this.escapeHtml(img.src)}" alt="${this.escapeHtml(img.alt || '')}">
        </div>
        <div class="content-wrapper">
          ${contentHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render two-column slide
   */
  renderTwoColumnSlide(slide) {
    const columns = slide.columns || [];

    const columnsHtml = columns.map(col => {
      let colContent = '';
      if (col.text) {
        colContent += `<p class="slide-text">${this.formatWithCitations(col.text)}</p>`;
      }
      if (col.bullets && col.bullets.length > 0) {
        colContent += `
          <ul class="slide-bullets">
            ${col.bullets.map(bullet => `<li>${this.formatWithCitations(bullet)}</li>`).join('')}
          </ul>
        `;
      }

      return `
        <div class="column">
          ${col.heading ? `<h3 class="column-heading">${this.escapeHtml(col.heading)}</h3>` : ''}
          ${colContent}
        </div>
      `;
    }).join('');

    return `
      <div class="slide-content two-column-slide">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text">${this.formatWithCitations(slide.text)}</p>` : ''}
        <div class="columns-wrapper">
          ${columnsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render comparison slide (Before/After, Pros/Cons, etc.)
   */
  renderComparisonSlide(slide) {
    const left = slide.left || {};
    const right = slide.right || {};

    // Build bullet lists
    const leftBullets = (left.bullets || []).map(b => `<li>${this.formatWithCitations(b)}</li>`).join('');
    const rightBullets = (right.bullets || []).map(b => `<li>${this.formatWithCitations(b)}</li>`).join('');

    return `
      <div class="slide-content comparison-slide">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text">${this.formatWithCitations(slide.text)}</p>` : ''}
        <div class="comparison-wrapper">
          <div class="comparison-side comparison-left">
            <h3 class="comparison-heading">${this.escapeHtml(left.heading || 'Before')}</h3>
            ${leftBullets ? `<ul class="slide-bullets">${leftBullets}</ul>` : ''}
          </div>
          <div class="comparison-side comparison-right">
            <h3 class="comparison-heading">${this.escapeHtml(right.heading || 'After')}</h3>
            ${rightBullets ? `<ul class="slide-bullets">${rightBullets}</ul>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render table slide
   */
  renderTableSlide(slide) {
    const table = slide.table || {};
    const headers = table.headers || [];
    const rows = table.rows || [];
    const highlight = table.highlight || [];

    const headerHtml = headers.map(h => `<th>${this.formatWithCitations(h)}</th>`).join('');
    const rowsHtml = rows.map((row, index) => {
      const highlightClass = highlight.includes(index) ? ' class="highlight"' : '';
      const cells = row.map(cell => `<td>${this.formatWithCitations(cell)}</td>`).join('');
      return `<tr${highlightClass}>${cells}</tr>`;
    }).join('');

    return `
      <div class="slide-content table-slide">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text">${this.formatWithCitations(slide.text)}</p>` : ''}
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>${headerHtml}</tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        ${table.caption ? `<p class="table-caption">${this.escapeHtml(table.caption)}</p>` : ''}
      </div>
    `;
  },

  /**
   * Render quote slide
   * Supports: layout (centered, left, with-image), background image, accent color, author image
   */
  renderQuoteSlide(slide) {
    const layout = slide.layout || 'centered';
    const hasImage = slide.image || slide.authorImage;
    const layoutClass = `quote-layout-${layout}`;

    // Background image style
    const bgStyle = slide.backgroundImage
      ? `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${this.escapeHtml(slide.backgroundImage)}'); background-size: cover; background-position: center;`
      : '';

    // Accent color style
    const accentStyle = slide.accent
      ? `--quote-accent: ${this.escapeHtml(slide.accent)};`
      : '';

    const style = bgStyle || accentStyle ? `style="${bgStyle} ${accentStyle}"` : '';

    // Author image
    const authorImage = slide.authorImage
      ? `<img src="${this.escapeHtml(slide.authorImage)}" alt="${this.escapeHtml(slide.author || '')}" class="quote-author-image">`
      : '';

    // Side image for with-image layout
    const sideImage = slide.image && layout === 'with-image'
      ? `<div class="quote-image"><img src="${this.escapeHtml(slide.image)}" alt=""></div>`
      : '';

    return `
      <div class="slide-content quote-slide ${layoutClass} ${slide.backgroundImage ? 'has-bg-image' : ''}" ${style}>
        ${sideImage}
        <div class="quote-content">
          <i class="fa-solid fa-quote-left quote-icon"></i>
          <p class="quote-text">${this.formatWithCitations(slide.quote)}</p>
          <div class="quote-attribution">
            ${authorImage}
            <div class="quote-author-info">
              ${slide.author ? `<p class="quote-author">— ${this.escapeHtml(slide.author)}</p>` : ''}
              ${slide.source ? `<p class="quote-source">${this.formatWithCitations(slide.source)}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render image grid slide
   */
  renderImageGridSlide(slide) {
    const images = slide.images || [];

    const imagesHtml = images.map(img => `
      <div class="grid-item">
        <img src="${this.escapeHtml(img.src)}" alt="${this.escapeHtml(img.alt || '')}">
        ${img.caption ? `<div class="grid-caption">${this.escapeHtml(img.caption)}</div>` : ''}
      </div>
    `).join('');

    return `
      <div class="slide-content image-grid-slide">
        ${this.renderSlideTitle(slide.title, slide.section)}
        ${slide.text ? `<p class="slide-text">${this.escapeHtml(slide.text)}</p>` : ''}
        <div class="image-grid">
          ${imagesHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render discussion/Q&A slide
   */
  renderDiscussionSlide(slide) {
    const prompts = slide.prompts || [];
    const promptsHtml = prompts.map((prompt, index) => `
      <div class="discussion-prompt">
        <span class="prompt-icon"><i class="fa-solid fa-${prompt.icon || 'comments'}"></i></span>
        <span class="prompt-text">${this.escapeHtml(prompt.text)}</span>
      </div>
    `).join('');

    return `
      <div class="slide-content discussion-slide">
        <div class="discussion-header">
          <span class="discussion-icon"><i class="fa-solid fa-${slide.icon || 'comments'}"></i></span>
          <h2 class="discussion-title">${this.escapeHtml(slide.title || "Let's Discuss")}</h2>
          ${slide.subtitle ? `<p class="discussion-subtitle">${this.escapeHtml(slide.subtitle)}</p>` : ''}
        </div>
        ${prompts.length > 0 ? `<div class="discussion-prompts">${promptsHtml}</div>` : ''}
      </div>
    `;
  },

  /**
   * Render connect slide (CV presentation style)
   */
  renderConnectSlide(slide) {
    const contact = slide.contact || {};
    const links = [];

    if (contact.email) {
      links.push(`
        <a href="mailto:${this.escapeHtml(contact.email)}" class="connect-item">
          <i class="fa-solid fa-envelope"></i>
          <span>${this.escapeHtml(contact.email)}</span>
        </a>
      `);
    }
    if (contact.website) {
      const websiteUrl = contact.website.startsWith('http') ? contact.website : `https://${contact.website}`;
      links.push(`
        <a href="${this.escapeHtml(websiteUrl)}" target="_blank" class="connect-item">
          <i class="fa-solid fa-globe"></i>
          <span>${this.escapeHtml(contact.website)}</span>
        </a>
      `);
    }
    if (contact.github) {
      links.push(`
        <a href="https://github.com/${this.escapeHtml(contact.github)}" target="_blank" class="connect-item">
          <i class="fa-brands fa-github"></i>
          <span>github.com/${this.escapeHtml(contact.github)}</span>
        </a>
      `);
    }
    if (contact.linkedin) {
      links.push(`
        <a href="https://linkedin.com/in/${this.escapeHtml(contact.linkedin)}" target="_blank" class="connect-item">
          <i class="fa-brands fa-linkedin"></i>
          <span>linkedin.com/in/${this.escapeHtml(contact.linkedin)}</span>
        </a>
      `);
    }

    return `
      <div class="slide-content connect-slide">
        <h2 class="connect-title">${this.escapeHtml(slide.title || "Let's Connect")}</h2>
        ${slide.subtitle ? `<p class="connect-intro">${this.escapeHtml(slide.subtitle)}</p>` : ''}
        ${links.length > 0 ? `<div class="connect-links">${links.join('')}</div>` : ''}
        <p class="connect-thanks">${this.escapeHtml(slide.thanks || 'Thank You!')}</p>
      </div>
    `;
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Format text with styled citations
   * Converts [1], [2], etc. to styled superscript spans
   * @param {string} str - String to process
   * @param {boolean} allowLinks - Whether to preserve anchor tags
   * @returns {string} String with styled citations
   */
  formatWithCitations(str, allowLinks = false) {
    if (str === null || str === undefined) return '';

    let result;
    if (allowLinks) {
      // Preserve anchor tags by temporarily replacing them
      const links = [];
      let temp = str.replace(/<a\s+[^>]*>.*?<\/a>/gi, (match) => {
        links.push(match);
        return `__LINK_${links.length - 1}__`;
      });
      // Escape the rest
      temp = this.escapeHtml(temp);
      // Restore links
      temp = temp.replace(/__LINK_(\d+)__/g, (_, index) => links[parseInt(index)]);
      result = temp;
    } else {
      result = this.escapeHtml(str);
    }

    // Convert citation patterns [1], [2], [1][2], etc. to styled spans
    result = result.replace(/\[(\d+)\]/g, '<sup class="citation" data-ref="$1">[$1]</sup>');

    // Convert <nl> tags to line breaks
    result = result.replace(/&lt;nl&gt;/g, '<br>');

    return result;
  },

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.container.classList.remove('loading');
    this.slidesContainer.innerHTML = `
      <div class="slide active">
        <div class="slide-content">
          <h2 class="slide-title">Error</h2>
          <p class="slide-text">${this.escapeHtml(message)}</p>
        </div>
      </div>
    `;
  },

  /**
   * Update progress bar
   */
  updateProgressBar() {
    if (!this.progressBarFill) return;
    const progress = (this.currentSlide / this.totalSlides) * 100;
    this.progressBarFill.style.width = `${progress}%`;
  },

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Navigation buttons
    document.getElementById('nav-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('nav-next')?.addEventListener('click', () => this.next());

    // Header buttons
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('download-pdf')?.addEventListener('click', () => this.downloadPDF());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Touch/swipe navigation
    if (this.slidesContainer) {
      this.slidesContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      this.slidesContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    // Slide jump input
    const jumpInput = document.getElementById('slide-jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const num = parseInt(jumpInput.value, 10);
          if (num >= 1 && num <= this.totalSlides) {
            this.goToSlide(num);
          }
          jumpInput.value = '';
          jumpInput.blur();
        }
      });
    }

    // Progress bar click
    if (this.progressBar) {
      this.progressBar.addEventListener('click', (e) => {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const slideNum = Math.ceil(percentage * this.totalSlides);
        this.goToSlide(Math.max(1, Math.min(slideNum, this.totalSlides)));
      });
    }

    // TOC item click (event delegation)
    if (this.slidesContainer) {
      this.slidesContainer.addEventListener('click', (e) => {
        const tocItem = e.target.closest('[data-goto-slide]');
        if (tocItem) {
          const slideNum = parseInt(tocItem.dataset.gotoSlide, 10);
          if (slideNum >= 1 && slideNum <= this.totalSlides) {
            this.goToSlide(slideNum);
          }
        }
      });
    }

    // Fullscreen change event
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
  },

  /**
   * Navigate to a specific slide
   * @param {number} n - Slide number (1-indexed)
   */
  goToSlide(n) {
    if (n < 1 || n > this.totalSlides) return;

    const previousSlide = this.currentSlide;
    const direction = n > previousSlide ? 'next' : 'prev';

    // Handle slide transition direction
    if (this.transition === 'slide') {
      this.slides.forEach(slide => {
        slide.classList.remove('active', 'exit-left');
      });

      // Add exit animation to previous slide
      if (direction === 'next' && previousSlide !== n) {
        this.slides[previousSlide - 1]?.classList.add('exit-left');
      }
    } else {
      this.slides.forEach(slide => slide.classList.remove('active'));
    }

    // Activate new slide
    this.slides[n - 1].classList.add('active');

    // Update state and display
    this.currentSlide = n;
    document.querySelector('.current-slide').textContent = n;
    this.updateNavButtons();
    this.updateProgressBar();

    // Save current slide to localStorage
    this.saveCurrentSlide();
  },

  /**
   * Save current slide position to localStorage
   */
  saveCurrentSlide() {
    try {
      localStorage.setItem(this.storageKey, this.currentSlide.toString());
    } catch (e) {
      // localStorage might be unavailable
    }
  },

  /**
   * Restore saved slide position from localStorage
   */
  restoreSavedSlide() {
    try {
      const savedSlide = localStorage.getItem(this.storageKey);
      if (savedSlide) {
        const slideNum = parseInt(savedSlide, 10);
        if (slideNum >= 1 && slideNum <= this.totalSlides) {
          this.goToSlide(slideNum);
        }
      }
    } catch (e) {
      // localStorage might be unavailable
    }
  },

  /**
   * Go to previous slide
   */
  prev() {
    if (this.currentSlide > 1) {
      this.goToSlide(this.currentSlide - 1);
    }
  },

  /**
   * Go to next slide
   */
  next() {
    if (this.currentSlide < this.totalSlides) {
      this.goToSlide(this.currentSlide + 1);
    }
  },

  /**
   * Update navigation button states
   */
  updateNavButtons() {
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');

    if (prevBtn) prevBtn.disabled = this.currentSlide === 1;
    if (nextBtn) nextBtn.disabled = this.currentSlide === this.totalSlides;
  },

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        this.next();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.totalSlides);
        break;
      case 'f':
      case 'F':
        this.toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  },

  /**
   * Handle touch start for swipe navigation
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  },

  /**
   * Handle touch end for swipe navigation
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > this.swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('presentation-theme', newTheme);
  },

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    const docEl = document.documentElement;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (!isFullscreen) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },

  /**
   * Handle fullscreen change event
   */
  handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen) {
      this.container.classList.add('is-fullscreen');
    } else {
      this.container.classList.remove('is-fullscreen');
    }
  },

  /**
   * Download presentation as PDF
   */
  async downloadPDF() {
    const btn = document.getElementById('download-pdf');
    if (!btn || btn.classList.contains('downloading')) return;

    // Show loading state
    btn.classList.add('downloading');

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

      // Get computed styles
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff';

      // Create PDF document - 16:9 landscape format
      const { jsPDF } = window.jspdf;
      const pdfWidth = 1920;
      const pdfHeight = 1080;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
        hotfixes: ['px_scaling']
      });

      // Store current slide
      const currentSlideNum = this.currentSlide;

      // Create a temporary container that mimics fullscreen presentation
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'presentation is-fullscreen printing';
      pdfContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${pdfWidth}px;
        height: ${pdfHeight}px;
        z-index: -9999;
        overflow: hidden;
        background-color: ${bgColor};
      `;

      // Create slides container inside
      const slidesContainer = document.createElement('div');
      slidesContainer.className = 'slides-container';
      slidesContainer.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
      `;
      pdfContainer.appendChild(slidesContainer);
      document.body.appendChild(pdfContainer);

      // Add print class to presentation for styling
      this.container.classList.add('printing');

      for (let i = 0; i < this.slides.length; i++) {
        // Update progress
        progressText.textContent = `Slide ${i + 1} / ${this.totalSlides}`;

        // Clone the slide for PDF capture
        const slideClone = this.slides[i].cloneNode(true);
        slideClone.classList.add('active');
        slideClone.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          opacity: 1;
          pointer-events: auto;
        `;

        // Clear and add cloned slide to slides container
        slidesContainer.innerHTML = '';
        slidesContainer.appendChild(slideClone);

        // Add page number indicator (same style as fullscreen web view)
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'pdf-page-indicator';
        pageIndicator.innerHTML = `<span class="current-slide">${i + 1}</span> / ${this.totalSlides}`;
        pageIndicator.style.cssText = `
          position: absolute;
          bottom: 24px;
          right: 32px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-muted);
          background-color: var(--color-bg-secondary);
          padding: 6px 16px;
          border-radius: 9999px;
          border: 1px solid var(--color-border);
          opacity: 0.8;
          z-index: 100;
        `;
        // Style the current slide number
        const currentSlideSpan = pageIndicator.querySelector('.current-slide');
        if (currentSlideSpan) {
          currentSlideSpan.style.cssText = 'color: var(--color-primary); font-weight: 700;';
        }
        pdfContainer.appendChild(pageIndicator);

        // Wait for render (reduced for faster generation)
        await new Promise(r => setTimeout(r, 50));

        // Capture the PDF container (balanced quality and file size)
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

        // Remove page indicator after capture
        if (pageIndicator.parentNode) {
          pageIndicator.parentNode.removeChild(pageIndicator);
        }

        // Add to PDF (balanced quality ~3-5MB total)
        const imgData = canvas.toDataURL('image/jpeg', 1);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // Cleanup
      document.body.removeChild(pdfContainer);

      // Remove print class
      this.container.classList.remove('printing');

      // Restore original slide
      this.slides.forEach(s => s.classList.remove('active'));
      this.slides[currentSlideNum - 1].classList.add('active');

      // Save PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      // Remove overlay
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      btn.classList.remove('downloading');
    }
  }
};

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Load saved theme
  const savedTheme = localStorage.getItem('presentation-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Initialize presentation
  Presentation.init();
});
