/**
 * KVSOVANREACH Pomodoro Timer
 */

(function() {
  'use strict';

  const MODES = {
    work: { label: 'Work Session', color: '#22c55e' },
    short: { label: 'Short Break', color: '#3b82f6' },
    long: { label: 'Long Break', color: '#8b5cf6' }
  };

  const state = {
    mode: 'work',
    running: false,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    intervalId: null,
    sessionsCompleted: 0
  };

  const elements = {};

  function initElements() {
    elements.timerDisplay = document.getElementById('timerDisplay');
    elements.timerMode = document.getElementById('timerMode');
    elements.progressRing = document.getElementById('progressRing');
    elements.startBtn = document.getElementById('startBtn');
    elements.resetAllBtn = document.getElementById('resetAllBtn');
    elements.sessionCount = document.getElementById('sessionCount');
    elements.modeTabs = document.querySelectorAll('.tool-tab[data-mode]');
    elements.workDuration = document.getElementById('workDuration');
    elements.shortBreakDuration = document.getElementById('shortBreakDuration');
    elements.longBreakDuration = document.getElementById('longBreakDuration');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateDisplay() {
    elements.timerDisplay.textContent = formatTime(state.timeLeft);
    elements.timerMode.textContent = MODES[state.mode].label;

    const circumference = 2 * Math.PI * 90;
    const progress = state.timeLeft / state.totalTime;
    const offset = circumference * (1 - progress);
    elements.progressRing.style.strokeDashoffset = offset;
  }

  function getDuration(mode) {
    switch(mode) {
      case 'work': return parseInt(elements.workDuration.value) * 60;
      case 'short': return parseInt(elements.shortBreakDuration.value) * 60;
      case 'long': return parseInt(elements.longBreakDuration.value) * 60;
      default: return 25 * 60;
    }
  }

  function setMode(mode) {
    if (state.running) {
      pause();
    }

    state.mode = mode;
    state.totalTime = getDuration(mode);
    state.timeLeft = state.totalTime;

    elements.modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    elements.progressRing.style.stroke = MODES[mode].color;
    updateDisplay();
  }

  function start() {
    state.running = true;
    elements.startBtn.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pause</span>';
    elements.startBtn.classList.add('running');

    state.intervalId = setInterval(() => {
      state.timeLeft--;
      updateDisplay();

      if (state.timeLeft <= 0) {
        complete();
      }
    }, 1000);
  }

  function pause() {
    state.running = false;
    clearInterval(state.intervalId);
    elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Resume</span>';
    elements.startBtn.classList.remove('running');
  }

  function complete() {
    pause();
    playNotification();

    if (state.mode === 'work') {
      state.sessionsCompleted++;
      elements.sessionCount.textContent = state.sessionsCompleted;
      showToast('Work session completed! Take a break.', 'success');

      if (state.sessionsCompleted % 4 === 0) {
        setMode('long');
      } else {
        setMode('short');
      }
    } else {
      showToast('Break over! Ready to work?', 'success');
      setMode('work');
    }
  }

  function reset() {
    pause();
    state.mode = 'work';
    state.totalTime = getDuration('work');
    state.timeLeft = state.totalTime;
    state.sessionsCompleted = 0;
    elements.sessionCount.textContent = '0';
    elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start</span>';
    elements.modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === 'work');
    });
    elements.progressRing.style.stroke = MODES.work.color;
    updateDisplay();
    showToast('Reset', 'success');
  }

  function playNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: state.mode === 'work' ? 'Work session completed!' : 'Break is over!',
        icon: '/assets/img/favicons/favicon.ico'
      });
    }

    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.frequency.value = 800;
    gain.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
  }

  function handleStartPause() {
    if (state.running) {
      pause();
    } else {
      start();
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    switch(e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        handleStartPause();
        break;
      case 'r':
        e.preventDefault();
        reset();
        break;
    }
  }

  function handleSettingsChange() {
    if (!state.running) {
      state.totalTime = getDuration(state.mode);
      state.timeLeft = state.totalTime;
      updateDisplay();
    }
  }

  function init() {
    initElements();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    elements.startBtn.addEventListener('click', handleStartPause);
    elements.resetAllBtn.addEventListener('click', reset);

    elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    elements.workDuration.addEventListener('change', handleSettingsChange);
    elements.shortBreakDuration.addEventListener('change', handleSettingsChange);
    elements.longBreakDuration.addEventListener('change', handleSettingsChange);

    document.addEventListener('keydown', handleKeydown);

    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
