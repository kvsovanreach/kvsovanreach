/**
 * KVSOVANREACH Sentence Length Analyzer
 * Refactored to follow Color Picker design pattern
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeTab: 'editor',
    sentences: [],
    currentView: 'bar',
    selectedIndex: -1,
    isAnalyzing: false,
    isDirty: true, // Track if text changed since last analysis
    stats: {
      count: 0,
      avg: 0,
      min: 0,
      max: 0
    }
  };

  // ==================== Constants ====================
  const LENGTH_CATEGORIES = {
    short: { max: 10, label: 'Short (1-10)', color: '#22c55e' },
    medium: { max: 20, label: 'Medium (11-20)', color: '#3776A1' },
    long: { max: 30, label: 'Long (21-30)', color: '#f59e0b' },
    veryLong: { max: Infinity, label: 'Very Long (30+)', color: '#ef4444' }
  };

  const MAX_BARS = 100; // Limit bars for performance
  const MAX_LIST_ITEMS = 50; // Limit sentence list items

  // ==================== Sample Texts ====================
  const SAMPLE_TEXTS = {
    hemingway: `The sun rose. It was hot. The man walked. He was tired. The road was long. He kept walking. Water. He needed water. The sun beat down. His feet hurt. But he walked. Always forward. Never stopping. That was all he knew. Walking.`,

    academic: `The theoretical framework underpinning this research methodology encompasses a comprehensive examination of the multifaceted relationships between cognitive processing mechanisms and environmental stimuli, as articulated in the seminal works of developmental psychologists who have extensively documented the progressive stages of human intellectual development throughout the lifespan. Furthermore, the empirical evidence gathered through longitudinal studies conducted across multiple international research institutions demonstrates a statistically significant correlation between early childhood educational interventions and subsequent academic achievement outcomes in adolescence and adulthood. These findings necessitate a fundamental reconceptualization of pedagogical approaches within contemporary educational systems.`,

    marketing: `Introducing the future. It's here. Our revolutionary product will change everything you know about productivity. Imagine accomplishing more in less time. That's what we offer. No compromises. Just results. Thousands of satisfied customers have already discovered the secret to success. Why wait? Join them today and transform your life forever. Limited time offer. Act now. Your future self will thank you.`,

    technical: `First, initialize the database connection. Check the configuration file for correct credentials. If authentication fails, verify the hostname and port settings. The system supports both MySQL and PostgreSQL backends. For optimal performance, enable connection pooling. Set the maximum pool size to match your expected concurrent users. Remember to implement proper error handling throughout your application. Always close connections when they're no longer needed to prevent resource leaks.`,

    story: `The old lighthouse keeper climbed the spiral staircase one last time, his weathered hands gripping the iron railing that he had polished for forty years. Tonight would be different from all the others. Outside, the storm gathered its fury, waves crashing against the rocks below with a violence that shook the very foundations of his solitary home. He had seen many storms, but this one felt different, as if the sea itself was trying to tell him something important. In the lamp room at the top, he checked the ancient mechanism that had guided countless ships to safety, knowing that his replacement would arrive with the morning tide.`,

    news: `Local officials announced plans today for a new community center. The $5 million project will break ground next spring. Residents have long requested such a facility. The center will include a gymnasium, meeting rooms, and a computer lab. Mayor Johnson called it "a significant investment in our community's future." Construction is expected to take 18 months. The project received unanimous approval from the city council last week.`
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.sentence-panel');
    elements.sentenceMain = document.querySelector('.sentence-main');

    // Editor
    elements.textInput = document.getElementById('textInput');

    // Chart
    elements.chartContainer = document.getElementById('chartContainer');
    elements.viewBtns = document.querySelectorAll('.view-btn');
    elements.selectedSentenceInfo = document.getElementById('selectedSentenceInfo');
    elements.selectedSentenceText = document.getElementById('selectedSentenceText');
    elements.selectedSentenceCount = document.getElementById('selectedSentenceCount');

    // Stats
    elements.sentenceCount = document.getElementById('sentenceCount');
    elements.avgLength = document.getElementById('avgLength');
    elements.minLength = document.getElementById('minLength');
    elements.maxLength = document.getElementById('maxLength');

    // Sentence List
    elements.sentenceList = document.getElementById('sentenceList');
    elements.sortSelect = document.getElementById('sortSelect');

    // Buttons
    elements.analyzeBtn = document.getElementById('analyzeBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.pasteBtn = document.getElementById('pasteBtn');
    elements.deselectBtn = document.getElementById('deselectBtn');

    // Samples
    elements.samplesGrid = document.getElementById('samplesGrid');
  }

  // ==================== Tab Navigation ====================
  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName, skipAnalysis = false) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.tool-tab[data-tab="${tabName}"]`);
    if (tab) {
      tab.classList.add('active');
      document.getElementById(tabName + 'Panel').classList.add('active');
      state.activeTab = tabName;

      // Toggle full-width layout for Samples tab
      const isFullWidth = tabName === 'samples';
      elements.sentenceMain.classList.toggle('full-width', isFullWidth);

      // Analyze when switching to chart tab if data is dirty
      if (tabName === 'chart' && !skipAnalysis && state.isDirty) {
        analyzeAsync();
      } else if (tabName === 'chart' && !skipAnalysis) {
        // Just render if data is fresh
        renderChart();
        updateSelectedInfo();
      }
    }
  }

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
  function updateStats() {
    elements.sentenceCount.textContent = state.stats.count;
    elements.avgLength.textContent = state.stats.avg;
    elements.minLength.textContent = state.stats.min;
    elements.maxLength.textContent = state.stats.max;
  }

  function renderBarChart(sentences) {
    if (sentences.length === 0) {
      elements.chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <i class="fa-solid fa-chart-bar"></i>
          <p>Enter text in the Editor tab to visualize sentence lengths</p>
        </div>
      `;
      return;
    }

    // Limit bars for performance
    const displaySentences = sentences.slice(0, MAX_BARS);
    const hasMore = sentences.length > MAX_BARS;
    const maxLength = Math.max(...sentences.map(s => s.wordCount));

    const barsHtml = displaySentences.map((s, i) => {
      const height = Math.max(10, (s.wordCount / maxLength) * 180);
      const activeClass = state.selectedIndex === i ? 'active' : '';
      const dimmedClass = state.selectedIndex !== -1 && state.selectedIndex !== i ? 'dimmed' : '';

      return `
        <div class="bar-wrapper">
          <div class="bar ${s.category} ${activeClass} ${dimmedClass}"
               style="height: ${height}px"
               data-index="${i}"
               title="Sentence ${s.index}: ${s.wordCount} words">
            <span class="bar-value">${s.wordCount}</span>
          </div>
          <span class="bar-label">#${s.index}</span>
        </div>
      `;
    }).join('');

    const moreIndicator = hasMore ? `<div class="chart-more">+${sentences.length - MAX_BARS} more (use histogram view)</div>` : '';
    elements.chartContainer.innerHTML = `<div class="bar-chart">${barsHtml}</div>${moreIndicator}`;

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
          <p>Enter text in the Editor tab to visualize sentence lengths</p>
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

  function renderSentenceList(sentences) {
    if (sentences.length === 0) {
      elements.sentenceList.innerHTML = '<div class="sentencelist-empty">No sentences yet</div>';
      return;
    }

    const sortedSentences = sortSentences([...sentences]);
    // Limit items for performance
    const displaySentences = sortedSentences.slice(0, MAX_LIST_ITEMS);

    const listHtml = displaySentences.map(s => {
      const originalIndex = sentences.findIndex(sent => sent.index === s.index);
      const activeClass = state.selectedIndex === originalIndex ? 'selected' : '';

      return `
        <div class="sentence-item ${activeClass}" data-index="${originalIndex}">
          <span class="sentence-number">${s.index}</span>
          <span class="sentence-text">${escapeHtml(truncateText(s.text, 50))}</span>
          <span class="sentence-length ${s.category}">${s.wordCount}</span>
        </div>
      `;
    }).join('');

    elements.sentenceList.innerHTML = listHtml;

    // Add click handlers using event delegation for better performance
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
    if (state.selectedIndex === index) {
      state.selectedIndex = -1;
    } else {
      state.selectedIndex = index;
    }
    renderChart();
    renderSentenceList(state.sentences);
    updateSelectedInfo();
  }

  function deselectSentence() {
    state.selectedIndex = -1;
    renderChart();
    renderSentenceList(state.sentences);
    updateSelectedInfo();
  }

  function updateSelectedInfo() {
    if (state.selectedIndex >= 0 && state.sentences[state.selectedIndex]) {
      const sentence = state.sentences[state.selectedIndex];
      elements.selectedSentenceInfo.classList.remove('hidden');
      elements.selectedSentenceText.textContent = truncateText(sentence.text, 60);
      elements.selectedSentenceCount.textContent = sentence.wordCount + ' words';
    } else {
      elements.selectedSentenceInfo.classList.add('hidden');
    }
  }

  function renderChart() {
    if (state.currentView === 'bar') {
      renderBarChart(state.sentences);
    } else {
      renderHistogram(state.sentences);
    }
  }

  function showLoading() {
    elements.chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Analyzing text...</p>
      </div>
    `;
  }

  function analyze(callback) {
    const text = elements.textInput.value;
    state.sentences = parseSentences(text);
    state.stats = calculateStats(state.sentences);
    state.isDirty = false;

    updateStats();
    renderChart();
    renderSentenceList(state.sentences);
    updateSelectedInfo();

    if (callback) callback();
  }

  function analyzeAsync(callback) {
    if (state.isAnalyzing) return;

    const text = elements.textInput.value;
    if (!text.trim()) {
      state.sentences = [];
      state.stats = { count: 0, avg: 0, min: 0, max: 0 };
      state.isDirty = false;
      updateStats();
      renderChart();
      renderSentenceList([]);
      if (callback) callback();
      return;
    }

    state.isAnalyzing = true;
    showLoading();

    // Defer heavy computation to allow UI to update
    setTimeout(() => {
      state.sentences = parseSentences(text);
      state.stats = calculateStats(state.sentences);
      state.isDirty = false;

      updateStats();
      renderChart();
      renderSentenceList(state.sentences);
      updateSelectedInfo();

      state.isAnalyzing = false;
      if (callback) callback();
    }, 10);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // ==================== Actions ====================
  function copyReport() {
    const text = elements.textInput.value.trim();
    if (!text) {
      ToolsCommon.showToast('No text to analyze', 'error');
      return;
    }

    const stats = state.stats;
    const categories = {
      short: state.sentences.filter(s => s.category === 'short').length,
      medium: state.sentences.filter(s => s.category === 'medium').length,
      long: state.sentences.filter(s => s.category === 'long').length,
      'very-long': state.sentences.filter(s => s.category === 'very-long').length
    };

    const report = `Sentence Length Analysis Report
==============================
Total Sentences: ${stats.count}
Average Length: ${stats.avg} words
Min Length: ${stats.min} words
Max Length: ${stats.max} words

Distribution:
  Short (1-10 words): ${categories.short}
  Medium (11-20 words): ${categories.medium}
  Long (21-30 words): ${categories.long}
  Very Long (30+ words): ${categories['very-long']}
`;

    ToolsCommon.copyWithToast(report, 'Report copied!');
  }

  function clearAll() {
    elements.textInput.value = '';
    state.sentences = [];
    state.selectedIndex = -1;
    state.isDirty = false;
    state.stats = { count: 0, avg: 0, min: 0, max: 0 };
    updateStats();
    renderChart();
    renderSentenceList([]);
    ToolsCommon.showToast('Cleared', 'info');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      state.selectedIndex = -1;
      state.isDirty = true;
      ToolsCommon.showToast('Text pasted', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function loadSample(sampleName) {
    const text = SAMPLE_TEXTS[sampleName];
    if (text) {
      elements.textInput.value = text;
      state.selectedIndex = -1;
      state.isDirty = true;
      switchTab('editor');
      ToolsCommon.showToast('Sample loaded!', 'success');
    }
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Input events - mark as dirty, defer full analysis
    elements.textInput.addEventListener('input', () => {
      state.isDirty = true;
      state.selectedIndex = -1;
    });
    elements.sortSelect.addEventListener('change', () => {
      renderSentenceList(state.sentences);
    });

    // View toggle
    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentView = btn.dataset.view;
        renderChart();
      });
    });

    // Quick action buttons
    elements.analyzeBtn.addEventListener('click', () => {
      if (!elements.textInput.value.trim()) {
        ToolsCommon.showToast('Enter text to analyze', 'info');
        return;
      }
      // Switch to chart tab first, then analyze async
      switchTab('chart', true);
      analyzeAsync();
    });
    elements.copyBtn.addEventListener('click', copyReport);
    elements.clearBtn.addEventListener('click', clearAll);

    // Editor action buttons
    elements.pasteBtn.addEventListener('click', pasteText);

    // Chart action buttons
    elements.deselectBtn.addEventListener('click', deselectSentence);

    // Sample cards
    elements.samplesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.sample-card');
      if (card) {
        loadSample(card.dataset.sample);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'a':
        e.preventDefault();
        if (elements.textInput.value.trim()) {
          switchTab('chart', true);
          analyzeAsync();
        }
        break;

      case 'c':
        e.preventDefault();
        copyReport();
        break;

      case 'delete':
        e.preventDefault();
        clearAll();
        break;

      case 'escape':
        e.preventDefault();
        deselectSentence();
        break;

      case '1':
        e.preventDefault();
        switchTab('editor');
        break;

      case '2':
        e.preventDefault();
        switchTab('chart');
        break;

      case '3':
        e.preventDefault();
        switchTab('samples');
        break;
    }
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initTabs();
    bindEvents();
    // Initial empty state
    updateStats();
    renderChart();
    renderSentenceList([]);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
