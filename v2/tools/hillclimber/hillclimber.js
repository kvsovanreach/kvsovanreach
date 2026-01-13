/**
 * KVSOVANREACH Hill Climber Game
 * Physics-based gradient descent puzzle
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const GAME_TIME = 10; // seconds
  const WIN_THRESHOLD = 15; // pixels from minimum to win
  const BALL_RADIUS = 12;
  const GRAVITY = 0.5;

  // ==================== State ====================
  const state = {
    canvas: null,
    ctx: null,
    terrain: [],
    ball: null,
    globalMinimum: { x: 0, y: 0 },
    isPlaying: false,
    isPaused: false,
    timeRemaining: GAME_TIME,
    bestScore: null,
    animationId: null,
    lastTime: 0,
    level: 1,
    totalWins: 0,

    // Physics parameters
    learningRate: 0.5,
    momentum: 0.9,
    friction: 0.02
  };

  // ==================== DOM Elements ====================
  const elements = {
    canvas: document.getElementById('gameCanvas'),
    overlay: document.getElementById('canvasOverlay'),
    gameMessage: document.getElementById('gameMessage'),
    timeDisplay: document.getElementById('timeDisplay'),
    targetDisplay: document.getElementById('targetDisplay'),
    heightDisplay: document.getElementById('heightDisplay'),
    bestScore: document.getElementById('bestScore'),
    newTerrainBtn: document.getElementById('newTerrainBtn'),
    resetBtn: document.getElementById('resetBtn'),
    learningRate: document.getElementById('learningRate'),
    learningRateValue: document.getElementById('learningRateValue'),
    momentum: document.getElementById('momentum'),
    momentumValue: document.getElementById('momentumValue'),
    friction: document.getElementById('friction'),
    frictionValue: document.getElementById('frictionValue')
  };

  // ==================== Terrain Generation ====================

  function generateTerrain() {
    const width = state.canvas.width;
    const height = state.canvas.height;
    state.terrain = [];

    // Generate random parameters for terrain function
    // More waves at higher levels = more local minima (harder)
    const numWaves = 3 + Math.floor(state.level / 2) + Math.floor(Math.random() * 2);
    const waves = [];

    for (let i = 0; i < numWaves; i++) {
      waves.push({
        amplitude: 30 + Math.random() * 60,
        frequency: 0.005 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Calculate terrain height at each x position
    let minY = Infinity;
    let minX = 0;

    for (let x = 0; x < width; x++) {
      let y = height * 0.5; // base height

      for (const wave of waves) {
        y += wave.amplitude * Math.sin(wave.frequency * x + wave.phase);
      }

      // Add some noise
      y += (Math.random() - 0.5) * 5;

      // Clamp y to canvas bounds
      y = Math.max(50, Math.min(height - 50, y));

      state.terrain.push({ x, y });

      // Track global minimum
      if (y > minY) { // In canvas, higher y means lower position
        minY = y;
        minX = x;
      }
    }

    state.globalMinimum = { x: minX, y: minY };

    // Update target display
    elements.targetDisplay.textContent = `Level ${state.level}`;
  }

  function getTerrainHeight(x) {
    if (x < 0 || x >= state.terrain.length) {
      return state.canvas.height * 0.5;
    }
    const index = Math.floor(x);
    const nextIndex = Math.min(index + 1, state.terrain.length - 1);
    const t = x - index;

    // Linear interpolation
    return state.terrain[index].y * (1 - t) + state.terrain[nextIndex].y * t;
  }

  function getTerrainSlope(x) {
    const delta = 2;
    const leftY = getTerrainHeight(x - delta);
    const rightY = getTerrainHeight(x + delta);
    return (rightY - leftY) / (2 * delta);
  }

  // ==================== Ball Physics ====================

  function createBall(x) {
    const y = getTerrainHeight(x) - BALL_RADIUS;
    state.ball = {
      x,
      y,
      vx: 0,
      vy: 0
    };
  }

  function updateBall(deltaTime) {
    if (!state.ball || !state.isPlaying || state.isPaused) return;

    const dt = Math.min(deltaTime / 1000, 0.033); // Cap delta time

    // Get slope at ball position
    const slope = getTerrainSlope(state.ball.x);

    // Calculate acceleration from slope (gradient descent)
    const acceleration = slope * GRAVITY * state.learningRate * 100;

    // Apply momentum
    state.ball.vx = state.ball.vx * state.momentum + acceleration;

    // Apply friction
    state.ball.vx *= (1 - state.friction);

    // Update position
    state.ball.x += state.ball.vx * dt * 60;

    // Clamp to canvas bounds
    state.ball.x = Math.max(BALL_RADIUS, Math.min(state.canvas.width - BALL_RADIUS, state.ball.x));

    // Update y position to follow terrain
    const terrainY = getTerrainHeight(state.ball.x);
    state.ball.y = terrainY - BALL_RADIUS;

    // Update height display
    const normalizedHeight = Math.round(state.canvas.height - terrainY);
    elements.heightDisplay.textContent = normalizedHeight;
  }

  // ==================== Rendering ====================

  function render() {
    const ctx = state.ctx;
    const width = state.canvas.width;
    const height = state.canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid();

    // Draw terrain
    drawTerrain();

    // Draw global minimum marker
    drawMinimumMarker();

    // Draw ball
    if (state.ball) {
      drawBall();
    }

    // Draw ball trail/path
    if (state.ball && state.isPlaying) {
      drawTrail();
    }
  }

  function drawGrid() {
    const ctx = state.ctx;
    const width = state.canvas.width;
    const height = state.canvas.height;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawTerrain() {
    const ctx = state.ctx;

    // Draw filled terrain
    ctx.beginPath();
    ctx.moveTo(0, state.canvas.height);

    for (const point of state.terrain) {
      ctx.lineTo(point.x, point.y);
    }

    ctx.lineTo(state.canvas.width, state.canvas.height);
    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, state.canvas.height);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw terrain line
    ctx.beginPath();
    ctx.moveTo(state.terrain[0].x, state.terrain[0].y);

    for (let i = 1; i < state.terrain.length; i++) {
      ctx.lineTo(state.terrain[i].x, state.terrain[i].y);
    }

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw glow effect
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function drawMinimumMarker() {
    const ctx = state.ctx;
    const { x, y } = state.globalMinimum;

    // Draw pulsing circle
    const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.2;

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 25 * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.fill();

    // Inner marker
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    // Target icon
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 15);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#22c55e';
    ctx.font = '12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MINIMUM', x, y + 35);
  }

  function drawBall() {
    const ctx = state.ctx;
    const { x, y } = state.ball;

    // Draw shadow
    ctx.beginPath();
    ctx.ellipse(x, getTerrainHeight(x) + 2, BALL_RADIUS * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Draw ball glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, BALL_RADIUS * 2);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball
    const ballGradient = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, BALL_RADIUS);
    ballGradient.addColorStop(0, '#ff6b6b');
    ballGradient.addColorStop(0.5, '#ef4444');
    ballGradient.addColorStop(1, '#dc2626');

    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ballGradient;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
  }

  let trailPoints = [];

  function drawTrail() {
    if (!state.ball) return;

    // Add current position to trail
    trailPoints.push({ x: state.ball.x, y: state.ball.y, time: Date.now() });

    // Remove old points (older than 2 seconds)
    const cutoff = Date.now() - 2000;
    trailPoints = trailPoints.filter(p => p.time > cutoff);

    // Draw trail
    if (trailPoints.length > 1) {
      const ctx = state.ctx;
      ctx.beginPath();
      ctx.moveTo(trailPoints[0].x, trailPoints[0].y);

      for (let i = 1; i < trailPoints.length; i++) {
        ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
      }

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ==================== Game Logic ====================

  function startGame() {
    if (state.isPlaying) return;

    state.isPlaying = true;
    state.isPaused = false;
    state.timeRemaining = GAME_TIME;
    state.lastTime = performance.now();
    trailPoints = [];

    elements.overlay.classList.add('hidden');
    hideMessage();

    gameLoop();
  }

  function pauseGame() {
    state.isPaused = !state.isPaused;
    if (!state.isPaused) {
      state.lastTime = performance.now();
      gameLoop();
    }
  }

  function endGame(won) {
    state.isPlaying = false;

    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
    }

    if (won) {
      const score = state.timeRemaining.toFixed(1);
      state.totalWins++;

      // Update best score
      if (state.bestScore === null || state.timeRemaining > state.bestScore) {
        state.bestScore = state.timeRemaining;
        elements.bestScore.textContent = `${state.bestScore.toFixed(1)}s`;
        ToolsCommon.Toast.show('New best time!', 'success');
      }

      showMessage(`LEVEL ${state.level} COMPLETE! Time: ${score}s`, 'win');

      // Auto-advance to next level after delay
      setTimeout(() => {
        state.level++;
        newTerrain();
        ToolsCommon.Toast.show(`Level ${state.level} - More challenging terrain!`, 'info');
      }, 2000);
    } else {
      showMessage(`TIME UP! Level ${state.level}`, 'lose');
    }
  }

  function checkWinCondition() {
    if (!state.ball) return false;

    const distance = Math.abs(state.ball.x - state.globalMinimum.x);
    const speed = Math.abs(state.ball.vx);

    // Win if near minimum and moving slowly
    return distance < WIN_THRESHOLD && speed < 2;
  }

  function gameLoop(currentTime = performance.now()) {
    if (!state.isPlaying || state.isPaused) return;

    const deltaTime = currentTime - state.lastTime;
    state.lastTime = currentTime;

    // Update timer
    state.timeRemaining -= deltaTime / 1000;
    elements.timeDisplay.textContent = `${Math.max(0, state.timeRemaining).toFixed(1)}s`;

    // Check time up
    if (state.timeRemaining <= 0) {
      endGame(false);
      return;
    }

    // Update ball physics
    updateBall(deltaTime);

    // Check win condition
    if (checkWinCondition()) {
      endGame(true);
      return;
    }

    // Render
    render();

    // Continue loop
    state.animationId = requestAnimationFrame(gameLoop);
  }

  function resetBall() {
    state.ball = null;
    state.isPlaying = false;
    state.isPaused = false;
    state.timeRemaining = GAME_TIME;
    trailPoints = [];

    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
    }

    elements.overlay.classList.remove('hidden');
    elements.timeDisplay.textContent = `${GAME_TIME}.0s`;
    elements.heightDisplay.textContent = '--';
    hideMessage();

    render();
  }

  function newTerrain(resetLevel = false) {
    if (resetLevel) {
      state.level = 1;
    }
    generateTerrain();
    resetBall();
    elements.targetDisplay.textContent = `Level ${state.level}`;
    ToolsCommon.Toast.show(`Level ${state.level} terrain generated!`, 'success');
  }

  function showMessage(text, type) {
    elements.gameMessage.textContent = text;
    elements.gameMessage.className = `game-message show ${type}`;
  }

  function hideMessage() {
    elements.gameMessage.className = 'game-message';
  }

  // ==================== Event Handlers ====================

  function handleCanvasClick(e) {
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    // Clamp x to valid range
    const clampedX = Math.max(BALL_RADIUS, Math.min(state.canvas.width - BALL_RADIUS, x));

    createBall(clampedX);
    startGame();
  }

  function handleSliderChange(e) {
    const { id, value } = e.target;

    switch (id) {
      case 'learningRate':
        state.learningRate = parseFloat(value);
        elements.learningRateValue.textContent = value;
        break;
      case 'momentum':
        state.momentum = parseFloat(value);
        elements.momentumValue.textContent = value;
        break;
      case 'friction':
        state.friction = parseFloat(value);
        elements.frictionValue.textContent = value;
        break;
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        if (state.isPlaying) {
          pauseGame();
        }
        break;
      case 'r':
        e.preventDefault();
        resetBall();
        break;
      case 'n':
        e.preventDefault();
        newTerrain(true);
        break;
    }
  }

  function handleResize() {
    const container = elements.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    state.canvas.width = rect.width;
    state.canvas.height = rect.height;

    // Regenerate terrain for new size
    generateTerrain();

    if (state.ball) {
      // Clamp ball position
      state.ball.x = Math.max(BALL_RADIUS, Math.min(state.canvas.width - BALL_RADIUS, state.ball.x));
      state.ball.y = getTerrainHeight(state.ball.x) - BALL_RADIUS;
    }

    render();
  }

  // ==================== Initialization ====================

  function init() {
    // Setup canvas
    state.canvas = elements.canvas;
    state.ctx = state.canvas.getContext('2d');

    // Initial resize
    handleResize();

    // Event listeners
    elements.canvas.addEventListener('click', handleCanvasClick);
    elements.newTerrainBtn?.addEventListener('click', () => newTerrain(true));
    elements.resetBtn?.addEventListener('click', resetBall);

    // Sliders
    elements.learningRate?.addEventListener('input', handleSliderChange);
    elements.momentum?.addEventListener('input', handleSliderChange);
    elements.friction?.addEventListener('input', handleSliderChange);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Resize handler
    window.addEventListener('resize', handleResize);

    // Initial render
    render();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
