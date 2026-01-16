/**
 * Diff Checker Tool
 */
(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    view: 'split',
    ignoreCase: false,
    ignoreWhitespace: false,
    wordLevel: false
  };

  // ==================== DOM Elements ====================
  const elements = {
    originalText: document.getElementById('originalText'),
    modifiedText: document.getElementById('modifiedText'),
    originalLines: document.getElementById('originalLines'),
    originalChars: document.getElementById('originalChars'),
    modifiedLines: document.getElementById('modifiedLines'),
    modifiedChars: document.getElementById('modifiedChars'),
    compareBtn: document.getElementById('compareBtn'),
    clearBtn: document.getElementById('clearBtn'),
    swapBtn: document.getElementById('swapBtn'),
    viewBtns: document.querySelectorAll('.view-btn'),
    ignoreCase: document.getElementById('ignoreCase'),
    ignoreWhitespace: document.getElementById('ignoreWhitespace'),
    wordLevel: document.getElementById('wordLevel'),
    diffResult: document.getElementById('diffResult'),
    diffOutput: document.getElementById('diffOutput'),
    diffStats: document.getElementById('diffStats'),
    additionsCount: document.getElementById('additionsCount'),
    deletionsCount: document.getElementById('deletionsCount'),
    changesCount: document.getElementById('changesCount'),
    pasteOriginal: document.getElementById('pasteOriginal'),
    pasteModified: document.getElementById('pasteModified'),
    clearOriginal: document.getElementById('clearOriginal'),
    clearModified: document.getElementById('clearModified'),
    toast: document.getElementById('toast')
  };

  // ==================== Diff Algorithm (LCS-based) ====================
  function computeLCS(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp;
  }

  function backtrackLCS(dp, a, b, i, j) {
    const result = [];

    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.unshift({ type: 'equal', value: a[i - 1], oldIndex: i - 1, newIndex: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        result.unshift({ type: 'removed', value: a[i - 1], oldIndex: i - 1 });
        i--;
      } else {
        result.unshift({ type: 'added', value: b[j - 1], newIndex: j - 1 });
        j--;
      }
    }

    while (i > 0) {
      result.unshift({ type: 'removed', value: a[i - 1], oldIndex: i - 1 });
      i--;
    }

    while (j > 0) {
      result.unshift({ type: 'added', value: b[j - 1], newIndex: j - 1 });
      j--;
    }

    return result;
  }

  function computeDiff(original, modified) {
    let origLines = original.split('\n');
    let modLines = modified.split('\n');

    if (state.ignoreCase) {
      origLines = origLines.map(l => l.toLowerCase());
      modLines = modLines.map(l => l.toLowerCase());
    }

    if (state.ignoreWhitespace) {
      origLines = origLines.map(l => l.trim().replace(/\s+/g, ' '));
      modLines = modLines.map(l => l.trim().replace(/\s+/g, ' '));
    }

    const dp = computeLCS(origLines, modLines);
    const diff = backtrackLCS(dp, origLines, modLines, origLines.length, modLines.length);

    // Map back to original content
    const origContent = original.split('\n');
    const modContent = modified.split('\n');

    return diff.map(d => {
      if (d.type === 'equal') {
        return { ...d, originalValue: origContent[d.oldIndex], modifiedValue: modContent[d.newIndex] };
      } else if (d.type === 'removed') {
        return { ...d, originalValue: origContent[d.oldIndex] };
      } else {
        return { ...d, modifiedValue: modContent[d.newIndex] };
      }
    });
  }

  function computeWordDiff(original, modified) {
    const origWords = original.split(/(\s+)/);
    const modWords = modified.split(/(\s+)/);

    const dp = computeLCS(origWords, modWords);
    return backtrackLCS(dp, origWords, modWords, origWords.length, modWords.length);
  }

  function highlightWordDiff(origLine, modLine) {
    if (!state.wordLevel) {
      return { origHtml: escapeHtml(origLine), modHtml: escapeHtml(modLine) };
    }

    const wordDiff = computeWordDiff(origLine, modLine);
    let origHtml = '';
    let modHtml = '';

    wordDiff.forEach(d => {
      if (d.type === 'equal') {
        origHtml += escapeHtml(d.value);
        modHtml += escapeHtml(d.value);
      } else if (d.type === 'removed') {
        origHtml += `<span class="diff-word-removed">${escapeHtml(d.value)}</span>`;
      } else {
        modHtml += `<span class="diff-word-added">${escapeHtml(d.value)}</span>`;
      }
    });

    return { origHtml, modHtml };
  }

  // ==================== Rendering ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderSplitView(diff) {
    const origLines = [];
    const modLines = [];
    let origLineNum = 0;
    let modLineNum = 0;

    // Group adjacent changes for word-level diff
    const groups = [];
    let currentGroup = [];

    diff.forEach((d, i) => {
      currentGroup.push(d);
      if (d.type === 'equal' || i === diff.length - 1) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
      }
    });

    diff.forEach(d => {
      if (d.type === 'equal') {
        origLineNum++;
        modLineNum++;
        origLines.push({ num: origLineNum, content: escapeHtml(d.originalValue), type: 'equal' });
        modLines.push({ num: modLineNum, content: escapeHtml(d.modifiedValue), type: 'equal' });
      } else if (d.type === 'removed') {
        origLineNum++;
        const content = state.wordLevel ? `<span class="diff-word-removed">${escapeHtml(d.originalValue)}</span>` : escapeHtml(d.originalValue);
        origLines.push({ num: origLineNum, content, type: 'removed' });
        modLines.push({ num: '', content: '', type: 'empty' });
      } else {
        modLineNum++;
        const content = state.wordLevel ? `<span class="diff-word-added">${escapeHtml(d.modifiedValue)}</span>` : escapeHtml(d.modifiedValue);
        origLines.push({ num: '', content: '', type: 'empty' });
        modLines.push({ num: modLineNum, content, type: 'added' });
      }
    });

    const renderPane = (lines, title) => {
      const linesHtml = lines.map(l => `
        <div class="diff-line ${l.type}">
          <span class="diff-line-number">${l.num}</span>
          <span class="diff-line-content">${l.content}</span>
        </div>
      `).join('');

      return `
        <div class="diff-pane">
          <div class="diff-pane-header">${title}</div>
          <div class="diff-pane-content">${linesHtml}</div>
        </div>
      `;
    };

    return `
      <div class="diff-split">
        ${renderPane(origLines, 'Original')}
        ${renderPane(modLines, 'Modified')}
      </div>
    `;
  }

  function renderUnifiedView(diff) {
    let origLineNum = 0;
    let modLineNum = 0;

    const lines = diff.map(d => {
      if (d.type === 'equal') {
        origLineNum++;
        modLineNum++;
        return `
          <div class="diff-line">
            <span class="diff-line-number"><span>${origLineNum}</span><span>${modLineNum}</span></span>
            <span class="diff-line-content"> ${escapeHtml(d.originalValue)}</span>
          </div>
        `;
      } else if (d.type === 'removed') {
        origLineNum++;
        const content = state.wordLevel ? `<span class="diff-word-removed">${escapeHtml(d.originalValue)}</span>` : escapeHtml(d.originalValue);
        return `
          <div class="diff-line removed">
            <span class="diff-line-number"><span>${origLineNum}</span><span></span></span>
            <span class="diff-line-content">-${content}</span>
          </div>
        `;
      } else {
        modLineNum++;
        const content = state.wordLevel ? `<span class="diff-word-added">${escapeHtml(d.modifiedValue)}</span>` : escapeHtml(d.modifiedValue);
        return `
          <div class="diff-line added">
            <span class="diff-line-number"><span></span><span>${modLineNum}</span></span>
            <span class="diff-line-content">+${content}</span>
          </div>
        `;
      }
    }).join('');

    return `
      <div class="diff-unified">
        <div class="diff-pane-content">${lines}</div>
      </div>
    `;
  }

  function renderNoDiff() {
    return `
      <div class="no-diff">
        <i class="fa-solid fa-check-circle"></i>
        <p>No differences found</p>
        <span>The two texts are identical</span>
      </div>
    `;
  }

  function renderDiff() {
    const original = elements.originalText.value;
    const modified = elements.modifiedText.value;

    if (!original && !modified) {
      showToast('Please enter text in both panels');
      return;
    }

    const diff = computeDiff(original, modified);

    // Calculate stats
    const additions = diff.filter(d => d.type === 'added').length;
    const deletions = diff.filter(d => d.type === 'removed').length;
    const changes = Math.min(additions, deletions);

    elements.additionsCount.textContent = additions;
    elements.deletionsCount.textContent = deletions;
    elements.changesCount.textContent = changes;

    // Check if identical
    if (additions === 0 && deletions === 0) {
      elements.diffOutput.innerHTML = renderNoDiff();
    } else {
      if (state.view === 'split') {
        elements.diffOutput.innerHTML = renderSplitView(diff);
      } else {
        elements.diffOutput.innerHTML = renderUnifiedView(diff);
      }
    }

    elements.diffResult.classList.add('show');
  }

  // ==================== UI Helpers ====================
  function updateStats() {
    const origText = elements.originalText.value;
    const modText = elements.modifiedText.value;

    elements.originalLines.textContent = `${origText ? origText.split('\n').length : 0} lines`;
    elements.originalChars.textContent = `${origText.length} chars`;
    elements.modifiedLines.textContent = `${modText ? modText.split('\n').length : 0} lines`;
    elements.modifiedChars.textContent = `${modText.length} chars`;
  }

  function showToast(message, type = 'default') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast show' + (type !== 'default' ? ` ${type}` : '');

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2500);
  }

  async function pasteFromClipboard(target) {
    try {
      const text = await navigator.clipboard.readText();
      target.value = text;
      updateStats();
      showToast('Pasted!', 'success');
    } catch (err) {
      showToast('Failed to paste from clipboard');
    }
  }

  function readFile(file, target) {
    const reader = new FileReader();
    reader.onload = (e) => {
      target.value = e.target.result;
      updateStats();
      showToast(`Loaded: ${file.name}`, 'success');
    };
    reader.onerror = () => {
      showToast('Failed to read file');
    };
    reader.readAsText(file);
  }

  function generateUnifiedDiff() {
    const original = elements.originalText.value;
    const modified = elements.modifiedText.value;
    const diff = computeDiff(original, modified);

    let result = '--- Original\n+++ Modified\n';
    let origLineNum = 0;
    let modLineNum = 0;

    diff.forEach(d => {
      if (d.type === 'equal') {
        origLineNum++;
        modLineNum++;
        result += ` ${d.originalValue}\n`;
      } else if (d.type === 'removed') {
        origLineNum++;
        result += `-${d.originalValue}\n`;
      } else {
        modLineNum++;
        result += `+${d.modifiedValue}\n`;
      }
    });

    return result;
  }

  async function copyDiff() {
    if (!elements.diffResult.classList.contains('show')) {
      showToast('Please compare texts first');
      return;
    }

    const diffText = generateUnifiedDiff();
    try {
      await navigator.clipboard.writeText(diffText);
      showToast('Diff copied!', 'success');
    } catch (err) {
      showToast('Failed to copy');
    }
  }

  function downloadDiff() {
    if (!elements.diffResult.classList.contains('show')) {
      showToast('Please compare texts first');
      return;
    }

    const diffText = generateUnifiedDiff();
    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-${Date.now()}.diff`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'success');
  }

  // ==================== Event Handlers ====================
  function handleCompare() {
    renderDiff();
  }

  function handleClear() {
    elements.originalText.value = '';
    elements.modifiedText.value = '';
    elements.diffResult.classList.remove('show');
    elements.diffOutput.innerHTML = `
      <div class="output-empty">
        <i class="fa-solid fa-code-compare"></i>
        <p>Enter text in both panels and click "Compare" to see differences</p>
      </div>
    `;
    updateStats();
  }

  function handleSwap() {
    const temp = elements.originalText.value;
    elements.originalText.value = elements.modifiedText.value;
    elements.modifiedText.value = temp;
    updateStats();
    showToast('Texts swapped', 'success');
  }

  function handleViewChange(e) {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;

    elements.viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.view = btn.dataset.view;

    if (elements.diffResult.classList.contains('show')) {
      renderDiff();
    }
  }

  // ==================== Initialize ====================
  function init() {
    // Event listeners
    elements.compareBtn.addEventListener('click', handleCompare);
    elements.clearBtn.addEventListener('click', handleClear);
    elements.swapBtn.addEventListener('click', handleSwap);

    // View toggle
    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', handleViewChange);
    });

    // Settings
    elements.ignoreCase.addEventListener('change', (e) => {
      state.ignoreCase = e.target.checked;
    });
    elements.ignoreWhitespace.addEventListener('change', (e) => {
      state.ignoreWhitespace = e.target.checked;
    });
    elements.wordLevel.addEventListener('change', (e) => {
      state.wordLevel = e.target.checked;
    });

    // Text input stats
    elements.originalText.addEventListener('input', updateStats);
    elements.modifiedText.addEventListener('input', updateStats);

    // Paste buttons
    elements.pasteOriginal.addEventListener('click', () => pasteFromClipboard(elements.originalText));
    elements.pasteModified.addEventListener('click', () => pasteFromClipboard(elements.modifiedText));

    // Clear buttons
    elements.clearOriginal.addEventListener('click', () => {
      elements.originalText.value = '';
      updateStats();
    });
    elements.clearModified.addEventListener('click', () => {
      elements.modifiedText.value = '';
      updateStats();
    });

    // File upload
    const uploadOriginal = document.getElementById('uploadOriginal');
    const uploadModified = document.getElementById('uploadModified');

    uploadOriginal?.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        readFile(e.target.files[0], elements.originalText);
      }
    });

    uploadModified?.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        readFile(e.target.files[0], elements.modifiedText);
      }
    });

    // Drag and drop
    [elements.originalText, elements.modifiedText].forEach(textarea => {
      textarea.addEventListener('dragover', (e) => {
        e.preventDefault();
        textarea.classList.add('drag-over');
      });

      textarea.addEventListener('dragleave', () => {
        textarea.classList.remove('drag-over');
      });

      textarea.addEventListener('drop', (e) => {
        e.preventDefault();
        textarea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
          readFile(file, textarea);
        }
      });
    });

    // Export buttons
    const copyDiffBtn = document.getElementById('copyDiff');
    const downloadDiffBtn = document.getElementById('downloadDiff');

    if (copyDiffBtn) copyDiffBtn.addEventListener('click', copyDiff);
    if (downloadDiffBtn) downloadDiffBtn.addEventListener('click', downloadDiff);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleCompare();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompare();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSwap();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        copyDiff();
      }
    });
  }

  // Start
  init();
})();
