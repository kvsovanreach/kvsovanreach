/**
 * QR Code Main Interface Module
 * Manages the main UI and feature switching
 */

document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements for tabs
  const generateTab = document.getElementById('generateTab');
  const scanTab = document.getElementById('scanTab');
  const bulkTab = document.getElementById('bulkTab');
  const historyTab = document.getElementById('historyTab');
  const qrToolContent = document.getElementById('qrToolContent');
  
  // Cache description elements
  const generateDescription = document.getElementById('generateDescription');
  const scanDescription = document.getElementById('scanDescription');
  const bulkDescription = document.getElementById('bulkDescription');
  const historyDescription = document.getElementById('historyDescription');
  
  // Get templates
  const generateTemplate = document.getElementById('generateTemplate');
  const scanTemplate = document.getElementById('scanTemplate');
  const bulkTemplate = document.getElementById('bulkTemplate');
  const historyTemplate = document.getElementById('historyTemplate');
  
  // Set up event listeners for tabs
  generateTab.addEventListener('click', () => showFeature('generate'));
  scanTab.addEventListener('click', () => showFeature('scan'));
  bulkTab.addEventListener('click', () => showFeature('bulk'));
  historyTab.addEventListener('click', () => showFeature('history'));
  
  /**
   * Shows a specific feature and hides others
   * @param {string} feature - The feature to show ('generate', 'scan', 'bulk', 'history')
   */
  function showFeature(feature) {
    console.log(`Showing feature: ${feature}`);
    
    // Highlight the selected tab and update description
    highlightTab(feature);
    
    // Clear the tool content area with fade-out animation
    qrToolContent.classList.add('fade-out');
    
    // Wait for animation to complete
    setTimeout(() => {
      // Clear content
      qrToolContent.innerHTML = '';
      
      // Determine which template to use
      let template;
      let backLinkId;
      
      switch (feature) {
        case 'generate':
          template = generateTemplate.content.cloneNode(true);
          backLinkId = 'backFromGenerate';
          break;
        case 'scan':
          template = scanTemplate.content.cloneNode(true);
          backLinkId = 'backFromScan';
          break;
        case 'bulk':
          template = bulkTemplate.content.cloneNode(true);
          backLinkId = 'backFromBulk';
          break;
        case 'history':
          template = historyTemplate.content.cloneNode(true);
          backLinkId = 'backFromHistory';
          break;
        default:
          return;
      }
      
      // Add the template to the content area
      qrToolContent.appendChild(template);
      
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
      qrToolContent.classList.remove('fade-out');
      qrToolContent.classList.add('active', 'fade-in');
      
      // Initialize specific feature functionality
      // Simple feature initialization - no forcing refresh
      initFeature(feature);
      
      // Scroll to content
      qrToolContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update URL hash for direct linking
      window.location.hash = feature;
      
      // Remove fade-in class after animation completes
      setTimeout(() => {
        qrToolContent.classList.remove('fade-in');
      }, 500);
      
    }, 300); // Match the CSS transition duration
  }
  
  /**
   * Highlights the selected tab and updates the description
   * @param {string} feature - The feature to highlight
   */
  function highlightTab(feature) {
    // Remove active class from all tabs
    document.querySelectorAll('.qr-tab-item').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Remove active class from all descriptions
    document.querySelectorAll('.qr-tab-description').forEach(desc => {
      desc.classList.remove('active');
    });
    
    // Add active class to selected tab
    const tabId = `${feature}Tab`;
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
      
      // Ensure the tab is visible by scrolling if necessary
      if (window.innerWidth < 576) { // Mobile view
        const tabContainer = document.querySelector('.qr-tab-container');
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
   * Resets the UI to initial state
   * In the new tab-based design, this function is modified to simply 
   * select the first tab (Generate) instead of clearing everything
   */
  function resetToFeatureSelection() {
    // Select the first tab (Generate)
    showFeature('generate');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash
    window.location.hash = 'generate';
  }
  
  /**
   * Initializes feature-specific functionality
   * @param {string} feature - The feature to initialize
   */
  function initFeature(feature) {
    console.log(`Initializing feature: ${feature}`);
    switch (feature) {
      case 'generate':
        initGenerateFeature();
        break;
      case 'scan':
        initScanFeature();
        break;
      case 'bulk':
        initBulkFeature();
        break;
      case 'history':
        initHistoryFeature();
        break;
    }
  }
  
  /**
   * Initializes the Generate QR Code feature
   */
  function initGenerateFeature() {
    // Set up tab switching in the generate feature
    setupTabSwitching();
    
    // Initialize form events
    setupGeneratorEvents();
    
    // Initialize the generator form if external module is available
    if (typeof QRCodeGenerator !== 'undefined' && QRCodeGenerator.init) {
      QRCodeGenerator.init();
    }
  }
  
  /**
   * Sets up events for the QR generator form
   */
  function setupGeneratorEvents() {
    // Set up QR type change
    const qrTypeSelect = document.getElementById('qrType');
    if (qrTypeSelect) {
      qrTypeSelect.addEventListener('change', function() {
        if (typeof updateDynamicFields === 'function') {
          updateDynamicFields();
        }
      });
    }
    
    // Logo visibility toggling
    const qrLogoInput = document.getElementById('qrLogo');
    const logoSizeGroup = document.getElementById('logoSizeGroup');
    if (qrLogoInput && logoSizeGroup) {
      qrLogoInput.addEventListener('change', function() {
        logoSizeGroup.style.display = this.files.length > 0 ? 'block' : 'none';
      });
    }
    
    // Encryption password toggle
    const enableEncryptionCheckbox = document.getElementById('enableEncryption');
    const encryptionPasswordGroup = document.getElementById('encryptionPasswordGroup');
    if (enableEncryptionCheckbox && encryptionPasswordGroup) {
      enableEncryptionCheckbox.addEventListener('change', function() {
        encryptionPasswordGroup.style.display = this.checked ? 'block' : 'none';
      });
    }
  }
  
  /**
   * Initializes the Scan QR Code feature
   */
  function initScanFeature() {
    const qrDropzone = document.getElementById('qrDropzone');
    const qrImageInput = document.getElementById('qrImageInput');
    const scanQrBtn = document.getElementById('scanQrBtn');
    
    if (qrDropzone && qrImageInput) {
      // Make the entire dropzone clickable
      qrDropzone.addEventListener('click', () => qrImageInput.click());
      
      // Handle drag and drop
      qrDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        qrDropzone.classList.add('active');
      });
      
      qrDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        qrDropzone.classList.remove('active');
      });
      
      qrDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        qrDropzone.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
          qrImageInput.files = e.dataTransfer.files;
          // Update dropzone to show selected file
          if (e.dataTransfer.files[0].type.startsWith('image/')) {
            qrDropzone.innerHTML = `
              <i class="fas fa-file-image"></i>
              <p>File selected: ${e.dataTransfer.files[0].name}</p>
              <small>Click "Scan QR Code" to process</small>
            `;
          }
        }
      });
    }
    
    // Handle file selection
    if (qrImageInput) {
      qrImageInput.addEventListener('change', function() {
        if (this.files.length > 0) {
          const file = this.files[0];
          if (file.type.startsWith('image/')) {
            qrDropzone.innerHTML = `
              <i class="fas fa-file-image"></i>
              <p>File selected: ${file.name}</p>
              <small>Click "Scan QR Code" to process</small>
            `;
          } else {
            showAlert('Please select a valid image file.', 'error');
            this.value = '';
          }
        }
      });
    }
    
    // Initialize scanner button
    if (scanQrBtn) {
      scanQrBtn.addEventListener('click', function() {
        if (window.QRCodeScanner && window.QRCodeScanner.scan) {
          window.QRCodeScanner.scan();
        } else {
          console.error('QR Scanner module not loaded');
          showAlert('QR Scanner functionality is not available. Please check your internet connection and try refreshing the page.', 'error');
        }
      });
    }
    
    // Initialize external scanner module if available
    if (typeof QRCodeScanner !== 'undefined' && QRCodeScanner.init) {
      QRCodeScanner.init();
    }
  }
  
  /**
   * Initializes the Bulk Generation feature
   */
  function initBulkFeature() {
    const bulkCsvFile = document.getElementById('bulkCsvFile');
    const downloadSampleCsv = document.getElementById('downloadSampleCsv');
    const generateBulkBtn = document.getElementById('generateBulkBtn');
    
    // Download sample CSV
    if (downloadSampleCsv) {
      downloadSampleCsv.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Sample CSV content
        const csvContent = [
          'label,content,type',
          'My Website,example.com,url',
          'Contact Info,John Doe|john@example.com|123456789,vcard',
          'My WiFi,MyNetwork|password123|WPA,wifi',
          'My Location,40.7128|-74.0060|New York,geo',
          'Plain Text,Hello World! This is a sample text.,text'
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode_sample.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
      });
    }
    
    // Initialize bulk feature if external module is available
    if (typeof QRCodeBulk !== 'undefined' && QRCodeBulk.init) {
      QRCodeBulk.init();
    }
  }
  
  /**
   * Initializes the History feature - simplified to avoid forced reloads
   */
  function initHistoryFeature() {
    console.log('Initializing history feature');
    
    // Create a small delay to ensure template is fully loaded into DOM
    setTimeout(() => {
      // Initialize history search and filters
      const historySearch = document.getElementById('historySearch');
      const historyTypeFilter = document.getElementById('historyTypeFilter');
      const historySortOrder = document.getElementById('historySortOrder');
      const historyDisplay = document.getElementById('historyDisplay');
      
      // Only initialize history if required elements exist
      if (historyDisplay) {
        console.log('History display found, initializing history module');
        
        // Now that we know DOM is available, initialize history module
        if (typeof QRCodeHistory !== 'undefined') {
          // Initialize history module if needed
          if (QRCodeHistory.init) {
            QRCodeHistory.init();
          } 
          
          // Always load fresh history data from localStorage
          if (QRCodeHistory.loadHistory) {
            QRCodeHistory.loadHistory();
          }
        }
        
        // Set up event listeners for the history search and filter controls
        if (historySearch && historyTypeFilter && historySortOrder) {
          // Remove old event listeners if they exist (to prevent duplicates)
          historySearch.removeEventListener('input', handleHistorySearch);
          historyTypeFilter.removeEventListener('change', handleHistoryFilter);
          historySortOrder.removeEventListener('change', handleHistorySort);
          
          // Setup live search with named function for removal
          historySearch.addEventListener('input', handleHistorySearch);
          
          // Setup type filter with named function for removal
          historyTypeFilter.addEventListener('change', handleHistoryFilter);
          
          // Setup sort order with named function for removal
          historySortOrder.addEventListener('change', handleHistorySort);
        }
        
        // Initialize modal close button
        const closeModal = document.querySelector('.qr-close-modal');
        if (closeModal) {
          closeModal.removeEventListener('click', handleModalClose);
          closeModal.addEventListener('click', handleModalClose);
        }
      } else {
        // Use a single retry with longer delay
        console.warn('History display element not found yet - retrying once in 300ms');
        setTimeout(() => {
          const retryHistoryDisplay = document.getElementById('historyDisplay');
          if (retryHistoryDisplay && typeof QRCodeHistory !== 'undefined') {
            if (QRCodeHistory.init) {
              QRCodeHistory.init();
            }
            if (QRCodeHistory.loadHistory) {
              QRCodeHistory.loadHistory();
            }
          }
        }, 300);
      }
    }, 100); // Small delay to ensure DOM is updated
  }
  
  // Named handlers for event listeners to allow proper removal
  function handleHistorySearch() {
    if (typeof QRCodeHistory !== 'undefined' && QRCodeHistory.filterItems) {
      QRCodeHistory.filterItems();
    }
  }
  
  function handleHistoryFilter() {
    if (typeof QRCodeHistory !== 'undefined' && QRCodeHistory.filterItems) {
      QRCodeHistory.filterItems();
    }
  }
  
  function handleHistorySort() {
    if (typeof QRCodeHistory !== 'undefined' && QRCodeHistory.filterItems) {
      QRCodeHistory.filterItems();
    }
  }
  
  function handleModalClose() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
      historyModal.classList.remove('active');
    }
  }
  
  /**
   * Sets up tab switching in the generate feature
   */
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.qr-tab-btn');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab');
        const tabPanes = document.querySelectorAll('.qr-tab-pane');
        
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
   * Shows an alert message using the UI module
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    if (typeof QRCodeUI !== 'undefined' && QRCodeUI.showAlert) {
      QRCodeUI.showAlert(message, type);
    } else {
      alert(message);
    }
  }
  
  // Check URL hash for direct feature access
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      switch (hash) {
        case 'generate':
        case 'scan':
        case 'bulk':
        case 'history':
          showFeature(hash);
          break;
        default:
          // If hash doesn't match any feature, default to generate
          showFeature('generate');
          break;
      }
    } else {
      // If no hash is present, default to generate tab
      showFeature('generate');
    }
  }
  
  // Check hash on load
  checkUrlHash();
  
  // Listen for hash changes
  window.addEventListener('hashchange', checkUrlHash);
  
  // Global export for direct access from other modules
  window.QRCodeTool = {
    showFeature,
    resetToFeatureSelection,
    showAlert
  };
});