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
    activeOperation: null
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Wrapper
    wrapper: document.querySelector('.cleaner-wrapper'),

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
    clearInputBtn: document.getElementById('clearInputBtn'),
    swapBtn: document.getElementById('swapBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    toggleOpsBtn: document.getElementById('toggleOpsBtn'),

    // Shortcuts
    shortcutsHint: document.getElementById('shortcutsHint'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),

    // Other
    toast: document.getElementById('toast'),
    activeOperationLabel: document.getElementById('activeOperationLabel')
  };

  // Operation names for display
  const operationNames = {
    removeDuplicates: 'Unique Words',
    sortAsc: 'Sort A-Z',
    sortDesc: 'Sort Z-A',
    sortNumAsc: 'Sort 1-9',
    sortNumDesc: 'Sort 9-1',
    reverseLines: 'Reverse',
    shuffleLines: 'Shuffle',
    trimLines: 'Trim',
    removeExtraSpaces: 'Compact',
    removeAllSpaces: 'No Spaces',
    removeLineBreaks: 'No Lines',
    uppercase: 'UPPERCASE',
    lowercase: 'lowercase',
    titleCase: 'Title Case',
    sentenceCase: 'Sentence',
    camelCase: 'camelCase',
    snakeCase: 'snake_case',
    kebabCase: 'kebab-case',
    addPrefix: 'Add Prefix',
    removePrefix: 'Remove Prefix',
    addSuffix: 'Add Suffix',
    removeSuffix: 'Remove Suffix',
    numberLines: 'Number Words',
    removeNumbers: 'Remove #',
    removeSpecialChars: 'Remove @',
    findReplace: 'Find & Replace'
  };

  // ============================================
  // Initialization
  // ============================================
  // Theme & footer year handled by tools-common.js

  function init() {
    initEventListeners();
    updateStats('input');
  }

  // Debounce for live processing
  const processLive = debounce(() => {
    if (state.activeOperation) {
      performOperation(state.activeOperation, true);
    }
  }, 150);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  function initEventListeners() {
    // Input changes - live processing
    elements.inputText?.addEventListener('input', () => {
      updateStats('input');
      processLive();
    });
    elements.outputText?.addEventListener('input', () => updateStats('output'));

    // Operation buttons - set active and process
    document.querySelectorAll('.op-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveOperation(btn.dataset.op);
        performOperation(btn.dataset.op);
        hideOperations();
      });
    });

    // Apply buttons (mini buttons for prefix/suffix)
    document.querySelectorAll('.mini-btn').forEach(btn => {
      if (btn.dataset.op) {
        btn.addEventListener('click', () => {
          setActiveOperation(btn.dataset.op);
          performOperation(btn.dataset.op);
          hideOperations();
        });
      }
    });

    // Replace button
    elements.replaceBtn?.addEventListener('click', () => {
      setActiveOperation('findReplace');
      performOperation('findReplace');
      hideOperations();
    });

    // Prefix/Suffix inputs - trigger live processing when changed
    elements.prefixInput?.addEventListener('input', processLive);
    elements.suffixInput?.addEventListener('input', processLive);
    elements.findInput?.addEventListener('input', processLive);
    elements.replaceInput?.addEventListener('input', processLive);

    // Action buttons
    elements.clearInputBtn?.addEventListener('click', clearInput);
    elements.swapBtn?.addEventListener('click', swapTexts);
    elements.pasteBtn?.addEventListener('click', pasteFromClipboard);
    elements.copyBtn?.addEventListener('click', copyOutput);
    elements.downloadBtn?.addEventListener('click', downloadOutput);
    elements.toggleOpsBtn?.addEventListener('click', toggleOperations);

    // Keyboard shortcuts (shortcut modal handled by tools-common.js)
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Operations
  // ============================================
  function setActiveOperation(op) {
    state.activeOperation = op;

    // Update active button styling
    document.querySelectorAll('.op-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.op === op);
    });
    document.querySelectorAll('.mini-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.op === op);
    });

    // Update the active operation label
    if (elements.activeOperationLabel) {
      if (op && operationNames[op]) {
        elements.activeOperationLabel.textContent = operationNames[op];
        elements.activeOperationLabel.classList.add('has-selection');
      } else {
        elements.activeOperationLabel.textContent = 'None selected';
        elements.activeOperationLabel.classList.remove('has-selection');
      }
    }
  }

  function performOperation(op, silent = false) {
    const input = elements.inputText.value;

    // For live processing, just clear output if no input
    if (!input) {
      elements.outputText.value = '';
      updateStats('output');
      return;
    }

    let result;
    const words = input.split(/\s+/).filter(w => w.length > 0);

    switch (op) {
      // Word Operations
      case 'removeDuplicates':
        result = [...new Set(words)].join(' ');
        if (!silent) showToast('Duplicates removed', 'success');
        break;

      case 'removeEmpty':
        result = words.join(' ');
        if (!silent) showToast('Empty removed', 'success');
        break;

      case 'sortAsc':
        result = [...words].sort((a, b) => a.localeCompare(b)).join(' ');
        if (!silent) showToast('Sorted A-Z', 'success');
        break;

      case 'sortDesc':
        result = [...words].sort((a, b) => b.localeCompare(a)).join(' ');
        if (!silent) showToast('Sorted Z-A', 'success');
        break;

      case 'sortNumAsc':
        result = [...words].sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.-]+/)?.[0]) || 0;
          const numB = parseFloat(b.match(/[\d.-]+/)?.[0]) || 0;
          return numA - numB;
        }).join(' ');
        if (!silent) showToast('Sorted numerically', 'success');
        break;

      case 'sortNumDesc':
        result = [...words].sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.-]+/)?.[0]) || 0;
          const numB = parseFloat(b.match(/[\d.-]+/)?.[0]) || 0;
          return numB - numA;
        }).join(' ');
        if (!silent) showToast('Sorted numerically (desc)', 'success');
        break;

      case 'reverseLines':
        result = [...words].reverse().join(' ');
        if (!silent) showToast('Words reversed', 'success');
        break;

      case 'shuffleLines':
        // Don't shuffle on live typing - only on button click
        if (silent) {
          result = input;
        } else {
          result = shuffleArray([...words]).join(' ');
          showToast('Words shuffled', 'success');
        }
        break;

      // Whitespace Operations
      case 'trimLines':
        result = input.trim();
        if (!silent) showToast('Trimmed', 'success');
        break;

      case 'removeExtraSpaces':
        result = input.replace(/\s+/g, ' ').trim();
        if (!silent) showToast('Extra spaces removed', 'success');
        break;

      case 'removeAllSpaces':
        result = input.replace(/\s/g, '');
        if (!silent) showToast('All spaces removed', 'success');
        break;

      case 'removeLineBreaks':
        result = input.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        if (!silent) showToast('Line breaks removed', 'success');
        break;

      // Case Conversion
      case 'uppercase':
        result = input.toUpperCase();
        if (!silent) showToast('Converted to uppercase', 'success');
        break;

      case 'lowercase':
        result = input.toLowerCase();
        if (!silent) showToast('Converted to lowercase', 'success');
        break;

      case 'titleCase':
        result = input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        if (!silent) showToast('Converted to Title Case', 'success');
        break;

      case 'sentenceCase':
        result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
        if (!silent) showToast('Converted to Sentence case', 'success');
        break;

      case 'camelCase':
        result = input.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
          .replace(/^[A-Z]/, c => c.toLowerCase());
        if (!silent) showToast('Converted to camelCase', 'success');
        break;

      case 'snakeCase':
        result = input.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '')
          .replace(/_+/g, '_');
        if (!silent) showToast('Converted to snake_case', 'success');
        break;

      case 'kebabCase':
        result = input.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .replace(/-+/g, '-');
        if (!silent) showToast('Converted to kebab-case', 'success');
        break;

      // Add/Remove
      case 'addPrefix':
        const prefix = elements.prefixInput.value;
        if (!prefix) {
          if (!silent) showToast('Please enter a prefix', 'error');
          result = input;
        } else {
          result = words.map(word => prefix + word).join(' ');
          if (!silent) showToast('Prefix added', 'success');
        }
        break;

      case 'removePrefix':
        const prefixToRemove = elements.prefixInput.value;
        if (!prefixToRemove) {
          if (!silent) showToast('Please enter a prefix to remove', 'error');
          result = input;
        } else {
          result = words.map(word =>
            word.startsWith(prefixToRemove) ? word.slice(prefixToRemove.length) : word
          ).join(' ');
          if (!silent) showToast('Prefix removed', 'success');
        }
        break;

      case 'addSuffix':
        const suffix = elements.suffixInput.value;
        if (!suffix) {
          if (!silent) showToast('Please enter a suffix', 'error');
          result = input;
        } else {
          result = words.map(word => word + suffix).join(' ');
          if (!silent) showToast('Suffix added', 'success');
        }
        break;

      case 'removeSuffix':
        const suffixToRemove = elements.suffixInput.value;
        if (!suffixToRemove) {
          if (!silent) showToast('Please enter a suffix to remove', 'error');
          result = input;
        } else {
          result = words.map(word =>
            word.endsWith(suffixToRemove) ? word.slice(0, -suffixToRemove.length) : word
          ).join(' ');
          if (!silent) showToast('Suffix removed', 'success');
        }
        break;

      case 'numberLines':
        result = words.map((word, i) => `${i + 1}.${word}`).join(' ');
        if (!silent) showToast('Words numbered', 'success');
        break;

      case 'removeNumbers':
        result = input.replace(/\d/g, '');
        if (!silent) showToast('Numbers removed', 'success');
        break;

      case 'removeSpecialChars':
        result = input.replace(/[^a-zA-Z0-9\s]/g, '');
        if (!silent) showToast('Special characters removed', 'success');
        break;

      // Find & Replace
      case 'findReplace':
        const find = elements.findInput.value;
        const replace = elements.replaceInput.value;
        const useRegex = elements.regexMode.checked;

        if (!find) {
          result = input;
          if (!silent) showToast('Please enter text to find', 'error');
        } else {
          try {
            if (useRegex) {
              const regex = new RegExp(find, 'g');
              result = input.replace(regex, replace);
            } else {
              result = input.split(find).join(replace);
            }
            if (!silent) {
              const count = (input.match(useRegex ? new RegExp(find, 'g') : new RegExp(escapeRegex(find), 'g')) || []).length;
              showToast(`Replaced ${count} occurrence(s)`, 'success');
            }
          } catch (e) {
            result = input;
            if (!silent) showToast('Invalid regex pattern', 'error');
          }
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

  function clearInput() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    updateStats('input');
    updateStats('output');
    showToast('Cleared', 'success');
  }

  function toggleOperations() {
    elements.wrapper?.classList.toggle('show-ops');
  }

  function hideOperations() {
    elements.wrapper?.classList.remove('show-ops');
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
    // Skip if user is typing in an input field
    if (e.target.matches('input, textarea')) {
      return;
    }

    // Don't capture browser shortcuts
    if (e.ctrlKey || e.metaKey) return;

    switch (e.key) {
      case '?':
        e.preventDefault();
        elements.shortcutsModal?.classList.add('show');
        break;
      case 'Escape':
        elements.shortcutsModal?.classList.remove('show');
        hideOperations();
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
