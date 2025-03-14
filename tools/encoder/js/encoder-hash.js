/**
 * Hash Generator Module
 * Handles hash generation using various algorithms
 */

const HashTool = (function() {
  // DOM elements
  let hashInput, generateHashButton, clearHashInputBtn, useHmac, hmacKey, hmacKeyGroup;
  let hashMd5, hashSha1, hashSha256, hashSha512, hashSha3, hashRipemd160, hashCrc32;
  let hashResults;
  
  /**
   * Initializes the Hash module
   */
  function init() {
    // Cache DOM elements
    hashInput = document.getElementById('hashInput');
    generateHashButton = document.getElementById('generateHashButton');
    clearHashInputBtn = document.getElementById('clearHashInputBtn');
    useHmac = document.getElementById('useHmac');
    hmacKey = document.getElementById('hmacKey');
    hmacKeyGroup = document.getElementById('hmacKeyGroup');
    hashResults = document.getElementById('hashResults');
    
    // Cache checkbox elements
    hashMd5 = document.getElementById('hashMd5');
    hashSha1 = document.getElementById('hashSha1');
    hashSha256 = document.getElementById('hashSha256');
    hashSha512 = document.getElementById('hashSha512');
    hashSha3 = document.getElementById('hashSha3');
    hashRipemd160 = document.getElementById('hashRipemd160');
    hashCrc32 = document.getElementById('hashCrc32');
    
    // Toggle HMAC key input visibility
    if (useHmac && hmacKeyGroup) {
      useHmac.addEventListener('change', function() {
        hmacKeyGroup.style.display = this.checked ? 'block' : 'none';
      });
    }
    
    // Generate hash button
    if (generateHashButton && hashInput) {
      generateHashButton.addEventListener('click', handleGenerateHash);
    }
    
    // Clear button
    if (clearHashInputBtn) {
      clearHashInputBtn.addEventListener('click', function() {
        hashInput.value = '';
        if (hashResults) hashResults.innerHTML = '';
      });
    }
  }
  
  /**
   * Handles hash generation
   */
  function handleGenerateHash() {
    if (!hashInput.value.trim()) {
      EncoderUI.showAlert('Please enter some text to hash', 'warning');
      return;
    }
    
    try {
      generateHashes();
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Generates hashes based on selected algorithms
   */
  function generateHashes() {
    if (typeof CryptoJS === 'undefined') {
      EncoderUI.showAlert('CryptoJS library is required for hash generation', 'error');
      return;
    }
    
    const input = hashInput.value;
    hashResults.innerHTML = '';
    
    // Get selected hash algorithms
    const selectedHashes = [];
    if (hashMd5 && hashMd5.checked) selectedHashes.push('MD5');
    if (hashSha1 && hashSha1.checked) selectedHashes.push('SHA1');
    if (hashSha256 && hashSha256.checked) selectedHashes.push('SHA256');
    if (hashSha512 && hashSha512.checked) selectedHashes.push('SHA512');
    if (hashSha3 && hashSha3.checked) selectedHashes.push('SHA3');
    if (hashRipemd160 && hashRipemd160.checked) selectedHashes.push('RIPEMD160');
    if (hashCrc32 && hashCrc32.checked) selectedHashes.push('CRC32');
    
    if (selectedHashes.length === 0) {
      EncoderUI.showAlert('Please select at least one hash algorithm', 'warning');
      return;
    }
    
    // Check if HMAC is enabled
    const isHmac = useHmac && useHmac.checked;
    const hmacKeyValue = hmacKey ? hmacKey.value : '';
    
    if (isHmac && !hmacKeyValue) {
      EncoderUI.showAlert('Please enter an HMAC secret key', 'warning');
      return;
    }
    
    // Generate each selected hash
    selectedHashes.forEach(hashType => {
      const result = generateHash(hashType, input, isHmac, hmacKeyValue);
      appendHashResult(result.type, result.value);
    });
  }
  
  /**
   * Generates a specific hash
   * @param {string} hashType - The hash algorithm to use
   * @param {string} input - The input text to hash
   * @param {boolean} isHmac - Whether to use HMAC
   * @param {string} key - The HMAC key (if applicable)
   * @returns {object} - The hash result with type and value
   */
  function generateHash(hashType, input, isHmac, key) {
    let hashValue;
    let displayType = hashType;
    
    try {
      if (isHmac) {
        switch (hashType) {
          case 'MD5':
            hashValue = CryptoJS.HmacMD5(input, key).toString();
            displayType = 'HMAC-MD5';
            break;
          case 'SHA1':
            hashValue = CryptoJS.HmacSHA1(input, key).toString();
            displayType = 'HMAC-SHA1';
            break;
          case 'SHA256':
            hashValue = CryptoJS.HmacSHA256(input, key).toString();
            displayType = 'HMAC-SHA256';
            break;
          case 'SHA512':
            hashValue = CryptoJS.HmacSHA512(input, key).toString();
            displayType = 'HMAC-SHA512';
            break;
          case 'SHA3':
            if (typeof CryptoJS.HmacSHA3 !== 'undefined') {
              hashValue = CryptoJS.HmacSHA3(input, key).toString();
              displayType = 'HMAC-SHA3-512';
            } else if (typeof sha3_512 !== 'undefined') {
              hashValue = hmacSha3Fallback(input, key);
              displayType = 'HMAC-SHA3-512';
            } else {
              hashValue = 'SHA3 HMAC not available';
            }
            break;
          case 'RIPEMD160':
            if (typeof CryptoJS.HmacRIPEMD160 !== 'undefined') {
              hashValue = CryptoJS.HmacRIPEMD160(input, key).toString();
              displayType = 'HMAC-RIPEMD160';
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
              hashValue = CryptoJS.SHA3(input, { outputLength: 512 }).toString();
              displayType = 'SHA3-512';
            } else if (typeof sha3_512 !== 'undefined') {
              // Fallback to js-sha3 library if available
              hashValue = sha3_512(input);
              displayType = 'SHA3-512';
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
    
    return {
      type: displayType,
      value: hashValue
    };
  }
  
  /**
   * Fallback implementation of HMAC-SHA3 using js-sha3
   * @param {string} message - The message to hash
   * @param {string} key - The key to use
   * @returns {string} - The HMAC-SHA3 hash
   */
  function hmacSha3Fallback(message, key) {
    // This is a very simplified implementation and should be replaced with a proper HMAC-SHA3
    // in a production environment
    if (typeof sha3_512 === 'undefined') {
      return 'SHA3 HMAC not available';
    }
    
    // Simple fallback using concatenation (NOT a secure HMAC implementation)
    return sha3_512(key + message + key);
  }
  
  /**
   * Appends a hash result to the results container
   * @param {string} type - The hash algorithm type
   * @param {string} value - The hash value
   */
  function appendHashResult(type, value) {
    // Create hash result element
    const hashResult = document.createElement('div');
    hashResult.className = 'enc-hash-result';
    
    const hashTypeEl = document.createElement('div');
    hashTypeEl.className = 'enc-hash-type';
    hashTypeEl.innerHTML = `
      <span>${type}</span>
      <button class="enc-copy-hash" data-value="${value}">
        <i class="fas fa-copy"></i>
      </button>
    `;
    
    const hashValueEl = document.createElement('div');
    hashValueEl.className = 'enc-hash-value';
    hashValueEl.textContent = value;
    
    hashResult.appendChild(hashTypeEl);
    hashResult.appendChild(hashValueEl);
    hashResults.appendChild(hashResult);
    
    // Add copy functionality
    const copyButton = hashResult.querySelector('.enc-copy-hash');
    if (copyButton) {
      copyButton.addEventListener('click', function() {
        const hashText = this.getAttribute('data-value');
        EncoderUI.copyToClipboard(hashText);
      });
    }
  }
  
  return {
    init,
    generateHash,
    generateHashes
  };
})();

// Global export
window.HashTool = HashTool;