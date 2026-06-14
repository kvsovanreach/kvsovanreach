/**
 * KVSOVANREACH Binary Search Visualizer
 * Step-by-step binary search algorithm visualization
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    arrayContainer: document.getElementById('arrayContainer'),
    pointers: document.getElementById('pointers'),
    targetInput: document.getElementById('targetInput'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    arraySizeSlider: document.getElementById('arraySizeSlider'),
    arraySizeValue: document.getElementById('arraySizeValue'),
    customArrayInput: document.getElementById('customArrayInput'),
    loadCustomBtn: document.getElementById('loadCustomBtn'),
    searchBtn: document.getElementById('searchBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    generateBtn: document.getElementById('generateBtn'),
    comparisonText: document.getElementById('comparisonText'),
    stepLogBody: document.getElementById('stepLogBody'),
    stepCounter: document.getElementById('stepCounter')
  };

  // ==================== State ====================
  const state = {
    array: [],
    target: null,
    low: 0,
    high: 0,
    mid: 0,
    steps: [],
    currentStep: -1,
    searching: false,
    paused: false,
    found: false,
    foundIndex: -1,
    animationTimer: null,
    eliminated: new Set(),
    stepCount: 0,
    done: false
  };

  // ==================== Helpers ====================
  function getSpeed() {
    const val = parseInt(elements.speedSlider.value);
    return 1200 - (val * 100);
  }

  function generateSortedArray(size) {
    const arr = new Set();
    while (arr.size < size) {
      arr.add(Math.floor(Math.random() * 200) + 1);
    }
    return Array.from(arr).sort((a, b) => a - b);
  }

  // ==================== Rendering ====================
  function renderArray() {
    elements.arrayContainer.innerHTML = '';
    elements.pointers.innerHTML = '';

    state.array.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'bs-cell';
      cell.dataset.index = i;

      const valueEl = document.createElement('div');
      valueEl.className = 'bs-cell-value';
      valueEl.textContent = val;

      const indexEl = document.createElement('div');
      indexEl.className = 'bs-cell-index';
      indexEl.textContent = i;

      cell.appendChild(valueEl);
      cell.appendChild(indexEl);
      elements.arrayContainer.appendChild(cell);

      // Pointer slot
      const ptr = document.createElement('div');
      ptr.className = 'bs-pointer';
      ptr.dataset.index = i;
      elements.pointers.appendChild(ptr);
    });
  }

  function updateCells() {
    const cells = elements.arrayContainer.querySelectorAll('.bs-cell');
    const ptrs = elements.pointers.querySelectorAll('.bs-pointer');

    cells.forEach((cell, i) => {
      cell.classList.remove('low', 'high', 'mid', 'found', 'eliminated');

      if (state.done && state.found && i === state.foundIndex) {
        cell.classList.add('found');
      } else if (state.eliminated.has(i)) {
        cell.classList.add('eliminated');
      } else if (!state.done && state.searching) {
        if (i === state.mid) cell.classList.add('mid');
        else if (i === state.low) cell.classList.add('low');
        else if (i === state.high) cell.classList.add('high');
      }
    });

    // Clear pointers
    ptrs.forEach(p => {
      p.textContent = '';
      p.className = 'bs-pointer';
    });

    if (state.searching && !state.done) {
      if (ptrs[state.low]) {
        ptrs[state.low].textContent = 'L';
        ptrs[state.low].classList.add('ptr-low');
      }
      if (ptrs[state.high]) {
        ptrs[state.high].textContent = 'H';
        ptrs[state.high].classList.add('ptr-high');
      }
      if (ptrs[state.mid]) {
        ptrs[state.mid].textContent = 'M';
        ptrs[state.mid].classList.add('ptr-mid');
      }
    }
  }

  function addStepLog(num, text, type) {
    // Remove placeholder
    const placeholder = elements.stepLogBody.querySelector('.step-placeholder');
    if (placeholder) placeholder.remove();

    const entry = document.createElement('div');
    entry.className = 'step-entry' + (type ? ' step-' + type : '');

    entry.innerHTML = `
      <span class="step-num">${num}.</span>
      <span class="step-detail">${text}</span>
    `;

    elements.stepLogBody.appendChild(entry);
    elements.stepLogBody.scrollTop = elements.stepLogBody.scrollHeight;
    elements.stepCounter.textContent = 'Step ' + num;
  }

  // ==================== Search Logic ====================
  function precomputeSteps() {
    const steps = [];
    let lo = 0;
    let hi = state.array.length - 1;
    const target = state.target;
    const eliminated = new Set();

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = state.array[mid];
      const step = { low: lo, high: hi, mid, val, eliminated: new Set(eliminated) };

      if (val === target) {
        step.result = 'found';
        steps.push(step);
        break;
      } else if (val < target) {
        step.result = 'right';
        step.comparison = `arr[${mid}] = ${val} < ${target}, search right`;
        for (let i = lo; i <= mid; i++) eliminated.add(i);
        steps.push(step);
        lo = mid + 1;
      } else {
        step.result = 'left';
        step.comparison = `arr[${mid}] = ${val} > ${target}, search left`;
        for (let i = mid; i <= hi; i++) eliminated.add(i);
        steps.push(step);
        hi = mid - 1;
      }
    }

    if (steps.length === 0 || steps[steps.length - 1].result !== 'found') {
      steps.push({ result: 'not-found', eliminated });
    }

    return steps;
  }

  function executeStep() {
    state.currentStep++;
    const stepIdx = state.currentStep;

    if (stepIdx >= state.steps.length) {
      finishSearch();
      return;
    }

    const step = state.steps[stepIdx];
    state.stepCount++;

    if (step.result === 'not-found') {
      state.done = true;
      state.eliminated = step.eliminated;
      updateCells();
      const msg = `<span class="not-found-msg">Target ${state.target} not found in the array.</span>`;
      elements.comparisonText.innerHTML = msg;
      addStepLog(state.stepCount, `Target ${state.target} not found.`, 'not-found');
      finishSearch();
      return;
    }

    state.low = step.low;
    state.high = step.high;
    state.mid = step.mid;
    state.eliminated = step.eliminated;

    updateCells();

    if (step.result === 'found') {
      state.done = true;
      state.found = true;
      state.foundIndex = step.mid;
      updateCells();
      const msg = `<span class="found-msg">Found! arr[${step.mid}] = ${step.val} = ${state.target}</span>`;
      elements.comparisonText.innerHTML = msg;
      addStepLog(state.stepCount, `arr[${step.mid}] = ${step.val} == ${state.target}. Found!`, 'found');
      finishSearch();
      return;
    }

    elements.comparisonText.innerHTML = `<strong>${step.comparison}</strong>`;
    addStepLog(state.stepCount, step.comparison);

    if (!state.paused && state.searching) {
      state.animationTimer = setTimeout(executeStep, getSpeed());
    }
  }

  function startSearch() {
    const targetVal = parseInt(elements.targetInput.value);
    if (isNaN(targetVal)) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter a target value', 'error');
      }
      return;
    }

    if (state.array.length === 0) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please generate or load an array first', 'error');
      }
      return;
    }

    resetSearch(false);

    state.target = targetVal;
    state.searching = true;
    state.steps = precomputeSteps();

    elements.searchBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.stepBtn.disabled = false;
    elements.generateBtn.disabled = true;
    elements.loadCustomBtn.disabled = true;

    elements.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    executeStep();
  }

  function togglePause() {
    if (!state.searching || state.done) return;

    state.paused = !state.paused;

    if (state.paused) {
      clearTimeout(state.animationTimer);
      elements.pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
      elements.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      state.animationTimer = setTimeout(executeStep, getSpeed());
    }
  }

  function stepForward() {
    if (!state.searching || state.done) return;

    state.paused = true;
    clearTimeout(state.animationTimer);
    elements.pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

    executeStep();
  }

  function finishSearch() {
    state.searching = false;
    clearTimeout(state.animationTimer);

    elements.searchBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.stepBtn.disabled = true;
    elements.generateBtn.disabled = false;
    elements.loadCustomBtn.disabled = false;

    elements.searchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Search';
  }

  function resetSearch(clearLog) {
    clearTimeout(state.animationTimer);
    state.searching = false;
    state.paused = false;
    state.done = false;
    state.found = false;
    state.foundIndex = -1;
    state.currentStep = -1;
    state.steps = [];
    state.eliminated = new Set();
    state.stepCount = 0;

    elements.searchBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.stepBtn.disabled = true;
    elements.generateBtn.disabled = false;
    elements.loadCustomBtn.disabled = false;

    elements.searchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Search';
    elements.comparisonText.textContent = 'Generate an array and enter a target to begin searching.';

    if (clearLog !== false) {
      elements.stepLogBody.innerHTML = '<div class="step-placeholder">Steps will appear here as the search runs.</div>';
      elements.stepCounter.textContent = 'Step 0';
    }

    updateCells();
  }

  function loadArray(arr) {
    state.array = arr;
    renderArray();
    resetSearch();
  }

  function handleGenerate() {
    const size = parseInt(elements.arraySizeSlider.value);
    loadArray(generateSortedArray(size));
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Generated sorted array of ' + size + ' elements', 'success');
    }
  }

  function handleCustomLoad() {
    const input = elements.customArrayInput.value.trim();
    if (!input) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter comma-separated numbers', 'error');
      }
      return;
    }

    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 2) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter at least 2 valid numbers', 'error');
      }
      return;
    }

    const sorted = nums.sort((a, b) => a - b);
    loadArray(sorted);
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Loaded custom array (' + sorted.length + ' elements, sorted)', 'success');
    }
  }

  // ==================== Event Listeners ====================
  elements.searchBtn.addEventListener('click', startSearch);
  elements.pauseBtn.addEventListener('click', togglePause);
  elements.stepBtn.addEventListener('click', stepForward);
  elements.resetBtn.addEventListener('click', () => resetSearch());
  elements.generateBtn.addEventListener('click', handleGenerate);
  elements.loadCustomBtn.addEventListener('click', handleCustomLoad);

  elements.speedSlider.addEventListener('input', () => {
    elements.speedValue.textContent = elements.speedSlider.value + 'x';
  });

  elements.arraySizeSlider.addEventListener('input', () => {
    elements.arraySizeValue.textContent = elements.arraySizeSlider.value;
  });

  elements.targetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startSearch();
  });

  elements.customArrayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCustomLoad();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (state.searching && !state.done) togglePause();
        else if (!state.searching) startSearch();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (state.searching && !state.done) stepForward();
        break;
      case 'r':
        resetSearch();
        break;
      case 'g':
        handleGenerate();
        break;
    }
  });

  // ==================== Init ====================
  handleGenerate();

})();
