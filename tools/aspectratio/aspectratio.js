/**
 * KVSOVANREACH Aspect Ratio Visualizer Tool
 * Compare and calculate display aspect ratios
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    mode: 'width-to-height' // or 'height-to-width'
  };

  // ==================== DOM Elements ====================
  const elements = {
    calcInput: document.getElementById('calcInput'),
    inputLabel: document.getElementById('inputLabel'),
    resultLabel: document.getElementById('resultLabel'),
    ratioW: document.getElementById('ratioW'),
    ratioH: document.getElementById('ratioH'),
    calcResult: document.getElementById('calcResult'),
    ratioPresets: document.querySelectorAll('.ratio-preset'),
    resolutionPresets: document.querySelectorAll('.resolution-preset'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    compareChecks: document.querySelectorAll('.compare-check input'),
    comparisonCanvas: document.getElementById('comparisonCanvas'),
    comparisonLegend: document.getElementById('comparisonLegend'),
    swapBtn: document.getElementById('swapBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  // ==================== Core Functions ====================

  function calculate() {
    const inputValue = parseInt(elements.calcInput.value) || 0;
    const ratioW = parseInt(elements.ratioW.value) || 1;
    const ratioH = parseInt(elements.ratioH.value) || 1;

    let result;
    if (state.mode === 'width-to-height') {
      // Calculate height from width
      result = Math.round((inputValue * ratioH) / ratioW);
    } else {
      // Calculate width from height
      result = Math.round((inputValue * ratioW) / ratioH);
    }

    elements.calcResult.textContent = result || 0;
  }

  function updateMode(mode) {
    state.mode = mode;

    // Update UI
    elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'width-to-height') {
      elements.inputLabel.textContent = 'Width (px)';
      elements.resultLabel.textContent = 'Height (px)';
    } else {
      elements.inputLabel.textContent = 'Height (px)';
      elements.resultLabel.textContent = 'Width (px)';
    }

    calculate();
  }

  function swapMode() {
    const newMode = state.mode === 'width-to-height' ? 'height-to-width' : 'width-to-height';
    updateMode(newMode);
    ToolsCommon.Toast.show('Calculation mode swapped', 'success');
  }

  function reset() {
    // Reset to defaults
    elements.calcInput.value = 1920;
    elements.ratioW.value = 16;
    elements.ratioH.value = 9;
    updateMode('width-to-height');

    // Reset ratio presets
    elements.ratioPresets.forEach(p => {
      p.classList.toggle('active', p.dataset.w === '16' && p.dataset.h === '9');
    });

    // Reset comparison checkboxes
    elements.compareChecks.forEach((checkbox, index) => {
      checkbox.checked = index < 2; // First two checked by default
    });

    updateComparison();
    ToolsCommon.Toast.show('Reset to defaults', 'success');
  }

  function updateComparison() {
    const canvas = elements.comparisonCanvas;
    const legend = elements.comparisonLegend;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Clear existing boxes
    canvas.innerHTML = '';
    legend.innerHTML = '';

    // Get selected ratios
    const selectedRatios = [];
    elements.compareChecks.forEach(checkbox => {
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
        <span>${ratio.w}:${ratio.h} (${Math.round(boxWidth)}×${Math.round(boxHeight)})</span>
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
    elements.calcInput.value = width;
    elements.ratioW.value = ratioW;
    elements.ratioH.value = ratioH;

    // Update active preset
    elements.ratioPresets.forEach(p => {
      p.classList.toggle('active',
        parseInt(p.dataset.w) === ratioW && parseInt(p.dataset.h) === ratioH
      );
    });

    calculate();
    ToolsCommon.Toast.show(`Applied ${width}×${height} (${ratioW}:${ratioH})`, 'success');
  }

  // ==================== Event Handlers ====================

  function handlePresetClick(e) {
    const btn = e.target.closest('.ratio-preset');
    if (!btn) return;

    elements.ratioPresets.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    elements.ratioW.value = btn.dataset.w;
    elements.ratioH.value = btn.dataset.h;
    calculate();
  }

  function handleResolutionClick(e) {
    const btn = e.target.closest('.resolution-preset');
    if (!btn) return;

    const width = parseInt(btn.dataset.w);
    const height = parseInt(btn.dataset.h);
    applyResolution(width, height);
  }

  function handleModeClick(e) {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;

    updateMode(btn.dataset.mode);
  }

  function handleInputChange() {
    calculate();

    // Update active preset if matches
    const ratioW = elements.ratioW.value;
    const ratioH = elements.ratioH.value;

    elements.ratioPresets.forEach(p => {
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
        reset();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    calculate();
    updateComparison();

    // Update comparison on resize
    window.addEventListener('resize', ToolsCommon.debounce(updateComparison, 200));
  }

  function setupEventListeners() {
    // Calculator inputs
    elements.calcInput?.addEventListener('input', handleInputChange);
    elements.ratioW?.addEventListener('input', handleInputChange);
    elements.ratioH?.addEventListener('input', handleInputChange);

    // Mode buttons
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', handleModeClick);
    });

    // Presets
    elements.ratioPresets.forEach(btn => {
      btn.addEventListener('click', handlePresetClick);
    });

    // Resolution presets
    elements.resolutionPresets.forEach(btn => {
      btn.addEventListener('click', handleResolutionClick);
    });

    // Comparison checkboxes
    elements.compareChecks.forEach(checkbox => {
      checkbox.addEventListener('change', updateComparison);
    });

    // Header actions
    elements.swapBtn?.addEventListener('click', swapMode);
    elements.resetBtn?.addEventListener('click', reset);

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
