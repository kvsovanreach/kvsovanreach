/**
 * KVSOVANREACH Time Duration Adder Tool
 * Calculate cumulative time durations
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    entries: [],
    totalSeconds: 0
  };

  // ==================== DOM Elements ====================
  const elements = {
    timeEntries: document.getElementById('timeEntries'),
    hoursInput: document.getElementById('hoursInput'),
    minutesInput: document.getElementById('minutesInput'),
    secondsInput: document.getElementById('secondsInput'),
    addBtn: document.getElementById('addBtn'),
    subtractBtn: document.getElementById('subtractBtn'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    clearBtn: document.getElementById('clearBtn'),
    totalFormatted: document.getElementById('totalFormatted'),
    totalSeconds: document.getElementById('totalSeconds'),
    totalMinutes: document.getElementById('totalMinutes'),
    totalHours: document.getElementById('totalHours')
  };

  // ==================== Core Functions ====================

  function formatTime(totalSeconds) {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);

    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    return isNegative ? '-' + formatted : formatted;
  }

  function getInputSeconds() {
    const hours = parseInt(elements.hoursInput.value) || 0;
    const minutes = parseInt(elements.minutesInput.value) || 0;
    const seconds = parseInt(elements.secondsInput.value) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  function addEntry(seconds, isAdd = true) {
    if (seconds === 0) {
      ToolsCommon.Toast.show('Please enter a time value', 'error');
      return;
    }

    const entry = {
      id: Date.now(),
      seconds: seconds,
      isAdd: isAdd
    };

    state.entries.push(entry);
    updateTotal();
    renderEntries();
    resetInputs();
  }

  function removeEntry(id) {
    state.entries = state.entries.filter(e => e.id !== id);
    updateTotal();
    renderEntries();
  }

  function updateTotal() {
    state.totalSeconds = state.entries.reduce((total, entry) => {
      return total + (entry.isAdd ? entry.seconds : -entry.seconds);
    }, 0);

    // Update display
    elements.totalFormatted.textContent = formatTime(state.totalSeconds);
    elements.totalSeconds.textContent = state.totalSeconds.toLocaleString();
    elements.totalMinutes.textContent = (state.totalSeconds / 60).toFixed(2);
    elements.totalHours.textContent = (state.totalSeconds / 3600).toFixed(2);
  }

  function renderEntries() {
    if (state.entries.length === 0) {
      elements.timeEntries.innerHTML = '<div class="empty-entries">No entries yet. Add time durations above.</div>';
      return;
    }

    elements.timeEntries.innerHTML = state.entries.map(entry => `
      <div class="time-entry ${entry.isAdd ? 'add' : 'subtract'}">
        <div class="entry-time">
          <span class="sign ${entry.isAdd ? 'add' : 'subtract'}">${entry.isAdd ? '+' : '-'}</span>
          <span>${formatTime(entry.seconds)}</span>
        </div>
        <button class="entry-remove" data-id="${entry.id}" title="Remove" aria-label="Remove entry">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');

    // Add remove handlers
    elements.timeEntries.querySelectorAll('.entry-remove').forEach(btn => {
      btn.addEventListener('click', () => removeEntry(parseInt(btn.dataset.id)));
    });
  }

  function resetInputs() {
    elements.hoursInput.value = 0;
    elements.minutesInput.value = 0;
    elements.secondsInput.value = 0;
  }

  function clearAll() {
    state.entries = [];
    state.totalSeconds = 0;
    updateTotal();
    renderEntries();
    resetInputs();
    ToolsCommon.Toast.show('Cleared', 'success');
  }

  // ==================== Event Handlers ====================

  function handleAdd() {
    addEntry(getInputSeconds(), true);
  }

  function handleSubtract() {
    addEntry(getInputSeconds(), false);
  }

  function handleQuickAdd(e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;

    const seconds = parseInt(btn.dataset.seconds);
    addEntry(seconds, true);
    ToolsCommon.Toast.show(`Added ${formatTime(seconds)}`, 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('#hoursInput, #minutesInput, #secondsInput')) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    renderEntries();
    updateTotal();
  }

  function setupEventListeners() {
    elements.addBtn?.addEventListener('click', handleAdd);
    elements.subtractBtn?.addEventListener('click', handleSubtract);
    elements.clearBtn?.addEventListener('click', clearAll);

    elements.quickBtns.forEach(btn => {
      btn.addEventListener('click', handleQuickAdd);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
