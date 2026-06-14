/**
 * Rock Paper Scissors - Script
 * Classic & Lizard Spock variant with adaptive AI
 */
(function() {
  'use strict';

  // ==================== Constants ====================
  const CHOICES_CLASSIC = ['rock', 'paper', 'scissors'];
  const CHOICES_EXTENDED = ['rock', 'paper', 'scissors', 'lizard', 'spock'];

  const EMOJI = {
    rock: '\u{1F44A}',
    paper: '\u{270B}',
    scissors: '\u{270C}',
    lizard: '\u{1F98E}',
    spock: '\u{1F596}'
  };

  // What each choice beats: key beats values
  const WINS_OVER = {
    rock: ['scissors', 'lizard'],
    paper: ['rock', 'spock'],
    scissors: ['paper', 'lizard'],
    lizard: ['paper', 'spock'],
    spock: ['rock', 'scissors']
  };

  const KEY_MAP = { r: 'rock', p: 'paper', s: 'scissors', l: 'lizard', k: 'spock' };

  const STORAGE_KEY = 'rps_stats';
  const MAX_HISTORY = 10;

  // ==================== State ====================
  const state = {
    mode: 'classic',     // 'classic' or 'extended'
    bestOf: 3,           // 0 = free play, 3, 5, 10
    scores: { player: 0, cpu: 0, draw: 0 },
    streak: 0,
    bestStreak: 0,
    totalGames: 0,
    totalWins: 0,
    history: [],          // last N rounds: { player, cpu, result }
    matchResults: [],     // results within current best-of match
    matchOver: false,
    animating: false,
    // AI pattern tracking
    playerHistory: []     // all player choices for pattern analysis
  };

  // ==================== DOM ====================
  const resetBtn = document.getElementById('resetBtn');
  const statusText = document.getElementById('statusText');
  const playerScoreEl = document.getElementById('playerScore');
  const cpuScoreEl = document.getElementById('cpuScore');
  const drawScoreEl = document.getElementById('drawScore');
  const playerChoiceEl = document.getElementById('playerChoice');
  const cpuChoiceEl = document.getElementById('cpuChoice');
  const choicesContainer = document.getElementById('choicesContainer');
  const choiceButtons = document.querySelectorAll('.choice-btn');
  const modeButtons = document.querySelectorAll('.mode-btn:not(.bestof-btn)');
  const bestofButtons = document.querySelectorAll('.bestof-btn');
  const winRateEl = document.getElementById('winRate');
  const winStreakEl = document.getElementById('winStreak');
  const bestStreakEl = document.getElementById('bestStreak');
  const totalGamesEl = document.getElementById('totalGames');
  const historyList = document.getElementById('historyList');
  const bestofProgress = document.getElementById('bestofProgress');

  // ==================== Init ====================
  function init() {
    loadStats();
    updateChoicesVisibility();
    updateAllDisplays();
    bindEvents();
  }

  function bindEvents() {
    resetBtn.addEventListener('click', resetAll);

    choiceButtons.forEach(btn => {
      btn.addEventListener('click', () => handleChoice(btn.dataset.choice));
    });

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        updateChoicesVisibility();
        resetMatch();
      });
    });

    bestofButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        bestofButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.bestOf = parseInt(btn.dataset.bestof, 10);
        resetMatch();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;

      const key = e.key.toLowerCase();
      if (KEY_MAP[key]) {
        const choice = KEY_MAP[key];
        // Only allow if choice is available in current mode
        const available = state.mode === 'classic' ? CHOICES_CLASSIC : CHOICES_EXTENDED;
        if (available.includes(choice)) {
          e.preventDefault();
          handleChoice(choice);
        }
      }
    });
  }

  function updateChoicesVisibility() {
    if (state.mode === 'classic') {
      choicesContainer.classList.add('classic');
      choicesContainer.classList.remove('extended');
    } else {
      choicesContainer.classList.remove('classic');
      choicesContainer.classList.add('extended');
    }
  }

  // ==================== AI ====================
  function getAIChoice() {
    const available = state.mode === 'classic' ? CHOICES_CLASSIC : CHOICES_EXTENDED;
    const history = state.playerHistory;

    // Need at least 3 moves to analyze patterns
    if (history.length < 3) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // 60% chance to use pattern prediction, 40% random (keeps it fair)
    if (Math.random() < 0.4) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Analyze player patterns: look at last 2 moves to predict next
    const predictedMove = predictPlayerMove(available);
    if (predictedMove) {
      // Find a choice that beats the predicted move
      const counter = findCounter(predictedMove, available);
      if (counter) return counter;
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  function predictPlayerMove(available) {
    const history = state.playerHistory;
    if (history.length < 3) return null;

    // Frequency analysis of recent choices (last 10)
    const recent = history.slice(-10);
    const freq = {};
    available.forEach(c => freq[c] = 0);
    recent.forEach(c => { if (freq[c] !== undefined) freq[c]++; });

    // Find most frequent
    let maxFreq = 0;
    let predicted = null;
    for (const [choice, count] of Object.entries(freq)) {
      if (count > maxFreq) {
        maxFreq = count;
        predicted = choice;
      }
    }

    // Also check for sequential patterns (player repeated last move?)
    const last = history[history.length - 1];
    const secondLast = history[history.length - 2];
    if (last === secondLast) {
      // Player might repeat again
      return last;
    }

    return predicted;
  }

  function findCounter(move, available) {
    // Find a choice from available that beats the given move
    for (const choice of available) {
      if (WINS_OVER[choice] && WINS_OVER[choice].includes(move)) {
        return choice;
      }
    }
    return null;
  }

  // ==================== Game Logic ====================
  function handleChoice(playerChoice) {
    if (state.animating || state.matchOver) return;

    state.animating = true;
    disableChoices(true);

    const cpuChoice = getAIChoice();
    state.playerHistory.push(playerChoice);

    // Show player choice immediately
    setArenaChoice(playerChoiceEl, playerChoice);

    // Animate CPU choice with delay
    cpuChoiceEl.querySelector('.choice-emoji').textContent = '?';
    cpuChoiceEl.classList.remove('reveal', 'winner', 'loser');
    playerChoiceEl.classList.remove('winner', 'loser');

    setTimeout(() => {
      setArenaChoice(cpuChoiceEl, cpuChoice);
      cpuChoiceEl.classList.add('reveal');

      const result = getResult(playerChoice, cpuChoice);
      processResult(result, playerChoice, cpuChoice);

      state.animating = false;
      if (!state.matchOver) {
        disableChoices(false);
      }
    }, 500);
  }

  function getResult(player, cpu) {
    if (player === cpu) return 'draw';
    if (WINS_OVER[player] && WINS_OVER[player].includes(cpu)) return 'win';
    return 'lose';
  }

  function processResult(result, playerChoice, cpuChoice) {
    state.totalGames++;

    // Update scores
    if (result === 'win') {
      state.scores.player++;
      state.totalWins++;
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      setStatus(getWinMessage(playerChoice, cpuChoice), 'win');
      playerChoiceEl.classList.add('winner');
      cpuChoiceEl.classList.add('loser');
    } else if (result === 'lose') {
      state.scores.cpu++;
      state.streak = 0;
      setStatus(getLoseMessage(playerChoice, cpuChoice), 'lose');
      cpuChoiceEl.classList.add('winner');
      playerChoiceEl.classList.add('loser');
    } else {
      state.scores.draw++;
      state.streak = 0;
      setStatus('Draw! Both chose ' + playerChoice, 'draw');
    }

    // History
    state.history.push({ player: playerChoice, cpu: cpuChoice, result });
    if (state.history.length > MAX_HISTORY) state.history.shift();

    // Best-of match tracking
    if (state.bestOf > 0) {
      state.matchResults.push(result);
      checkMatchEnd();
    }

    saveStats();
    updateAllDisplays();
  }

  function checkMatchEnd() {
    if (state.bestOf === 0) return;

    const winsNeeded = Math.ceil(state.bestOf / 2);
    let playerWins = 0;
    let cpuWins = 0;

    state.matchResults.forEach(r => {
      if (r === 'win') playerWins++;
      if (r === 'lose') cpuWins++;
    });

    if (playerWins >= winsNeeded) {
      state.matchOver = true;
      disableChoices(true);
      setTimeout(() => {
        setStatus('You win the match! ' + playerWins + '-' + cpuWins, 'win');
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Match won! ' + playerWins + '-' + cpuWins, 'success');
        }
        showMatchResult('win', playerWins, cpuWins);
      }, 600);
    } else if (cpuWins >= winsNeeded) {
      state.matchOver = true;
      disableChoices(true);
      setTimeout(() => {
        setStatus('CPU wins the match! ' + cpuWins + '-' + playerWins, 'lose');
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Match lost. ' + cpuWins + '-' + playerWins, 'error');
        }
        showMatchResult('lose', playerWins, cpuWins);
      }, 600);
    }
  }

  function showMatchResult(result, playerWins, cpuWins) {
    // Insert a match result card above the arena
    const existing = document.querySelector('.match-result');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'match-result ' + result;

    if (result === 'win') {
      div.innerHTML = '<h3><i class="fa-solid fa-trophy"></i> Match Won!</h3><p>Final score: ' + playerWins + ' - ' + cpuWins + '</p>';
    } else {
      div.innerHTML = '<h3><i class="fa-solid fa-skull"></i> Match Lost</h3><p>Final score: ' + playerWins + ' - ' + cpuWins + '</p>';
    }

    const arena = document.querySelector('.rps-arena');
    arena.parentNode.insertBefore(div, arena);

    // Auto-reset match after delay
    setTimeout(() => {
      if (div.parentNode) div.remove();
      resetMatch();
    }, 3000);
  }

  function getWinMessage(player, cpu) {
    const verb = getVerb(player, cpu);
    return capitalize(player) + ' ' + verb + ' ' + cpu + ' - You win!';
  }

  function getLoseMessage(player, cpu) {
    const verb = getVerb(cpu, player);
    return capitalize(cpu) + ' ' + verb + ' ' + player + ' - You lose!';
  }

  function getVerb(winner, loser) {
    const verbs = {
      'rock-scissors': 'crushes',
      'rock-lizard': 'crushes',
      'paper-rock': 'covers',
      'paper-spock': 'disproves',
      'scissors-paper': 'cuts',
      'scissors-lizard': 'decapitates',
      'lizard-paper': 'eats',
      'lizard-spock': 'poisons',
      'spock-rock': 'vaporizes',
      'spock-scissors': 'smashes'
    };
    return verbs[winner + '-' + loser] || 'beats';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==================== UI ====================
  function setArenaChoice(el, choice) {
    el.querySelector('.choice-emoji').textContent = EMOJI[choice] || '?';
  }

  function setStatus(text, type) {
    statusText.textContent = text;
    statusText.className = 'rps-status';
    if (type) statusText.classList.add(type);
  }

  function disableChoices(disabled) {
    choiceButtons.forEach(btn => {
      if (disabled) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });
  }

  function updateAllDisplays() {
    // Scores
    playerScoreEl.textContent = state.scores.player;
    cpuScoreEl.textContent = state.scores.cpu;
    drawScoreEl.textContent = state.scores.draw;

    // Stats
    const winRate = state.totalGames > 0 ? Math.round((state.totalWins / state.totalGames) * 100) : 0;
    winRateEl.textContent = winRate + '%';
    winStreakEl.textContent = state.streak;
    bestStreakEl.textContent = state.bestStreak;
    totalGamesEl.textContent = state.totalGames;

    // History
    renderHistory();

    // Best-of progress
    renderBestofProgress();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      historyList.innerHTML = '<span class="history-empty">No games yet</span>';
      return;
    }

    historyList.innerHTML = '';
    // Show most recent first
    const reversed = [...state.history].reverse();
    reversed.forEach(h => {
      const item = document.createElement('span');
      item.className = 'history-item ' + h.result;
      item.innerHTML = '<span class="h-emoji">' + EMOJI[h.player] + '</span>' +
        '<span class="h-result">' + (h.result === 'win' ? 'W' : h.result === 'lose' ? 'L' : 'D') + '</span>' +
        '<span class="h-emoji">' + EMOJI[h.cpu] + '</span>';
      item.title = capitalize(h.player) + ' vs ' + capitalize(h.cpu) + ' - ' + capitalize(h.result);
      historyList.appendChild(item);
    });
  }

  function renderBestofProgress() {
    bestofProgress.innerHTML = '';
    if (state.bestOf === 0) return;

    for (let i = 0; i < state.bestOf; i++) {
      const dot = document.createElement('span');
      dot.className = 'bestof-dot';
      if (state.matchResults[i]) {
        dot.classList.add(state.matchResults[i]);
      }
      bestofProgress.appendChild(dot);
    }
  }

  // ==================== Reset ====================
  function resetMatch() {
    state.matchResults = [];
    state.matchOver = false;
    state.scores.player = 0;
    state.scores.cpu = 0;
    state.scores.draw = 0;

    playerChoiceEl.querySelector('.choice-emoji').textContent = '?';
    cpuChoiceEl.querySelector('.choice-emoji').textContent = '?';
    playerChoiceEl.classList.remove('reveal', 'winner', 'loser');
    cpuChoiceEl.classList.remove('reveal', 'winner', 'loser');

    const existing = document.querySelector('.match-result');
    if (existing) existing.remove();

    setStatus('Choose your weapon!', '');
    disableChoices(false);
    updateAllDisplays();
  }

  function resetAll() {
    state.scores = { player: 0, cpu: 0, draw: 0 };
    state.streak = 0;
    state.bestStreak = 0;
    state.totalGames = 0;
    state.totalWins = 0;
    state.history = [];
    state.matchResults = [];
    state.matchOver = false;
    state.playerHistory = [];

    playerChoiceEl.querySelector('.choice-emoji').textContent = '?';
    cpuChoiceEl.querySelector('.choice-emoji').textContent = '?';
    playerChoiceEl.classList.remove('reveal', 'winner', 'loser');
    cpuChoiceEl.classList.remove('reveal', 'winner', 'loser');

    const existing = document.querySelector('.match-result');
    if (existing) existing.remove();

    setStatus('Choose your weapon!', '');
    disableChoices(false);
    saveStats();
    updateAllDisplays();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('All stats reset', 'info');
    }
  }

  // ==================== Persistence ====================
  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalGames: state.totalGames,
        totalWins: state.totalWins,
        bestStreak: state.bestStreak,
        history: state.history,
        playerHistory: state.playerHistory.slice(-50) // keep last 50 for AI
      }));
    } catch (e) { /* ignore */ }
  }

  function loadStats() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        state.totalGames = data.totalGames || 0;
        state.totalWins = data.totalWins || 0;
        state.bestStreak = data.bestStreak || 0;
        state.history = data.history || [];
        state.playerHistory = data.playerHistory || [];
      }
    } catch (e) { /* ignore */ }
  }

  // ==================== Start ====================
  init();
})();
