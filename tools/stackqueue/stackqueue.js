/**
 * KVSOVANREACH Stack & Queue Visualizer
 * Interactive LIFO/FIFO data structure demonstration
 */

(function() {
  'use strict';

  const MAX_CAPACITY = 10;

  // ==================== DOM Elements ====================
  const elements = {
    valueInput: document.getElementById('valueInput'),
    undoBtn: document.getElementById('undoBtn'),
    // Stack
    stackPushBtn: document.getElementById('stackPushBtn'),
    stackPopBtn: document.getElementById('stackPopBtn'),
    stackPeekBtn: document.getElementById('stackPeekBtn'),
    stackClearBtn: document.getElementById('stackClearBtn'),
    stackItems: document.getElementById('stackItems'),
    stackEmptyMsg: document.getElementById('stackEmptyMsg'),
    stackSize: document.getElementById('stackSize'),
    stackTopPointer: document.getElementById('stackTopPointer'),
    // Queue
    queueEnqueueBtn: document.getElementById('queueEnqueueBtn'),
    queueDequeueBtn: document.getElementById('queueDequeueBtn'),
    queuePeekBtn: document.getElementById('queuePeekBtn'),
    queueClearBtn: document.getElementById('queueClearBtn'),
    queueItems: document.getElementById('queueItems'),
    queueEmptyMsg: document.getElementById('queueEmptyMsg'),
    queueSize: document.getElementById('queueSize'),
    queueFrontPointer: document.getElementById('queueFrontPointer'),
    queueRearPointer: document.getElementById('queueRearPointer'),
    // History
    historyBody: document.getElementById('historyBody'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };

  // ==================== State ====================
  const state = {
    stack: [],
    queue: [],
    colorIndex: 0,
    history: [],
    undoStack: []
  };

  function nextColor() {
    const c = state.colorIndex % 10;
    state.colorIndex++;
    return c;
  }

  function toast(msg, type) {
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(msg, type || 'info');
    }
  }

  // ==================== Stack Operations ====================
  function stackPush(val) {
    if (state.stack.length >= MAX_CAPACITY) {
      toast('Stack is full! Max capacity: ' + MAX_CAPACITY, 'error');
      return false;
    }
    const color = nextColor();
    state.stack.push({ value: val, color });
    state.undoStack.push({ type: 'stack-push' });
    addHistory('stack', 'Push "' + val + '"');
    renderStack();
    return true;
  }

  function stackPop(isUndo) {
    if (state.stack.length === 0) {
      toast('Stack is empty!', 'error');
      return null;
    }
    const item = state.stack[state.stack.length - 1];

    // Animate removal
    const topEl = elements.stackItems.querySelector('.sq-stack-item:first-child');
    if (topEl) {
      topEl.classList.add('removing');
      setTimeout(() => {
        state.stack.pop();
        if (!isUndo) {
          state.undoStack.push({ type: 'stack-pop', value: item.value, color: item.color });
          addHistory('stack', 'Pop "' + item.value + '"');
        }
        renderStack();
      }, 280);
    } else {
      state.stack.pop();
      if (!isUndo) {
        state.undoStack.push({ type: 'stack-pop', value: item.value, color: item.color });
        addHistory('stack', 'Pop "' + item.value + '"');
      }
      renderStack();
    }
    return item;
  }

  function stackPeek() {
    if (state.stack.length === 0) {
      toast('Stack is empty!', 'error');
      return;
    }
    const item = state.stack[state.stack.length - 1];
    toast('Top: "' + item.value + '"', 'success');
    addHistory('stack', 'Peek -> "' + item.value + '"');

    const topEl = elements.stackItems.querySelector('.sq-stack-item:first-child');
    if (topEl) {
      topEl.classList.add('peeking');
      setTimeout(() => topEl.classList.remove('peeking'), 600);
    }
  }

  function stackClear() {
    if (state.stack.length === 0) return;
    state.undoStack.push({ type: 'stack-clear', items: [...state.stack] });
    state.stack = [];
    addHistory('stack', 'Clear all');
    renderStack();
  }

  function renderStack() {
    elements.stackItems.innerHTML = '';
    elements.stackSize.textContent = state.stack.length + ' / ' + MAX_CAPACITY;

    if (state.stack.length === 0) {
      elements.stackItems.innerHTML = '<div class="sq-empty-msg">Stack is empty</div>';
      elements.stackTopPointer.classList.remove('visible');
      return;
    }

    elements.stackTopPointer.classList.add('visible');

    // Render top to bottom (reversed)
    for (let i = state.stack.length - 1; i >= 0; i--) {
      const item = state.stack[i];
      const el = document.createElement('div');
      el.className = 'sq-stack-item sq-item-' + item.color;
      el.textContent = item.value;
      elements.stackItems.appendChild(el);
    }
  }

  // ==================== Queue Operations ====================
  function queueEnqueue(val) {
    if (state.queue.length >= MAX_CAPACITY) {
      toast('Queue is full! Max capacity: ' + MAX_CAPACITY, 'error');
      return false;
    }
    const color = nextColor();
    state.queue.push({ value: val, color });
    state.undoStack.push({ type: 'queue-enqueue' });
    addHistory('queue', 'Enqueue "' + val + '"');
    renderQueue();
    return true;
  }

  function queueDequeue(isUndo) {
    if (state.queue.length === 0) {
      toast('Queue is empty!', 'error');
      return null;
    }
    const item = state.queue[0];

    // Animate removal
    const frontEl = elements.queueItems.querySelector('.sq-queue-item:first-child');
    if (frontEl) {
      frontEl.classList.add('removing');
      setTimeout(() => {
        state.queue.shift();
        if (!isUndo) {
          state.undoStack.push({ type: 'queue-dequeue', value: item.value, color: item.color });
          addHistory('queue', 'Dequeue "' + item.value + '"');
        }
        renderQueue();
      }, 280);
    } else {
      state.queue.shift();
      if (!isUndo) {
        state.undoStack.push({ type: 'queue-dequeue', value: item.value, color: item.color });
        addHistory('queue', 'Dequeue "' + item.value + '"');
      }
      renderQueue();
    }
    return item;
  }

  function queuePeek() {
    if (state.queue.length === 0) {
      toast('Queue is empty!', 'error');
      return;
    }
    const item = state.queue[0];
    toast('Front: "' + item.value + '"', 'success');
    addHistory('queue', 'Peek -> "' + item.value + '"');

    const frontEl = elements.queueItems.querySelector('.sq-queue-item:first-child');
    if (frontEl) {
      frontEl.classList.add('peeking');
      setTimeout(() => frontEl.classList.remove('peeking'), 600);
    }
  }

  function queueClear() {
    if (state.queue.length === 0) return;
    state.undoStack.push({ type: 'queue-clear', items: [...state.queue] });
    state.queue = [];
    addHistory('queue', 'Clear all');
    renderQueue();
  }

  function renderQueue() {
    elements.queueItems.innerHTML = '';
    elements.queueSize.textContent = state.queue.length + ' / ' + MAX_CAPACITY;

    if (state.queue.length === 0) {
      elements.queueItems.innerHTML = '<div class="sq-empty-msg">Queue is empty</div>';
      elements.queueFrontPointer.classList.remove('visible');
      elements.queueRearPointer.classList.remove('visible');
      return;
    }

    elements.queueFrontPointer.classList.add('visible');
    elements.queueRearPointer.classList.add('visible');

    state.queue.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'sq-queue-item sq-item-' + item.color;
      el.textContent = item.value;
      elements.queueItems.appendChild(el);
    });
  }

  // ==================== Undo ====================
  function undo() {
    if (state.undoStack.length === 0) {
      toast('Nothing to undo', 'info');
      return;
    }

    const last = state.undoStack.pop();

    switch (last.type) {
      case 'stack-push':
        state.stack.pop();
        addHistory('stack', 'Undo push');
        renderStack();
        break;
      case 'stack-pop':
        state.stack.push({ value: last.value, color: last.color });
        addHistory('stack', 'Undo pop -> "' + last.value + '"');
        renderStack();
        break;
      case 'stack-clear':
        state.stack = last.items;
        addHistory('stack', 'Undo clear');
        renderStack();
        break;
      case 'queue-enqueue':
        state.queue.pop();
        addHistory('queue', 'Undo enqueue');
        renderQueue();
        break;
      case 'queue-dequeue':
        state.queue.unshift({ value: last.value, color: last.color });
        addHistory('queue', 'Undo dequeue -> "' + last.value + '"');
        renderQueue();
        break;
      case 'queue-clear':
        state.queue = last.items;
        addHistory('queue', 'Undo clear');
        renderQueue();
        break;
    }

    toast('Undone', 'success');
  }

  // ==================== History ====================
  function addHistory(source, text) {
    const empty = elements.historyBody.querySelector('.sq-history-empty');
    if (empty) empty.remove();

    const entry = document.createElement('div');
    entry.className = 'sq-history-entry';

    const tag = document.createElement('span');
    tag.className = 'sq-history-tag sq-tag-' + source;
    tag.textContent = source === 'stack' ? 'STK' : 'QUE';

    const txt = document.createElement('span');
    txt.className = 'sq-history-text';
    txt.textContent = text;

    entry.appendChild(tag);
    entry.appendChild(txt);

    // Insert at top
    elements.historyBody.insertBefore(entry, elements.historyBody.firstChild);

    // Keep max 50
    while (elements.historyBody.children.length > 50) {
      elements.historyBody.removeChild(elements.historyBody.lastChild);
    }
  }

  function clearHistory() {
    elements.historyBody.innerHTML = '<div class="sq-history-empty">No operations yet.</div>';
  }

  // ==================== Input Helper ====================
  function getInputValue() {
    const val = elements.valueInput.value.trim();
    if (!val) {
      toast('Please enter a value', 'error');
      return null;
    }
    elements.valueInput.value = '';
    elements.valueInput.focus();
    return val;
  }

  // ==================== Event Listeners ====================
  elements.stackPushBtn.addEventListener('click', () => {
    const val = getInputValue();
    if (val !== null) stackPush(val);
  });

  elements.stackPopBtn.addEventListener('click', () => stackPop(false));
  elements.stackPeekBtn.addEventListener('click', stackPeek);
  elements.stackClearBtn.addEventListener('click', stackClear);

  elements.queueEnqueueBtn.addEventListener('click', () => {
    const val = getInputValue();
    if (val !== null) queueEnqueue(val);
  });

  elements.queueDequeueBtn.addEventListener('click', () => queueDequeue(false));
  elements.queuePeekBtn.addEventListener('click', queuePeek);
  elements.queueClearBtn.addEventListener('click', queueClear);

  elements.undoBtn.addEventListener('click', undo);
  elements.clearHistoryBtn.addEventListener('click', clearHistory);

  elements.valueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Default action: push to stack
      const val = getInputValue();
      if (val !== null) stackPush(val);
    }
  });

  // ==================== Init ====================
  renderStack();
  renderQueue();

})();
