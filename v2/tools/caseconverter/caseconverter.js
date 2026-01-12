/**
 * Case Converter Tool
 * Convert text between different cases
 */

(function() {
  'use strict';

  // ==================== State ====================
  let currentCase = null;

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.case-tab'),
    panels: document.querySelectorAll('.case-panel'),
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    caseButtons: document.querySelectorAll('.case-btn'),
    charCount: document.getElementById('charCount'),
    wordCount: document.getElementById('wordCount'),
    caseLabel: document.getElementById('caseLabel'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    swapBtn: document.getElementById('swapBtn'),
    batchInput: document.getElementById('batchInput'),
    batchOutput: document.getElementById('batchOutput'),
    batchCase: document.getElementById('batchCase'),
    batchConvertBtn: document.getElementById('batchConvertBtn'),
    copyBatchBtn: document.getElementById('copyBatchBtn')
  };

  // ==================== Case Conversion Functions ====================
  const caseConverters = {
    uppercase: (text) => text.toUpperCase(),

    lowercase: (text) => text.toLowerCase(),

    titlecase: (text) => {
      return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    },

    sentencecase: (text) => {
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, char => char.toUpperCase());
    },

    camelcase: (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, char => char.toLowerCase());
    },

    pascalcase: (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[a-z]/, char => char.toUpperCase());
    },

    snakecase: (text) => {
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
    },

    kebabcase: (text) => {
      return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
    },

    constantcase: (text) => {
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toUpperCase();
    },

    togglecase: (text) => {
      return text.split('').map(char => {
        if (char === char.toUpperCase()) {
          return char.toLowerCase();
        }
        return char.toUpperCase();
      }).join('');
    },

    alternatecase: (text) => {
      let index = 0;
      return text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
          return index++ % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
        }
        return char;
      }).join('');
    },

    dotcase: (text) => {
      return text
        .replace(/([a-z])([A-Z])/g, '$1.$2')
        .replace(/[\s_-]+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '')
        .toLowerCase();
    }
  };

  // ==================== Case Labels ====================
  const caseLabels = {
    uppercase: 'UPPERCASE',
    lowercase: 'lowercase',
    titlecase: 'Title Case',
    sentencecase: 'Sentence case',
    camelcase: 'camelCase',
    pascalcase: 'PascalCase',
    snakecase: 'snake_case',
    kebabcase: 'kebab-case',
    constantcase: 'CONSTANT_CASE',
    togglecase: 'tOGGLE cASE',
    alternatecase: 'aLtErNaTe CaSe',
    dotcase: 'dot.case'
  };

  // ==================== Update Stats ====================
  function updateStats() {
    const text = elements.inputText.value;
    elements.charCount.textContent = text.length;
    elements.wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  // ==================== Convert Text ====================
  function convertText(caseType) {
    const input = elements.inputText.value;
    if (!input) {
      ToolsCommon.showToast('Please enter some text first', 'error');
      return;
    }

    const converter = caseConverters[caseType];
    if (converter) {
      elements.outputText.value = converter(input);
      currentCase = caseType;
      elements.caseLabel.textContent = caseLabels[caseType];

      // Update active button
      elements.caseButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.case === caseType);
      });
    }
  }

  // ==================== Batch Convert ====================
  function batchConvert() {
    const input = elements.batchInput.value;
    if (!input.trim()) {
      ToolsCommon.showToast('Please enter some text first', 'error');
      return;
    }

    const caseType = elements.batchCase.value;
    const converter = caseConverters[caseType];

    if (converter) {
      const lines = input.split('\n');
      const converted = lines.map(line => converter(line)).join('\n');
      elements.batchOutput.value = converted;
      ToolsCommon.showToast('Converted ' + lines.length + ' items', 'success');
    }
  }

  // ==================== Tab Switching ====================
  function switchTab(tab) {
    elements.tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    elements.panels.forEach(p => {
      p.classList.toggle('active', p.id === tab + 'Panel');
    });
  }

  // ==================== Actions ====================
  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      updateStats();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function clearText() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    currentCase = null;
    elements.caseLabel.textContent = 'Select a case to convert';
    elements.caseButtons.forEach(btn => btn.classList.remove('active'));
    updateStats();
    ToolsCommon.showToast('Cleared', 'success');
  }

  function copyOutput() {
    const output = elements.outputText.value;
    if (!output) {
      ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(output, 'Copied to clipboard!');
  }

  function swapText() {
    const output = elements.outputText.value;
    if (!output) {
      ToolsCommon.showToast('No output to swap', 'error');
      return;
    }
    elements.inputText.value = output;
    elements.outputText.value = '';
    currentCase = null;
    elements.caseLabel.textContent = 'Select a case to convert';
    elements.caseButtons.forEach(btn => btn.classList.remove('active'));
    updateStats();
    ToolsCommon.showToast('Swapped', 'success');
  }

  function copyBatch() {
    const output = elements.batchOutput.value;
    if (!output) {
      ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(output, 'Copied to clipboard!');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Input changes
    elements.inputText.addEventListener('input', () => {
      updateStats();
      // Auto-convert if a case is selected
      if (currentCase) {
        convertText(currentCase);
      }
    });

    // Case buttons
    elements.caseButtons.forEach(btn => {
      btn.addEventListener('click', () => convertText(btn.dataset.case));
    });

    // Action buttons
    elements.pasteBtn.addEventListener('click', pasteText);
    elements.clearBtn.addEventListener('click', clearText);
    elements.copyBtn.addEventListener('click', copyOutput);
    elements.swapBtn.addEventListener('click', swapText);

    // Batch
    elements.batchConvertBtn.addEventListener('click', batchConvert);
    elements.copyBatchBtn.addEventListener('click', copyBatch);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Skip if typing in input
      if (e.target.matches('textarea, input, select')) return;

      switch (e.key.toLowerCase()) {
        case 'u':
          e.preventDefault();
          convertText('uppercase');
          break;
        case 'l':
          e.preventDefault();
          convertText('lowercase');
          break;
        case 't':
          e.preventDefault();
          convertText('titlecase');
          break;
        case 's':
          e.preventDefault();
          convertText('sentencecase');
          break;
        case 'c':
          e.preventDefault();
          copyOutput();
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateStats();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
