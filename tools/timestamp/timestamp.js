/**
 * Unix Timestamp Converter Tool
 * Convert timestamps to dates and dates to timestamps
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.timestamp-tab'),
    panels: document.querySelectorAll('.timestamp-panel'),
    // Current time
    liveClock: document.getElementById('liveClock'),
    liveDate: document.getElementById('liveDate'),
    currentSeconds: document.getElementById('currentSeconds'),
    currentMilliseconds: document.getElementById('currentMilliseconds'),
    currentISO: document.getElementById('currentISO'),
    currentUTC: document.getElementById('currentUTC'),
    // To date
    timestampInput: document.getElementById('timestampInput'),
    nowBtn: document.getElementById('nowBtn'),
    toDateBtn: document.getElementById('toDateBtn'),
    resultLocal: document.getElementById('resultLocal'),
    resultUTC: document.getElementById('resultUTC'),
    resultISO: document.getElementById('resultISO'),
    resultRelative: document.getElementById('resultRelative'),
    // To timestamp
    dateInput: document.getElementById('dateInput'),
    timeInput: document.getElementById('timeInput'),
    timezoneSelect: document.getElementById('timezoneSelect'),
    nowDateBtn: document.getElementById('nowDateBtn'),
    toTimestampBtn: document.getElementById('toTimestampBtn'),
    resultSeconds: document.getElementById('resultSeconds'),
    resultMs: document.getElementById('resultMs'),
    resultISOFromDate: document.getElementById('resultISOFromDate')
  };

  // ==================== Live Clock ====================
  function updateLiveClock() {
    const now = new Date();

    // Time display
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    elements.liveClock.textContent = `${hours}:${minutes}:${seconds}`;

    // Date display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.liveDate.textContent = now.toLocaleDateString('en-US', options);

    // Timestamps
    elements.currentSeconds.textContent = Math.floor(now.getTime() / 1000);
    elements.currentMilliseconds.textContent = now.getTime();
    elements.currentISO.textContent = now.toISOString();
    elements.currentUTC.textContent = now.toUTCString();
  }

  // ==================== Timestamp to Date ====================
  function convertToDate() {
    const input = elements.timestampInput.value.trim();

    if (!input) {
      ToolsCommon.showToast('Please enter a timestamp', 'error');
      return;
    }

    const timestamp = parseInt(input, 10);
    if (isNaN(timestamp)) {
      ToolsCommon.showToast('Invalid timestamp', 'error');
      return;
    }

    // Determine unit
    const unitRadios = document.querySelectorAll('input[name="timestampUnit"]');
    let unit = 'auto';
    unitRadios.forEach(radio => {
      if (radio.checked) unit = radio.value;
    });

    let ms;
    if (unit === 'auto') {
      // If timestamp is > 10^12, assume milliseconds
      ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
    } else if (unit === 'milliseconds') {
      ms = timestamp;
    } else {
      ms = timestamp * 1000;
    }

    const date = new Date(ms);

    if (isNaN(date.getTime())) {
      ToolsCommon.showToast('Invalid timestamp', 'error');
      return;
    }

    // Format results
    const localOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };

    elements.resultLocal.textContent = date.toLocaleString('en-US', localOptions);
    elements.resultUTC.textContent = date.toUTCString();
    elements.resultISO.textContent = date.toISOString();
    elements.resultRelative.textContent = getRelativeTime(date);

    ToolsCommon.showToast('Converted successfully', 'success');
  }

  // ==================== Date to Timestamp ====================
  function convertToTimestamp() {
    const dateStr = elements.dateInput.value;
    const timeStr = elements.timeInput.value || '00:00:00';
    const timezone = elements.timezoneSelect.value;

    if (!dateStr) {
      ToolsCommon.showToast('Please select a date', 'error');
      return;
    }

    let date;
    if (timezone === 'UTC') {
      date = new Date(`${dateStr}T${timeStr}Z`);
    } else {
      date = new Date(`${dateStr}T${timeStr}`);
    }

    if (isNaN(date.getTime())) {
      ToolsCommon.showToast('Invalid date', 'error');
      return;
    }

    const seconds = Math.floor(date.getTime() / 1000);
    const ms = date.getTime();

    elements.resultSeconds.textContent = seconds;
    elements.resultMs.textContent = ms;
    elements.resultISOFromDate.textContent = date.toISOString();

    ToolsCommon.showToast('Converted successfully', 'success');
  }

  // ==================== Relative Time ====================
  function getRelativeTime(date) {
    const now = new Date();
    const diffMs = date - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const isFuture = diffMs > 0;
    const abs = Math.abs;

    if (abs(diffSeconds) < 60) {
      return isFuture ? 'in a few seconds' : 'a few seconds ago';
    }
    if (abs(diffMinutes) < 60) {
      const m = abs(diffMinutes);
      return isFuture ? `in ${m} minute${m > 1 ? 's' : ''}` : `${m} minute${m > 1 ? 's' : ''} ago`;
    }
    if (abs(diffHours) < 24) {
      const h = abs(diffHours);
      return isFuture ? `in ${h} hour${h > 1 ? 's' : ''}` : `${h} hour${h > 1 ? 's' : ''} ago`;
    }
    if (abs(diffDays) < 30) {
      const d = abs(diffDays);
      return isFuture ? `in ${d} day${d > 1 ? 's' : ''}` : `${d} day${d > 1 ? 's' : ''} ago`;
    }
    if (abs(diffMonths) < 12) {
      const m = abs(diffMonths);
      return isFuture ? `in ${m} month${m > 1 ? 's' : ''}` : `${m} month${m > 1 ? 's' : ''} ago`;
    }

    const y = abs(diffYears);
    return isFuture ? `in ${y} year${y > 1 ? 's' : ''}` : `${y} year${y > 1 ? 's' : ''} ago`;
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
  }

  // ==================== Set Current Time ====================
  function setNowTimestamp() {
    elements.timestampInput.value = Math.floor(Date.now() / 1000);
    document.querySelector('input[name="timestampUnit"][value="seconds"]').checked = true;
  }

  function setNowDate() {
    const now = new Date();
    elements.dateInput.value = now.toISOString().split('T')[0];
    elements.timeInput.value = now.toTimeString().split(' ')[0];
    elements.timezoneSelect.value = 'local';
  }

  // ==================== Copy Functionality ====================
  function handleCopy(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const targetId = btn.dataset.copy;
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const text = targetElement.textContent;
      if (text && text !== '-') {
        ToolsCommon.copyWithToast(text, 'Copied!');
      } else {
        ToolsCommon.showToast('Nothing to copy', 'error');
      }
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // To date conversion
    elements.toDateBtn.addEventListener('click', convertToDate);
    elements.nowBtn.addEventListener('click', setNowTimestamp);
    elements.timestampInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') convertToDate();
    });

    // To timestamp conversion
    elements.toTimestampBtn.addEventListener('click', convertToTimestamp);
    elements.nowDateBtn.addEventListener('click', setNowDate);

    // Copy buttons
    document.addEventListener('click', handleCopy);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select')) {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          const activePanel = document.querySelector('.timestamp-panel.active');
          if (activePanel.id === 'todatePanel') {
            convertToDate();
          } else if (activePanel.id === 'totimestampPanel') {
            convertToTimestamp();
          }
        }
        return;
      }

      switch (e.key) {
        case '1':
          switchTab('current');
          break;
        case '2':
          switchTab('todate');
          break;
        case '3':
          switchTab('totimestamp');
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          const activePanel = document.querySelector('.timestamp-panel.active');
          if (activePanel.id === 'todatePanel') {
            setNowTimestamp();
          } else if (activePanel.id === 'totimestampPanel') {
            setNowDate();
          }
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Set initial date/time values
    setNowDate();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
