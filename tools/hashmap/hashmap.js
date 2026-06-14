/**
 * KVSOVANREACH HashMap Visualizer
 * Interactive HashTable with chaining collision resolution
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const els = {
    keyInput: document.getElementById('keyInput'),
    valueInput: document.getElementById('valueInput'),
    insertBtn: document.getElementById('insertBtn'),
    getBtn: document.getElementById('getBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    tableSizeSelect: document.getElementById('tableSizeSelect'),
    stepModeCheck: document.getElementById('stepModeCheck'),
    entryCount: document.getElementById('entryCount'),
    loadFactor: document.getElementById('loadFactor'),
    hashViz: document.getElementById('hashViz'),
    stepPanel: document.getElementById('stepPanel'),
    stepInfo: document.getElementById('stepInfo'),
    stepNextBtn: document.getElementById('stepNextBtn'),
    bucketsContainer: document.getElementById('bucketsContainer'),
    resizeBar: document.getElementById('resizeBar'),
    autoResizeBtn: document.getElementById('autoResizeBtn'),
    historyBody: document.getElementById('historyBody'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };

  // ==================== State ====================
  let tableSize = 8;
  let buckets = [];
  let totalEntries = 0;
  let stepQueue = [];
  let stepping = false;

  function toast(msg, type) {
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(msg, type || 'info');
    }
  }

  // ==================== Hash Function ====================
  function hashKey(key) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % tableSize;
  }

  // ==================== Initialize Buckets ====================
  function initBuckets() {
    buckets = [];
    for (let i = 0; i < tableSize; i++) {
      buckets.push([]);
    }
    totalEntries = 0;
    updateStats();
    renderBuckets();
  }

  // ==================== Stats ====================
  function updateStats() {
    els.entryCount.textContent = totalEntries;
    const lf = tableSize > 0 ? (totalEntries / tableSize).toFixed(2) : '0.00';
    els.loadFactor.textContent = lf;

    if (parseFloat(lf) > 0.75 && totalEntries > 0) {
      els.resizeBar.style.display = 'flex';
    } else {
      els.resizeBar.style.display = 'none';
    }
  }

  // ==================== Hash Viz Display ====================
  function showHashViz(key, index) {
    els.hashViz.classList.add('active');
    els.hashViz.querySelector('.hm-hash-label').innerHTML =
      'hash("<strong>' + escapeHtml(key) + '</strong>") &rarr; bucket <strong>' + index + '</strong>';
    clearTimeout(showHashViz._timer);
    showHashViz._timer = setTimeout(function() {
      els.hashViz.classList.remove('active');
    }, 2000);
  }

  function resetHashViz() {
    els.hashViz.classList.remove('active');
    els.hashViz.querySelector('.hm-hash-label').innerHTML = 'hash("") &rarr; bucket ?';
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ==================== Render ====================
  function renderBuckets(highlightBucket, flashEntryKey, flashType) {
    els.bucketsContainer.innerHTML = '';

    for (let i = 0; i < tableSize; i++) {
      const row = document.createElement('div');
      row.className = 'hm-bucket';
      if (highlightBucket === i) row.classList.add('highlighted');

      const idx = document.createElement('div');
      idx.className = 'hm-bucket-index';
      idx.textContent = i;

      const chain = document.createElement('div');
      chain.className = 'hm-bucket-chain';

      if (buckets[i].length === 0) {
        const empty = document.createElement('span');
        empty.className = 'hm-bucket-empty';
        empty.textContent = 'empty';
        chain.appendChild(empty);
      } else {
        buckets[i].forEach(function(entry, ei) {
          if (ei > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'hm-chain-arrow';
            arrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
            chain.appendChild(arrow);
          }

          const node = document.createElement('span');
          node.className = 'hm-entry';

          // Collision marker: if more than 1 in bucket and not the one being flashed
          if (buckets[i].length > 1) {
            node.classList.add('collision');
          }

          // Flash effects
          if (flashEntryKey === entry.key) {
            if (flashType === 'insert') {
              node.classList.add('flash-insert', 'slide-in');
            } else if (flashType === 'found') {
              node.classList.add('flash-found');
            }
          }

          node.innerHTML =
            '<span class="hm-entry-key">' + escapeHtml(entry.key) + '</span>' +
            '<span class="hm-entry-sep">:</span>' +
            '<span class="hm-entry-val">' + escapeHtml(entry.value) + '</span>';

          chain.appendChild(node);
        });
      }

      row.appendChild(idx);
      row.appendChild(chain);
      els.bucketsContainer.appendChild(row);
    }
  }

  // ==================== Operations ====================
  function insertEntry(key, value, skipLog) {
    const index = hashKey(key);
    showHashViz(key, index);

    // Check if key already exists -> update
    const bucket = buckets[index];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        const oldVal = bucket[i].value;
        bucket[i].value = value;
        if (!skipLog) addHistory('insert', 'Update "' + key + '": "' + oldVal + '" -> "' + value + '" [bucket ' + index + ']');
        renderBuckets(index, key, 'insert');
        updateStats();
        return;
      }
    }

    // New entry
    const hadCollision = bucket.length > 0;
    bucket.push({ key: key, value: value });
    totalEntries++;

    if (!skipLog) {
      let msg = 'Insert "' + key + '": "' + value + '" -> bucket ' + index;
      if (hadCollision) msg += ' (COLLISION, chain length: ' + bucket.length + ')';
      addHistory('insert', msg);
    }

    renderBuckets(index, key, 'insert');
    updateStats();
  }

  function getEntry(key) {
    const index = hashKey(key);
    showHashViz(key, index);

    const bucket = buckets[index];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        toast('Found: "' + key + '" = "' + bucket[i].value + '"', 'success');
        addHistory('get', 'Get "' + key + '" -> "' + bucket[i].value + '" [bucket ' + index + ']');
        renderBuckets(index, key, 'found');
        return bucket[i].value;
      }
    }

    toast('Key "' + key + '" not found', 'error');
    addHistory('get', 'Get "' + key + '" -> NOT FOUND [bucket ' + index + ']');
    renderBuckets(index);
    return undefined;
  }

  function deleteEntry(key) {
    const index = hashKey(key);
    showHashViz(key, index);

    const bucket = buckets[index];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1);
        totalEntries--;
        toast('Deleted "' + key + '"', 'success');
        addHistory('delete', 'Delete "' + key + '" from bucket ' + index);
        renderBuckets(index);
        updateStats();
        return true;
      }
    }

    toast('Key "' + key + '" not found', 'error');
    addHistory('delete', 'Delete "' + key + '" -> NOT FOUND');
    renderBuckets(index);
    return false;
  }

  function clearAll() {
    if (totalEntries === 0) return;
    addHistory('info', 'Cleared all entries');
    initBuckets();
    resetHashViz();
    toast('HashMap cleared', 'success');
  }

  // ==================== Step-by-step Insert ====================
  function startStepInsert(key, value) {
    const index = hashKey(key);
    stepping = true;
    stepQueue = [];
    els.stepPanel.style.display = 'flex';

    // Step 1: compute hash
    stepQueue.push(function() {
      showHashViz(key, index);
      els.stepInfo.textContent = 'Step 1: Compute hash("' + key + '") = ' + index;
      renderBuckets(index);
    });

    // Step 2: navigate to bucket
    stepQueue.push(function() {
      els.stepInfo.textContent = 'Step 2: Go to bucket ' + index + ' (chain length: ' + buckets[index].length + ')';
      renderBuckets(index);
    });

    // Step 3: check for existing key
    const existing = buckets[index].find(function(e) { return e.key === key; });
    if (existing) {
      stepQueue.push(function() {
        els.stepInfo.textContent = 'Step 3: Key "' + key + '" exists, updating value to "' + value + '"';
        existing.value = value;
        addHistory('insert', 'Update "' + key + '" -> "' + value + '" [bucket ' + index + ']');
        renderBuckets(index, key, 'insert');
        updateStats();
      });
    } else {
      if (buckets[index].length > 0) {
        stepQueue.push(function() {
          els.stepInfo.textContent = 'Step 3: Collision detected! Appending to chain in bucket ' + index;
        });
      }
      stepQueue.push(function() {
        const label = buckets[index].length > 0 ? 'Step 4' : 'Step 3';
        els.stepInfo.textContent = label + ': Insert ("' + key + '", "' + value + '") into bucket ' + index;
        buckets[index].push({ key: key, value: value });
        totalEntries++;
        addHistory('insert', 'Insert "' + key + '": "' + value + '" -> bucket ' + index + (buckets[index].length > 1 ? ' (COLLISION)' : ''));
        renderBuckets(index, key, 'insert');
        updateStats();
      });
    }

    // Final step: done
    stepQueue.push(function() {
      els.stepInfo.textContent = 'Done! Entry stored successfully.';
      stepping = false;
      setTimeout(function() {
        els.stepPanel.style.display = 'none';
      }, 1200);
    });

    // Execute first step
    var nextStep = stepQueue.shift();
    if (nextStep) nextStep();
  }

  // ==================== Sample Data ====================
  function loadSample() {
    clearAll();
    var samples = [
      ['name', 'Alice'],
      ['age', '25'],
      ['city', 'Tokyo'],
      ['lang', 'JS'],
      ['food', 'Sushi'],
      ['color', 'Blue']
    ];
    samples.forEach(function(s) {
      insertEntry(s[0], s[1]);
    });
    toast('Sample data loaded', 'success');
  }

  // ==================== Auto Resize ====================
  function autoResize() {
    var oldBuckets = buckets;
    var newSize = tableSize * 2;
    if (newSize > 32) newSize = 32;
    if (newSize === tableSize) {
      toast('Already at maximum table size', 'info');
      return;
    }

    tableSize = newSize;
    els.tableSizeSelect.value = String(newSize);
    buckets = [];
    for (var i = 0; i < tableSize; i++) buckets.push([]);
    totalEntries = 0;

    // Rehash all entries
    oldBuckets.forEach(function(bucket) {
      bucket.forEach(function(entry) {
        insertEntry(entry.key, entry.value, true);
      });
    });

    addHistory('info', 'Resized table to ' + tableSize + ' buckets (rehashed ' + totalEntries + ' entries)');
    updateStats();
    renderBuckets();
    toast('Table resized to ' + tableSize + ' buckets', 'success');
  }

  // ==================== History ====================
  function addHistory(type, text) {
    var empty = els.historyBody.querySelector('.hm-history-empty');
    if (empty) empty.remove();

    var entry = document.createElement('div');
    entry.className = 'hm-history-entry';

    var tag = document.createElement('span');
    tag.className = 'hm-history-tag hm-tag-' + type;
    var tagLabels = { insert: 'SET', get: 'GET', delete: 'DEL', info: 'INFO' };
    tag.textContent = tagLabels[type] || type.toUpperCase();

    var txt = document.createElement('span');
    txt.className = 'hm-history-text';
    txt.textContent = text;

    entry.appendChild(tag);
    entry.appendChild(txt);
    els.historyBody.insertBefore(entry, els.historyBody.firstChild);

    while (els.historyBody.children.length > 50) {
      els.historyBody.removeChild(els.historyBody.lastChild);
    }
  }

  function clearHistory() {
    els.historyBody.innerHTML = '<div class="hm-history-empty">No operations yet.</div>';
  }

  // ==================== Input Helpers ====================
  function getKey() {
    var val = els.keyInput.value.trim();
    if (!val) {
      toast('Please enter a key', 'error');
      els.keyInput.focus();
      return null;
    }
    return val;
  }

  function getValue() {
    var val = els.valueInput.value.trim();
    if (!val) {
      toast('Please enter a value', 'error');
      els.valueInput.focus();
      return null;
    }
    return val;
  }

  function clearInputs() {
    els.keyInput.value = '';
    els.valueInput.value = '';
    els.keyInput.focus();
  }

  // ==================== Event Listeners ====================
  els.insertBtn.addEventListener('click', function() {
    var key = getKey();
    if (key === null) return;
    var value = getValue();
    if (value === null) return;

    if (els.stepModeCheck.checked) {
      startStepInsert(key, value);
    } else {
      insertEntry(key, value);
    }
    clearInputs();
  });

  els.getBtn.addEventListener('click', function() {
    var key = getKey();
    if (key === null) return;
    getEntry(key);
  });

  els.deleteBtn.addEventListener('click', function() {
    var key = getKey();
    if (key === null) return;
    deleteEntry(key);
    clearInputs();
  });

  els.clearBtn.addEventListener('click', clearAll);
  els.sampleBtn.addEventListener('click', loadSample);
  els.clearHistoryBtn.addEventListener('click', clearHistory);
  els.autoResizeBtn.addEventListener('click', autoResize);

  els.stepNextBtn.addEventListener('click', function() {
    if (stepQueue.length > 0) {
      var nextStep = stepQueue.shift();
      nextStep();
    }
  });

  els.tableSizeSelect.addEventListener('change', function() {
    var newSize = parseInt(this.value, 10);
    if (newSize === tableSize) return;

    var oldBuckets = buckets;
    var oldCount = totalEntries;
    tableSize = newSize;
    buckets = [];
    for (var i = 0; i < tableSize; i++) buckets.push([]);
    totalEntries = 0;

    // Rehash
    oldBuckets.forEach(function(bucket) {
      bucket.forEach(function(entry) {
        insertEntry(entry.key, entry.value, true);
      });
    });

    addHistory('info', 'Table resized to ' + tableSize + ' (rehashed ' + totalEntries + ' entries)');
    updateStats();
    renderBuckets();
    toast('Table resized to ' + tableSize + ' buckets', 'success');
  });

  els.keyInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      els.valueInput.focus();
    }
  });

  els.valueInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      els.insertBtn.click();
    }
  });

  // ==================== Init ====================
  initBuckets();

})();
