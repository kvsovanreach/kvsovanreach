/**
 * KVSOVANREACH Percentage Change Tool
 * Calculate percentage change between two values
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    oldValue: document.getElementById('oldValue'),
    newValue: document.getElementById('newValue'),
    mainResult: document.getElementById('mainResult'),
    resultDirection: document.getElementById('resultDirection'),
    percentResult: document.getElementById('percentResult'),
    resultLabel: document.getElementById('resultLabel'),
    difference: document.getElementById('difference'),
    multiplier: document.getElementById('multiplier'),
    formulaExample: document.getElementById('formulaExample')
  };

  // ==================== Core Functions ====================

  function calculate() {
    const oldVal = parseFloat(elements.oldValue.value) || 0;
    const newVal = parseFloat(elements.newValue.value) || 0;

    if (oldVal === 0) {
      elements.percentResult.textContent = '∞';
      elements.resultLabel.textContent = 'Undefined';
      elements.mainResult.className = 'result-card main-result neutral';
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
    elements.mainResult.className = `result-card main-result ${direction}`;
    elements.resultDirection.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    elements.percentResult.textContent = Math.abs(percentChange).toFixed(2) + '%';
    elements.resultLabel.textContent = label;

    // Update details
    elements.difference.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(2);
    elements.multiplier.textContent = mult.toFixed(4) + '×';

    // Update formula example
    elements.formulaExample.textContent = `= ((${newVal} - ${oldVal}) / ${oldVal}) × 100 = ${percentChange.toFixed(2)}%`;
  }

  // ==================== Initialization ====================

  function init() {
    elements.oldValue?.addEventListener('input', calculate);
    elements.newValue?.addEventListener('input', calculate);
    calculate();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
