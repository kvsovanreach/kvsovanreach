/**
 * KVSOVANREACH Maze Runner
 * CSS 3D maze navigation game
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const CELL_SIZE = 40;
  const DIRECTIONS = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
  };
  const DIR_DELTAS = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }  // West
  ];

  // ==================== State ====================
  const state = {
    maze: [],
    size: 7,
    player: { x: 1, y: 1, dir: DIRECTIONS.SOUTH },
    exit: { x: 5, y: 5 },
    level: 1,
    steps: 0,
    startTime: null,
    elapsedTime: 0,
    pausedTime: 0, // Time accumulated when paused
    timerInterval: null,
    visited: new Set(),
    isWon: false,
    isPaused: false,
    view: '3d',
    bestScores: {}
  };

  // ==================== DOM Elements ====================
  const elements = {
    mazeScene: document.getElementById('mazeScene'),
    mazeViewport: document.getElementById('mazeViewport'),
    minimap: document.getElementById('minimap'),
    levelDisplay: document.getElementById('levelDisplay'),
    stepsDisplay: document.getElementById('stepsDisplay'),
    timeDisplay: document.getElementById('timeDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    winOverlay: document.getElementById('winOverlay'),
    winTime: document.getElementById('winTime'),
    winSteps: document.getElementById('winSteps'),
    newMazeBtn: document.getElementById('newMazeBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    viewBtns: document.querySelectorAll('.view-btn'),
    controlBtns: document.querySelectorAll('.control-btn')
  };

  // ==================== Maze Generation (DFS) ====================

  function generateMaze() {
    const size = state.size;
    // Initialize maze with all walls
    state.maze = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push(1); // 1 = wall
      }
      state.maze.push(row);
    }

    // DFS to carve paths
    const stack = [];
    const startX = 1;
    const startY = 1;
    state.maze[startY][startX] = 0; // 0 = path
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current.x, current.y);

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Remove wall between current and next
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        state.maze[wallY][wallX] = 0;
        state.maze[next.y][next.x] = 0;
        stack.push(next);
      }
    }

    // Set exit position (bottom-right area)
    state.exit.x = size - 2;
    state.exit.y = size - 2;
    state.maze[state.exit.y][state.exit.x] = 2; // 2 = exit
  }

  function getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const size = state.size;

    // Check all 4 directions (2 cells away)
    const directions = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 }
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1) {
        if (state.maze[ny][nx] === 1) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }

    return neighbors;
  }

  // ==================== 3D Rendering ====================

  function render3DView() {
    elements.mazeScene.innerHTML = '';

    const viewDistance = 4;
    const { x: px, y: py, dir } = state.player;

    // Render walls in view
    for (let depth = 0; depth < viewDistance; depth++) {
      const distance = depth + 1;
      const scale = 1 / distance;
      const wallHeight = 200 * scale;
      const wallWidth = 300 * scale;

      // Calculate position in front of player
      const delta = DIR_DELTAS[dir];
      const lookX = px + delta.dx * distance;
      const lookY = py + delta.dy * distance;

      // Check for wall ahead
      if (isWall(lookX, lookY)) {
        createWall('front', depth, wallWidth, wallHeight, distance);
        break; // Can't see past front wall
      }

      // Check for exit
      if (state.maze[lookY]?.[lookX] === 2) {
        createExit(depth, wallWidth, wallHeight, distance);
      }

      // Left and right walls
      const leftDir = (dir + 3) % 4;
      const rightDir = (dir + 1) % 4;
      const leftDelta = DIR_DELTAS[leftDir];
      const rightDelta = DIR_DELTAS[rightDir];

      const leftX = lookX + leftDelta.dx;
      const leftY = lookY + leftDelta.dy;
      const rightX = lookX + rightDelta.dx;
      const rightY = lookY + rightDelta.dy;

      if (isWall(leftX, leftY)) {
        createWall('left', depth, wallHeight * 0.5, wallHeight, distance);
      }

      if (isWall(rightX, rightY)) {
        createWall('right', depth, wallHeight * 0.5, wallHeight, distance);
      }
    }

    // Create floor
    createFloor();
  }

  function createWall(position, depth, width, height, distance) {
    const wall = document.createElement('div');
    wall.className = 'wall';

    const baseZ = -100 - (depth * 80);
    const opacity = Math.max(0.3, 1 - depth * 0.2);

    wall.style.width = `${width}px`;
    wall.style.height = `${height}px`;
    wall.style.opacity = opacity;

    switch (position) {
      case 'front':
        wall.style.left = `calc(50% - ${width / 2}px)`;
        wall.style.top = `calc(50% - ${height / 2}px)`;
        wall.style.transform = `translateZ(${baseZ}px)`;
        break;
      case 'left':
        wall.style.left = '0';
        wall.style.top = `calc(50% - ${height / 2}px)`;
        wall.style.transform = `translateZ(${baseZ}px) rotateY(90deg) translateZ(${width}px)`;
        break;
      case 'right':
        wall.style.right = '0';
        wall.style.top = `calc(50% - ${height / 2}px)`;
        wall.style.transform = `translateZ(${baseZ}px) rotateY(-90deg) translateZ(${width}px)`;
        break;
    }

    elements.mazeScene.appendChild(wall);
  }

  function createExit(depth, width, height, distance) {
    const exit = document.createElement('div');
    exit.className = 'exit';

    const baseZ = -100 - (depth * 80);
    const size = Math.min(width, height) * 0.6;

    exit.style.width = `${size}px`;
    exit.style.height = `${size}px`;
    exit.style.left = `calc(50% - ${size / 2}px)`;
    exit.style.top = `calc(50% - ${size / 2}px)`;
    exit.style.transform = `translateZ(${baseZ + 10}px)`;

    elements.mazeScene.appendChild(exit);
  }

  function createFloor() {
    const floor = document.createElement('div');
    floor.className = 'floor';
    floor.style.width = '400px';
    floor.style.height = '400px';
    floor.style.left = 'calc(50% - 200px)';
    floor.style.top = 'calc(50% + 100px)';
    floor.style.transform = 'rotateX(90deg) translateZ(-200px)';

    elements.mazeScene.appendChild(floor);
  }

  function isWall(x, y) {
    if (x < 0 || x >= state.size || y < 0 || y >= state.size) {
      return true;
    }
    return state.maze[y][x] === 1;
  }

  // ==================== Minimap Rendering ====================

  function renderMinimap() {
    elements.minimap.innerHTML = '';

    const cellSize = 100 / state.size;

    for (let y = 0; y < state.size; y++) {
      for (let x = 0; x < state.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'minimap-cell';
        cell.style.width = `${cellSize}%`;
        cell.style.height = `${cellSize}%`;
        cell.style.left = `${x * cellSize}%`;
        cell.style.top = `${y * cellSize}%`;

        if (state.maze[y][x] === 1) {
          cell.classList.add('wall');
        } else if (state.maze[y][x] === 2) {
          cell.classList.add('exit');
        } else {
          cell.classList.add('path');
          if (state.visited.has(`${x},${y}`)) {
            cell.classList.add('visited');
          }
        }

        // Player position
        if (x === state.player.x && y === state.player.y) {
          cell.classList.add('player');
        }

        elements.minimap.appendChild(cell);
      }
    }
  }

  // ==================== Player Movement ====================

  function moveForward() {
    if (state.isPaused) return;

    const delta = DIR_DELTAS[state.player.dir];
    const newX = state.player.x + delta.dx;
    const newY = state.player.y + delta.dy;

    if (!isWall(newX, newY)) {
      state.player.x = newX;
      state.player.y = newY;
      state.steps++;
      state.visited.add(`${newX},${newY}`);
      checkWin();
      updateView();
    }
  }

  function moveBackward() {
    if (state.isPaused) return;

    const delta = DIR_DELTAS[state.player.dir];
    const newX = state.player.x - delta.dx;
    const newY = state.player.y - delta.dy;

    if (!isWall(newX, newY)) {
      state.player.x = newX;
      state.player.y = newY;
      state.steps++;
      state.visited.add(`${newX},${newY}`);
      updateView();
    }
  }

  function turnLeft() {
    if (state.isPaused) return;
    state.player.dir = (state.player.dir + 3) % 4;
    updateView();
  }

  function turnRight() {
    if (state.isPaused) return;
    state.player.dir = (state.player.dir + 1) % 4;
    updateView();
  }

  function checkWin() {
    if (state.player.x === state.exit.x && state.player.y === state.exit.y) {
      state.isWon = true;
      stopTimer();
      showWinScreen();
    }
  }

  // ==================== Timer ====================

  function startTimer() {
    state.startTime = Date.now();
    state.timerInterval = setInterval(() => {
      if (!state.isPaused) {
        state.elapsedTime = Math.floor((Date.now() - state.startTime - state.pausedTime) / 1000);
        updateTimeDisplay();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function togglePause() {
    if (state.isWon) return;

    state.isPaused = !state.isPaused;

    if (state.isPaused) {
      state.pauseStartTime = Date.now();
      ToolsCommon.Toast.show('Game paused', 'info');
    } else {
      if (state.pauseStartTime) {
        state.pausedTime += Date.now() - state.pauseStartTime;
      }
      ToolsCommon.Toast.show('Game resumed', 'info');
    }
  }

  function updateTimeDisplay() {
    const minutes = Math.floor(state.elapsedTime / 60);
    const seconds = state.elapsedTime % 60;
    elements.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ==================== UI Updates ====================

  function updateView() {
    if (state.view === '3d') {
      render3DView();
    }
    renderMinimap();
    updateUI();
  }

  function updateUI() {
    elements.levelDisplay.textContent = state.level;
    elements.stepsDisplay.textContent = state.steps;

    const key = `level-${state.level}`;
    if (state.bestScores[key]) {
      elements.bestDisplay.textContent = state.bestScores[key];
    } else {
      elements.bestDisplay.textContent = '--';
    }
  }

  function setView(view) {
    state.view = view;

    elements.viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === '3d') {
      elements.mazeViewport.classList.remove('hidden');
      elements.minimap.classList.remove('show');
      render3DView();
    } else {
      elements.mazeViewport.classList.add('hidden');
      elements.minimap.classList.add('show');
      renderMinimap();
    }
  }

  function showWinScreen() {
    elements.winTime.textContent = formatTime(state.elapsedTime);
    elements.winSteps.textContent = state.steps;
    elements.winOverlay.classList.add('show');

    // Update best score
    const key = `level-${state.level}`;
    if (!state.bestScores[key] || state.steps < state.bestScores[key]) {
      state.bestScores[key] = state.steps;
      saveBestScores();
      ToolsCommon.Toast.show('New best score!', 'success');
    }

    updateUI();
  }

  function hideWinScreen() {
    elements.winOverlay.classList.remove('show');
  }

  // ==================== Game Actions ====================

  function newMaze() {
    stopTimer();
    state.isWon = false;
    state.isPaused = false;
    state.steps = 0;
    state.elapsedTime = 0;
    state.pausedTime = 0;
    state.visited.clear();

    // Increase size with level
    state.size = 7 + Math.floor(state.level / 3) * 2;
    if (state.size > 15) state.size = 15;

    // Reset player position
    state.player = { x: 1, y: 1, dir: DIRECTIONS.SOUTH };

    generateMaze();
    state.visited.add(`${state.player.x},${state.player.y}`);

    hideWinScreen();
    updateView();
    updateTimeDisplay();
    startTimer();

    ToolsCommon.Toast.show('New maze generated!', 'success');
  }

  function nextLevel() {
    state.level++;
    newMaze();
  }

  // ==================== Storage ====================

  function saveBestScores() {
    try {
      localStorage.setItem('mazerunner-best', JSON.stringify(state.bestScores));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function loadBestScores() {
    try {
      const saved = localStorage.getItem('mazerunner-best');
      if (saved) {
        state.bestScores = JSON.parse(saved);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // ==================== Event Handlers ====================

  function handleControlClick(e) {
    if (state.isWon) return;

    const dir = e.target.closest('.control-btn')?.dataset.dir;
    if (!dir) return;

    switch (dir) {
      case 'forward':
        moveForward();
        break;
      case 'backward':
        moveBackward();
        break;
      case 'left':
        turnLeft();
        break;
      case 'right':
        turnRight();
        break;
    }
  }

  function handleViewClick(e) {
    const view = e.target.closest('.view-btn')?.dataset.view;
    if (view) {
      setView(view);
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        e.preventDefault();
        if (!state.isWon) moveForward();
        break;
      case 's':
      case 'arrowdown':
        e.preventDefault();
        if (!state.isWon) moveBackward();
        break;
      case 'a':
      case 'arrowleft':
        e.preventDefault();
        if (!state.isWon) turnLeft();
        break;
      case 'd':
      case 'arrowright':
        e.preventDefault();
        if (!state.isWon) turnRight();
        break;
      case 'm':
        e.preventDefault();
        setView(state.view === '3d' ? 'map' : '3d');
        break;
      case 'n':
        e.preventDefault();
        if (state.isWon) {
          nextLevel();
        } else {
          newMaze();
        }
        break;
      case 'p':
      case ' ':
        e.preventDefault();
        togglePause();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    loadBestScores();

    // Generate initial maze
    generateMaze();
    state.visited.add(`${state.player.x},${state.player.y}`);
    updateView();
    startTimer();

    // Event listeners
    elements.newMazeBtn?.addEventListener('click', newMaze);
    elements.nextLevelBtn?.addEventListener('click', nextLevel);

    elements.controlBtns.forEach(btn => {
      btn.addEventListener('click', handleControlClick);
    });

    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', handleViewClick);
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
