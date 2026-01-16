/**
 * Binary Text Converter Tool
 * Convert between text and binary/hex/decimal/octal formats
 */

(function() {
  'use strict';

  // ==================== State ====================
  let encodeFormat = 'binary';
  let decodeFormat = 'binary';

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.binary-tab'),
    panels: document.querySelectorAll('.binary-panel'),
    // Encode
    textToEncode: document.getElementById('textToEncode'),
    encodeSeparator: document.getElementById('encodeSeparator'),
    encodeBtn: document.getElementById('encodeBtn'),
    encodedOutput: document.getElementById('encodedOutput'),
    pasteTextBtn: document.getElementById('pasteTextBtn'),
    clearTextBtn: document.getElementById('clearTextBtn'),
    copyEncodedBtn: document.getElementById('copyEncodedBtn'),
    // Decode
    binaryToDecode: document.getElementById('binaryToDecode'),
    decodeBtn: document.getElementById('decodeBtn'),
    decodedOutput: document.getElementById('decodedOutput'),
    pasteBinaryBtn: document.getElementById('pasteBinaryBtn'),
    clearBinaryBtn: document.getElementById('clearBinaryBtn'),
    copyDecodedBtn: document.getElementById('copyDecodedBtn'),
    // Multi-format
    multiInput: document.getElementById('multiInput'),
    pasteMultiBtn: document.getElementById('pasteMultiBtn'),
    clearMultiBtn: document.getElementById('clearMultiBtn'),
    multiBinary: document.getElementById('multiBinary'),
    multiHex: document.getElementById('multiHex'),
    multiDecimal: document.getElementById('multiDecimal'),
    multiOctal: document.getElementById('multiOctal'),
    multiAscii: document.getElementById('multiAscii')
  };

  // ==================== Conversion Functions ====================
  function textToBinary(text, separator = ' ') {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(separator);
  }

  function textToHex(text, separator = ' ') {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
    }).join(separator);
  }

  function textToDecimal(text, separator = ' ') {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(10);
    }).join(separator);
  }

  function textToOctal(text, separator = ' ') {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(8).padStart(3, '0');
    }).join(separator);
  }

  function binaryToText(binary) {
    const cleaned = binary.replace(/[^01]/g, '');
    let text = '';
    for (let i = 0; i < cleaned.length; i += 8) {
      const byte = cleaned.substr(i, 8);
      if (byte.length === 8) {
        text += String.fromCharCode(parseInt(byte, 2));
      }
    }
    return text;
  }

  function hexToText(hex) {
    const cleaned = hex.replace(/[^0-9a-fA-F]/g, '');
    let text = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const byte = cleaned.substr(i, 2);
      if (byte.length === 2) {
        text += String.fromCharCode(parseInt(byte, 16));
      }
    }
    return text;
  }

  function decimalToText(decimal) {
    const numbers = decimal.split(/[\s,]+/).filter(n => n);
    return numbers.map(n => String.fromCharCode(parseInt(n, 10))).join('');
  }

  function octalToText(octal) {
    const numbers = octal.split(/[\s,]+/).filter(n => n);
    return numbers.map(n => String.fromCharCode(parseInt(n, 8))).join('');
  }

  // ==================== Encode ====================
  function encode() {
    const text = elements.textToEncode.value;
    if (!text) {
      ToolsCommon.showToast('Please enter text to convert', 'error');
      return;
    }

    const separator = elements.encodeSeparator.value;
    let result = '';

    switch (encodeFormat) {
      case 'binary':
        result = textToBinary(text, separator);
        break;
      case 'hex':
        result = textToHex(text, separator);
        break;
      case 'decimal':
        result = textToDecimal(text, separator);
        break;
      case 'octal':
        result = textToOctal(text, separator);
        break;
    }

    elements.encodedOutput.value = result;
    ToolsCommon.showToast('Converted successfully', 'success');
  }

  // ==================== Decode ====================
  function decode() {
    const input = elements.binaryToDecode.value;
    if (!input) {
      ToolsCommon.showToast('Please enter data to decode', 'error');
      return;
    }

    let result = '';

    try {
      switch (decodeFormat) {
        case 'binary':
          result = binaryToText(input);
          break;
        case 'hex':
          result = hexToText(input);
          break;
        case 'decimal':
          result = decimalToText(input);
          break;
        case 'octal':
          result = octalToText(input);
          break;
      }

      if (!result) {
        throw new Error('Invalid input');
      }

      elements.decodedOutput.value = result;
      ToolsCommon.showToast('Decoded successfully', 'success');
    } catch (e) {
      ToolsCommon.showToast('Invalid input format', 'error');
    }
  }

  // ==================== Multi-Format Update ====================
  function updateMultiFormat() {
    const text = elements.multiInput.value;

    if (!text) {
      elements.multiBinary.textContent = '-';
      elements.multiHex.textContent = '-';
      elements.multiDecimal.textContent = '-';
      elements.multiOctal.textContent = '-';
      elements.multiAscii.textContent = '-';
      return;
    }

    elements.multiBinary.textContent = textToBinary(text, ' ');
    elements.multiHex.textContent = textToHex(text, ' ');
    elements.multiDecimal.textContent = textToDecimal(text, ' ');
    elements.multiOctal.textContent = textToOctal(text, ' ');
    elements.multiAscii.textContent = text.split('').map(c => c.charCodeAt(0)).join(', ');
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
  }

  // ==================== Format Selection ====================
  function setEncodeFormat(format, btn) {
    encodeFormat = format;
    document.querySelectorAll('#encodePanel .format-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
  }

  function setDecodeFormat(format, btn) {
    decodeFormat = format;
    document.querySelectorAll('#decodePanel .format-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
  }

  // ==================== Actions ====================
  async function pasteToInput(inputElement) {
    try {
      const text = await navigator.clipboard.readText();
      inputElement.value = text;
      ToolsCommon.showToast('Pasted from clipboard', 'success');
      if (inputElement === elements.multiInput) {
        updateMultiFormat();
      }
    } catch (err) {
      ToolsCommon.showToast('Failed to paste', 'error');
    }
  }

  function clearInput(inputElement, outputElement) {
    inputElement.value = '';
    if (outputElement) outputElement.value = '';
    if (inputElement === elements.multiInput) {
      updateMultiFormat();
    }
    ToolsCommon.showToast('Cleared', 'success');
  }

  function copyOutput(text) {
    if (!text || text === '-') {
      ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(text, 'Copied!');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Format selection - Encode
    document.querySelectorAll('#encodePanel .format-btn').forEach(btn => {
      btn.addEventListener('click', () => setEncodeFormat(btn.dataset.format, btn));
    });

    // Format selection - Decode
    document.querySelectorAll('#decodePanel .format-btn').forEach(btn => {
      btn.addEventListener('click', () => setDecodeFormat(btn.dataset.format, btn));
    });

    // Encode
    elements.encodeBtn.addEventListener('click', encode);
    elements.pasteTextBtn.addEventListener('click', () => pasteToInput(elements.textToEncode));
    elements.clearTextBtn.addEventListener('click', () => clearInput(elements.textToEncode, elements.encodedOutput));
    elements.copyEncodedBtn.addEventListener('click', () => copyOutput(elements.encodedOutput.value));

    // Decode
    elements.decodeBtn.addEventListener('click', decode);
    elements.pasteBinaryBtn.addEventListener('click', () => pasteToInput(elements.binaryToDecode));
    elements.clearBinaryBtn.addEventListener('click', () => clearInput(elements.binaryToDecode, elements.decodedOutput));
    elements.copyDecodedBtn.addEventListener('click', () => copyOutput(elements.decodedOutput.value));

    // Multi-format
    elements.multiInput.addEventListener('input', ToolsCommon.debounce(updateMultiFormat, 100));
    elements.pasteMultiBtn.addEventListener('click', () => pasteToInput(elements.multiInput));
    elements.clearMultiBtn.addEventListener('click', () => clearInput(elements.multiInput));

    // Copy buttons in multi-format
    document.querySelectorAll('.result-card .copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copy;
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          copyOutput(targetElement.textContent);
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('textarea, input')) {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          const activePanel = document.querySelector('.binary-panel.active');
          if (activePanel.id === 'encodePanel') {
            encode();
          } else if (activePanel.id === 'decodePanel') {
            decode();
          }
        }
        return;
      }

      switch (e.key) {
        case '1':
          switchTab('encode');
          break;
        case '2':
          switchTab('decode');
          break;
        case '3':
          switchTab('multiformat');
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
