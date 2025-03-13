/**
 * QR Code Generator Module
 * Handles creation of customizable QR codes with various options
 */

// Create a self-executing anonymous function to encapsulate the module
const QRCodeGenerator = (function() {
  // Module state
  let currentQrData = '';
  let currentQrImage = null;
  let currentQrSettings = {};
  let currentLogoImage = null;
  
  // DOM elements cache
  let qrTypeSelect;
  let dynamicFields;
  let generateQrBtn;
  let resetFormBtn;
  let qrPreview;
  let qrDataPreview;
  let downloadOptions;
  let saveToHistoryBtn;
  let fgColorInput;
  let bgColorInput;
  let errorCorrectionLevelSelect;
  let qrSizeSelect;
  let qrLogoInput;
  let logoSizeInput;
  let logoSizeValue;
  let logoSizeGroup;
  let enableEncryptionCheckbox;
  let encryptionPasswordGroup;
  let securityScanCheckbox;
  let downloadPng;
  let downloadJpg;
  let downloadSvg;
  let downloadPdf;
  
  /**
   * Initializes the generator module
   */
  function init() {
    // Cache DOM elements
    qrTypeSelect = document.getElementById('qrType');
    dynamicFields = document.getElementById('dynamicFields');
    generateQrBtn = document.getElementById('generateQrBtn');
    resetFormBtn = document.getElementById('resetFormBtn');
    qrPreview = document.getElementById('qrPreview');
    qrDataPreview = document.getElementById('qrDataPreview');
    downloadOptions = document.querySelector('.qr-download-options');
    saveToHistoryBtn = document.getElementById('saveToHistoryBtn');
    
    // Elements for customization
    fgColorInput = document.getElementById('fgColor');
    bgColorInput = document.getElementById('bgColor');
    errorCorrectionLevelSelect = document.getElementById('errorCorrectionLevel');
    qrSizeSelect = document.getElementById('qrSize');
    qrLogoInput = document.getElementById('qrLogo');
    logoSizeInput = document.getElementById('logoSize');
    logoSizeValue = document.getElementById('logoSizeValue');
    logoSizeGroup = document.getElementById('logoSizeGroup');
    
    // Elements for security
    enableEncryptionCheckbox = document.getElementById('enableEncryption');
    encryptionPasswordGroup = document.getElementById('encryptionPasswordGroup');
    securityScanCheckbox = document.getElementById('securityScan');
    
    // Download buttons
    downloadPng = document.getElementById('downloadPng');
    downloadJpg = document.getElementById('downloadJpg');
    downloadSvg = document.getElementById('downloadSvg');
    downloadPdf = document.getElementById('downloadPdf');
    
    // Setup event listeners
    if (qrTypeSelect) {
      qrTypeSelect.addEventListener('change', updateDynamicFields);
    }
    
    if (generateQrBtn) {
      generateQrBtn.addEventListener('click', generateQRCode);
    }
    
    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', resetForm);
    }
    
    if (qrLogoInput) {
      qrLogoInput.addEventListener('change', handleLogoUpload);
    }
    
    if (logoSizeInput) {
      logoSizeInput.addEventListener('input', updateLogoSizeValue);
    }
    
    if (enableEncryptionCheckbox) {
      enableEncryptionCheckbox.addEventListener('change', toggleEncryptionPassword);
    }
    
    // Download event listeners
    if (downloadPng) {
      downloadPng.addEventListener('click', () => downloadQRCode('png'));
    }
    
    if (downloadJpg) {
      downloadJpg.addEventListener('click', () => downloadQRCode('jpg'));
    }
    
    if (downloadSvg) {
      downloadSvg.addEventListener('click', () => downloadQRCode('svg'));
    }
    
    if (downloadPdf) {
      downloadPdf.addEventListener('click', () => downloadQRCode('pdf'));
    }
    
    if (saveToHistoryBtn) {
      saveToHistoryBtn.addEventListener('click', saveToHistory);
    }
    
    // Initialize accordions if needed
    setupAccordions();
    
    // Initialize the form with URL type (default)
    if (qrTypeSelect && dynamicFields) {
      updateDynamicFields();
    }
  }
  
  /**
   * Updates form fields based on selected QR code type
   */
  function updateDynamicFields() {
    const selectedType = qrTypeSelect.value;
    let fieldsHTML = '';
    
    switch (selectedType) {
      case 'text':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="textInput">Text Content</label>
            <textarea id="textInput" rows="3" placeholder="Enter your text here"></textarea>
          </div>
        `;
        break;
        
      case 'url':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="urlInput">Website URL</label>
            <input type="url" id="urlInput" placeholder="https://example.com" value="https://kvsovanreach.github.io">
            <small>Enter the full URL including http:// or https://</small>
          </div>
        `;
        break;
        
      case 'email':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="emailAddressInput">Email Address</label>
            <input type="email" id="emailAddressInput" placeholder="email@example.com">
          </div>
          <div class="qr-field-group">
            <label for="emailSubjectInput">Subject (Optional)</label>
            <input type="text" id="emailSubjectInput" placeholder="Email subject">
          </div>
          <div class="qr-field-group">
            <label for="emailBodyInput">Body (Optional)</label>
            <textarea id="emailBodyInput" rows="3" placeholder="Email body"></textarea>
          </div>
        `;
        break;
        
      case 'phone':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="phoneInput">Phone Number</label>
            <input type="tel" id="phoneInput" placeholder="+1234567890">
            <small>Include country code for international numbers</small>
          </div>
        `;
        break;
        
      case 'sms':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="smsPhoneInput">Phone Number</label>
            <input type="tel" id="smsPhoneInput" placeholder="+1234567890">
            <small>Include country code for international numbers</small>
          </div>
          <div class="qr-field-group">
            <label for="smsMessageInput">Message (Optional)</label>
            <textarea id="smsMessageInput" rows="3" placeholder="Enter SMS message"></textarea>
          </div>
        `;
        break;
        
      case 'vcard':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="vcardNameInput">Full Name</label>
            <input type="text" id="vcardNameInput" placeholder="John Doe">
          </div>
          <div class="qr-field-group">
            <label for="vcardCompanyInput">Company (Optional)</label>
            <input type="text" id="vcardCompanyInput" placeholder="Company Name">
          </div>
          <div class="qr-field-group">
            <label for="vcardTitleInput">Job Title (Optional)</label>
            <input type="text" id="vcardTitleInput" placeholder="Job Title">
          </div>
          <div class="qr-field-group">
            <label for="vcardPhoneInput">Phone Number</label>
            <input type="tel" id="vcardPhoneInput" placeholder="+1234567890">
          </div>
          <div class="qr-field-group">
            <label for="vcardEmailInput">Email</label>
            <input type="email" id="vcardEmailInput" placeholder="email@example.com">
          </div>
          <div class="qr-field-group">
            <label for="vcardAddressInput">Address (Optional)</label>
            <textarea id="vcardAddressInput" rows="2" placeholder="Street, City, State, ZIP, Country"></textarea>
          </div>
          <div class="qr-field-group">
            <label for="vcardWebsiteInput">Website (Optional)</label>
            <input type="url" id="vcardWebsiteInput" placeholder="https://example.com">
          </div>
        `;
        break;
        
      case 'wifi':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="wifiSsidInput">Network Name (SSID)</label>
            <input type="text" id="wifiSsidInput" placeholder="Wi-Fi Network Name">
          </div>
          <div class="qr-field-group">
            <label for="wifiPasswordInput">Password</label>
            <input type="password" id="wifiPasswordInput" placeholder="Wi-Fi Password">
          </div>
          <div class="qr-field-group">
            <label for="wifiTypeInput">Security Type</label>
            <select id="wifiTypeInput">
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
          <div class="qr-field-group qr-checkbox-group">
            <input type="checkbox" id="wifiHiddenInput">
            <label for="wifiHiddenInput">Hidden network</label>
          </div>
        `;
        break;
        
      case 'geo':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="geoLatitudeInput">Latitude</label>
            <input type="number" step="any" id="geoLatitudeInput" placeholder="Latitude (e.g., 37.7749)">
          </div>
          <div class="qr-field-group">
            <label for="geoLongitudeInput">Longitude</label>
            <input type="number" step="any" id="geoLongitudeInput" placeholder="Longitude (e.g., -122.4194)">
          </div>
          <div class="qr-field-group">
            <label for="geoNameInput">Location Name (Optional)</label>
            <input type="text" id="geoNameInput" placeholder="Location Name">
          </div>
        `;
        break;
        
      case 'calendar':
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="calendarTitleInput">Event Title</label>
            <input type="text" id="calendarTitleInput" placeholder="Event Title">
          </div>
          <div class="qr-field-group">
            <label for="calendarStartInput">Start Date and Time</label>
            <input type="datetime-local" id="calendarStartInput">
          </div>
          <div class="qr-field-group">
            <label for="calendarEndInput">End Date and Time</label>
            <input type="datetime-local" id="calendarEndInput">
          </div>
          <div class="qr-field-group">
            <label for="calendarLocationInput">Location (Optional)</label>
            <input type="text" id="calendarLocationInput" placeholder="Event Location">
          </div>
          <div class="qr-field-group">
            <label for="calendarDescriptionInput">Description (Optional)</label>
            <textarea id="calendarDescriptionInput" rows="3" placeholder="Event Description"></textarea>
          </div>
        `;
        break;
        
      default:
        fieldsHTML = `
          <div class="qr-field-group">
            <label for="textInput">Text Content</label>
            <textarea id="textInput" rows="3" placeholder="Enter your text here"></textarea>
          </div>
        `;
    }
    
    // Update the dynamic fields container
    dynamicFields.innerHTML = fieldsHTML;
  }
  
  /**
   * Generates QR code based on form inputs
   */
  function generateQRCode() {
    if (!qrTypeSelect || !qrPreview) {
      console.error('Required DOM elements not found');
      return;
    }
    
    const qrType = qrTypeSelect.value;
    const qrData = getQRCodeData(qrType);
    
    if (!qrData) {
      showAlert('Please fill in the required fields.', 'error');
      return;
    }
    
    // Store current data for downloads
    currentQrData = qrData;
    
    // Get customization settings
    const fgColor = fgColorInput.value;
    const bgColor = bgColorInput.value;
    const errorCorrectionLevel = errorCorrectionLevelSelect.value;
    const qrSize = parseInt(qrSizeSelect.value);
    
    // Security checks if enabled
    if (securityScanCheckbox.checked) {
      const securityResult = performSecurityCheck(qrData);
      if (!securityResult.safe) {
        showAlert(`Security warning: ${securityResult.reason}`, 'warning');
      }
    }
    
    // Store current settings
    currentQrSettings = {
      type: qrType,
      fgColor,
      bgColor,
      errorCorrectionLevel,
      size: qrSize,
      encrypted: enableEncryptionCheckbox.checked,
    };
    
    // Clear previous QR code
    qrPreview.innerHTML = '';
    
    // Create a canvas element first
    const canvas = document.createElement('canvas');
    qrPreview.appendChild(canvas);
    
    // Generate QR code
    QRCode.toCanvas(canvas, qrData, {
      width: qrSize,
      height: qrSize,
      color: {
        dark: fgColor,
        light: bgColor
      },
      errorCorrectionLevel: errorCorrectionLevel
    }, function(error, canvas) {
      if (error) {
        console.error('Error generating QR code:', error);
        showAlert('Error generating QR code. Please try again.', 'error');
        return;
      }
      
      // Add logo if provided
      if (currentLogoImage) {
        addLogoToQRCode(canvas);
      } else {
        // Store the current QR image
        currentQrImage = canvas;
        
        // Show download options
        downloadOptions.style.display = 'block';
        
        // Update data preview
        qrDataPreview.innerHTML = `<p>${truncateText(qrData, 100)}</p>`;
      }
    });
  }
  
  /**
   * Adds a logo to the center of the QR code
   * @param {HTMLCanvasElement} canvas - The QR code canvas
   */
  function addLogoToQRCode(canvas) {
    const canvasContext = canvas.getContext('2d');
    const logoSize = parseInt(logoSizeInput.value) / 100;
    const logoWidth = canvas.width * logoSize;
    const logoHeight = canvas.height * logoSize;
    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = (canvas.height - logoHeight) / 2;
    
    // Draw logo
    canvasContext.drawImage(
      currentLogoImage,
      logoX,
      logoY,
      logoWidth,
      logoHeight
    );
    
    // Store the current QR image
    currentQrImage = canvas;
    
    // Show download options
    downloadOptions.style.display = 'block';
    
    // Update data preview
    qrDataPreview.innerHTML = `<p>${truncateText(currentQrData, 100)}</p>`;
  }
  
  /**
   * Gets QR code data based on the selected type
   * @param {string} type - The QR code type
   * @returns {string|null} - The formatted QR code data
   */
  function getQRCodeData(type) {
    let data = null;
    
    switch (type) {
      case 'text':
        const textInput = document.getElementById('textInput');
        if (textInput.value.trim()) {
          data = textInput.value.trim();
        }
        break;
        
      case 'url':
        const urlInput = document.getElementById('urlInput');
        if (urlInput.value.trim()) {
          // Validate URL
          if (!urlInput.value.match(/^(http|https):\/\/[^ "]+$/)) {
            const correctedUrl = urlInput.value.trim().match(/^(http|https):\/\//) 
              ? urlInput.value.trim() 
              : `https://${urlInput.value.trim()}`;
            urlInput.value = correctedUrl;
          }
          data = urlInput.value;
        }
        break;
        
      case 'email':
        const emailAddress = document.getElementById('emailAddressInput').value.trim();
        const emailSubject = document.getElementById('emailSubjectInput').value.trim();
        const emailBody = document.getElementById('emailBodyInput').value.trim();
        
        if (emailAddress) {
          data = `mailto:${emailAddress}`;
          
          const params = [];
          if (emailSubject) params.push(`subject=${encodeURIComponent(emailSubject)}`);
          if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
          
          if (params.length > 0) {
            data += `?${params.join('&')}`;
          }
        }
        break;
        
      case 'phone':
        const phoneInput = document.getElementById('phoneInput');
        if (phoneInput.value.trim()) {
          data = `tel:${phoneInput.value.trim()}`;
        }
        break;
        
      case 'sms':
        const smsPhone = document.getElementById('smsPhoneInput').value.trim();
        const smsMessage = document.getElementById('smsMessageInput').value.trim();
        
        if (smsPhone) {
          data = `smsto:${smsPhone}`;
          if (smsMessage) {
            data += `:${smsMessage}`;
          }
        }
        break;
        
      case 'vcard':
        const name = document.getElementById('vcardNameInput').value.trim();
        const company = document.getElementById('vcardCompanyInput').value.trim();
        const title = document.getElementById('vcardTitleInput').value.trim();
        const phone = document.getElementById('vcardPhoneInput').value.trim();
        const email = document.getElementById('vcardEmailInput').value.trim();
        const address = document.getElementById('vcardAddressInput').value.trim();
        const website = document.getElementById('vcardWebsiteInput').value.trim();
        
        if (name && (phone || email)) {
          data = 'BEGIN:VCARD\nVERSION:3.0\n';
          data += `FN:${name}\n`;
          if (company) data += `ORG:${company}\n`;
          if (title) data += `TITLE:${title}\n`;
          if (phone) data += `TEL:${phone}\n`;
          if (email) data += `EMAIL:${email}\n`;
          if (address) data += `ADR:;;${address};;;;\n`;
          if (website) data += `URL:${website}\n`;
          data += 'END:VCARD';
        }
        break;
        
      case 'wifi':
        const ssid = document.getElementById('wifiSsidInput').value.trim();
        const password = document.getElementById('wifiPasswordInput').value;
        const type = document.getElementById('wifiTypeInput').value;
        const hidden = document.getElementById('wifiHiddenInput').checked;
        
        if (ssid) {
          data = `WIFI:S:${ssid};`;
          if (type !== 'nopass') {
            data += `T:${type};P:${password};`;
          } else {
            data += 'T:nopass;';
          }
          if (hidden) {
            data += 'H:true;';
          }
          data += ';';
        }
        break;
        
      case 'geo':
        const latitude = document.getElementById('geoLatitudeInput').value.trim();
        const longitude = document.getElementById('geoLongitudeInput').value.trim();
        const locationName = document.getElementById('geoNameInput').value.trim();
        
        if (latitude && longitude) {
          data = `geo:${latitude},${longitude}`;
          if (locationName) {
            data += `?q=${encodeURIComponent(locationName)}`;
          }
        }
        break;
        
      case 'calendar':
        const calendarTitle = document.getElementById('calendarTitleInput').value.trim();
        const start = document.getElementById('calendarStartInput').value;
        const end = document.getElementById('calendarEndInput').value;
        const location = document.getElementById('calendarLocationInput').value.trim();
        const description = document.getElementById('calendarDescriptionInput').value.trim();
        
        if (calendarTitle && start && end) {
          // Format dates for iCalendar
          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
          };
          
          data = 'BEGIN:VEVENT\n';
          data += `SUMMARY:${calendarTitle}\n`;
          data += `DTSTART:${formatDate(start)}\n`;
          data += `DTEND:${formatDate(end)}\n`;
          if (location) data += `LOCATION:${location}\n`;
          if (description) data += `DESCRIPTION:${description}\n`;
          data += 'END:VEVENT';
        }
        break;
    }
    
    // Apply encryption if enabled
    if (data && enableEncryptionCheckbox.checked) {
      const password = document.getElementById('encryptionPassword').value;
      if (password) {
        data = encryptData(data, password);
      }
    }
    
    return data;
  }
  
  /**
   * Handles logo image upload
   * @param {Event} event - The change event
   */
  function handleLogoUpload(event) {
    const file = event.target.files[0];
    const qrLogoFileName = document.getElementById('qrLogoFileName');
    
    if (!file) {
      currentLogoImage = null;
      logoSizeGroup.style.display = 'none';
      if (qrLogoFileName) qrLogoFileName.textContent = '';
      return;
    }
    
    if (!file.type.match('image.*')) {
      showAlert('Please select an image file.', 'error');
      qrLogoInput.value = '';
      if (qrLogoFileName) qrLogoFileName.textContent = '';
      return;
    }
    
    // Update file name display
    if (qrLogoFileName) {
      qrLogoFileName.textContent = file.name;
      qrLogoFileName.style.color = 'var(--qr-success)';
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        currentLogoImage = img;
        logoSizeGroup.style.display = 'block';
        
        // If a QR code is already generated, add the logo to it
        if (currentQrImage) {
          generateQRCode();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Updates the logo size value display
   */
  function updateLogoSizeValue() {
    logoSizeValue.textContent = `${logoSizeInput.value}%`;
    
    // If a QR code is already generated, update the logo
    if (currentQrImage && currentLogoImage) {
      generateQRCode();
    }
  }
  
  /**
   * Toggles the display of the encryption password field
   */
  function toggleEncryptionPassword() {
    encryptionPasswordGroup.style.display = enableEncryptionCheckbox.checked ? 'block' : 'none';
  }
  
  /**
   * Downloads the QR code in the specified format
   * @param {string} format - The download format (png, jpg, svg, pdf)
   */
  function downloadQRCode(format) {
    if (!currentQrImage) {
      showAlert('Please generate a QR code first.', 'error');
      return;
    }
    
    const filename = `qrcode_${Date.now()}`;
    const canvas = currentQrImage;
    
    switch (format) {
      case 'png':
        const pngUrl = canvas.toDataURL('image/png');
        downloadFile(pngUrl, `${filename}.png`);
        break;
        
      case 'jpg':
        const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
        downloadFile(jpgUrl, `${filename}.jpg`);
        break;
        
      case 'svg':
        // Convert canvas to SVG
        const svgData = canvasToSVG(canvas);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadFile(svgUrl, `${filename}.svg`);
        break;
        
      case 'pdf':
        // Create PDF with jsPDF
        const pdf = new window.jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate center position
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Set QR code size on PDF (max 150mm)
        const qrSize = Math.min(pageWidth - 40, 150);
        const xPos = (pageWidth - qrSize) / 2;
        const yPos = 20;
        
        // Add QR code to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xPos, yPos, qrSize, qrSize);
        
        // Add content info
        pdf.setFontSize(12);
        pdf.text(`QR Code Type: ${qrTypeSelect.options[qrTypeSelect.selectedIndex].text}`, 20, yPos + qrSize + 20);
        pdf.text(`Created: ${new Date().toLocaleString()}`, 20, yPos + qrSize + 30);
        
        pdf.save(`${filename}.pdf`);
        break;
    }
  }
  
  /**
   * Saves the current QR code to history
   */
  function saveToHistory() {
    if (!currentQrImage || !currentQrData) {
      showAlert('Please generate a QR code first.', 'error');
      return;
    }
    
    // Get a name for the QR code
    const qrName = prompt('Enter a name for this QR code:', getDefaultQRName());
    if (!qrName) return; // User cancelled
    
    // Get data to save
    const qrDataToSave = {
      id: generateUniqueId(), // Add unique ID
      name: qrName,
      type: currentQrSettings.type,
      data: currentQrData,
      settings: currentQrSettings,
      image: currentQrImage.toDataURL('image/png'),
      createdAt: new Date().toISOString()
    };
    
    // Save to history using the history module
    if (typeof QRCodeHistory !== 'undefined' && QRCodeHistory.addToHistory) {
      // Initialize history tab if user is viewing history
      if (window.location.hash === '#history') {
        // If we're already on the history tab, make sure to initialize it
        if (typeof window.QRCodeTool !== 'undefined' && window.QRCodeTool.showFeature) {
          window.QRCodeTool.showFeature('history');
        }
      }
      
      // Add the QR code to history
      // Add to history and get the ID of the saved item
      QRCodeHistory.addToHistory(qrDataToSave);
      
      // Show success alert with button options
      const alertMessage = 'QR code saved to history successfully!';
      
      // Create a custom confirmation dialog rather than using browser's native confirm
      // This will be more user-friendly and won't block execution
      const alertElement = document.createElement('div');
      alertElement.className = 'qr-alert qr-alert-success qr-alert-custom';
      alertElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${alertMessage}</span>
        <div class="qr-alert-buttons">
          <button id="viewHistoryBtn" class="qr-alert-btn">View in History</button>
          <button id="stayHereBtn" class="qr-alert-close"><i class="fas fa-times"></i></button>
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(alertElement);
      
      // Show alert with animation
      setTimeout(() => {
        alertElement.classList.add('qr-alert-show');
      }, 10);
      
      // Add event listeners for buttons
      const viewHistoryBtn = alertElement.querySelector('#viewHistoryBtn');
      const stayHereBtn = alertElement.querySelector('#stayHereBtn');
      
      if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
          // Close the alert
          alertElement.classList.add('qr-alert-closing');
          setTimeout(() => {
            if (document.body.contains(alertElement)) {
              document.body.removeChild(alertElement);
            }
          }, 300);
          
          // Simply switch to history tab
          if (typeof window.QRCodeTool !== 'undefined' && window.QRCodeTool.showFeature) {
            window.QRCodeTool.showFeature('history');
          }
        });
      }
      
      if (stayHereBtn) {
        stayHereBtn.addEventListener('click', () => {
          // Just close the alert
          alertElement.classList.add('qr-alert-closing');
          setTimeout(() => {
            if (document.body.contains(alertElement)) {
              document.body.removeChild(alertElement);
            }
          }, 300);
        });
      }
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (document.body.contains(alertElement)) {
          alertElement.classList.add('qr-alert-closing');
          setTimeout(() => {
            if (document.body.contains(alertElement)) {
              document.body.removeChild(alertElement);
            }
          }, 300);
        }
      }, 10000);
    } else {
      console.error('QR Code History module not available');
      showAlert('Could not save to history. Please try again later.', 'error');
    }
  }
  
  /**
   * Generates a unique ID for history items
   * @returns {string} Unique ID
   */
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Performs a security check on the QR code data
   * @param {string} data - The QR code data to check
   * @returns {Object} Security check result
   */
  function performSecurityCheck(data) {
    const result = { safe: true, reason: '' };
    
    // Check for suspicious URLs
    if (data.match(/^https?:\/\//i)) {
      // List of suspicious TLDs and keywords
      const suspiciousTLDs = ['.tk', '.top', '.xyz', '.ga', '.cf', '.gq', '.ml'];
      const suspiciousKeywords = ['login', 'signin', 'account', 'password', 'verify', 'payment', 'bank'];
      
      // Check for suspicious TLDs
      for (const tld of suspiciousTLDs) {
        if (data.includes(tld)) {
          result.safe = false;
          result.reason = 'The URL contains a potentially suspicious domain.';
          return result;
        }
      }
      
      // Check for suspicious keywords in URL
      for (const keyword of suspiciousKeywords) {
        if (data.toLowerCase().includes(keyword)) {
          result.safe = false;
          result.reason = 'The URL may be attempting to collect sensitive information.';
          return result;
        }
      }
      
      // Check for unusual URL patterns (data URLs, javascript:, etc.)
      if (data.match(/^(data:|javascript:|file:)/i)) {
        result.safe = false;
        result.reason = 'The URL uses a potentially unsafe protocol.';
        return result;
      }
    }
    
    return result;
  }
  
  /**
   * Resets the QR code generation form
   */
  function resetForm() {
    // Reset dynamic fields
    qrTypeSelect.value = 'url';
    updateDynamicFields();
    
    // Reset customization options
    fgColorInput.value = '#000000';
    bgColorInput.value = '#ffffff';
    errorCorrectionLevelSelect.value = 'M';
    qrSizeSelect.value = '256';
    
    // Reset logo
    qrLogoInput.value = '';
    currentLogoImage = null;
    logoSizeGroup.style.display = 'none';
    logoSizeInput.value = 15;
    logoSizeValue.textContent = '15%';
    
    // Reset security options
    enableEncryptionCheckbox.checked = false;
    encryptionPasswordGroup.style.display = 'none';
    securityScanCheckbox.checked = false;
    
    // Reset preview
    qrPreview.innerHTML = `
      <div class="qr-placeholder">
        <i class="fas fa-qrcode"></i>
        <p>Your QR code will appear here</p>
      </div>
    `;
    qrDataPreview.innerHTML = '<p>No data encoded yet</p>';
    
    // Hide download options
    downloadOptions.style.display = 'none';
    
    // Reset variables
    currentQrData = '';
    currentQrImage = null;
    currentQrSettings = {};
  }
  
  /* Helper Functions */
  
  /**
   * Sets up accordion functionality
   */
  function setupAccordions() {
    const accordionHeaders = document.querySelectorAll('.qr-accordion-header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const accordionItem = this.parentElement;
        const accordionContent = this.nextElementSibling;
        
        // Toggle active class
        accordionItem.classList.toggle('active');
        
        // Adjust max-height for animation
        if (accordionItem.classList.contains('active')) {
          accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
        } else {
          accordionContent.style.maxHeight = '0';
        }
      });
    });
    
    // Open first accordion by default
    if (accordionHeaders.length > 0) {
      accordionHeaders[0].click();
    }
  }
  
  /**
   * Converts a canvas to an SVG string
   * @param {HTMLCanvasElement} canvas - The canvas to convert
   * @returns {string} SVG data
   */
  function canvasToSVG(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Add background
    svg += `<rect width="${width}" height="${height}" fill="${bgColorInput.value}"/>`;
    
    // Add each pixel as a rect if it's not the background color
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3] / 255;
        
        const color = `rgba(${r},${g},${b},${a})`;
        
        // If not background color, add a rectangle
        if (color !== bgColorInput.value) {
          svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  }
  
  /**
   * Downloads a file from a URL
   * @param {string} url - The URL of the file
   * @param {string} filename - The name to save the file as
   */
  function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up URL object if needed
    if (url.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
  
  /**
   * Gets a default name for the QR code based on its type and content
   * @returns {string} Default QR code name
   */
  function getDefaultQRName() {
    const qrType = qrTypeSelect.options[qrTypeSelect.selectedIndex].text;
    let nameSuffix = '';
    
    switch (qrTypeSelect.value) {
      case 'url':
        try {
          const url = new URL(currentQrData);
          nameSuffix = url.hostname;
        } catch (e) {
          nameSuffix = 'website';
        }
        break;
        
      case 'text':
        nameSuffix = truncateText(currentQrData, 20);
        break;
        
      case 'vcard':
        const nameMatch = currentQrData.match(/FN:([^\n]+)/);
        nameSuffix = nameMatch ? nameMatch[1] : 'contact';
        break;
        
      case 'email':
        const emailMatch = currentQrData.match(/mailto:([^?]+)/);
        nameSuffix = emailMatch ? emailMatch[1] : 'email';
        break;
        
      case 'wifi':
        const ssidMatch = currentQrData.match(/WIFI:S:([^;]+)/);
        nameSuffix = ssidMatch ? ssidMatch[1] : 'network';
        break;
        
      default:
        nameSuffix = new Date().toLocaleDateString();
    }
    
    return `${qrType} - ${nameSuffix}`;
  }
  
  /**
   * Encrypts data with a password
   * @param {string} data - The data to encrypt
   * @param {string} password - The encryption password
   * @returns {string} Encrypted data
   */
  function encryptData(data, password) {
    // Simple XOR encryption (for demo purposes only)
    let result = 'ENCRYPTED:';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }
  
  /**
   * Truncates text to a specified length
   * @param {string} text - The text to truncate
   * @param {number} maxLength - The maximum length
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
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
  // Make updateDynamicFields globally accessible for the main module
  window.updateDynamicFields = updateDynamicFields;
  
  // Return public API
  return {
    init,
    generateQRCode,
    resetForm,
    updateDynamicFields
  };
})();