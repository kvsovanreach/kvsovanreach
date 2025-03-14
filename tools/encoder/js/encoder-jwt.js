/**
 * JWT Encoder/Decoder Module
 * Handles JWT token operations (decode, encode, verify)
 */

const JWTTool = (function() {
  // DOM elements
  let jwtDecodeInput, jwtDecodeButton, jwtHeaderOutput, jwtPayloadOutput, jwtSignatureOutput;
  let jwtHeaderInput, jwtPayloadInput, jwtSecretInput, jwtEncodeButton, jwtResult;
  let jwtVerifyInput, jwtVerifySecret, jwtVerifyButton, jwtVerificationStatus, jwtVerificationDetails;
  let jwtClearDecodeBtn, jwtClearEncodeBtn, jwtClearVerifyBtn, jwtCopyBtn;
  
  /**
   * Initializes the JWT module
   */
  function init() {
    // Cache DOM elements for decode mode
    jwtDecodeInput = document.getElementById('jwtDecodeInput');
    jwtDecodeButton = document.getElementById('jwtDecodeButton');
    jwtHeaderOutput = document.getElementById('jwtHeaderOutput');
    jwtPayloadOutput = document.getElementById('jwtPayloadOutput');
    jwtSignatureOutput = document.getElementById('jwtSignatureOutput');
    jwtClearDecodeBtn = document.getElementById('jwtClearDecodeBtn');
    
    // Cache DOM elements for encode mode
    jwtHeaderInput = document.getElementById('jwtHeaderInput');
    jwtPayloadInput = document.getElementById('jwtPayloadInput');
    jwtSecretInput = document.getElementById('jwtSecretInput');
    jwtEncodeButton = document.getElementById('jwtEncodeButton');
    jwtResult = document.getElementById('jwtResult');
    jwtClearEncodeBtn = document.getElementById('jwtClearEncodeBtn');
    jwtCopyBtn = document.getElementById('jwtCopyBtn');
    
    // Cache DOM elements for verify mode
    jwtVerifyInput = document.getElementById('jwtVerifyInput');
    jwtVerifySecret = document.getElementById('jwtVerifySecret');
    jwtVerifyButton = document.getElementById('jwtVerifyButton');
    jwtVerificationStatus = document.getElementById('jwtVerificationStatus');
    jwtVerificationDetails = document.getElementById('jwtVerificationDetails');
    jwtClearVerifyBtn = document.getElementById('jwtClearVerifyBtn');
    
    // Set up event listeners for decode mode
    if (jwtDecodeButton) {
      jwtDecodeButton.addEventListener('click', handleDecode);
    }
    
    if (jwtClearDecodeBtn) {
      jwtClearDecodeBtn.addEventListener('click', function() {
        jwtDecodeInput.value = '';
        jwtHeaderOutput.textContent = '';
        jwtPayloadOutput.textContent = '';
        jwtSignatureOutput.textContent = '';
      });
    }
    
    // Set up event listeners for encode mode
    if (jwtEncodeButton) {
      jwtEncodeButton.addEventListener('click', handleEncode);
    }
    
    if (jwtClearEncodeBtn) {
      jwtClearEncodeBtn.addEventListener('click', function() {
        jwtHeaderInput.value = '';
        jwtPayloadInput.value = '';
        jwtSecretInput.value = '';
        jwtResult.value = '';
      });
    }
    
    if (jwtCopyBtn) {
      jwtCopyBtn.addEventListener('click', function() {
        if (!jwtResult.value.trim()) {
          EncoderUI.showAlert('Nothing to copy', 'warning');
          return;
        }
        
        EncoderUI.copyToClipboard(jwtResult.value);
      });
    }
    
    // Set up event listeners for verify mode
    if (jwtVerifyButton) {
      jwtVerifyButton.addEventListener('click', handleVerify);
    }
    
    if (jwtClearVerifyBtn) {
      jwtClearVerifyBtn.addEventListener('click', function() {
        jwtVerifyInput.value = '';
        jwtVerifySecret.value = '';
        jwtVerificationDetails.textContent = '';
        
        jwtVerificationStatus.className = 'enc-verification-status';
        jwtVerificationStatus.innerHTML = '<i class="fas fa-circle-question"></i><span>Enter a token to verify</span>';
      });
    }
    
    // Set default values for header and payload
    if (jwtHeaderInput && !jwtHeaderInput.value) {
      jwtHeaderInput.value = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
    }
    
    if (jwtPayloadInput && !jwtPayloadInput.value) {
      const now = Math.floor(Date.now() / 1000);
      jwtPayloadInput.value = `{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": ${now}\n}`;
    }
  }
  
  /**
   * Handles JWT decoding
   */
  function handleDecode() {
    if (!jwtDecodeInput.value.trim()) {
      EncoderUI.showAlert('Please enter a JWT token to decode', 'warning');
      return;
    }
    
    try {
      const token = jwtDecodeInput.value.trim();
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode header and payload (base64url decoding)
      const header = parseJWTPart(parts[0]);
      const payload = parseJWTPart(parts[1]);
      
      // Display the results
      jwtHeaderOutput.textContent = JSON.stringify(header, null, 2);
      jwtPayloadOutput.textContent = JSON.stringify(payload, null, 2);
      jwtSignatureOutput.textContent = parts[2];
      
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Handles JWT encoding/generation
   */
  function handleEncode() {
    if (!jwtHeaderInput.value.trim() || !jwtPayloadInput.value.trim()) {
      EncoderUI.showAlert('Please enter header and payload data', 'warning');
      return;
    }
    
    try {
      let header, payload;
      
      // Parse JSON input
      try {
        header = JSON.parse(jwtHeaderInput.value);
      } catch (e) {
        throw new Error('Invalid header JSON: ' + e.message);
      }
      
      try {
        payload = JSON.parse(jwtPayloadInput.value);
      } catch (e) {
        throw new Error('Invalid payload JSON: ' + e.message);
      }
      
      // Check if we have JSRSASIGN library available
      if (typeof KJUR === 'undefined') {
        throw new Error('JWT generation requires the jsrsasign library');
      }
      
      // Generate the JWT token
      const secret = jwtSecretInput.value;
      const token = generateJWT(header, payload, secret);
      jwtResult.value = token;
      
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Handles JWT verification
   */
  function handleVerify() {
    if (!jwtVerifyInput.value.trim()) {
      EncoderUI.showAlert('Please enter a JWT token to verify', 'warning');
      return;
    }
    
    try {
      const token = jwtVerifyInput.value.trim();
      const secret = jwtVerifySecret.value;
      
      if (!secret) {
        EncoderUI.showAlert('Please enter the secret key used to sign this token', 'warning');
        return;
      }
      
      // Verify the token
      const result = verifyJWT(token, secret);
      
      // Update verification status
      jwtVerificationStatus.className = 'enc-verification-status ' + (result.isValid ? 'valid' : 'invalid');
      jwtVerificationStatus.innerHTML = result.isValid 
        ? '<i class="fas fa-check-circle"></i><span>Signature verified successfully</span>'
        : '<i class="fas fa-times-circle"></i><span>Invalid signature</span>';
      
      // Display verification details
      jwtVerificationDetails.textContent = JSON.stringify(result.details, null, 2);
      
    } catch (error) {
      EncoderUI.showAlert(`Error: ${error.message}`, 'error');
      
      // Update verification status
      jwtVerificationStatus.className = 'enc-verification-status invalid';
      jwtVerificationStatus.innerHTML = '<i class="fas fa-times-circle"></i><span>Error: ' + error.message + '</span>';
    }
  }
  
  /**
   * Parses a JWT part (header or payload)
   * @param {string} part - The base64url encoded part
   * @returns {object} - The decoded JSON object
   */
  function parseJWTPart(part) {
    try {
      // Replace base64url specific characters
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      
      // Decode base64 to string
      const jsonStr = atob(padded);
      
      // Parse JSON
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Failed to parse JWT part: ${e.message}`);
    }
  }
  
  /**
   * Generates a JWT token
   * @param {object} header - The JWT header
   * @param {object} payload - The JWT payload
   * @param {string} secret - The secret key
   * @returns {string} - The JWT token
   */
  function generateJWT(header, payload, secret) {
    try {
      // Use jsrsasign if available
      if (typeof KJUR !== 'undefined') {
        const jwtHeader = JSON.stringify(header);
        const jwtPayload = JSON.stringify(payload);
        
        const sHeader = KJUR.jws.JWS.readSafeJSONString(jwtHeader);
        const sPayload = KJUR.jws.JWS.readSafeJSONString(jwtPayload);
        
        return KJUR.jws.JWS.sign(null, sHeader, sPayload, { utf8: secret });
      } else {
        // Fallback to manual implementation (simplified)
        const base64UrlEncode = (str) => {
          return btoa(str)
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        };
        
        // Encode header and payload
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));
        
        // Create signature (placeholder - not secure for production)
        const data = encodedHeader + '.' + encodedPayload;
        const signature = 'signature_unavailable'; // Real signing requires crypto library
        
        return data + '.' + signature;
      }
    } catch (e) {
      throw new Error(`JWT generation failed: ${e.message}`);
    }
  }
  
  /**
   * Verifies a JWT token
   * @param {string} token - The JWT token
   * @param {string} secret - The secret key
   * @returns {object} - Verification result and details
   */
  function verifyJWT(token, secret) {
    try {
      // Split the token
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode header and payload
      const header = parseJWTPart(parts[0]);
      const payload = parseJWTPart(parts[1]);
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      // Check token validity using jsrsasign
      let isValid = false;
      
      if (typeof KJUR !== 'undefined') {
        try {
          isValid = KJUR.jws.JWS.verifyJWT(token, { utf8: secret }, { alg: [header.alg] });
        } catch (e) {
          isValid = false;
        }
      } else {
        // Fallback message if library is not available
        throw new Error('JWT verification requires the jsrsasign library');
      }
      
      // Create verification details
      const details = {
        header,
        payload,
        verificationTime: new Date().toISOString(),
        isExpired,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiration',
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Unknown',
        algorithm: header.alg
      };
      
      return {
        isValid,
        details
      };
    } catch (e) {
      throw new Error(`JWT verification failed: ${e.message}`);
    }
  }
  
  return {
    init,
    parseJWTPart,
    generateJWT,
    verifyJWT
  };
})();

// Global export
window.JWTTool = JWTTool;