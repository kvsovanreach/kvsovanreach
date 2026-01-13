/**
 * KVSOVANREACH Mind Reader Game
 * AI-powered Rock-Paper-Scissors with Markov Chain prediction
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const CHOICES = ['rock', 'paper', 'scissors'];
  const ICONS = {
    rock: 'fa-hand-back-fist',
    paper: 'fa-hand',
    scissors: 'fa-hand-scissors'
  };
  const BEATS = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  const LOSES_TO = {
    rock: 'paper',
    paper: 'scissors',
    scissors: 'rock'
  };

  // ==================== State ====================
  const state = {
    playerScore: 0,
    aiScore: 0,
    round: 1,
    streak: 0,
    streakType: null,
    history: [],
    isPlaying: false,

    // Markov Chain transition matrix
    // Tracks what the player plays AFTER playing each choice
    markov: {
      rock: { rock: 0, paper: 0, scissors: 0 },
      paper: { rock: 0, paper: 0, scissors: 0 },
      scissors: { rock: 0, paper: 0, scissors: 0 }
    },
    lastPlayerChoice: null,

    // Current prediction probabilities
    predictions: { rock: 33.33, paper: 33.33, scissors: 33.33 }
  };

  // ==================== DOM Elements ====================
  const elements = {
    playerScore: document.getElementById('playerScore'),
    aiScore: document.getElementById('aiScore'),
    roundNumber: document.getElementById('roundNumber'),
    streakType: document.getElementById('streakType'),
    streakCount: document.getElementById('streakCount'),
    playerHand: document.getElementById('playerHand'),
    aiHand: document.getElementById('aiHand'),
    resultDisplay: document.getElementById('resultDisplay'),
    choiceBtns: document.querySelectorAll('.choice-btn'),
    resetBtn: document.getElementById('resetBtn'),
    predRock: document.getElementById('predRock'),
    predPaper: document.getElementById('predPaper'),
    predScissors: document.getElementById('predScissors'),
    predRockPct: document.getElementById('predRockPct'),
    predPaperPct: document.getElementById('predPaperPct'),
    predScissorsPct: document.getElementById('predScissorsPct'),
    aiConfidence: document.getElementById('aiConfidence'),
    aiMessage: document.getElementById('aiMessage'),
    historyList: document.getElementById('historyList')
  };

  // ==================== Markov Chain AI ====================

  function getPrediction() {
    // If no history, return random
    if (!state.lastPlayerChoice) {
      return CHOICES[Math.floor(Math.random() * 3)];
    }

    // Get transition probabilities from last player choice
    const transitions = state.markov[state.lastPlayerChoice];
    const total = transitions.rock + transitions.paper + transitions.scissors;

    // If no data for this transition, return random
    if (total === 0) {
      return CHOICES[Math.floor(Math.random() * 3)];
    }

    // Calculate probabilities
    const probs = {
      rock: (transitions.rock / total) * 100,
      paper: (transitions.paper / total) * 100,
      scissors: (transitions.scissors / total) * 100
    };

    // Store predictions for display
    state.predictions = probs;

    // Find the most likely next move
    let predictedPlayerMove = 'rock';
    let maxProb = probs.rock;
    if (probs.paper > maxProb) {
      maxProb = probs.paper;
      predictedPlayerMove = 'paper';
    }
    if (probs.scissors > maxProb) {
      maxProb = probs.scissors;
      predictedPlayerMove = 'scissors';
    }

    // AI plays what beats the predicted move
    return LOSES_TO[predictedPlayerMove];
  }

  function updateMarkov(playerChoice) {
    // Update transition matrix: what did player play AFTER their last choice?
    if (state.lastPlayerChoice) {
      state.markov[state.lastPlayerChoice][playerChoice]++;
    }
    state.lastPlayerChoice = playerChoice;
  }

  function getAIConfidence() {
    const probs = state.predictions;
    const maxProb = Math.max(probs.rock, probs.paper, probs.scissors);
    return Math.round(maxProb);
  }

  function getAIMessage() {
    const rounds = state.history.length;
    const confidence = getAIConfidence();
    const aiWinRate = state.aiScore / Math.max(rounds, 1) * 100;

    if (rounds < 5) {
      return "I'm still learning your patterns...";
    } else if (confidence >= 70) {
      return "I can see right through you! 🧠";
    } else if (confidence >= 50) {
      return "I'm starting to predict your moves...";
    } else if (aiWinRate > 60) {
      return "You're quite predictable! 😏";
    } else if (aiWinRate < 40) {
      return "Impressive! You're hard to read.";
    } else {
      return "This is a close match!";
    }
  }

  // ==================== Game Logic ====================

  function determineWinner(playerChoice, aiChoice) {
    if (playerChoice === aiChoice) return 'draw';
    if (BEATS[playerChoice] === aiChoice) return 'win';
    return 'lose';
  }

  function play(playerChoice) {
    if (state.isPlaying) return;
    state.isPlaying = true;

    // Disable buttons and highlight selected
    elements.choiceBtns.forEach(btn => {
      btn.classList.add('disabled');
      if (btn.dataset.choice === playerChoice) {
        btn.classList.add('selected');
      }
    });

    // AI makes prediction BEFORE seeing player's choice
    const aiChoice = getPrediction();

    // Animate hands shaking
    elements.playerHand.classList.add('shake');
    elements.aiHand.classList.add('shake');

    // Update hands after animation
    setTimeout(() => {
      // Show player's choice
      elements.playerHand.innerHTML = `<i class="fa-solid ${ICONS[playerChoice]}"></i>`;
      elements.playerHand.className = `hand-display active ${playerChoice}`;

      // Show AI's choice
      elements.aiHand.innerHTML = `<i class="fa-solid ${ICONS[aiChoice]}"></i>`;
      elements.aiHand.className = `hand-display active ${aiChoice}`;

      // Determine winner
      const result = determineWinner(playerChoice, aiChoice);

      // Update scores and streak
      updateScores(result);

      // Update Markov chain
      updateMarkov(playerChoice);

      // Add to history
      addToHistory(playerChoice, aiChoice, result);

      // Show result
      showResult(result);

      // Update UI
      updateUI();

      state.round++;
      state.isPlaying = false;

      // Re-enable buttons after a short delay
      setTimeout(() => {
        elements.choiceBtns.forEach(btn => {
          btn.classList.remove('disabled', 'selected');
        });
      }, 300);
    }, 500);
  }

  function updateScores(result) {
    if (result === 'win') {
      state.playerScore++;
      if (state.streakType === 'win') {
        state.streak++;
      } else {
        state.streakType = 'win';
        state.streak = 1;
      }
      elements.playerScore.parentElement.classList.add('pulse');
      setTimeout(() => elements.playerScore.parentElement.classList.remove('pulse'), 300);
    } else if (result === 'lose') {
      state.aiScore++;
      if (state.streakType === 'lose') {
        state.streak++;
      } else {
        state.streakType = 'lose';
        state.streak = 1;
      }
      elements.aiScore.parentElement.classList.add('pulse');
      setTimeout(() => elements.aiScore.parentElement.classList.remove('pulse'), 300);
    } else {
      state.streakType = null;
      state.streak = 0;
    }
  }

  function showResult(result) {
    const messages = {
      win: 'YOU WIN!',
      lose: 'AI WINS!',
      draw: 'DRAW!'
    };

    elements.resultDisplay.textContent = messages[result];
    elements.resultDisplay.className = `result-display show ${result}`;

    // Hide after delay
    setTimeout(() => {
      elements.resultDisplay.classList.remove('show');
    }, 2000);
  }

  function addToHistory(playerChoice, aiChoice, result) {
    state.history.unshift({ player: playerChoice, ai: aiChoice, result, round: state.round });
    if (state.history.length > 20) state.history.pop();
  }

  function updateUI() {
    // Update scores
    elements.playerScore.textContent = state.playerScore;
    elements.aiScore.textContent = state.aiScore;
    elements.roundNumber.textContent = state.round;

    // Update streak
    if (state.streakType && state.streak > 1) {
      elements.streakType.textContent = state.streakType === 'win' ? '🔥' : '❄️';
      elements.streakCount.textContent = state.streak;
    } else {
      elements.streakType.textContent = '';
      elements.streakCount.textContent = '';
    }

    // Update prediction bars
    const probs = state.predictions;
    elements.predRock.style.width = `${probs.rock}%`;
    elements.predPaper.style.width = `${probs.paper}%`;
    elements.predScissors.style.width = `${probs.scissors}%`;
    elements.predRockPct.textContent = `${Math.round(probs.rock)}%`;
    elements.predPaperPct.textContent = `${Math.round(probs.paper)}%`;
    elements.predScissorsPct.textContent = `${Math.round(probs.scissors)}%`;

    // Update AI confidence and message
    elements.aiConfidence.textContent = `${getAIConfidence()}%`;
    elements.aiMessage.textContent = getAIMessage();

    // Update history
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<div class="history-empty">No games played yet</div>';
      return;
    }

    elements.historyList.innerHTML = state.history.slice(0, 10).map((h, i) => `
      <div class="history-item ${h.result}">
        <span>#${h.round}</span>
        <i class="fa-solid ${ICONS[h.player]}"></i>
        vs
        <i class="fa-solid ${ICONS[h.ai]}"></i>
      </div>
    `).join('');
  }

  function reset() {
    state.playerScore = 0;
    state.aiScore = 0;
    state.round = 1;
    state.streak = 0;
    state.streakType = null;
    state.history = [];
    state.lastPlayerChoice = null;
    state.markov = {
      rock: { rock: 0, paper: 0, scissors: 0 },
      paper: { rock: 0, paper: 0, scissors: 0 },
      scissors: { rock: 0, paper: 0, scissors: 0 }
    };
    state.predictions = { rock: 33.33, paper: 33.33, scissors: 33.33 };

    // Reset UI
    elements.playerHand.innerHTML = '<i class="fa-solid fa-question"></i>';
    elements.playerHand.className = 'hand-display';
    elements.aiHand.innerHTML = '<i class="fa-solid fa-robot"></i>';
    elements.aiHand.className = 'hand-display';
    elements.resultDisplay.className = 'result-display';

    updateUI();
    ToolsCommon.Toast.show('Game reset!', 'success');
  }

  // ==================== Event Handlers ====================

  function handleChoice(e) {
    const btn = e.target.closest('.choice-btn');
    if (!btn) return;

    const choice = btn.dataset.choice;
    play(choice);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    if (state.isPlaying) return;

    switch (e.key.toLowerCase()) {
      case '1':
      case 'r':
        e.preventDefault();
        play('rock');
        break;
      case '2':
      case 'p':
        e.preventDefault();
        play('paper');
        break;
      case '3':
      case 's':
        e.preventDefault();
        play('scissors');
        break;
      case 'n':
        e.preventDefault();
        reset();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Choice buttons
    elements.choiceBtns.forEach(btn => {
      btn.addEventListener('click', handleChoice);
    });

    // Reset button
    elements.resetBtn?.addEventListener('click', reset);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Initial UI update
    updateUI();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
