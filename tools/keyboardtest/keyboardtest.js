/**
 * KVSOVANREACH Keyboard Tester
 */

(function() {
  'use strict';

  const state = {
    pressedCount: 0,
    uniqueKeys: new Set(),
    history: []
  };

  const elements = {};

  function initElements() {
    elements.currentKey = document.getElementById('currentKey');
    elements.keyCode = document.getElementById('keyCode');
    elements.keyName = document.getElementById('keyName');
    elements.pressedCount = document.getElementById('pressedCount');
    elements.uniqueCount = document.getElementById('uniqueCount');
    elements.keyboardVisual = document.getElementById('keyboardVisual');
    elements.keyHistory = document.getElementById('keyHistory');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function getKeyDisplay(e) {
    if (e.key === ' ') return 'Space';
    if (e.key.length === 1) return e.key.toUpperCase();
    return e.key;
  }

  function handleKeyDown(e) {
    e.preventDefault();

    const keyDisplay = getKeyDisplay(e);

    elements.currentKey.textContent = keyDisplay;
    elements.keyCode.textContent = `Code: ${e.code}`;
    elements.keyName.textContent = `Key: ${e.key}`;

    state.pressedCount++;
    state.uniqueKeys.add(e.code);

    elements.pressedCount.textContent = state.pressedCount;
    elements.uniqueCount.textContent = state.uniqueKeys.size;

    const keyEl = elements.keyboardVisual.querySelector(`[data-key="${e.code}"]`);
    if (keyEl) {
      keyEl.classList.add('active', 'pressed');
    }

    state.history.unshift(keyDisplay);
    if (state.history.length > 10) {
      state.history.pop();
    }
    renderHistory();
  }

  function handleKeyUp(e) {
    const keyEl = elements.keyboardVisual.querySelector(`[data-key="${e.code}"]`);
    if (keyEl) {
      keyEl.classList.remove('active');
    }
  }

  function renderHistory() {
    elements.keyHistory.innerHTML = state.history.map(key =>
      `<span class="history-key">${key}</span>`
    ).join('');
  }

  function reset() {
    state.pressedCount = 0;
    state.uniqueKeys.clear();
    state.history = [];

    elements.currentKey.textContent = 'Press any key';
    elements.keyCode.textContent = '-';
    elements.keyName.textContent = '-';
    elements.pressedCount.textContent = '0';
    elements.uniqueCount.textContent = '0';

    elements.keyboardVisual.querySelectorAll('.key').forEach(key => {
      key.classList.remove('active', 'pressed');
    });

    renderHistory();
    showToast('Reset complete', 'success');
  }

  function init() {
    initElements();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    elements.resetBtn.addEventListener('click', reset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
