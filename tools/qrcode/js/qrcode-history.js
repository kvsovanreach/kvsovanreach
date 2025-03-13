/**
 * QR Code History Module
 * Manages saved QR codes with search, filter, and sorting capabilities
 */

// Create a self-executing anonymous function to encapsulate the module
const QRCodeHistory = (function() {
  // Cache DOM elements
  let historyDisplay;
  let historySearch;
  let historyTypeFilter;
  let historySortOrder;
  let clearHistoryBtn;
  let historyPagination;
  let prevHistoryPage;
  let nextHistoryPage;
  let historyPageIndicator;
  let historyModal;
  let modalQrName;
  let modalQrDate;
  let modalQrImage;
  let modalQrType;
  let modalQrContent;
  let modalQrSettings;
  let modalReuseBtn;
  let modalDownloadBtn;
  let modalDeleteBtn;
  let closeModal;
  
  // Module state
  let historyItems = [];
  let filteredItems = [];
  let currentPage = 1;
  let itemsPerPage = 12;
  let totalPages = 1;
  let currentHistoryItem = null;
  
  /**
   * Initializes the module
   */
  function init() {
    // Wait for DOM to be loaded
    initHistoryElements();
  }
  
  /**
   * Initializes history elements and retries if necessary
   * @param {number} maxRetries - Maximum number of times to retry if elements not found
   * @param {number} retryCount - Current retry count (used internally)
   */
  function initHistoryElements(maxRetries = 3, retryCount = 0) {
    console.log(`Initializing history elements (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Cache DOM elements
    historyDisplay = document.getElementById('historyDisplay');
    historySearch = document.getElementById('historySearch');
    historyTypeFilter = document.getElementById('historyTypeFilter');
    historySortOrder = document.getElementById('historySortOrder');
    clearHistoryBtn = document.getElementById('clearHistoryBtn');
    historyPagination = document.getElementById('historyPagination');
    prevHistoryPage = document.getElementById('prevHistoryPage');
    nextHistoryPage = document.getElementById('nextHistoryPage');
    historyPageIndicator = document.getElementById('historyPageIndicator');
    historyModal = document.getElementById('historyModal');
    modalQrName = document.getElementById('modalQrName');
    modalQrDate = document.getElementById('modalQrDate');
    modalQrImage = document.getElementById('modalQrImage');
    modalQrType = document.getElementById('modalQrType');
    modalQrContent = document.getElementById('modalQrContent');
    modalQrSettings = document.getElementById('modalQrSettings');
    modalReuseBtn = document.getElementById('modalReuseBtn');
    modalDownloadBtn = document.getElementById('modalDownloadBtn');
    modalDeleteBtn = document.getElementById('modalDeleteBtn');
    closeModal = document.querySelector('.qr-close-modal');
    
    // Check if critical elements are available
    if (!historyDisplay && retryCount < maxRetries) {
      // Increase delay with each retry to give more time for DOM to update
      const delay = 300 * (retryCount + 1); 
      console.log(`History display not found, retrying in ${delay}ms...`);
      setTimeout(() => initHistoryElements(maxRetries, retryCount + 1), delay);
      return;
    } else if (!historyDisplay) {
      console.log("Failed to find history display after maximum retries");
      return;
    } else {
      console.log("History display found successfully!");
    }
    
    // Set up event listeners (with null checks)
    if (historySearch) historySearch.addEventListener('input', handleSearch);
    if (historyTypeFilter) historyTypeFilter.addEventListener('change', handleFilter);
    if (historySortOrder) historySortOrder.addEventListener('change', handleSort);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);
    if (prevHistoryPage) prevHistoryPage.addEventListener('click', () => changePage(-1));
    if (nextHistoryPage) nextHistoryPage.addEventListener('click', () => changePage(1));
    if (closeModal) closeModal.addEventListener('click', hideModal);
    if (modalReuseBtn) modalReuseBtn.addEventListener('click', reuseQRCode);
    if (modalDownloadBtn) modalDownloadBtn.addEventListener('click', downloadQRCode);
    if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', deleteQRCode);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === historyModal) {
        hideModal();
      }
    });
    
    // Load history from localStorage
    loadHistory();
    
    // Apply initial filters and sort
    applyFiltersAndSort();
  }
  
  /**
   * Loads history items from localStorage and updates filtered items
   */
  function loadHistory() {
    console.log("Loading history from localStorage");
    try {
      const storedHistory = localStorage.getItem('qrCodeHistory');
      if (storedHistory) {
        historyItems = JSON.parse(storedHistory);
        console.log(`Loaded ${historyItems.length} history items`);
        
        // Always update filtered items with the full dataset
        filteredItems = [...historyItems];
        
        // Update UI if display element is available
        historyDisplay = document.getElementById('historyDisplay');
        if (historyDisplay) {
          applyFiltersAndSort();
        }
      } else {
        console.log("No history found in localStorage");
        historyItems = [];
        filteredItems = [];
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      historyItems = [];
      filteredItems = [];
    }
  }
  
  /**
   * Saves history items to localStorage
   */
  function saveHistory() {
    try {
      localStorage.setItem('qrCodeHistory', JSON.stringify(historyItems));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
      showAlert('Error saving history. You may have reached the storage limit.', 'error');
    }
  }
  
  /**
   * Adds a QR code to history
   * @param {Object} qrData - The QR code data to save
   */
  function addToHistory(qrData) {
    // Add unique ID and timestamp if not present
    if (!qrData.id) {
      qrData.id = generateUniqueId();
    }
    
    if (!qrData.createdAt) {
      qrData.createdAt = new Date().toISOString();
    }
    
    // Add to the beginning of the array (newest first)
    historyItems.unshift(qrData);
    
    // Save to localStorage
    saveHistory();
    
    // If history display is already visible, update it immediately
    // This is important when the user is already on the history tab
    historyDisplay = document.getElementById('historyDisplay');
    if (historyDisplay) {
      console.log("History display is visible, updating immediately...");
      
      // Updated filtered items
      filteredItems = [...historyItems];
      
      // Update the display with minimal delay
      setTimeout(() => {
        updateHistoryDisplay();
      }, 50);
    } else {
      console.log("History display not currently visible, no immediate update needed");
    }
  }
  
  /**
   * Applies search filter, type filter, and sort order
   */
  function applyFiltersAndSort() {
    // Apply search filter - with null checks
    const searchTerm = (historySearch && historySearch.value ? historySearch.value : '').toLowerCase();
    const typeFilter = historyTypeFilter && historyTypeFilter.value ? historyTypeFilter.value : 'all';
    
    // Filter items
    filteredItems = historyItems.filter(item => {
      // Search filter
      const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm);
      const dataMatch = item.data && item.data.toLowerCase().includes(searchTerm);
      const searchMatch = nameMatch || dataMatch;
      
      // Type filter
      let typeMatch = true;
      if (typeFilter !== 'all') {
        typeMatch = item.type === typeFilter;
      }
      
      return searchMatch && typeMatch;
    });
    
    // Apply sort - with null check
    const sortOrder = historySortOrder && historySortOrder.value ? historySortOrder.value : 'newest';
    switch (sortOrder) {
      case 'newest':
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'nameAsc':
        filteredItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'nameDesc':
        filteredItems.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
    }
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    updateHistoryDisplay();
  }
  
  /**
   * Updates the history display with the current filtered and sorted items
   */
  function updateHistoryDisplay() {
    // Find the history display element - try to get it if it's not already cached
    if (!historyDisplay) {
      historyDisplay = document.getElementById('historyDisplay');
      // If still not found, log error and return
      if (!historyDisplay) {
        console.error('History display element not found');
        return;
      }
    }
    
    console.log(`Updating history display with ${filteredItems.length} items`);
    
    // Calculate pagination
    totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    // Ensure current page is within bounds
    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages);
    }
    
    // Calculate slice for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
    const currentPageItems = filteredItems.slice(startIndex, endIndex);
    
    // Update history display
    if (filteredItems.length === 0) {
      // Show empty state
      historyDisplay.innerHTML = `
        <div class="qr-history-empty">
          <i class="fas fa-history"></i>
          <p>No saved QR codes found</p>
          <p class="qr-empty-hint">Generate and save QR codes to see them here</p>
        </div>
      `;
      
      // Only hide pagination if it exists
      if (historyPagination) {
        historyPagination.style.display = 'none';
      }
    } else {
      try {
        // Create items
        let html = '';
        
        currentPageItems.forEach(item => {
          if (!item) return; // Skip invalid items
          
          try {
            // Ensure all required properties exist
            const id = item.id || generateUniqueId();
            const name = item.name || 'Untitled QR Code';
            const type = item.type || 'text';
            const image = item.image || '';
            
            // Format date safely
            let formattedDate = 'Unknown date';
            if (item.createdAt) {
              try {
                const date = new Date(item.createdAt);
                formattedDate = date.toLocaleDateString();
              } catch (e) {
                console.error('Error formatting date:', e);
              }
            }
            
            html += `
              <div class="qr-history-item" data-id="${id}">
                <div class="qr-history-img">
                  <img src="${image}" alt="${escapeHtml(name)}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='">
                </div>
                <div class="qr-history-details">
                  <h3 class="qr-history-title">${escapeHtml(name)}</h3>
                  <span class="qr-history-type">${escapeHtml(type)}</span>
                  <div class="qr-history-date">${formattedDate}</div>
                </div>
              </div>
            `;
          } catch (itemError) {
            console.error('Error rendering history item:', itemError);
          }
        });
        
        // Update the DOM with the new content
        historyDisplay.innerHTML = html;
        
        // Add click listeners to items
        document.querySelectorAll('.qr-history-item').forEach(item => {
          item.addEventListener('click', () => openHistoryItem(item.getAttribute('data-id')));
        });
        
        // Initialize modal functionality
        initModal();
        
        // Show pagination if needed
        if (totalPages > 1 && historyPagination) {
          historyPagination.style.display = 'flex';
          
          if (historyPageIndicator) {
            historyPageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
          }
          
          if (prevHistoryPage) {
            prevHistoryPage.disabled = currentPage === 1;
          }
          
          if (nextHistoryPage) {
            nextHistoryPage.disabled = currentPage === totalPages;
          }
        } else if (historyPagination) {
          historyPagination.style.display = 'none';
        }
      } catch (renderError) {
        console.error('Error rendering history:', renderError);
        // Show a fallback message if rendering fails
        historyDisplay.innerHTML = `
          <div class="qr-history-empty">
            <i class="fas fa-exclamation-circle"></i>
            <p>Error displaying history</p>
            <button id="retryHistoryBtn" class="qr-secondary-btn">Retry</button>
          </div>
        `;
        
        // Add retry button functionality
        const retryBtn = document.getElementById('retryHistoryBtn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            loadHistory();
            updateHistoryDisplay();
          });
        }
      }
    }
  }
  
  /**
   * Opens a history item in the modal
   * @param {string} id - The item ID
   */
  function openHistoryItem(id) {
    const item = historyItems.find(item => item.id === id);
    if (!item) return;
    
    // Check if modal elements exist
    if (!modalQrName || !modalQrDate || !modalQrImage || !modalQrType || !modalQrContent) {
      console.error('Modal elements not found, cannot open history item');
      return;
    }
    
    // Store current item for later actions
    currentHistoryItem = item;
    
    // Update modal content
    modalQrName.textContent = item.name || 'Untitled QR Code';
    
    // Format date
    const date = new Date(item.createdAt);
    modalQrDate.textContent = `Created on: ${date.toLocaleString()}`;
    
    // Set image
    modalQrImage.src = item.image;
    
    // Set type
    modalQrType.textContent = formatQrType(item.type || 'text');
    
    // Set content
    modalQrContent.textContent = item.data;
    
    // Set settings
    let settingsText = '';
    if (item.settings) {
      const settings = item.settings;
      
      settingsText += `Size: ${settings.size}×${settings.size}px`;
      
      if (settings.errorCorrectionLevel) {
        const ecLevel = {
          'L': 'Low (7%)',
          'M': 'Medium (15%)',
          'Q': 'Quartile (25%)',
          'H': 'High (30%)'
        }[settings.errorCorrectionLevel] || settings.errorCorrectionLevel;
        
        settingsText += `, Error correction: ${ecLevel}`;
      }
      
      if (settings.encrypted) {
        settingsText += ', Encrypted: Yes';
      }
    }
    if (modalQrSettings) {
      modalQrSettings.textContent = settingsText || 'Standard settings';
    }
    
    // Show modal
    showModal();
  }
  
  /**
   * Shows the history item modal
   */
  function showModal() {
    if (!historyModal) {
      console.error('History modal element not found');
      return;
    }
    
    historyModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Add event listener to close when clicking outside modal content
    setTimeout(() => {
      document.addEventListener('click', handleOutsideModalClick);
    }, 10);
  }
  
  /**
   * Hides the history item modal
   */
  function hideModal() {
    if (!historyModal) {
      console.error('History modal element not found');
      return;
    }
    
    historyModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    currentHistoryItem = null;
    
    // Remove event listener
    document.removeEventListener('click', handleOutsideModalClick);
  }
  
  /**
   * Handles clicks outside the modal to close it
   * @param {Event} event - The click event
   */
  function handleOutsideModalClick(event) {
    if (event.target === historyModal) {
      hideModal();
    }
  }
  
  /**
   * Initializes the modal functionality
   */
  function initModal() {
    if (!historyModal) return;
    
    // Close button
    const closeModalBtn = document.querySelector('.qr-close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', hideModal);
    }
    
    // Button listeners
    if (modalReuseBtn) {
      modalReuseBtn.addEventListener('click', reuseQRCode);
    }
    
    if (modalDownloadBtn) {
      modalDownloadBtn.addEventListener('click', downloadQRCode);
    }
    
    if (modalDeleteBtn) {
      modalDeleteBtn.addEventListener('click', deleteQRCode);
    }
    
    // Ensure window click listener is set up correctly
    window.removeEventListener('click', handleOutsideModalClick); // Remove if already exists
    window.addEventListener('click', handleOutsideModalClick);
  }
  
  /**
   * Reuses a QR code from history
   */
  function reuseQRCode() {
    if (!currentHistoryItem) return;
    
    // Hide modal
    hideModal();
    
    // Navigate to generate tab
    document.querySelector('[href="#generate"]').click();
    
    // Wait for tab to be active
    setTimeout(() => {
      // Set form values based on QR code type
      const qrType = currentHistoryItem.type || 'text';
      const qrTypeSelect = document.getElementById('qrType');
      if (qrTypeSelect) {
        qrTypeSelect.value = qrType;
        
        // Trigger change event to update dynamic fields
        const event = new Event('change');
        qrTypeSelect.dispatchEvent(event);
        
        // Set content based on type
        setTimeout(() => {
          setFormValues(qrType, currentHistoryItem.data);
          
          // Set customization options if available
          if (currentHistoryItem.settings) {
            const settings = currentHistoryItem.settings;
            
            // Set colors
            if (settings.fgColor) {
              document.getElementById('fgColor').value = settings.fgColor;
            }
            if (settings.bgColor) {
              document.getElementById('bgColor').value = settings.bgColor;
            }
            
            // Set error correction level
            if (settings.errorCorrectionLevel) {
              document.getElementById('errorCorrectionLevel').value = settings.errorCorrectionLevel;
            }
            
            // Set size
            if (settings.size) {
              document.getElementById('qrSize').value = settings.size;
            }
          }
        }, 100);
      }
    }, 100);
  }
  
  /**
   * Sets form values based on QR code type and data
   * @param {string} type - The QR code type
   * @param {string} data - The QR code data
   */
  function setFormValues(type, data) {
    switch (type) {
      case 'text':
        document.getElementById('textInput').value = data;
        break;
        
      case 'url':
        document.getElementById('urlInput').value = data;
        break;
        
      case 'email':
        // Parse mailto: format
        const emailMatch = data.match(/^mailto:([^?]+)(?:\?(.*))?$/);
        if (emailMatch) {
          const email = emailMatch[1];
          document.getElementById('emailAddressInput').value = email;
          
          // Parse query parameters
          if (emailMatch[2]) {
            const params = new URLSearchParams(emailMatch[2]);
            document.getElementById('emailSubjectInput').value = params.get('subject') || '';
            document.getElementById('emailBodyInput').value = params.get('body') || '';
          }
        }
        break;
        
      case 'phone':
        // Parse tel: format
        const phoneMatch = data.match(/^tel:(.+)$/);
        if (phoneMatch) {
          document.getElementById('phoneInput').value = phoneMatch[1];
        }
        break;
        
      case 'sms':
        // Parse smsto: format
        const smsMatch = data.match(/^smsto:([^:]+)(?::(.*))?$/);
        if (smsMatch) {
          document.getElementById('smsPhoneInput').value = smsMatch[1];
          if (smsMatch[2]) {
            document.getElementById('smsMessageInput').value = smsMatch[2];
          }
        }
        break;
        
      case 'vcard':
        // Parse vCard format
        try {
          // Extract name
          const nameMatch = data.match(/FN:([^\n]+)/);
          if (nameMatch) {
            document.getElementById('vcardNameInput').value = nameMatch[1];
          }
          
          // Extract company
          const orgMatch = data.match(/ORG:([^\n]+)/);
          if (orgMatch) {
            document.getElementById('vcardCompanyInput').value = orgMatch[1];
          }
          
          // Extract title
          const titleMatch = data.match(/TITLE:([^\n]+)/);
          if (titleMatch) {
            document.getElementById('vcardTitleInput').value = titleMatch[1];
          }
          
          // Extract phone
          const telMatch = data.match(/TEL:([^\n]+)/);
          if (telMatch) {
            document.getElementById('vcardPhoneInput').value = telMatch[1];
          }
          
          // Extract email
          const vcardEmailMatch = data.match(/EMAIL:([^\n]+)/);
          if (vcardEmailMatch) {
            document.getElementById('vcardEmailInput').value = vcardEmailMatch[1];
          }
          
          // Extract address
          const adrMatch = data.match(/ADR:([^\n]+)/);
          if (adrMatch) {
            document.getElementById('vcardAddressInput').value = adrMatch[1].replace(/;;/g, '');
          }
          
          // Extract website
          const urlMatch = data.match(/URL:([^\n]+)/);
          if (urlMatch) {
            document.getElementById('vcardWebsiteInput').value = urlMatch[1];
          }
        } catch (e) {
          console.error('Error parsing vCard data:', e);
        }
        break;
        
      case 'wifi':
        // Parse WIFI: format
        try {
          const ssidMatch = data.match(/S:([^;]+)/);
          if (ssidMatch) {
            document.getElementById('wifiSsidInput').value = ssidMatch[1];
          }
          
          const passwordMatch = data.match(/P:([^;]+)/);
          if (passwordMatch) {
            document.getElementById('wifiPasswordInput').value = passwordMatch[1];
          }
          
          const typeMatch = data.match(/T:([^;]+)/);
          if (typeMatch) {
            document.getElementById('wifiTypeInput').value = typeMatch[1];
          }
          
          const hiddenMatch = data.match(/H:([^;]+)/);
          if (hiddenMatch && hiddenMatch[1] === 'true') {
            document.getElementById('wifiHiddenInput').checked = true;
          }
        } catch (e) {
          console.error('Error parsing WiFi data:', e);
        }
        break;
        
      case 'geo':
        // Parse geo: format
        try {
          const geoMatch = data.match(/geo:([^,]+),([^?]+)(?:\?q=(.+))?/);
          if (geoMatch) {
            document.getElementById('geoLatitudeInput').value = geoMatch[1];
            document.getElementById('geoLongitudeInput').value = geoMatch[2];
            if (geoMatch[3]) {
              document.getElementById('geoNameInput').value = decodeURIComponent(geoMatch[3]);
            }
          }
        } catch (e) {
          console.error('Error parsing geo data:', e);
        }
        break;
        
      case 'calendar':
        // We can't easily parse calendar data to set in the form
        // Just show an alert
        showAlert('Calendar events can be viewed but not edited directly. Please create a new event.', 'info');
        break;
    }
  }
  
  /**
   * Downloads the current QR code
   */
  function downloadQRCode() {
    if (!currentHistoryItem || !currentHistoryItem.image) return;
    
    // Create a download link
    const a = document.createElement('a');
    a.href = currentHistoryItem.image;
    a.download = (currentHistoryItem.name || 'qrcode') + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  /**
   * Deletes the current QR code
   */
  function deleteQRCode() {
    if (!currentHistoryItem) return;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return;
    }
    
    // Find index of item
    const index = historyItems.findIndex(item => item.id === currentHistoryItem.id);
    if (index !== -1) {
      // Remove item
      historyItems.splice(index, 1);
      
      // Save to localStorage
      saveHistory();
      
      // Hide modal
      hideModal();
      
      // Refresh display
      applyFiltersAndSort();
      
      showAlert('QR code deleted.', 'success');
    }
  }
  
  /**
   * Clears all history items
   */
  function clearHistory() {
    // Confirm deletion
    if (!confirm('Are you sure you want to clear all QR code history? This cannot be undone.')) {
      return;
    }
    
    // Clear history
    historyItems = [];
    
    // Save to localStorage
    saveHistory();
    
    // Refresh display
    applyFiltersAndSort();
    
    showAlert('History cleared.', 'success');
  }
  
  /**
   * Handles search input
   */
  function handleSearch() {
    applyFiltersAndSort();
  }
  
  /**
   * Handles type filter changes
   */
  function handleFilter() {
    applyFiltersAndSort();
  }
  
  /**
   * Handles sort order changes
   */
  function handleSort() {
    applyFiltersAndSort();
  }
  
  /**
   * Changes the current page
   * @param {number} direction - The direction to change (-1 or 1)
   */
  function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      updateHistoryDisplay();
      
      // Scroll to top of history
      document.getElementById('history').scrollIntoView();
    }
  }
  
  /**
   * Formats a QR code type for display
   * @param {string} type - The QR code type
   * @returns {string} Formatted type
   */
  function formatQrType(type) {
    // Map of type to display names
    const typeMap = {
      'text': 'Plain Text',
      'url': 'Website URL',
      'email': 'Email Address',
      'phone': 'Phone Number',
      'sms': 'SMS Message',
      'vcard': 'Contact Information',
      'wifi': 'WiFi Network',
      'geo': 'Location',
      'calendar': 'Calendar Event'
    };
    
    return typeMap[type] || type;
  }
  
  /**
   * Generates a unique ID for history items
   * @returns {string} Unique ID
   */
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Escapes HTML special characters
   * @param {string} text - The text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  /**
   * Shows an alert message
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning)
   */
  function showAlert(message, type = 'info') {
    // Use the UI module to show alerts if available
    if (typeof QRCodeUI !== 'undefined' && QRCodeUI.showAlert) {
      QRCodeUI.showAlert(message, type);
    } else {
      alert(message);
    }
  }
  
  // Initialize module
  init();
  
  // Public API
  return {
    addToHistory,
    loadHistory,
    filterItems: applyFiltersAndSort,
    updateDisplay: updateHistoryDisplay
  };
})();