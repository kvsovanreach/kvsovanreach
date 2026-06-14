/**
 * KVSOVANREACH Linked List Visualizer
 * Singly & Doubly linked list with animated operations
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  var els = {
    singlyBtn: document.getElementById('singlyBtn'),
    doublyBtn: document.getElementById('doublyBtn'),
    listSize: document.getElementById('listSize'),
    valueInput: document.getElementById('valueInput'),
    indexInput: document.getElementById('indexInput'),
    insertHeadBtn: document.getElementById('insertHeadBtn'),
    insertTailBtn: document.getElementById('insertTailBtn'),
    insertAtBtn: document.getElementById('insertAtBtn'),
    deleteValBtn: document.getElementById('deleteValBtn'),
    deleteAtBtn: document.getElementById('deleteAtBtn'),
    searchBtn: document.getElementById('searchBtn'),
    reverseBtn: document.getElementById('reverseBtn'),
    clearBtn: document.getElementById('clearBtn'),
    stepModeCheck: document.getElementById('stepModeCheck'),
    stepControls: document.getElementById('stepControls'),
    stepNextBtn: document.getElementById('stepNextBtn'),
    stepSkipBtn: document.getElementById('stepSkipBtn'),
    stepPanel: document.getElementById('stepPanel'),
    stepInfo: document.getElementById('stepInfo'),
    llCanvas: document.getElementById('llCanvas'),
    llEmpty: document.getElementById('llEmpty'),
    historyBody: document.getElementById('historyBody'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };

  // ==================== State ====================
  // Node: { value, next, prev (doubly only) }
  var listType = 'singly'; // 'singly' or 'doubly'
  var head = null;
  var size = 0;
  var stepQueue = [];
  var stepping = false;
  var highlightIndex = -1;
  var flashIndex = -1;
  var flashType = '';

  function toast(msg, type) {
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(msg, type || 'info');
    }
  }

  // ==================== List helpers ====================
  function createNode(value) {
    var node = { value: value, next: null };
    if (listType === 'doubly') node.prev = null;
    return node;
  }

  function getNodeAt(index) {
    var curr = head;
    for (var i = 0; i < index && curr; i++) {
      curr = curr.next;
    }
    return curr;
  }

  function getTail() {
    if (!head) return null;
    var curr = head;
    while (curr.next) curr = curr.next;
    return curr;
  }

  // ==================== Operations ====================
  function insertHead(value) {
    var node = createNode(value);
    if (head) {
      node.next = head;
      if (listType === 'doubly') head.prev = node;
    }
    head = node;
    size++;
    addHistory('insert', 'Insert "' + value + '" at head');
    flashIndex = 0;
    flashType = 'insert';
    render();
    updateSize();
  }

  function insertTail(value) {
    var node = createNode(value);
    if (!head) {
      head = node;
    } else {
      var tail = getTail();
      tail.next = node;
      if (listType === 'doubly') node.prev = tail;
    }
    size++;
    addHistory('insert', 'Insert "' + value + '" at tail');
    flashIndex = size - 1;
    flashType = 'insert';
    render();
    updateSize();
  }

  function insertAt(value, index) {
    if (index < 0 || index > size) {
      toast('Index out of range (0-' + size + ')', 'error');
      return;
    }
    if (index === 0) {
      insertHead(value);
      return;
    }
    if (index === size) {
      insertTail(value);
      return;
    }
    var node = createNode(value);
    var prev = getNodeAt(index - 1);
    node.next = prev.next;
    if (listType === 'doubly') {
      node.prev = prev;
      if (prev.next) prev.next.prev = node;
    }
    prev.next = node;
    size++;
    addHistory('insert', 'Insert "' + value + '" at index ' + index);
    flashIndex = index;
    flashType = 'insert';
    render();
    updateSize();
  }

  function deleteByValue(value) {
    if (!head) {
      toast('List is empty', 'error');
      return;
    }
    var curr = head;
    var idx = 0;
    while (curr) {
      if (String(curr.value) === String(value)) {
        removeNodeAt(idx, curr);
        addHistory('delete', 'Delete "' + value + '" (index ' + idx + ')');
        toast('Deleted "' + value + '"', 'success');
        render();
        updateSize();
        return;
      }
      curr = curr.next;
      idx++;
    }
    toast('Value "' + value + '" not found', 'error');
    addHistory('delete', 'Delete "' + value + '" -> NOT FOUND');
  }

  function deleteAt(index) {
    if (index < 0 || index >= size) {
      toast('Index out of range (0-' + (size - 1) + ')', 'error');
      return;
    }
    var node = getNodeAt(index);
    var val = node.value;
    removeNodeAt(index, node);
    addHistory('delete', 'Delete at index ' + index + ' ("' + val + '")');
    toast('Deleted "' + val + '" at index ' + index, 'success');
    render();
    updateSize();
  }

  function removeNodeAt(index, node) {
    if (index === 0) {
      head = head.next;
      if (head && listType === 'doubly') head.prev = null;
    } else {
      var prev = getNodeAt(index - 1);
      prev.next = node.next;
      if (listType === 'doubly' && node.next) {
        node.next.prev = prev;
      }
    }
    size--;
  }

  function searchValue(value) {
    if (!head) {
      toast('List is empty', 'error');
      return;
    }

    if (els.stepModeCheck.checked) {
      searchStep(value);
      return;
    }

    var curr = head;
    var idx = 0;
    while (curr) {
      if (String(curr.value) === String(value)) {
        toast('Found "' + value + '" at index ' + idx, 'success');
        addHistory('search', 'Search "' + value + '" -> found at index ' + idx);
        flashIndex = idx;
        flashType = 'found';
        render();
        return;
      }
      curr = curr.next;
      idx++;
    }
    toast('Value "' + value + '" not found', 'error');
    addHistory('search', 'Search "' + value + '" -> NOT FOUND');
  }

  function reverseList() {
    if (size <= 1) {
      toast('Nothing to reverse', 'info');
      return;
    }

    if (listType === 'singly') {
      var prev = null;
      var curr = head;
      while (curr) {
        var next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
      }
      head = prev;
    } else {
      var curr = head;
      var temp = null;
      while (curr) {
        temp = curr.prev;
        curr.prev = curr.next;
        curr.next = temp;
        curr = curr.prev;
      }
      if (temp) head = temp.prev;
    }

    addHistory('info', 'Reversed list');
    toast('List reversed', 'success');
    render();
  }

  function clearList() {
    if (size === 0) return;
    head = null;
    size = 0;
    addHistory('info', 'Cleared list');
    toast('List cleared', 'success');
    flashIndex = -1;
    flashType = '';
    render();
    updateSize();
  }

  // ==================== Step-by-step Search ====================
  function searchStep(value) {
    stepping = true;
    stepQueue = [];
    els.stepPanel.style.display = 'block';
    els.stepControls.style.display = 'flex';

    var curr = head;
    var idx = 0;
    var foundIdx = -1;

    // Build steps
    while (curr) {
      (function(node, i) {
        stepQueue.push(function() {
          els.stepInfo.textContent = 'Step ' + (i + 1) + ': Checking index ' + i + ' -> "' + node.value + '"';
          highlightIndex = i;
          render();
        });
      })(curr, idx);
      if (String(curr.value) === String(value)) {
        foundIdx = idx;
        break;
      }
      curr = curr.next;
      idx++;
    }

    if (foundIdx >= 0) {
      (function(fi) {
        stepQueue.push(function() {
          els.stepInfo.textContent = 'Found "' + value + '" at index ' + fi + '!';
          flashIndex = fi;
          flashType = 'found';
          highlightIndex = -1;
          addHistory('search', 'Search "' + value + '" -> found at index ' + fi);
          toast('Found "' + value + '" at index ' + fi, 'success');
          render();
          finishStep();
        });
      })(foundIdx);
    } else {
      stepQueue.push(function() {
        els.stepInfo.textContent = '"' + value + '" not found in the list.';
        highlightIndex = -1;
        addHistory('search', 'Search "' + value + '" -> NOT FOUND');
        toast('Value "' + value + '" not found', 'error');
        render();
        finishStep();
      });
    }

    // Execute first step
    if (stepQueue.length > 0) {
      var step = stepQueue.shift();
      step();
    }
  }

  function finishStep() {
    stepping = false;
    setTimeout(function() {
      els.stepPanel.style.display = 'none';
      els.stepControls.style.display = 'none';
    }, 1500);
  }

  function skipSteps() {
    while (stepQueue.length > 0) {
      var step = stepQueue.shift();
      step();
    }
  }

  // ==================== Render ====================
  function render() {
    els.llCanvas.innerHTML = '';

    if (size === 0) {
      els.llCanvas.innerHTML = '<div class="ll-empty-msg">List is empty. Insert some nodes to get started.</div>';
      return;
    }

    var curr = head;
    var idx = 0;
    var tail = getTail();

    while (curr) {
      // Node group (node + arrow)
      var group = document.createElement('div');
      group.className = 'll-node-group';

      var nodeWrap = document.createElement('div');
      nodeWrap.className = 'll-node';

      // Label (head/tail)
      var label = document.createElement('div');
      label.className = 'll-node-label';
      if (curr === head && curr === tail) {
        label.className += ' ll-label-headtail';
        label.textContent = 'HEAD/TAIL';
      } else if (curr === head) {
        label.className += ' ll-label-head';
        label.textContent = 'HEAD';
      } else if (curr === tail) {
        label.className += ' ll-label-tail';
        label.textContent = 'TAIL';
      }

      // Node box
      var box = document.createElement('div');
      box.className = 'll-node-box';

      // Flash/highlight
      if (idx === flashIndex && flashType === 'insert') {
        box.classList.add('flash-insert');
      } else if (idx === flashIndex && flashType === 'found') {
        box.classList.add('flash-found');
      }
      if (idx === highlightIndex) {
        box.classList.add('traversing');
      }

      // Data cell
      var data = document.createElement('div');
      data.className = 'll-node-data';
      data.textContent = curr.value;

      // Pointer cell(s)
      if (listType === 'singly') {
        var ptr = document.createElement('div');
        ptr.className = 'll-node-ptr';
        if (curr.next) {
          ptr.classList.add('has-next');
          ptr.innerHTML = '<i class="fa-solid fa-circle-dot" style="font-size:8px;"></i>';
        } else {
          ptr.innerHTML = '<i class="fa-solid fa-xmark" style="font-size:8px;"></i>';
        }
        box.appendChild(data);
        box.appendChild(ptr);
      } else {
        // Doubly: prev | data | next
        var ptrPrev = document.createElement('div');
        ptrPrev.className = 'll-node-ptr';
        if (curr.prev) {
          ptrPrev.innerHTML = '<i class="fa-solid fa-circle-dot" style="font-size:8px;color:#dc2626;"></i>';
        } else {
          ptrPrev.innerHTML = '<i class="fa-solid fa-xmark" style="font-size:8px;"></i>';
        }

        var ptrNext = document.createElement('div');
        ptrNext.className = 'll-node-ptr';
        if (curr.next) {
          ptrNext.classList.add('has-next');
          ptrNext.innerHTML = '<i class="fa-solid fa-circle-dot" style="font-size:8px;"></i>';
        } else {
          ptrNext.innerHTML = '<i class="fa-solid fa-xmark" style="font-size:8px;"></i>';
        }

        box.appendChild(ptrPrev);
        box.appendChild(data);
        box.appendChild(ptrNext);
      }

      // Index label
      var idxLabel = document.createElement('div');
      idxLabel.className = 'll-node-index';
      idxLabel.textContent = '[' + idx + ']';

      nodeWrap.appendChild(label);
      nodeWrap.appendChild(box);
      nodeWrap.appendChild(idxLabel);
      group.appendChild(nodeWrap);

      // Arrow to next
      if (curr.next) {
        if (listType === 'singly') {
          var arrow = document.createElement('div');
          arrow.className = 'll-arrow';
          arrow.innerHTML = '<i class="fa-solid fa-arrow-right ll-arrow-forward"></i>';
          group.appendChild(arrow);
        } else {
          var arrowD = document.createElement('div');
          arrowD.className = 'll-arrow-doubly';
          arrowD.innerHTML =
            '<i class="fa-solid fa-arrow-right ll-arrow-forward"></i>' +
            '<i class="fa-solid fa-arrow-left ll-arrow-backward"></i>';
          group.appendChild(arrowD);
        }
      }

      els.llCanvas.appendChild(group);

      curr = curr.next;
      idx++;
    }

    // Null terminator
    var nullTerm = document.createElement('div');
    nullTerm.className = 'll-node-group';
    var arrowToNull = document.createElement('div');
    arrowToNull.className = 'll-arrow';
    arrowToNull.innerHTML = '<i class="fa-solid fa-arrow-right ll-arrow-forward" style="opacity:0.4;"></i>';
    var nullBox = document.createElement('div');
    nullBox.className = 'll-null';
    nullBox.textContent = 'NULL';
    nullTerm.appendChild(arrowToNull);
    nullTerm.appendChild(nullBox);
    els.llCanvas.appendChild(nullTerm);

    // Clear flash after animation
    setTimeout(function() {
      flashIndex = -1;
      flashType = '';
    }, 900);
  }

  function updateSize() {
    els.listSize.textContent = size;
  }

  // ==================== History ====================
  function addHistory(type, text) {
    var empty = els.historyBody.querySelector('.ll-history-empty');
    if (empty) empty.remove();

    var entry = document.createElement('div');
    entry.className = 'll-history-entry';

    var tag = document.createElement('span');
    tag.className = 'll-history-tag ll-tag-' + type;
    var tagLabels = { insert: 'INS', delete: 'DEL', search: 'SRC', info: 'INFO' };
    tag.textContent = tagLabels[type] || type.toUpperCase();

    var txt = document.createElement('span');
    txt.className = 'll-history-text';
    txt.textContent = text;

    entry.appendChild(tag);
    entry.appendChild(txt);
    els.historyBody.insertBefore(entry, els.historyBody.firstChild);

    while (els.historyBody.children.length > 50) {
      els.historyBody.removeChild(els.historyBody.lastChild);
    }
  }

  function clearHistory() {
    els.historyBody.innerHTML = '<div class="ll-history-empty">No operations yet.</div>';
  }

  // ==================== Input Helpers ====================
  function getVal() {
    var v = els.valueInput.value.trim();
    if (!v) {
      toast('Please enter a value', 'error');
      els.valueInput.focus();
      return null;
    }
    return v;
  }

  function getIdx() {
    var v = els.indexInput.value.trim();
    if (v === '') {
      toast('Please enter an index', 'error');
      els.indexInput.focus();
      return null;
    }
    var n = parseInt(v, 10);
    if (isNaN(n) || n < 0) {
      toast('Index must be a non-negative integer', 'error');
      return null;
    }
    return n;
  }

  function clearInputs() {
    els.valueInput.value = '';
    els.indexInput.value = '';
    els.valueInput.focus();
  }

  // ==================== Type Switch ====================
  function switchType(type) {
    if (type === listType) return;
    listType = type;

    els.singlyBtn.classList.toggle('active', type === 'singly');
    els.doublyBtn.classList.toggle('active', type === 'doubly');

    // Rebuild prev pointers or remove them
    if (type === 'doubly' && head) {
      var curr = head;
      var prev = null;
      while (curr) {
        curr.prev = prev;
        prev = curr;
        curr = curr.next;
      }
    }

    addHistory('info', 'Switched to ' + type + ' linked list');
    render();
  }

  // ==================== Event Listeners ====================
  els.singlyBtn.addEventListener('click', function() { switchType('singly'); });
  els.doublyBtn.addEventListener('click', function() { switchType('doubly'); });

  els.insertHeadBtn.addEventListener('click', function() {
    var v = getVal();
    if (v === null) return;
    insertHead(v);
    clearInputs();
  });

  els.insertTailBtn.addEventListener('click', function() {
    var v = getVal();
    if (v === null) return;
    insertTail(v);
    clearInputs();
  });

  els.insertAtBtn.addEventListener('click', function() {
    var v = getVal();
    if (v === null) return;
    var i = getIdx();
    if (i === null) return;
    insertAt(v, i);
    clearInputs();
  });

  els.deleteValBtn.addEventListener('click', function() {
    var v = getVal();
    if (v === null) return;
    deleteByValue(v);
    clearInputs();
  });

  els.deleteAtBtn.addEventListener('click', function() {
    var i = getIdx();
    if (i === null) return;
    deleteAt(i);
    clearInputs();
  });

  els.searchBtn.addEventListener('click', function() {
    var v = getVal();
    if (v === null) return;
    searchValue(v);
  });

  els.reverseBtn.addEventListener('click', reverseList);
  els.clearBtn.addEventListener('click', clearList);
  els.clearHistoryBtn.addEventListener('click', clearHistory);

  els.stepModeCheck.addEventListener('change', function() {
    els.stepControls.style.display = this.checked ? 'flex' : 'none';
    if (!this.checked) {
      els.stepPanel.style.display = 'none';
      stepping = false;
      stepQueue = [];
      highlightIndex = -1;
      render();
    }
  });

  els.stepNextBtn.addEventListener('click', function() {
    if (stepQueue.length > 0) {
      var step = stepQueue.shift();
      step();
    }
  });

  els.stepSkipBtn.addEventListener('click', skipSteps);

  els.valueInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      els.insertHeadBtn.click();
    }
  });

  // ==================== Init ====================
  render();
  updateSize();

})();
