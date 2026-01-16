/**
 * Timer & Stopwatch Tool
 * Stopwatch and countdown timer with lap tracking
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    mode: 'stopwatch',
    isDarkMode: localStorage.getItem('theme') === 'dark',
    soundEnabled: localStorage.getItem('timerSound') !== 'false',

    // Stopwatch state
    stopwatch: {
      running: false,
      startTime: 0,
      elapsedTime: 0,
      interval: null,
      laps: []
    },

    // Timer state
    timer: {
      running: false,
      totalTime: 0,
      remainingTime: 0,
      startTime: 0,
      pausedTime: 0,
      interval: null
    }
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Mode tabs
    modeTabs: document.querySelectorAll('.mode-tab'),
    stopwatchMode: document.getElementById('stopwatchMode'),
    timerMode: document.getElementById('timerMode'),

    // Stopwatch
    stopwatchDisplay: document.getElementById('stopwatchDisplay'),
    stopwatchMs: document.getElementById('stopwatchMs'),
    stopwatchStart: document.getElementById('stopwatchStart'),
    stopwatchReset: document.getElementById('stopwatchReset'),
    stopwatchLap: document.getElementById('stopwatchLap'),
    lapsSection: document.getElementById('lapsSection'),
    lapsList: document.getElementById('lapsList'),
    lapsEmpty: document.getElementById('lapsEmpty'),
    clearLapsBtn: document.getElementById('clearLapsBtn'),
    lapStats: document.getElementById('lapStats'),
    lapAverage: document.getElementById('lapAverage'),
    lapBest: document.getElementById('lapBest'),
    lapTotal: document.getElementById('lapTotal'),

    // Timer
    timerInput: document.getElementById('timerInput'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerCountdown: document.getElementById('timerCountdown'),
    progressFill: document.getElementById('progressFill'),
    hoursInput: document.getElementById('hoursInput'),
    minutesInput: document.getElementById('minutesInput'),
    secondsInput: document.getElementById('secondsInput'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    timerStart: document.getElementById('timerStart'),
    timerReset: document.getElementById('timerReset'),
    timerAdd: document.getElementById('timerAdd'),

    // Sound
    soundEnabled: document.getElementById('soundEnabled'),

    // Fullscreen
    timerWrapper: document.getElementById('timer'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),

    // Modal
    timerCompleteModal: document.getElementById('timerCompleteModal'),
    dismissModal: document.getElementById('dismissModal'),

    // Shortcuts
    shortcutsHint: document.getElementById('shortcutsHint'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),

    // Other
    toast: document.getElementById('toast'),
    currentYear: document.getElementById('current-year')
  };

  // Audio context for alarm
  let audioContext = null;

  // ============================================
  // Initialization
  // ============================================
  // Theme & footer year handled by tools-common.js

  function init() {
    initEventListeners();
    initKeyboardShortcuts();
    loadSettings();
  }

  function loadSettings() {
    elements.soundEnabled.checked = state.soundEnabled;
  }

  function initEventListeners() {
    // Mode tabs
    elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Stopwatch controls
    elements.stopwatchStart?.addEventListener('click', toggleStopwatch);
    elements.stopwatchReset?.addEventListener('click', resetStopwatch);
    elements.stopwatchLap?.addEventListener('click', recordLap);
    elements.clearLapsBtn?.addEventListener('click', clearLaps);

    // Timer controls
    elements.timerStart?.addEventListener('click', toggleTimer);
    elements.timerReset?.addEventListener('click', resetTimer);
    elements.timerAdd?.addEventListener('click', addMinute);

    // Presets
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        setTimerPreset(minutes);
      });
    });

    // Timer inputs
    [elements.hoursInput, elements.minutesInput, elements.secondsInput].forEach(input => {
      input?.addEventListener('change', validateTimeInput);
      input?.addEventListener('focus', () => input.select());
    });

    // Sound toggle
    elements.soundEnabled?.addEventListener('change', (e) => {
      state.soundEnabled = e.target.checked;
      localStorage.setItem('timerSound', e.target.checked);
    });

    // Modal dismiss
    elements.dismissModal?.addEventListener('click', hideCompleteModal);
    elements.timerCompleteModal?.addEventListener('click', (e) => {
      if (e.target === elements.timerCompleteModal) {
        hideCompleteModal();
      }
    });

    // Fullscreen
    elements.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  }

  // ============================================
  // Fullscreen
  // ============================================
  function toggleFullscreen() {
    const wrapper = elements.timerWrapper;
    const btn = elements.fullscreenBtn;
    const icon = btn.querySelector('i');

    wrapper.classList.toggle('fullscreen');

    if (wrapper.classList.contains('fullscreen')) {
      icon.className = 'fa-solid fa-compress';
      btn.title = 'Exit fullscreen';
    } else {
      icon.className = 'fa-solid fa-expand';
      btn.title = 'Toggle fullscreen';
    }
  }

  // ============================================
  // Mode Switching
  // ============================================
  function switchMode(mode) {
    state.mode = mode;

    // Update tabs
    elements.modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Update content
    elements.stopwatchMode?.classList.toggle('active', mode === 'stopwatch');
    elements.timerMode?.classList.toggle('active', mode === 'timer');
  }

  // ============================================
  // Stopwatch Functions
  // ============================================
  function toggleStopwatch() {
    if (state.stopwatch.running) {
      pauseStopwatch();
    } else {
      startStopwatch();
    }
  }

  function startStopwatch() {
    state.stopwatch.running = true;
    state.stopwatch.startTime = Date.now() - state.stopwatch.elapsedTime;

    updateStopwatchButton(true);
    elements.stopwatchReset.disabled = false;
    elements.stopwatchLap.disabled = false;

    state.stopwatch.interval = setInterval(updateStopwatchDisplay, 10);
  }

  function pauseStopwatch() {
    state.stopwatch.running = false;
    state.stopwatch.elapsedTime = Date.now() - state.stopwatch.startTime;

    updateStopwatchButton(false);

    if (state.stopwatch.interval) {
      clearInterval(state.stopwatch.interval);
      state.stopwatch.interval = null;
    }
  }

  function resetStopwatch() {
    pauseStopwatch();
    state.stopwatch.elapsedTime = 0;
    state.stopwatch.laps = [];

    updateStopwatchDisplay();
    elements.stopwatchReset.disabled = true;
    elements.stopwatchLap.disabled = true;

    renderLaps();
  }

  function updateStopwatchDisplay() {
    const elapsed = state.stopwatch.running
      ? Date.now() - state.stopwatch.startTime
      : state.stopwatch.elapsedTime;

    const { hours, minutes, seconds, ms } = parseTime(elapsed);

    elements.stopwatchDisplay.textContent = formatTime(hours, minutes, seconds);
    elements.stopwatchMs.textContent = '.' + ms.toString().padStart(3, '0');
  }

  function updateStopwatchButton(running) {
    const btn = elements.stopwatchStart;
    const icon = btn.querySelector('i');

    if (running) {
      icon.className = 'fa-solid fa-pause';
      btn.classList.add('running');
    } else {
      icon.className = 'fa-solid fa-play';
      btn.classList.remove('running');
    }
  }

  function recordLap() {
    if (!state.stopwatch.running) return;

    const currentTime = Date.now() - state.stopwatch.startTime;
    const lastLapTime = state.stopwatch.laps.length > 0
      ? state.stopwatch.laps[0].total
      : 0;

    const lap = {
      number: state.stopwatch.laps.length + 1,
      total: currentTime,
      split: currentTime - lastLapTime
    };

    state.stopwatch.laps.unshift(lap);
    renderLaps();
  }

  function renderLaps() {
    if (!elements.lapsList) return;

    // Remove existing lap items
    const existingItems = elements.lapsList.querySelectorAll('.lap-item');
    existingItems.forEach(item => item.remove());

    if (state.stopwatch.laps.length === 0) {
      elements.lapsEmpty?.classList.remove('hidden');
      if (elements.lapStats) elements.lapStats.style.display = 'none';
      return;
    }

    elements.lapsEmpty?.classList.add('hidden');

    // Find best and worst laps
    let bestIndex = 0;
    let worstIndex = 0;

    if (state.stopwatch.laps.length > 1) {
      state.stopwatch.laps.forEach((lap, index) => {
        if (lap.split < state.stopwatch.laps[bestIndex].split) bestIndex = index;
        if (lap.split > state.stopwatch.laps[worstIndex].split) worstIndex = index;
      });
    }

    state.stopwatch.laps.forEach((lap, index) => {
      const item = document.createElement('div');
      item.className = 'lap-item';

      if (state.stopwatch.laps.length > 1) {
        if (index === bestIndex) item.classList.add('best');
        if (index === worstIndex) item.classList.add('worst');
      }

      const { hours, minutes, seconds, ms } = parseTime(lap.split);
      const splitFormatted = formatTime(hours, minutes, seconds) + '.' + ms.toString().padStart(3, '0');

      const { hours: th, minutes: tm, seconds: ts, ms: tms } = parseTime(lap.total);
      const totalFormatted = formatTime(th, tm, ts) + '.' + tms.toString().padStart(3, '0');

      item.innerHTML = `
        <span class="lap-number">Lap ${lap.number}</span>
        <span class="lap-time">${splitFormatted}</span>
        <span class="lap-diff">${totalFormatted}</span>
      `;

      elements.lapsList.appendChild(item);
    });

    // Update lap statistics
    updateLapStats(bestIndex);
  }

  function updateLapStats(bestIndex) {
    if (state.stopwatch.laps.length === 0) {
      if (elements.lapStats) elements.lapStats.style.display = 'none';
      return;
    }

    if (elements.lapStats) elements.lapStats.style.display = 'flex';

    // Calculate average
    const totalSplit = state.stopwatch.laps.reduce((sum, lap) => sum + lap.split, 0);
    const average = totalSplit / state.stopwatch.laps.length;
    const best = state.stopwatch.laps[bestIndex].split;
    const total = state.stopwatch.laps[0].total;

    // Format times
    const avgTime = parseTime(average);
    const bestTime = parseTime(best);
    const totalTime = parseTime(total);

    if (elements.lapAverage) {
      elements.lapAverage.textContent = formatTime(avgTime.hours, avgTime.minutes, avgTime.seconds) + '.' + avgTime.ms.toString().padStart(3, '0').substring(0, 2);
    }
    if (elements.lapBest) {
      elements.lapBest.textContent = formatTime(bestTime.hours, bestTime.minutes, bestTime.seconds) + '.' + bestTime.ms.toString().padStart(3, '0').substring(0, 2);
    }
    if (elements.lapTotal) {
      elements.lapTotal.textContent = formatTime(totalTime.hours, totalTime.minutes, totalTime.seconds);
    }
  }

  function clearLaps() {
    state.stopwatch.laps = [];
    renderLaps();
    showToast('Laps cleared', 'success');
  }

  // ============================================
  // Timer Functions
  // ============================================
  function toggleTimer() {
    if (state.timer.running) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    // Get time from inputs if not already set
    if (state.timer.remainingTime === 0) {
      const hours = parseInt(elements.hoursInput.value) || 0;
      const minutes = parseInt(elements.minutesInput.value) || 0;
      const seconds = parseInt(elements.secondsInput.value) || 0;

      state.timer.totalTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
      state.timer.remainingTime = state.timer.totalTime;
    }

    if (state.timer.remainingTime <= 0) {
      showToast('Please set a time', 'error');
      return;
    }

    state.timer.running = true;
    state.timer.startTime = Date.now();
    state.timer.pausedTime = state.timer.remainingTime;

    // Show timer display, hide input
    elements.timerInput.style.display = 'none';
    elements.timerDisplay.style.display = 'block';

    updateTimerButton(true);
    elements.timerReset.disabled = false;
    elements.timerAdd.disabled = false;

    state.timer.interval = setInterval(updateTimerDisplay, 100);
  }

  function pauseTimer() {
    state.timer.running = false;
    state.timer.remainingTime = state.timer.pausedTime - (Date.now() - state.timer.startTime);

    updateTimerButton(false);

    if (state.timer.interval) {
      clearInterval(state.timer.interval);
      state.timer.interval = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    state.timer.totalTime = 0;
    state.timer.remainingTime = 0;

    // Show input, hide display
    elements.timerInput.style.display = 'block';
    elements.timerDisplay.style.display = 'none';

    elements.timerReset.disabled = true;
    elements.timerAdd.disabled = true;

    updateTimerDisplay();
    updateProgress(0);

    // Reset display colors
    elements.timerCountdown.parentElement.classList.remove('warning', 'danger');
    elements.progressFill.classList.remove('warning', 'danger');
  }

  function updateTimerDisplay() {
    let remaining;

    if (state.timer.running) {
      remaining = state.timer.pausedTime - (Date.now() - state.timer.startTime);
    } else {
      remaining = state.timer.remainingTime;
    }

    if (remaining <= 0) {
      remaining = 0;
      timerComplete();
    }

    const { hours, minutes, seconds } = parseTime(remaining);
    elements.timerCountdown.textContent = formatTime(hours, minutes, seconds);

    // Update progress
    if (state.timer.totalTime > 0) {
      const progress = 1 - (remaining / state.timer.totalTime);
      updateProgress(progress);
    }

    // Color warnings
    const timeDisplay = elements.timerCountdown.parentElement;

    if (remaining <= 10000 && remaining > 0) {
      timeDisplay.classList.add('danger');
      timeDisplay.classList.remove('warning');
      elements.progressFill.classList.add('danger');
      elements.progressFill.classList.remove('warning');
    } else if (remaining <= 30000 && remaining > 0) {
      timeDisplay.classList.add('warning');
      timeDisplay.classList.remove('danger');
      elements.progressFill.classList.add('warning');
      elements.progressFill.classList.remove('danger');
    } else {
      timeDisplay.classList.remove('warning', 'danger');
      elements.progressFill.classList.remove('warning', 'danger');
    }
  }

  function updateTimerButton(running) {
    const btn = elements.timerStart;
    const icon = btn.querySelector('i');

    if (running) {
      icon.className = 'fa-solid fa-pause';
      btn.classList.add('running');
    } else {
      icon.className = 'fa-solid fa-play';
      btn.classList.remove('running');
    }
  }

  function updateProgress(progress) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference * (1 - progress);
    elements.progressFill.style.strokeDashoffset = offset;
  }

  function setTimerPreset(minutes) {
    elements.hoursInput.value = Math.floor(minutes / 60);
    elements.minutesInput.value = minutes % 60;
    elements.secondsInput.value = 0;
  }

  function addMinute() {
    if (!state.timer.running && state.timer.remainingTime === 0) return;

    state.timer.totalTime += 60000;
    state.timer.pausedTime += 60000;

    if (!state.timer.running) {
      state.timer.remainingTime += 60000;
    }

    showToast('+1 minute added', 'success');
  }

  function validateTimeInput(e) {
    const input = e.target;
    let value = parseInt(input.value) || 0;

    if (input === elements.hoursInput) {
      value = Math.max(0, Math.min(99, value));
    } else {
      value = Math.max(0, Math.min(59, value));
    }

    input.value = value;
  }

  function timerComplete() {
    pauseTimer();

    // Play sound
    if (state.soundEnabled) {
      playAlarm();
    }

    // Show modal
    showCompleteModal();

    // Reset
    state.timer.totalTime = 0;
    state.timer.remainingTime = 0;
  }

  function showCompleteModal() {
    elements.timerCompleteModal.classList.add('show');
  }

  function hideCompleteModal() {
    elements.timerCompleteModal.classList.remove('show');
    stopAlarm();
    resetTimer();
  }

  // ============================================
  // Sound Functions
  // ============================================
  let alarmOscillator = null;

  function playAlarm() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    alarmOscillator = audioContext.createOscillator();
    alarmOscillator.connect(gainNode);
    alarmOscillator.type = 'sine';
    alarmOscillator.frequency.setValueAtTime(800, audioContext.currentTime);

    // Beep pattern
    const beep = () => {
      if (!alarmOscillator) return;
      alarmOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      setTimeout(() => {
        if (alarmOscillator) alarmOscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      }, 200);
    };

    alarmOscillator.start();
    beep();
    const beepInterval = setInterval(beep, 400);

    // Store interval for cleanup
    alarmOscillator.beepInterval = beepInterval;
  }

  function stopAlarm() {
    if (alarmOscillator) {
      clearInterval(alarmOscillator.beepInterval);
      alarmOscillator.stop();
      alarmOscillator = null;
    }
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function initKeyboardShortcuts() {
    // Shortcut modal handled by tools-common.js
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (state.mode === 'stopwatch') {
            toggleStopwatch();
          } else {
            toggleTimer();
          }
          break;
        case 'r':
          if (state.mode === 'stopwatch') {
            resetStopwatch();
          } else {
            resetTimer();
          }
          break;
        case 'l':
          if (state.mode === 'stopwatch' && state.stopwatch.running) {
            recordLap();
          }
          break;
        case 'tab':
          e.preventDefault();
          switchMode(state.mode === 'stopwatch' ? 'timer' : 'stopwatch');
          break;
        case 'm':
          state.soundEnabled = !state.soundEnabled;
          elements.soundEnabled.checked = state.soundEnabled;
          localStorage.setItem('timerSound', state.soundEnabled);
          showToast(`Sound ${state.soundEnabled ? 'enabled' : 'disabled'}`, 'success');
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'escape':
          hideCompleteModal();
          break;
      }
    });
  }

  // ============================================
  // Utilities
  // ============================================
  function parseTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000));

    return { hours, minutes, seconds, ms: milliseconds };
  }

  function formatTime(hours, minutes, seconds) {
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }


  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
