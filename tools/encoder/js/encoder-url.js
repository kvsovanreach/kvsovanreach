/**
 * URL Encoder/Decoder Module
 * Handles URL encoding, decoding, and query parameter parsing
 */

const URLTool = (function() {
  // DOM elements for encode/decode mode
  let urlInput, urlOutput, urlEncodeButton, urlClearInputBtn, urlClearOutputBtn, urlCopyOutputBtn;
  
  // DOM elements for parse mode
  let urlQueryInput, urlParseButton, urlClearParseBtn;
  let urlProtocol, urlHost, urlPath, urlHash, urlParamTable;
  
  /**
   * Initializes the URL module
   */
  function init() {
    // Cache DOM elements for encode/decode mode
    urlInput = document.getElementById('urlInput');
    urlOutput = document.getElementById('urlOutput');
    urlEncodeButton = document.getElementById('urlEncodeButton');
    urlClearInputBtn = document.getElementById('urlClearInputBtn');
    urlClearOutputBtn = document.getElementById('urlClearOutputBtn');
    urlCopyOutputBtn = document.getElementById('urlCopyOutputBtn');
    
    // Cache DOM elements for parse mode
    urlQueryInput = document.getElementById('urlQueryInput');
    urlParseButton = document.getElementById('urlParseButton');
    urlClearParseBtn = document.getElementById('urlClearParseBtn');
    urlProtocol = document.getElementById('urlProtocol');
    urlHost = document.getElementById('urlHost');
    urlPath = document.getElementById('urlPath');
    urlHash = document.getElementById('urlHash');
    urlParamTable = document.getElementById('urlParamTable');
    
    // Set up event listeners for encode/decode mode
    if (urlEncodeButton) {
      urlEncodeButton.addEventListener('click', handleEncodeDecodeURL);
    }
    
    if (urlClearInputBtn) {
      urlClearInputBtn.addEventListener('click', function() {
        urlInput.value = '';
      });
    }
    
    if (urlClearOutputBtn) {
      urlClearOutputBtn.addEventListener('click', function() {
        urlOutput.value = '';
      });
    }
    
    if (urlCopyOutputBtn) {
      urlCopyOutputBtn.addEventListener('click', function() {
        if (!urlOutput.value.trim()) {
          EncoderUI.showAlert('Nothing to copy', 'warning');
          return;
        }
        
        EncoderUI.copyToClipboard(urlOutput.value);
      });
    }
    
    // Set up event listeners for parse mode
    if (urlParseButton) {
      urlParseButton.addEventListener('click', handleParseURL);
    }
    
    if (urlClearParseBtn) {
      urlClearParseBtn.addEventListener('click', function() {
        urlQueryInput.value = '';
        
        if (urlProtocol) urlProtocol.textContent = '';
        if (urlHost) urlHost.textContent = '';
        if (urlPath) urlPath.textContent = '';
        if (urlHash) urlHash.textContent = '';
        
        if (urlParamTable) {
          const tbody = urlParamTable.querySelector('tbody');
          if (tbody) tbody.innerHTML = '';
        }
      });
    }
  }
  
  /**
   * Handles URL encoding/decoding
   */
  function handleEncodeDecodeURL() {
    if (!urlInput.value.trim()) {
      EncoderUI.showAlert('Please enter some text to process', 'warning');
      return;
    }
    
    try {
      const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
      let result;
      
      if (mode === 'encode') {
        result = encodeURL(urlInput.value);
      } else {
        result = decodeURL(urlInput.value);
      }
      
      urlOutput.value = result;
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Handles URL parsing
   */
  function handleParseURL() {
    if (!urlQueryInput.value.trim()) {
      EncoderUI.showAlert('Please enter a URL or query string to parse', 'warning');
      return;
    }
    
    try {
      parseURL(urlQueryInput.value);
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Encodes a URL string
   * @param {string} input - The text to encode
   * @returns {string} - The URL encoded string
   */
  function encodeURL(input) {
    try {
      return encodeURIComponent(input);
    } catch (e) {
      throw new Error(`Failed to encode URL: ${e.message}`);
    }
  }
  
  /**
   * Decodes a URL string
   * @param {string} input - The URL encoded string
   * @returns {string} - The decoded text
   */
  function decodeURL(input) {
    try {
      return decodeURIComponent(input);
    } catch (e) {
      throw new Error(`Failed to decode URL: ${e.message}`);
    }
  }
  
  /**
   * Parses a URL and displays its components
   * @param {string} urlString - The URL to parse
   */
  function parseURL(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      throw new Error('Please enter a valid URL or query string');
    }
    
    let fullUrl = urlString.trim();
    let isQueryStringOnly = false;
    
    // Handle cases where input is just query parameters
    if (!fullUrl.includes('://')) {
      if (fullUrl.startsWith('?')) {
        // It's just a query string
        isQueryStringOnly = true;
        fullUrl = 'https://example.com' + fullUrl;
      } else if (fullUrl.includes('=')) {
        // Likely a query string without the ? prefix
        isQueryStringOnly = true;
        fullUrl = 'https://example.com?' + fullUrl;
      } else {
        // Probably a hostname without protocol
        fullUrl = 'https://' + fullUrl;
      }
    }
    
    try {
      // Create a URL object for parsing
      const url = new URL(fullUrl);
      
      // Display URL components
      if (urlProtocol) {
        if (isQueryStringOnly) {
          urlProtocol.textContent = '(query string only)';
          urlProtocol.style.fontStyle = 'italic';
          urlProtocol.style.opacity = '0.7';
        } else {
          urlProtocol.textContent = url.protocol;
          urlProtocol.style.fontStyle = 'normal';
          urlProtocol.style.opacity = '1';
        }
      }
      
      if (urlHost) {
        if (isQueryStringOnly) {
          urlHost.textContent = '(query string only)';
          urlHost.style.fontStyle = 'italic';
          urlHost.style.opacity = '0.7';
        } else if (url.hostname === 'example.com' && fullUrl.startsWith('https://example.com')) {
          urlHost.textContent = '(not provided)';
          urlHost.style.fontStyle = 'italic';
          urlHost.style.opacity = '0.7';
        } else {
          urlHost.textContent = url.host;
          urlHost.style.fontStyle = 'normal';
          urlHost.style.opacity = '1';
        }
      }
      
      if (urlPath) {
        if (isQueryStringOnly || (url.pathname === '/' && fullUrl.includes('?'))) {
          urlPath.textContent = '(not provided)';
          urlPath.style.fontStyle = 'italic';
          urlPath.style.opacity = '0.7';
        } else {
          urlPath.textContent = url.pathname;
          urlPath.style.fontStyle = 'normal';
          urlPath.style.opacity = '1';
        }
      }
      
      if (urlHash) {
        if (!url.hash) {
          urlHash.textContent = '(not provided)';
          urlHash.style.fontStyle = 'italic';
          urlHash.style.opacity = '0.7';
        } else {
          urlHash.textContent = url.hash;
          urlHash.style.fontStyle = 'normal';
          urlHash.style.opacity = '1';
        }
      }
      
      // Parse query parameters
      if (urlParamTable) {
        const params = url.searchParams;
        const tableBody = urlParamTable.querySelector('tbody');
        if (tableBody) {
          tableBody.innerHTML = '';
          
          // Get all parameter entries, accounting for duplicates
          const paramEntries = [];
          const paramMap = new Map();
          
          // First collect all parameters and handle duplicates
          for (const [key, value] of params.entries()) {
            if (paramMap.has(key)) {
              // For duplicate keys, create an array or add to existing array
              const existingValue = paramMap.get(key);
              if (Array.isArray(existingValue)) {
                existingValue.push(value);
              } else {
                paramMap.set(key, [existingValue, value]);
              }
            } else {
              paramMap.set(key, value);
            }
          }
          
          // Convert to array entries for display
          for (const [key, value] of paramMap.entries()) {
            if (Array.isArray(value)) {
              // Handle array parameter (multiple values)
              value.forEach((v, index) => {
                paramEntries.push([`${key}[${index}]`, v]);
              });
            } else {
              paramEntries.push([key, value]);
            }
          }
          
          if (paramEntries.length > 0) {
            paramEntries.forEach(([key, value]) => {
              const row = document.createElement('tr');
              
              const keyCell = document.createElement('td');
              keyCell.textContent = key;
              row.appendChild(keyCell);
              
              const valueCell = document.createElement('td');
              valueCell.textContent = value;
              row.appendChild(valueCell);
              
              const decodedCell = document.createElement('td');
              try {
                const decodedValue = decodeURIComponent(value);
                decodedCell.textContent = decodedValue === value ? '(same as encoded)' : decodedValue;
                if (decodedValue === value) {
                  decodedCell.style.fontStyle = 'italic';
                  decodedCell.style.opacity = '0.7';
                }
              } catch (e) {
                decodedCell.textContent = '(invalid encoding)';
                decodedCell.style.color = '#dc3545';
              }
              row.appendChild(decodedCell);
              
              tableBody.appendChild(row);
            });
          } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', '3');
            cell.textContent = 'No query parameters found';
            cell.style.textAlign = 'center';
            cell.style.fontStyle = 'italic';
            cell.style.opacity = '0.7';
            row.appendChild(cell);
            tableBody.appendChild(row);
          }
        }
      }
    } catch (error) {
      throw new Error(`Invalid URL format: ${error.message}`);
    }
  }
  
  return {
    init,
    encodeURL,
    decodeURL,
    parseURL
  };
})();

// Global export
window.URLTool = URLTool;