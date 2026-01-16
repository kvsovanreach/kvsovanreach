/**
 * BMI Calculator Tool
 * Calculate Body Mass Index with metric or imperial units
 */

(function() {
  'use strict';

  // ==================== State ====================
  let currentUnit = 'metric';

  // ==================== DOM Elements ====================
  const elements = {
    unitBtns: document.querySelectorAll('.bmi-tab'),
    metricInputs: document.getElementById('metricInputs'),
    imperialInputs: document.getElementById('imperialInputs'),
    // Metric
    heightCm: document.getElementById('heightCm'),
    weightKg: document.getElementById('weightKg'),
    // Imperial
    heightFt: document.getElementById('heightFt'),
    heightIn: document.getElementById('heightIn'),
    weightLbs: document.getElementById('weightLbs'),
    // Results
    calculateBtn: document.getElementById('calculateBtn'),
    resultsSection: document.getElementById('resultsSection'),
    bmiValue: document.getElementById('bmiValue'),
    bmiCategory: document.getElementById('bmiCategory'),
    scaleFill: document.getElementById('scaleFill'),
    scaleMarker: document.getElementById('scaleMarker'),
    healthyWeight: document.getElementById('healthyWeight')
  };

  // ==================== BMI Calculation ====================
  function calculateBMI() {
    let heightM, weightKg;

    if (currentUnit === 'metric') {
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

    if (currentUnit === 'metric') {
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
    currentUnit = unit;

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

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Unit toggle
    elements.unitBtns.forEach(btn => {
      btn.addEventListener('click', () => switchUnit(btn.dataset.unit));
    });

    // Calculate button
    elements.calculateBtn.addEventListener('click', calculateBMI);

    // Enter key to calculate
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          calculateBMI();
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input')) return;

      switch (e.key.toLowerCase()) {
        case 'm':
          switchUnit('metric');
          break;
        case 'i':
          switchUnit('imperial');
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
