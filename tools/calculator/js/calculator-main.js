/**
 * Calculator Main Module
 * Entry point for the calculator application
 */

(function() {
  // Initialize the calculator when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // All individual modules self-initialize, but we need to
    // coordinate any cross-module functionality here
    
    // Set up keyboard shortcuts for tab switching
    setupGlobalKeyboardShortcuts();
    
    // Set up keyboard help toggle
    setupKeyboardHelp();
    
    // Welcome message
    setTimeout(() => {
      CalculatorUI.showAlert('Welcome to the Advanced Calculator', 'info');
    }, 1000);
    
    // Add error handling
    setupErrorHandling();
    
    // Set up validation
    setupValidation();
  });
  
  /**
   * Sets up global keyboard shortcuts for the calculator
   */
  function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Skip if we're in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Skip if keyboard is disabled
      if (!document.getElementById('keyboardToggle').checked) {
        return;
      }
      
      // Tab switching shortcuts
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            CalculatorUI.setActiveTab('standardTab');
            break;
          case '2':
            event.preventDefault();
            CalculatorUI.setActiveTab('scientificTab');
            break;
          case '3':
            event.preventDefault();
            CalculatorUI.setActiveTab('unitTab');
            break;
          case 'h':
          case 'H':
            event.preventDefault();
            document.getElementById('toggleHistoryBtn').click();
            break;
          case 'c':
          case 'C':
            event.preventDefault();
            document.getElementById('copyResultBtn').click();
            break;
        }
      }
    });
  }
  
  /**
   * Sets up the keyboard help toggle
   */
  function setupKeyboardHelp() {
    const helpToggleBtn = document.getElementById('helpToggleBtn');
    const helpContent = document.getElementById('helpContent');
    
    if (helpToggleBtn && helpContent) {
      helpToggleBtn.addEventListener('click', () => {
        helpContent.classList.toggle('active');
      });
      
      // Close help when clicking outside
      document.addEventListener('click', (event) => {
        if (!helpToggleBtn.contains(event.target) && !helpContent.contains(event.target)) {
          helpContent.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Sets up global error handling
   */
  function setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      CalculatorUI.showAlert('An error occurred. Please try again.', 'error');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      CalculatorUI.showAlert('An error occurred. Please try again.', 'error');
    });
  }
  
  /**
   * Sets up validation for input fields
   */
  function setupValidation() {
    // Prevent invalid input in the converter's fromValue field
    const fromValueInput = document.getElementById('fromValue');
    if (fromValueInput) {
      fromValueInput.addEventListener('input', function() {
        // Allow numbers, decimal point, and minus sign
        const value = this.value;
        const sanitizedValue = value.replace(/[^0-9.-]/g, '');
        
        // Ensure only one decimal point
        const decimalCount = (sanitizedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          this.value = sanitizedValue.replace(/\.(?=.*\.)/g, '');
          return;
        }
        
        // Ensure only one minus sign at the beginning
        if (sanitizedValue.lastIndexOf('-') > 0) {
          this.value = sanitizedValue.replace(/-(?!^)/g, '');
          return;
        }
        
        // Update the value if it was changed
        if (value !== sanitizedValue) {
          this.value = sanitizedValue;
        }
      });
    }
  }
  
  /**
   * Handles errors that may occur in the calculator
   * @param {Error} error - The error that occurred
   * @param {string} source - The source of the error
   */
  function handleError(error, source) {
    console.error(`Error in ${source}:`, error);
    CalculatorUI.showAlert(`An error occurred in ${source}: ${error.message}`, 'error');
  }
  
  // Expose to global scope for debugging only
  window.CalculatorDebug = {
    handleError
  };
})();