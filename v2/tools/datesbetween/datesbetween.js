/**
 * Days Between Dates Calculator
 * Calculate the difference between two dates
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    startTodayBtn: document.getElementById('startTodayBtn'),
    endTodayBtn: document.getElementById('endTodayBtn'),
    includeEndDate: document.getElementById('includeEndDate'),
    workdaysOnly: document.getElementById('workdaysOnly'),
    calculateBtn: document.getElementById('calculateBtn'),
    resultsSection: document.getElementById('resultsSection'),
    totalDays: document.getElementById('totalDays'),
    totalWeeks: document.getElementById('totalWeeks'),
    totalMonths: document.getElementById('totalMonths'),
    totalYears: document.getElementById('totalYears'),
    totalHours: document.getElementById('totalHours'),
    breakdownText: document.getElementById('breakdownText')
  };

  // ==================== Calculate ====================
  function calculate() {
    const start = new Date(elements.startDate.value);
    const end = new Date(elements.endDate.value);

    if (!elements.startDate.value || !elements.endDate.value) {
      ToolsCommon.showToast('Please select both dates', 'error');
      return;
    }

    if (start > end) {
      ToolsCommon.showToast('Start date must be before end date', 'error');
      return;
    }

    let days;
    if (elements.workdaysOnly.checked) {
      days = countWorkdays(start, end);
    } else {
      days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    }

    if (elements.includeEndDate.checked) {
      days += 1;
    }

    // Display results
    displayResults(days, start, end);
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
  function displayResults(days, start, end) {
    elements.resultsSection.classList.remove('hidden');

    // Main result
    elements.totalDays.textContent = days.toLocaleString();

    // Detail results
    elements.totalWeeks.textContent = (days / 7).toFixed(1);
    elements.totalMonths.textContent = (days / 30.44).toFixed(1);
    elements.totalYears.textContent = (days / 365.25).toFixed(2);
    elements.totalHours.textContent = (days * 24).toLocaleString();

    // Breakdown
    const breakdown = getBreakdown(start, end);
    elements.breakdownText.textContent = breakdown;

    ToolsCommon.showToast(`${days.toLocaleString()} days between dates`, 'success');
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

    if (elements.includeEndDate.checked && days >= 0) {
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

  // ==================== Set Today ====================
  function setToday(input) {
    const today = new Date().toISOString().split('T')[0];
    input.value = today;
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    elements.calculateBtn.addEventListener('click', calculate);
    elements.startTodayBtn.addEventListener('click', () => setToday(elements.startDate));
    elements.endTodayBtn.addEventListener('click', () => setToday(elements.endDate));

    // Enter key to calculate
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          calculate();
        }
      });
    });

    // Auto-calculate when dates change
    elements.startDate.addEventListener('change', () => {
      if (elements.startDate.value && elements.endDate.value) {
        calculate();
      }
    });

    elements.endDate.addEventListener('change', () => {
      if (elements.startDate.value && elements.endDate.value) {
        calculate();
      }
    });

    // Options change
    elements.includeEndDate.addEventListener('change', () => {
      if (elements.startDate.value && elements.endDate.value) {
        calculate();
      }
    });

    elements.workdaysOnly.addEventListener('change', () => {
      if (elements.startDate.value && elements.endDate.value) {
        calculate();
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    // Set default dates
    setToday(elements.startDate);
    setToday(elements.endDate);

    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
