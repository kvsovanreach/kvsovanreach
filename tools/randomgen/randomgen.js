/**
 * KVSOVANREACH Random Generator Tool
 * Generate random numbers with advanced options
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    currentNumbers: []
  };

  // ==================== Presets ====================
  const PRESETS = {
    dice: { min: 1, max: 6, quantity: 1, decimals: 0 },
    coin: { min: 0, max: 1, quantity: 1, decimals: 0 },
    lottery: { min: 1, max: 49, quantity: 6, decimals: 0, unique: true, sorted: true },
    percent: { min: 0, max: 100, quantity: 1, decimals: 2 },
    binary: { min: 0, max: 1, quantity: 8, decimals: 0 },
    pin: { min: 0, max: 9999, quantity: 1, decimals: 0 }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.minValue = document.getElementById('minValue');
    elements.maxValue = document.getElementById('maxValue');
    elements.quantity = document.getElementById('quantity');
    elements.decimals = document.getElementById('decimals');
    elements.uniqueOnly = document.getElementById('uniqueOnly');
    elements.sorted = document.getElementById('sorted');
    elements.evenOnly = document.getElementById('evenOnly');
    elements.oddOnly = document.getElementById('oddOnly');
    elements.generateBtn = document.getElementById('generateBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resultsDisplay = document.getElementById('resultsDisplay');
    elements.resultCount = document.getElementById('resultCount');
    elements.statsSection = document.getElementById('statsSection');
    elements.statSum = document.getElementById('statSum');
    elements.statAvg = document.getElementById('statAvg');
    elements.statMin = document.getElementById('statMin');
    elements.statMax = document.getElementById('statMax');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
  }

  // ==================== UI Helpers ====================
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Core Functions ====================

  /**
   * Get cryptographically secure random number
   */
  function secureRandom() {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] / (0xFFFFFFFF + 1);
    }
    return Math.random();
  }

  /**
   * Generate random number in range
   */
  function randomInRange(min, max, decimals) {
    const range = max - min;
    const value = min + secureRandom() * range;

    if (decimals === 0) {
      return Math.floor(value);
    }
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Generate random numbers with options
   */
  function generateNumbers(options) {
    const { min, max, quantity, decimals, unique, sorted, evenOnly, oddOnly } = options;
    const numbers = [];

    // Check if unique is possible
    if (unique && decimals === 0) {
      const range = max - min + 1;
      let possibleCount = range;

      if (evenOnly) {
        possibleCount = Math.floor((max - min) / 2) + (min % 2 === 0 ? 1 : 0);
      } else if (oddOnly) {
        possibleCount = Math.floor((max - min) / 2) + (min % 2 !== 0 ? 1 : 0);
      }

      if (quantity > possibleCount) {
        throw new Error(`Cannot generate ${quantity} unique numbers in range ${min}-${max}${evenOnly ? ' (even only)' : ''}${oddOnly ? ' (odd only)' : ''}`);
      }
    }

    const maxAttempts = quantity * 100;
    let attempts = 0;

    while (numbers.length < quantity && attempts < maxAttempts) {
      attempts++;
      let num = randomInRange(min, max + (decimals > 0 ? 0 : 1), decimals);

      // Apply even/odd filter
      if (decimals === 0) {
        if (evenOnly && num % 2 !== 0) continue;
        if (oddOnly && num % 2 === 0) continue;
      }

      // Apply unique filter
      if (unique && numbers.includes(num)) continue;

      numbers.push(num);
    }

    if (numbers.length < quantity) {
      throw new Error('Could not generate enough numbers with the given constraints.');
    }

    // Sort if requested
    if (sorted) {
      numbers.sort((a, b) => a - b);
    }

    return numbers;
  }

  /**
   * Calculate statistics
   */
  function calculateStats(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    return { sum, avg, min, max };
  }

  // ==================== UI Functions ====================

  function displayNumbers(numbers) {
    state.currentNumbers = numbers;
    elements.resultCount.textContent = numbers.length;

    if (numbers.length === 0) {
      elements.resultsDisplay.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-dice"></i>
          <p>Click Generate to create random numbers</p>
        </div>
      `;
      elements.statsSection.classList.add('hidden');
      return;
    }

    const html = `
      <div class="numbers-grid">
        ${numbers.map((n, i) => `<span class="number-item" style="animation-delay: ${i * 0.02}s">${n}</span>`).join('')}
      </div>
    `;
    elements.resultsDisplay.innerHTML = html;

    // Show statistics
    const stats = calculateStats(numbers);
    elements.statSum.textContent = stats.sum.toLocaleString();
    elements.statAvg.textContent = stats.avg.toFixed(2);
    elements.statMin.textContent = stats.min;
    elements.statMax.textContent = stats.max;
    elements.statsSection.classList.remove('hidden');
  }

  function generate() {
    try {
      const options = {
        min: parseFloat(elements.minValue.value) || 0,
        max: parseFloat(elements.maxValue.value) || 100,
        quantity: parseInt(elements.quantity.value) || 1,
        decimals: parseInt(elements.decimals.value) || 0,
        unique: elements.uniqueOnly.checked,
        sorted: elements.sorted.checked,
        evenOnly: elements.evenOnly.checked,
        oddOnly: elements.oddOnly.checked
      };

      // Validate
      if (options.min > options.max) {
        showToast('Min must be less than Max', 'error');
        return;
      }

      if (options.quantity < 1 || options.quantity > 1000) {
        showToast('Quantity must be between 1 and 1000', 'error');
        return;
      }

      if (options.evenOnly && options.oddOnly) {
        showToast('Cannot have both even and odd only', 'error');
        return;
      }

      const numbers = generateNumbers(options);
      displayNumbers(numbers);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  function copyAll() {
    if (state.currentNumbers.length > 0) {
      ToolsCommon.copyWithToast(state.currentNumbers.join(', '), 'Numbers copied!');
    } else {
      showToast('No numbers to copy', 'error');
    }
  }

  function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;

    elements.minValue.value = preset.min;
    elements.maxValue.value = preset.max;
    elements.quantity.value = preset.quantity;
    elements.decimals.value = preset.decimals;
    elements.uniqueOnly.checked = preset.unique || false;
    elements.sorted.checked = preset.sorted || false;
    elements.evenOnly.checked = false;
    elements.oddOnly.checked = false;

    generate();
  }

  // ==================== Event Listeners ====================

  function initEventListeners() {
    // Generate and copy buttons
    elements.generateBtn.addEventListener('click', generate);
    elements.copyBtn.addEventListener('click', copyAll);

    // Mutually exclusive even/odd
    elements.evenOnly.addEventListener('change', () => {
      if (elements.evenOnly.checked) elements.oddOnly.checked = false;
    });
    elements.oddOnly.addEventListener('change', () => {
      if (elements.oddOnly.checked) elements.evenOnly.checked = false;
    });

    // Preset buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.matches('input, select')) {
        e.preventDefault();
        generate();
      }
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.target.matches('input')) {
        copyAll();
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    initEventListeners();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
