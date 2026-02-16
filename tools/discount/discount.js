/**
 * KVSOVANREACH Discount Calculator Tool
 * Calculate discounts, savings, and final prices
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    originalPrice: document.getElementById('originalPrice'),
    discountPercent: document.getElementById('discountPercent'),
    taxRate: document.getElementById('taxRate'),
    finalPrice: document.getElementById('finalPrice'),
    youSave: document.getElementById('youSave'),
    discountAmount: document.getElementById('discountAmount'),
    priceBeforeTax: document.getElementById('priceBeforeTax'),
    taxAmount: document.getElementById('taxAmount'),
    taxRow: document.getElementById('taxRow'),
    breakdownOriginal: document.getElementById('breakdownOriginal'),
    breakdownPercent: document.getElementById('breakdownPercent'),
    breakdownDiscount: document.getElementById('breakdownDiscount'),
    breakdownTaxRow: document.getElementById('breakdownTaxRow'),
    breakdownTaxPercent: document.getElementById('breakdownTaxPercent'),
    breakdownTax: document.getElementById('breakdownTax'),
    breakdownTotal: document.getElementById('breakdownTotal'),
    percentBtns: document.querySelectorAll('.percent-btn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // ==================== Core Functions ====================

  function formatCurrency(value) {
    return '$' + value.toFixed(2);
  }

  function calculate() {
    const originalPrice = parseFloat(elements.originalPrice.value) || 0;
    const discountPercent = parseFloat(elements.discountPercent.value) || 0;
    const taxRate = parseFloat(elements.taxRate.value) || 0;

    // Calculate discount
    const discountAmount = originalPrice * (discountPercent / 100);
    const priceAfterDiscount = originalPrice - discountAmount;

    // Calculate tax
    const taxAmount = priceAfterDiscount * (taxRate / 100);
    const finalPrice = priceAfterDiscount + taxAmount;

    // Update display
    elements.finalPrice.textContent = formatCurrency(finalPrice);
    elements.youSave.textContent = formatCurrency(discountAmount);
    elements.discountAmount.textContent = formatCurrency(discountAmount);
    elements.priceBeforeTax.textContent = formatCurrency(priceAfterDiscount);
    elements.taxAmount.textContent = formatCurrency(taxAmount);

    // Show/hide tax row
    if (taxRate > 0) {
      elements.taxRow.style.display = 'grid';
      elements.breakdownTaxRow.style.display = 'flex';
    } else {
      elements.taxRow.style.display = 'none';
      elements.breakdownTaxRow.style.display = 'none';
    }

    // Update breakdown
    elements.breakdownOriginal.textContent = formatCurrency(originalPrice);
    elements.breakdownPercent.textContent = discountPercent;
    elements.breakdownDiscount.textContent = '-' + formatCurrency(discountAmount);
    elements.breakdownTaxPercent.textContent = taxRate;
    elements.breakdownTax.textContent = '+' + formatCurrency(taxAmount);
    elements.breakdownTotal.textContent = formatCurrency(finalPrice);

    // Update active percent button
    updatePercentButtons();
  }

  function updatePercentButtons() {
    const currentPercent = elements.discountPercent.value;
    elements.percentBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === currentPercent);
    });
  }

  // ==================== Event Handlers ====================

  function handlePercentBtnClick(e) {
    const btn = e.target.closest('.percent-btn');
    if (!btn) return;

    elements.discountPercent.value = btn.dataset.value;
    calculate();
  }

  function handleClear() {
    elements.originalPrice.value = 100;
    elements.discountPercent.value = 20;
    elements.taxRate.value = 0;
    calculate();
    ToolsCommon.Toast.show('Reset', 'success');
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    calculate();
  }

  function setupEventListeners() {
    // Inputs
    elements.originalPrice?.addEventListener('input', calculate);
    elements.discountPercent?.addEventListener('input', calculate);
    elements.taxRate?.addEventListener('input', calculate);

    // Percent buttons
    elements.percentBtns.forEach(btn => {
      btn.addEventListener('click', handlePercentBtnClick);
    });

    // Clear button
    elements.clearBtn?.addEventListener('click', handleClear);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
