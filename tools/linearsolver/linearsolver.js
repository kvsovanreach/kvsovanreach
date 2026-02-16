/**
 * KVSOVANREACH Linear Solver Tool
 * Solve systems of linear equations
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    sizeBtns: document.querySelectorAll('.size-btn'),
    equationsSection: document.getElementById('equationsSection'),
    solveBtn: document.getElementById('solveBtn'),
    clearBtn: document.getElementById('clearBtn'),
    resultSection: document.getElementById('resultSection'),
    resultContent: document.getElementById('resultContent'),
    stepsSection: document.getElementById('stepsSection'),
    stepsContent: document.getElementById('stepsContent'),
    toggleSteps: document.getElementById('toggleSteps'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    exampleBtns: document.querySelectorAll('.example-btn')
  };

  // ==================== State ====================
  const state = {
    size: 2,
    stepsVisible: true
  };

  // ==================== Variables ====================
  const VARS = ['x', 'y', 'z'];

  // ==================== Examples ====================
  const EXAMPLES = {
    1: { size: 2, coeffs: [[2, 1, 5], [1, -1, 1]] },
    2: { size: 3, coeffs: [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]] },
    3: { size: 2, coeffs: [[3, 2, 12], [1, -1, 1]] }
  };

  // ==================== Core Functions ====================

  /**
   * Gaussian elimination with partial pivoting
   */
  function gaussianElimination(matrix) {
    const n = matrix.length;
    const m = matrix[0].length;
    const steps = [];
    const A = matrix.map(row => [...row]); // Deep copy

    // Forward elimination
    for (let col = 0; col < n; col++) {
      // Find pivot
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) {
          maxRow = row;
        }
      }

      // Swap rows if needed
      if (maxRow !== col) {
        [A[col], A[maxRow]] = [A[maxRow], A[col]];
        steps.push(`Swap row ${col + 1} and row ${maxRow + 1}`);
      }

      // Check for zero pivot
      if (Math.abs(A[col][col]) < 1e-10) {
        continue;
      }

      // Eliminate column
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > 1e-10) {
          const factor = A[row][col] / A[col][col];
          for (let j = col; j < m; j++) {
            A[row][j] -= factor * A[col][j];
          }
          steps.push(`R${row + 1} = R${row + 1} - (${factor.toFixed(2)}) × R${col + 1}`);
        }
      }
    }

    // Back substitution
    const solution = new Array(n).fill(null);
    for (let i = n - 1; i >= 0; i--) {
      // Find first non-zero coefficient in row
      let pivotCol = -1;
      for (let j = 0; j < n; j++) {
        if (Math.abs(A[i][j]) > 1e-10) {
          pivotCol = j;
          break;
        }
      }

      if (pivotCol === -1) {
        // All coefficients are zero
        if (Math.abs(A[i][m - 1]) > 1e-10) {
          // 0 = non-zero: no solution
          return { type: 'no-solution', steps };
        }
        // 0 = 0: free variable (infinite solutions)
        continue;
      }

      // Calculate value
      let sum = A[i][m - 1];
      for (let j = pivotCol + 1; j < n; j++) {
        if (solution[j] !== null) {
          sum -= A[i][j] * solution[j];
        }
      }
      solution[pivotCol] = sum / A[i][pivotCol];
      steps.push(`Solve for ${VARS[pivotCol]}: ${VARS[pivotCol]} = ${solution[pivotCol].toFixed(4)}`);
    }

    // Check for free variables (infinite solutions)
    if (solution.some(v => v === null)) {
      return { type: 'infinite', steps };
    }

    return { type: 'unique', solution, steps };
  }

  // ==================== UI Functions ====================

  function createEquationRow(eqIndex, size) {
    const row = document.createElement('div');
    row.className = 'equation-row';

    for (let i = 0; i < size; i++) {
      if (i > 0) {
        const op = document.createElement('span');
        op.className = 'equation-op';
        op.textContent = '+';
        row.appendChild(op);
      }

      const term = document.createElement('div');
      term.className = 'equation-term';

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `coef_${eqIndex}_${i}`;
      input.placeholder = '0';
      input.setAttribute('inputmode', 'decimal');

      const label = document.createElement('span');
      label.className = 'var-label';
      label.textContent = VARS[i];

      term.appendChild(input);
      term.appendChild(label);
      row.appendChild(term);
    }

    // Equals sign
    const eq = document.createElement('span');
    eq.className = 'equation-op';
    eq.textContent = '=';
    row.appendChild(eq);

    // Constant term
    const constTerm = document.createElement('div');
    constTerm.className = 'equation-term';
    const constInput = document.createElement('input');
    constInput.type = 'text';
    constInput.id = `const_${eqIndex}`;
    constInput.placeholder = '0';
    constInput.setAttribute('inputmode', 'decimal');
    constTerm.appendChild(constInput);
    row.appendChild(constTerm);

    return row;
  }

  function generateEquations() {
    elements.equationsSection.innerHTML = '';
    for (let i = 0; i < state.size; i++) {
      elements.equationsSection.appendChild(createEquationRow(i, state.size));
    }
  }

  function getCoefficients() {
    const matrix = [];
    for (let i = 0; i < state.size; i++) {
      const row = [];
      for (let j = 0; j < state.size; j++) {
        const input = document.getElementById(`coef_${i}_${j}`);
        row.push(parseFloat(input.value) || 0);
      }
      const constInput = document.getElementById(`const_${i}`);
      row.push(parseFloat(constInput.value) || 0);
      matrix.push(row);
    }
    return matrix;
  }

  function setCoefficients(coeffs) {
    coeffs.forEach((row, i) => {
      row.forEach((val, j) => {
        if (j < state.size) {
          const input = document.getElementById(`coef_${i}_${j}`);
          if (input) input.value = val || '';
        } else {
          const input = document.getElementById(`const_${i}`);
          if (input) input.value = val || '';
        }
      });
    });
  }

  function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.resultSection.classList.add('hidden');
    elements.stepsSection.classList.add('hidden');
  }

  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  function displayResult(result) {
    hideError();
    elements.resultSection.classList.remove('hidden');
    elements.resultSection.classList.remove('no-solution', 'infinite');

    if (result.type === 'no-solution') {
      elements.resultSection.classList.add('no-solution');
      elements.resultContent.innerHTML = `
        <div class="result-message">
          <strong>No solution exists.</strong><br>
          The system of equations is inconsistent (parallel lines/planes).
        </div>
      `;
    } else if (result.type === 'infinite') {
      elements.resultSection.classList.add('infinite');
      elements.resultContent.innerHTML = `
        <div class="result-message">
          <strong>Infinite solutions exist.</strong><br>
          The equations are dependent (same line/plane).
        </div>
      `;
    } else {
      elements.resultContent.innerHTML = result.solution.map((val, i) => `
        <div class="result-item">
          <span class="result-var">${VARS[i]}</span>
          <span class="result-equals">=</span>
          <span class="result-value">${Number.isInteger(val) ? val : val.toFixed(4)}</span>
        </div>
      `).join('');
    }

    // Display steps
    if (result.steps && result.steps.length > 0) {
      elements.stepsContent.innerHTML = result.steps.map((step, i) => `
        <div class="step-row">
          <span class="step-num">${i + 1}</span>
          <span class="step-text">${step}</span>
        </div>
      `).join('');
      elements.stepsSection.classList.remove('hidden');
    }
  }

  function solve() {
    const matrix = getCoefficients();

    // Check if all zeros
    const allZeros = matrix.every(row => row.every(v => v === 0));
    if (allZeros) {
      showError('Please enter at least one non-zero coefficient.');
      return;
    }

    const result = gaussianElimination(matrix);
    displayResult(result);
  }

  function clearAll() {
    generateEquations();
    elements.resultSection.classList.add('hidden');
    elements.stepsSection.classList.add('hidden');
    hideError();
  }

  function loadExample(exampleId) {
    const example = EXAMPLES[exampleId];
    if (example) {
      state.size = example.size;
      elements.sizeBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.size) === state.size);
      });
      generateEquations();
      setCoefficients(example.coeffs);
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Size buttons
    elements.sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.size = parseInt(btn.dataset.size);
        generateEquations();
        elements.resultSection.classList.add('hidden');
        elements.stepsSection.classList.add('hidden');
        hideError();
      });
    });

    // Solve button
    elements.solveBtn.addEventListener('click', solve);

    // Clear button
    elements.clearBtn.addEventListener('click', clearAll);

    // Toggle steps
    elements.toggleSteps.addEventListener('click', () => {
      state.stepsVisible = !state.stepsVisible;
      elements.stepsContent.style.display = state.stepsVisible ? 'block' : 'none';
      elements.toggleSteps.querySelector('i').className =
        state.stepsVisible ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    });

    // Example buttons
    elements.exampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        loadExample(btn.dataset.example);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.matches('input')) {
        e.preventDefault();
        solve();
      }
    });

    // Generate initial equations
    generateEquations();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
