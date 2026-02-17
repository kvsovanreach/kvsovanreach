/**
 * KVSOVANREACH Tip Calculator
 */

(function() {
  'use strict';

  const state = {
    billAmount: 0,
    tipPercent: 18,
    numPeople: 1
  };

  const elements = {};

  function initElements() {
    elements.billAmount = document.getElementById('billAmount');
    elements.tipButtons = document.querySelectorAll('.tip-btn');
    elements.customTip = document.getElementById('customTip');
    elements.numPeople = document.getElementById('numPeople');
    elements.increasePeople = document.getElementById('increasePeople');
    elements.decreasePeople = document.getElementById('decreasePeople');
    elements.tipAmount = document.getElementById('tipAmount');
    elements.totalAmount = document.getElementById('totalAmount');
    elements.tipPerPerson = document.getElementById('tipPerPerson');
    elements.totalPerPerson = document.getElementById('totalPerPerson');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
  }

  function calculate() {
    const bill = state.billAmount;
    const tipPercent = state.tipPercent;
    const people = state.numPeople;

    const tipAmount = bill * (tipPercent / 100);
    const totalAmount = bill + tipAmount;

    elements.tipAmount.textContent = formatCurrency(tipAmount);
    elements.totalAmount.textContent = formatCurrency(totalAmount);

    if (people > 1) {
      elements.tipPerPerson.textContent = `${formatCurrency(tipAmount / people)} per person`;
      elements.totalPerPerson.textContent = `${formatCurrency(totalAmount / people)} per person`;
    } else {
      elements.tipPerPerson.textContent = '';
      elements.totalPerPerson.textContent = '';
    }
  }

  function handleBillChange(e) {
    state.billAmount = parseFloat(e.target.value) || 0;
    calculate();
  }

  function handleTipButtonClick(e) {
    const btn = e.target.closest('.tip-btn');
    if (!btn) return;

    elements.tipButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    elements.customTip.value = '';

    state.tipPercent = parseInt(btn.dataset.tip);
    calculate();
  }

  function handleCustomTip(e) {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 100) {
      elements.tipButtons.forEach(b => b.classList.remove('active'));
      state.tipPercent = value;
      calculate();
    }
  }

  function handlePeopleChange(e) {
    let value = parseInt(e.target.value) || 1;
    value = Math.max(1, Math.min(100, value));
    e.target.value = value;
    state.numPeople = value;
    calculate();
  }

  function handleIncreasePeople() {
    if (state.numPeople < 100) {
      state.numPeople++;
      elements.numPeople.value = state.numPeople;
      calculate();
    }
  }

  function handleDecreasePeople() {
    if (state.numPeople > 1) {
      state.numPeople--;
      elements.numPeople.value = state.numPeople;
      calculate();
    }
  }

  function handleReset() {
    state.billAmount = 0;
    state.tipPercent = 18;
    state.numPeople = 1;

    elements.billAmount.value = '';
    elements.customTip.value = '';
    elements.numPeople.value = 1;

    elements.tipButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tip === '18');
    });

    calculate();
    showToast('Reset', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;
    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      handleReset();
    }
  }

  function init() {
    initElements();

    elements.billAmount.addEventListener('input', handleBillChange);
    elements.tipButtons.forEach(btn => {
      btn.addEventListener('click', handleTipButtonClick);
    });
    elements.customTip.addEventListener('input', handleCustomTip);
    elements.numPeople.addEventListener('input', handlePeopleChange);
    elements.increasePeople.addEventListener('click', handleIncreasePeople);
    elements.decreasePeople.addEventListener('click', handleDecreasePeople);
    elements.resetBtn.addEventListener('click', handleReset);
    document.addEventListener('keydown', handleKeydown);

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
