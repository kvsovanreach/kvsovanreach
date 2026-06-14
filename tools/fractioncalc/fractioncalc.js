/**
 * KVSOVANREACH Fraction Calculator Tool
 * Visual fraction calculator with step-by-step solutions and pie chart
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  var elements = {
    wholeA: document.getElementById('wholeA'),
    numA: document.getElementById('numA'),
    denA: document.getElementById('denA'),
    wholeB: document.getElementById('wholeB'),
    numB: document.getElementById('numB'),
    denB: document.getElementById('denB'),
    calcBtn: document.getElementById('calcBtn'),
    clearBtn: document.getElementById('clearBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    resultsPanel: document.getElementById('resultsPanel'),
    resultDisplay: document.getElementById('resultDisplay'),
    copyResult: document.getElementById('copyResult'),
    conversionsGrid: document.getElementById('conversionsGrid'),
    pieCanvas: document.getElementById('pieCanvas'),
    pieLabel: document.getElementById('pieLabel'),
    stepsContent: document.getElementById('stepsContent'),
    stepsBody: document.getElementById('stepsBody'),
    toggleSteps: document.getElementById('toggleSteps'),
    opBtns: document.querySelectorAll('.op-btn'),
    exampleBtns: document.querySelectorAll('.example-btn')
  };

  // ==================== State ====================
  var currentOp = 'add';
  var stepsVisible = true;
  var lastResult = null;

  // ==================== Math Helpers ====================

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
  }

  function simplify(num, den) {
    if (den === 0) return { num: num, den: den };
    if (num === 0) return { num: 0, den: 1 };
    var sign = (den < 0) ? -1 : 1;
    num *= sign;
    den *= sign;
    var g = gcd(Math.abs(num), den);
    return { num: num / g, den: den / g };
  }

  function toImproper(whole, num, den) {
    whole = parseInt(whole) || 0;
    num = parseInt(num) || 0;
    den = parseInt(den) || 1;
    if (den === 0) return null;
    var sign = (whole < 0) ? -1 : 1;
    var absWhole = Math.abs(whole);
    var improperNum = sign * (absWhole * Math.abs(den) + Math.abs(num));
    if (num < 0 && whole === 0) improperNum = -Math.abs(num);
    return { num: improperNum, den: Math.abs(den) };
  }

  function toMixed(num, den) {
    if (den === 0) return { whole: 0, num: num, den: 1 };
    var s = simplify(num, den);
    num = s.num;
    den = s.den;
    if (Math.abs(num) < den) return { whole: 0, num: num, den: den };
    var sign = num < 0 ? -1 : 1;
    var absNum = Math.abs(num);
    var whole = Math.floor(absNum / den);
    var remainder = absNum % den;
    return { whole: sign * whole, num: remainder, den: den };
  }

  // ==================== Core Operations ====================

  function addFractions(a, b) {
    var lcd = lcm(a.den, b.den);
    var multA = lcd / a.den;
    var multB = lcd / b.den;
    var newNumA = a.num * multA;
    var newNumB = b.num * multB;
    var resultNum = newNumA + newNumB;
    var result = simplify(resultNum, lcd);

    var steps = [];
    steps.push('Convert to improper fractions: <code>' + a.num + '/' + a.den + '</code> and <code>' + b.num + '/' + b.den + '</code>');
    steps.push('Find LCD of ' + a.den + ' and ' + b.den + ': <code>LCD = ' + lcd + '</code>');
    steps.push('Convert fractions: <code>' + a.num + '/' + a.den + ' = ' + newNumA + '/' + lcd + '</code> and <code>' + b.num + '/' + b.den + ' = ' + newNumB + '/' + lcd + '</code>');
    steps.push('Add numerators: <code>' + newNumA + ' + ' + newNumB + ' = ' + resultNum + '</code>');
    steps.push('Result: <code>' + resultNum + '/' + lcd + '</code>');
    if (result.num !== resultNum || result.den !== lcd) {
      var g = gcd(Math.abs(resultNum), lcd);
      steps.push('Simplify using GCD = ' + g + ': <code>' + resultNum + '/' + lcd + ' = ' + result.num + '/' + result.den + '</code>');
    }

    return { num: result.num, den: result.den, steps: steps, gcdUsed: gcd(Math.abs(resultNum), lcd) };
  }

  function subtractFractions(a, b) {
    var lcd = lcm(a.den, b.den);
    var multA = lcd / a.den;
    var multB = lcd / b.den;
    var newNumA = a.num * multA;
    var newNumB = b.num * multB;
    var resultNum = newNumA - newNumB;
    var result = simplify(resultNum, lcd);

    var steps = [];
    steps.push('Convert to improper fractions: <code>' + a.num + '/' + a.den + '</code> and <code>' + b.num + '/' + b.den + '</code>');
    steps.push('Find LCD of ' + a.den + ' and ' + b.den + ': <code>LCD = ' + lcd + '</code>');
    steps.push('Convert fractions: <code>' + a.num + '/' + a.den + ' = ' + newNumA + '/' + lcd + '</code> and <code>' + b.num + '/' + b.den + ' = ' + newNumB + '/' + lcd + '</code>');
    steps.push('Subtract numerators: <code>' + newNumA + ' - ' + newNumB + ' = ' + resultNum + '</code>');
    steps.push('Result: <code>' + resultNum + '/' + lcd + '</code>');
    if (result.num !== resultNum || result.den !== lcd) {
      var g = gcd(Math.abs(resultNum), lcd);
      steps.push('Simplify using GCD = ' + g + ': <code>' + resultNum + '/' + lcd + ' = ' + result.num + '/' + result.den + '</code>');
    }

    return { num: result.num, den: result.den, steps: steps, gcdUsed: gcd(Math.abs(resultNum), lcd) };
  }

  function multiplyFractions(a, b) {
    var resultNum = a.num * b.num;
    var resultDen = a.den * b.den;
    var result = simplify(resultNum, resultDen);

    var steps = [];
    steps.push('Convert to improper fractions: <code>' + a.num + '/' + a.den + '</code> and <code>' + b.num + '/' + b.den + '</code>');
    steps.push('Multiply numerators: <code>' + a.num + ' x ' + b.num + ' = ' + resultNum + '</code>');
    steps.push('Multiply denominators: <code>' + a.den + ' x ' + b.den + ' = ' + resultDen + '</code>');
    steps.push('Result: <code>' + resultNum + '/' + resultDen + '</code>');
    if (result.num !== resultNum || result.den !== resultDen) {
      var g = gcd(Math.abs(resultNum), resultDen);
      steps.push('Simplify using GCD = ' + g + ': <code>' + resultNum + '/' + resultDen + ' = ' + result.num + '/' + result.den + '</code>');
    }

    return { num: result.num, den: result.den, steps: steps, gcdUsed: gcd(Math.abs(resultNum), resultDen) };
  }

  function divideFractions(a, b) {
    if (b.num === 0) return null;
    var resultNum = a.num * b.den;
    var resultDen = a.den * b.num;
    if (resultDen < 0) {
      resultNum = -resultNum;
      resultDen = -resultDen;
    }
    var result = simplify(resultNum, resultDen);

    var steps = [];
    steps.push('Convert to improper fractions: <code>' + a.num + '/' + a.den + '</code> and <code>' + b.num + '/' + b.den + '</code>');
    steps.push('Take reciprocal of second fraction: <code>' + b.num + '/' + b.den + ' → ' + b.den + '/' + b.num + '</code>');
    steps.push('Multiply: <code>' + a.num + '/' + a.den + ' x ' + b.den + '/' + b.num + '</code>');
    steps.push('Numerators: <code>' + a.num + ' x ' + b.den + ' = ' + resultNum + '</code>');
    steps.push('Denominators: <code>' + a.den + ' x ' + b.num + ' = ' + resultDen + '</code>');
    steps.push('Result: <code>' + resultNum + '/' + resultDen + '</code>');
    if (result.num !== resultNum || result.den !== resultDen) {
      var g = gcd(Math.abs(resultNum), resultDen);
      steps.push('Simplify using GCD = ' + g + ': <code>' + resultNum + '/' + resultDen + ' = ' + result.num + '/' + result.den + '</code>');
    }

    return { num: result.num, den: result.den, steps: steps, gcdUsed: gcd(Math.abs(resultNum), resultDen) };
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

  function renderResultFraction(num, den) {
    var s = simplify(num, den);
    var mixed = toMixed(s.num, s.den);
    var html = '';

    if (mixed.num === 0) {
      // Whole number
      html = '<span class="result-whole">' + (mixed.whole || 0) + '</span>';
    } else if (mixed.whole !== 0) {
      // Mixed number
      html = '<span class="result-whole">' + mixed.whole + '</span>';
      html += '<span class="result-frac">';
      html += '<span class="result-num">' + mixed.num + '</span>';
      html += '<span class="result-bar"></span>';
      html += '<span class="result-den">' + mixed.den + '</span>';
      html += '</span>';
    } else {
      // Simple fraction
      html = '<span class="result-frac">';
      html += '<span class="result-num">' + s.num + '</span>';
      html += '<span class="result-bar"></span>';
      html += '<span class="result-den">' + s.den + '</span>';
      html += '</span>';
    }

    elements.resultDisplay.innerHTML = html;
  }

  function renderConversions(num, den) {
    var s = simplify(num, den);
    var mixed = toMixed(s.num, s.den);
    var decimal = s.num / s.den;
    var percentage = decimal * 100;

    var fractionStr = s.num + '/' + s.den;
    var mixedStr;
    if (mixed.num === 0) {
      mixedStr = '' + (mixed.whole || 0);
    } else if (mixed.whole !== 0) {
      mixedStr = mixed.whole + ' ' + mixed.num + '/' + mixed.den;
    } else {
      mixedStr = fractionStr;
    }

    var decimalStr = parseFloat(decimal.toFixed(10)).toString();
    var percentStr = parseFloat(percentage.toFixed(8)) + '%';
    var gcdVal = gcd(Math.abs(s.num), s.den);

    var items = [
      { label: 'Fraction', value: fractionStr },
      { label: 'Mixed', value: mixedStr },
      { label: 'Decimal', value: decimalStr },
      { label: 'Percentage', value: percentStr }
    ];

    var html = '';
    items.forEach(function(item) {
      html += '<div class="conversion-item">';
      html += '<div><div class="conversion-label">' + item.label + '</div>';
      html += '<div class="conversion-value">' + item.value + '</div></div>';
      html += '<button type="button" class="conversion-copy" data-value="' + item.value + '" title="Copy ' + item.label.toLowerCase() + '">';
      html += '<i class="fa-solid fa-copy"></i></button>';
      html += '</div>';
    });

    elements.conversionsGrid.innerHTML = html;

    // Attach copy listeners
    elements.conversionsGrid.querySelectorAll('.conversion-copy').forEach(function(btn) {
      btn.addEventListener('click', function() {
        ToolsCommon.copyWithToast(btn.getAttribute('data-value'), 'Copied!');
      });
    });
  }

  function drawPieChart(num, den) {
    var canvas = elements.pieCanvas;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 280;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 20;

    // Clear
    ctx.clearRect(0, 0, size, size);

    var s = simplify(num, den);
    var fraction = Math.abs(s.num) / s.den;
    var negative = s.num < 0;

    // Clamp for display
    var displayFraction = Math.min(fraction, 1);

    // Background circle
    var style = getComputedStyle(document.documentElement);
    var borderColor = style.getPropertyValue('--color-border').trim() || '#ddd';
    var primaryColor = style.getPropertyValue('--color-primary').trim() || '#91214E';
    var bgSecondary = style.getPropertyValue('--color-bg-secondary').trim() || '#f5f5f5';

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = bgSecondary;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Filled portion
    if (displayFraction > 0) {
      var startAngle = -Math.PI / 2;
      var endAngle = startAngle + displayFraction * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = negative ?
        (style.getPropertyValue('--color-error').trim() || '#e74c3c') :
        primaryColor;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Center text
    var textColor = style.getPropertyValue('--color-text').trim() || '#333';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (fraction > 1) {
      ctx.fillText((negative ? '-' : '') + s.num + '/' + s.den, cx, cy - 10);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = style.getPropertyValue('--color-text-muted').trim() || '#999';
      ctx.fillText('(' + (fraction * 100).toFixed(1) + '% shown capped)', cx, cy + 14);
    }

    // Label
    elements.pieLabel.textContent = (negative ? '-' : '') + s.num + '/' + s.den + ' = ' + (fraction * 100).toFixed(2) + '%';
  }

  function renderSteps(steps) {
    var html = '';
    steps.forEach(function(step, i) {
      html += '<div class="step-row">';
      html += '<div class="step-num">' + (i + 1) + '</div>';
      html += '<div class="step-text">' + step + '</div>';
      html += '</div>';
    });
    elements.stepsContent.innerHTML = html;
  }

  // ==================== Calculate ====================

  function calculate() {
    hideError();

    var fracA = toImproper(elements.wholeA.value, elements.numA.value, elements.denA.value);
    var fracB = toImproper(elements.wholeB.value, elements.numB.value, elements.denB.value);

    if (!fracA || fracA.den === 0) {
      showError('Denominator A cannot be zero.');
      return;
    }
    if (!fracB || fracB.den === 0) {
      showError('Denominator B cannot be zero.');
      return;
    }

    var result;
    switch (currentOp) {
      case 'add':
        result = addFractions(fracA, fracB);
        break;
      case 'subtract':
        result = subtractFractions(fracA, fracB);
        break;
      case 'multiply':
        result = multiplyFractions(fracA, fracB);
        break;
      case 'divide':
        result = divideFractions(fracA, fracB);
        break;
    }

    if (!result) {
      showError('Cannot divide by zero.');
      return;
    }

    lastResult = simplify(result.num, result.den);

    // Render result
    renderResultFraction(result.num, result.den);
    renderConversions(result.num, result.den);
    drawPieChart(result.num, result.den);
    renderSteps(result.steps);

    elements.resultsPanel.classList.remove('hidden');
  }

  // ==================== Clear ====================

  function clearAll() {
    elements.wholeA.value = '';
    elements.numA.value = '';
    elements.denA.value = '';
    elements.wholeB.value = '';
    elements.numB.value = '';
    elements.denB.value = '';
    hideError();
    elements.resultsPanel.classList.add('hidden');
    lastResult = null;
    elements.wholeA.focus();
  }

  // ==================== Event Listeners ====================

  elements.calcBtn.addEventListener('click', calculate);
  elements.clearBtn.addEventListener('click', clearAll);

  // Operation buttons
  elements.opBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      elements.opBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentOp = btn.getAttribute('data-op');
    });
  });

  // Copy result
  elements.copyResult.addEventListener('click', function() {
    if (!lastResult) return;
    var text = lastResult.num + '/' + lastResult.den;
    ToolsCommon.copyWithToast(text, 'Copied!');
  });

  // Toggle steps
  elements.toggleSteps.addEventListener('click', function() {
    stepsVisible = !stepsVisible;
    elements.stepsBody.style.display = stepsVisible ? '' : 'none';
    elements.toggleSteps.querySelector('i').className = stepsVisible ?
      'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
  });

  // Example buttons
  elements.exampleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      elements.wholeA.value = btn.getAttribute('data-wa') || '';
      elements.numA.value = btn.getAttribute('data-na') || '';
      elements.denA.value = btn.getAttribute('data-da') || '';
      elements.wholeB.value = btn.getAttribute('data-wb') || '';
      elements.numB.value = btn.getAttribute('data-nb') || '';
      elements.denB.value = btn.getAttribute('data-db') || '';

      var op = btn.getAttribute('data-op');
      elements.opBtns.forEach(function(b) { b.classList.remove('active'); });
      document.querySelector('.op-btn[data-op="' + op + '"]').classList.add('active');
      currentOp = op;

      calculate();
    });
  });

  // Keyboard shortcut: Enter to calculate
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input') {
        e.preventDefault();
        calculate();
      }
    }
  });

})();
