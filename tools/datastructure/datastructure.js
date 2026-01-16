/**
 * KVSOVANREACH Data Structure Playground
 * Interactive visualization of fundamental data structures
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    visContainer: document.getElementById('visContainer'),
    valueInput: document.getElementById('valueInput'),
    addBtn: document.getElementById('addBtn'),
    addBtnText: document.getElementById('addBtnText'),
    removeBtn: document.getElementById('removeBtn'),
    removeBtnText: document.getElementById('removeBtnText'),
    resetBtn: document.getElementById('resetBtn'),
    extraControls: document.getElementById('extraControls'),
    logContainer: document.getElementById('logContainer'),
    clearLogBtn: document.getElementById('clearLogBtn'),
    // Stats
    sizeValue: document.getElementById('sizeValue'),
    topValue: document.getElementById('topValue'),
    topStat: document.getElementById('topStat'),
    capacityStat: document.getElementById('capacityStat'),
    // Info
    structureName: document.getElementById('structureName'),
    structureDesc: document.getElementById('structureDesc'),
    complexityInfo: document.getElementById('complexityInfo')
  };

  // Structure tabs
  const structureTabs = document.querySelectorAll('.structure-tab');

  // State
  let currentStructure = 'stack';
  let operationLogs = [];

  // Data structures
  const structures = {
    stack: {
      data: [],
      maxSize: 10
    },
    queue: {
      data: [],
      maxSize: 10
    },
    linkedlist: {
      head: null
    },
    binarytree: {
      root: null
    }
  };

  // Structure info
  const structureInfo = {
    stack: {
      name: 'Stack',
      description: 'A Stack is a linear data structure that follows the LIFO (Last In First Out) principle. The last element added is the first one to be removed.',
      addLabel: 'Push',
      removeLabel: 'Pop',
      topLabel: 'Top',
      complexity: [
        { label: 'Push', value: 'O(1)' },
        { label: 'Pop', value: 'O(1)' },
        { label: 'Peek', value: 'O(1)' },
        { label: 'Search', value: 'O(n)' }
      ]
    },
    queue: {
      name: 'Queue',
      description: 'A Queue is a linear data structure that follows the FIFO (First In First Out) principle. The first element added is the first one to be removed.',
      addLabel: 'Enqueue',
      removeLabel: 'Dequeue',
      topLabel: 'Front',
      complexity: [
        { label: 'Enqueue', value: 'O(1)' },
        { label: 'Dequeue', value: 'O(1)' },
        { label: 'Front', value: 'O(1)' },
        { label: 'Search', value: 'O(n)' }
      ]
    },
    linkedlist: {
      name: 'Linked List',
      description: 'A Linked List is a linear data structure where elements are stored in nodes. Each node contains data and a reference to the next node.',
      addLabel: 'Append',
      removeLabel: 'Remove',
      topLabel: 'Head',
      complexity: [
        { label: 'Insert', value: 'O(1)' },
        { label: 'Delete', value: 'O(n)' },
        { label: 'Access', value: 'O(n)' },
        { label: 'Search', value: 'O(n)' }
      ]
    },
    binarytree: {
      name: 'Binary Tree',
      description: 'A Binary Tree is a hierarchical data structure where each node has at most two children (left and right). Used for efficient searching and sorting.',
      addLabel: 'Insert',
      removeLabel: 'Remove',
      topLabel: 'Root',
      complexity: [
        { label: 'Insert', value: 'O(log n)' },
        { label: 'Delete', value: 'O(log n)' },
        { label: 'Search', value: 'O(log n)' },
        { label: 'Traverse', value: 'O(n)' }
      ]
    }
  };

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    updateUI();
    renderStructure();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Structure tabs
    structureTabs.forEach(tab => {
      tab.addEventListener('click', () => switchStructure(tab.dataset.structure));
    });

    // Button events
    elements.addBtn.addEventListener('click', handleAdd);
    elements.removeBtn.addEventListener('click', handleRemove);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.clearLogBtn.addEventListener('click', clearLog);

    // Input events
    elements.valueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Switch to a different structure
   */
  function switchStructure(structure) {
    currentStructure = structure;

    // Update tabs
    structureTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.structure === structure);
    });

    updateUI();
    renderStructure();
  }

  /**
   * Update UI elements based on current structure
   */
  function updateUI() {
    const info = structureInfo[currentStructure];

    // Update button labels
    elements.addBtnText.textContent = info.addLabel;
    elements.removeBtnText.textContent = info.removeLabel;

    // Update stat label
    document.querySelector('#topStat .stat-label').textContent = info.topLabel;

    // Update info panel
    elements.structureName.textContent = info.name;
    elements.structureDesc.textContent = info.description;

    // Update complexity info
    elements.complexityInfo.innerHTML = info.complexity.map(c => `
      <div class="complexity-item">
        <span class="complexity-label">${c.label}</span>
        <span class="complexity-value">${c.value}</span>
      </div>
    `).join('');

    // Update stats
    updateStats();
  }

  /**
   * Update stats display
   */
  function updateStats() {
    let size = 0;
    let topValue = '-';

    switch (currentStructure) {
      case 'stack':
        size = structures.stack.data.length;
        topValue = size > 0 ? structures.stack.data[size - 1] : '-';
        break;
      case 'queue':
        size = structures.queue.data.length;
        topValue = size > 0 ? structures.queue.data[0] : '-';
        break;
      case 'linkedlist':
        size = getLinkedListSize();
        topValue = structures.linkedlist.head ? structures.linkedlist.head.data : '-';
        break;
      case 'binarytree':
        size = getTreeSize(structures.binarytree.root);
        topValue = structures.binarytree.root ? structures.binarytree.root.data : '-';
        break;
    }

    elements.sizeValue.textContent = size;
    elements.topValue.textContent = topValue;
  }

  /**
   * Render the current structure
   */
  function renderStructure() {
    switch (currentStructure) {
      case 'stack':
        renderStack();
        break;
      case 'queue':
        renderQueue();
        break;
      case 'linkedlist':
        renderLinkedList();
        break;
      case 'binarytree':
        renderBinaryTree();
        break;
    }
  }

  /**
   * Render stack visualization
   */
  function renderStack() {
    const stack = structures.stack.data;

    if (stack.length === 0) {
      elements.visContainer.innerHTML = `
        <div class="stack-container">
          <div class="vis-placeholder">
            <i class="fa-solid fa-layer-group"></i>
            <p>Stack is empty. Push some elements!</p>
          </div>
          <div class="stack-base"></div>
        </div>
      `;
      return;
    }

    const items = stack.map((item, index) => {
      const isTop = index === stack.length - 1;
      return `<div class="stack-item${isTop ? ' top' : ''}">${escapeHtml(item)}</div>`;
    }).join('');

    elements.visContainer.innerHTML = `
      <div class="stack-container">
        ${items}
        <div class="stack-base"></div>
      </div>
    `;
  }

  /**
   * Render queue visualization
   */
  function renderQueue() {
    const queue = structures.queue.data;

    if (queue.length === 0) {
      elements.visContainer.innerHTML = `
        <div class="queue-container">
          <div class="vis-placeholder">
            <i class="fa-solid fa-arrows-left-right"></i>
            <p>Queue is empty. Enqueue some elements!</p>
          </div>
        </div>
      `;
      return;
    }

    const items = queue.map((item, index) => {
      let classes = 'queue-item';
      if (index === 0) classes += ' front';
      if (index === queue.length - 1) classes += ' rear';
      return `<div class="${classes}">${escapeHtml(item)}</div>`;
    }).join('<i class="fa-solid fa-chevron-right queue-arrow"></i>');

    elements.visContainer.innerHTML = `
      <div class="queue-container">
        ${items}
      </div>
    `;
  }

  /**
   * Render linked list visualization
   */
  function renderLinkedList() {
    let current = structures.linkedlist.head;

    if (!current) {
      elements.visContainer.innerHTML = `
        <div class="linkedlist-container">
          <div class="vis-placeholder">
            <i class="fa-solid fa-link"></i>
            <p>Linked list is empty. Append some elements!</p>
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    let index = 0;

    while (current) {
      const isHead = index === 0;
      html += `
        <div class="ll-node">
          <div class="ll-node-box" style="position: relative;">
            ${isHead ? '<span class="ll-head-label">HEAD</span>' : ''}
            <div class="ll-node-data">${escapeHtml(current.data)}</div>
            <div class="ll-node-next"><i class="fa-solid fa-arrow-right"></i></div>
          </div>
          <div class="ll-arrow"></div>
        </div>
      `;
      current = current.next;
      index++;
    }

    html += '<div class="ll-null">NULL</div>';

    elements.visContainer.innerHTML = `
      <div class="linkedlist-container">
        ${html}
      </div>
    `;
  }

  /**
   * Render binary tree visualization
   */
  function renderBinaryTree() {
    const root = structures.binarytree.root;

    if (!root) {
      elements.visContainer.innerHTML = `
        <div class="binarytree-container">
          <div class="vis-placeholder">
            <i class="fa-solid fa-sitemap"></i>
            <p>Binary tree is empty. Insert some elements!</p>
          </div>
        </div>
      `;
      return;
    }

    // Build tree levels for visualization
    const levels = [];
    const queue = [{ node: root, level: 0 }];

    while (queue.length > 0) {
      const { node, level } = queue.shift();

      if (!levels[level]) {
        levels[level] = [];
      }

      levels[level].push(node);

      if (node) {
        queue.push({ node: node.left, level: level + 1 });
        queue.push({ node: node.right, level: level + 1 });
      }
    }

    // Remove empty trailing levels
    while (levels.length > 0 && levels[levels.length - 1].every(n => n === null)) {
      levels.pop();
    }

    // Limit to 4 levels for display
    const maxLevels = Math.min(levels.length, 4);

    let html = '';

    for (let i = 0; i < maxLevels; i++) {
      const level = levels[i];
      const nodes = level.map(node => {
        if (node === null) {
          return '<div class="tree-node-wrapper"><div class="tree-node-empty"></div></div>';
        }
        return `
          <div class="tree-node-wrapper">
            <div class="tree-node">${escapeHtml(String(node.data))}</div>
          </div>
        `;
      }).join('');

      html += `<div class="tree-level">${nodes}</div>`;
    }

    elements.visContainer.innerHTML = `
      <div class="binarytree-container">
        ${html}
      </div>
    `;
  }

  /**
   * Handle add operation
   */
  function handleAdd() {
    const value = elements.valueInput.value.trim();

    if (!value) {
      ToolsCommon.Toast.show('Please enter a value', 'error');
      return;
    }

    let success = false;
    const info = structureInfo[currentStructure];

    switch (currentStructure) {
      case 'stack':
        if (structures.stack.data.length >= structures.stack.maxSize) {
          addLog(`${info.addLabel}(${value})`, 'Stack overflow!', true);
          ToolsCommon.Toast.show('Stack is full!', 'error');
        } else {
          structures.stack.data.push(value);
          addLog(`${info.addLabel}(${value})`, 'Success');
          success = true;
        }
        break;

      case 'queue':
        if (structures.queue.data.length >= structures.queue.maxSize) {
          addLog(`${info.addLabel}(${value})`, 'Queue overflow!', true);
          ToolsCommon.Toast.show('Queue is full!', 'error');
        } else {
          structures.queue.data.push(value);
          addLog(`${info.addLabel}(${value})`, 'Success');
          success = true;
        }
        break;

      case 'linkedlist':
        appendToLinkedList(value);
        addLog(`${info.addLabel}(${value})`, 'Success');
        success = true;
        break;

      case 'binarytree':
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          addLog(`${info.addLabel}(${value})`, 'Invalid number!', true);
          ToolsCommon.Toast.show('Binary tree requires numeric values', 'error');
        } else {
          insertIntoBST(numValue);
          addLog(`${info.addLabel}(${numValue})`, 'Success');
          success = true;
        }
        break;
    }

    if (success) {
      elements.valueInput.value = '';
      updateStats();
      renderStructure();
      ToolsCommon.Toast.show(`${info.addLabel} successful`, 'success');
    }

    elements.valueInput.focus();
  }

  /**
   * Handle remove operation
   */
  function handleRemove() {
    const info = structureInfo[currentStructure];
    let removed = null;

    switch (currentStructure) {
      case 'stack':
        if (structures.stack.data.length === 0) {
          addLog(info.removeLabel, 'Stack underflow!', true);
          ToolsCommon.Toast.show('Stack is empty!', 'error');
        } else {
          removed = structures.stack.data.pop();
          addLog(`${info.removeLabel}()`, `Removed: ${removed}`);
        }
        break;

      case 'queue':
        if (structures.queue.data.length === 0) {
          addLog(info.removeLabel, 'Queue underflow!', true);
          ToolsCommon.Toast.show('Queue is empty!', 'error');
        } else {
          removed = structures.queue.data.shift();
          addLog(`${info.removeLabel}()`, `Removed: ${removed}`);
        }
        break;

      case 'linkedlist':
        if (!structures.linkedlist.head) {
          addLog(info.removeLabel, 'List is empty!', true);
          ToolsCommon.Toast.show('Linked list is empty!', 'error');
        } else {
          removed = removeFromLinkedList();
          addLog(`${info.removeLabel}()`, `Removed: ${removed}`);
        }
        break;

      case 'binarytree':
        if (!structures.binarytree.root) {
          addLog(info.removeLabel, 'Tree is empty!', true);
          ToolsCommon.Toast.show('Binary tree is empty!', 'error');
        } else {
          // Remove the root (or could ask for value)
          removed = structures.binarytree.root.data;
          structures.binarytree.root = removeFromBST(structures.binarytree.root, removed);
          addLog(`${info.removeLabel}(${removed})`, 'Success');
        }
        break;
    }

    if (removed !== null) {
      updateStats();
      renderStructure();
      ToolsCommon.Toast.show(`${info.removeLabel}: ${removed}`, 'info');
    }
  }

  /**
   * Handle reset
   */
  function handleReset() {
    switch (currentStructure) {
      case 'stack':
        structures.stack.data = [];
        break;
      case 'queue':
        structures.queue.data = [];
        break;
      case 'linkedlist':
        structures.linkedlist.head = null;
        break;
      case 'binarytree':
        structures.binarytree.root = null;
        break;
    }

    addLog('Reset', 'Structure cleared');
    updateStats();
    renderStructure();
    ToolsCommon.Toast.show('Structure reset', 'info');
  }

  /**
   * Linked List operations
   */
  function appendToLinkedList(value) {
    const newNode = { data: value, next: null };

    if (!structures.linkedlist.head) {
      structures.linkedlist.head = newNode;
    } else {
      let current = structures.linkedlist.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
  }

  function removeFromLinkedList() {
    if (!structures.linkedlist.head) return null;

    const removed = structures.linkedlist.head.data;
    structures.linkedlist.head = structures.linkedlist.head.next;
    return removed;
  }

  function getLinkedListSize() {
    let count = 0;
    let current = structures.linkedlist.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }

  /**
   * Binary Search Tree operations
   */
  function insertIntoBST(value) {
    const newNode = { data: value, left: null, right: null };

    if (!structures.binarytree.root) {
      structures.binarytree.root = newNode;
      return;
    }

    let current = structures.binarytree.root;
    while (true) {
      if (value < current.data) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  function removeFromBST(node, value) {
    if (!node) return null;

    if (value < node.data) {
      node.left = removeFromBST(node.left, value);
    } else if (value > node.data) {
      node.right = removeFromBST(node.right, value);
    } else {
      // Node to delete found
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Node has two children - find inorder successor
      let successor = node.right;
      while (successor.left) {
        successor = successor.left;
      }
      node.data = successor.data;
      node.right = removeFromBST(node.right, successor.data);
    }
    return node;
  }

  function getTreeSize(node) {
    if (!node) return 0;
    return 1 + getTreeSize(node.left) + getTreeSize(node.right);
  }

  /**
   * Add log entry
   */
  function addLog(action, result, isError = false) {
    const time = new Date().toLocaleTimeString();
    operationLogs.unshift({ time, action, result, isError });

    // Keep only last 20 entries
    if (operationLogs.length > 20) {
      operationLogs.pop();
    }

    renderLog();
  }

  /**
   * Render log entries
   */
  function renderLog() {
    if (operationLogs.length === 0) {
      elements.logContainer.innerHTML = '<div class="log-placeholder">Perform operations to see the log</div>';
      return;
    }

    elements.logContainer.innerHTML = operationLogs.map(log => `
      <div class="log-entry${log.isError ? ' error' : ''}">
        <span class="log-time">[${log.time}]</span>
        <span class="log-action">${log.action}</span>
        <span class="log-value">→ ${log.result}</span>
      </div>
    `).join('');
  }

  /**
   * Clear log
   */
  function clearLog() {
    operationLogs = [];
    renderLog();
    ToolsCommon.Toast.show('Log cleared', 'info');
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Number keys 1-4 to switch structures
    if (e.key >= '1' && e.key <= '4') {
      const structures = ['stack', 'queue', 'linkedlist', 'binarytree'];
      switchStructure(structures[parseInt(e.key) - 1]);
    }

    // R - Reset
    if (e.key.toLowerCase() === 'r') {
      handleReset();
    }

    // Delete - Remove
    if (e.key === 'Delete') {
      handleRemove();
    }
  }

  /**
   * Escape HTML entities
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
