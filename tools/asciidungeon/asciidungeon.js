/**
 * KVSOVANREACH ASCII Dungeon
 * Text-based rogue-lite dungeon crawler
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const TILES = {
    WALL: '#',
    FLOOR: '.',
    PLAYER: '@',
    GOLD: '$',
    HEALTH: '+',
    STAIRS: '>',
    GOBLIN: 'G',
    SKELETON: 'S',
    ORC: 'O',
    DEMON: 'D'
  };

  const ENEMIES = {
    G: { name: 'Goblin', hp: 15, damage: 5, xp: 10 },
    S: { name: 'Skeleton', hp: 20, damage: 8, xp: 15 },
    O: { name: 'Orc', hp: 30, damage: 12, xp: 25 },
    D: { name: 'Demon', hp: 50, damage: 20, xp: 50 }
  };

  const MAP_WIDTH = 40;
  const MAP_HEIGHT = 20;

  // ==================== State ====================
  const state = {
    map: [],
    player: {
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      damage: 10,
      gold: 0,
      kills: 0
    },
    enemies: [],
    floor: 1,
    gameOver: false,
    messages: []
  };

  // ==================== DOM Elements ====================
  const elements = {
    dungeonDisplay: document.getElementById('dungeonDisplay'),
    healthDisplay: document.getElementById('healthDisplay'),
    healthFill: document.getElementById('healthFill'),
    goldDisplay: document.getElementById('goldDisplay'),
    floorDisplay: document.getElementById('floorDisplay'),
    killsDisplay: document.getElementById('killsDisplay'),
    messageLog: document.getElementById('messageLog'),
    gameOverlay: document.getElementById('gameOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayMessage: document.getElementById('overlayMessage'),
    finalFloor: document.getElementById('finalFloor'),
    finalGold: document.getElementById('finalGold'),
    finalKills: document.getElementById('finalKills'),
    newGameBtn: document.getElementById('newGameBtn'),
    restartBtn: document.getElementById('restartBtn'),
    controlBtns: document.querySelectorAll('.control-btn')
  };

  // ==================== Dungeon Generation ====================

  function generateDungeon() {
    // Initialize map with walls
    state.map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        row.push(TILES.WALL);
      }
      state.map.push(row);
    }

    // Generate rooms
    const rooms = [];
    const numRooms = 5 + Math.floor(state.floor / 2);
    const attempts = 100;

    for (let i = 0; i < attempts && rooms.length < numRooms; i++) {
      const roomWidth = 4 + Math.floor(Math.random() * 6);
      const roomHeight = 3 + Math.floor(Math.random() * 4);
      const roomX = 1 + Math.floor(Math.random() * (MAP_WIDTH - roomWidth - 2));
      const roomY = 1 + Math.floor(Math.random() * (MAP_HEIGHT - roomHeight - 2));

      const room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };

      // Check if room overlaps with existing rooms
      let overlaps = false;
      for (const existing of rooms) {
        if (roomsOverlap(room, existing)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        carveRoom(room);
        rooms.push(room);
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      connectRooms(rooms[i - 1], rooms[i]);
    }

    // Place player in first room
    const firstRoom = rooms[0];
    state.player.x = firstRoom.x + Math.floor(firstRoom.width / 2);
    state.player.y = firstRoom.y + Math.floor(firstRoom.height / 2);

    // Place stairs in last room
    const lastRoom = rooms[rooms.length - 1];
    const stairsX = lastRoom.x + Math.floor(lastRoom.width / 2);
    const stairsY = lastRoom.y + Math.floor(lastRoom.height / 2);
    state.map[stairsY][stairsX] = TILES.STAIRS;

    // Place items and enemies
    placeItems(rooms);
    placeEnemies(rooms);
  }

  function roomsOverlap(r1, r2) {
    return !(r1.x + r1.width + 1 < r2.x ||
             r2.x + r2.width + 1 < r1.x ||
             r1.y + r1.height + 1 < r2.y ||
             r2.y + r2.height + 1 < r1.y);
  }

  function carveRoom(room) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        state.map[y][x] = TILES.FLOOR;
      }
    }
  }

  function connectRooms(room1, room2) {
    const x1 = room1.x + Math.floor(room1.width / 2);
    const y1 = room1.y + Math.floor(room1.height / 2);
    const x2 = room2.x + Math.floor(room2.width / 2);
    const y2 = room2.y + Math.floor(room2.height / 2);

    // Random corridor direction
    if (Math.random() < 0.5) {
      carveHorizontalCorridor(x1, x2, y1);
      carveVerticalCorridor(y1, y2, x2);
    } else {
      carveVerticalCorridor(y1, y2, x1);
      carveHorizontalCorridor(x1, x2, y2);
    }
  }

  function carveHorizontalCorridor(x1, x2, y) {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    for (let x = start; x <= end; x++) {
      if (state.map[y][x] !== TILES.STAIRS) {
        state.map[y][x] = TILES.FLOOR;
      }
    }
  }

  function carveVerticalCorridor(y1, y2, x) {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let y = start; y <= end; y++) {
      if (state.map[y][x] !== TILES.STAIRS) {
        state.map[y][x] = TILES.FLOOR;
      }
    }
  }

  function placeItems(rooms) {
    // Place gold
    const numGold = 3 + state.floor;
    for (let i = 0; i < numGold; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const x = room.x + Math.floor(Math.random() * room.width);
      const y = room.y + Math.floor(Math.random() * room.height);
      if (state.map[y][x] === TILES.FLOOR) {
        state.map[y][x] = TILES.GOLD;
      }
    }

    // Place health potions
    const numHealth = 1 + Math.floor(state.floor / 3);
    for (let i = 0; i < numHealth; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const x = room.x + Math.floor(Math.random() * room.width);
      const y = room.y + Math.floor(Math.random() * room.height);
      if (state.map[y][x] === TILES.FLOOR) {
        state.map[y][x] = TILES.HEALTH;
      }
    }
  }

  function placeEnemies(rooms) {
    state.enemies = [];
    const numEnemies = 2 + state.floor;

    const enemyTypes = [TILES.GOBLIN];
    if (state.floor >= 2) enemyTypes.push(TILES.SKELETON);
    if (state.floor >= 4) enemyTypes.push(TILES.ORC);
    if (state.floor >= 7) enemyTypes.push(TILES.DEMON);

    for (let i = 0; i < numEnemies; i++) {
      // Don't place in first room
      const roomIndex = 1 + Math.floor(Math.random() * (rooms.length - 1));
      const room = rooms[roomIndex];
      const x = room.x + Math.floor(Math.random() * room.width);
      const y = room.y + Math.floor(Math.random() * room.height);

      if (state.map[y][x] === TILES.FLOOR) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const stats = ENEMIES[type];
        state.enemies.push({
          x,
          y,
          type,
          hp: stats.hp + (state.floor - 1) * 5,
          maxHp: stats.hp + (state.floor - 1) * 5,
          damage: stats.damage + (state.floor - 1) * 2,
          name: stats.name
        });
      }
    }
  }

  // ==================== Rendering ====================

  function render() {
    let output = '';

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        let char = state.map[y][x];
        let charClass = '';

        // Check if player is here
        if (x === state.player.x && y === state.player.y) {
          char = TILES.PLAYER;
          charClass = 'char-player';
        } else {
          // Check if enemy is here
          const enemy = state.enemies.find(e => e.x === x && e.y === y);
          if (enemy) {
            char = enemy.type;
            charClass = 'char-enemy';
          } else {
            // Regular tile
            switch (char) {
              case TILES.WALL:
                charClass = 'char-wall';
                break;
              case TILES.FLOOR:
                charClass = 'char-floor';
                break;
              case TILES.GOLD:
                charClass = 'char-gold';
                break;
              case TILES.HEALTH:
                charClass = 'char-health';
                break;
              case TILES.STAIRS:
                charClass = 'char-stairs';
                break;
            }
          }
        }

        if (charClass) {
          output += `<span class="${charClass}">${char}</span>`;
        } else {
          output += char;
        }
      }
      output += '\n';
    }

    elements.dungeonDisplay.innerHTML = output;
    updateUI();
  }

  function updateUI() {
    elements.healthDisplay.textContent = state.player.hp;
    elements.healthFill.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
    elements.goldDisplay.textContent = state.player.gold;
    elements.floorDisplay.textContent = state.floor;
    elements.killsDisplay.textContent = state.player.kills;
  }

  function renderMessages() {
    elements.messageLog.innerHTML = state.messages
      .slice(-5)
      .map((msg, i, arr) => {
        const isLast = i === arr.length - 1;
        return `<div class="message ${msg.type || ''}">${msg.text}</div>`;
      })
      .join('');
    elements.messageLog.scrollTop = elements.messageLog.scrollHeight;
  }

  function addMessage(text, type = '') {
    state.messages.push({ text, type });
    if (state.messages.length > 50) {
      state.messages.shift();
    }
    renderMessages();
  }

  // ==================== Player Actions ====================

  function movePlayer(dx, dy) {
    if (state.gameOver) return;

    const newX = state.player.x + dx;
    const newY = state.player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
      return;
    }

    // Check for wall
    if (state.map[newY][newX] === TILES.WALL) {
      return;
    }

    // Check for enemy
    const enemy = state.enemies.find(e => e.x === newX && e.y === newY);
    if (enemy) {
      attackEnemy(enemy);
      moveEnemies();
      render();
      return;
    }

    // Move player
    state.player.x = newX;
    state.player.y = newY;

    // Check tile effects
    checkTile();

    // Move enemies
    moveEnemies();

    render();
  }

  function checkTile() {
    const tile = state.map[state.player.y][state.player.x];

    switch (tile) {
      case TILES.GOLD:
        const goldAmount = 10 + Math.floor(Math.random() * 20) + state.floor * 5;
        state.player.gold += goldAmount;
        state.map[state.player.y][state.player.x] = TILES.FLOOR;
        addMessage(`You found ${goldAmount} gold!`, 'gold');
        break;

      case TILES.HEALTH:
        const healAmount = 20 + state.floor * 5;
        state.player.hp = Math.min(state.player.hp + healAmount, state.player.maxHp);
        state.map[state.player.y][state.player.x] = TILES.FLOOR;
        addMessage(`You restored ${healAmount} HP!`, 'heal');
        break;

      case TILES.STAIRS:
        nextFloor();
        break;
    }
  }

  function attackEnemy(enemy) {
    const damage = state.player.damage + Math.floor(Math.random() * 5);
    enemy.hp -= damage;
    addMessage(`You hit the ${enemy.name} for ${damage} damage!`, 'damage');

    if (enemy.hp <= 0) {
      state.enemies = state.enemies.filter(e => e !== enemy);
      state.player.kills++;
      addMessage(`You defeated the ${enemy.name}!`, 'info');
    }
  }

  function wait() {
    if (state.gameOver) return;
    addMessage('You wait...', 'info');
    moveEnemies();
    render();
  }

  // ==================== Enemy AI ====================

  function moveEnemies() {
    for (const enemy of state.enemies) {
      // Simple AI: move towards player if nearby
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const distance = Math.abs(dx) + Math.abs(dy);

      if (distance <= 8) {
        // Chase player
        let moveX = 0;
        let moveY = 0;

        if (Math.abs(dx) > Math.abs(dy)) {
          moveX = dx > 0 ? 1 : -1;
        } else if (dy !== 0) {
          moveY = dy > 0 ? 1 : -1;
        }

        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;

        // Check if can attack player
        if (newX === state.player.x && newY === state.player.y) {
          enemyAttack(enemy);
        } else if (isValidMove(newX, newY, enemy)) {
          enemy.x = newX;
          enemy.y = newY;
        }
      }
    }
  }

  function isValidMove(x, y, enemy) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
    if (state.map[y][x] === TILES.WALL) return false;
    if (state.enemies.some(e => e !== enemy && e.x === x && e.y === y)) return false;
    return true;
  }

  function enemyAttack(enemy) {
    const damage = enemy.damage + Math.floor(Math.random() * 3);
    state.player.hp -= damage;
    addMessage(`The ${enemy.name} hits you for ${damage} damage!`, 'damage');

    if (state.player.hp <= 0) {
      gameOver();
    }
  }

  // ==================== Game Flow ====================

  const WIN_FLOOR = 10;

  function nextFloor() {
    state.floor++;
    state.player.damage += 2;

    // Check for victory at floor 10
    if (state.floor > WIN_FLOOR) {
      victory();
      return;
    }

    addMessage(`You descend to floor ${state.floor}! (${WIN_FLOOR - state.floor} floors to escape)`, 'info');
    generateDungeon();
    render();
  }

  function victory() {
    state.gameOver = true;
    elements.overlayTitle.textContent = 'VICTORY!';
    elements.overlayTitle.className = 'win';
    elements.overlayMessage.textContent = 'You escaped the dungeon!';
    elements.finalFloor.textContent = WIN_FLOOR;
    elements.finalGold.textContent = state.player.gold;
    elements.finalKills.textContent = state.player.kills;
    elements.gameOverlay.classList.add('show');
    ToolsCommon.Toast.show('Congratulations! You escaped!', 'success');
  }

  function gameOver() {
    state.gameOver = true;
    elements.overlayTitle.textContent = 'Game Over';
    elements.overlayTitle.className = '';
    elements.overlayMessage.textContent = 'You have been defeated!';
    elements.finalFloor.textContent = state.floor;
    elements.finalGold.textContent = state.player.gold;
    elements.finalKills.textContent = state.player.kills;
    elements.gameOverlay.classList.add('show');
  }

  function newGame() {
    state.player = {
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      damage: 10,
      gold: 0,
      kills: 0
    };
    state.floor = 1;
    state.gameOver = false;
    state.messages = [];

    elements.gameOverlay.classList.remove('show');
    addMessage(`Welcome! Descend ${WIN_FLOOR} floors to escape. Find the stairs (>).`, 'info');
    generateDungeon();
    render();
  }

  // ==================== Event Handlers ====================

  function handleControlClick(e) {
    const dir = e.target.closest('.control-btn')?.dataset.dir;
    if (!dir) return;

    switch (dir) {
      case 'up':
        movePlayer(0, -1);
        break;
      case 'down':
        movePlayer(0, 1);
        break;
      case 'left':
        movePlayer(-1, 0);
        break;
      case 'right':
        movePlayer(1, 0);
        break;
      case 'wait':
        wait();
        break;
    }
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 's':
      case 'arrowdown':
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case 'a':
      case 'arrowleft':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'd':
      case 'arrowright':
        e.preventDefault();
        movePlayer(1, 0);
        break;
      case ' ':
        e.preventDefault();
        wait();
        break;
      case 'n':
        e.preventDefault();
        newGame();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Event listeners
    elements.newGameBtn?.addEventListener('click', newGame);
    elements.restartBtn?.addEventListener('click', newGame);

    elements.controlBtns.forEach(btn => {
      btn.addEventListener('click', handleControlClick);
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Start game
    newGame();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
