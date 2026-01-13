/**
 * KVSOVANREACH Algorithm Visualizer
 * Visualize sorting algorithms step by step
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    vizBars: document.getElementById('vizBars'),
    algorithmSelect: document.getElementById('algorithmSelect'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeValue: document.getElementById('sizeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    comparisonsDisplay: document.getElementById('comparisonsDisplay'),
    swapsDisplay: document.getElementById('swapsDisplay'),
    stepDisplay: document.getElementById('stepDisplay'),
    algoName: document.getElementById('algoName'),
    algoDesc: document.getElementById('algoDesc'),
    timeBest: document.getElementById('timeBest'),
    timeAvg: document.getElementById('timeAvg'),
    timeWorst: document.getElementById('timeWorst'),
    space: document.getElementById('space')
  };

  // ==================== Algorithm Info ====================
  const ALGORITHMS = {
    bubble: {
      name: 'Bubble Sort',
      desc: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    selection: {
      name: 'Selection Sort',
      desc: 'Divides the input into sorted and unsorted regions, repeatedly selects the smallest element from the unsorted region.',
      timeBest: 'O(n²)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    insertion: {
      name: 'Insertion Sort',
      desc: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    merge: {
      name: 'Merge Sort',
      desc: 'Divides the array into halves, recursively sorts them, then merges the sorted halves together.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)'
    },
    quick: {
      name: 'Quick Sort',
      desc: 'Selects a pivot element, partitions the array around it, then recursively sorts the sub-arrays.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n²)',
      space: 'O(log n)'
    },
    heap: {
      name: 'Heap Sort',
      desc: 'Builds a max heap from the array, then repeatedly extracts the maximum element.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(1)'
    }
  };

  // ==================== State ====================
  const state = {
    array: [],
    steps: [],
    currentStep: -1,
    isPlaying: false,
    playInterval: null,
    size: 30,
    speed: 50,
    algorithm: 'bubble',
    comparisons: 0,
    swaps: 0
  };

  // ==================== Array Functions ====================

  function generateArray() {
    state.array = [];
    for (let i = 0; i < state.size; i++) {
      state.array.push(Math.floor(Math.random() * 100) + 1);
    }
    state.steps = [];
    state.currentStep = -1;
    state.comparisons = 0;
    state.swaps = 0;
    render();
    updateStats();
    updateButtons();
  }

  function shuffle() {
    for (let i = state.array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
    }
    state.steps = [];
    state.currentStep = -1;
    state.comparisons = 0;
    state.swaps = 0;
    render();
    updateStats();
    updateButtons();
  }

  // ==================== Sorting Algorithms ====================

  function generateSteps() {
    const arr = [...state.array];
    state.steps = [];
    state.comparisons = 0;
    state.swaps = 0;

    switch (state.algorithm) {
      case 'bubble': bubbleSort(arr); break;
      case 'selection': selectionSort(arr); break;
      case 'insertion': insertionSort(arr); break;
      case 'merge': mergeSort(arr, 0, arr.length - 1); break;
      case 'quick': quickSort(arr, 0, arr.length - 1); break;
      case 'heap': heapSort(arr); break;
    }

    // Final sorted state
    state.steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: arr.map((_, i) => i)
    });

    state.currentStep = -1;
    updateStats();
    updateButtons();
  }

  function addStep(arr, comparing = [], swapping = [], sorted = []) {
    state.steps.push({
      array: [...arr],
      comparing,
      swapping,
      sorted
    });
  }

  function bubbleSort(arr) {
    const n = arr.length;
    const sorted = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        addStep(arr, [j, j + 1], [], sorted);
        state.comparisons++;

        if (arr[j] > arr[j + 1]) {
          addStep(arr, [], [j, j + 1], sorted);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          state.swaps++;
          addStep(arr, [], [], sorted);
        }
      }
      sorted.unshift(n - 1 - i);
    }
    sorted.unshift(0);
  }

  function selectionSort(arr) {
    const n = arr.length;
    const sorted = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        addStep(arr, [minIdx, j], [], sorted);
        state.comparisons++;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        addStep(arr, [], [i, minIdx], sorted);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        state.swaps++;
      }

      sorted.push(i);
      addStep(arr, [], [], sorted);
    }
    sorted.push(n - 1);
  }

  function insertionSort(arr) {
    const n = arr.length;
    const sorted = [0];

    for (let i = 1; i < n; i++) {
      let j = i;
      addStep(arr, [j], [], sorted);

      while (j > 0 && arr[j - 1] > arr[j]) {
        addStep(arr, [j - 1, j], [], sorted);
        state.comparisons++;

        addStep(arr, [], [j - 1, j], sorted);
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        state.swaps++;
        j--;
      }

      sorted.push(i);
      addStep(arr, [], [], sorted);
    }
  }

  function mergeSort(arr, left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }

  function merge(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      addStep(arr, [left + i, mid + 1 + j], [], []);
      state.comparisons++;

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      addStep(arr, [], [k], []);
      state.swaps++;
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      addStep(arr, [], [k], []);
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      addStep(arr, [], [k], []);
      j++;
      k++;
    }
  }

  function quickSort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }

  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      addStep(arr, [j, high], [], []);
      state.comparisons++;

      if (arr[j] < pivot) {
        i++;
        addStep(arr, [], [i, j], []);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        state.swaps++;
        addStep(arr, [], [], []);
      }
    }

    addStep(arr, [], [i + 1, high], []);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    state.swaps++;
    addStep(arr, [], [], []);

    return i + 1;
  }

  function heapSort(arr) {
    const n = arr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(arr, n, i);
    }

    const sorted = [];
    for (let i = n - 1; i > 0; i--) {
      addStep(arr, [], [0, i], sorted);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      state.swaps++;
      sorted.unshift(i);
      addStep(arr, [], [], sorted);

      heapify(arr, i, 0);
    }
    sorted.unshift(0);
  }

  function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      addStep(arr, [largest, left], [], []);
      state.comparisons++;
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      addStep(arr, [largest, right], [], []);
      state.comparisons++;
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      addStep(arr, [], [i, largest], []);
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      state.swaps++;
      addStep(arr, [], [], []);

      heapify(arr, n, largest);
    }
  }

  // ==================== UI Functions ====================

  function render() {
    const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;
    const arr = step ? step.array : state.array;
    const maxVal = Math.max(...arr);

    elements.vizBars.innerHTML = '';

    arr.forEach((val, idx) => {
      const bar = document.createElement('div');
      bar.className = 'viz-bar';
      bar.style.height = `${(val / maxVal) * 100}%`;

      if (step) {
        if (step.comparing.includes(idx)) {
          bar.classList.add('comparing');
        } else if (step.swapping.includes(idx)) {
          bar.classList.add('swapping');
        } else if (step.sorted.includes(idx)) {
          bar.classList.add('sorted');
        }
      }

      elements.vizBars.appendChild(bar);
    });
  }

  function updateStats() {
    elements.comparisonsDisplay.textContent = state.comparisons;
    elements.swapsDisplay.textContent = state.swaps;
    elements.stepDisplay.textContent = `${Math.max(0, state.currentStep + 1)}/${state.steps.length}`;
  }

  function updateButtons() {
    elements.prevBtn.disabled = state.currentStep < 0 || state.isPlaying;
    elements.nextBtn.disabled = state.currentStep >= state.steps.length - 1 || state.isPlaying;

    const icon = elements.playBtn.querySelector('i');
    icon.className = state.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  function updateAlgorithmInfo() {
    const algo = ALGORITHMS[state.algorithm];
    elements.algoName.textContent = algo.name;
    elements.algoDesc.textContent = algo.desc;
    elements.timeBest.textContent = algo.timeBest;
    elements.timeAvg.textContent = algo.timeAvg;
    elements.timeWorst.textContent = algo.timeWorst;
    elements.space.textContent = algo.space;
  }

  function play() {
    if (state.steps.length === 0) {
      generateSteps();
    }

    if (state.currentStep >= state.steps.length - 1) {
      state.currentStep = -1;
    }

    state.isPlaying = true;
    updateButtons();

    state.playInterval = setInterval(() => {
      if (state.currentStep < state.steps.length - 1) {
        state.currentStep++;
        render();
        updateStats();
      } else {
        pause();
      }
    }, state.speed);
  }

  function pause() {
    state.isPlaying = false;
    if (state.playInterval) {
      clearInterval(state.playInterval);
      state.playInterval = null;
    }
    updateButtons();
  }

  function togglePlay() {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function prevStep() {
    if (state.currentStep > 0) {
      state.currentStep--;
      render();
      updateStats();
      updateButtons();
    }
  }

  function nextStep() {
    if (state.steps.length === 0) {
      generateSteps();
    }

    if (state.currentStep < state.steps.length - 1) {
      state.currentStep++;
      render();
      updateStats();
      updateButtons();
    }
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        if (!state.isPlaying) prevStep();
        break;
      case 'ArrowRight':
        if (!state.isPlaying) nextStep();
        break;
      case 's':
      case 'S':
        shuffle();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Algorithm select
    elements.algorithmSelect.addEventListener('change', () => {
      state.algorithm = elements.algorithmSelect.value;
      updateAlgorithmInfo();
      pause();
      state.steps = [];
      state.currentStep = -1;
      updateStats();
      updateButtons();
    });

    // Size slider
    elements.sizeSlider.addEventListener('input', () => {
      state.size = parseInt(elements.sizeSlider.value);
      elements.sizeValue.textContent = state.size;
    });

    elements.sizeSlider.addEventListener('change', () => {
      pause();
      generateArray();
    });

    // Speed slider
    elements.speedSlider.addEventListener('input', () => {
      state.speed = parseInt(elements.speedSlider.value);
      elements.speedValue.textContent = state.speed;

      if (state.isPlaying) {
        pause();
        play();
      }
    });

    // Shuffle button
    elements.shuffleBtn.addEventListener('click', () => {
      pause();
      shuffle();
    });

    // Playback buttons
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', prevStep);
    elements.nextBtn.addEventListener('click', nextStep);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Initialize
    updateAlgorithmInfo();
    generateArray();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
