/**
 * KVSOVANREACH Time Since Calculator Tool
 * Calculate how much time has passed since or until a specific date
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    updateInterval: null,
    lastSinceError: false,
    lastUntilError: false
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.time-tab');
    elements.panels = document.querySelectorAll('.time-panel');

    // Header actions
    elements.resetBtn = document.getElementById('resetBtn');

    // Since - Fast datetime
    elements.sinceDatetime = document.getElementById('sinceDatetime');
    elements.sinceClearBtn = document.getElementById('sinceClearBtn');
    elements.sinceYears = document.getElementById('sinceYears');
    elements.sinceMonths = document.getElementById('sinceMonths');
    elements.sinceDays = document.getElementById('sinceDays');
    elements.sinceHours = document.getElementById('sinceHours');
    elements.sinceMinutes = document.getElementById('sinceMinutes');
    elements.sinceSeconds = document.getElementById('sinceSeconds');
    elements.sinceTotalDays = document.getElementById('sinceTotalDays');
    elements.sinceTotalHours = document.getElementById('sinceTotalHours');
    elements.sinceTotalMinutes = document.getElementById('sinceTotalMinutes');
    elements.sinceTotalSeconds = document.getElementById('sinceTotalSeconds');

    // Until - Fast datetime
    elements.untilDatetime = document.getElementById('untilDatetime');
    elements.untilClearBtn = document.getElementById('untilClearBtn');
    elements.untilYears = document.getElementById('untilYears');
    elements.untilMonths = document.getElementById('untilMonths');
    elements.untilDays = document.getElementById('untilDays');
    elements.untilHours = document.getElementById('untilHours');
    elements.untilMinutes = document.getElementById('untilMinutes');
    elements.untilSeconds = document.getElementById('untilSeconds');
    elements.untilTotalDays = document.getElementById('untilTotalDays');
    elements.untilTotalHours = document.getElementById('untilTotalHours');
    elements.untilTotalMinutes = document.getElementById('untilTotalMinutes');
    elements.untilTotalSeconds = document.getElementById('untilTotalSeconds');

    // Presets
    elements.birthdayDatetime = document.getElementById('birthdayDatetime');
    elements.birthdayResult = document.getElementById('birthdayResult');
    elements.newyearResult = document.getElementById('newyearResult');
    elements.customEventName = document.getElementById('customEventName');
    elements.customEventDatetime = document.getElementById('customEventDatetime');
    elements.customResult = document.getElementById('customResult');
    elements.millenniumResult = document.getElementById('millenniumResult');
  }

  // ==================== Fast Datetime Helpers ====================
  function getDatetimeFromContainer(container) {
    if (!container) return null;

    const year = container.querySelector('.dt-year')?.value;
    const month = container.querySelector('.dt-month')?.value;
    const day = container.querySelector('.dt-day')?.value;
    const hour = container.querySelector('.dt-hour')?.value || '0';
    const minute = container.querySelector('.dt-minute')?.value || '0';

    if (!year || !month || !day) return null;

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = parseInt(hour, 10) || 0;
    const min = parseInt(minute, 10) || 0;

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
      return null;
    }

    return new Date(y, m - 1, d, h, min, 0);
  }

  function setDatetimeToContainer(container, date) {
    if (!container || !date) return;

    const pad = (n) => String(n).padStart(2, '0');

    const yearInput = container.querySelector('.dt-year');
    const monthInput = container.querySelector('.dt-month');
    const dayInput = container.querySelector('.dt-day');
    const hourInput = container.querySelector('.dt-hour');
    const minuteInput = container.querySelector('.dt-minute');

    if (yearInput) yearInput.value = date.getFullYear();
    if (monthInput) monthInput.value = pad(date.getMonth() + 1);
    if (dayInput) dayInput.value = pad(date.getDate());
    if (hourInput) hourInput.value = pad(date.getHours());
    if (minuteInput) minuteInput.value = pad(date.getMinutes());
  }

  function clearDatetimeContainer(container) {
    if (!container) return;

    container.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  }

  function getDateFromContainer(container) {
    if (!container) return null;

    const year = container.querySelector('.dt-year')?.value;
    const month = container.querySelector('.dt-month')?.value;
    const day = container.querySelector('.dt-day')?.value;

    if (!year || !month || !day) return null;

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
      return null;
    }

    return new Date(y, m - 1, d);
  }

  function setDateToContainer(container, date) {
    if (!container || !date) return;

    const pad = (n) => String(n).padStart(2, '0');

    const yearInput = container.querySelector('.dt-year');
    const monthInput = container.querySelector('.dt-month');
    const dayInput = container.querySelector('.dt-day');

    if (yearInput) yearInput.value = date.getFullYear();
    if (monthInput) monthInput.value = pad(date.getMonth() + 1);
    if (dayInput) dayInput.value = pad(date.getDate());
  }

  function setupFastDatetimeInput(container, onUpdate) {
    if (!container) return;

    const inputs = container.querySelectorAll('input');

    inputs.forEach(input => {
      // Only allow numbers
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');

        // Auto-jump to next field when maxlength reached
        const maxLen = parseInt(input.getAttribute('maxlength'));
        if (e.target.value.length >= maxLen) {
          const nextId = input.dataset.next;
          if (nextId) {
            const nextInput = document.getElementById(nextId);
            if (nextInput) {
              nextInput.focus();
              nextInput.select();
            }
          }
        }

        onUpdate();
      });

      // Select all on focus
      input.addEventListener('focus', () => {
        setTimeout(() => input.select(), 0);
      });

      // Handle backspace to go to previous field
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '') {
          const allInputs = Array.from(inputs);
          const idx = allInputs.indexOf(input);
          if (idx > 0) {
            allInputs[idx - 1].focus();
          }
        }
      });
    });
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}Panel`);
    });
  }

  // ==================== Calculate Time Difference ====================
  function calculateTimeDiff(startDate, endDate) {
    const diff = endDate - startDate;
    const absDiff = Math.abs(diff);
    const isPast = diff > 0;

    const totalSeconds = Math.floor(absDiff / 1000);
    const totalMinutes = Math.floor(absDiff / (1000 * 60));
    const totalHours = Math.floor(absDiff / (1000 * 60 * 60));
    const totalDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    // Calculate breakdown
    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const start = isPast ? startDate : endDate;
    const end = isPast ? endDate : startDate;

    // Calculate years
    years = end.getFullYear() - start.getFullYear();

    // Calculate months
    months = end.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate days
    days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
      // Get days in previous month
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    // Calculate time components
    hours = end.getHours() - start.getHours();
    minutes = end.getMinutes() - start.getMinutes();
    seconds = end.getSeconds() - start.getSeconds();

    // Adjust for negative values
    if (seconds < 0) {
      minutes--;
      seconds += 60;
    }
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
      if (days < 0) {
        months--;
        if (months < 0) {
          years--;
          months += 12;
        }
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
      }
    }

    return {
      years: Math.abs(years),
      months: Math.abs(months),
      days: Math.abs(days),
      hours: Math.abs(hours),
      minutes: Math.abs(minutes),
      seconds: Math.abs(seconds),
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      isPast
    };
  }

  // ==================== Format Number ====================
  function formatNumber(num) {
    return num.toLocaleString();
  }

  // ==================== Update Since Display ====================
  function updateSince(showErrors = false) {
    const selectedDate = getDatetimeFromContainer(elements.sinceDatetime);

    if (!selectedDate) {
      state.lastSinceError = false;
      if (elements.sinceYears) elements.sinceYears.textContent = '0';
      if (elements.sinceMonths) elements.sinceMonths.textContent = '0';
      if (elements.sinceDays) elements.sinceDays.textContent = '0';
      if (elements.sinceHours) elements.sinceHours.textContent = '0';
      if (elements.sinceMinutes) elements.sinceMinutes.textContent = '0';
      if (elements.sinceSeconds) elements.sinceSeconds.textContent = '0';
      if (elements.sinceTotalDays) elements.sinceTotalDays.textContent = '0';
      if (elements.sinceTotalHours) elements.sinceTotalHours.textContent = '0';
      if (elements.sinceTotalMinutes) elements.sinceTotalMinutes.textContent = '0';
      if (elements.sinceTotalSeconds) elements.sinceTotalSeconds.textContent = '0';
      return;
    }

    const now = new Date();

    if (selectedDate > now) {
      if (showErrors && !state.lastSinceError) {
        ToolsCommon.showToast('Please select a past date', 'error');
      }
      state.lastSinceError = true;
      return;
    }

    state.lastSinceError = false;
    const diff = calculateTimeDiff(selectedDate, now);

    if (elements.sinceYears) elements.sinceYears.textContent = diff.years;
    if (elements.sinceMonths) elements.sinceMonths.textContent = diff.months;
    if (elements.sinceDays) elements.sinceDays.textContent = diff.days;
    if (elements.sinceHours) elements.sinceHours.textContent = diff.hours;
    if (elements.sinceMinutes) elements.sinceMinutes.textContent = diff.minutes;
    if (elements.sinceSeconds) elements.sinceSeconds.textContent = diff.seconds;
    if (elements.sinceTotalDays) elements.sinceTotalDays.textContent = formatNumber(diff.totalDays);
    if (elements.sinceTotalHours) elements.sinceTotalHours.textContent = formatNumber(diff.totalHours);
    if (elements.sinceTotalMinutes) elements.sinceTotalMinutes.textContent = formatNumber(diff.totalMinutes);
    if (elements.sinceTotalSeconds) elements.sinceTotalSeconds.textContent = formatNumber(diff.totalSeconds);
  }

  // ==================== Update Until Display ====================
  function updateUntil(showErrors = false) {
    const selectedDate = getDatetimeFromContainer(elements.untilDatetime);

    if (!selectedDate) {
      state.lastUntilError = false;
      if (elements.untilYears) elements.untilYears.textContent = '0';
      if (elements.untilMonths) elements.untilMonths.textContent = '0';
      if (elements.untilDays) elements.untilDays.textContent = '0';
      if (elements.untilHours) elements.untilHours.textContent = '0';
      if (elements.untilMinutes) elements.untilMinutes.textContent = '0';
      if (elements.untilSeconds) elements.untilSeconds.textContent = '0';
      if (elements.untilTotalDays) elements.untilTotalDays.textContent = '0';
      if (elements.untilTotalHours) elements.untilTotalHours.textContent = '0';
      if (elements.untilTotalMinutes) elements.untilTotalMinutes.textContent = '0';
      if (elements.untilTotalSeconds) elements.untilTotalSeconds.textContent = '0';
      return;
    }

    const now = new Date();

    if (selectedDate < now) {
      if (showErrors && !state.lastUntilError) {
        ToolsCommon.showToast('Please select a future date', 'error');
      }
      state.lastUntilError = true;
      return;
    }

    state.lastUntilError = false;
    const diff = calculateTimeDiff(now, selectedDate);

    if (elements.untilYears) elements.untilYears.textContent = diff.years;
    if (elements.untilMonths) elements.untilMonths.textContent = diff.months;
    if (elements.untilDays) elements.untilDays.textContent = diff.days;
    if (elements.untilHours) elements.untilHours.textContent = diff.hours;
    if (elements.untilMinutes) elements.untilMinutes.textContent = diff.minutes;
    if (elements.untilSeconds) elements.untilSeconds.textContent = diff.seconds;
    if (elements.untilTotalDays) elements.untilTotalDays.textContent = formatNumber(diff.totalDays);
    if (elements.untilTotalHours) elements.untilTotalHours.textContent = formatNumber(diff.totalHours);
    if (elements.untilTotalMinutes) elements.untilTotalMinutes.textContent = formatNumber(diff.totalMinutes);
    if (elements.untilTotalSeconds) elements.untilTotalSeconds.textContent = formatNumber(diff.totalSeconds);
  }

  // ==================== Update Presets ====================
  function updatePresets() {
    const now = new Date();

    // Birthday
    const birthday = getDateFromContainer(elements.birthdayDatetime);
    if (birthday) {
      const diff = calculateTimeDiff(birthday, now);
      const age = diff.years;

      // Next birthday
      const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));

      if (elements.birthdayResult) {
        elements.birthdayResult.innerHTML = `
          <strong>${age} years old</strong>
          ${daysUntilBirthday} days until next birthday
        `;
      }
    }

    // New Year
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);
    const daysUntilNewYear = Math.ceil((nextNewYear - now) / (1000 * 60 * 60 * 24));
    const hoursUntilNewYear = Math.ceil((nextNewYear - now) / (1000 * 60 * 60));
    if (elements.newyearResult) {
      elements.newyearResult.innerHTML = `
        <strong>${daysUntilNewYear} days</strong>
        ${hoursUntilNewYear.toLocaleString()} hours until ${nextNewYear.getFullYear()}
      `;
    }

    // Custom event
    const customDate = getDatetimeFromContainer(elements.customEventDatetime);
    if (customDate) {
      const diff = calculateTimeDiff(now, customDate);
      const eventName = elements.customEventName?.value || 'Event';

      if (elements.customResult) {
        if (customDate > now) {
          elements.customResult.innerHTML = `
            <strong>${diff.totalDays} days</strong>
            until ${eventName}
          `;
        } else {
          const pastDiff = calculateTimeDiff(customDate, now);
          elements.customResult.innerHTML = `
            <strong>${pastDiff.totalDays} days</strong>
            since ${eventName}
          `;
        }
      }
    }

    // Millennium (Y2K)
    const y2k = new Date(2000, 0, 1);
    const y2kDiff = calculateTimeDiff(y2k, now);
    if (elements.millenniumResult) {
      elements.millenniumResult.innerHTML = `
        <strong>${y2kDiff.years} years</strong>
        ${y2kDiff.totalDays.toLocaleString()} days since Y2K
      `;
    }
  }

  // ==================== Set Quick Date ====================
  function setQuickDate(container, days, isFuture = false) {
    if (!container) return;

    const date = new Date();
    if (isFuture) {
      date.setDate(date.getDate() + days);
    } else {
      date.setDate(date.getDate() - days);
    }

    setDatetimeToContainer(container, date);

    if (isFuture) {
      updateUntil(true);
    } else {
      updateSince(true);
    }
  }

  // ==================== Update All ====================
  function updateAll() {
    updateSince();
    updateUntil();
    updatePresets();
  }

  // ==================== Initialize Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Setup fast datetime inputs with auto-jump
    setupFastDatetimeInput(elements.sinceDatetime, () => updateSince(true));
    setupFastDatetimeInput(elements.untilDatetime, () => updateUntil(true));

    // Clear buttons
    elements.sinceClearBtn?.addEventListener('click', () => {
      clearDatetimeContainer(elements.sinceDatetime);
      state.lastSinceError = false;
      updateSince(false);
    });

    elements.untilClearBtn?.addEventListener('click', () => {
      clearDatetimeContainer(elements.untilDatetime);
      state.lastUntilError = false;
      updateUntil(false);
    });

    // Reset button
    elements.resetBtn?.addEventListener('click', resetForm);

    // Quick presets for Since
    document.querySelectorAll('#sincePanel .quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days);
        setQuickDate(elements.sinceDatetime, days, false);
      });
    });

    // Quick presets for Until
    document.querySelectorAll('#untilPanel .quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.future);
        setQuickDate(elements.untilDatetime, days, true);
      });
    });

    // Preset inputs - fast datetime
    setupFastDatetimeInput(elements.birthdayDatetime, () => {
      updatePresets();
      saveBirthday();
    });
    setupFastDatetimeInput(elements.customEventDatetime, updatePresets);
    elements.customEventName?.addEventListener('input', updatePresets);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ==================== Keyboard Handler ====================
  function handleKeyboard(e) {
    const isTyping = document.activeElement.tagName === 'INPUT' ||
                     document.activeElement.tagName === 'TEXTAREA';

    if (isTyping) return;

    switch (e.key.toLowerCase()) {
      case '1':
        switchTab('since');
        break;
      case '2':
        switchTab('until');
        break;
      case '3':
        switchTab('presets');
        break;
      case 'r':
        e.preventDefault();
        resetForm();
        break;
    }
  }

  // ==================== Reset Form ====================
  function resetForm() {
    // Clear since inputs
    clearDatetimeContainer(elements.sinceDatetime);
    state.lastSinceError = false;

    // Clear until inputs
    clearDatetimeContainer(elements.untilDatetime);
    state.lastUntilError = false;

    // Clear custom event (but keep birthday saved)
    if (elements.customEventName) elements.customEventName.value = '';
    clearDatetimeContainer(elements.customEventDatetime);
    if (elements.customResult) elements.customResult.textContent = 'Set your event';

    // Update displays
    updateSince(false);
    updateUntil(false);

    ToolsCommon.showToast('Form reset', 'success');
  }

  // ==================== Initialize ====================
  function init() {
    initElements();

    // Load saved birthday
    const savedBirthday = localStorage.getItem('timesince_birthday');
    if (savedBirthday && elements.birthdayDatetime) {
      try {
        const date = new Date(savedBirthday);
        if (!isNaN(date.getTime())) {
          setDateToContainer(elements.birthdayDatetime, date);
        }
      } catch (e) {
        // Invalid date, ignore
      }
    }

    initEventListeners();
    updateAll();

    // Start live updates
    state.updateInterval = setInterval(updateAll, 1000);
  }

  // ==================== Save Birthday ====================
  function saveBirthday() {
    const birthday = getDateFromContainer(elements.birthdayDatetime);
    if (birthday) {
      localStorage.setItem('timesince_birthday', birthday.toISOString());
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
