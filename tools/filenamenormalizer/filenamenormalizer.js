/**
 * KVSOVANREACH Filename Normalizer
 * Clean and normalize filenames
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    results: []
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.filenameInput = document.getElementById('filenameInput');
    elements.formatSelect = document.getElementById('formatSelect');
    elements.removeSpecial = document.getElementById('removeSpecial');
    elements.removeDuplicates = document.getElementById('removeDuplicates');
    elements.preserveExtension = document.getElementById('preserveExtension');
    elements.trimNumbers = document.getElementById('trimNumbers');
    elements.resultsContent = document.getElementById('resultsContent');
    elements.previewSection = document.getElementById('previewSection');
    elements.previewContent = document.getElementById('previewContent');
    elements.copyAllBtn = document.getElementById('copyAllBtn');
    elements.clearBtn = document.getElementById('clearBtn');
  }

  // ==================== Filename Processing ====================
  function processFilenames() {
    const input = elements.filenameInput.value.trim();

    if (!input) {
      resetResults();
      return;
    }

    const filenames = input.split('\n').filter(f => f.trim());
    state.results = filenames.map(filename => ({
      original: filename.trim(),
      normalized: normalizeFilename(filename.trim())
    }));

    renderResults();
    renderPreview();
  }

  function normalizeFilename(filename) {
    const options = {
      format: elements.formatSelect.value,
      removeSpecial: elements.removeSpecial.checked,
      removeDuplicates: elements.removeDuplicates.checked,
      preserveExtension: elements.preserveExtension.checked,
      trimNumbers: elements.trimNumbers.checked
    };

    let name = filename;
    let extension = '';

    // Extract extension
    if (options.preserveExtension) {
      const lastDot = filename.lastIndexOf('.');
      if (lastDot > 0) {
        extension = filename.slice(lastDot);
        name = filename.slice(0, lastDot);
      }
    }

    // Remove special characters (keep alphanumeric, spaces, hyphens, underscores)
    if (options.removeSpecial) {
      name = name.replace(/[^\w\s-]/g, '');
    }

    // Trim leading numbers
    if (options.trimNumbers) {
      name = name.replace(/^\d+[\s._-]*/, '');
    }

    // Normalize whitespace
    name = name.trim().replace(/\s+/g, ' ');

    // Apply format
    switch (options.format) {
      case 'kebab':
        name = toKebabCase(name);
        break;
      case 'snake':
        name = toSnakeCase(name);
        break;
      case 'camel':
        name = toCamelCase(name);
        break;
      case 'pascal':
        name = toPascalCase(name);
        break;
      case 'lower':
        name = name.toLowerCase().replace(/[\s_-]+/g, '');
        break;
    }

    // Remove duplicate separators
    if (options.removeDuplicates) {
      name = name.replace(/[-_]{2,}/g, match => match[0]);
      name = name.replace(/^[-_]+|[-_]+$/g, '');
    }

    // Ensure we have a valid name
    if (!name) {
      name = 'file';
    }

    return name + extension.toLowerCase();
  }

  // ==================== Case Converters ====================
  function toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  function toSnakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  function toCamelCase(str) {
    return str
      .replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toLowerCase());
  }

  function toPascalCase(str) {
    return str
      .replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase())
      .replace(/[\s_-]/g, '');
  }

  // ==================== Rendering ====================
  function renderResults() {
    if (state.results.length === 0) {
      resetResults();
      return;
    }

    elements.resultsContent.innerHTML = state.results.map((result, index) => `
      <div class="result-item" data-index="${index}">
        <span class="result-filename">${escapeHtml(result.normalized)}</span>
        <button class="result-copy" title="Copy">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `).join('');
  }

  function renderPreview() {
    if (state.results.length === 0) {
      elements.previewSection.style.display = 'none';
      return;
    }

    elements.previewSection.style.display = 'block';

    // Only show first 5 for preview
    const previewItems = state.results.slice(0, 5);

    elements.previewContent.innerHTML = previewItems.map(result => `
      <div class="preview-item">
        <span class="preview-before">${escapeHtml(result.original)}</span>
        <i class="fa-solid fa-arrow-right preview-arrow"></i>
        <span class="preview-after">${escapeHtml(result.normalized)}</span>
      </div>
    `).join('');
  }

  function resetResults() {
    state.results = [];
    elements.resultsContent.innerHTML = '<div class="results-placeholder">Enter filenames above to normalize</div>';
    elements.previewSection.style.display = 'none';
  }

  // ==================== Utilities ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== Actions ====================
  function copyResult(index) {
    if (state.results[index]) {
      ToolsCommon.Clipboard.copy(state.results[index].normalized);
    }
  }

  function copyAllResults() {
    if (state.results.length === 0) {
      ToolsCommon.Toast.show('No results to copy', 'error');
      return;
    }

    const text = state.results.map(r => r.normalized).join('\n');
    ToolsCommon.Clipboard.copy(text);
  }

  function clearInput() {
    elements.filenameInput.value = '';
    resetResults();
    elements.filenameInput.focus();
    ToolsCommon.Toast.show('Input cleared', 'info');
  }

  // ==================== Event Handlers ====================
  function handleResultClick(e) {
    const copyBtn = e.target.closest('.result-copy');
    if (!copyBtn) return;

    const resultItem = copyBtn.closest('.result-item');
    if (!resultItem) return;

    const index = parseInt(resultItem.dataset.index, 10);
    if (!isNaN(index)) {
      copyResult(index);
    }
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      clearInput();
    }
  }

  // ==================== Event Listeners ====================
  function setupEventListeners() {
    // Input change
    elements.filenameInput.addEventListener('input', ToolsCommon.debounce(processFilenames, 200));

    // Options change
    elements.formatSelect.addEventListener('change', processFilenames);
    elements.removeSpecial.addEventListener('change', processFilenames);
    elements.removeDuplicates.addEventListener('change', processFilenames);
    elements.preserveExtension.addEventListener('change', processFilenames);
    elements.trimNumbers.addEventListener('change', processFilenames);

    // Results click delegation
    elements.resultsContent.addEventListener('click', handleResultClick);

    // Buttons
    elements.copyAllBtn.addEventListener('click', copyAllResults);
    elements.clearBtn.addEventListener('click', clearInput);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Initialization ====================
  function init() {
    initElements();
    setupEventListeners();
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
