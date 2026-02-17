/**
 * KVSOVANREACH Aspect Ratio Visualizer Tool
 * Compare and calculate display aspect ratios
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    mode: 'width-to-height', // or 'height-to-width'
    inputValue: 1920,
    ratioW: 16,
    ratioH: 9
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.calcInput = document.getElementById('calcInput');
    elements.inputLabel = document.getElementById('inputLabel');
    elements.resultLabel = document.getElementById('resultLabel');
    elements.ratioW = document.getElementById('ratioW');
    elements.ratioH = document.getElementById('ratioH');
    elements.calcResult = document.getElementById('calcResult');
    elements.ratioPresets = document.querySelectorAll('.preset-btn');
    elements.resolutionPresets = document.querySelectorAll('.res-btn');
    elements.modeBtns = document.querySelectorAll('.tool-tab');
    elements.compareChecks = document.querySelectorAll('.compare-check input');
    elements.comparisonCanvas = document.getElementById('comparisonCanvas');
    elements.comparisonLegend = document.getElementById('comparisonLegend');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Core Functions ====================

  function calculate() {
    const inputValue = parseInt(elements.calcInput?.value) || 0;
    const ratioW = parseInt(elements.ratioW?.value) || 1;
    const ratioH = parseInt(elements.ratioH?.value) || 1;

    // Update state
    state.inputValue = inputValue;
    state.ratioW = ratioW;
    state.ratioH = ratioH;

    let result;
    if (state.mode === 'width-to-height') {
      // Calculate height from width
      result = Math.round((inputValue * ratioH) / ratioW);
    } else {
      // Calculate width from height
      result = Math.round((inputValue * ratioW) / ratioH);
    }

    if (elements.calcResult) {
      elements.calcResult.textContent = result || 0;
    }
  }

  function updateMode(mode) {
    state.mode = mode;

    // Update UI
    elements.modeBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'width-to-height') {
      if (elements.inputLabel) elements.inputLabel.textContent = 'Width (px)';
      if (elements.resultLabel) elements.resultLabel.textContent = 'Height (px)';
    } else {
      if (elements.inputLabel) elements.inputLabel.textContent = 'Height (px)';
      if (elements.resultLabel) elements.resultLabel.textContent = 'Width (px)';
    }

    calculate();
  }

  function swapMode() {
    const newMode = state.mode === 'width-to-height' ? 'height-to-width' : 'width-to-height';
    updateMode(newMode);
    showToast('Mode swapped', 'success');
  }

  function resetForm() {
    state.mode = 'width-to-height';
    state.inputValue = 1920;
    state.ratioW = 16;
    state.ratioH = 9;

    if (elements.calcInput) elements.calcInput.value = 1920;
    if (elements.ratioW) elements.ratioW.value = 16;
    if (elements.ratioH) elements.ratioH.value = 9;

    updateMode('width-to-height');

    elements.ratioPresets?.forEach(p => {
      p.classList.toggle('active', p.dataset.w === '16' && p.dataset.h === '9');
    });

    elements.compareChecks?.forEach((checkbox, index) => {
      checkbox.checked = index < 2;
    });

    updateComparison();
    showToast('Reset', 'success');
  }

  function updateComparison() {
    const canvas = elements.comparisonCanvas;
    const legend = elements.comparisonLegend;

    if (!canvas || !legend) return;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Clear existing boxes
    canvas.innerHTML = '';
    legend.innerHTML = '';

    // Get selected ratios
    const selectedRatios = [];
    elements.compareChecks?.forEach(checkbox => {
      if (checkbox.checked) {
        selectedRatios.push({
          w: parseInt(checkbox.dataset.w),
          h: parseInt(checkbox.dataset.h),
          color: checkbox.dataset.color
        });
      }
    });

    if (selectedRatios.length === 0) return;

    // Calculate max dimensions that fit in canvas
    const padding = 20;
    const maxWidth = canvasWidth - padding * 2;
    const maxHeight = canvasHeight - padding * 2;

    // Find the ratio that needs the most space
    let scale = Infinity;
    selectedRatios.forEach(ratio => {
      const scaleW = maxWidth / ratio.w;
      const scaleH = maxHeight / ratio.h;
      scale = Math.min(scale, scaleW, scaleH);
    });

    // Render boxes
    selectedRatios.forEach(ratio => {
      const boxWidth = ratio.w * scale;
      const boxHeight = ratio.h * scale;

      const box = document.createElement('div');
      box.className = 'ratio-box';
      box.style.width = `${boxWidth}px`;
      box.style.height = `${boxHeight}px`;
      box.style.borderColor = ratio.color;
      box.style.color = ratio.color;
      box.innerHTML = `${ratio.w}:${ratio.h}`;

      canvas.appendChild(box);

      // Add legend item
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-color" style="background-color: ${ratio.color}"></span>
        <span>${ratio.w}:${ratio.h} (${Math.round(boxWidth)}x${Math.round(boxHeight)})</span>
      `;
      legend.appendChild(legendItem);
    });
  }

  function applyResolution(width, height) {
    // Calculate the GCD to get the aspect ratio
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    // Set values
    if (elements.calcInput) elements.calcInput.value = width;
    if (elements.ratioW) elements.ratioW.value = ratioW;
    if (elements.ratioH) elements.ratioH.value = ratioH;

    // Update state
    state.inputValue = width;
    state.ratioW = ratioW;
    state.ratioH = ratioH;

    // Update active preset
    elements.ratioPresets?.forEach(p => {
      p.classList.toggle('active',
        parseInt(p.dataset.w) === ratioW && parseInt(p.dataset.h) === ratioH
      );
    });

    calculate();
    showToast(`${width}x${height}`, 'success');
  }

  function handlePresetClick(e) {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;

    elements.ratioPresets?.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    if (elements.ratioW) elements.ratioW.value = btn.dataset.w;
    if (elements.ratioH) elements.ratioH.value = btn.dataset.h;

    // Update state
    state.ratioW = parseInt(btn.dataset.w);
    state.ratioH = parseInt(btn.dataset.h);

    calculate();
  }

  function handleResolutionClick(e) {
    const btn = e.target.closest('.res-btn');
    if (!btn) return;

    const width = parseInt(btn.dataset.w);
    const height = parseInt(btn.dataset.h);
    applyResolution(width, height);
  }

  function handleModeClick(e) {
    const btn = e.target.closest('.tool-tab');
    if (!btn) return;

    updateMode(btn.dataset.mode);
  }

  function handleInputChange() {
    calculate();

    // Update active preset if matches
    const ratioW = elements.ratioW?.value;
    const ratioH = elements.ratioH?.value;

    elements.ratioPresets?.forEach(p => {
      p.classList.toggle('active',
        p.dataset.w === ratioW && p.dataset.h === ratioH
      );
    });
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault();
        swapMode();
        break;
      case 'r':
        e.preventDefault();
        resetForm();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
    calculate();
    updateComparison();

    // Update comparison on resize
    window.addEventListener('resize', ToolsCommon?.debounce?.(updateComparison, 200) || updateComparison);
  }

  function setupEventListeners() {
    // Calculator inputs
    elements.calcInput?.addEventListener('input', handleInputChange);
    elements.ratioW?.addEventListener('input', handleInputChange);
    elements.ratioH?.addEventListener('input', handleInputChange);

    // Mode buttons
    elements.modeBtns?.forEach(btn => {
      btn.addEventListener('click', handleModeClick);
    });

    // Presets
    elements.ratioPresets?.forEach(btn => {
      btn.addEventListener('click', handlePresetClick);
    });

    // Resolution presets
    elements.resolutionPresets?.forEach(btn => {
      btn.addEventListener('click', handleResolutionClick);
    });

    // Comparison checkboxes
    elements.compareChecks?.forEach(checkbox => {
      checkbox.addEventListener('change', updateComparison);
    });

    // Header actions
    elements.resetBtn?.addEventListener('click', resetForm);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
