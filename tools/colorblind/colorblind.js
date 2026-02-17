/**
 * KVSOVANREACH Color Blindness Simulator
 */

(function() {
  'use strict';

  const elements = {};

  const DEFAULT_COLOR = '#3776a1';

  function initElements() {
    elements.colorPicker = document.getElementById('colorPicker');
    elements.colorHex = document.getElementById('colorHex');
    elements.originalColor = document.getElementById('originalColor');
    elements.originalHex = document.getElementById('originalHex');
    elements.protanopiaColor = document.getElementById('protanopiaColor');
    elements.deuteranopiaColor = document.getElementById('deuteranopiaColor');
    elements.tritanopiaColor = document.getElementById('tritanopiaColor');
    elements.achromatopsiaColor = document.getElementById('achromatopsiaColor');
    elements.protanomalyColor = document.getElementById('protanomalyColor');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function simulateColorBlindness(rgb, type) {
    let { r, g, b } = rgb;
    r /= 255; g /= 255; b /= 255;

    let simR, simG, simB;

    switch (type) {
      case 'protanopia':
        simR = 0.567 * r + 0.433 * g + 0.0 * b;
        simG = 0.558 * r + 0.442 * g + 0.0 * b;
        simB = 0.0 * r + 0.242 * g + 0.758 * b;
        break;
      case 'deuteranopia':
        simR = 0.625 * r + 0.375 * g + 0.0 * b;
        simG = 0.7 * r + 0.3 * g + 0.0 * b;
        simB = 0.0 * r + 0.3 * g + 0.7 * b;
        break;
      case 'tritanopia':
        simR = 0.95 * r + 0.05 * g + 0.0 * b;
        simG = 0.0 * r + 0.433 * g + 0.567 * b;
        simB = 0.0 * r + 0.475 * g + 0.525 * b;
        break;
      case 'achromatopsia':
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        simR = simG = simB = gray;
        break;
      case 'protanomaly':
        simR = 0.817 * r + 0.183 * g + 0.0 * b;
        simG = 0.333 * r + 0.667 * g + 0.0 * b;
        simB = 0.0 * r + 0.125 * g + 0.875 * b;
        break;
      default:
        simR = r; simG = g; simB = b;
    }

    return {
      r: Math.round(simR * 255),
      g: Math.round(simG * 255),
      b: Math.round(simB * 255)
    };
  }

  function updateSimulations(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    elements.originalColor.style.backgroundColor = hex;
    elements.originalHex.textContent = hex.toUpperCase();

    const types = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia', 'protanomaly'];

    types.forEach(type => {
      const simRgb = simulateColorBlindness(rgb, type);
      const simHex = rgbToHex(simRgb.r, simRgb.g, simRgb.b);
      elements[type + 'Color'].style.backgroundColor = simHex;
    });
  }

  function handleColorChange(e) {
    const hex = e.target.value;
    elements.colorHex.value = hex;
    updateSimulations(hex);
  }

  function handleHexInput(e) {
    let hex = e.target.value;
    if (!hex.startsWith('#')) hex = '#' + hex;

    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      elements.colorPicker.value = hex;
      updateSimulations(hex);
    }
  }

  function reset() {
    elements.colorPicker.value = DEFAULT_COLOR;
    elements.colorHex.value = DEFAULT_COLOR;
    updateSimulations(DEFAULT_COLOR);
    showToast('Reset to default', 'success');
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

    elements.colorPicker.addEventListener('input', handleColorChange);
    elements.colorHex.addEventListener('input', handleHexInput);

    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', reset);
    }

    document.addEventListener('keydown', handleKeydown);

    updateSimulations(elements.colorPicker.value);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
