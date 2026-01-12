/**
 * Password Generator Tool
 * Generate strong, secure passwords with customizable options
 */

(function() {
  'use strict';

  // ============================================
  // Character Sets
  // ============================================
  const CHARS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'ilL1oO0',
    ambiguous: '{}[]()/\\\'"`~,;:.<>'
  };

  // ============================================
  // State
  // ============================================
  const state = {
    history: JSON.parse(localStorage.getItem('passwordHistory') || '[]'),
    settings: JSON.parse(localStorage.getItem('passwordSettings') || JSON.stringify({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      beginWithLetter: false,
      bulkCount: 1
    })),
    isDarkMode: localStorage.getItem('theme') === 'dark',
    historyCollapsed: localStorage.getItem('passwordHistoryCollapsed') === 'true',
    currentPassword: ''
  };

  const MAX_HISTORY = 50;

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Password Display
    passwordText: document.getElementById('passwordText'),
    copyBtn: document.getElementById('copyBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    generateBtn: document.getElementById('generateBtn'),

    // Strength
    strengthFill: document.getElementById('strengthFill'),
    strengthLabel: document.getElementById('strengthLabel'),
    entropyValue: document.getElementById('entropyValue'),
    crackTimeValue: document.getElementById('crackTimeValue'),
    lengthStat: document.getElementById('lengthStat'),

    // Options
    lengthSlider: document.getElementById('lengthSlider'),
    lengthValue: document.getElementById('lengthValue'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    excludeSimilar: document.getElementById('excludeSimilar'),
    excludeAmbiguous: document.getElementById('excludeAmbiguous'),
    beginWithLetter: document.getElementById('beginWithLetter'),

    // Bulk
    bulkSlider: document.getElementById('bulkSlider'),
    bulkValue: document.getElementById('bulkValue'),
    bulkCount: document.getElementById('bulkCount'),
    bulkGenerateBtn: document.getElementById('bulkGenerateBtn'),
    bulkResults: document.getElementById('bulkResults'),
    bulkList: document.getElementById('bulkList'),
    copyAllBtn: document.getElementById('copyAllBtn'),

    // Tabs
    tabs: document.querySelectorAll('.password-tab'),
    panels: document.querySelectorAll('.password-panel'),
    generatorPanel: document.getElementById('generatorPanel'),
    historyPanel: document.getElementById('historyPanel'),

    // History
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Other
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initTabs();
    initSettings();
    initHistory();
    initEventListeners();
    initKeyboardShortcuts();

    // Generate initial password
    generatePassword();
  }

  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabName) {
    // Update tab buttons
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panels
    elements.panels.forEach(panel => {
      panel.classList.remove('active');
    });

    if (tabName === 'generator' && elements.generatorPanel) {
      elements.generatorPanel.classList.add('active');
    } else if (tabName === 'history' && elements.historyPanel) {
      elements.historyPanel.classList.add('active');
    }
  }

  function initSettings() {
    // Load settings into UI
    elements.lengthSlider.value = state.settings.length;
    elements.lengthValue.textContent = state.settings.length;
    elements.uppercase.checked = state.settings.uppercase;
    elements.lowercase.checked = state.settings.lowercase;
    elements.numbers.checked = state.settings.numbers;
    elements.symbols.checked = state.settings.symbols;
    elements.excludeSimilar.checked = state.settings.excludeSimilar;
    elements.excludeAmbiguous.checked = state.settings.excludeAmbiguous;
    elements.beginWithLetter.checked = state.settings.beginWithLetter;
    elements.bulkSlider.value = state.settings.bulkCount;
    elements.bulkValue.textContent = state.settings.bulkCount;
    elements.bulkCount.textContent = state.settings.bulkCount;
  }

  function initEventListeners() {
    // Generate buttons
    elements.generateBtn?.addEventListener('click', generatePassword);
    elements.regenerateBtn?.addEventListener('click', generatePassword);
    elements.copyBtn?.addEventListener('click', copyPassword);

    // Length slider
    elements.lengthSlider?.addEventListener('input', (e) => {
      state.settings.length = parseInt(e.target.value);
      elements.lengthValue.textContent = state.settings.length;
      saveSettings();
    });

    // Character type checkboxes
    const charCheckboxes = [elements.uppercase, elements.lowercase, elements.numbers, elements.symbols];
    charCheckboxes.forEach(checkbox => {
      checkbox?.addEventListener('change', (e) => {
        state.settings[e.target.id] = e.target.checked;
        // Ensure at least one is checked
        const anyChecked = charCheckboxes.some(cb => cb?.checked);
        if (!anyChecked) {
          e.target.checked = true;
          state.settings[e.target.id] = true;
          showToast('At least one character type must be selected', 'error');
        }
        saveSettings();
      });
    });

    // Additional options
    elements.excludeSimilar?.addEventListener('change', (e) => {
      state.settings.excludeSimilar = e.target.checked;
      saveSettings();
    });

    elements.excludeAmbiguous?.addEventListener('change', (e) => {
      state.settings.excludeAmbiguous = e.target.checked;
      saveSettings();
    });

    elements.beginWithLetter?.addEventListener('change', (e) => {
      state.settings.beginWithLetter = e.target.checked;
      saveSettings();
    });

    // Bulk slider
    elements.bulkSlider?.addEventListener('input', (e) => {
      state.settings.bulkCount = parseInt(e.target.value);
      elements.bulkValue.textContent = state.settings.bulkCount;
      elements.bulkCount.textContent = state.settings.bulkCount;
      saveSettings();
    });

    elements.bulkGenerateBtn?.addEventListener('click', generateBulkPasswords);
    elements.copyAllBtn?.addEventListener('click', copyAllPasswords);

    // Password text click to copy
    elements.passwordText?.addEventListener('click', copyPassword);
  }

  // ============================================
  // Password Generation
  // ============================================
  function generatePassword() {
    const charset = buildCharset();
    if (charset.length === 0) {
      showToast('No characters available with current settings', 'error');
      return;
    }

    // Add animation to button
    elements.generateBtn?.classList.add('generating');
    setTimeout(() => {
      elements.generateBtn?.classList.remove('generating');
    }, 300);

    let password = '';
    const length = state.settings.length;

    // Generate password
    if (state.settings.beginWithLetter) {
      let letterCharset = '';
      if (state.settings.uppercase) letterCharset += CHARS.uppercase;
      if (state.settings.lowercase) letterCharset += CHARS.lowercase;

      if (letterCharset.length > 0) {
        password += letterCharset[getRandomInt(letterCharset.length)];
      }
    }

    while (password.length < length) {
      password += charset[getRandomInt(charset.length)];
    }

    // Shuffle if we started with a letter to add randomness
    if (state.settings.beginWithLetter && password.length > 1) {
      const firstChar = password[0];
      const rest = shuffleString(password.slice(1));
      password = firstChar + rest;
    }

    state.currentPassword = password;
    displayPassword(password);
    updateStrength(password);
    addToHistory(password);

    // Hide bulk results when generating single password
    elements.bulkResults.style.display = 'none';
  }

  function generateBulkPasswords() {
    const passwords = [];
    const count = state.settings.bulkCount;

    for (let i = 0; i < count; i++) {
      const charset = buildCharset();
      if (charset.length === 0) continue;

      let password = '';
      const length = state.settings.length;

      if (state.settings.beginWithLetter) {
        let letterCharset = '';
        if (state.settings.uppercase) letterCharset += CHARS.uppercase;
        if (state.settings.lowercase) letterCharset += CHARS.lowercase;

        if (letterCharset.length > 0) {
          password += letterCharset[getRandomInt(letterCharset.length)];
        }
      }

      while (password.length < length) {
        password += charset[getRandomInt(charset.length)];
      }

      if (state.settings.beginWithLetter && password.length > 1) {
        const firstChar = password[0];
        const rest = shuffleString(password.slice(1));
        password = firstChar + rest;
      }

      passwords.push(password);
      addToHistory(password);
    }

    displayBulkPasswords(passwords);
    showToast(`Generated ${count} passwords`, 'success');
  }

  function buildCharset() {
    let charset = '';

    if (state.settings.uppercase) charset += CHARS.uppercase;
    if (state.settings.lowercase) charset += CHARS.lowercase;
    if (state.settings.numbers) charset += CHARS.numbers;
    if (state.settings.symbols) charset += CHARS.symbols;

    // Remove similar characters
    if (state.settings.excludeSimilar) {
      for (const char of CHARS.similar) {
        charset = charset.replace(new RegExp(escapeRegex(char), 'g'), '');
      }
    }

    // Remove ambiguous symbols
    if (state.settings.excludeAmbiguous) {
      for (const char of CHARS.ambiguous) {
        charset = charset.replace(new RegExp(escapeRegex(char), 'g'), '');
      }
    }

    return charset;
  }

  function getRandomInt(max) {
    // Use crypto API for better randomness
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ============================================
  // Display
  // ============================================
  function displayPassword(password) {
    // Color-code characters by type
    let coloredHtml = '';
    for (const char of password) {
      if (/[A-Z]/.test(char)) {
        coloredHtml += `<span class="char-upper">${escapeHtml(char)}</span>`;
      } else if (/[a-z]/.test(char)) {
        coloredHtml += `<span class="char-lower">${escapeHtml(char)}</span>`;
      } else if (/[0-9]/.test(char)) {
        coloredHtml += `<span class="char-number">${escapeHtml(char)}</span>`;
      } else {
        coloredHtml += `<span class="char-symbol">${escapeHtml(char)}</span>`;
      }
    }
    elements.passwordText.innerHTML = coloredHtml;
    elements.passwordText.classList.remove('placeholder');
  }

  function displayBulkPasswords(passwords) {
    elements.bulkResults.style.display = 'block';
    elements.bulkList.innerHTML = '';

    passwords.forEach((password, index) => {
      const item = document.createElement('div');
      item.className = 'bulk-item';
      item.innerHTML = `
        <span class="bulk-item-number">${index + 1}.</span>
        <span class="bulk-item-password">${escapeHtml(password)}</span>
        <button class="bulk-item-copy" title="Copy" data-password="${escapeHtml(password)}">
          <i class="fa-solid fa-copy"></i>
        </button>
      `;

      item.querySelector('.bulk-item-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        const pwd = e.currentTarget.dataset.password;
        copyToClipboard(pwd);
        showToast('Password copied!', 'success');
      });

      elements.bulkList.appendChild(item);
    });
  }

  // ============================================
  // Password Strength & Entropy
  // ============================================
  function updateStrength(password) {
    const entropy = calculateEntropy(password);
    const strength = getStrengthFromEntropy(entropy);
    const crackTime = estimateCrackTime(entropy);

    elements.strengthFill.className = 'strength-fill ' + strength.class;
    elements.strengthLabel.className = 'strength-label ' + strength.class;
    elements.strengthLabel.textContent = strength.label;

    // Update stats
    if (elements.entropyValue) {
      elements.entropyValue.textContent = Math.round(entropy) + ' bits';
    }
    if (elements.crackTimeValue) {
      elements.crackTimeValue.textContent = crackTime;
    }
    if (elements.lengthStat) {
      elements.lengthStat.textContent = password.length + ' chars';
    }
  }

  function calculateEntropy(password) {
    // Calculate actual charset size used
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    if (charsetSize === 0) return 0;

    // Entropy = length × log2(charset size)
    return password.length * Math.log2(charsetSize);
  }

  function getStrengthFromEntropy(entropy) {
    // Based on NIST recommendations
    if (entropy < 28) return { label: 'Very Weak', class: 'very-weak' };
    if (entropy < 36) return { label: 'Weak', class: 'weak' };
    if (entropy < 60) return { label: 'Fair', class: 'fair' };
    if (entropy < 128) return { label: 'Strong', class: 'strong' };
    return { label: 'Very Strong', class: 'very-strong' };
  }

  function estimateCrackTime(entropy) {
    // Assume 10 billion guesses per second (modern GPU cluster)
    const guessesPerSecond = 10e9;
    const totalCombinations = Math.pow(2, entropy);
    const seconds = totalCombinations / guessesPerSecond / 2; // Average case

    if (seconds < 1) return 'Instant';
    if (seconds < 60) return Math.round(seconds) + ' sec';
    if (seconds < 3600) return Math.round(seconds / 60) + ' min';
    if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
    if (seconds < 2592000) return Math.round(seconds / 86400) + ' days';
    if (seconds < 31536000) return Math.round(seconds / 2592000) + ' months';
    if (seconds < 31536000 * 1000) return Math.round(seconds / 31536000) + ' years';
    if (seconds < 31536000 * 1e6) return Math.round(seconds / 31536000 / 1000) + 'K years';
    if (seconds < 31536000 * 1e9) return Math.round(seconds / 31536000 / 1e6) + 'M years';
    if (seconds < 31536000 * 1e12) return Math.round(seconds / 31536000 / 1e9) + 'B years';
    return '∞';
  }

  function calculateStrength(password) {
    const entropy = calculateEntropy(password);
    return getStrengthFromEntropy(entropy);
  }

  // ============================================
  // Copy Functions
  // ============================================
  function copyPassword() {
    if (!state.currentPassword) {
      showToast('No password to copy', 'error');
      return;
    }
    copyToClipboard(state.currentPassword);
    showToast('Password copied!', 'success');
  }

  function copyAllPasswords() {
    const items = elements.bulkList.querySelectorAll('.bulk-item-password');
    const passwords = Array.from(items).map(item => item.textContent);

    if (passwords.length === 0) {
      showToast('No passwords to copy', 'error');
      return;
    }

    copyToClipboard(passwords.join('\n'));
    showToast(`Copied ${passwords.length} passwords!`, 'success');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  // ============================================
  // History
  // ============================================
  function initHistory() {
    renderHistory();

    // Clear history button
    elements.clearHistoryBtn?.addEventListener('click', () => {
      if (state.history.length === 0) {
        showToast('History is already empty', 'info');
        return;
      }
      state.history = [];
      localStorage.setItem('passwordHistory', '[]');
      renderHistory();
      showToast('History cleared', 'success');
    });
  }

  function addToHistory(password) {
    const strength = calculateStrength(password);
    const item = {
      id: Date.now(),
      password: password,
      strength: strength.class,
      strengthLabel: strength.label,
      timestamp: new Date().toISOString()
    };

    state.history.unshift(item);

    if (state.history.length > MAX_HISTORY) {
      state.history = state.history.slice(0, MAX_HISTORY);
    }

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!elements.historyList) return;

    if (state.history.length === 0) {
      elements.historyEmpty?.classList.remove('hidden');
      const items = elements.historyList.querySelectorAll('.history-item');
      items.forEach(item => item.remove());
      return;
    }

    elements.historyEmpty?.classList.add('hidden');

    // Clear existing items
    const existingItems = elements.historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    // Render history
    state.history.forEach((item) => {
      const historyItem = createHistoryItem(item);
      elements.historyList.appendChild(historyItem);
    });
  }

  function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-item-password">${escapeHtml(item.password)}</div>
      <div class="history-item-meta">
        <span class="history-item-time">${formatTime(new Date(item.timestamp))}</span>
        <span class="history-item-strength ${item.strength}">${item.strengthLabel}</span>
      </div>
    `;

    div.addEventListener('click', () => {
      copyToClipboard(item.password);
      showToast('Password copied!', 'success');
    });

    return div;
  }

  function saveHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(state.history));
  }

  function saveSettings() {
    localStorage.setItem('passwordSettings', JSON.stringify(state.settings));
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function initKeyboardShortcuts() {
    // Shortcut modal handled by tools-common.js
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          generatePassword();
          break;
        case 'c':
          copyPassword();
          break;
        case 'r':
          generatePassword();
          break;
        case 'h':
          toggleHistory();
          break;
        case '+':
        case '=':
          if (state.settings.length < 64) {
            state.settings.length++;
            elements.lengthSlider.value = state.settings.length;
            elements.lengthValue.textContent = state.settings.length;
            saveSettings();
          }
          break;
        case '-':
        case '_':
          if (state.settings.length > 4) {
            state.settings.length--;
            elements.lengthSlider.value = state.settings.length;
            elements.lengthValue.textContent = state.settings.length;
            saveSettings();
          }
          break;
      }
    });
  }

  function toggleHistory() {
    // Toggle between generator and history tabs
    if (elements.historyPanel?.classList.contains('active')) {
      switchTab('generator');
    } else {
      switchTab('history');
    }
  }

  // ============================================
  // Footer
  // ============================================
  function initFooter() {
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // Utilities
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  }

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

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
