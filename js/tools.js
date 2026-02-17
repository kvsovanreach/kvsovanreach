/**
 * KVSOVANREACH Tools
 * Main JavaScript for Tools Page
 */

(function() {
  'use strict';

  // ==================== State ====================
  let currentCategory = 'all';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 12;
  let selectedIndex = -1; // For keyboard navigation

  // ==================== DOM Elements ====================
  const elements = {
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    toolsGrid: document.getElementById('tools-grid'),
    noResults: document.getElementById('no-results'),
    pagination: document.getElementById('pagination'),
    navLinks: document.querySelectorAll('.nav-link[data-category]'),
    themeToggle: document.getElementById('theme-toggle'),
    navToggle: document.getElementById('nav-toggle'),
    navClose: document.getElementById('nav-close'),
    navMenu: document.getElementById('nav-menu'),
    currentYear: document.getElementById('current-year'),
    aboutLink: document.getElementById('about-link'),
    aboutModal: document.getElementById('about-modal'),
    aboutOverlay: document.getElementById('about-overlay'),
    aboutClose: document.getElementById('about-close')
  };

  // ==================== URL Management ====================
  const URLManager = {
    /**
     * Read URL parameters and update state
     */
    readFromURL() {
      const params = new URLSearchParams(window.location.search);

      // Read category
      const category = params.get('category');
      if (category && ['all', 'general', 'developer', 'ai', 'fun'].includes(category)) {
        currentCategory = category;
      }

      // Read page
      const page = parseInt(params.get('page'));
      if (page && page > 0) {
        currentPage = page;
      }

      // Read search query
      const q = params.get('q');
      if (q) {
        searchQuery = q;
        if (elements.searchInput) {
          elements.searchInput.value = q;
          elements.searchClear?.classList.toggle('visible', q.length > 0);
        }
      }

      // Update active nav link
      elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === currentCategory);
      });
    },

    /**
     * Update URL to reflect current state
     * @param {boolean} replace - Use replaceState instead of pushState
     */
    updateURL(replace = false) {
      const params = new URLSearchParams();

      // Only add params if they differ from defaults
      if (currentCategory !== 'all') {
        params.set('category', currentCategory);
      }

      if (currentPage > 1) {
        params.set('page', currentPage);
      }

      if (searchQuery) {
        params.set('q', searchQuery);
      }

      // Build new URL
      const queryString = params.toString();
      const newURL = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      // Update browser URL without reload
      if (replace) {
        history.replaceState({ category: currentCategory, page: currentPage, q: searchQuery }, '', newURL);
      } else {
        history.pushState({ category: currentCategory, page: currentPage, q: searchQuery }, '', newURL);
      }
    },

    /**
     * Initialize popstate listener for browser back/forward
     */
    init() {
      window.addEventListener('popstate', (event) => {
        if (event.state) {
          currentCategory = event.state.category || 'all';
          currentPage = event.state.page || 1;
          searchQuery = event.state.q || '';

          // Update UI
          if (elements.searchInput) {
            elements.searchInput.value = searchQuery;
            elements.searchClear?.classList.toggle('visible', searchQuery.length > 0);
          }

          elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.category === currentCategory);
          });

          ToolsRenderer.render();
        } else {
          // No state, read from URL
          this.readFromURL();
          ToolsRenderer.render();
        }
      });
    }
  };

  // ==================== Theme Management ====================
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', saved);

      elements.themeToggle?.addEventListener('click', () => this.toggle());
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }
  };

  // ==================== Navigation ====================
  const Navigation = {
    init() {
      elements.navToggle?.addEventListener('click', () => this.openMenu());
      elements.navClose?.addEventListener('click', () => this.closeMenu());

      // Category navigation
      elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          elements.navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          currentCategory = link.dataset.category;
          currentPage = 1;
          selectedIndex = -1; // Reset selection on category change
          ToolsRenderer.render();
          URLManager.updateURL();
          this.closeMenu();
        });
      });
    },

    openMenu() {
      elements.navMenu?.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.createOverlay();
    },

    closeMenu() {
      elements.navMenu?.classList.remove('active');
      document.body.style.overflow = '';
      this.removeOverlay();
    },

    createOverlay() {
      const existing = document.querySelector('.nav-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.addEventListener('click', () => this.closeMenu());
      document.body.appendChild(overlay);
      overlay.offsetHeight; // Force reflow
      overlay.classList.add('active');
    },

    removeOverlay() {
      const overlay = document.querySelector('.nav-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
      }
    }
  };

  // ==================== Search ====================
  const Search = {
    debounceTimer: null,

    init() {
      elements.searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        selectedIndex = -1; // Reset selection on new search
        elements.searchClear?.classList.toggle('visible', searchQuery.length > 0);
        ToolsRenderer.render();

        // Debounce URL update to avoid too many history entries while typing
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          URLManager.updateURL();
        }, 500);
      });

      elements.searchClear?.addEventListener('click', () => {
        elements.searchInput.value = '';
        searchQuery = '';
        currentPage = 1;
        selectedIndex = -1;
        elements.searchClear.classList.remove('visible');
        elements.searchInput.focus();
        ToolsRenderer.render();
        URLManager.updateURL();
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          elements.searchInput?.focus();
          elements.searchInput?.select();
        }

        // Escape to clear search when in search input
        if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
          elements.searchInput.value = '';
          searchQuery = '';
          currentPage = 1;
          selectedIndex = -1;
          elements.searchClear?.classList.remove('visible');
          elements.searchInput.blur();
          ToolsRenderer.render();
          URLManager.updateURL();
          return;
        }

        // Arrow key navigation - works globally unless in input/textarea
        const isInInput = document.activeElement?.matches('input, textarea, select, [contenteditable]');
        if (isInInput && document.activeElement !== elements.searchInput) return;

        const cards = elements.toolsGrid?.querySelectorAll('.tool-card:not(.coming-soon)');
        const cardCount = cards?.length || 0;

        if (cardCount === 0) return;

        // Get number of columns based on viewport
        const columns = this.getGridColumns();

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = selectedIndex + columns;
          if (selectedIndex === -1) {
            selectedIndex = 0;
          } else if (newIndex < cardCount) {
            selectedIndex = newIndex;
          }
          this.updateSelection(cards);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = selectedIndex - columns;
          if (newIndex >= 0) {
            selectedIndex = newIndex;
          }
          this.updateSelection(cards);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (selectedIndex === -1) {
            selectedIndex = 0;
          } else if (selectedIndex < cardCount - 1) {
            selectedIndex++;
          }
          this.updateSelection(cards);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (selectedIndex > 0) {
            selectedIndex--;
          }
          this.updateSelection(cards);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          const selectedCard = cards[selectedIndex];
          if (selectedCard) {
            window.location.href = selectedCard.href;
          }
        }
      });
    },

    getGridColumns() {
      const width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      if (width <= 1024) return 3;
      return 4;
    },

    updateSelection(cards) {
      // Remove previous selection
      cards.forEach(card => card.classList.remove('keyboard-selected'));

      // Add selection to current
      if (selectedIndex >= 0 && cards[selectedIndex]) {
        cards[selectedIndex].classList.add('keyboard-selected');
        // Scroll into view if needed
        cards[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  };

  // ==================== Pagination ====================
  const Pagination = {
    render(totalItems) {
      if (!elements.pagination) return;

      const totalPages = Math.ceil(totalItems / itemsPerPage);

      // Hide pagination if only one page or no items
      if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
      }

      // Validate current page
      if (currentPage > totalPages) {
        currentPage = totalPages;
        URLManager.updateURL(true); // Replace to fix invalid page
      }

      let html = '<div class="pagination-buttons">';

      // First button (<<)
      html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="1" title="First page">
          <i class="fa-solid fa-angles-left"></i>
        </button>
      `;

      // Previous button (<)
      html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" title="Previous page">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;

      // Page numbers
      const pages = this.getPageNumbers(totalPages);
      pages.forEach(page => {
        html += `
          <button class="pagination-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
            ${page}
          </button>
        `;
      });

      // Next button (>)
      html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" title="Next page">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;

      // Last button (>>)
      html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}" title="Last page">
          <i class="fa-solid fa-angles-right"></i>
        </button>
      `;

      html += '</div>';

      // Pagination info
      const startItem = (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, totalItems);
      html += `
        <div class="pagination-info">
          Showing ${startItem}-${endItem} of ${totalItems} tools · Page ${currentPage} of ${totalPages}
        </div>
      `;

      elements.pagination.innerHTML = html;

      // Add click handlers
      elements.pagination.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPage = parseInt(btn.dataset.page);
          selectedIndex = -1; // Reset selection on page change
          ToolsRenderer.render();
          URLManager.updateURL();
          // Scroll to top of page
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    },

    getPageNumbers(totalPages) {
      const pages = [];
      // Use 3 pages on mobile, 5 on desktop
      const isMobile = window.innerWidth < 640;
      const windowSize = isMobile ? 3 : 5;
      const offset = Math.floor(windowSize / 2);

      if (totalPages <= windowSize) {
        // Show all pages if total is within window size
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Calculate window with current page in the middle
        let start = currentPage - offset;
        let end = currentPage + offset;

        // Adjust if at the beginning
        if (start < 1) {
          start = 1;
          end = windowSize;
        }

        // Adjust if at the end
        if (end > totalPages) {
          end = totalPages;
          start = totalPages - windowSize + 1;
        }

        // Generate page numbers
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    }
  };

  // ==================== Tools Renderer ====================
  const ToolsRenderer = {
    render() {
      if (!elements.toolsGrid) return;

      const filtered = toolsData.filter(tool => {
        // Hide inactive tools completely
        if (tool.status === 'inactive') return false;

        const categoryMatch = currentCategory === 'all' || tool.category === currentCategory;
        const query = searchQuery.toLowerCase();
        const searchMatch = !query ||
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some(tag => tag.includes(query));
        return categoryMatch && searchMatch;
      });

      // No results
      if (filtered.length === 0) {
        elements.toolsGrid.innerHTML = '';
        elements.noResults?.classList.add('visible');
        Pagination.render(0);
        return;
      }

      elements.noResults?.classList.remove('visible');

      // Paginate results
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTools = filtered.slice(startIndex, endIndex);

      // Render cards
      elements.toolsGrid.innerHTML = paginatedTools.map(tool => this.createCard(tool)).join('');

      // Render pagination
      Pagination.render(filtered.length);
    },

    createCard(tool) {
      const isComingSoon = tool.status === 'coming-soon';
      const categoryLabel = categoryLabels[tool.category] || tool.category;

      return `
        <a href="${isComingSoon ? '#' : tool.url}" class="tool-card ${isComingSoon ? 'coming-soon' : ''}" ${isComingSoon ? 'onclick="return false;"' : ''}>
          <div class="tool-card-icon">
            <i class="${tool.icon}"></i>
          </div>
          <div class="tool-card-body">
            <h3 class="tool-card-title">${tool.name}</h3>
            <p class="tool-card-description">${tool.description}</p>
          </div>
          <div class="tool-card-footer">
            ${isComingSoon
              ? '<span class="coming-soon-badge">Coming Soon</span>'
              : `<span class="tool-card-category">${categoryLabel}</span>`
            }
            <span class="tool-card-arrow"><i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </a>
      `;
    }
  };

  // ==================== About Modal ====================
  const AboutModal = {
    scrollPosition: 0,

    init() {
      elements.aboutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
        Navigation.closeMenu();
      });

      elements.aboutClose?.addEventListener('click', () => this.close());
      elements.aboutOverlay?.addEventListener('click', () => this.close());

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.aboutModal?.classList.contains('active')) {
          this.close();
        }
      });
    },

    open() {
      this.scrollPosition = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${this.scrollPosition}px`;
      elements.aboutModal?.classList.add('active');
    },

    close() {
      elements.aboutModal?.classList.remove('active');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, this.scrollPosition);
    }
  };

  // ==================== Category Counts ====================
  const CategoryCounts = {
    init() {
      // Only count tools that are not inactive (active + coming-soon)
      const visibleTools = toolsData.filter(t => t.status !== 'inactive');
      const counts = {
        all: visibleTools.length,
        general: visibleTools.filter(t => t.category === 'general').length,
        developer: visibleTools.filter(t => t.category === 'developer').length,
        ai: visibleTools.filter(t => t.category === 'ai').length,
        fun: visibleTools.filter(t => t.category === 'fun').length
      };

      elements.navLinks.forEach(link => {
        const category = link.dataset.category;
        if (counts[category] !== undefined) {
          const badge = document.createElement('span');
          badge.className = 'nav-count';
          badge.textContent = counts[category];
          link.appendChild(badge);
        }
      });
    }
  };

  // ==================== Initialize ====================
  function init() {
    // Set current year
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }

    // Initialize URL manager and read initial state from URL
    URLManager.init();
    URLManager.readFromURL();

    // Initialize modules
    ThemeManager.init();
    Navigation.init();
    Search.init();
    CategoryCounts.init();
    AboutModal.init();

    // Initial render
    ToolsRenderer.render();

    // Replace initial state (so back button works correctly)
    URLManager.updateURL(true);
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
