/**
 * KVSOVANREACH Memory Allocation Visualizer
 * Interactive memory management visualization
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    varName: document.getElementById('varName'),
    varSize: document.getElementById('varSize'),
    allocType: document.getElementById('allocType'),
    allocateBtn: document.getElementById('allocateBtn'),
    freeBtn: document.getElementById('freeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    // Display
    stackBlocks: document.getElementById('stackBlocks'),
    heapBlocks: document.getElementById('heapBlocks'),
    variablesList: document.getElementById('variablesList'),
    // Stats
    totalMemory: document.getElementById('totalMemory'),
    stackUsed: document.getElementById('stackUsed'),
    heapUsed: document.getElementById('heapUsed'),
    fragmentation: document.getElementById('fragmentation')
  };

  // Memory configuration
  const TOTAL_MEMORY = 256;
  const STACK_START = 0xFFFF;
  const HEAP_START = 0x1000;

  // State
  let memory = {
    stack: [],
    heap: [],
    stackPointer: STACK_START,
    heapPointer: HEAP_START,
    variables: new Map(),
    selectedVar: null
  };

  let varCounter = 0;

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    renderMemory();
    updateStats();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    elements.allocateBtn.addEventListener('click', allocateMemory);
    elements.freeBtn.addEventListener('click', freeSelectedMemory);
    elements.resetBtn.addEventListener('click', resetMemory);

    elements.varName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') allocateMemory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Allocate memory
   */
  function allocateMemory() {
    let name = elements.varName.value.trim();
    const size = parseInt(elements.varSize.value) || 4;
    const type = elements.allocType.value;

    // Auto-generate name if empty
    if (!name) {
      name = `var${++varCounter}`;
    }

    // Check if name already exists
    if (memory.variables.has(name)) {
      ToolsCommon.Toast.show('Variable name already exists', 'error');
      return;
    }

    // Check size limits
    if (size < 1 || size > 64) {
      ToolsCommon.Toast.show('Size must be between 1 and 64 bytes', 'error');
      return;
    }

    // Check available memory
    const totalUsed = getTotalUsed();
    if (totalUsed + size > TOTAL_MEMORY) {
      ToolsCommon.Toast.show('Not enough memory!', 'error');
      return;
    }

    // Allocate based on type
    if (type === 'stack') {
      allocateStack(name, size);
    } else {
      allocateHeap(name, size);
    }

    // Clear input
    elements.varName.value = '';

    // Update display
    renderMemory();
    updateStats();

    ToolsCommon.Toast.show(`Allocated ${size} bytes for "${name}"`, 'success');
  }

  /**
   * Allocate on stack
   */
  function allocateStack(name, size) {
    const address = memory.stackPointer - size;
    memory.stackPointer = address;

    const block = {
      name,
      size,
      address,
      type: 'stack',
      timestamp: Date.now()
    };

    memory.stack.push(block);
    memory.variables.set(name, block);
  }

  /**
   * Allocate on heap
   */
  function allocateHeap(name, size) {
    // Find first fit
    let address = findHeapSpace(size);

    if (address === null) {
      // Compact and try again (simplistic)
      address = memory.heapPointer;
      memory.heapPointer += size;
    }

    const block = {
      name,
      size,
      address,
      type: 'heap',
      timestamp: Date.now()
    };

    memory.heap.push(block);
    memory.variables.set(name, block);
  }

  /**
   * Find space in heap (first fit)
   */
  function findHeapSpace(size) {
    // Sort heap blocks by address
    const sorted = [...memory.heap].sort((a, b) => a.address - b.address);

    let currentAddress = HEAP_START;

    for (const block of sorted) {
      if (block.address - currentAddress >= size) {
        return currentAddress;
      }
      currentAddress = block.address + block.size;
    }

    // Check space at end
    if (currentAddress + size <= HEAP_START + TOTAL_MEMORY / 2) {
      return currentAddress;
    }

    return null;
  }

  /**
   * Free selected memory
   */
  function freeSelectedMemory() {
    if (!memory.selectedVar) {
      ToolsCommon.Toast.show('Select a variable to free', 'error');
      return;
    }

    const block = memory.variables.get(memory.selectedVar);
    if (!block) return;

    if (block.type === 'stack') {
      // Stack must be freed in LIFO order
      if (memory.stack.length > 0 && memory.stack[memory.stack.length - 1].name === block.name) {
        memory.stack.pop();
        memory.stackPointer += block.size;
        memory.variables.delete(block.name);
        memory.selectedVar = null;
        ToolsCommon.Toast.show(`Freed "${block.name}" from stack`, 'success');
      } else {
        ToolsCommon.Toast.show('Stack must be freed in LIFO order', 'error');
        return;
      }
    } else {
      // Heap can be freed in any order
      const index = memory.heap.findIndex(b => b.name === block.name);
      if (index !== -1) {
        memory.heap.splice(index, 1);
        memory.variables.delete(block.name);
        memory.selectedVar = null;
        ToolsCommon.Toast.show(`Freed "${block.name}" from heap`, 'success');
      }
    }

    renderMemory();
    updateStats();
  }

  /**
   * Reset memory
   */
  function resetMemory() {
    memory = {
      stack: [],
      heap: [],
      stackPointer: STACK_START,
      heapPointer: HEAP_START,
      variables: new Map(),
      selectedVar: null
    };

    varCounter = 0;

    renderMemory();
    updateStats();
    ToolsCommon.Toast.show('Memory reset', 'info');
  }

  /**
   * Get total used memory
   */
  function getTotalUsed() {
    let total = 0;
    memory.stack.forEach(b => total += b.size);
    memory.heap.forEach(b => total += b.size);
    return total;
  }

  /**
   * Calculate fragmentation
   */
  function calculateFragmentation() {
    if (memory.heap.length < 2) return 0;

    const sorted = [...memory.heap].sort((a, b) => a.address - b.address);
    let gaps = 0;
    let lastEnd = HEAP_START;

    for (const block of sorted) {
      if (block.address > lastEnd) {
        gaps += block.address - lastEnd;
      }
      lastEnd = block.address + block.size;
    }

    const heapUsed = memory.heap.reduce((sum, b) => sum + b.size, 0);
    if (heapUsed === 0) return 0;

    return Math.round((gaps / (gaps + heapUsed)) * 100);
  }

  /**
   * Render memory visualization
   */
  function renderMemory() {
    renderStackBlocks();
    renderHeapBlocks();
    renderVariablesList();
  }

  /**
   * Render stack blocks
   */
  function renderStackBlocks() {
    if (memory.stack.length === 0) {
      elements.stackBlocks.innerHTML = '<div class="memory-block free"><span class="block-name">Empty</span></div>';
      return;
    }

    elements.stackBlocks.innerHTML = memory.stack.map(block => `
      <div class="memory-block stack ${block.name === memory.selectedVar ? 'selected' : ''}"
           data-name="${block.name}"
           onclick="window.selectVariable('${block.name}')">
        <span class="block-name">${block.name}</span>
        <span class="block-size">${block.size}B</span>
        <span class="block-address">0x${block.address.toString(16).toUpperCase()}</span>
      </div>
    `).join('');
  }

  /**
   * Render heap blocks
   */
  function renderHeapBlocks() {
    if (memory.heap.length === 0) {
      elements.heapBlocks.innerHTML = '<div class="memory-block free"><span class="block-name">Empty</span></div>';
      return;
    }

    // Sort by address for display
    const sorted = [...memory.heap].sort((a, b) => a.address - b.address);

    elements.heapBlocks.innerHTML = sorted.map(block => `
      <div class="memory-block heap ${block.name === memory.selectedVar ? 'selected' : ''}"
           data-name="${block.name}"
           onclick="window.selectVariable('${block.name}')">
        <span class="block-name">${block.name}</span>
        <span class="block-size">${block.size}B</span>
        <span class="block-address">0x${block.address.toString(16).toUpperCase()}</span>
      </div>
    `).join('');
  }

  /**
   * Render variables list
   */
  function renderVariablesList() {
    if (memory.variables.size === 0) {
      elements.variablesList.innerHTML = '<div class="variables-placeholder">No variables allocated yet</div>';
      return;
    }

    const items = [];
    memory.variables.forEach((block, name) => {
      items.push(`
        <div class="variable-item ${name === memory.selectedVar ? 'selected' : ''}"
             onclick="window.selectVariable('${name}')">
          <div class="variable-info">
            <span class="variable-name">${name}</span>
            <span class="variable-type ${block.type}">${block.type}</span>
          </div>
          <div class="variable-meta">
            <span>${block.size}B</span>
            <span>0x${block.address.toString(16).toUpperCase()}</span>
          </div>
        </div>
      `);
    });

    elements.variablesList.innerHTML = items.join('');
  }

  /**
   * Update stats display
   */
  function updateStats() {
    const stackUsed = memory.stack.reduce((sum, b) => sum + b.size, 0);
    const heapUsed = memory.heap.reduce((sum, b) => sum + b.size, 0);
    const frag = calculateFragmentation();

    elements.totalMemory.textContent = TOTAL_MEMORY;
    elements.stackUsed.textContent = stackUsed;
    elements.heapUsed.textContent = heapUsed;
    elements.fragmentation.textContent = `${frag}%`;
  }

  /**
   * Select variable
   */
  window.selectVariable = function(name) {
    if (memory.selectedVar === name) {
      memory.selectedVar = null;
    } else {
      memory.selectedVar = name;
    }
    renderMemory();
  };

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Delete - Free
    if (e.key === 'Delete') {
      freeSelectedMemory();
    }

    // R - Reset
    if (e.key.toLowerCase() === 'r') {
      resetMemory();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
