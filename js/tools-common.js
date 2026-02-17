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
    },

    get() {
      return document.documentElement.getAttribute('data-theme');
    }
  };

  // ==================== Toast Notifications ====================
  const Toast = {
    element: null,
    timeout: null,

    init() {
      this.element = document.getElementById('toast');
    },

    show(message, type = 'info', duration = 2500) {
      if (!this.element) this.init();
      if (!this.element) return;

      // Clear any existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.element.textContent = message;
      this.element.className = `toast show ${type}`;

      this.timeout = setTimeout(() => {
        this.element.className = 'toast';
      }, duration);
    }
  };

  // ==================== Clipboard ====================
  const Clipboard = {
    async copy(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback for older browsers
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          return true;
        } catch (fallbackErr) {
          console.error('Failed to copy:', fallbackErr);
          return false;
        }
      }
    },

    async copyWithToast(text, successMessage = 'Copied!', errorMessage = 'Failed to copy') {
      const success = await this.copy(text);
      Toast.show(success ? successMessage : errorMessage, success ? 'success' : 'error');
      return success;
    }
  };

  // ==================== File Download ====================
  const FileDownload = {
    /**
     * Download text content as a file
     * @param {string} content - The text content to download
     * @param {string} filename - The name of the file
     * @param {string} mimeType - MIME type (default: 'text/plain')
     */
    text(content, filename, mimeType = 'text/plain') {
      const blob = new Blob([content], { type: mimeType });
      this.blob(blob, filename);
    },

    /**
     * Download JSON content as a file
     * @param {object} data - The JSON data to download
     * @param {string} filename - The name of the file
     * @param {boolean} pretty - Whether to format the JSON (default: true)
     */
    json(data, filename, pretty = true) {
      const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      this.text(content, filename, 'application/json');
    },

    /**
     * Download a Blob as a file
     * @param {Blob} blob - The blob to download
     * @param {string} filename - The name of the file
     */
    blob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Download from a data URL
     * @param {string} dataUrl - The data URL
     * @param {string} filename - The name of the file
     */
    dataUrl(dataUrl, filename) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      this.closeBtn = document.getElementById('closeShortcutsBtn');

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
        if (e.target.matches('input, textarea, select, [contenteditable]')) return;

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

  // ==================== Debounce Utility ====================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==================== Throttle Utility ====================
  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ==================== Format File Size ====================
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==================== Generate Unique ID ====================
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== Footer Year ====================
  function setCurrentYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // ==================== Back Button ====================
  const BackButton = {
    init() {
      const backBtn = document.querySelector('.back-btn');
      if (!backBtn) return;

      backBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Check if there's history to go back to
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Fallback to tools page if no history
          window.location.href = backBtn.getAttribute('href') || '../../tools.html';
        }
      });
    }
  };

  // ==================== Keyboard Navigation ====================
  const KeyboardNav = {
    init() {
      document.addEventListener('keydown', (e) => {
        // Skip if user is typing in an input field
        if (e.target.matches('input, textarea, select, [contenteditable]')) return;

        // Backspace to go back (preserves search state)
        if (e.key === 'Backspace') {
          e.preventDefault();
          // Use history.back() to preserve the exact previous state (search, page, category)
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // Fallback to tools page if no history
            const backBtn = document.querySelector('.back-btn');
            const toolsUrl = backBtn?.getAttribute('href') || '../../tools.html';
            window.location.href = toolsUrl;
          }
        }
      });
    }
  };

  // ==================== Initialize Common Features ====================
  function initCommon() {
    ThemeManager.init();
    Toast.init();
    ShortcutsModal.init();
    BackButton.init();
    KeyboardNav.init();
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
    // Managers
    ThemeManager,
    Toast,
    ShortcutsModal,
    BackButton,
    KeyboardNav,
    Clipboard,
    FileDownload,

    // Utility functions
    debounce,
    throttle,
    formatFileSize,
    generateId,

    // Convenience shortcuts
    showToast: (message, type, duration) => Toast.show(message, type, duration),
    copyToClipboard: (text) => Clipboard.copy(text),
    copyWithToast: (text, success, error) => Clipboard.copyWithToast(text, success, error),
    downloadText: (content, filename, mime) => FileDownload.text(content, filename, mime),
    downloadJson: (data, filename, pretty) => FileDownload.json(data, filename, pretty),
    downloadBlob: (blob, filename) => FileDownload.blob(blob, filename)
  };

})();
