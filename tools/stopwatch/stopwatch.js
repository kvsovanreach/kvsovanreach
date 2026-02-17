/**
 * KVSOVANREACH Stopwatch
 */

(function() {
  'use strict';

  const state = {
    running: false,
    startTime: 0,
    elapsedTime: 0,
    intervalId: null,
    laps: []
  };

  const elements = {};

  function initElements() {
    elements.hours = document.getElementById('hours');
    elements.minutes = document.getElementById('minutes');
    elements.seconds = document.getElementById('seconds');
    elements.milliseconds = document.getElementById('milliseconds');
    elements.startBtn = document.getElementById('startBtn');
    elements.lapBtn = document.getElementById('lapBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.lapsSection = document.getElementById('lapsSection');
    elements.lapsList = document.getElementById('lapsList');
    elements.lapCount = document.getElementById('lapCount');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(2, '0')
    };
  }

  function formatTimeString(ms) {
    const time = formatTime(ms);
    if (parseInt(time.hours) > 0) {
      return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;
    }
    return `${time.minutes}:${time.seconds}.${time.milliseconds}`;
  }

  function updateDisplay() {
    const time = formatTime(state.elapsedTime);
    elements.hours.textContent = time.hours;
    elements.minutes.textContent = time.minutes;
    elements.seconds.textContent = time.seconds;
    elements.milliseconds.textContent = time.milliseconds;
  }

  function start() {
    state.running = true;
    state.startTime = Date.now() - state.elapsedTime;

    state.intervalId = setInterval(() => {
      state.elapsedTime = Date.now() - state.startTime;
      updateDisplay();
    }, 10);

    elements.startBtn.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pause</span>';
    elements.startBtn.classList.add('running');
    elements.lapBtn.disabled = false;
  }

  function pause() {
    state.running = false;
    clearInterval(state.intervalId);

    elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Resume</span>';
    elements.startBtn.classList.remove('running');
  }

  function reset() {
    state.running = false;
    state.elapsedTime = 0;
    state.laps = [];
    clearInterval(state.intervalId);

    updateDisplay();
    renderLaps();

    elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start</span>';
    elements.startBtn.classList.remove('running');
    elements.lapBtn.disabled = true;
    elements.lapsSection.classList.remove('show');

    showToast('Reset', 'success');
  }

  function addLap() {
    const lapTime = state.elapsedTime;
    const prevLapTime = state.laps.length > 0 ? state.laps[state.laps.length - 1].total : 0;
    const diff = lapTime - prevLapTime;

    state.laps.push({
      number: state.laps.length + 1,
      total: lapTime,
      diff: diff
    });

    renderLaps();
    elements.lapsSection.classList.add('show');
  }

  function renderLaps() {
    if (state.laps.length === 0) {
      elements.lapsList.innerHTML = '';
      elements.lapCount.textContent = '0 laps';
      return;
    }

    const diffs = state.laps.map(l => l.diff);
    const minDiff = Math.min(...diffs);
    const maxDiff = Math.max(...diffs);

    elements.lapsList.innerHTML = state.laps
      .slice()
      .reverse()
      .map(lap => {
        let className = 'lap-item';
        if (state.laps.length > 2) {
          if (lap.diff === minDiff) className += ' best';
          else if (lap.diff === maxDiff) className += ' worst';
        }

        return `
          <div class="${className}">
            <span class="lap-number">Lap ${lap.number}</span>
            <span class="lap-time">${formatTimeString(lap.diff)}</span>
            <span class="lap-diff">${formatTimeString(lap.total)}</span>
          </div>
        `;
      })
      .join('');

    elements.lapCount.textContent = `${state.laps.length} lap${state.laps.length !== 1 ? 's' : ''}`;
  }

  function handleStartPause() {
    if (state.running) {
      pause();
    } else {
      start();
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea')) return;

    switch(e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        handleStartPause();
        break;
      case 'l':
        if (!elements.lapBtn.disabled && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          addLap();
        }
        break;
      case 'r':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          reset();
        }
        break;
    }
  }

  function init() {
    initElements();

    elements.startBtn.addEventListener('click', handleStartPause);
    elements.lapBtn.addEventListener('click', addLap);
    elements.resetBtn.addEventListener('click', reset);
    document.addEventListener('keydown', handleKeydown);

    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
