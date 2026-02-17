/**
 * KVSOVANREACH Border Radius Generator
 */

(function() {
  'use strict';

  const state = {
    tl: 20,
    tr: 20,
    bl: 20,
    br: 20,
    linked: false
  };

  const elements = {};

  function initElements() {
    elements.previewBox = document.getElementById('previewBox');
    elements.linkCorners = document.getElementById('linkCorners');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.sliders = document.querySelectorAll('.corner-slider');
    elements.numbers = document.querySelectorAll('.corner-number');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function updatePreview() {
    const radius = `${state.tl}px ${state.tr}px ${state.br}px ${state.bl}px`;
    elements.previewBox.style.borderRadius = radius;
    updateCSSOutput();
  }

  function updateCSSOutput() {
    let css;

    if (state.tl === state.tr && state.tr === state.br && state.br === state.bl) {
      css = `border-radius: ${state.tl}px;`;
    } else if (state.tl === state.br && state.tr === state.bl) {
      css = `border-radius: ${state.tl}px ${state.tr}px;`;
    } else if (state.tr === state.bl) {
      css = `border-radius: ${state.tl}px ${state.tr}px ${state.br}px;`;
    } else {
      css = `border-radius: ${state.tl}px ${state.tr}px ${state.br}px ${state.bl}px;`;
    }

    elements.cssOutput.textContent = css;
  }

  function setCornerValue(corner, value) {
    value = Math.max(0, Math.min(100, parseInt(value) || 0));

    if (state.linked) {
      state.tl = state.tr = state.bl = state.br = value;
      updateAllInputs(value);
    } else {
      state[corner] = value;
      updateCornerInputs(corner, value);
    }

    updatePreview();
  }

  function updateAllInputs(value) {
    elements.sliders.forEach(slider => slider.value = value);
    elements.numbers.forEach(number => number.value = value);
  }

  function updateCornerInputs(corner, value) {
    const slider = document.querySelector(`.corner-slider[data-corner="${corner}"]`);
    const number = document.querySelector(`.corner-number[data-corner="${corner}"]`);
    if (slider) slider.value = value;
    if (number) number.value = value;
  }

  function applyPreset(preset) {
    switch (preset) {
      case 'square':
        state.tl = state.tr = state.bl = state.br = 0;
        break;
      case 'rounded':
        state.tl = state.tr = state.bl = state.br = 20;
        break;
      case 'pill':
        state.tl = state.tr = state.bl = state.br = 100;
        break;
      case 'blob':
        state.tl = 30;
        state.tr = 70;
        state.bl = 70;
        state.br = 30;
        elements.linkCorners.checked = false;
        state.linked = false;
        break;
    }

    if (preset !== 'blob') {
      updateAllInputs(state.tl);
    } else {
      updateCornerInputs('tl', state.tl);
      updateCornerInputs('tr', state.tr);
      updateCornerInputs('bl', state.bl);
      updateCornerInputs('br', state.br);
    }

    updatePreview();
  }

  function copyCSS() {
    const css = elements.cssOutput.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(() => {
        showToast('CSS copied to clipboard!', 'success');
      }).catch(() => {
        fallbackCopy(css);
      });
    } else {
      fallbackCopy(css);
    }
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
      showToast('CSS copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function resetForm() {
    state.tl = state.tr = state.bl = state.br = 20;
    state.linked = true;
    elements.linkCorners.checked = true;
    updateAllInputs(20);
    updatePreview();
    showToast('Reset to default', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyCSS();
    }

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
    }
  }

  function init() {
    initElements();

    elements.sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        setCornerValue(e.target.dataset.corner, e.target.value);
      });
    });

    elements.numbers.forEach(number => {
      number.addEventListener('input', (e) => {
        setCornerValue(e.target.dataset.corner, e.target.value);
      });
    });

    elements.linkCorners.addEventListener('change', (e) => {
      state.linked = e.target.checked;
      if (state.linked) {
        setCornerValue('tl', state.tl);
      }
    });

    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    if (elements.copyBtn) {
      elements.copyBtn.addEventListener('click', copyCSS);
    }
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', resetForm);
    }
    document.addEventListener('keydown', handleKeydown);

    updatePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
