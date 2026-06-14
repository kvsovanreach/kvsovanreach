/**
 * Markdown Table Builder
 * KVSOVANREACH Tools
 */
(function () {
  'use strict';

  /* ==================== State ==================== */
  let cols = 3;
  let rows = 3;
  let headers = ['Header 1', 'Header 2', 'Header 3'];
  let data = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  let alignments = ['left', 'left', 'left']; // 'left' | 'center' | 'right'

  /* ==================== DOM refs ==================== */
  const grid = document.getElementById('editorGrid');
  const markdownOut = document.getElementById('markdownOutput');
  const htmlOut = document.getElementById('htmlOutput');
  const previewRender = document.getElementById('previewRender');

  /* ==================== Render grid ==================== */
  function renderGrid() {
    let html = '';

    // Header row
    html += '<thead><tr>';
    html += '<th class="row-actions"></th>';
    for (let c = 0; c < cols; c++) {
      html += '<th>';
      html += `<input class="cell-input" type="text" data-type="header" data-col="${c}" value="${escAttr(headers[c] || '')}" placeholder="Header">`;
      html += '<div class="align-row">';
      ['left', 'center', 'right'].forEach(function (a) {
        const icon = a === 'left' ? 'fa-align-left' : a === 'center' ? 'fa-align-center' : 'fa-align-right';
        const active = alignments[c] === a ? ' active' : '';
        html += `<button type="button" class="align-btn${active}" data-col="${c}" data-align="${a}" title="Align ${a}"><i class="fa-solid ${icon}"></i></button>`;
      });
      html += '</div>';
      html += '</th>';
    }
    html += '</tr></thead>';

    // Body rows
    html += '<tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      html += `<td class="row-actions"><button type="button" class="delete-row-btn" data-row="${r}" title="Delete row"><i class="fa-solid fa-xmark"></i></button></td>`;
      for (let c = 0; c < cols; c++) {
        html += `<td><input class="cell-input" type="text" data-type="body" data-row="${r}" data-col="${c}" value="${escAttr((data[r] && data[r][c]) || '')}" placeholder="..."></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';

    grid.innerHTML = html;
    updateOutput();
  }

  function escAttr(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escMd(s) {
    return s.replace(/\|/g, '\\|');
  }

  /* ==================== Output generators ==================== */
  function generateMarkdown() {
    // Compute column widths
    const widths = [];
    for (let c = 0; c < cols; c++) {
      let w = (headers[c] || '').length;
      for (let r = 0; r < rows; r++) {
        w = Math.max(w, ((data[r] && data[r][c]) || '').length);
      }
      widths.push(Math.max(w, 3));
    }

    // Header line
    const hLine = '| ' + headers.map(function (h, i) {
      return escMd(h || '').padEnd(widths[i]);
    }).join(' | ') + ' |';

    // Separator line
    const sLine = '| ' + alignments.map(function (a, i) {
      const w = widths[i];
      if (a === 'center') return ':' + '-'.repeat(w - 2) + ':';
      if (a === 'right') return '-'.repeat(w - 1) + ':';
      return ':' + '-'.repeat(w - 1);
    }).join(' | ') + ' |';

    // Data lines
    const dLines = data.map(function (row) {
      return '| ' + row.map(function (cell, i) {
        return escMd(cell || '').padEnd(widths[i]);
      }).join(' | ') + ' |';
    });

    return [hLine, sLine].concat(dLines).join('\n');
  }

  function generateHTML() {
    let html = '<table>\n  <thead>\n    <tr>\n';
    headers.forEach(function (h, i) {
      const align = alignments[i] !== 'left' ? ` style="text-align: ${alignments[i]}"` : '';
      html += `      <th${align}>${escHtml(h || '')}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n  <tbody>\n';
    data.forEach(function (row) {
      html += '    <tr>\n';
      row.forEach(function (cell, i) {
        const align = alignments[i] !== 'left' ? ` style="text-align: ${alignments[i]}"` : '';
        html += `      <td${align}>${escHtml(cell || '')}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    return html;
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function updateOutput() {
    const md = generateMarkdown();
    const htmlCode = generateHTML();
    markdownOut.textContent = md;
    htmlOut.textContent = htmlCode;
    previewRender.innerHTML = htmlCode;
  }

  /* ==================== Grid events ==================== */
  grid.addEventListener('input', function (e) {
    const input = e.target;
    if (!input.classList.contains('cell-input')) return;
    const c = parseInt(input.dataset.col, 10);
    if (input.dataset.type === 'header') {
      headers[c] = input.value;
    } else {
      const r = parseInt(input.dataset.row, 10);
      if (!data[r]) data[r] = [];
      data[r][c] = input.value;
    }
    updateOutput();
  });

  // Tab navigation between cells
  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const input = e.target;
    if (!input.classList.contains('cell-input')) return;

    e.preventDefault();
    const inputs = Array.from(grid.querySelectorAll('.cell-input'));
    const idx = inputs.indexOf(input);
    const next = e.shiftKey ? idx - 1 : idx + 1;
    if (inputs[next]) {
      inputs[next].focus();
      inputs[next].select();
    }
  });

  // Alignment buttons
  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.align-btn');
    if (!btn) return;
    const c = parseInt(btn.dataset.col, 10);
    alignments[c] = btn.dataset.align;
    renderGrid();
  });

  // Delete row buttons
  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.delete-row-btn');
    if (!btn) return;
    const r = parseInt(btn.dataset.row, 10);
    if (rows <= 1) return;
    data.splice(r, 1);
    rows--;
    renderGrid();
  });

  /* ==================== Toolbar buttons ==================== */
  document.getElementById('addColBtn').addEventListener('click', function () {
    cols++;
    headers.push('Header ' + cols);
    alignments.push('left');
    data.forEach(function (row) { row.push(''); });
    renderGrid();
  });

  document.getElementById('removeColBtn').addEventListener('click', function () {
    if (cols <= 1) return;
    cols--;
    headers.pop();
    alignments.pop();
    data.forEach(function (row) { row.pop(); });
    renderGrid();
  });

  document.getElementById('addRowBtn').addEventListener('click', function () {
    rows++;
    data.push(new Array(cols).fill(''));
    renderGrid();
  });

  document.getElementById('removeRowBtn').addEventListener('click', function () {
    if (rows <= 1) return;
    rows--;
    data.pop();
    renderGrid();
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    cols = 3;
    rows = 3;
    headers = ['Header 1', 'Header 2', 'Header 3'];
    data = [['', '', ''], ['', '', ''], ['', '', '']];
    alignments = ['left', 'left', 'left'];
    renderGrid();
    ToolsCommon.showToast('Table cleared');
  });

  /* ==================== Presets ==================== */
  document.getElementById('presetSelect').addEventListener('change', function () {
    const v = this.value;
    if (!v) return;

    if (v === 'empty3x3') {
      cols = 3; rows = 3;
      headers = ['Header 1', 'Header 2', 'Header 3'];
      data = [['', '', ''], ['', '', ''], ['', '', '']];
      alignments = ['left', 'left', 'left'];
    } else if (v === 'comparison') {
      cols = 3; rows = 3;
      headers = ['Feature', 'Option A', 'Option B'];
      alignments = ['left', 'center', 'center'];
      data = [
        ['Price', '$10/mo', '$20/mo'],
        ['Storage', '10 GB', '50 GB'],
        ['Support', 'Email', '24/7 Live']
      ];
    } else if (v === 'schedule') {
      cols = 4; rows = 3;
      headers = ['Time', 'Monday', 'Tuesday', 'Wednesday'];
      alignments = ['center', 'left', 'left', 'left'];
      data = [
        ['09:00', 'Meeting', 'Workshop', 'Standup'],
        ['12:00', 'Lunch', 'Lunch', 'Lunch'],
        ['14:00', 'Review', 'Deep Work', 'Planning']
      ];
    }

    this.value = '';
    renderGrid();
    ToolsCommon.showToast('Preset loaded');
  });

  /* ==================== Import CSV/TSV ==================== */
  const importModal = document.getElementById('importModal');

  document.getElementById('importCsvBtn').addEventListener('click', function () {
    importModal.style.display = 'flex';
    document.getElementById('importData').value = '';
    document.getElementById('importData').focus();
  });

  document.getElementById('closeImportBtn').addEventListener('click', closeImport);
  document.getElementById('cancelImportBtn').addEventListener('click', closeImport);

  function closeImport() {
    importModal.style.display = 'none';
  }

  importModal.addEventListener('click', function (e) {
    if (e.target === importModal) closeImport();
  });

  document.getElementById('confirmImportBtn').addEventListener('click', function () {
    const raw = document.getElementById('importData').value.trim();
    if (!raw) return;

    // Detect delimiter
    const delimiter = raw.indexOf('\t') !== -1 ? '\t' : ',';
    const lines = raw.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 1) return;

    const parsed = lines.map(function (line) {
      return line.split(delimiter).map(function (c) { return c.trim(); });
    });

    const maxCols = parsed.reduce(function (m, r) { return Math.max(m, r.length); }, 0);

    headers = parsed[0].map(function (h) { return h || ''; });
    while (headers.length < maxCols) headers.push('');
    cols = maxCols;
    alignments = new Array(cols).fill('left');

    data = parsed.slice(1).map(function (row) {
      while (row.length < cols) row.push('');
      return row;
    });
    rows = data.length || 1;
    if (rows === 0) { data = [new Array(cols).fill('')]; rows = 1; }

    closeImport();
    renderGrid();
    ToolsCommon.showToast('Data imported');
  });

  /* ==================== Output tabs ==================== */
  document.querySelectorAll('.output-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.output-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.getElementById('markdownPanel').style.display = target === 'markdown' ? 'block' : 'none';
      document.getElementById('markdownPanel').classList.toggle('active', target === 'markdown');
      document.getElementById('htmlPanel').style.display = target === 'html' ? 'block' : 'none';
      document.getElementById('htmlPanel').classList.toggle('active', target === 'html');
      document.getElementById('previewPanel').style.display = target === 'preview' ? 'block' : 'none';
      document.getElementById('previewPanel').classList.toggle('active', target === 'preview');
    });
  });

  /* ==================== Copy buttons ==================== */
  document.getElementById('copyMdBtn').addEventListener('click', function () {
    ToolsCommon.copyWithToast(generateMarkdown(), 'Markdown copied!');
  });

  document.getElementById('copyHtmlBtn').addEventListener('click', function () {
    ToolsCommon.copyWithToast(generateHTML(), 'HTML copied!');
  });

  /* ==================== Init ==================== */
  renderGrid();
})();
