/**
 * Word Frequency Analyzer Tool
 * Analyzes word frequency with n-gram support, chart visualization, and CSV export
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    caseSensitive: document.getElementById('caseSensitive'),
    excludeStopWords: document.getElementById('excludeStopWords'),
    minLength: document.getElementById('minLength'),
    summarySection: document.getElementById('summarySection'),
    totalWords: document.getElementById('totalWords'),
    uniqueWords: document.getElementById('uniqueWords'),
    avgWordLen: document.getElementById('avgWordLen'),
    topWord: document.getElementById('topWord'),
    resultsSection: document.getElementById('resultsSection'),
    emptyState: document.getElementById('emptyState'),
    tabs: document.querySelectorAll('.wf-tab'),
    searchInput: document.getElementById('searchInput'),
    exportBtn: document.getElementById('exportBtn'),
    chartContainer: document.getElementById('chartContainer'),
    tableBody: document.getElementById('tableBody'),
    tableEmpty: document.getElementById('tableEmpty'),
    highlightSection: document.getElementById('highlightSection'),
    highlightWord: document.getElementById('highlightWord'),
    highlightText: document.getElementById('highlightText'),
    closeHighlight: document.getElementById('closeHighlight')
  };

  // ==================== Stop Words ====================
  const STOP_WORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any','are',
    'aren\'t','as','at','be','because','been','before','being','below','between','both',
    'but','by','can','can\'t','cannot','could','couldn\'t','did','didn\'t','do','does',
    'doesn\'t','doing','don\'t','down','during','each','few','for','from','further',
    'get','got','had','hadn\'t','has','hasn\'t','have','haven\'t','having','he','he\'d',
    'he\'ll','he\'s','her','here','here\'s','hers','herself','him','himself','his','how',
    'how\'s','i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is','isn\'t','it',
    'it\'s','its','itself','let\'s','me','more','most','mustn\'t','my','myself','no',
    'nor','not','of','off','on','once','only','or','other','ought','our','ours',
    'ourselves','out','over','own','same','shan\'t','she','she\'d','she\'ll','she\'s',
    'should','shouldn\'t','so','some','such','than','that','that\'s','the','their',
    'theirs','them','themselves','then','there','there\'s','these','they','they\'d',
    'they\'ll','they\'re','they\'ve','this','those','through','to','too','under','until',
    'up','very','was','wasn\'t','we','we\'d','we\'ll','we\'re','we\'ve','were','weren\'t',
    'what','what\'s','when','when\'s','where','where\'s','which','while','who','who\'s',
    'whom','why','why\'s','will','with','won\'t','would','wouldn\'t','you','you\'d',
    'you\'ll','you\'re','you\'ve','your','yours','yourself','yourselves','just','also',
    'already','always','another','around','away','back','even','ever','every','going',
    'gone','good','great','however','know','like','long','look','make','many','much',
    'must','never','new','now','old','one','really','right','said','say','see','still',
    'take','tell','thing','think','time','two','us','use','used','want','way','well',
    'went','will','work','world','year'
  ]);

  // ==================== Sample Text ====================
  const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. The dog barked loudly at the fox, but the fox was too quick. Quick thinking saved the fox from the dog. The brown dog chased the brown fox through the forest. The forest was dark and the fox was clever. The clever fox outsmarted the lazy dog once again. Dogs and foxes have been rivals since ancient times. The quick fox jumped over not one but two lazy dogs. Every dog has its day, but today was the fox's day. The brown fox ran quickly through the green forest, past the old oak tree, and into the meadow where the lazy dog slept peacefully under the warm afternoon sun.`;

  // ==================== State ====================
  let currentNgram = 1;
  let currentResults = [];
  let originalText = '';

  // ==================== Text Processing ====================

  function tokenize(text) {
    return text.match(/[a-zA-Z'\u2019]+/g) || [];
  }

  function getNgrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  function analyze() {
    const text = elements.textInput.value.trim();
    if (!text) {
      ToolsCommon.showToast('Please enter some text to analyze.', 'warning');
      return;
    }

    originalText = text;
    const caseSensitive = elements.caseSensitive.checked;
    const excludeStop = elements.excludeStopWords.checked;
    const minLen = parseInt(elements.minLength.value, 10) || 1;

    let words = tokenize(text);
    const totalRaw = words.length;

    if (!caseSensitive) {
      words = words.map(w => w.toLowerCase());
    }

    // Filter by min length
    words = words.filter(w => w.length >= minLen);

    // Filter stop words
    if (excludeStop) {
      words = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
    }

    if (words.length === 0) {
      ToolsCommon.showToast('No words found after applying filters.', 'warning');
      return;
    }

    // Generate n-grams
    const items = getNgrams(words, currentNgram);
    const freq = {};
    items.forEach(item => {
      freq[item] = (freq[item] || 0) + 1;
    });

    // Sort by frequency descending
    currentResults = Object.entries(freq)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

    const totalItems = items.length;
    const uniqueCount = currentResults.length;
    const avgLen = words.length > 0
      ? (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(1)
      : '0';

    // Update summary
    elements.totalWords.textContent = totalRaw.toLocaleString();
    elements.uniqueWords.textContent = uniqueCount.toLocaleString();
    elements.avgWordLen.textContent = avgLen;
    elements.topWord.textContent = currentResults.length > 0 ? currentResults[0].word : '-';

    // Show results
    elements.summarySection.classList.remove('hidden');
    elements.resultsSection.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
    elements.highlightSection.classList.add('hidden');

    renderChart(currentResults.slice(0, 20), totalItems);
    renderTable(currentResults, totalItems);
  }

  // ==================== Chart ====================

  function renderChart(data, total) {
    if (data.length === 0) {
      elements.chartContainer.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:var(--space-4);">No data to display.</p>';
      return;
    }

    const maxCount = data[0].count;
    elements.chartContainer.innerHTML = data.map(item => {
      const pct = (item.count / maxCount) * 100;
      return `
        <div class="wf-chart-bar">
          <span class="wf-chart-label" title="${item.word}">${item.word}</span>
          <div class="wf-chart-track">
            <div class="wf-chart-fill" style="width:${pct}%"></div>
          </div>
          <span class="wf-chart-count">${item.count}</span>
        </div>
      `;
    }).join('');
  }

  // ==================== Table ====================

  function renderTable(data, total) {
    const filter = elements.searchInput.value.toLowerCase().trim();
    let filtered = data;
    if (filter) {
      filtered = data.filter(item => item.word.toLowerCase().includes(filter));
    }

    if (filtered.length === 0) {
      elements.tableBody.innerHTML = '';
      elements.tableEmpty.classList.remove('hidden');
      return;
    }

    elements.tableEmpty.classList.add('hidden');
    const maxCount = data[0].count;

    elements.tableBody.innerHTML = filtered.map((item, i) => {
      const pct = total > 0 ? ((item.count / total) * 100).toFixed(2) : '0.00';
      const barPct = (item.count / maxCount) * 100;
      return `
        <tr data-word="${item.word}">
          <td>${i + 1}</td>
          <td>${escapeHtml(item.word)}</td>
          <td>${item.count}</td>
          <td>${pct}%</td>
          <td>
            <div class="table-bar-track">
              <div class="table-bar-fill" style="width:${barPct}%"></div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==================== Highlight ====================

  function highlightWord(word) {
    if (!originalText) return;

    elements.highlightWord.textContent = word;
    elements.highlightSection.classList.remove('hidden');

    const caseSensitive = elements.caseSensitive.checked;
    const flags = caseSensitive ? 'g' : 'gi';
    // Escape special regex chars, handle multi-word n-grams
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, flags);

    const highlighted = escapeHtml(originalText).replace(
      new RegExp(`\\b${escapeHtml(escaped)}\\b`, flags),
      match => `<mark>${match}</mark>`
    );

    elements.highlightText.innerHTML = highlighted;

    elements.highlightSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==================== Export ====================

  function exportCSV() {
    if (currentResults.length === 0) {
      ToolsCommon.showToast('No results to export.', 'warning');
      return;
    }

    const totalItems = currentResults.reduce((s, r) => s + r.count, 0);
    const ngramLabel = currentNgram === 1 ? 'Word' : currentNgram === 2 ? 'Bigram' : 'Trigram';

    let csv = `Rank,${ngramLabel},Count,Percentage\n`;
    currentResults.forEach((item, i) => {
      const pct = totalItems > 0 ? ((item.count / totalItems) * 100).toFixed(2) : '0.00';
      csv += `${i + 1},"${item.word}",${item.count},${pct}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-frequency-${ngramLabel.toLowerCase()}s.csv`;
    a.click();
    URL.revokeObjectURL(url);

    ToolsCommon.showToast('CSV exported successfully!', 'success');
  }

  // ==================== Helpers ====================

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Event Listeners ====================

  elements.analyzeBtn.addEventListener('click', analyze);

  elements.clearBtn.addEventListener('click', () => {
    elements.textInput.value = '';
    elements.searchInput.value = '';
    elements.summarySection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');
    elements.highlightSection.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    currentResults = [];
    originalText = '';
  });

  elements.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      ToolsCommon.showToast('Text pasted from clipboard.', 'success');
    } catch {
      ToolsCommon.showToast('Unable to read clipboard.', 'error');
    }
  });

  elements.sampleBtn.addEventListener('click', () => {
    elements.textInput.value = SAMPLE_TEXT;
    ToolsCommon.showToast('Sample text loaded.', 'success');
  });

  // Tabs
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentNgram = parseInt(tab.dataset.ngram, 10);
      if (originalText) {
        analyze();
      }
    });
  });

  // Search filter
  elements.searchInput.addEventListener('input', () => {
    if (currentResults.length > 0) {
      const totalItems = currentResults.reduce((s, r) => s + r.count, 0);
      renderTable(currentResults, totalItems);
    }
  });

  // Export
  elements.exportBtn.addEventListener('click', exportCSV);

  // Table row click for highlight
  elements.tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const word = row.dataset.word;
    if (!word) return;

    // Toggle active
    elements.tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
    row.classList.add('active');

    highlightWord(word);
  });

  // Close highlight
  elements.closeHighlight.addEventListener('click', () => {
    elements.highlightSection.classList.add('hidden');
    elements.tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
  });

  // Options change triggers re-analyze
  [elements.caseSensitive, elements.excludeStopWords].forEach(el => {
    el.addEventListener('change', () => {
      if (originalText) analyze();
    });
  });

  elements.minLength.addEventListener('change', () => {
    if (originalText) analyze();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      analyze();
    }
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      exportCSV();
    }
  });

})();
