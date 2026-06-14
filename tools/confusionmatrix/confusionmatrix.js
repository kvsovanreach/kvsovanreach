/**
 * Confusion Matrix Calculator
 */
(function() {
  'use strict';

  let matrixSize = 2;
  let classLabels = [];
  let matrixValues = [];
  let normalized = false;

  const elements = {
    matrixSize: document.getElementById('matrixSize'),
    presetSelect: document.getElementById('presetSelect'),
    normalizedToggle: document.getElementById('normalizedToggle'),
    calculateBtn: document.getElementById('calculateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    matrixContainer: document.getElementById('matrixContainer'),
    heatmapContainer: document.getElementById('heatmapContainer'),
    overallMetrics: document.getElementById('overallMetrics'),
    perclassMetrics: document.getElementById('perclassMetrics')
  };

  const presets = {
    'binary-good': { size: 2, labels: ['Negative', 'Positive'], matrix: [[85, 5], [10, 100]] },
    'binary-bad': { size: 2, labels: ['Negative', 'Positive'], matrix: [[40, 30], [35, 45]] },
    'binary-imbalanced': { size: 2, labels: ['Negative', 'Positive'], matrix: [[920, 15], [50, 15]] },
    'multi3': { size: 3, labels: ['Cat', 'Dog', 'Bird'], matrix: [[45, 3, 2], [5, 40, 5], [3, 2, 45]] },
    'multi4': { size: 4, labels: ['Setosa', 'Versicolor', 'Virginica', 'Unknown'], matrix: [[48, 2, 0, 0], [1, 42, 5, 2], [0, 3, 44, 3], [1, 2, 4, 43]] },
    'multi5': { size: 5, labels: ['A', 'B', 'C', 'D', 'E'], matrix: [[38, 2, 1, 0, 1], [3, 35, 2, 1, 1], [1, 3, 40, 2, 0], [0, 1, 2, 42, 1], [2, 1, 0, 1, 38]] }
  };

  function init() {
    buildMatrix();
    bindEvents();
  }

  function bindEvents() {
    elements.matrixSize.addEventListener('change', function() {
      matrixSize = parseInt(this.value);
      elements.presetSelect.value = 'custom';
      buildMatrix();
    });
    elements.presetSelect.addEventListener('change', function() {
      if (this.value !== 'custom') loadPreset(this.value);
    });
    elements.normalizedToggle.addEventListener('change', function() {
      normalized = this.checked;
      calculate();
    });
    elements.calculateBtn.addEventListener('click', calculate);
    elements.clearBtn.addEventListener('click', clearMatrix);
    elements.copyBtn.addEventListener('click', copyMetrics);

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Enter') { e.preventDefault(); calculate(); }
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); calculate(); }
      if (e.key === 'n' || e.key === 'N') {
        elements.normalizedToggle.checked = !elements.normalizedToggle.checked;
        normalized = elements.normalizedToggle.checked;
        calculate();
      }
      if (e.ctrlKey && e.key === 'c') { /* default copy behavior */ }
    });
  }

  function buildMatrix() {
    if (!classLabels.length || classLabels.length !== matrixSize) {
      classLabels = [];
      for (let i = 0; i < matrixSize; i++) {
        classLabels.push(matrixSize === 2 ? (i === 0 ? 'Negative' : 'Positive') : 'Class ' + (i + 1));
      }
    }
    if (!matrixValues.length || matrixValues.length !== matrixSize) {
      matrixValues = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));
    }

    let html = '<table class="matrix-table">';
    // Top-left corner + axis label + column labels
    html += '<tr><th class="corner"></th><th class="axis-label" colspan="' + matrixSize + '">Predicted</th></tr>';
    html += '<tr><th class="corner"></th>';
    for (let j = 0; j < matrixSize; j++) {
      html += '<th class="col-header"><input class="label-input" data-label-col="' + j + '" value="' + escapeHtml(classLabels[j]) + '"></th>';
    }
    html += '</tr>';

    for (let i = 0; i < matrixSize; i++) {
      html += '<tr>';
      if (i === 0) {
        html += '<th class="axis-label row-header" rowspan="' + matrixSize + '" style="writing-mode:vertical-lr;transform:rotate(180deg);letter-spacing:1px;">Actual</th>';
      }
      for (let j = 0; j < matrixSize; j++) {
        const cls = i === j ? 'diagonal' : 'off-diagonal';
        html += '<td><input type="number" class="matrix-input ' + cls + '" data-row="' + i + '" data-col="' + j + '" min="0" value="' + matrixValues[i][j] + '"></td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    elements.matrixContainer.innerHTML = html;

    // Bind label inputs
    elements.matrixContainer.querySelectorAll('.label-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        const col = parseInt(this.dataset.labelCol);
        classLabels[col] = this.value;
      });
    });

    // Bind matrix inputs
    elements.matrixContainer.querySelectorAll('.matrix-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        const r = parseInt(this.dataset.row), c = parseInt(this.dataset.col);
        matrixValues[r][c] = parseInt(this.value) || 0;
      });
    });
  }

  function loadPreset(name) {
    const p = presets[name];
    if (!p) return;
    matrixSize = p.size;
    elements.matrixSize.value = String(matrixSize);
    classLabels = p.labels.slice();
    matrixValues = p.matrix.map(function(r) { return r.slice(); });
    buildMatrix();
    calculate();
  }

  function readMatrix() {
    matrixValues = [];
    classLabels = [];
    for (let i = 0; i < matrixSize; i++) {
      matrixValues[i] = [];
      for (let j = 0; j < matrixSize; j++) {
        const inp = elements.matrixContainer.querySelector('[data-row="' + i + '"][data-col="' + j + '"]');
        matrixValues[i][j] = Math.max(0, parseInt(inp.value) || 0);
      }
    }
    elements.matrixContainer.querySelectorAll('.label-input').forEach(function(inp) {
      classLabels[parseInt(inp.dataset.labelCol)] = inp.value || ('Class ' + (parseInt(inp.dataset.labelCol) + 1));
    });
  }

  function calculate() {
    readMatrix();
    const total = matrixValues.reduce(function(s, r) { return s + r.reduce(function(a, b) { return a + b; }, 0); }, 0);
    if (total === 0) {
      ToolsCommon.Toast.show('Please enter matrix values first', 'warning');
      return;
    }
    renderHeatmap();
    renderOverallMetrics(total);
    renderPerClassMetrics(total);
    ToolsCommon.Toast.show('Metrics calculated', 'success');
  }

  function renderHeatmap() {
    const total = matrixValues.reduce(function(s, r) { return s + r.reduce(function(a, b) { return a + b; }, 0); }, 0);
    const max = Math.max.apply(null, matrixValues.flat());
    let html = '<table class="heatmap-grid">';
    html += '<tr><th class="corner"></th>';
    for (let j = 0; j < matrixSize; j++) html += '<th>' + escapeHtml(classLabels[j]) + '</th>';
    html += '</tr>';
    for (let i = 0; i < matrixSize; i++) {
      html += '<tr><th>' + escapeHtml(classLabels[i]) + '</th>';
      for (let j = 0; j < matrixSize; j++) {
        const v = matrixValues[i][j];
        const intensity = max > 0 ? v / max : 0;
        const displayVal = normalized ? (total > 0 ? (v / total * 100).toFixed(1) + '%' : '0%') : v;
        let bgColor, textColor;
        if (i === j) {
          // Diagonal = correct predictions - blue shades
          const r = Math.round(30 + (1 - intensity) * 210);
          const g = Math.round(80 + (1 - intensity) * 170);
          const b = Math.round(150 + (1 - intensity) * 100);
          bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';
          textColor = intensity > 0.4 ? '#fff' : 'var(--color-text)';
        } else {
          // Off-diagonal = misclassifications - red shades
          const r = Math.round(150 + intensity * 100);
          const g = Math.round(200 - intensity * 140);
          const b = Math.round(200 - intensity * 140);
          bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';
          textColor = intensity > 0.5 ? '#fff' : 'var(--color-text)';
        }
        html += '<td class="heatmap-cell" style="background-color:' + bgColor + ';color:' + textColor + '"><span class="cell-value">' + displayVal + '</span></td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    elements.heatmapContainer.innerHTML = html;
  }

  function renderOverallMetrics(total) {
    const n = matrixSize;
    // Overall accuracy
    let correctSum = 0;
    for (let i = 0; i < n; i++) correctSum += matrixValues[i][i];
    const accuracy = total > 0 ? correctSum / total : 0;

    // Macro-averaged precision, recall, f1, specificity
    let precisionSum = 0, recallSum = 0, f1Sum = 0, specificitySum = 0;
    for (let c = 0; c < n; c++) {
      const stats = classStats(c);
      precisionSum += stats.precision;
      recallSum += stats.recall;
      f1Sum += stats.f1;
      specificitySum += stats.specificity;
    }
    const macroPrecision = precisionSum / n;
    const macroRecall = recallSum / n;
    const macroF1 = f1Sum / n;
    const macroSpecificity = specificitySum / n;

    // MCC for multi-class
    const mcc = computeMCC();

    const metrics = [
      { label: 'Accuracy', value: accuracy },
      { label: 'Macro Precision', value: macroPrecision },
      { label: 'Macro Recall', value: macroRecall },
      { label: 'Macro F1-Score', value: macroF1 },
      { label: 'Macro Specificity', value: macroSpecificity },
      { label: 'MCC', value: mcc, isMcc: true }
    ];

    let html = '';
    metrics.forEach(function(m) {
      const cls = m.isMcc ? mccClass(m.value) : valueClass(m.value);
      html += '<div class="metric-card"><span class="metric-label">' + m.label + '</span><span class="metric-value ' + cls + '">' + (m.isMcc ? m.value.toFixed(4) : (m.value * 100).toFixed(2) + '%') + '</span></div>';
    });
    elements.overallMetrics.innerHTML = html;
  }

  function renderPerClassMetrics(total) {
    let html = '<table class="perclass-table"><thead><tr><th>Class</th><th>Support</th><th>Precision</th><th>Recall</th><th>F1-Score</th><th>Specificity</th></tr></thead><tbody>';
    for (let c = 0; c < matrixSize; c++) {
      const stats = classStats(c);
      html += '<tr>';
      html += '<td>' + escapeHtml(classLabels[c]) + '</td>';
      html += '<td>' + stats.support + '</td>';
      html += '<td class="' + valueClass(stats.precision) + '">' + (stats.precision * 100).toFixed(2) + '%</td>';
      html += '<td class="' + valueClass(stats.recall) + '">' + (stats.recall * 100).toFixed(2) + '%</td>';
      html += '<td class="' + valueClass(stats.f1) + '">' + (stats.f1 * 100).toFixed(2) + '%</td>';
      html += '<td class="' + valueClass(stats.specificity) + '">' + (stats.specificity * 100).toFixed(2) + '%</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    elements.perclassMetrics.innerHTML = html;
  }

  function classStats(c) {
    const n = matrixSize;
    let tp = matrixValues[c][c];
    let fp = 0, fn = 0, tn = 0;
    for (let i = 0; i < n; i++) {
      if (i !== c) {
        fp += matrixValues[i][c]; // column sum minus diagonal
        fn += matrixValues[c][i]; // row sum minus diagonal
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== c && j !== c) tn += matrixValues[i][j];
      }
    }
    const support = tp + fn;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
    const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 0;
    return { tp: tp, fp: fp, fn: fn, tn: tn, support: support, precision: precision, recall: recall, f1: f1, specificity: specificity };
  }

  function computeMCC() {
    const n = matrixSize;
    if (n === 2) {
      const tp = matrixValues[1][1], tn = matrixValues[0][0], fp = matrixValues[0][1], fn = matrixValues[1][0];
      const denom = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
      return denom === 0 ? 0 : (tp * tn - fp * fn) / denom;
    }
    // General multiclass MCC using the Gorodkin formula
    const total = matrixValues.reduce(function(s, r) { return s + r.reduce(function(a, b) { return a + b; }, 0); }, 0);
    if (total === 0) return 0;
    let correctSum = 0;
    for (let k = 0; k < n; k++) correctSum += matrixValues[k][k];

    // Compute row sums and col sums
    const rowSums = [], colSums = [];
    for (let i = 0; i < n; i++) {
      let rs = 0, cs = 0;
      for (let j = 0; j < n; j++) { rs += matrixValues[i][j]; cs += matrixValues[j][i]; }
      rowSums.push(rs);
      colSums.push(cs);
    }

    let num = 0, den1 = 0, den2 = 0;
    num = correctSum * total;
    for (let k = 0; k < n; k++) num -= rowSums[k] * colSums[k];
    let s2 = 0;
    for (let k = 0; k < n; k++) { s2 += rowSums[k] * colSums[k]; }
    den1 = total * total - s2;
    // Use symmetric form
    let rowSqSum = 0, colSqSum = 0;
    for (let k = 0; k < n; k++) { rowSqSum += rowSums[k] * rowSums[k]; colSqSum += colSums[k] * colSums[k]; }
    const denom = Math.sqrt((total * total - rowSqSum) * (total * total - colSqSum));
    return denom === 0 ? 0 : num / denom;
  }

  function valueClass(v) {
    if (v >= 0.9) return 'val-good';
    if (v >= 0.7) return 'val-moderate';
    return 'val-poor';
  }

  function mccClass(v) {
    if (v >= 0.7) return 'good';
    if (v >= 0.4) return 'moderate';
    if (v >= 0) return 'poor';
    return 'poor';
  }

  function clearMatrix() {
    matrixValues = Array.from({ length: matrixSize }, function() { return Array(matrixSize).fill(0); });
    buildMatrix();
    elements.heatmapContainer.innerHTML = '';
    elements.overallMetrics.innerHTML = '';
    elements.perclassMetrics.innerHTML = '';
    elements.presetSelect.value = 'custom';
    ToolsCommon.Toast.show('Matrix cleared', 'info');
  }

  function copyMetrics() {
    readMatrix();
    const total = matrixValues.reduce(function(s, r) { return s + r.reduce(function(a, b) { return a + b; }, 0); }, 0);
    if (total === 0) {
      ToolsCommon.Toast.show('No data to copy', 'warning');
      return;
    }

    let correctSum = 0;
    for (let i = 0; i < matrixSize; i++) correctSum += matrixValues[i][i];
    const accuracy = total > 0 ? correctSum / total : 0;

    let text = 'Confusion Matrix Metrics\n';
    text += '========================\n\n';
    text += 'Matrix (' + matrixSize + 'x' + matrixSize + '):\n';
    const colW = 10;
    text += ''.padEnd(colW);
    for (let j = 0; j < matrixSize; j++) text += classLabels[j].padStart(colW);
    text += '\n';
    for (let i = 0; i < matrixSize; i++) {
      text += classLabels[i].padEnd(colW);
      for (let j = 0; j < matrixSize; j++) text += String(matrixValues[i][j]).padStart(colW);
      text += '\n';
    }
    text += '\nOverall Accuracy: ' + (accuracy * 100).toFixed(2) + '%\n\n';
    text += 'Per-Class Metrics:\n';
    text += 'Class'.padEnd(colW) + 'Precision'.padStart(colW) + 'Recall'.padStart(colW) + 'F1-Score'.padStart(colW) + 'Specificity'.padStart(12) + '\n';
    for (let c = 0; c < matrixSize; c++) {
      const s = classStats(c);
      text += classLabels[c].padEnd(colW) + (s.precision * 100).toFixed(2).padStart(colW - 1) + '%' + (s.recall * 100).toFixed(2).padStart(colW - 1) + '%' + (s.f1 * 100).toFixed(2).padStart(colW - 1) + '%' + (s.specificity * 100).toFixed(2).padStart(11) + '%\n';
    }
    text += '\nMCC: ' + computeMCC().toFixed(4) + '\n';

    ToolsCommon.copyWithToast(text, 'Metrics copied to clipboard');
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  init();
})();
