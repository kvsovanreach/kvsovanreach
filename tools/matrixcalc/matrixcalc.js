/**
 * KVSOVANREACH Matrix Calculator Tool
 * Perform matrix operations with visual results
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    matrixA: document.getElementById('matrixA'),
    matrixB: document.getElementById('matrixB'),
    rowsA: document.getElementById('rowsA'),
    colsA: document.getElementById('colsA'),
    rowsB: document.getElementById('rowsB'),
    colsB: document.getElementById('colsB'),
    opBtns: document.querySelectorAll('.op-btn'),
    singleOpBtns: document.querySelectorAll('.single-op-btn'),
    quickActions: document.querySelectorAll('.quick-action'),
    calculateBtn: document.getElementById('calculateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    resultSection: document.getElementById('resultSection'),
    resultDisplay: document.getElementById('resultDisplay'),
    resultInfo: document.getElementById('resultInfo'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText')
  };

  // ==================== State ====================
  const state = {
    operation: 'add'
  };

  // ==================== Matrix Functions ====================

  /**
   * Create matrix grid
   */
  function createMatrixGrid(container, rows, cols, prefix) {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'matrix-cell';
        input.id = `${prefix}_${i}_${j}`;
        input.value = '0';
        input.setAttribute('inputmode', 'decimal');
        container.appendChild(input);
      }
    }
  }

  /**
   * Get matrix values from grid
   */
  function getMatrixValues(container, rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const cell = container.querySelector(`#${container.id.replace('matrix', '')}_${i}_${j}`);
        const value = parseFloat(cell?.value) || 0;
        row.push(value);
      }
      matrix.push(row);
    }
    return matrix;
  }

  /**
   * Set matrix values
   */
  function setMatrixValues(container, matrix, prefix) {
    matrix.forEach((row, i) => {
      row.forEach((val, j) => {
        const cell = container.querySelector(`#${prefix}_${i}_${j}`);
        if (cell) cell.value = val;
      });
    });
  }

  /**
   * Matrix addition
   */
  function addMatrices(A, B) {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
  }

  /**
   * Matrix subtraction
   */
  function subtractMatrices(A, B) {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
  }

  /**
   * Matrix multiplication
   */
  function multiplyMatrices(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;

    const result = [];
    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  /**
   * Matrix transpose
   */
  function transposeMatrix(M) {
    return M[0].map((_, i) => M.map(row => row[i]));
  }

  /**
   * Matrix determinant (recursive)
   */
  function determinant(M) {
    const n = M.length;

    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = M.slice(1).map(row => [...row.slice(0, j), ...row.slice(j + 1)]);
      det += Math.pow(-1, j) * M[0][j] * determinant(minor);
    }
    return det;
  }

  /**
   * Generate identity matrix
   */
  function identityMatrix(size) {
    const m = [];
    for (let i = 0; i < size; i++) {
      m[i] = [];
      for (let j = 0; j < size; j++) {
        m[i][j] = i === j ? 1 : 0;
      }
    }
    return m;
  }

  /**
   * Generate zero matrix
   */
  function zeroMatrix(rows, cols) {
    return Array(rows).fill(null).map(() => Array(cols).fill(0));
  }

  /**
   * Generate random matrix
   */
  function randomMatrix(rows, cols) {
    return Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => Math.floor(Math.random() * 19) - 9)
    );
  }

  // ==================== UI Functions ====================

  function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.resultSection.classList.add('hidden');
  }

  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  function displayResult(result, info = '') {
    hideError();

    if (typeof result === 'number') {
      // Scalar result (determinant)
      elements.resultDisplay.innerHTML = `
        <div class="result-scalar">${Number.isInteger(result) ? result : result.toFixed(4)}</div>
      `;
    } else {
      // Matrix result
      const rows = result.length;
      const cols = result[0].length;

      let html = `<div class="result-matrix" style="grid-template-columns: repeat(${cols}, 1fr)">`;
      result.forEach(row => {
        row.forEach(val => {
          const formatted = Number.isInteger(val) ? val : val.toFixed(2);
          html += `<div class="result-cell">${formatted}</div>`;
        });
      });
      html += '</div>';
      elements.resultDisplay.innerHTML = html;
    }

    elements.resultInfo.textContent = info;
    elements.resultSection.classList.remove('hidden');
  }

  function calculate() {
    const rowsA = parseInt(elements.rowsA.value);
    const colsA = parseInt(elements.colsA.value);
    const rowsB = parseInt(elements.rowsB.value);
    const colsB = parseInt(elements.colsB.value);

    const A = getMatrixValues(elements.matrixA, rowsA, colsA);
    const B = getMatrixValues(elements.matrixB, rowsB, colsB);

    let result;
    let info = '';

    switch (state.operation) {
      case 'add':
        if (rowsA !== rowsB || colsA !== colsB) {
          showError('Matrices must have the same dimensions for addition.');
          return;
        }
        result = addMatrices(A, B);
        info = `${rowsA}×${colsA} + ${rowsB}×${colsB} = ${rowsA}×${colsA}`;
        break;

      case 'subtract':
        if (rowsA !== rowsB || colsA !== colsB) {
          showError('Matrices must have the same dimensions for subtraction.');
          return;
        }
        result = subtractMatrices(A, B);
        info = `${rowsA}×${colsA} - ${rowsB}×${colsB} = ${rowsA}×${colsA}`;
        break;

      case 'multiply':
        if (colsA !== rowsB) {
          showError(`Cannot multiply: A columns (${colsA}) must equal B rows (${rowsB}).`);
          return;
        }
        result = multiplyMatrices(A, B);
        info = `${rowsA}×${colsA} × ${rowsB}×${colsB} = ${rowsA}×${colsB}`;
        break;
    }

    displayResult(result, info);
  }

  function performSingleOp(op, matrixName) {
    const isA = matrixName === 'A';
    const rows = parseInt(isA ? elements.rowsA.value : elements.rowsB.value);
    const cols = parseInt(isA ? elements.colsA.value : elements.colsB.value);
    const container = isA ? elements.matrixA : elements.matrixB;
    const M = getMatrixValues(container, rows, cols);

    if (op === 'transpose') {
      const result = transposeMatrix(M);
      displayResult(result, `Transpose of ${matrixName}: ${rows}×${cols} → ${cols}×${rows}`);
    } else if (op === 'determinant') {
      if (rows !== cols) {
        showError(`Matrix ${matrixName} must be square to calculate determinant.`);
        return;
      }
      const det = determinant(M);
      displayResult(det, `Determinant of ${matrixName} (${rows}×${cols})`);
    }
  }

  function applyQuickAction(action, matrixName) {
    const isA = matrixName === 'A';
    const rows = parseInt(isA ? elements.rowsA.value : elements.rowsB.value);
    const cols = parseInt(isA ? elements.colsA.value : elements.colsB.value);
    const container = isA ? elements.matrixA : elements.matrixB;
    const prefix = isA ? 'A' : 'B';

    let matrix;
    switch (action) {
      case 'identity':
        const size = Math.min(rows, cols);
        matrix = zeroMatrix(rows, cols);
        for (let i = 0; i < size; i++) {
          matrix[i][i] = 1;
        }
        break;
      case 'zeros':
        matrix = zeroMatrix(rows, cols);
        break;
      case 'random':
        matrix = randomMatrix(rows, cols);
        break;
    }

    setMatrixValues(container, matrix, prefix);
  }

  function clearAll() {
    const rowsA = parseInt(elements.rowsA.value);
    const colsA = parseInt(elements.colsA.value);
    const rowsB = parseInt(elements.rowsB.value);
    const colsB = parseInt(elements.colsB.value);

    setMatrixValues(elements.matrixA, zeroMatrix(rowsA, colsA), 'A');
    setMatrixValues(elements.matrixB, zeroMatrix(rowsB, colsB), 'B');

    elements.resultSection.classList.add('hidden');
    hideError();
  }

  function copyResult() {
    const resultCells = elements.resultDisplay.querySelectorAll('.result-cell');
    if (resultCells.length > 0) {
      const scalar = elements.resultDisplay.querySelector('.result-scalar');
      if (scalar) {
        ToolsCommon.Clipboard.copy(scalar.textContent);
      } else {
        const values = Array.from(resultCells).map(c => c.textContent);
        ToolsCommon.Clipboard.copy(values.join('\t'));
      }
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Create initial matrices
    createMatrixGrid(elements.matrixA, 2, 2, 'A');
    createMatrixGrid(elements.matrixB, 2, 2, 'B');

    // Size change handlers
    elements.rowsA.addEventListener('change', () => {
      createMatrixGrid(elements.matrixA, parseInt(elements.rowsA.value), parseInt(elements.colsA.value), 'A');
    });
    elements.colsA.addEventListener('change', () => {
      createMatrixGrid(elements.matrixA, parseInt(elements.rowsA.value), parseInt(elements.colsA.value), 'A');
    });
    elements.rowsB.addEventListener('change', () => {
      createMatrixGrid(elements.matrixB, parseInt(elements.rowsB.value), parseInt(elements.colsB.value), 'B');
    });
    elements.colsB.addEventListener('change', () => {
      createMatrixGrid(elements.matrixB, parseInt(elements.rowsB.value), parseInt(elements.colsB.value), 'B');
    });

    // Operation buttons
    elements.opBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.opBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.operation = btn.dataset.op;
      });
    });

    // Single operation buttons
    elements.singleOpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        performSingleOp(btn.dataset.op, btn.dataset.matrix);
      });
    });

    // Quick action buttons
    elements.quickActions.forEach(btn => {
      btn.addEventListener('click', () => {
        applyQuickAction(btn.dataset.action, btn.dataset.matrix);
      });
    });

    // Calculate button
    elements.calculateBtn.addEventListener('click', calculate);

    // Clear button
    elements.clearBtn.addEventListener('click', clearAll);

    // Copy result
    elements.copyResultBtn.addEventListener('click', copyResult);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.matches('.matrix-cell')) {
        e.preventDefault();
        calculate();
      }
    });
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
