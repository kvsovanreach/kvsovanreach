/**
 * Lucky Draw Settings Module
 * Handles application settings management
 */

const LuckyDrawSettings = (function() {
  // Default settings
  const defaultSettings = {
    enableSpinLimit: false,
    spinLimitCount: 3,
    requireConfirmation: false,
    showWinNotification: true,
    autoSaveResults: true,
    notificationDuration: 5,
    enableHapticFeedback: true,
    preventDuplicateWins: false,
    wheelFriction: 50
  };
  
  // Current settings
  let currentSettings = { ...defaultSettings };
  
  /**
   * Loads settings from localStorage
   */
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('luckyDrawSettings');
      if (savedSettings) {
        currentSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      } else {
        currentSettings = { ...defaultSettings };
      }
      
      // Update form with loaded settings
      updateSettingsForm();
    } catch (error) {
      console.error('Error loading settings:', error);
      currentSettings = { ...defaultSettings };
    }
  }
  
  /**
   * Updates the settings form with current values
   */
  function updateSettingsForm() {
    // Spin Limitations
    const enableSpinLimit = document.getElementById('enableSpinLimit');
    const spinLimitCount = document.getElementById('spinLimitCount');
    const spinLimitGroup = document.getElementById('spinLimitGroup');
    const requireConfirmation = document.getElementById('requireConfirmation');
    
    if (enableSpinLimit) enableSpinLimit.checked = currentSettings.enableSpinLimit;
    if (spinLimitCount) spinLimitCount.value = currentSettings.spinLimitCount;
    if (spinLimitGroup) spinLimitGroup.style.display = currentSettings.enableSpinLimit ? 'block' : 'none';
    if (requireConfirmation) requireConfirmation.checked = currentSettings.requireConfirmation;
    
    // Result Notifications
    const showWinNotification = document.getElementById('showWinNotification');
    const autoSaveResults = document.getElementById('autoSaveResults');
    const notificationDuration = document.getElementById('notificationDuration');
    const notificationDurationValue = document.getElementById('notificationDurationValue');
    
    if (showWinNotification) showWinNotification.checked = currentSettings.showWinNotification;
    if (autoSaveResults) autoSaveResults.checked = currentSettings.autoSaveResults;
    if (notificationDuration) {
      notificationDuration.value = currentSettings.notificationDuration;
      if (notificationDurationValue) {
        notificationDurationValue.textContent = `${currentSettings.notificationDuration} seconds`;
      }
    }
    
    // Advanced Settings
    const enableHapticFeedback = document.getElementById('enableHapticFeedback');
    const preventDuplicateWins = document.getElementById('preventDuplicateWins');
    const wheelFriction = document.getElementById('wheelFriction');
    const wheelFrictionValue = document.getElementById('wheelFrictionValue');
    
    if (enableHapticFeedback) enableHapticFeedback.checked = currentSettings.enableHapticFeedback;
    if (preventDuplicateWins) preventDuplicateWins.checked = currentSettings.preventDuplicateWins;
    if (wheelFriction) {
      wheelFriction.value = currentSettings.wheelFriction;
      if (wheelFrictionValue) {
        wheelFrictionValue.textContent = `${currentSettings.wheelFriction}%`;
      }
    }
  }
  
  /**
   * Gets the current settings from the form
   */
  function getSettingsFromForm() {
    const settings = { ...currentSettings };
    
    // Spin Limitations
    const enableSpinLimit = document.getElementById('enableSpinLimit');
    const spinLimitCount = document.getElementById('spinLimitCount');
    const requireConfirmation = document.getElementById('requireConfirmation');
    
    if (enableSpinLimit) settings.enableSpinLimit = enableSpinLimit.checked;
    if (spinLimitCount) settings.spinLimitCount = parseInt(spinLimitCount.value, 10);
    if (requireConfirmation) settings.requireConfirmation = requireConfirmation.checked;
    
    // Result Notifications
    const showWinNotification = document.getElementById('showWinNotification');
    const autoSaveResults = document.getElementById('autoSaveResults');
    const notificationDuration = document.getElementById('notificationDuration');
    
    if (showWinNotification) settings.showWinNotification = showWinNotification.checked;
    if (autoSaveResults) settings.autoSaveResults = autoSaveResults.checked;
    if (notificationDuration) settings.notificationDuration = parseInt(notificationDuration.value, 10);
    
    // Advanced Settings
    const enableHapticFeedback = document.getElementById('enableHapticFeedback');
    const preventDuplicateWins = document.getElementById('preventDuplicateWins');
    const wheelFriction = document.getElementById('wheelFriction');
    
    if (enableHapticFeedback) settings.enableHapticFeedback = enableHapticFeedback.checked;
    if (preventDuplicateWins) settings.preventDuplicateWins = preventDuplicateWins.checked;
    if (wheelFriction) settings.wheelFriction = parseInt(wheelFriction.value, 10);
    
    return settings;
  }
  
  /**
   * Saves settings to localStorage
   */
  function saveSettings() {
    try {
      // Get current settings from form
      currentSettings = getSettingsFromForm();
      
      // Save to localStorage
      localStorage.setItem('luckyDrawSettings', JSON.stringify(currentSettings));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, message: 'Failed to save settings: ' + error.message };
    }
  }
  
  /**
   * Resets settings to defaults
   */
  function resetSettings() {
    try {
      // Reset to defaults
      currentSettings = { ...defaultSettings };
      
      // Save to localStorage
      localStorage.setItem('luckyDrawSettings', JSON.stringify(currentSettings));
      
      // Update form
      updateSettingsForm();
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, message: 'Failed to reset settings: ' + error.message };
    }
  }
  
  /**
   * Exports all data (wheel, history, settings) as JSON
   */
  function exportData() {
    try {
      // Get all data
      const data = {
        wheel: JSON.parse(localStorage.getItem('luckyDrawCurrentWheel') || 'null'),
        history: JSON.parse(localStorage.getItem('luckyDrawHistory') || '[]'),
        settings: currentSettings,
        version: '1.0.0',
        exported: new Date().toISOString()
      };
      
      // Create blob with JSON data
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lucky_draw_backup.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
        window.LuckyDrawTool.showAlert('Data exported successfully', 'success');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting data:', error);
      
      // Show error message
      if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
        window.LuckyDrawTool.showAlert('Failed to export data: ' + error.message, 'error');
      }
      
      return { success: false, message: 'Failed to export data: ' + error.message };
    }
  }
  
  /**
   * Creates a file input and prompts user to select a file for import
   */
  function importData() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // Read file
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            // Parse JSON data
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importedData.version || !importedData.settings) {
              throw new Error('Invalid data format');
            }
            
            // Import settings
            if (importedData.settings) {
              currentSettings = { ...defaultSettings, ...importedData.settings };
              localStorage.setItem('luckyDrawSettings', JSON.stringify(currentSettings));
            }
            
            // Import wheel
            if (importedData.wheel) {
              localStorage.setItem('luckyDrawCurrentWheel', JSON.stringify(importedData.wheel));
            }
            
            // Import history
            if (importedData.history && Array.isArray(importedData.history)) {
              localStorage.setItem('luckyDrawHistory', JSON.stringify(importedData.history));
            }
            
            // Show success message
            if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
              window.LuckyDrawTool.showAlert('Data imported successfully', 'success');
            }
            
            // Update settings form
            updateSettingsForm();
            
          } catch (error) {
            console.error('Error importing data:', error);
            
            // Show error message
            if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
              window.LuckyDrawTool.showAlert('Failed to import data: ' + error.message, 'error');
            }
          }
        };
        
        reader.readAsText(file);
      }
    });
    
    // Trigger file selection
    fileInput.click();
  }
  
  /**
   * Resets all data (wheel, history, settings)
   */
  function resetAllData() {
    try {
      // Clear all data
      localStorage.removeItem('luckyDrawCurrentWheel');
      localStorage.removeItem('luckyDrawHistory');
      localStorage.removeItem('luckyDrawSettings');
      localStorage.removeItem('luckyDrawSpinsData');
      
      // Reset current settings to defaults
      currentSettings = { ...defaultSettings };
      
      // Update form
      updateSettingsForm();
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting all data:', error);
      return { success: false, message: 'Failed to reset all data: ' + error.message };
    }
  }
  
  // Public API
  return {
    loadSettings,
    saveSettings,
    resetSettings,
    exportData,
    importData,
    resetAllData
  };
})();