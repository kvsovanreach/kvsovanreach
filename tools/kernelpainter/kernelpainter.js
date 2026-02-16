/**
 * KVSOVANREACH Kernel Painter
 * Interactive CNN convolution visualization
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const GRID_SIZE = 12;

  const KERNELS = {
    identity: {
      name: 'Identity',
      values: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ]
    },
    edge: {
      name: 'Edge Detection',
      values: [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]
      ]
    },
    sharpen: {
      name: 'Sharpen',
      values: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ]
    },
    blur: {
      name: 'Box Blur',
      values: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ]
    },
    gaussian: {
      name: 'Gaussian Blur',
      values: [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
      ]
    },
    emboss: {
      name: 'Emboss',
      values: [
        [-2, -1, 0],
        [-1, 1, 1],
        [0, 1, 2]
      ]
    },
    sobel_x: {
      name: 'Sobel X',
      values: [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ]
    },
    sobel_y: {
      name: 'Sobel Y',
      values: [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ]
    }
  };

  // ==================== State ====================
  const state = {
    inputGrid: [],
    outputGrid: [],
    kernel: KERNELS.identity.values,
    brushValue: 255,
    isDrawing: false,
    isAnimating: false,
    animationId: null
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputGrid: document.getElementById('inputGrid'),
    outputGrid: document.getElementById('outputGrid'),
    kernelGrid: document.getElementById('kernelGrid'),
    kernelPreset: document.getElementById('kernelPreset'),
    kernelSum: document.getElementById('kernelSum'),
    clearBtn: document.getElementById('clearBtn'),
    randomBtn: document.getElementById('randomBtn'),
    animateBtn: document.getElementById('animateBtn'),
    stopBtn: document.getElementById('stopBtn'),
    animationProgress: document.getElementById('animationProgress'),
    brushBtns: document.querySelectorAll('.brush-btn')
  };

  // ==================== Grid Initialization ====================

  function initGrids() {
    // Initialize data arrays
    state.inputGrid = [];
    state.outputGrid = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      const inputRow = [];
      const outputRow = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        inputRow.push(0);
        outputRow.push(0);
      }
      state.inputGrid.push(inputRow);
      state.outputGrid.push(outputRow);
    }

    // Create DOM elements
    createPixelGrid(elements.inputGrid, true);
    createPixelGrid(elements.outputGrid, false);
  }

  function createPixelGrid(container, isInput) {
    container.innerHTML = '';

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.dataset.x = x;
        pixel.dataset.y = y;

        if (isInput) {
          pixel.addEventListener('mousedown', handlePixelMouseDown);
          pixel.addEventListener('mouseenter', handlePixelMouseEnter);
          pixel.addEventListener('touchstart', handlePixelTouch, { passive: false });
          pixel.addEventListener('touchmove', handlePixelTouchMove, { passive: false });
        }

        container.appendChild(pixel);
      }
    }
  }

  function createKernelGrid() {
    elements.kernelGrid.innerHTML = '';

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const cell = document.createElement('div');
        cell.className = 'kernel-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        const value = state.kernel[y][x];
        cell.textContent = value;

        if (value > 0) cell.classList.add('positive');
        else if (value < 0) cell.classList.add('negative');
        else cell.classList.add('zero');

        elements.kernelGrid.appendChild(cell);
      }
    }

    updateKernelSum();
  }

  function updateKernelSum() {
    let sum = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        sum += state.kernel[y][x];
      }
    }
    elements.kernelSum.textContent = sum || 1;
  }

  // ==================== Rendering ====================

  function renderInputGrid() {
    const pixels = elements.inputGrid.querySelectorAll('.pixel');
    pixels.forEach(pixel => {
      const x = parseInt(pixel.dataset.x);
      const y = parseInt(pixel.dataset.y);
      const value = state.inputGrid[y][x];
      pixel.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
    });
  }

  function renderOutputGrid() {
    const pixels = elements.outputGrid.querySelectorAll('.pixel');
    pixels.forEach(pixel => {
      const x = parseInt(pixel.dataset.x);
      const y = parseInt(pixel.dataset.y);
      const value = state.outputGrid[y][x];
      pixel.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
    });
  }

  // ==================== Convolution ====================

  function applyConvolution() {
    const kernelSum = state.kernel.flat().reduce((a, b) => a + b, 0) || 1;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let sum = 0;

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelY = y + ky - 1;
            const pixelX = x + kx - 1;

            // Handle boundaries (use 0 for out-of-bounds)
            let pixelValue = 0;
            if (pixelY >= 0 && pixelY < GRID_SIZE && pixelX >= 0 && pixelX < GRID_SIZE) {
              pixelValue = state.inputGrid[pixelY][pixelX];
            }

            sum += pixelValue * state.kernel[ky][kx];
          }
        }

        // Normalize by kernel sum (for blur kernels)
        if (kernelSum > 1) {
          sum = Math.round(sum / kernelSum);
        }

        // Clamp to valid range
        state.outputGrid[y][x] = Math.max(0, Math.min(255, sum));
      }
    }

    renderOutputGrid();
  }

  function applyConvolutionAnimated() {
    if (state.isAnimating) return;

    state.isAnimating = true;
    elements.animateBtn.disabled = true;
    elements.stopBtn.disabled = false;

    const kernelSum = state.kernel.flat().reduce((a, b) => a + b, 0) || 1;
    let currentX = 0;
    let currentY = 0;

    // Clear output
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        state.outputGrid[y][x] = 0;
      }
    }
    renderOutputGrid();

    function animateStep() {
      if (!state.isAnimating) {
        cleanup();
        return;
      }

      // Remove previous highlights
      clearHighlights();

      // Highlight current position
      highlightKernelPosition(currentX, currentY);

      // Calculate convolution for this position
      let sum = 0;
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const pixelY = currentY + ky - 1;
          const pixelX = currentX + kx - 1;

          let pixelValue = 0;
          if (pixelY >= 0 && pixelY < GRID_SIZE && pixelX >= 0 && pixelX < GRID_SIZE) {
            pixelValue = state.inputGrid[pixelY][pixelX];
          }

          sum += pixelValue * state.kernel[ky][kx];
        }
      }

      if (kernelSum > 1) {
        sum = Math.round(sum / kernelSum);
      }

      state.outputGrid[currentY][currentX] = Math.max(0, Math.min(255, sum));

      // Update output display
      const outputPixel = elements.outputGrid.children[currentY * GRID_SIZE + currentX];
      const value = state.outputGrid[currentY][currentX];
      outputPixel.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
      outputPixel.classList.add('highlight');

      // Update progress
      const progress = ((currentY * GRID_SIZE + currentX + 1) / (GRID_SIZE * GRID_SIZE)) * 100;
      elements.animationProgress.innerHTML = `<span class="progress-text">Processing pixel (<span class="highlight">${currentX}</span>, <span class="highlight">${currentY}</span>) - ${Math.round(progress)}%</span>`;

      // Move to next position
      currentX++;
      if (currentX >= GRID_SIZE) {
        currentX = 0;
        currentY++;
      }

      if (currentY < GRID_SIZE) {
        state.animationId = setTimeout(animateStep, 50);
      } else {
        cleanup();
        ToolsCommon.Toast.show('Convolution complete!', 'success');
      }
    }

    function cleanup() {
      state.isAnimating = false;
      elements.animateBtn.disabled = false;
      elements.stopBtn.disabled = true;
      clearHighlights();
      elements.animationProgress.innerHTML = '<span class="progress-text">Convolution complete!</span>';
    }

    animateStep();
  }

  function stopAnimation() {
    state.isAnimating = false;
    if (state.animationId) {
      clearTimeout(state.animationId);
    }
    applyConvolution(); // Complete instantly
  }

  function highlightKernelPosition(centerX, centerY) {
    // Highlight input pixels
    for (let ky = 0; ky < 3; ky++) {
      for (let kx = 0; kx < 3; kx++) {
        const pixelY = centerY + ky - 1;
        const pixelX = centerX + kx - 1;

        if (pixelY >= 0 && pixelY < GRID_SIZE && pixelX >= 0 && pixelX < GRID_SIZE) {
          const pixel = elements.inputGrid.children[pixelY * GRID_SIZE + pixelX];
          pixel.classList.add('highlight');
        }
      }
    }

    // Highlight kernel cells
    const kernelCells = elements.kernelGrid.querySelectorAll('.kernel-cell');
    kernelCells.forEach(cell => cell.classList.add('highlight'));
  }

  function clearHighlights() {
    const allPixels = document.querySelectorAll('.pixel.highlight, .kernel-cell.highlight');
    allPixels.forEach(el => el.classList.remove('highlight'));
  }

  // ==================== Drawing ====================

  function setPixel(x, y) {
    state.inputGrid[y][x] = state.brushValue;
    const pixel = elements.inputGrid.children[y * GRID_SIZE + x];
    pixel.style.backgroundColor = `rgb(${state.brushValue}, ${state.brushValue}, ${state.brushValue})`;
    applyConvolution();
  }

  function clearCanvas() {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        state.inputGrid[y][x] = 0;
      }
    }
    renderInputGrid();
    applyConvolution();
    ToolsCommon.Toast.show('Canvas cleared', 'info');
  }

  function randomPattern() {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        state.inputGrid[y][x] = Math.random() > 0.5 ? 255 : 0;
      }
    }
    renderInputGrid();
    applyConvolution();
    ToolsCommon.Toast.show('Random pattern generated', 'info');
  }

  // ==================== Event Handlers ====================

  function handlePixelMouseDown(e) {
    state.isDrawing = true;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    setPixel(x, y);
  }

  function handlePixelMouseEnter(e) {
    if (!state.isDrawing) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    setPixel(x, y);
  }

  function handlePixelTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
    if (pixel && pixel.classList.contains('pixel') && pixel.closest('#inputGrid')) {
      const x = parseInt(pixel.dataset.x);
      const y = parseInt(pixel.dataset.y);
      setPixel(x, y);
    }
  }

  function handlePixelTouchMove(e) {
    e.preventDefault();
    handlePixelTouch(e);
  }

  function handleMouseUp() {
    state.isDrawing = false;
  }

  function handleKernelChange(e) {
    const preset = e.target.value;
    if (KERNELS[preset]) {
      state.kernel = KERNELS[preset].values;
      createKernelGrid();
      applyConvolution();
    }
  }

  function handleBrushClick(e) {
    const btn = e.target.closest('.brush-btn');
    if (!btn) return;

    elements.brushBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.brushValue = parseInt(btn.dataset.value);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case 'c':
        e.preventDefault();
        clearCanvas();
        break;
      case 'r':
        e.preventDefault();
        randomPattern();
        break;
      case ' ':
        e.preventDefault();
        if (!state.isAnimating) {
          applyConvolutionAnimated();
        }
        break;
      case '1':
        e.preventDefault();
        state.brushValue = 255;
        elements.brushBtns.forEach(b => b.classList.toggle('active', b.dataset.value === '255'));
        break;
      case '2':
        e.preventDefault();
        state.brushValue = 0;
        elements.brushBtns.forEach(b => b.classList.toggle('active', b.dataset.value === '0'));
        break;
      case '3':
        e.preventDefault();
        state.brushValue = 128;
        elements.brushBtns.forEach(b => b.classList.toggle('active', b.dataset.value === '128'));
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Initialize grids
    initGrids();
    createKernelGrid();

    // Event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    elements.clearBtn?.addEventListener('click', clearCanvas);
    elements.randomBtn?.addEventListener('click', randomPattern);
    elements.animateBtn?.addEventListener('click', applyConvolutionAnimated);
    elements.stopBtn?.addEventListener('click', stopAnimation);
    elements.kernelPreset?.addEventListener('change', handleKernelChange);

    elements.brushBtns.forEach(btn => {
      btn.addEventListener('click', handleBrushClick);
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Initial render
    renderInputGrid();
    renderOutputGrid();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
