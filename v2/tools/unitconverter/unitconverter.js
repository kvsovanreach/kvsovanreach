/**
 * Unit Converter Tool
 */

(function() {
  'use strict';

  // ==================== Unit Data ====================
  const unitData = {
    length: {
      name: 'Length',
      base: 'meter',
      units: {
        kilometer: { name: 'Kilometer', symbol: 'km', factor: 1000 },
        meter: { name: 'Meter', symbol: 'm', factor: 1 },
        centimeter: { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        millimeter: { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        micrometer: { name: 'Micrometer', symbol: 'μm', factor: 0.000001 },
        nanometer: { name: 'Nanometer', symbol: 'nm', factor: 0.000000001 },
        mile: { name: 'Mile', symbol: 'mi', factor: 1609.344 },
        yard: { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        foot: { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        inch: { name: 'Inch', symbol: 'in', factor: 0.0254 },
        nauticalMile: { name: 'Nautical Mile', symbol: 'nmi', factor: 1852 }
      },
      reference: [
        { unit: '1 kilometer', value: '1,000 meters' },
        { unit: '1 mile', value: '1.609 kilometers' },
        { unit: '1 yard', value: '3 feet' },
        { unit: '1 foot', value: '12 inches' },
        { unit: '1 inch', value: '2.54 centimeters' }
      ]
    },
    weight: {
      name: 'Weight',
      base: 'kilogram',
      units: {
        tonne: { name: 'Metric Ton', symbol: 't', factor: 1000 },
        kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1 },
        gram: { name: 'Gram', symbol: 'g', factor: 0.001 },
        milligram: { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        microgram: { name: 'Microgram', symbol: 'μg', factor: 0.000000001 },
        pound: { name: 'Pound', symbol: 'lb', factor: 0.45359237 },
        ounce: { name: 'Ounce', symbol: 'oz', factor: 0.0283495231 },
        stone: { name: 'Stone', symbol: 'st', factor: 6.35029318 },
        usTon: { name: 'US Ton', symbol: 'ton', factor: 907.18474 },
        ukTon: { name: 'UK Ton', symbol: 'ton', factor: 1016.0469088 }
      },
      reference: [
        { unit: '1 kilogram', value: '2.205 pounds' },
        { unit: '1 pound', value: '16 ounces' },
        { unit: '1 stone', value: '14 pounds' },
        { unit: '1 metric ton', value: '1,000 kilograms' },
        { unit: '1 ounce', value: '28.35 grams' }
      ]
    },
    temperature: {
      name: 'Temperature',
      base: 'celsius',
      units: {
        celsius: { name: 'Celsius', symbol: '°C' },
        fahrenheit: { name: 'Fahrenheit', symbol: '°F' },
        kelvin: { name: 'Kelvin', symbol: 'K' },
        rankine: { name: 'Rankine', symbol: '°R' }
      },
      reference: [
        { unit: '0°C', value: '32°F / 273.15K' },
        { unit: '100°C', value: '212°F / 373.15K' },
        { unit: '-40°C', value: '-40°F' },
        { unit: '37°C', value: '98.6°F (body temp)' },
        { unit: '0K', value: '-273.15°C (absolute zero)' }
      ]
    },
    volume: {
      name: 'Volume',
      base: 'liter',
      units: {
        cubicMeter: { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
        liter: { name: 'Liter', symbol: 'L', factor: 1 },
        milliliter: { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
        cubicCentimeter: { name: 'Cubic Centimeter', symbol: 'cm³', factor: 0.001 },
        gallon: { name: 'US Gallon', symbol: 'gal', factor: 3.78541 },
        quart: { name: 'US Quart', symbol: 'qt', factor: 0.946353 },
        pint: { name: 'US Pint', symbol: 'pt', factor: 0.473176 },
        cup: { name: 'US Cup', symbol: 'cup', factor: 0.236588 },
        fluidOunce: { name: 'US Fluid Ounce', symbol: 'fl oz', factor: 0.0295735 },
        tablespoon: { name: 'Tablespoon', symbol: 'tbsp', factor: 0.0147868 },
        teaspoon: { name: 'Teaspoon', symbol: 'tsp', factor: 0.00492892 },
        imperialGallon: { name: 'Imperial Gallon', symbol: 'imp gal', factor: 4.54609 },
        cubicFoot: { name: 'Cubic Foot', symbol: 'ft³', factor: 28.3168 },
        cubicInch: { name: 'Cubic Inch', symbol: 'in³', factor: 0.0163871 }
      },
      reference: [
        { unit: '1 gallon', value: '3.785 liters' },
        { unit: '1 liter', value: '1,000 milliliters' },
        { unit: '1 cup', value: '8 fluid ounces' },
        { unit: '1 tablespoon', value: '3 teaspoons' },
        { unit: '1 cubic meter', value: '1,000 liters' }
      ]
    },
    area: {
      name: 'Area',
      base: 'squareMeter',
      units: {
        squareKilometer: { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
        hectare: { name: 'Hectare', symbol: 'ha', factor: 10000 },
        squareMeter: { name: 'Square Meter', symbol: 'm²', factor: 1 },
        squareCentimeter: { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
        squareMillimeter: { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
        squareMile: { name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
        acre: { name: 'Acre', symbol: 'ac', factor: 4046.8564224 },
        squareYard: { name: 'Square Yard', symbol: 'yd²', factor: 0.83612736 },
        squareFoot: { name: 'Square Foot', symbol: 'ft²', factor: 0.09290304 },
        squareInch: { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 }
      },
      reference: [
        { unit: '1 hectare', value: '10,000 m² / 2.471 acres' },
        { unit: '1 acre', value: '43,560 square feet' },
        { unit: '1 square mile', value: '640 acres' },
        { unit: '1 square yard', value: '9 square feet' },
        { unit: '1 square foot', value: '144 square inches' }
      ]
    },
    speed: {
      name: 'Speed',
      base: 'meterPerSecond',
      units: {
        meterPerSecond: { name: 'Meter per Second', symbol: 'm/s', factor: 1 },
        kilometerPerHour: { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778 },
        milePerHour: { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704 },
        footPerSecond: { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048 },
        knot: { name: 'Knot', symbol: 'kn', factor: 0.514444 },
        mach: { name: 'Mach (at sea level)', symbol: 'Ma', factor: 343 },
        lightSpeed: { name: 'Speed of Light', symbol: 'c', factor: 299792458 }
      },
      reference: [
        { unit: '1 km/h', value: '0.621 mph' },
        { unit: '1 mph', value: '1.609 km/h' },
        { unit: '1 knot', value: '1.852 km/h' },
        { unit: 'Mach 1', value: '1,235 km/h' },
        { unit: 'Speed of light', value: '299,792,458 m/s' }
      ]
    },
    time: {
      name: 'Time',
      base: 'second',
      units: {
        year: { name: 'Year', symbol: 'yr', factor: 31536000 },
        month: { name: 'Month (30 days)', symbol: 'mo', factor: 2592000 },
        week: { name: 'Week', symbol: 'wk', factor: 604800 },
        day: { name: 'Day', symbol: 'd', factor: 86400 },
        hour: { name: 'Hour', symbol: 'h', factor: 3600 },
        minute: { name: 'Minute', symbol: 'min', factor: 60 },
        second: { name: 'Second', symbol: 's', factor: 1 },
        millisecond: { name: 'Millisecond', symbol: 'ms', factor: 0.001 },
        microsecond: { name: 'Microsecond', symbol: 'μs', factor: 0.000001 },
        nanosecond: { name: 'Nanosecond', symbol: 'ns', factor: 0.000000001 }
      },
      reference: [
        { unit: '1 year', value: '365 days' },
        { unit: '1 week', value: '7 days' },
        { unit: '1 day', value: '24 hours' },
        { unit: '1 hour', value: '60 minutes' },
        { unit: '1 minute', value: '60 seconds' }
      ]
    },
    data: {
      name: 'Data Storage',
      base: 'byte',
      units: {
        bit: { name: 'Bit', symbol: 'b', factor: 0.125 },
        byte: { name: 'Byte', symbol: 'B', factor: 1 },
        kilobyte: { name: 'Kilobyte', symbol: 'KB', factor: 1024 },
        megabyte: { name: 'Megabyte', symbol: 'MB', factor: 1048576 },
        gigabyte: { name: 'Gigabyte', symbol: 'GB', factor: 1073741824 },
        terabyte: { name: 'Terabyte', symbol: 'TB', factor: 1099511627776 },
        petabyte: { name: 'Petabyte', symbol: 'PB', factor: 1125899906842624 },
        kibibyte: { name: 'Kibibyte', symbol: 'KiB', factor: 1024 },
        mebibyte: { name: 'Mebibyte', symbol: 'MiB', factor: 1048576 },
        gibibyte: { name: 'Gibibyte', symbol: 'GiB', factor: 1073741824 }
      },
      reference: [
        { unit: '1 byte', value: '8 bits' },
        { unit: '1 kilobyte', value: '1,024 bytes' },
        { unit: '1 megabyte', value: '1,024 kilobytes' },
        { unit: '1 gigabyte', value: '1,024 megabytes' },
        { unit: '1 terabyte', value: '1,024 gigabytes' }
      ]
    }
  };

  // ==================== State ====================
  let state = {
    category: 'length',
    fromUnit: 'meter',
    toUnit: 'kilometer',
    fromValue: '',
    history: []
  };

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.converter-tab'),
    fromValue: document.getElementById('fromValue'),
    toValue: document.getElementById('toValue'),
    fromUnit: document.getElementById('fromUnit'),
    toUnit: document.getElementById('toUnit'),
    swapBtn: document.getElementById('swapBtn'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    formulaText: document.getElementById('formulaText'),
    referenceTable: document.getElementById('referenceTable'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn')
  };

  // ==================== Initialization ====================
  function init() {
    loadHistory();
    populateUnits();
    updateReference();
    renderHistory();
    bindEvents();
    elements.fromValue.focus();
  }

  // ==================== Unit Population ====================
  function populateUnits() {
    const category = unitData[state.category];
    const units = category.units;

    // Clear existing options
    elements.fromUnit.innerHTML = '';
    elements.toUnit.innerHTML = '';

    // Add options
    Object.keys(units).forEach(key => {
      const unit = units[key];
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');

      option1.value = key;
      option1.textContent = `${unit.name} (${unit.symbol})`;
      option2.value = key;
      option2.textContent = `${unit.name} (${unit.symbol})`;

      elements.fromUnit.appendChild(option1);
      elements.toUnit.appendChild(option2);
    });

    // Set default selections
    const unitKeys = Object.keys(units);
    state.fromUnit = unitKeys[1] || unitKeys[0]; // Usually base unit
    state.toUnit = unitKeys[0]; // First unit

    elements.fromUnit.value = state.fromUnit;
    elements.toUnit.value = state.toUnit;

    updateFormula();
  }

  // ==================== Conversion Logic ====================
  function convert() {
    const value = parseFloat(elements.fromValue.value);

    if (isNaN(value)) {
      elements.toValue.value = '';
      return;
    }

    let result;

    if (state.category === 'temperature') {
      result = convertTemperature(value, state.fromUnit, state.toUnit);
    } else {
      const category = unitData[state.category];
      const fromFactor = category.units[state.fromUnit].factor;
      const toFactor = category.units[state.toUnit].factor;

      // Convert to base unit, then to target unit
      const baseValue = value * fromFactor;
      result = baseValue / toFactor;
    }

    // Format result
    elements.toValue.value = formatNumber(result);

    // Update formula
    updateFormula();
  }

  function convertTemperature(value, from, to) {
    // First convert to Celsius
    let celsius;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      case 'rankine':
        celsius = (value - 491.67) * 5 / 9;
        break;
    }

    // Then convert from Celsius to target
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9 / 5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      case 'rankine':
        return (celsius + 273.15) * 9 / 5;
    }
  }

  function formatNumber(num) {
    if (num === 0) return '0';

    const absNum = Math.abs(num);

    // Very small or very large numbers use scientific notation
    if (absNum < 0.000001 || absNum >= 1000000000) {
      return num.toExponential(6);
    }

    // Regular numbers with appropriate decimal places
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    }

    // Determine decimal places based on magnitude
    let decimals = 6;
    if (absNum >= 100) decimals = 4;
    else if (absNum >= 10) decimals = 5;

    return parseFloat(num.toFixed(decimals)).toLocaleString(undefined, {
      maximumFractionDigits: decimals
    });
  }

  // ==================== Formula Display ====================
  function updateFormula() {
    const category = unitData[state.category];
    const fromUnit = category.units[state.fromUnit];
    const toUnit = category.units[state.toUnit];

    if (state.category === 'temperature') {
      elements.formulaText.textContent = getTemperatureFormula(state.fromUnit, state.toUnit);
    } else {
      const ratio = fromUnit.factor / toUnit.factor;
      elements.formulaText.textContent = `1 ${fromUnit.symbol} = ${formatNumber(ratio)} ${toUnit.symbol}`;
    }
  }

  function getTemperatureFormula(from, to) {
    const formulas = {
      'celsius-fahrenheit': '°F = (°C × 9/5) + 32',
      'celsius-kelvin': 'K = °C + 273.15',
      'celsius-rankine': '°R = (°C + 273.15) × 9/5',
      'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
      'fahrenheit-kelvin': 'K = (°F + 459.67) × 5/9',
      'fahrenheit-rankine': '°R = °F + 459.67',
      'kelvin-celsius': '°C = K - 273.15',
      'kelvin-fahrenheit': '°F = (K × 9/5) - 459.67',
      'kelvin-rankine': '°R = K × 9/5',
      'rankine-celsius': '°C = (°R - 491.67) × 5/9',
      'rankine-fahrenheit': '°F = °R - 459.67',
      'rankine-kelvin': 'K = °R × 5/9'
    };

    if (from === to) return 'Same unit';
    return formulas[`${from}-${to}`] || '-';
  }

  // ==================== Reference Table ====================
  function updateReference() {
    const category = unitData[state.category];
    const reference = category.reference;

    elements.referenceTable.innerHTML = reference.map(item => `
      <div class="reference-item">
        <span class="unit">${item.unit}</span>
        <span class="value">${item.value}</span>
      </div>
    `).join('');
  }

  // ==================== History ====================
  function loadHistory() {
    try {
      const saved = localStorage.getItem('unitConverterHistory');
      if (saved) {
        state.history = JSON.parse(saved);
      }
    } catch (e) {
      state.history = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('unitConverterHistory', JSON.stringify(state.history));
    } catch (e) {
      // Storage full or unavailable
    }
  }

  function addToHistory() {
    const fromValue = parseFloat(elements.fromValue.value);
    const toValue = elements.toValue.value;

    if (isNaN(fromValue) || !toValue) return;

    const category = unitData[state.category];
    const fromUnit = category.units[state.fromUnit];
    const toUnit = category.units[state.toUnit];

    const entry = {
      category: state.category,
      from: `${formatNumber(fromValue)} ${fromUnit.symbol}`,
      to: `${toValue} ${toUnit.symbol}`,
      timestamp: Date.now()
    };

    // Avoid duplicates
    const isDuplicate = state.history.some(h =>
      h.from === entry.from && h.to === entry.to && h.category === entry.category
    );

    if (!isDuplicate) {
      state.history.unshift(entry);

      // Keep only last 20 entries
      if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
      }

      saveHistory();
      renderHistory();
    }
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = `
        <div class="history-empty">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <p>No conversion history yet</p>
        </div>
      `;
      return;
    }

    elements.historyList.innerHTML = state.history.map((entry, index) => `
      <div class="history-item" data-index="${index}" title="Click to use this conversion">
        <div class="history-conversion">
          <span class="from">${entry.from}</span>
          <i class="fa-solid fa-arrow-right"></i>
          <span class="to">${entry.to}</span>
        </div>
        <span class="history-category">${entry.category}</span>
      </div>
    `).join('');

    // Bind click events to history items
    const historyItems = elements.historyList.querySelectorAll('.history-item');
    historyItems.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        const entry = state.history[index];
        if (entry) {
          // Switch to the category
          changeCategory(entry.category);
          // Extract numeric value from the "from" string
          const fromValue = entry.from.replace(/[^\d.-]/g, '');
          elements.fromValue.value = fromValue;
          convert();
        }
      });
    });
  }

  function clearHistory() {
    state.history = [];
    saveHistory();
    renderHistory();
    showToast('History cleared');
  }

  // ==================== Swap Units ====================
  function swapUnits() {
    const tempUnit = state.fromUnit;
    state.fromUnit = state.toUnit;
    state.toUnit = tempUnit;

    elements.fromUnit.value = state.fromUnit;
    elements.toUnit.value = state.toUnit;

    // Swap values if there's a result
    if (elements.toValue.value) {
      const resultValue = elements.toValue.value.replace(/,/g, '');
      elements.fromValue.value = resultValue;
    }

    convert();
  }

  // ==================== Category Change ====================
  function changeCategory(category) {
    state.category = category;

    // Update active tab
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Reset values
    elements.fromValue.value = '';
    elements.toValue.value = '';

    // Repopulate units
    populateUnits();
    updateReference();
  }

  // ==================== Toast ====================
  function showToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    }
  }

  // ==================== Copy Result ====================
  function copyResult() {
    const result = elements.toValue.value;
    if (!result) {
      showToast('No result to copy');
      return;
    }

    navigator.clipboard.writeText(result).then(() => {
      showToast('Result copied!');
    }).catch(() => {
      showToast('Failed to copy');
    });
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Tab clicks
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        changeCategory(tab.dataset.category);
      });
    });

    // Input change
    elements.fromValue.addEventListener('input', () => {
      convert();
    });

    // Add to history on blur or Enter
    elements.fromValue.addEventListener('blur', addToHistory);
    elements.fromValue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addToHistory();
      }
    });

    // Unit selects
    elements.fromUnit.addEventListener('change', (e) => {
      state.fromUnit = e.target.value;
      convert();
    });

    elements.toUnit.addEventListener('change', (e) => {
      state.toUnit = e.target.value;
      convert();
    });

    // Swap button
    elements.swapBtn.addEventListener('click', swapUnits);

    // Copy result button
    elements.copyResultBtn.addEventListener('click', copyResult);

    // Clear history
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Shortcuts modal
    elements.closeShortcutsBtn.addEventListener('click', () => {
      elements.shortcutsModal.classList.remove('active');
    });

    elements.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === elements.shortcutsModal) {
        elements.shortcutsModal.classList.remove('active');
      }
    });
  }

  function handleKeyboard(e) {
    // Don't interfere with input typing
    if (e.target.tagName === 'INPUT' && e.target.type !== 'button') {
      if (e.key === 'Escape') {
        elements.fromValue.value = '';
        elements.toValue.value = '';
        elements.fromValue.blur();
      }
      return;
    }

    // Category shortcuts (1-8)
    const categories = ['length', 'weight', 'temperature', 'volume', 'area', 'speed', 'time', 'data'];
    const num = parseInt(e.key);
    if (num >= 1 && num <= 8) {
      changeCategory(categories[num - 1]);
      return;
    }

    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault();
        swapUnits();
        break;
      case 'c':
        e.preventDefault();
        copyResult();
        break;
      case '?':
        e.preventDefault();
        elements.shortcutsModal.classList.toggle('active');
        break;
      case 'escape':
        elements.shortcutsModal.classList.remove('active');
        break;
    }
  }

  // ==================== Start ====================
  init();
})();
