/**
 * KVSOVANREACH Alphabetizer Tool
 * Sort and organize lists with various criteria
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    sortMethod: 'az',
    separator: 'newline'
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    inputStats: document.getElementById('inputStats'),
    outputStats: document.getElementById('outputStats'),
    sortTabs: document.querySelectorAll('.sort-tab'),
    removeDuplicates: document.getElementById('removeDuplicates'),
    trimWhitespace: document.getElementById('trimWhitespace'),
    removeEmpty: document.getElementById('removeEmpty'),
    caseInsensitive: document.getElementById('caseInsensitive'),
    separatorRadios: document.querySelectorAll('input[name="separator"]'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn')
  };

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
    const sep = document.querySelector('input[name="separator"]:checked').value;
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
    if (elements.trimWhitespace.checked) {
      items = items.map(item => item.trim());
    }

    // Remove empty lines
    if (elements.removeEmpty.checked) {
      items = items.filter(item => item.length > 0);
    }

    // Remove duplicates
    if (elements.removeDuplicates.checked) {
      if (elements.caseInsensitive.checked) {
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
    const caseInsensitive = elements.caseInsensitive.checked;

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
    const text = elements.inputText.value;

    if (!text.trim()) {
      elements.outputText.value = '';
      updateStats();
      return;
    }

    const items = parseInput(text);
    const sorted = sortItems(items);
    const separator = getSeparator();

    elements.outputText.value = sorted.join(separator);
    updateStats();
  }

  function updateStats() {
    const inputItems = elements.inputText.value.trim()
      ? parseInput(elements.inputText.value).length
      : 0;
    const outputItems = elements.outputText.value.trim()
      ? elements.outputText.value.split(getSeparator()).filter(i => i.trim()).length
      : 0;

    elements.inputStats.textContent = `${inputItems} item${inputItems !== 1 ? 's' : ''}`;
    elements.outputStats.textContent = `${outputItems} item${outputItems !== 1 ? 's' : ''}`;
  }

  // ==================== Event Handlers ====================

  function handleSortTabClick(e) {
    const tab = e.target.closest('.sort-tab');
    if (!tab) return;

    elements.sortTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.sortMethod = tab.dataset.sort;
    processInput();
  }

  function handleClear() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    updateStats();
    ToolsCommon.Toast.show('Cleared', 'success');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      processInput();
      ToolsCommon.Toast.show('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.Toast.show('Failed to paste', 'error');
    }
  }

  function handleSample() {
    elements.inputText.value = SAMPLE_DATA;
    processInput();
    ToolsCommon.Toast.show('Sample data loaded', 'success');
  }

  async function handleCopy() {
    const text = elements.outputText.value;
    if (!text) {
      ToolsCommon.Toast.show('Nothing to copy', 'error');
      return;
    }
    await ToolsCommon.Clipboard.copyWithToast(text, 'Copied to clipboard!');
  }

  function handleDownload() {
    const text = elements.outputText.value;
    if (!text) {
      ToolsCommon.Toast.show('Nothing to download', 'error');
      return;
    }
    ToolsCommon.FileDownload.text(text, 'sorted-list.txt');
    ToolsCommon.Toast.show('Downloaded!', 'success');
  }

  function handleKeydown(e) {
    // Skip if in input
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    // Number keys for sort methods
    if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const sortMethods = ['az', 'za', 'length-asc', 'length-desc'];
      const index = parseInt(e.key) - 1;
      const tab = document.querySelector(`.sort-tab[data-sort="${sortMethods[index]}"]`);
      if (tab) {
        elements.sortTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.sortMethod = sortMethods[index];
        processInput();
      }
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    updateStats();
  }

  function setupEventListeners() {
    // Input changes
    elements.inputText?.addEventListener('input', ToolsCommon.debounce(processInput, 150));

    // Sort tabs
    elements.sortTabs.forEach(tab => {
      tab.addEventListener('click', handleSortTabClick);
    });

    // Options
    elements.removeDuplicates?.addEventListener('change', processInput);
    elements.trimWhitespace?.addEventListener('change', processInput);
    elements.removeEmpty?.addEventListener('change', processInput);
    elements.caseInsensitive?.addEventListener('change', processInput);

    // Separator
    elements.separatorRadios.forEach(radio => {
      radio.addEventListener('change', processInput);
    });

    // Buttons
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
