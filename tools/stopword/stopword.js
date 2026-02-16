/**
 * KVSOVANREACH Stopword Remover Tool
 * Remove common stopwords from text
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    languageSelect: document.getElementById('languageSelect'),
    preserveCase: document.getElementById('preserveCase'),
    preservePunct: document.getElementById('preservePunct'),
    customSection: document.getElementById('customSection'),
    customStopwords: document.getElementById('customStopwords'),
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    inputWordCount: document.getElementById('inputWordCount'),
    outputWordCount: document.getElementById('outputWordCount'),
    processBtn: document.getElementById('processBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    statsSection: document.getElementById('statsSection'),
    wordsRemoved: document.getElementById('wordsRemoved'),
    reduction: document.getElementById('reduction'),
    mostCommon: document.getElementById('mostCommon'),
    removedSection: document.getElementById('removedSection'),
    removedList: document.getElementById('removedList')
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

  function process() {
    const input = elements.inputText.value;

    if (!input.trim()) {
      ToolsCommon.Toast.show('Please enter some text', 'error');
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
  }

  function clearAll() {
    elements.inputText.value = '';
    elements.outputText.value = '';
    elements.inputWordCount.textContent = '0';
    elements.outputWordCount.textContent = '0';
    elements.statsSection.classList.add('hidden');
    elements.removedSection.classList.add('hidden');
    elements.inputText.focus();
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      updateInputCount();
    } catch (e) {
      ToolsCommon.Toast.show('Unable to paste from clipboard', 'error');
    }
  }

  function loadSample() {
    elements.inputText.value = SAMPLE_TEXT;
    updateInputCount();
  }

  function copyOutput() {
    const output = elements.outputText.value;
    if (output) {
      ToolsCommon.Clipboard.copy(output);
    } else {
      ToolsCommon.Toast.show('No output to copy', 'error');
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Event listeners
    elements.processBtn.addEventListener('click', process);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.copyBtn.addEventListener('click', copyOutput);

    // Input change
    elements.inputText.addEventListener('input', updateInputCount);

    // Language change
    elements.languageSelect.addEventListener('change', () => {
      const isCustom = elements.languageSelect.value === 'custom';
      elements.customSection.classList.toggle('hidden', !isCustom);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        process();
      }
    });

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
