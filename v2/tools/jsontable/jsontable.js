/**
 * JSON to Table Tool
 * Convert JSON data to table view or CSV format
 */

(function() {
  'use strict';

  // ==================== State ====================
  let jsonData = null;
  let headers = [];

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.json-tab'),
    panels: document.querySelectorAll('.json-panel'),
    jsonInput: document.getElementById('jsonInput'),
    inputError: document.getElementById('inputError'),
    convertBtn: document.getElementById('convertBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    jsonStats: document.getElementById('jsonStats'),
    rowCount: document.getElementById('rowCount'),
    colCount: document.getElementById('colCount'),
    tableSearch: document.getElementById('tableSearch'),
    tableWrapper: document.getElementById('tableWrapper'),
    copyTableBtn: document.getElementById('copyTableBtn'),
    csvOutput: document.getElementById('csvOutput'),
    includeHeaders: document.getElementById('includeHeaders'),
    delimiter: document.getElementById('delimiter'),
    copyCsvBtn: document.getElementById('copyCsvBtn'),
    downloadCsvBtn: document.getElementById('downloadCsvBtn')
  };

  // ==================== Sample Data ====================
  const sampleData = [
    { "id": 1, "name": "John Doe", "email": "john@example.com", "age": 30, "active": true },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25, "active": true },
    { "id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 35, "active": false },
    { "id": 4, "name": "Alice Brown", "email": "alice@example.com", "age": 28, "active": true },
    { "id": 5, "name": "Charlie Wilson", "email": "charlie@example.com", "age": 42, "active": true }
  ];

  // ==================== Parse JSON ====================
  function parseJSON() {
    const input = elements.jsonInput.value.trim();

    if (!input) {
      showError('Please enter JSON data');
      return false;
    }

    try {
      const parsed = JSON.parse(input);

      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        jsonData = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's a single object, wrap in array
        jsonData = [parsed];
      } else {
        showError('JSON must be an object or array of objects');
        return false;
      }

      // Validate that we have objects
      if (jsonData.length === 0) {
        showError('JSON array is empty');
        return false;
      }

      if (typeof jsonData[0] !== 'object' || jsonData[0] === null) {
        showError('JSON array must contain objects');
        return false;
      }

      // Extract all unique headers
      headers = [];
      jsonData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            if (!headers.includes(key)) {
              headers.push(key);
            }
          });
        }
      });

      hideError();
      return true;
    } catch (e) {
      showError('Invalid JSON: ' + e.message);
      return false;
    }
  }

  // ==================== Render Table ====================
  function renderTable(searchTerm = '') {
    if (!jsonData || jsonData.length === 0) {
      elements.tableWrapper.innerHTML = `
        <div class="output-empty">
          <i class="fa-solid fa-table"></i>
          <p>No data to display</p>
        </div>
      `;
      return;
    }

    // Filter data if search term provided
    const filteredData = searchTerm
      ? jsonData.filter(row => {
          return headers.some(header => {
            const value = row[header];
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });
        })
      : jsonData;

    // Build table HTML
    let html = '<table><thead><tr>';

    // Headers
    headers.forEach(header => {
      html += `<th>${escapeHtml(header)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Rows
    filteredData.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        const value = row[header];
        const { displayValue, className } = formatCellValue(value);
        const highlightClass = searchTerm && String(value).toLowerCase().includes(searchTerm.toLowerCase())
          ? ' highlight' : '';
        html += `<td class="${className}${highlightClass}">${displayValue}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    elements.tableWrapper.innerHTML = html;
  }

  // ==================== Format Cell Value ====================
  function formatCellValue(value) {
    if (value === null || value === undefined) {
      return { displayValue: 'null', className: 'null-value' };
    }

    if (typeof value === 'boolean') {
      return { displayValue: value.toString(), className: 'boolean-value' };
    }

    if (typeof value === 'number') {
      return { displayValue: value.toLocaleString(), className: 'number-value' };
    }

    if (typeof value === 'object') {
      return { displayValue: escapeHtml(JSON.stringify(value)), className: '' };
    }

    return { displayValue: escapeHtml(String(value)), className: '' };
  }

  // ==================== Generate CSV ====================
  function generateCSV() {
    if (!jsonData || jsonData.length === 0) {
      elements.csvOutput.value = '';
      return;
    }

    const delimiter = elements.delimiter.value === '\\t' ? '\t' : elements.delimiter.value;
    const includeHeaders = elements.includeHeaders.checked;
    const lines = [];

    // Add headers
    if (includeHeaders) {
      lines.push(headers.map(h => escapeCSV(h, delimiter)).join(delimiter));
    }

    // Add data rows
    jsonData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return escapeCSV(formatCSVValue(value), delimiter);
      });
      lines.push(values.join(delimiter));
    });

    elements.csvOutput.value = lines.join('\n');
  }

  // ==================== Format CSV Value ====================
  function formatCSVValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  // ==================== Escape CSV ====================
  function escapeCSV(value, delimiter) {
    const stringValue = String(value);
    const needsQuotes = stringValue.includes(delimiter) ||
                        stringValue.includes('"') ||
                        stringValue.includes('\n') ||
                        stringValue.includes('\r');

    if (needsQuotes) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
  }

  // ==================== Escape HTML ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== Error Handling ====================
  function showError(message) {
    elements.inputError.textContent = message;
    elements.inputError.classList.add('show');
  }

  function hideError() {
    elements.inputError.classList.remove('show');
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });

    if (tabName === 'csv') {
      generateCSV();
    }
  }

  // ==================== Update Stats ====================
  function updateStats() {
    if (jsonData && jsonData.length > 0) {
      elements.rowCount.textContent = jsonData.length;
      elements.colCount.textContent = headers.length;
      elements.jsonStats.style.display = 'flex';
    } else {
      elements.jsonStats.style.display = 'none';
    }
  }

  // ==================== Actions ====================
  function convert() {
    if (parseJSON()) {
      renderTable();
      generateCSV();
      updateStats();
      ToolsCommon.showToast('Converted successfully', 'success');
    }
  }

  function loadSample() {
    elements.jsonInput.value = JSON.stringify(sampleData, null, 2);
    hideError();
    ToolsCommon.showToast('Sample data loaded', 'success');
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.jsonInput.value = text;
      hideError();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function clearAll() {
    elements.jsonInput.value = '';
    elements.csvOutput.value = '';
    elements.tableWrapper.innerHTML = `
      <div class="output-empty">
        <i class="fa-solid fa-table"></i>
        <p>Table will appear here</p>
        <span>Convert JSON in the Converter tab first</span>
      </div>
    `;
    elements.tableSearch.value = '';
    jsonData = null;
    headers = [];
    updateStats();
    hideError();
    ToolsCommon.showToast('Cleared', 'success');
  }

  function copyTableHTML() {
    const table = elements.tableWrapper.querySelector('table');
    if (!table) {
      ToolsCommon.showToast('No table to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(table.outerHTML, 'Table HTML copied!');
  }

  function copyCSV() {
    const csv = elements.csvOutput.value;
    if (!csv) {
      ToolsCommon.showToast('No CSV to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(csv, 'CSV copied!');
  }

  function downloadCSV() {
    const csv = elements.csvOutput.value;
    if (!csv) {
      ToolsCommon.showToast('No CSV to download', 'error');
      return;
    }
    ToolsCommon.downloadText(csv, 'data.csv', 'text/csv');
    ToolsCommon.showToast('Downloaded!', 'success');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Convert button
    elements.convertBtn.addEventListener('click', convert);

    // Action buttons
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.clearBtn.addEventListener('click', clearAll);

    // Table search
    elements.tableSearch.addEventListener('input', ToolsCommon.debounce(() => {
      renderTable(elements.tableSearch.value);
    }, 200));

    // CSV options
    elements.includeHeaders.addEventListener('change', generateCSV);
    elements.delimiter.addEventListener('change', generateCSV);

    // Copy/Download
    elements.copyTableBtn.addEventListener('click', copyTableHTML);
    elements.copyCsvBtn.addEventListener('click', copyCSV);
    elements.downloadCsvBtn.addEventListener('click', downloadCSV);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('textarea, input, select')) return;

      switch (e.key) {
        case '1':
          switchTab('converter');
          break;
        case '2':
          switchTab('table');
          break;
        case '3':
          switchTab('csv');
          break;
      }

      // Ctrl+Enter to convert
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        convert();
      }

      // Ctrl+S to download
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadCSV();
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
