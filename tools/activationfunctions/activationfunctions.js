/**
 * Activation Functions Visualizer
 */
(function() {
  'use strict';

  var COLORS = [
    '#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261',
    '#264653', '#a855f7', '#06b6d4', '#84cc16', '#f97316'
  ];

  var params = { leakyAlpha: 0.01, eluAlpha: 1.0, seluAlpha: 1.6733, seluLambda: 1.0507, swishBeta: 1.0 };

  var functions = [
    {
      id: 'sigmoid', name: 'Sigmoid', color: COLORS[0],
      fn: function(x) { return 1 / (1 + Math.exp(-x)); },
      deriv: function(x) { var s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> 1 / (1 + e<sup>-x</sup>)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> f(x)(1 - f(x))',
      range: '(0, 1)', monotonic: true, differentiable: true, vanishing: true
    },
    {
      id: 'tanh', name: 'Tanh', color: COLORS[1],
      fn: function(x) { return Math.tanh(x); },
      deriv: function(x) { var t = Math.tanh(x); return 1 - t * t; },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> tanh(<span class="var">x</span>)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> 1 - tanh<sup>2</sup>(x)',
      range: '(-1, 1)', monotonic: true, differentiable: true, vanishing: true
    },
    {
      id: 'relu', name: 'ReLU', color: COLORS[2],
      fn: function(x) { return Math.max(0, x); },
      deriv: function(x) { return x > 0 ? 1 : 0; },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> max(0, <span class="var">x</span>)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> { 1 if x > 0, 0 otherwise }',
      range: '[0, +inf)', monotonic: true, differentiable: false, vanishing: false, note: 'Dying ReLU risk'
    },
    {
      id: 'leakyrelu', name: 'Leaky ReLU', color: COLORS[3], hasParam: 'leakyAlpha',
      fn: function(x) { return x > 0 ? x : params.leakyAlpha * x; },
      deriv: function(x) { return x > 0 ? 1 : params.leakyAlpha; },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> max(<span class="var">&alpha;x</span>, <span class="var">x</span>)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> { 1 if x > 0, &alpha; otherwise }',
      range: '(-inf, +inf)', monotonic: true, differentiable: false, vanishing: false
    },
    {
      id: 'elu', name: 'ELU', color: COLORS[4], hasParam: 'eluAlpha',
      fn: function(x) { return x > 0 ? x : params.eluAlpha * (Math.exp(x) - 1); },
      deriv: function(x) { return x > 0 ? 1 : params.eluAlpha * Math.exp(x); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> { x if x > 0, &alpha;(e<sup>x</sup> - 1) otherwise }',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> { 1 if x > 0, &alpha;e<sup>x</sup> otherwise }',
      range: '(-&alpha;, +inf)', monotonic: true, differentiable: true, vanishing: false
    },
    {
      id: 'selu', name: 'SELU', color: COLORS[5],
      fn: function(x) { return x > 0 ? params.seluLambda * x : params.seluLambda * params.seluAlpha * (Math.exp(x) - 1); },
      deriv: function(x) { return x > 0 ? params.seluLambda : params.seluLambda * params.seluAlpha * Math.exp(x); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> &lambda; { x if x > 0, &alpha;(e<sup>x</sup> - 1) otherwise }',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> &lambda; { 1 if x > 0, &alpha;e<sup>x</sup> otherwise }',
      range: '(-&lambda;&alpha;, +inf)', monotonic: true, differentiable: true, vanishing: false, note: 'Self-normalizing'
    },
    {
      id: 'swish', name: 'Swish', color: COLORS[6], hasParam: 'swishBeta',
      fn: function(x) { return x / (1 + Math.exp(-params.swishBeta * x)); },
      deriv: function(x) { var s = 1 / (1 + Math.exp(-params.swishBeta * x)); return s + params.swishBeta * x * s * (1 - s); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> x &middot; &sigma;(&beta;x)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> &sigma;(&beta;x) + &beta;x&middot;&sigma;(&beta;x)(1 - &sigma;(&beta;x))',
      range: '(~-0.28, +inf)', monotonic: false, differentiable: true, vanishing: false
    },
    {
      id: 'gelu', name: 'GELU', color: COLORS[7],
      fn: function(x) { return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x))); },
      deriv: function(x) {
        var c = Math.sqrt(2 / Math.PI);
        var inner = c * (x + 0.044715 * x * x * x);
        var t = Math.tanh(inner);
        var sech2 = 1 - t * t;
        return 0.5 * (1 + t) + 0.5 * x * sech2 * c * (1 + 3 * 0.044715 * x * x);
      },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> 0.5x(1 + tanh(&radic;(2/&pi;)(x + 0.044715x<sup>3</sup>)))',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> (approx. numerical)',
      range: '(~-0.17, +inf)', monotonic: false, differentiable: true, vanishing: false, note: 'Used in Transformers'
    },
    {
      id: 'softplus', name: 'Softplus', color: COLORS[8],
      fn: function(x) { return Math.log(1 + Math.exp(x)); },
      deriv: function(x) { return 1 / (1 + Math.exp(-x)); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> ln(1 + e<sup>x</sup>)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> &sigma;(x) = 1/(1+e<sup>-x</sup>)',
      range: '(0, +inf)', monotonic: true, differentiable: true, vanishing: false
    },
    {
      id: 'softsign', name: 'Softsign', color: COLORS[9],
      fn: function(x) { return x / (1 + Math.abs(x)); },
      deriv: function(x) { var d = 1 + Math.abs(x); return 1 / (d * d); },
      formula: '<span class="fn">f</span>(<span class="var">x</span>) <span class="op">=</span> x / (1 + |x|)',
      derivFormula: '<span class="fn">f\'</span>(<span class="var">x</span>) <span class="op">=</span> 1 / (1 + |x|)<sup>2</sup>',
      range: '(-1, 1)', monotonic: true, differentiable: true, vanishing: true
    }
  ];

  var selected = new Set(['sigmoid', 'relu']);
  var showDeriv = true;
  var showGrid = true;
  var overlayMode = false;
  var xRange = [-6, 6];
  var dpr = window.devicePixelRatio || 1;

  var elements = {
    functionChips: document.getElementById('functionChips'),
    showDerivative: document.getElementById('showDerivative'),
    showGrid: document.getElementById('showGrid'),
    overlayMode: document.getElementById('overlayMode'),
    paramsRow: document.getElementById('paramsRow'),
    graphBody: document.getElementById('graphBody'),
    hoverReadout: document.getElementById('hoverReadout'),
    propertiesBody: document.getElementById('propertiesBody'),
    formulaBody: document.getElementById('formulaBody'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    clearAllBtn: document.getElementById('clearAllBtn')
  };

  function init() {
    renderChips();
    bindEvents();
    update();
  }

  function bindEvents() {
    elements.showDerivative.addEventListener('change', function() { showDeriv = this.checked; update(); });
    elements.showGrid.addEventListener('change', function() { showGrid = this.checked; update(); });
    elements.overlayMode.addEventListener('change', function() { overlayMode = this.checked; update(); });
    elements.selectAllBtn.addEventListener('click', function() {
      functions.forEach(function(f) { selected.add(f.id); });
      renderChips(); update();
    });
    elements.clearAllBtn.addEventListener('click', function() {
      selected.clear(); renderChips(); update();
    });

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'd' || e.key === 'D') { elements.showDerivative.checked = !elements.showDerivative.checked; showDeriv = elements.showDerivative.checked; update(); }
      if (e.key === 'g' || e.key === 'G') { elements.showGrid.checked = !elements.showGrid.checked; showGrid = elements.showGrid.checked; update(); }
      if (e.key === 'o' || e.key === 'O') { elements.overlayMode.checked = !elements.overlayMode.checked; overlayMode = elements.overlayMode.checked; update(); }
      if (e.key === 'a' && !e.ctrlKey) { functions.forEach(function(f) { selected.add(f.id); }); renderChips(); update(); }
    });
  }

  function renderChips() {
    var html = '';
    functions.forEach(function(f) {
      var active = selected.has(f.id) ? ' active' : '';
      html += '<button class="fn-chip' + active + '" data-fn="' + f.id + '"><span class="chip-dot" style="background:' + f.color + '"></span>' + f.name + '</button>';
    });
    elements.functionChips.innerHTML = html;
    elements.functionChips.querySelectorAll('.fn-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var id = this.dataset.fn;
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        this.classList.toggle('active');
        update();
      });
    });
  }

  function renderParams() {
    var neededParams = new Set();
    functions.forEach(function(f) {
      if (selected.has(f.id) && f.hasParam) neededParams.add(f.hasParam);
    });
    if (neededParams.size === 0) { elements.paramsRow.innerHTML = ''; return; }
    var html = '';
    if (neededParams.has('leakyAlpha')) {
      html += '<div class="param-group"><label>Leaky ReLU &alpha;</label><div style="display:flex;align-items:center;gap:var(--space-2)"><input type="range" min="0.001" max="0.5" step="0.001" value="' + params.leakyAlpha + '" data-param="leakyAlpha"><span class="param-value" id="pv-leakyAlpha">' + params.leakyAlpha + '</span></div></div>';
    }
    if (neededParams.has('eluAlpha')) {
      html += '<div class="param-group"><label>ELU &alpha;</label><div style="display:flex;align-items:center;gap:var(--space-2)"><input type="range" min="0.1" max="3" step="0.1" value="' + params.eluAlpha + '" data-param="eluAlpha"><span class="param-value" id="pv-eluAlpha">' + params.eluAlpha + '</span></div></div>';
    }
    if (neededParams.has('swishBeta')) {
      html += '<div class="param-group"><label>Swish &beta;</label><div style="display:flex;align-items:center;gap:var(--space-2)"><input type="range" min="0.1" max="5" step="0.1" value="' + params.swishBeta + '" data-param="swishBeta"><span class="param-value" id="pv-swishBeta">' + params.swishBeta + '</span></div></div>';
    }
    elements.paramsRow.innerHTML = html;
    elements.paramsRow.querySelectorAll('input[type="range"]').forEach(function(inp) {
      inp.addEventListener('input', function() {
        var p = this.dataset.param;
        params[p] = parseFloat(this.value);
        var disp = document.getElementById('pv-' + p);
        if (disp) disp.textContent = params[p];
        update();
      });
    });
  }

  function update() {
    renderParams();
    renderGraphs();
    renderProperties();
    renderFormulas();
  }

  function getSelectedFns() {
    return functions.filter(function(f) { return selected.has(f.id); });
  }

  function renderGraphs() {
    var sel = getSelectedFns();
    if (sel.length === 0) {
      elements.graphBody.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);text-align:center;padding:var(--space-5)">Select at least one function to visualize.</p>';
      return;
    }

    if (overlayMode) {
      // Single overlay graph
      var html = '<div class="graph-panel" style="width:100%;max-width:700px;">';
      html += '<div class="graph-panel-header"><span class="graph-panel-title">All Selected Functions</span>';
      html += '<div class="graph-panel-legend">';
      sel.forEach(function(f) {
        html += '<span class="legend-item"><span class="legend-line" style="background:' + f.color + '"></span>' + f.name + '</span>';
      });
      html += '</div></div>';
      html += '<div class="graph-canvas-wrap"><canvas id="canvas-overlay" width="660" height="400"></canvas></div></div>';
      elements.graphBody.innerHTML = html;
      var c = document.getElementById('canvas-overlay');
      drawOverlay(c, sel);
      bindCanvasHover(c, sel);
    } else {
      // Individual panels
      var html = '';
      sel.forEach(function(f) {
        html += '<div class="graph-panel" style="width:320px;">';
        html += '<div class="graph-panel-header"><span class="graph-panel-title">' + f.name + '</span>';
        html += '<div class="graph-panel-legend">';
        html += '<span class="legend-item"><span class="legend-line" style="background:' + f.color + '"></span>f(x)</span>';
        if (showDeriv) html += '<span class="legend-item"><span class="legend-line dashed" style="color:' + f.color + '"></span>f\'(x)</span>';
        html += '</div></div>';
        html += '<div class="graph-canvas-wrap"><canvas id="canvas-' + f.id + '" width="300" height="220"></canvas></div></div>';
      });
      elements.graphBody.innerHTML = html;
      sel.forEach(function(f) {
        var c = document.getElementById('canvas-' + f.id);
        drawSingle(c, f);
        bindCanvasHover(c, [f]);
      });
    }
  }

  function setupCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || parseInt(canvas.getAttribute('width'));
    var h = rect.height || parseInt(canvas.getAttribute('height'));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  function getGraphColors() {
    var style = getComputedStyle(document.documentElement);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: style.getPropertyValue('--color-surface').trim() || (isDark ? '#1a1a2e' : '#ffffff'),
      grid: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      axis: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
      text: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
    };
  }

  function drawAxesAndGrid(ctx, w, h, padL, padR, padT, padB, yMin, yMax) {
    var gc = getGraphColors();
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;

    // Background
    ctx.fillStyle = gc.bg;
    ctx.fillRect(0, 0, w, h);

    if (showGrid) {
      ctx.strokeStyle = gc.grid;
      ctx.lineWidth = 1;
      // Vertical grid
      for (var x = Math.ceil(xRange[0]); x <= Math.floor(xRange[1]); x++) {
        var px = padL + (x - xRange[0]) / (xRange[1] - xRange[0]) * plotW;
        ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, h - padB); ctx.stroke();
      }
      // Horizontal grid
      var yStep = yMax - yMin > 4 ? 1 : 0.5;
      for (var y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        var py = padT + (1 - (y - yMin) / (yMax - yMin)) * plotH;
        ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(w - padR, py); ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = gc.axis;
    ctx.lineWidth = 1.5;
    // X axis (y=0)
    var zeroY = padT + (1 - (0 - yMin) / (yMax - yMin)) * plotH;
    if (zeroY >= padT && zeroY <= h - padB) {
      ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(w - padR, zeroY); ctx.stroke();
    }
    // Y axis (x=0)
    var zeroX = padL + (0 - xRange[0]) / (xRange[1] - xRange[0]) * plotW;
    if (zeroX >= padL && zeroX <= w - padR) {
      ctx.beginPath(); ctx.moveTo(zeroX, padT); ctx.lineTo(zeroX, h - padB); ctx.stroke();
    }

    // Labels
    ctx.fillStyle = gc.text;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (var x = Math.ceil(xRange[0]); x <= Math.floor(xRange[1]); x++) {
      if (x === 0) continue;
      var px = padL + (x - xRange[0]) / (xRange[1] - xRange[0]) * plotW;
      ctx.fillText(x, px, h - padB + 14);
    }
    ctx.textAlign = 'right';
    var yStep2 = yMax - yMin > 4 ? 1 : 0.5;
    for (var y = Math.ceil(yMin / yStep2) * yStep2; y <= yMax; y += yStep2) {
      var py = padT + (1 - (y - yMin) / (yMax - yMin)) * plotH;
      ctx.fillText(Number.isInteger(y) ? y : y.toFixed(1), padL - 4, py + 3);
    }

    return { plotW: plotW, plotH: plotH, padL: padL, padT: padT, yMin: yMin, yMax: yMax };
  }

  function plotFunction(ctx, info, fn, color, dashed) {
    var steps = 400;
    var dx = (xRange[1] - xRange[0]) / steps;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = dashed ? 1.5 : 2;
    if (dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
    for (var i = 0; i <= steps; i++) {
      var x = xRange[0] + i * dx;
      var y = fn(x);
      if (!isFinite(y)) continue;
      var px = info.padL + (x - xRange[0]) / (xRange[1] - xRange[0]) * info.plotW;
      var py = info.padT + (1 - (y - info.yMin) / (info.yMax - info.yMin)) * info.plotH;
      py = Math.max(info.padT - 5, Math.min(info.padT + info.plotH + 5, py));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function getYRange(fns, includeDerivs) {
    var yMin = -1.5, yMax = 1.5;
    var steps = 200;
    var dx = (xRange[1] - xRange[0]) / steps;
    fns.forEach(function(f) {
      for (var i = 0; i <= steps; i++) {
        var x = xRange[0] + i * dx;
        var y = f.fn(x);
        if (isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
        if (includeDerivs) {
          var yd = f.deriv(x);
          if (isFinite(yd)) { yMin = Math.min(yMin, yd); yMax = Math.max(yMax, yd); }
        }
      }
    });
    var pad = (yMax - yMin) * 0.1;
    return [Math.floor((yMin - pad) * 2) / 2, Math.ceil((yMax + pad) * 2) / 2];
  }

  function drawSingle(canvas, f) {
    var setup = setupCanvas(canvas);
    var yr = getYRange([f], showDeriv);
    var info = drawAxesAndGrid(setup.ctx, setup.w, setup.h, 36, 10, 10, 24, yr[0], yr[1]);
    plotFunction(setup.ctx, info, f.fn, f.color, false);
    if (showDeriv) plotFunction(setup.ctx, info, f.deriv, f.color, true);
  }

  function drawOverlay(canvas, fns) {
    var setup = setupCanvas(canvas);
    var yr = getYRange(fns, showDeriv);
    var info = drawAxesAndGrid(setup.ctx, setup.w, setup.h, 40, 14, 14, 28, yr[0], yr[1]);
    fns.forEach(function(f) {
      plotFunction(setup.ctx, info, f.fn, f.color, false);
      if (showDeriv) plotFunction(setup.ctx, info, f.deriv, f.color, true);
    });
  }

  function bindCanvasHover(canvas, fns) {
    canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var setup = setupCanvas(canvas);
      var yr = getYRange(fns, showDeriv);
      var padL = overlayMode ? 40 : 36;
      var padR = overlayMode ? 14 : 10;
      var plotW = setup.w - padL - padR;
      var xVal = xRange[0] + (mx - padL) / plotW * (xRange[1] - xRange[0]);
      if (xVal < xRange[0] || xVal > xRange[1]) { elements.hoverReadout.textContent = ''; return; }

      var parts = fns.map(function(f) {
        var y = f.fn(xVal);
        var yd = f.deriv(xVal);
        var s = f.name + ': f(' + xVal.toFixed(2) + ')=' + y.toFixed(4);
        if (showDeriv) s += '  f\'=' + yd.toFixed(4);
        return s;
      });
      elements.hoverReadout.textContent = parts.join('  |  ');

      // Redraw with crosshair
      if (overlayMode) drawOverlay(canvas, fns); else drawSingle(canvas, fns[0]);
      var ctx = canvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = 'rgba(145,33,78,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mx * dpr / dpr, 0);
      ctx.lineTo(mx * dpr / dpr, setup.h);
      ctx.stroke();
      ctx.restore();
    });

    canvas.addEventListener('mouseleave', function() {
      elements.hoverReadout.textContent = '';
      var fnsArr = fns;
      if (overlayMode) drawOverlay(canvas, fnsArr); else drawSingle(canvas, fnsArr[0]);
    });
  }

  function renderProperties() {
    var sel = getSelectedFns();
    if (sel.length === 0) { elements.propertiesBody.innerHTML = ''; return; }
    var html = '<table class="props-table"><thead><tr><th>Function</th><th>Range</th><th>Monotonic</th><th>Differentiable</th><th>Vanishing Gradient</th><th>Notes</th></tr></thead><tbody>';
    sel.forEach(function(f) {
      html += '<tr>';
      html += '<td>' + f.name + '</td>';
      html += '<td class="prop-range">' + f.range + '</td>';
      html += '<td class="' + (f.monotonic ? 'prop-yes' : 'prop-no') + '">' + (f.monotonic ? 'Yes' : 'No') + '</td>';
      html += '<td class="' + (f.differentiable ? 'prop-yes' : 'prop-warn') + '">' + (f.differentiable ? 'Yes' : 'No*') + '</td>';
      html += '<td class="' + (f.vanishing ? 'prop-warn' : 'prop-yes') + '">' + (f.vanishing ? 'Yes' : 'No') + '</td>';
      html += '<td>' + (f.note || '-') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    elements.propertiesBody.innerHTML = html;
  }

  function renderFormulas() {
    var sel = getSelectedFns();
    if (sel.length === 0) { elements.formulaBody.innerHTML = ''; return; }
    var html = '';
    sel.forEach(function(f) {
      html += '<div class="formula-card">';
      html += '<span class="formula-name">' + f.name + '</span>';
      html += '<div class="formula-math">' + f.formula + '</div>';
      if (showDeriv) html += '<div class="formula-math formula-deriv">' + f.derivFormula + '</div>';
      html += '</div>';
    });
    elements.formulaBody.innerHTML = html;
  }

  // Re-render on theme change
  var observer = new MutationObserver(function() { update(); });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  init();
})();
