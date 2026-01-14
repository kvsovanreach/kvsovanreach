/**
 * KVSOVANREACH Search Algorithm Explorer
 * Visualize search algorithms step by step
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    algorithmSelect: document.getElementById('algorithmSelect'),
    targetInput: document.getElementById('targetInput'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeValue: document.getElementById('sizeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    searchBtn: document.getElementById('searchBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    arrayContainer: document.getElementById('arrayContainer'),
    pointerInfo: document.getElementById('pointerInfo'),
    comparisons: document.getElementById('comparisons'),
    currentIndex: document.getElementById('currentIndex'),
    result: document.getElementById('result'),
    algorithmName: document.getElementById('algorithmName'),
    algorithmDesc: document.getElementById('algorithmDesc'),
    timeBest: document.getElementById('timeBest'),
    timeAvg: document.getElementById('timeAvg'),
    timeWorst: document.getElementById('timeWorst'),
    requirement: document.getElementById('requirement')
  };

  // Algorithm info
  const algorithms = {
    linear: {
      name: 'Linear Search',
      desc: 'Linear Search checks each element sequentially until the target is found or the array ends. Simple but works on unsorted arrays.',
      timeBest: 'O(1)',
      timeAvg: 'O(n)',
      timeWorst: 'O(n)',
      requirement: 'None'
    },
    binary: {
      name: 'Binary Search',
      desc: 'Binary Search repeatedly divides the search space in half. Much faster than linear search but requires a sorted array.',
      timeBest: 'O(1)',
      timeAvg: 'O(log n)',
      timeWorst: 'O(log n)',
      requirement: 'Sorted Array'
    },
    jump: {
      name: 'Jump Search',
      desc: 'Jump Search skips ahead by fixed steps, then performs linear search backwards. A balance between linear and binary search.',
      timeBest: 'O(1)',
      timeAvg: 'O(√n)',
      timeWorst: 'O(√n)',
      requirement: 'Sorted Array'
    }
  };

  // State
  let array = [];
  let searchState = null;
  let isSearching = false;
  let searchInterval = null;

  /**
   * Initialize the application
   */
  function init() {
    generateArray();
    bindEvents();
    updateAlgorithmInfo();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    elements.algorithmSelect.addEventListener('change', () => {
      updateAlgorithmInfo();
      resetSearch();
    });

    elements.sizeSlider.addEventListener('input', () => {
      elements.sizeValue.textContent = elements.sizeSlider.value;
    });

    elements.sizeSlider.addEventListener('change', () => {
      generateArray();
    });

    elements.speedSlider.addEventListener('input', () => {
      elements.speedValue.textContent = elements.speedSlider.value;
    });

    elements.searchBtn.addEventListener('click', toggleSearch);
    elements.stepBtn.addEventListener('click', stepSearch);
    elements.resetBtn.addEventListener('click', resetSearch);
    elements.shuffleBtn.addEventListener('click', generateArray);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Generate a new array
   */
  function generateArray() {
    const size = parseInt(elements.sizeSlider.value);
    const algorithm = elements.algorithmSelect.value;

    // Generate random unique numbers
    const numbers = new Set();
    while (numbers.size < size) {
      numbers.add(Math.floor(Math.random() * 99) + 1);
    }
    array = Array.from(numbers);

    // Sort for binary and jump search
    if (algorithm === 'binary' || algorithm === 'jump') {
      array.sort((a, b) => a - b);
    }

    // Set a random target from the array (80% chance) or outside (20% chance)
    if (Math.random() < 0.8) {
      elements.targetInput.value = array[Math.floor(Math.random() * array.length)];
    } else {
      elements.targetInput.value = Math.floor(Math.random() * 99) + 1;
    }

    resetSearch();
    renderArray();
  }

  /**
   * Render the array visualization
   */
  function renderArray() {
    elements.arrayContainer.innerHTML = array.map((value, index) => `
      <div class="array-element" data-index="${index}">
        <div class="array-bar" data-index="${index}">${value}</div>
        <span class="array-index">${index}</span>
      </div>
    `).join('');

    updatePointerInfo();
  }

  /**
   * Update array element states
   */
  function updateArrayDisplay() {
    if (!searchState) return;

    const bars = document.querySelectorAll('.array-bar');
    const elements = document.querySelectorAll('.array-element');

    bars.forEach((bar, index) => {
      bar.className = 'array-bar';
      elements[index].className = 'array-element';

      if (searchState.eliminated.has(index)) {
        bar.classList.add('eliminated');
      } else if (searchState.found === index) {
        bar.classList.add('found');
        elements[index].classList.add('current');
      } else if (index === searchState.current) {
        bar.classList.add('current');
        elements[index].classList.add('current');
      } else if (searchState.checked.has(index)) {
        bar.classList.add('checked');
      }
    });

    updatePointerInfo();
  }

  /**
   * Update pointer info display
   */
  function updatePointerInfo() {
    const algorithm = elements.algorithmSelect.value;

    if (algorithm === 'binary' && searchState && searchState.low !== undefined) {
      elements.pointerInfo.innerHTML = `
        <div class="pointer-indicator">
          <span class="pointer-color low"></span>
          <span>Low: ${searchState.low}</span>
        </div>
        <div class="pointer-indicator">
          <span class="pointer-color mid"></span>
          <span>Mid: ${searchState.current}</span>
        </div>
        <div class="pointer-indicator">
          <span class="pointer-color high"></span>
          <span>High: ${searchState.high}</span>
        </div>
      `;
    } else if (algorithm === 'jump' && searchState && searchState.blockStart !== undefined) {
      elements.pointerInfo.innerHTML = `
        <div class="pointer-indicator">
          <span class="pointer-color low"></span>
          <span>Block Start: ${searchState.blockStart}</span>
        </div>
        <div class="pointer-indicator">
          <span class="pointer-color mid"></span>
          <span>Current: ${searchState.current}</span>
        </div>
      `;
    } else {
      elements.pointerInfo.innerHTML = '';
    }
  }

  /**
   * Toggle search (start/pause)
   */
  function toggleSearch() {
    if (isSearching) {
      pauseSearch();
    } else {
      startSearch();
    }
  }

  /**
   * Start automated search
   */
  function startSearch() {
    if (!searchState) {
      initSearchState();
    }

    if (searchState.done) {
      resetSearch();
      initSearchState();
    }

    isSearching = true;
    updateSearchButton();

    const speed = parseInt(elements.speedSlider.value);
    searchInterval = setInterval(() => {
      const done = performStep();
      if (done) {
        pauseSearch();
      }
    }, speed);
  }

  /**
   * Pause search
   */
  function pauseSearch() {
    isSearching = false;
    if (searchInterval) {
      clearInterval(searchInterval);
      searchInterval = null;
    }
    updateSearchButton();
  }

  /**
   * Step through search manually
   */
  function stepSearch() {
    if (!searchState) {
      initSearchState();
    }

    if (searchState.done) {
      return;
    }

    pauseSearch();
    performStep();
  }

  /**
   * Reset search
   */
  function resetSearch() {
    pauseSearch();
    searchState = null;
    elements.comparisons.textContent = '0';
    elements.currentIndex.textContent = '-';
    elements.result.textContent = '-';
    elements.result.style.color = '';

    // Re-render to clear states
    renderArray();
  }

  /**
   * Initialize search state
   */
  function initSearchState() {
    const target = parseInt(elements.targetInput.value);
    const algorithm = elements.algorithmSelect.value;

    searchState = {
      target,
      algorithm,
      current: -1,
      comparisons: 0,
      checked: new Set(),
      eliminated: new Set(),
      found: -1,
      done: false
    };

    // Algorithm specific state
    if (algorithm === 'binary') {
      searchState.low = 0;
      searchState.high = array.length - 1;
    } else if (algorithm === 'jump') {
      searchState.step = Math.floor(Math.sqrt(array.length));
      searchState.prev = 0;
      searchState.blockStart = 0;
      searchState.phase = 'jump'; // 'jump' or 'linear'
    }
  }

  /**
   * Perform one search step
   */
  function performStep() {
    if (!searchState || searchState.done) return true;

    const algorithm = searchState.algorithm;

    switch (algorithm) {
      case 'linear':
        return linearStep();
      case 'binary':
        return binaryStep();
      case 'jump':
        return jumpStep();
      default:
        return true;
    }
  }

  /**
   * Linear search step
   */
  function linearStep() {
    searchState.current++;
    searchState.comparisons++;

    updateStats();

    if (searchState.current >= array.length) {
      searchState.done = true;
      showNotFound();
      return true;
    }

    searchState.checked.add(searchState.current);
    updateArrayDisplay();

    if (array[searchState.current] === searchState.target) {
      searchState.found = searchState.current;
      searchState.done = true;
      showFound(searchState.current);
      return true;
    }

    return false;
  }

  /**
   * Binary search step
   */
  function binaryStep() {
    if (searchState.low > searchState.high) {
      searchState.done = true;
      showNotFound();
      return true;
    }

    const mid = Math.floor((searchState.low + searchState.high) / 2);
    searchState.current = mid;
    searchState.comparisons++;

    updateStats();
    searchState.checked.add(mid);
    updateArrayDisplay();

    if (array[mid] === searchState.target) {
      searchState.found = mid;
      searchState.done = true;
      showFound(mid);
      return true;
    }

    // Eliminate half
    if (array[mid] < searchState.target) {
      // Eliminate left half
      for (let i = searchState.low; i <= mid; i++) {
        searchState.eliminated.add(i);
      }
      searchState.low = mid + 1;
    } else {
      // Eliminate right half
      for (let i = mid; i <= searchState.high; i++) {
        searchState.eliminated.add(i);
      }
      searchState.high = mid - 1;
    }

    return false;
  }

  /**
   * Jump search step
   */
  function jumpStep() {
    if (searchState.phase === 'jump') {
      // Jump phase
      searchState.current = Math.min(searchState.prev + searchState.step, array.length) - 1;
      searchState.comparisons++;
      searchState.checked.add(searchState.current);

      updateStats();
      updateArrayDisplay();

      if (array[searchState.current] >= searchState.target) {
        // Found block, switch to linear
        searchState.phase = 'linear';
        searchState.blockStart = searchState.prev;
        searchState.current = searchState.prev - 1;

        // Mark elements before block as eliminated
        for (let i = 0; i < searchState.prev; i++) {
          searchState.eliminated.add(i);
        }
      } else if (searchState.current >= array.length - 1) {
        // Reached end, switch to linear from prev
        searchState.phase = 'linear';
        searchState.blockStart = searchState.prev;
        searchState.current = searchState.prev - 1;
      } else {
        searchState.prev = searchState.current + 1;
      }
    } else {
      // Linear phase within block
      searchState.current++;
      searchState.comparisons++;

      updateStats();

      if (searchState.current > Math.min(searchState.blockStart + searchState.step - 1, array.length - 1)) {
        searchState.done = true;
        showNotFound();
        return true;
      }

      searchState.checked.add(searchState.current);
      updateArrayDisplay();

      if (array[searchState.current] === searchState.target) {
        searchState.found = searchState.current;
        searchState.done = true;
        showFound(searchState.current);
        return true;
      }

      if (array[searchState.current] > searchState.target) {
        searchState.done = true;
        showNotFound();
        return true;
      }
    }

    return false;
  }

  /**
   * Update statistics display
   */
  function updateStats() {
    elements.comparisons.textContent = searchState.comparisons;
    elements.currentIndex.textContent = searchState.current;
  }

  /**
   * Show found result
   */
  function showFound(index) {
    elements.result.textContent = `Found at index ${index}`;
    elements.result.style.color = '#22c55e';
    updateArrayDisplay();
    ToolsCommon.Toast.show(`Target ${searchState.target} found at index ${index}!`, 'success');
  }

  /**
   * Show not found result
   */
  function showNotFound() {
    elements.result.textContent = 'Not Found';
    elements.result.style.color = '#ef4444';
    updateArrayDisplay();
    ToolsCommon.Toast.show(`Target ${searchState.target} not found in array`, 'error');
  }

  /**
   * Update search button state
   */
  function updateSearchButton() {
    const icon = elements.searchBtn.querySelector('i');
    const span = elements.searchBtn.querySelector('span');

    if (isSearching) {
      icon.className = 'fa-solid fa-pause';
      span.textContent = 'Pause';
    } else {
      icon.className = 'fa-solid fa-play';
      span.textContent = 'Search';
    }
  }

  /**
   * Update algorithm info panel
   */
  function updateAlgorithmInfo() {
    const algo = algorithms[elements.algorithmSelect.value];
    elements.algorithmName.textContent = algo.name;
    elements.algorithmDesc.textContent = algo.desc;
    elements.timeBest.textContent = algo.timeBest;
    elements.timeAvg.textContent = algo.timeAvg;
    elements.timeWorst.textContent = algo.timeWorst;
    elements.requirement.textContent = algo.requirement;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        toggleSearch();
        break;
      case 'n':
        stepSearch();
        break;
      case 'r':
        resetSearch();
        break;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
