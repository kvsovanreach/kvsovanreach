/**
 * KVSOVANREACH Tools Common
 * Shared utilities for all tool pages
 */

(function() {
  'use strict';

  // ==================== Theme Management ====================
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', saved);

      const themeToggle = document.getElementById('theme-toggle');
      themeToggle?.addEventListener('click', () => this.toggle());
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }
  };

  // ==================== Toast Notifications ====================
  const Toast = {
    element: null,

    init() {
      this.element = document.getElementById('toast');
    },

    show(message, type = 'info') {
      if (!this.element) this.init();
      if (!this.element) return;

      this.element.textContent = message;
      this.element.className = `toast show ${type}`;
      setTimeout(() => {
        this.element.className = 'toast';
      }, 2500);
    }
  };

  // ==================== Shortcuts Modal ====================
  const ShortcutsModal = {
    hint: null,
    modal: null,
    closeBtn: null,
    initialized: false,

    init() {
      if (this.initialized) return;

      this.hint = document.getElementById('shortcutsHint');
      this.modal = document.getElementById('shortcutsModal');
      // Support both ID variations
      this.closeBtn = document.getElementById('closeShortcutsBtn') ||
                      document.getElementById('shortcutsClose');

      if (!this.modal) return;

      this.setupEventListeners();
      this.initialized = true;
    },

    setupEventListeners() {
      // Hint click to show modal
      this.hint?.addEventListener('click', () => this.show());

      // Close button
      this.closeBtn?.addEventListener('click', () => this.hide());

      // Click outside modal to close
      this.modal?.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hide();
        }
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Skip if user is typing in an input field
        if (e.target.matches('input, textarea, select')) return;

        // ? key to show/toggle modal
        if (e.key === '?') {
          e.preventDefault();
          this.toggle();
        }

        // Escape to close modal
        if (e.key === 'Escape' && this.isOpen()) {
          e.preventDefault();
          this.hide();
        }
      });
    },

    show() {
      this.modal?.classList.add('show');
    },

    hide() {
      this.modal?.classList.remove('show');
    },

    toggle() {
      if (this.isOpen()) {
        this.hide();
      } else {
        this.show();
      }
    },

    isOpen() {
      return this.modal?.classList.contains('show');
    }
  };

  // ==================== Footer Year ====================
  function setCurrentYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // ==================== Initialize Common Features ====================
  function initCommon() {
    ThemeManager.init();
    Toast.init();
    ShortcutsModal.init();
    setCurrentYear();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
  } else {
    initCommon();
  }

  // ==================== Export to Global ====================
  window.ToolsCommon = {
    ThemeManager,
    Toast,
    ShortcutsModal,
    showToast: (message, type) => Toast.show(message, type)
  };

})();
