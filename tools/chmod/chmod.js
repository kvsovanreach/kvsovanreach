/**
 * KVSOVANREACH Chmod Calculator
 */

(function() {
  'use strict';

  const state = {
    owner: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    others: { r: true, w: false, x: true }
  };

  const elements = {};

  function initElements() {
    elements.checkboxes = document.querySelectorAll('.permission-row input[type="checkbox"]');
    elements.numericValue = document.getElementById('numericValue');
    elements.symbolicValue = document.getElementById('symbolicValue');
    elements.commandValue = document.getElementById('commandValue');
    elements.copyBtns = document.querySelectorAll('.copy-btn');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function permToNumber(perms) {
    return (perms.r ? 4 : 0) + (perms.w ? 2 : 0) + (perms.x ? 1 : 0);
  }

  function numberToPerm(num) {
    return {
      r: (num & 4) !== 0,
      w: (num & 2) !== 0,
      x: (num & 1) !== 0
    };
  }

  function getNumeric() {
    return `${permToNumber(state.owner)}${permToNumber(state.group)}${permToNumber(state.others)}`;
  }

  function getSymbolic() {
    const format = (p) => `${p.r ? 'r' : '-'}${p.w ? 'w' : '-'}${p.x ? 'x' : '-'}`;
    return format(state.owner) + format(state.group) + format(state.others);
  }

  function updateDisplay() {
    const numeric = getNumeric();
    const symbolic = getSymbolic();

    elements.numericValue.value = numeric;
    elements.symbolicValue.textContent = symbolic;
    elements.commandValue.textContent = `chmod ${numeric} filename`;
  }

  function updateCheckboxes() {
    elements.checkboxes.forEach(cb => {
      const role = cb.dataset.role;
      const perm = cb.dataset.perm;
      cb.checked = state[role][perm];
    });
  }

  function handleCheckboxChange(e) {
    const role = e.target.dataset.role;
    const perm = e.target.dataset.perm;
    state[role][perm] = e.target.checked;
    updateDisplay();
  }

  function handleNumericInput(e) {
    const value = e.target.value;
    if (!/^[0-7]{1,4}$/.test(value)) return;

    const padded = value.padStart(3, '0').slice(-3);
    state.owner = numberToPerm(parseInt(padded[0]));
    state.group = numberToPerm(parseInt(padded[1]));
    state.others = numberToPerm(parseInt(padded[2]));

    updateCheckboxes();
    updateDisplay();
  }

  function applyPreset(preset) {
    state.owner = numberToPerm(parseInt(preset[0]));
    state.group = numberToPerm(parseInt(preset[1]));
    state.others = numberToPerm(parseInt(preset[2]));

    updateCheckboxes();
    updateDisplay();
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function copyValue(type) {
    let value;
    switch (type) {
      case 'numeric':
        value = elements.numericValue.value;
        break;
      case 'symbolic':
        value = elements.symbolicValue.textContent;
        break;
      case 'command':
        value = elements.commandValue.textContent;
        break;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        showToast('Copied to clipboard!', 'success');
      }).catch(() => {
        fallbackCopy(value);
      });
    } else {
      fallbackCopy(value);
    }
  }

  function reset() {
    state.owner = { r: true, w: true, x: true };
    state.group = { r: true, w: false, x: true };
    state.others = { r: true, w: false, x: true };
    updateCheckboxes();
    updateDisplay();
    showToast('Reset to 755', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      reset();
    }
  }

  function init() {
    initElements();

    elements.checkboxes.forEach(cb => {
      cb.addEventListener('change', handleCheckboxChange);
    });

    elements.numericValue.addEventListener('input', handleNumericInput);

    elements.copyBtns.forEach(btn => {
      btn.addEventListener('click', () => copyValue(btn.dataset.copy));
    });

    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', reset);
    }

    document.addEventListener('keydown', handleKeydown);

    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
