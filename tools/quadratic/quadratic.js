/**
 * KVSOVANREACH Quadratic Solver Tool
 * Solve ax^2 + bx + c = 0 with step-by-step solution and graph
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    coeffA: document.getElementById('coeffA'),
    coeffB: document.getElementById('coeffB'),
    coeffC: document.getElementById('coeffC'),
    eqPreview: document.getElementById('eqPreview'),
    solveBtn: document.getElementById('solveBtn'),
    clearBtn: document.getElementById('clearBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    resultsPanel: document.getElementById('resultsPanel'),
    discriminantValue: document.getElementById('discriminantValue'),
    discriminantExplain: document.getElementById('discriminantExplain'),
    rootsDisplay: document.getElementById('rootsDisplay'),
    propsGrid: document.getElementById('propsGrid'),
    stepsContent: document.getElementById('stepsContent'),
    stepsBody: document.getElementById('stepsBody'),
    toggleSteps: document.getElementById('toggleSteps'),
    graphCanvas: document.getElementById('graphCanvas'),
    exampleBtns: document.querySelectorAll('.example-btn')
  };

  // ==================== State ====================
  let stepsVisible = true;

  // ==================== Helpers ====================

  function formatNum(n, decimals) {
    if (decimals === undefined) decimals = 6;
    if (Number.isInteger(n)) return n.toString();
    const rounded = parseFloat(n.toFixed(decimals));
    return rounded.toString();
  }

  function formatCoeff(val, variable, isFirst) {
    if (val === 0) return '';
    let sign = val > 0 ? (isFirst ? '' : ' + ') : (isFirst ? '-' : ' - ');
    let absVal = Math.abs(val);
    let coeff = '';
    if (variable) {
      coeff = absVal === 1 ? '' : formatNum(absVal);
      return sign + coeff + variable;
    }
    return sign + formatNum(absVal);
  }

  function updatePreview() {
    const a = parseFloat(elements.coeffA.value) || 0;
    const b = parseFloat(elements.coeffB.value) || 0;
    const c = parseFloat(elements.coeffC.value) || 0;

    if (a === 0 && b === 0 && c === 0) {
      elements.eqPreview.innerHTML = 'ax<sup>2</sup> + bx + c = 0';
      return;
    }

    let parts = [];
    if (a !== 0) parts.push(formatCoeff(a, 'x<sup>2</sup>', parts.length === 0));
    if (b !== 0) parts.push(formatCoeff(b, 'x', parts.length === 0));
    if (c !== 0) parts.push(formatCoeff(c, '', parts.length === 0));

    elements.eqPreview.innerHTML = (parts.join('') || '0') + ' = 0';
  }

  function showError(msg) {
    elements.errorMessage.classList.remove('hidden');
    elements.errorText.textContent = msg;
    elements.resultsPanel.classList.add('hidden');
  }

  function hideError() {
    elements.errorMessage.classList.add('hidden');
  }

  // ==================== Solver ====================

  function solve() {
    hideError();

    const a = parseFloat(elements.coeffA.value);
    const b = parseFloat(elements.coeffB.value) || 0;
    const c = parseFloat(elements.coeffC.value) || 0;

    if (isNaN(a) || a === 0) {
      showError('Coefficient "a" must be a non-zero number for a quadratic equation.');
      return;
    }

    const discriminant = b * b - 4 * a * c;
    const steps = [];
    let roots = [];
    let rootType = '';

    // Step 1: Identify coefficients
    steps.push(`Identify coefficients: <code>a = ${formatNum(a)}</code>, <code>b = ${formatNum(b)}</code>, <code>c = ${formatNum(c)}</code>`);

    // Step 2: Calculate discriminant
    steps.push(`Calculate discriminant: <code>\u0394 = b\u00B2 - 4ac = (${formatNum(b)})\u00B2 - 4(${formatNum(a)})(${formatNum(c)}) = ${formatNum(b*b)} - ${formatNum(4*a*c)} = ${formatNum(discriminant)}</code>`);

    // Step 3: Determine root type and solve
    if (discriminant > 0) {
      rootType = 'two-real';
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      roots = [x1, x2];

      steps.push(`\u0394 > 0, so there are <strong>two distinct real roots</strong>.`);
      steps.push(`Apply quadratic formula: <code>x = (-b \u00B1 \u221A\u0394) / (2a)</code>`);
      steps.push(`<code>\u221A\u0394 = \u221A${formatNum(discriminant)} = ${formatNum(sqrtD)}</code>`);
      steps.push(`<code>x\u2081 = (-${formatNum(b)} + ${formatNum(sqrtD)}) / (2 \u00D7 ${formatNum(a)}) = ${formatNum(x1)}</code>`);
      steps.push(`<code>x\u2082 = (-${formatNum(b)} - ${formatNum(sqrtD)}) / (2 \u00D7 ${formatNum(a)}) = ${formatNum(x2)}</code>`);

    } else if (discriminant === 0) {
      rootType = 'repeated';
      const x = -b / (2 * a);
      roots = [x];

      steps.push(`\u0394 = 0, so there is <strong>one repeated real root</strong>.`);
      steps.push(`Apply quadratic formula: <code>x = -b / (2a)</code>`);
      steps.push(`<code>x = -${formatNum(b)} / (2 \u00D7 ${formatNum(a)}) = ${formatNum(x)}</code>`);

    } else {
      rootType = 'complex';
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      roots = [
        { real: realPart, imag: Math.abs(imagPart) }
      ];

      steps.push(`\u0394 < 0, so there are <strong>two complex conjugate roots</strong>.`);
      steps.push(`Apply quadratic formula: <code>x = (-b \u00B1 \u221A\u0394) / (2a)</code>`);
      steps.push(`<code>\u221A\u0394 = \u221A(${formatNum(discriminant)}) = ${formatNum(Math.abs(imagPart) * 2 * a)}i / (2 \u00D7 ${formatNum(a)}) = ${formatNum(Math.abs(imagPart))}i</code>`);
      steps.push(`<code>x\u2081 = ${formatNum(realPart)} + ${formatNum(Math.abs(imagPart))}i</code>`);
      steps.push(`<code>x\u2082 = ${formatNum(realPart)} - ${formatNum(Math.abs(imagPart))}i</code>`);
    }

    // Vertex and axis
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const yIntercept = c;
    const direction = a > 0 ? 'Upward' : 'Downward';

    steps.push(`Vertex: <code>(-b/(2a), f(-b/(2a))) = (${formatNum(vertexX)}, ${formatNum(vertexY)})</code>`);
    steps.push(`Axis of symmetry: <code>x = ${formatNum(vertexX)}</code>`);

    // Render results
    renderDiscriminant(discriminant, rootType);
    renderRoots(roots, rootType);
    renderProperties(vertexX, vertexY, yIntercept, direction, a);
    renderSteps(steps);
    drawGraph(a, b, c, roots, rootType, vertexX, vertexY);

    elements.resultsPanel.classList.remove('hidden');
  }

  // ==================== Renderers ====================

  function renderDiscriminant(d, type) {
    const cls = d > 0 ? 'positive' : d === 0 ? 'zero' : 'negative';
    elements.discriminantValue.className = 'discriminant-value ' + cls;
    elements.discriminantValue.innerHTML = `\u0394 = ${formatNum(d)}`;

    const explains = {
      'two-real': `Discriminant is positive (\u0394 > 0) \u2014 the equation has two distinct real roots.`,
      'repeated': `Discriminant is zero (\u0394 = 0) \u2014 the equation has one repeated real root (double root).`,
      'complex': `Discriminant is negative (\u0394 < 0) \u2014 the equation has two complex conjugate roots.`
    };
    elements.discriminantExplain.textContent = explains[type];
  }

  function renderRoots(roots, type) {
    let html = '';
    if (type === 'two-real') {
      html += `<div class="root-item"><span class="root-label">x\u2081</span><span class="root-equals">=</span><span class="root-value">${formatNum(roots[0])}</span></div>`;
      html += `<div class="root-item"><span class="root-label">x\u2082</span><span class="root-equals">=</span><span class="root-value">${formatNum(roots[1])}</span></div>`;
    } else if (type === 'repeated') {
      html += `<div class="root-item"><span class="root-label">x</span><span class="root-equals">=</span><span class="root-value">${formatNum(roots[0])}</span></div>`;
    } else {
      const r = roots[0];
      html += `<div class="root-item"><span class="root-label">x\u2081</span><span class="root-equals">=</span><span class="root-value">${formatNum(r.real)} + ${formatNum(r.imag)}i</span></div>`;
      html += `<div class="root-item"><span class="root-label">x\u2082</span><span class="root-equals">=</span><span class="root-value">${formatNum(r.real)} - ${formatNum(r.imag)}i</span></div>`;
    }
    elements.rootsDisplay.innerHTML = html;
  }

  function renderProperties(vx, vy, yInt, direction, a) {
    const dirIcon = a > 0
      ? '<i class="fa-solid fa-arrow-up direction-icon"></i>'
      : '<i class="fa-solid fa-arrow-down direction-icon"></i>';

    elements.propsGrid.innerHTML = `
      <div class="prop-item">
        <span class="prop-label">Vertex</span>
        <span class="prop-value">(${formatNum(vx)}, ${formatNum(vy)})</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">Axis of Symmetry</span>
        <span class="prop-value">x = ${formatNum(vx)}</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">Y-Intercept</span>
        <span class="prop-value">(0, ${formatNum(yInt)})</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">Direction</span>
        <span class="prop-value">${dirIcon}Opens ${direction}</span>
      </div>
    `;
  }

  function renderSteps(steps) {
    elements.stepsContent.innerHTML = steps.map(function(text, i) {
      return `<div class="step-row"><div class="step-num">${i + 1}</div><div class="step-text">${text}</div></div>`;
    }).join('');
  }

  // ==================== Graph ====================

  function drawGraph(a, b, c, roots, rootType, vx, vy) {
    const canvas = elements.graphCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size for high DPI
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 600;
    const h = 400;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Determine theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = {
      bg: isDark ? '#1a1a2e' : '#ffffff',
      grid: isDark ? '#2a2a3e' : '#e8e8e8',
      axis: isDark ? '#888' : '#666',
      curve: '#91214E',
      root: '#e74c3c',
      vertex: '#2ecc71',
      text: isDark ? '#ccc' : '#333',
      axisLabel: isDark ? '#999' : '#777'
    };

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Calculate view bounds around vertex and roots
    let xMin, xMax;
    if (rootType === 'two-real') {
      const spread = Math.abs(roots[1] - roots[0]);
      const center = (roots[0] + roots[1]) / 2;
      const margin = Math.max(spread * 0.8, 2);
      xMin = center - margin;
      xMax = center + margin;
    } else {
      const margin = Math.max(Math.abs(vx) * 0.5 + 3, 5);
      xMin = vx - margin;
      xMax = vx + margin;
    }

    // Compute y range from the x range
    const samples = 200;
    const dx = (xMax - xMin) / samples;
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * dx;
      const y = a * x * x + b * x + c;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }

    // Add padding to y
    const yRange = yMax - yMin || 2;
    const yPad = yRange * 0.15;
    yMin -= yPad;
    yMax += yPad;

    // Mapping functions
    const margin = 50;
    function mapX(x) { return margin + (x - xMin) / (xMax - xMin) * (w - 2 * margin); }
    function mapY(y) { return (h - margin) - (y - yMin) / (yMax - yMin) * (h - 2 * margin); }

    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    const xStep = niceStep((xMax - xMin) / 8);
    const yStep = niceStep((yMax - yMin) / 6);

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = mapX(x);
      ctx.beginPath();
      ctx.moveTo(px, margin);
      ctx.lineTo(px, h - margin);
      ctx.stroke();

      ctx.fillStyle = colors.axisLabel;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatNum(x, 2), px, h - margin + 15);
    }

    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = mapY(y);
      ctx.beginPath();
      ctx.moveTo(margin, py);
      ctx.lineTo(w - margin, py);
      ctx.stroke();

      ctx.fillStyle = colors.axisLabel;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatNum(y, 2), margin - 6, py + 4);
    }

    // Draw axes if visible
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    if (xMin <= 0 && xMax >= 0) {
      const px = mapX(0);
      ctx.beginPath();
      ctx.moveTo(px, margin);
      ctx.lineTo(px, h - margin);
      ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      const py = mapY(0);
      ctx.beginPath();
      ctx.moveTo(margin, py);
      ctx.lineTo(w - margin, py);
      ctx.stroke();
    }

    // Draw axis of symmetry (dashed)
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = colors.vertex;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    const axPx = mapX(vx);
    ctx.beginPath();
    ctx.moveTo(axPx, margin);
    ctx.lineTo(axPx, h - margin);
    ctx.stroke();
    ctx.restore();

    // Draw parabola
    ctx.strokeStyle = colors.curve;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * dx;
      const y = a * x * x + b * x + c;
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw roots
    if (rootType === 'two-real') {
      drawDot(ctx, mapX(roots[0]), mapY(0), 6, colors.root);
      drawDot(ctx, mapX(roots[1]), mapY(0), 6, colors.root);
      drawLabel(ctx, 'x\u2081', mapX(roots[0]), mapY(0) - 12, colors.root);
      drawLabel(ctx, 'x\u2082', mapX(roots[1]), mapY(0) - 12, colors.root);
    } else if (rootType === 'repeated') {
      drawDot(ctx, mapX(roots[0]), mapY(0), 6, colors.root);
      drawLabel(ctx, 'x', mapX(roots[0]), mapY(0) - 12, colors.root);
    }

    // Draw vertex
    drawDot(ctx, mapX(vx), mapY(vy), 6, colors.vertex);
    drawLabel(ctx, 'V', mapX(vx) + 10, mapY(vy) - 10, colors.vertex);

    // Draw y-intercept
    if (xMin <= 0 && xMax >= 0) {
      drawDot(ctx, mapX(0), mapY(c), 5, colors.curve);
    }
  }

  function drawDot(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawLabel(ctx, text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  function niceStep(rough) {
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const normalized = rough / pow;
    if (normalized <= 1.5) return pow;
    if (normalized <= 3.5) return 2 * pow;
    if (normalized <= 7.5) return 5 * pow;
    return 10 * pow;
  }

  // ==================== Events ====================

  elements.solveBtn.addEventListener('click', solve);
  elements.clearBtn.addEventListener('click', function() {
    elements.coeffA.value = '';
    elements.coeffB.value = '';
    elements.coeffC.value = '';
    elements.resultsPanel.classList.add('hidden');
    hideError();
    updatePreview();
    elements.coeffA.focus();
  });

  elements.toggleSteps.addEventListener('click', function() {
    stepsVisible = !stepsVisible;
    elements.stepsBody.style.display = stepsVisible ? '' : 'none';
    elements.toggleSteps.querySelector('i').className = stepsVisible
      ? 'fa-solid fa-chevron-up'
      : 'fa-solid fa-chevron-down';
  });

  elements.exampleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      elements.coeffA.value = btn.dataset.a;
      elements.coeffB.value = btn.dataset.b;
      elements.coeffC.value = btn.dataset.c;
      updatePreview();
      solve();
    });
  });

  [elements.coeffA, elements.coeffB, elements.coeffC].forEach(function(input) {
    input.addEventListener('input', updatePreview);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        solve();
      }
    });
  });

  // Redraw graph on theme change
  const observer = new MutationObserver(function() {
    if (!elements.resultsPanel.classList.contains('hidden')) {
      const a = parseFloat(elements.coeffA.value);
      const b = parseFloat(elements.coeffB.value) || 0;
      const c = parseFloat(elements.coeffC.value) || 0;
      if (a) {
        const d = b * b - 4 * a * c;
        const vx = -b / (2 * a);
        const vy = a * vx * vx + b * vx + c;
        let roots = [], rootType = '';
        if (d > 0) {
          rootType = 'two-real';
          roots = [(-b + Math.sqrt(d)) / (2 * a), (-b - Math.sqrt(d)) / (2 * a)];
        } else if (d === 0) {
          rootType = 'repeated';
          roots = [-b / (2 * a)];
        } else {
          rootType = 'complex';
          roots = [{ real: -b / (2 * a), imag: Math.sqrt(-d) / (2 * a) }];
        }
        drawGraph(a, b, c, roots, rootType, vx, vy);
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Resize handler
  window.addEventListener('resize', function() {
    if (!elements.resultsPanel.classList.contains('hidden')) {
      const a = parseFloat(elements.coeffA.value);
      if (a) {
        const b = parseFloat(elements.coeffB.value) || 0;
        const c = parseFloat(elements.coeffC.value) || 0;
        const d = b * b - 4 * a * c;
        const vx = -b / (2 * a);
        const vy = a * vx * vx + b * vx + c;
        let roots = [], rootType = '';
        if (d > 0) {
          rootType = 'two-real';
          roots = [(-b + Math.sqrt(d)) / (2 * a), (-b - Math.sqrt(d)) / (2 * a)];
        } else if (d === 0) {
          rootType = 'repeated';
          roots = [-b / (2 * a)];
        } else {
          rootType = 'complex';
          roots = [{ real: -b / (2 * a), imag: Math.sqrt(-d) / (2 * a) }];
        }
        drawGraph(a, b, c, roots, rootType, vx, vy);
      }
    }
  });

  // Init
  updatePreview();
  elements.coeffA.focus();

})();
