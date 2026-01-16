/**
 * Regex Tester Tool
 * Test and debug regular expressions with real-time matching
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    currentTab: 'matches'
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Pattern
    patternInput: document.getElementById('patternInput'),
    patternError: document.getElementById('patternError'),
    flagG: document.getElementById('flagG'),
    flagI: document.getElementById('flagI'),
    flagM: document.getElementById('flagM'),
    flagS: document.getElementById('flagS'),

    // Test String
    testString: document.getElementById('testString'),
    highlightedText: document.getElementById('highlightedText'),
    matchCount: document.getElementById('matchCount'),

    // Results
    resultsTabs: document.querySelectorAll('.results-tab'),
    matchesTab: document.getElementById('matchesTab'),
    groupsTab: document.getElementById('groupsTab'),
    replaceTab: document.getElementById('replaceTab'),
    matchesList: document.getElementById('matchesList'),
    groupsList: document.getElementById('groupsList'),
    replacePattern: document.getElementById('replacePattern'),
    replaceResult: document.getElementById('replaceResult'),
    copyReplaceBtn: document.getElementById('copyReplaceBtn'),

    // Quick Patterns
    quickPatterns: document.getElementById('quickPatterns'),

    // Actions
    clearBtn: document.getElementById('clearBtn'),
    helpBtn: document.getElementById('helpBtn'),

    // Cheatsheet
    cheatsheetModal: document.getElementById('cheatsheetModal'),
    closeCheatsheetBtn: document.getElementById('closeCheatsheetBtn'),

    // Shortcuts
    shortcutsHint: document.getElementById('shortcutsHint'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),

    // Other
    toast: document.getElementById('toast'),
    currentYear: document.getElementById('current-year')
  };

  // ============================================
  // Initialization
  // ============================================
  // Theme & footer year handled by tools-common.js

  function init() {
    initEventListeners();
  }

  function initEventListeners() {
    // Pattern and test string input
    elements.patternInput?.addEventListener('input', debounce(testRegex, 150));
    elements.testString?.addEventListener('input', debounce(testRegex, 150));

    // Flags
    [elements.flagG, elements.flagI, elements.flagM, elements.flagS].forEach(flag => {
      flag?.addEventListener('change', testRegex);
    });

    // Replace pattern
    elements.replacePattern?.addEventListener('input', debounce(updateReplace, 150));

    // Result tabs
    elements.resultsTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Quick patterns
    elements.quickPatterns?.addEventListener('click', (e) => {
      const chip = e.target.closest('.pattern-chip');
      if (chip) {
        elements.patternInput.value = chip.dataset.pattern;
        testRegex();
      }
    });

    // Actions
    elements.clearBtn?.addEventListener('click', clearAll);
    elements.helpBtn?.addEventListener('click', () => {
      elements.cheatsheetModal.classList.add('show');
    });

    // Cheatsheet modal
    elements.closeCheatsheetBtn?.addEventListener('click', () => {
      elements.cheatsheetModal.classList.remove('show');
    });
    elements.cheatsheetModal?.addEventListener('click', (e) => {
      if (e.target === elements.cheatsheetModal) {
        elements.cheatsheetModal.classList.remove('show');
      }
    });

    // Copy replace
    elements.copyReplaceBtn?.addEventListener('click', copyReplaceResult);

    // Keyboard shortcuts (shortcut modal handled by tools-common.js)
    document.addEventListener('keydown', (e) => {
      // Skip if typing in input
      if (e.target.matches('input, textarea')) return;

      // Open cheatsheet with 'H'
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        elements.cheatsheetModal?.classList.add('show');
      }
      // Clear all with 'C'
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
      // Close cheatsheet with Escape
      if (e.key === 'Escape') {
        elements.cheatsheetModal?.classList.remove('show');
      }
    });
  }

  // ============================================
  // Regex Testing
  // ============================================
  function testRegex() {
    const pattern = elements.patternInput.value;
    const testStr = elements.testString.value;

    // Clear if empty
    if (!pattern) {
      clearResults();
      elements.highlightedText.innerHTML = escapeHtml(testStr);
      return;
    }

    // Build regex
    let regex;
    try {
      const flags = getFlags();
      regex = new RegExp(pattern, flags);
      hideError();
    } catch (e) {
      showError(e.message);
      clearResults();
      elements.highlightedText.innerHTML = escapeHtml(testStr);
      return;
    }

    // Find matches
    const matches = [];
    let match;

    if (regex.global) {
      while ((match = regex.exec(testStr)) !== null) {
        matches.push({
          value: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || {}
        });
        // Prevent infinite loop for zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(testStr);
      if (match) {
        matches.push({
          value: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || {}
        });
      }
    }

    // Update UI
    updateMatchCount(matches.length);
    highlightMatches(testStr, matches);
    renderMatches(matches);
    renderGroups(matches);
    updateReplace();
  }

  function getFlags() {
    let flags = '';
    if (elements.flagG.checked) flags += 'g';
    if (elements.flagI.checked) flags += 'i';
    if (elements.flagM.checked) flags += 'm';
    if (elements.flagS.checked) flags += 's';
    return flags;
  }

  // ============================================
  // Highlighting
  // ============================================
  function highlightMatches(text, matches) {
    if (matches.length === 0) {
      elements.highlightedText.innerHTML = escapeHtml(text);
      return;
    }

    let result = '';
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Add text before match
      result += escapeHtml(text.slice(lastIndex, match.index));
      // Add highlighted match (alternate colors)
      const className = i % 2 === 0 ? 'match' : 'match-alt';
      result += `<span class="${className}">${escapeHtml(match.value)}</span>`;
      lastIndex = match.index + match.value.length;
    });

    // Add remaining text
    result += escapeHtml(text.slice(lastIndex));

    elements.highlightedText.innerHTML = result;
  }

  // ============================================
  // Results Display
  // ============================================
  function renderMatches(matches) {
    if (matches.length === 0) {
      elements.matchesList.innerHTML = `
        <div class="results-empty">
          <i class="fa-solid fa-search"></i>
          <p>No matches found</p>
        </div>
      `;
      return;
    }

    elements.matchesList.innerHTML = matches.map((match, i) => `
      <div class="match-item">
        <span class="match-index">${i + 1}</span>
        <span class="match-value">${escapeHtml(match.value)}</span>
        <span class="match-position">pos: ${match.index}</span>
      </div>
    `).join('');
  }

  function renderGroups(matches) {
    const hasGroups = matches.some(m => m.groups.length > 0 || Object.keys(m.namedGroups).length > 0);

    if (!hasGroups || matches.length === 0) {
      elements.groupsList.innerHTML = `
        <div class="results-empty">
          <i class="fa-solid fa-object-group"></i>
          <p>No capture groups found</p>
        </div>
      `;
      return;
    }

    elements.groupsList.innerHTML = matches.map((match, i) => {
      const groupItems = match.groups.map((g, gi) => `
        <div class="group-item">
          <span class="group-name">Group ${gi + 1}</span>
          <span class="group-value">${g !== undefined ? escapeHtml(g) : '(empty)'}</span>
        </div>
      `).join('');

      const namedItems = Object.entries(match.namedGroups).map(([name, value]) => `
        <div class="group-item">
          <span class="group-name">${escapeHtml(name)}</span>
          <span class="group-value">${value !== undefined ? escapeHtml(value) : '(empty)'}</span>
        </div>
      `).join('');

      return `
        <div class="group-match">
          <div class="group-match-header">Match ${i + 1}: "${escapeHtml(match.value)}"</div>
          <div class="group-items">
            ${groupItems}
            ${namedItems}
          </div>
        </div>
      `;
    }).join('');
  }

  function updateReplace() {
    const pattern = elements.patternInput.value;
    const testStr = elements.testString.value;
    const replacement = elements.replacePattern.value;

    if (!pattern || !testStr) {
      elements.replaceResult.textContent = '';
      return;
    }

    try {
      const flags = getFlags();
      const regex = new RegExp(pattern, flags);
      const result = testStr.replace(regex, replacement);
      elements.replaceResult.textContent = result;
    } catch (e) {
      elements.replaceResult.textContent = 'Invalid regex';
    }
  }

  function updateMatchCount(count) {
    elements.matchCount.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
  }

  // ============================================
  // Tab Switching
  // ============================================
  function switchTab(tab) {
    state.currentTab = tab;

    elements.resultsTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    elements.matchesTab.classList.toggle('active', tab === 'matches');
    elements.groupsTab.classList.toggle('active', tab === 'groups');
    elements.replaceTab.classList.toggle('active', tab === 'replace');
  }

  // ============================================
  // Error Handling
  // ============================================
  function showError(message) {
    elements.patternError.textContent = message;
    elements.patternError.classList.add('show');
  }

  function hideError() {
    elements.patternError.classList.remove('show');
  }

  // ============================================
  // Actions
  // ============================================
  function clearAll() {
    elements.patternInput.value = '';
    elements.testString.value = '';
    elements.replacePattern.value = '';
    clearResults();
    elements.highlightedText.innerHTML = '';
    hideError();
    showToast('Cleared', 'success');
  }

  function clearResults() {
    elements.matchCount.textContent = '0 matches';
    elements.matchesList.innerHTML = `
      <div class="results-empty">
        <i class="fa-solid fa-search"></i>
        <p>Enter a pattern and test string to see matches</p>
      </div>
    `;
    elements.groupsList.innerHTML = `
      <div class="results-empty">
        <i class="fa-solid fa-object-group"></i>
        <p>Capture groups will appear here</p>
      </div>
    `;
    elements.replaceResult.textContent = '';
  }

  function copyReplaceResult() {
    const result = elements.replaceResult.textContent;
    if (!result) {
      showToast('Nothing to copy', 'error');
      return;
    }

    navigator.clipboard.writeText(result).then(() => {
      showToast('Copied!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  // ============================================
  // Utilities
  // ============================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
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
