/**
 * KVSOVANREACH Hydration Log Tool
 * Daily water intake tracker with localStorage persistence
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const STORAGE_KEY = 'kvsovanreach_hydration';

  // ==================== State ====================
  const state = {
    current: 0,
    goal: 2000,
    date: new Date().toDateString()
  };

  // ==================== DOM Elements ====================
  const elements = {
    waterFill: document.getElementById('waterFill'),
    currentAmount: document.getElementById('currentAmount'),
    goalAmount: document.getElementById('goalAmount'),
    percentage: document.getElementById('percentage'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    goalInput: document.getElementById('goalInput'),
    setGoalBtn: document.getElementById('setGoalBtn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    resetBtn: document.getElementById('resetBtn')
  };

  // ==================== Core Functions ====================

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);

        // Reset if it's a new day
        if (data.date !== new Date().toDateString()) {
          state.current = 0;
          state.goal = data.goal || 2000;
        } else {
          state.current = data.current || 0;
          state.goal = data.goal || 2000;
        }
        state.date = new Date().toDateString();
      }
    } catch (e) {
      console.warn('Failed to load hydration data:', e);
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        current: state.current,
        goal: state.goal,
        date: state.date
      }));
    } catch (e) {
      console.warn('Failed to save hydration data:', e);
    }
  }

  function updateUI() {
    const percent = Math.min((state.current / state.goal) * 100, 100);

    elements.waterFill.style.height = `${percent}%`;
    elements.currentAmount.textContent = state.current;
    elements.goalAmount.textContent = state.goal;
    elements.percentage.textContent = `${Math.round(percent)}%`;
    elements.goalInput.value = state.goal;

    // Update preset buttons
    elements.presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.goal) === state.goal);
    });

    // Celebration at 100%
    if (state.current >= state.goal && percent >= 100) {
      elements.percentage.innerHTML = '100% <i class="fa-solid fa-check"></i>';
    }
  }

  function addWater(amount) {
    state.current += amount;
    saveToStorage();
    updateUI();

    if (state.current >= state.goal) {
      ToolsCommon.Toast.show('Goal reached! Great job staying hydrated!', 'success');
    } else {
      ToolsCommon.Toast.show(`+${amount}ml added`, 'success');
    }
  }

  function setGoal(goal) {
    state.goal = goal;
    saveToStorage();
    updateUI();
    ToolsCommon.Toast.show(`Goal set to ${goal}ml`, 'success');
  }

  function reset() {
    state.current = 0;
    saveToStorage();
    updateUI();
    ToolsCommon.Toast.show('Progress reset', 'success');
  }

  // ==================== Event Handlers ====================

  function handleQuickAdd(e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;
    const amount = parseInt(btn.dataset.amount);
    addWater(amount);
  }

  function handleSetGoal() {
    const goal = parseInt(elements.goalInput.value);
    if (goal >= 500 && goal <= 5000) {
      setGoal(goal);
    } else {
      ToolsCommon.Toast.show('Goal must be between 500-5000ml', 'error');
    }
  }

  function handlePresetGoal(e) {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    const goal = parseInt(btn.dataset.goal);
    setGoal(goal);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    const amounts = [100, 200, 250, 330, 500];
    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      addWater(amounts[parseInt(e.key) - 1]);
    }
  }

  // ==================== Initialization ====================

  function init() {
    loadFromStorage();
    updateUI();
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.quickBtns.forEach(btn => {
      btn.addEventListener('click', handleQuickAdd);
    });

    elements.setGoalBtn?.addEventListener('click', handleSetGoal);

    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', handlePresetGoal);
    });

    elements.resetBtn?.addEventListener('click', reset);
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
