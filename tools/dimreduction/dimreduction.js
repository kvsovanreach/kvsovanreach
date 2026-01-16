/**
 * Dimensionality Reduction Visualizer
 */
(function() {
  'use strict';

  const state = { data: [], reducedData: [], labels: [] };
  const elements = {
    algorithm: document.getElementById('algorithm'),
    numPoints: document.getElementById('numPoints'),
    numClusters: document.getElementById('numClusters'),
    originalDims: document.getElementById('originalDims'),
    generateBtn: document.getElementById('generateBtn'),
    runBtn: document.getElementById('runBtn'),
    exportBtn: document.getElementById('exportBtn'),
    originalCanvas: document.getElementById('originalCanvas'),
    reducedCanvas: document.getElementById('reducedCanvas'),
    varianceExplained: document.getElementById('varianceExplained'),
    origDimsDisplay: document.getElementById('origDimsDisplay'),
    pointsDisplay: document.getElementById('pointsDisplay')
  };

  const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  function generateData() {
    const n = parseInt(elements.numPoints.value);
    const k = parseInt(elements.numClusters.value);
    const d = parseInt(elements.originalDims.value);

    state.data = [];
    state.labels = [];

    const centers = Array.from({ length: k }, () =>
      Array.from({ length: d }, () => (Math.random() - 0.5) * 10)
    );

    for (let i = 0; i < n; i++) {
      const cluster = Math.floor(Math.random() * k);
      const point = centers[cluster].map(c => c + (Math.random() - 0.5) * 2);
      state.data.push(point);
      state.labels.push(cluster);
    }

    state.reducedData = [];
    elements.origDimsDisplay.textContent = d;
    elements.pointsDisplay.textContent = n;
    elements.varianceExplained.textContent = '--';

    drawOriginal();
    clearReduced();
    ToolsCommon.Toast.show('Data generated', 'success');
  }

  function runReduction() {
    if (state.data.length === 0) {
      ToolsCommon.Toast.show('Generate data first', 'error');
      return;
    }

    const algo = elements.algorithm.value;

    if (algo === 'pca') {
      runPCA();
    } else {
      runTSNE();
    }

    drawReduced();
    ToolsCommon.Toast.show('Reduction complete', 'success');
  }

  function runPCA() {
    const data = state.data;
    const n = data.length;
    const d = data[0].length;

    // Center data
    const mean = Array(d).fill(0);
    data.forEach(p => p.forEach((v, i) => mean[i] += v / n));
    const centered = data.map(p => p.map((v, i) => v - mean[i]));

    // Covariance matrix (simplified)
    const cov = Array(d).fill(0).map(() => Array(d).fill(0));
    centered.forEach(p => {
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          cov[i][j] += p[i] * p[j] / (n - 1);
        }
      }
    });

    // Power iteration for top 2 eigenvectors (simplified)
    const pc1 = powerIteration(cov);
    const pc2 = powerIteration(cov, pc1);

    // Project
    state.reducedData = centered.map(p => [
      p.reduce((s, v, i) => s + v * pc1[i], 0),
      p.reduce((s, v, i) => s + v * pc2[i], 0)
    ]);

    // Estimate variance explained
    const totalVar = cov.reduce((s, row, i) => s + row[i], 0);
    const var1 = pc1.reduce((s, v, i) => s + v * cov.reduce((ss, row) => ss + row[i] * v, 0), 0);
    const var2 = pc2.reduce((s, v, i) => s + v * cov.reduce((ss, row) => ss + row[i] * v, 0), 0);
    elements.varianceExplained.textContent = ((var1 + var2) / totalVar * 100).toFixed(1) + '%';
  }

  function powerIteration(matrix, exclude = null) {
    const d = matrix.length;
    let vec = Array.from({ length: d }, () => Math.random());

    for (let iter = 0; iter < 50; iter++) {
      // Multiply
      const newVec = vec.map((_, i) => matrix[i].reduce((s, v, j) => s + v * vec[j], 0));

      // Exclude previous eigenvector
      if (exclude) {
        const dot = newVec.reduce((s, v, i) => s + v * exclude[i], 0);
        newVec.forEach((_, i) => newVec[i] -= dot * exclude[i]);
      }

      // Normalize
      const norm = Math.sqrt(newVec.reduce((s, v) => s + v * v, 0));
      vec = newVec.map(v => v / norm);
    }
    return vec;
  }

  function runTSNE() {
    // Simplified t-SNE simulation (not real t-SNE)
    const n = state.data.length;
    state.reducedData = state.data.map((p, i) => {
      const cluster = state.labels[i];
      const angle = cluster * (2 * Math.PI / parseInt(elements.numClusters.value)) + (Math.random() - 0.5) * 0.5;
      const r = 3 + Math.random() * 2;
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });
    elements.varianceExplained.textContent = 'N/A (t-SNE)';
  }

  function drawOriginal() {
    const canvas = elements.originalCanvas;
    const ctx = canvas.getContext('2d');
    const size = 240;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, size, size);

    if (state.data.length === 0) return;

    const data3d = state.data.map(p => [p[0], p[1], p[2] || 0]);
    drawPoints(ctx, data3d, state.labels, size);
  }

  function drawReduced() {
    const canvas = elements.reducedCanvas;
    const ctx = canvas.getContext('2d');
    const size = 240;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, size, size);

    if (state.reducedData.length === 0) return;
    drawPoints(ctx, state.reducedData.map(p => [p[0], p[1], 0]), state.labels, size);
  }

  function clearReduced() {
    const canvas = elements.reducedCanvas;
    const ctx = canvas.getContext('2d');
    const size = 240;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    ctx.scale(2, 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Run reduction to see results', size/2, size/2);
  }

  function drawPoints(ctx, points, labels, size) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
    });
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const padding = 30;

    points.forEach((p, i) => {
      const x = padding + ((p[0] - minX) / rangeX) * (size - 2 * padding);
      const y = padding + ((maxY - p[1]) / rangeY) * (size - 2 * padding);
      ctx.fillStyle = COLORS[labels[i] % COLORS.length];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function exportDiagram() {
    elements.reducedCanvas.toBlob(blob => {
      if (blob) {
        ToolsCommon.FileDownload.blob(blob, 'dimreduction.png');
        ToolsCommon.Toast.show('Exported!', 'success');
      }
    }, 'image/png');
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key.toLowerCase() === 'g') generateData();
    if (e.key.toLowerCase() === 'r') runReduction();
  }

  function init() {
    elements.generateBtn.addEventListener('click', generateData);
    elements.runBtn.addEventListener('click', runReduction);
    elements.exportBtn.addEventListener('click', exportDiagram);
    document.addEventListener('keydown', handleKeydown);
    generateData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
