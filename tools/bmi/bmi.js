/**
 * KVSOVANREACH BMI Calculator Tool
 * Calculate Body Mass Index with metric or imperial units
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    currentUnit: 'metric',
    lastBmi: null,
    lastHeightM: null
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.unitBtns = document.querySelectorAll('.bmi-tab');

    // Input containers
    elements.metricInputs = document.getElementById('metricInputs');
    elements.imperialInputs = document.getElementById('imperialInputs');

    // Metric inputs
    elements.heightCm = document.getElementById('heightCm');
    elements.weightKg = document.getElementById('weightKg');

    // Imperial inputs
    elements.heightFt = document.getElementById('heightFt');
    elements.heightIn = document.getElementById('heightIn');
    elements.weightLbs = document.getElementById('weightLbs');

    // Results
    elements.calculateBtn = document.getElementById('calculateBtn');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.bmiValue = document.getElementById('bmiValue');
    elements.bmiCategory = document.getElementById('bmiCategory');
    elements.scaleMarker = document.getElementById('scaleMarker');
    elements.healthyWeight = document.getElementById('healthyWeight');

    // Header actions
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== BMI Calculation ====================
  function calculateBMI() {
    let heightM, weightKg;

    if (state.currentUnit === 'metric') {
      const heightCm = parseFloat(elements.heightCm.value);
      weightKg = parseFloat(elements.weightKg.value);

      if (!heightCm || !weightKg) {
        ToolsCommon.showToast('Please enter height and weight', 'error');
        return;
      }

      heightM = heightCm / 100;
    } else {
      const feet = parseFloat(elements.heightFt.value) || 0;
      const inches = parseFloat(elements.heightIn.value) || 0;
      const lbs = parseFloat(elements.weightLbs.value);

      if ((!feet && !inches) || !lbs) {
        ToolsCommon.showToast('Please enter height and weight', 'error');
        return;
      }

      // Convert to metric
      const totalInches = (feet * 12) + inches;
      heightM = totalInches * 0.0254;
      weightKg = lbs * 0.453592;
    }

    // Calculate BMI
    const bmi = weightKg / (heightM * heightM);

    if (bmi < 10 || bmi > 60) {
      ToolsCommon.showToast('Please enter valid values', 'error');
      return;
    }

    // Store for later use
    state.lastBmi = bmi;
    state.lastHeightM = heightM;

    displayResults(bmi, heightM);
  }

  // ==================== Display Results ====================
  function displayResults(bmi, heightM) {
    // Show results section
    elements.resultsSection.classList.remove('hidden');

    // Update BMI value
    elements.bmiValue.textContent = bmi.toFixed(1);

    // Determine category
    const { category, className } = getBMICategory(bmi);
    elements.bmiCategory.textContent = category;
    elements.bmiCategory.className = 'bmi-category ' + className;

    // Update scale marker
    updateScale(bmi);

    // Calculate healthy weight range
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;

    if (state.currentUnit === 'metric') {
      elements.healthyWeight.textContent = `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`;
    } else {
      const minLbs = minWeight * 2.20462;
      const maxLbs = maxWeight * 2.20462;
      elements.healthyWeight.textContent = `${minLbs.toFixed(1)} - ${maxLbs.toFixed(1)} lbs`;
    }

    ToolsCommon.showToast(`Your BMI is ${bmi.toFixed(1)}`, 'success');
  }

  // ==================== Get BMI Category ====================
  function getBMICategory(bmi) {
    if (bmi < 18.5) {
      return { category: 'Underweight', className: 'underweight' };
    } else if (bmi < 25) {
      return { category: 'Normal Weight', className: 'normal' };
    } else if (bmi < 30) {
      return { category: 'Overweight', className: 'overweight' };
    } else {
      return { category: 'Obese', className: 'obese' };
    }
  }

  // ==================== Update Scale ====================
  function updateScale(bmi) {
    // Scale goes from 15 to 40
    const min = 15;
    const max = 40;
    const clampedBmi = Math.min(Math.max(bmi, min), max);
    const percentage = ((clampedBmi - min) / (max - min)) * 100;

    elements.scaleMarker.style.left = percentage + '%';
  }

  // ==================== Switch Units ====================
  function switchUnit(unit) {
    if (state.currentUnit === unit) return;

    state.currentUnit = unit;

    elements.unitBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === unit);
    });

    if (unit === 'metric') {
      elements.metricInputs.classList.remove('hidden');
      elements.imperialInputs.classList.add('hidden');
    } else {
      elements.metricInputs.classList.add('hidden');
      elements.imperialInputs.classList.remove('hidden');
    }

    // Hide results when switching units
    elements.resultsSection.classList.add('hidden');
  }

  // ==================== Reset Form ====================
  function resetForm() {
    // Clear metric inputs
    elements.heightCm.value = '';
    elements.weightKg.value = '';

    // Clear imperial inputs
    elements.heightFt.value = '';
    elements.heightIn.value = '';
    elements.weightLbs.value = '';

    // Hide results
    elements.resultsSection.classList.add('hidden');

    // Reset state
    state.lastBmi = null;
    state.lastHeightM = null;

    ToolsCommon.showToast('Form reset', 'success');
  }

  // ==================== Keyboard Handler ====================
  function handleKeyboard(e) {
    // Skip if typing in input
    if (e.target.matches('input')) {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculateBMI();
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'm':
        e.preventDefault();
        switchUnit('metric');
        break;
      case 'i':
        e.preventDefault();
        switchUnit('imperial');
        break;
      case 'r':
        e.preventDefault();
        resetForm();
        break;
      case 'enter':
        e.preventDefault();
        calculateBMI();
        break;
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Unit toggle
    elements.unitBtns.forEach(btn => {
      btn.addEventListener('click', () => switchUnit(btn.dataset.unit));
    });

    // Calculate button
    elements.calculateBtn?.addEventListener('click', calculateBMI);

    // Reset button
    elements.resetBtn?.addEventListener('click', resetForm);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
