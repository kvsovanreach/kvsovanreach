/**
 * Loss Function Visualizer
 */
(function() {
  'use strict';

  var COLORS = ['#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#a855f7'];

  var target = 1.0;
  var huberDelta = 1.0;
  var activeIds = ['mse', 'mae'];

  var lossFunctions = [
    {
      id: 'mse', name: 'MSE', color: COLORS[0],
      fn: function(y, p) { return (y - p) * (y - p); },
      grad: function(y, p) { return -2 * (y - p); },
      formula: 'L = (y - p)\u00B2',
      range: '[0, +\u221E)',
      gradient: 'Linear in error; large gradients for large errors',
      useCases: 'Regression, value prediction',
      pros: 'Smooth, differentiable everywhere; penalizes large errors',
      cons: 'Sensitive to outliers due to squaring'
    },
    {
      id: 'mae', name: 'MAE', color: COLORS[1],
      fn: function(y, p) { return Math.abs(y - p); },
      grad: function(y, p) { return p > y ? 1 : (p < y ? -1 : 0); },
      formula: 'L = |y - p|',
      range: '[0, +\u221E)',
      gradient: 'Constant magnitude (\u00B11); not smooth at zero',
      useCases: 'Robust regression, median estimation',
      pros: 'Robust to outliers; easy to interpret',
      cons: 'Non-differentiable at y=p; constant gradient can slow convergence'
    },
    {
      id: 'huber', name: 'Huber', color: COLORS[2],
      fn: function(y, p) {
        var a = Math.abs(y - p);
        return a <= huberDelta ? 0.5 * a * a : huberDelta * (a - 0.5 * huberDelta);
      },
      grad: function(y, p) {
        var d = p - y;
        if (Math.abs(d) <= huberDelta) return d;
        return d > 0 ? huberDelta : -huberDelta;
      },
      formula: 'L = { 0.5(y-p)\u00B2 if |y-p|\u2264\u03B4, \u03B4(|y-p|-0.5\u03B4) else }',
      range: '[0, +\u221E)',
      gradient: 'Quadratic near zero, linear far away; smooth transition',
      useCases: 'Regression with outliers',
      pros: 'Best of MSE and MAE; tunable delta',
      cons: 'Extra hyperparameter (\u03B4) to tune'
    },
    {
      id: 'logcosh', name: 'Log-Cosh', color: COLORS[3],
      fn: function(y, p) {
        var x = p - y;
        return Math.log(Math.cosh(x));
      },
      grad: function(y, p) {
        return Math.tanh(p - y);
      },
      formula: 'L = log(cosh(p - y))',
      range: '[0, +\u221E)',
      gradient: 'Tanh-shaped; smooth everywhere; approaches \u00B11 for large errors',
      useCases: 'Smooth alternative to Huber',
      pros: 'Twice differentiable; no hyperparameters; smooth',
      cons: 'Slightly less intuitive; approximately MSE for small errors'
    },
    {
      id: 'bce', name: 'Binary CE', color: COLORS[4],
      fn: function(y, p) {
        var cp = Math.max(1e-7, Math.min(1 - 1e-7, p));
        return -(y * Math.log(cp) + (1 - y) * Math.log(1 - cp));
      },
      grad: function(y, p) {
        var cp = Math.max(1e-7, Math.min(1 - 1e-7, p));
        return -y / cp + (1 - y) / (1 - cp);
      },
      formula: 'L = -[y\u00B7log(p) + (1-y)\u00B7log(1-p)]',
      range: '[0, +\u221E)',
      gradient: 'Asymptotic near 0 and 1; large penalty for confident wrong predictions',
      useCases: 'Binary classification',
      pros: 'Information-theoretic foundation; sharp penalty for wrong confidence',
      cons: 'Requires p \u2208 (0,1); can produce very large gradients near boundaries'
    },
    {
      id: 'hinge', name: 'Hinge', color: COLORS[5],
      fn: function(y, p) {
        var ySign = y >= 0.5 ? 1 : -1;
        var pMapped = 2 * p - 1;
        return Math.max(0, 1 - ySign * pMapped);
      },
      grad: function(y, p) {
        var ySign = y >= 0.5 ? 1 : -1;
        var pMapped = 2 * p - 1;
        return (1 - ySign * pMapped) > 0 ? -2 * ySign : 0;
      },
      formula: 'L = max(0, 1 - y\u0302\u00B7p\u0302)  [mapped to \u00B11]',
      range: '[0, +\u221E)',
      gradient: 'Constant or zero; non-differentiable at margin boundary',
      useCases: 'SVM, max-margin classification',
      pros: 'Sparsity in support vectors; margin-based',
      cons: 'Non-differentiable at hinge point; not suitable for probability estimation'
    }
  ];

  var lossCanvas, lossCtx, gradCanvas, gradCtx;
  var canvasW, canvasH;
  var PAD = { top: 20, right: 20, bottom: 40, left: 55 };
  var xMin = -0.5, xMax = 2.0, yMin = 0, yMax = 4;
  var gradYMax = 6;
  var mouseX = null;

  function init() {
    lossCanvas = document.getElementById('lossCanvas');
    lossCtx = lossCanvas.getContext('2d');
    gradCanvas = document.getElementById('gradientCanvas');
    gradCtx = gradCanvas.getContext('2d');

    buildChips();
    bindControls();
    resize();
    render();

    window.addEventListener('resize', function() { resize(); render(); });
  }

  function buildChips() {
    var container = document.getElementById('functionChips');
    container.innerHTML = '';
    lossFunctions.forEach(function(lf) {
      var chip = document.createElement('div');
      chip.className = 'fn-chip' + (activeIds.indexOf(lf.id) >= 0 ? ' active' : '');
      chip.dataset.id = lf.id;
      chip.innerHTML = '<span class="chip-dot" style="background:' + lf.color + '"></span>' + lf.name;
      chip.addEventListener('click', function() { toggleFunction(lf.id); });
      container.appendChild(chip);
    });
  }

  function toggleFunction(id) {
    var idx = activeIds.indexOf(id);
    if (idx >= 0) activeIds.splice(idx, 1);
    else activeIds.push(id);
    updateChipStates();
    render();
    renderProperties();
  }

  function updateChipStates() {
    var chips = document.querySelectorAll('.fn-chip');
    chips.forEach(function(chip) {
      chip.classList.toggle('active', activeIds.indexOf(chip.dataset.id) >= 0);
    });
  }

  function bindControls() {
    var targetSlider = document.getElementById('targetSlider');
    var targetValEl = document.getElementById('targetValue');
    targetSlider.addEventListener('input', function() {
      target = parseFloat(this.value);
      targetValEl.textContent = target.toFixed(2);
      render();
    });

    var huberSlider = document.getElementById('huberDelta');
    var huberValEl = document.getElementById('huberDeltaValue');
    huberSlider.addEventListener('input', function() {
      huberDelta = parseFloat(this.value);
      huberValEl.textContent = huberDelta.toFixed(1);
      render();
    });

    var showGradient = document.getElementById('showGradient');
    showGradient.addEventListener('change', function() {
      document.getElementById('gradientSection').style.display = this.checked ? '' : 'none';
      if (this.checked) { resizeCanvas(gradCanvas); }
      render();
    });

    document.getElementById('showGrid').addEventListener('change', function() { render(); });

    document.getElementById('selectAllBtn').addEventListener('click', function() {
      activeIds = lossFunctions.map(function(f) { return f.id; });
      updateChipStates();
      render();
      renderProperties();
      if (typeof ToolsCommon !== 'undefined') ToolsCommon.showToast('All functions selected');
    });

    document.getElementById('clearAllBtn').addEventListener('click', function() {
      activeIds = [];
      updateChipStates();
      render();
      renderProperties();
    });

    lossCanvas.addEventListener('mousemove', function(e) {
      var rect = lossCanvas.getBoundingClientRect();
      var scale = lossCanvas.width / rect.width;
      mouseX = (e.clientX - rect.left) * scale;
      render();
      showReadout(mouseX);
    });
    lossCanvas.addEventListener('mouseleave', function() {
      mouseX = null;
      document.getElementById('hoverReadout').textContent = '';
      document.getElementById('gradHoverReadout').textContent = '';
      render();
    });

    renderProperties();
  }

  function showReadout(px) {
    var plotW = canvasW - PAD.left - PAD.right;
    var t = (px - PAD.left) / plotW;
    if (t < 0 || t > 1) { document.getElementById('hoverReadout').textContent = ''; return; }
    var predVal = xMin + t * (xMax - xMin);
    var parts = ['p=' + predVal.toFixed(3)];
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      var val = lf.fn(target, predVal);
      parts.push(lf.name + '=' + val.toFixed(4));
    });
    document.getElementById('hoverReadout').textContent = parts.join('  |  ');

    var gParts = ['p=' + predVal.toFixed(3)];
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      var gVal = lf.grad(target, predVal);
      gParts.push(lf.name + '=' + gVal.toFixed(4));
    });
    document.getElementById('gradHoverReadout').textContent = gParts.join('  |  ');
  }

  function resize() {
    resizeCanvas(lossCanvas);
    if (document.getElementById('showGradient').checked) resizeCanvas(gradCanvas);
  }

  function resizeCanvas(canvas) {
    var wrap = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    var w = wrap.clientWidth;
    var h = Math.min(400, Math.max(250, w * 0.5));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    canvasW = canvas.width;
    canvasH = canvas.height;
  }

  function getStyles() {
    var cs = getComputedStyle(document.documentElement);
    return {
      text: cs.getPropertyValue('--color-text-secondary').trim() || '#6b7280',
      muted: cs.getPropertyValue('--color-text-muted').trim() || '#9ca3af',
      border: cs.getPropertyValue('--color-border').trim() || '#e5e7eb',
      borderLight: cs.getPropertyValue('--color-border-light').trim() || '#f3f4f6',
      bg: cs.getPropertyValue('--color-surface').trim() || '#ffffff'
    };
  }

  function render() {
    renderLoss();
    if (document.getElementById('showGradient').checked) renderGrad();
    renderLegend();
  }

  function renderLoss() {
    var dpr = window.devicePixelRatio || 1;
    var w = lossCanvas.width, h = lossCanvas.height;
    var ctx = lossCtx;
    var s = getStyles();
    var showGrid = document.getElementById('showGrid').checked;

    ctx.clearRect(0, 0, w, h);

    var plotW = w - PAD.left - PAD.right;
    var plotH = h - PAD.top - PAD.bottom;

    // Compute adaptive yMax
    yMax = 0.5;
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      for (var px = 0; px <= plotW; px += plotW / 20) {
        var pred = xMin + (px / plotW) * (xMax - xMin);
        var val = lf.fn(target, pred);
        if (isFinite(val) && val > yMax) yMax = val;
      }
    });
    yMax = Math.min(yMax * 1.2, 20);
    if (yMax < 1) yMax = 1;

    function toX(v) { return PAD.left + ((v - xMin) / (xMax - xMin)) * plotW; }
    function toY(v) { return PAD.top + plotH - (v / yMax) * plotH; }

    // Grid
    if (showGrid) {
      ctx.strokeStyle = s.borderLight;
      ctx.lineWidth = dpr;
      var xStep = 0.5;
      for (var gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax; gx += xStep) {
        var sx = toX(gx);
        ctx.beginPath(); ctx.moveTo(sx, PAD.top); ctx.lineTo(sx, PAD.top + plotH); ctx.stroke();
      }
      var yStep = yMax > 5 ? 2 : (yMax > 2 ? 1 : 0.5);
      for (var gy = 0; gy <= yMax; gy += yStep) {
        var sy = toY(gy);
        ctx.beginPath(); ctx.moveTo(PAD.left, sy); ctx.lineTo(PAD.left + plotW, sy); ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = s.border;
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = s.text;
    ctx.font = (11 * dpr) + 'px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    var xStep2 = 0.5;
    for (var lx = Math.ceil(xMin / xStep2) * xStep2; lx <= xMax; lx += xStep2) {
      ctx.fillText(lx.toFixed(1), toX(lx), PAD.top + plotH + 16 * dpr);
    }
    ctx.textAlign = 'right';
    var yStep2 = yMax > 5 ? 2 : (yMax > 2 ? 1 : 0.5);
    for (var ly = 0; ly <= yMax; ly += yStep2) {
      ctx.fillText(ly.toFixed(1), PAD.left - 6 * dpr, toY(ly) + 4 * dpr);
    }

    // Axis titles
    ctx.fillStyle = s.muted;
    ctx.font = (10 * dpr) + 'px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Prediction (p)', PAD.left + plotW / 2, h - 2 * dpr);
    ctx.save();
    ctx.translate(12 * dpr, PAD.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Loss', 0, 0);
    ctx.restore();

    // Target line
    if (target >= xMin && target <= xMax) {
      ctx.strokeStyle = 'rgba(145, 33, 78, 0.4)';
      ctx.setLineDash([6 * dpr, 4 * dpr]);
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      var tx = toX(target);
      ctx.moveTo(tx, PAD.top); ctx.lineTo(tx, PAD.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(145, 33, 78, 0.7)';
      ctx.font = (10 * dpr) + 'px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('y=' + target.toFixed(2), tx, PAD.top - 4 * dpr);
    }

    // Curves
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      ctx.strokeStyle = lf.color;
      ctx.lineWidth = 2.5 * dpr;
      ctx.beginPath();
      var started = false;
      for (var px = 0; px <= plotW; px++) {
        var pred = xMin + (px / plotW) * (xMax - xMin);
        var val = lf.fn(target, pred);
        if (!isFinite(val) || val > yMax * 2) { started = false; continue; }
        var cy = toY(Math.max(0, Math.min(val, yMax)));
        var cx = PAD.left + px;
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });

    // Mouse crosshair
    if (mouseX !== null && mouseX >= PAD.left && mouseX <= PAD.left + plotW) {
      ctx.strokeStyle = s.muted;
      ctx.lineWidth = dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(mouseX, PAD.top);
      ctx.lineTo(mouseX, PAD.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dots on curves at mouse position
      var t = (mouseX - PAD.left) / plotW;
      var predVal = xMin + t * (xMax - xMin);
      lossFunctions.forEach(function(lf) {
        if (activeIds.indexOf(lf.id) < 0) return;
        var val = lf.fn(target, predVal);
        if (!isFinite(val)) return;
        var dy = toY(Math.max(0, Math.min(val, yMax)));
        ctx.fillStyle = lf.color;
        ctx.beginPath();
        ctx.arc(mouseX, dy, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function renderGrad() {
    var dpr = window.devicePixelRatio || 1;
    resizeCanvas(gradCanvas);
    var w = gradCanvas.width, h = gradCanvas.height;
    var ctx = gradCtx;
    var s = getStyles();

    ctx.clearRect(0, 0, w, h);

    var plotW = w - PAD.left - PAD.right;
    var plotH = h - PAD.top - PAD.bottom;

    // Adaptive yRange for gradient
    var gMin = 0, gMax = 1;
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      for (var px = 0; px <= plotW; px += plotW / 20) {
        var pred = xMin + (px / plotW) * (xMax - xMin);
        var gVal = lf.grad(target, pred);
        if (isFinite(gVal)) {
          if (gVal < gMin) gMin = gVal;
          if (gVal > gMax) gMax = gVal;
        }
      }
    });
    var gRange = Math.max(Math.abs(gMin), Math.abs(gMax)) * 1.2;
    if (gRange < 1) gRange = 1;
    gMin = -gRange; gMax = gRange;

    function toX(v) { return PAD.left + ((v - xMin) / (xMax - xMin)) * plotW; }
    function toY(v) { return PAD.top + plotH / 2 - (v / gRange) * (plotH / 2); }

    // Axes
    ctx.strokeStyle = s.border;
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Zero line
    ctx.strokeStyle = s.borderLight;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    var zeroY = toY(0);
    ctx.moveTo(PAD.left, zeroY);
    ctx.lineTo(PAD.left + plotW, zeroY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = s.text;
    ctx.font = (11 * dpr) + 'px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(gRange.toFixed(1), PAD.left - 6 * dpr, PAD.top + 12 * dpr);
    ctx.fillText('0', PAD.left - 6 * dpr, zeroY + 4 * dpr);
    ctx.fillText((-gRange).toFixed(1), PAD.left - 6 * dpr, PAD.top + plotH + 4 * dpr);

    ctx.fillStyle = s.muted;
    ctx.font = (10 * dpr) + 'px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Prediction (p)', PAD.left + plotW / 2, h - 2 * dpr);
    ctx.save();
    ctx.translate(12 * dpr, PAD.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Gradient', 0, 0);
    ctx.restore();

    // Curves
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      ctx.strokeStyle = lf.color;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      var started = false;
      for (var px = 0; px <= plotW; px++) {
        var pred = xMin + (px / plotW) * (xMax - xMin);
        var gVal = lf.grad(target, pred);
        if (!isFinite(gVal)) { started = false; continue; }
        gVal = Math.max(-gRange, Math.min(gRange, gVal));
        var cy = toY(gVal);
        var cx = PAD.left + px;
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });

    // Mouse crosshair
    if (mouseX !== null && mouseX >= PAD.left && mouseX <= PAD.left + plotW) {
      ctx.strokeStyle = s.muted;
      ctx.lineWidth = dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(mouseX, PAD.top);
      ctx.lineTo(mouseX, PAD.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function renderLegend() {
    var container = document.getElementById('lossLegend');
    container.innerHTML = '';
    lossFunctions.forEach(function(lf) {
      if (activeIds.indexOf(lf.id) < 0) return;
      var item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = '<span class="legend-swatch" style="background:' + lf.color + '"></span>' + lf.name;
      container.appendChild(item);
    });
  }

  function renderProperties() {
    var body = document.getElementById('propertiesBody');
    var active = lossFunctions.filter(function(f) { return activeIds.indexOf(f.id) >= 0; });
    if (active.length === 0) {
      body.innerHTML = '<p style="padding:var(--space-4);color:var(--color-text-muted);font-size:var(--font-size-sm);">Select loss functions to compare properties.</p>';
      return;
    }
    var html = '<table class="props-table"><thead><tr><th>Property</th>';
    active.forEach(function(f) { html += '<th>' + f.name + '</th>'; });
    html += '</tr></thead><tbody>';

    var rows = [
      { label: 'Formula', key: 'formula' },
      { label: 'Range', key: 'range' },
      { label: 'Gradient', key: 'gradient' },
      { label: 'Use Cases', key: 'useCases' },
      { label: 'Pros', key: 'pros' },
      { label: 'Cons', key: 'cons' }
    ];

    rows.forEach(function(row) {
      html += '<tr><td>' + row.label + '</td>';
      active.forEach(function(f) { html += '<td>' + f[row.key] + '</td>'; });
      html += '</tr>';
    });

    html += '</tbody></table>';
    body.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
