/**
 * KVSOVANREACH Transformer Attention Visualizer
 * Visualize attention matrices and token relationships
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    tokens: [],
    attentionMatrix: [],
    selectedToken: null,
    currentHead: 0,
    currentLayer: 0
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputText: document.getElementById('inputText'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    headSelect: document.getElementById('headSelect'),
    layerSelect: document.getElementById('layerSelect'),
    viewMode: document.getElementById('viewMode'),
    matrixCanvas: document.getElementById('matrixCanvas'),
    matrixContainer: document.getElementById('matrixContainer'),
    tokensContainer: document.getElementById('tokensContainer'),
    maxAttention: document.getElementById('maxAttention'),
    avgAttention: document.getElementById('avgAttention'),
    exportBtn: document.getElementById('exportBtn')
  };

  // ==================== Core Functions ====================

  /**
   * Tokenize input text (simple word-based)
   */
  function tokenize(text) {
    return text.trim().split(/\s+/).filter(t => t.length > 0);
  }

  /**
   * Generate synthetic attention matrix
   */
  function generateAttentionMatrix(tokens, head, layer) {
    const n = tokens.length;
    const matrix = [];

    // Generate different patterns for different heads
    const seed = head * 1000 + layer * 100;

    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        let attention;

        switch (head) {
          case 0: // Position-based attention
            attention = Math.exp(-Math.abs(i - j) * 0.5);
            break;
          case 1: // Forward attention
            attention = j <= i ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3;
            break;
          case 2: // Backward attention
            attention = j >= i ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3;
            break;
          case 3: // Random attention with patterns
            attention = Math.random();
            if (i === j) attention = 0.8 + Math.random() * 0.2;
            break;
          default: // Average
            attention = Math.random();
        }

        // Add some noise
        attention += (seededRandom(seed + i * n + j) - 0.5) * 0.2;
        attention = Math.max(0, Math.min(1, attention));
        row.push(attention);
      }

      // Normalize row (softmax-like)
      const sum = row.reduce((a, b) => a + b, 0);
      for (let j = 0; j < n; j++) {
        row[j] = row[j] / sum;
      }

      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Seeded random number generator
   */
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Analyze input and visualize attention
   */
  function analyze() {
    const text = elements.inputText.value.trim();
    if (!text) {
      ToolsCommon.Toast.show('Please enter some text', 'error');
      return;
    }

    state.tokens = tokenize(text);
    if (state.tokens.length < 2) {
      ToolsCommon.Toast.show('Please enter at least 2 words', 'error');
      return;
    }

    if (state.tokens.length > 15) {
      ToolsCommon.Toast.show('Maximum 15 tokens supported', 'error');
      return;
    }

    state.currentHead = elements.headSelect.value === 'avg' ? -1 : parseInt(elements.headSelect.value);
    state.currentLayer = parseInt(elements.layerSelect.value);

    // Generate attention matrix
    if (state.currentHead === -1) {
      // Average all heads
      const matrices = [];
      for (let h = 0; h < 4; h++) {
        matrices.push(generateAttentionMatrix(state.tokens, h, state.currentLayer));
      }
      state.attentionMatrix = averageMatrices(matrices);
    } else {
      state.attentionMatrix = generateAttentionMatrix(state.tokens, state.currentHead, state.currentLayer);
    }

    // Update statistics
    updateStats();

    // Render visualization
    renderVisualization();

    ToolsCommon.Toast.show('Attention visualized', 'success');
  }

  /**
   * Average multiple attention matrices
   */
  function averageMatrices(matrices) {
    const n = matrices[0].length;
    const result = [];

    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (const matrix of matrices) {
          sum += matrix[i][j];
        }
        row.push(sum / matrices.length);
      }
      result.push(row);
    }

    return result;
  }

  /**
   * Update attention statistics
   */
  function updateStats() {
    if (state.attentionMatrix.length === 0) return;

    let max = 0;
    let sum = 0;
    let count = 0;

    for (const row of state.attentionMatrix) {
      for (const val of row) {
        max = Math.max(max, val);
        sum += val;
        count++;
      }
    }

    elements.maxAttention.textContent = `Max: ${max.toFixed(3)}`;
    elements.avgAttention.textContent = `Avg: ${(sum / count).toFixed(3)}`;
  }

  /**
   * Render visualization based on view mode
   */
  function renderVisualization() {
    const mode = elements.viewMode.value;

    switch (mode) {
      case 'matrix':
        renderMatrixHeatmap();
        renderTokensSimple();
        break;
      case 'bipartite':
        renderMatrixHeatmap();
        renderBipartiteGraph();
        break;
      case 'arc':
        renderMatrixHeatmap();
        renderArcDiagram();
        break;
    }
  }

  /**
   * Render attention matrix as heatmap
   */
  function renderMatrixHeatmap() {
    const canvas = elements.matrixCanvas;
    const ctx = canvas.getContext('2d');
    const n = state.tokens.length;

    const cellSize = Math.min(50, Math.floor(400 / n));
    const labelSpace = 80;
    const width = n * cellSize + labelSpace + 20;
    const height = n * cellSize + labelSpace + 20;

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-surface').trim() || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw cells
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = state.attentionMatrix[i][j];
        const x = labelSpace + j * cellSize;
        const y = labelSpace + i * cellSize;

        // Color based on attention value
        const intensity = Math.floor(val * 255);
        ctx.fillStyle = `rgb(${236}, ${72 + (255 - intensity) * 0.7}, ${153 + (255 - intensity) * 0.4})`;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        // Value text
        if (cellSize >= 35) {
          ctx.fillStyle = val > 0.5 ? 'white' : '#1e293b';
          ctx.font = '10px "Fira Code", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toFixed(2), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }

    // Draw labels
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text').trim() || '#1e293b';
    ctx.font = '11px "Fira Code", monospace';

    // Column labels (top)
    ctx.textAlign = 'center';
    for (let j = 0; j < n; j++) {
      const x = labelSpace + j * cellSize + cellSize / 2;
      ctx.save();
      ctx.translate(x, labelSpace - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(truncate(state.tokens[j], 8), 0, 0);
      ctx.restore();
    }

    // Row labels (left)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const y = labelSpace + i * cellSize + cellSize / 2;
      ctx.fillText(truncate(state.tokens[i], 8), labelSpace - 10, y);
    }

    // Axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Keys (attending to)', width / 2 + labelSpace / 2, 12);

    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Queries (attending from)', 0, 0);
    ctx.restore();
  }

  /**
   * Render simple token list
   */
  function renderTokensSimple() {
    let html = '<div class="token-flow">';
    html += '<div class="token-column">';
    html += '<div class="token-column-label">Tokens</div>';
    html += '<div class="token-list">';

    state.tokens.forEach((token, i) => {
      const isSelected = state.selectedToken === i;
      html += `
        <div class="token-item ${isSelected ? 'selected' : ''}" data-index="${i}">
          <span class="token-text">${escapeHtml(token)}</span>
        </div>
      `;
    });

    html += '</div></div></div>';
    elements.tokensContainer.innerHTML = html;

    // Add click handlers
    elements.tokensContainer.querySelectorAll('.token-item').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        state.selectedToken = state.selectedToken === index ? null : index;
        renderVisualization();
      });
    });
  }

  /**
   * Render bipartite graph view
   */
  function renderBipartiteGraph() {
    if (state.selectedToken === null) {
      renderTokensSimple();
      return;
    }

    const i = state.selectedToken;
    const attentionRow = state.attentionMatrix[i];

    let html = '<div class="token-flow">';

    // Source token
    html += '<div class="token-column">';
    html += '<div class="token-column-label">Query</div>';
    html += '<div class="token-list">';
    html += `
      <div class="token-item selected">
        <span class="token-text">${escapeHtml(state.tokens[i])}</span>
      </div>
    `;
    html += '</div></div>';

    // Attended tokens
    html += '<div class="token-column">';
    html += '<div class="token-column-label">Keys (Attention)</div>';
    html += '<div class="token-list">';

    // Sort by attention score
    const indexed = attentionRow.map((score, idx) => ({ score, idx }));
    indexed.sort((a, b) => b.score - a.score);

    indexed.forEach(({ score, idx }) => {
      const opacity = 0.3 + score * 0.7;
      html += `
        <div class="token-item" style="opacity: ${opacity}">
          <span class="token-text">${escapeHtml(state.tokens[idx])}</span>
          <span class="token-score">${score.toFixed(3)}</span>
        </div>
      `;
    });

    html += '</div></div></div>';
    elements.tokensContainer.innerHTML = html;

    // Click to select different token
    elements.tokensContainer.querySelector('.selected').addEventListener('click', () => {
      state.selectedToken = null;
      renderVisualization();
    });
  }

  /**
   * Render arc diagram
   */
  function renderArcDiagram() {
    const n = state.tokens.length;

    let html = '<div class="arc-diagram">';
    html += '<svg class="arc-svg" id="arcSvg"></svg>';
    html += '<div class="arc-tokens">';

    state.tokens.forEach((token, i) => {
      const isSelected = state.selectedToken === i;
      html += `<div class="arc-token ${isSelected ? 'selected' : ''}" data-index="${i}">${escapeHtml(token)}</div>`;
    });

    html += '</div></div>';
    elements.tokensContainer.innerHTML = html;

    // Draw arcs
    requestAnimationFrame(() => {
      const container = elements.tokensContainer.querySelector('.arc-diagram');
      const svg = container.querySelector('#arcSvg');
      const tokens = container.querySelectorAll('.arc-token');

      if (tokens.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

      let paths = '';

      if (state.selectedToken !== null) {
        const i = state.selectedToken;
        const sourceToken = tokens[i];
        const sourceRect = sourceToken.getBoundingClientRect();
        const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top - containerRect.top;

        state.attentionMatrix[i].forEach((score, j) => {
          if (i === j || score < 0.05) return;

          const targetToken = tokens[j];
          const targetRect = targetToken.getBoundingClientRect();
          const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
          const targetY = targetRect.top - containerRect.top;

          const midX = (sourceX + targetX) / 2;
          const arcHeight = Math.abs(j - i) * 15 + 30;

          const opacity = score;
          const width = 1 + score * 3;

          paths += `<path d="M ${sourceX} ${sourceY} Q ${midX} ${sourceY - arcHeight} ${targetX} ${targetY}"
            fill="none" stroke="rgb(236, 72, 153)" stroke-width="${width}" opacity="${opacity}" />`;
        });
      }

      svg.innerHTML = paths;
    });

    // Click handlers
    elements.tokensContainer.querySelectorAll('.arc-token').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        state.selectedToken = state.selectedToken === index ? null : index;
        renderVisualization();
      });
    });
  }

  // ==================== Utilities ====================

  function truncate(str, maxLen) {
    return str.length > maxLen ? str.substring(0, maxLen - 1) + '...' : str;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Export ====================

  function exportDiagram() {
    const canvas = elements.matrixCanvas;
    canvas.toBlob(blob => {
      if (blob) {
        ToolsCommon.FileDownload.blob(blob, 'attention-matrix.png');
        ToolsCommon.Toast.show('Diagram exported!', 'success');
      }
    }, 'image/png');
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT') {
      if (e.key === 'Enter') analyze();
      return;
    }

    if (e.key >= '1' && e.key <= '4') {
      elements.headSelect.value = parseInt(e.key) - 1;
      if (state.tokens.length > 0) analyze();
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    analyze();
  }

  function setupEventListeners() {
    elements.analyzeBtn.addEventListener('click', analyze);
    elements.exportBtn.addEventListener('click', exportDiagram);

    [elements.headSelect, elements.layerSelect, elements.viewMode].forEach(el => {
      el.addEventListener('change', () => {
        if (state.tokens.length > 0) analyze();
      });
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
