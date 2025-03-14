/**
 * Encoder & Decoder UI Module
 * Handles UI interactions, alerts, and shared UI functionality
 */

window.EncoderUI = (function() {
  /**
   * Shows an alert message
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `enc-alert enc-alert-${type}`;
    
    // Set icon based on type
    let icon;
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
      default:
        icon = 'info-circle';
    }
    
    alertEl.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
      <button class="enc-alert-close">&times;</button>
    `;
    
    // Add to DOM
    document.body.appendChild(alertEl);
    
    // Show alert with animation
    setTimeout(() => {
      alertEl.classList.add('enc-alert-show');
    }, 10);
    
    // Set up close button
    alertEl.querySelector('.enc-alert-close').addEventListener('click', function() {
      closeAlert(alertEl);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      closeAlert(alertEl);
    }, 5000);
  }
  
  /**
   * Closes an alert with animation
   * @param {HTMLElement} alertEl - The alert element to close
   */
  function closeAlert(alertEl) {
    alertEl.classList.add('enc-alert-closing');
    alertEl.classList.remove('enc-alert-show');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (alertEl.parentNode) {
        alertEl.parentNode.removeChild(alertEl);
      }
    }, 300);
  }
  
  /**
   * Copies text to clipboard
   * @param {string} text - The text to copy
   * @returns {boolean} - Whether the copy was successful
   */
  function copyToClipboard(text) {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => showAlert('Copied to clipboard!', 'success'))
          .catch(() => {
            // Fallback to execCommand if clipboard API fails
            fallbackCopyToClipboard(text);
          });
        return true;
      } else {
        // Fallback for older browsers
        return fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      showAlert('Failed to copy to clipboard', 'error');
      return false;
    }
  }
  
  /**
   * Fallback method to copy text using document.execCommand
   * @param {string} text - The text to copy
   * @returns {boolean} - Whether the copy was successful
   */
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showAlert('Copied to clipboard!', 'success');
        return true;
      } else {
        showAlert('Failed to copy to clipboard', 'error');
        return false;
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
      document.body.removeChild(textArea);
      showAlert('Failed to copy to clipboard', 'error');
      return false;
    }
  }
  
  /**
   * Downloads text content as a file
   * @param {string} content - The content to download
   * @param {string} filename - The name of the file
   * @param {string} contentType - The content type (default: 'text/plain')
   */
  function downloadTextAsFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Attaches copy functionality to elements
   * @param {string} buttonSelector - The selector for copy buttons
   * @param {string} targetSelector - The selector for elements containing text to copy
   */
  function setupCopyButtons(buttonSelector, targetSelector) {
    document.querySelectorAll(buttonSelector).forEach(button => {
      button.addEventListener('click', () => {
        const target = document.querySelector(targetSelector);
        if (!target) return;
        
        const text = target.value || target.textContent;
        if (!text.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        copyToClipboard(text);
      });
    });
  }
  
  /**
   * Sets up mode switching buttons
   * @param {string} containerSelector - The selector for the container element
   */
  function setupModeSwitching(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const modeButtons = container.querySelectorAll('.enc-mode-btn');
    
    modeButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        modeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
      });
    });
  }
  
  return {
    showAlert,
    copyToClipboard,
    downloadTextAsFile,
    setupCopyButtons,
    setupModeSwitching
  };
})();