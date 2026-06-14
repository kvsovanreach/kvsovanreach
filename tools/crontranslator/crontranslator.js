/**
 * Cron Translator
 * Bidirectional cron expression <-> human-readable translator
 */
(function () {
  'use strict';

  // ==================== Constants ====================
  const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_SHORT = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const FIELD_LIMITS = [
    { name: 'Minute', min: 0, max: 59 },
    { name: 'Hour', min: 0, max: 23 },
    { name: 'Day of Month', min: 1, max: 31 },
    { name: 'Month', min: 1, max: 12, names: MONTH_SHORT.slice(1) },
    { name: 'Day of Week', min: 0, max: 6, names: WEEKDAY_SHORT }
  ];

  // ==================== State ====================
  let history = [];
  const MAX_HISTORY = 5;

  // ==================== DOM Elements ====================
  const els = {};
  function $(id) { return document.getElementById(id); }

  function initElements() {
    els.cronInput = $('cronInput');
    els.textInput = $('textInput');
    els.translateBtn = $('translateBtn');
    els.suggestBtn = $('suggestBtn');
    els.fieldErrors = $('fieldErrors');
    els.fieldBreakdown = $('fieldBreakdown');
    els.cronResult = $('cronResult');
    els.humanReadable = $('humanReadable');
    els.expressionDisplay = $('expressionDisplay');
    els.copyDescription = $('copyDescription');
    els.copyExpression = $('copyExpression');
    els.copySuggested = $('copySuggested');
    els.suggestionResult = $('suggestionResult');
    els.suggestedCron = $('suggestedCron');
    els.suggestedDesc = $('suggestedDesc');
    els.cronToTextPanel = $('cronToTextPanel');
    els.textToCronPanel = $('textToCronPanel');
    els.historyList = $('historyList');
    els.historyEmpty = $('historyEmpty');
    els.clearHistoryBtn = $('clearHistoryBtn');
    // Breakdown fields
    els.bkMinute = $('bkMinute');
    els.bkHour = $('bkHour');
    els.bkDay = $('bkDay');
    els.bkMonth = $('bkMonth');
    els.bkWeekday = $('bkWeekday');
    els.bkMinuteDesc = $('bkMinuteDesc');
    els.bkHourDesc = $('bkHourDesc');
    els.bkDayDesc = $('bkDayDesc');
    els.bkMonthDesc = $('bkMonthDesc');
    els.bkWeekdayDesc = $('bkWeekdayDesc');
  }

  // ==================== Validation ====================
  function normalizeField(value, fieldIndex) {
    const limit = FIELD_LIMITS[fieldIndex];
    if (!limit.names) return value;
    let result = value.toUpperCase();
    limit.names.forEach((name, i) => {
      const numVal = fieldIndex === 3 ? i + 1 : i; // month is 1-based
      result = result.replace(new RegExp('\\b' + name + '\\b', 'g'), String(numVal));
    });
    return result;
  }

  function validateField(value, fieldIndex) {
    const limit = FIELD_LIMITS[fieldIndex];
    const normalized = normalizeField(value, fieldIndex);

    if (normalized === '*') return { valid: true };

    // Step: */n or n/m
    const stepMatch = normalized.match(/^(\*|\d+)\/(\d+)$/);
    if (stepMatch) {
      const base = stepMatch[1];
      const step = parseInt(stepMatch[2], 10);
      if (step < 1) return { valid: false, error: `${limit.name}: step must be >= 1` };
      if (base !== '*') {
        const baseNum = parseInt(base, 10);
        if (isNaN(baseNum) || baseNum < limit.min || baseNum > limit.max) {
          return { valid: false, error: `${limit.name}: base ${base} out of range (${limit.min}-${limit.max})` };
        }
      }
      return { valid: true };
    }

    // Comma-separated list
    const parts = normalized.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      // Range: n-m
      const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (isNaN(start) || isNaN(end)) return { valid: false, error: `${limit.name}: invalid range "${trimmed}"` };
        if (start < limit.min || start > limit.max || end < limit.min || end > limit.max) {
          return { valid: false, error: `${limit.name}: range ${trimmed} out of bounds (${limit.min}-${limit.max})` };
        }
        continue;
      }
      // Range with step: n-m/s
      const rangeStepMatch = trimmed.match(/^(\d+)-(\d+)\/(\d+)$/);
      if (rangeStepMatch) {
        const start = parseInt(rangeStepMatch[1], 10);
        const end = parseInt(rangeStepMatch[2], 10);
        const step = parseInt(rangeStepMatch[3], 10);
        if (start < limit.min || end > limit.max || step < 1) {
          return { valid: false, error: `${limit.name}: "${trimmed}" out of bounds` };
        }
        continue;
      }
      // Single value
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num < limit.min || num > limit.max) {
        return { valid: false, error: `${limit.name}: "${trimmed}" is invalid (${limit.min}-${limit.max})` };
      }
    }
    return { valid: true };
  }

  function validateExpression(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, errors: [{ field: -1, error: 'Cron expression must have exactly 5 fields' }] };
    }
    const errors = [];
    parts.forEach((part, i) => {
      const result = validateField(part, i);
      if (!result.valid) {
        errors.push({ field: i, error: result.error });
      }
    });
    return { valid: errors.length === 0, errors, parts };
  }

  // ==================== Field Description ====================
  function describeField(value, fieldIndex) {
    const normalized = normalizeField(value, fieldIndex);

    if (normalized === '*') {
      const labels = ['Every minute', 'Every hour', 'Every day', 'Every month', 'Every day of the week'];
      return labels[fieldIndex];
    }

    // Step
    const stepMatch = normalized.match(/^(\*|\d+)\/(\d+)$/);
    if (stepMatch) {
      const step = stepMatch[2];
      const labels = ['minute', 'hour', 'day', 'month', 'day'];
      if (stepMatch[1] === '*') return `Every ${step} ${labels[fieldIndex]}${step > 1 ? 's' : ''}`;
      return `Every ${step} ${labels[fieldIndex]}${step > 1 ? 's' : ''} from ${stepMatch[1]}`;
    }

    // Comma list
    const parts = normalized.split(',');
    const formatted = parts.map(p => formatSingleValue(p.trim(), fieldIndex));
    if (formatted.length === 1) return formatted[0];
    return formatted.slice(0, -1).join(', ') + ' and ' + formatted[formatted.length - 1];
  }

  function formatSingleValue(value, fieldIndex) {
    // Range
    const rangeMatch = value.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (fieldIndex === 4) return `${WEEKDAY_NAMES[start]} through ${WEEKDAY_NAMES[end]}`;
      if (fieldIndex === 3) return `${MONTH_NAMES[start]} through ${MONTH_NAMES[end]}`;
      if (fieldIndex === 1) return `${pad(start)}:00 to ${pad(end)}:00`;
      return `${start} through ${end}`;
    }

    // Range with step
    const rangeStepMatch = value.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (rangeStepMatch) {
      return `every ${rangeStepMatch[3]} from ${rangeStepMatch[1]} to ${rangeStepMatch[2]}`;
    }

    const num = parseInt(value, 10);
    if (fieldIndex === 0) return `At minute ${num}`;
    if (fieldIndex === 1) return `At ${pad(num)}:00`;
    if (fieldIndex === 2) return `On day ${num}`;
    if (fieldIndex === 3) return `In ${MONTH_NAMES[num] || num}`;
    if (fieldIndex === 4) return `On ${WEEKDAY_NAMES[num] || value}`;
    return value;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // ==================== Full Human-Readable ====================
  function toHumanReadable(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return 'Invalid expression';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts.map((p, i) => normalizeField(p, i));

    let result = '';

    // Time part
    if (minute === '*' && hour === '*') {
      result = 'Every minute';
    } else if (hour === '*' && minute !== '*') {
      const stepMatch = minute.match(/^\*\/(\d+)$/);
      if (stepMatch) {
        result = `Every ${stepMatch[1]} minute${stepMatch[1] > 1 ? 's' : ''}`;
      } else {
        result = `At minute ${minute} of every hour`;
      }
    } else if (minute !== '*' && hour !== '*') {
      const hourStep = hour.match(/^\*\/(\d+)$/);
      if (hourStep) {
        result = `At minute ${minute}, every ${hourStep[1]} hour${hourStep[1] > 1 ? 's' : ''}`;
      } else {
        const hours = expandField(hour, 1);
        const mins = expandField(minute, 0);
        if (hours.length <= 3 && mins.length === 1) {
          const timeStrs = hours.map(h => `${pad(h)}:${pad(mins[0])}`);
          result = `At ${timeStrs.join(' and ')}`;
        } else {
          result = `At minute ${minute}, hour ${hour}`;
        }
      }
    } else {
      // minute is *, hour is specific
      const hourStep = hour.match(/^\*\/(\d+)$/);
      if (hourStep) {
        result = `Every minute, every ${hourStep[1]} hour${hourStep[1] > 1 ? 's' : ''}`;
      } else {
        result = `Every minute during hour ${hour}`;
      }
    }

    // Day of month
    if (dayOfMonth !== '*') {
      const domStep = dayOfMonth.match(/^\*\/(\d+)$/);
      if (domStep) {
        result += `, every ${domStep[1]} day${domStep[1] > 1 ? 's' : ''}`;
      } else {
        const days = expandField(dayOfMonth, 2);
        if (days.length === 1) {
          result += ` on day ${days[0]} of the month`;
        } else {
          result += ` on days ${dayOfMonth} of the month`;
        }
      }
    }

    // Month
    if (month !== '*') {
      const monthStep = month.match(/^\*\/(\d+)$/);
      if (monthStep) {
        result += `, every ${monthStep[1]} month${monthStep[1] > 1 ? 's' : ''}`;
      } else {
        const months = expandField(month, 3);
        const monthNames = months.map(m => MONTH_NAMES[m] || m);
        if (monthNames.length === 1) {
          result += ` in ${monthNames[0]}`;
        } else {
          result += ` in ${monthNames.slice(0, -1).join(', ')} and ${monthNames[monthNames.length - 1]}`;
        }
      }
    }

    // Day of week
    if (dayOfWeek !== '*') {
      const dowStep = dayOfWeek.match(/^\*\/(\d+)$/);
      if (dowStep) {
        result += `, every ${dowStep[1]} day${dowStep[1] > 1 ? 's' : ''} of the week`;
      } else {
        const days = expandField(dayOfWeek, 4);
        const dayNames = days.map(d => WEEKDAY_NAMES[d] || d);
        if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
          result += ' on weekdays';
        } else if (days.length === 2 && days.includes(0) && days.includes(6)) {
          result += ' on weekends';
        } else if (dayNames.length === 1) {
          result += ` on every ${dayNames[0]}`;
        } else {
          result += ` on ${dayNames.slice(0, -1).join(', ')} and ${dayNames[dayNames.length - 1]}`;
        }
      }
    }

    return result;
  }

  function expandField(value, fieldIndex) {
    const normalized = normalizeField(value, fieldIndex);
    const limit = FIELD_LIMITS[fieldIndex];
    if (normalized === '*') {
      const arr = [];
      for (let i = limit.min; i <= limit.max; i++) arr.push(i);
      return arr;
    }

    const results = new Set();
    const parts = normalized.split(',');
    for (const part of parts) {
      const trimmed = part.trim();

      // Step from range: n-m/s
      const rangeStepMatch = trimmed.match(/^(\d+)-(\d+)\/(\d+)$/);
      if (rangeStepMatch) {
        const start = parseInt(rangeStepMatch[1], 10);
        const end = parseInt(rangeStepMatch[2], 10);
        const step = parseInt(rangeStepMatch[3], 10);
        for (let i = start; i <= end; i += step) results.add(i);
        continue;
      }

      // Step: */n or n/s
      const stepMatch = trimmed.match(/^(\*|\d+)\/(\d+)$/);
      if (stepMatch) {
        const base = stepMatch[1] === '*' ? limit.min : parseInt(stepMatch[1], 10);
        const step = parseInt(stepMatch[2], 10);
        for (let i = base; i <= limit.max; i += step) results.add(i);
        continue;
      }

      // Range: n-m
      const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) results.add(i);
        continue;
      }

      // Single value
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) results.add(num);
    }
    return Array.from(results).sort((a, b) => a - b);
  }

  // ==================== Text to Cron ====================
  const TEXT_PATTERNS = [
    { pattern: /every\s+minute/i, cron: '* * * * *' },
    { pattern: /every\s+(\d+)\s+minutes?/i, handler: m => `*/${m[1]} * * * *` },
    { pattern: /every\s+hour(?:ly)?/i, cron: '0 * * * *' },
    { pattern: /every\s+(\d+)\s+hours?/i, handler: m => `0 */${m[1]} * * *` },
    { pattern: /daily\s+at\s+midnight/i, cron: '0 0 * * *' },
    { pattern: /daily\s+at\s+noon/i, cron: '0 12 * * *' },
    { pattern: /every\s+day\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, handler: m => {
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3]) {
        if (m[3].toLowerCase() === 'pm' && h < 12) h += 12;
        if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
      }
      return `${min} ${h} * * *`;
    }},
    { pattern: /(?:every\s+)?weekdays?\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, handler: m => {
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3]) {
        if (m[3].toLowerCase() === 'pm' && h < 12) h += 12;
        if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
      }
      return `${min} ${h} * * 1-5`;
    }},
    { pattern: /(?:every\s+)?weekends?\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, handler: m => {
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3]) {
        if (m[3].toLowerCase() === 'pm' && h < 12) h += 12;
        if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
      }
      return `${min} ${h} * * 0,6`;
    }},
    { pattern: /every\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, handler: m => {
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      let h = parseInt(m[2], 10);
      const min = m[3] ? parseInt(m[3], 10) : 0;
      if (m[4]) {
        if (m[4].toLowerCase() === 'pm' && h < 12) h += 12;
        if (m[4].toLowerCase() === 'am' && h === 12) h = 0;
      }
      return `${min} ${h} * * ${dayMap[m[1].toLowerCase()]}`;
    }},
    { pattern: /(?:first|1st)\s+(?:of|day\s+of)\s+(?:every\s+)?month/i, cron: '0 0 1 * *' },
    { pattern: /(?:every|at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i, handler: m => {
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3].toLowerCase() === 'pm' && h < 12) h += 12;
      if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
      return `${min} ${h} * * *`;
    }},
    { pattern: /quarterly/i, cron: '0 0 1 1,4,7,10 *' },
    { pattern: /(?:every\s+)?midnight/i, cron: '0 0 * * *' },
    { pattern: /(?:every\s+)?noon/i, cron: '0 12 * * *' },
    { pattern: /twice\s+(?:a\s+)?day/i, cron: '0 0,12 * * *' },
    { pattern: /every\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i, handler: m => {
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      return `0 0 * * ${dayMap[m[1].toLowerCase()]}`;
    }},
  ];

  function textToCron(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    for (const entry of TEXT_PATTERNS) {
      const match = trimmed.match(entry.pattern);
      if (match) {
        const cron = entry.handler ? entry.handler(match) : entry.cron;
        return cron;
      }
    }
    return null;
  }

  // ==================== UI Updates ====================
  function showErrors(errors) {
    els.fieldErrors.innerHTML = '';
    const breakdownItems = els.fieldBreakdown.querySelectorAll('.ct-breakdown-item');
    breakdownItems.forEach(item => item.classList.remove('error'));

    errors.forEach(err => {
      const div = document.createElement('div');
      div.className = 'ct-field-error';
      div.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${err.error}`;
      els.fieldErrors.appendChild(div);

      if (err.field >= 0 && err.field < breakdownItems.length) {
        breakdownItems[err.field].classList.add('error');
      }
    });
  }

  function clearErrors() {
    els.fieldErrors.innerHTML = '';
    els.fieldBreakdown.querySelectorAll('.ct-breakdown-item').forEach(item => item.classList.remove('error'));
  }

  function updateBreakdown(parts) {
    const valueEls = [els.bkMinute, els.bkHour, els.bkDay, els.bkMonth, els.bkWeekday];
    const descEls = [els.bkMinuteDesc, els.bkHourDesc, els.bkDayDesc, els.bkMonthDesc, els.bkWeekdayDesc];

    parts.forEach((part, i) => {
      valueEls[i].textContent = part;
      descEls[i].textContent = describeField(part, i);
    });
  }

  function translateCron() {
    const expr = els.cronInput.value.trim();
    if (!expr) {
      ToolsCommon.showToast('Please enter a cron expression', 'error');
      return;
    }

    const validation = validateExpression(expr);
    if (!validation.valid) {
      showErrors(validation.errors);
      if (validation.parts) updateBreakdown(validation.parts);
      return;
    }

    clearErrors();
    updateBreakdown(validation.parts);

    const description = toHumanReadable(expr);
    els.humanReadable.textContent = description;
    els.expressionDisplay.textContent = expr;

    addToHistory(expr, description);
  }

  function suggestFromText() {
    const text = els.textInput.value.trim();
    if (!text) {
      ToolsCommon.showToast('Please describe when you want the job to run', 'error');
      return;
    }

    const cron = textToCron(text);
    if (!cron) {
      els.suggestionResult.classList.add('hidden');
      ToolsCommon.showToast('Could not interpret that description. Try phrases like "every weekday at 9am"', 'error', 3500);
      return;
    }

    const description = toHumanReadable(cron);
    els.suggestedCron.textContent = cron;
    els.suggestedDesc.textContent = description;
    els.suggestionResult.classList.remove('hidden');

    addToHistory(cron, description);
  }

  // ==================== History ====================
  function addToHistory(cron, description) {
    // Remove duplicate if exists
    history = history.filter(h => h.cron !== cron);
    history.unshift({ cron, description });
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      els.historyEmpty.style.display = '';
      // Remove all items except the empty state
      const items = els.historyList.querySelectorAll('.ct-history-item');
      items.forEach(item => item.remove());
      return;
    }

    els.historyEmpty.style.display = 'none';
    // Remove existing items
    const existing = els.historyList.querySelectorAll('.ct-history-item');
    existing.forEach(item => item.remove());

    history.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'ct-history-item';
      item.innerHTML = `
        <span class="ct-history-cron">${escapeHTML(entry.cron)}</span>
        <i class="fa-solid fa-arrow-right ct-history-arrow"></i>
        <span class="ct-history-desc">${escapeHTML(entry.description)}</span>
      `;
      item.addEventListener('click', () => {
        els.cronInput.value = entry.cron;
        switchToMode('cron-to-text');
        translateCron();
      });
      els.historyList.appendChild(item);
    });
  }

  function clearHistory() {
    history = [];
    renderHistory();
    ToolsCommon.showToast('History cleared', 'info');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Mode Switching ====================
  function switchToMode(mode) {
    document.querySelectorAll('.ct-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    els.cronToTextPanel.classList.toggle('hidden', mode !== 'cron-to-text');
    els.textToCronPanel.classList.toggle('hidden', mode !== 'text-to-cron');
  }

  // ==================== Event Listeners ====================
  function bindEvents() {
    // Tabs
    document.querySelectorAll('.ct-tab').forEach(tab => {
      tab.addEventListener('click', () => switchToMode(tab.dataset.mode));
    });

    // Translate button
    els.translateBtn.addEventListener('click', translateCron);

    // Suggest button
    els.suggestBtn.addEventListener('click', suggestFromText);

    // Enter key in cron input
    els.cronInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); translateCron(); }
    });

    // Enter key in text input
    els.textInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); suggestFromText(); }
    });

    // Copy buttons
    els.copyDescription.addEventListener('click', () => {
      ToolsCommon.copyWithToast(els.humanReadable.textContent, 'Description copied!');
    });

    els.copyExpression.addEventListener('click', () => {
      ToolsCommon.copyWithToast(els.expressionDisplay.textContent, 'Expression copied!');
    });

    els.copySuggested.addEventListener('click', () => {
      ToolsCommon.copyWithToast(els.suggestedCron.textContent, 'Expression copied!');
    });

    // Presets
    document.querySelectorAll('.ct-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const cron = btn.dataset.cron;
        els.cronInput.value = cron;
        switchToMode('cron-to-text');
        translateCron();
      });
    });

    // Clear history
    els.clearHistoryBtn.addEventListener('click', clearHistory);
  }

  // ==================== Init ====================
  function init() {
    initElements();
    bindEvents();
    // Initial translation
    translateCron();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
