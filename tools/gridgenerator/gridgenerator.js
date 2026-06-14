/**
 * KVSOVANREACH CSS Grid Generator
 */

(function() {
  'use strict';

  const CELL_COLORS = [
    '#91214E', '#2d6a8a', '#e67e22', '#27ae60', '#8e44ad',
    '#c0392b', '#2980b9', '#16a085', '#d35400', '#7f8c8d',
    '#1abc9c', '#e74c3c'
  ];

  const state = {
    cols: 3,
    rows: 3,
    colGap: 10,
    rowGap: 10,
    colTemplate: '1fr 1fr 1fr',
    rowTemplate: '1fr 1fr 1fr',
    cells: [],
    selectedCell: 0,
    viewportWidth: '100%'
  };

  const elements = {};

  function initElements() {
    elements.previewArea = document.getElementById('previewArea');
    elements.previewFrame = document.getElementById('previewFrame');
    elements.colCount = document.getElementById('colCount');
    elements.rowCount = document.getElementById('rowCount');
    elements.colGap = document.getElementById('colGap');
    elements.rowGap = document.getElementById('rowGap');
    elements.colTemplate = document.getElementById('colTemplate');
    elements.rowTemplate = document.getElementById('rowTemplate');
    elements.colCountValue = document.getElementById('colCountValue');
    elements.rowCountValue = document.getElementById('rowCountValue');
    elements.colGapValue = document.getElementById('colGapValue');
    elements.rowGapValue = document.getElementById('rowGapValue');
    elements.colSpan = document.getElementById('colSpan');
    elements.rowSpan = document.getElementById('rowSpan');
    elements.colSpanValue = document.getElementById('colSpanValue');
    elements.rowSpanValue = document.getElementById('rowSpanValue');
    elements.selectedCell = document.getElementById('selectedCell');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.presetBtns = document.querySelectorAll('.gg-preset-btn');
    elements.viewportBtns = document.querySelectorAll('.gg-viewport-btn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function initCells() {
    const total = state.cols * state.rows;
    state.cells = [];
    for (let i = 0; i < total; i++) {
      state.cells.push({ colSpan: 1, rowSpan: 1 });
    }
    state.selectedCell = 0;
    updateCellSelect();
  }

  function updateCellSelect() {
    elements.selectedCell.innerHTML = '';
    state.cells.forEach((_, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = 'Cell ' + (i + 1);
      elements.selectedCell.appendChild(opt);
    });
    elements.selectedCell.value = state.selectedCell;
    updateCellControls();
  }

  function updateCellControls() {
    const cell = state.cells[state.selectedCell];
    if (!cell) return;
    elements.colSpan.value = cell.colSpan;
    elements.colSpan.max = state.cols;
    elements.colSpanValue.textContent = cell.colSpan;
    elements.rowSpan.value = cell.rowSpan;
    elements.rowSpan.max = state.rows;
    elements.rowSpanValue.textContent = cell.rowSpan;
  }

  function generateTemplate(count) {
    return Array(count).fill('1fr').join(' ');
  }

  function renderPreview() {
    elements.previewArea.innerHTML = '';
    elements.previewArea.style.gridTemplateColumns = state.colTemplate;
    elements.previewArea.style.gridTemplateRows = state.rowTemplate;
    elements.previewArea.style.columnGap = state.colGap + 'px';
    elements.previewArea.style.rowGap = state.rowGap + 'px';

    state.cells.forEach((cell, i) => {
      const div = document.createElement('div');
      div.className = 'gg-cell' + (i === state.selectedCell ? ' selected' : '');
      div.style.backgroundColor = CELL_COLORS[i % CELL_COLORS.length];

      if (cell.colSpan > 1) {
        div.style.gridColumn = 'span ' + cell.colSpan;
      }
      if (cell.rowSpan > 1) {
        div.style.gridRow = 'span ' + cell.rowSpan;
      }

      const label = document.createElement('span');
      label.className = 'gg-cell-label';
      label.textContent = (i + 1);
      div.appendChild(label);

      if (cell.colSpan > 1 || cell.rowSpan > 1) {
        const span = document.createElement('span');
        span.className = 'gg-cell-span';
        const parts = [];
        if (cell.colSpan > 1) parts.push(cell.colSpan + 'c');
        if (cell.rowSpan > 1) parts.push(cell.rowSpan + 'r');
        span.textContent = parts.join(' ');
        div.appendChild(span);
      }

      div.addEventListener('click', () => {
        state.selectedCell = i;
        elements.selectedCell.value = i;
        updateCellControls();
        renderPreview();
      });

      elements.previewArea.appendChild(div);
    });

    elements.previewFrame.style.maxWidth = state.viewportWidth;
    updateCSSOutput();
  }

  function updateCSSOutput() {
    let css = '.container {\n';
    css += '  display: grid;\n';
    css += '  grid-template-columns: ' + state.colTemplate + ';\n';
    css += '  grid-template-rows: ' + state.rowTemplate + ';\n';
    if (state.colGap === state.rowGap) {
      css += '  gap: ' + state.colGap + 'px;\n';
    } else {
      css += '  row-gap: ' + state.rowGap + 'px;\n';
      css += '  column-gap: ' + state.colGap + 'px;\n';
    }
    css += '}';

    const spanCells = state.cells.filter(c => c.colSpan > 1 || c.rowSpan > 1);
    if (spanCells.length > 0) {
      css += '\n';
      state.cells.forEach((cell, i) => {
        if (cell.colSpan > 1 || cell.rowSpan > 1) {
          css += '\n.item-' + (i + 1) + ' {\n';
          if (cell.colSpan > 1) css += '  grid-column: span ' + cell.colSpan + ';\n';
          if (cell.rowSpan > 1) css += '  grid-row: span ' + cell.rowSpan + ';\n';
          css += '}';
        }
      });
    }

    elements.cssOutput.textContent = css;
  }

  function applyPreset(preset) {
    elements.presetBtns.forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('[data-preset="' + preset + '"]');
    if (btn) btn.classList.add('active');

    switch (preset) {
      case '12col':
        state.cols = 12;
        state.rows = 1;
        state.colGap = 10;
        state.rowGap = 10;
        state.colTemplate = 'repeat(12, 1fr)';
        state.rowTemplate = '1fr';
        break;
      case 'dashboard':
        state.cols = 4;
        state.rows = 3;
        state.colGap = 12;
        state.rowGap = 12;
        state.colTemplate = '1fr 1fr 1fr 1fr';
        state.rowTemplate = 'auto auto auto';
        break;
      case 'gallery':
        state.cols = 3;
        state.rows = 3;
        state.colGap = 8;
        state.rowGap = 8;
        state.colTemplate = '1fr 1fr 1fr';
        state.rowTemplate = '200px 200px 200px';
        break;
      case 'magazine':
        state.cols = 3;
        state.rows = 4;
        state.colGap = 16;
        state.rowGap = 16;
        state.colTemplate = '2fr 1fr 1fr';
        state.rowTemplate = 'auto auto auto auto';
        break;
    }

    initCells();

    // Apply preset-specific spans
    if (preset === 'dashboard' && state.cells.length >= 12) {
      state.cells[0].colSpan = 2;
      state.cells[0].rowSpan = 1;
    }
    if (preset === 'gallery' && state.cells.length >= 9) {
      state.cells[0].colSpan = 2;
      state.cells[0].rowSpan = 2;
    }
    if (preset === 'magazine' && state.cells.length >= 12) {
      state.cells[0].colSpan = 1;
      state.cells[0].rowSpan = 2;
    }

    syncControlsFromState();
    renderPreview();
  }

  function syncControlsFromState() {
    elements.colCount.value = state.cols;
    elements.colCountValue.textContent = state.cols;
    elements.rowCount.value = state.rows;
    elements.rowCountValue.textContent = state.rows;
    elements.colGap.value = state.colGap;
    elements.colGapValue.textContent = state.colGap + 'px';
    elements.rowGap.value = state.rowGap;
    elements.rowGapValue.textContent = state.rowGap + 'px';
    elements.colTemplate.value = state.colTemplate;
    elements.rowTemplate.value = state.rowTemplate;
    elements.colCount.max = 12;
    elements.rowCount.max = 12;
  }

  function copyCSS() {
    const css = elements.cssOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(() => {
        showToast('CSS copied to clipboard!', 'success');
      }).catch(() => fallbackCopy(css));
    } else {
      fallbackCopy(css);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('CSS copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function resetForm() {
    state.cols = 3;
    state.rows = 3;
    state.colGap = 10;
    state.rowGap = 10;
    state.colTemplate = '1fr 1fr 1fr';
    state.rowTemplate = '1fr 1fr 1fr';
    state.viewportWidth = '100%';
    state.selectedCell = 0;

    elements.presetBtns.forEach(b => b.classList.remove('active'));
    elements.viewportBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.width === '100%');
    });

    initCells();
    syncControlsFromState();
    renderPreview();
    showToast('Reset to default', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, select, textarea')) return;

    if (e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyCSS();
    }
    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
    }
  }

  function init() {
    initElements();
    initCells();
    syncControlsFromState();

    // Grid size controls
    elements.colCount.addEventListener('input', (e) => {
      state.cols = parseInt(e.target.value);
      elements.colCountValue.textContent = state.cols;
      state.colTemplate = generateTemplate(state.cols);
      elements.colTemplate.value = state.colTemplate;
      initCells();
      renderPreview();
    });

    elements.rowCount.addEventListener('input', (e) => {
      state.rows = parseInt(e.target.value);
      elements.rowCountValue.textContent = state.rows;
      state.rowTemplate = generateTemplate(state.rows);
      elements.rowTemplate.value = state.rowTemplate;
      initCells();
      renderPreview();
    });

    // Gap controls
    elements.colGap.addEventListener('input', (e) => {
      state.colGap = parseInt(e.target.value);
      elements.colGapValue.textContent = state.colGap + 'px';
      renderPreview();
    });

    elements.rowGap.addEventListener('input', (e) => {
      state.rowGap = parseInt(e.target.value);
      elements.rowGapValue.textContent = state.rowGap + 'px';
      renderPreview();
    });

    // Template controls
    elements.colTemplate.addEventListener('input', (e) => {
      state.colTemplate = e.target.value || '1fr';
      renderPreview();
    });

    elements.rowTemplate.addEventListener('input', (e) => {
      state.rowTemplate = e.target.value || '1fr';
      renderPreview();
    });

    // Cell span controls
    elements.colSpan.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.cells[state.selectedCell].colSpan = val;
      elements.colSpanValue.textContent = val;
      renderPreview();
    });

    elements.rowSpan.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.cells[state.selectedCell].rowSpan = val;
      elements.rowSpanValue.textContent = val;
      renderPreview();
    });

    elements.selectedCell.addEventListener('change', (e) => {
      state.selectedCell = parseInt(e.target.value);
      updateCellControls();
      renderPreview();
    });

    // Presets
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Viewport
    elements.viewportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.viewportBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewportWidth = btn.dataset.width;
        renderPreview();
      });
    });

    // Actions
    elements.copyBtn.addEventListener('click', copyCSS);
    elements.resetBtn.addEventListener('click', resetForm);
    document.addEventListener('keydown', handleKeydown);

    renderPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
