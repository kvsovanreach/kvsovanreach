/**
 * Whitespace Stripper Tool
 * Clean up text by removing extra whitespace
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    cleanBtn: document.getElementById('cleanBtn'),
    copyBtn: document.getElementById('copyBtn'),
    useAsInputBtn: document.getElementById('useAsInputBtn'),
    // Stats
    inputChars: document.getElementById('inputChars'),
    inputLines: document.getElementById('inputLines'),
    inputSpaces: document.getElementById('inputSpaces'),
    outputChars: document.getElementById('outputChars'),
    outputLines: document.getElementById('outputLines'),
    removedChars: document.getElementById('removedChars'),
    // Options
    optTrimLines: document.getElementById('optTrimLines'),
    optMultipleSpaces: document.getElementById('optMultipleSpaces'),
    optBlankLines: document.getElementById('optBlankLines'),
    optMultipleBlankLines: document.getElementById('optMultipleBlankLines'),
    optTabs: document.getElementById('optTabs'),
    optNonBreaking: document.getElementById('optNonBreaking')
  };

  // ==================== Update Input Stats ====================
  function updateInputStats() {
    const text = elements.inputText.value;
    elements.inputChars.textContent = text.length;
    elements.inputLines.textContent = text ? text.split('\n').length : 0;
    elements.inputSpaces.textContent = (text.match(/\s/g) || []).length;
  }

  // ==================== Update Output Stats ====================
  function updateOutputStats() {
    const input = elements.inputText.value;
    const output = elements.outputText.value;

    elements.outputChars.textContent = output.length;
    elements.outputLines.textContent = output ? output.split('\n').length : 0;
    elements.removedChars.textContent = input.length - output.length;
  }

  // ==================== Clean Text ====================
  function cleanText() {
    let text = elements.inputText.value;

    if (!text) {
      ToolsCommon.showToast('Please enter some text', 'error');
      return;
    }

    // Convert tabs to spaces
    if (elements.optTabs.checked) {
      text = text.replace(/\t/g, '    ');
    }

    // Remove non-breaking spaces
    if (elements.optNonBreaking.checked) {
      text = text.replace(/\u00A0/g, ' ');
    }

    // Process line by line
    let lines = text.split('\n');

    // Trim leading/trailing spaces from each line
    if (elements.optTrimLines.checked) {
      lines = lines.map(line => line.trim());
    }

    // Remove multiple consecutive spaces
    if (elements.optMultipleSpaces.checked) {
      lines = lines.map(line => line.replace(/  +/g, ' '));
    }

    // Remove empty/blank lines
    if (elements.optBlankLines.checked) {
      lines = lines.filter(line => line.trim() !== '');
    }

    // Collapse multiple blank lines to one
    if (elements.optMultipleBlankLines.checked && !elements.optBlankLines.checked) {
      const result = [];
      let prevWasBlank = false;
      lines.forEach(line => {
        const isBlank = line.trim() === '';
        if (isBlank) {
          if (!prevWasBlank) {
            result.push(line);
          }
          prevWasBlank = true;
        } else {
          result.push(line);
          prevWasBlank = false;
        }
      });
      lines = result;
    }

    const cleaned = lines.join('\n');
    elements.outputText.value = cleaned;
    updateOutputStats();

    const removed = elements.inputText.value.length - cleaned.length;
    ToolsCommon.showToast(`Cleaned! Removed ${removed} characters`, 'success');
  }

  // ==================== Actions ====================
  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      updateInputStats();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function clearAll() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    updateInputStats();
    updateOutputStats();
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

  function useAsInput() {
    const output = elements.outputText.value;
    if (!output) {
      ToolsCommon.showToast('No output to use', 'error');
      return;
    }
    elements.inputText.value = output;
    elements.outputText.value = '';
    updateInputStats();
    updateOutputStats();
    ToolsCommon.showToast('Output moved to input', 'success');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Input changes
    elements.inputText.addEventListener('input', updateInputStats);

    // Action buttons
    elements.pasteBtn.addEventListener('click', pasteText);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.cleanBtn.addEventListener('click', cleanText);
    elements.copyBtn.addEventListener('click', copyOutput);
    elements.useAsInputBtn.addEventListener('click', useAsInput);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        cleanText();
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateInputStats();
    updateOutputStats();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
