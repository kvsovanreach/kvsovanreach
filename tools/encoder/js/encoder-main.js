/**
 * Encoder & Decoder Main Interface Module
 * Manages the main UI and feature switching
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize base64 functionality immediately
  initBase64Feature();
  
  // Cache DOM elements for tabs
  const base64Tab = document.getElementById('base64Tab');
  const jwtTab = document.getElementById('jwtTab');
  const urlTab = document.getElementById('urlTab');
  const hashTab = document.getElementById('hashTab');
  const moreTab = document.getElementById('moreTab');
  const encToolContent = document.getElementById('encToolContent');
  
  // Cache description elements
  const base64Description = document.getElementById('base64Description');
  const jwtDescription = document.getElementById('jwtDescription');
  const urlDescription = document.getElementById('urlDescription');
  const hashDescription = document.getElementById('hashDescription');
  const moreDescription = document.getElementById('moreDescription');
  
  // Get templates
  const jwtTemplate = document.getElementById('jwtTemplate');
  const urlTemplate = document.getElementById('urlTemplate');
  const hashTemplate = document.getElementById('hashTemplate');
  const moreTemplate = document.getElementById('moreTemplate');
  
  // Additional tools templates
  const hexToolTemplate = document.getElementById('hexToolTemplate');
  const asciiToolTemplate = document.getElementById('asciiToolTemplate');
  const binaryToolTemplate = document.getElementById('binaryToolTemplate');
  const htmlToolTemplate = document.getElementById('htmlToolTemplate');
  
  // Set up event listeners for tabs
  base64Tab.addEventListener('click', () => showFeature('base64'));
  jwtTab.addEventListener('click', () => showFeature('jwt'));
  urlTab.addEventListener('click', () => showFeature('url'));
  hashTab.addEventListener('click', () => showFeature('hash'));
  moreTab.addEventListener('click', () => showFeature('more'));
  
  /**
   * Shows a specific feature and hides others
   * @param {string} feature - The feature to show ('base64', 'jwt', 'url', 'hash', 'more')
   */
  function showFeature(feature) {
    console.log(`Showing feature: ${feature}`);
    
    // Highlight the selected tab and update description
    highlightTab(feature);
    
    // Clear the tool content area with fade-out animation
    encToolContent.classList.add('fade-out');
    
    // Wait for animation to complete
    setTimeout(() => {
      // Clear content
      encToolContent.innerHTML = '';
      
      // Determine which template to use
      let template;
      
      switch (feature) {
        case 'base64':
          // Base64 content is already in the HTML, but we need to check if it exists
          const base64Container = document.querySelector('.enc-encode-container');
          if (base64Container) {
            template = base64Container.cloneNode(true);
          } else {
            // Create a basic container if it doesn't exist
            template = document.createElement('div');
            template.className = 'enc-encode-container';
            template.innerHTML = `
              <div class="enc-encode-header">
                <h2>Base64 Encoder/Decoder</h2>
                <p>Convert text to Base64 and vice versa</p>
              </div>
              
              <div class="enc-encode-content">
                <div class="enc-mode-selector">
                  <button class="enc-mode-btn active" data-mode="encode">Encode</button>
                  <button class="enc-mode-btn" data-mode="decode">Decode</button>
                </div>
                
                <div class="enc-input-panel">
                  <div class="enc-field-group">
                    <label for="encodeInput">Input</label>
                    <textarea id="encodeInput" placeholder="Enter text to encode..." rows="8"></textarea>
                  </div>
                  
                  <div class="enc-options-panel">
                    <button id="encodeButton" class="enc-primary-btn">Encode to Base64</button>
                    <button id="clearInputBtn" class="enc-secondary-btn">Clear</button>
                  </div>
                </div>
                
                <div class="enc-divider">
                  <span class="enc-divider-icon"><i class="fas fa-arrows-alt-v"></i></span>
                </div>
                
                <div class="enc-result-panel">
                  <div class="enc-field-group">
                    <label for="encodeOutput">Output</label>
                    <textarea id="encodeOutput" placeholder="Result will appear here..." rows="8" readonly></textarea>
                  </div>
                  
                  <div class="enc-options-panel">
                    <button id="copyOutputBtn" class="enc-secondary-btn">
                      <i class="fas fa-copy"></i> Copy
                    </button>
                    <button id="downloadOutputBtn" class="enc-secondary-btn">
                      <i class="fas fa-download"></i> Download
                    </button>
                    <button id="clearOutputBtn" class="enc-secondary-btn">Clear</button>
                  </div>
                </div>
              </div>
            `;
          }
          break;
        case 'jwt':
          if (jwtTemplate) {
            template = jwtTemplate.content.cloneNode(true);
          } else {
            showAlert('JWT template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'url':
          if (urlTemplate) {
            template = urlTemplate.content.cloneNode(true);
          } else {
            showAlert('URL template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'hash':
          if (hashTemplate) {
            template = hashTemplate.content.cloneNode(true);
          } else {
            showAlert('Hash template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'more':
          if (moreTemplate) {
            template = moreTemplate.content.cloneNode(true);
          } else {
            showAlert('More tools template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'hex':
          if (hexToolTemplate) {
            template = hexToolTemplate.content.cloneNode(true);
          } else {
            showAlert('Hex tool template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'ascii':
          if (asciiToolTemplate) {
            template = asciiToolTemplate.content.cloneNode(true);
          } else {
            showAlert('ASCII tool template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'binary':
          if (binaryToolTemplate) {
            template = binaryToolTemplate.content.cloneNode(true);
          } else {
            showAlert('Binary tool template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        case 'html':
          if (htmlToolTemplate) {
            template = htmlToolTemplate.content.cloneNode(true);
          } else {
            showAlert('HTML tool template not found. Please reload the page.', 'error');
            template = document.createElement('div');
          }
          break;
        default:
          return;
      }
      
      // Add the template to the content area
      encToolContent.appendChild(template);
      
      // Set up back links for additional tools
      const backLinks = {
        'hex': 'backFromHex',
        'ascii': 'backFromAscii',
        'binary': 'backFromBinary',
        'html': 'backFromHtml'
      };
      
      // Handle back links for additional tools
      if (backLinks[feature]) {
        const backLink = document.getElementById(backLinks[feature]);
        if (backLink) {
          backLink.addEventListener('click', function(e) {
            e.preventDefault();
            showFeature('more');
          });
        }
      }
      
      // Set up 'more' tools card click events
      if (feature === 'more') {
        const moreCards = document.querySelectorAll('.enc-more-card');
        moreCards.forEach(card => {
          card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            showFeature(tool);
          });
        });
      }
      
      // Remove fade-out class and add active class with fade-in effect
      encToolContent.classList.remove('fade-out');
      encToolContent.classList.add('active', 'fade-in');
      
      // Initialize specific feature functionality
      initFeature(feature);
      
      // Scroll to content
      encToolContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update URL hash for direct linking
      window.location.hash = feature;
      
      // Remove fade-in class after animation completes
      setTimeout(() => {
        encToolContent.classList.remove('fade-in');
      }, 500);
      
    }, 300); // Match the CSS transition duration
  }
  
  /**
   * Highlights the selected tab and updates the description
   * @param {string} feature - The feature to highlight
   */
  function highlightTab(feature) {
    // Remove active class from all tabs
    document.querySelectorAll('.enc-tab-item').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Remove active class from all descriptions
    document.querySelectorAll('.enc-tab-description').forEach(desc => {
      desc.classList.remove('active');
    });
    
    // Add active class to selected tab - handle special cases for additional tools
    let tabId;
    let descId;
    
    // For additional tools from "more" section, highlight the more tab
    if (['hex', 'ascii', 'binary', 'html', 'base32', 'base58', 'rot13', 'xor'].includes(feature)) {
      tabId = 'moreTab';
      descId = 'moreDescription';
    } else {
      tabId = `${feature}Tab`;
      descId = `${feature}Description`;
    }
    
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
      
      // Ensure the tab is visible by scrolling if necessary
      if (window.innerWidth < 576) { // Mobile view
        const tabContainer = document.querySelector('.enc-tab-container');
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
    const selectedDesc = document.getElementById(descId);
    if (selectedDesc) {
      selectedDesc.classList.add('active');
    }
  }
  
  /**
   * Initializes feature-specific functionality
   * @param {string} feature - The feature to initialize
   */
  function initFeature(feature) {
    console.log(`Initializing feature: ${feature}`);
    
    // Set up mode switching in all features
    setupModeSwitching();
    
    switch (feature) {
      case 'base64':
        initBase64Feature();
        break;
      case 'jwt':
        initJwtFeature();
        break;
      case 'url':
        initUrlFeature();
        break;
      case 'hash':
        initHashFeature();
        break;
      case 'more':
        // No specific initialization needed
        break;
      case 'hex':
        initHexFeature();
        break;
      case 'ascii':
        initAsciiFeature();
        break;
      case 'binary':
        initBinaryFeature();
        break;
      case 'html':
        initHtmlFeature();
        break;
    }
  }
  
  /**
   * Sets up mode switching buttons in the current feature
   */
  function setupModeSwitching() {
    const modeButtons = document.querySelectorAll('.enc-mode-btn');
    
    modeButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Get parent container to scope the selection
        const container = this.closest('.enc-encode-container');
        if (!container) return;
        
        // Find all mode buttons in this container
        const containerButtons = container.querySelectorAll('.enc-mode-btn');
        
        // Remove active class from all buttons in this container
        containerButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get the mode
        const mode = this.getAttribute('data-mode');
        
        // Handle mode switching for different tools
        // Each tool has its own mode switching logic
        
        // JWT Mode
        const jwtModes = container.querySelectorAll('.enc-jwt-mode');
        if (jwtModes.length > 0) {
          jwtModes.forEach(jwtMode => jwtMode.classList.remove('active'));
          const activeMode = container.querySelector(`#jwt-${mode}-mode`);
          if (activeMode) activeMode.classList.add('active');
          
          // Update button text based on mode
          const jwtButton = container.querySelector('.enc-primary-btn');
          if (jwtButton) {
            switch(mode) {
              case 'decode':
                jwtButton.textContent = 'Decode JWT';
                break;
              case 'encode':
                jwtButton.textContent = 'Generate JWT';
                break;
              case 'verify':
                jwtButton.textContent = 'Verify JWT';
                break;
            }
          }
        }
        
        // URL Mode
        const urlModes = container.querySelectorAll('.enc-url-mode');
        if (urlModes.length > 0) {
          urlModes.forEach(urlMode => urlMode.classList.remove('active'));
          const activeMode = container.querySelector(`#url-${mode === 'parse' ? 'parse-mode' : 'encode-decode-mode'}`);
          if (activeMode) activeMode.classList.add('active');
          
          // Update button text based on mode
          const urlButton = container.querySelector('.enc-primary-btn');
          if (urlButton && mode !== 'parse') {
            urlButton.textContent = mode === 'encode' ? 'Encode URL' : 'Decode URL';
          }
        }
        
        // For simple tools (Base64, Hex, ASCII, Binary, HTML)
        updateSimpleToolButton(container, mode);
      });
    });
  }
  
  /**
   * Updates the primary button text for simple encode/decode tools
   */
  function updateSimpleToolButton(container, mode) {
    const primaryBtn = container.querySelector('.enc-primary-btn');
    if (!primaryBtn) return;
    
    // Check which tool we're dealing with based on button ID
    const btnId = primaryBtn.id;
    
    if (btnId === 'encodeButton') {
      primaryBtn.textContent = mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64';
    } else if (btnId === 'hexEncodeButton') {
      primaryBtn.textContent = mode === 'encode' ? 'Convert to Hex' : 'Convert to Text';
    } else if (btnId === 'asciiEncodeButton') {
      primaryBtn.textContent = mode === 'encode' ? 'Convert to ASCII' : 'Convert to Text';
    } else if (btnId === 'binaryEncodeButton') {
      primaryBtn.textContent = mode === 'encode' ? 'Convert to Binary' : 'Convert to Text';
    } else if (btnId === 'htmlEncodeButton') {
      primaryBtn.textContent = mode === 'encode' ? 'Encode HTML Entities' : 'Decode HTML Entities';
    }
    
    // Update help text for ASCII and Binary tools
    if (btnId === 'asciiEncodeButton') {
      const helpText = container.querySelector('#asciiInputHelp');
      if (helpText) {
        helpText.textContent = mode === 'encode' 
          ? 'Enter text to convert to ASCII codes'
          : 'Enter space or comma-separated decimal values (e.g., "72 101 108 108 111" or "72,101,108,108,111")';
      }
    } else if (btnId === 'binaryEncodeButton') {
      const helpText = container.querySelector('#binaryInputHelp');
      if (helpText) {
        helpText.textContent = mode === 'encode'
          ? 'Enter text to convert to binary representation'
          : 'Enter space-separated binary values (e.g., "01001000 01100101 01101100 01101100 01101111")';
      }
    }
    
    // Update placeholder text based on mode
    const input = container.querySelector('textarea:first-of-type');
    if (input) {
      switch (btnId) {
        case 'encodeButton':
          input.placeholder = mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...';
          break;
        case 'hexEncodeButton':
          input.placeholder = mode === 'encode' ? 'Enter text to convert to hex...' : 'Enter hex to convert to text...';
          break;
        case 'asciiEncodeButton':
          input.placeholder = mode === 'encode' ? 'Enter text to convert to ASCII codes...' : 'Enter ASCII values (e.g., 72 101 108 108 111)...';
          break;
        case 'binaryEncodeButton':
          input.placeholder = mode === 'encode' ? 'Enter text to convert to binary...' : 'Enter binary values (e.g., 01001000 01100101...)';
          break;
        case 'htmlEncodeButton':
          input.placeholder = mode === 'encode' ? 'Enter text with special characters to encode...' : 'Enter HTML entities to decode...';
          break;
      }
    }
  }
  
  /**
   * Initializes the Base64 encoder/decoder feature
   */
  function initBase64Feature() {
    const encodeInput = document.getElementById('encodeInput');
    const encodeOutput = document.getElementById('encodeOutput');
    const encodeButton = document.getElementById('encodeButton');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const copyOutputBtn = document.getElementById('copyOutputBtn');
    const downloadOutputBtn = document.getElementById('downloadOutputBtn');
    
    // Set up mode switching for Base64
    const modeBtns = document.querySelectorAll('.enc-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        modeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update button text based on mode
        if (encodeButton) {
          const mode = this.getAttribute('data-mode');
          encodeButton.textContent = mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64';
          
          // Update placeholder
          if (encodeInput) {
            encodeInput.placeholder = mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...';
          }
        }
      });
    });
    
    if (encodeButton) {
      encodeButton.addEventListener('click', function() {
        if (!encodeInput.value.trim()) {
          showAlert('Please enter some text to encode/decode', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        let result;
        
        try {
          if (mode === 'encode') {
            result = btoa(unescape(encodeURIComponent(encodeInput.value)));
          } else {
            result = decodeURIComponent(escape(atob(encodeInput.value)));
          }
          encodeOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}. Please check your input.`, 'error');
        }
      });
    }
    
    // Clear buttons
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
    
    // Copy button
    if (copyOutputBtn) {
      copyOutputBtn.addEventListener('click', function() {
        if (!encodeOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        encodeOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
    
    // Download button
    if (downloadOutputBtn) {
      downloadOutputBtn.addEventListener('click', function() {
        if (!encodeOutput.value.trim()) {
          showAlert('Nothing to download', 'warning');
          return;
        }
        
        const blob = new Blob([encodeOutput.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'base64_output.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
    
    // Initialize Base64 module if available
    if (typeof Base64Tool !== 'undefined' && Base64Tool.init) {
      Base64Tool.init();
    }
  }
  
  /**
   * Initializes the JWT encoder/decoder feature
   */
  function initJwtFeature() {
    if (typeof JWTTool !== 'undefined' && JWTTool.init) {
      JWTTool.init();
    } else {
      // Fallback initialization
      setupJwtBasicFunctionality();
    }
  }
  
  /**
   * Basic JWT functionality if module isn't available
   */
  function setupJwtBasicFunctionality() {
    // JWT Decode functionality
    const jwtDecodeInput = document.getElementById('jwtDecodeInput');
    const jwtDecodeButton = document.getElementById('jwtDecodeButton');
    const jwtHeaderOutput = document.getElementById('jwtHeaderOutput');
    const jwtPayloadOutput = document.getElementById('jwtPayloadOutput');
    const jwtSignatureOutput = document.getElementById('jwtSignatureOutput');
    
    if (jwtDecodeButton && jwtDecodeInput) {
      jwtDecodeButton.addEventListener('click', function() {
        if (!jwtDecodeInput.value.trim()) {
          showAlert('Please enter a JWT token to decode', 'warning');
          return;
        }
        
        try {
          const token = jwtDecodeInput.value.trim();
          const parts = token.split('.');
          
          if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
          }
          
          // Decode header and payload (base64url decoding)
          const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          
          // Display the results
          jwtHeaderOutput.textContent = JSON.stringify(header, null, 2);
          jwtPayloadOutput.textContent = JSON.stringify(payload, null, 2);
          jwtSignatureOutput.textContent = parts[2];
          
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // JWT Encode functionality
    const jwtHeaderInput = document.getElementById('jwtHeaderInput');
    const jwtPayloadInput = document.getElementById('jwtPayloadInput');
    const jwtSecretInput = document.getElementById('jwtSecretInput');
    const jwtEncodeButton = document.getElementById('jwtEncodeButton');
    const jwtResult = document.getElementById('jwtResult');
    
    if (jwtEncodeButton) {
      jwtEncodeButton.addEventListener('click', function() {
        if (!jwtHeaderInput.value.trim() || !jwtPayloadInput.value.trim()) {
          showAlert('Please enter header and payload data', 'warning');
          return;
        }
        
        try {
          // We need a library like jsrsasign for proper JWT encoding
          // This is a fallback message in case the library isn't loaded
          showAlert('JWT generation requires the jsrsasign library. Please make sure the library is loaded correctly.', 'warning');
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons for JWT
    const jwtClearDecodeBtn = document.getElementById('jwtClearDecodeBtn');
    const jwtClearEncodeBtn = document.getElementById('jwtClearEncodeBtn');
    const jwtClearVerifyBtn = document.getElementById('jwtClearVerifyBtn');
    
    if (jwtClearDecodeBtn) {
      jwtClearDecodeBtn.addEventListener('click', function() {
        jwtDecodeInput.value = '';
        jwtHeaderOutput.textContent = '';
        jwtPayloadOutput.textContent = '';
        jwtSignatureOutput.textContent = '';
      });
    }
    
    if (jwtClearEncodeBtn) {
      jwtClearEncodeBtn.addEventListener('click', function() {
        jwtHeaderInput.value = '';
        jwtPayloadInput.value = '';
        jwtSecretInput.value = '';
        jwtResult.value = '';
      });
    }
    
    if (jwtClearVerifyBtn) {
      jwtClearVerifyBtn.addEventListener('click', function() {
        document.getElementById('jwtVerifyInput').value = '';
        document.getElementById('jwtVerifySecret').value = '';
        document.getElementById('jwtVerificationDetails').textContent = '';
        
        const statusEl = document.getElementById('jwtVerificationStatus');
        statusEl.className = 'enc-verification-status';
        statusEl.innerHTML = '<i class="fas fa-circle-question"></i><span>Enter a token to verify</span>';
      });
    }
  }
  
  /**
   * Initializes the URL encoder/decoder feature
   */
  function initUrlFeature() {
    if (typeof URLTool !== 'undefined' && URLTool.init) {
      URLTool.init();
    } else {
      // Fallback initialization
      setupUrlBasicFunctionality();
    }
  }
  
  /**
   * Basic URL functionality if module isn't available
   */
  function setupUrlBasicFunctionality() {
    // URL Encode/Decode functionality
    const urlInput = document.getElementById('urlInput');
    const urlOutput = document.getElementById('urlOutput');
    const urlEncodeButton = document.getElementById('urlEncodeButton');
    const urlClearInputBtn = document.getElementById('urlClearInputBtn');
    const urlClearOutputBtn = document.getElementById('urlClearOutputBtn');
    const urlCopyOutputBtn = document.getElementById('urlCopyOutputBtn');
    
    if (urlEncodeButton && urlInput) {
      urlEncodeButton.addEventListener('click', function() {
        if (!urlInput.value.trim()) {
          showAlert('Please enter some text to process', 'warning');
          return;
        }
        
        try {
          const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
          let result;
          
          if (mode === 'encode') {
            result = encodeURIComponent(urlInput.value);
          } else {
            result = decodeURIComponent(urlInput.value);
          }
          
          urlOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons
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
    
    // Copy button
    if (urlCopyOutputBtn) {
      urlCopyOutputBtn.addEventListener('click', function() {
        if (!urlOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        urlOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
    
    // URL Parse functionality
    const urlQueryInput = document.getElementById('urlQueryInput');
    const urlParseButton = document.getElementById('urlParseButton');
    const urlClearParseBtn = document.getElementById('urlClearParseBtn');
    
    if (urlParseButton && urlQueryInput) {
      urlParseButton.addEventListener('click', function() {
        if (!urlQueryInput.value.trim()) {
          showAlert('Please enter a URL or query string to parse', 'warning');
          return;
        }
        
        try {
          parseUrl(urlQueryInput.value);
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    if (urlClearParseBtn) {
      urlClearParseBtn.addEventListener('click', function() {
        urlQueryInput.value = '';
        document.getElementById('urlProtocol').textContent = '';
        document.getElementById('urlHost').textContent = '';
        document.getElementById('urlPath').textContent = '';
        document.getElementById('urlHash').textContent = '';
        document.getElementById('urlParamTable').querySelector('tbody').innerHTML = '';
      });
    }
  }
  
  /**
   * Parses a URL and displays the components
   */
  function parseUrl(urlString) {
    // Check if the input is a full URL or just a query string
    if (!urlString.includes('://') && !urlString.startsWith('?')) {
      // If it's not a full URL and doesn't start with ?, assume it's a query string
      urlString = '?' + urlString;
    }
    
    try {
      // Create a URL object for parsing
      const url = new URL(urlString.includes('://') ? urlString : 'http://placeholder.com/' + urlString);
      
      // Display URL components
      document.getElementById('urlProtocol').textContent = url.protocol;
      document.getElementById('urlHost').textContent = url.hostname === 'placeholder.com' ? '(not provided)' : url.host;
      document.getElementById('urlPath').textContent = url.pathname === '/' ? '(not provided)' : url.pathname;
      document.getElementById('urlHash').textContent = url.hash || '(not provided)';
      
      // Parse query parameters
      const params = url.searchParams;
      const tableBody = document.getElementById('urlParamTable').querySelector('tbody');
      tableBody.innerHTML = '';
      
      if (params.toString()) {
        for (const [key, value] of params.entries()) {
          const row = document.createElement('tr');
          
          const keyCell = document.createElement('td');
          keyCell.textContent = key;
          row.appendChild(keyCell);
          
          const valueCell = document.createElement('td');
          valueCell.textContent = value;
          row.appendChild(valueCell);
          
          const decodedCell = document.createElement('td');
          try {
            decodedCell.textContent = decodeURIComponent(value);
          } catch (e) {
            decodedCell.textContent = '(invalid encoding)';
          }
          row.appendChild(decodedCell);
          
          tableBody.appendChild(row);
        }
      } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '3');
        cell.textContent = 'No query parameters found';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
      }
    } catch (error) {
      showAlert('Invalid URL format: ' + error.message, 'error');
    }
  }
  
  /**
   * Initializes the Hash generator feature
   */
  function initHashFeature() {
    if (typeof HashTool !== 'undefined' && HashTool.init) {
      HashTool.init();
    } else {
      // Fallback initialization
      setupHashBasicFunctionality();
    }
  }
  
  /**
   * Basic Hash functionality if module isn't available
   */
  function setupHashBasicFunctionality() {
    const hashInput = document.getElementById('hashInput');
    const generateHashButton = document.getElementById('generateHashButton');
    const clearHashInputBtn = document.getElementById('clearHashInputBtn');
    const useHmac = document.getElementById('useHmac');
    const hmacKeyGroup = document.getElementById('hmacKeyGroup');
    
    // Toggle HMAC key input visibility
    if (useHmac && hmacKeyGroup) {
      useHmac.addEventListener('change', function() {
        hmacKeyGroup.style.display = this.checked ? 'block' : 'none';
      });
    }
    
    // Generate hash button
    if (generateHashButton && hashInput) {
      generateHashButton.addEventListener('click', function() {
        if (!hashInput.value.trim()) {
          showAlert('Please enter some text to hash', 'warning');
          return;
        }
        
        try {
          generateHashes();
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear button
    if (clearHashInputBtn) {
      clearHashInputBtn.addEventListener('click', function() {
        hashInput.value = '';
        document.getElementById('hashResults').innerHTML = '';
      });
    }
    
    // Function to generate hashes
    function generateHashes() {
      if (typeof CryptoJS === 'undefined') {
        showAlert('CryptoJS library is required for hash generation', 'error');
        return;
      }
      
      const input = hashInput.value;
      const resultsContainer = document.getElementById('hashResults');
      resultsContainer.innerHTML = '';
      
      // Get selected hash algorithms
      const selectedHashes = [];
      if (document.getElementById('hashMd5').checked) selectedHashes.push('MD5');
      if (document.getElementById('hashSha1').checked) selectedHashes.push('SHA1');
      if (document.getElementById('hashSha256').checked) selectedHashes.push('SHA256');
      if (document.getElementById('hashSha512').checked) selectedHashes.push('SHA512');
      if (document.getElementById('hashSha3').checked) selectedHashes.push('SHA3');
      if (document.getElementById('hashRipemd160').checked) selectedHashes.push('RIPEMD160');
      if (document.getElementById('hashCrc32').checked) selectedHashes.push('CRC32');
      
      if (selectedHashes.length === 0) {
        showAlert('Please select at least one hash algorithm', 'warning');
        return;
      }
      
      // Check if HMAC is enabled
      const isHmac = document.getElementById('useHmac').checked;
      const hmacKey = document.getElementById('hmacKey').value;
      
      if (isHmac && !hmacKey) {
        showAlert('Please enter an HMAC secret key', 'warning');
        return;
      }
      
      // Generate each selected hash
      selectedHashes.forEach(hashType => {
        let hashValue;
        let displayName = hashType;
        
        try {
          if (isHmac) {
            switch (hashType) {
              case 'MD5':
                hashValue = CryptoJS.HmacMD5(input, hmacKey).toString();
                displayName = 'HMAC-MD5';
                break;
              case 'SHA1':
                hashValue = CryptoJS.HmacSHA1(input, hmacKey).toString();
                displayName = 'HMAC-SHA1';
                break;
              case 'SHA256':
                hashValue = CryptoJS.HmacSHA256(input, hmacKey).toString();
                displayName = 'HMAC-SHA256';
                break;
              case 'SHA512':
                hashValue = CryptoJS.HmacSHA512(input, hmacKey).toString();
                displayName = 'HMAC-SHA512';
                break;
              case 'SHA3':
                if (typeof CryptoJS.HmacSHA3 !== 'undefined') {
                  hashValue = CryptoJS.HmacSHA3(input, hmacKey).toString();
                  displayName = 'HMAC-SHA3';
                } else {
                  hashValue = 'SHA3 HMAC not available';
                }
                break;
              case 'RIPEMD160':
                if (typeof CryptoJS.HmacRIPEMD160 !== 'undefined') {
                  hashValue = CryptoJS.HmacRIPEMD160(input, hmacKey).toString();
                  displayName = 'HMAC-RIPEMD160';
                } else {
                  hashValue = 'RIPEMD160 HMAC not available';
                }
                break;
              case 'CRC32':
                hashValue = 'HMAC not supported for CRC32';
                break;
              default:
                hashValue = 'Unknown hash type';
            }
          } else {
            switch (hashType) {
              case 'MD5':
                hashValue = CryptoJS.MD5(input).toString();
                break;
              case 'SHA1':
                hashValue = CryptoJS.SHA1(input).toString();
                break;
              case 'SHA256':
                hashValue = CryptoJS.SHA256(input).toString();
                break;
              case 'SHA512':
                hashValue = CryptoJS.SHA512(input).toString();
                break;
              case 'SHA3':
                if (typeof CryptoJS.SHA3 !== 'undefined') {
                  hashValue = CryptoJS.SHA3(input).toString();
                } else if (typeof sha3_512 !== 'undefined') {
                  // Fallback to js-sha3 library if available
                  hashValue = sha3_512(input);
                } else {
                  hashValue = 'SHA3 not available';
                }
                break;
              case 'RIPEMD160':
                if (typeof CryptoJS.RIPEMD160 !== 'undefined') {
                  hashValue = CryptoJS.RIPEMD160(input).toString();
                } else {
                  hashValue = 'RIPEMD160 not available';
                }
                break;
              case 'CRC32':
                if (typeof CryptoJS.CRC32 !== 'undefined') {
                  hashValue = CryptoJS.CRC32(input).toString();
                } else {
                  hashValue = 'CRC32 not available';
                }
                break;
              default:
                hashValue = 'Unknown hash type';
            }
          }
        } catch (error) {
          hashValue = `Error: ${error.message}`;
        }
        
        // Create and append hash result element
        const hashResult = document.createElement('div');
        hashResult.className = 'enc-hash-result';
        
        const hashTypeEl = document.createElement('div');
        hashTypeEl.className = 'enc-hash-type';
        hashTypeEl.innerHTML = `
          <span>${displayName}</span>
          <button class="enc-copy-hash" data-value="${hashValue}">
            <i class="fas fa-copy"></i>
          </button>
        `;
        
        const hashValueEl = document.createElement('div');
        hashValueEl.className = 'enc-hash-value';
        hashValueEl.textContent = hashValue;
        
        hashResult.appendChild(hashTypeEl);
        hashResult.appendChild(hashValueEl);
        resultsContainer.appendChild(hashResult);
      });
      
      // Add copy functionality to hash results
      document.querySelectorAll('.enc-copy-hash').forEach(button => {
        button.addEventListener('click', function() {
          const value = this.getAttribute('data-value');
          const tempTextarea = document.createElement('textarea');
          tempTextarea.value = value;
          document.body.appendChild(tempTextarea);
          tempTextarea.select();
          document.execCommand('copy');
          document.body.removeChild(tempTextarea);
          showAlert('Hash copied to clipboard', 'success');
        });
      });
    }
  }
  
  /**
   * Initializes the Hex encoder/decoder feature
   */
  function initHexFeature() {
    const hexInput = document.getElementById('hexInput');
    const hexOutput = document.getElementById('hexOutput');
    const hexEncodeButton = document.getElementById('hexEncodeButton');
    const hexClearInputBtn = document.getElementById('hexClearInputBtn');
    const hexClearOutputBtn = document.getElementById('hexClearOutputBtn');
    const hexCopyOutputBtn = document.getElementById('hexCopyOutputBtn');
    
    if (hexEncodeButton) {
      hexEncodeButton.addEventListener('click', function() {
        if (!hexInput.value.trim()) {
          showAlert('Please enter some text to convert', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        let result;
        
        try {
          if (mode === 'encode') {
            // Convert text to hex
            result = Array.from(hexInput.value)
              .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
              .join('');
          } else {
            // Convert hex to text
            const hex = hexInput.value.replace(/\s+/g, '');
            if (!/^[0-9a-fA-F]+$/.test(hex)) {
              throw new Error('Invalid hex format');
            }
            
            result = hex.match(/.{1,2}/g)
              .map(byte => String.fromCharCode(parseInt(byte, 16)))
              .join('');
          }
          hexOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons
    if (hexClearInputBtn) {
      hexClearInputBtn.addEventListener('click', function() {
        hexInput.value = '';
      });
    }
    
    if (hexClearOutputBtn) {
      hexClearOutputBtn.addEventListener('click', function() {
        hexOutput.value = '';
      });
    }
    
    // Copy button
    if (hexCopyOutputBtn) {
      hexCopyOutputBtn.addEventListener('click', function() {
        if (!hexOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        hexOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
  }
  
  /**
   * Initializes the ASCII converter feature
   */
  function initAsciiFeature() {
    const asciiInput = document.getElementById('asciiInput');
    const asciiOutput = document.getElementById('asciiOutput');
    const asciiEncodeButton = document.getElementById('asciiEncodeButton');
    const asciiClearInputBtn = document.getElementById('asciiClearInputBtn');
    const asciiClearOutputBtn = document.getElementById('asciiClearOutputBtn');
    const asciiCopyOutputBtn = document.getElementById('asciiCopyOutputBtn');
    
    if (asciiEncodeButton) {
      asciiEncodeButton.addEventListener('click', function() {
        if (!asciiInput.value.trim()) {
          showAlert('Please enter some text to convert', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        let result;
        
        try {
          if (mode === 'encode') {
            // Convert text to ASCII values
            result = Array.from(asciiInput.value)
              .map(c => c.charCodeAt(0))
              .join(' ');
          } else {
            // Convert ASCII values to text
            const values = asciiInput.value.replace(/,/g, ' ').split(/\s+/);
            
            // Validate all values are numbers
            if (!values.every(val => !isNaN(val) && val !== '')) {
              throw new Error('Invalid ASCII values. Please enter space or comma-separated decimal numbers.');
            }
            
            result = values
              .map(val => String.fromCharCode(parseInt(val, 10)))
              .join('');
          }
          asciiOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons
    if (asciiClearInputBtn) {
      asciiClearInputBtn.addEventListener('click', function() {
        asciiInput.value = '';
      });
    }
    
    if (asciiClearOutputBtn) {
      asciiClearOutputBtn.addEventListener('click', function() {
        asciiOutput.value = '';
      });
    }
    
    // Copy button
    if (asciiCopyOutputBtn) {
      asciiCopyOutputBtn.addEventListener('click', function() {
        if (!asciiOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        asciiOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
  }
  
  /**
   * Initializes the Binary converter feature
   */
  function initBinaryFeature() {
    const binaryInput = document.getElementById('binaryInput');
    const binaryOutput = document.getElementById('binaryOutput');
    const binaryEncodeButton = document.getElementById('binaryEncodeButton');
    const binaryClearInputBtn = document.getElementById('binaryClearInputBtn');
    const binaryClearOutputBtn = document.getElementById('binaryClearOutputBtn');
    const binaryCopyOutputBtn = document.getElementById('binaryCopyOutputBtn');
    
    if (binaryEncodeButton) {
      binaryEncodeButton.addEventListener('click', function() {
        if (!binaryInput.value.trim()) {
          showAlert('Please enter some text to convert', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        const formatType = document.querySelector('input[name="binaryFormat"]:checked').value;
        let result;
        
        try {
          if (mode === 'encode') {
            // Convert text to binary
            result = Array.from(binaryInput.value)
              .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
              .join(formatType === 'space' ? ' ' : '');
          } else {
            // Convert binary to text
            // Remove all spaces and check if it's valid binary
            const binary = binaryInput.value.replace(/\s+/g, '');
            if (!/^[01]+$/.test(binary)) {
              throw new Error('Invalid binary format. Please enter only 0s and 1s.');
            }
            
            // Make sure the length is a multiple of 8
            if (binary.length % 8 !== 0) {
              throw new Error('Invalid binary length. Each character should be 8 bits.');
            }
            
            result = binary.match(/.{1,8}/g)
              .map(byte => String.fromCharCode(parseInt(byte, 2)))
              .join('');
          }
          binaryOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons
    if (binaryClearInputBtn) {
      binaryClearInputBtn.addEventListener('click', function() {
        binaryInput.value = '';
      });
    }
    
    if (binaryClearOutputBtn) {
      binaryClearOutputBtn.addEventListener('click', function() {
        binaryOutput.value = '';
      });
    }
    
    // Copy button
    if (binaryCopyOutputBtn) {
      binaryCopyOutputBtn.addEventListener('click', function() {
        if (!binaryOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        binaryOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
  }
  
  /**
   * Initializes the HTML Entity encoder/decoder feature
   */
  function initHtmlFeature() {
    const htmlInput = document.getElementById('htmlInput');
    const htmlOutput = document.getElementById('htmlOutput');
    const htmlEncodeButton = document.getElementById('htmlEncodeButton');
    const htmlClearInputBtn = document.getElementById('htmlClearInputBtn');
    const htmlClearOutputBtn = document.getElementById('htmlClearOutputBtn');
    const htmlCopyOutputBtn = document.getElementById('htmlCopyOutputBtn');
    
    if (htmlEncodeButton) {
      htmlEncodeButton.addEventListener('click', function() {
        if (!htmlInput.value.trim()) {
          showAlert('Please enter some text to convert', 'warning');
          return;
        }
        
        const mode = document.querySelector('.enc-mode-btn.active').getAttribute('data-mode');
        let result;
        
        try {
          if (mode === 'encode') {
            // Convert text to HTML entities
            result = htmlInput.value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/\//g, '&#x2F;')
              .replace(/\\/g, '&#x5C;')
              .replace(/=/g, '&#x3D;');
          } else {
            // Convert HTML entities to text
            const temp = document.createElement('div');
            temp.innerHTML = htmlInput.value;
            result = temp.textContent || temp.innerText;
          }
          htmlOutput.value = result;
        } catch (error) {
          showAlert(`Error: ${error.message}`, 'error');
        }
      });
    }
    
    // Clear buttons
    if (htmlClearInputBtn) {
      htmlClearInputBtn.addEventListener('click', function() {
        htmlInput.value = '';
      });
    }
    
    if (htmlClearOutputBtn) {
      htmlClearOutputBtn.addEventListener('click', function() {
        htmlOutput.value = '';
      });
    }
    
    // Copy button
    if (htmlCopyOutputBtn) {
      htmlCopyOutputBtn.addEventListener('click', function() {
        if (!htmlOutput.value.trim()) {
          showAlert('Nothing to copy', 'warning');
          return;
        }
        
        htmlOutput.select();
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
      });
    }
  }
  
  /**
   * Shows an alert message
   * @param {string} message - The message to display
   * @param {string} type - The alert type (success, error, warning, info)
   */
  function showAlert(message, type = 'info') {
    // Use UI module if available
    if (typeof EncoderUI !== 'undefined' && EncoderUI.showAlert) {
      EncoderUI.showAlert(message, type);
      return;
    }
    
    // Fallback implementation
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
  
  // Check URL hash for direct feature access
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const validFeatures = ['base64', 'jwt', 'url', 'hash', 'more', 'hex', 'ascii', 'binary', 'html'];
      
      if (validFeatures.includes(hash)) {
        showFeature(hash);
      } else {
        // If hash doesn't match any feature, default to base64
        showFeature('base64');
      }
    } else {
      // If no hash is present, default to base64 tab
      showFeature('base64');
    }
  }
  
  // Check hash on load
  checkUrlHash();
  
  // Listen for hash changes
  window.addEventListener('hashchange', checkUrlHash);
  
  // Global export for direct access from other modules
  window.EncoderTool = {
    showFeature,
    showAlert,
    initBase64Feature,
    initJwtFeature,
    initUrlFeature,
    initHashFeature,
    initHexFeature,
    initAsciiFeature,
    initBinaryFeature,
    initHtmlFeature
  };
});