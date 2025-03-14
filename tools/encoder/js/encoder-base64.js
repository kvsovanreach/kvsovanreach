/**
 * Base64 Encoder/Decoder Module
 * Handles Base64 encoding and decoding operations
 */

const Base64Tool = (function() {
  // DOM elements
  let encodeInput, encodeOutput, encodeButton, clearInputBtn, clearOutputBtn, copyOutputBtn, downloadOutputBtn;
  
  /**
   * Initializes the Base64 module
   */
  function init() {
    // Cache DOM elements
    encodeInput = document.getElementById('encodeInput');
    encodeOutput = document.getElementById('encodeOutput');
    encodeButton = document.getElementById('encodeButton');
    clearInputBtn = document.getElementById('clearInputBtn');
    clearOutputBtn = document.getElementById('clearOutputBtn');
    copyOutputBtn = document.getElementById('copyOutputBtn');
    downloadOutputBtn = document.getElementById('downloadOutputBtn');
    
    // Set up event listeners
    if (encodeButton) {
      encodeButton.addEventListener('click', handleEncodeDecode);
    }
    
    if (clearInputBtn) {
      clearInputBtn.addEventListener('click', function() {
        encodeInput.value = '';
      });
    }
    
    if (clearOutputBtn) {
      clearOutputBtn.addEventListener('click', function() {
        encodeOutput.value = '';
      });
    }
    
    if (copyOutputBtn) {
      copyOutputBtn.addEventListener('click', function() {
        if (!encodeOutput.value.trim()) {
          EncoderUI.showAlert('Nothing to copy', 'warning');
          return;
        }
        
        EncoderUI.copyToClipboard(encodeOutput.value);
      });
    }
    
    if (downloadOutputBtn) {
      downloadOutputBtn.addEventListener('click', function() {
        if (!encodeOutput.value.trim()) {
          EncoderUI.showAlert('Nothing to download', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        const filename = mode === 'encode' ? 'base64_encoded.txt' : 'base64_decoded.txt';
        
        EncoderUI.downloadTextAsFile(encodeOutput.value, filename);
      });
    }
    
    // Set up file drop zone if available
    setupFileDropZone();
  }
  
  /**
   * Handles the encode/decode action
   */
  function handleEncodeDecode() {
    if (!encodeInput.value.trim()) {
      EncoderUI.showAlert('Please enter some text to encode/decode', 'warning');
      return;
    }
    
    const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
    let result;
    
    try {
      if (mode === 'encode') {
        result = encodeBase64(encodeInput.value);
      } else {
        result = decodeBase64(encodeInput.value);
      }
      encodeOutput.value = result;
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}. Please check your input.`, 'error');
    }
  }
  
  /**
   * Encodes a string to Base64
   * @param {string} input - The text to encode
   * @returns {string} - The Base64 encoded string
   */
  function encodeBase64(input) {
    if (!input) {
      return '';
    }
    
    try {
      // First try the js-base64 library if available
      if (typeof Base64 !== 'undefined' && typeof Base64.encode === 'function') {
        return Base64.encode(input);
      } 
      // Fallback to modern approach instead of deprecated unescape/escape
      else {
        // Convert the string to UTF-8 bytes
        const utf8Bytes = new TextEncoder().encode(input);
        // Convert bytes to binary string
        let binaryString = '';
        utf8Bytes.forEach(byte => {
          binaryString += String.fromCharCode(byte);
        });
        // Use btoa on the binary string
        return btoa(binaryString);
      }
    } catch (e) {
      console.error('Base64 encoding error:', e);
      throw new Error('Failed to encode text to Base64: ' + e.message);
    }
  }
  
  /**
   * Decodes a Base64 string to text
   * @param {string} input - The Base64 encoded string
   * @returns {string} - The decoded text
   */
  function decodeBase64(input) {
    if (!input) {
      return '';
    }
    
    // Validate Base64 format
    if (!/^[A-Za-z0-9+/=]+$/.test(input.replace(/\s/g, ''))) {
      throw new Error('Invalid Base64 format. Input contains characters that are not allowed in Base64 encoding.');
    }
    
    try {
      // First try the js-base64 library if available
      if (typeof Base64 !== 'undefined' && typeof Base64.decode === 'function') {
        return Base64.decode(input);
      } 
      // Fallback to modern approach instead of deprecated unescape/escape
      else {
        // Use atob to get binary string
        const binaryString = atob(input.trim());
        // Convert binary string to UTF-8 bytes
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Convert UTF-8 bytes to string
        return new TextDecoder().decode(bytes);
      }
    } catch (e) {
      console.error('Base64 decoding error:', e);
      throw new Error('Invalid Base64 format or the string contains non-UTF-8 characters: ' + e.message);
    }
  }
  
  /**
   * Sets up file drag and drop functionality
   */
  function setupFileDropZone() {
    if (!encodeInput) return;
    
    // Add visual styling for drag and drop area
    const container = encodeInput.closest('.enc-field-group');
    if (container) {
      container.style.position = 'relative';
      
      // Create overlay for drag visual feedback
      const overlay = document.createElement('div');
      overlay.className = 'enc-dragover-overlay';
      overlay.innerHTML = '<div class="enc-dragover-content"><i class="fas fa-file-import"></i><span>Drop to load file</span></div>';
      overlay.style.display = 'none';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(78, 84, 200, 0.1)';
      overlay.style.borderRadius = '8px';
      overlay.style.border = '2px dashed #4E54c8';
      overlay.style.zIndex = '10';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease';
      
      // Style the content
      const content = overlay.querySelector('.enc-dragover-content');
      if (content) {
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        content.style.color = '#4E54c8';
        
        const icon = content.querySelector('i');
        if (icon) {
          icon.style.fontSize = '2rem';
          icon.style.marginBottom = '0.5rem';
        }
      }
      
      container.appendChild(overlay);
    }
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      encodeInput.addEventListener(eventName, preventDefaults, false);
    });
    
    // Add visual feedback
    encodeInput.addEventListener('dragenter', showDragFeedback, false);
    encodeInput.addEventListener('dragover', showDragFeedback, false);
    encodeInput.addEventListener('dragleave', hideDragFeedback, false);
    encodeInput.addEventListener('drop', hideDragFeedback, false);
    
    // Handle drop event
    encodeInput.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    function showDragFeedback(e) {
      preventDefaults(e);
      const overlay = document.querySelector('.enc-dragover-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.display = 'flex';
      }
    }
    
    function hideDragFeedback(e) {
      preventDefaults(e);
      const overlay = document.querySelector('.enc-dragover-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.style.opacity === '0') {
            overlay.style.display = 'none';
          }
        }, 300);
      }
    }
    
    function handleDrop(e) {
      preventDefaults(e);
      hideDragFeedback(e);
      
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        
        // Show loading state
        encodeInput.style.opacity = '0.7';
        encodeInput.placeholder = 'Loading file...';
        
        // Determine which mode to use based on file type
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        
        if (mode === 'encode') {
          // For encoding, read as text
          reader.readAsText(file);
          reader.onload = function(event) {
            encodeInput.value = event.target.result;
            // Reset visual state
            encodeInput.style.opacity = '1';
            encodeInput.placeholder = 'Enter text to encode...';
            EncoderUI.showAlert(`File "${file.name}" loaded successfully`, 'success');
          };
        } else {
          // For decoding, check if it's a text file
          if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.b64')) {
            reader.readAsText(file);
            reader.onload = function(event) {
              encodeInput.value = event.target.result;
              // Reset visual state
              encodeInput.style.opacity = '1';
              encodeInput.placeholder = 'Enter Base64 to decode...';
              EncoderUI.showAlert(`File "${file.name}" loaded successfully`, 'success');
            };
          } else {
            // Reset visual state
            encodeInput.style.opacity = '1';
            encodeInput.placeholder = 'Enter Base64 to decode...';
            EncoderUI.showAlert('Please upload a text file containing Base64 for decoding', 'warning');
          }
        }
        
        reader.onerror = function() {
          // Reset visual state
          encodeInput.style.opacity = '1';
          encodeInput.placeholder = mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...';
          EncoderUI.showAlert('Error reading file', 'error');
        };
      }
    }
  }
  
  return {
    init,
    encodeBase64,
    decodeBase64
  };
})();

// Global export
window.Base64Tool = Base64Tool;