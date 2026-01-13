/**
 * KVSOVANREACH Logic Grid Puzzle
 * Classic logic puzzle game
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    puzzleTitle: document.getElementById('puzzleTitle'),
    puzzleDesc: document.getElementById('puzzleDesc'),
    cluesList: document.getElementById('cluesList'),
    gridContainer: document.getElementById('gridContainer'),
    timerDisplay: document.getElementById('timerDisplay'),
    movesDisplay: document.getElementById('movesDisplay'),
    hintsDisplay: document.getElementById('hintsDisplay'),
    victorySection: document.getElementById('victorySection'),
    finalTime: document.getElementById('finalTime'),
    finalMoves: document.getElementById('finalMoves'),
    hintBtn: document.getElementById('hintBtn'),
    resetBtn: document.getElementById('resetBtn'),
    newPuzzleBtn: document.getElementById('newPuzzleBtn'),
    nextPuzzleBtn: document.getElementById('nextPuzzleBtn')
  };

  // ==================== Puzzles ====================
  const PUZZLES = [
    {
      title: 'The Neighborhood',
      desc: 'Four neighbors live on different streets. Use the clues to figure out who lives where and owns which pet.',
      categories: [
        { name: 'Person', items: ['Alice', 'Bob', 'Carol', 'Dave'] },
        { name: 'Street', items: ['Oak St', 'Elm St', 'Pine St', 'Maple St'] },
        { name: 'Pet', items: ['Dog', 'Cat', 'Bird', 'Fish'] }
      ],
      solution: {
        'Alice': { 'Street': 'Oak St', 'Pet': 'Cat' },
        'Bob': { 'Street': 'Elm St', 'Pet': 'Dog' },
        'Carol': { 'Street': 'Pine St', 'Pet': 'Fish' },
        'Dave': { 'Street': 'Maple St', 'Pet': 'Bird' }
      },
      clues: [
        'Alice does not live on Elm St or Pine St.',
        'The person with the dog lives on Elm St.',
        'Carol has a fish.',
        'Dave does not have a dog or cat.',
        'Bob does not live on Oak St.',
        'The cat owner lives on Oak St.'
      ]
    },
    {
      title: 'Coffee Shop Order',
      desc: 'Four friends ordered different drinks at different times. Figure out who ordered what and when.',
      categories: [
        { name: 'Friend', items: ['Emma', 'Jack', 'Lily', 'Noah'] },
        { name: 'Drink', items: ['Latte', 'Mocha', 'Espresso', 'Tea'] },
        { name: 'Time', items: ['9 AM', '10 AM', '11 AM', '12 PM'] }
      ],
      solution: {
        'Emma': { 'Drink': 'Latte', 'Time': '10 AM' },
        'Jack': { 'Drink': 'Espresso', 'Time': '9 AM' },
        'Lily': { 'Drink': 'Tea', 'Time': '12 PM' },
        'Noah': { 'Drink': 'Mocha', 'Time': '11 AM' }
      },
      clues: [
        'Jack ordered first.',
        'The tea was ordered last.',
        'Emma did not order espresso or mocha.',
        'Noah ordered after Emma.',
        'Lily does not drink coffee.',
        'The espresso was ordered at 9 AM.'
      ]
    },
    {
      title: 'Movie Night',
      desc: 'Four students are watching movies. Determine what genre each prefers and what snack they chose.',
      categories: [
        { name: 'Student', items: ['Mike', 'Sara', 'Tom', 'Zoe'] },
        { name: 'Genre', items: ['Action', 'Comedy', 'Horror', 'Drama'] },
        { name: 'Snack', items: ['Popcorn', 'Candy', 'Nachos', 'Soda'] }
      ],
      solution: {
        'Mike': { 'Genre': 'Action', 'Snack': 'Nachos' },
        'Sara': { 'Genre': 'Comedy', 'Snack': 'Popcorn' },
        'Tom': { 'Genre': 'Horror', 'Snack': 'Soda' },
        'Zoe': { 'Genre': 'Drama', 'Snack': 'Candy' }
      },
      clues: [
        'Sara likes comedies.',
        'The person watching horror has soda.',
        'Mike does not like comedy or drama.',
        'Zoe has candy.',
        'The popcorn goes with comedy.',
        'Tom does not like action or drama.'
      ]
    }
  ];

  // ==================== State ====================
  const state = {
    currentPuzzle: 0,
    grid: {},
    moves: 0,
    hints: 0,
    startTime: null,
    timerInterval: null,
    solved: false
  };

  // ==================== Core Functions ====================

  function getPuzzle() {
    return PUZZLES[state.currentPuzzle];
  }

  function initGrid() {
    const puzzle = getPuzzle();
    state.grid = {};

    // Initialize grid for each category pair
    const primary = puzzle.categories[0];
    for (let i = 1; i < puzzle.categories.length; i++) {
      const secondary = puzzle.categories[i];
      const key = `${primary.name}-${secondary.name}`;
      state.grid[key] = {};

      primary.items.forEach(p => {
        state.grid[key][p] = {};
        secondary.items.forEach(s => {
          state.grid[key][p][s] = 0; // 0 = empty, 1 = yes, -1 = no
        });
      });
    }
  }

  function getCellValue(category1, item1, category2, item2) {
    const key = `${category1}-${category2}`;
    if (state.grid[key] && state.grid[key][item1]) {
      return state.grid[key][item1][item2];
    }
    // Try reverse
    const reverseKey = `${category2}-${category1}`;
    if (state.grid[reverseKey] && state.grid[reverseKey][item2]) {
      return state.grid[reverseKey][item2][item1];
    }
    return 0;
  }

  function setCellValue(category1, item1, category2, item2, value) {
    const key = `${category1}-${category2}`;
    if (state.grid[key] && state.grid[key][item1]) {
      state.grid[key][item1][item2] = value;
      return;
    }
    const reverseKey = `${category2}-${category1}`;
    if (state.grid[reverseKey] && state.grid[reverseKey][item2]) {
      state.grid[reverseKey][item2][item1] = value;
    }
  }

  function checkSolution() {
    const puzzle = getPuzzle();
    const primary = puzzle.categories[0];

    for (const pItem of primary.items) {
      const expected = puzzle.solution[pItem];

      for (let i = 1; i < puzzle.categories.length; i++) {
        const cat = puzzle.categories[i];
        const expectedItem = expected[cat.name];
        const value = getCellValue(primary.name, pItem, cat.name, expectedItem);

        if (value !== 1) return false;

        // Check that other items in this row are marked as no
        for (const item of cat.items) {
          if (item !== expectedItem) {
            const v = getCellValue(primary.name, pItem, cat.name, item);
            if (v !== -1) return false;
          }
        }
      }
    }

    return true;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ==================== UI Functions ====================

  function renderGrid() {
    const puzzle = getPuzzle();
    const primary = puzzle.categories[0];

    let html = '<table class="logic-grid">';

    // Header row
    html += '<tr>';
    html += '<th class="grid-header-cell corner"></th>';

    for (let i = 1; i < puzzle.categories.length; i++) {
      const cat = puzzle.categories[i];
      cat.items.forEach(item => {
        html += `<th class="grid-header-cell">${item}</th>`;
      });
    }
    html += '</tr>';

    // Data rows
    primary.items.forEach(pItem => {
      html += '<tr>';
      html += `<th class="grid-header-cell row-header">${pItem}</th>`;

      for (let i = 1; i < puzzle.categories.length; i++) {
        const cat = puzzle.categories[i];
        cat.items.forEach(sItem => {
          const value = getCellValue(primary.name, pItem, cat.name, sItem);
          let content = '';
          let className = 'grid-cell';

          if (value === 1) {
            content = '<i class="fa-solid fa-check"></i>';
            className += ' yes';
          } else if (value === -1) {
            content = '<i class="fa-solid fa-xmark"></i>';
            className += ' no';
          }

          html += `<td class="${className}" data-primary="${pItem}" data-category="${cat.name}" data-item="${sItem}">${content}</td>`;
        });
      }
      html += '</tr>';
    });

    html += '</table>';
    elements.gridContainer.innerHTML = html;

    // Add click handlers
    elements.gridContainer.querySelectorAll('.grid-cell').forEach(cell => {
      cell.addEventListener('click', () => handleCellClick(cell));
    });
  }

  function renderClues() {
    const puzzle = getPuzzle();
    elements.cluesList.innerHTML = puzzle.clues.map(clue => `<li>${clue}</li>`).join('');
  }

  function updateStats() {
    elements.movesDisplay.textContent = state.moves;
    elements.hintsDisplay.textContent = state.hints;
  }

  function updateTimer() {
    if (!state.startTime) return;
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    elements.timerDisplay.textContent = formatTime(elapsed);
  }

  function startTimer() {
    if (state.timerInterval) return;
    state.startTime = Date.now();
    state.timerInterval = setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function showVictory() {
    stopTimer();
    state.solved = true;

    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    elements.finalTime.textContent = formatTime(elapsed);
    elements.finalMoves.textContent = state.moves;
    elements.victorySection.classList.remove('hidden');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.success('Congratulations! Puzzle solved!');
    }
  }

  function hideVictory() {
    elements.victorySection.classList.add('hidden');
  }

  // ==================== Game Logic ====================

  function handleCellClick(cell) {
    if (state.solved) return;

    // Start timer on first click
    if (!state.startTime) {
      startTimer();
    }

    const primary = cell.dataset.primary;
    const category = cell.dataset.category;
    const item = cell.dataset.item;

    const puzzle = getPuzzle();
    const currentValue = getCellValue(puzzle.categories[0].name, primary, category, item);

    // Cycle: 0 -> 1 -> -1 -> 0
    let newValue;
    if (currentValue === 0) newValue = 1;
    else if (currentValue === 1) newValue = -1;
    else newValue = 0;

    setCellValue(puzzle.categories[0].name, primary, category, item, newValue);
    state.moves++;

    // If setting to yes, mark others in same row/column as no
    if (newValue === 1) {
      autoFillNos(puzzle.categories[0].name, primary, category, item);
    }

    renderGrid();
    updateStats();

    // Check for win
    if (checkSolution()) {
      showVictory();
    }
  }

  function autoFillNos(primaryCat, primaryItem, secondaryCat, secondaryItem) {
    const puzzle = getPuzzle();

    // Find the secondary category
    const cat = puzzle.categories.find(c => c.name === secondaryCat);
    if (!cat) return;

    // Mark other items in same row as no
    cat.items.forEach(item => {
      if (item !== secondaryItem) {
        const current = getCellValue(primaryCat, primaryItem, secondaryCat, item);
        if (current === 0) {
          setCellValue(primaryCat, primaryItem, secondaryCat, item, -1);
        }
      }
    });

    // Mark other items in same column as no
    puzzle.categories[0].items.forEach(pItem => {
      if (pItem !== primaryItem) {
        const current = getCellValue(primaryCat, pItem, secondaryCat, secondaryItem);
        if (current === 0) {
          setCellValue(primaryCat, pItem, secondaryCat, secondaryItem, -1);
        }
      }
    });
  }

  function giveHint() {
    if (state.solved) return;

    const puzzle = getPuzzle();
    const primary = puzzle.categories[0];

    // Find an incorrect or empty cell that should be yes or no
    for (const pItem of primary.items) {
      const expected = puzzle.solution[pItem];

      for (let i = 1; i < puzzle.categories.length; i++) {
        const cat = puzzle.categories[i];
        const expectedItem = expected[cat.name];

        // Check if the yes cell is marked
        const yesValue = getCellValue(primary.name, pItem, cat.name, expectedItem);
        if (yesValue !== 1) {
          // Hint: mark the correct cell
          setCellValue(primary.name, pItem, cat.name, expectedItem, 1);
          autoFillNos(primary.name, pItem, cat.name, expectedItem);
          state.hints++;
          updateStats();
          renderGrid();

          if (typeof ToolsCommon !== 'undefined') {
            ToolsCommon.Toast.info(`Hint: ${pItem} → ${expectedItem}`);
          }
          return;
        }
      }
    }
  }

  function resetPuzzle() {
    stopTimer();
    state.moves = 0;
    state.hints = 0;
    state.startTime = null;
    state.solved = false;

    initGrid();
    renderGrid();
    updateStats();
    hideVictory();
    elements.timerDisplay.textContent = '0:00';
  }

  function newPuzzle() {
    state.currentPuzzle = (state.currentPuzzle + 1) % PUZZLES.length;
    loadPuzzle();
  }

  function loadPuzzle() {
    const puzzle = getPuzzle();
    elements.puzzleTitle.textContent = puzzle.title;
    elements.puzzleDesc.textContent = puzzle.desc;
    renderClues();
    resetPuzzle();
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT') return;

    switch (e.key.toLowerCase()) {
      case 'h':
        giveHint();
        break;
      case 'r':
        resetPuzzle();
        break;
      case 'n':
        newPuzzle();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Buttons
    elements.hintBtn.addEventListener('click', giveHint);
    elements.resetBtn.addEventListener('click', resetPuzzle);
    elements.newPuzzleBtn.addEventListener('click', newPuzzle);
    elements.nextPuzzleBtn.addEventListener('click', newPuzzle);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Load first puzzle
    loadPuzzle();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
