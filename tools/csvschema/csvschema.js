/**
 * KVSOVANREACH CSV Schema Explorer
 * Analyze CSV structure and data types
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const SAMPLE_DATA = `name,age,email,salary,active,joined_date
Alice Smith,28,alice@example.com,75000.50,true,2022-01-15
Bob Johnson,35,bob@company.org,82500.00,true,2021-06-20
Charlie Brown,42,charlie@email.net,91000.75,false,2019-03-10
Diana Ross,31,diana@work.com,68000.25,true,2023-02-28
Edward Chen,45,edward@corp.io,105000.00,true,2018-11-05
Fiona Green,29,,72000.50,false,2022-08-15
George White,38,george@mail.com,,true,2020-04-22
Helen Black,33,helen@org.net,79500.00,true,`;

  // ==================== State ====================
  const state = {
    parsed: null,
    schema: null
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.uploadArea = document.getElementById('uploadArea');
    elements.fileInput = document.getElementById('fileInput');
    elements.csvInput = document.getElementById('csvInput');
    elements.statsSection = document.getElementById('statsSection');
    elements.rowCount = document.getElementById('rowCount');
    elements.columnCount = document.getElementById('columnCount');
    elements.nullCount = document.getElementById('nullCount');
    elements.schemaSection = document.getElementById('schemaSection');
    elements.schemaContent = document.getElementById('schemaContent');
    elements.previewSection = document.getElementById('previewSection');
    elements.previewTable = document.getElementById('previewTable');
    elements.sampleBtn = document.getElementById('sampleBtn');
    elements.clearBtn = document.getElementById('clearBtn');
  }

  // ==================== CSV Parsing ====================
  function parseCSV(input) {
    const lines = input.split('\n').filter(line => line.trim());
    const delimiter = detectDelimiter(lines[0]);

    const headers = parseLine(lines[0], delimiter);
    const rows = lines.slice(1).map(line => parseLine(line, delimiter));

    return { headers, rows, delimiter };
  }

  function detectDelimiter(line) {
    const commas = (line.match(/,/g) || []).length;
    const tabs = (line.match(/\t/g) || []).length;
    return tabs > commas ? '\t' : ',';
  }

  function parseLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  // ==================== Schema Analysis ====================
  function analyzeSchema(parsed) {
    return parsed.headers.map((header, index) => {
      const values = parsed.rows.map(row => row[index] || '');
      const nonEmpty = values.filter(v => v !== '');
      const types = nonEmpty.map(detectType);

      // Count type occurrences
      const typeCounts = {};
      types.forEach(t => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });

      // Determine primary type
      let primaryType = 'string';
      let maxCount = 0;
      for (const [type, count] of Object.entries(typeCounts)) {
        if (count > maxCount) {
          maxCount = count;
          primaryType = type;
        }
      }

      // Check if mixed types
      const uniqueTypes = Object.keys(typeCounts);
      if (uniqueTypes.length > 1 && maxCount < nonEmpty.length * 0.8) {
        primaryType = 'mixed';
      }

      // Calculate stats
      const nulls = values.filter(v => v === '').length;
      const unique = new Set(nonEmpty).size;

      return {
        name: header,
        type: primaryType,
        total: values.length,
        nulls,
        unique,
        sample: nonEmpty.slice(0, 3)
      };
    });
  }

  function detectType(value) {
    if (value === '') return 'null';

    // Boolean
    if (/^(true|false|yes|no|1|0)$/i.test(value)) return 'boolean';

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';

    // Date (various formats)
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return 'date';
    }

    // Number
    if (/^-?\d+\.?\d*$/.test(value)) return 'number';

    return 'string';
  }

  // ==================== Processing ====================
  function processCSV() {
    const input = elements.csvInput.value.trim();

    if (!input) {
      hideResults();
      return;
    }

    try {
      state.parsed = parseCSV(input);

      if (state.parsed.headers.length === 0 || state.parsed.rows.length === 0) {
        hideResults();
        return;
      }

      state.schema = analyzeSchema(state.parsed);
      displayStats();
      displaySchema();
      displayPreview();

      elements.statsSection.style.display = 'block';
      elements.schemaSection.style.display = 'block';
      elements.previewSection.style.display = 'block';
    } catch (e) {
      ToolsCommon.Toast.show('Error parsing CSV: ' + e.message, 'error');
      hideResults();
    }
  }

  // ==================== Rendering ====================
  function displayStats() {
    elements.rowCount.textContent = state.parsed.rows.length;
    elements.columnCount.textContent = state.parsed.headers.length;

    const totalNulls = state.schema.reduce((sum, col) => sum + col.nulls, 0);
    elements.nullCount.textContent = totalNulls;
  }

  function displaySchema() {
    elements.schemaContent.innerHTML = state.schema.map(col => `
      <div class="schema-card">
        <div class="schema-card-header">
          <span class="column-name">${escapeHtml(col.name)}</span>
          <span class="type-badge ${col.type}">${col.type}</span>
        </div>
        <div class="schema-card-stats">
          <div class="card-stat">
            <span class="card-stat-label">Non-null</span>
            <span class="card-stat-value">${col.total - col.nulls} / ${col.total}</span>
          </div>
          <div class="card-stat">
            <span class="card-stat-label">Unique</span>
            <span class="card-stat-value">${col.unique}</span>
          </div>
          <div class="card-stat">
            <span class="card-stat-label">Sample</span>
            <span class="card-stat-value">${col.sample.slice(0, 2).map(s => truncate(s, 15)).join(', ')}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function displayPreview() {
    const previewRows = state.parsed.rows.slice(0, 10);

    const headerHtml = `<tr>${state.parsed.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
    const rowsHtml = previewRows.map(row => `
      <tr>${row.map(cell => `<td>${escapeHtml(cell) || '<em style="opacity:0.5">null</em>'}</td>`).join('')}</tr>
    `).join('');

    elements.previewTable.innerHTML = `<thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody>`;
  }

  function hideResults() {
    state.parsed = null;
    state.schema = null;
    elements.statsSection.style.display = 'none';
    elements.schemaSection.style.display = 'none';
    elements.previewSection.style.display = 'none';
  }

  // ==================== Utilities ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '...' : str;
  }

  // ==================== Actions ====================
  function loadSample() {
    elements.csvInput.value = SAMPLE_DATA;
    processCSV();
    ToolsCommon.Toast.show('Sample data loaded', 'success');
  }

  function clearData() {
    elements.csvInput.value = '';
    elements.fileInput.value = '';
    hideResults();
    elements.csvInput.focus();
    ToolsCommon.Toast.show('Data cleared', 'info');
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.csvInput.value = e.target.result;
      processCSV();
      ToolsCommon.Toast.show(`File "${file.name}" loaded`, 'success');
    };
    reader.readAsText(file);
  }

  // ==================== Event Handlers ====================
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      readFile(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    // Ctrl+O - Open file
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      elements.fileInput.click();
      return;
    }

    // Escape - Clear
    if (e.key === 'Escape') {
      clearData();
    }
  }

  // ==================== Event Listeners ====================
  function setupEventListeners() {
    // Upload area
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);

    // Text input
    elements.csvInput.addEventListener('input', ToolsCommon.debounce(processCSV, 300));

    // Buttons
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.clearBtn.addEventListener('click', clearData);

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
