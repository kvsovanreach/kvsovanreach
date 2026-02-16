/**
 * KVSOVANREACH Entanglement Puzzle
 * Quantum-inspired tile puzzle game
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    size: 3,
    board: [],
    initialBoard: [], // Store initial puzzle state for reset
    moves: 0,
    level: 1,
    history: [],
    bestMoves: {},
    isWon: false,
    minMoves: 0 // Track actual minimum moves used to create puzzle
  };

  // ==================== DOM Elements ====================
  const elements = {
    gameBoard: document.getElementById('gameBoard'),
    levelDisplay: document.getElementById('levelDisplay'),
    movesDisplay: document.getElementById('movesDisplay'),
    targetDisplay: document.getElementById('targetDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    winOverlay: document.getElementById('winOverlay'),
    winMoves: document.getElementById('winMoves'),
    undoBtn: document.getElementById('undoBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn')
  };

  // ==================== Board Logic ====================

  function createBoard() {
    state.board = [];
    for (let i = 0; i < state.size; i++) {
      const row = [];
      for (let j = 0; j < state.size; j++) {
        row.push(false); // All tiles start OFF
      }
      state.board.push(row);
    }
  }

  function generateSolvablePuzzle() {
    createBoard();

    // Start with all tiles ON, then make random valid moves to create puzzle
    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        state.board[i][j] = true;
      }
    }

    // Make random moves to scramble (ensures puzzle is solvable)
    // Track unique positions to count actual minimum moves
    const usedPositions = new Set();
    const numMoves = state.level + state.size + Math.floor(Math.random() * 5);
    for (let i = 0; i < numMoves; i++) {
      const row = Math.floor(Math.random() * state.size);
      const col = Math.floor(Math.random() * state.size);
      const key = `${row},${col}`;

      // Toggle the position (if same position toggled twice, they cancel out)
      if (usedPositions.has(key)) {
        usedPositions.delete(key);
      } else {
        usedPositions.add(key);
      }

      toggleTileAndNeighbors(row, col, false); // Don't animate during generation
    }

    // Make sure puzzle isn't already solved
    if (checkWin()) {
      generateSolvablePuzzle(); // Try again
      return;
    }

    // Store actual minimum moves and initial board state
    state.minMoves = usedPositions.size;
    state.initialBoard = JSON.parse(JSON.stringify(state.board));

    // Update target display
    elements.targetDisplay.textContent = `~${state.minMoves}`;
  }

  function toggleTile(row, col) {
    if (row >= 0 && row < state.size && col >= 0 && col < state.size) {
      state.board[row][col] = !state.board[row][col];
      return true;
    }
    return false;
  }

  function toggleTileAndNeighbors(row, col, animate = true) {
    // Save state for undo
    if (animate) {
      state.history.push(JSON.parse(JSON.stringify(state.board)));
    }

    // Toggle clicked tile
    toggleTile(row, col);

    // Toggle neighbors (cross pattern)
    toggleTile(row - 1, col); // Up
    toggleTile(row + 1, col); // Down
    toggleTile(row, col - 1); // Left
    toggleTile(row, col + 1); // Right

    if (animate) {
      state.moves++;
      renderBoard(row, col);
      updateUI();

      // Check win condition
      if (checkWin()) {
        setTimeout(() => {
          state.isWon = true;
          showWinScreen();
        }, 500);
      }
    }
  }

  function checkWin() {
    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        if (!state.board[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  // ==================== Rendering ====================

  function renderBoard(clickedRow = -1, clickedCol = -1) {
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.className = `game-board size-${state.size}`;

    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.row = i;
        tile.dataset.col = j;

        if (state.board[i][j]) {
          tile.classList.add('on');
        }

        // Add animation class if this tile was affected
        if (clickedRow >= 0) {
          const isClicked = i === clickedRow && j === clickedCol;
          const isNeighbor = (
            (i === clickedRow - 1 && j === clickedCol) ||
            (i === clickedRow + 1 && j === clickedCol) ||
            (i === clickedRow && j === clickedCol - 1) ||
            (i === clickedRow && j === clickedCol + 1)
          );

          if (isClicked) {
            tile.classList.add('toggling');
          } else if (isNeighbor) {
            tile.classList.add('entangled-flash');
          }
        }

        tile.addEventListener('click', handleTileClick);
        elements.gameBoard.appendChild(tile);
      }
    }
  }

  function updateUI() {
    elements.levelDisplay.textContent = state.level;
    elements.movesDisplay.textContent = state.moves;

    // Update best score
    const key = `${state.size}-${state.level}`;
    if (state.bestMoves[key]) {
      elements.bestDisplay.textContent = state.bestMoves[key];
    } else {
      elements.bestDisplay.textContent = '--';
    }
  }

  function showWinScreen() {
    elements.winMoves.textContent = state.moves;
    elements.winOverlay.classList.add('show');

    // Update best score
    const key = `${state.size}-${state.level}`;
    if (!state.bestMoves[key] || state.moves < state.bestMoves[key]) {
      state.bestMoves[key] = state.moves;
      saveBestMoves();
      ToolsCommon.Toast.show('New best score!', 'success');
    }

    updateUI();
  }

  function hideWinScreen() {
    elements.winOverlay.classList.remove('show');
  }

  // ==================== Game Actions ====================

  function newGame() {
    state.moves = 0;
    state.history = [];
    state.isWon = false;
    hideWinScreen();
    generateSolvablePuzzle();
    renderBoard();
    updateUI();
    ToolsCommon.Toast.show('New puzzle generated!', 'success');
  }

  function resetGame() {
    if (!state.initialBoard || state.initialBoard.length === 0) {
      ToolsCommon.Toast.show('Nothing to reset', 'info');
      return;
    }

    state.board = JSON.parse(JSON.stringify(state.initialBoard));
    state.moves = 0;
    state.history = [];
    state.isWon = false;
    hideWinScreen();
    renderBoard();
    updateUI();
    ToolsCommon.Toast.show('Puzzle reset to initial state!', 'info');
  }

  function undo() {
    if (state.history.length === 0) {
      ToolsCommon.Toast.show('Nothing to undo', 'info');
      return;
    }

    state.board = state.history.pop();
    state.moves--;
    state.isWon = false;
    hideWinScreen();
    renderBoard();
    updateUI();
  }

  function nextLevel() {
    state.level++;
    newGame();
  }

  function setDifficulty(size) {
    state.size = size;
    state.level = 1;

    // Update button states
    elements.difficultyBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size) === size);
    });

    newGame();
  }

  // ==================== Storage ====================

  function saveBestMoves() {
    try {
      localStorage.setItem('entanglement-best', JSON.stringify(state.bestMoves));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function loadBestMoves() {
    try {
      const saved = localStorage.getItem('entanglement-best');
      if (saved) {
        state.bestMoves = JSON.parse(saved);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // ==================== Event Handlers ====================

  function handleTileClick(e) {
    if (state.isWon) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    toggleTileAndNeighbors(row, col);
  }

  function handleDifficultyClick(e) {
    const size = parseInt(e.target.dataset.size);
    if (size && size !== state.size) {
      setDifficulty(size);
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    if (state.isWon && e.key.toLowerCase() !== 'n') return;

    // Numpad support for 3x3
    if (state.size === 3) {
      const numpadMap = {
        '7': [0, 0], '8': [0, 1], '9': [0, 2],
        '4': [1, 0], '5': [1, 1], '6': [1, 2],
        '1': [2, 0], '2': [2, 1], '3': [2, 2]
      };

      if (numpadMap[e.key]) {
        e.preventDefault();
        const [row, col] = numpadMap[e.key];
        toggleTileAndNeighbors(row, col);
        return;
      }
    }

    switch (e.key.toLowerCase()) {
      case 'z':
        e.preventDefault();
        undo();
        break;
      case 'n':
        e.preventDefault();
        if (state.isWon) {
          nextLevel();
        } else {
          newGame();
        }
        break;
      case 'r':
        e.preventDefault();
        resetGame();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Load best moves
    loadBestMoves();

    // Start game
    generateSolvablePuzzle();
    renderBoard();
    updateUI();

    // Event listeners
    elements.undoBtn?.addEventListener('click', undo);
    elements.newGameBtn?.addEventListener('click', newGame);
    elements.nextLevelBtn?.addEventListener('click', nextLevel);

    elements.difficultyBtns.forEach(btn => {
      btn.addEventListener('click', handleDifficultyClick);
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
