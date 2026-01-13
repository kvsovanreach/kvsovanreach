/**
 * KVSOVANREACH Reaction Time Test Tool
 * Measure your reaction speed
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    testArea: document.getElementById('testArea'),
    testIcon: document.getElementById('testIcon'),
    testTitle: document.getElementById('testTitle'),
    testMessage: document.getElementById('testMessage'),
    resultDisplay: document.getElementById('resultDisplay'),
    resultValue: document.getElementById('resultValue'),
    avgDisplay: document.getElementById('avgDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    attemptsDisplay: document.getElementById('attemptsDisplay'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    resetBtn: document.getElementById('resetBtn'),
    historyList: document.getElementById('historyList')
  };

  // ==================== State ====================
  const state = {
    mode: 'visual', // 'visual' or 'audio'
    phase: 'idle', // 'idle', 'waiting', 'ready', 'result', 'early'
    startTime: null,
    timeout: null,
    results: [],
    audioContext: null,
    oscillator: null
  };

  // ==================== Audio Functions ====================

  function initAudio() {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playBeep() {
    try {
      initAudio();
      const oscillator = state.audioContext.createOscillator();
      const gainNode = state.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(state.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 200);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }

  // ==================== Core Functions ====================

  function getRandomDelay() {
    // Random delay between 1.5 and 5 seconds
    return Math.floor(Math.random() * 3500) + 1500;
  }

  function calculateAverage() {
    if (state.results.length === 0) return null;
    const sum = state.results.reduce((a, b) => a + b, 0);
    return Math.round(sum / state.results.length);
  }

  function getBest() {
    if (state.results.length === 0) return null;
    return Math.min(...state.results);
  }

  function getSpeedClass(time) {
    if (time < 200) return 'fast';
    if (time < 300) return 'average';
    return 'slow';
  }

  function getResultMessage(time) {
    if (time < 150) return 'Exceptional! 🔥';
    if (time < 200) return 'Very Fast! ⚡';
    if (time < 250) return 'Great! 👍';
    if (time < 300) return 'Good! ✓';
    if (time < 400) return 'Average';
    return 'Keep practicing!';
  }

  // ==================== UI Functions ====================

  function updateStats() {
    const avg = calculateAverage();
    const best = getBest();

    elements.avgDisplay.textContent = avg ? `${avg}ms` : '--';
    elements.bestDisplay.textContent = best ? `${best}ms` : '--';
    elements.attemptsDisplay.textContent = state.results.length;
  }

  function updateHistory() {
    if (state.results.length === 0) {
      elements.historyList.innerHTML = '<p class="history-empty">No attempts yet</p>';
      return;
    }

    const html = state.results.slice().reverse().slice(0, 10).map((time, index) => {
      const attemptNum = state.results.length - index;
      const speedClass = getSpeedClass(time);
      return `
        <div class="history-item">
          <span class="history-attempt">Attempt ${attemptNum}</span>
          <span class="history-time ${speedClass}">${time}ms</span>
        </div>
      `;
    }).join('');

    elements.historyList.innerHTML = html;
  }

  function setPhase(phase) {
    state.phase = phase;

    // Remove all phase classes
    elements.testArea.classList.remove('waiting', 'ready', 'result', 'early');

    // Hide result display by default
    elements.resultDisplay.classList.add('hidden');

    switch (phase) {
      case 'idle':
        elements.testIcon.className = 'test-icon fa-solid fa-hand-pointer';
        elements.testTitle.textContent = 'Click to Start';
        elements.testMessage.textContent = state.mode === 'visual'
          ? 'Click when the color changes to green'
          : 'Click when you hear the beep';
        break;

      case 'waiting':
        elements.testArea.classList.add('waiting');
        elements.testIcon.className = 'test-icon fa-solid fa-hourglass-half';
        elements.testTitle.textContent = 'Wait...';
        elements.testMessage.textContent = 'Wait for the signal...';
        break;

      case 'ready':
        elements.testArea.classList.add('ready');
        elements.testIcon.className = 'test-icon fa-solid fa-bolt';
        elements.testTitle.textContent = 'Click Now!';
        elements.testMessage.textContent = '';
        break;

      case 'result':
        elements.testArea.classList.add('result');
        elements.testIcon.className = 'test-icon fa-solid fa-check-circle';
        elements.testTitle.textContent = getResultMessage(state.results[state.results.length - 1]);
        elements.testMessage.textContent = 'Click to try again';
        elements.resultDisplay.classList.remove('hidden');
        elements.resultValue.textContent = state.results[state.results.length - 1];
        break;

      case 'early':
        elements.testArea.classList.add('early');
        elements.testIcon.className = 'test-icon fa-solid fa-exclamation-triangle';
        elements.testTitle.textContent = 'Too Early!';
        elements.testMessage.textContent = 'Click to try again';
        break;
    }
  }

  function startTest() {
    setPhase('waiting');

    const delay = getRandomDelay();
    state.timeout = setTimeout(() => {
      state.startTime = performance.now();
      setPhase('ready');

      if (state.mode === 'audio') {
        playBeep();
      }
    }, delay);
  }

  function handleReaction() {
    if (state.phase === 'ready') {
      const reactionTime = Math.round(performance.now() - state.startTime);
      state.results.push(reactionTime);
      setPhase('result');
      updateStats();
      updateHistory();
    }
  }

  function handleEarly() {
    if (state.timeout) {
      clearTimeout(state.timeout);
      state.timeout = null;
    }
    setPhase('early');
  }

  function reset() {
    if (state.timeout) {
      clearTimeout(state.timeout);
      state.timeout = null;
    }
    state.results = [];
    setPhase('idle');
    updateStats();
    updateHistory();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.info('Stats reset');
    }
  }

  // ==================== Event Handlers ====================

  function handleTestClick() {
    switch (state.phase) {
      case 'idle':
      case 'result':
      case 'early':
        startTest();
        break;
      case 'waiting':
        handleEarly();
        break;
      case 'ready':
        handleReaction();
        break;
    }
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        handleTestClick();
        break;
      case 'r':
        reset();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Test area click
    elements.testArea.addEventListener('click', handleTestClick);

    // Mode buttons
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        setPhase('idle');

        // Initialize audio context on user interaction
        if (state.mode === 'audio') {
          initAudio();
        }
      });
    });

    // Reset button
    elements.resetBtn.addEventListener('click', reset);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Prevent context menu on test area
    elements.testArea.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize
    setPhase('idle');
    updateStats();
    updateHistory();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
