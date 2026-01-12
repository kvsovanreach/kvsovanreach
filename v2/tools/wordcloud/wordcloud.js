/**
 * Word Cloud Generator Tool
 * Generate beautiful word clouds from any text
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
    default: ['#3776a1', '#5d8bb3', '#8ab0d0', '#2c5f7f', '#1a4a6b'],
    sunset: ['#ff6b6b', '#ffa07a', '#ffd93d', '#ff8c42', '#e74c3c'],
    ocean: ['#006994', '#40a4c8', '#00c8ff', '#0077b6', '#023e8a'],
    forest: ['#228b22', '#32cd32', '#90ee90', '#2e8b57', '#006400'],
    rainbow: ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'],
    monochrome: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'],
    pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff'],
    neon: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#ff8000']
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
  The digital economy creates new opportunities for entrepreneurs and businesses alike.`;

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    wordCount: document.getElementById('wordCount'),
    uniqueWords: document.getElementById('uniqueWords'),
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

  // ==================== Update Stats ====================
  function updateStats() {
    const text = elements.textInput.value;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const unique = new Set(words.map(w => w.toLowerCase()));

    elements.wordCount.textContent = `${words.length} words`;
    elements.uniqueWords.textContent = `${unique.size} unique`;
  }

  // ==================== Escape HTML ====================
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // ==================== Process Text ====================
  function processText() {
    const text = elements.textInput.value;
    const minLength = parseInt(elements.minLength.value);
    const maxWords = parseInt(elements.maxWords.value);
    const excludeCommonWords = elements.excludeCommon.checked;
    const caseSensitive = elements.caseSensitive.checked;

    // Extract words - clean punctuation but preserve case for case-sensitive mode
    const cleanedText = text.replace(/[^\w\s]/g, '');
    const rawWords = cleanedText.split(/\s+/).filter(w => w.length > 0);

    // Filter words
    const words = rawWords.filter(word => {
      if (word.length < minLength) return false;
      // Check common words using lowercase comparison
      if (excludeCommonWords && commonWords.has(word.toLowerCase())) return false;
      return true;
    });

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      const key = caseSensitive ? word : word.toLowerCase();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    // Sort by frequency
    wordData = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([word, count]) => ({ word, count }));

    return wordData;
  }

  // ==================== Get Random Color ====================
  function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ==================== Calculate Font Size ====================
  function calculateFontSize(count, maxCount) {
    const minSize = 14;
    const maxSize = 64;
    const ratio = count / maxCount;
    return Math.max(minSize, Math.floor(minSize + (maxSize - minSize) * ratio));
  }

  // ==================== Generate Cloud ====================
  function generateCloud() {
    const words = processText();

    if (words.length === 0) {
      ToolsCommon.showToast('Please enter some text to generate a word cloud', 'error');
      return;
    }

    const colors = colorSchemes[elements.colorScheme.value];
    const maxCount = words[0].count;

    // Clear canvas
    elements.cloudCanvas.innerHTML = '';

    // Create word elements (using textContent to prevent XSS)
    words.forEach(({ word, count }) => {
      const span = document.createElement('span');
      span.className = 'cloud-word';
      span.textContent = word; // textContent is safe from XSS
      span.style.fontSize = `${calculateFontSize(count, maxCount)}px`;
      span.style.color = getRandomColor(colors);
      span.title = `${word}: ${count}`;

      // Random rotation (slight)
      const rotation = Math.random() * 10 - 5;
      span.style.transform = `rotate(${rotation}deg)`;

      elements.cloudCanvas.appendChild(span);
    });

    // Show sections
    elements.cloudSection.classList.remove('hidden');
    elements.wordlistSection.classList.remove('hidden');

    // Render word list
    renderWordList(words);

    ToolsCommon.showToast(`Generated cloud with ${words.length} words`, 'success');
  }

  // ==================== Render Word List ====================
  function renderWordList(words) {
    elements.listCount.textContent = `${words.length} words`;

    // Use escapeHtml to prevent XSS
    elements.wordlist.innerHTML = words.map(({ word, count }) => `
      <div class="wordlist-item">
        <span class="wordlist-word">${escapeHtml(word)}</span>
        <span class="wordlist-freq">${count}</span>
      </div>
    `).join('');
  }

  // ==================== Download PNG ====================
  async function downloadPng() {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const rect = elements.cloudCanvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;

      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-bg') || '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw words
      const wordElements = elements.cloudCanvas.querySelectorAll('.cloud-word');
      wordElements.forEach(wordEl => {
        const wordRect = wordEl.getBoundingClientRect();
        const style = getComputedStyle(wordEl);

        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.textBaseline = 'middle';

        const x = wordRect.left - rect.left + wordRect.width / 2;
        const y = wordRect.top - rect.top + wordRect.height / 2;

        ctx.save();
        ctx.translate(x, y);
        const transform = style.transform;
        if (transform && transform !== 'none') {
          const match = transform.match(/rotate\(([-\d.]+)deg\)/);
          if (match) {
            ctx.rotate(parseFloat(match[1]) * Math.PI / 180);
          }
        }
        ctx.textAlign = 'center';
        ctx.fillText(wordEl.textContent, 0, 0);
        ctx.restore();
      });

      // Download
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
    const rect = elements.cloudCanvas.getBoundingClientRect();
    const wordElements = elements.cloudCanvas.querySelectorAll('.cloud-word');

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">`;
    svgContent += `<rect width="100%" height="100%" fill="${getComputedStyle(document.body).getPropertyValue('--color-bg') || '#ffffff'}"/>`;

    wordElements.forEach(wordEl => {
      const wordRect = wordEl.getBoundingClientRect();
      const style = getComputedStyle(wordEl);

      const x = wordRect.left - rect.left + wordRect.width / 2;
      const y = wordRect.top - rect.top + wordRect.height / 2;

      let transform = '';
      const cssTransform = style.transform;
      if (cssTransform && cssTransform !== 'none') {
        const match = cssTransform.match(/rotate\(([-\d.]+)deg\)/);
        if (match) {
          transform = ` transform="rotate(${match[1]} ${x} ${y})"`;
        }
      }

      svgContent += `<text x="${x}" y="${y}" font-family="${style.fontFamily}" font-size="${style.fontSize}" font-weight="${style.fontWeight}" fill="${style.color}" text-anchor="middle" dominant-baseline="middle"${transform}>${wordEl.textContent}</text>`;
    });

    svgContent += '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'wordcloud.svg';
    link.href = URL.createObjectURL(blob);
    link.click();

    ToolsCommon.showToast('Downloaded SVG', 'success');
  }

  // ==================== Copy Word List ====================
  function copyWordList() {
    const list = wordData.map(({ word, count }) => `${word}: ${count}`).join('\n');
    ToolsCommon.copyWithToast(list, 'Copied word list');
  }

  // ==================== Initialize Event Listeners ====================
  function initEventListeners() {
    // Input events
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
      updateStats();
    });

    elements.sampleBtn.addEventListener('click', () => {
      elements.textInput.value = sampleText;
      updateStats();
      ToolsCommon.showToast('Loaded sample text', 'success');
    });

    // Generate
    elements.generateBtn.addEventListener('click', generateCloud);

    // Downloads
    elements.downloadPngBtn.addEventListener('click', downloadPng);
    elements.downloadSvgBtn.addEventListener('click', downloadSvg);
    elements.copyListBtn.addEventListener('click', copyWordList);

    // Keyboard shortcuts
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

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
