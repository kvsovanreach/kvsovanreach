/**
 * KVSOVANREACH Coin Toss Tool
 * Virtual coin flip with animation and history
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    isFlipping: false,
    heads: 0,
    tails: 0,
    history: []
  };

  // ==================== DOM Elements ====================
  const elements = {
    coin: document.getElementById('coin'),
    resultDisplay: document.getElementById('resultDisplay'),
    flipBtn: document.getElementById('flipBtn'),
    totalFlips: document.getElementById('totalFlips'),
    headsCount: document.getElementById('headsCount'),
    tailsCount: document.getElementById('tailsCount'),
    headsBar: document.getElementById('headsBar'),
    tailsBar: document.getElementById('tailsBar'),
    headsPercent: document.getElementById('headsPercent'),
    tailsPercent: document.getElementById('tailsPercent'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };

  // ==================== Core Functions ====================

  function flipCoin() {
    if (state.isFlipping) return;

    state.isFlipping = true;
    elements.flipBtn.disabled = true;
    elements.resultDisplay.textContent = 'Flipping...';
    elements.resultDisplay.className = 'result-display';

    // Random result
    const isHeads = Math.random() < 0.5;

    // Remove existing classes
    elements.coin.classList.remove('heads', 'tails', 'flipping');

    // Trigger reflow
    void elements.coin.offsetWidth;

    // Add animation
    elements.coin.classList.add('flipping');

    // Set final position after animation
    setTimeout(() => {
      elements.coin.classList.remove('flipping');

      if (isHeads) {
        elements.coin.classList.add('heads');
        state.heads++;
        state.history.unshift('heads');
        elements.resultDisplay.textContent = 'HEADS!';
        elements.resultDisplay.className = 'result-display heads';
      } else {
        elements.coin.classList.add('tails');
        state.tails++;
        state.history.unshift('tails');
        elements.resultDisplay.textContent = 'TAILS!';
        elements.resultDisplay.className = 'result-display tails';
      }

      // Keep only last 20 in history
      if (state.history.length > 20) {
        state.history.pop();
      }

      updateStats();
      updateHistory();

      state.isFlipping = false;
      elements.flipBtn.disabled = false;
    }, 1000);
  }

  function updateStats() {
    const total = state.heads + state.tails;

    elements.totalFlips.textContent = total;
    elements.headsCount.textContent = state.heads;
    elements.tailsCount.textContent = state.tails;

    if (total > 0) {
      const headsPercent = ((state.heads / total) * 100).toFixed(1);
      const tailsPercent = ((state.tails / total) * 100).toFixed(1);

      elements.headsBar.style.width = `${headsPercent}%`;
      elements.tailsBar.style.width = `${tailsPercent}%`;
      elements.headsPercent.textContent = `${headsPercent}%`;
      elements.tailsPercent.textContent = `${tailsPercent}%`;
    } else {
      elements.headsBar.style.width = '50%';
      elements.tailsBar.style.width = '50%';
      elements.headsPercent.textContent = '50%';
      elements.tailsPercent.textContent = '50%';
    }
  }

  function updateHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<div class="history-empty">No flips yet</div>';
      return;
    }

    elements.historyList.innerHTML = state.history.map((result, index) =>
      `<span class="history-item ${result}">#${state.heads + state.tails - index} ${result.toUpperCase()}</span>`
    ).join('');
  }

  function clearHistory() {
    state.heads = 0;
    state.tails = 0;
    state.history = [];
    elements.coin.classList.remove('heads', 'tails');
    elements.resultDisplay.textContent = 'Click to flip!';
    elements.resultDisplay.className = 'result-display';
    updateStats();
    updateHistory();
    ToolsCommon.Toast.show('History cleared', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      flipCoin();
    }
  }

  // ==================== Initialization ====================

  function init() {
    elements.flipBtn?.addEventListener('click', flipCoin);
    elements.coin?.addEventListener('click', flipCoin);
    elements.clearHistoryBtn?.addEventListener('click', clearHistory);
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
