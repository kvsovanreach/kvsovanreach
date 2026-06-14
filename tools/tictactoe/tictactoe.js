/**
 * Tic Tac Toe - Script
 * Player vs AI (minimax) or Player vs Player
 */
(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameOver: false,
    mode: 'ai',         // 'ai' or 'pvp'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    scores: { X: 0, O: 0, draw: 0 },
    winCombo: null,
    aiThinking: false
  };

  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]              // diags
  ];

  // Numpad-style mapping: 1=bottom-left(6), 2=bottom-mid(7), 3=bottom-right(8),
  // 4=mid-left(3), 5=center(4), 6=mid-right(5), 7=top-left(0), 8=top-mid(1), 9=top-right(2)
  const KEY_MAP = {
    '7': 0, '8': 1, '9': 2,
    '4': 3, '5': 4, '6': 5,
    '1': 6, '2': 7, '3': 8
  };

  // ==================== DOM ====================
  const cells = document.querySelectorAll('.ttt-cell');
  const boardEl = document.getElementById('board');
  const statusText = document.getElementById('statusText');
  const xScoreEl = document.getElementById('xScore');
  const oScoreEl = document.getElementById('oScore');
  const drawScoreEl = document.getElementById('drawScore');
  const xLabelEl = document.getElementById('xLabel');
  const oLabelEl = document.getElementById('oLabel');
  const restartBtn = document.getElementById('restartBtn');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const diffButtons = document.querySelectorAll('.diff-btn');
  const diffGroup = document.getElementById('difficultyGroup');
  const winLineSvg = document.getElementById('winLineSvg');
  const winLine = document.getElementById('winLine');

  // ==================== Init ====================
  function init() {
    loadScores();
    updateScoreDisplay();
    updateLabels();
    bindEvents();
    resetBoard();
  }

  function bindEvents() {
    cells.forEach(cell => {
      cell.addEventListener('click', () => handleCellClick(parseInt(cell.dataset.index)));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick(parseInt(cell.dataset.index));
        }
      });
    });

    restartBtn.addEventListener('click', resetBoard);

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        diffGroup.style.display = state.mode === 'ai' ? '' : 'none';
        updateLabels();
        resetBoard();
      });
    });

    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.difficulty = btn.dataset.diff;
        resetBoard();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetBoard();
        return;
      }

      if (KEY_MAP.hasOwnProperty(e.key)) {
        e.preventDefault();
        handleCellClick(KEY_MAP[e.key]);
      }
    });
  }

  // ==================== Game Logic ====================
  function handleCellClick(index) {
    if (state.gameOver || state.board[index] !== null || state.aiThinking) return;

    makeMove(index, state.currentPlayer);

    if (state.gameOver) return;

    if (state.mode === 'ai' && state.currentPlayer === 'O') {
      state.aiThinking = true;
      setTimeout(() => {
        const aiMove = getAIMove();
        if (aiMove !== -1) {
          makeMove(aiMove, 'O');
        }
        state.aiThinking = false;
      }, 250);
    }
  }

  function makeMove(index, player) {
    state.board[index] = player;
    renderCell(index, player);

    const winner = checkWinner();
    if (winner) {
      state.gameOver = true;
      state.winCombo = winner.combo;
      highlightWin(winner.combo);
      drawWinLine(winner.combo);

      if (winner.player === 'X') {
        state.scores.X++;
        if (state.mode === 'ai') {
          setStatus('You win!', 'win');
        } else {
          setStatus('Player X wins!', 'win');
        }
      } else {
        state.scores.O++;
        if (state.mode === 'ai') {
          setStatus('AI wins!', 'lose');
        } else {
          setStatus('Player O wins!', 'win');
        }
      }
      saveScores();
      updateScoreDisplay();
      return;
    }

    if (state.board.every(c => c !== null)) {
      state.gameOver = true;
      state.scores.draw++;
      setStatus("It's a draw!", 'draw');
      saveScores();
      updateScoreDisplay();
      return;
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
  }

  function checkWinner() {
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
        return { player: state.board[a], combo };
      }
    }
    return null;
  }

  function resetBoard() {
    state.board = Array(9).fill(null);
    state.currentPlayer = 'X';
    state.gameOver = false;
    state.winCombo = null;
    state.aiThinking = false;

    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'x-mark', 'o-mark', 'winning');
    });

    winLine.classList.remove('animate');
    winLine.setAttribute('x1', 0);
    winLine.setAttribute('y1', 0);
    winLine.setAttribute('x2', 0);
    winLine.setAttribute('y2', 0);

    updateStatus();
  }

  // ==================== AI ====================
  function getAIMove() {
    const available = state.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
    if (available.length === 0) return -1;

    if (state.difficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }

    if (state.difficulty === 'medium') {
      if (Math.random() < 0.5) {
        return available[Math.floor(Math.random() * available.length)];
      }
      return getBestMove();
    }

    // hard: always minimax
    return getBestMove();
  }

  function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (state.board[i] === null) {
        state.board[i] = 'O';
        const score = minimax(state.board, 0, false);
        state.board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(board, depth, isMaximizing) {
    const winner = checkWinnerBoard(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(c => c !== null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          best = Math.max(best, minimax(board, depth + 1, false));
          board[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          best = Math.min(best, minimax(board, depth + 1, true));
          board[i] = null;
        }
      }
      return best;
    }
  }

  function checkWinnerBoard(board) {
    for (const [a, b, c] of WIN_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  // ==================== Rendering ====================
  function renderCell(index, player) {
    const cell = cells[index];
    cell.classList.add('taken', player === 'X' ? 'x-mark' : 'o-mark');

    const mark = document.createElement('div');
    mark.className = 'mark';

    if (player === 'X') {
      mark.innerHTML = `<svg class="mark-x" viewBox="0 0 50 50">
        <line x1="10" y1="10" x2="40" y2="40" />
        <line x1="40" y1="10" x2="10" y2="40" />
      </svg>`;
    } else {
      mark.innerHTML = `<svg class="mark-o" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="15" />
      </svg>`;
    }

    cell.appendChild(mark);
  }

  function highlightWin(combo) {
    combo.forEach(index => {
      cells[index].classList.add('winning');
    });
  }

  function drawWinLine(combo) {
    const [a, , c] = combo;
    const cellA = cells[a];
    const cellC = cells[c];
    const boardRect = boardEl.getBoundingClientRect();
    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();

    const x1 = ((rectA.left + rectA.width / 2) - boardRect.left) / boardRect.width * 300;
    const y1 = ((rectA.top + rectA.height / 2) - boardRect.top) / boardRect.height * 300;
    const x2 = ((rectC.left + rectC.width / 2) - boardRect.left) / boardRect.width * 300;
    const y2 = ((rectC.top + rectC.height / 2) - boardRect.top) / boardRect.height * 300;

    winLine.setAttribute('x1', x1);
    winLine.setAttribute('y1', y1);
    winLine.setAttribute('x2', x2);
    winLine.setAttribute('y2', y2);
    winLine.classList.add('animate');
  }

  function updateStatus() {
    if (state.mode === 'ai') {
      if (state.currentPlayer === 'X') {
        setStatus('Your turn (X)');
      } else {
        setStatus('AI is thinking...');
      }
    } else {
      setStatus(`Player ${state.currentPlayer}'s turn`);
    }
  }

  function setStatus(text, type) {
    statusText.textContent = text;
    statusText.className = 'ttt-status';
    if (type) statusText.classList.add(type);
  }

  function updateLabels() {
    if (state.mode === 'ai') {
      xLabelEl.textContent = 'You (X)';
      oLabelEl.textContent = 'AI (O)';
    } else {
      xLabelEl.textContent = 'Player X';
      oLabelEl.textContent = 'Player O';
    }
  }

  function updateScoreDisplay() {
    xScoreEl.textContent = state.scores.X;
    oScoreEl.textContent = state.scores.O;
    drawScoreEl.textContent = state.scores.draw;
  }

  // ==================== Persistence ====================
  function saveScores() {
    try {
      localStorage.setItem('ttt_scores', JSON.stringify(state.scores));
    } catch (e) { /* ignore */ }
  }

  function loadScores() {
    try {
      const saved = localStorage.getItem('ttt_scores');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.scores.X = parsed.X || 0;
        state.scores.O = parsed.O || 0;
        state.scores.draw = parsed.draw || 0;
      }
    } catch (e) { /* ignore */ }
  }

  // ==================== Start ====================
  init();
})();
