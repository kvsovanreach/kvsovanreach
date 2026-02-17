/**
 * KVSOVANREACH Alphabetizer Tool
 * Sort and organize lists with various criteria
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    sortMethod: 'az',
    separator: 'newline',
    options: {
      removeDuplicates: false,
      trimWhitespace: true,
      removeEmpty: true,
      caseInsensitive: false
    }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.inputText = document.getElementById('inputText');
    elements.outputText = document.getElementById('outputText');
    elements.inputStats = document.getElementById('inputStats');
    elements.outputStats = document.getElementById('outputStats');
    elements.sortTabs = document.querySelectorAll('.tool-tab');
    elements.removeDuplicates = document.getElementById('removeDuplicates');
    elements.trimWhitespace = document.getElementById('trimWhitespace');
    elements.removeEmpty = document.getElementById('removeEmpty');
    elements.caseInsensitive = document.getElementById('caseInsensitive');
    elements.separatorRadios = document.querySelectorAll('input[name="separator"]');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.pasteBtn = document.getElementById('pasteBtn');
    elements.sampleBtn = document.getElementById('sampleBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.downloadBtn = document.getElementById('downloadBtn');
  }

  // ==================== Sample Data ====================
  const SAMPLE_DATA = `banana
Apple
cherry
Date
elderberry
Fig
grape
Apple
Honeydew
cherry
Kiwi
Lemon
Mango`;

  // ==================== Core Functions ====================

  function getSeparator() {
    const sep = document.querySelector('input[name="separator"]:checked')?.value;
    switch (sep) {
      case 'comma': return ',';
      case 'semicolon': return ';';
      default: return '\n';
    }
  }

  function parseInput(text) {
    const separator = getSeparator();
    let items = text.split(separator);

    // Trim whitespace
    if (elements.trimWhitespace?.checked) {
      items = items.map(item => item.trim());
    }

    // Remove empty lines
    if (elements.removeEmpty?.checked) {
      items = items.filter(item => item.length > 0);
    }

    // Remove duplicates
    if (elements.removeDuplicates?.checked) {
      if (elements.caseInsensitive?.checked) {
        const seen = new Set();
        items = items.filter(item => {
          const lower = item.toLowerCase();
          if (seen.has(lower)) return false;
          seen.add(lower);
          return true;
        });
      } else {
        items = [...new Set(items)];
      }
    }

    return items;
  }

  function sortItems(items) {
    const caseInsensitive = elements.caseInsensitive?.checked;

    switch (state.sortMethod) {
      case 'az':
        return items.sort((a, b) => {
          const compareA = caseInsensitive ? a.toLowerCase() : a;
          const compareB = caseInsensitive ? b.toLowerCase() : b;
          return compareA.localeCompare(compareB);
        });

      case 'za':
        return items.sort((a, b) => {
          const compareA = caseInsensitive ? a.toLowerCase() : a;
          const compareB = caseInsensitive ? b.toLowerCase() : b;
          return compareB.localeCompare(compareA);
        });

      case 'length-asc':
        return items.sort((a, b) => a.length - b.length);

      case 'length-desc':
        return items.sort((a, b) => b.length - a.length);

      default:
        return items;
    }
  }

  function processInput() {
    const text = elements.inputText?.value;

    if (!text?.trim()) {
      if (elements.outputText) elements.outputText.value = '';
      updateStats();
      return;
    }

    const items = parseInput(text);
    const sorted = sortItems(items);
    const separator = getSeparator();

    if (elements.outputText) elements.outputText.value = sorted.join(separator);
    updateStats();
  }

  function updateStats() {
    const inputItems = elements.inputText?.value?.trim()
      ? parseInput(elements.inputText.value).length
      : 0;
    const outputItems = elements.outputText?.value?.trim()
      ? elements.outputText.value.split(getSeparator()).filter(i => i.trim()).length
      : 0;

    if (elements.inputStats) {
      elements.inputStats.textContent = `${inputItems} item${inputItems !== 1 ? 's' : ''}`;
    }
    if (elements.outputStats) {
      elements.outputStats.textContent = `${outputItems} item${outputItems !== 1 ? 's' : ''}`;
    }
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function resetForm() {
    state.sortMethod = 'az';
    state.separator = 'newline';
    state.options = {
      removeDuplicates: false,
      trimWhitespace: true,
      removeEmpty: true,
      caseInsensitive: false
    };

    if (elements.inputText) elements.inputText.value = '';
    if (elements.outputText) elements.outputText.value = '';

    elements.sortTabs?.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.sort === 'az');
    });

    if (elements.removeDuplicates) elements.removeDuplicates.checked = false;
    if (elements.trimWhitespace) elements.trimWhitespace.checked = true;
    if (elements.removeEmpty) elements.removeEmpty.checked = true;
    if (elements.caseInsensitive) elements.caseInsensitive.checked = false;

    elements.separatorRadios?.forEach(radio => {
      radio.checked = radio.value === 'newline';
    });

    updateStats();
    showToast('Reset', 'success');
  }

  // ==================== Event Handlers ====================

  function handleSortTabClick(e) {
    const tab = e.target.closest('.tool-tab');
    if (!tab) return;

    elements.sortTabs?.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.sortMethod = tab.dataset.sort;
    processInput();
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Copied!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function handleClear() {
    if (elements.inputText) elements.inputText.value = '';
    if (elements.outputText) elements.outputText.value = '';
    updateStats();
    showToast('Cleared', 'success');
  }

  async function handlePaste() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (elements.inputText) elements.inputText.value = text;
        processInput();
        showToast('Pasted', 'success');
      } else {
        showToast('Use Ctrl+V to paste', 'info');
        elements.inputText?.focus();
      }
    } catch (err) {
      showToast('Use Ctrl+V to paste', 'info');
      elements.inputText?.focus();
    }
  }

  function handleSample() {
    if (elements.inputText) elements.inputText.value = SAMPLE_DATA;
    processInput();
    showToast('Sample loaded', 'success');
  }

  async function handleCopy() {
    const text = elements.outputText?.value;
    if (!text) {
      showToast('Nothing to copy', 'error');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('Copied!', 'success');
      } else {
        fallbackCopy(text);
      }
    } catch (err) {
      fallbackCopy(text);
    }
  }

  function handleDownload() {
    const text = elements.outputText?.value;
    if (!text) {
      showToast('Nothing to download', 'error');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sorted-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded', 'success');
  }

  function handleKeydown(e) {
    // Skip if in input
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    // R key for reset
    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
      return;
    }

    // Number keys for sort methods
    if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const sortMethods = ['az', 'za', 'length-asc', 'length-desc'];
      const index = parseInt(e.key) - 1;
      const tab = document.querySelector(`.tool-tab[data-sort="${sortMethods[index]}"]`);
      if (tab) {
        elements.sortTabs?.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.sortMethod = sortMethods[index];
        processInput();
      }
    }
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
    updateStats();
  }

  function setupEventListeners() {
    // Input changes
    elements.inputText?.addEventListener('input', ToolsCommon?.debounce?.(processInput, 150) || processInput);

    // Sort tabs
    elements.sortTabs?.forEach(tab => {
      tab.addEventListener('click', handleSortTabClick);
    });

    // Options
    elements.removeDuplicates?.addEventListener('change', processInput);
    elements.trimWhitespace?.addEventListener('change', processInput);
    elements.removeEmpty?.addEventListener('change', processInput);
    elements.caseInsensitive?.addEventListener('change', processInput);

    // Separator
    elements.separatorRadios?.forEach(radio => {
      radio.addEventListener('change', processInput);
    });

    // Buttons
    elements.resetBtn?.addEventListener('click', resetForm);
    elements.clearBtn?.addEventListener('click', handleClear);
    elements.pasteBtn?.addEventListener('click', handlePaste);
    elements.sampleBtn?.addEventListener('click', handleSample);
    elements.copyBtn?.addEventListener('click', handleCopy);
    elements.downloadBtn?.addEventListener('click', handleDownload);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
