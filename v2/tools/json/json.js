/**
 * JSON Formatter Tool
 * Format, validate, minify, and beautify JSON with syntax highlighting
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    indent: localStorage.getItem('jsonIndent') || '2',
    currentView: 'formatted',
    parsedJson: null
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Input
    jsonInput: document.getElementById('jsonInput'),
    inputLineNumbers: document.getElementById('inputLineNumbers'),
    pasteBtn: document.getElementById('pasteBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInput: document.getElementById('fileInput'),

    // Controls
    formatBtn: document.getElementById('formatBtn'),
    minifyBtn: document.getElementById('minifyBtn'),
    validateBtn: document.getElementById('validateBtn'),
    indentSelect: document.getElementById('indentSelect'),
    sampleBtn: document.getElementById('sampleBtn'),
    clearBtn: document.getElementById('clearBtn'),

    // Output
    jsonOutput: document.getElementById('jsonOutput'),
    outputLineNumbers: document.getElementById('outputLineNumbers'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    panelTabs: document.querySelectorAll('.panel-tab'),
    formattedView: document.getElementById('formattedView'),
    treeView: document.getElementById('treeView'),
    treeContainer: document.getElementById('treeContainer'),
    jsonPathValue: document.getElementById('jsonPathValue'),
    jsonPathCopy: document.getElementById('jsonPathCopy'),
    expandAllBtn: document.getElementById('expandAllBtn'),
    collapseAllBtn: document.getElementById('collapseAllBtn'),

    // Status
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    charCount: document.getElementById('charCount'),
    outputStats: document.getElementById('outputStats'),

    // Error
    errorPanel: document.getElementById('errorPanel'),
    errorMessage: document.getElementById('errorMessage'),

    // Other
    toast: document.getElementById('toast')
  };

  // Sample JSON
  const sampleJson = {
    "name": "JSON Formatter",
    "version": "1.0.0",
    "description": "A tool for formatting JSON data",
    "features": [
      "Format & Beautify",
      "Minify",
      "Validate",
      "Syntax Highlighting",
      "Tree View"
    ],
    "author": {
      "name": "Kong Vungsovanreach",
      "website": "https://kvsovanreach.github.io"
    },
    "settings": {
      "indent": 2,
      "darkMode": true,
      "autoFormat": false
    },
    "stats": {
      "users": 1000,
      "rating": 4.8,
      "active": true
    }
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
    initKeyboardShortcuts();
    loadSettings();
    updateLineNumbers();
  }

  function loadSettings() {
    elements.indentSelect.value = state.indent;
  }

  function initEventListeners() {
    // Input events
    elements.jsonInput?.addEventListener('input', handleInput);
    elements.jsonInput?.addEventListener('scroll', syncScroll);

    // Control buttons
    elements.formatBtn?.addEventListener('click', formatJson);
    elements.minifyBtn?.addEventListener('click', minifyJson);
    elements.validateBtn?.addEventListener('click', validateJson);
    elements.sampleBtn?.addEventListener('click', loadSample);
    elements.clearBtn?.addEventListener('click', clearAll);

    // Indent select
    elements.indentSelect?.addEventListener('change', (e) => {
      state.indent = e.target.value;
      localStorage.setItem('jsonIndent', state.indent);
      if (state.parsedJson) {
        formatJson();
      }
    });

    // Paste & Upload
    elements.pasteBtn?.addEventListener('click', pasteFromClipboard);
    elements.uploadBtn?.addEventListener('click', () => elements.fileInput?.click());
    elements.fileInput?.addEventListener('change', handleFileUpload);

    // Output
    elements.copyBtn?.addEventListener('click', copyOutput);
    elements.downloadBtn?.addEventListener('click', downloadJson);

    // View tabs
    elements.panelTabs.forEach(tab => {
      tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // Tree actions
    elements.expandAllBtn?.addEventListener('click', expandAll);
    elements.collapseAllBtn?.addEventListener('click', collapseAll);
    elements.jsonPathCopy?.addEventListener('click', copyJsonPath);
  }

  // ============================================
  // Tree Actions
  // ============================================
  function expandAll() {
    const toggles = elements.treeContainer.querySelectorAll('.tree-toggle');
    const children = elements.treeContainer.querySelectorAll('.tree-children');

    toggles.forEach(t => t.classList.remove('collapsed'));
    children.forEach(c => c.classList.remove('collapsed'));
  }

  function collapseAll() {
    const toggles = elements.treeContainer.querySelectorAll('.tree-toggle');
    const children = elements.treeContainer.querySelectorAll('.tree-children');

    toggles.forEach(t => t.classList.add('collapsed'));
    children.forEach(c => c.classList.add('collapsed'));
  }

  function updateJsonPath(path) {
    if (elements.jsonPathValue) {
      elements.jsonPathValue.textContent = path;
    }
  }

  function copyJsonPath() {
    const path = elements.jsonPathValue?.textContent || '$';
    navigator.clipboard.writeText(path).then(() => {
      showToast('Path copied!', 'success');
    });
  }

  // ============================================
  // Input Handling
  // ============================================
  function handleInput() {
    updateLineNumbers();
    updateCharCount();
    hideError();
    updateStatus('Ready', '');
  }

  function updateLineNumbers() {
    const input = elements.jsonInput;
    const lines = (input.value.match(/\n/g) || []).length + 1;
    elements.inputLineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
  }

  function updateCharCount() {
    const count = elements.jsonInput.value.length;
    elements.charCount.textContent = `${count.toLocaleString()} chars`;
  }

  function syncScroll() {
    elements.inputLineNumbers.scrollTop = elements.jsonInput.scrollTop;
  }

  // ============================================
  // JSON Operations
  // ============================================
  function formatJson() {
    const input = elements.jsonInput.value.trim();
    if (!input) {
      showToast('Please enter JSON to format', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      state.parsedJson = parsed;

      const indent = state.indent === 'tab' ? '\t' : parseInt(state.indent);
      const formatted = JSON.stringify(parsed, null, indent);

      displayOutput(formatted, parsed);
      updateStatus('Valid JSON', 'valid');
      hideError();

    } catch (e) {
      handleParseError(e);
    }
  }

  function minifyJson() {
    const input = elements.jsonInput.value.trim();
    if (!input) {
      showToast('Please enter JSON to minify', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      state.parsedJson = parsed;

      const minified = JSON.stringify(parsed);

      displayOutput(minified, parsed);
      updateStatus('Minified', 'valid');
      hideError();

      showToast('JSON minified!', 'success');

    } catch (e) {
      handleParseError(e);
    }
  }

  function validateJson() {
    const input = elements.jsonInput.value.trim();
    if (!input) {
      showToast('Please enter JSON to validate', 'error');
      return;
    }

    try {
      JSON.parse(input);
      updateStatus('Valid JSON', 'valid');
      hideError();
      showToast('JSON is valid!', 'success');
    } catch (e) {
      handleParseError(e);
    }
  }

  function handleParseError(e) {
    const message = e.message;
    updateStatus('Invalid JSON', 'invalid');
    showError(message);
    showToast('Invalid JSON', 'error');

    // Try to find position
    const posMatch = message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      elements.jsonInput.focus();
      elements.jsonInput.setSelectionRange(pos, pos + 1);
    }
  }

  // ============================================
  // Output Display
  // ============================================
  function displayOutput(formatted, parsed) {
    // Formatted view with syntax highlighting
    elements.jsonOutput.innerHTML = syntaxHighlight(formatted);

    // Update output line numbers
    const lines = (formatted.match(/\n/g) || []).length + 1;
    elements.outputLineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');

    // Tree view
    renderTree(parsed);

    // Stats
    updateOutputStats(formatted, parsed);
  }

  function syntaxHighlight(json) {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function(match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + escapeHtml(match) + '</span>';
      }
    );
  }

  function updateOutputStats(formatted, parsed) {
    const bytes = new Blob([formatted]).size;
    const sizeStr = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

    const depth = getJsonDepth(parsed);
    const keys = countKeys(parsed);

    elements.outputStats.textContent = `${sizeStr} | Depth: ${depth} | Keys: ${keys}`;
  }

  function getJsonDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    if (values.length === 0) return depth + 1;
    return Math.max(...values.map(v => getJsonDepth(v, depth + 1)));
  }

  function countKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + countKeys(item), 0);
    }
    return Object.keys(obj).length + Object.values(obj).reduce((sum, v) => sum + countKeys(v), 0);
  }

  // ============================================
  // Tree View
  // ============================================
  function renderTree(data) {
    elements.treeContainer.innerHTML = '';
    const tree = createTreeNode(data, '', '$');
    elements.treeContainer.appendChild(tree);
    updateJsonPath('$');
  }

  function createTreeNode(data, key, path) {
    const container = document.createElement('div');
    container.className = 'tree-node';

    if (typeof data === 'object' && data !== null) {
      const isArray = Array.isArray(data);
      const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);

      const item = document.createElement('div');
      item.className = 'tree-item';
      item.dataset.path = path;

      const toggle = document.createElement('button');
      toggle.className = 'tree-toggle';
      toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('collapsed');
        children.classList.toggle('collapsed');
      });

      const keySpan = document.createElement('span');
      if (key !== '') {
        keySpan.className = 'tree-key';
        keySpan.textContent = key + ': ';
      }

      const typeSpan = document.createElement('span');
      typeSpan.className = 'tree-type';
      typeSpan.textContent = isArray ? `Array(${data.length})` : `Object{${Object.keys(data).length}}`;

      item.appendChild(toggle);
      item.appendChild(keySpan);
      item.appendChild(typeSpan);

      item.addEventListener('click', () => selectTreeItem(item, path));

      container.appendChild(item);

      const children = document.createElement('div');
      children.className = 'tree-children';
      entries.forEach(([k, v]) => {
        const childPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
        children.appendChild(createTreeNode(v, k, childPath));
      });
      container.appendChild(children);
    } else {
      const item = document.createElement('div');
      item.className = 'tree-item';
      item.dataset.path = path;

      const spacer = document.createElement('span');
      spacer.style.width = '16px';
      spacer.style.display = 'inline-block';

      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key + ': ';

      const valueSpan = document.createElement('span');
      valueSpan.className = 'tree-value';

      if (typeof data === 'string') {
        valueSpan.classList.add('string');
        valueSpan.textContent = `"${data}"`;
      } else if (typeof data === 'number') {
        valueSpan.classList.add('number');
        valueSpan.textContent = data;
      } else if (typeof data === 'boolean') {
        valueSpan.classList.add('boolean');
        valueSpan.textContent = data;
      } else if (data === null) {
        valueSpan.classList.add('null');
        valueSpan.textContent = 'null';
      }

      item.appendChild(spacer);
      item.appendChild(keySpan);
      item.appendChild(valueSpan);

      item.addEventListener('click', () => selectTreeItem(item, path));

      container.appendChild(item);
    }

    return container;
  }

  function selectTreeItem(item, path) {
    // Remove previous selection
    const selected = elements.treeContainer.querySelector('.tree-item.selected');
    if (selected) selected.classList.remove('selected');

    // Select new item
    item.classList.add('selected');
    updateJsonPath(path);
  }

  function switchView(view) {
    state.currentView = view;

    elements.panelTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    elements.formattedView.classList.toggle('active', view === 'formatted');
    elements.treeView.classList.toggle('active', view === 'tree');
  }

  // ============================================
  // Status & Error
  // ============================================
  function updateStatus(text, type) {
    elements.statusIndicator.className = 'status-indicator ' + type;
    elements.statusText.textContent = text;
  }

  function showError(message) {
    elements.errorPanel.classList.add('show');
    elements.errorMessage.textContent = message;
  }

  function hideError() {
    elements.errorPanel.classList.remove('show');
  }

  // ============================================
  // Clipboard & File
  // ============================================
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.jsonInput.value = text;
      handleInput();
      formatJson();
      showToast('Pasted from clipboard', 'success');
    } catch (e) {
      showToast('Failed to read clipboard', 'error');
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      elements.jsonInput.value = event.target.result;
      handleInput();
      formatJson();
      showToast(`Loaded ${file.name}`, 'success');
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }

  function copyOutput() {
    const output = elements.jsonOutput.textContent;
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

  function downloadJson() {
    const output = elements.jsonOutput.textContent;
    if (!output) {
      showToast('Nothing to download', 'error');
      return;
    }

    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Downloaded formatted.json', 'success');
  }

  // ============================================
  // Actions
  // ============================================
  function loadSample() {
    elements.jsonInput.value = JSON.stringify(sampleJson, null, 2);
    handleInput();
    formatJson();
    showToast('Sample JSON loaded', 'success');
  }

  function clearAll() {
    elements.jsonInput.value = '';
    elements.jsonOutput.innerHTML = '';
    elements.outputLineNumbers.innerHTML = '1';
    elements.treeContainer.innerHTML = `
      <div class="tree-empty">
        <i class="fa-solid fa-sitemap"></i>
        <p>Format JSON to see tree view</p>
      </div>
    `;
    state.parsedJson = null;
    handleInput();
    elements.outputStats.textContent = '-';
    showToast('Cleared', 'success');
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function initKeyboardShortcuts() {
    // Shortcut modal handled by tools-common.js
    document.addEventListener('keydown', (e) => {
      // Ctrl+Enter - Format
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        formatJson();
        return;
      }

      // Ctrl+Shift+M - Minify
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        minifyJson();
        return;
      }

      // Ctrl+Shift+C - Copy output
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyOutput();
        return;
      }

      // Ctrl+Shift+V - Paste & format
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        pasteFromClipboard();
        return;
      }

      // Skip shortcuts if typing
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }
    });
  }

  // ============================================
  // Utilities
  // ============================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  function initFooter() {
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }
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
