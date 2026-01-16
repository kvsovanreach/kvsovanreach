/**
 * KVSOVANREACH Bit-Shift Defuser
 * Binary bitwise operation puzzle game
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const BITS = 8;
  const MAX_VALUE = (1 << BITS) - 1; // 255

  // ==================== State ====================
  const state = {
    target: 0,
    current: 0,
    mask: 0,
    level: 1,
    moves: 0,
    score: 0,
    timeLeft: 60,
    timerInterval: null,
    history: [],
    isGameOver: false
  };

  // ==================== DOM Elements ====================
  const elements = {
    targetBinary: document.getElementById('targetBinary'),
    currentBinary: document.getElementById('currentBinary'),
    targetDecimal: document.getElementById('targetDecimal'),
    currentDecimal: document.getElementById('currentDecimal'),
    maskBits: document.getElementById('maskBits'),
    maskDecimal: document.getElementById('maskDecimal'),
    timerDisplay: document.getElementById('timerDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    movesDisplay: document.getElementById('movesDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    gameOverlay: document.getElementById('gameOverlay'),
    overlayIcon: document.getElementById('overlayIcon'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayMessage: document.getElementById('overlayMessage'),
    finalTime: document.getElementById('finalTime'),
    finalMoves: document.getElementById('finalMoves'),
    finalScore: document.getElementById('finalScore'),
    undoBtn: document.getElementById('undoBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    continueBtn: document.getElementById('continueBtn'),
    opBtns: document.querySelectorAll('.op-btn')
  };

  // ==================== Binary Display ====================

  function renderBinary(container, value, compareWith = null) {
    container.innerHTML = '';

    for (let i = BITS - 1; i >= 0; i--) {
      const bit = document.createElement('div');
      bit.className = 'bit';

      const bitValue = (value >> i) & 1;
      bit.textContent = bitValue;

      if (bitValue === 1) {
        bit.classList.add('one');
      } else {
        bit.classList.add('zero');
      }

      // Compare with target/current
      if (compareWith !== null) {
        const compareBit = (compareWith >> i) & 1;
        if (bitValue === compareBit) {
          bit.classList.add('match');
        } else {
          bit.classList.add('mismatch');
        }
      }

      container.appendChild(bit);
    }
  }

  function renderMask() {
    elements.maskBits.innerHTML = '';

    for (let i = BITS - 1; i >= 0; i--) {
      const bit = document.createElement('div');
      bit.className = 'mask-bit';
      bit.dataset.index = i;

      const bitValue = (state.mask >> i) & 1;
      bit.textContent = bitValue;

      if (bitValue === 1) {
        bit.classList.add('one');
      }

      bit.addEventListener('click', () => toggleMaskBit(i));
      elements.maskBits.appendChild(bit);
    }

    elements.maskDecimal.textContent = `= ${state.mask}`;
  }

  function toggleMaskBit(index) {
    state.mask ^= (1 << index);
    renderMask();
  }

  function updateDisplay() {
    renderBinary(elements.targetBinary, state.target);
    renderBinary(elements.currentBinary, state.current, state.target);
    elements.targetDecimal.textContent = `= ${state.target}`;
    elements.currentDecimal.textContent = `= ${state.current}`;
    renderMask();

    elements.timerDisplay.textContent = state.timeLeft;
    elements.levelDisplay.textContent = state.level;
    elements.movesDisplay.textContent = state.moves;
    elements.scoreDisplay.textContent = state.score;
  }

  // ==================== Operations ====================

  function applyOperation(op) {
    if (state.isGameOver) return;

    // Save state for undo
    state.history.push(state.current);

    let result = state.current;

    switch (op) {
      case 'shl':
        result = (state.current << 1) & MAX_VALUE;
        break;
      case 'shr':
        result = state.current >> 1;
        break;
      case 'not':
        result = (~state.current) & MAX_VALUE;
        break;
      case 'and':
        result = state.current & state.mask;
        break;
      case 'or':
        result = state.current | state.mask;
        break;
      case 'xor':
        result = state.current ^ state.mask;
        break;
    }

    state.current = result;
    state.moves++;

    updateDisplay();
    checkWin();
  }

  function undo() {
    if (state.history.length === 0 || state.isGameOver) return;

    state.current = state.history.pop();
    state.moves--;
    updateDisplay();
    ToolsCommon.Toast.show('Move undone', 'info');
  }

  // ==================== Game Logic ====================

  function generatePuzzle() {
    // Generate target
    state.target = Math.floor(Math.random() * (MAX_VALUE + 1));

    // Generate starting value that's different
    do {
      state.current = Math.floor(Math.random() * (MAX_VALUE + 1));
    } while (state.current === state.target);

    // Reset state
    state.mask = 0;
    state.moves = 0;
    state.history = [];
    state.isGameOver = false;

    // Time based on level
    state.timeLeft = Math.max(30, 70 - state.level * 5);

    // Reset timer color
    elements.timerDisplay.style.color = '';

    // Hide overlay
    elements.gameOverlay.classList.remove('show');

    updateDisplay();
    startTimer();
  }

  function checkWin() {
    if (state.current === state.target) {
      endGame(true);
    }
  }

  function startTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      elements.timerDisplay.textContent = state.timeLeft;

      // Flash when low
      if (state.timeLeft <= 10) {
        elements.timerDisplay.style.color = '#ef4444';
      }

      if (state.timeLeft <= 0) {
        endGame(false);
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function endGame(won) {
    state.isGameOver = true;
    stopTimer();

    if (won) {
      // Calculate score
      const timeBonus = state.timeLeft * 10;
      const moveBonus = Math.max(0, (20 - state.moves) * 5);
      const levelBonus = state.level * 50;
      const roundScore = 100 + timeBonus + moveBonus + levelBonus;

      state.score += roundScore;

      elements.overlayIcon.className = 'fa-solid fa-check-circle';
      elements.overlayIcon.style.color = '#22c55e';
      elements.overlayTitle.textContent = 'DEFUSED!';
      elements.overlayMessage.textContent = `+${roundScore} points!`;
      elements.continueBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i><span>Next Level</span>';
    } else {
      elements.overlayIcon.className = 'fa-solid fa-bomb explode';
      elements.overlayIcon.style.color = '#ef4444';
      elements.overlayTitle.textContent = 'BOOM!';
      elements.overlayMessage.textContent = 'The bomb exploded!';
      elements.continueBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Try Again</span>';
    }

    elements.finalTime.textContent = state.timeLeft;
    elements.finalMoves.textContent = state.moves;
    elements.finalScore.textContent = state.score;
    elements.gameOverlay.classList.add('show');
  }

  function continueGame() {
    if (state.current === state.target) {
      // Won - next level
      state.level++;
    } else {
      // Lost - reset level
      state.level = 1;
      state.score = 0;
    }

    generatePuzzle();
  }

  function newGame() {
    state.level = 1;
    state.score = 0;
    generatePuzzle();
    ToolsCommon.Toast.show('New game started!', 'success');
  }

  // ==================== Event Handlers ====================

  function handleOpClick(e) {
    const btn = e.target.closest('.op-btn');
    if (!btn) return;

    const op = btn.dataset.op;
    applyOperation(op);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    if (state.isGameOver) return;

    switch (e.key) {
      case '<':
        e.preventDefault();
        applyOperation('shl');
        break;
      case '>':
        e.preventDefault();
        applyOperation('shr');
        break;
      case '~':
        e.preventDefault();
        applyOperation('not');
        break;
      case '&':
        e.preventDefault();
        applyOperation('and');
        break;
      case '|':
        e.preventDefault();
        applyOperation('or');
        break;
      case '^':
        e.preventDefault();
        applyOperation('xor');
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        undo();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        newGame();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Event listeners
    elements.opBtns.forEach(btn => {
      btn.addEventListener('click', handleOpClick);
    });

    elements.undoBtn?.addEventListener('click', undo);
    elements.newGameBtn?.addEventListener('click', newGame);
    elements.continueBtn?.addEventListener('click', continueGame);

    document.addEventListener('keydown', handleKeydown);

    // Start game
    generatePuzzle();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
