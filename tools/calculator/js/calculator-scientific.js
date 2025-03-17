/**
 * Scientific Calculator Module
 * Handles advanced mathematical functions and operations
 */

const CalculatorScientific = (function() {
  // Private variables
  let degreeMode = true; // true for degrees, false for radians
  let precision = 6;
  let notationType = 'standard'; // standard, scientific, engineering
  let degRadBtn;
  let precisionSelect;
  let notationSelect;
  
  /**
   * Initializes the scientific calculator
   */
  function init() {
    // Cache DOM elements
    degRadBtn = document.querySelector('[data-action="deg-rad"]');
    precisionSelect = document.getElementById('precision');
    notationSelect = document.getElementById('notation');
    
    // Set up function buttons
    setupFunctionButtons();
    
    // Set up parentheses buttons
    setupParenthesesButtons();
    
    // Set up mode toggle and formatting options
    setupModeAndFormat();
    
    // Fix power operation
    fixPowerOperation();
  }
  
  /**
   * Sets up scientific function buttons
   */
  function setupFunctionButtons() {
    document.querySelectorAll('.calc-btn-function').forEach(button => {
      button.addEventListener('click', function() {
        const functionName = this.getAttribute('data-function');
        applyFunction(functionName);
      });
    });
  }
  
  /**
   * Sets up parentheses buttons
   */
  function setupParenthesesButtons() {
    document.querySelectorAll('.calc-btn-parenthesis').forEach(button => {
      button.addEventListener('click', function() {
        const parenthesis = this.getAttribute('data-parenthesis');
        insertParenthesis(parenthesis);
      });
    });
  }
  
  /**
   * Fixes power operation by ensuring ^ is properly handled in calculations
   */
  function fixPowerOperation() {
    // Patch the evaluate expression function in CalculatorCore
    const originalEvaluateExpression = CalculatorCore.evaluateExpression;
    if (originalEvaluateExpression) {
      CalculatorCore.evaluateExpression = function(expression) {
        // Replace ^ with ** for JavaScript exponentiation
        expression = expression.replace(/\^/g, '**');
        return originalEvaluateExpression(expression);
      };
    }
  }
  
  /**
   * Sets up mode toggle and formatting options
   */
  function setupModeAndFormat() {
    // Degree/Radian toggle
    degRadBtn.addEventListener('click', function() {
      degreeMode = !degreeMode;
      this.textContent = degreeMode ? 'DEG' : 'RAD';
      CalculatorUI.showAlert(`Using ${degreeMode ? 'Degree' : 'Radian'} mode`, 'info');
    });
    
    // Precision selector
    precisionSelect.addEventListener('change', function() {
      precision = parseInt(this.value);
      // Update display if needed
      if (CalculatorCore.getCurrentInput() !== '0') {
        const currentValue = parseFloat(CalculatorCore.getCurrentInput());
        CalculatorCore.setCurrentInput(formatNumber(currentValue));
      }
    });
    
    // Notation selector
    notationSelect.addEventListener('change', function() {
      notationType = this.value;
      // Update display if needed
      if (CalculatorCore.getCurrentInput() !== '0') {
        const currentValue = parseFloat(CalculatorCore.getCurrentInput());
        CalculatorCore.setCurrentInput(formatNumber(currentValue));
      }
    });
    
    // Fraction conversion
    document.querySelector('[data-action="fraction"]').addEventListener('click', convertToFraction);
  }
  
  /**
   * Applies a mathematical function to the current input
   * @param {string} functionName - The name of the function to apply
   */
  function applyFunction(functionName) {
    // Get current input value
    let value = parseFloat(CalculatorCore.getCurrentInput());
    let result;
    
    // Apply the appropriate function
    try {
      switch (functionName) {
        case 'sin':
          result = degreeMode ? Math.sin(value * Math.PI / 180) : Math.sin(value);
          break;
        case 'cos':
          result = degreeMode ? Math.cos(value * Math.PI / 180) : Math.cos(value);
          break;
        case 'tan':
          result = degreeMode ? Math.tan(value * Math.PI / 180) : Math.tan(value);
          break;
        case 'asin':
          if (value < -1 || value > 1) {
            throw new Error('Domain error: asin input must be between -1 and 1');
          }
          result = Math.asin(value);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'acos':
          if (value < -1 || value > 1) {
            throw new Error('Domain error: acos input must be between -1 and 1');
          }
          result = Math.acos(value);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'atan':
          result = Math.atan(value);
          if (degreeMode) result = result * 180 / Math.PI;
          break;
        case 'log':
          if (value <= 0) {
            throw new Error('Domain error: log input must be positive');
          }
          result = Math.log10(value);
          break;
        case 'ln':
          if (value <= 0) {
            throw new Error('Domain error: ln input must be positive');
          }
          result = Math.log(value);
          break;
        case 'sqrt':
          if (value < 0) {
            throw new Error('Domain error: sqrt input must be non-negative');
          }
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
          // For power, we need to add the operation to the expression
          CalculatorCore.addOperation('^');
          return;
        case 'factorial':
          if (value < 0 || !Number.isInteger(value)) {
            throw new Error('Domain error: factorial only defined for non-negative integers');
          }
          result = factorial(value);
          break;
        default:
          console.error(`Unknown function: ${functionName}`);
          return;
      }
      
      // Format and set the result
      CalculatorCore.setCurrentInput(formatNumber(result));
      
    } catch (error) {
      console.error(`Error computing ${functionName}:`, error);
      CalculatorUI.showAlert(error.message || `Error computing ${functionName}(${value})`, 'error');
      CalculatorCore.setCurrentInput('Error');
    }
  }
  
  /**
   * Inserts a parenthesis into the current input
   * @param {string} parenthesis - The parenthesis to insert ('(' or ')')
   */
  function insertParenthesis(parenthesis) {
    // Get the current input
    let currentInput = CalculatorCore.getCurrentInput();
    
    // If starting a new input with opening parenthesis, clear the current input
    if (currentInput === '0' && parenthesis === '(') {
      CalculatorCore.setCurrentInput('(');
    } else {
      // Otherwise append the parenthesis
      CalculatorCore.setCurrentInput(currentInput + parenthesis);
    }
  }
  
  /**
   * Calculates the factorial of a number
   * @param {number} n - The number to calculate factorial for
   * @returns {number} The factorial result
   */
  function factorial(n) {
    // Check if the input is a non-negative integer
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial is only defined for non-negative integers');
    }
    
    // Check for large values to prevent browser hang
    if (n > 170) {
      throw new Error('Factorial too large to compute');
    }
    
    // Base case
    if (n === 0 || n === 1) {
      return 1;
    }
    
    // Calculate factorial iteratively to avoid stack overflow for large numbers
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    
    return result;
  }
  
  /**
   * Converts a decimal number to fraction
   */
  function convertToFraction() {
    // Get current input value
    const value = parseFloat(CalculatorCore.getCurrentInput());
    
    if (isNaN(value)) {
      CalculatorUI.showAlert('Cannot convert to fraction', 'error');
      return;
    }
    
    try {
      const fraction = decimalToFraction(value);
      
      // Format the fraction as a string
      if (fraction.denominator === 1) {
        CalculatorCore.setCurrentInput(fraction.numerator.toString());
      } else {
        // Use actual division for the result to be calculable
        CalculatorCore.setCurrentInput(`${fraction.numerator}/${fraction.denominator}`);
        
        // Show a tooltip with the fraction
        CalculatorUI.showAlert(`${value} ≈ ${fraction.numerator}/${fraction.denominator}`, 'info');
      }
    } catch (error) {
      console.error('Error converting to fraction:', error);
      CalculatorUI.showAlert('Error converting to fraction', 'error');
    }
  }
  
  /**
   * Converts a decimal to a fraction
   * @param {number} decimal - The decimal to convert
   * @returns {Object} Object with numerator and denominator
   */
  function decimalToFraction(decimal) {
    const precision = 1.0E-10;
    
    // Check if it's already an integer
    if (Math.abs(Math.round(decimal) - decimal) < precision) {
      return { numerator: Math.round(decimal), denominator: 1 };
    }
    
    // Check if the decimal is negative
    const isNegative = decimal < 0;
    decimal = Math.abs(decimal);
    
    // Continued fraction algorithm
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = decimal;
    
    // Use a maximum number of iterations to prevent infinite loops
    const maxIterations = 100;
    let i = 0;
    
    do {
      const a = Math.floor(b);
      const aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
      i++;
      
      // We've either found a very close match or reached the iteration limit
      if (Math.abs(decimal - h1 / k1) < decimal * precision || i >= maxIterations) {
        break;
      }
    } while (true);
    
    // Apply the negative sign if needed
    return {
      numerator: isNegative ? -h1 : h1,
      denominator: k1
    };
  }
  
  /**
   * Formats a number according to the current precision and notation settings
   * @param {number} value - The number to format
   * @returns {string} The formatted number as a string
   */
  function formatNumber(value) {
    if (isNaN(value)) return 'Error';
    
    // Handle infinities
    if (!isFinite(value)) {
      return value > 0 ? 'Infinity' : '-Infinity';
    }
    
    // Format based on notation type
    switch (notationType) {
      case 'scientific':
        return value.toExponential(precision);
      
      case 'engineering':
        // Engineering notation uses exponents that are multiples of 3
        const expValue = value.toExponential(precision);
        const parts = expValue.split('e');
        const exponent = parseInt(parts[1]);
        const engineeringExp = Math.floor(exponent / 3) * 3;
        const mantissa = value / Math.pow(10, engineeringExp);
        return mantissa.toFixed(precision) + 'e' + engineeringExp;
      
      case 'standard':
      default:
        // For standard notation, use toFixed for small numbers, exponential for very large/small ones
        if (Math.abs(value) >= 1e10 || (Math.abs(value) < 1e-6 && value !== 0)) {
          return value.toExponential(precision);
        } else {
          // Avoid trailing zeros
          return parseFloat(value.toFixed(precision)).toString();
        }
    }
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    formatNumber,
    isInDegreeMode: () => degreeMode,
    evaluateExpression: (expression) => {
      // Replace ^ with ** for JavaScript exponentiation
      return expression.replace(/\^/g, '**');
    }
  };
})();