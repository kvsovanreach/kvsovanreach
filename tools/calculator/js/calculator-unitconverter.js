/**
 * Calculator Unit Converter Module
 * Handles unit conversions for various measurement types
 */

const CalculatorUnitConverter = (function() {
  // Private variables
  let unitCategory;
  let fromUnit;
  let toUnit;
  let fromValue;
  let toValue;
  let unitCategorySelect;
  let fromUnitSelect;
  let toUnitSelect;
  let fromValueInput;
  let toValueInput;
  let conversionFormula;
  let swapUnitsBtn;
  
  // Unit conversion factors - base unit for each category is the first one
  const unitConversions = {
    length: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      inch: 39.3701,
      foot: 3.28084,
      yard: 1.09361,
      mile: 0.000621371
    },
    weight: {
      gram: 1,
      kilogram: 0.001,
      milligram: 1000,
      pound: 0.00220462,
      ounce: 0.035274,
      ton: 0.000001,
      stone: 0.000157473
    },
    temperature: {
      celsius: 0,
      fahrenheit: 32,
      kelvin: 273.15
    },
    time: {
      second: 1,
      minute: 1/60,
      hour: 1/3600,
      day: 1/86400,
      week: 1/604800,
      month: 1/2629746,
      year: 1/31556952
    },
    area: {
      'square meter': 1,
      'square kilometer': 0.000001,
      'square centimeter': 10000,
      'square millimeter': 1000000,
      'square inch': 1550,
      'square foot': 10.7639,
      'square yard': 1.19599,
      'square mile': 3.861e-7,
      'hectare': 0.0001,
      'acre': 0.000247105
    },
    volume: {
      'cubic meter': 1,
      'cubic centimeter': 1000000,
      'cubic millimeter': 1000000000,
      'liter': 1000,
      'milliliter': 1000000,
      'gallon (US)': 264.172,
      'quart (US)': 1056.69,
      'pint (US)': 2113.38,
      'cup (US)': 4226.75,
      'fluid ounce (US)': 33814,
      'gallon (UK)': 219.969,
      'quart (UK)': 879.877,
      'pint (UK)': 1759.75,
      'cup (UK)': 3519.51,
      'fluid ounce (UK)': 35195.1
    },
    speed: {
      'meter/second': 1,
      'kilometer/hour': 3.6,
      'mile/hour': 2.23694,
      'foot/second': 3.28084,
      'knot': 1.94384
    },
    pressure: {
      'pascal': 1,
      'kilopascal': 0.001,
      'megapascal': 0.000001,
      'bar': 0.00001,
      'atmosphere': 9.86923e-6,
      'torr': 0.00750062,
      'psi': 0.000145038
    },
    energy: {
      'joule': 1,
      'kilojoule': 0.001,
      'calorie': 0.239006,
      'kilocalorie': 0.000239006,
      'watt-hour': 0.000277778,
      'kilowatt-hour': 2.77778e-7,
      'electronvolt': 6.242e+18,
      'british thermal unit': 0.000947817
    }
  };
  
  /**
   * Initializes the unit converter
   */
  function init() {
    // Cache DOM elements
    unitCategorySelect = document.getElementById('unitCategory');
    fromUnitSelect = document.getElementById('fromUnit');
    toUnitSelect = document.getElementById('toUnit');
    fromValueInput = document.getElementById('fromValue');
    toValueInput = document.getElementById('toValue');
    conversionFormula = document.getElementById('conversionFormula');
    swapUnitsBtn = document.getElementById('swapUnits');
    
    // Set initial values
    unitCategory = unitCategorySelect.value;
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate unit dropdowns for initial category
    populateUnitDropdowns();
    
    // Set up keypad for unit converter
    setupUnitKeypad();
  }
  
  /**
   * Sets up event listeners for the unit converter
   */
  function setupEventListeners() {
    // Category selection change
    unitCategorySelect.addEventListener('change', () => {
      unitCategory = unitCategorySelect.value;
      populateUnitDropdowns();
      updateConversionFormula();
    });
    
    // From unit selection change
    fromUnitSelect.addEventListener('change', () => {
      fromUnit = fromUnitSelect.value;
      performConversion();
      updateConversionFormula();
    });
    
    // To unit selection change
    toUnitSelect.addEventListener('change', () => {
      toUnit = toUnitSelect.value;
      performConversion();
      updateConversionFormula();
    });
    
    // From value input change
    fromValueInput.addEventListener('input', () => {
      performConversion();
    });
    
    // Swap units button
    swapUnitsBtn.addEventListener('click', swapUnits);
    
    // Convert button (in keypad)
    document.querySelector('[data-unit-key="convert"]').addEventListener('click', performConversion);
  }
  
  /**
   * Populates unit dropdowns based on selected category
   */
  function populateUnitDropdowns() {
    // Clear existing options
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // Get units for selected category
    const units = Object.keys(unitConversions[unitCategory]);
    
    // Populate dropdowns
    units.forEach(unit => {
      fromUnitSelect.appendChild(new Option(unit, unit));
      toUnitSelect.appendChild(new Option(unit, unit));
    });
    
    // Set default selections
    fromUnit = units[0];
    toUnit = units.length > 1 ? units[1] : units[0];
    fromUnitSelect.value = fromUnit;
    toUnitSelect.value = toUnit;
    
    // Update the conversion formula
    updateConversionFormula();
    
    // Clear input and result
    fromValueInput.value = '';
    toValueInput.value = '';
  }
  
  /**
   * Updates the conversion formula display
   */
  function updateConversionFormula() {
    if (unitCategory === 'temperature') {
      // Temperature conversions need special handling
      conversionFormula.innerHTML = getTemperatureConversionFormula(fromUnit, toUnit);
    } else {
      // For other unit types, show the conversion ratio
      const fromFactor = unitConversions[unitCategory][fromUnit];
      const toFactor = unitConversions[unitCategory][toUnit];
      const ratio = toFactor / fromFactor;
      
      conversionFormula.innerHTML = `<p>1 ${fromUnit} = ${ratio.toFixed(6)} ${toUnit}</p>`;
    }
  }
  
  /**
   * Gets the temperature conversion formula text
   * @param {string} from - From temperature unit
   * @param {string} to - To temperature unit
   * @returns {string} The conversion formula HTML
   */
  function getTemperatureConversionFormula(from, to) {
    if (from === to) return `<p>No conversion needed for ${from}</p>`;
    
    let formula = '<p>';
    
    switch (from + '-' + to) {
      case 'celsius-fahrenheit':
        formula += '°F = (°C × 9/5) + 32';
        break;
      case 'celsius-kelvin':
        formula += 'K = °C + 273.15';
        break;
      case 'fahrenheit-celsius':
        formula += '°C = (°F - 32) × 5/9';
        break;
      case 'fahrenheit-kelvin':
        formula += 'K = (°F - 32) × 5/9 + 273.15';
        break;
      case 'kelvin-celsius':
        formula += '°C = K - 273.15';
        break;
      case 'kelvin-fahrenheit':
        formula += '°F = (K - 273.15) × 9/5 + 32';
        break;
      default:
        formula += 'Unknown conversion';
    }
    
    formula += '</p>';
    return formula;
  }
  
  /**
   * Performs the unit conversion
   */
  function performConversion() {
    // Get current value from input
    fromValue = parseFloat(fromValueInput.value);
    
    // Check if the value is valid
    if (isNaN(fromValue)) {
      toValueInput.value = '';
      return;
    }
    
    // Perform the conversion based on the category
    if (unitCategory === 'temperature') {
      toValue = convertTemperature(fromValue, fromUnit, toUnit);
    } else {
      const fromFactor = unitConversions[unitCategory][fromUnit];
      const toFactor = unitConversions[unitCategory][toUnit];
      
      // Convert to base unit, then to target unit
      toValue = (fromValue / fromFactor) * toFactor;
    }
    
    // Update the result display, formatted to 6 decimal places
    // Remove trailing zeros after decimal point
    toValueInput.value = Number(toValue.toFixed(6)).toString();
  }
  
  /**
   * Swaps the from and to units
   */
  function swapUnits() {
    // Save current state
    const tempUnit = fromUnit;
    const tempValue = fromValueInput.value;
    
    // Swap units
    fromUnit = toUnit;
    toUnit = tempUnit;
    
    // Update select elements
    fromUnitSelect.value = fromUnit;
    toUnitSelect.value = toUnit;
    
    // Swap values if we have a valid conversion
    if (toValueInput.value) {
      fromValueInput.value = toValueInput.value;
      toValueInput.value = '';
    }
    
    // Update the conversion
    performConversion();
    updateConversionFormula();
    
    // Visual feedback
    swapUnitsBtn.classList.add('rotating');
    setTimeout(() => {
      swapUnitsBtn.classList.remove('rotating');
    }, 300);
  }
  
  /**
   * Converts between temperature units
   * @param {number} value - The temperature value to convert
   * @param {string} fromUnit - The source temperature unit
   * @param {string} toUnit - The target temperature unit
   * @returns {number} The converted temperature
   */
  function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    // Convert to Celsius first (our base unit for temperature)
    let celsius;
    
    switch (fromUnit) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
    }
    
    // Convert from Celsius to target unit
    switch (toUnit) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return (celsius * 9/5) + 32;
      case 'kelvin':
        return celsius + 273.15;
    }
  }
  
  /**
   * Sets up the calculator keypad for unit converter
   */
  function setupUnitKeypad() {
    document.querySelectorAll('[data-unit-key]').forEach(key => {
      key.addEventListener('click', function() {
        const keyValue = this.getAttribute('data-unit-key');
        
        switch (keyValue) {
          case 'clear':
            fromValueInput.value = '';
            toValueInput.value = '';
            break;
          case 'backspace':
            fromValueInput.value = fromValueInput.value.slice(0, -1);
            performConversion();
            break;
          case 'copy':
            navigator.clipboard.writeText(toValueInput.value)
              .then(() => {
                CalculatorUI.showAlert('Conversion result copied to clipboard', 'success');
              })
              .catch(err => {
                console.error('Failed to copy result:', err);
                CalculatorUI.showAlert('Failed to copy conversion result', 'error');
              });
            break;
          case 'convert':
            performConversion();
            break;
          case '-':
            // Toggle negative/positive
            if (fromValueInput.value.startsWith('-')) {
              fromValueInput.value = fromValueInput.value.substring(1);
            } else if (fromValueInput.value !== '') {
              fromValueInput.value = '-' + fromValueInput.value;
            }
            performConversion();
            break;
          default:
            // If it's a number or decimal point
            if (/^[0-9.]$/.test(keyValue)) {
              // Don't allow multiple decimal points
              if (keyValue === '.' && fromValueInput.value.includes('.')) {
                return;
              }
              
              // Place cursor focus on the input field
              fromValueInput.focus();
              
              fromValueInput.value += keyValue;
              performConversion();
            }
        }
      });
    });
    
    // Focus the input when the unit tab is selected
    document.getElementById('unitTab').addEventListener('click', () => {
      setTimeout(() => {
        fromValueInput.focus();
      }, 300);
    });
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    performConversion,
    swapUnits,
    getConversionFormula: (from, to, category) => {
      if (category === 'temperature') {
        return getTemperatureConversionFormula(from, to);
      } else {
        const fromFactor = unitConversions[category][from];
        const toFactor = unitConversions[category][to];
        const ratio = toFactor / fromFactor;
        return `<p>1 ${from} = ${ratio.toFixed(6)} ${to}</p>`;
      }
    }
  };
})();

// Add a style for the swap button animation
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg); }
    }
    
    .rotating {
      animation: rotate 0.3s ease;
    }
  `;
  document.head.appendChild(style);
})();