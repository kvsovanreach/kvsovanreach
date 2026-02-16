/**
 * KVSOVANREACH Sentence Length Analyzer
 * Visualize sentence length distribution in text
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    sentenceCount: document.getElementById('sentenceCount'),
    avgLength: document.getElementById('avgLength'),
    minLength: document.getElementById('minLength'),
    maxLength: document.getElementById('maxLength'),
    chartContainer: document.getElementById('chartContainer'),
    chartLegend: document.getElementById('chartLegend'),
    sentenceList: document.getElementById('sentenceList'),
    sortSelect: document.getElementById('sortSelect'),
    sampleBtn: document.getElementById('sampleBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    viewBtns: document.querySelectorAll('.view-btn')
  };

  // ==================== State ====================
  const state = {
    sentences: [],
    currentView: 'bar',
    selectedIndex: -1
  };

  // ==================== Constants ====================
  const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This is a simple sentence. However, this particular sentence is considerably longer and contains more words to demonstrate the variation in sentence lengths that might occur in typical written text. Short one. Here we have yet another sentence of medium length that fits somewhere in between. Programming is fun! The art of writing involves varying sentence structures to maintain reader interest and improve overall readability. Why? Because monotonous sentence lengths can make text feel dull and repetitive, while a good mix keeps readers engaged throughout the entire piece.`;

  const LENGTH_CATEGORIES = {
    short: { max: 10, label: 'Short (1-10)', color: '#22c55e' },
    medium: { max: 20, label: 'Medium (11-20)', color: '#3776A1' },
    long: { max: 30, label: 'Long (21-30)', color: '#f59e0b' },
    veryLong: { max: Infinity, label: 'Very Long (30+)', color: '#ef4444' }
  };

  // ==================== Core Functions ====================

  function parseSentences(text) {
    if (!text.trim()) return [];

    // Split by sentence-ending punctuation while preserving the punctuation
    const sentences = text
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return sentences.map((text, index) => {
      const words = text.split(/\s+/).filter(w => w.length > 0);
      return {
        index: index + 1,
        text,
        wordCount: words.length,
        category: getCategory(words.length)
      };
    });
  }

  function getCategory(wordCount) {
    if (wordCount <= LENGTH_CATEGORIES.short.max) return 'short';
    if (wordCount <= LENGTH_CATEGORIES.medium.max) return 'medium';
    if (wordCount <= LENGTH_CATEGORIES.long.max) return 'long';
    return 'very-long';
  }

  function calculateStats(sentences) {
    if (sentences.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }

    const lengths = sentences.map(s => s.wordCount);
    return {
      count: sentences.length,
      avg: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length * 10) / 10,
      min: Math.min(...lengths),
      max: Math.max(...lengths)
    };
  }

  // ==================== UI Functions ====================

  function updateStats(stats) {
    elements.sentenceCount.textContent = stats.count;
    elements.avgLength.textContent = stats.avg;
    elements.minLength.textContent = stats.min;
    elements.maxLength.textContent = stats.max;
  }

  function renderBarChart(sentences) {
    if (sentences.length === 0) {
      elements.chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <i class="fa-solid fa-chart-bar"></i>
          <p>Enter text to visualize sentence lengths</p>
        </div>
      `;
      return;
    }

    const maxLength = Math.max(...sentences.map(s => s.wordCount));

    const barsHtml = sentences.map((s, i) => {
      const height = Math.max(10, (s.wordCount / maxLength) * 180);
      const activeClass = state.selectedIndex === i ? 'active' : '';

      return `
        <div class="bar-wrapper">
          <div class="bar ${s.category} ${activeClass}"
               style="height: ${height}px"
               data-index="${i}"
               title="Sentence ${s.index}: ${s.wordCount} words">
            <span class="bar-value">${s.wordCount}</span>
          </div>
          <span class="bar-label">#${s.index}</span>
        </div>
      `;
    }).join('');

    elements.chartContainer.innerHTML = `<div class="bar-chart">${barsHtml}</div>`;

    // Add click handlers
    elements.chartContainer.querySelectorAll('.bar').forEach(bar => {
      bar.addEventListener('click', () => {
        const index = parseInt(bar.dataset.index);
        selectSentence(index);
      });
    });
  }

  function renderHistogram(sentences) {
    if (sentences.length === 0) {
      elements.chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <i class="fa-solid fa-chart-bar"></i>
          <p>Enter text to visualize sentence lengths</p>
        </div>
      `;
      return;
    }

    const categories = {
      short: sentences.filter(s => s.category === 'short').length,
      medium: sentences.filter(s => s.category === 'medium').length,
      long: sentences.filter(s => s.category === 'long').length,
      'very-long': sentences.filter(s => s.category === 'very-long').length
    };

    const maxCount = Math.max(...Object.values(categories), 1);

    const rowsHtml = [
      { key: 'short', label: LENGTH_CATEGORIES.short.label },
      { key: 'medium', label: LENGTH_CATEGORIES.medium.label },
      { key: 'long', label: LENGTH_CATEGORIES.long.label },
      { key: 'very-long', label: LENGTH_CATEGORIES.veryLong.label }
    ].map(({ key, label }) => {
      const count = categories[key];
      const width = (count / maxCount) * 100;

      return `
        <div class="histogram-row">
          <span class="histogram-label">${label}</span>
          <div class="histogram-bar-wrapper">
            <div class="histogram-bar ${key}" style="width: ${width}%"></div>
          </div>
          <span class="histogram-count">${count}</span>
        </div>
      `;
    }).join('');

    elements.chartContainer.innerHTML = `<div class="histogram">${rowsHtml}</div>`;
  }

  function renderLegend() {
    elements.chartLegend.innerHTML = `
      <div class="legend-item">
        <span class="legend-color short"></span>
        <span>Short (1-10)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color medium"></span>
        <span>Medium (11-20)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color long"></span>
        <span>Long (21-30)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color very-long"></span>
        <span>Very Long (30+)</span>
      </div>
    `;
  }

  function renderSentenceList(sentences) {
    if (sentences.length === 0) {
      elements.sentenceList.innerHTML = `
        <div class="list-placeholder">
          <i class="fa-solid fa-file-lines"></i>
          <p>Sentences will appear here</p>
        </div>
      `;
      return;
    }

    const sortedSentences = sortSentences([...sentences]);

    const listHtml = sortedSentences.map(s => {
      const originalIndex = sentences.findIndex(sent => sent.index === s.index);
      const activeClass = state.selectedIndex === originalIndex ? 'active' : '';

      return `
        <div class="sentence-item ${activeClass}" data-index="${originalIndex}">
          <span class="sentence-number">${s.index}</span>
          <span class="sentence-text">${escapeHtml(s.text)}</span>
          <span class="sentence-length ${s.category}">
            <i class="fa-solid fa-font"></i>
            ${s.wordCount} words
          </span>
        </div>
      `;
    }).join('');

    elements.sentenceList.innerHTML = listHtml;

    // Add click handlers
    elements.sentenceList.querySelectorAll('.sentence-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        selectSentence(index);
      });
    });
  }

  function sortSentences(sentences) {
    const sortBy = elements.sortSelect.value;

    switch (sortBy) {
      case 'length-desc':
        return sentences.sort((a, b) => b.wordCount - a.wordCount);
      case 'length-asc':
        return sentences.sort((a, b) => a.wordCount - b.wordCount);
      default:
        return sentences.sort((a, b) => a.index - b.index);
    }
  }

  function selectSentence(index) {
    state.selectedIndex = state.selectedIndex === index ? -1 : index;
    renderChart();
    renderSentenceList(state.sentences);

    // Scroll to selected item in list
    if (state.selectedIndex >= 0) {
      const item = elements.sentenceList.querySelector(`[data-index="${state.selectedIndex}"]`);
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function renderChart() {
    if (state.currentView === 'bar') {
      renderBarChart(state.sentences);
    } else {
      renderHistogram(state.sentences);
    }
  }

  function analyze() {
    const text = elements.textInput.value;
    state.sentences = parseSentences(text);
    state.selectedIndex = -1;

    const stats = calculateStats(state.sentences);
    updateStats(stats);
    renderChart();
    renderLegend();
    renderSentenceList(state.sentences);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== Event Handlers ====================

  function handleInput() {
    analyze();
  }

  function handleViewChange(e) {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;

    elements.viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    state.currentView = btn.dataset.view;
    renderChart();
  }

  function handleSortChange() {
    renderSentenceList(state.sentences);
  }

  function loadSample() {
    elements.textInput.value = SAMPLE_TEXT;
    analyze();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.show('Sample text loaded');
    }
  }

  function clearAll() {
    elements.textInput.value = '';
    state.sentences = [];
    state.selectedIndex = -1;
    analyze();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.show('Cleared');
    }
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      analyze();

      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.Toast.success('Text pasted');
      }
    } catch (err) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.Toast.error('Failed to paste');
      }
    }
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete') {
      clearAll();
    }
  }

  // ==================== Initialization ====================

  function setupEventListeners() {
    elements.textInput.addEventListener('input', ToolsCommon?.debounce?.(handleInput, 300) || handleInput);
    elements.sortSelect.addEventListener('change', handleSortChange);
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.pasteBtn.addEventListener('click', pasteText);

    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', handleViewChange);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function init() {
    setupEventListeners();
    renderLegend();

    // Initial render
    analyze();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
