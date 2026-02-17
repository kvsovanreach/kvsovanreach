/**
 * KVSOVANREACH Discount Calculator Tool
 * Calculate discounts, savings, and final prices
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    originalPrice: 100,
    discountPercent: 20,
    taxRate: 0
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.originalPrice = document.getElementById('originalPrice');
    elements.discountPercent = document.getElementById('discountPercent');
    elements.taxRate = document.getElementById('taxRate');
    elements.finalPrice = document.getElementById('finalPrice');
    elements.youSave = document.getElementById('youSave');
    elements.discountAmount = document.getElementById('discountAmount');
    elements.priceBeforeTax = document.getElementById('priceBeforeTax');
    elements.taxAmount = document.getElementById('taxAmount');
    elements.taxRow = document.getElementById('taxRow');
    elements.breakdownOriginal = document.getElementById('breakdownOriginal');
    elements.breakdownPercent = document.getElementById('breakdownPercent');
    elements.breakdownDiscount = document.getElementById('breakdownDiscount');
    elements.breakdownTaxRow = document.getElementById('breakdownTaxRow');
    elements.breakdownTaxPercent = document.getElementById('breakdownTaxPercent');
    elements.breakdownTax = document.getElementById('breakdownTax');
    elements.breakdownTotal = document.getElementById('breakdownTotal');
    elements.percentBtns = document.querySelectorAll('.percent-btn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== Core Functions ====================

  function formatCurrency(value) {
    return '$' + value.toFixed(2);
  }

  function calculate() {
    const originalPrice = parseFloat(elements.originalPrice?.value) || 0;
    const discountPercent = parseFloat(elements.discountPercent?.value) || 0;
    const taxRate = parseFloat(elements.taxRate?.value) || 0;

    // Update state
    state.originalPrice = originalPrice;
    state.discountPercent = discountPercent;
    state.taxRate = taxRate;

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
    const currentPercent = elements.discountPercent?.value;
    elements.percentBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === currentPercent);
    });
  }

  function resetForm() {
    state.originalPrice = 100;
    state.discountPercent = 20;
    state.taxRate = 0;

    if (elements.originalPrice) elements.originalPrice.value = state.originalPrice;
    if (elements.discountPercent) elements.discountPercent.value = state.discountPercent;
    if (elements.taxRate) elements.taxRate.value = state.taxRate;

    calculate();
    ToolsCommon?.showToast?.('Reset', 'success');
  }

  // ==================== Event Handlers ====================

  function handlePercentBtnClick(e) {
    const btn = e.target.closest('.percent-btn');
    if (!btn) return;

    if (elements.discountPercent) {
      elements.discountPercent.value = btn.dataset.value;
    }
    calculate();
  }

  // ==================== Keyboard Shortcuts ====================

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          resetForm();
          break;
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
    initKeyboardShortcuts();
    calculate();
  }

  function setupEventListeners() {
    // Inputs
    elements.originalPrice?.addEventListener('input', calculate);
    elements.discountPercent?.addEventListener('input', calculate);
    elements.taxRate?.addEventListener('input', calculate);

    // Percent buttons
    elements.percentBtns?.forEach(btn => {
      btn.addEventListener('click', handlePercentBtnClick);
    });

    // Reset button
    elements.resetBtn?.addEventListener('click', resetForm);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
