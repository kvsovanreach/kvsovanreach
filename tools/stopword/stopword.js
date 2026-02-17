/**
 * KVSOVANREACH Stopword Remover Tool
 * Remove common stopwords from text
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    lastProcessed: null
  };

  // ==================== Stopwords ====================
  const STOPWORDS = {
    english: [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
      'can', 'could', 'did', 'do', 'does', 'doing', 'done', 'for', 'from',
      'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
      'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
      'its', 'itself', 'just', 'me', 'might', 'more', 'most', 'must', 'my',
      'myself', 'no', 'nor', 'not', 'of', 'on', 'once', 'only', 'or', 'other',
      'our', 'ours', 'ourselves', 'out', 'own', 'same', 'she', 'should', 'so',
      'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
      'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
      'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
      'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
      'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
    ]
  };

  const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This is a sample text that contains many common stopwords. We can use this tool to remove them and see the result. The text processing happens entirely in your browser, so your data is never sent to any server. This makes it safe and private for all your text analysis needs.`;

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.languageSelect = document.getElementById('languageSelect');
    elements.langTabs = document.querySelectorAll('.lang-tab');
    elements.preserveCase = document.getElementById('preserveCase');
    elements.preservePunct = document.getElementById('preservePunct');
    elements.customSection = document.getElementById('customSection');
    elements.customStopwords = document.getElementById('customStopwords');
    elements.inputText = document.getElementById('inputText');
    elements.outputText = document.getElementById('outputText');
    elements.inputWordCount = document.getElementById('inputWordCount');
    elements.outputWordCount = document.getElementById('outputWordCount');
    elements.processBtn = document.getElementById('processBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.pasteBtn = document.getElementById('pasteBtn');
    elements.sampleBtn = document.getElementById('sampleBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.statsSection = document.getElementById('statsSection');
    elements.wordsRemoved = document.getElementById('wordsRemoved');
    elements.reduction = document.getElementById('reduction');
    elements.mostCommon = document.getElementById('mostCommon');
    elements.removedSection = document.getElementById('removedSection');
    elements.removedList = document.getElementById('removedList');
  }

  // ==================== UI Helpers ====================
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Core Functions ====================

  /**
   * Get current stopwords list
   */
  function getStopwords() {
    const language = elements.languageSelect.value;

    if (language === 'custom') {
      const custom = elements.customStopwords.value;
      return custom.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
    }

    return STOPWORDS[language] || STOPWORDS.english;
  }

  /**
   * Count words in text
   */
  function countWords(text) {
    return text.trim().split(/\s+/).filter(w => w).length;
  }

  /**
   * Process text and remove stopwords
   */
  function processText(text, stopwords, options) {
    const { preserveCase, preservePunct } = options;
    const removedCounts = {};

    // Create regex for word boundaries
    const wordPattern = preservePunct
      ? /\b(\w+)\b/g
      : /\b(\w+)\b/g;

    const result = text.replace(wordPattern, (match, word) => {
      const lowerWord = word.toLowerCase();

      if (stopwords.includes(lowerWord)) {
        removedCounts[lowerWord] = (removedCounts[lowerWord] || 0) + 1;
        return '';
      }

      return preserveCase ? word : lowerWord;
    });

    // Clean up extra spaces
    const cleaned = result
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();

    return { cleaned, removedCounts };
  }

  // ==================== UI Functions ====================

  function updateInputCount() {
    const count = countWords(elements.inputText.value);
    elements.inputWordCount.textContent = count;
  }

  function process(silent = false) {
    const input = elements.inputText.value;

    if (!input.trim()) {
      if (!silent) showToast('Please enter some text', 'error');
      return;
    }

    const stopwords = getStopwords();
    const options = {
      preserveCase: elements.preserveCase.checked,
      preservePunct: elements.preservePunct.checked
    };

    const { cleaned, removedCounts } = processText(input, stopwords, options);

    // Update output
    elements.outputText.value = cleaned;
    elements.outputWordCount.textContent = countWords(cleaned);

    // Calculate stats
    const inputWords = countWords(input);
    const outputWords = countWords(cleaned);
    const totalRemoved = Object.values(removedCounts).reduce((a, b) => a + b, 0);
    const reductionPercent = inputWords > 0
      ? Math.round((totalRemoved / inputWords) * 100)
      : 0;

    // Find most common removed word
    let mostCommon = '-';
    if (Object.keys(removedCounts).length > 0) {
      const sorted = Object.entries(removedCounts).sort((a, b) => b[1] - a[1]);
      mostCommon = `"${sorted[0][0]}" (${sorted[0][1]}×)`;
    }

    // Update stats display
    elements.wordsRemoved.textContent = totalRemoved;
    elements.reduction.textContent = `${reductionPercent}%`;
    elements.mostCommon.textContent = mostCommon;
    elements.statsSection.classList.remove('hidden');

    // Update removed words list
    if (Object.keys(removedCounts).length > 0) {
      const sorted = Object.entries(removedCounts).sort((a, b) => b[1] - a[1]);
      elements.removedList.innerHTML = sorted.map(([word, count]) => `
        <span class="removed-word">${word} <span class="count">×${count}</span></span>
      `).join('');
      elements.removedSection.classList.remove('hidden');
    } else {
      elements.removedSection.classList.add('hidden');
    }

    state.lastProcessed = Date.now();
  }

  function clearAll() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    elements.inputWordCount.textContent = '0';
    elements.outputWordCount.textContent = '0';
    elements.statsSection.classList.add('hidden');
    elements.removedSection.classList.add('hidden');
    elements.inputText.focus();
    showToast('Cleared', 'success');
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      updateInputCount();
      showToast('Pasted from clipboard', 'success');
    } catch (e) {
      showToast('Unable to paste from clipboard', 'error');
    }
  }

  function loadSample() {
    elements.inputText.value = SAMPLE_TEXT;
    updateInputCount();
    showToast('Sample text loaded', 'success');
  }

  function copyOutput() {
    const output = elements.outputText.value;
    if (output) {
      ToolsCommon.copyWithToast(output, 'Output copied!');
    } else {
      showToast('No output to copy', 'error');
    }
  }

  // ==================== Event Listeners ====================

  function initEventListeners() {
    // Button listeners
    elements.processBtn.addEventListener('click', process);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.copyBtn.addEventListener('click', copyOutput);

    // Input change - process in realtime with debounce
    const processRealtime = ToolsCommon.debounce(() => {
      if (elements.inputText.value.trim()) {
        process(true);
      } else {
        elements.outputText.value = '';
        elements.outputWordCount.textContent = '0';
        elements.statsSection.classList.add('hidden');
        elements.removedSection.classList.add('hidden');
      }
    }, 150);

    elements.inputText.addEventListener('input', () => {
      updateInputCount();
      processRealtime();
    });

    // Language tabs
    elements.langTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const lang = tab.dataset.lang;

        // Update active tab
        elements.langTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update hidden select
        elements.languageSelect.value = lang;

        // Toggle custom section
        const isCustom = lang === 'custom';
        elements.customSection.classList.toggle('hidden', !isCustom);

        // Focus custom textarea if custom
        if (isCustom) {
          elements.customStopwords.focus();
        }

        processRealtime();
      });
    });

    // Options change - reprocess
    elements.preserveCase.addEventListener('change', processRealtime);
    elements.preservePunct.addEventListener('change', processRealtime);
    elements.customStopwords.addEventListener('input', ToolsCommon.debounce(processRealtime, 300));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        process();
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    initEventListeners();

    // Focus input
    elements.inputText.focus();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
