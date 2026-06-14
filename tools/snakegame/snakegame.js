/**
 * KVSOVANREACH Snake Game
 * Classic snake arcade game
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    canvas: document.getElementById('gameCanvas'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    speedDisplay: document.getElementById('speedDisplay'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    newGameBtn: document.getElementById('newGameBtn'),
    gameOverlay: document.getElementById('gameOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayScore: document.getElementById('overlayScore'),
    overlayHighScore: document.getElementById('overlayHighScore'),
    restartBtn: document.getElementById('restartBtn'),
    startOverlay: document.getElementById('startOverlay'),
    startBtn: document.getElementById('startBtn'),
    pauseOverlay: document.getElementById('pauseOverlay')
  };

  const ctx = elements.canvas.getContext('2d');

  // ==================== State ====================
  const state = {
    gridSize: 20,
    cellSize: 0,
    canvasSize: 0,
    snake: [],
    food: null,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    highScore: 0,
    speed: 1,
    baseInterval: 150,
    intervalId: null,
    isRunning: false,
    isPaused: false,
    gameOver: false,
    started: false
  };

  // ==================== Initialization ====================

  function init() {
    loadHighScore();
    calculateCanvasSize();
    setupEvents();
    render();
  }

  function loadHighScore() {
    const key = `snake_highscore_${state.gridSize}`;
    state.highScore = parseInt(localStorage.getItem(key)) || 0;
    elements.bestDisplay.textContent = state.highScore;
  }

  function saveHighScore() {
    const key = `snake_highscore_${state.gridSize}`;
    localStorage.setItem(key, state.highScore);
  }

  function calculateCanvasSize() {
    const maxWidth = Math.min(500, window.innerWidth - 40);
    state.cellSize = Math.floor(maxWidth / state.gridSize);
    state.canvasSize = state.cellSize * state.gridSize;
    elements.canvas.width = state.canvasSize;
    elements.canvas.height = state.canvasSize;
    elements.canvas.style.width = state.canvasSize + 'px';
    elements.canvas.style.height = state.canvasSize + 'px';
  }

  function resetGame() {
    clearInterval(state.intervalId);
    state.intervalId = null;

    const mid = Math.floor(state.gridSize / 2);
    state.snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid }
    ];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.score = 0;
    state.speed = 1;
    state.isRunning = false;
    state.isPaused = false;
    state.gameOver = false;
    state.started = false;

    elements.scoreDisplay.textContent = '0';
    elements.speedDisplay.textContent = '1';
    elements.gameOverlay.classList.add('hidden');
    elements.pauseOverlay.classList.add('hidden');
    elements.startOverlay.classList.remove('hidden');

    spawnFood();
    render();
  }

  function startGame() {
    if (state.started) return;
    state.started = true;
    state.isRunning = true;
    elements.startOverlay.classList.add('hidden');
    startGameLoop();
  }

  function startGameLoop() {
    clearInterval(state.intervalId);
    const interval = Math.max(50, state.baseInterval - (state.speed - 1) * 10);
    state.intervalId = setInterval(gameStep, interval);
  }

  // ==================== Game Logic ====================

  function spawnFood() {
    const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
    const free = [];
    for (let x = 0; x < state.gridSize; x++) {
      for (let y = 0; y < state.gridSize; y++) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
      }
    }
    if (free.length === 0) {
      endGame(true);
      return;
    }
    state.food = free[Math.floor(Math.random() * free.length)];
  }

  function gameStep() {
    if (!state.isRunning || state.isPaused || state.gameOver) return;

    state.direction = { ...state.nextDirection };

    const head = state.snake[0];
    const newHead = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y
    };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= state.gridSize ||
        newHead.y < 0 || newHead.y >= state.gridSize) {
      endGame(false);
      return;
    }

    // Self collision
    for (let i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x === newHead.x && state.snake[i].y === newHead.y) {
        endGame(false);
        return;
      }
    }

    state.snake.unshift(newHead);

    // Eat food
    if (state.food && newHead.x === state.food.x && newHead.y === state.food.y) {
      state.score += 10;
      elements.scoreDisplay.textContent = state.score;

      // Update speed every 5 food items
      const newSpeed = Math.floor(state.score / 50) + 1;
      if (newSpeed !== state.speed) {
        state.speed = newSpeed;
        elements.speedDisplay.textContent = state.speed;
        startGameLoop();
      }

      // Update high score
      if (state.score > state.highScore) {
        state.highScore = state.score;
        elements.bestDisplay.textContent = state.highScore;
        saveHighScore();
      }

      spawnFood();
    } else {
      state.snake.pop();
    }

    render();
  }

  function endGame(won) {
    state.gameOver = true;
    state.isRunning = false;
    clearInterval(state.intervalId);
    state.intervalId = null;

    elements.overlayTitle.textContent = won ? 'You Win!' : 'Game Over!';
    elements.overlayScore.textContent = 'Score: ' + state.score;

    if (state.score >= state.highScore && state.score > 0) {
      elements.overlayHighScore.textContent = 'New High Score!';
    } else {
      elements.overlayHighScore.textContent = 'Best: ' + state.highScore;
    }

    elements.gameOverlay.classList.remove('hidden');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(won ? 'You filled the entire board!' : 'Game over! Score: ' + state.score, won ? 'success' : 'error');
    }
  }

  function togglePause() {
    if (state.gameOver || !state.started) return;

    state.isPaused = !state.isPaused;

    if (state.isPaused) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      elements.pauseOverlay.classList.remove('hidden');
    } else {
      elements.pauseOverlay.classList.add('hidden');
      startGameLoop();
    }
  }

  // ==================== Rendering ====================

  function render() {
    const cs = state.cellSize;
    const size = state.canvasSize;

    // Get CSS vars for theming
    const styles = getComputedStyle(document.documentElement);
    const isDark = document.body.classList.contains('dark-mode') ||
                   document.documentElement.getAttribute('data-theme') === 'dark';

    const bgColor = isDark ? '#1a1a2e' : '#f0f4f0';
    const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const foodColor = '#ef4444';
    const headColor = '#91214E';
    const tailColor = '#c4567a';

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= state.gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cs, 0);
      ctx.lineTo(i * cs, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cs);
      ctx.lineTo(size, i * cs);
      ctx.stroke();
    }

    // Food
    if (state.food) {
      const fx = state.food.x * cs + cs / 2;
      const fy = state.food.y * cs + cs / 2;
      const fr = cs * 0.4;

      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();

      // Food glow
      ctx.shadowColor = foodColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(fx, fy, fr * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Snake body with gradient
    const len = state.snake.length;
    for (let i = len - 1; i >= 0; i--) {
      const seg = state.snake[i];
      const t = len > 1 ? i / (len - 1) : 0;

      // Gradient from tail color to head color
      const r = Math.round(lerp(parseInt(tailColor.slice(1, 3), 16), parseInt(headColor.slice(1, 3), 16), t));
      const g = Math.round(lerp(parseInt(tailColor.slice(3, 5), 16), parseInt(headColor.slice(3, 5), 16), t));
      const b = Math.round(lerp(parseInt(tailColor.slice(5, 7), 16), parseInt(headColor.slice(5, 7), 16), t));

      const color = `rgb(${r},${g},${b})`;
      const padding = 1;
      const radius = i === 0 ? cs * 0.35 : cs * 0.25;

      ctx.fillStyle = color;
      roundRect(ctx,
        seg.x * cs + padding,
        seg.y * cs + padding,
        cs - padding * 2,
        cs - padding * 2,
        radius
      );
      ctx.fill();
    }

    // Snake eyes (on head)
    if (state.snake.length > 0) {
      const head = state.snake[0];
      const hx = head.x * cs + cs / 2;
      const hy = head.y * cs + cs / 2;
      const eyeR = cs * 0.08;
      const eyeOff = cs * 0.18;

      ctx.fillStyle = '#fff';

      let e1x, e1y, e2x, e2y;
      if (state.direction.x === 1) {
        e1x = hx + eyeOff; e1y = hy - eyeOff;
        e2x = hx + eyeOff; e2y = hy + eyeOff;
      } else if (state.direction.x === -1) {
        e1x = hx - eyeOff; e1y = hy - eyeOff;
        e2x = hx - eyeOff; e2y = hy + eyeOff;
      } else if (state.direction.y === -1) {
        e1x = hx - eyeOff; e1y = hy - eyeOff;
        e2x = hx + eyeOff; e2y = hy - eyeOff;
      } else {
        e1x = hx - eyeOff; e1y = hy + eyeOff;
        e2x = hx + eyeOff; e2y = hy + eyeOff;
      }

      ctx.beginPath();
      ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ==================== Event Handling ====================

  function setupEvents() {
    // Keyboard
    document.addEventListener('keydown', function(e) {
      const key = e.key;

      // Direction keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        if (!state.started) {
          startGame();
        }
        setDirection(key);
        return;
      }

      if (key === ' ') {
        e.preventDefault();
        if (state.started && !state.gameOver) {
          togglePause();
        }
        return;
      }

      if (key === 'n' || key === 'N') {
        if (!e.ctrlKey && !e.metaKey) {
          resetGame();
        }
        return;
      }
    });

    // Size buttons
    elements.sizeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const size = parseInt(this.dataset.size);
        if (size === state.gridSize) return;

        elements.sizeBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        state.gridSize = size;
        calculateCanvasSize();
        loadHighScore();
        resetGame();
      });
    });

    // Buttons
    elements.newGameBtn.addEventListener('click', resetGame);
    elements.restartBtn.addEventListener('click', resetGame);
    elements.startBtn.addEventListener('click', startGame);

    // Touch / swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    elements.canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    }, { passive: false });

    elements.canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      if (e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const dt = Date.now() - touchStartTime;

      // Minimum swipe distance and max time
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        // Tap - start game if not started
        if (!state.started) startGame();
        return;
      }

      if (dt > 500) return;

      if (!state.started) startGame();

      if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
      } else {
        setDirection(dy > 0 ? 'ArrowDown' : 'ArrowUp');
      }
    }, { passive: false });

    // Resize
    window.addEventListener('resize', function() {
      calculateCanvasSize();
      render();
    });
  }

  function setDirection(key) {
    const dir = state.direction;
    switch (key) {
      case 'ArrowUp': case 'w':
        if (dir.y !== 1) state.nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown': case 's':
        if (dir.y !== -1) state.nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft': case 'a':
        if (dir.x !== 1) state.nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight': case 'd':
        if (dir.x !== -1) state.nextDirection = { x: 1, y: 0 };
        break;
    }
  }

  // ==================== Start ====================
  init();
})();
