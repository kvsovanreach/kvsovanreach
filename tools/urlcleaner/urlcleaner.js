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
    clearBtn: document.getElementById('clearBtn'),
    resultSection: document.getElementById('resultSection'),
    cleanedUrl: document.getElementById('cleanedUrl'),
    removedSection: document.getElementById('removedSection'),
    removedList: document.getElementById('removedList'),
    keptSection: document.getElementById('keptSection'),
    keptList: document.getElementById('keptList'),
    filtersGrid: document.getElementById('filtersGrid')
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
    filters: {}
  };

  // ==================== Core Functions ====================

  /**
   * Get enabled filter keys
   */
  function getEnabledFilters() {
    return Object.keys(state.filters).filter(key => state.filters[key]);
  }

  /**
   * Clean URL by removing tracking parameters
   */
  function cleanUrl(urlString) {
    try {
      const url = new URL(urlString);
      const params = new URLSearchParams(url.search);
      const enabledFilters = getEnabledFilters();

      const removed = [];
      const kept = [];

      // Check each parameter
      for (const [key, value] of [...params.entries()]) {
        let shouldRemove = false;

        // Check against enabled filters
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

      // Reconstruct URL
      url.search = params.toString();
      const cleanedUrl = url.toString();

      return { cleanedUrl, removed, kept };
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

    // Add event listeners
    TRACKING_PARAMS.forEach(param => {
      const checkbox = document.getElementById(`filter_${param.key}`);
      checkbox.addEventListener('change', (e) => {
        state.filters[param.key] = e.target.checked;
        processUrl();
      });
    });
  }

  function processUrl() {
    const url = elements.urlInput.value.trim();

    if (!url) {
      elements.resultSection.classList.add('hidden');
      elements.removedSection.classList.add('hidden');
      elements.keptSection.classList.add('hidden');
      return;
    }

    const result = cleanUrl(url);

    if (!result) {
      ToolsCommon.Toast.show('Invalid URL', 'error');
      return;
    }

    // Show cleaned URL
    elements.cleanedUrl.textContent = result.cleanedUrl;
    elements.resultSection.classList.remove('hidden');

    // Show removed parameters
    if (result.removed.length > 0) {
      elements.removedList.innerHTML = result.removed.map(p =>
        `<span class="param-tag removed">${p.key}=${p.value}</span>`
      ).join('');
      elements.removedSection.classList.remove('hidden');
    } else {
      elements.removedSection.classList.add('hidden');
    }

    // Show kept parameters
    if (result.kept.length > 0) {
      elements.keptList.innerHTML = result.kept.map(p =>
        `<span class="param-tag kept">${p.key}=${p.value}</span>`
      ).join('');
      elements.keptSection.classList.remove('hidden');
    } else {
      elements.keptSection.classList.add('hidden');
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.urlInput.value = text;
      processUrl();
    } catch (e) {
      ToolsCommon.Toast.show('Unable to paste from clipboard', 'error');
    }
  }

  function copyCleanedUrl() {
    const cleaned = elements.cleanedUrl.textContent;
    if (cleaned) {
      ToolsCommon.Clipboard.copy(cleaned);
    }
  }

  function clearAll() {
    elements.urlInput.value = '';
    elements.resultSection.classList.add('hidden');
    elements.removedSection.classList.add('hidden');
    elements.keptSection.classList.add('hidden');
    elements.urlInput.focus();
  }

  // ==================== Initialization ====================

  function init() {
    // Create filters UI
    createFiltersUI();

    // Event listeners
    elements.urlInput.addEventListener('input', processUrl);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.copyBtn.addEventListener('click', copyCleanedUrl);
    elements.clearBtn.addEventListener('click', clearAll);

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
