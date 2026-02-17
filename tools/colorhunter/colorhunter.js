/**
 * Color Hunter
 * Hexadecimal color guessing game
 * Following colorpicker design pattern
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    targetColor: { r: 0, g: 0, b: 0 },
    score: 0,
    streak: 0,
    round: 1,
    bestScore: 0,
    showingResult: false
  };

  // ==================== DOM Elements ====================
  const elements = {
    wrapper: document.querySelector('.game-wrapper'),
    colorDisplay: document.getElementById('colorDisplay'),
    colorHint: document.getElementById('colorHint'),
    hexInput: document.getElementById('hexInput'),
    submitBtn: document.getElementById('submitBtn'),
    skipBtn: document.getElementById('skipBtn'),
    nextBtn: document.getElementById('nextBtn'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    streakDisplay: document.getElementById('streakDisplay'),
    roundDisplay: document.getElementById('roundDisplay'),
    bestDisplay: document.getElementById('bestDisplay'),
    showHelper: document.getElementById('showHelper'),
    rgbSliders: document.getElementById('rgbSliders'),
    redSlider: document.getElementById('redSlider'),
    greenSlider: document.getElementById('greenSlider'),
    blueSlider: document.getElementById('blueSlider'),
    redValue: document.getElementById('redValue'),
    greenValue: document.getElementById('greenValue'),
    blueValue: document.getElementById('blueValue'),
    previewColor: document.getElementById('previewColor'),
    resultSection: document.getElementById('resultSection'),
    targetColorBox: document.getElementById('targetColorBox'),
    guessColorBox: document.getElementById('guessColorBox'),
    targetCode: document.getElementById('targetCode'),
    guessCode: document.getElementById('guessCode'),
    accuracyValue: document.getElementById('accuracyValue'),
    toggleControlsBtn: document.getElementById('toggleControlsBtn')
  };

  // ==================== Color Utilities ====================

  function generateRandomColor() {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
  }

  function colorToHex(color) {
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  function hexToColor(hex) {
    const cleaned = hex.replace('#', '').toUpperCase();
    if (cleaned.length !== 6) return null;

    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

    return { r, g, b };
  }

  function colorToRgbString(color) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  function calculateAccuracy(target, guess) {
    const dr = Math.abs(target.r - guess.r);
    const dg = Math.abs(target.g - guess.g);
    const db = Math.abs(target.b - guess.b);

    // Max difference is 255 * 3 = 765
    const maxDiff = 765;
    const actualDiff = dr + dg + db;

    return Math.round(((maxDiff - actualDiff) / maxDiff) * 100);
  }

  function calculateScore(accuracy) {
    // Base score from accuracy
    let points = accuracy;

    // Streak bonus
    if (accuracy >= 90) {
      points += state.streak * 5;
    }

    return points;
  }

  // ==================== Game Logic ====================

  function newRound() {
    state.targetColor = generateRandomColor();
    state.showingResult = false;

    // Update display
    elements.colorDisplay.style.backgroundColor = colorToRgbString(state.targetColor);
    elements.colorHint.textContent = 'What\'s the hex code?';
    elements.hexInput.value = '';
    elements.hexInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.resultSection.classList.add('hidden');

    // Reset RGB sliders
    elements.redSlider.value = 128;
    elements.greenSlider.value = 128;
    elements.blueSlider.value = 128;
    updateSliderValues();

    elements.hexInput.focus();
    updateUI();
  }

  function submitGuess() {
    if (state.showingResult) {
      newRound();
      return;
    }

    const guess = hexToColor(elements.hexInput.value);

    if (!guess) {
      ToolsCommon.Toast.show('Enter a valid hex code (e.g., FF5733)', 'warning');
      return;
    }

    state.showingResult = true;

    // Calculate accuracy and score
    const accuracy = calculateAccuracy(state.targetColor, guess);
    const points = calculateScore(accuracy);

    // Update streak
    if (accuracy >= 80) {
      state.streak++;
    } else {
      state.streak = 0;
    }

    // Update score
    state.score += points;

    // Update best score
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
    }

    // Show result
    showResult(guess, accuracy, points);

    state.round++;
    updateUI();
  }

  function showResult(guess, accuracy, points) {
    // Update result display
    elements.targetColorBox.style.backgroundColor = colorToRgbString(state.targetColor);
    elements.guessColorBox.style.backgroundColor = colorToRgbString(guess);
    elements.targetCode.textContent = colorToHex(state.targetColor);
    elements.guessCode.textContent = colorToHex(guess);
    elements.accuracyValue.textContent = `${accuracy}%`;

    // Color the accuracy based on how good it is
    if (accuracy >= 90) {
      elements.accuracyValue.style.color = 'var(--color-success)';
      elements.colorHint.textContent = `Perfect! +${points} points`;
    } else if (accuracy >= 70) {
      elements.accuracyValue.style.color = 'var(--color-warning)';
      elements.colorHint.textContent = `Good! +${points} points`;
    } else {
      elements.accuracyValue.style.color = 'var(--color-error)';
      elements.colorHint.textContent = `Keep practicing! +${points} points`;
    }

    elements.resultSection.classList.remove('hidden');
    elements.hexInput.disabled = true;
    elements.submitBtn.disabled = true;

    // Toast message
    if (accuracy >= 90) {
      ToolsCommon.Toast.show(`Amazing! ${accuracy}% accuracy!`, 'success');
    } else if (accuracy >= 70) {
      ToolsCommon.Toast.show(`Good guess! ${accuracy}% accuracy`, 'info');
    }
  }

  function skipColor() {
    state.streak = 0;
    state.round++;
    newRound();
    ToolsCommon.Toast.show('Skipped! Streak reset', 'info');
  }

  // ==================== UI Updates ====================

  function updateUI() {
    elements.scoreDisplay.textContent = state.score;
    elements.streakDisplay.textContent = state.streak;
    elements.roundDisplay.textContent = state.round;
    elements.bestDisplay.textContent = state.bestScore;
  }

  function updateSliderValues() {
    const r = parseInt(elements.redSlider.value);
    const g = parseInt(elements.greenSlider.value);
    const b = parseInt(elements.blueSlider.value);

    elements.redValue.textContent = r;
    elements.greenValue.textContent = g;
    elements.blueValue.textContent = b;

    elements.previewColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    // Update hex input
    const hex = colorToHex({ r, g, b }).replace('#', '');
    elements.hexInput.value = hex;
  }

  function toggleHelper() {
    const show = elements.showHelper.checked;
    elements.rgbSliders.classList.toggle('hidden', !show);
  }

  function toggleControls() {
    elements.wrapper?.classList.toggle('hide-controls');
  }

  // ==================== Event Handlers ====================

  function handleSubmit(e) {
    e?.preventDefault();
    if (state.showingResult) {
      newRound();
    } else {
      submitGuess();
    }
  }

  function handleSliderChange() {
    updateSliderValues();
  }

  function handleKeydown(e) {
    if (e.target.matches('input[type="text"], textarea, select, [contenteditable]')) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    // Close controls on Escape (mobile)
    if (e.key === 'Escape') {
      if (window.innerWidth <= 900 && !elements.wrapper?.classList.contains('hide-controls')) {
        elements.wrapper?.classList.add('hide-controls');
        return;
      }
    }

    switch (e.key.toLowerCase()) {
      case 'enter':
        e.preventDefault();
        handleSubmit();
        break;
      case 's':
        e.preventDefault();
        if (!state.showingResult) {
          skipColor();
        }
        break;
      case 'h':
        e.preventDefault();
        elements.showHelper.checked = !elements.showHelper.checked;
        toggleHelper();
        break;
    }
  }

  function handleInputChange(e) {
    // Only allow valid hex characters
    e.target.value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  }

  // ==================== Initialization ====================

  function init() {
    // Load best score
    try {
      const saved = localStorage.getItem('colorhunter-best');
      if (saved) state.bestScore = parseInt(saved);
    } catch (e) {}

    // Event listeners
    elements.submitBtn?.addEventListener('click', handleSubmit);
    elements.skipBtn?.addEventListener('click', skipColor);
    elements.nextBtn?.addEventListener('click', () => newRound());
    elements.showHelper?.addEventListener('change', toggleHelper);
    elements.hexInput?.addEventListener('input', handleInputChange);
    elements.toggleControlsBtn?.addEventListener('click', toggleControls);

    elements.redSlider?.addEventListener('input', handleSliderChange);
    elements.greenSlider?.addEventListener('input', handleSliderChange);
    elements.blueSlider?.addEventListener('input', handleSliderChange);

    document.addEventListener('keydown', handleKeydown);

    // Save best score on unload
    window.addEventListener('beforeunload', () => {
      try {
        localStorage.setItem('colorhunter-best', state.bestScore.toString());
      } catch (e) {}
    });

    // Start game
    newRound();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
