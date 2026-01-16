/**
 * KVSOVANREACH Simple Interest Calculator Tool
 * Calculate non-compounding interest
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    principal: document.getElementById('principal'),
    rate: document.getElementById('rate'),
    time: document.getElementById('time'),
    timeUnit: document.getElementById('timeUnit'),
    finalBalance: document.getElementById('finalBalance'),
    principalDisplay: document.getElementById('principalDisplay'),
    interestEarned: document.getElementById('interestEarned'),
    barPrincipal: document.getElementById('barPrincipal'),
    barInterest: document.getElementById('barInterest')
  };

  // ==================== Core Functions ====================

  function formatCurrency(value) {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function calculate() {
    const principal = parseFloat(elements.principal.value) || 0;
    const rate = parseFloat(elements.rate.value) || 0;
    let time = parseFloat(elements.time.value) || 0;
    const timeUnit = elements.timeUnit.value;

    // Convert months to years if needed
    if (timeUnit === 'months') {
      time = time / 12;
    }

    // Simple Interest: I = P × R × T
    const interest = principal * (rate / 100) * time;
    const finalBalance = principal + interest;

    // Update display
    elements.finalBalance.textContent = formatCurrency(finalBalance);
    elements.principalDisplay.textContent = formatCurrency(principal);
    elements.interestEarned.textContent = formatCurrency(interest);

    // Update visual bar
    if (finalBalance > 0) {
      const principalPercent = (principal / finalBalance) * 100;
      const interestPercent = (interest / finalBalance) * 100;

      elements.barPrincipal.style.width = principalPercent + '%';
      elements.barInterest.style.width = interestPercent + '%';
    } else {
      elements.barPrincipal.style.width = '100%';
      elements.barInterest.style.width = '0%';
    }
  }

  // ==================== Initialization ====================

  function init() {
    elements.principal?.addEventListener('input', calculate);
    elements.rate?.addEventListener('input', calculate);
    elements.time?.addEventListener('input', calculate);
    elements.timeUnit?.addEventListener('change', calculate);
    calculate();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
