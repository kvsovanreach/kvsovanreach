/**
 * Lucky Draw Wheel Main Interface Module
 * Manages the main UI and feature switching
 */

document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements for tabs
  const wheelTab = document.getElementById('wheelTab');
  const historyTab = document.getElementById('historyTab');
  const settingsTab = document.getElementById('settingsTab');
  const luckyToolContent = document.getElementById('luckyToolContent');
  
  // Cache description elements
  const wheelDescription = document.getElementById('wheelDescription');
  const historyDescription = document.getElementById('historyDescription');
  const settingsDescription = document.getElementById('settingsDescription');
  
  // Get templates
  const wheelTemplate = document.getElementById('wheelTemplate');
  const historyTemplate = document.getElementById('historyTemplate');
  const settingsTemplate = document.getElementById('settingsTemplate');
  
  // Set up event listeners for tabs
  wheelTab.addEventListener('click', () => showFeature('wheel'));
  historyTab.addEventListener('click', () => showFeature('history'));
  settingsTab.addEventListener('click', () => showFeature('settings'));
  
  /**
   * Shows a specific feature and hides others
   * @param {string} feature - The feature to show ('wheel', 'history', 'settings')
   */
  function showFeature(feature) {
    console.log(`Showing feature: ${feature}`);
    
    // Highlight the selected tab and update description
    highlightTab(feature);
    
    // Clear the tool content area with fade-out animation
    luckyToolContent.classList.add('fade-out');
    
    // Wait for animation to complete
    setTimeout(() => {
      // Clear content
      luckyToolContent.innerHTML = '';
      
      // Determine which template to use
      let template;
      let backLinkId;
      
      switch (feature) {
        case 'wheel':
          template = wheelTemplate.content.cloneNode(true);
          backLinkId = 'backFromWheel';
          break;
        case 'history':
          template = historyTemplate.content.cloneNode(true);
          backLinkId = 'backFromHistory';
          break;
        case 'settings':
          template = settingsTemplate.content.cloneNode(true);
          backLinkId = 'backFromSettings';
          break;
        default:
          return;
      }
      
      // Add the template to the content area
      luckyToolContent.appendChild(template);
      
      // Set up back button
      const backLink = document.getElementById(backLinkId);
      if (backLink) {
        backLink.addEventListener('click', function(e) {
          e.preventDefault();
          // Instead of resetting, just stay at the last active tab
          // We don't hide the feature content in the tab-based design
        });
      }
      
      // Remove fade-out class and add active class with fade-in effect
      luckyToolContent.classList.remove('fade-out');
      luckyToolContent.classList.add('active', 'fade-in');
      
      // Initialize specific feature functionality
      initFeature(feature);
      
      // Scroll to content
      luckyToolContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update URL hash for direct linking
      window.location.hash = feature;
      
      // Remove fade-in class after animation completes
      setTimeout(() => {
        luckyToolContent.classList.remove('fade-in');
      }, 500);
      
    }, 300); // Match the CSS transition duration
  }
  
  /**
   * Highlights the selected tab and updates the description
   * @param {string} feature - The feature to highlight
   */
  function highlightTab(feature) {
    // Remove active class from all tabs
    document.querySelectorAll('.lucky-tab-item').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Remove active class from all descriptions
    document.querySelectorAll('.lucky-tab-description').forEach(desc => {
      desc.classList.remove('active');
    });
    
    // Add active class to selected tab
    const tabId = `${feature}Tab`;
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
      
      // Ensure the tab is visible by scrolling if necessary
      if (window.innerWidth < 576) { // Mobile view
        const tabContainer = document.querySelector('.lucky-tab-container');
        if (tabContainer) {
          const tabRect = selectedTab.getBoundingClientRect();
          const containerRect = tabContainer.getBoundingClientRect();
          
          // If tab is out of view, scroll the container
          if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
            selectedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    }
    
    // Show corresponding description
    const descId = `${feature}Description`;
    const selectedDesc = document.getElementById(descId);
    if (selectedDesc) {
      selectedDesc.classList.add('active');
    }
  }
  
  /**
   * Sets default feature to Wheel if none selected
   */
  function resetToFeatureSelection() {
    // Select the wheel tab by default
    showFeature('wheel');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash
    window.location.hash = 'wheel';
  }
  
  /**
   * Initializes feature-specific functionality
   * @param {string} feature - The feature to initialize
   */
  function initFeature(feature) {
    console.log(`Initializing feature: ${feature}`);
    switch (feature) {
      case 'wheel':
        initWheelFeature();
        break;
      case 'history':
        initHistoryFeature();
        break;
      case 'settings':
        initSettingsFeature();
        break;
    }
  }
  
  /**
   * Initializes the Wheel feature (combined create and spin)
   */
  function initWheelFeature() {
    // Set up segment management
    setupSegmentManagement();
    
    // Attach event listeners for wheel customization
    setupWheelCustomization();
    
    // Initialize the wheel if external module is available
    if (typeof LuckyDrawWheel !== 'undefined') {
      // Initialize with combined mode
      if (LuckyDrawWheel.initWheel) {
        LuckyDrawWheel.initWheel();
      } else if (LuckyDrawWheel.initCreator) {
        // Fallback to separate creator and spinner
        LuckyDrawWheel.initCreator();
        if (LuckyDrawWheel.initSpinner) {
          LuckyDrawWheel.initSpinner();
        }
      }
    }
    
    // Set up spin button
    const spinWheelBtn = document.getElementById('spinWheelBtn');
    console.log('Spin button found:', spinWheelBtn);
    if (spinWheelBtn) {
      // Remove any existing event listeners to avoid duplicates
      spinWheelBtn.replaceWith(spinWheelBtn.cloneNode(true));
      const newSpinButton = document.getElementById('spinWheelBtn');
      
      newSpinButton.addEventListener('click', function() {
        console.log('Spin button clicked!');
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.spin) {
          console.log('Calling wheel spin function');
          LuckyDrawWheel.spin();
        } else {
          console.error('Wheel spinner module not loaded');
          showAlert('Wheel spinner functionality is not available. Please check your internet connection and try refreshing the page.', 'error');
        }
      });
      
      // Add an inline onclick attribute as a fallback
      newSpinButton.setAttribute('onclick', "console.log('Inline click'); if(LuckyDrawWheel && LuckyDrawWheel.spin) LuckyDrawWheel.spin();");
    } else {
      console.error('Spin button not found in DOM');
    }
    
    // Set up the result panel actions
    const saveResultBtn = document.getElementById('saveResultBtn');
    const spinAgainBtn = document.getElementById('spinAgainBtn');
    const resetWheelBtn = document.getElementById('resetWheelBtn');
    
    if (saveResultBtn) {
      saveResultBtn.addEventListener('click', function() {
        if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.saveResult) {
          LuckyDrawHistory.saveResult();
          showAlert('Prize result saved successfully!', 'success');
          document.getElementById('resultPanel').style.display = 'none';
        }
      });
    }
    
    if (spinAgainBtn) {
      spinAgainBtn.addEventListener('click', function() {
        document.getElementById('resultPanel').style.display = 'none';
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.resetWheel) {
          LuckyDrawWheel.resetWheel();
        }
      });
    }
    
    if (resetWheelBtn) {
      resetWheelBtn.addEventListener('click', function() {
        if (window.confirm('Are you sure you want to reset the wheel? This will clear all your customizations.')) {
          // Reset to default wheel
          if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.resetToDefault) {
            LuckyDrawWheel.resetToDefault();
            showAlert('Wheel reset to default', 'info');
          }
        }
      });
    }
    
    // Set up wheel title input auto-save
    const wheelTitle = document.getElementById('wheelTitle');
    if (wheelTitle) {
      wheelTitle.addEventListener('change', function() {
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
          LuckyDrawWheel.updatePreview();
        }
      });
    }
    
    // Update spin counter
    updateSpinCounter();
    
    // We need to listen for changes in segment weight inputs to ensure equal distribution when new segments are added
    setupEqualWeightDistribution();
  }
  
  /**
   * Initializes the History feature
   */
  function initHistoryFeature() {
    // Create a small delay to ensure template is fully loaded into DOM
    setTimeout(() => {
      // Initialize history if external module is available
      if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.init) {
        LuckyDrawHistory.init();
      }
      
      // Set up clear history button
      const clearHistoryBtn = document.getElementById('clearHistoryBtn');
      if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
          showConfirmation(
            'Are you sure you want to clear all spin history? This action cannot be undone.',
            function() {
              if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.clearHistory) {
                LuckyDrawHistory.clearHistory();
                showAlert('Spin history cleared successfully', 'success');
              }
            }
          );
        });
      }
      
      // Set up search and filtering
      const historySearch = document.getElementById('historySearch');
      const historySortOrder = document.getElementById('historySortOrder');
      
      if (historySearch) {
        historySearch.addEventListener('input', function() {
          if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.filterHistory) {
            LuckyDrawHistory.filterHistory();
          }
        });
      }
      
      if (historySortOrder) {
        historySortOrder.addEventListener('change', function() {
          if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.sortHistory) {
            LuckyDrawHistory.sortHistory();
          }
        });
      }
    }, 100);
  }
  
  /**
   * Initializes the Settings feature
   */
  function initSettingsFeature() {
    // Load current settings
    if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.loadSettings) {
      LuckyDrawSettings.loadSettings();
    }
    
    // Set up toggle for spin limit settings
    const enableSpinLimit = document.getElementById('enableSpinLimit');
    const spinLimitGroup = document.getElementById('spinLimitGroup');
    
    if (enableSpinLimit && spinLimitGroup) {
      enableSpinLimit.addEventListener('change', function() {
        spinLimitGroup.style.display = this.checked ? 'block' : 'none';
      });
      
      // Initialize visibility based on current setting
      spinLimitGroup.style.display = enableSpinLimit.checked ? 'block' : 'none';
    }
    
    // Set up range input value displays
    setupRangeInputs();
    
    // Set up settings buttons
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const resetAllDataBtn = document.getElementById('resetAllDataBtn');
    
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', function() {
        if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.saveSettings) {
          LuckyDrawSettings.saveSettings();
          showAlert('Settings saved successfully', 'success');
        }
      });
    }
    
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', function() {
        showConfirmation(
          'Are you sure you want to reset all settings to default values?',
          function() {
            if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.resetSettings) {
              LuckyDrawSettings.resetSettings();
              showAlert('Settings reset to defaults', 'success');
            }
          }
        );
      });
    }
    
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', function() {
        if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.exportData) {
          LuckyDrawSettings.exportData();
        }
      });
    }
    
    if (importDataBtn) {
      importDataBtn.addEventListener('click', function() {
        if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.importData) {
          LuckyDrawSettings.importData();
        }
      });
    }
    
    if (resetAllDataBtn) {
      resetAllDataBtn.addEventListener('click', function() {
        showConfirmation(
          'Are you sure you want to reset ALL data? This will clear all wheels, history, and settings. This action cannot be undone.',
          function() {
            if (typeof LuckyDrawSettings !== 'undefined' && LuckyDrawSettings.resetAllData) {
              LuckyDrawSettings.resetAllData();
              showAlert('All data has been reset successfully', 'success');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          }
        );
      });
    }
  }
  
  /**
   * Sets up range input value displays
   */
  function setupRangeInputs() {
    // Setup wheel border width range
    const wheelBorderWidth = document.getElementById('wheelBorderWidth');
    const borderWidthValue = document.getElementById('borderWidthValue');
    
    if (wheelBorderWidth && borderWidthValue) {
      wheelBorderWidth.addEventListener('input', function() {
        borderWidthValue.textContent = `${this.value}px`;
      });
    }
    
    // Setup text font size range
    const textFontSize = document.getElementById('textFontSize');
    const textFontSizeValue = document.getElementById('textFontSizeValue');
    
    if (textFontSize && textFontSizeValue) {
      textFontSize.addEventListener('input', function() {
        textFontSizeValue.textContent = `${this.value}px`;
      });
    }
    
    // Setup spin duration range
    const spinDuration = document.getElementById('spinDuration');
    const spinDurationValue = document.getElementById('spinDurationValue');
    
    if (spinDuration && spinDurationValue) {
      spinDuration.addEventListener('input', function() {
        spinDurationValue.textContent = `${this.value} seconds`;
      });
    }
    
    // Setup spin cycles range
    const spinCycles = document.getElementById('spinCycles');
    const spinCyclesValue = document.getElementById('spinCyclesValue');
    
    if (spinCycles && spinCyclesValue) {
      spinCycles.addEventListener('input', function() {
        spinCyclesValue.textContent = `${this.value} cycles`;
      });
    }
    
    // Setup notification duration range
    const notificationDuration = document.getElementById('notificationDuration');
    const notificationDurationValue = document.getElementById('notificationDurationValue');
    
    if (notificationDuration && notificationDurationValue) {
      notificationDuration.addEventListener('input', function() {
        notificationDurationValue.textContent = `${this.value} seconds`;
      });
    }
    
    // Setup wheel friction range
    const wheelFriction = document.getElementById('wheelFriction');
    const wheelFrictionValue = document.getElementById('wheelFrictionValue');
    
    if (wheelFriction && wheelFrictionValue) {
      wheelFriction.addEventListener('input', function() {
        wheelFrictionValue.textContent = `${this.value}%`;
      });
    }
  }
  
  /**
   * Sets up tab switching in the create feature
   */
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.lucky-tab-btn');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab');
        const tabPanes = document.querySelectorAll('.lucky-tab-pane');
        
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `${tabId}Tab`) {
            pane.classList.add('active');
          }
        });
      });
    });
  }
  
  /**
   * Sets up segment management in the create feature
   */
  function setupSegmentManagement() {
    const segmentsContainer = document.getElementById('segmentsContainer');
    const addSegmentBtn = document.getElementById('addSegmentBtn');
    
    if (addSegmentBtn && segmentsContainer) {
      addSegmentBtn.addEventListener('click', function() {
        addNewSegment();
      });
      
      // Set up delete buttons for existing segments
      setupDeleteSegmentButtons();
    }
    
    // Set up save and preview buttons
    const saveWheelBtn = document.getElementById('saveWheelBtn');
    const previewWheelBtn = document.getElementById('previewWheelBtn');
    
    if (saveWheelBtn) {
      saveWheelBtn.addEventListener('click', function() {
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.saveWheel) {
          const result = LuckyDrawWheel.saveWheel();
          if (result.success) {
            showAlert('Wheel saved successfully!', 'success');
          } else {
            showAlert(result.message || 'Failed to save wheel', 'error');
          }
        }
      });
    }
    
    if (previewWheelBtn) {
      previewWheelBtn.addEventListener('click', function() {
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
          LuckyDrawWheel.updatePreview();
        }
      });
    }
  }
  
  /**
   * Sets up equal weight distribution when adding or removing segments
   */
  function setupEqualWeightDistribution() {
    const segmentsContainer = document.getElementById('segmentsContainer');
    if (!segmentsContainer) return;
    
    // Set up change listener for all segment weight inputs
    segmentsContainer.addEventListener('change', function(event) {
      if (event.target.classList.contains('segment-weight')) {
        // When a weight is manually changed, turn off auto-distribution
        event.target.dataset.manuallySet = 'true';
      }
    });
  }
  
  /**
   * Adds a new segment to the wheel
   */
  function addNewSegment() {
    const segmentsContainer = document.getElementById('segmentsContainer');
    if (!segmentsContainer) return;
    
    // Generate a random color
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    
    // Get current segments count to calculate the default weight
    const existingSegments = document.querySelectorAll('.lucky-segment-item');
    const totalSegments = existingSegments.length + 1; // Including the new one
    
    // Calculate equal weight for all segments
    const equalWeight = Math.floor(100 / totalSegments);
    
    // Create new segment element
    const newSegment = document.createElement('div');
    newSegment.className = 'lucky-segment-item';
    newSegment.innerHTML = `
      <input type="text" placeholder="Prize name" class="segment-label" value="New Prize">
      <input type="color" class="segment-color" value="${randomColor}">
      <input type="number" min="1" max="100" class="segment-weight" value="${equalWeight}">
      <button class="lucky-delete-btn"><i class="fas fa-trash"></i></button>
    `;
    
    // Add to container
    segmentsContainer.appendChild(newSegment);
    
    // Update all segments to have equal weight
    redistributeWeights(equalWeight);
    
    // Set up delete button for the new segment
    const deleteBtn = newSegment.querySelector('.lucky-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        if (document.querySelectorAll('.lucky-segment-item').length > 2) {
          newSegment.remove();
          
          // Recalculate weights after removing
          const remainingSegments = document.querySelectorAll('.lucky-segment-item');
          const newEqualWeight = Math.floor(100 / remainingSegments.length);
          redistributeWeights(newEqualWeight);
          
          // Update wheel preview if available
          if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
            LuckyDrawWheel.updatePreview();
          }
        } else {
          showAlert('You must have at least 2 segments on the wheel', 'warning');
        }
      });
    }
    
    // Update wheel preview if available
    if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
      LuckyDrawWheel.updatePreview();
    }
  }
  
  /**
   * Redistributes weights equally among all segments
   * @param {number} equalWeight - The weight to set for all segments
   */
  function redistributeWeights(equalWeight) {
    const weightInputs = document.querySelectorAll('.segment-weight');
    
    weightInputs.forEach(input => {
      // Only update weights that haven't been manually set
      if (!input.dataset.manuallySet) {
        input.value = equalWeight;
      }
    });
  }
  
  /**
   * Sets up delete buttons for existing segments
   */
  function setupDeleteSegmentButtons() {
    const deleteButtons = document.querySelectorAll('.lucky-delete-btn');
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const segmentItem = this.closest('.lucky-segment-item');
        if (document.querySelectorAll('.lucky-segment-item').length > 2) {
          segmentItem.remove();
          
          // Recalculate weights after removing
          const remainingSegments = document.querySelectorAll('.lucky-segment-item');
          const newEqualWeight = Math.floor(100 / remainingSegments.length);
          redistributeWeights(newEqualWeight);
          
          // Update wheel preview if available
          if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
            LuckyDrawWheel.updatePreview();
          }
        } else {
          showAlert('You must have at least 2 segments on the wheel', 'warning');
        }
      });
    });
  }
  
  /**
   * Sets up wheel customization options
   */
  function setupWheelCustomization() {
    // Set up color pickers and other customization options
    const wheelBorderColor = document.getElementById('wheelBorderColor');
    const wheelTextColor = document.getElementById('wheelTextColor');
    const wheelSize = document.getElementById('wheelSize');
    const wheelBorderWidth = document.getElementById('wheelBorderWidth');
    const textFontSize = document.getElementById('textFontSize');
    
    // Add change listeners to update preview
    const customizationElements = [
      wheelBorderColor, wheelTextColor, wheelSize, 
      wheelBorderWidth, textFontSize
    ];
    
    customizationElements.forEach(element => {
      if (element) {
        element.addEventListener('change', function() {
          if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
            LuckyDrawWheel.updatePreview();
          }
        });
      }
    });
    
    // Also update on input for range sliders
    if (wheelBorderWidth) {
      wheelBorderWidth.addEventListener('input', function() {
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
          LuckyDrawWheel.updatePreview();
        }
      });
    }
    
    if (textFontSize) {
      textFontSize.addEventListener('input', function() {
        if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.updatePreview) {
          LuckyDrawWheel.updatePreview();
        }
      });
    }
  }
  
  /**
   * Updates the spin counter with current data
   */
  function updateSpinCounter() {
    const spinsCount = document.getElementById('spinsCount');
    const spinLimitInfo = document.getElementById('spinLimitInfo');
    
    if (spinsCount && spinLimitInfo) {
      // Get spins data from localStorage
      const currentDate = new Date().toLocaleDateString();
      const spinsData = JSON.parse(localStorage.getItem('luckyDrawSpinsData') || '{}');
      const todaySpins = spinsData[currentDate] || 0;
      
      // Update counter
      spinsCount.textContent = todaySpins;
      
      // Check if spin limit is enabled
      const settings = JSON.parse(localStorage.getItem('luckyDrawSettings') || '{}');
      if (settings.enableSpinLimit) {
        const maxSpins = settings.spinLimitCount || 3;
        const remaining = Math.max(0, maxSpins - todaySpins);
        spinLimitInfo.textContent = `Limit: ${remaining} remaining`;
        
        if (remaining === 0) {
          spinLimitInfo.style.color = 'var(--lucky-danger)';
          
          // Disable spin button if limit reached
          const spinWheelBtn = document.getElementById('spinWheelBtn');
          if (spinWheelBtn) {
            spinWheelBtn.disabled = true;
            spinWheelBtn.classList.add('disabled');
            spinWheelBtn.title = 'Daily spin limit reached';
          }
        }
      } else {
        spinLimitInfo.textContent = 'No limit';
      }
    }
  }
  
  /**
   * Shows a confirmation modal
   * @param {string} message - The confirmation message
   * @param {Function} onConfirm - Callback function to execute on confirmation
   */
  function showConfirmation(message, onConfirm) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const closeModal = document.querySelector('.lucky-close-modal');
    
    if (confirmationModal && confirmationMessage && confirmBtn && cancelBtn) {
      // Set message
      confirmationMessage.textContent = message;
      
      // Set up confirm button
      confirmBtn.onclick = function() {
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
        confirmationModal.classList.remove('active');
      };
      
      // Set up cancel button and close button
      const closeModalFn = function() {
        confirmationModal.classList.remove('active');
      };
      
      cancelBtn.onclick = closeModalFn;
      if (closeModal) {
        closeModal.onclick = closeModalFn;
      }
      
      // Show modal
      confirmationModal.classList.add('active');
    }
  }
  
  /**
   * Shows an alert message
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    // Check if the alert container exists, if not create it
    let alertContainer = document.getElementById('luckyAlertContainer');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'luckyAlertContainer';
      document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertId = 'alert-' + Date.now();
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `lucky-alert lucky-alert-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
      case 'success':
        icon = 'check-circle';
        break;
      case 'error':
        icon = 'exclamation-circle';
        break;
      case 'warning':
        icon = 'exclamation-triangle';
        break;
    }
    
    // Add content
    alertElement.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
      <button class="lucky-alert-close">&times;</button>
    `;
    
    // Add to container
    alertContainer.appendChild(alertElement);
    
    // Show alert with animation
    setTimeout(() => {
      alertElement.classList.add('lucky-alert-show');
    }, 10);
    
    // Setup close button
    const closeBtn = alertElement.querySelector('.lucky-alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeAlert(alertId);
      });
    }
    
    // Auto close after 3 seconds
    setTimeout(() => {
      closeAlert(alertId);
    }, 3000);
  }
  
  /**
   * Closes an alert with animation
   * @param {string} alertId - The ID of the alert to close
   */
  function closeAlert(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.classList.remove('lucky-alert-show');
      alertElement.classList.add('lucky-alert-closing');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        alertElement.remove();
      }, 300);
    }
  }
  
  // Check URL hash for direct feature access
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      switch (hash) {
        case 'wheel':
        case 'history':
        case 'settings':
          showFeature(hash);
          break;
        case 'create':
        case 'spin':
          // Handle old URLs
          showFeature('wheel');
          break;
        default:
          // If hash doesn't match any feature, default to wheel
          showFeature('wheel');
          break;
      }
    } else {
      // If no hash is present, default to wheel tab
      showFeature('wheel');
    }
  }
  
  // Check hash on load
  checkUrlHash();
  
  // Listen for hash changes
  window.addEventListener('hashchange', checkUrlHash);
  
  // Global export for access from other modules
  window.LuckyDrawTool = {
    showFeature,
    resetToFeatureSelection,
    showAlert,
    showConfirmation,
    updateSpinCounter
  };
});