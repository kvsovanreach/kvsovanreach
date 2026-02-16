/**
 * KVSOVANREACH Embedding Space Explorer
 * Visualize word embeddings in 2D/3D space
 */

(function() {
  'use strict';

  const state = {
    words: [],
    embeddings: {},
    colors: ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']
  };

  const elements = {
    wordInput: document.getElementById('wordInput'),
    addWordBtn: document.getElementById('addWordBtn'),
    loadExampleBtn: document.getElementById('loadExampleBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    dimSelect: document.getElementById('dimSelect'),
    embedCanvas: document.getElementById('embedCanvas'),
    wordsList: document.getElementById('wordsList'),
    wordCount: document.getElementById('wordCount'),
    similarityContainer: document.getElementById('similarityContainer'),
    exportBtn: document.getElementById('exportBtn')
  };

  const EXAMPLE_WORDS = ['king', 'queen', 'man', 'woman', 'prince', 'princess', 'boy', 'girl'];

  // Generate pseudo-embedding based on word characteristics
  function generateEmbedding(word) {
    const hash = hashCode(word);
    const dims = 3;
    const embedding = [];

    for (let i = 0; i < dims; i++) {
      const seed = hash * (i + 1);
      embedding.push((seededRandom(seed) - 0.5) * 2);
    }

    // Add semantic clustering for known word pairs
    const semantics = {
      'king': [0.8, 0.7, 0.3], 'queen': [0.75, 0.72, 0.35],
      'man': [0.6, 0.5, 0.2], 'woman': [0.55, 0.52, 0.25],
      'prince': [0.7, 0.6, 0.28], 'princess': [0.65, 0.62, 0.32],
      'boy': [0.5, 0.4, 0.15], 'girl': [0.45, 0.42, 0.2],
      'cat': [-0.5, 0.3, 0.1], 'dog': [-0.4, 0.35, 0.15],
      'car': [0.1, -0.6, 0.5], 'truck': [0.15, -0.55, 0.45],
      'apple': [-0.3, -0.3, -0.4], 'orange': [-0.25, -0.28, -0.35],
      'happy': [0.2, 0.8, -0.3], 'sad': [0.25, -0.75, -0.35]
    };

    if (semantics[word.toLowerCase()]) {
      return semantics[word.toLowerCase()];
    }

    return embedding;
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function addWord(word) {
    word = word.trim().toLowerCase();
    if (!word || word.length > 30) return;
    if (state.words.includes(word)) {
      ToolsCommon.Toast.show('Word already added', 'error');
      return;
    }
    if (state.words.length >= 15) {
      ToolsCommon.Toast.show('Maximum 15 words', 'error');
      return;
    }

    state.words.push(word);
    state.embeddings[word] = generateEmbedding(word);
    updateUI();
    ToolsCommon.Toast.show(`Added "${word}"`, 'success');
  }

  function removeWord(word) {
    state.words = state.words.filter(w => w !== word);
    delete state.embeddings[word];
    updateUI();
  }

  function loadExample() {
    state.words = [];
    state.embeddings = {};
    EXAMPLE_WORDS.forEach(w => {
      state.words.push(w);
      state.embeddings[w] = generateEmbedding(w);
    });
    updateUI();
    ToolsCommon.Toast.show('Example loaded', 'success');
  }

  function clearAll() {
    state.words = [];
    state.embeddings = {};
    updateUI();
  }

  function updateUI() {
    updateWordsList();
    updateVisualization();
    updateSimilarityMatrix();
    elements.wordCount.textContent = state.words.length;
  }

  function updateWordsList() {
    if (state.words.length === 0) {
      elements.wordsList.innerHTML = '<div class="empty-state">Add words to see them in embedding space</div>';
      return;
    }

    elements.wordsList.innerHTML = state.words.map((word, i) => `
      <div class="word-tag">
        <span class="word-tag-color" style="background-color: ${state.colors[i % state.colors.length]}"></span>
        <span class="word-tag-text">${escapeHtml(word)}</span>
        <button class="word-tag-remove" data-word="${word}" title="Remove">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');

    elements.wordsList.querySelectorAll('.word-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => removeWord(btn.dataset.word));
    });
  }

  function updateVisualization() {
    const canvas = elements.embedCanvas;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const is3D = elements.dimSelect.value === '3d';

    const width = Math.min(container.clientWidth - 32, 600);
    const height = 380;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (state.words.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Add words to visualize', width / 2, height / 2);
      return;
    }

    // Plot points
    const padding = 60;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    // Find bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    state.words.forEach(word => {
      const e = state.embeddings[word];
      minX = Math.min(minX, e[0]);
      maxX = Math.max(maxX, e[0]);
      minY = Math.min(minY, e[1]);
      maxY = Math.max(maxY, e[1]);
    });

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // Draw points and labels
    state.words.forEach((word, i) => {
      const e = state.embeddings[word];
      const x = padding + ((e[0] - minX) / rangeX) * plotWidth;
      const y = padding + ((maxY - e[1]) / rangeY) * plotHeight;

      // 3D effect
      const z = is3D ? e[2] : 0;
      const size = is3D ? 8 + z * 4 : 10;
      const opacity = is3D ? 0.5 + (z + 1) * 0.25 : 1;

      // Point
      ctx.globalAlpha = opacity;
      ctx.fillStyle = state.colors[i % state.colors.length];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.globalAlpha = 1;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#1e293b';
      ctx.font = '11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(word, x, y - size - 5);
    });

    // Axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dimension 1', width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Dimension 2', 0, 0);
    ctx.restore();
  }

  function updateSimilarityMatrix() {
    if (state.words.length < 2) {
      elements.similarityContainer.innerHTML = '<div class="empty-state">Add at least 2 words to see similarity</div>';
      return;
    }

    // Calculate cosine similarities
    const similarities = {};
    state.words.forEach(w1 => {
      similarities[w1] = {};
      state.words.forEach(w2 => {
        similarities[w1][w2] = cosineSimilarity(state.embeddings[w1], state.embeddings[w2]);
      });
    });

    let html = '<table class="similarity-table"><tr><th></th>';
    state.words.forEach(w => html += `<th>${escapeHtml(w)}</th>`);
    html += '</tr>';

    state.words.forEach(w1 => {
      html += `<tr><th>${escapeHtml(w1)}</th>`;
      state.words.forEach(w2 => {
        const sim = similarities[w1][w2];
        const color = sim > 0.8 ? '#22c55e' : sim > 0.5 ? '#f59e0b' : '#64748b';
        const bg = sim > 0.8 ? 'rgba(34, 197, 94, 0.1)' : sim > 0.5 ? 'rgba(245, 158, 11, 0.1)' : 'transparent';
        html += `<td><span class="similarity-cell" style="color: ${color}; background: ${bg}">${sim.toFixed(2)}</span></td>`;
      });
      html += '</tr>';
    });

    html += '</table>';
    elements.similarityContainer.innerHTML = html;
  }

  function cosineSimilarity(a, b) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function exportDiagram() {
    elements.embedCanvas.toBlob(blob => {
      if (blob) {
        ToolsCommon.FileDownload.blob(blob, 'embedding-space.png');
        ToolsCommon.Toast.show('Exported!', 'success');
      }
    }, 'image/png');
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT') {
      if (e.key === 'Enter') {
        addWord(elements.wordInput.value);
        elements.wordInput.value = '';
      }
      return;
    }
    if (e.key.toLowerCase() === 'e') loadExample();
  }

  function init() {
    elements.addWordBtn.addEventListener('click', () => {
      addWord(elements.wordInput.value);
      elements.wordInput.value = '';
    });
    elements.loadExampleBtn.addEventListener('click', loadExample);
    elements.clearAllBtn.addEventListener('click', clearAll);
    elements.dimSelect.addEventListener('change', updateVisualization);
    elements.exportBtn.addEventListener('click', exportDiagram);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', ToolsCommon.debounce(updateVisualization, 200));
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
