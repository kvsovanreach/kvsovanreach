/**
 * Lucky Draw UI Module
 * Provides UI helper functions and utilities
 */

const LuckyDrawUI = (function() {
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
  
  /**
   * Creates and shows a modal dialog
   * @param {string} title - The modal title
   * @param {string} content - The modal content HTML
   * @param {Object} buttons - Object with button definitions {id: function}
   */
  function showModal(title, content, buttons = {}) {
    // Create modal element
    const modalId = 'modal-' + Date.now();
    const modalElement = document.createElement('div');
    modalElement.id = modalId;
    modalElement.className = 'lucky-modal';
    
    // Create modal content
    let buttonsHtml = '';
    for (const id in buttons) {
      buttonsHtml += `<button id="${id}" class="lucky-primary-btn">${id}</button>`;
    }
    
    modalElement.innerHTML = `
      <div class="lucky-modal-content">
        <span class="lucky-close-modal">&times;</span>
        <div class="lucky-modal-header">
          <h3>${title}</h3>
        </div>
        <div class="lucky-modal-body">
          ${content}
        </div>
        <div class="lucky-modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(modalElement);
    
    // Show modal with animation
    setTimeout(() => {
      modalElement.classList.add('active');
    }, 10);
    
    // Setup close button
    const closeBtn = modalElement.querySelector('.lucky-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeModal(modalId);
      });
    }
    
    // Setup buttons
    for (const id in buttons) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', function() {
          const result = buttons[id]();
          if (result !== false) {
            closeModal(modalId);
          }
        });
      }
    }
    
    return modalId;
  }
  
  /**
   * Closes a modal dialog
   * @param {string} modalId - The ID of the modal to close
   */
  function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('active');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        modalElement.remove();
      }, 300);
    }
  }
  
  /**
   * Shows a confirmation dialog
   * @param {string} message - The confirmation message
   * @param {Function} onConfirm - Callback function to execute on confirmation
   * @param {Function} onCancel - Callback function to execute on cancellation
   */
  function showConfirmation(message, onConfirm, onCancel) {
    return showModal(
      'Confirmation',
      `<p>${message}</p>`,
      {
        'Confirm': function() {
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        },
        'Cancel': function() {
          if (typeof onCancel === 'function') {
            onCancel();
          }
        }
      }
    );
  }
  
  /**
   * Applies theme-specific adjustments
   * @param {string} theme - The theme to apply ('light' or 'dark')
   */
  function applyTheme(theme) {
    // Apply theme-specific styles
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Update charts if available
    if (typeof LuckyDrawHistory !== 'undefined' && LuckyDrawHistory.initChart) {
      LuckyDrawHistory.initChart();
    }
  }
  
  /**
   * Handles mobile layout adjustments
   */
  function handleResponsiveLayout() {
    // Adjust layout based on viewport width
    const isMobile = window.innerWidth < 768;
    
    // Mobile-specific adjustments
    if (isMobile) {
      // For example, collapse certain sections
      const accordions = document.querySelectorAll('.lucky-settings-section h3');
      accordions.forEach(accordion => {
        accordion.classList.add('collapsible');
        accordion.addEventListener('click', function() {
          this.classList.toggle('active');
          const content = this.nextElementSibling;
          if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
          }
        });
      });
    }
  }
  
  // Public API
  return {
    showAlert,
    closeAlert,
    showModal,
    closeModal,
    showConfirmation,
    applyTheme,
    handleResponsiveLayout
  };
})();

// Expose globally for use from main module
if (window.LuckyDrawTool) {
  window.LuckyDrawTool.showAlert = LuckyDrawUI.showAlert;
  window.LuckyDrawTool.showConfirmation = LuckyDrawUI.showConfirmation;
}

// Listen for theme changes
document.addEventListener('DOMContentLoaded', function() {
  const themeButton = document.getElementById('theme-button');
  if (themeButton) {
    themeButton.addEventListener('click', function() {
      const isDarkTheme = document.body.classList.contains('dark-theme');
      LuckyDrawUI.applyTheme(isDarkTheme ? 'light' : 'dark');
    });
  }
  
  // Apply initial theme
  const isDarkTheme = document.body.classList.contains('dark-theme');
  LuckyDrawUI.applyTheme(isDarkTheme ? 'dark' : 'light');
  
  // Handle responsive layout
  LuckyDrawUI.handleResponsiveLayout();
  window.addEventListener('resize', LuckyDrawUI.handleResponsiveLayout);
});