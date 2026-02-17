/**
 * KVSOVANREACH Percentage Change Tool
 * Calculate percentage change between two values
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    oldValue: 100,
    newValue: 125
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.oldValue = document.getElementById('oldValue');
    elements.newValue = document.getElementById('newValue');
    elements.mainResult = document.getElementById('mainResult');
    elements.resultDirection = document.getElementById('resultDirection');
    elements.percentResult = document.getElementById('percentResult');
    elements.resultLabel = document.getElementById('resultLabel');
    elements.difference = document.getElementById('difference');
    elements.multiplier = document.getElementById('multiplier');
    elements.formulaExample = document.getElementById('formulaExample');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== Core Functions ====================

  function calculate() {
    const oldVal = parseFloat(elements.oldValue?.value) || 0;
    const newVal = parseFloat(elements.newValue?.value) || 0;

    // Update state
    state.oldValue = oldVal;
    state.newValue = newVal;

    if (oldVal === 0) {
      elements.percentResult.textContent = '∞';
      elements.resultLabel.textContent = 'Undefined';
      elements.mainResult.className = 'result-card percent-main neutral';
      elements.resultDirection.innerHTML = '<i class="fa-solid fa-minus"></i>';
      elements.difference.textContent = newVal.toFixed(2);
      elements.multiplier.textContent = '—';
      elements.formulaExample.textContent = 'Cannot divide by zero';
      return;
    }

    const diff = newVal - oldVal;
    const percentChange = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
    const mult = newVal / oldVal;

    // Determine direction
    let direction, label, iconClass;
    if (percentChange > 0) {
      direction = 'increase';
      label = 'Increase';
      iconClass = 'fa-arrow-up';
    } else if (percentChange < 0) {
      direction = 'decrease';
      label = 'Decrease';
      iconClass = 'fa-arrow-down';
    } else {
      direction = 'neutral';
      label = 'No Change';
      iconClass = 'fa-minus';
    }

    // Update UI
    elements.mainResult.className = `result-card percent-main ${direction}`;
    elements.resultDirection.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    elements.percentResult.textContent = Math.abs(percentChange).toFixed(2) + '%';
    elements.resultLabel.textContent = label;

    // Update details
    elements.difference.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(2);
    elements.multiplier.textContent = mult.toFixed(4) + '×';

    // Update formula example
    elements.formulaExample.textContent = `= ((${newVal} - ${oldVal}) / ${oldVal}) × 100 = ${percentChange.toFixed(2)}%`;
  }

  function resetForm() {
    // Reset to default values
    state.oldValue = 100;
    state.newValue = 125;

    if (elements.oldValue) {
      elements.oldValue.value = state.oldValue;
    }
    if (elements.newValue) {
      elements.newValue.value = state.newValue;
    }

    calculate();

    // Show toast notification
    if (typeof ToolsCommon !== 'undefined' && ToolsCommon.showToast) {
      ToolsCommon.showToast('Form reset!');
    }
  }

  // ==================== Event Handlers ====================

  function initEventListeners() {
    elements.oldValue?.addEventListener('input', calculate);
    elements.newValue?.addEventListener('input', calculate);
    elements.resetBtn?.addEventListener('click', resetForm);
  }

  // ==================== Keyboard Shortcuts ====================

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // R key for reset (but not Ctrl+R or Cmd+R which is browser refresh)
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        resetForm();
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    initEventListeners();
    initKeyboardShortcuts();
    calculate();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
