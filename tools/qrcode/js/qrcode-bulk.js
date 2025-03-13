/**
 * QR Code Bulk Generation Module
 * Handles generation of multiple QR codes from CSV input
 */

// Create a self-executing anonymous function to encapsulate the module
const QRCodeBulk = (function() {
  // Module state variables
  const PREVIEW_ITEMS_PER_PAGE = 5;
  let currentPreviewPage = 1;
  let totalPreviewPages = 1;
  let csvData = [];
  let generatedZipFile = null;
  
  // DOM elements cache
  let bulkCsvFile;
  let bulkFilePreview;
  let csvPreviewTable;
  let previewPagination;
  let prevPreviewPage;
  let nextPreviewPage;
  let generateBulkBtn;
  let bulkProgress;
  let bulkProgressBar;
  let bulkProgressText;
  let downloadBulkZip;
  let downloadSampleCsv;
  let bulkFgColor;
  let bulkBgColor;
  let bulkErrorCorrectionLevel;
  let bulkQrSize;
  let bulkFormat;
  let includeLabels;
  
  /**
   * Initializes the bulk generation module
   */
  function init() {
    // Cache DOM elements
    bulkCsvFile = document.getElementById('bulkCsvFile');
    bulkFilePreview = document.getElementById('bulkFilePreview');
    csvPreviewTable = document.getElementById('csvPreviewTable');
    previewPagination = document.getElementById('previewPagination');
    prevPreviewPage = document.getElementById('prevPreviewPage');
    nextPreviewPage = document.getElementById('nextPreviewPage');
    generateBulkBtn = document.getElementById('generateBulkBtn');
    bulkProgress = document.getElementById('bulkProgress');
    bulkProgressBar = document.getElementById('bulkProgressBar');
    bulkProgressText = document.getElementById('bulkProgressText');
    downloadBulkZip = document.getElementById('downloadBulkZip');
    downloadSampleCsv = document.getElementById('downloadSampleCsv');
    
    // Customization options
    bulkFgColor = document.getElementById('bulkFgColor');
    bulkBgColor = document.getElementById('bulkBgColor');
    bulkErrorCorrectionLevel = document.getElementById('bulkErrorCorrectionLevel');
    bulkQrSize = document.getElementById('bulkQrSize');
    bulkFormat = document.getElementById('bulkFormat');
    includeLabels = document.getElementById('includeLabels');
    
    // Setup event listeners if elements exist
    if (bulkCsvFile) {
      bulkCsvFile.addEventListener('change', handleCsvFileUpload);
    }
    
    if (prevPreviewPage) {
      prevPreviewPage.addEventListener('click', () => changeCsvPreviewPage(-1));
    }
    
    if (nextPreviewPage) {
      nextPreviewPage.addEventListener('click', () => changeCsvPreviewPage(1));
    }
    
    if (generateBulkBtn) {
      generateBulkBtn.addEventListener('click', generateBulkQRCodes);
    }
    
    if (downloadBulkZip) {
      downloadBulkZip.addEventListener('click', downloadZipFile);
    }
    
    if (downloadSampleCsv) {
      downloadSampleCsv.addEventListener('click', downloadSampleCsvFile);
    }
    
    // Initialize accordion functionality
    setupAccordions();
  }
  
  /**
   * Handles CSV file upload
   * @param {Event} event - The change event
   */
  function handleCsvFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showAlert('Please select a valid CSV file.', 'error');
      event.target.value = '';
      return;
    }
    
    // Read the CSV file
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        // Parse CSV with PapaParse
        Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            if (results.data.length === 0) {
              showAlert('The CSV file is empty. Please upload a valid CSV file.', 'error');
              return;
            }
            
            // Validate CSV structure
            const requiredColumns = ['label', 'content'];
            const hasRequiredColumns = requiredColumns.every(column => 
              results.meta.fields.includes(column)
            );
            
            if (!hasRequiredColumns) {
              showAlert('The CSV file must include "label" and "content" columns.', 'error');
              return;
            }
            
            // Store CSV data
            csvData = results.data;
            
            // Update preview
            currentPreviewPage = 1;
            totalPreviewPages = Math.ceil(csvData.length / PREVIEW_ITEMS_PER_PAGE);
            updateCsvPreview();
            
            // Show preview and enable generate button
            bulkFilePreview.style.display = 'block';
            generateBulkBtn.disabled = false;
            
            showAlert(`CSV file loaded with ${csvData.length} entries.`, 'success');
          },
          error: function(error) {
            console.error('Error parsing CSV:', error);
            showAlert('Error parsing CSV file. Please check the file format.', 'error');
          }
        });
      } catch (error) {
        console.error('Error reading CSV:', error);
        showAlert('Error reading CSV file. Please try again.', 'error');
      }
    };
    
    reader.onerror = function() {
      showAlert('Error reading the file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Updates the CSV preview table
   */
  function updateCsvPreview() {
    // Clear table except header
    const tbody = csvPreviewTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Calculate slice for current page
    const startIndex = (currentPreviewPage - 1) * PREVIEW_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + PREVIEW_ITEMS_PER_PAGE, csvData.length);
    const currentPageData = csvData.slice(startIndex, endIndex);
    
    // Add rows to the table
    currentPageData.forEach(entry => {
      const row = document.createElement('tr');
      
      // Label column
      const labelCell = document.createElement('td');
      labelCell.textContent = entry.label || 'Untitled';
      row.appendChild(labelCell);
      
      // Content column
      const contentCell = document.createElement('td');
      contentCell.textContent = truncateText(entry.content || '', 30);
      row.appendChild(contentCell);
      
      // Type column
      const typeCell = document.createElement('td');
      typeCell.textContent = entry.type || 'text';
      row.appendChild(typeCell);
      
      tbody.appendChild(row);
    });
    
    // Update pagination text
    previewPagination.textContent = `Showing ${startIndex + 1}-${endIndex} of ${csvData.length} entries`;
    
    // Update pagination buttons
    prevPreviewPage.disabled = currentPreviewPage === 1;
    nextPreviewPage.disabled = currentPreviewPage === totalPreviewPages;
  }
  
  /**
   * Changes the current CSV preview page
   * @param {number} direction - The direction to change (-1 or 1)
   */
  function changeCsvPreviewPage(direction) {
    const newPage = currentPreviewPage + direction;
    if (newPage >= 1 && newPage <= totalPreviewPages) {
      currentPreviewPage = newPage;
      updateCsvPreview();
    }
  }
  
  /**
   * Generates QR codes in bulk from the CSV data
   */
  async function generateBulkQRCodes() {
    if (csvData.length === 0) {
      showAlert('No CSV data loaded. Please upload a valid CSV file.', 'error');
      return;
    }
    
    // Get customization settings
    const settings = {
      fgColor: bulkFgColor.value,
      bgColor: bulkBgColor.value,
      errorCorrectionLevel: bulkErrorCorrectionLevel.value,
      size: parseInt(bulkQrSize.value),
      format: bulkFormat.value,
      includeLabels: includeLabels.checked
    };
    
    // Show progress
    bulkProgress.style.display = 'block';
    generateBulkBtn.disabled = true;
    downloadBulkZip.style.display = 'none';
    
    // Initialize JSZip
    const zip = new JSZip();
    
    try {
      // Process each entry in the CSV
      for (let i = 0; i < csvData.length; i++) {
        const entry = csvData[i];
        
        // Update progress
        const progress = Math.round((i / csvData.length) * 100);
        bulkProgressBar.style.width = `${progress}%`;
        bulkProgressText.textContent = `Processing ${i + 1}/${csvData.length} QR codes...`;
        
        // Wait a moment to allow the UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Generate QR code
        try {
          const qrCodeData = await generateQRCodeForEntry(entry, settings);
          
          // Add to ZIP
          const fileName = getFileName(entry, settings);
          zip.file(fileName, qrCodeData.split(',')[1], { base64: true });
        } catch (error) {
          console.error(`Error generating QR code for ${entry.label}:`, error);
          showAlert(`Failed to generate QR code for "${entry.label}". Skipping.`, 'warning');
        }
      }
      
      // Generate ZIP file
      bulkProgressText.textContent = 'Creating ZIP file...';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      generatedZipFile = zipBlob;
      
      // Show download button
      bulkProgressBar.style.width = '100%';
      bulkProgressText.textContent = `Successfully generated ${csvData.length} QR codes!`;
      downloadBulkZip.style.display = 'block';
      
      showAlert('Bulk QR codes generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      showAlert('Error generating bulk QR codes. Please try again.', 'error');
    } finally {
      generateBulkBtn.disabled = false;
    }
  }
  
  /**
   * Generates a QR code for a single CSV entry
   * @param {Object} entry - The CSV entry
   * @param {Object} settings - The QR code settings
   * @returns {Promise<string>} The QR code data URL
   */
  function generateQRCodeForEntry(entry, settings) {
    return new Promise((resolve, reject) => {
      // Get content and type
      const content = entry.content;
      if (!content) {
        reject(new Error('Empty content'));
        return;
      }
      
      // Format content based on type
      let formattedContent = content;
      const type = (entry.type || 'text').toLowerCase();
      
      if (type === 'url' && !content.match(/^(http|https):\/\//)) {
        formattedContent = `https://${content}`;
      } else if (type === 'email' && !content.match(/^mailto:/)) {
        formattedContent = `mailto:${content}`;
      } else if (type === 'phone' && !content.match(/^tel:/)) {
        formattedContent = `tel:${content}`;
      } else if (type === 'sms' && !content.match(/^smsto:/)) {
        formattedContent = `smsto:${content}`;
      } else if (type === 'wifi') {
        // Parse wifi data from format: SSID|Password|WPA
        const parts = content.split('|');
        const ssid = parts[0] || '';
        const password = parts[1] || '';
        const encType = parts[2] || 'WPA';
        formattedContent = `WIFI:S:${ssid};T:${encType};P:${password};;`;
      } else if (type === 'vcard') {
        // Parse vcard data from format: Name|Email|Phone
        const parts = content.split('|');
        const name = parts[0] || '';
        const email = parts[1] || '';
        const phone = parts[2] || '';
        
        formattedContent = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (name) formattedContent += `FN:${name}\n`;
        if (email) formattedContent += `EMAIL:${email}\n`;
        if (phone) formattedContent += `TEL:${phone}\n`;
        formattedContent += 'END:VCARD';
      }
      
      // Create canvas for QR code
      const canvas = document.createElement('canvas');
      
      // Generate QR code
      QRCode.toCanvas(canvas, formattedContent, {
        width: settings.size,
        height: settings.size,
        color: {
          dark: settings.fgColor,
          light: settings.bgColor
        },
        errorCorrectionLevel: settings.errorCorrectionLevel
      }, function(error) {
        if (error) {
          reject(error);
          return;
        }
        
        // Convert to desired format
        try {
          let dataUrl;
          
          switch (settings.format) {
            case 'jpg':
              dataUrl = canvas.toDataURL('image/jpeg', 0.9);
              break;
            case 'svg':
              dataUrl = canvasToSvgDataUrl(canvas, settings);
              break;
            case 'pdf':
              dataUrl = canvasToPdfDataUrl(canvas, entry.label, settings);
              break;
            case 'png':
            default:
              dataUrl = canvas.toDataURL('image/png');
          }
          
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  /**
   * Generates a file name for the QR code
   * @param {Object} entry - The CSV entry
   * @param {Object} settings - The QR code settings
   * @returns {string} The file name
   */
  function getFileName(entry, settings) {
    const label = settings.includeLabels && entry.label 
      ? sanitizeFileName(entry.label) 
      : `qrcode_${Date.now()}`;
    
    let extension;
    switch (settings.format) {
      case 'jpg': extension = 'jpg'; break;
      case 'svg': extension = 'svg'; break;
      case 'pdf': extension = 'pdf'; break;
      case 'png':
      default: extension = 'png';
    }
    
    return `${label}.${extension}`;
  }
  
  /**
   * Sanitizes a string for use as a file name
   * @param {string} name - The input string
   * @returns {string} Sanitized file name
   */
  function sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9_\-]/g, '_')  // Replace invalid chars with underscore
      .replace(/_+/g, '_')               // Replace multiple underscores with single
      .substring(0, 100);                // Limit length
  }
  
  /**
   * Converts a canvas to an SVG data URL
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {Object} settings - The QR code settings
   * @returns {string} SVG data URL
   */
  function canvasToSvgDataUrl(canvas, settings) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Add background
    svg += `<rect width="${width}" height="${height}" fill="${settings.bgColor}"/>`;
    
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
        if (color !== settings.bgColor) {
          svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${settings.fgColor}"/>`;
        }
      }
    }
    
    svg += '</svg>';
    
    // Convert to data URL
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }
  
  /**
   * Converts a canvas to a PDF data URL
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {string} label - The QR code label
   * @param {Object} settings - The QR code settings
   * @returns {string} PDF data URL
   */
  function canvasToPdfDataUrl(canvas, label, settings) {
    // Create a new PDF document
    const doc = new window.jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate position for QR code
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrSize = Math.min(pageWidth - 40, 150);
    const xPos = (pageWidth - qrSize) / 2;
    const yPos = 20;
    
    // Add QR code image
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', xPos, yPos, qrSize, qrSize);
    
    // Add label if available
    if (label) {
      doc.setFontSize(16);
      doc.text(label, pageWidth / 2, yPos + qrSize + 15, { align: 'center' });
    }
    
    // Return as data URL
    return doc.output('datauristring');
  }
  
  /**
   * Downloads the generated ZIP file
   */
  function downloadZipFile() {
    if (!generatedZipFile) {
      showAlert('No ZIP file available. Please generate QR codes first.', 'error');
      return;
    }
    
    // Create download link
    const url = URL.createObjectURL(generatedZipFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcodes_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  
  /**
   * Downloads a sample CSV file
   * @param {Event} e - The click event
   */
  function downloadSampleCsvFile(e) {
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
  }
  
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
  
  // Return public API
  return {
    init,
    generateBulkQRCodes,
    downloadSampleCsvFile
  };
})();