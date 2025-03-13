/**
 * ColorPicker UI Module
 * Handles shared UI functionality like alerts and theme toggling
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // UI module to handle shared UI functionality
  const UI = {
    init: function() {
      this.setupAlertSystem();
      
      // Show welcome message to help users get started
      setTimeout(() => {
        this.showAlert('Welcome to the Color Picker Tool! Start by selecting colors with the color wheel.', 'info', 5000);
      }, 1000);
    },

    /**
     * Show an alert message
     * @param {string} message - The message to display
     * @param {string} type - The type of alert: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    showAlert: function(message, type = 'info', duration = 3000) {
      // Check if there's already an alert, if so, remove it
      const existingAlert = document.querySelector('.cp-alert');
      if (existingAlert) {
        existingAlert.remove();
      }

      // Create the alert element
      const alert = document.createElement('div');
      alert.className = `cp-alert cp-alert-${type}`;
      
      // Set the icon based on the alert type
      let icon = 'info-circle';
      switch (type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
      }

      // Set the alert content
      alert.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="cp-alert-close">&times;</button>
      `;

      // Add the alert to the document
      document.body.appendChild(alert);

      // Show the alert with animation
      setTimeout(() => {
        alert.classList.add('cp-alert-show');
      }, 10);

      // Set up close button event
      const closeButton = alert.querySelector('.cp-alert-close');
      closeButton.addEventListener('click', () => {
        this.closeAlert(alert);
      });

      // Auto-close after duration
      if (duration !== 0) {
        setTimeout(() => {
          this.closeAlert(alert);
        }, duration);
      }

      return alert;
    },

    /**
     * Close an alert with animation
     * @param {HTMLElement} alert - The alert element to close
     */
    closeAlert: function(alert) {
      alert.classList.add('cp-alert-closing');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        alert.remove();
      }, 300);
    },

    /**
     * Set up the alert system
     */
    setupAlertSystem: function() {
      // Nothing specific needed here, just a placeholder if needed
    },

    /**
     * Truncate long text with ellipsis
     * @param {string} text - The text to truncate
     * @param {number} length - The maximum length
     * @returns {string} Truncated text
     */
    truncateText: function(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    /**
     * Copy text to clipboard
     * @param {string} text - The text to copy
     * @returns {Promise} - Resolves when copied or rejects on error
     */
    copyToClipboard: function(text) {
      return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
          // Fallback for browsers without clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
              resolve();
            } else {
              reject(new Error('Failed to copy text'));
            }
          } catch (err) {
            document.body.removeChild(textArea);
            reject(err);
          }
        } else {
          // Modern browsers
          navigator.clipboard.writeText(text)
            .then(resolve)
            .catch(reject);
        }
      });
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateUniqueId: function() {
      return 'cp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Format a date to a readable string
     * @param {Date|string} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDate: function(date) {
      date = new Date(date);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },

    /**
     * Sanitize a filename
     * @param {string} name - The name to sanitize
     * @returns {string} Sanitized name
     */
    sanitizeFileName: function(name) {
      return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    },

    /**
     * Create a simple download link
     * @param {Blob} blob - The blob to download
     * @param {string} filename - The filename
     */
    downloadBlob: function(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Create an animated dots loading indicator
     * @param {HTMLElement} container - Element to append the loader to
     * @returns {Object} The loader object with methods
     */
    createLoader: function(container) {
      const loader = document.createElement('div');
      loader.className = 'cp-loader';
      loader.innerHTML = '<span>.</span><span>.</span><span>.</span>';
      
      return {
        start: function() {
          container.appendChild(loader);
        },
        stop: function() {
          if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }
      };
    }
  };

  // Add to the global namespace
  window.ColorPickerTool.UI = UI;

  // Initialize UI module
  document.addEventListener('DOMContentLoaded', function() {
    UI.init();
  });
})();