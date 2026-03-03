/**
 * KVSOVANREACH Repetition Heatmap
 * Refactored to follow Color Picker design pattern
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeTab: 'editor',
    wordFrequency: {},
    selectedWord: null,
    stats: {
      total: 0,
      unique: 0,
      repeated: 0,
      maxRepeat: 0
    }
  };

  // ==================== Constants ====================
  const COMMON_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too',
    'very', 'just', 'also', 'now', 'here', 'there', 'then', 'if'
  ]);

  // ==================== Sample Texts ====================
  const SAMPLE_TEXTS = {
    fox: `The quick brown fox jumps over the lazy dog. The dog was not amused by the fox. The fox continued to jump and jump, showing off to the dog. Meanwhile, the dog just watched the fox with the same lazy expression. The quick fox was very proud of being quick. Every day, the fox would jump over the dog, and every day, the dog would just watch. This was the routine of the fox and the dog. The fox loved to jump, and the dog loved to be lazy. It was a perfect arrangement for the fox and the dog.`,

    speech: `I have a dream that one day this nation will rise up and live out the true meaning of its creed. I have a dream that one day on the red hills of Georgia, sons of former slaves and sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that one day even the state of Mississippi will be transformed into an oasis of freedom and justice. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. I have a dream today.`,

    marketing: `Introducing the revolutionary new product that will change everything. This product is designed with you in mind. Our product features cutting-edge technology that makes other products obsolete. When you use our product, you'll wonder how you ever lived without this product. The product comes in three amazing colors. Order your product today and receive a free product accessory. Don't miss out on this incredible product opportunity. Our product is the best product on the market. Trust the product that millions already love.`,

    technical: `The function returns a value based on the input parameters. Each function should have a single responsibility. When calling a function, pass the required arguments to the function. The function will process the data and return the result. If the function encounters an error, the function will throw an exception. Functions can call other functions to perform complex operations. Always document your function with clear comments. A well-designed function is reusable across the codebase.`,

    story: `The old man sat by the window, watching the rain fall on the city streets. Every day, the old man would sit in the same chair, looking out at the same view. The rain reminded the old man of days long past. In his youth, the old man had danced in the rain without a care. Now the old man simply watched, content with memories. The rain continued to fall, and the old man continued to watch, finding peace in the simple rhythm of the rain.`,

    academic: `Research indicates that the study of patterns reveals important findings. This research builds upon previous research in the field. The findings of this research suggest that further research is needed. Our research methodology follows established research protocols. The research team conducted extensive research over several years. This research contributes to the growing body of research on the topic. Future research should explore the implications of this research.`
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.heatmap-panel');
    elements.heatmapMain = document.querySelector('.heatmap-main');

    // Editor
    elements.textInput = document.getElementById('textInput');
    elements.minLengthSelect = document.getElementById('minLengthSelect');
    elements.minCountSelect = document.getElementById('minCountSelect');
    elements.ignoreCommonCheck = document.getElementById('ignoreCommonCheck');

    // Display
    elements.heatmapDisplay = document.getElementById('heatmapDisplay');
    elements.selectedWordInfo = document.getElementById('selectedWordInfo');
    elements.selectedWordText = document.getElementById('selectedWordText');
    elements.selectedWordCount = document.getElementById('selectedWordCount');

    // Stats
    elements.totalWords = document.getElementById('totalWords');
    elements.uniqueWords = document.getElementById('uniqueWords');
    elements.repeatedWords = document.getElementById('repeatedWords');
    elements.maxRepeat = document.getElementById('maxRepeat');

    // Top Words
    elements.topWordsList = document.getElementById('topWordsList');

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

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.tool-tab[data-tab="${tabName}"]`);
    if (tab) {
      tab.classList.add('active');
      document.getElementById(tabName + 'Panel').classList.add('active');
      state.activeTab = tabName;

      // Toggle full-width layout for Samples tab
      const isFullWidth = tabName === 'samples';
      elements.heatmapMain.classList.toggle('full-width', isFullWidth);

      // Update heatmap when switching to heatmap tab
      if (tabName === 'heatmap') {
        analyze();
      }
    }
  }

  // ==================== Core Functions ====================
  function analyzeText(text) {
    const minLength = parseInt(elements.minLengthSelect.value);
    const ignoreCommon = elements.ignoreCommonCheck.checked;

    const words = text.match(/\b[a-zA-Z]+\b/g) || [];
    const frequency = {};

    words.forEach(word => {
      const lower = word.toLowerCase();
      if (lower.length >= minLength) {
        if (!ignoreCommon || !COMMON_WORDS.has(lower)) {
          frequency[lower] = (frequency[lower] || 0) + 1;
        }
      }
    });

    state.wordFrequency = frequency;
    return { words, frequency };
  }

  function getHeatLevel(count, maxCount) {
    if (count <= 1) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  }

  function calculateStats(frequency) {
    const words = Object.keys(frequency);
    const counts = Object.values(frequency);
    const totalWords = counts.reduce((a, b) => a + b, 0);
    const repeated = words.filter(w => frequency[w] > 1).length;
    const maxRepeat = counts.length > 0 ? Math.max(...counts) : 0;

    return {
      total: totalWords,
      unique: words.length,
      repeated,
      maxRepeat
    };
  }

  // ==================== UI Functions ====================
  function updateStats() {
    elements.totalWords.textContent = state.stats.total;
    elements.uniqueWords.textContent = state.stats.unique;
    elements.repeatedWords.textContent = state.stats.repeated;
    elements.maxRepeat.textContent = state.stats.maxRepeat;
  }

  function renderHeatmap(text) {
    if (!text.trim()) {
      elements.heatmapDisplay.innerHTML = `
        <div class="display-placeholder">
          <i class="fa-solid fa-fire"></i>
          <p>Enter text in the Editor tab to visualize word repetition</p>
        </div>
      `;
      elements.selectedWordInfo.classList.add('hidden');
      return;
    }

    const { frequency } = analyzeText(text);
    const minCount = parseInt(elements.minCountSelect.value);
    const minLength = parseInt(elements.minLengthSelect.value);
    const ignoreCommon = elements.ignoreCommonCheck.checked;

    const counts = Object.values(frequency).filter(c => c >= minCount);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

    const html = text.replace(/\b([a-zA-Z]+)\b/g, (match) => {
      const lower = match.toLowerCase();
      const count = frequency[lower] || 0;

      const shouldHighlight = lower.length >= minLength &&
        count >= minCount &&
        (!ignoreCommon || !COMMON_WORDS.has(lower));

      if (shouldHighlight) {
        const heatLevel = getHeatLevel(count, maxCount);
        const selectedClass = state.selectedWord === lower ? 'selected' : '';
        const dimmedClass = state.selectedWord && state.selectedWord !== lower ? 'dimmed' : '';

        return `<span class="heat-word heat-${heatLevel} ${selectedClass} ${dimmedClass}"
                      data-word="${lower}"
                      data-count="${count}"
                      title="${count} occurrences">${match}</span>`;
      } else {
        const dimmedClass = state.selectedWord ? 'dimmed' : '';
        return `<span class="heat-word neutral ${dimmedClass}">${match}</span>`;
      }
    });

    elements.heatmapDisplay.innerHTML = html;

    // Add click handlers
    elements.heatmapDisplay.querySelectorAll('.heat-word[data-word]').forEach(word => {
      word.addEventListener('click', () => {
        selectWord(word.dataset.word, parseInt(word.dataset.count));
      });
    });

    // Update selected word info
    if (state.selectedWord && frequency[state.selectedWord]) {
      elements.selectedWordInfo.classList.remove('hidden');
      elements.selectedWordText.textContent = state.selectedWord;
      elements.selectedWordCount.textContent = frequency[state.selectedWord] + ' times';
    } else {
      elements.selectedWordInfo.classList.add('hidden');
    }
  }

  function renderTopWords(frequency) {
    const minCount = parseInt(elements.minCountSelect.value);

    const sortedWords = Object.entries(frequency)
      .filter(([_, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sortedWords.length === 0) {
      elements.topWordsList.innerHTML = '<div class="topwords-empty">No repeated words found</div>';
      return;
    }

    const html = sortedWords.map(([word, count]) => {
      const selectedClass = state.selectedWord === word ? 'selected' : '';
      return `
        <div class="top-word-item ${selectedClass}" data-word="${word}" data-count="${count}">
          <span class="word">${word}</span>
          <span class="count">${count}</span>
        </div>
      `;
    }).join('');

    elements.topWordsList.innerHTML = html;

    // Add click handlers
    elements.topWordsList.querySelectorAll('.top-word-item').forEach(item => {
      item.addEventListener('click', () => {
        selectWord(item.dataset.word, parseInt(item.dataset.count));
      });
    });
  }

  function selectWord(word, count) {
    if (state.selectedWord === word) {
      state.selectedWord = null;
    } else {
      state.selectedWord = word;
    }
    analyze();
  }

  function deselectWord() {
    state.selectedWord = null;
    analyze();
  }

  function analyze() {
    const text = elements.textInput.value;
    const { frequency } = analyzeText(text);
    state.stats = calculateStats(frequency);

    updateStats();
    renderHeatmap(text);
    renderTopWords(frequency);
  }

  // ==================== Actions ====================
  function copyReport() {
    const text = elements.textInput.value.trim();
    if (!text) {
      ToolsCommon.showToast('No text to analyze', 'error');
      return;
    }

    const { frequency } = analyzeText(text);
    const stats = calculateStats(frequency);
    const minCount = parseInt(elements.minCountSelect.value);

    const topWords = Object.entries(frequency)
      .filter(([_, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => `  ${word}: ${count}`)
      .join('\n');

    const report = `Repetition Analysis Report
========================
Total Words: ${stats.total}
Unique Words: ${stats.unique}
Repeated Words: ${stats.repeated}
Max Repetition: ${stats.maxRepeat}

Top Repeated Words:
${topWords || '  No repeated words found'}
`;

    ToolsCommon.copyWithToast(report, 'Report copied!');
  }

  function clearAll() {
    elements.textInput.value = '';
    state.selectedWord = null;
    state.wordFrequency = {};
    state.stats = { total: 0, unique: 0, repeated: 0, maxRepeat: 0 };
    analyze();
    ToolsCommon.showToast('Cleared', 'info');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      state.selectedWord = null;
      analyze();
      ToolsCommon.showToast('Text pasted', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function loadSample(sampleName) {
    const text = SAMPLE_TEXTS[sampleName];
    if (text) {
      elements.textInput.value = text;
      state.selectedWord = null;
      analyze();
      switchTab('editor');
      ToolsCommon.showToast('Sample loaded!', 'success');
    }
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Input events
    const debouncedAnalyze = ToolsCommon.debounce(() => {
      state.selectedWord = null;
      analyze();
    }, 300);

    elements.textInput.addEventListener('input', debouncedAnalyze);
    elements.minLengthSelect.addEventListener('change', () => {
      state.selectedWord = null;
      analyze();
    });
    elements.minCountSelect.addEventListener('change', () => {
      state.selectedWord = null;
      analyze();
    });
    elements.ignoreCommonCheck.addEventListener('change', () => {
      state.selectedWord = null;
      analyze();
    });

    // Quick action buttons
    elements.analyzeBtn.addEventListener('click', () => {
      analyze();
      if (elements.textInput.value.trim()) {
        switchTab('heatmap');
      }
    });
    elements.copyBtn.addEventListener('click', copyReport);
    elements.clearBtn.addEventListener('click', clearAll);

    // Editor action buttons
    elements.pasteBtn.addEventListener('click', pasteText);

    // Heatmap action buttons
    elements.deselectBtn.addEventListener('click', deselectWord);

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
        analyze();
        if (elements.textInput.value.trim()) {
          switchTab('heatmap');
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
        deselectWord();
        break;

      case '1':
        e.preventDefault();
        switchTab('editor');
        break;

      case '2':
        e.preventDefault();
        switchTab('heatmap');
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
    analyze();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
