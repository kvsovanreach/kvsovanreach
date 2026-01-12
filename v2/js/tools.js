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
    currentYear: document.getElementById('current-year')
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
          ToolsRenderer.render();
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
    init() {
      elements.searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        elements.searchClear?.classList.toggle('visible', searchQuery.length > 0);
        ToolsRenderer.render();
      });

      elements.searchClear?.addEventListener('click', () => {
        elements.searchInput.value = '';
        searchQuery = '';
        currentPage = 1;
        elements.searchClear.classList.remove('visible');
        elements.searchInput.focus();
        ToolsRenderer.render();
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          elements.searchInput?.focus();
          elements.searchInput?.select();
        }
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
          elements.searchInput.value = '';
          searchQuery = '';
          currentPage = 1;
          elements.searchClear?.classList.remove('visible');
          elements.searchInput.blur();
          ToolsRenderer.render();
        }
      });
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

      let html = '';

      // Previous button
      html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;

      // Page numbers
      const pages = this.getPageNumbers(totalPages);
      pages.forEach(page => {
        if (page === '...') {
          html += '<span class="pagination-ellipsis">...</span>';
        } else {
          html += `
            <button class="pagination-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
              ${page}
            </button>
          `;
        }
      });

      // Next button
      html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;

      elements.pagination.innerHTML = html;

      // Add click handlers
      elements.pagination.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPage = parseInt(btn.dataset.page);
          ToolsRenderer.render();
          // Scroll to top of page
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    },

    getPageNumbers(totalPages) {
      const pages = [];
      const showPages = 5; // Max visible page numbers

      if (totalPages <= showPages + 2) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (currentPage <= 3) {
          // Near start
          pages.push(2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Near end
          pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          // Middle
          pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
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
        <a href="${isComingSoon ? '#' : tool.url}" class="tool-card ${isComingSoon ? 'coming-soon' : ''}">
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

  // ==================== Category Counts ====================
  const CategoryCounts = {
    init() {
      const counts = {
        all: toolsData.length,
        general: toolsData.filter(t => t.category === 'general').length,
        developer: toolsData.filter(t => t.category === 'developer').length,
        ai: toolsData.filter(t => t.category === 'ai').length
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

    // Initialize modules
    ThemeManager.init();
    Navigation.init();
    Search.init();
    CategoryCounts.init();
    ToolsRenderer.render();
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
