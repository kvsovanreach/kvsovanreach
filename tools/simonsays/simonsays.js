/**
 * Simon Says - Script
 * Classic memory game: watch the sequence, repeat it
 */
(function() {
  'use strict';

  // ==================== Constants ====================
  const COLORS = ['red', 'blue', 'green', 'yellow'];
  const COLOR_KEY_MAP = { '1': 'red', '2': 'blue', '3': 'green', '4': 'yellow' };
  const STORAGE_KEY = 'simon_high_score';

  // Tone frequencies for each color
  const TONE_FREQ = { red: 329.63, blue: 261.63, green: 392.00, yellow: 466.16 };

  // ==================== State ====================
  const state = {
    sequence: [],
    playerIndex: 0,
    round: 0,
    highScore: 0,
    isPlaying: false,
    isShowingSequence: false,
    strictMode: false,
    soundOn: true
  };

  // ==================== DOM ====================
  const pads = document.querySelectorAll('.simon-pad');
  const boardEl = document.getElementById('simonBoard');
  const startBtn = document.getElementById('startBtn');
  const roundDisplay = document.getElementById('roundDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const statusText = document.getElementById('statusText');
  const modeButtons = document.querySelectorAll('.mode-btn:not(.sound-btn)');
  const soundButtons = document.querySelectorAll('.sound-btn');

  // Audio context (lazy init)
  let audioCtx = null;

  // ==================== Init ====================
  function init() {
    loadHighScore();
    updateDisplays();
    boardEl.classList.add('idle');
    bindEvents();
  }

  function bindEvents() {
    startBtn.addEventListener('click', startGame);

    pads.forEach(pad => {
      pad.addEventListener('click', () => handlePadClick(pad.dataset.color));
      pad.addEventListener('mousedown', (e) => e.preventDefault()); // prevent focus ring on click
    });

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.strictMode = btn.dataset.mode === 'strict';
      });
    });

    soundButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        soundButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.soundOn = btn.dataset.sound === 'on';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;

      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        startGame();
        return;
      }

      if (COLOR_KEY_MAP[e.key]) {
        e.preventDefault();
        handlePadClick(COLOR_KEY_MAP[e.key]);
      }
    });
  }

  // ==================== Audio ====================
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(color, duration) {
    if (!state.soundOn) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = TONE_FREQ[color];
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) { /* ignore audio errors */ }
  }

  function playErrorTone() {
    if (!state.soundOn) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) { /* ignore */ }
  }

  // ==================== Game Logic ====================
  function startGame() {
    state.sequence = [];
    state.playerIndex = 0;
    state.round = 0;
    state.isPlaying = true;
    boardEl.classList.remove('idle');
    updateDisplays();

    startBtn.querySelector('i').className = 'fa-solid fa-rotate';
    startBtn.querySelector('span').textContent = 'Restart';

    nextRound();
  }

  function nextRound() {
    state.round++;
    state.playerIndex = 0;
    state.sequence.push(COLORS[Math.floor(Math.random() * 4)]);
    updateDisplays();
    showSequence();
  }

  function getFlashDuration() {
    // Speed increases every 5 rounds: starts at 500ms, min 200ms
    const base = 500;
    const reduction = Math.floor((state.round - 1) / 5) * 60;
    return Math.max(200, base - reduction);
  }

  function getGapDuration() {
    return Math.max(100, getFlashDuration() * 0.4);
  }

  function showSequence() {
    state.isShowingSequence = true;
    setStatus('Watch carefully...', 'watching');
    disablePads(true);

    let i = 0;
    const flashDur = getFlashDuration();
    const gapDur = getGapDuration();

    function flashNext() {
      if (i >= state.sequence.length) {
        state.isShowingSequence = false;
        setStatus('Your turn!', 'playing');
        disablePads(false);
        return;
      }

      const color = state.sequence[i];
      lightPad(color, flashDur);
      playTone(color, flashDur);
      i++;

      setTimeout(flashNext, flashDur + gapDur);
    }

    // Small delay before starting sequence
    setTimeout(flashNext, 600);
  }

  function handlePadClick(color) {
    if (!state.isPlaying || state.isShowingSequence) return;

    const pad = document.querySelector(`.simon-pad[data-color="${color}"]`);
    lightPad(color, 250);
    playTone(color, 250);

    const expected = state.sequence[state.playerIndex];

    if (color === expected) {
      state.playerIndex++;

      if (state.playerIndex === state.sequence.length) {
        // Round complete
        disablePads(true);
        checkHighScore();
        updateDisplays();

        setStatus('Correct! Next round...', 'playing');
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Round ' + state.round + ' complete!', 'success');
        }

        setTimeout(() => nextRound(), 1000);
      }
    } else {
      // Wrong
      playErrorTone();
      pad.classList.add('wrong-flash');
      setTimeout(() => pad.classList.remove('wrong-flash'), 400);

      if (state.strictMode) {
        setStatus('Wrong! Game over (Strict Mode)', 'wrong');
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Game over! You reached round ' + state.round, 'error');
        }
        checkHighScore();
        gameOver();
      } else {
        setStatus('Wrong! Watch again...', 'wrong');
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Wrong! Replaying sequence...', 'warning');
        }
        state.playerIndex = 0;
        setTimeout(() => showSequence(), 1000);
      }
    }
  }

  function gameOver() {
    state.isPlaying = false;
    boardEl.classList.add('idle');
    disablePads(true);
    startBtn.querySelector('i').className = 'fa-solid fa-play';
    startBtn.querySelector('span').textContent = 'Start';
  }

  function checkHighScore() {
    if (state.round > state.highScore) {
      state.highScore = state.round;
      saveHighScore();

      const highScoreItem = highScoreDisplay.closest('.score-item');
      if (highScoreItem) {
        highScoreItem.classList.remove('new-high');
        void highScoreItem.offsetWidth; // reflow
        highScoreItem.classList.add('new-high');
      }
    }
    updateDisplays();
  }

  // ==================== UI Helpers ====================
  function lightPad(color, duration) {
    const pad = document.querySelector(`.simon-pad[data-color="${color}"]`);
    pad.classList.add('lit');
    setTimeout(() => pad.classList.remove('lit'), duration);
  }

  function disablePads(disabled) {
    pads.forEach(pad => {
      if (disabled) {
        pad.classList.add('disabled');
      } else {
        pad.classList.remove('disabled');
      }
    });
  }

  function setStatus(text, type) {
    statusText.textContent = text;
    statusText.className = 'simon-status';
    if (type) statusText.classList.add(type);
  }

  function updateDisplays() {
    roundDisplay.textContent = state.round;
    highScoreDisplay.textContent = state.highScore;
  }

  // ==================== Persistence ====================
  function saveHighScore() {
    try {
      localStorage.setItem(STORAGE_KEY, state.highScore.toString());
    } catch (e) { /* ignore */ }
  }

  function loadHighScore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.highScore = parseInt(saved, 10) || 0;
      }
    } catch (e) { /* ignore */ }
  }

  // ==================== Start ====================
  init();
})();
