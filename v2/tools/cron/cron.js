/**
 * Cron Parser Tool
 */
(function() {
  'use strict';

  // ==================== Constants ====================
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // ==================== DOM Elements ====================
  const elements = {
    cronInput: document.getElementById('cronInput'),
    parseBtn: document.getElementById('parseBtn'),
    clearBtn: document.getElementById('clearBtn'),
    fieldMinute: document.getElementById('fieldMinute'),
    fieldHour: document.getElementById('fieldHour'),
    fieldDayMonth: document.getElementById('fieldDayMonth'),
    fieldMonth: document.getElementById('fieldMonth'),
    fieldDayWeek: document.getElementById('fieldDayWeek'),
    humanReadable: document.getElementById('humanReadable'),
    nextRuns: document.getElementById('nextRuns'),
    exampleBtns: document.querySelectorAll('.example-btn'),
    toast: document.getElementById('toast')
  };

  // ==================== Cron Parser ====================
  function parseNamedValue(value, type) {
    const upper = value.toUpperCase();

    if (type === 'month') {
      const idx = MONTHS_SHORT.indexOf(upper);
      if (idx !== -1) return idx + 1;
    }

    if (type === 'day') {
      const idx = DAYS_SHORT.indexOf(upper);
      if (idx !== -1) return idx;
    }

    return parseInt(value);
  }

  function parseCronField(field, min, max, type = null) {
    const values = new Set();

    if (field === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      return { values: Array.from(values), isAny: true };
    }

    const parts = field.split(',');

    for (const part of parts) {
      if (part.includes('/')) {
        // Step values: */5 or 0-30/5
        const [range, step] = part.split('/');
        const stepNum = parseInt(step);
        let start = min, end = max;

        if (range !== '*') {
          if (range.includes('-')) {
            const [s, e] = range.split('-');
            start = parseNamedValue(s, type);
            end = parseNamedValue(e, type);
          } else {
            start = parseNamedValue(range, type);
          }
        }

        for (let i = start; i <= end; i += stepNum) {
          if (i >= min && i <= max) values.add(i);
        }
      } else if (part.includes('-')) {
        // Range: 1-5 or MON-FRI
        const [s, e] = part.split('-');
        const start = parseNamedValue(s, type);
        const end = parseNamedValue(e, type);
        for (let i = start; i <= end; i++) {
          if (i >= min && i <= max) values.add(i);
        }
      } else {
        // Single value (number or name)
        const num = parseNamedValue(part, type);
        if (!isNaN(num) && num >= min && num <= max) values.add(num);
      }
    }

    return { values: Array.from(values).sort((a, b) => a - b), isAny: false };
  }

  function parseCron(expression) {
    const parts = expression.trim().split(/\s+/);

    if (parts.length !== 5) {
      throw new Error('Invalid cron expression. Expected 5 fields.');
    }

    return {
      minute: parseCronField(parts[0], 0, 59),
      hour: parseCronField(parts[1], 0, 23),
      dayOfMonth: parseCronField(parts[2], 1, 31),
      month: parseCronField(parts[3], 1, 12, 'month'),
      dayOfWeek: parseCronField(parts[4], 0, 6, 'day')
    };
  }

  // ==================== Human Readable ====================
  function toHumanReadable(parsed, expression) {
    const parts = expression.trim().split(/\s+/);
    const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

    let result = '';

    // Time
    if (minPart === '*' && hourPart === '*') {
      result = 'Every minute';
    } else if (minPart === '0' && hourPart === '*') {
      result = 'Every hour';
    } else if (minPart.startsWith('*/')) {
      const step = minPart.split('/')[1];
      result = `Every ${step} minutes`;
    } else if (hourPart.startsWith('*/')) {
      const step = hourPart.split('/')[1];
      result = `Every ${step} hours`;
    } else {
      const mins = parsed.minute.values;
      const hours = parsed.hour.values;

      if (hours.length === 1 && mins.length === 1) {
        result = `At ${String(hours[0]).padStart(2, '0')}:${String(mins[0]).padStart(2, '0')}`;
      } else if (hours.length > 1 && mins.length === 1) {
        const hourStr = hours.map(h => `${String(h).padStart(2, '0')}:${String(mins[0]).padStart(2, '0')}`).join(', ');
        result = `At ${hourStr}`;
      } else if (mins.length > 1) {
        result = `At minutes ${mins.join(', ')} of every hour`;
      } else {
        result = `At minute ${mins[0]}`;
        if (!parsed.hour.isAny) {
          result += ` of ${hours.join(', ')} hours`;
        }
      }
    }

    // Day of week
    if (!parsed.dayOfWeek.isAny) {
      const days = parsed.dayOfWeek.values;
      if (days.length === 5 && days.includes(1) && days.includes(5) && !days.includes(0) && !days.includes(6)) {
        result += ', Monday through Friday';
      } else if (days.length === 2 && days.includes(0) && days.includes(6)) {
        result += ', on weekends';
      } else if (days.length === 1) {
        result += `, on ${DAYS[days[0]]}`;
      } else {
        result += `, on ${days.map(d => DAYS[d]).join(', ')}`;
      }
    }

    // Day of month
    if (!parsed.dayOfMonth.isAny) {
      const doms = parsed.dayOfMonth.values;
      if (doms.length === 1) {
        result += `, on day ${doms[0]} of the month`;
      } else {
        result += `, on days ${doms.join(', ')} of the month`;
      }
    }

    // Month
    if (!parsed.month.isAny) {
      const months = parsed.month.values;
      if (months.length === 1) {
        result += `, in ${MONTHS[months[0] - 1]}`;
      } else {
        result += `, in ${months.map(m => MONTHS[m - 1]).join(', ')}`;
      }
    }

    return result;
  }

  // ==================== Next Runs Calculator ====================
  function getNextRuns(parsed, count = 5) {
    const runs = [];
    const now = new Date();
    let current = new Date(now);
    current.setSeconds(0);
    current.setMilliseconds(0);

    const maxIterations = 1000000;
    let iterations = 0;

    while (runs.length < count && iterations < maxIterations) {
      iterations++;
      current.setMinutes(current.getMinutes() + 1);

      const minute = current.getMinutes();
      const hour = current.getHours();
      const dayOfMonth = current.getDate();
      const month = current.getMonth() + 1;
      const dayOfWeek = current.getDay();

      if (
        parsed.minute.values.includes(minute) &&
        parsed.hour.values.includes(hour) &&
        parsed.dayOfMonth.values.includes(dayOfMonth) &&
        parsed.month.values.includes(month) &&
        parsed.dayOfWeek.values.includes(dayOfWeek)
      ) {
        runs.push(new Date(current));
      }
    }

    return runs;
  }

  function formatDate(date) {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleDateString('en-US', options);
  }

  function formatRelativeTime(date) {
    const now = new Date();
    const diff = date - now;

    if (diff < 0) return 'now';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `in ${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  // ==================== UI Functions ====================
  function updateFieldDisplay(expression) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) {
      elements.fieldMinute.textContent = parts[0];
      elements.fieldHour.textContent = parts[1];
      elements.fieldDayMonth.textContent = parts[2];
      elements.fieldMonth.textContent = parts[3];
      elements.fieldDayWeek.textContent = parts[4];
    }
  }

  function displayResult(parsed, expression) {
    // Human readable
    const humanText = toHumanReadable(parsed, expression);
    elements.humanReadable.textContent = humanText;
    elements.humanReadable.classList.remove('error-message');

    // Next runs
    const nextRuns = getNextRuns(parsed);

    // Next run time and relative
    const nextRunTime = document.getElementById('nextRunTime');
    const nextRunRelative = document.getElementById('nextRunRelative');

    if (nextRuns.length > 0) {
      // Display next run prominently
      nextRunTime.textContent = formatDate(nextRuns[0]);
      nextRunRelative.textContent = formatRelativeTime(nextRuns[0]);

      // Display all runs (skip first since it's shown above)
      elements.nextRuns.innerHTML = nextRuns
        .map((date, i) => `<li><span class="run-number">${i + 1}</span>${formatDate(date)}</li>`)
        .join('');
    } else {
      nextRunTime.textContent = 'No upcoming runs';
      nextRunRelative.textContent = '';
      elements.nextRuns.innerHTML = '<li>No upcoming runs found</li>';
    }
  }

  function displayError(message) {
    elements.humanReadable.textContent = message;
    elements.humanReadable.classList.add('error-message');
    elements.nextRuns.innerHTML = '<li>-</li>';
  }

  function showToast(message, type = 'default') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast show' + (type !== 'default' ? ` ${type}` : '');

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2500);
  }

  // ==================== Event Handlers ====================
  function handleParse() {
    const expression = elements.cronInput.value.trim();

    if (!expression) {
      showToast('Please enter a cron expression', 'error');
      return;
    }

    try {
      const parsed = parseCron(expression);
      updateFieldDisplay(expression);
      displayResult(parsed, expression);
    } catch (error) {
      displayError(error.message);
      showToast(error.message, 'error');
    }
  }

  function handleExampleClick(e) {
    const btn = e.target.closest('.example-btn');
    if (!btn) return;

    const cron = btn.dataset.cron;
    elements.cronInput.value = cron;
    handleParse();
  }

  function handleClear() {
    elements.cronInput.value = '';
    elements.fieldMinute.textContent = '*';
    elements.fieldHour.textContent = '*';
    elements.fieldDayMonth.textContent = '*';
    elements.fieldMonth.textContent = '*';
    elements.fieldDayWeek.textContent = '*';
    elements.humanReadable.textContent = 'Enter a cron expression and click Parse';
    elements.nextRuns.innerHTML = '';
    showToast('Cleared', 'success');
  }

  // ==================== Initialize ====================
  function init() {
    // Event listeners
    elements.parseBtn.addEventListener('click', handleParse);
    elements.clearBtn?.addEventListener('click', handleClear);

    // Enter key to parse
    elements.cronInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleParse();
    });

    // Live update on input
    elements.cronInput.addEventListener('input', () => {
      const expression = elements.cronInput.value.trim();
      if (expression.split(/\s+/).length === 5) {
        updateFieldDisplay(expression);
      }
    });

    // Example buttons
    elements.exampleBtns.forEach(btn => {
      btn.addEventListener('click', handleExampleClick);
    });

    // Copy human readable button
    const copyHumanReadable = document.getElementById('copyHumanReadable');
    if (copyHumanReadable) {
      copyHumanReadable.addEventListener('click', async () => {
        const text = elements.humanReadable.textContent;
        if (text && !text.includes('Invalid')) {
          try {
            await navigator.clipboard.writeText(text);
            showToast('Copied!', 'success');
          } catch (err) {
            showToast('Failed to copy');
          }
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // C - Copy human readable
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (copyHumanReadable) copyHumanReadable.click();
        return;
      }

      // 1-8 - Load examples
      if (e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key) - 1;
        const btn = elements.exampleBtns[idx];
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });

    // Initial parse
    handleParse();

    // Update relative time every minute
    setInterval(() => {
      const expression = elements.cronInput.value.trim();
      if (expression && expression.split(/\s+/).length === 5) {
        try {
          const parsed = parseCron(expression);
          const nextRuns = getNextRuns(parsed, 1);
          if (nextRuns.length > 0) {
            const nextRunRelative = document.getElementById('nextRunRelative');
            if (nextRunRelative) {
              nextRunRelative.textContent = formatRelativeTime(nextRuns[0]);
            }
          }
        } catch (e) {}
      }
    }, 60000);
  }

  // Start
  init();
})();
