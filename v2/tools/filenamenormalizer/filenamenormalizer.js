/**
 * KVSOVANREACH Filename Normalizer
 * Clean and normalize filenames
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    filenameInput: document.getElementById('filenameInput'),
    formatSelect: document.getElementById('formatSelect'),
    removeSpecial: document.getElementById('removeSpecial'),
    removeDuplicates: document.getElementById('removeDuplicates'),
    preserveExtension: document.getElementById('preserveExtension'),
    trimNumbers: document.getElementById('trimNumbers'),
    resultsContent: document.getElementById('resultsContent'),
    previewSection: document.getElementById('previewSection'),
    previewContent: document.getElementById('previewContent'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // State
  let normalizedResults = [];

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Input change
    elements.filenameInput.addEventListener('input', ToolsCommon.debounce(processFilenames, 200));

    // Options change
    elements.formatSelect.addEventListener('change', processFilenames);
    elements.removeSpecial.addEventListener('change', processFilenames);
    elements.removeDuplicates.addEventListener('change', processFilenames);
    elements.preserveExtension.addEventListener('change', processFilenames);
    elements.trimNumbers.addEventListener('change', processFilenames);

    // Buttons
    elements.copyAllBtn.addEventListener('click', copyAllResults);
    elements.clearBtn.addEventListener('click', clearInput);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Process filenames
   */
  function processFilenames() {
    const input = elements.filenameInput.value.trim();

    if (!input) {
      resetResults();
      return;
    }

    const filenames = input.split('\n').filter(f => f.trim());
    normalizedResults = filenames.map(filename => ({
      original: filename.trim(),
      normalized: normalizeFilename(filename.trim())
    }));

    renderResults();
    renderPreview();
  }

  /**
   * Normalize a single filename
   */
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

  /**
   * Convert to kebab-case
   */
  function toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert to snake_case
   */
  function toSnakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Convert to camelCase
   */
  function toCamelCase(str) {
    return str
      .replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toLowerCase());
  }

  /**
   * Convert to PascalCase
   */
  function toPascalCase(str) {
    return str
      .replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase())
      .replace(/[\s_-]/g, '');
  }

  /**
   * Render results
   */
  function renderResults() {
    if (normalizedResults.length === 0) {
      resetResults();
      return;
    }

    elements.resultsContent.innerHTML = normalizedResults.map((result, index) => `
      <div class="result-item">
        <span class="result-filename">${escapeHtml(result.normalized)}</span>
        <button class="result-copy" onclick="window.copyResult(${index})" title="Copy">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `).join('');
  }

  /**
   * Render preview (before & after)
   */
  function renderPreview() {
    if (normalizedResults.length === 0) {
      elements.previewSection.style.display = 'none';
      return;
    }

    elements.previewSection.style.display = 'block';

    // Only show first 5 for preview
    const previewItems = normalizedResults.slice(0, 5);

    elements.previewContent.innerHTML = previewItems.map(result => `
      <div class="preview-item">
        <span class="preview-before">${escapeHtml(result.original)}</span>
        <i class="fa-solid fa-arrow-right preview-arrow"></i>
        <span class="preview-after">${escapeHtml(result.normalized)}</span>
      </div>
    `).join('');
  }

  /**
   * Reset results
   */
  function resetResults() {
    normalizedResults = [];
    elements.resultsContent.innerHTML = '<div class="results-placeholder">Enter filenames above to normalize</div>';
    elements.previewSection.style.display = 'none';
  }

  /**
   * Copy single result
   */
  window.copyResult = function(index) {
    if (normalizedResults[index]) {
      ToolsCommon.Clipboard.copy(normalizedResults[index].normalized);
    }
  };

  /**
   * Copy all results
   */
  function copyAllResults() {
    if (normalizedResults.length === 0) {
      ToolsCommon.Toast.show('No results to copy', 'error');
      return;
    }

    const text = normalizedResults.map(r => r.normalized).join('\n');
    ToolsCommon.Clipboard.copy(text);
  }

  /**
   * Clear input
   */
  function clearInput() {
    elements.filenameInput.value = '';
    resetResults();
    ToolsCommon.Toast.show('Input cleared', 'info');
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Escape - Clear
    if (e.key === 'Escape') {
      clearInput();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
