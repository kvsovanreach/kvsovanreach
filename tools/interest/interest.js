/**
 * KVSOVANREACH Simple Interest Calculator Tool
 * Calculate non-compounding interest
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    principal: 10000,
    rate: 5,
    time: 3,
    timeUnit: 'years'
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.principal = document.getElementById('principal');
    elements.rate = document.getElementById('rate');
    elements.time = document.getElementById('time');
    elements.timeUnit = document.getElementById('timeUnit');
    elements.finalBalance = document.getElementById('finalBalance');
    elements.principalDisplay = document.getElementById('principalDisplay');
    elements.interestEarned = document.getElementById('interestEarned');
    elements.barPrincipal = document.getElementById('barPrincipal');
    elements.barInterest = document.getElementById('barInterest');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== Core Functions ====================

  function formatCurrency(value) {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function calculate() {
    const principal = parseFloat(elements.principal?.value) || 0;
    const rate = parseFloat(elements.rate?.value) || 0;
    let time = parseFloat(elements.time?.value) || 0;
    const timeUnit = elements.timeUnit?.value || 'years';

    // Update state
    state.principal = principal;
    state.rate = rate;
    state.time = time;
    state.timeUnit = timeUnit;

    // Convert months to years if needed
    if (timeUnit === 'months') {
      time = time / 12;
    }

    // Simple Interest: I = P × R × T
    const interest = principal * (rate / 100) * time;
    const finalBalance = principal + interest;

    // Update display
    if (elements.finalBalance) {
      elements.finalBalance.textContent = formatCurrency(finalBalance);
    }
    if (elements.principalDisplay) {
      elements.principalDisplay.textContent = formatCurrency(principal);
    }
    if (elements.interestEarned) {
      elements.interestEarned.textContent = formatCurrency(interest);
    }

    // Update visual bar
    if (finalBalance > 0) {
      const principalPercent = (principal / finalBalance) * 100;
      const interestPercent = (interest / finalBalance) * 100;

      if (elements.barPrincipal) {
        elements.barPrincipal.style.width = principalPercent + '%';
      }
      if (elements.barInterest) {
        elements.barInterest.style.width = interestPercent + '%';
      }
    } else {
      if (elements.barPrincipal) {
        elements.barPrincipal.style.width = '100%';
      }
      if (elements.barInterest) {
        elements.barInterest.style.width = '0%';
      }
    }
  }

  function resetForm() {
    // Reset state to defaults
    state.principal = 10000;
    state.rate = 5;
    state.time = 3;
    state.timeUnit = 'years';

    // Reset input values
    if (elements.principal) {
      elements.principal.value = state.principal;
    }
    if (elements.rate) {
      elements.rate.value = state.rate;
    }
    if (elements.time) {
      elements.time.value = state.time;
    }
    if (elements.timeUnit) {
      elements.timeUnit.value = state.timeUnit;
    }

    // Recalculate
    calculate();

    // Show toast notification
    ToolsCommon?.showToast?.('Form reset to defaults', 'success');
  }

  // ==================== Event Listeners ====================

  function initEventListeners() {
    elements.principal?.addEventListener('input', calculate);
    elements.rate?.addEventListener('input', calculate);
    elements.time?.addEventListener('input', calculate);
    elements.timeUnit?.addEventListener('change', calculate);
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
