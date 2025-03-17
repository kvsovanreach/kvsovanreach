/**
 * Calculator Core Module
 * Handles basic arithmetic operations and display functionality
 */

const CalculatorCore = (function() {
  // Private variables
  let currentInput = '0';
  let currentExpression = '';
  let lastResult = null;
  let isNewInput = true;
  let expressionDisplay;
  let resultDisplay;
  let historyContent;
  
  /**
   * Initializes the calculator core
   */
  function init() {
    // Cache DOM elements
    expressionDisplay = document.getElementById('expressionDisplay');
    resultDisplay = document.getElementById('resultDisplay');
    historyContent = document.getElementById('historyContent');
    
    // Attach event listeners to number buttons
    document.querySelectorAll('.calc-btn-number').forEach(button => {
      button.addEventListener('click', function() {
        const number = this.getAttribute('data-number');
        addNumber(number);
      });
    });
    
    // Attach event listeners to operation buttons
    document.querySelectorAll('.calc-btn-operation').forEach(button => {
      button.addEventListener('click', function() {
        const operation = this.getAttribute('data-operation');
        addOperation(operation);
      });
    });
    
    // Attach event listeners to special function buttons
    document.querySelectorAll('.calc-btn-special').forEach(button => {
      button.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        performSpecialAction(action);
      });
    });
    
    // Attach event listener to equals button
    document.querySelector('.calc-btn-equals').addEventListener('click', calculate);
    
    // Enable keyboard input
    setupKeyboardInput();
    
    // Set up copy result button
    document.getElementById('copyResultBtn').addEventListener('click', copyResultToClipboard);
    
    // Initialize display
    updateDisplay();
  }
  
  /**
   * Adds a number to the current input
   * @param {string} number - The number to add
   */
  function addNumber(number) {
    // If this is a new input, replace the current input
    if (isNewInput) {
      currentInput = '';
      isNewInput = false;
    }
    
    // Handle special cases for decimal point and leading zeros
    if (number === '.') {
      if (currentInput.includes('.')) return;
      if (currentInput === '') currentInput = '0';
    } else if (number === '00') {
      if (currentInput === '0' || currentInput === '') {
        currentInput = '0';
        return;
      }
    }
    
    // Add number to current input
    currentInput += number;
    
    // Remove leading zero if needed
    if (currentInput.startsWith('0') && !currentInput.startsWith('0.') && currentInput.length > 1) {
      currentInput = currentInput.substring(1);
    }
    
    updateDisplay();
  }
  
  /**
   * Adds an operation to the expression
   * @param {string} operation - The operation to add
   */
  function addOperation(operation) {
    // If there's no current input, and no expression, use 0
    if (currentInput === '' && currentExpression === '') {
      currentInput = '0';
    }
    
    // If we have an expression and a new input, calculate the result first
    if (currentExpression !== '' && !isNewInput) {
      calculate(true);
    }
    
    // Add current input to expression
    currentExpression += currentInput;
    
    // Add operation symbol
    currentExpression += ` ${operation} `;
    
    // Reset for new input
    isNewInput = true;
    
    updateDisplay();
  }
  
  /**
   * Performs a special action like clear, backspace, etc.
   * @param {string} action - The action to perform
   */
  function performSpecialAction(action) {
    switch (action) {
      case 'clear':
        clearCalculator();
        break;
      case 'backspace':
        backspace();
        break;
      case 'percent':
        calculatePercent();
        break;
      case 'ans':
        useLastResult();
        break;
      case 'pi':
        insertConstant(Math.PI);
        break;
      case 'e':
        insertConstant(Math.E);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
    
    updateDisplay();
  }
  
  /**
   * Clears the calculator
   */
  function clearCalculator() {
    currentInput = '0';
    currentExpression = '';
    isNewInput = true;
  }
  
  /**
   * Performs backspace operation
   */
  function backspace() {
    if (isNewInput) {
      // If we're at a new input point, go back to editing the expression
      if (currentExpression.endsWith(' ')) {
        currentExpression = currentExpression.slice(0, -3);
        const parts = currentExpression.split(' ');
        currentInput = parts[parts.length - 1];
        currentExpression = parts.slice(0, -1).join(' ');
        if (currentExpression) currentExpression += ' ';
        isNewInput = false;
      }
    } else {
      // Remove the last character from current input
      currentInput = currentInput.slice(0, -1);
      if (currentInput === '' || currentInput === '-') {
        currentInput = '0';
        isNewInput = true;
      }
    }
  }
  
  /**
   * Calculates the percentage of the current input
   */
  function calculatePercent() {
    if (currentInput === '' || isNewInput) return;
    
    // If we're in the middle of an expression, treat as percentage of previous value
    if (currentExpression !== '') {
      const parts = currentExpression.trim().split(' ');
      const prevValue = parseFloat(parts[parts.length - 2]);
      const percentValue = (prevValue * parseFloat(currentInput)) / 100;
      currentInput = percentValue.toString();
    } else {
      // Otherwise just convert the current input to percentage
      currentInput = (parseFloat(currentInput) / 100).toString();
    }
  }
  
  /**
   * Inserts the last calculation result
   */
  function useLastResult() {
    if (lastResult !== null) {
      currentInput = lastResult.toString();
      isNewInput = false;
    }
  }
  
  /**
   * Inserts a mathematical constant
   * @param {number} value - The constant value to insert
   */
  function insertConstant(value) {
    currentInput = value.toString();
    isNewInput = false;
  }
  
  /**
   * Evaluates the current expression and current input
   * @param {boolean} continuous - Whether this is part of a longer calculation
   */
  function calculate(continuous = false) {
    try {
      // If there's no expression, just show the current input
      if (currentExpression === '') {
        // Check if the current input is a simple fraction like "2/3"
        if (currentInput.includes('/') && !currentInput.includes('(')) {
          const [numerator, denominator] = currentInput.split('/');
          if (denominator === '0') {
            throw new Error('Division by zero');
          }
          currentInput = (parseFloat(numerator) / parseFloat(denominator)).toString();
        }
        
        lastResult = parseFloat(currentInput);
        if (!continuous) {
          addToHistory(currentInput, lastResult);
        }
        isNewInput = true;
        return;
      }
      
      // Create the full expression with the current input
      let fullExpression = currentExpression + currentInput;
      
      // Parse and calculate the expression
      const result = evaluateExpression(fullExpression);
      
      // Save for history
      if (!continuous) {
        addToHistory(fullExpression, result);
      }
      
      // Update state
      lastResult = result;
      currentInput = result.toString();
      currentExpression = '';
      isNewInput = true;
      
      updateDisplay();
    } catch (error) {
      currentInput = '0';
      currentExpression = '';
      isNewInput = true;
      
      resultDisplay.classList.add('calc-error');
      resultDisplay.textContent = 'Error';
      
      CalculatorUI.showAlert(error.message || 'Calculation error', 'error');
      
      setTimeout(() => {
        resultDisplay.classList.remove('calc-error');
        updateDisplay();
      }, 1500);
      
      console.error('Calculation error:', error);
    }
  }
  
  /**
   * Evaluates a mathematical expression string
   * @param {string} expression - The expression to evaluate
   * @returns {number} The result of the evaluation
   */
  function evaluateExpression(expression) {
    // Replace × with * and ÷ with / to make the expression JavaScript-compatible
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
    
    // Handle exponentiation if ^ is used (let the scientific module handle it if available)
    if (typeof CalculatorScientific !== 'undefined' && CalculatorScientific.evaluateExpression) {
      expression = CalculatorScientific.evaluateExpression(expression);
    } else {
      // Fallback: replace ^ with ** for JavaScript exponentiation
      expression = expression.replace(/\^/g, '**');
    }
    
    // Security check: only allow valid mathematical expressions
    if (!/^[0-9+\-*/.() e\d^]+$/.test(expression)) {
      throw new Error('Invalid expression');
    }
    
    // Use Function constructor to evaluate the expression
    // This is safer than eval() but still has limitations
    const result = Function(`'use strict'; return (${expression})`)();
    
    // Check if the result is valid
    if (isNaN(result)) {
      throw new Error('Invalid calculation result');
    }
    
    if (!isFinite(result)) {
      if (result === Infinity) {
        throw new Error('Result is too large');
      } else if (result === -Infinity) {
        throw new Error('Result is too small');
      } else {
        throw new Error('Undefined result');
      }
    }
    
    return result;
  }
  
  /**
   * Adds a calculation to the history
   * @param {string} expression - The expression that was calculated
   * @param {number} result - The result of the calculation
   */
  function addToHistory(expression, result) {
    // Create formatted expression for display
    // Replace * with × and / with ÷ for display
    const displayExpression = expression.replace(/\*/g, '×').replace(/\//g, '÷');
    
    // Format the result
    let formattedResult = result;
    if (typeof CalculatorScientific !== 'undefined' && CalculatorScientific.formatNumber) {
      formattedResult = CalculatorScientific.formatNumber(result);
    }
    
    // Create history entry
    const historyEntry = {
      expression: displayExpression,
      result: formattedResult
    };
    
    // Add to history (using the History module)
    if (typeof CalculatorHistory !== 'undefined') {
      CalculatorHistory.addEntry(historyEntry);
    }
    
    // Update small history display
    historyContent.textContent = `${displayExpression} = ${formattedResult}`;
  }
  
  /**
   * Updates the calculator display
   */
  function updateDisplay() {
    // Update expression display
    // Replace * with × and / with ÷ for display
    const displayExpression = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    expressionDisplay.textContent = displayExpression;
    
    // Update result display
    resultDisplay.textContent = currentInput;
  }
  
  /**
   * Sets up keyboard input for the calculator
   */
  function setupKeyboardInput() {
    const keyboardToggle = document.getElementById('keyboardToggle');
    let keyboardEnabled = keyboardToggle.checked;
    
    // Toggle keyboard input
    keyboardToggle.addEventListener('change', () => {
      keyboardEnabled = keyboardToggle.checked;
      CalculatorUI.showAlert(`Keyboard input ${keyboardEnabled ? 'enabled' : 'disabled'}`, 'info');
    });
    
    // Listen for keyboard events
    document.addEventListener('keydown', (event) => {
      if (!keyboardEnabled) return;
      
      // Skip if active element is an input or select
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
        return;
      }
      
      const key = event.key;
      
      // Prevent default behavior for calculator keys
      if (/^[0-9+\-*/.=()^]$/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
      }
      
      // Handle number keys
      if (/^[0-9.]$/.test(key)) {
        addNumber(key);
      }
      
      // Handle operation keys
      if (['+', '-', '*', '/'].includes(key)) {
        addOperation(key);
      }
      
      // Handle parentheses
      if (key === '(' || key === ')') {
        if (document.querySelector(`[data-parenthesis="${key}"]`)) {
          document.querySelector(`[data-parenthesis="${key}"]`).click();
        }
      }
      
      // Handle power key
      if (key === '^') {
        if (document.querySelector('[data-function="power"]')) {
          document.querySelector('[data-function="power"]').click();
        }
      }
      
      // Handle equals/enter key
      if (key === '=' || key === 'Enter') {
        calculate();
      }
      
      // Handle backspace key
      if (key === 'Backspace') {
        backspace();
        updateDisplay();
      }
      
      // Handle escape key (clear)
      if (key === 'Escape') {
        clearCalculator();
        updateDisplay();
      }
    });
  }
  
  /**
   * Copies the current result to the clipboard
   */
  function copyResultToClipboard() {
    navigator.clipboard.writeText(resultDisplay.textContent)
      .then(() => {
        CalculatorUI.showAlert('Result copied to clipboard', 'success');
      })
      .catch(err => {
        console.error('Failed to copy result:', err);
        CalculatorUI.showAlert('Failed to copy result', 'error');
      });
  }
  
  /**
   * Gets the current input value
   * @returns {string} The current input
   */
  function getCurrentInput() {
    return currentInput;
  }
  
  /**
   * Gets the last calculation result
   * @returns {number} The last result
   */
  function getLastResult() {
    return lastResult;
  }
  
  /**
   * Sets the current input value
   * @param {string} value - The value to set
   */
  function setCurrentInput(value) {
    currentInput = value;
    isNewInput = false;
    updateDisplay();
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    addOperation,
    calculate,
    clearCalculator,
    getCurrentInput,
    getLastResult,
    setCurrentInput,
    updateDisplay,
    evaluateExpression
  };
})();