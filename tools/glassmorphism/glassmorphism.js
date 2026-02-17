/**
 * KVSOVANREACH Glassmorphism Generator Tool
 * Create glassmorphism UI effects with live preview
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    blur: 10,
    transparency: 0.25,
    saturation: 180,
    border: 0.18,
    radius: 16,
    bgColor: '#ffffff'
  };

  // ==================== Presets ====================
  const PRESETS = {
    light: {
      blur: 10,
      transparency: 0.25,
      saturation: 180,
      border: 0.18,
      radius: 16,
      bgColor: '#ffffff'
    },
    dark: {
      blur: 12,
      transparency: 0.15,
      saturation: 120,
      border: 0.1,
      radius: 16,
      bgColor: '#1a1a1a'
    },
    frosted: {
      blur: 20,
      transparency: 0.3,
      saturation: 200,
      border: 0.25,
      radius: 20,
      bgColor: '#ffffff'
    },
    subtle: {
      blur: 5,
      transparency: 0.1,
      saturation: 150,
      border: 0.05,
      radius: 12,
      bgColor: '#ffffff'
    }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.glassCard = document.getElementById('glassCard');
    elements.blurSlider = document.getElementById('blurSlider');
    elements.blurValue = document.getElementById('blurValue');
    elements.transparencySlider = document.getElementById('transparencySlider');
    elements.transparencyValue = document.getElementById('transparencyValue');
    elements.saturationSlider = document.getElementById('saturationSlider');
    elements.saturationValue = document.getElementById('saturationValue');
    elements.borderSlider = document.getElementById('borderSlider');
    elements.borderValue = document.getElementById('borderValue');
    elements.radiusSlider = document.getElementById('radiusSlider');
    elements.radiusValue = document.getElementById('radiusValue');
    elements.bgColor = document.getElementById('bgColor');
    elements.bgColorText = document.getElementById('bgColorText');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.warningSection = document.getElementById('warningSection');
  }

  // ==================== UI Helpers ====================
  const showToast = (message, type) => ToolsCommon?.showToast?.(message, type);

  // ==================== Core Functions ====================

  /**
   * Convert hex to RGB
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  /**
   * Generate CSS code
   */
  function generateCSS() {
    const rgb = hexToRgb(state.bgColor);

    return `.glass-effect {
  background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.transparency});
  backdrop-filter: blur(${state.blur}px) saturate(${state.saturation}%);
  -webkit-backdrop-filter: blur(${state.blur}px) saturate(${state.saturation}%);
  border-radius: ${state.radius}px;
  border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.border});
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}`;
  }

  /**
   * Check accessibility
   */
  function checkAccessibility() {
    // Warn if transparency is too high (low contrast)
    const lowContrast = state.transparency > 0.6;
    elements.warningSection.classList.toggle('hidden', !lowContrast);
  }

  // ==================== UI Functions ====================

  function updatePreview() {
    const rgb = hexToRgb(state.bgColor);

    elements.glassCard.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.transparency})`;
    elements.glassCard.style.backdropFilter = `blur(${state.blur}px) saturate(${state.saturation}%)`;
    elements.glassCard.style.webkitBackdropFilter = `blur(${state.blur}px) saturate(${state.saturation}%)`;
    elements.glassCard.style.borderRadius = `${state.radius}px`;
    elements.glassCard.style.border = `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.border})`;

    // Update CSS output
    elements.cssOutput.textContent = generateCSS();

    // Check accessibility
    checkAccessibility();
  }

  function updateUI() {
    // Update slider positions
    elements.blurSlider.value = state.blur;
    elements.transparencySlider.value = state.transparency * 100;
    elements.saturationSlider.value = state.saturation;
    elements.borderSlider.value = state.border * 100;
    elements.radiusSlider.value = state.radius;
    elements.bgColor.value = state.bgColor;
    elements.bgColorText.value = state.bgColor;

    // Update value displays
    elements.blurValue.textContent = `${state.blur}px`;
    elements.transparencyValue.textContent = state.transparency.toFixed(2);
    elements.saturationValue.textContent = `${state.saturation}%`;
    elements.borderValue.textContent = state.border.toFixed(2);
    elements.radiusValue.textContent = `${state.radius}px`;

    updatePreview();
  }

  function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (preset) {
      Object.assign(state, preset);
      updateUI();
      const name = presetName.charAt(0).toUpperCase() + presetName.slice(1);
      showToast(`${name} preset applied`, 'success');
    }
  }

  function reset() {
    Object.assign(state, PRESETS.light);
    updateUI();
    showToast('Reset', 'success');
  }

  function copyCSS() {
    ToolsCommon?.copyWithToast?.(generateCSS(), 'CSS copied!');
  }

  // ==================== Event Handlers ====================

  function handleSliderChange(slider, property, transform = v => v) {
    const value = transform(parseFloat(slider.value));
    state[property] = value;
    updateUI();
  }

  // ==================== Event Listeners ====================

  function initEventListeners() {
    // Slider event listeners
    elements.blurSlider.addEventListener('input', () => {
      handleSliderChange(elements.blurSlider, 'blur');
    });

    elements.transparencySlider.addEventListener('input', () => {
      handleSliderChange(elements.transparencySlider, 'transparency', v => v / 100);
    });

    elements.saturationSlider.addEventListener('input', () => {
      handleSliderChange(elements.saturationSlider, 'saturation');
    });

    elements.borderSlider.addEventListener('input', () => {
      handleSliderChange(elements.borderSlider, 'border', v => v / 100);
    });

    elements.radiusSlider.addEventListener('input', () => {
      handleSliderChange(elements.radiusSlider, 'radius');
    });

    // Color inputs
    elements.bgColor.addEventListener('input', () => {
      state.bgColor = elements.bgColor.value;
      elements.bgColorText.value = state.bgColor;
      updatePreview();
    });

    elements.bgColorText.addEventListener('input', () => {
      const value = elements.bgColorText.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        state.bgColor = value;
        elements.bgColor.value = value;
        updatePreview();
      }
    });

    // Preset buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Action buttons
    elements.resetBtn.addEventListener('click', reset);
    elements.copyBtn.addEventListener('click', copyCSS);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case 'c':
          copyCSS();
          break;
        case 'r':
          reset();
          break;
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    initEventListeners();

    // Initial render
    updateUI();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
