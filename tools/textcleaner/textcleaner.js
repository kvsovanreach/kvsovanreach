/**
 * Text Cleaner Tool
 * Clean and transform text with various operations
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark'
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Input/Output
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),

    // Stats
    inputChars: document.getElementById('inputChars'),
    inputWords: document.getElementById('inputWords'),
    inputLines: document.getElementById('inputLines'),
    outputChars: document.getElementById('outputChars'),
    outputWords: document.getElementById('outputWords'),
    outputLines: document.getElementById('outputLines'),

    // Prefix/Suffix
    prefixInput: document.getElementById('prefixInput'),
    suffixInput: document.getElementById('suffixInput'),

    // Find/Replace
    findInput: document.getElementById('findInput'),
    replaceInput: document.getElementById('replaceInput'),
    replaceBtn: document.getElementById('replaceBtn'),
    regexMode: document.getElementById('regexMode'),

    // Action buttons
    clearBtn: document.getElementById('clearBtn'),
    swapBtn: document.getElementById('swapBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

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
    updateStats('input');
  }

  function initEventListeners() {
    // Input changes
    elements.inputText?.addEventListener('input', () => updateStats('input'));
    elements.outputText?.addEventListener('input', () => updateStats('output'));

    // Operation buttons
    document.querySelectorAll('.op-btn').forEach(btn => {
      btn.addEventListener('click', () => performOperation(btn.dataset.op));
    });

    // Apply buttons
    document.querySelectorAll('.apply-btn').forEach(btn => {
      if (btn.dataset.op) {
        btn.addEventListener('click', () => performOperation(btn.dataset.op));
      }
    });

    // Replace button
    elements.replaceBtn?.addEventListener('click', () => performOperation('findReplace'));

    // Action buttons
    elements.clearBtn?.addEventListener('click', clearAll);
    elements.swapBtn?.addEventListener('click', swapTexts);
    elements.pasteBtn?.addEventListener('click', pasteFromClipboard);
    elements.copyBtn?.addEventListener('click', copyOutput);
    elements.downloadBtn?.addEventListener('click', downloadOutput);

    // Keyboard shortcuts (shortcut modal handled by tools-common.js)
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Operations
  // ============================================
  function performOperation(op) {
    const input = elements.inputText.value;
    if (!input && !['findReplace'].includes(op)) {
      showToast('Please enter some text first', 'error');
      return;
    }

    let result;
    const lines = input.split('\n');

    switch (op) {
      // Line Operations
      case 'removeDuplicates':
        result = [...new Set(lines)].join('\n');
        showToast('Duplicates removed', 'success');
        break;

      case 'removeEmpty':
        result = lines.filter(line => line.trim() !== '').join('\n');
        showToast('Empty lines removed', 'success');
        break;

      case 'sortAsc':
        result = [...lines].sort((a, b) => a.localeCompare(b)).join('\n');
        showToast('Sorted A-Z', 'success');
        break;

      case 'sortDesc':
        result = [...lines].sort((a, b) => b.localeCompare(a)).join('\n');
        showToast('Sorted Z-A', 'success');
        break;

      case 'sortNumAsc':
        result = [...lines].sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.-]+/)?.[0]) || 0;
          const numB = parseFloat(b.match(/[\d.-]+/)?.[0]) || 0;
          return numA - numB;
        }).join('\n');
        showToast('Sorted numerically', 'success');
        break;

      case 'sortNumDesc':
        result = [...lines].sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.-]+/)?.[0]) || 0;
          const numB = parseFloat(b.match(/[\d.-]+/)?.[0]) || 0;
          return numB - numA;
        }).join('\n');
        showToast('Sorted numerically (desc)', 'success');
        break;

      case 'reverseLines':
        result = [...lines].reverse().join('\n');
        showToast('Lines reversed', 'success');
        break;

      case 'shuffleLines':
        result = shuffleArray([...lines]).join('\n');
        showToast('Lines shuffled', 'success');
        break;

      // Whitespace Operations
      case 'trimLines':
        result = lines.map(line => line.trim()).join('\n');
        showToast('Lines trimmed', 'success');
        break;

      case 'removeExtraSpaces':
        result = lines.map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        showToast('Extra spaces removed', 'success');
        break;

      case 'removeAllSpaces':
        result = input.replace(/\s/g, '');
        showToast('All spaces removed', 'success');
        break;

      case 'removeLineBreaks':
        result = lines.join(' ').replace(/\s+/g, ' ').trim();
        showToast('Line breaks removed', 'success');
        break;

      // Case Conversion
      case 'uppercase':
        result = input.toUpperCase();
        showToast('Converted to uppercase', 'success');
        break;

      case 'lowercase':
        result = input.toLowerCase();
        showToast('Converted to lowercase', 'success');
        break;

      case 'titleCase':
        result = input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        showToast('Converted to Title Case', 'success');
        break;

      case 'sentenceCase':
        result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
        showToast('Converted to Sentence case', 'success');
        break;

      case 'camelCase':
        result = lines.map(line => {
          return line.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
            .replace(/^[A-Z]/, c => c.toLowerCase());
        }).join('\n');
        showToast('Converted to camelCase', 'success');
        break;

      case 'snakeCase':
        result = lines.map(line => {
          return line.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .replace(/_+/g, '_');
        }).join('\n');
        showToast('Converted to snake_case', 'success');
        break;

      case 'kebabCase':
        result = lines.map(line => {
          return line.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/-+/g, '-');
        }).join('\n');
        showToast('Converted to kebab-case', 'success');
        break;

      // Add/Remove
      case 'addPrefix':
        const prefix = elements.prefixInput.value;
        if (!prefix) {
          showToast('Please enter a prefix', 'error');
          return;
        }
        result = lines.map(line => prefix + line).join('\n');
        showToast('Prefix added', 'success');
        break;

      case 'removePrefix':
        const prefixToRemove = elements.prefixInput.value;
        if (!prefixToRemove) {
          showToast('Please enter a prefix to remove', 'error');
          return;
        }
        result = lines.map(line =>
          line.startsWith(prefixToRemove) ? line.slice(prefixToRemove.length) : line
        ).join('\n');
        showToast('Prefix removed', 'success');
        break;

      case 'addSuffix':
        const suffix = elements.suffixInput.value;
        if (!suffix) {
          showToast('Please enter a suffix', 'error');
          return;
        }
        result = lines.map(line => line + suffix).join('\n');
        showToast('Suffix added', 'success');
        break;

      case 'removeSuffix':
        const suffixToRemove = elements.suffixInput.value;
        if (!suffixToRemove) {
          showToast('Please enter a suffix to remove', 'error');
          return;
        }
        result = lines.map(line =>
          line.endsWith(suffixToRemove) ? line.slice(0, -suffixToRemove.length) : line
        ).join('\n');
        showToast('Suffix removed', 'success');
        break;

      case 'numberLines':
        result = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        showToast('Lines numbered', 'success');
        break;

      case 'removeNumbers':
        result = input.replace(/\d/g, '');
        showToast('Numbers removed', 'success');
        break;

      case 'removeSpecialChars':
        result = input.replace(/[^a-zA-Z0-9\s\n]/g, '');
        showToast('Special characters removed', 'success');
        break;

      // Find & Replace
      case 'findReplace':
        const find = elements.findInput.value;
        const replace = elements.replaceInput.value;
        const useRegex = elements.regexMode.checked;

        if (!find) {
          showToast('Please enter text to find', 'error');
          return;
        }

        try {
          if (useRegex) {
            const regex = new RegExp(find, 'g');
            result = input.replace(regex, replace);
          } else {
            result = input.split(find).join(replace);
          }
          const count = (input.match(useRegex ? new RegExp(find, 'g') : new RegExp(escapeRegex(find), 'g')) || []).length;
          showToast(`Replaced ${count} occurrence(s)`, 'success');
        } catch (e) {
          showToast('Invalid regex pattern', 'error');
          return;
        }
        break;

      default:
        return;
    }

    elements.outputText.value = result;
    updateStats('output');
  }

  // ============================================
  // Utility Functions
  // ============================================
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function updateStats(type) {
    const text = type === 'input' ? elements.inputText.value : elements.outputText.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;

    if (type === 'input') {
      elements.inputChars.textContent = `${chars.toLocaleString()} chars`;
      elements.inputWords.textContent = `${words.toLocaleString()} words`;
      elements.inputLines.textContent = `${lines.toLocaleString()} lines`;
    } else {
      elements.outputChars.textContent = `${chars.toLocaleString()} chars`;
      elements.outputWords.textContent = `${words.toLocaleString()} words`;
      elements.outputLines.textContent = `${lines.toLocaleString()} lines`;
    }
  }

  function clearAll() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    elements.prefixInput.value = '';
    elements.suffixInput.value = '';
    elements.findInput.value = '';
    elements.replaceInput.value = '';
    updateStats('input');
    updateStats('output');
    showToast('Cleared', 'success');
  }

  function swapTexts() {
    const temp = elements.inputText.value;
    elements.inputText.value = elements.outputText.value;
    elements.outputText.value = temp;
    updateStats('input');
    updateStats('output');
    showToast('Swapped', 'success');
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      updateStats('input');
      showToast('Pasted from clipboard', 'success');
    } catch (error) {
      showToast('Failed to paste', 'error');
    }
  }

  function copyOutput() {
    const output = elements.outputText.value;
    if (!output) {
      showToast('Nothing to copy', 'error');
      return;
    }

    navigator.clipboard.writeText(output).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  function downloadOutput() {
    const output = elements.outputText.value;
    if (!output) {
      showToast('Nothing to download', 'error');
      return;
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded', 'success');
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    if (e.target.matches('input, textarea')) {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        swapTexts();
      }
      return;
    }

    switch (e.key) {
      case '?':
        e.preventDefault();
        elements.shortcutsModal?.classList.add('show');
        break;
      case 'Escape':
        elements.shortcutsModal?.classList.remove('show');
        break;
    }
  }

  // ============================================
  // Toast
  // ============================================
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
