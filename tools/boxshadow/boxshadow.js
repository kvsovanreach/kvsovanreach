/**
 * KVSOVANREACH Box Shadow Generator
 */

(function() {
  'use strict';

  const state = {
    hOffset: 10,
    vOffset: 10,
    blur: 20,
    spread: 0,
    color: '#000000',
    opacity: 25,
    inset: false
  };

  const elements = {};

  function initElements() {
    elements.previewBox = document.getElementById('previewBox');
    elements.hOffset = document.getElementById('hOffset');
    elements.vOffset = document.getElementById('vOffset');
    elements.blur = document.getElementById('blur');
    elements.spread = document.getElementById('spread');
    elements.shadowColor = document.getElementById('shadowColor');
    elements.opacity = document.getElementById('opacity');
    elements.inset = document.getElementById('inset');
    elements.hOffsetValue = document.getElementById('hOffsetValue');
    elements.vOffsetValue = document.getElementById('vOffsetValue');
    elements.blurValue = document.getElementById('blurValue');
    elements.spreadValue = document.getElementById('spreadValue');
    elements.opacityValue = document.getElementById('opacityValue');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  function generateShadowCSS() {
    const inset = state.inset ? 'inset ' : '';
    const color = hexToRgba(state.color, state.opacity);
    return `${inset}${state.hOffset}px ${state.vOffset}px ${state.blur}px ${state.spread}px ${color}`;
  }

  function updatePreview() {
    const shadow = generateShadowCSS();
    elements.previewBox.style.boxShadow = shadow;
    elements.cssOutput.textContent = `box-shadow: ${shadow};`;
  }

  function updateValues() {
    elements.hOffsetValue.textContent = `${state.hOffset}px`;
    elements.vOffsetValue.textContent = `${state.vOffset}px`;
    elements.blurValue.textContent = `${state.blur}px`;
    elements.spreadValue.textContent = `${state.spread}px`;
    elements.opacityValue.textContent = `${state.opacity}%`;
  }

  function handleSliderChange(e) {
    const id = e.target.id;
    const value = parseInt(e.target.value);

    switch(id) {
      case 'hOffset': state.hOffset = value; break;
      case 'vOffset': state.vOffset = value; break;
      case 'blur': state.blur = value; break;
      case 'spread': state.spread = value; break;
      case 'opacity': state.opacity = value; break;
    }

    updateValues();
    updatePreview();
  }

  function handleColorChange(e) {
    state.color = e.target.value;
    updatePreview();
  }

  function handleInsetChange(e) {
    state.inset = e.target.checked;
    updatePreview();
  }

  function handleReset() {
    state.hOffset = 10;
    state.vOffset = 10;
    state.blur = 20;
    state.spread = 0;
    state.color = '#000000';
    state.opacity = 25;
    state.inset = false;

    elements.hOffset.value = 10;
    elements.vOffset.value = 10;
    elements.blur.value = 20;
    elements.spread.value = 0;
    elements.shadowColor.value = '#000000';
    elements.opacity.value = 25;
    elements.inset.checked = false;

    updateValues();
    updatePreview();
    showToast('Reset to defaults', 'success');
  }

  function handleCopy() {
    const css = elements.cssOutput.textContent;
    ToolsCommon.copyWithToast(css, 'CSS copied!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;
    switch(e.key.toLowerCase()) {
      case 'c': e.preventDefault(); handleCopy(); break;
      case 'r': e.preventDefault(); handleReset(); break;
    }
  }

  function init() {
    initElements();

    elements.hOffset.addEventListener('input', handleSliderChange);
    elements.vOffset.addEventListener('input', handleSliderChange);
    elements.blur.addEventListener('input', handleSliderChange);
    elements.spread.addEventListener('input', handleSliderChange);
    elements.opacity.addEventListener('input', handleSliderChange);
    elements.shadowColor.addEventListener('input', handleColorChange);
    elements.inset.addEventListener('change', handleInsetChange);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.resetBtn.addEventListener('click', handleReset);
    document.addEventListener('keydown', handleKeydown);

    updateValues();
    updatePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
