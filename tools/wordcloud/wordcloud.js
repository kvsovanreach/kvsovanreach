/**
 * Word Cloud Generator Tool
 * Professional word cloud with efficient packing algorithm
 */

(function() {
  'use strict';

  // ==================== Common Words to Exclude ====================
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'does', 'did',
    'am', 'very', 'just', 'more', 'much', 'such', 'own', 'same', 'each', 'every'
  ]);

  // ==================== Color Schemes ====================
  const colorSchemes = {
    default: ['#1a365d', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1', '#63b3ed'],
    sunset: ['#c53030', '#e53e3e', '#f56565', '#ed8936', '#ecc94b', '#f6ad55'],
    ocean: ['#1a365d', '#2a4365', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1'],
    forest: ['#1c4532', '#22543d', '#276749', '#2f855a', '#38a169', '#48bb78'],
    rainbow: ['#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#4299e1', '#9f7aea'],
    monochrome: ['#1a202c', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0'],
    pastel: ['#fc8181', '#f6ad55', '#faf089', '#68d391', '#63b3ed', '#b794f4'],
    neon: ['#ff0080', '#ff00ff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
  };

  // ==================== Sample Text ====================
  const sampleText = `Technology innovation is transforming the way we live and work.
  Artificial intelligence and machine learning are revolutionizing industries from healthcare to finance.
  Cloud computing enables businesses to scale efficiently while reducing infrastructure costs.
  Data science helps organizations make better decisions through advanced analytics.
  Cybersecurity remains a critical concern as digital transformation accelerates.
  The future of technology promises exciting developments in quantum computing,
  blockchain, virtual reality, and sustainable energy solutions.
  Programming languages continue to evolve, with Python, JavaScript, and Rust leading innovation.
  Open source software empowers developers worldwide to collaborate and create amazing tools.
  User experience design puts people at the center of technology development.
  Mobile applications connect billions of people across the globe.
  Technology technology technology innovation innovation data science machine learning
  artificial intelligence cloud computing programming development software engineering`;

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    wordCount: document.getElementById('wordCount'),
    uniqueWords: document.getElementById('uniqueWords'),
    cloudShape: document.getElementById('cloudShape'),
    colorScheme: document.getElementById('colorScheme'),
    maxWords: document.getElementById('maxWords'),
    minLength: document.getElementById('minLength'),
    excludeCommon: document.getElementById('excludeCommon'),
    caseSensitive: document.getElementById('caseSensitive'),
    generateBtn: document.getElementById('generateBtn'),
    cloudSection: document.getElementById('cloudSection'),
    cloudCanvas: document.getElementById('cloudCanvas'),
    downloadPngBtn: document.getElementById('downloadPngBtn'),
    downloadSvgBtn: document.getElementById('downloadSvgBtn'),
    copyListBtn: document.getElementById('copyListBtn'),
    wordlistSection: document.getElementById('wordlistSection'),
    wordlist: document.getElementById('wordlist'),
    listCount: document.getElementById('listCount')
  };

  // ==================== State ====================
  let wordData = [];
  let placedWords = [];

  // ==================== Update Stats ====================
  function updateStats() {
    const text = elements.textInput.value;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const unique = new Set(words.map(w => w.toLowerCase()));
    elements.wordCount.textContent = `${words.length} words`;
    elements.uniqueWords.textContent = `${unique.size} unique`;
  }

  // ==================== Escape Functions ====================
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  function escapeXml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  // ==================== Process Text ====================
  function processText() {
    const text = elements.textInput.value;
    const minLength = parseInt(elements.minLength.value);
    const maxWords = parseInt(elements.maxWords.value);
    const excludeCommonWords = elements.excludeCommon.checked;
    const caseSensitive = elements.caseSensitive.checked;

    const cleanedText = text.replace(/[^\w\s'-]/g, '').toLowerCase();
    const rawWords = cleanedText.split(/\s+/).filter(w => w.length > 0);

    const words = rawWords.filter(word => {
      if (word.length < minLength) return false;
      if (excludeCommonWords && commonWords.has(word.toLowerCase())) return false;
      return true;
    });

    const frequency = {};
    words.forEach(word => {
      const key = caseSensitive ? word : word.toLowerCase();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    wordData = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([word, count]) => ({ word, count }));

    return wordData;
  }

  // ==================== Calculate Font Sizes ====================
  function calculateFontSizes(words, maxSize, minSize) {
    if (words.length === 0) return [];

    const maxCount = words[0].count;
    const minCount = words[words.length - 1].count;
    const gamma = 0.6; // Reduce dominance of top words

    return words.map((item, index) => {
      let weight = maxCount === minCount ? 1 : (item.count - minCount) / (maxCount - minCount);
      weight = Math.pow(weight, gamma);
      const fontSize = Math.round(minSize + (maxSize - minSize) * weight);
      return { word: item.word, count: item.count, fontSize, index };
    });
  }

  // ==================== Measure Word ====================
  function measureWord(word, fontSize, rotation) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `700 ${fontSize}px Inter, -apple-system, sans-serif`;

    const metrics = ctx.measureText(word);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontSize * 1.2);

    const isRotated = rotation === 90;
    return {
      width: isRotated ? textHeight : textWidth,
      height: isRotated ? textWidth : textHeight
    };
  }

  // ==================== Simple Shape Mask ====================
  function createShapeMask(width, height, shape) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';

    switch (shape) {
      case 'rectangle':
        ctx.fillRect(width * 0.02, height * 0.02, width * 0.96, height * 0.96);
        break;
      case 'square': {
        const size = minDim * 0.96;
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        break;
      }
      case 'circle':
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.48, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle': {
        const size = minDim * 0.9;
        const h = size * 0.866;
        ctx.beginPath();
        ctx.moveTo(cx, cy - h / 2);
        ctx.lineTo(cx - size / 2, cy + h / 2);
        ctx.lineTo(cx + size / 2, cy + h / 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'diamond': {
        const size = minDim * 0.48;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'star': {
        const outer = minDim * 0.45;
        const inner = minDim * 0.2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outer : inner;
          const angle = (i * Math.PI / 5) - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'heart': {
        const scale = minDim * 0.014;
        ctx.beginPath();
        ctx.moveTo(cx, cy + scale * 15);
        ctx.bezierCurveTo(cx - scale * 25, cy - scale * 5, cx - scale * 25, cy - scale * 20, cx, cy - scale * 10);
        ctx.bezierCurveTo(cx + scale * 25, cy - scale * 20, cx + scale * 25, cy - scale * 5, cx, cy + scale * 15);
        ctx.fill();
        break;
      }
      default:
        ctx.fillRect(0, 0, width, height);
    }

    const imageData = ctx.getImageData(0, 0, width, height);

    return {
      width,
      height,
      centerX: cx,
      centerY: cy,
      isInside: (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
        return imageData.data[idx] > 128;
      },
      isRectInside: (x, y, w, h) => {
        const points = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
        for (const [px, py] of points) {
          if (px < 0 || px >= width || py < 0 || py >= height) return false;
          const idx = (Math.floor(py) * width + Math.floor(px)) * 4;
          if (imageData.data[idx] <= 128) return false;
        }
        return true;
      }
    };
  }

  // ==================== Spatial Grid for Collision ====================
  function createSpatialGrid(width, height, cellSize = 25) {
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const cells = new Array(cols * rows).fill(null).map(() => []);

    return {
      add: (rect) => {
        const minCol = Math.max(0, Math.floor(rect.x / cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((rect.x + rect.width) / cellSize));
        const minRow = Math.max(0, Math.floor(rect.y / cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((rect.y + rect.height) / cellSize));
        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            cells[row * cols + col].push(rect);
          }
        }
      },
      collides: (rect) => {
        const minCol = Math.max(0, Math.floor(rect.x / cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((rect.x + rect.width) / cellSize));
        const minRow = Math.max(0, Math.floor(rect.y / cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((rect.y + rect.height) / cellSize));

        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            for (const other of cells[row * cols + col]) {
              if (!(rect.x + rect.width + 2 <= other.x ||
                    other.x + other.width + 2 <= rect.x ||
                    rect.y + rect.height + 2 <= other.y ||
                    other.y + other.height + 2 <= rect.y)) {
                return true;
              }
            }
          }
        }
        return false;
      },
      clear: () => {
        for (let i = 0; i < cells.length; i++) {
          cells[i] = [];
        }
      }
    };
  }

  // ==================== Find Position with Spiral ====================
  function findPosition(bounds, shapeMask, grid) {
    const { width, height } = bounds;
    const cx = shapeMask.centerX;
    const cy = shapeMask.centerY;
    const maxRadius = Math.max(shapeMask.width, shapeMask.height);

    // Spiral from center
    const step = Math.max(4, Math.min(width, height) / 3);
    let angle = Math.random() * Math.PI * 2; // Random start angle
    let radius = 0;

    while (radius < maxRadius) {
      const x = Math.round(cx + radius * Math.cos(angle) - width / 2);
      const y = Math.round(cy + radius * Math.sin(angle) - height / 2);

      const rect = { x, y, width, height };

      if (shapeMask.isRectInside(x, y, width, height) && !grid.collides(rect)) {
        return { x, y };
      }

      angle += step / Math.max(radius, step);
      radius += step / (2 * Math.PI);
    }

    return null;
  }

  // ==================== Get Color ====================
  function getColor(colors, index, total) {
    const colorIndex = Math.floor((index / total) * colors.length);
    return colors[Math.min(colorIndex, colors.length - 1)];
  }

  // ==================== Generate Cloud ====================
  function generateCloud() {
    const words = processText();

    if (words.length === 0) {
      ToolsCommon.showToast('Please enter some text to generate a word cloud', 'error');
      return;
    }

    elements.generateBtn.disabled = true;
    const originalHTML = elements.generateBtn.innerHTML;
    elements.generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Generating...</span>';

    setTimeout(() => {
      try {
        doGenerateCloud(words);
      } finally {
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = originalHTML;
      }
    }, 30);
  }

  function doGenerateCloud(words) {
    const canvasRect = elements.cloudCanvas.getBoundingClientRect();
    const canvasWidth = Math.floor(canvasRect.width) || 800;
    const canvasHeight = Math.floor(canvasRect.height) || 400;

    const shape = elements.cloudShape.value;
    const shapeMask = createShapeMask(canvasWidth, canvasHeight, shape);
    const grid = createSpatialGrid(canvasWidth, canvasHeight);
    const colors = colorSchemes[elements.colorScheme.value];

    // Calculate base font sizes
    const minDim = Math.min(canvasWidth, canvasHeight);
    let maxFontSize = Math.min(70, minDim / 5);
    let minFontSize = Math.max(10, maxFontSize / 6);

    // Reduce sizes for many words
    if (words.length > 50) maxFontSize *= 0.75;
    if (words.length > 100) { maxFontSize *= 0.75; minFontSize *= 0.8; }

    // Initialize
    placedWords = [];
    elements.cloudCanvas.innerHTML = '';
    elements.cloudCanvas.style.position = 'relative';

    // Try with progressively smaller scales until all words fit
    let scale = 1.0;
    const minScale = 0.25;

    while (scale >= minScale) {
      placedWords = [];
      grid.clear();

      const currentMax = maxFontSize * scale;
      const currentMin = Math.max(8, minFontSize * scale);
      let sizedWords = calculateFontSizes(words, currentMax, currentMin);

      // Add colors and rotation
      sizedWords = sizedWords.map((w, i) => ({
        ...w,
        color: getColor(colors, i, words.length),
        rotation: (w.word.charCodeAt(0) % 5) === 0 ? 90 : 0 // ~20% vertical
      }));

      // Sort by size (big first)
      sizedWords.sort((a, b) => b.fontSize - a.fontSize);

      let allPlaced = true;

      for (const wordInfo of sizedWords) {
        let placed = false;
        let fontSize = wordInfo.fontSize;
        const minWordSize = Math.max(8, currentMin * 0.7);

        while (!placed && fontSize >= minWordSize) {
          // Try preferred rotation first, then alternative
          const rotations = [wordInfo.rotation, wordInfo.rotation === 0 ? 90 : 0];

          for (const rotation of rotations) {
            const bounds = measureWord(wordInfo.word, fontSize, rotation);
            const pos = findPosition(bounds, shapeMask, grid);

            if (pos) {
              const rect = {
                x: pos.x,
                y: pos.y,
                width: bounds.width,
                height: bounds.height,
                word: wordInfo.word,
                count: wordInfo.count,
                fontSize,
                color: wordInfo.color,
                rotation
              };
              grid.add(rect);
              placedWords.push(rect);
              placed = true;
              break;
            }
          }

          if (!placed) fontSize = Math.floor(fontSize * 0.85);
        }

        if (!placed) allPlaced = false;
      }

      if (allPlaced) break;
      scale *= 0.8;
    }

    // Render words
    for (const word of placedWords) {
      const span = document.createElement('span');
      span.className = 'cloud-word';
      span.textContent = word.word;

      const centerX = word.x + word.width / 2;
      const centerY = word.y + word.height / 2;

      span.style.cssText = `
        position: absolute;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: ${word.fontSize}px;
        font-weight: 700;
        color: ${word.color};
        transform: translate(-50%, -50%) rotate(${word.rotation}deg);
        white-space: nowrap;
        line-height: 1;
        font-family: Inter, -apple-system, sans-serif;
      `;
      span.title = `${word.word}: ${word.count}`;
      elements.cloudCanvas.appendChild(span);
    }

    elements.cloudSection.classList.remove('hidden');
    elements.wordlistSection.classList.remove('hidden');
    renderWordList(wordData);

    if (placedWords.length === words.length) {
      ToolsCommon.showToast(`All ${placedWords.length} words placed!`, 'success');
    } else {
      ToolsCommon.showToast(`Placed ${placedWords.length}/${words.length} words`, 'warning');
    }
  }

  // ==================== Render Word List ====================
  function renderWordList(words) {
    elements.listCount.textContent = `${words.length} words`;
    elements.wordlist.innerHTML = words.map(({ word, count }) => `
      <div class="wordlist-item">
        <span class="wordlist-word">${escapeHtml(word)}</span>
        <span class="wordlist-freq">${count}</span>
      </div>
    `).join('');
  }

  // ==================== Download PNG ====================
  async function downloadPng() {
    if (placedWords.length === 0) {
      ToolsCommon.showToast('Generate a word cloud first', 'error');
      return;
    }

    try {
      const rect = elements.cloudCanvas.getBoundingClientRect();
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-bg').trim() || '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      for (const word of placedWords) {
        ctx.save();
        ctx.font = `700 ${word.fontSize}px Inter, -apple-system, sans-serif`;
        ctx.fillStyle = word.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = word.x + word.width / 2;
        const centerY = word.y + word.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(word.rotation * Math.PI / 180);
        ctx.fillText(word.word, 0, 0);
        ctx.restore();
      }

      const link = document.createElement('a');
      link.download = 'wordcloud.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      ToolsCommon.showToast('Downloaded PNG', 'success');
    } catch (error) {
      ToolsCommon.showToast('Failed to download PNG', 'error');
    }
  }

  // ==================== Download SVG ====================
  function downloadSvg() {
    if (placedWords.length === 0) {
      ToolsCommon.showToast('Generate a word cloud first', 'error');
      return;
    }

    const rect = elements.cloudCanvas.getBoundingClientRect();
    const bgColor = getComputedStyle(document.body).getPropertyValue('--color-bg').trim() || '#ffffff';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">`;
    svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
    svg += `<style>text { font-family: Inter, -apple-system, sans-serif; font-weight: 700; }</style>`;

    for (const word of placedWords) {
      const centerX = word.x + word.width / 2;
      const centerY = word.y + word.height / 2;
      const escaped = escapeXml(word.word);

      if (word.rotation !== 0) {
        svg += `<text x="${centerX}" y="${centerY}" font-size="${word.fontSize}" fill="${word.color}" text-anchor="middle" dominant-baseline="central" transform="rotate(${word.rotation} ${centerX} ${centerY})">${escaped}</text>`;
      } else {
        svg += `<text x="${centerX}" y="${centerY}" font-size="${word.fontSize}" fill="${word.color}" text-anchor="middle" dominant-baseline="central">${escaped}</text>`;
      }
    }

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'wordcloud.svg';
    link.href = URL.createObjectURL(blob);
    link.click();

    ToolsCommon.showToast('Downloaded SVG', 'success');
  }

  // ==================== Copy Word List ====================
  function copyWordList() {
    if (wordData.length === 0) {
      ToolsCommon.showToast('Generate a word cloud first', 'error');
      return;
    }
    const list = wordData.map(({ word, count }) => `${word}: ${count}`).join('\n');
    ToolsCommon.copyWithToast(list, 'Copied word list');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    elements.textInput.addEventListener('input', ToolsCommon.debounce(updateStats, 200));

    elements.pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        elements.textInput.value = text;
        updateStats();
        ToolsCommon.showToast('Pasted text', 'success');
      } catch {
        ToolsCommon.showToast('Failed to paste', 'error');
      }
    });

    elements.clearBtn.addEventListener('click', () => {
      elements.textInput.value = '';
      elements.cloudSection.classList.add('hidden');
      elements.wordlistSection.classList.add('hidden');
      wordData = [];
      placedWords = [];
      updateStats();
    });

    elements.sampleBtn.addEventListener('click', () => {
      elements.textInput.value = sampleText;
      updateStats();
      ToolsCommon.showToast('Loaded sample text', 'success');
    });

    elements.generateBtn.addEventListener('click', generateCloud);
    elements.downloadPngBtn.addEventListener('click', downloadPng);
    elements.downloadSvgBtn.addEventListener('click', downloadSvg);
    elements.copyListBtn.addEventListener('click', copyWordList);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateCloud();
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
