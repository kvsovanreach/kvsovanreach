/**
 * Statistics Calculator Tool
 * Comprehensive statistical analysis with histogram and box plot visualizations
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    dataInput: document.getElementById('dataInput'),
    calculateBtn: document.getElementById('calculateBtn'),
    sortBtn: document.getElementById('sortBtn'),
    removeDupsBtn: document.getElementById('removeDupsBtn'),
    removeOutliersBtn: document.getElementById('removeOutliersBtn'),
    clearBtn: document.getElementById('clearBtn'),
    resultsSection: document.getElementById('resultsSection'),
    emptyState: document.getElementById('emptyState'),
    summaryGrid: document.getElementById('summaryGrid'),
    spreadGrid: document.getElementById('spreadGrid'),
    copySummaryBtn: document.getElementById('copySummaryBtn'),
    histogramCanvas: document.getElementById('histogramCanvas'),
    boxplotCanvas: document.getElementById('boxplotCanvas'),
    tabs: document.querySelectorAll('.stat-tab'),
    panels: document.querySelectorAll('.stat-panel'),
    sampleBtns: document.querySelectorAll('.sample-btn')
  };

  // ==================== Sample Data ====================
  const sampleData = {
    small: '5, 12, 7, 3, 19, 8, 15, 10, 6, 14',
    grades: '85, 92, 78, 95, 88, 76, 90, 82, 91, 87, 73, 96, 84, 79, 93, 81, 89, 77, 94, 86',
    outliers: '22, 24, 25, 23, 26, 21, 25, 24, 23, 22, 90, 2, 24, 25, 23'
  };

  // ==================== State ====================
  let currentData = [];
  let stats = {};

  // ==================== Parsing ====================

  function parseInput(text) {
    return text
      .replace(/\n/g, ',')
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '' && !isNaN(s))
      .map(Number);
  }

  // ==================== Statistical Functions ====================

  function calcStats(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    if (n === 0) return null;

    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Mode
    const freq = {};
    let maxFreq = 0;
    sorted.forEach(v => {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxFreq) maxFreq = freq[v];
    });
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
    const mode = maxFreq === 1 ? 'None' : modes.join(', ');

    // Variance & Std Dev
    const variancePop = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const varianceSample = n > 1 ? sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
    const stdDevPop = Math.sqrt(variancePop);
    const stdDevSample = Math.sqrt(varianceSample);

    // Quartiles
    function quartile(arr, q) {
      const pos = (arr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
      }
      return arr[base];
    }

    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);
    const iqr = q3 - q1;
    const p10 = quartile(sorted, 0.10);
    const p90 = quartile(sorted, 0.90);

    // Outlier bounds
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = sorted.filter(v => v < lowerBound || v > upperBound);

    return {
      sorted, n, sum, mean, median, mode, min, max, range,
      variancePop, varianceSample, stdDevPop, stdDevSample,
      q1, q3, iqr, p10, p90, lowerBound, upperBound, outliers
    };
  }

  // ==================== Formatting ====================

  function fmt(val) {
    if (typeof val === 'string') return val;
    if (Number.isInteger(val)) return val.toLocaleString();
    return parseFloat(val.toFixed(6)).toString();
  }

  // ==================== Tab Switching ====================

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.stat-tab[data-tab="${tabName}"]`);
    const panel = document.getElementById(`${tabName}Panel`);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');

    if (tabName === 'histogram' && stats.n) drawHistogram();
    if (tabName === 'boxplot' && stats.n) drawBoxPlot();
  }

  // ==================== Render Summary ====================

  function renderSummary() {
    const cards = [
      { label: 'Count', value: stats.n },
      { label: 'Sum', value: fmt(stats.sum) },
      { label: 'Mean', value: fmt(stats.mean), primary: true },
      { label: 'Median', value: fmt(stats.median), primary: true },
      { label: 'Mode', value: stats.mode },
      { label: 'Min', value: fmt(stats.min) },
      { label: 'Max', value: fmt(stats.max) },
      { label: 'Range', value: fmt(stats.range) }
    ];

    elements.summaryGrid.innerHTML = cards.map(c =>
      `<div class="stat-card">
        <span class="stat-card-label">${c.label}</span>
        <span class="stat-card-value${c.primary ? ' primary' : ''}">${c.value}</span>
      </div>`
    ).join('');
  }

  // ==================== Render Spread ====================

  function renderSpread() {
    const cards = [
      { label: 'Std Dev (Population)', value: fmt(stats.stdDevPop) },
      { label: 'Std Dev (Sample)', value: fmt(stats.stdDevSample) },
      { label: 'Variance (Population)', value: fmt(stats.variancePop) },
      { label: 'Variance (Sample)', value: fmt(stats.varianceSample) },
      { label: 'Q1 (25th %)', value: fmt(stats.q1), primary: true },
      { label: 'Q3 (75th %)', value: fmt(stats.q3), primary: true },
      { label: 'IQR', value: fmt(stats.iqr) },
      { label: '10th Percentile', value: fmt(stats.p10) },
      { label: '90th Percentile', value: fmt(stats.p90) },
      { label: 'Outliers', value: stats.outliers.length > 0 ? stats.outliers.map(fmt).join(', ') : 'None' }
    ];

    elements.spreadGrid.innerHTML = cards.map(c =>
      `<div class="stat-card">
        <span class="stat-card-label">${c.label}</span>
        <span class="stat-card-value${c.primary ? ' primary' : ''}">${c.value}</span>
      </div>`
    ).join('');
  }

  // ==================== Draw Histogram ====================

  function drawHistogram() {
    const canvas = elements.histogramCanvas;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const w = Math.min(container.clientWidth - 2, 800);
    const h = Math.round(w * 0.5);
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const data = stats.sorted;
    const n = data.length;

    // Bin count via Sturges' rule
    const binCount = Math.max(3, Math.ceil(Math.log2(n) + 1));
    const binWidth = (stats.max - stats.min) / binCount || 1;

    const bins = new Array(binCount).fill(0);
    data.forEach(v => {
      let idx = Math.floor((v - stats.min) / binWidth);
      if (idx >= binCount) idx = binCount - 1;
      bins[idx]++;
    });

    const maxBin = Math.max(...bins);
    const pad = { top: 30, right: 20, bottom: 50, left: 55 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const barW = chartW / binCount;

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#91214E';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';

    // Y-axis grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round(maxBin * i / ySteps);
      const y = pad.top + chartH - (chartH * i / ySteps);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillText(val, pad.left - 8, y + 4);
    }

    // Bars
    bins.forEach((count, i) => {
      const barH = maxBin > 0 ? (count / maxBin) * chartH : 0;
      const x = pad.left + i * barW;
      const y = pad.top + chartH - barH;

      ctx.fillStyle = primary + 'CC';
      ctx.fillRect(x + 1, y, barW - 2, barH);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y, barW - 2, barH);

      // Count label on bar
      if (count > 0) {
        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count, x + barW / 2, y - 5);
      }
    });

    // X-axis labels
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= binCount; i++) {
      const val = stats.min + i * binWidth;
      const x = pad.left + i * barW;
      ctx.fillText(fmt(val), x, h - pad.bottom + 18);
    }

    // Axis labels
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Value', w / 2, h - 8);

    ctx.save();
    ctx.translate(14, pad.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency', 0, 0);
    ctx.restore();
  }

  // ==================== Draw Box Plot ====================

  function drawBoxPlot() {
    const canvas = elements.boxplotCanvas;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const w = Math.min(container.clientWidth - 2, 800);
    const h = 250;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#91214E';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
    const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--color-error').trim() || '#e53e3e';

    const pad = { top: 40, right: 40, bottom: 50, left: 40 };
    const chartW = w - pad.left - pad.right;
    const midY = h / 2;
    const boxH = 60;

    const dataMin = stats.min;
    const dataMax = stats.max;
    const dataRange = dataMax - dataMin || 1;

    function xPos(val) {
      return pad.left + ((val - dataMin) / dataRange) * chartW;
    }

    const xQ1 = xPos(stats.q1);
    const xQ3 = xPos(stats.q3);
    const xMedian = xPos(stats.median);
    const xMin = xPos(Math.max(stats.min, stats.lowerBound));
    const xMax = xPos(Math.min(stats.max, stats.upperBound));

    // Whiskers
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;

    // Left whisker
    ctx.beginPath();
    ctx.moveTo(xMin, midY);
    ctx.lineTo(xQ1, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xMin, midY - 15);
    ctx.lineTo(xMin, midY + 15);
    ctx.stroke();

    // Right whisker
    ctx.beginPath();
    ctx.moveTo(xQ3, midY);
    ctx.lineTo(xMax, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xMax, midY - 15);
    ctx.lineTo(xMax, midY + 15);
    ctx.stroke();

    // Box
    ctx.fillStyle = primary + '33';
    ctx.fillRect(xQ1, midY - boxH / 2, xQ3 - xQ1, boxH);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(xQ1, midY - boxH / 2, xQ3 - xQ1, boxH);

    // Median line
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xMedian, midY - boxH / 2);
    ctx.lineTo(xMedian, midY + boxH / 2);
    ctx.stroke();

    // Outliers
    stats.outliers.forEach(v => {
      const x = xPos(v);
      ctx.fillStyle = errorColor;
      ctx.beginPath();
      ctx.arc(x, midY, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    const labelY = midY + boxH / 2 + 22;

    ctx.fillText('Min: ' + fmt(stats.min), xPos(stats.min), labelY);
    ctx.fillText('Q1: ' + fmt(stats.q1), xQ1, labelY + 14);
    ctx.fillText('Med: ' + fmt(stats.median), xMedian, midY - boxH / 2 - 10);
    ctx.fillText('Q3: ' + fmt(stats.q3), xQ3, labelY + 14);
    ctx.fillText('Max: ' + fmt(stats.max), xPos(stats.max), labelY);

    // Number line
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, h - pad.bottom + 5);
    ctx.lineTo(w - pad.right, h - pad.bottom + 5);
    ctx.stroke();

    const tickCount = 8;
    for (let i = 0; i <= tickCount; i++) {
      const val = dataMin + (dataRange * i / tickCount);
      const x = xPos(val);
      ctx.beginPath();
      ctx.moveTo(x, h - pad.bottom + 2);
      ctx.lineTo(x, h - pad.bottom + 8);
      ctx.stroke();
      ctx.fillText(fmt(val), x, h - pad.bottom + 22);
    }
  }

  // ==================== Calculate ====================

  function calculate() {
    const data = parseInput(elements.dataInput.value);
    if (data.length === 0) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter valid numbers', 'error');
      }
      return;
    }

    currentData = data;
    stats = calcStats(data);

    elements.emptyState.style.display = 'none';
    elements.resultsSection.style.display = '';

    renderSummary();
    renderSpread();

    // Redraw active chart
    const histActive = document.getElementById('histogramPanel').classList.contains('active');
    const boxActive = document.getElementById('boxplotPanel').classList.contains('active');
    if (histActive) drawHistogram();
    if (boxActive) drawBoxPlot();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(`Calculated stats for ${data.length} values`, 'success');
    }
  }

  // ==================== Data Actions ====================

  function sortData() {
    const data = parseInput(elements.dataInput.value);
    if (data.length === 0) return;
    data.sort((a, b) => a - b);
    elements.dataInput.value = data.join(', ');
    if (typeof ToolsCommon !== 'undefined') ToolsCommon.showToast('Data sorted', 'success');
  }

  function removeDuplicates() {
    const data = parseInput(elements.dataInput.value);
    if (data.length === 0) return;
    const unique = [...new Set(data)];
    const removed = data.length - unique.length;
    elements.dataInput.value = unique.join(', ');
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(`Removed ${removed} duplicate${removed !== 1 ? 's' : ''}`, 'success');
    }
  }

  function removeOutliers() {
    const data = parseInput(elements.dataInput.value);
    if (data.length < 4) {
      if (typeof ToolsCommon !== 'undefined') ToolsCommon.showToast('Need at least 4 values', 'error');
      return;
    }
    const s = calcStats(data);
    const filtered = data.filter(v => v >= s.lowerBound && v <= s.upperBound);
    const removed = data.length - filtered.length;
    elements.dataInput.value = filtered.join(', ');
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(removed > 0 ? `Removed ${removed} outlier${removed !== 1 ? 's' : ''}` : 'No outliers found', removed > 0 ? 'success' : 'info');
    }
  }

  function clearAll() {
    elements.dataInput.value = '';
    currentData = [];
    stats = {};
    elements.resultsSection.style.display = 'none';
    elements.emptyState.style.display = '';
  }

  // ==================== Copy Results ====================

  function copyResults() {
    if (!stats.n) {
      if (typeof ToolsCommon !== 'undefined') ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }

    const lines = [
      `Count: ${stats.n}`,
      `Sum: ${fmt(stats.sum)}`,
      `Mean: ${fmt(stats.mean)}`,
      `Median: ${fmt(stats.median)}`,
      `Mode: ${stats.mode}`,
      `Min: ${fmt(stats.min)}`,
      `Max: ${fmt(stats.max)}`,
      `Range: ${fmt(stats.range)}`,
      `Std Dev (Pop): ${fmt(stats.stdDevPop)}`,
      `Std Dev (Sample): ${fmt(stats.stdDevSample)}`,
      `Variance (Pop): ${fmt(stats.variancePop)}`,
      `Variance (Sample): ${fmt(stats.varianceSample)}`,
      `Q1: ${fmt(stats.q1)}`,
      `Q3: ${fmt(stats.q3)}`,
      `IQR: ${fmt(stats.iqr)}`,
      `10th Percentile: ${fmt(stats.p10)}`,
      `90th Percentile: ${fmt(stats.p90)}`,
      `Outliers: ${stats.outliers.length > 0 ? stats.outliers.map(fmt).join(', ') : 'None'}`
    ];

    const text = lines.join('\n');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.copyWithToast(text, 'Results copied!');
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  // ==================== Event Listeners ====================

  elements.calculateBtn.addEventListener('click', calculate);
  elements.sortBtn.addEventListener('click', sortData);
  elements.removeDupsBtn.addEventListener('click', removeDuplicates);
  elements.removeOutliersBtn.addEventListener('click', removeOutliers);
  elements.clearBtn.addEventListener('click', clearAll);
  elements.copySummaryBtn.addEventListener('click', copyResults);

  elements.tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  elements.sampleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.sample;
      if (sampleData[key]) {
        elements.dataInput.value = sampleData[key];
        calculate();
      }
    });
  });

  // Ctrl+Enter to calculate
  elements.dataInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      calculate();
    }
  });

  // Resize redraw
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (stats.n) {
        if (document.getElementById('histogramPanel').classList.contains('active')) drawHistogram();
        if (document.getElementById('boxplotPanel').classList.contains('active')) drawBoxPlot();
      }
    }, 200);
  });

})();
