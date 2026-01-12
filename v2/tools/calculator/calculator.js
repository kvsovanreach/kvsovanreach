/**
 * KVSOVANREACH Calculator
 * A powerful calculator with scientific functions, unit conversion, and history
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    currentInput: '0',
    expression: '',
    lastResult: null,
    isNewInput: true,
    degreeMode: true,
    precision: 6,
    notation: 'standard',
    memory: { 1: null, 2: null, 3: null },
    history: [],
    keyboardEnabled: true
  };

  const MAX_HISTORY = 50;

  // ==================== DOM Elements ====================
  const elements = {
    result: document.getElementById('result'),
    expression: document.getElementById('expression'),
    historyMini: document.getElementById('historyMini'),
    tabs: document.querySelectorAll('.calc-tab'),
    panels: document.querySelectorAll('.calc-panel'),
    historyPanel: document.getElementById('historyPanel'),
    historyList: document.getElementById('historyList'),
    historyBtn: document.getElementById('historyBtn'),
    clearHistoryBtn: document.getElementById('clearHistory'),
    copyBtn: document.getElementById('copyBtn'),
    keyboardToggle: document.getElementById('keyboardToggle'),
    toast: document.getElementById('toast'),
    degRadBtn: document.getElementById('degRadBtn'),
    precision: document.getElementById('precision'),
    notation: document.getElementById('notation'),
    memorySlots: document.querySelectorAll('.memory-slot'),
    // Unit converter
    unitCategory: document.getElementById('unitCategory'),
    fromValue: document.getElementById('fromValue'),
    toValue: document.getElementById('toValue'),
    fromUnit: document.getElementById('fromUnit'),
    toUnit: document.getElementById('toUnit'),
    swapUnits: document.getElementById('swapUnits'),
    formula: document.getElementById('formula')
  };

  // ==================== Unit Conversions ====================
  const unitConversions = {
    length: {
      meter: 1, kilometer: 0.001, centimeter: 100, millimeter: 1000,
      inch: 39.3701, foot: 3.28084, yard: 1.09361, mile: 0.000621371
    },
    weight: {
      gram: 1, kilogram: 0.001, milligram: 1000,
      pound: 0.00220462, ounce: 0.035274, ton: 0.000001
    },
    temperature: { celsius: 0, fahrenheit: 32, kelvin: 273.15 },
    time: {
      second: 1, minute: 1/60, hour: 1/3600,
      day: 1/86400, week: 1/604800, year: 1/31556952
    },
    area: {
      'square meter': 1, 'square kilometer': 0.000001,
      'square foot': 10.7639, 'square yard': 1.19599,
      'hectare': 0.0001, 'acre': 0.000247105
    },
    volume: {
      'cubic meter': 1, 'liter': 1000, 'milliliter': 1000000,
      'gallon (US)': 264.172, 'quart (US)': 1056.69, 'pint (US)': 2113.38
    },
    speed: {
      'meter/second': 1, 'kilometer/hour': 3.6,
      'mile/hour': 2.23694, 'knot': 1.94384
    },
    pressure: {
      'pascal': 1, 'kilopascal': 0.001, 'bar': 0.00001,
      'atmosphere': 9.86923e-6, 'psi': 0.000145038
    },
    energy: {
      'joule': 1, 'kilojoule': 0.001, 'calorie': 0.239006,
      'kilocalorie': 0.000239006, 'kilowatt-hour': 2.77778e-7
    }
  };

  // ==================== Toast Notifications ====================
  function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => {
      elements.toast.className = 'toast';
    }, 2500);
  }

  // ==================== Tab Management ====================
  function setupTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        elements.tabs.forEach(t => t.classList.remove('active'));
        elements.panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tabName}Panel`).classList.add('active');

        // Focus converter input when switching to converter
        if (tabName === 'converter') {
          setTimeout(() => elements.fromValue?.focus(), 100);
        }
      });
    });
  }

  // ==================== Display ====================
  function updateDisplay() {
    const displayExpr = state.expression.replace(/\*/g, '×').replace(/\//g, '÷');
    elements.expression.textContent = displayExpr;
    elements.result.textContent = state.currentInput;
    elements.result.classList.remove('error');
  }

  function showError(message) {
    elements.result.textContent = 'Error';
    elements.result.classList.add('error');
    showToast(message, 'error');
    setTimeout(() => {
      state.currentInput = '0';
      state.expression = '';
      state.isNewInput = true;
      updateDisplay();
    }, 1500);
  }

  // ==================== Calculator Core ====================
  function addNumber(num) {
    if (state.isNewInput) {
      state.currentInput = '';
      state.isNewInput = false;
    }

    if (num === '.') {
      if (state.currentInput.includes('.')) return;
      if (state.currentInput === '') state.currentInput = '0';
    } else if (num === '00') {
      if (state.currentInput === '0' || state.currentInput === '') return;
    }

    state.currentInput += num;

    // Remove leading zero
    if (state.currentInput.startsWith('0') && !state.currentInput.startsWith('0.') && state.currentInput.length > 1) {
      state.currentInput = state.currentInput.substring(1);
    }

    updateDisplay();
  }

  function addOperator(op) {
    if (state.currentInput === '' && state.expression === '') {
      state.currentInput = '0';
    }

    if (state.expression !== '' && !state.isNewInput) {
      calculate(true);
    }

    state.expression += state.currentInput + ` ${op} `;
    state.isNewInput = true;
    updateDisplay();
  }

  function addParenthesis(paren) {
    if (state.currentInput === '0' && paren === '(') {
      state.currentInput = '(';
    } else {
      state.currentInput += paren;
    }
    state.isNewInput = false;
    updateDisplay();
  }

  function performAction(action) {
    switch (action) {
      case 'clear':
        state.currentInput = '0';
        state.expression = '';
        state.isNewInput = true;
        break;
      case 'backspace':
        if (state.isNewInput && state.expression.endsWith(' ')) {
          state.expression = state.expression.slice(0, -3);
          const parts = state.expression.split(' ');
          state.currentInput = parts[parts.length - 1] || '0';
          state.expression = parts.slice(0, -1).join(' ');
          if (state.expression) state.expression += ' ';
          state.isNewInput = false;
        } else {
          state.currentInput = state.currentInput.slice(0, -1);
          if (state.currentInput === '' || state.currentInput === '-') {
            state.currentInput = '0';
            state.isNewInput = true;
          }
        }
        break;
      case 'percent':
        if (state.currentInput !== '' && !state.isNewInput) {
          const value = parseFloat(state.currentInput);
          if (state.expression !== '') {
            const parts = state.expression.trim().split(' ');
            const prevValue = parseFloat(parts[parts.length - 2]);
            state.currentInput = ((prevValue * value) / 100).toString();
          } else {
            state.currentInput = (value / 100).toString();
          }
        }
        break;
      case 'ans':
        if (state.lastResult !== null) {
          state.currentInput = state.lastResult.toString();
          state.isNewInput = false;
        }
        break;
      case 'pi':
        state.currentInput = Math.PI.toString();
        state.isNewInput = false;
        break;
      case 'euler':
        state.currentInput = Math.E.toString();
        state.isNewInput = false;
        break;
      case 'deg-rad':
        state.degreeMode = !state.degreeMode;
        elements.degRadBtn.textContent = state.degreeMode ? 'DEG' : 'RAD';
        showToast(`Using ${state.degreeMode ? 'Degree' : 'Radian'} mode`, 'info');
        return;
      case 'fraction':
        convertToFraction();
        return;
      case 'equals':
        calculate();
        return;
    }
    updateDisplay();
  }

  function calculate(continuous = false) {
    try {
      if (state.expression === '') {
        state.lastResult = parseFloat(state.currentInput);
        if (!continuous) addToHistory(state.currentInput, state.lastResult);
        state.isNewInput = true;
        return;
      }

      let fullExpr = state.expression + state.currentInput;
      fullExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      fullExpr = fullExpr.replace(/\^/g, '**');

      // Security check
      if (!/^[0-9+\-*/.() e\d**]+$/.test(fullExpr)) {
        throw new Error('Invalid expression');
      }

      const result = Function(`'use strict'; return (${fullExpr})`)();

      if (isNaN(result)) throw new Error('Invalid result');
      if (!isFinite(result)) throw new Error(result > 0 ? 'Result too large' : 'Result too small');

      state.lastResult = result;
      const formattedResult = formatNumber(result);

      if (!continuous) {
        const displayExpr = state.expression + state.currentInput;
        addToHistory(displayExpr.replace(/\*/g, '×').replace(/\//g, '÷'), formattedResult);
      }

      state.currentInput = formattedResult;
      state.expression = '';
      state.isNewInput = true;
      updateDisplay();

    } catch (error) {
      showError(error.message || 'Calculation error');
      state.currentInput = '0';
      state.expression = '';
      state.isNewInput = true;
    }
  }

  // ==================== Scientific Functions ====================
  function applyFunction(funcName) {
    let value = parseFloat(state.currentInput);
    let result;

    try {
      switch (funcName) {
        case 'sin':
          result = state.degreeMode ? Math.sin(value * Math.PI / 180) : Math.sin(value);
          break;
        case 'cos':
          result = state.degreeMode ? Math.cos(value * Math.PI / 180) : Math.cos(value);
          break;
        case 'tan':
          result = state.degreeMode ? Math.tan(value * Math.PI / 180) : Math.tan(value);
          break;
        case 'asin':
          if (value < -1 || value > 1) throw new Error('asin input must be between -1 and 1');
          result = Math.asin(value);
          if (state.degreeMode) result = result * 180 / Math.PI;
          break;
        case 'acos':
          if (value < -1 || value > 1) throw new Error('acos input must be between -1 and 1');
          result = Math.acos(value);
          if (state.degreeMode) result = result * 180 / Math.PI;
          break;
        case 'atan':
          result = Math.atan(value);
          if (state.degreeMode) result = result * 180 / Math.PI;
          break;
        case 'log':
          if (value <= 0) throw new Error('log input must be positive');
          result = Math.log10(value);
          break;
        case 'ln':
          if (value <= 0) throw new Error('ln input must be positive');
          result = Math.log(value);
          break;
        case 'sqrt':
          if (value < 0) throw new Error('sqrt input must be non-negative');
          result = Math.sqrt(value);
          break;
        case 'cbrt':
          result = Math.cbrt(value);
          break;
        case 'square':
          result = value * value;
          break;
        case 'cube':
          result = value * value * value;
          break;
        case 'power':
          addOperator('^');
          return;
        case 'factorial':
          if (value < 0 || !Number.isInteger(value)) throw new Error('Factorial needs non-negative integer');
          if (value > 170) throw new Error('Factorial too large');
          result = factorial(value);
          break;
        default:
          return;
      }

      state.currentInput = formatNumber(result);
      state.isNewInput = false;
      updateDisplay();

    } catch (error) {
      showError(error.message);
    }
  }

  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  function formatNumber(value) {
    if (isNaN(value)) return 'Error';
    if (!isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';

    switch (state.notation) {
      case 'scientific':
        return value.toExponential(state.precision);
      case 'engineering':
        const exp = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
        const mantissa = value / Math.pow(10, exp);
        return mantissa.toFixed(state.precision) + 'e' + exp;
      default:
        if (Math.abs(value) >= 1e10 || (Math.abs(value) < 1e-6 && value !== 0)) {
          return value.toExponential(state.precision);
        }
        return parseFloat(value.toFixed(state.precision)).toString();
    }
  }

  function convertToFraction() {
    const value = parseFloat(state.currentInput);
    if (isNaN(value)) {
      showToast('Cannot convert to fraction', 'error');
      return;
    }

    const precision = 1.0E-10;
    if (Math.abs(Math.round(value) - value) < precision) {
      state.currentInput = Math.round(value).toString();
      updateDisplay();
      return;
    }

    const isNegative = value < 0;
    let decimal = Math.abs(value);
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = decimal;

    for (let i = 0; i < 100; i++) {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
      if (Math.abs(decimal - h1 / k1) < decimal * precision) break;
    }

    const num = isNegative ? -h1 : h1;
    if (k1 === 1) {
      state.currentInput = num.toString();
    } else {
      state.currentInput = `${num}/${k1}`;
      showToast(`${value} ≈ ${num}/${k1}`, 'info');
    }
    state.isNewInput = false;
    updateDisplay();
  }

  // ==================== Memory ====================
  function setupMemory() {
    loadMemory();
    updateMemoryIndicators();

    document.querySelectorAll('[data-action="mc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.memory = { 1: null, 2: null, 3: null };
        saveMemory();
        updateMemoryIndicators();
        showToast('Memory cleared', 'info');
      });
    });

    document.querySelectorAll('[data-action="mr"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        if (state.memory[slot] !== null) {
          state.currentInput = state.memory[slot].toString();
          state.isNewInput = false;
          updateDisplay();
          showToast(`Recalled from M${slot}`, 'info');
        } else {
          showToast(`M${slot} is empty`, 'warning');
        }
      });
    });

    document.querySelectorAll('[data-action="ms"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        const value = parseFloat(state.currentInput);
        if (!isNaN(value)) {
          state.memory[slot] = value;
          saveMemory();
          updateMemoryIndicators();
          showToast(`Stored in M${slot}`, 'success');
        }
      });
    });

    elements.memorySlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const slotNum = slot.dataset.slot;
        if (state.memory[slotNum] !== null) {
          state.currentInput = state.memory[slotNum].toString();
          state.isNewInput = false;
          updateDisplay();
          showToast(`Recalled from M${slotNum}`, 'info');
        }
      });
    });
  }

  function loadMemory() {
    try {
      const saved = localStorage.getItem('calcMemory');
      if (saved) state.memory = JSON.parse(saved);
    } catch (e) {}
  }

  function saveMemory() {
    localStorage.setItem('calcMemory', JSON.stringify(state.memory));
  }

  function updateMemoryIndicators() {
    elements.memorySlots.forEach(slot => {
      const num = slot.dataset.slot;
      if (state.memory[num] !== null) {
        slot.classList.add('active');
        slot.title = `M${num}: ${state.memory[num]}`;
      } else {
        slot.classList.remove('active');
        slot.title = `Memory ${num} (empty)`;
      }
    });
  }

  // ==================== History ====================
  function setupHistory() {
    loadHistory();
    renderHistory();

    elements.historyBtn.addEventListener('click', () => {
      elements.historyPanel.classList.toggle('active');
    });

    // History back button
    const historyBackBtn = document.getElementById('historyBackBtn');
    historyBackBtn?.addEventListener('click', () => {
      elements.historyPanel.classList.remove('active');
    });

    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
        elements.historyMini.textContent = '';
        showToast('History cleared', 'info');
      }
    });
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('calcHistory');
      if (saved) state.history = JSON.parse(saved);
    } catch (e) {}
  }

  function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(state.history));
  }

  function addToHistory(expr, result) {
    state.history.push({ expression: expr, result: result });
    if (state.history.length > MAX_HISTORY) state.history.shift();
    saveHistory();
    renderHistory();
    elements.historyMini.textContent = `${expr} = ${result}`;
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<div class="calc-history-empty"><p>No calculation history</p></div>';
      return;
    }

    elements.historyList.innerHTML = state.history.slice().reverse().map(item => `
      <div class="calc-history-item" data-result="${item.result}">
        <div class="calc-history-expression">${item.expression}</div>
        <div class="calc-history-result">${item.result}</div>
      </div>
    `).join('');

    elements.historyList.querySelectorAll('.calc-history-item').forEach(item => {
      item.addEventListener('click', () => {
        state.currentInput = item.dataset.result;
        state.isNewInput = false;
        updateDisplay();
        elements.historyPanel.classList.remove('active');
        showToast('History item selected', 'info');
      });
    });
  }

  // ==================== Unit Converter ====================
  function setupConverter() {
    populateUnits();
    updateFormula();

    elements.unitCategory.addEventListener('change', () => {
      populateUnits();
      updateFormula();
      elements.fromValue.value = '';
      elements.toValue.value = '';
    });

    elements.fromUnit.addEventListener('change', () => {
      updateFormula();
      convert();
    });

    elements.toUnit.addEventListener('change', () => {
      updateFormula();
      convert();
    });

    elements.fromValue.addEventListener('input', convert);

    elements.swapUnits.addEventListener('click', () => {
      const tempUnit = elements.fromUnit.value;
      elements.fromUnit.value = elements.toUnit.value;
      elements.toUnit.value = tempUnit;

      if (elements.toValue.value) {
        elements.fromValue.value = elements.toValue.value;
        elements.toValue.value = '';
      }

      updateFormula();
      convert();
      elements.swapUnits.classList.add('rotating');
      setTimeout(() => elements.swapUnits.classList.remove('rotating'), 300);
    });

    // Converter keypad
    document.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        switch (key) {
          case 'clear':
            elements.fromValue.value = '';
            elements.toValue.value = '';
            break;
          case 'backspace':
            elements.fromValue.value = elements.fromValue.value.slice(0, -1);
            convert();
            break;
          case 'copy':
            if (elements.toValue.value) {
              navigator.clipboard.writeText(elements.toValue.value)
                .then(() => showToast('Copied!', 'success'))
                .catch(() => showToast('Copy failed', 'error'));
            }
            break;
          case 'convert':
            convert();
            break;
          case 'negate':
            if (elements.fromValue.value.startsWith('-')) {
              elements.fromValue.value = elements.fromValue.value.substring(1);
            } else if (elements.fromValue.value) {
              elements.fromValue.value = '-' + elements.fromValue.value;
            }
            convert();
            break;
          default:
            if (/^[0-9.]$/.test(key)) {
              if (key === '.' && elements.fromValue.value.includes('.')) return;
              elements.fromValue.value += key;
              convert();
            }
        }
      });
    });
  }

  function populateUnits() {
    const category = elements.unitCategory.value;
    const units = Object.keys(unitConversions[category]);

    elements.fromUnit.innerHTML = '';
    elements.toUnit.innerHTML = '';

    units.forEach(unit => {
      elements.fromUnit.appendChild(new Option(unit, unit));
      elements.toUnit.appendChild(new Option(unit, unit));
    });

    if (units.length > 1) elements.toUnit.value = units[1];
  }

  function updateFormula() {
    const category = elements.unitCategory.value;
    const from = elements.fromUnit.value;
    const to = elements.toUnit.value;

    if (category === 'temperature') {
      const formulas = {
        'celsius-fahrenheit': '°F = (°C × 9/5) + 32',
        'celsius-kelvin': 'K = °C + 273.15',
        'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
        'fahrenheit-kelvin': 'K = (°F - 32) × 5/9 + 273.15',
        'kelvin-celsius': '°C = K - 273.15',
        'kelvin-fahrenheit': '°F = (K - 273.15) × 9/5 + 32'
      };
      elements.formula.innerHTML = `<p>${formulas[`${from}-${to}`] || 'Same unit'}</p>`;
    } else {
      const fromFactor = unitConversions[category][from];
      const toFactor = unitConversions[category][to];
      const ratio = toFactor / fromFactor;
      elements.formula.innerHTML = `<p>1 ${from} = ${ratio.toFixed(6)} ${to}</p>`;
    }
  }

  function convert() {
    const value = parseFloat(elements.fromValue.value);
    if (isNaN(value)) {
      elements.toValue.value = '';
      return;
    }

    const category = elements.unitCategory.value;
    const from = elements.fromUnit.value;
    const to = elements.toUnit.value;
    let result;

    if (category === 'temperature') {
      // Convert to Celsius first
      let celsius;
      switch (from) {
        case 'celsius': celsius = value; break;
        case 'fahrenheit': celsius = (value - 32) * 5/9; break;
        case 'kelvin': celsius = value - 273.15; break;
      }
      // Convert from Celsius
      switch (to) {
        case 'celsius': result = celsius; break;
        case 'fahrenheit': result = (celsius * 9/5) + 32; break;
        case 'kelvin': result = celsius + 273.15; break;
      }
    } else {
      const fromFactor = unitConversions[category][from];
      const toFactor = unitConversions[category][to];
      result = (value / fromFactor) * toFactor;
    }

    elements.toValue.value = Number(result.toFixed(6)).toString();
  }

  // ==================== Keyboard Input ====================
  function setupKeyboard() {
    elements.keyboardToggle.addEventListener('change', () => {
      state.keyboardEnabled = elements.keyboardToggle.checked;
      showToast(`Keyboard ${state.keyboardEnabled ? 'enabled' : 'disabled'}`, 'info');
    });

    document.addEventListener('keydown', (e) => {
      if (!state.keyboardEnabled) return;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key;

      // Prevent default for calculator keys
      if (/^[0-9+\-*/.=()^]$/.test(key) || ['Enter', 'Backspace', 'Escape'].includes(key)) {
        e.preventDefault();
      }

      // Number keys
      if (/^[0-9.]$/.test(key)) addNumber(key);

      // Operators
      if (['+', '-', '*', '/'].includes(key)) addOperator(key);

      // Parentheses
      if (key === '(' || key === ')') addParenthesis(key);

      // Power
      if (key === '^') addOperator('^');

      // Equals
      if (key === '=' || key === 'Enter') calculate();

      // Backspace
      if (key === 'Backspace') performAction('backspace');

      // Clear
      if (key === 'Escape') performAction('clear');

      // Alt shortcuts
      if (e.altKey) {
        switch (key) {
          case '1':
            e.preventDefault();
            document.querySelector('[data-tab="standard"]')?.click();
            break;
          case '2':
            e.preventDefault();
            document.querySelector('[data-tab="scientific"]')?.click();
            break;
          case '3':
            e.preventDefault();
            document.querySelector('[data-tab="converter"]')?.click();
            break;
          case 'h':
          case 'H':
            e.preventDefault();
            elements.historyBtn.click();
            break;
          case 'c':
          case 'C':
            e.preventDefault();
            elements.copyBtn.click();
            break;
        }
      }
    });
  }

  // ==================== Event Listeners ====================
  function setupEventListeners() {
    // Number buttons
    document.querySelectorAll('[data-num]').forEach(btn => {
      btn.addEventListener('click', () => addNumber(btn.dataset.num));
    });

    // Operator buttons
    document.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('click', () => addOperator(btn.dataset.op));
    });

    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => performAction(btn.dataset.action));
    });

    // Function buttons
    document.querySelectorAll('[data-func]').forEach(btn => {
      btn.addEventListener('click', () => applyFunction(btn.dataset.func));
    });

    // Parenthesis buttons
    document.querySelectorAll('[data-paren]').forEach(btn => {
      btn.addEventListener('click', () => addParenthesis(btn.dataset.paren));
    });

    // Copy button
    elements.copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(state.currentInput)
        .then(() => showToast('Copied!', 'success'))
        .catch(() => showToast('Copy failed', 'error'));
    });

    // Precision and notation
    elements.precision?.addEventListener('change', (e) => {
      state.precision = parseInt(e.target.value);
    });

    elements.notation?.addEventListener('change', (e) => {
      state.notation = e.target.value;
    });

    // Click outside to close history panel
    document.addEventListener('click', (e) => {
      if (!elements.historyPanel.contains(e.target) && !elements.historyBtn.contains(e.target)) {
        elements.historyPanel.classList.remove('active');
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    setupTabs();
    setupEventListeners();
    setupMemory();
    setupHistory();
    setupConverter();
    setupKeyboard();
    updateDisplay();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
