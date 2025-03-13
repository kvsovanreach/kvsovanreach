/**
 * QR Code UI Module
 * Handles shared UI functionality like navigation, alerts, and theme
 */

// Create a self-executing anonymous function
const QRCodeUI = (function() {
  // Cache DOM elements
  let navLinks;
  let tabContent;
  let themeButton;
  
  /**
   * Initializes the UI module
   */
  function init() {
    // Wait for DOM to be loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Cache DOM elements
      navLinks = document.querySelectorAll('.nav__link');
      tabContent = document.getElementById('tabContent');
      themeButton = document.getElementById('theme-button');
      
      // Set up navigation
      setupNavigation();
      
      // Set up theme toggling
      setupThemeToggle();
      
      // Check URL hash for direct tab access
      checkUrlHash();
      
      // Listen for hash changes
      window.addEventListener('hashchange', checkUrlHash);
    });
  }
  
  /**
   * Sets up navigation between tabs
   */
  function setupNavigation() {
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the target tab id from the href attribute
        const targetId = this.getAttribute('href').substring(1);
        
        // Update navigation active state
        navLinks.forEach(link => link.classList.remove('active-link'));
        this.classList.add('active-link');
        
        // Show the corresponding tab content
        const sections = document.querySelectorAll('.qr-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add('active');
          
          // Update URL hash without scrolling
          const scrollPosition = window.scrollY;
          window.location.hash = targetId;
          window.scrollTo(0, scrollPosition);
        }
        
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        if (navMenu.classList.contains('show-menu')) {
          navMenu.classList.remove('show-menu');
        }
      });
    });
    
    // Set up mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu');
    });
    
    navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
    });
  }
  
  /**
   * Sets up theme toggle functionality
   */
  function setupThemeToggle() {
    // Check if dark theme is preferred or previously selected
    const darkTheme = 'dark-theme';
    const iconTheme = 'fa-sun';
    
    // Previously selected topic (if user selected)
    const selectedTheme = localStorage.getItem('selected-theme');
    const selectedIcon = localStorage.getItem('selected-icon');
    
    // We obtain the current theme that the interface has by validating the dark-theme class
    const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'fa-moon' : 'fa-sun';
    
    // We validate if the user previously chose a topic
    if (selectedTheme) {
      // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
      document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
      themeButton.classList[selectedIcon === 'fa-moon' ? 'add' : 'remove'](iconTheme);
    } else {
      // Check if user prefers dark theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add(darkTheme);
        themeButton.classList.remove(iconTheme);
      }
    }
    
    // Activate / deactivate the theme manually with the button
    themeButton.addEventListener('click', () => {
      // Add or remove the dark / icon theme
      document.body.classList.toggle(darkTheme);
      themeButton.classList.toggle(iconTheme);
      
      // We save the theme and the current icon that the user chose
      localStorage.setItem('selected-theme', getCurrentTheme());
      localStorage.setItem('selected-icon', getCurrentIcon());
    });
  }
  
  /**
   * Checks URL hash for direct tab access
   */
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const targetLink = document.querySelector(`.nav__link[href="#${hash}"]`);
      if (targetLink) {
        // Simulate click on the nav link
        targetLink.click();
      }
    } else {
      // If no hash, default to first tab
      const firstLink = document.querySelector('.nav__link');
      if (firstLink) {
        firstLink.click();
      }
    }
  }
  
  /**
   * Shows an alert message
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `qr-alert qr-alert-${type}`;
    
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
      <button class="qr-alert-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    document.body.appendChild(alertElement);
    
    // Add close button functionality
    const closeButton = alertElement.querySelector('.qr-alert-close');
    closeButton.addEventListener('click', () => {
      alertElement.classList.add('qr-alert-closing');
      setTimeout(() => {
        document.body.removeChild(alertElement);
      }, 300);
    });
    
    // Show alert with animation
    setTimeout(() => {
      alertElement.classList.add('qr-alert-show');
    }, 10);
    
    // Auto-hide after 5 seconds for success and info
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (document.body.contains(alertElement)) {
          alertElement.classList.add('qr-alert-closing');
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
   * Updates the active tab
   * @param {string} tabId - The ID of the tab to activate
   */
  function setActiveTab(tabId) {
    const targetLink = document.querySelector(`.nav__link[href="#${tabId}"]`);
    if (targetLink) {
      targetLink.click();
    }
  }
  
  // Initialize the module
  init();
  
  // Define public API
  return {
    showAlert,
    setActiveTab
  };
})();

// Add some additional styles dynamically for alerts
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .qr-alert {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: white;
      color: #333;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 9999;
      transform: translateX(120%);
      transition: transform 0.3s ease;
      max-width: 350px;
    }
    
    .qr-alert-show {
      transform: translateX(0);
    }
    
    .qr-alert-closing {
      transform: translateX(120%);
    }
    
    .qr-alert i {
      font-size: 18px;
    }
    
    .qr-alert span {
      flex: 1;
    }
    
    .qr-alert-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #777;
      padding: 0;
    }
    
    .qr-alert-success {
      border-left: 4px solid #28a745;
    }
    
    .qr-alert-success i {
      color: #28a745;
    }
    
    .qr-alert-error {
      border-left: 4px solid #dc3545;
    }
    
    .qr-alert-error i {
      color: #dc3545;
    }
    
    .qr-alert-warning {
      border-left: 4px solid #ffc107;
    }
    
    .qr-alert-warning i {
      color: #ffc107;
    }
    
    .qr-alert-info {
      border-left: 4px solid #17a2b8;
    }
    
    .qr-alert-info i {
      color: #17a2b8;
    }
    
    .dark-theme .qr-alert {
      background-color: #333;
      color: #eee;
    }
    
    .dark-theme .qr-alert-close {
      color: #bbb;
    }
    
    @media (max-width: 576px) {
      .qr-alert {
        left: 20px;
        right: 20px;
        max-width: calc(100% - 40px);
      }
    }
  `;
  document.head.appendChild(style);
})();