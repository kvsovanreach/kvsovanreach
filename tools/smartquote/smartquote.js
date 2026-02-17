/**
 * Smart Quote Fixer Tool
 * Convert straight quotes to smart curly quotes
 */

(function() {
  'use strict';

  // ==================== Sample Data ====================
  const SAMPLE_TEXT = `"This is a sample text," she said. "It's got 'nested' quotes too."

He replied: "I don't think that's right -- or is it?"

The years 2020-2024 were interesting... The range is 100-200.

"Why?" she asked. "Because it's the 'right' thing to do."`;

  // ==================== Presets ====================
  const presets = {
    minimal: {
      smartQuotes: true,
      smartApostrophes: true,
      emDashes: false,
      enDashes: false,
      ellipsis: false,
      trimSpaces: false
    },
    standard: {
      smartQuotes: true,
      smartApostrophes: true,
      emDashes: true,
      enDashes: false,
      ellipsis: true,
      trimSpaces: false
    },
    full: {
      smartQuotes: true,
      smartApostrophes: true,
      emDashes: true,
      enDashes: true,
      ellipsis: true,
      trimSpaces: true
    }
  };

  // ==================== DOM Elements ====================
  const elements = {
    wrapper: document.querySelector('.smartquote-wrapper'),
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    changesSummary: document.getElementById('changesSummary'),
    // Options
    smartQuotes: document.getElementById('smartQuotes'),
    smartApostrophes: document.getElementById('smartApostrophes'),
    emDashes: document.getElementById('emDashes'),
    enDashes: document.getElementById('enDashes'),
    ellipsis: document.getElementById('ellipsis'),
    trimSpaces: document.getElementById('trimSpaces'),
    // Buttons
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    toggleOptionsBtn: document.getElementById('toggleOptionsBtn'),
    // Presets
    presetBtns: document.querySelectorAll('.preset-btn')
  };

  // ==================== Mobile Toggle ====================
  function toggleOptions() {
    elements.wrapper?.classList.toggle('show-options');
  }

  // ==================== Apply Preset ====================
  function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    elements.smartQuotes.checked = preset.smartQuotes;
    elements.smartApostrophes.checked = preset.smartApostrophes;
    elements.emDashes.checked = preset.emDashes;
    elements.enDashes.checked = preset.enDashes;
    elements.ellipsis.checked = preset.ellipsis;
    elements.trimSpaces.checked = preset.trimSpaces;

    // Update active state
    elements.presetBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetName);
    });

    // Reprocess text
    processText();

    ToolsCommon.showToast(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied`, 'success');
  }

  // ==================== Core Functions ====================
  function processText() {
    let text = elements.inputText.value;
    const changes = {};

    if (!text.trim()) {
      elements.outputText.value = '';
      updateSummary({});
      return;
    }

    // Smart double quotes
    if (elements.smartQuotes.checked) {
      const doubleQuotesBefore = (text.match(/"/g) || []).length;
      // Opening quote after whitespace or start
      text = text.replace(/(^|[\s(\[{])"/g, '$1\u201C');
      // Closing quote before whitespace, punctuation, or end
      text = text.replace(/"($|[\s)\]}.!?,;:])/g, '\u201D$1');
      // Any remaining straight quotes become closing
      text = text.replace(/"/g, '\u201D');
      if (doubleQuotesBefore > 0) {
        changes['Double quotes'] = doubleQuotesBefore;
      }
    }

    // Smart single quotes / apostrophes
    if (elements.smartApostrophes.checked) {
      const singleQuotesBefore = (text.match(/'/g) || []).length;
      // Common contractions
      text = text.replace(/(\w)'(\w)/g, '$1\u2019$2');
      // Opening single quote
      text = text.replace(/(^|[\s(\[{])'/g, '$1\u2018');
      // Closing single quote
      text = text.replace(/'($|[\s)\]}.!?,;:])/g, '\u2019$1');
      // Remaining become closing (apostrophes)
      text = text.replace(/'/g, '\u2019');
      if (singleQuotesBefore > 0) {
        changes['Single quotes'] = singleQuotesBefore;
      }
    }

    // Em dashes
    if (elements.emDashes.checked) {
      const emDashesBefore = (text.match(/--/g) || []).length;
      text = text.replace(/--/g, '—');
      if (emDashesBefore > 0) {
        changes['Em dashes'] = emDashesBefore;
      }
    }

    // En dashes (between numbers)
    if (elements.enDashes.checked) {
      const enDashMatches = text.match(/(\d)\s*-\s*(\d)/g) || [];
      text = text.replace(/(\d)\s*-\s*(\d)/g, '$1–$2');
      if (enDashMatches.length > 0) {
        changes['En dashes'] = enDashMatches.length;
      }
    }

    // Ellipsis
    if (elements.ellipsis.checked) {
      const ellipsisBefore = (text.match(/\.{3,}/g) || []).length;
      text = text.replace(/\.{3,}/g, '…');
      if (ellipsisBefore > 0) {
        changes['Ellipses'] = ellipsisBefore;
      }
    }

    // Trim trailing spaces
    if (elements.trimSpaces.checked) {
      const linesBefore = text.split('\n');
      const linesAfter = linesBefore.map(line => line.trimEnd());
      const trimmed = linesBefore.filter((line, i) => line !== linesAfter[i]).length;
      text = linesAfter.join('\n');
      if (trimmed > 0) {
        changes['Lines trimmed'] = trimmed;
      }
    }

    elements.outputText.value = text;
    updateSummary(changes);
  }

  function updateSummary(changes) {
    const keys = Object.keys(changes);

    if (keys.length === 0) {
      elements.changesSummary.innerHTML = '<span class="no-changes">No changes yet</span>';
      return;
    }

    elements.changesSummary.innerHTML = keys.map(key =>
      `<span class="change-badge">${key} <span class="count">${changes[key]}</span></span>`
    ).join('');
  }

  // ==================== Event Handlers ====================
  function handleClear() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    updateSummary({});
    ToolsCommon.showToast('Cleared', 'success');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      processText();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function handleSample() {
    elements.inputText.value = SAMPLE_TEXT;
    processText();
    ToolsCommon.showToast('Sample loaded', 'success');
  }

  function handleCopy() {
    const text = elements.outputText.value;
    if (!text) {
      ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(text, 'Copied to clipboard!');
  }

  function handleDownload() {
    const text = elements.outputText.value;
    if (!text) {
      ToolsCommon.showToast('Nothing to download', 'error');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fixed-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    ToolsCommon.showToast('Downloaded', 'success');
  }

  // ==================== Initialization ====================
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Input changes
    elements.inputText?.addEventListener('input', processText);

    // Mobile toggle
    elements.toggleOptionsBtn?.addEventListener('click', toggleOptions);

    // Options
    const options = [
      elements.smartQuotes,
      elements.smartApostrophes,
      elements.emDashes,
      elements.enDashes,
      elements.ellipsis,
      elements.trimSpaces
    ];

    options.forEach(opt => {
      opt?.addEventListener('change', processText);
    });

    // Preset buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Action Buttons
    elements.clearBtn?.addEventListener('click', handleClear);
    elements.pasteBtn?.addEventListener('click', handlePaste);
    elements.sampleBtn?.addEventListener('click', handleSample);
    elements.copyBtn?.addEventListener('click', handleCopy);
    elements.downloadBtn?.addEventListener('click', handleDownload);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close sidebar
      if (e.key === 'Escape') {
        if (elements.wrapper?.classList.contains('show-options')) {
          elements.wrapper.classList.remove('show-options');
        }
        return;
      }
    });
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
