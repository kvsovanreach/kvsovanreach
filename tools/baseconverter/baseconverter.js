/**
 * KVSOVANREACH Base Converter Tool
 * Convert numbers between different bases with visualization
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    fromBase: document.getElementById('fromBase'),
    fromValue: document.getElementById('fromValue'),
    toBase: document.getElementById('toBase'),
    toValue: document.getElementById('toValue'),
    validChars: document.getElementById('validChars'),
    swapBtn: document.getElementById('swapBtn'),
    copyBtn: document.getElementById('copyBtn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    binaryValue: document.getElementById('binaryValue'),
    octalValue: document.getElementById('octalValue'),
    decimalValue: document.getElementById('decimalValue'),
    hexValue: document.getElementById('hexValue'),
    stepsSection: document.getElementById('stepsSection'),
    stepsContent: document.getElementById('stepsContent'),
    bitViz: document.getElementById('bitViz'),
    bitContainer: document.getElementById('bitContainer')
  };

  // ==================== Constants ====================
  const DIGITS = '0123456789ABCDEF';

  const BASE_INFO = {
    2: { name: 'Binary', validChars: '0-1' },
    8: { name: 'Octal', validChars: '0-7' },
    10: { name: 'Decimal', validChars: '0-9' },
    16: { name: 'Hexadecimal', validChars: '0-9, A-F' }
  };

  // ==================== Core Functions ====================

  /**
   * Validate input for given base
   */
  function isValidForBase(value, base) {
    if (!value) return true;
    const maxDigit = base - 1;
    const validPattern = base <= 10
      ? new RegExp(`^[0-${maxDigit}]+$`, 'i')
      : new RegExp(`^[0-9A-${DIGITS[base - 1]}]+$`, 'i');
    return validPattern.test(value);
  }

  /**
   * Convert from any base to decimal
   */
  function toDecimal(value, base) {
    if (!value) return 0;
    return parseInt(value, base);
  }

  /**
   * Convert from decimal to any base
   */
  function fromDecimal(decimal, base) {
    if (decimal === 0) return '0';
    return decimal.toString(base).toUpperCase();
  }

  /**
   * Convert between any two bases
   */
  function convert(value, fromBase, toBase) {
    if (!value) return '';
    const decimal = toDecimal(value, fromBase);
    if (isNaN(decimal)) return 'Invalid';
    return fromDecimal(decimal, toBase);
  }

  /**
   * Generate step-by-step conversion explanation
   */
  function generateSteps(value, fromBase, toBase) {
    if (!value) return [];
    const steps = [];
    const decimal = toDecimal(value, fromBase);

    // Step 1: Convert to decimal (if not already)
    if (fromBase !== 10) {
      let explanation = `Convert ${BASE_INFO[fromBase].name} to Decimal:<br>`;
      const digits = value.toUpperCase().split('').reverse();
      const parts = [];

      digits.forEach((d, i) => {
        const digitValue = parseInt(d, fromBase);
        const power = Math.pow(fromBase, i);
        parts.unshift(`${d} × ${fromBase}<sup>${i}</sup> = ${digitValue * power}`);
      });

      explanation += parts.join(' + ') + ` = <code>${decimal}</code>`;
      steps.push(explanation);
    } else {
      steps.push(`Starting value: <code>${value}</code> (Decimal)`);
    }

    // Step 2: Convert from decimal to target (if not decimal)
    if (toBase !== 10) {
      let temp = decimal;
      const divisions = [];

      while (temp > 0) {
        const remainder = temp % toBase;
        const quotient = Math.floor(temp / toBase);
        divisions.push({ dividend: temp, quotient, remainder: DIGITS[remainder] });
        temp = quotient;
      }

      if (divisions.length > 0) {
        let explanation = `Convert Decimal to ${BASE_INFO[toBase].name}:<br>`;
        explanation += '<table class="division-table">';
        divisions.forEach(d => {
          explanation += `<tr><td>${d.dividend} ÷ ${toBase}</td><td>=</td><td>${d.quotient}</td><td>remainder</td><td><code>${d.remainder}</code></td></tr>`;
        });
        explanation += '</table>';
        explanation += `Read remainders bottom-up: <code>${fromDecimal(decimal, toBase)}</code>`;
        steps.push(explanation);
      }
    }

    return steps;
  }

  /**
   * Generate binary bit visualization
   */
  function generateBitViz(decimal) {
    if (!decimal || decimal === 0) return '';

    const binary = decimal.toString(2);
    const bits = binary.split('');

    return bits.map((bit, i) => {
      const power = bits.length - 1 - i;
      return `
        <div class="bit-cell ${bit === '1' ? 'one' : 'zero'}">
          <div class="bit-value">${bit}</div>
          <div class="bit-power">2<sup>${power}</sup></div>
        </div>
      `;
    }).join('');
  }

  // ==================== UI Functions ====================

  function updateValidChars() {
    const base = parseInt(elements.fromBase.value);
    elements.validChars.textContent = `Valid: ${BASE_INFO[base].validChars}`;
  }

  function doConversion() {
    const fromBase = parseInt(elements.fromBase.value);
    const toBase = parseInt(elements.toBase.value);
    const value = elements.fromValue.value.trim().toUpperCase();

    // Validate input
    if (value && !isValidForBase(value, fromBase)) {
      elements.toValue.value = 'Invalid input';
      elements.stepsSection.classList.add('hidden');
      elements.bitViz.classList.add('hidden');
      return;
    }

    if (!value) {
      elements.toValue.value = '';
      elements.binaryValue.textContent = '-';
      elements.octalValue.textContent = '-';
      elements.decimalValue.textContent = '-';
      elements.hexValue.textContent = '-';
      elements.stepsSection.classList.add('hidden');
      elements.bitViz.classList.add('hidden');
      return;
    }

    // Convert
    const result = convert(value, fromBase, toBase);
    elements.toValue.value = result;

    // Update all bases
    const decimal = toDecimal(value, fromBase);
    elements.binaryValue.textContent = fromDecimal(decimal, 2);
    elements.octalValue.textContent = fromDecimal(decimal, 8);
    elements.decimalValue.textContent = decimal.toLocaleString();
    elements.hexValue.textContent = fromDecimal(decimal, 16);

    // Generate steps
    const steps = generateSteps(value, fromBase, toBase);
    if (steps.length > 0) {
      elements.stepsContent.innerHTML = steps.map((step, i) => `
        <div class="step-row">
          <span class="step-num">${i + 1}</span>
          <span class="step-text">${step}</span>
        </div>
      `).join('');
      elements.stepsSection.classList.remove('hidden');
    } else {
      elements.stepsSection.classList.add('hidden');
    }

    // Generate bit visualization (for numbers up to 32 bits)
    if (decimal > 0 && decimal <= 0xFFFFFFFF) {
      elements.bitContainer.innerHTML = generateBitViz(decimal);
      elements.bitViz.classList.remove('hidden');
    } else {
      elements.bitViz.classList.add('hidden');
    }
  }

  function swapBases() {
    const fromBase = elements.fromBase.value;
    const toBase = elements.toBase.value;
    const toValue = elements.toValue.value;

    elements.fromBase.value = toBase;
    elements.toBase.value = fromBase;

    if (toValue && toValue !== 'Invalid input' && toValue !== 'Invalid') {
      elements.fromValue.value = toValue;
    }

    updateValidChars();
    doConversion();
  }

  function copyResult() {
    const result = elements.toValue.value;
    if (result && result !== 'Invalid input' && result !== 'Invalid') {
      ToolsCommon.Clipboard.copy(result);
    }
  }

  function applyPreset(fromBase, toBase) {
    elements.fromBase.value = fromBase;
    elements.toBase.value = toBase;
    updateValidChars();
    doConversion();
  }

  // ==================== Event Handlers ====================

  function handleInput(e) {
    // Allow only valid characters for the current base
    const base = parseInt(elements.fromBase.value);
    const validPattern = base <= 10
      ? new RegExp(`[^0-${base - 1}]`, 'gi')
      : new RegExp(`[^0-9A-${DIGITS[base - 1]}]`, 'gi');

    e.target.value = e.target.value.replace(validPattern, '').toUpperCase();
    doConversion();
  }

  function handleKeydown(e) {
    if (e.key === 's' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      swapBases();
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Event listeners
    elements.fromValue.addEventListener('input', handleInput);
    elements.fromBase.addEventListener('change', () => {
      updateValidChars();
      // Clear input if it contains invalid chars for new base
      const base = parseInt(elements.fromBase.value);
      if (!isValidForBase(elements.fromValue.value, base)) {
        elements.fromValue.value = '';
      }
      doConversion();
    });
    elements.toBase.addEventListener('change', doConversion);
    elements.swapBtn.addEventListener('click', swapBases);
    elements.copyBtn.addEventListener('click', copyResult);

    // Preset buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.from, btn.dataset.to);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Initial state
    updateValidChars();
    elements.fromValue.focus();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
