/**
 * KVSOVANREACH Scientific Notation Converter Tool
 * Convert between standard, scientific, and engineering notation
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  var elements = {
    numberInput: document.getElementById('numberInput'),
    sigFigs: document.getElementById('sigFigs'),
    sfMinus: document.getElementById('sfMinus'),
    sfPlus: document.getElementById('sfPlus'),
    convertBtn: document.getElementById('convertBtn'),
    clearBtn: document.getElementById('clearBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    resultsPanel: document.getElementById('resultsPanel'),
    sciValue: document.getElementById('sciValue'),
    engValue: document.getElementById('engValue'),
    stdValue: document.getElementById('stdValue'),
    eValue: document.getElementById('eValue'),
    copySci: document.getElementById('copySci'),
    copyEng: document.getElementById('copyEng'),
    copyStd: document.getElementById('copyStd'),
    copyE: document.getElementById('copyE'),
    detailsGrid: document.getElementById('detailsGrid'),
    convertPanel: document.getElementById('convertPanel'),
    comparePanel: document.getElementById('comparePanel'),
    compareA: document.getElementById('compareA'),
    compareB: document.getElementById('compareB'),
    compareBtn: document.getElementById('compareBtn'),
    compareError: document.getElementById('compareError'),
    compareErrorText: document.getElementById('compareErrorText'),
    compareResults: document.getElementById('compareResults'),
    compSciA: document.getElementById('compSciA'),
    compStdA: document.getElementById('compStdA'),
    compSciB: document.getElementById('compSciB'),
    compStdB: document.getElementById('compStdB'),
    compareSummary: document.getElementById('compareSummary'),
    modeTabs: document.querySelectorAll('.mode-tab'),
    notationBtns: document.querySelectorAll('.notation-btn'),
    exampleBtns: document.querySelectorAll('.example-btn')
  };

  // ==================== State ====================
  var currentMode = 'convert';
  var currentNotation = 'scientific';
  var lastConversion = null;

  // ==================== Parsing ====================

  function parseNumber(str) {
    str = str.trim().replace(/,/g, '').replace(/\s/g, '');
    if (str === '') return NaN;

    // Handle e-notation variants: 3.0e8, 3.0E8, 3.0x10^8, 3.0*10^8
    str = str.replace(/[xX\*]\s*10\s*\^\s*/g, 'e');
    str = str.replace(/[xX\*]\s*10\s*\*\*\s*/g, 'e');

    var num = Number(str);
    if (isNaN(num) || !isFinite(num)) return NaN;
    return num;
  }

  // ==================== Conversion Functions ====================

  function toScientific(num, sf) {
    if (num === 0) return { coefficient: 0, exponent: 0 };
    var absNum = Math.abs(num);
    var exp = Math.floor(Math.log10(absNum));
    var coeff = num / Math.pow(10, exp);
    // Round to significant figures
    coeff = parseFloat(coeff.toPrecision(sf));
    // Handle rounding edge case (e.g., 9.9999... -> 10.0)
    if (Math.abs(coeff) >= 10) {
      coeff /= 10;
      exp += 1;
    }
    return { coefficient: coeff, exponent: exp };
  }

  function toEngineering(num, sf) {
    if (num === 0) return { coefficient: 0, exponent: 0 };
    var absNum = Math.abs(num);
    var exp = Math.floor(Math.log10(absNum));
    // Adjust exponent to nearest lower multiple of 3
    var engExp = exp - ((exp % 3) + 3) % 3;
    var coeff = num / Math.pow(10, engExp);
    coeff = parseFloat(coeff.toPrecision(sf));
    // Handle rounding edge case
    if (Math.abs(coeff) >= 1000) {
      coeff /= 1000;
      engExp += 3;
    }
    return { coefficient: coeff, exponent: engExp };
  }

  function formatSuperscript(coeff, exp) {
    var sign = exp < 0 ? '\u207B' : '';
    var absExp = Math.abs(exp);
    var superDigits = {
      '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
      '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
      '8': '\u2078', '9': '\u2079'
    };
    var supStr = sign + String(absExp).split('').map(function(d) {
      return superDigits[d] || d;
    }).join('');

    return coeff + ' \u00D7 10' + supStr;
  }

  function formatSuperscriptHTML(coeff, exp) {
    return coeff + ' &times; 10<sup>' + exp + '</sup>';
  }

  function toStandardForm(num, sf) {
    if (num === 0) return '0';
    // For very large or very small numbers, use toPrecision
    var str = parseFloat(num.toPrecision(sf));
    // Format with commas for readability if it's a reasonable size
    if (Math.abs(num) >= 1 && Math.abs(num) < 1e15) {
      var parts = String(str).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return String(str);
  }

  function countSigFigs(num) {
    if (num === 0) return 1;
    var str = Math.abs(num).toExponential();
    var coeff = str.split('e')[0];
    // Remove trailing zeros after decimal and the decimal point
    coeff = coeff.replace(/\.?0+$/, '');
    return coeff.replace('.', '').length;
  }

  function getOrderOfMagnitude(num) {
    if (num === 0) return 0;
    return Math.floor(Math.log10(Math.abs(num)));
  }

  // ==================== SI Prefix ====================

  var siPrefixes = {
    '-24': 'yocto (y)', '-21': 'zepto (z)', '-18': 'atto (a)',
    '-15': 'femto (f)', '-12': 'pico (p)', '-9': 'nano (n)',
    '-6': 'micro (\u03BC)', '-3': 'milli (m)', '0': '-',
    '3': 'kilo (k)', '6': 'mega (M)', '9': 'giga (G)',
    '12': 'tera (T)', '15': 'peta (P)', '18': 'exa (E)',
    '21': 'zetta (Z)', '24': 'yotta (Y)'
  };

  function getSIPrefix(exp) {
    // Round to nearest lower multiple of 3
    var engExp = exp - ((exp % 3) + 3) % 3;
    return siPrefixes[String(engExp)] || '';
  }

  // ==================== Display ====================

  function showError(msg) {
    elements.errorText.textContent = msg;
    elements.errorMessage.classList.remove('hidden');
    elements.resultsPanel.classList.add('hidden');
  }

  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  function showCompareError(msg) {
    elements.compareErrorText.textContent = msg;
    elements.compareError.classList.remove('hidden');
    elements.compareResults.classList.add('hidden');
  }

  function hideCompareError() {
    elements.compareError.classList.add('hidden');
  }

  function convert() {
    hideError();

    var input = elements.numberInput.value;
    var num = parseNumber(input);
    var sf = parseInt(elements.sigFigs.value) || 4;
    sf = Math.max(1, Math.min(10, sf));

    if (isNaN(num)) {
      showError('Please enter a valid number.');
      return;
    }

    var sci = toScientific(num, sf);
    var eng = toEngineering(num, sf);

    // Scientific notation display
    var sciStr = sci.coefficient + ' \u00D7 10^' + sci.exponent;
    var sciHTML = formatSuperscriptHTML(sci.coefficient, sci.exponent);
    var sciCopy = sci.coefficient + 'e' + sci.exponent;
    if (num === 0) {
      sciHTML = '0';
      sciCopy = '0';
    }

    // Engineering notation display
    var engHTML = formatSuperscriptHTML(eng.coefficient, eng.exponent);
    var engCopy = eng.coefficient + 'e' + eng.exponent;
    if (num === 0) {
      engHTML = '0';
      engCopy = '0';
    }

    // Standard form
    var stdStr = toStandardForm(num, sf);

    // E-notation
    var eStr = num === 0 ? '0' : sci.coefficient + 'e' + sci.exponent;

    elements.sciValue.innerHTML = num === 0 ? '0' : sciHTML;
    elements.engValue.innerHTML = num === 0 ? '0' : engHTML;
    elements.stdValue.textContent = stdStr;
    elements.eValue.textContent = eStr;

    // Store for copy
    lastConversion = {
      sci: num === 0 ? '0' : formatSuperscript(sci.coefficient, sci.exponent),
      eng: num === 0 ? '0' : formatSuperscript(eng.coefficient, eng.exponent),
      std: stdStr,
      e: eStr
    };

    // Details
    var order = getOrderOfMagnitude(num);
    var siPrefix = getSIPrefix(order);
    var isNeg = num < 0;

    var detailsHTML = '';
    detailsHTML += renderDetailRow('Coefficient', num === 0 ? '0' : String(sci.coefficient));
    detailsHTML += renderDetailRow('Exponent', num === 0 ? '0' : String(sci.exponent));
    detailsHTML += renderDetailRow('Order of Magnitude', String(order));
    detailsHTML += renderDetailRow('Significant Figures', String(sf));
    detailsHTML += renderDetailRow('Sign', isNeg ? 'Negative' : 'Positive');
    if (siPrefix && siPrefix !== '-') {
      detailsHTML += renderDetailRow('SI Prefix', siPrefix);
    }

    elements.detailsGrid.innerHTML = detailsHTML;
    elements.resultsPanel.classList.remove('hidden');
  }

  function renderDetailRow(label, value) {
    return '<div class="detail-row">' +
      '<span class="detail-label">' + label + '</span>' +
      '<span class="detail-value">' + value + '</span>' +
      '</div>';
  }

  function compare() {
    hideCompareError();

    var numA = parseNumber(elements.compareA.value);
    var numB = parseNumber(elements.compareB.value);
    var sf = parseInt(elements.sigFigs.value) || 4;

    if (isNaN(numA)) {
      showCompareError('Number A is not a valid number.');
      return;
    }
    if (isNaN(numB)) {
      showCompareError('Number B is not a valid number.');
      return;
    }

    var sciA = toScientific(numA, sf);
    var sciB = toScientific(numB, sf);

    elements.compSciA.innerHTML = numA === 0 ? '0' : formatSuperscriptHTML(sciA.coefficient, sciA.exponent);
    elements.compStdA.textContent = toStandardForm(numA, sf);

    elements.compSciB.innerHTML = numB === 0 ? '0' : formatSuperscriptHTML(sciB.coefficient, sciB.exponent);
    elements.compStdB.textContent = toStandardForm(numB, sf);

    // Comparison
    var orderA = numA === 0 ? 0 : getOrderOfMagnitude(numA);
    var orderB = numB === 0 ? 0 : getOrderOfMagnitude(numB);
    var diff = Math.abs(orderA - orderB);

    var summaryHTML = '<div class="summary-text">';
    if (diff === 0) {
      summaryHTML += 'Both numbers are of the <strong>same order of magnitude</strong> (10<sup>' + orderA + '</sup>).';
    } else {
      var larger = Math.abs(numA) >= Math.abs(numB) ? 'A' : 'B';
      summaryHTML += 'Number <strong>' + larger + '</strong> is approximately ';
      summaryHTML += '<span class="magnitude-diff">10<sup>' + diff + '</sup></span>';
      summaryHTML += ' (' + Math.pow(10, diff).toLocaleString() + 'x) times ';
      summaryHTML += 'larger in magnitude.';
    }
    summaryHTML += '</div>';

    elements.compareSummary.innerHTML = summaryHTML;
    elements.compareResults.classList.remove('hidden');
  }

  function clearAll() {
    elements.numberInput.value = '';
    elements.compareA.value = '';
    elements.compareB.value = '';
    hideError();
    hideCompareError();
    elements.resultsPanel.classList.add('hidden');
    elements.compareResults.classList.add('hidden');
    lastConversion = null;
    if (currentMode === 'convert') {
      elements.numberInput.focus();
    } else {
      elements.compareA.focus();
    }
  }

  // ==================== Event Listeners ====================

  elements.convertBtn.addEventListener('click', convert);
  elements.clearBtn.addEventListener('click', clearAll);
  elements.compareBtn.addEventListener('click', compare);

  // Mode tabs
  elements.modeTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      elements.modeTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentMode = tab.getAttribute('data-mode');

      if (currentMode === 'convert') {
        elements.convertPanel.classList.remove('hidden');
        elements.comparePanel.classList.add('hidden');
      } else {
        elements.convertPanel.classList.add('hidden');
        elements.comparePanel.classList.remove('hidden');
      }
    });
  });

  // Notation toggle
  elements.notationBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      elements.notationBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentNotation = btn.getAttribute('data-notation');
    });
  });

  // Significant figures controls
  elements.sfMinus.addEventListener('click', function() {
    var val = parseInt(elements.sigFigs.value) || 4;
    if (val > 1) {
      elements.sigFigs.value = val - 1;
      if (lastConversion) convert();
    }
  });

  elements.sfPlus.addEventListener('click', function() {
    var val = parseInt(elements.sigFigs.value) || 4;
    if (val < 10) {
      elements.sigFigs.value = val + 1;
      if (lastConversion) convert();
    }
  });

  elements.sigFigs.addEventListener('change', function() {
    var val = parseInt(elements.sigFigs.value) || 4;
    val = Math.max(1, Math.min(10, val));
    elements.sigFigs.value = val;
    if (lastConversion) convert();
  });

  // Copy buttons
  elements.copySci.addEventListener('click', function() {
    if (lastConversion) ToolsCommon.copyWithToast(lastConversion.sci, 'Copied!');
  });

  elements.copyEng.addEventListener('click', function() {
    if (lastConversion) ToolsCommon.copyWithToast(lastConversion.eng, 'Copied!');
  });

  elements.copyStd.addEventListener('click', function() {
    if (lastConversion) ToolsCommon.copyWithToast(lastConversion.std, 'Copied!');
  });

  elements.copyE.addEventListener('click', function() {
    if (lastConversion) ToolsCommon.copyWithToast(lastConversion.e, 'Copied!');
  });

  // Example buttons
  elements.exampleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = btn.getAttribute('data-value');
      if (currentMode === 'convert') {
        elements.numberInput.value = val;
        convert();
      } else {
        // In compare mode, fill whichever is empty, or A
        if (!elements.compareA.value) {
          elements.compareA.value = val;
        } else if (!elements.compareB.value) {
          elements.compareB.value = val;
        } else {
          elements.compareA.value = val;
        }
      }
    });
  });

  // Keyboard: Enter to convert/compare
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input') {
        e.preventDefault();
        if (currentMode === 'convert') {
          convert();
        } else {
          compare();
        }
      }
    }
  });

})();
