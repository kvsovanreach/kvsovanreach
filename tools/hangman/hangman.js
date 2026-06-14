/**
 * Hangman - Script
 * Classic word guessing game with categories and hints
 */
(function() {
  'use strict';

  // ==================== Word Lists ====================
  const WORDS = {
    animals: [
      'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'KANGAROO',
      'CHEETAH', 'OCTOPUS', 'BUTTERFLY', 'CHAMELEON', 'FLAMINGO',
      'HEDGEHOG', 'PLATYPUS', 'SQUIRREL', 'TORTOISE', 'CROCODILE',
      'PANTHER', 'LOBSTER', 'GORILLA', 'PELICAN', 'HAMSTER',
      'LEOPARD', 'ANTELOPE', 'BUFFALO', 'SPARROW', 'STALLION'
    ],
    countries: [
      'CAMBODIA', 'BRAZIL', 'AUSTRALIA', 'GERMANY', 'JAPAN',
      'PORTUGAL', 'THAILAND', 'ICELAND', 'MOROCCO', 'ARGENTINA',
      'COLOMBIA', 'ETHIOPIA', 'INDONESIA', 'MALAYSIA', 'SINGAPORE',
      'PHILIPPINES', 'VIETNAM', 'MYANMAR', 'MONGOLIA', 'DENMARK',
      'FINLAND', 'SWITZERLAND', 'NORWAY', 'IRELAND', 'ROMANIA'
    ],
    programming: [
      'JAVASCRIPT', 'PYTHON', 'ALGORITHM', 'FUNCTION', 'VARIABLE',
      'DATABASE', 'COMPILER', 'FRAMEWORK', 'DEBUGGING', 'RECURSION',
      'INTERFACE', 'TEMPLATE', 'ITERATOR', 'CLOSURE', 'PROMISES',
      'CALLBACK', 'TYPESCRIPT', 'COMPONENT', 'MUTATION', 'PROTOCOL',
      'TERMINAL', 'PIPELINE', 'ENDPOINT', 'WEBPACK', 'RUNTIME'
    ],
    science: [
      'MOLECULE', 'GRAVITY', 'NEUTRON', 'PHOTON', 'QUANTUM',
      'ELECTRON', 'CATALYST', 'NUCLEUS', 'ENTROPY', 'ISOTOPE',
      'ORGANISM', 'SPECTRUM', 'FRICTION', 'THEOREM', 'VELOCITY',
      'PARTICLE', 'KINETICS', 'COMPOUND', 'VOLTAGE', 'MEMBRANE',
      'CHROMOSOME', 'ASTEROID', 'PROTON', 'DENSITY', 'POLYMER'
    ],
    food: [
      'SPAGHETTI', 'AVOCADO', 'PANCAKE', 'BURRITO', 'CROISSANT',
      'DUMPLING', 'TIRAMISU', 'LASAGNA', 'CINNAMON', 'CHOCOLATE',
      'MUSHROOM', 'BROCCOLI', 'SANDWICH', 'MACARON', 'ZUCCHINI',
      'EGGPLANT', 'BAGUETTE', 'JALAPENO', 'ALMOND', 'PAPAYA',
      'MANGO', 'RISOTTO', 'PISTACHIO', 'COCONUT', 'SAFFRON'
    ]
  };

  const BODY_PARTS = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
  const MAX_WRONG = 6;
  const MAX_HINTS = 3;

  // ==================== State ====================
  const state = {
    word: '',
    category: 'animals',
    guessed: new Set(),
    wrongCount: 0,
    gameOver: false,
    hintsLeft: MAX_HINTS,
    stats: { wins: 0, losses: 0, streak: 0 }
  };

  // ==================== DOM ====================
  const wordDisplay = document.getElementById('wordDisplay');
  const keyboardEl = document.getElementById('keyboard');
  const remainingEl = document.getElementById('remaining');
  const resultMsg = document.getElementById('resultMsg');
  const resultIcon = document.getElementById('resultIcon');
  const resultText = document.getElementById('resultText');
  const newGameBtn = document.getElementById('newGameBtn');
  const hintBtn = document.getElementById('hintBtn');
  const hintCountEl = document.getElementById('hintCount');
  const winCountEl = document.getElementById('winCount');
  const loseCountEl = document.getElementById('loseCount');
  const streakCountEl = document.getElementById('streakCount');
  const catButtons = document.querySelectorAll('.cat-btn');

  // ==================== Init ====================
  function init() {
    loadStats();
    updateStatsDisplay();
    buildKeyboard();
    bindEvents();
    newGame();
  }

  function bindEvents() {
    newGameBtn.addEventListener('click', newGame);
    hintBtn.addEventListener('click', useHint);

    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.category = btn.dataset.cat;
        newGame();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;

      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        newGame();
        return;
      }

      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useHint();
        return;
      }

      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) {
        e.preventDefault();
        guessLetter(letter);
      }
    });
  }

  // ==================== Game Logic ====================
  function newGame() {
    const wordList = WORDS[state.category];
    state.word = wordList[Math.floor(Math.random() * wordList.length)];
    state.guessed = new Set();
    state.wrongCount = 0;
    state.gameOver = false;
    state.hintsLeft = MAX_HINTS;

    resetDrawing();
    renderWord();
    resetKeyboard();
    updateRemaining();
    hintCountEl.textContent = state.hintsLeft;
    hintBtn.disabled = false;
    resultMsg.classList.add('hidden');
    resultMsg.classList.remove('win', 'lose');
  }

  function guessLetter(letter) {
    if (state.gameOver || state.guessed.has(letter)) return;

    state.guessed.add(letter);
    const keyBtn = keyboardEl.querySelector(`[data-letter="${letter}"]`);

    if (state.word.includes(letter)) {
      if (keyBtn) keyBtn.classList.add('correct');
      keyBtn.disabled = true;
      renderWord();
      checkWin();
    } else {
      if (keyBtn) keyBtn.classList.add('wrong');
      keyBtn.disabled = true;
      state.wrongCount++;
      showBodyPart(state.wrongCount - 1);
      updateRemaining();
      checkLose();
    }
  }

  function checkWin() {
    const won = state.word.split('').every(ch => state.guessed.has(ch));
    if (won) {
      state.gameOver = true;
      state.stats.wins++;
      state.stats.streak++;
      saveStats();
      updateStatsDisplay();
      showResult(true);
    }
  }

  function checkLose() {
    if (state.wrongCount >= MAX_WRONG) {
      state.gameOver = true;
      state.stats.losses++;
      state.stats.streak = 0;
      saveStats();
      updateStatsDisplay();
      showFace();
      revealWord();
      showResult(false);
    }
  }

  function useHint() {
    if (state.gameOver || state.hintsLeft <= 0) return;

    const unrevealed = state.word.split('').filter(ch => !state.guessed.has(ch));
    if (unrevealed.length === 0) return;

    const letter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    state.hintsLeft--;
    hintCountEl.textContent = state.hintsLeft;

    if (state.hintsLeft <= 0) {
      hintBtn.disabled = true;
    }

    state.guessed.add(letter);
    const keyBtn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
    if (keyBtn) {
      keyBtn.classList.add('correct');
      keyBtn.disabled = true;
    }

    renderWord(letter);
    checkWin();

    ToolsCommon.showToast(`Hint: letter "${letter}" revealed`, 'info');
  }

  // ==================== Rendering ====================
  function buildKeyboard() {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    keyboardEl.innerHTML = '';

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'hm-keyboard-row';
      rowDiv.style.display = 'flex';
      rowDiv.style.justifyContent = 'center';
      rowDiv.style.gap = 'var(--space-1)';
      rowDiv.style.width = '100%';

      row.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => guessLetter(letter));
        rowDiv.appendChild(btn);
      });

      keyboardEl.appendChild(rowDiv);
    });
  }

  function resetKeyboard() {
    const keys = keyboardEl.querySelectorAll('.key-btn');
    keys.forEach(k => {
      k.disabled = false;
      k.classList.remove('correct', 'wrong');
    });
  }

  function renderWord(hintLetter) {
    wordDisplay.innerHTML = '';
    state.word.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'hm-letter';

      if (ch === ' ') {
        span.classList.add('space');
      } else if (state.guessed.has(ch)) {
        span.textContent = ch;
        span.classList.add('revealed');
        if (hintLetter && ch === hintLetter) {
          span.classList.remove('revealed');
          span.classList.add('hint-revealed');
        }
      }

      wordDisplay.appendChild(span);
    });
  }

  function revealWord() {
    const letters = wordDisplay.querySelectorAll('.hm-letter');
    state.word.split('').forEach((ch, i) => {
      if (!state.guessed.has(ch) && ch !== ' ') {
        letters[i].textContent = ch;
        letters[i].classList.add('wrong-reveal');
      }
    });
  }

  function updateRemaining() {
    const left = MAX_WRONG - state.wrongCount;
    remainingEl.textContent = `${left} guess${left !== 1 ? 'es' : ''} remaining`;
    remainingEl.className = 'hm-remaining';
    if (left <= 2) remainingEl.classList.add('danger');
  }

  function showResult(won) {
    resultMsg.classList.remove('hidden', 'win', 'lose');
    if (won) {
      resultMsg.classList.add('win');
      resultIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
      resultText.textContent = 'You guessed it!';
    } else {
      resultMsg.classList.add('lose');
      resultIcon.innerHTML = '<i class="fa-solid fa-skull"></i>';
      resultText.textContent = `The word was "${state.word}"`;
    }
  }

  // ==================== SVG Drawing ====================
  function resetDrawing() {
    BODY_PARTS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });
    ['eyeL', 'eyeR', 'mouth'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });
  }

  function showBodyPart(index) {
    if (index < BODY_PARTS.length) {
      const el = document.getElementById(BODY_PARTS[index]);
      if (el) el.classList.add('show');
    }
  }

  function showFace() {
    ['eyeL', 'eyeR', 'mouth'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('show');
    });
  }

  // ==================== Persistence ====================
  function saveStats() {
    try {
      localStorage.setItem('hangman_stats', JSON.stringify(state.stats));
    } catch (e) { /* ignore */ }
  }

  function loadStats() {
    try {
      const saved = localStorage.getItem('hangman_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.stats.wins = parsed.wins || 0;
        state.stats.losses = parsed.losses || 0;
        state.stats.streak = parsed.streak || 0;
      }
    } catch (e) { /* ignore */ }
  }

  function updateStatsDisplay() {
    winCountEl.textContent = state.stats.wins;
    loseCountEl.textContent = state.stats.losses;
    streakCountEl.textContent = state.stats.streak;
  }

  // ==================== Start ====================
  init();
})();
