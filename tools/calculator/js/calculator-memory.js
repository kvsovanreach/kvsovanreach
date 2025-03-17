/**
 * Calculator Memory Module
 * Handles memory storage and recall functionality
 */

const CalculatorMemory = (function() {
  // Private variables
  const memorySlots = {
    1: null,
    2: null,
    3: null
  };
  
  /**
   * Initializes the memory module
   */
  function init() {
    // Set up memory buttons
    setupMemoryButtons();
    
    // Load memory from localStorage if available
    loadMemoryFromStorage();
    
    // Update memory indicators
    updateMemoryIndicators();
  }
  
  /**
   * Sets up memory button event listeners
   */
  function setupMemoryButtons() {
    // Memory Clear
    document.querySelector('[data-action="memory-clear"]').addEventListener('click', () => {
      clearAllMemory();
    });
    
    // Memory Recall buttons
    document.querySelectorAll('[data-action="memory-recall"]').forEach(button => {
      button.addEventListener('click', function() {
        const slot = this.getAttribute('data-slot');
        recallFromMemory(slot);
      });
    });
    
    // Memory Add buttons
    document.querySelectorAll('[data-action="memory-add"]').forEach(button => {
      button.addEventListener('click', function() {
        const slot = this.getAttribute('data-slot');
        addToMemory(slot);
      });
    });
    
    // Make memory indicators clickable for recall
    document.querySelectorAll('.calc-memory-slot').forEach(slot => {
      slot.addEventListener('click', function() {
        const slotNumber = this.getAttribute('data-slot');
        recallFromMemory(slotNumber);
      });
    });
  }
  
  /**
   * Loads memory values from localStorage
   */
  function loadMemoryFromStorage() {
    try {
      const savedMemory = localStorage.getItem('calculatorMemory');
      if (savedMemory) {
        const parsedMemory = JSON.parse(savedMemory);
        
        // Validate and load each memory slot
        for (const slot in memorySlots) {
          if (parsedMemory[slot] !== undefined && parsedMemory[slot] !== null) {
            memorySlots[slot] = parsedMemory[slot];
          }
        }
      }
    } catch (error) {
      console.error('Error loading memory from storage:', error);
    }
  }
  
  /**
   * Saves current memory values to localStorage
   */
  function saveMemoryToStorage() {
    try {
      localStorage.setItem('calculatorMemory', JSON.stringify(memorySlots));
    } catch (error) {
      console.error('Error saving memory to storage:', error);
    }
  }
  
  /**
   * Updates the memory indicators to show which slots are in use
   */
  function updateMemoryIndicators() {
    for (const slot in memorySlots) {
      const indicator = document.querySelector(`.calc-memory-slot[data-slot="${slot}"]`);
      if (indicator) {
        if (memorySlots[slot] !== null) {
          indicator.classList.add('active');
          indicator.setAttribute('title', `M${slot}: ${memorySlots[slot]}`);
        } else {
          indicator.classList.remove('active');
          indicator.setAttribute('title', `Memory slot ${slot} (empty)`);
        }
      }
    }
  }
  
  /**
   * Adds the current result to a specific memory slot
   * @param {string} slot - The memory slot number
   */
  function addToMemory(slot) {
    const currentValue = parseFloat(CalculatorCore.getCurrentInput());
    
    if (isNaN(currentValue)) {
      CalculatorUI.showAlert('Cannot store invalid number in memory', 'error');
      return;
    }
    
    memorySlots[slot] = currentValue;
    updateMemoryIndicators();
    saveMemoryToStorage();
    
    CalculatorUI.showAlert(`Value stored in memory slot ${slot}`, 'success');
  }
  
  /**
   * Recalls a value from a specific memory slot
   * @param {string} slot - The memory slot number
   */
  function recallFromMemory(slot) {
    if (memorySlots[slot] === null) {
      CalculatorUI.showAlert(`Memory slot ${slot} is empty`, 'warning');
      return;
    }
    
    CalculatorCore.setCurrentInput(memorySlots[slot].toString());
    CalculatorUI.showAlert(`Value recalled from memory slot ${slot}`, 'info');
  }
  
  /**
   * Clears all memory slots
   */
  function clearAllMemory() {
    for (const slot in memorySlots) {
      memorySlots[slot] = null;
    }
    
    updateMemoryIndicators();
    saveMemoryToStorage();
    
    CalculatorUI.showAlert('All memory slots cleared', 'info');
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    getMemoryValue: (slot) => memorySlots[slot],
    addToMemory,
    recallFromMemory,
    clearAllMemory
  };
})();