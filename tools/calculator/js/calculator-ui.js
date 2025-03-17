/**
 * Calculator UI Module
 * Handles UI interaction, tab switching, and theme consistency
 */

const CalculatorUI = (function() {
  // Cache DOM elements
  let tabItems;
  let tabDescriptions;
  let contentPanels;
  let themeButton;
  let historyPanel;
  let toggleHistoryBtn;
  
  /**
   * Initializes the UI module
   */
  function init() {
    // Get DOM elements
    tabItems = document.querySelectorAll('.calc-tab-item');
    tabDescriptions = document.querySelectorAll('.calc-tab-description');
    contentPanels = document.querySelectorAll('.calc-content');
    themeButton = document.getElementById('theme-button');
    historyPanel = document.getElementById('historyPanel');
    toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    
    // Set up tab switching
    setupTabs();
    
    // Set up theme toggle sync
    setupThemeSync();
    
    // Set up history panel toggle
    setupHistoryPanel();
    
    // Set up equation solver tabs
    setupEquationTabs();
  }
  
  /**
   * Sets up tab switching functionality
   */
  function setupTabs() {
    tabItems.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabItems.forEach(t => t.classList.remove('active'));
        tabDescriptions.forEach(desc => desc.classList.remove('active'));
        contentPanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Get the tab id and activate corresponding description and content
        const tabId = tab.id;
        const descriptionElement = document.getElementById(tabId + 'Description');
        const contentElement = document.getElementById(tabId.replace('Tab', 'Content'));
        
        // Only add active class if elements exist
        if (descriptionElement) {
          descriptionElement.classList.add('active');
        }
        
        if (contentElement) {
          contentElement.classList.add('active');
        }
      });
    });
  }
  
  /**
   * Ensures theme toggle is in sync with main site
   */
  function setupThemeSync() {
    // Get the current theme preference from localStorage
    const selectedTheme = localStorage.getItem('selected-theme');
    
    // If there's a theme preference, ensure it's reflected in the calculator
    if (selectedTheme) {
      document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove']('dark-theme');
    }
    
    // Listen for theme changes
    if (themeButton) {
      themeButton.addEventListener('click', () => {
        // Theme change is handled by the main site's JS, we just need to sync with it
        setTimeout(() => {
          const isDarkTheme = document.body.classList.contains('dark-theme');
          console.log(`Theme changed to ${isDarkTheme ? 'dark' : 'light'} mode`);
        }, 100);
      });
    }
  }
  
  /**
   * Sets up the history panel toggle
   */
  function setupHistoryPanel() {
    if (toggleHistoryBtn && historyPanel) {
      toggleHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('active');
        
        // Update button text based on history panel state
        if (historyPanel.classList.contains('active')) {
          toggleHistoryBtn.innerHTML = '<i class="fas fa-times"></i> Close History';
        } else {
          toggleHistoryBtn.innerHTML = '<i class="fas fa-history"></i> History';
        }
      });
    }
  }
  
  /**
   * Sets up the equation solver tab switching
   */
  function setupEquationTabs() {
    const equationTypeBtns = document.querySelectorAll('.calc-equation-type-btn');
    const equationForms = document.querySelectorAll('.calc-equation-form');
    
    equationTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        equationTypeBtns.forEach(b => b.classList.remove('active'));
        equationForms.forEach(form => form.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Activate corresponding form
        const formId = btn.getAttribute('data-equation-type') + 'EquationForm';
        const form = document.getElementById(formId);
        
        if (form) {
          form.classList.add('active');
        }
      });
    });
  }
  
  /**
   * Shows an alert/notification
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `calc-alert calc-alert-${type}`;
    
    // Add icon based on type
    let icon;
    switch (type) {
      case 'success':
        icon = 'fa-check-circle';
        break;
      case 'error':
        icon = 'fa-exclamation-circle';
        break;
      case 'warning':
        icon = 'fa-exclamation-triangle';
        break;
      case 'info':
      default:
        icon = 'fa-info-circle';
    }
    
    alertElement.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
      <button class="calc-alert-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    document.body.appendChild(alertElement);
    
    // Add close button functionality
    const closeButton = alertElement.querySelector('.calc-alert-close');
    closeButton.addEventListener('click', () => {
      alertElement.classList.add('calc-alert-closing');
      setTimeout(() => {
        if (document.body.contains(alertElement)) {
          document.body.removeChild(alertElement);
        }
      }, 300);
    });
    
    // Show alert with animation
    setTimeout(() => {
      alertElement.classList.add('calc-alert-show');
    }, 10);
    
    // Auto-hide after 5 seconds for success and info
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (document.body.contains(alertElement)) {
          alertElement.classList.add('calc-alert-closing');
          setTimeout(() => {
            if (document.body.contains(alertElement)) {
              document.body.removeChild(alertElement);
            }
          }, 300);
        }
      }, 5000);
    }
  }
  
  /**
   * Updates the active tab programmatically
   * @param {string} tabId - The ID of the tab to activate
   */
  function setActiveTab(tabId) {
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.click();
    }
  }
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    showAlert,
    setActiveTab
  };
})();

// Add alert styles
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .calc-alert {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: white;
      color: var(--calc-secondary);
      border-radius: var(--calc-border-radius);
      box-shadow: var(--calc-shadow-lg);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateX(120%);
      transition: transform 0.3s ease;
      max-width: 350px;
    }
    
    .dark-theme .calc-alert {
      background-color: var(--calc-dark);
      color: var(--calc-light);
    }
    
    .calc-alert-show {
      transform: translateX(0);
    }
    
    .calc-alert-closing {
      transform: translateX(120%);
    }
    
    .calc-alert i {
      font-size: 18px;
    }
    
    .calc-alert span {
      flex: 1;
    }
    
    .calc-alert-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: var(--calc-gray);
      padding: 0;
    }
    
    .calc-alert-success {
      border-left: 4px solid var(--calc-success);
    }
    
    .calc-alert-success i {
      color: var(--calc-success);
    }
    
    .calc-alert-error {
      border-left: 4px solid var(--calc-danger);
    }
    
    .calc-alert-error i {
      color: var(--calc-danger);
    }
    
    .calc-alert-warning {
      border-left: 4px solid var(--calc-warning);
    }
    
    .calc-alert-warning i {
      color: var(--calc-warning);
    }
    
    .calc-alert-info {
      border-left: 4px solid var(--calc-primary);
    }
    
    .calc-alert-info i {
      color: var(--calc-primary);
    }
    
    @media (max-width: 576px) {
      .calc-alert {
        left: 20px;
        right: 20px;
        max-width: calc(100% - 40px);
      }
    }
  `;
  document.head.appendChild(style);
})();