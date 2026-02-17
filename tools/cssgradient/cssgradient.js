/**
 * KVSOVANREACH CSS Gradient Generator
 * Create beautiful CSS gradients visually
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    type: 'linear',
    angle: 90,
    colorStops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ]
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.preview = document.getElementById('gradientPreview');
    elements.typeButtons = document.querySelectorAll('.type-btn');
    elements.angleSection = document.getElementById('angleSection');
    elements.angleSlider = document.getElementById('angleSlider');
    elements.angleValue = document.getElementById('angleValue');
    elements.colorStops = document.getElementById('colorStops');
    elements.addColorBtn = document.getElementById('addColorBtn');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.randomBtn = document.getElementById('randomBtn');
  }

  // ==================== UI Helpers ====================
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Gradient Functions ====================
  function generateGradientCSS() {
    const stops = state.colorStops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (state.type === 'linear') {
      return `linear-gradient(${state.angle}deg, ${stops})`;
    } else {
      return `radial-gradient(circle, ${stops})`;
    }
  }

  function updatePreview() {
    const gradient = generateGradientCSS();
    elements.preview.style.background = gradient;
    elements.cssOutput.textContent = `background: ${gradient};`;
  }

  function renderColorStops() {
    elements.colorStops.innerHTML = '';

    state.colorStops.forEach((stop, index) => {
      const stopEl = document.createElement('div');
      stopEl.className = 'color-stop';
      stopEl.innerHTML = `
        <input type="color" value="${stop.color}" data-index="${index}">
        <input type="number" value="${stop.position}" min="0" max="100" data-index="${index}">
        <span class="percent-sign">%</span>
        <button class="remove-btn" data-index="${index}" title="Remove" ${state.colorStops.length <= 2 ? 'disabled' : ''}>
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      elements.colorStops.appendChild(stopEl);
    });

    // Add event listeners
    elements.colorStops.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', handleColorChange);
    });

    elements.colorStops.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('input', handlePositionChange);
    });

    elements.colorStops.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', handleRemoveColor);
    });
  }

  function addColorStop() {
    const lastPosition = state.colorStops[state.colorStops.length - 1].position;
    const newPosition = Math.min(lastPosition + 10, 100);
    const newColor = getRandomColor();

    state.colorStops.push({ color: newColor, position: newPosition });
    renderColorStops();
    updatePreview();
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function generateRandomGradient() {
    const numStops = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    state.colorStops = [];

    for (let i = 0; i < numStops; i++) {
      state.colorStops.push({
        color: getRandomColor(),
        position: Math.round((i / (numStops - 1)) * 100)
      });
    }

    state.angle = Math.floor(Math.random() * 360);
    elements.angleSlider.value = state.angle;
    elements.angleValue.textContent = `${state.angle}°`;

    renderColorStops();
    updatePreview();
    showToast('Random gradient generated!', 'success');
  }

  // ==================== Event Handlers ====================
  function handleTypeChange(e) {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;

    elements.typeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    state.type = btn.dataset.type;
    elements.angleSection.style.display = state.type === 'linear' ? 'block' : 'none';

    updatePreview();
  }

  function handleAngleChange(e) {
    state.angle = parseInt(e.target.value);
    elements.angleValue.textContent = `${state.angle}°`;
    updatePreview();
  }

  function handleColorChange(e) {
    const index = parseInt(e.target.dataset.index);
    state.colorStops[index].color = e.target.value;
    updatePreview();
  }

  function handlePositionChange(e) {
    const index = parseInt(e.target.dataset.index);
    let value = parseInt(e.target.value) || 0;
    value = Math.max(0, Math.min(100, value));
    e.target.value = value;
    state.colorStops[index].position = value;
    updatePreview();
  }

  function handleRemoveColor(e) {
    if (state.colorStops.length <= 2) return;

    const index = parseInt(e.target.closest('.remove-btn').dataset.index);
    state.colorStops.splice(index, 1);
    renderColorStops();
    updatePreview();
  }

  function handleCopy() {
    const css = elements.cssOutput.textContent;
    ToolsCommon.copyWithToast(css, 'CSS copied!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    switch(e.key.toLowerCase()) {
      case 'r':
        e.preventDefault();
        generateRandomGradient();
        break;
      case 'c':
        e.preventDefault();
        handleCopy();
        break;
      case 't':
        e.preventDefault();
        const nextType = state.type === 'linear' ? 'radial' : 'linear';
        const btn = document.querySelector(`.type-btn[data-type="${nextType}"]`);
        btn?.click();
        break;
    }
  }

  // ==================== Initialize ====================
  function init() {
    initElements();

    // Event listeners
    elements.typeButtons.forEach(btn => {
      btn.addEventListener('click', handleTypeChange);
    });

    elements.angleSlider.addEventListener('input', handleAngleChange);
    elements.addColorBtn.addEventListener('click', addColorStop);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.randomBtn.addEventListener('click', generateRandomGradient);

    document.addEventListener('keydown', handleKeydown);

    // Initial render
    renderColorStops();
    updatePreview();
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
