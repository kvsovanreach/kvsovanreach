/**
 * KVSOVANREACH Repetition Heatmap
 * Visualize word repetition patterns using heat colors
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    heatmapDisplay: document.getElementById('heatmapDisplay'),
    topWordsList: document.getElementById('topWordsList'),
    totalWords: document.getElementById('totalWords'),
    uniqueWords: document.getElementById('uniqueWords'),
    repeatedWords: document.getElementById('repeatedWords'),
    maxRepeat: document.getElementById('maxRepeat'),
    minLengthSelect: document.getElementById('minLengthSelect'),
    minCountSelect: document.getElementById('minCountSelect'),
    ignoreCommonCheck: document.getElementById('ignoreCommonCheck'),
    sampleBtn: document.getElementById('sampleBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn')
  };

  // ==================== State ====================
  const state = {
    wordFrequency: {},
    selectedWord: null
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

  const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. The dog was not amused by the fox. The fox continued to jump and jump, showing off to the dog. Meanwhile, the dog just watched the fox with the same lazy expression. The quick fox was very proud of being quick. Every day, the fox would jump over the dog, and every day, the dog would just watch. This was the routine of the fox and the dog. The fox loved to jump, and the dog loved to be lazy. It was a perfect arrangement for the fox and the dog.`;

  // ==================== Core Functions ====================

  function analyzeText(text) {
    const minLength = parseInt(elements.minLengthSelect.value);
    const ignoreCommon = elements.ignoreCommonCheck.checked;

    // Split into words
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

  function updateStats(stats) {
    elements.totalWords.textContent = stats.total;
    elements.uniqueWords.textContent = stats.unique;
    elements.repeatedWords.textContent = stats.repeated;
    elements.maxRepeat.textContent = stats.maxRepeat;
  }

  function renderHeatmap(text) {
    if (!text.trim()) {
      elements.heatmapDisplay.innerHTML = `
        <div class="display-placeholder">
          <i class="fa-solid fa-fire"></i>
          <p>Enter text to visualize word repetition</p>
        </div>
      `;
      return;
    }

    const { frequency } = analyzeText(text);
    const minCount = parseInt(elements.minCountSelect.value);
    const minLength = parseInt(elements.minLengthSelect.value);
    const ignoreCommon = elements.ignoreCommonCheck.checked;

    const counts = Object.values(frequency).filter(c => c >= minCount);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

    // Process text while preserving structure
    const html = text.replace(/\b([a-zA-Z]+)\b/g, (match) => {
      const lower = match.toLowerCase();
      const count = frequency[lower] || 0;

      // Check if word should be highlighted
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
        const wordText = word.dataset.word;
        selectWord(wordText);
      });
    });
  }

  function renderTopWords(frequency) {
    const minCount = parseInt(elements.minCountSelect.value);

    const sortedWords = Object.entries(frequency)
      .filter(([_, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    if (sortedWords.length === 0) {
      elements.topWordsList.innerHTML = `
        <div class="topwords-placeholder">
          <p>No repeated words found</p>
        </div>
      `;
      return;
    }

    const html = sortedWords.map(([word, count]) => {
      const selectedClass = state.selectedWord === word ? 'selected' : '';
      return `
        <div class="top-word-item ${selectedClass}" data-word="${word}">
          <span class="word">${word}</span>
          <span class="count">${count}</span>
        </div>
      `;
    }).join('');

    elements.topWordsList.innerHTML = html;

    // Add click handlers
    elements.topWordsList.querySelectorAll('.top-word-item').forEach(item => {
      item.addEventListener('click', () => {
        const word = item.dataset.word;
        selectWord(word);
      });
    });
  }

  function selectWord(word) {
    state.selectedWord = state.selectedWord === word ? null : word;
    analyze();
  }

  function analyze() {
    const text = elements.textInput.value;
    const { frequency } = analyzeText(text);
    const stats = calculateStats(frequency);

    updateStats(stats);
    renderHeatmap(text);
    renderTopWords(frequency);
  }

  // ==================== Event Handlers ====================

  function handleInput() {
    state.selectedWord = null;
    analyze();
  }

  function handleOptionsChange() {
    state.selectedWord = null;
    analyze();
  }

  function loadSample() {
    elements.textInput.value = SAMPLE_TEXT;
    state.selectedWord = null;
    analyze();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.show('Sample text loaded');
    }
  }

  function clearAll() {
    elements.textInput.value = '';
    state.selectedWord = null;
    state.wordFrequency = {};
    analyze();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.show('Cleared');
    }
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      state.selectedWord = null;
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
    } else if (e.key === 'Escape') {
      state.selectedWord = null;
      analyze();
    }
  }

  // ==================== Initialization ====================

  function setupEventListeners() {
    const debouncedInput = typeof ToolsCommon !== 'undefined'
      ? ToolsCommon.debounce(handleInput, 300)
      : handleInput;

    elements.textInput.addEventListener('input', debouncedInput);
    elements.minLengthSelect.addEventListener('change', handleOptionsChange);
    elements.minCountSelect.addEventListener('change', handleOptionsChange);
    elements.ignoreCommonCheck.addEventListener('change', handleOptionsChange);
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.pasteBtn.addEventListener('click', pasteText);

    document.addEventListener('keydown', handleKeydown);
  }

  function init() {
    setupEventListeners();
    analyze();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
