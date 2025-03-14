/**
 * Additional Encoders Module
 * Handles additional encoding/decoding tools beyond the main ones
 */

const MoreTools = (function() {
  /**
   * Initializes the More Tools module
   */
  function init() {
    // Set up click handlers for additional tools
    const moreCards = document.querySelectorAll('.enc-more-card');
    moreCards.forEach(card => {
      card.addEventListener('click', function() {
        const tool = this.getAttribute('data-tool');
        if (tool && typeof window.EncoderTool !== 'undefined') {
          window.EncoderTool.showFeature(tool);
        }
      });
    });
  }
  
  /*
   * HEX Encoding/Decoding Functions
   */
  
  /**
   * Convert text to hexadecimal
   * @param {string} input - Text input
   * @returns {string} - Hexadecimal representation
   */
  function textToHex(input) {
    return Array.from(input)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Convert hexadecimal to text
   * @param {string} input - Hexadecimal input
   * @returns {string} - Original text
   */
  function hexToText(input) {
    // Remove whitespace
    const hex = input.replace(/\s+/g, '');
    
    // Validate hex format
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error('Invalid hexadecimal format');
    }
    
    // If odd length, throw error
    if (hex.length % 2 !== 0) {
      throw new Error('Hexadecimal string must have an even number of digits');
    }
    
    // Convert pairs of hex digits to characters
    return hex.match(/.{1,2}/g)
      .map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('');
  }
  
  /*
   * ASCII Encoding/Decoding Functions
   */
  
  /**
   * Convert text to ASCII values
   * @param {string} input - Text input
   * @param {string} separator - Value separator (default: space)
   * @returns {string} - Space-separated ASCII values
   */
  function textToAscii(input, separator = ' ') {
    return Array.from(input)
      .map(c => c.charCodeAt(0))
      .join(separator);
  }
  
  /**
   * Convert ASCII values to text
   * @param {string} input - Space or comma-separated ASCII values
   * @returns {string} - Original text
   */
  function asciiToText(input) {
    // Split by spaces or commas
    const values = input.replace(/,/g, ' ').split(/\s+/);
    
    // Validate that all values are numbers
    if (values.some(val => isNaN(parseInt(val, 10)) || val === '')) {
      throw new Error('Invalid ASCII values. Please enter space or comma-separated decimal numbers.');
    }
    
    // Convert ASCII values to characters
    return values
      .map(val => String.fromCharCode(parseInt(val, 10)))
      .join('');
  }
  
  /*
   * Binary Encoding/Decoding Functions
   */
  
  /**
   * Convert text to binary
   * @param {string} input - Text input
   * @param {boolean} addSpaces - Whether to add spaces between bytes
   * @returns {string} - Binary representation
   */
  function textToBinary(input, addSpaces = true) {
    return Array.from(input)
      .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(addSpaces ? ' ' : '');
  }
  
  /**
   * Convert binary to text
   * @param {string} input - Binary input
   * @returns {string} - Original text
   */
  function binaryToText(input) {
    // Remove spaces
    const binary = input.replace(/\s+/g, '');
    
    // Validate binary format
    if (!/^[01]+$/.test(binary)) {
      throw new Error('Invalid binary format. Please enter only 0s and 1s.');
    }
    
    // Ensure length is a multiple of 8
    if (binary.length % 8 !== 0) {
      throw new Error('Invalid binary length. Each character should be 8 bits.');
    }
    
    // Convert blocks of 8 bits to characters
    return binary.match(/.{1,8}/g)
      .map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('');
  }
  
  /*
   * HTML Entity Encoding/Decoding Functions
   */
  
  /**
   * Convert text to HTML entities
   * @param {string} input - Text input
   * @returns {string} - HTML entity encoded text
   */
  function textToHtmlEntities(input) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/=/g, '&#x3D;');
  }
  
  /**
   * Convert HTML entities to text
   * @param {string} input - HTML entity encoded text
   * @returns {string} - Original text
   */
  function htmlEntitiesToText(input) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = input;
    return tempElement.textContent || tempElement.innerText;
  }
  
  /*
   * ROT13 Encoding/Decoding Function
   */
  
  /**
   * Apply ROT13 transformation to text (same for encode/decode)
   * @param {string} input - Text input
   * @returns {string} - ROT13 transformed text
   */
  function rot13(input) {
    return input.replace(/[a-zA-Z]/g, function(c) {
      const charCode = c.charCodeAt(0);
      const isUpper = c === c.toUpperCase();
      const base = isUpper ? 65 : 97;
      return String.fromCharCode(((charCode - base + 13) % 26) + base);
    });
  }
  
  /*
   * XOR Encoding/Decoding Functions
   */
  
  /**
   * XOR encrypt/decrypt text with a key
   * @param {string} input - Text input
   * @param {string} key - Encryption key
   * @returns {string} - XOR encrypted/decrypted text as hex
   */
  function xorEncrypt(input, key) {
    if (!key) {
      throw new Error('XOR encryption key is required');
    }
    
    const result = [];
    
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result.push(charCode.toString(16).padStart(2, '0'));
    }
    
    return result.join('');
  }
  
  /**
   * XOR decrypt hex with a key
   * @param {string} input - Hex input
   * @param {string} key - Encryption key
   * @returns {string} - Original text
   */
  function xorDecrypt(input, key) {
    if (!key) {
      throw new Error('XOR decryption key is required');
    }
    
    // Remove whitespace and validate hex
    const hex = input.replace(/\s+/g, '');
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error('Invalid hexadecimal format');
    }
    
    // Ensure even length
    if (hex.length % 2 !== 0) {
      throw new Error('Hexadecimal string must have an even number of digits');
    }
    
    // Decode hex to bytes
    const bytes = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    
    // XOR with key
    const result = [];
    for (let i = 0; i < bytes.length; i++) {
      const charCode = bytes[i] ^ key.charCodeAt(i % key.length);
      result.push(String.fromCharCode(charCode));
    }
    
    return result.join('');
  }
  
  return {
    init,
    textToHex,
    hexToText,
    textToAscii,
    asciiToText,
    textToBinary,
    binaryToText,
    textToHtmlEntities,
    htmlEntitiesToText,
    rot13,
    xorEncrypt,
    xorDecrypt
  };
})();

// Global export
window.MoreTools = MoreTools;