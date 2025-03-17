/**
 * Calculator History Module
 * Handles calculation history storage and display
 */

const CalculatorHistory = (function() {
  // Private variables
  const MAX_HISTORY_ITEMS = 50;
  let historyItems = [];
  let historyList;
  let clearHistoryBtn;
  
  /**
   * Initializes the history module
   */
  function init() {
    // Cache DOM elements
    historyList = document.getElementById('historyList');
    clearHistoryBtn = document.getElementById('clearHistory');
    
    // Load history from localStorage
    loadHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial history
    renderHistory();
  }
  
  /**
   * Sets up event listeners for history features
   */
  function setupEventListeners() {
    // Clear history button
    clearHistoryBtn.addEventListener('click', () => {
      clearHistory();
    });
  }
  
  /**
   * Loads calculation history from localStorage
   */
  function loadHistory() {
    try {
      const savedHistory = localStorage.getItem('calculatorHistory');
      if (savedHistory) {
        historyItems = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error loading history from storage:', error);
      historyItems = [];
    }
  }
  
  /**
   * Saves calculation history to localStorage
   */
  function saveHistory() {
    try {
      localStorage.setItem('calculatorHistory', JSON.stringify(historyItems));
    } catch (error) {
      console.error('Error saving history to storage:', error);
    }
  }
  
  /**
   * Renders the history items in the history panel
   */
  function renderHistory() {
    // Clear the current list
    historyList.innerHTML = '';
    
    // Create the history items
    if (historyItems.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'calc-history-empty';
      emptyMessage.innerHTML = '<p>No calculation history</p>';
      historyList.appendChild(emptyMessage);
    } else {
      // Add all history items (newest first)
      historyItems.slice().reverse().forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'calc-history-item';
        historyItem.innerHTML = `
          <div class="calc-history-expression">${item.expression}</div>
          <div class="calc-history-result">${item.result}</div>
        `;
        
        // Add click handler to use this calculation
        historyItem.addEventListener('click', () => {
          useHistoryItem(item);
        });
        
        historyList.appendChild(historyItem);
      });
    }
  }
  
  /**
   * Adds a new calculation to the history
   * @param {Object} entry - The calculation entry object with expression and result
   */
  function addEntry(entry) {
    // Add the entry to the beginning of the array
    historyItems.push(entry);
    
    // Limit the history size
    if (historyItems.length > MAX_HISTORY_ITEMS) {
      historyItems.shift();
    }
    
    // Save and render the updated history
    saveHistory();
    renderHistory();
  }
  
  /**
   * Clears all history items
   */
  function clearHistory() {
    // Confirm before clearing
    const confirmed = confirm('Are you sure you want to clear all calculation history?');
    if (!confirmed) return;
    
    // Clear history
    historyItems = [];
    saveHistory();
    renderHistory();
    
    // Update the small history display
    document.getElementById('historyContent').textContent = '';
    
    // Show confirmation
    CalculatorUI.showAlert('Calculation history cleared', 'info');
  }
  
  /**
   * Uses a history item in the calculator
   * @param {Object} item - The history item to use
   */
  function useHistoryItem(item) {
    // Set the current input to the result of the history item
    CalculatorCore.setCurrentInput(item.result.toString());
    
    // Show small notification
    CalculatorUI.showAlert('History item selected', 'info');
    
    // Close the history panel
    document.getElementById('historyPanel').classList.remove('active');
    document.getElementById('toggleHistoryBtn').innerHTML = '<i class="fas fa-history"></i> History';
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    addEntry,
    clearHistory,
    getHistory: () => historyItems.slice()
  };
})();