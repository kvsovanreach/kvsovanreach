/**
 * KVSOVANREACH Days Between Dates Calculator
 * Calculate the difference between two dates with fast input
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.startDatetime = document.getElementById('startDatetime');
    elements.endDatetime = document.getElementById('endDatetime');
    elements.includeEndDate = document.getElementById('includeEndDate');
    elements.workdaysOnly = document.getElementById('workdaysOnly');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.totalDays = document.getElementById('totalDays');
    elements.totalWeeks = document.getElementById('totalWeeks');
    elements.totalMonths = document.getElementById('totalMonths');
    elements.totalYears = document.getElementById('totalYears');
    elements.totalHours = document.getElementById('totalHours');
    elements.breakdownText = document.getElementById('breakdownText');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Fast Date Helpers ====================
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

  function clearDateContainer(container) {
    if (!container) return;
    container.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  }

  function setupFastDateInput(container, onUpdate) {
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

  // ==================== Calculate ====================
  function calculate() {
    const start = getDateFromContainer(elements.startDatetime);
    const end = getDateFromContainer(elements.endDatetime);

    if (!start || !end) {
      // Don't show results if dates are incomplete
      if (elements.totalDays) elements.totalDays.textContent = '0';
      if (elements.totalWeeks) elements.totalWeeks.textContent = '0';
      if (elements.totalMonths) elements.totalMonths.textContent = '0';
      if (elements.totalYears) elements.totalYears.textContent = '0';
      if (elements.totalHours) elements.totalHours.textContent = '0';
      if (elements.breakdownText) elements.breakdownText.textContent = '0 years, 0 months, 0 days';
      return;
    }

    // Allow reverse calculation (end before start)
    const isReversed = start > end;
    const actualStart = isReversed ? end : start;
    const actualEnd = isReversed ? start : end;

    let days;
    if (elements.workdaysOnly?.checked) {
      days = countWorkdays(actualStart, actualEnd);
    } else {
      days = Math.floor((actualEnd - actualStart) / (1000 * 60 * 60 * 24));
    }

    if (elements.includeEndDate?.checked) {
      days += 1;
    }

    displayResults(days, actualStart, actualEnd, isReversed);
  }

  // ==================== Count Workdays ====================
  function countWorkdays(start, end) {
    let count = 0;
    const current = new Date(start);

    while (current < end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // ==================== Display Results ====================
  function displayResults(days, start, end, isReversed) {
    if (elements.totalDays) elements.totalDays.textContent = days.toLocaleString();
    if (elements.totalWeeks) elements.totalWeeks.textContent = (days / 7).toFixed(1);
    if (elements.totalMonths) elements.totalMonths.textContent = (days / 30.44).toFixed(1);
    if (elements.totalYears) elements.totalYears.textContent = (days / 365.25).toFixed(2);
    if (elements.totalHours) elements.totalHours.textContent = (days * 24).toLocaleString();

    const breakdown = getBreakdown(start, end);
    if (elements.breakdownText) {
      elements.breakdownText.textContent = isReversed ? `${breakdown} (reversed)` : breakdown;
    }
  }

  // ==================== Get Breakdown ====================
  function getBreakdown(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (elements.includeEndDate?.checked && days >= 0) {
      days += 1;
      if (days >= 30) {
        days -= 30;
        months++;
        if (months >= 12) {
          months -= 12;
          years++;
        }
      }
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

    return parts.join(', ');
  }

  // ==================== Quick Presets ====================
  function handleQuickPreset(e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;

    const target = btn.dataset.target;
    const container = target === 'start' ? elements.startDatetime : elements.endDatetime;
    const date = new Date();

    if (btn.dataset.days !== undefined) {
      const days = parseInt(btn.dataset.days);
      date.setDate(date.getDate() - days);
    } else if (btn.dataset.future !== undefined) {
      const days = parseInt(btn.dataset.future);
      date.setDate(date.getDate() + days);
    }

    setDateToContainer(container, date);
    calculate();
  }

  // ==================== Reset Form ====================
  function resetForm() {
    const today = new Date();

    setDateToContainer(elements.startDatetime, today);
    setDateToContainer(elements.endDatetime, today);

    if (elements.includeEndDate) elements.includeEndDate.checked = false;
    if (elements.workdaysOnly) elements.workdaysOnly.checked = false;

    calculate();
    showToast('Reset', 'success');
  }

  // ==================== Keyboard Handler ====================
  function handleKeyboard(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Setup fast date inputs
    setupFastDateInput(elements.startDatetime, calculate);
    setupFastDateInput(elements.endDatetime, calculate);

    // Quick presets
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', handleQuickPreset);
    });

    // Options change
    elements.includeEndDate?.addEventListener('change', calculate);
    elements.workdaysOnly?.addEventListener('change', calculate);

    // Reset
    elements.resetBtn?.addEventListener('click', resetForm);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ==================== Initialize ====================
  function init() {
    initElements();

    // Set today as default for both
    const today = new Date();
    setDateToContainer(elements.startDatetime, today);
    setDateToContainer(elements.endDatetime, today);

    initEventListeners();
    calculate();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
