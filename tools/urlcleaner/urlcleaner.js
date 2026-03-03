/**
 * KVSOVANREACH URL Cleaner Tool
 * Remove tracking parameters from URLs
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    urlInput: document.getElementById('urlInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    copyBtn: document.getElementById('copyBtn'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    clearBtn: document.getElementById('clearBtn'),
    resultSection: document.getElementById('resultSection'),
    cleanedUrl: document.getElementById('cleanedUrl'),
    removedSection: document.getElementById('removedSection'),
    removedList: document.getElementById('removedList'),
    keptSection: document.getElementById('keptSection'),
    keptList: document.getElementById('keptList'),
    filtersGrid: document.getElementById('filtersGrid'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    deselectAllBtn: document.getElementById('deselectAllBtn'),
    // Status elements
    removedCount: document.getElementById('removedCount'),
    keptCount: document.getElementById('keptCount'),
    savedBytes: document.getElementById('savedBytes'),
    activeFilters: document.getElementById('activeFilters'),
    // Preview
    previewCard: document.getElementById('previewCard'),
    previewUrl: document.getElementById('previewUrl'),
    // Panels
    cleanerPanel: document.getElementById('cleanerPanel'),
    filtersPanel: document.getElementById('filtersPanel'),
    examplesPanel: document.getElementById('examplesPanel')
  };

  // ==================== Tracking Parameters ====================
  const TRACKING_PARAMS = [
    { key: 'utm_source', label: 'UTM Source', enabled: true },
    { key: 'utm_medium', label: 'UTM Medium', enabled: true },
    { key: 'utm_campaign', label: 'UTM Campaign', enabled: true },
    { key: 'utm_term', label: 'UTM Term', enabled: true },
    { key: 'utm_content', label: 'UTM Content', enabled: true },
    { key: 'fbclid', label: 'Facebook Click ID', enabled: true },
    { key: 'gclid', label: 'Google Click ID', enabled: true },
    { key: 'gclsrc', label: 'Google Click Source', enabled: true },
    { key: 'dclid', label: 'DoubleClick ID', enabled: true },
    { key: 'msclkid', label: 'Microsoft Click ID', enabled: true },
    { key: 'ref', label: 'Referrer', enabled: true },
    { key: 'ref_', label: 'Referrer (Amazon)', enabled: true },
    { key: 'mc_eid', label: 'Mailchimp Email ID', enabled: true },
    { key: 'mc_cid', label: 'Mailchimp Campaign ID', enabled: true },
    { key: '_ga', label: 'Google Analytics', enabled: true },
    { key: '_gl', label: 'Google Linker', enabled: true },
    { key: 'yclid', label: 'Yandex Click ID', enabled: true },
    { key: 'igshid', label: 'Instagram Share ID', enabled: true },
    { key: 'twclid', label: 'Twitter Click ID', enabled: true }
  ];

  // ==================== State ====================
  const state = {
    activeTab: 'cleaner',
    filters: {},
    lastResult: null
  };

  // ==================== Tab Navigation ====================

  function switchTab(tabName) {
    state.activeTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tool-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panels
    document.querySelectorAll('.cleaner-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const panelMap = {
      'cleaner': elements.cleanerPanel,
      'filters': elements.filtersPanel,
      'examples': elements.examplesPanel
    };

    if (panelMap[tabName]) {
      panelMap[tabName].classList.add('active');
    }

    // Toggle full-width mode for examples tab
    const mainEl = document.querySelector('.cleaner-main');
    if (mainEl) {
      mainEl.classList.toggle('full-width', tabName === 'examples');
    }
  }

  // ==================== Core Functions ====================

  function getEnabledFilters() {
    return Object.keys(state.filters).filter(key => state.filters[key]);
  }

  function cleanUrl(urlString) {
    try {
      const url = new URL(urlString);
      const params = new URLSearchParams(url.search);
      const enabledFilters = getEnabledFilters();

      const removed = [];
      const kept = [];

      for (const [key, value] of [...params.entries()]) {
        let shouldRemove = false;

        for (const filter of enabledFilters) {
          if (key === filter || key.startsWith(filter)) {
            shouldRemove = true;
            break;
          }
        }

        if (shouldRemove) {
          removed.push({ key, value });
          params.delete(key);
        } else {
          kept.push({ key, value });
        }
      }

      url.search = params.toString();
      const cleanedUrl = url.toString();
      const originalLength = urlString.length;
      const cleanedLength = cleanedUrl.length;
      const bytesSaved = originalLength - cleanedLength;

      return { cleanedUrl, removed, kept, bytesSaved };
    } catch (e) {
      return null;
    }
  }

  // ==================== UI Functions ====================

  function createFiltersUI() {
    elements.filtersGrid.innerHTML = TRACKING_PARAMS.map(param => {
      state.filters[param.key] = param.enabled;

      return `
        <div class="filter-item">
          <input type="checkbox" id="filter_${param.key}" ${param.enabled ? 'checked' : ''}>
          <label for="filter_${param.key}">
            <code>${param.key}</code>
          </label>
        </div>
      `;
    }).join('');

    TRACKING_PARAMS.forEach(param => {
      const checkbox = document.getElementById(`filter_${param.key}`);
      checkbox.addEventListener('change', (e) => {
        state.filters[param.key] = e.target.checked;
        updateActiveFiltersCount();
        processUrl();
      });
    });

    updateActiveFiltersCount();
  }

  function updateActiveFiltersCount() {
    const count = getEnabledFilters().length;
    elements.activeFilters.textContent = count;
  }

  function updateStatus(removed, kept, bytesSaved) {
    elements.removedCount.textContent = removed;
    elements.keptCount.textContent = kept;
    elements.savedBytes.textContent = bytesSaved;
  }

  function updatePreview(url) {
    if (url) {
      elements.previewUrl.textContent = url;
      elements.previewCard.classList.add('has-url');
    } else {
      elements.previewUrl.textContent = 'Paste a URL to clean';
      elements.previewCard.classList.remove('has-url');
    }
  }

  function processUrl() {
    const url = elements.urlInput.value.trim();

    if (!url) {
      elements.resultSection.classList.add('hidden');
      elements.removedSection.classList.add('hidden');
      elements.keptSection.classList.add('hidden');
      updateStatus(0, 0, 0);
      updatePreview(null);
      state.lastResult = null;
      return;
    }

    const result = cleanUrl(url);

    if (!result) {
      ToolsCommon.Toast.show('Invalid URL', 'error');
      return;
    }

    state.lastResult = result;

    // Update cleaned URL display
    elements.cleanedUrl.textContent = result.cleanedUrl;
    elements.resultSection.classList.remove('hidden');

    // Update status
    updateStatus(result.removed.length, result.kept.length, result.bytesSaved);
    updatePreview(result.cleanedUrl);

    // Show removed parameters
    if (result.removed.length > 0) {
      elements.removedList.innerHTML = result.removed.map(p =>
        `<span class="param-tag removed">${p.key}=${truncate(p.value, 30)}</span>`
      ).join('');
      elements.removedSection.classList.remove('hidden');
    } else {
      elements.removedSection.classList.add('hidden');
    }

    // Show kept parameters
    if (result.kept.length > 0) {
      elements.keptList.innerHTML = result.kept.map(p =>
        `<span class="param-tag kept">${p.key}=${truncate(p.value, 30)}</span>`
      ).join('');
      elements.keptSection.classList.remove('hidden');
    } else {
      elements.keptSection.classList.add('hidden');
    }
  }

  function truncate(str, len) {
    if (str.length <= len) return str;
    return str.substring(0, len) + '...';
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.urlInput.value = text;
      processUrl();
      switchTab('cleaner');
    } catch (e) {
      ToolsCommon.Toast.show('Unable to paste from clipboard', 'error');
    }
  }

  function copyCleanedUrl() {
    const cleaned = state.lastResult?.cleanedUrl || elements.cleanedUrl.textContent;
    if (cleaned && cleaned !== 'Paste a URL to clean') {
      ToolsCommon.Clipboard.copy(cleaned);
    } else {
      ToolsCommon.Toast.show('No cleaned URL to copy', 'error');
    }
  }

  function clearAll() {
    elements.urlInput.value = '';
    elements.resultSection.classList.add('hidden');
    elements.removedSection.classList.add('hidden');
    elements.keptSection.classList.add('hidden');
    updateStatus(0, 0, 0);
    updatePreview(null);
    state.lastResult = null;
    elements.urlInput.focus();
  }

  function selectAllFilters() {
    TRACKING_PARAMS.forEach(param => {
      state.filters[param.key] = true;
      const checkbox = document.getElementById(`filter_${param.key}`);
      if (checkbox) checkbox.checked = true;
    });
    updateActiveFiltersCount();
    processUrl();
  }

  function deselectAllFilters() {
    TRACKING_PARAMS.forEach(param => {
      state.filters[param.key] = false;
      const checkbox = document.getElementById(`filter_${param.key}`);
      if (checkbox) checkbox.checked = false;
    });
    updateActiveFiltersCount();
    processUrl();
  }

  function loadExample(url) {
    elements.urlInput.value = url;
    processUrl();
    switchTab('cleaner');
    ToolsCommon.Toast.show('Example loaded', 'success');
  }

  // ==================== Keyboard Shortcuts ====================

  function handleKeyboard(e) {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'v':
        e.preventDefault();
        pasteFromClipboard();
        break;
      case 'c':
        e.preventDefault();
        copyCleanedUrl();
        break;
      case 'r':
        e.preventDefault();
        clearAll();
        break;
      case '1':
        e.preventDefault();
        switchTab('cleaner');
        break;
      case '2':
        e.preventDefault();
        switchTab('filters');
        break;
      case '3':
        e.preventDefault();
        switchTab('examples');
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Create filters UI
    createFiltersUI();

    // Tab navigation
    document.querySelectorAll('.tool-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Event listeners
    elements.urlInput.addEventListener('input', processUrl);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.copyBtn.addEventListener('click', copyCleanedUrl);
    elements.copyResultBtn.addEventListener('click', copyCleanedUrl);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.selectAllBtn.addEventListener('click', selectAllFilters);
    elements.deselectAllBtn.addEventListener('click', deselectAllFilters);

    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        if (url) loadExample(url);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Focus input
    elements.urlInput.focus();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
