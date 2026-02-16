/**
 * KVSOVANREACH 2048 Game
 * Classic sliding puzzle game
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    gameBoard: document.getElementById('gameBoard'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    newGameBtn: document.getElementById('newGameBtn'),
    undoBtn: document.getElementById('undoBtn'),
    gameOverlay: document.getElementById('gameOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayScore: document.getElementById('overlayScore'),
    tryAgainBtn: document.getElementById('tryAgainBtn')
  };

  // ==================== State ====================
  const state = {
    size: 4,
    grid: [],
    score: 0,
    best: 0,
    history: [],
    isAnimating: false,
    gameOver: false,
    won: false
  };

  // ==================== Core Functions ====================

  function createEmptyGrid() {
    return Array(state.size).fill(null).map(() => Array(state.size).fill(0));
  }

  function getEmptyCells() {
    const cells = [];
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        if (state.grid[r][c] === 0) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  }

  function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return false;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    state.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return { r, c, value: state.grid[r][c] };
  }

  function cloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  function gridsEqual(a, b) {
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function slideRow(row) {
    // Remove zeros
    let filtered = row.filter(x => x !== 0);
    let merged = [];
    let scoreAdd = 0;

    // Merge adjacent equal numbers
    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        scoreAdd += filtered[i] * 2;
        i++; // Skip next
      } else {
        merged.push(filtered[i]);
      }
    }

    // Pad with zeros
    while (merged.length < state.size) {
      merged.push(0);
    }

    return { row: merged, scoreAdd };
  }

  function move(direction) {
    if (state.isAnimating || state.gameOver) return false;

    const oldGrid = cloneGrid(state.grid);
    const oldScore = state.score;
    let totalScoreAdd = 0;

    // Rotate grid based on direction for unified processing
    const rotations = { up: 3, right: 2, down: 1, left: 0 };
    const rotation = rotations[direction];

    // Rotate
    for (let i = 0; i < rotation; i++) {
      state.grid = rotateClockwise(state.grid);
    }

    // Slide all rows left
    for (let r = 0; r < state.size; r++) {
      const { row, scoreAdd } = slideRow(state.grid[r]);
      state.grid[r] = row;
      totalScoreAdd += scoreAdd;
    }

    // Rotate back
    for (let i = 0; i < (4 - rotation) % 4; i++) {
      state.grid = rotateClockwise(state.grid);
    }

    // Check if grid changed
    if (gridsEqual(oldGrid, state.grid)) {
      return false;
    }

    // Save history for undo
    state.history.push({ grid: oldGrid, score: oldScore });
    if (state.history.length > 10) state.history.shift();

    // Update score
    state.score += totalScoreAdd;
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }

    // Add new tile
    const newTile = addRandomTile();

    // Check for win
    checkWin();

    // Check for game over
    if (!canMove()) {
      state.gameOver = true;
      showGameOver();
    }

    return { newTile };
  }

  function rotateClockwise(grid) {
    const n = grid.length;
    const rotated = createEmptyGrid();
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        rotated[c][n - 1 - r] = grid[r][c];
      }
    }
    return rotated;
  }

  function canMove() {
    // Check for empty cells
    if (getEmptyCells().length > 0) return true;

    // Check for possible merges
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const val = state.grid[r][c];
        // Check right
        if (c < state.size - 1 && state.grid[r][c + 1] === val) return true;
        // Check down
        if (r < state.size - 1 && state.grid[r + 1][c] === val) return true;
      }
    }
    return false;
  }

  function checkWin() {
    if (state.won) return;
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        if (state.grid[r][c] === 2048) {
          state.won = true;
          showWin();
          return;
        }
      }
    }
  }

  function undo() {
    if (state.history.length === 0 || state.isAnimating) return;

    const prev = state.history.pop();
    state.grid = prev.grid;
    state.score = prev.score;
    state.gameOver = false;
    hideOverlay();
    render();
    updateStats();
    updateUndoButton();
  }

  // ==================== Storage ====================

  function loadBest() {
    try {
      const saved = localStorage.getItem(`game2048_best_${state.size}`);
      state.best = saved ? parseInt(saved) : 0;
    } catch (e) {
      state.best = 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(`game2048_best_${state.size}`, state.best);
    } catch (e) {
      // Storage full
    }
  }

  // ==================== UI Functions ====================

  function render() {
    // Create grid cells
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.className = `game-board size-${state.size}`;

    // Get cell dimensions
    const boardRect = elements.gameBoard.getBoundingClientRect();
    const gap = 8;
    const padding = 8;
    const cellSize = (boardRect.width - padding * 2 - gap * (state.size - 1)) / state.size;

    // Create background cells
    for (let i = 0; i < state.size * state.size; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      elements.gameBoard.appendChild(cell);
    }

    // Create tiles
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const value = state.grid[r][c];
        if (value === 0) continue;

        const tile = document.createElement('div');
        const tileClass = value <= 2048 ? `tile-${value}` : 'tile-super';
        tile.className = `tile ${tileClass}`;

        // Position
        tile.style.width = `${cellSize}px`;
        tile.style.height = `${cellSize}px`;
        tile.style.left = `${padding + c * (cellSize + gap)}px`;
        tile.style.top = `${padding + r * (cellSize + gap)}px`;

        // Font size based on grid size and value length
        const baseSize = cellSize * 0.4;
        const valueLength = value.toString().length;
        const fontSize = Math.min(baseSize, cellSize * 0.6 / (valueLength * 0.4));
        tile.style.fontSize = `${fontSize}px`;

        tile.textContent = value;
        elements.gameBoard.appendChild(tile);
      }
    }
  }

  function updateStats() {
    elements.scoreDisplay.textContent = state.score;
    elements.bestDisplay.textContent = state.best;
  }

  function updateUndoButton() {
    elements.undoBtn.disabled = state.history.length === 0;
  }

  function showGameOver() {
    elements.overlayTitle.textContent = 'Game Over!';
    elements.overlayScore.textContent = `Score: ${state.score}`;
    elements.gameOverlay.classList.remove('hidden');
  }

  function showWin() {
    elements.overlayTitle.textContent = 'You Win! 🎉';
    elements.overlayScore.textContent = `Score: ${state.score}`;
    elements.gameOverlay.classList.remove('hidden');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.success('Congratulations! You reached 2048!');
    }
  }

  function hideOverlay() {
    elements.gameOverlay.classList.add('hidden');
  }

  function newGame() {
    state.grid = createEmptyGrid();
    state.score = 0;
    state.history = [];
    state.gameOver = false;
    state.won = false;

    addRandomTile();
    addRandomTile();

    hideOverlay();
    render();
    updateStats();
    updateUndoButton();
  }

  // ==================== Touch Handling ====================

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const minSwipe = 50;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) {
        handleMove(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > minSwipe) {
        handleMove(dy > 0 ? 'down' : 'up');
      }
    }
  }

  function handleMove(direction) {
    const result = move(direction);
    if (result) {
      state.isAnimating = true;
      render();
      updateStats();
      updateUndoButton();

      // Add animation class to new tile
      setTimeout(() => {
        if (result.newTile) {
          const tiles = elements.gameBoard.querySelectorAll('.tile');
          tiles.forEach(tile => {
            const r = parseInt((parseFloat(tile.style.top) - 8) / (tile.offsetHeight + 8));
            const c = parseInt((parseFloat(tile.style.left) - 8) / (tile.offsetWidth + 8));
            if (r === result.newTile.r && c === result.newTile.c) {
              tile.classList.add('new');
            }
          });
        }
        state.isAnimating = false;
      }, 50);
    }
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const keyMap = {
      'ArrowUp': 'up', 'w': 'up', 'W': 'up',
      'ArrowDown': 'down', 's': 'down', 'S': 'down',
      'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
      'ArrowRight': 'right', 'd': 'right', 'D': 'right'
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      handleMove(keyMap[e.key]);
    } else if (e.key.toLowerCase() === 'u') {
      undo();
    } else if (e.key.toLowerCase() === 'n') {
      newGame();
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Load best score
    loadBest();

    // Size buttons
    elements.sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.size = parseInt(btn.dataset.size);
        loadBest();
        newGame();
      });
    });

    // New game button
    elements.newGameBtn.addEventListener('click', newGame);
    elements.tryAgainBtn.addEventListener('click', newGame);

    // Undo button
    elements.undoBtn.addEventListener('click', undo);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Touch events
    elements.gameBoard.addEventListener('touchstart', handleTouchStart, { passive: true });
    elements.gameBoard.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Prevent scrolling on game board
    elements.gameBoard.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    // Handle resize
    window.addEventListener('resize', () => {
      render();
    });

    // Initialize game
    newGame();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
