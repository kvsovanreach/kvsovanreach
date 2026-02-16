/**
 * KVSOVANREACH Typing Test Tool
 * Measure typing speed and accuracy
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    textDisplay: document.getElementById('textDisplay'),
    typingInput: document.getElementById('typingInput'),
    inputHint: document.getElementById('inputHint'),
    wpmDisplay: document.getElementById('wpmDisplay'),
    accuracyDisplay: document.getElementById('accuracyDisplay'),
    timerDisplay: document.getElementById('timerDisplay'),
    charsDisplay: document.getElementById('charsDisplay'),
    durationBtns: document.querySelectorAll('.duration-btn'),
    difficultySelect: document.getElementById('difficultySelect'),
    newTestBtn: document.getElementById('newTestBtn'),
    resultsSection: document.getElementById('resultsSection'),
    finalWpm: document.getElementById('finalWpm'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalChars: document.getElementById('finalChars'),
    finalErrors: document.getElementById('finalErrors'),
    tryAgainBtn: document.getElementById('tryAgainBtn')
  };

  // ==================== Word Lists ====================
  const WORDS = {
    easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when'],
    medium: ['computer', 'program', 'system', 'keyboard', 'screen', 'display', 'function', 'variable', 'method', 'class', 'object', 'array', 'string', 'number', 'boolean', 'return', 'import', 'export', 'module', 'package', 'install', 'update', 'download', 'upload', 'server', 'client', 'database', 'network', 'internet', 'website', 'browser', 'application', 'software', 'hardware', 'memory', 'storage', 'process', 'thread', 'async', 'await'],
    hard: ['algorithm', 'implementation', 'architecture', 'infrastructure', 'optimization', 'configuration', 'authentication', 'authorization', 'encapsulation', 'polymorphism', 'inheritance', 'abstraction', 'asynchronous', 'synchronous', 'concatenation', 'interpolation', 'serialization', 'deserialization', 'documentation', 'specification', 'functionality', 'compatibility', 'accessibility', 'vulnerability', 'cybersecurity']
  };

  // ==================== State ====================
  const state = {
    duration: 60,
    difficulty: 'medium',
    text: '',
    currentIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    startTime: null,
    timerInterval: null,
    isRunning: false,
    isFinished: false
  };

  // ==================== Core Functions ====================

  /**
   * Generate random text
   */
  function generateText(wordCount = 50) {
    const wordList = WORDS[state.difficulty];
    const words = [];

    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      words.push(wordList[randomIndex]);
    }

    return words.join(' ');
  }

  /**
   * Calculate WPM
   */
  function calculateWPM() {
    if (!state.startTime) return 0;

    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    if (timeElapsed === 0) return 0;

    // WPM = (correct characters / 5) / time in minutes
    const wpm = Math.round((state.correctChars / 5) / timeElapsed);
    return Math.max(0, wpm);
  }

  /**
   * Calculate accuracy
   */
  function calculateAccuracy() {
    const total = state.correctChars + state.incorrectChars;
    if (total === 0) return 100;
    return Math.round((state.correctChars / total) * 100);
  }

  // ==================== UI Functions ====================

  function renderText() {
    const chars = state.text.split('').map((char, index) => {
      let className = 'char pending';

      if (index < state.currentIndex) {
        className = 'char correct';
      } else if (index === state.currentIndex) {
        className = 'char current';
      }

      return `<span class="${className}" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`;
    });

    elements.textDisplay.innerHTML = chars.join('');
  }

  function updateStats() {
    elements.wpmDisplay.textContent = calculateWPM();
    elements.accuracyDisplay.textContent = calculateAccuracy() + '%';
    elements.charsDisplay.textContent = state.correctChars;
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const remaining = Math.max(0, state.duration - elapsed);
    elements.timerDisplay.textContent = remaining;

    if (remaining === 0) {
      endTest();
    }
  }

  function startTest() {
    if (state.isRunning) return;

    state.isRunning = true;
    state.startTime = Date.now();
    elements.inputHint.classList.add('hidden');

    // Start timer
    state.timerInterval = setInterval(() => {
      updateTimer();
      updateStats();
    }, 100);
  }

  function endTest() {
    state.isRunning = false;
    state.isFinished = true;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    // Show results
    elements.finalWpm.textContent = calculateWPM();
    elements.finalAccuracy.textContent = calculateAccuracy() + '%';
    elements.finalChars.textContent = state.correctChars;
    elements.finalErrors.textContent = state.incorrectChars;
    elements.resultsSection.classList.remove('hidden');

    // Disable input
    elements.typingInput.disabled = true;
  }

  function resetTest() {
    // Clear interval
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    // Reset state
    state.text = generateText();
    state.currentIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.startTime = null;
    state.isRunning = false;
    state.isFinished = false;

    // Reset UI
    elements.typingInput.value = '';
    elements.typingInput.disabled = false;
    elements.timerDisplay.textContent = state.duration;
    elements.wpmDisplay.textContent = '0';
    elements.accuracyDisplay.textContent = '100%';
    elements.charsDisplay.textContent = '0';
    elements.inputHint.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');

    renderText();
    elements.typingInput.focus();
  }

  function handleInput(e) {
    if (state.isFinished) return;

    // Start test on first input
    if (!state.isRunning) {
      startTest();
    }

    const inputValue = e.target.value;
    const inputLength = inputValue.length;
    const expectedChar = state.text[state.currentIndex];

    // Get the last typed character
    if (inputLength > 0) {
      const typedChar = inputValue[inputLength - 1];

      if (typedChar === expectedChar) {
        state.correctChars++;
        state.currentIndex++;

        // Mark character as correct
        const charElement = elements.textDisplay.querySelector(`[data-index="${state.currentIndex - 1}"]`);
        if (charElement) {
          charElement.className = 'char correct';
        }
      } else {
        state.incorrectChars++;

        // Mark character as incorrect
        const charElement = elements.textDisplay.querySelector(`[data-index="${state.currentIndex}"]`);
        if (charElement) {
          charElement.className = 'char incorrect';
        }

        // Shake animation
        elements.typingInput.classList.add('error');
        setTimeout(() => {
          elements.typingInput.classList.remove('error');
        }, 300);
      }

      // Clear input
      e.target.value = '';

      // Update current character highlight
      const nextCharElement = elements.textDisplay.querySelector(`[data-index="${state.currentIndex}"]`);
      if (nextCharElement) {
        nextCharElement.className = 'char current';
      }

      // Check if test is complete
      if (state.currentIndex >= state.text.length) {
        endTest();
      }
    }

    updateStats();
  }

  // ==================== Initialization ====================

  function init() {
    // Duration buttons
    elements.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.duration = parseInt(btn.dataset.duration);
        resetTest();
      });
    });

    // Difficulty select
    elements.difficultySelect.addEventListener('change', () => {
      state.difficulty = elements.difficultySelect.value;
      resetTest();
    });

    // Input handler
    elements.typingInput.addEventListener('input', handleInput);

    // New test button
    elements.newTestBtn.addEventListener('click', resetTest);
    elements.tryAgainBtn.addEventListener('click', resetTest);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        resetTest();
      }
      if (e.key === 'Tab' && !state.isRunning) {
        e.preventDefault();
        resetTest();
      }
    });

    // Initialize
    resetTest();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
