/**
 * KVSOVANREACH Reaction Time Test
 * Measure your reaction speed
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    mode: 'visual',
    phase: 'idle',
    startTime: null,
    timeout: null,
    results: [],
    audioContext: null
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.testArea = document.getElementById('testArea');
    elements.testIcon = document.getElementById('testIcon');
    elements.testTitle = document.getElementById('testTitle');
    elements.testMessage = document.getElementById('testMessage');
    elements.resultDisplay = document.getElementById('resultDisplay');
    elements.resultValue = document.getElementById('resultValue');
    elements.avgDisplay = document.getElementById('avgDisplay');
    elements.bestDisplay = document.getElementById('bestDisplay');
    elements.attemptsDisplay = document.getElementById('attemptsDisplay');
    elements.modeButtons = document.querySelector('.mode-buttons');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.historyList = document.getElementById('historyList');
  }

  // ==================== Audio ====================
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
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }

  // ==================== Core Logic ====================
  function getRandomDelay() {
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
    if (time < 150) return 'Exceptional!';
    if (time < 200) return 'Very Fast!';
    if (time < 250) return 'Great!';
    if (time < 300) return 'Good!';
    if (time < 400) return 'Average';
    return 'Keep practicing!';
  }

  // ==================== UI Updates ====================
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

    elements.testArea.classList.remove('waiting', 'ready', 'result', 'early');
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

  // ==================== Test Logic ====================
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
    ToolsCommon.Toast.show('Stats reset', 'info');
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

  function handleModeClick(e) {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;

    const modeBtns = elements.modeButtons.querySelectorAll('.mode-btn');
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;
    setPhase('idle');

    if (state.mode === 'audio') {
      initAudio();
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

  // ==================== Event Listeners ====================
  function setupEventListeners() {
    elements.testArea.addEventListener('click', handleTestClick);
    elements.testArea.addEventListener('contextmenu', e => e.preventDefault());
    elements.modeButtons.addEventListener('click', handleModeClick);
    elements.resetBtn.addEventListener('click', reset);
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Initialization ====================
  function init() {
    initElements();
    setupEventListeners();
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
