/**
 * KVSOVANREACH Slide Puzzle
 * Sliding number/image puzzle
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    board: document.getElementById('puzzleBoard'),
    movesDisplay: document.getElementById('movesDisplay'),
    timerDisplay: document.getElementById('timerDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    hintBtn: document.getElementById('hintBtn'),
    winOverlay: document.getElementById('winOverlay'),
    winStats: document.getElementById('winStats'),
    winRecord: document.getElementById('winRecord'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    imageUploadRow: document.getElementById('imageUploadRow'),
    imageInput: document.getElementById('imageInput'),
    imageName: document.getElementById('imageName')
  };

  // ==================== State ====================
  const state = {
    size: 4,
    tiles: [],       // flat array: tiles[i] = number (0 = empty)
    emptyIndex: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isRunning: false,
    solved: false,
    mode: 'numbers', // 'numbers' or 'image'
    imageData: null,  // base64 image
    tileImages: [],   // canvas data URLs per tile
    bestMoves: null,
    bestTime: null
  };

  // ==================== Initialization ====================

  function init() {
    loadBest();
    createBoard();
    shuffleBoard();
    setupEvents();
  }

  function loadBest() {
    const key = `slidepuzzle_best_${state.size}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.bestMoves = data.moves;
        state.bestTime = data.time;
        elements.bestDisplay.textContent = data.moves + 'm';
      } catch(e) {
        state.bestMoves = null;
        state.bestTime = null;
        elements.bestDisplay.textContent = '--';
      }
    } else {
      state.bestMoves = null;
      state.bestTime = null;
      elements.bestDisplay.textContent = '--';
    }
  }

  function saveBest() {
    const key = `slidepuzzle_best_${state.size}`;
    const data = { moves: state.moves, time: state.timer };
    // Save if no best or better than current best
    if (state.bestMoves === null || state.moves < state.bestMoves ||
        (state.moves === state.bestMoves && state.timer < state.bestTime)) {
      localStorage.setItem(key, JSON.stringify(data));
      state.bestMoves = state.moves;
      state.bestTime = state.timer;
      elements.bestDisplay.textContent = state.moves + 'm';
      return true;
    }
    return false;
  }

  // ==================== Board Creation ====================

  function createBoard() {
    const n = state.size;
    const total = n * n;

    // Set grid
    const maxWidth = Math.min(400, window.innerWidth - 48);
    const tileSize = Math.floor((maxWidth - (n + 1) * 4) / n);
    const boardSize = tileSize * n + (n + 1) * 4;

    elements.board.style.gridTemplateColumns = `repeat(${n}, ${tileSize}px)`;
    elements.board.style.gridTemplateRows = `repeat(${n}, ${tileSize}px)`;
    elements.board.style.width = boardSize + 'px';
    elements.board.style.height = boardSize + 'px';

    // Create solved state
    state.tiles = [];
    for (let i = 1; i < total; i++) state.tiles.push(i);
    state.tiles.push(0);
    state.emptyIndex = total - 1;

    renderBoard(tileSize);
  }

  function renderBoard(tileSize) {
    elements.board.innerHTML = '';
    const n = state.size;

    if (!tileSize) {
      const maxWidth = Math.min(400, window.innerWidth - 48);
      tileSize = Math.floor((maxWidth - (n + 1) * 4) / n);
    }

    for (let i = 0; i < state.tiles.length; i++) {
      const val = state.tiles[i];
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile' + (val === 0 ? ' empty' : '');
      tile.dataset.index = i;

      if (val !== 0) {
        if (state.mode === 'image' && state.tileImages.length > 0) {
          tile.classList.add('image-tile');
          tile.style.backgroundImage = `url(${state.tileImages[val - 1]})`;
          tile.style.backgroundSize = `${tileSize * n}px ${tileSize * n}px`;
          const origRow = Math.floor((val - 1) / n);
          const origCol = (val - 1) % n;
          tile.style.backgroundPosition = `-${origCol * tileSize}px -${origRow * tileSize}px`;
        } else {
          tile.textContent = val;
        }

        // Check if tile is in correct position
        if (val === i + 1) {
          tile.classList.add('correct');
        }

        tile.addEventListener('click', function() {
          moveTile(parseInt(this.dataset.index));
        });
      }

      elements.board.appendChild(tile);
    }
  }

  // ==================== Shuffle ====================

  function shuffleBoard() {
    stopTimer();
    state.moves = 0;
    state.timer = 0;
    state.isRunning = false;
    state.solved = false;
    elements.movesDisplay.textContent = '0';
    elements.timerDisplay.textContent = '0:00';
    elements.winOverlay.classList.add('hidden');

    const n = state.size;
    const total = n * n;

    // Generate solvable puzzle by doing random moves from solved state
    state.tiles = [];
    for (let i = 1; i < total; i++) state.tiles.push(i);
    state.tiles.push(0);
    state.emptyIndex = total - 1;

    // Perform many random moves
    const numMoves = total * total * 4;
    for (let m = 0; m < numMoves; m++) {
      const neighbors = getMovableNeighbors(state.emptyIndex);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Swap
      state.tiles[state.emptyIndex] = state.tiles[pick];
      state.tiles[pick] = 0;
      state.emptyIndex = pick;
    }

    // Ensure not already solved
    if (isSolved()) {
      // Swap first two non-empty tiles
      const a = state.emptyIndex === 0 ? 1 : 0;
      const b = state.emptyIndex <= 1 ? 2 : 1;
      const tmp = state.tiles[a];
      state.tiles[a] = state.tiles[b];
      state.tiles[b] = tmp;
    }

    renderBoard();
  }

  function getMovableNeighbors(emptyIdx) {
    const n = state.size;
    const row = Math.floor(emptyIdx / n);
    const col = emptyIdx % n;
    const neighbors = [];

    if (row > 0) neighbors.push(emptyIdx - n);     // up
    if (row < n - 1) neighbors.push(emptyIdx + n);  // down
    if (col > 0) neighbors.push(emptyIdx - 1);      // left
    if (col < n - 1) neighbors.push(emptyIdx + 1);  // right

    return neighbors;
  }

  // ==================== Move Logic ====================

  function moveTile(index) {
    if (state.solved) return;
    if (state.tiles[index] === 0) return;

    const neighbors = getMovableNeighbors(state.emptyIndex);
    if (!neighbors.includes(index)) return;

    // Start timer on first move
    if (!state.isRunning) {
      state.isRunning = true;
      startTimer();
    }

    // Swap
    state.tiles[state.emptyIndex] = state.tiles[index];
    state.tiles[index] = 0;
    state.emptyIndex = index;

    state.moves++;
    elements.movesDisplay.textContent = state.moves;

    renderBoard();

    // Check win
    if (isSolved()) {
      handleWin();
    }
  }

  function moveByArrow(direction) {
    if (state.solved) return;

    const n = state.size;
    const emptyRow = Math.floor(state.emptyIndex / n);
    const emptyCol = state.emptyIndex % n;
    let targetIndex = -1;

    // Arrow key moves the tile INTO the gap
    // So ArrowUp means the tile below the gap moves up
    switch (direction) {
      case 'up':
        if (emptyRow < n - 1) targetIndex = state.emptyIndex + n;
        break;
      case 'down':
        if (emptyRow > 0) targetIndex = state.emptyIndex - n;
        break;
      case 'left':
        if (emptyCol < n - 1) targetIndex = state.emptyIndex + 1;
        break;
      case 'right':
        if (emptyCol > 0) targetIndex = state.emptyIndex - 1;
        break;
    }

    if (targetIndex >= 0) {
      moveTile(targetIndex);
    }
  }

  function isSolved() {
    for (let i = 0; i < state.tiles.length - 1; i++) {
      if (state.tiles[i] !== i + 1) return false;
    }
    return true;
  }

  // ==================== Win ====================

  function handleWin() {
    state.solved = true;
    state.isRunning = false;
    stopTimer();

    // Celebration animation
    const tiles = elements.board.querySelectorAll('.puzzle-tile:not(.empty)');
    tiles.forEach(function(tile, i) {
      setTimeout(function() {
        tile.classList.add('win-anim');
      }, i * 60);
    });

    const timeStr = formatTime(state.timer);
    elements.winStats.textContent = state.moves + ' moves in ' + timeStr;

    const isNewRecord = saveBest();
    elements.winRecord.textContent = isNewRecord ? 'New Record!' : '';

    setTimeout(function() {
      elements.winOverlay.classList.remove('hidden');
    }, tiles.length * 60 + 400);

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Puzzle solved in ' + state.moves + ' moves!', 'success');
    }
  }

  // ==================== Hint ====================

  function showHint() {
    if (state.solved) return;

    const neighbors = getMovableNeighbors(state.emptyIndex);
    const tiles = elements.board.querySelectorAll('.puzzle-tile');

    neighbors.forEach(function(idx) {
      if (tiles[idx]) {
        tiles[idx].classList.add('hint');
        setTimeout(function() {
          tiles[idx].classList.remove('hint');
        }, 1200);
      }
    });
  }

  // ==================== Timer ====================

  function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(function() {
      state.timer++;
      elements.timerDisplay.textContent = formatTime(state.timer);
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ==================== Image Mode ====================

  function processImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        state.imageData = e.target.result;
        elements.imageName.textContent = file.name;
        generateTileImages(img);
        shuffleBoard();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function generateTileImages(img) {
    const n = state.size;
    const total = n * n - 1;
    state.tileImages = [];

    // We use CSS background-position for image tiles, so just store the src
    // Actually, store nothing special - renderBoard handles it via background-position
    state.tileImages = new Array(total).fill(state.imageData);
  }

  // ==================== Events ====================

  function setupEvents() {
    // Keyboard
    document.addEventListener('keydown', function(e) {
      const key = e.key;

      if (key === 'ArrowUp') { e.preventDefault(); moveByArrow('up'); }
      else if (key === 'ArrowDown') { e.preventDefault(); moveByArrow('down'); }
      else if (key === 'ArrowLeft') { e.preventDefault(); moveByArrow('left'); }
      else if (key === 'ArrowRight') { e.preventDefault(); moveByArrow('right'); }
      else if ((key === 's' || key === 'S') && !e.ctrlKey && !e.metaKey) { shuffleBoard(); }
      else if ((key === 'h' || key === 'H') && !e.ctrlKey && !e.metaKey) { showHint(); }
    });

    // Size buttons
    elements.sizeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const size = parseInt(this.dataset.size);
        if (size === state.size) return;

        elements.sizeBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        state.size = size;
        loadBest();
        createBoard();

        // Regenerate tile images if in image mode
        if (state.mode === 'image' && state.imageData) {
          const img = new Image();
          img.onload = function() {
            generateTileImages(img);
            shuffleBoard();
          };
          img.src = state.imageData;
        } else {
          shuffleBoard();
        }
      });
    });

    // Mode buttons
    elements.modeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const mode = this.dataset.mode;
        if (mode === state.mode) return;

        elements.modeBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        state.mode = mode;

        if (mode === 'image') {
          elements.imageUploadRow.classList.remove('hidden');
        } else {
          elements.imageUploadRow.classList.add('hidden');
          state.tileImages = [];
        }

        renderBoard();
      });
    });

    // Image upload
    elements.imageInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        processImage(this.files[0]);
      }
    });

    // Buttons
    elements.shuffleBtn.addEventListener('click', shuffleBoard);
    elements.hintBtn.addEventListener('click', showHint);
    elements.playAgainBtn.addEventListener('click', shuffleBoard);

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;

    elements.board.addEventListener('touchstart', function(e) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    elements.board.addEventListener('touchend', function(e) {
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return; // tap, not swipe

      if (Math.abs(dx) > Math.abs(dy)) {
        moveByArrow(dx > 0 ? 'left' : 'right');
      } else {
        moveByArrow(dy > 0 ? 'up' : 'down');
      }
    }, { passive: true });

    // Resize
    window.addEventListener('resize', function() {
      createBoard();
      // Re-apply current state without re-shuffling
      renderBoard();
    });
  }

  // ==================== Start ====================
  init();
})();
