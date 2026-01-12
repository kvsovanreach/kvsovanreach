/**
 * Time Since Calculator Tool
 * Calculate how much time has passed since or until a specific date
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.time-tab'),
    panels: document.querySelectorAll('.time-panel'),
    // Since
    sinceDate: document.getElementById('sinceDate'),
    sinceClearBtn: document.getElementById('sinceClearBtn'),
    sinceYears: document.getElementById('sinceYears'),
    sinceMonths: document.getElementById('sinceMonths'),
    sinceDays: document.getElementById('sinceDays'),
    sinceHours: document.getElementById('sinceHours'),
    sinceMinutes: document.getElementById('sinceMinutes'),
    sinceSeconds: document.getElementById('sinceSeconds'),
    sinceTotalDays: document.getElementById('sinceTotalDays'),
    sinceTotalHours: document.getElementById('sinceTotalHours'),
    sinceTotalMinutes: document.getElementById('sinceTotalMinutes'),
    sinceTotalSeconds: document.getElementById('sinceTotalSeconds'),
    // Until
    untilDate: document.getElementById('untilDate'),
    untilClearBtn: document.getElementById('untilClearBtn'),
    untilYears: document.getElementById('untilYears'),
    untilMonths: document.getElementById('untilMonths'),
    untilDays: document.getElementById('untilDays'),
    untilHours: document.getElementById('untilHours'),
    untilMinutes: document.getElementById('untilMinutes'),
    untilSeconds: document.getElementById('untilSeconds'),
    untilTotalDays: document.getElementById('untilTotalDays'),
    untilTotalHours: document.getElementById('untilTotalHours'),
    untilTotalMinutes: document.getElementById('untilTotalMinutes'),
    untilTotalSeconds: document.getElementById('untilTotalSeconds'),
    // Presets
    birthdayDate: document.getElementById('birthdayDate'),
    birthdayResult: document.getElementById('birthdayResult'),
    newyearResult: document.getElementById('newyearResult'),
    customEventName: document.getElementById('customEventName'),
    customEventDate: document.getElementById('customEventDate'),
    customResult: document.getElementById('customResult'),
    millenniumResult: document.getElementById('millenniumResult')
  };

  // ==================== State ====================
  let updateInterval = null;
  let lastSinceError = false;
  let lastUntilError = false;

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
    if (!elements.sinceDate.value) {
      lastSinceError = false;
      elements.sinceYears.textContent = '0';
      elements.sinceMonths.textContent = '0';
      elements.sinceDays.textContent = '0';
      elements.sinceHours.textContent = '0';
      elements.sinceMinutes.textContent = '0';
      elements.sinceSeconds.textContent = '0';
      elements.sinceTotalDays.textContent = '0';
      elements.sinceTotalHours.textContent = '0';
      elements.sinceTotalMinutes.textContent = '0';
      elements.sinceTotalSeconds.textContent = '0';
      return;
    }

    const selectedDate = new Date(elements.sinceDate.value);
    const now = new Date();

    if (selectedDate > now) {
      // Only show error toast once, not on every interval update
      if (showErrors && !lastSinceError) {
        ToolsCommon.showToast('Please select a past date', 'error');
      }
      lastSinceError = true;
      return;
    }

    lastSinceError = false;
    const diff = calculateTimeDiff(selectedDate, now);

    elements.sinceYears.textContent = diff.years;
    elements.sinceMonths.textContent = diff.months;
    elements.sinceDays.textContent = diff.days;
    elements.sinceHours.textContent = diff.hours;
    elements.sinceMinutes.textContent = diff.minutes;
    elements.sinceSeconds.textContent = diff.seconds;
    elements.sinceTotalDays.textContent = formatNumber(diff.totalDays);
    elements.sinceTotalHours.textContent = formatNumber(diff.totalHours);
    elements.sinceTotalMinutes.textContent = formatNumber(diff.totalMinutes);
    elements.sinceTotalSeconds.textContent = formatNumber(diff.totalSeconds);
  }

  // ==================== Update Until Display ====================
  function updateUntil(showErrors = false) {
    if (!elements.untilDate.value) {
      lastUntilError = false;
      elements.untilYears.textContent = '0';
      elements.untilMonths.textContent = '0';
      elements.untilDays.textContent = '0';
      elements.untilHours.textContent = '0';
      elements.untilMinutes.textContent = '0';
      elements.untilSeconds.textContent = '0';
      elements.untilTotalDays.textContent = '0';
      elements.untilTotalHours.textContent = '0';
      elements.untilTotalMinutes.textContent = '0';
      elements.untilTotalSeconds.textContent = '0';
      return;
    }

    const selectedDate = new Date(elements.untilDate.value);
    const now = new Date();

    if (selectedDate < now) {
      // Only show error toast once, not on every interval update
      if (showErrors && !lastUntilError) {
        ToolsCommon.showToast('Please select a future date', 'error');
      }
      lastUntilError = true;
      return;
    }

    lastUntilError = false;
    const diff = calculateTimeDiff(now, selectedDate);

    elements.untilYears.textContent = diff.years;
    elements.untilMonths.textContent = diff.months;
    elements.untilDays.textContent = diff.days;
    elements.untilHours.textContent = diff.hours;
    elements.untilMinutes.textContent = diff.minutes;
    elements.untilSeconds.textContent = diff.seconds;
    elements.untilTotalDays.textContent = formatNumber(diff.totalDays);
    elements.untilTotalHours.textContent = formatNumber(diff.totalHours);
    elements.untilTotalMinutes.textContent = formatNumber(diff.totalMinutes);
    elements.untilTotalSeconds.textContent = formatNumber(diff.totalSeconds);
  }

  // ==================== Update Presets ====================
  function updatePresets() {
    const now = new Date();

    // Birthday
    if (elements.birthdayDate.value) {
      const birthday = new Date(elements.birthdayDate.value);
      const diff = calculateTimeDiff(birthday, now);
      const age = diff.years;

      // Next birthday
      const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));

      elements.birthdayResult.innerHTML = `
        <strong>${age} years old</strong>
        ${daysUntilBirthday} days until next birthday
      `;
    }

    // New Year
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);
    const daysUntilNewYear = Math.ceil((nextNewYear - now) / (1000 * 60 * 60 * 24));
    const hoursUntilNewYear = Math.ceil((nextNewYear - now) / (1000 * 60 * 60));
    elements.newyearResult.innerHTML = `
      <strong>${daysUntilNewYear} days</strong>
      ${hoursUntilNewYear.toLocaleString()} hours until ${nextNewYear.getFullYear()}
    `;

    // Custom event
    if (elements.customEventDate.value) {
      const customDate = new Date(elements.customEventDate.value);
      const diff = calculateTimeDiff(now, customDate);
      const eventName = elements.customEventName.value || 'Event';

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

    // Millennium (Y2K)
    const y2k = new Date(2000, 0, 1);
    const y2kDiff = calculateTimeDiff(y2k, now);
    elements.millenniumResult.innerHTML = `
      <strong>${y2kDiff.years} years</strong>
      ${y2kDiff.totalDays.toLocaleString()} days since Y2K
    `;
  }

  // ==================== Set Quick Date ====================
  function setQuickDate(input, days, isFuture = false) {
    const date = new Date();
    if (isFuture) {
      date.setDate(date.getDate() + days);
    } else {
      date.setDate(date.getDate() - days);
    }

    // Format for datetime-local input
    const formatted = date.toISOString().slice(0, 16);
    input.value = formatted;

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

    // Date inputs - show errors on user input
    elements.sinceDate.addEventListener('change', () => updateSince(true));
    elements.untilDate.addEventListener('change', () => updateUntil(true));

    // Clear buttons
    elements.sinceClearBtn.addEventListener('click', () => {
      elements.sinceDate.value = '';
      lastSinceError = false;
      updateSince(false);
    });

    elements.untilClearBtn.addEventListener('click', () => {
      elements.untilDate.value = '';
      lastUntilError = false;
      updateUntil(false);
    });

    // Quick presets for Since
    document.querySelectorAll('#sincePanel .quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days);
        setQuickDate(elements.sinceDate, days, false);
      });
    });

    // Quick presets for Until
    document.querySelectorAll('#untilPanel .quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.future);
        setQuickDate(elements.untilDate, days, true);
      });
    });

    // Preset inputs
    elements.birthdayDate.addEventListener('change', updatePresets);
    elements.customEventName.addEventListener('input', updatePresets);
    elements.customEventDate.addEventListener('change', updatePresets);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const isTyping = document.activeElement.tagName === 'INPUT' ||
                       document.activeElement.tagName === 'TEXTAREA';

      if (isTyping) return;

      if (e.key === '1') switchTab('since');
      if (e.key === '2') switchTab('until');
      if (e.key === '3') switchTab('presets');
    });
  }

  // ==================== Initialize ====================
  function init() {
    // Load saved birthday
    const savedBirthday = localStorage.getItem('timesince_birthday');
    if (savedBirthday) {
      elements.birthdayDate.value = savedBirthday;
    }

    // Save birthday on change
    elements.birthdayDate.addEventListener('change', () => {
      localStorage.setItem('timesince_birthday', elements.birthdayDate.value);
    });

    initEventListeners();
    updateAll();

    // Start live updates
    updateInterval = setInterval(updateAll, 1000);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
