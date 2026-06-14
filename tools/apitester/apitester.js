/**
 * API Tester — apitester.js
 * Simple HTTP request tester (mini Postman)
 */
(function () {
  'use strict';

  // ==================== DOM References ====================
  const DOM = {
    methodSelect: document.getElementById('methodSelect'),
    urlInput: document.getElementById('urlInput'),
    sendBtn: document.getElementById('sendBtn'),
    sendIcon: document.getElementById('sendIcon'),
    sendSpinner: document.getElementById('sendSpinner'),
    presetsBtn: document.getElementById('presetsBtn'),
    presetsDropdown: document.getElementById('presetsDropdown'),
    clearBtn: document.getElementById('clearBtn'),

    // Config tabs
    configTabs: document.querySelectorAll('.tool-tab[data-config]'),
    configHeaders: document.getElementById('configHeaders'),
    configBody: document.getElementById('configBody'),
    configParams: document.getElementById('configParams'),

    // Headers
    headersTable: document.getElementById('headersTable'),
    addHeaderBtn: document.getElementById('addHeaderBtn'),

    // Body
    bodyInput: document.getElementById('bodyInput'),
    bodyNotice: document.getElementById('bodyNotice'),
    bodyNoticeMethod: document.getElementById('bodyNoticeMethod'),

    // Params
    paramsTable: document.getElementById('paramsTable'),
    addParamBtn: document.getElementById('addParamBtn'),

    // Response
    responseSection: document.getElementById('responseSection'),
    statusBadge: document.getElementById('statusBadge'),
    responseTime: document.getElementById('responseTime'),
    copyResponseBtn: document.getElementById('copyResponseBtn'),

    // Response tabs
    responseTabs: document.querySelectorAll('.panel-tab[data-response]'),
    responsePretty: document.getElementById('responsePretty'),
    responseRaw: document.getElementById('responseRaw'),
    responseHeaders: document.getElementById('responseHeaders'),
    prettyBody: document.getElementById('prettyBody'),
    rawBody: document.getElementById('rawBody'),
    responseHeadersList: document.getElementById('responseHeadersList'),
    responseEmpty: document.getElementById('responseEmpty'),
    responseError: document.getElementById('responseError'),
    errorMessage: document.getElementById('errorMessage'),

    // History
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  };

  // ==================== State ====================
  let history = [];
  let lastResponseBody = '';
  const MAX_HISTORY = 10;
  const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

  // ==================== Init ====================
  function init() {
    loadHistory();
    bindEvents();
    updateMethodColor();
    updateBodyNotice();
  }

  // ==================== Event Binding ====================
  function bindEvents() {
    // Send
    DOM.sendBtn.addEventListener('click', sendRequest);
    DOM.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendRequest();
    });

    // Method change
    DOM.methodSelect.addEventListener('change', () => {
      updateMethodColor();
      updateBodyNotice();
    });

    // Presets
    DOM.presetsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.presetsDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!DOM.presetsDropdown.contains(e.target) && e.target !== DOM.presetsBtn) {
        DOM.presetsDropdown.classList.add('hidden');
      }
    });

    DOM.presetsDropdown.querySelectorAll('.preset-item').forEach((item) => {
      item.addEventListener('click', () => {
        DOM.methodSelect.value = item.dataset.method;
        DOM.urlInput.value = item.dataset.url;
        if (item.dataset.body) {
          DOM.bodyInput.value = item.dataset.body;
        }
        updateMethodColor();
        updateBodyNotice();
        DOM.presetsDropdown.classList.add('hidden');
        ToolsCommon.showToast('Preset loaded', 'info');
      });
    });

    // Clear
    DOM.clearBtn.addEventListener('click', clearAll);

    // Config tabs
    DOM.configTabs.forEach((tab) => {
      tab.addEventListener('click', () => switchConfigTab(tab.dataset.config));
    });

    // Add rows
    DOM.addHeaderBtn.addEventListener('click', () => addKvRow(DOM.headersTable));
    DOM.addParamBtn.addEventListener('click', () => addKvRow(DOM.paramsTable));

    // Response tabs
    DOM.responseTabs.forEach((tab) => {
      tab.addEventListener('click', () => switchResponseTab(tab.dataset.response));
    });

    // Copy response
    DOM.copyResponseBtn.addEventListener('click', () => {
      if (lastResponseBody) {
        ToolsCommon.copyWithToast(lastResponseBody, 'Response copied!');
      }
    });

    // Clear history
    DOM.clearHistoryBtn.addEventListener('click', () => {
      history = [];
      saveHistory();
      renderHistory();
      ToolsCommon.showToast('History cleared', 'info');
    });

    // Keyboard shortcut: Ctrl+Enter to send
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendRequest();
      }
    });
  }

  // ==================== Method Color ====================
  function updateMethodColor() {
    const method = DOM.methodSelect.value.toLowerCase();
    DOM.methodSelect.className = 'method-select ' + method;
  }

  // ==================== Body Notice ====================
  function updateBodyNotice() {
    const method = DOM.methodSelect.value;
    if (!BODY_METHODS.includes(method)) {
      DOM.bodyNotice.classList.remove('hidden');
      DOM.bodyNoticeMethod.textContent = method;
    } else {
      DOM.bodyNotice.classList.add('hidden');
    }
  }

  // ==================== Tab Switching ====================
  function switchConfigTab(name) {
    DOM.configTabs.forEach((t) => t.classList.toggle('active', t.dataset.config === name));
    DOM.configHeaders.classList.toggle('active', name === 'headers');
    DOM.configBody.classList.toggle('active', name === 'body');
    DOM.configParams.classList.toggle('active', name === 'params');
  }

  function switchResponseTab(name) {
    DOM.responseTabs.forEach((t) => t.classList.toggle('active', t.dataset.response === name));
    DOM.responsePretty.classList.toggle('active', name === 'pretty');
    DOM.responseRaw.classList.toggle('active', name === 'raw');
    DOM.responseHeaders.classList.toggle('active', name === 'headers');
  }

  // ==================== Key-Value Rows ====================
  function addKvRow(table) {
    const row = document.createElement('div');
    row.className = 'kv-row';
    row.innerHTML = `
      <input type="text" class="kv-key" placeholder="${table === DOM.headersTable ? 'Header name' : 'Parameter name'}">
      <input type="text" class="kv-value" placeholder="${table === DOM.headersTable ? 'Header value' : 'Parameter value'}">
      <button type="button" class="kv-remove" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    `;
    table.appendChild(row);
    bindRemoveBtn(row);
    row.querySelector('.kv-key').focus();
  }

  function bindRemoveBtn(row) {
    row.querySelector('.kv-remove').addEventListener('click', () => {
      const table = row.parentElement;
      if (table.querySelectorAll('.kv-row').length > 1) {
        row.remove();
      } else {
        row.querySelector('.kv-key').value = '';
        row.querySelector('.kv-value').value = '';
      }
    });
  }

  // Bind existing remove buttons
  document.querySelectorAll('.kv-row').forEach(bindRemoveBtn);

  // ==================== Collect Key-Value Pairs ====================
  function collectKvPairs(table) {
    const pairs = {};
    table.querySelectorAll('.kv-row').forEach((row) => {
      const key = row.querySelector('.kv-key').value.trim();
      const value = row.querySelector('.kv-value').value.trim();
      if (key) pairs[key] = value;
    });
    return pairs;
  }

  // ==================== Build URL with Params ====================
  function buildUrl(baseUrl, params) {
    if (!Object.keys(params).length) return baseUrl;
    try {
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      return url.toString();
    } catch {
      // If URL parsing fails, append manually
      const qs = new URLSearchParams(params).toString();
      const sep = baseUrl.includes('?') ? '&' : '?';
      return baseUrl + sep + qs;
    }
  }

  // ==================== Send Request ====================
  async function sendRequest() {
    const method = DOM.methodSelect.value;
    let url = DOM.urlInput.value.trim();

    if (!url) {
      ToolsCommon.showToast('Please enter a URL', 'error');
      DOM.urlInput.focus();
      return;
    }

    // Auto-prepend https:// if no protocol
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
      DOM.urlInput.value = url;
    }

    // Collect params
    const params = collectKvPairs(DOM.paramsTable);
    const finalUrl = buildUrl(url, params);

    // Collect headers
    const headers = collectKvPairs(DOM.headersTable);

    // Build fetch options
    const options = { method, headers };

    if (BODY_METHODS.includes(method) && DOM.bodyInput.value.trim()) {
      options.body = DOM.bodyInput.value.trim();
    }

    // UI: loading state
    setLoading(true);
    showResponseEmpty(false);
    showResponseError(false);

    const startTime = performance.now();

    try {
      const response = await fetch(finalUrl, options);
      const elapsed = Math.round(performance.now() - startTime);

      // Read body
      let bodyText = '';
      if (method !== 'HEAD') {
        bodyText = await response.text();
      }

      lastResponseBody = bodyText;

      // Display response
      displayResponse(response, bodyText, elapsed);

      // Add to history
      addToHistory(method, url, response.status);
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      showResponseError(true, err.message || 'Request failed. This may be a CORS issue.');
      DOM.responseTime.textContent = elapsed + 'ms';
      lastResponseBody = '';

      // Add failed request to history
      addToHistory(method, url, 'ERR');
    } finally {
      setLoading(false);
    }
  }

  // ==================== Display Response ====================
  function displayResponse(response, bodyText, elapsed) {
    // Status badge
    const status = response.status;
    const statusClass = status < 300 ? 'status-2xx' : status < 400 ? 'status-3xx' : status < 500 ? 'status-4xx' : 'status-5xx';
    DOM.statusBadge.textContent = status + ' ' + response.statusText;
    DOM.statusBadge.className = 'status-badge visible ' + statusClass;

    // Response time
    DOM.responseTime.textContent = elapsed + 'ms';

    // Pretty body (try JSON formatting)
    try {
      const parsed = JSON.parse(bodyText);
      const formatted = JSON.stringify(parsed, null, 2);
      DOM.prettyBody.innerHTML = syntaxHighlight(formatted);
      lastResponseBody = formatted;
    } catch {
      DOM.prettyBody.textContent = bodyText;
    }

    // Raw body
    DOM.rawBody.textContent = bodyText;

    // Response headers
    let headersHtml = '';
    response.headers.forEach((value, name) => {
      headersHtml += `<div class="res-header-row">
        <span class="res-header-name">${escapeHtml(name)}</span>
        <span class="res-header-value">${escapeHtml(value)}</span>
      </div>`;
    });
    DOM.responseHeadersList.innerHTML = headersHtml || '<div class="res-header-row"><span class="res-header-value">No headers exposed (CORS restriction)</span></div>';

    // Show pretty tab by default
    switchResponseTab('pretty');
    showResponseEmpty(false);
    showResponseError(false);
  }

  // ==================== Syntax Highlighting ====================
  function syntaxHighlight(json) {
    return json.replace(
      /("(?:\\.|[^"\\])*")\s*:/g,
      '<span class="json-key">$1</span>:'
    ).replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span class="json-string">$1</span>'
    ).replace(
      /:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      ': <span class="json-number">$1</span>'
    ).replace(
      /:\s*(true|false)/g,
      ': <span class="json-boolean">$1</span>'
    ).replace(
      /:\s*(null)/g,
      ': <span class="json-null">$1</span>'
    );
  }

  // ==================== HTML Escape ====================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== UI Helpers ====================
  function setLoading(loading) {
    DOM.sendBtn.disabled = loading;
    DOM.sendIcon.classList.toggle('hidden', loading);
    DOM.sendSpinner.classList.toggle('hidden', !loading);
  }

  function showResponseEmpty(show) {
    DOM.responseEmpty.classList.toggle('hidden', !show);
    if (show) {
      DOM.responsePretty.classList.remove('active');
      DOM.responseRaw.classList.remove('active');
      DOM.responseHeaders.classList.remove('active');
    }
  }

  function showResponseError(show, message) {
    DOM.responseError.classList.toggle('hidden', !show);
    if (show) {
      DOM.errorMessage.textContent = message;
      DOM.responsePretty.classList.remove('active');
      DOM.responseRaw.classList.remove('active');
      DOM.responseHeaders.classList.remove('active');
      DOM.responseEmpty.classList.add('hidden');
    }
  }

  // ==================== Clear All ====================
  function clearAll() {
    DOM.urlInput.value = '';
    DOM.bodyInput.value = '';
    DOM.methodSelect.value = 'GET';
    updateMethodColor();
    updateBodyNotice();

    // Reset headers table
    DOM.headersTable.innerHTML = '';
    addKvRow(DOM.headersTable);
    const firstRow = DOM.headersTable.querySelector('.kv-row');
    firstRow.querySelector('.kv-key').value = 'Content-Type';
    firstRow.querySelector('.kv-value').value = 'application/json';

    // Reset params table
    DOM.paramsTable.innerHTML = '';
    addKvRow(DOM.paramsTable);

    // Reset response
    DOM.statusBadge.className = 'status-badge';
    DOM.statusBadge.textContent = '';
    DOM.responseTime.textContent = '';
    DOM.prettyBody.innerHTML = '';
    DOM.rawBody.textContent = '';
    DOM.responseHeadersList.innerHTML = '';
    lastResponseBody = '';
    showResponseEmpty(true);
    showResponseError(false);

    ToolsCommon.showToast('Cleared', 'info');
  }

  // ==================== History ====================
  function addToHistory(method, url, status) {
    history.unshift({ method, url, status, time: Date.now() });
    if (history.length > MAX_HISTORY) history.pop();
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!history.length) {
      DOM.historyList.innerHTML = '<div class="history-empty">No requests yet</div>';
      return;
    }

    DOM.historyList.innerHTML = history
      .map((item, i) => {
        const methodClass = item.method.toLowerCase();
        const statusClass = typeof item.status === 'number'
          ? (item.status < 300 ? 's2xx' : item.status < 500 ? 's4xx' : 's5xx')
          : '';
        return `<button type="button" class="history-item" data-index="${i}">
          <span class="history-method ${methodClass}">${item.method}</span>
          <span class="history-url">${escapeHtml(item.url)}</span>
          <span class="history-status ${statusClass}">${item.status}</span>
        </button>`;
      })
      .join('');

    // Bind click to reload
    DOM.historyList.querySelectorAll('.history-item').forEach((el) => {
      el.addEventListener('click', () => {
        const item = history[parseInt(el.dataset.index)];
        DOM.methodSelect.value = item.method;
        DOM.urlInput.value = item.url;
        updateMethodColor();
        updateBodyNotice();
        ToolsCommon.showToast('Request loaded from history', 'info');
      });
    });
  }

  function saveHistory() {
    try {
      localStorage.setItem('apitester-history', JSON.stringify(history));
    } catch { /* ignore */ }
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('apitester-history');
      if (saved) history = JSON.parse(saved);
    } catch { /* ignore */ }
    renderHistory();
  }

  // ==================== Start ====================
  init();
})();
