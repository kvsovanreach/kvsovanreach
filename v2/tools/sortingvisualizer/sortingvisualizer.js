/**
 * KVSOVANREACH Sorting Algorithm Visualizer
 * Animated visualization of sorting algorithms
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    barsContainer: document.getElementById('barsContainer'),
    algorithmSelect: document.getElementById('algorithmSelect'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeValue: document.getElementById('sizeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    comparisons: document.getElementById('comparisons'),
    swaps: document.getElementById('swaps'),
    timeElapsed: document.getElementById('timeElapsed'),
    algorithmName: document.getElementById('algorithmName'),
    algorithmDesc: document.getElementById('algorithmDesc'),
    timeBest: document.getElementById('timeBest'),
    timeAvg: document.getElementById('timeAvg'),
    timeWorst: document.getElementById('timeWorst'),
    space: document.getElementById('space')
  };

  // ==================== State ====================
  const state = {
    array: [],
    sorting: false,
    paused: false,
    comparisons: 0,
    swaps: 0,
    startTime: null,
    animationSpeed: 50
  };

  // ==================== Algorithm Info ====================
  const ALGORITHMS = {
    bubble: {
      name: 'Bubble Sort',
      desc: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    selection: {
      name: 'Selection Sort',
      desc: 'Selection Sort divides the array into sorted and unsorted regions. It repeatedly finds the minimum element from the unsorted region and moves it to the sorted region.',
      timeBest: 'O(n²)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    insertion: {
      name: 'Insertion Sort',
      desc: 'Insertion Sort builds the sorted array one item at a time. It picks each element and inserts it into its correct position among the previously sorted elements.',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)'
    },
    merge: {
      name: 'Merge Sort',
      desc: 'Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)'
    },
    quick: {
      name: 'Quick Sort',
      desc: 'Quick Sort picks a pivot element and partitions the array around it, placing smaller elements before and larger elements after. It then recursively sorts the partitions.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n²)',
      space: 'O(log n)'
    },
    heap: {
      name: 'Heap Sort',
      desc: 'Heap Sort converts the array into a max-heap, then repeatedly extracts the maximum element and rebuilds the heap until the array is sorted.',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(1)'
    }
  };

  // ==================== Core Functions ====================

  function generateArray(size) {
    state.array = [];
    for (let i = 0; i < size; i++) {
      state.array.push(Math.floor(Math.random() * 280) + 20);
    }
    renderBars();
    resetStats();
  }

  function shuffleArray() {
    for (let i = state.array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
    }
    renderBars();
    resetStats();
  }

  function resetStats() {
    state.comparisons = 0;
    state.swaps = 0;
    state.startTime = null;
    updateStats();
  }

  function sleep(ms) {
    return new Promise(resolve => {
      if (state.paused) {
        const checkPause = setInterval(() => {
          if (!state.paused) {
            clearInterval(checkPause);
            setTimeout(resolve, ms);
          }
          if (!state.sorting) {
            clearInterval(checkPause);
            resolve();
          }
        }, 50);
      } else {
        setTimeout(resolve, ms);
      }
    });
  }

  // ==================== UI Functions ====================

  function renderBars() {
    const maxVal = Math.max(...state.array);
    elements.barsContainer.innerHTML = state.array.map((val, idx) => {
      const height = (val / maxVal) * 100;
      return `<div class="bar" data-index="${idx}" style="height: ${height}%"></div>`;
    }).join('');
  }

  function updateStats() {
    elements.comparisons.textContent = state.comparisons;
    elements.swaps.textContent = state.swaps;

    if (state.startTime) {
      const elapsed = Date.now() - state.startTime;
      elements.timeElapsed.textContent = `${elapsed}ms`;
    } else {
      elements.timeElapsed.textContent = '0ms';
    }
  }

  function updateAlgorithmInfo(algorithm) {
    const info = ALGORITHMS[algorithm];
    elements.algorithmName.textContent = info.name;
    elements.algorithmDesc.textContent = info.desc;
    elements.timeBest.textContent = info.timeBest;
    elements.timeAvg.textContent = info.timeAvg;
    elements.timeWorst.textContent = info.timeWorst;
    elements.space.textContent = info.space;
  }

  function setBarState(indices, state) {
    const bars = elements.barsContainer.querySelectorAll('.bar');
    indices.forEach(idx => {
      bars[idx]?.classList.remove('comparing', 'swapping', 'sorted', 'pivot');
      if (state) bars[idx]?.classList.add(state);
    });
  }

  function clearBarStates() {
    const bars = elements.barsContainer.querySelectorAll('.bar');
    bars.forEach(bar => bar.classList.remove('comparing', 'swapping', 'sorted', 'pivot'));
  }

  function markAllSorted() {
    const bars = elements.barsContainer.querySelectorAll('.bar');
    bars.forEach(bar => {
      bar.classList.remove('comparing', 'swapping', 'pivot');
      bar.classList.add('sorted');
    });
  }

  function updateBar(index, value) {
    const bars = elements.barsContainer.querySelectorAll('.bar');
    const maxVal = Math.max(...state.array);
    const height = (value / maxVal) * 100;
    if (bars[index]) {
      bars[index].style.height = `${height}%`;
    }
  }

  function setUIState(sorting) {
    elements.startBtn.disabled = sorting;
    elements.pauseBtn.disabled = !sorting;
    elements.resetBtn.disabled = sorting;
    elements.shuffleBtn.disabled = sorting;
    elements.sizeSlider.disabled = sorting;
    elements.algorithmSelect.disabled = sorting;

    if (sorting) {
      elements.startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Sorting...</span>';
    } else {
      elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start</span>';
    }
  }

  // ==================== Sorting Algorithms ====================

  async function bubbleSort() {
    const n = state.array.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!state.sorting) return;

        setBarState([j, j + 1], 'comparing');
        state.comparisons++;
        updateStats();
        await sleep(state.animationSpeed);

        if (state.array[j] > state.array[j + 1]) {
          setBarState([j, j + 1], 'swapping');
          await sleep(state.animationSpeed);

          [state.array[j], state.array[j + 1]] = [state.array[j + 1], state.array[j]];
          updateBar(j, state.array[j]);
          updateBar(j + 1, state.array[j + 1]);
          state.swaps++;
          updateStats();
        }

        setBarState([j, j + 1], null);
      }
      setBarState([n - i - 1], 'sorted');
    }
    setBarState([0], 'sorted');
  }

  async function selectionSort() {
    const n = state.array.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setBarState([minIdx], 'comparing');

      for (let j = i + 1; j < n; j++) {
        if (!state.sorting) return;

        setBarState([j], 'comparing');
        state.comparisons++;
        updateStats();
        await sleep(state.animationSpeed);

        if (state.array[j] < state.array[minIdx]) {
          setBarState([minIdx], null);
          minIdx = j;
          setBarState([minIdx], 'comparing');
        } else {
          setBarState([j], null);
        }
      }

      if (minIdx !== i) {
        setBarState([i, minIdx], 'swapping');
        await sleep(state.animationSpeed);

        [state.array[i], state.array[minIdx]] = [state.array[minIdx], state.array[i]];
        updateBar(i, state.array[i]);
        updateBar(minIdx, state.array[minIdx]);
        state.swaps++;
        updateStats();
      }

      setBarState([minIdx], null);
      setBarState([i], 'sorted');
    }
    setBarState([n - 1], 'sorted');
  }

  async function insertionSort() {
    const n = state.array.length;
    setBarState([0], 'sorted');

    for (let i = 1; i < n; i++) {
      if (!state.sorting) return;

      const key = state.array[i];
      let j = i - 1;

      setBarState([i], 'comparing');
      await sleep(state.animationSpeed);

      while (j >= 0 && state.array[j] > key) {
        if (!state.sorting) return;

        state.comparisons++;
        setBarState([j], 'swapping');
        await sleep(state.animationSpeed);

        state.array[j + 1] = state.array[j];
        updateBar(j + 1, state.array[j + 1]);
        state.swaps++;
        updateStats();

        setBarState([j], 'sorted');
        j--;
      }

      state.array[j + 1] = key;
      updateBar(j + 1, key);

      for (let k = 0; k <= i; k++) {
        setBarState([k], 'sorted');
      }
    }
  }

  async function mergeSort() {
    await mergeSortHelper(0, state.array.length - 1);
  }

  async function mergeSortHelper(left, right) {
    if (left >= right || !state.sorting) return;

    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(left, mid);
    await mergeSortHelper(mid + 1, right);
    await merge(left, mid, right);
  }

  async function merge(left, mid, right) {
    const leftArr = state.array.slice(left, mid + 1);
    const rightArr = state.array.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length && state.sorting) {
      setBarState([left + i, mid + 1 + j], 'comparing');
      state.comparisons++;
      updateStats();
      await sleep(state.animationSpeed);

      if (leftArr[i] <= rightArr[j]) {
        state.array[k] = leftArr[i];
        i++;
      } else {
        state.array[k] = rightArr[j];
        j++;
        state.swaps++;
      }

      updateBar(k, state.array[k]);
      setBarState([k], 'sorted');
      k++;
      updateStats();
    }

    while (i < leftArr.length && state.sorting) {
      state.array[k] = leftArr[i];
      updateBar(k, state.array[k]);
      setBarState([k], 'sorted');
      i++;
      k++;
    }

    while (j < rightArr.length && state.sorting) {
      state.array[k] = rightArr[j];
      updateBar(k, state.array[k]);
      setBarState([k], 'sorted');
      j++;
      k++;
    }
  }

  async function quickSort() {
    await quickSortHelper(0, state.array.length - 1);
  }

  async function quickSortHelper(low, high) {
    if (low < high && state.sorting) {
      const pivotIdx = await partition(low, high);
      await quickSortHelper(low, pivotIdx - 1);
      await quickSortHelper(pivotIdx + 1, high);
    } else if (low === high) {
      setBarState([low], 'sorted');
    }
  }

  async function partition(low, high) {
    const pivot = state.array[high];
    setBarState([high], 'pivot');
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (!state.sorting) return i + 1;

      setBarState([j], 'comparing');
      state.comparisons++;
      updateStats();
      await sleep(state.animationSpeed);

      if (state.array[j] < pivot) {
        i++;
        if (i !== j) {
          setBarState([i, j], 'swapping');
          await sleep(state.animationSpeed);

          [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
          updateBar(i, state.array[i]);
          updateBar(j, state.array[j]);
          state.swaps++;
          updateStats();
        }
      }

      setBarState([j], null);
    }

    setBarState([i + 1, high], 'swapping');
    await sleep(state.animationSpeed);

    [state.array[i + 1], state.array[high]] = [state.array[high], state.array[i + 1]];
    updateBar(i + 1, state.array[i + 1]);
    updateBar(high, state.array[high]);
    state.swaps++;
    updateStats();

    setBarState([high], null);
    setBarState([i + 1], 'sorted');

    return i + 1;
  }

  async function heapSort() {
    const n = state.array.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(n, i);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      if (!state.sorting) return;

      setBarState([0, i], 'swapping');
      await sleep(state.animationSpeed);

      [state.array[0], state.array[i]] = [state.array[i], state.array[0]];
      updateBar(0, state.array[0]);
      updateBar(i, state.array[i]);
      state.swaps++;
      updateStats();

      setBarState([i], 'sorted');
      await heapify(i, 0);
    }

    setBarState([0], 'sorted');
  }

  async function heapify(n, i) {
    if (!state.sorting) return;

    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      setBarState([largest, left], 'comparing');
      state.comparisons++;
      updateStats();
      await sleep(state.animationSpeed / 2);

      if (state.array[left] > state.array[largest]) {
        largest = left;
      }
      setBarState([left], null);
    }

    if (right < n) {
      setBarState([largest, right], 'comparing');
      state.comparisons++;
      updateStats();
      await sleep(state.animationSpeed / 2);

      if (state.array[right] > state.array[largest]) {
        largest = right;
      }
      setBarState([right], null);
    }

    if (largest !== i) {
      setBarState([i, largest], 'swapping');
      await sleep(state.animationSpeed);

      [state.array[i], state.array[largest]] = [state.array[largest], state.array[i]];
      updateBar(i, state.array[i]);
      updateBar(largest, state.array[largest]);
      state.swaps++;
      updateStats();

      setBarState([i, largest], null);
      await heapify(n, largest);
    } else {
      setBarState([i], null);
    }
  }

  // ==================== Event Handlers ====================

  async function startSorting() {
    if (state.sorting) return;

    state.sorting = true;
    state.paused = false;
    state.startTime = Date.now();
    setUIState(true);
    clearBarStates();

    const algorithm = elements.algorithmSelect.value;

    const sortFunctions = {
      bubble: bubbleSort,
      selection: selectionSort,
      insertion: insertionSort,
      merge: mergeSort,
      quick: quickSort,
      heap: heapSort
    };

    await sortFunctions[algorithm]();

    if (state.sorting) {
      markAllSorted();
      updateStats();

      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.Toast.success('Sorting complete!');
      }
    }

    state.sorting = false;
    setUIState(false);
  }

  function pauseSorting() {
    state.paused = !state.paused;
    elements.pauseBtn.innerHTML = state.paused
      ? '<i class="fa-solid fa-play"></i>'
      : '<i class="fa-solid fa-pause"></i>';
  }

  function resetArray() {
    state.sorting = false;
    state.paused = false;
    generateArray(parseInt(elements.sizeSlider.value));
    setUIState(false);
  }

  function handleSizeChange() {
    const size = parseInt(elements.sizeSlider.value);
    elements.sizeValue.textContent = size;
    generateArray(size);
  }

  function handleSpeedChange() {
    const speed = parseInt(elements.speedSlider.value);
    elements.speedValue.textContent = speed;
    state.animationSpeed = speed;
  }

  function handleAlgorithmChange() {
    updateAlgorithmInfo(elements.algorithmSelect.value);
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        if (state.sorting) {
          pauseSorting();
        } else {
          startSorting();
        }
        break;
      case 'r':
        if (!state.sorting) resetArray();
        break;
      case 's':
        if (!state.sorting) shuffleArray();
        break;
    }
  }

  // ==================== Initialization ====================

  function setupEventListeners() {
    elements.startBtn.addEventListener('click', startSorting);
    elements.pauseBtn.addEventListener('click', pauseSorting);
    elements.resetBtn.addEventListener('click', resetArray);
    elements.shuffleBtn.addEventListener('click', shuffleArray);
    elements.sizeSlider.addEventListener('input', handleSizeChange);
    elements.speedSlider.addEventListener('input', handleSpeedChange);
    elements.algorithmSelect.addEventListener('change', handleAlgorithmChange);
    document.addEventListener('keydown', handleKeydown);
  }

  function init() {
    setupEventListeners();
    generateArray(parseInt(elements.sizeSlider.value));
    updateAlgorithmInfo(elements.algorithmSelect.value);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
