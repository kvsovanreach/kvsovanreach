/**
 * QR Code Scanner Module
 * Handles scanning and decoding QR codes from images
 */

// Create a self-executing anonymous function to encapsulate the module
const QRCodeScanner = (function() {
  // Module state variables
  let currentScannedData = '';
  let currentScannedImage = null;
  
  // DOM elements cache
  let qrDropzone;
  let qrImageInput;
  let scanQrBtn;
  let scanResult;
  let scannedQrImage;
  let detectedContentType;
  let scannedContent;
  let copyScannedBtn;
  let openLinkBtn;
  let securityWarning;
  let securityWarningText;
  
  /**
   * Initializes the scanner module
   */
  function init() {
    // Cache DOM elements
    qrDropzone = document.getElementById('qrDropzone');
    qrImageInput = document.getElementById('qrImageInput');
    scanQrBtn = document.getElementById('scanQrBtn');
    scanResult = document.querySelector('.qr-scan-result');
    scannedQrImage = document.getElementById('scannedQrImage');
    detectedContentType = document.getElementById('detectedContentType');
    scannedContent = document.getElementById('scannedContent');
    copyScannedBtn = document.getElementById('copyScannedBtn');
    openLinkBtn = document.getElementById('openLinkBtn');
    securityWarning = document.querySelector('.qr-security-warning');
    securityWarningText = document.getElementById('securityWarningText');
    
    // Set up event listeners if elements exist
    if (qrDropzone && qrImageInput) {
      qrDropzone.addEventListener('click', () => qrImageInput.click());
      qrDropzone.addEventListener('dragover', handleDragOver);
      qrDropzone.addEventListener('dragleave', handleDragLeave);
      qrDropzone.addEventListener('drop', handleDrop);
    }
    
    if (qrImageInput) {
      qrImageInput.addEventListener('change', handleFileSelect);
    }
    
    if (scanQrBtn) {
      scanQrBtn.addEventListener('click', scanQRCode);
    }
    
    if (copyScannedBtn) {
      copyScannedBtn.addEventListener('click', copyScannedContent);
    }
    
    if (openLinkBtn) {
      openLinkBtn.addEventListener('click', openScannedLink);
    }
  }
  
  /**
   * Handles dragover event on the dropzone
   * @param {Event} e - The dragover event
   */
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    qrDropzone.classList.add('active');
  }
  
  /**
   * Handles dragleave event on the dropzone
   * @param {Event} e - The dragleave event
   */
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    qrDropzone.classList.remove('active');
  }
  
  /**
   * Handles drop event on the dropzone
   * @param {Event} e - The drop event
   */
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    qrDropzone.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      qrImageInput.files = files;
      handleFileSelect({ target: qrImageInput });
    }
  }
  
  /**
   * Handles file selection from the input
   * @param {Event} e - The change event
   */
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      showAlert('Please select a valid image file.', 'error');
      e.target.value = '';
      return;
    }
    
    // Show selected file name in dropzone
    const fileName = file.name;
    qrDropzone.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>File selected: ${fileName}</p>
      <small>Click "Scan QR Code" to process</small>
    `;
    
    // Add the selected class for styling
    qrDropzone.classList.add('file-selected');
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = function(event) {
      if (scannedQrImage) {
        scannedQrImage.src = event.target.result;
      }
      currentScannedImage = event.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Scans and decodes the QR code from the selected image
   */
  function scanQRCode() {
    if (!currentScannedImage) {
      showAlert('Please select an image containing a QR code first.', 'error');
      return;
    }
    
    // Show loading state
    scanQrBtn.disabled = true;
    scanQrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    
    // Create image for processing
    const img = new Image();
    img.onload = function() {
      // Create canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      try {
        // Use jsQR library to detect and decode QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          // Successfully found a QR code
          displayScanResult(code.data);
        } else {
          // Try another approach with higher sensitivity
          tryAlternativeScanning(img);
        }
      } catch (error) {
        console.error('Error scanning QR code:', error);
        showAlert('Error scanning QR code. Please try a different image.', 'error');
        resetScanButton();
      }
    };
    
    img.onerror = function() {
      showAlert('Error loading image. Please try a different image.', 'error');
      resetScanButton();
    };
    
    img.src = currentScannedImage;
  }
  
  /**
   * Tries alternative scanning methods for QR code detection
   * @param {HTMLImageElement} img - The image to scan
   */
  function tryAlternativeScanning(img) {
    // Create a higher resolution canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set to a higher resolution
    const scale = 2;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Draw the image at higher resolution
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply image processing to enhance contrast
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const enhancedData = enhanceImageContrast(imageData);
    ctx.putImageData(enhancedData, 0, 0);
    
    // Try scanning with enhanced image
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    try {
      const code = jsQR(newImageData.data, newImageData.width, newImageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      
      if (code) {
        displayScanResult(code.data);
      } else {
        showAlert('No QR code found in the image. Please try a different image or ensure the QR code is clearly visible.', 'error');
        resetScanButton();
      }
    } catch (error) {
      showAlert('No QR code found in the image. Please try a different image.', 'error');
      resetScanButton();
    }
  }
  
  /**
   * Enhances image contrast for better QR code detection
   * @param {ImageData} imageData - The image data to enhance
   * @returns {ImageData} Enhanced image data
   */
  function enhanceImageContrast(imageData) {
    const data = imageData.data;
    
    // Find min and max values for auto-contrast
    let min = 255;
    let max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (avg < min) min = avg;
      if (avg > max) max = avg;
    }
    
    // Apply contrast enhancement
    const range = max - min;
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          const value = data[i + j];
          data[i + j] = ((value - min) / range) * 255;
        }
      }
    }
    
    return imageData;
  }
  
  /**
   * Displays the scan result
   * @param {string} data - The decoded QR code data
   */
  function displayScanResult(data) {
    if (!data) {
      showAlert('No data found in the QR code.', 'error');
      resetScanButton();
      return;
    }
    
    // Save the scanned data
    currentScannedData = data;
    
    // Detect content type
    const contentType = detectContentType(data);
    
    // Show scan result section
    scanResult.style.display = 'flex';
    
    // Display content type
    detectedContentType.textContent = contentType.type;
    detectedContentType.style.backgroundColor = getTypeColor(contentType.type);
    
    // Display scanned content
    scannedContent.textContent = formatScannedContent(data, contentType);
    
    // Show/hide open link button
    if (contentType.type === 'URL') {
      openLinkBtn.style.display = 'inline-flex';
    } else {
      openLinkBtn.style.display = 'none';
    }
    
    // Perform security check for URLs
    if (contentType.type === 'URL') {
      const securityResult = checkURLSecurity(data);
      if (!securityResult.safe) {
        securityWarning.style.display = 'flex';
        securityWarningText.textContent = securityResult.reason;
      } else {
        securityWarning.style.display = 'none';
      }
    } else {
      securityWarning.style.display = 'none';
    }
    
    // Reset scan button
    resetScanButton();
    
    // Scroll to results
    scanResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  /**
   * Detects the content type of the scanned QR code
   * @param {string} data - The QR code data
   * @returns {Object} Content type information
   */
  function detectContentType(data) {
    // URL pattern
    if (data.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
      return { type: 'URL', subType: 'Web Address' };
    }
    
    // Email pattern
    if (data.match(/^mailto:/i)) {
      return { type: 'Email', subType: 'Email Address' };
    }
    
    // Phone number pattern
    if (data.match(/^tel:/i)) {
      return { type: 'Phone', subType: 'Phone Number' };
    }
    
    // SMS pattern
    if (data.match(/^smsto:/i) || data.match(/^sms:/i)) {
      return { type: 'SMS', subType: 'Text Message' };
    }
    
    // vCard pattern
    if (data.match(/^BEGIN:VCARD/i)) {
      return { type: 'vCard', subType: 'Contact Information' };
    }
    
    // WiFi pattern
    if (data.match(/^WIFI:/i)) {
      return { type: 'WiFi', subType: 'Network Information' };
    }
    
    // Geographic location pattern
    if (data.match(/^geo:/i)) {
      return { type: 'Location', subType: 'Geographic Coordinates' };
    }
    
    // Calendar event pattern
    if (data.match(/^BEGIN:VEVENT/i)) {
      return { type: 'Calendar', subType: 'Event Information' };
    }
    
    // Encrypted data pattern
    if (data.match(/^ENCRYPTED:/i)) {
      return { type: 'Encrypted', subType: 'Protected Data' };
    }
    
    // Default to plain text
    return { type: 'Text', subType: 'Plain Text' };
  }
  
  /**
   * Formats the scanned content for display
   * @param {string} data - The QR code data
   * @param {Object} contentType - The detected content type
   * @returns {string} Formatted content
   */
  function formatScannedContent(data, contentType) {
    switch (contentType.type) {
      case 'vCard':
        // Pretty format vCard
        return formatVCard(data);
        
      case 'WiFi':
        // Pretty format WiFi
        return formatWiFi(data);
        
      case 'Calendar':
        // Pretty format Calendar event
        return formatCalendarEvent(data);
        
      default:
        // Return as is for other types
        return data;
    }
  }
  
  /**
   * Formats vCard data for display
   * @param {string} vcard - The vCard data
   * @returns {string} Formatted vCard
   */
  function formatVCard(vcard) {
    const lines = vcard.split('\n');
    const formatted = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2);
        if (key === 'BEGIN' || key === 'END' || key === 'VERSION') continue;
        formatted[key] = value;
      }
    }
    
    let result = '';
    if (formatted.FN) result += `Name: ${formatted.FN}\n`;
    if (formatted.ORG) result += `Organization: ${formatted.ORG}\n`;
    if (formatted.TITLE) result += `Title: ${formatted.TITLE}\n`;
    if (formatted.TEL) result += `Phone: ${formatted.TEL}\n`;
    if (formatted.EMAIL) result += `Email: ${formatted.EMAIL}\n`;
    if (formatted.ADR) result += `Address: ${formatted.ADR.replace(/;/g, ', ')}\n`;
    if (formatted.URL) result += `Website: ${formatted.URL}\n`;
    
    return result || vcard;
  }
  
  /**
   * Formats WiFi data for display
   * @param {string} wifi - The WiFi data
   * @returns {string} Formatted WiFi
   */
  function formatWiFi(wifi) {
    // Extract SSID
    const ssidMatch = wifi.match(/S:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'Unknown';
    
    // Extract password (mask it for security)
    const passwordMatch = wifi.match(/P:([^;]+)/);
    const password = passwordMatch ? '*'.repeat(passwordMatch[1].length) : 'None';
    
    // Extract type
    const typeMatch = wifi.match(/T:([^;]+)/);
    const type = typeMatch ? typeMatch[1] : 'Unknown';
    
    // Extract hidden
    const hiddenMatch = wifi.match(/H:([^;]+)/);
    const hidden = hiddenMatch ? hiddenMatch[1] === 'true' : false;
    
    // Format result
    return `Network Name (SSID): ${ssid}\nSecurity Type: ${type}\nPassword: ${password}\nHidden Network: ${hidden ? 'Yes' : 'No'}`;
  }
  
  /**
   * Formats calendar event data for display
   * @param {string} event - The calendar event data
   * @returns {string} Formatted event
   */
  function formatCalendarEvent(event) {
    const lines = event.split('\n');
    const formatted = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2);
        if (key === 'BEGIN' || key === 'END') continue;
        formatted[key] = value;
      }
    }
    
    // Format dates
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown';
      
      // Handle different date formats
      let date;
      if (dateString.match(/^\d{8}T\d{6}Z?$/)) {
        // Format: 20230415T143000Z
        const year = dateString.substr(0, 4);
        const month = dateString.substr(4, 2);
        const day = dateString.substr(6, 2);
        const hour = dateString.substr(9, 2);
        const minute = dateString.substr(11, 2);
        const second = dateString.substr(13, 2);
        date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      } else {
        date = new Date(dateString);
      }
      
      return isNaN(date.getTime()) ? dateString : date.toLocaleString();
    };
    
    let result = '';
    if (formatted.SUMMARY) result += `Event: ${formatted.SUMMARY}\n`;
    if (formatted.DTSTART) result += `Start: ${formatDate(formatted.DTSTART)}\n`;
    if (formatted.DTEND) result += `End: ${formatDate(formatted.DTEND)}\n`;
    if (formatted.LOCATION) result += `Location: ${formatted.LOCATION}\n`;
    if (formatted.DESCRIPTION) result += `Description: ${formatted.DESCRIPTION}\n`;
    
    return result || event;
  }
  
  /**
   * Gets the color for a content type
   * @param {string} type - The content type
   * @returns {string} Color for the type
   */
  function getTypeColor(type) {
    const colors = {
      'URL': '#3498db',
      'Email': '#9b59b6',
      'Phone': '#2ecc71',
      'SMS': '#1abc9c',
      'vCard': '#e74c3c',
      'WiFi': '#f39c12',
      'Location': '#3498db',
      'Calendar': '#16a085',
      'Encrypted': '#34495e',
      'Text': '#7f8c8d'
    };
    
    return colors[type] || '#7f8c8d';
  }
  
  /**
   * Checks if a URL is potentially malicious
   * @param {string} url - The URL to check
   * @returns {Object} Security check result
   */
  function checkURLSecurity(url) {
    const result = { safe: true, reason: '' };
    
    // List of suspicious TLDs
    const suspiciousTLDs = ['.tk', '.top', '.xyz', '.ga', '.cf', '.gq', '.ml'];
    
    // List of suspicious keywords
    const suspiciousKeywords = [
      'login', 'signin', 'account', 'password', 'verify', 'payment', 'bank',
      'wallet', 'crypto', 'security', 'update', 'validate'
    ];
    
    // Check for suspicious protocols
    if (url.match(/^(data:|javascript:|file:)/i)) {
      result.safe = false;
      result.reason = 'This URL uses a potentially dangerous protocol that could compromise your security.';
      return result;
    }
    
    // Check for suspicious TLDs
    for (const tld of suspiciousTLDs) {
      if (url.includes(tld)) {
        result.safe = false;
        result.reason = 'This URL uses a domain extension that is commonly associated with phishing websites.';
        return result;
      }
    }
    
    // Check for suspicious keywords in domain
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      for (const keyword of suspiciousKeywords) {
        if (domain.includes(keyword)) {
          result.safe = false;
          result.reason = 'This URL contains keywords that are commonly used in phishing attacks.';
          return result;
        }
      }
      
      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do'];
      if (shorteners.some(shortener => domain.includes(shortener))) {
        result.safe = false;
        result.reason = 'This URL uses a URL shortening service which may hide the actual destination.';
        return result;
      }
    } catch (e) {
      // Invalid URL format
      result.safe = false;
      result.reason = 'This URL has an invalid format.';
      return result;
    }
    
    return result;
  }
  
  /**
   * Copies the scanned content to the clipboard
   */
  function copyScannedContent() {
    if (!currentScannedData) return;
    
    navigator.clipboard.writeText(currentScannedData)
      .then(() => {
        showAlert('Content copied to clipboard!', 'success');
        
        // Change button text temporarily
        const originalText = copyScannedBtn.innerHTML;
        copyScannedBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyScannedBtn.innerHTML = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        showAlert('Failed to copy content. Please try again.', 'error');
      });
  }
  
  /**
   * Opens the scanned URL in a new tab
   */
  function openScannedLink() {
    if (!currentScannedData) return;
    
    const contentType = detectContentType(currentScannedData);
    if (contentType.type !== 'URL') return;
    
    // Perform a security check before opening
    const securityResult = checkURLSecurity(currentScannedData);
    if (!securityResult.safe) {
      const proceed = confirm(
        `⚠️ Security Warning: ${securityResult.reason}\n\nDo you still want to open this URL?`
      );
      
      if (!proceed) return;
    }
    
    // Open URL in new tab
    window.open(currentScannedData, '_blank');
  }
  
  /**
   * Resets the scan button to its original state
   */
  function resetScanButton() {
    scanQrBtn.disabled = false;
    scanQrBtn.innerHTML = '<i class="fas fa-search"></i> Scan QR Code';
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
  
  // Return public API
  return {
    init,
    scan: scanQRCode,
    detectContentType,
    checkURLSecurity
  };
})();