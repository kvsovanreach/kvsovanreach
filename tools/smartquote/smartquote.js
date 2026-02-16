/**
 * KVSOVANREACH Smart Quote Fixer Tool
 * Convert straight quotes to smart curly quotes
 */

(function() {
  'use strict';

  // ==================== Sample Data ====================
  const SAMPLE_TEXT = `"This is a sample text," she said. "It's got 'nested' quotes too."

He replied: "I don't think that's right -- or is it?"

The years 2020-2024 were interesting... The range is 100-200.

"Why?" she asked. "Because it's the 'right' thing to do."`;

  // ==================== DOM Elements ====================
  const elements = {
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    summaryContent: document.getElementById('summaryContent'),
    smartQuotes: document.getElementById('smartQuotes'),
    smartApostrophes: document.getElementById('smartApostrophes'),
    emDashes: document.getElementById('emDashes'),
    enDashes: document.getElementById('enDashes'),
    ellipsis: document.getElementById('ellipsis'),
    trimSpaces: document.getElementById('trimSpaces'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn')
  };

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
      text = text.replace(/(^|[\s(\[{])"/g, '$1"');
      // Closing quote before whitespace, punctuation, or end
      text = text.replace(/"($|[\s)\]}.!?,;:])/g, '"$1');
      // Any remaining straight quotes become closing
      text = text.replace(/"/g, '"');
      const doubleQuotesAfter = (text.match(/[""]/g) || []).length;
      if (doubleQuotesBefore > 0) {
        changes['Double quotes'] = doubleQuotesBefore;
      }
    }

    // Smart single quotes / apostrophes
    if (elements.smartApostrophes.checked) {
      const singleQuotesBefore = (text.match(/'/g) || []).length;
      // Common contractions
      text = text.replace(/(\w)'(\w)/g, '$1'$2');
      // Opening single quote
      text = text.replace(/(^|[\s(\[{])'/g, '$1'');
      // Closing single quote
      text = text.replace(/'($|[\s)\]}.!?,;:])/g, ''$1');
      // Remaining become closing (apostrophes)
      text = text.replace(/'/g, ''');
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
      elements.summaryContent.innerHTML = '<span class="no-changes">No changes yet</span>';
      return;
    }

    elements.summaryContent.innerHTML = keys.map(key =>
      `<span class="change-badge">${key} <span class="count">${changes[key]}</span></span>`
    ).join('');
  }

  // ==================== Event Handlers ====================

  function handleClear() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    updateSummary({});
    ToolsCommon.Toast.show('Cleared', 'success');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      processText();
      ToolsCommon.Toast.show('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.Toast.show('Failed to paste', 'error');
    }
  }

  function handleSample() {
    elements.inputText.value = SAMPLE_TEXT;
    processText();
    ToolsCommon.Toast.show('Sample loaded', 'success');
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
    ToolsCommon.FileDownload.text(text, 'fixed-text.txt');
    ToolsCommon.Toast.show('Downloaded!', 'success');
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Input changes
    elements.inputText?.addEventListener('input', ToolsCommon.debounce(processText, 150));

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

    // Buttons
    elements.clearBtn?.addEventListener('click', handleClear);
    elements.pasteBtn?.addEventListener('click', handlePaste);
    elements.sampleBtn?.addEventListener('click', handleSample);
    elements.copyBtn?.addEventListener('click', handleCopy);
    elements.downloadBtn?.addEventListener('click', handleDownload);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
