/**
 * KVSOVANREACH Roman Numeral Converter Tool
 * Bi-directional Arabic/Roman numeral conversion
 */

(function() {
  'use strict';

  // ==================== Conversion Maps ====================
  const ROMAN_MAP = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  const ROMAN_VALUES = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50,
    'C': 100, 'D': 500, 'M': 1000
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputValue: document.getElementById('inputValue'),
    inputHint: document.getElementById('inputHint'),
    arabicValue: document.getElementById('arabicValue'),
    romanValue: document.getElementById('romanValue'),
    arabicCard: document.getElementById('arabicCard'),
    romanCard: document.getElementById('romanCard'),
    copyArabicBtn: document.getElementById('copyArabicBtn'),
    copyRomanBtn: document.getElementById('copyRomanBtn')
  };

  // ==================== Core Functions ====================

  function toRoman(num) {
    if (num < 1 || num > 3999) return null;

    let result = '';
    let remaining = num;

    for (const { value, numeral } of ROMAN_MAP) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }

    return result;
  }

  function toArabic(roman) {
    const upper = roman.toUpperCase();

    // Validate Roman numeral
    if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(upper)) {
      return null;
    }

    let result = 0;
    let prevValue = 0;

    for (let i = upper.length - 1; i >= 0; i--) {
      const value = ROMAN_VALUES[upper[i]];
      if (value < prevValue) {
        result -= value;
      } else {
        result += value;
      }
      prevValue = value;
    }

    return result;
  }

  function isRomanNumeral(str) {
    return /^[IVXLCDM]+$/i.test(str);
  }

  function isArabicNumeral(str) {
    return /^\d+$/.test(str);
  }

  function convert() {
    const input = elements.inputValue.value.trim();

    if (!input) {
      elements.arabicValue.textContent = '—';
      elements.romanValue.textContent = '—';
      elements.inputHint.textContent = 'Type a number (1-3999) or Roman numeral';
      elements.inputHint.classList.remove('error');
      elements.arabicCard.classList.remove('active');
      elements.romanCard.classList.remove('active');
      return;
    }

    if (isArabicNumeral(input)) {
      const num = parseInt(input, 10);

      if (num < 1 || num > 3999) {
        elements.inputHint.textContent = 'Number must be between 1 and 3999';
        elements.inputHint.classList.add('error');
        elements.arabicValue.textContent = input;
        elements.romanValue.textContent = '—';
        return;
      }

      const roman = toRoman(num);
      elements.arabicValue.textContent = num.toLocaleString();
      elements.romanValue.textContent = roman;
      elements.inputHint.textContent = 'Detected: Arabic number';
      elements.inputHint.classList.remove('error');
      elements.arabicCard.classList.add('active');
      elements.romanCard.classList.remove('active');

    } else if (isRomanNumeral(input)) {
      const arabic = toArabic(input);

      if (arabic === null) {
        elements.inputHint.textContent = 'Invalid Roman numeral';
        elements.inputHint.classList.add('error');
        elements.romanValue.textContent = input.toUpperCase();
        elements.arabicValue.textContent = '—';
        return;
      }

      elements.arabicValue.textContent = arabic.toLocaleString();
      elements.romanValue.textContent = input.toUpperCase();
      elements.inputHint.textContent = 'Detected: Roman numeral';
      elements.inputHint.classList.remove('error');
      elements.romanCard.classList.add('active');
      elements.arabicCard.classList.remove('active');

    } else {
      elements.inputHint.textContent = 'Enter a valid number or Roman numeral';
      elements.inputHint.classList.add('error');
      elements.arabicValue.textContent = '—';
      elements.romanValue.textContent = '—';
    }
  }

  async function copyArabic() {
    const value = elements.arabicValue.textContent;
    if (value === '—') {
      ToolsCommon.Toast.show('Nothing to copy', 'error');
      return;
    }
    await ToolsCommon.Clipboard.copyWithToast(value.replace(/,/g, ''), 'Arabic number copied!');
  }

  async function copyRoman() {
    const value = elements.romanValue.textContent;
    if (value === '—') {
      ToolsCommon.Toast.show('Nothing to copy', 'error');
      return;
    }
    await ToolsCommon.Clipboard.copyWithToast(value, 'Roman numeral copied!');
  }

  // ==================== Initialization ====================

  function init() {
    elements.inputValue?.addEventListener('input', convert);
    elements.copyArabicBtn?.addEventListener('click', copyArabic);
    elements.copyRomanBtn?.addEventListener('click', copyRoman);
    convert();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
