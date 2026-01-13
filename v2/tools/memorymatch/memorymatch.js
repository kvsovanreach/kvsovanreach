/**
 * KVSOVANREACH Memory Match Tool
 * Classic memory card matching game
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    gameBoard: document.getElementById('gameBoard'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    themeSelect: document.getElementById('themeSelect'),
    newGameBtn: document.getElementById('newGameBtn'),
    movesDisplay: document.getElementById('movesDisplay'),
    matchesDisplay: document.getElementById('matchesDisplay'),
    timerDisplay: document.getElementById('timerDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    victorySection: document.getElementById('victorySection'),
    finalMoves: document.getElementById('finalMoves'),
    finalTime: document.getElementById('finalTime'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
  };

  // ==================== Card Themes ====================
  const THEMES = {
    emoji: ['😀', '😎', '🥳', '😍', '🤩', '😇', '🤗', '😋', '🥰', '😜', '🤠', '🥸', '😈', '👻', '👽', '🤖'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '⛳', '🎯', '🏹', '🛹', '⛷️'],
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💯', '🎰', '🔢', '➕', '➖', '✖️']
  };

  // ==================== State ====================
  const state = {
    gridSize: 6, // Number of pairs (4, 6, or 8)
    theme: 'emoji',
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isLocked: false,
    bestScores: {}
  };

  // ==================== Core Functions ====================

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generate cards for the game
   */
  function generateCards() {
    const numPairs = state.gridSize;
    const themeCards = THEMES[state.theme];
    const selectedCards = shuffle(themeCards).slice(0, numPairs);

    // Create pairs
    const cardPairs = [...selectedCards, ...selectedCards];

    // Shuffle pairs
    return shuffle(cardPairs).map((symbol, index) => ({
      id: index,
      symbol: symbol,
      isFlipped: false,
      isMatched: false
    }));
  }

  /**
   * Format time
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate score
   */
  function calculateScore() {
    const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
    const baseScore = 1000;
    const movePenalty = state.moves * 5;
    const timePenalty = elapsedTime * 2;
    const sizeBonus = state.gridSize * 50;

    return Math.max(0, baseScore - movePenalty - timePenalty + sizeBonus);
  }

  /**
   * Get best score key
   */
  function getBestKey() {
    return `${state.theme}-${state.gridSize}`;
  }

  /**
   * Load best scores
   */
  function loadBestScores() {
    try {
      const saved = localStorage.getItem('memoryMatchBestScores');
      if (saved) {
        state.bestScores = JSON.parse(saved);
      }
    } catch (e) {
      state.bestScores = {};
    }
  }

  /**
   * Save best score
   */
  function saveBestScore(score) {
    const key = getBestKey();
    if (!state.bestScores[key] || score > state.bestScores[key]) {
      state.bestScores[key] = score;
      try {
        localStorage.setItem('memoryMatchBestScores', JSON.stringify(state.bestScores));
      } catch (e) {
        // Storage full
      }
    }
  }

  // ==================== UI Functions ====================

  function renderBoard() {
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.className = `game-board size-${state.gridSize}`;

    state.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.index = index;

      if (card.isFlipped) cardEl.classList.add('flipped');
      if (card.isMatched) cardEl.classList.add('matched');

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <i class="fa-solid fa-question"></i>
          </div>
          <div class="card-back">${card.symbol}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => handleCardClick(index));
      elements.gameBoard.appendChild(cardEl);
    });
  }

  function updateStats() {
    elements.movesDisplay.textContent = state.moves;
    elements.matchesDisplay.textContent = `${state.matchedPairs}/${state.totalPairs}`;

    const key = getBestKey();
    elements.bestDisplay.textContent = state.bestScores[key] || '--';
  }

  function updateTimer() {
    if (!state.startTime) return;
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    elements.timerDisplay.textContent = formatTime(elapsed);
  }

  function startTimer() {
    if (state.timerInterval) return;
    state.startTime = Date.now();
    state.timerInterval = setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function showVictory() {
    stopTimer();
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const score = calculateScore();

    elements.finalMoves.textContent = state.moves;
    elements.finalTime.textContent = formatTime(elapsed);
    elements.finalScore.textContent = score;
    elements.victorySection.classList.remove('hidden');

    saveBestScore(score);
    updateStats();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.success('Congratulations! You won!');
    }
  }

  function hideVictory() {
    elements.victorySection.classList.add('hidden');
  }

  // ==================== Game Logic ====================

  function handleCardClick(index) {
    if (state.isLocked) return;

    const card = state.cards[index];

    // Ignore if already flipped or matched
    if (card.isFlipped || card.isMatched) return;

    // Start timer on first click
    if (!state.startTime) {
      startTimer();
    }

    // Flip the card
    card.isFlipped = true;
    state.flippedCards.push(index);

    // Update UI
    const cardEl = elements.gameBoard.children[index];
    cardEl.classList.add('flipped');

    // Check for match
    if (state.flippedCards.length === 2) {
      state.moves++;
      updateStats();

      const [first, second] = state.flippedCards;
      const card1 = state.cards[first];
      const card2 = state.cards[second];

      if (card1.symbol === card2.symbol) {
        // Match found
        card1.isMatched = true;
        card2.isMatched = true;
        state.matchedPairs++;

        elements.gameBoard.children[first].classList.add('matched');
        elements.gameBoard.children[second].classList.add('matched');

        state.flippedCards = [];
        updateStats();

        // Check for win
        if (state.matchedPairs === state.totalPairs) {
          setTimeout(showVictory, 500);
        }
      } else {
        // No match - flip back
        state.isLocked = true;
        setTimeout(() => {
          card1.isFlipped = false;
          card2.isFlipped = false;
          elements.gameBoard.children[first].classList.remove('flipped');
          elements.gameBoard.children[second].classList.remove('flipped');
          state.flippedCards = [];
          state.isLocked = false;
        }, 1000);
      }
    }
  }

  function newGame() {
    // Stop timer
    stopTimer();

    // Reset state
    state.cards = generateCards();
    state.flippedCards = [];
    state.matchedPairs = 0;
    state.totalPairs = state.gridSize;
    state.moves = 0;
    state.startTime = null;
    state.isLocked = false;

    // Reset UI
    elements.timerDisplay.textContent = '0:00';
    hideVictory();
    renderBoard();
    updateStats();
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case 'n':
      case 'r':
        newGame();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Load best scores
    loadBestScores();

    // Size buttons
    elements.sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gridSize = parseInt(btn.dataset.size);
        newGame();
      });
    });

    // Theme select
    elements.themeSelect.addEventListener('change', () => {
      state.theme = elements.themeSelect.value;
      newGame();
    });

    // New game button
    elements.newGameBtn.addEventListener('click', newGame);
    elements.playAgainBtn.addEventListener('click', newGame);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

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
