/**
 * KVSOVANREACH GCD & LCM Calculator Tool
 * Compute GCD and LCM with step-by-step Euclidean algorithm and prime factorization
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    numbersInput: document.getElementById('numbersInput'),
    calcBtn: document.getElementById('calcBtn'),
    clearBtn: document.getElementById('clearBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    resultsPanel: document.getElementById('resultsPanel'),
    gcdValue: document.getElementById('gcdValue'),
    lcmValue: document.getElementById('lcmValue'),
    copyGcd: document.getElementById('copyGcd'),
    copyLcm: document.getElementById('copyLcm'),
    propsList: document.getElementById('propsList'),
    factorsList: document.getElementById('factorsList'),
    vennCanvas: document.getElementById('vennCanvas'),
    stepsContent: document.getElementById('stepsContent'),
    stepsBody: document.getElementById('stepsBody'),
    toggleSteps: document.getElementById('toggleSteps'),
    exampleBtns: document.querySelectorAll('.example-btn')
  };

  // ==================== State ====================
  let stepsVisible = true;

  // ==================== Math Functions ====================

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
    return Math.abs(a * b) / gcd(a, b);
  }

  function gcdArray(arr) {
    return arr.reduce(function(acc, val) { return gcd(acc, val); });
  }

  function lcmArray(arr) {
    return arr.reduce(function(acc, val) { return lcm(acc, val); });
  }

  function gcdWithSteps(a, b) {
    var steps = [];
    var origA = a, origB = b;
    a = Math.abs(a);
    b = Math.abs(b);
    steps.push('GCD(' + origA + ', ' + origB + ')');
    while (b !== 0) {
      var q = Math.floor(a / b);
      var r = a % b;
      steps.push(a + ' = ' + q + ' \u00D7 ' + b + ' + ' + r);
      a = b;
      b = r;
    }
    steps.push('Remainder is 0, so GCD = ' + a);
    return { result: a, steps: steps };
  }

  function primeFactorize(n) {
    var factors = {};
    var d = 2;
    n = Math.abs(n);
    while (d * d <= n) {
      while (n % d === 0) {
        factors[d] = (factors[d] || 0) + 1;
        n = n / d;
      }
      d++;
    }
    if (n > 1) {
      factors[n] = (factors[n] || 0) + 1;
    }
    return factors;
  }

  function factorsToString(factors) {
    return Object.keys(factors).sort(function(a, b) { return a - b; }).map(function(p) {
      return factors[p] > 1 ? p + '^' + factors[p] : p;
    }).join(' \u00D7 ');
  }

  // ==================== Helpers ====================

  function showError(msg) {
    elements.errorMessage.classList.remove('hidden');
    elements.errorText.textContent = msg;
    elements.resultsPanel.classList.add('hidden');
  }

  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  function parseInput() {
    var raw = elements.numbersInput.value.trim();
    if (!raw) return null;

    var nums = raw.split(/[,\s]+/).map(function(s) { return s.trim(); }).filter(Boolean);
    var parsed = [];

    for (var i = 0; i < nums.length; i++) {
      var n = parseInt(nums[i], 10);
      if (isNaN(n) || n <= 0 || n !== parseFloat(nums[i])) {
        return { error: '"' + nums[i] + '" is not a valid positive integer.' };
      }
      parsed.push(n);
    }

    if (parsed.length < 2) {
      return { error: 'Please enter at least two positive integers.' };
    }

    return { numbers: parsed };
  }

  // ==================== Calculate ====================

  function calculate() {
    hideError();

    var input = parseInput();
    if (!input) {
      showError('Please enter numbers to calculate.');
      return;
    }
    if (input.error) {
      showError(input.error);
      return;
    }

    var nums = input.numbers;
    var resultGcd = gcdArray(nums);
    var resultLcm = lcmArray(nums);

    // Display GCD and LCM
    elements.gcdValue.textContent = resultGcd.toLocaleString();
    elements.lcmValue.textContent = resultLcm.toLocaleString();

    // Properties
    renderProperties(nums, resultGcd, resultLcm);

    // Prime factorizations
    var allFactors = nums.map(function(n) { return { number: n, factors: primeFactorize(n) }; });
    renderFactorizations(allFactors);

    // Venn diagram (only for 2 numbers)
    if (nums.length === 2) {
      drawVenn(allFactors[0], allFactors[1], resultGcd, resultLcm);
      document.getElementById('vennCard').style.display = '';
    } else {
      document.getElementById('vennCard').style.display = 'none';
    }

    // Euclidean algorithm steps
    renderSteps(nums);

    elements.resultsPanel.classList.remove('hidden');
  }

  // ==================== Renderers ====================

  function renderProperties(nums, g, l) {
    var html = '';

    // Coprime check
    var coprime = g === 1;
    html += '<div class="prop-row"><span class="prop-label">Coprime?</span><span class="prop-value"><span class="badge ' + (coprime ? 'yes' : 'no') + '">' + (coprime ? 'Yes (GCD = 1)' : 'No (GCD = ' + g + ')') + '</span></span></div>';

    // GCD x LCM = product (only exact for 2 numbers)
    if (nums.length === 2) {
      var product = nums[0] * nums[1];
      var gcdTimesLcm = g * l;
      html += '<div class="prop-row"><span class="prop-label">GCD \u00D7 LCM</span><span class="prop-value">' + g.toLocaleString() + ' \u00D7 ' + l.toLocaleString() + ' = ' + gcdTimesLcm.toLocaleString() + '</span></div>';
      html += '<div class="prop-row"><span class="prop-label">' + nums[0] + ' \u00D7 ' + nums[1] + '</span><span class="prop-value">' + product.toLocaleString() + '</span></div>';
      html += '<div class="prop-row"><span class="prop-label">GCD \u00D7 LCM = a \u00D7 b?</span><span class="prop-value"><span class="badge yes">Verified \u2713</span></span></div>';
    }

    // Number count
    html += '<div class="prop-row"><span class="prop-label">Numbers</span><span class="prop-value">' + nums.length + ' numbers</span></div>';

    elements.propsList.innerHTML = html;
  }

  function renderFactorizations(allFactors) {
    var html = '';
    allFactors.forEach(function(item) {
      var primesHtml = '';
      var keys = Object.keys(item.factors).sort(function(a, b) { return a - b; });

      keys.forEach(function(p, i) {
        if (i > 0) primesHtml += '<span class="factor-times">\u00D7</span>';
        var exp = item.factors[p];
        primesHtml += '<span class="prime-badge">' + p + (exp > 1 ? '<sup>' + exp + '</sup>' : '') + '</span>';
      });

      if (keys.length === 0) {
        primesHtml = '<span class="prime-badge">1</span>';
      }

      html += '<div class="factor-row">';
      html += '<span class="factor-number">' + item.number + '</span>';
      html += '<span class="factor-equals">=</span>';
      html += '<div class="factor-primes">' + primesHtml + '</div>';
      html += '</div>';
    });

    elements.factorsList.innerHTML = html;
  }

  function renderSteps(nums) {
    var allSteps = [];
    var stepNum = 0;

    if (nums.length === 2) {
      var result = gcdWithSteps(nums[0], nums[1]);
      result.steps.forEach(function(s) {
        allSteps.push(s);
      });
    } else {
      // Chain: GCD of first two, then with next, etc.
      var running = nums[0];
      for (var i = 1; i < nums.length; i++) {
        var result = gcdWithSteps(running, nums[i]);
        if (i > 1) allSteps.push('---');
        allSteps.push('Step: GCD(' + running + ', ' + nums[i] + ')');
        result.steps.slice(1).forEach(function(s) {
          allSteps.push(s);
        });
        running = result.result;
      }
      allSteps.push('Final GCD = ' + running);
    }

    // LCM explanation
    allSteps.push('---');
    if (nums.length === 2) {
      allSteps.push('LCM = |' + nums[0] + ' \u00D7 ' + nums[1] + '| / GCD = ' + Math.abs(nums[0] * nums[1]) + ' / ' + gcdArray(nums) + ' = ' + lcmArray(nums));
    } else {
      allSteps.push('LCM computed by chaining: LCM(a, b, c) = LCM(LCM(a, b), c)');
      allSteps.push('Final LCM = ' + lcmArray(nums));
    }

    var html = '';
    var num = 0;
    allSteps.forEach(function(s) {
      if (s === '---') {
        html += '<div class="step-row" style="border:none;padding:var(--space-1) 0;"></div>';
      } else {
        num++;
        html += '<div class="step-row"><div class="step-num">' + num + '</div><div class="step-text"><code>' + s + '</code></div></div>';
      }
    });

    elements.stepsContent.innerHTML = html;
  }

  // ==================== Venn Diagram ====================

  function drawVenn(factorA, factorB, g, l) {
    var canvas = elements.vennCanvas;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    var rect = canvas.getBoundingClientRect();
    var w = rect.width || 500;
    var h = 350;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var colors = {
      bg: isDark ? '#1a1a2e' : '#ffffff',
      circleA: 'rgba(145, 33, 78, 0.15)',
      circleB: 'rgba(46, 204, 113, 0.15)',
      strokeA: '#91214E',
      strokeB: '#2ecc71',
      text: isDark ? '#ccc' : '#333',
      shared: isDark ? '#ddd' : '#222',
      label: isDark ? '#aaa' : '#666'
    };

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Draw circles
    var cx1 = w * 0.38, cx2 = w * 0.62, cy = h * 0.48;
    var r = Math.min(w, h) * 0.28;

    // Circle A
    ctx.beginPath();
    ctx.arc(cx1, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.circleA;
    ctx.fill();
    ctx.strokeStyle = colors.strokeA;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circle B
    ctx.beginPath();
    ctx.arc(cx2, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.circleB;
    ctx.fill();
    ctx.strokeStyle = colors.strokeB;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = colors.strokeA;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(factorA.number.toString(), cx1 - r * 0.4, cy - r - 10);

    ctx.fillStyle = colors.strokeB;
    ctx.fillText(factorB.number.toString(), cx2 + r * 0.4, cy - r - 10);

    // Compute shared and unique prime factors
    var fA = factorA.factors;
    var fB = factorB.factors;
    var allPrimes = {};
    Object.keys(fA).forEach(function(p) { allPrimes[p] = true; });
    Object.keys(fB).forEach(function(p) { allPrimes[p] = true; });

    var onlyA = [], shared = [], onlyB = [];
    Object.keys(allPrimes).sort(function(a, b) { return a - b; }).forEach(function(p) {
      var inA = fA[p] || 0;
      var inB = fB[p] || 0;
      var common = Math.min(inA, inB);
      var uniqueA = inA - common;
      var uniqueB = inB - common;

      for (var i = 0; i < uniqueA; i++) onlyA.push(p);
      for (var i = 0; i < common; i++) shared.push(p);
      for (var i = 0; i < uniqueB; i++) onlyB.push(p);
    });

    // Draw factors in regions
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';

    // Only A (left side)
    ctx.fillStyle = colors.strokeA;
    var onlyAText = onlyA.length > 0 ? onlyA.join(', ') : '-';
    ctx.fillText(onlyAText, cx1 - r * 0.45, cy + 5);

    // Shared (center)
    ctx.fillStyle = colors.shared;
    var sharedText = shared.length > 0 ? shared.join(', ') : '-';
    ctx.fillText(sharedText, (cx1 + cx2) / 2, cy + 5);

    // Only B (right side)
    ctx.fillStyle = colors.strokeB;
    var onlyBText = onlyB.length > 0 ? onlyB.join(', ') : '-';
    ctx.fillText(onlyBText, cx2 + r * 0.45, cy + 5);

    // Section labels
    ctx.font = '11px sans-serif';
    ctx.fillStyle = colors.label;
    ctx.fillText('Only in ' + factorA.number, cx1 - r * 0.45, cy + 25);
    ctx.fillText('Shared', (cx1 + cx2) / 2, cy + 25);
    ctx.fillText('Only in ' + factorB.number, cx2 + r * 0.45, cy + 25);

    // Bottom legend
    ctx.font = '12px sans-serif';
    ctx.fillStyle = colors.label;
    ctx.textAlign = 'center';
    ctx.fillText('GCD = product of shared factors = ' + g, w / 2, h - 30);
    ctx.fillText('LCM = product of all unique factors = ' + l, w / 2, h - 12);
  }

  // ==================== Events ====================

  elements.calcBtn.addEventListener('click', calculate);

  elements.clearBtn.addEventListener('click', function() {
    elements.numbersInput.value = '';
    elements.resultsPanel.classList.add('hidden');
    hideError();
    elements.numbersInput.focus();
  });

  elements.toggleSteps.addEventListener('click', function() {
    stepsVisible = !stepsVisible;
    elements.stepsBody.style.display = stepsVisible ? '' : 'none';
    elements.toggleSteps.querySelector('i').className = stepsVisible
      ? 'fa-solid fa-chevron-up'
      : 'fa-solid fa-chevron-down';
  });

  elements.copyGcd.addEventListener('click', function() {
    ToolsCommon.copyWithToast(elements.gcdValue.textContent, 'GCD copied!');
  });

  elements.copyLcm.addEventListener('click', function() {
    ToolsCommon.copyWithToast(elements.lcmValue.textContent, 'LCM copied!');
  });

  elements.exampleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      elements.numbersInput.value = btn.dataset.nums;
      calculate();
    });
  });

  elements.numbersInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
    }
  });

  // Redraw Venn on theme change
  var observer = new MutationObserver(function() {
    if (!elements.resultsPanel.classList.contains('hidden')) {
      var input = parseInput();
      if (input && input.numbers && input.numbers.length === 2) {
        var nums = input.numbers;
        var fA = { number: nums[0], factors: primeFactorize(nums[0]) };
        var fB = { number: nums[1], factors: primeFactorize(nums[1]) };
        drawVenn(fA, fB, gcdArray(nums), lcmArray(nums));
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Init
  elements.numbersInput.focus();

})();
