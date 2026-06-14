/**
 * KVSOVANREACH Gradient Descent Visualizer
 * Interactive optimization on 2D loss surfaces
 */
(function () {
  'use strict';

  // ==================== Constants ====================
  const OPTIMIZER_COLORS = {
    vanilla:  '#3b82f6',
    momentum: '#ef4444',
    rmsprop:  '#22c55e',
    adam:     '#f59e0b'
  };

  const OPTIMIZER_LABELS = {
    vanilla:  'Vanilla GD',
    momentum: 'Momentum',
    rmsprop:  'RMSProp',
    adam:     'Adam'
  };

  // ==================== Loss Functions ====================
  const LossFunctions = {
    bowl: {
      fn: (x, y) => x * x + y * y,
      grad: (x, y) => [2 * x, 2 * y],
      range: [-5, 5],
      name: 'Bowl (x\u00b2 + y\u00b2)'
    },
    rosenbrock: {
      fn: (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
      grad: (x, y) => [
        -2 * (1 - x) + 200 * (y - x * x) * (-2 * x),
        200 * (y - x * x)
      ],
      range: [-2, 2],
      name: 'Rosenbrock'
    },
    himmelblau: {
      fn: (x, y) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2,
      grad: (x, y) => [
        4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
        2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)
      ],
      range: [-5, 5],
      name: 'Himmelblau'
    },
    rastrigin: {
      fn: (x, y) => 20 + x * x - 10 * Math.cos(2 * Math.PI * x) + y * y - 10 * Math.cos(2 * Math.PI * y),
      grad: (x, y) => [
        2 * x + 20 * Math.PI * Math.sin(2 * Math.PI * x),
        2 * y + 20 * Math.PI * Math.sin(2 * Math.PI * y)
      ],
      range: [-5.12, 5.12],
      name: 'Rastrigin'
    }
  };

  // ==================== State ====================
  let currentFunction = 'bowl';
  let startPoint = null;
  let isPlaying = false;
  let animFrame = null;
  let currentStep = 0;
  let optimizerPaths = {};  // { optimizer_name: [{x, y, loss}] }
  let maxIterations = 200;
  let animSpeed = 10;
  let contourImage = null;

  // Canvas refs
  let surfaceCanvas, surfaceCtx, convCanvas, convCtx;
  let surfaceW, surfaceH, convW, convH;

  // ==================== DOM Refs ====================
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ==================== Init ====================
  function init() {
    surfaceCanvas = $('#surfaceCanvas');
    surfaceCtx = surfaceCanvas.getContext('2d');
    convCanvas = $('#convergenceCanvas');
    convCtx = convCanvas.getContext('2d');

    bindEvents();
    resizeCanvases();
    drawSurface();
    drawConvergence();
    updateLegend();

    window.addEventListener('resize', () => {
      resizeCanvases();
      drawSurface();
      drawPaths();
      drawConvergence();
    });

    // Theme change observer
    const observer = new MutationObserver(() => {
      contourImage = null;
      drawSurface();
      drawPaths();
      drawConvergence();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;

    const sContainer = $('#surfaceContainer');
    surfaceW = sContainer.clientWidth;
    surfaceH = sContainer.clientHeight;
    surfaceCanvas.width = surfaceW * dpr;
    surfaceCanvas.height = surfaceH * dpr;
    surfaceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cContainer = $('#convergenceContainer');
    convW = cContainer.clientWidth;
    convH = cContainer.clientHeight;
    convCanvas.width = convW * dpr;
    convCanvas.height = convH * dpr;
    convCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    contourImage = null;
  }

  // ==================== Event Binding ====================
  function bindEvents() {
    // Function buttons
    $$('.function-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.function-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFunction = btn.dataset.fn;
        resetAll();
        contourImage = null;
        drawSurface();
      });
    });

    // Optimizer checkboxes
    $$('.optimizer-check input').forEach(cb => {
      cb.addEventListener('change', () => {
        updateLegend();
        if (startPoint) {
          computeAllPaths();
          currentStep = 0;
          drawSurface();
          drawPaths();
          drawConvergence();
        }
      });
    });

    // Sliders
    $('#learningRate').addEventListener('input', (e) => {
      $('#lrValue').textContent = parseFloat(e.target.value).toFixed(3);
    });
    $('#momentumParam').addEventListener('input', (e) => {
      $('#momValue').textContent = parseFloat(e.target.value).toFixed(2);
    });
    $('#iterations').addEventListener('input', (e) => {
      $('#iterValue').textContent = e.target.value;
      maxIterations = parseInt(e.target.value);
    });
    $('#speed').addEventListener('input', (e) => {
      $('#speedValue').textContent = e.target.value;
      animSpeed = parseInt(e.target.value);
    });

    // Surface click
    surfaceCanvas.addEventListener('click', handleSurfaceClick);

    // Playback
    $('#playBtn').addEventListener('click', play);
    $('#pauseBtn').addEventListener('click', pause);
    $('#stepBtn').addEventListener('click', step);
    $('#resetBtn').addEventListener('click', resetAll);

    // Export
    $('#exportBtn').addEventListener('click', exportPNG);
  }

  // ==================== Surface Click ====================
  function handleSurfaceClick(e) {
    const rect = surfaceCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const lossFn = LossFunctions[currentFunction];
    const [lo, hi] = lossFn.range;
    const x = lo + (px / surfaceW) * (hi - lo);
    const y = lo + (py / surfaceH) * (hi - lo);

    startPoint = { x, y };
    $('#canvasHint').classList.add('hidden');

    pause();
    currentStep = 0;
    computeAllPaths();
    drawSurface();
    drawPaths();
    drawConvergence();
    updateStats(0);

    ToolsCommon.showToast(`Start: (${x.toFixed(2)}, ${y.toFixed(2)})`, 'info');
  }

  // ==================== Coordinate Mapping ====================
  function toCanvasX(x) {
    const [lo, hi] = LossFunctions[currentFunction].range;
    return ((x - lo) / (hi - lo)) * surfaceW;
  }

  function toCanvasY(y) {
    const [lo, hi] = LossFunctions[currentFunction].range;
    return ((y - lo) / (hi - lo)) * surfaceH;
  }

  // ==================== Drawing: Surface ====================
  function drawSurface() {
    if (contourImage) {
      surfaceCtx.putImageData(contourImage, 0, 0);
      // Re-draw at CSS resolution (putImageData uses pixel coords)
      // We'll re-render instead
    }

    const lossFn = LossFunctions[currentFunction];
    const [lo, hi] = lossFn.range;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Compute loss values for contour
    const resolution = Math.min(surfaceW, 300);
    const stepX = surfaceW / resolution;
    const stepY = surfaceH / resolution;

    // Collect all loss values for normalization
    const values = [];
    for (let py = 0; py < resolution; py++) {
      for (let px = 0; px < resolution; px++) {
        const x = lo + (px / resolution) * (hi - lo);
        const y = lo + (py / resolution) * (hi - lo);
        values.push(lossFn.fn(x, y));
      }
    }

    const maxLoss = percentile(values, 95);
    const minLoss = Math.min(...values);

    // Draw contour
    for (let py = 0; py < resolution; py++) {
      for (let px = 0; px < resolution; px++) {
        const x = lo + (px / resolution) * (hi - lo);
        const y = lo + (py / resolution) * (hi - lo);
        const loss = lossFn.fn(x, y);
        const t = Math.min(1, Math.max(0, (loss - minLoss) / (maxLoss - minLoss + 1e-10)));
        const color = contourColor(t, isDark);
        surfaceCtx.fillStyle = color;
        surfaceCtx.fillRect(px * stepX, py * stepY, stepX + 1, stepY + 1);
      }
    }

    // Draw contour lines
    drawContourLines(lossFn, lo, hi, minLoss, maxLoss, isDark);

    // Draw axis labels
    drawAxisLabels(lo, hi, isDark);
  }

  function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * p / 100);
    return sorted[idx];
  }

  function contourColor(t, isDark) {
    // Viridis-inspired colormap
    if (isDark) {
      const r = Math.round(68 + t * 150);
      const g = Math.round(1 + (1 - t) * 180 + t * 40);
      const b = Math.round(84 + (1 - t) * 120);
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(255 - t * 200);
      const g = Math.round(255 - t * 140);
      const b = Math.round(240 - t * 60);
      return `rgb(${r},${g},${b})`;
    }
  }

  function drawContourLines(lossFn, lo, hi, minLoss, maxLoss, isDark) {
    const numLines = 15;
    surfaceCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    surfaceCtx.lineWidth = 0.5;

    for (let i = 1; i <= numLines; i++) {
      const targetLoss = minLoss + (i / (numLines + 1)) * (maxLoss - minLoss);
      drawIsoLine(lossFn, lo, hi, targetLoss);
    }
  }

  function drawIsoLine(lossFn, lo, hi, target) {
    // Marching squares simplified: scan grid and draw segments
    const res = 80;
    const dx = (hi - lo) / res;
    const dy = (hi - lo) / res;

    for (let gy = 0; gy < res; gy++) {
      for (let gx = 0; gx < res; gx++) {
        const x0 = lo + gx * dx;
        const y0 = lo + gy * dy;
        const x1 = x0 + dx;
        const y1 = y0 + dy;

        const v00 = lossFn.fn(x0, y0) - target;
        const v10 = lossFn.fn(x1, y0) - target;
        const v01 = lossFn.fn(x0, y1) - target;
        const v11 = lossFn.fn(x1, y1) - target;

        const segments = marchingSquareSegments(v00, v10, v01, v11);
        for (const seg of segments) {
          const px0 = toCanvasX(x0 + seg[0] * dx);
          const py0 = toCanvasY(y0 + seg[1] * dy);
          const px1 = toCanvasX(x0 + seg[2] * dx);
          const py1 = toCanvasY(y0 + seg[3] * dy);
          surfaceCtx.beginPath();
          surfaceCtx.moveTo(px0, py0);
          surfaceCtx.lineTo(px1, py1);
          surfaceCtx.stroke();
        }
      }
    }
  }

  function marchingSquareSegments(v00, v10, v01, v11) {
    // Returns array of [x0,y0,x1,y1] in [0,1] cell coords
    const segments = [];
    const idx = (v00 > 0 ? 8 : 0) | (v10 > 0 ? 4 : 0) | (v11 > 0 ? 2 : 0) | (v01 > 0 ? 1 : 0);

    const interp = (a, b) => a / (a - b);

    const top    = () => interp(v00, v10);
    const bottom = () => interp(v01, v11);
    const left   = () => interp(v00, v01);
    const right  = () => interp(v10, v11);

    // Lookup table for marching squares
    switch (idx) {
      case 1: case 14: segments.push([0, left(), bottom(), 1]); break;
      case 2: case 13: segments.push([bottom(), 1, 1, right()]); break;
      case 3: case 12: segments.push([0, left(), 1, right()]); break;
      case 4: case 11: segments.push([top(), 0, 1, right()]); break;
      case 5:
        segments.push([0, left(), top(), 0]);
        segments.push([bottom(), 1, 1, right()]);
        break;
      case 6: case 9: segments.push([top(), 0, bottom(), 1]); break;
      case 7: case 8: segments.push([0, left(), top(), 0]); break;
      case 10:
        segments.push([0, left(), bottom(), 1]);
        segments.push([top(), 0, 1, right()]);
        break;
    }
    return segments;
  }

  function drawAxisLabels(lo, hi, isDark) {
    surfaceCtx.font = `11px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;
    surfaceCtx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    surfaceCtx.textAlign = 'center';

    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const v = lo + (i / ticks) * (hi - lo);
      const label = v.toFixed(1);
      // X axis
      const px = (i / ticks) * surfaceW;
      surfaceCtx.fillText(label, px, surfaceH - 4);
      // Y axis
      const py = (i / ticks) * surfaceH;
      surfaceCtx.save();
      surfaceCtx.textAlign = 'left';
      surfaceCtx.fillText(label, 4, py + 4);
      surfaceCtx.restore();
    }
  }

  // ==================== Optimizers ====================
  function getActiveOptimizers() {
    const active = [];
    $$('.optimizer-check input:checked').forEach(cb => {
      active.push(cb.dataset.opt);
    });
    return active;
  }

  function computeAllPaths() {
    if (!startPoint) return;
    optimizerPaths = {};
    const lr = parseFloat($('#learningRate').value);
    const mom = parseFloat($('#momentumParam').value);
    const lossFn = LossFunctions[currentFunction];

    for (const opt of getActiveOptimizers()) {
      optimizerPaths[opt] = runOptimizer(opt, startPoint.x, startPoint.y, lr, mom, lossFn);
    }
  }

  function runOptimizer(type, x0, y0, lr, beta, lossFn) {
    const path = [{ x: x0, y: y0, loss: lossFn.fn(x0, y0) }];
    let x = x0, y = y0;

    // State variables
    let vx = 0, vy = 0;         // velocity (momentum)
    let sx = 0, sy = 0;         // squared gradient cache (RMSProp/Adam)
    let mx = 0, my = 0;         // first moment (Adam)
    const eps = 1e-8;
    const beta2 = 0.999;        // RMSProp/Adam decay
    const [lo, hi] = lossFn.range;

    for (let i = 0; i < maxIterations; i++) {
      const [gx, gy] = lossFn.grad(x, y);

      // Clip gradients
      const gNorm = Math.sqrt(gx * gx + gy * gy);
      const maxGrad = 100;
      const scale = gNorm > maxGrad ? maxGrad / gNorm : 1;
      const cgx = gx * scale;
      const cgy = gy * scale;

      switch (type) {
        case 'vanilla':
          x -= lr * cgx;
          y -= lr * cgy;
          break;

        case 'momentum':
          vx = beta * vx + lr * cgx;
          vy = beta * vy + lr * cgy;
          x -= vx;
          y -= vy;
          break;

        case 'rmsprop':
          sx = beta2 * sx + (1 - beta2) * cgx * cgx;
          sy = beta2 * sy + (1 - beta2) * cgy * cgy;
          x -= lr * cgx / (Math.sqrt(sx) + eps);
          y -= lr * cgy / (Math.sqrt(sy) + eps);
          break;

        case 'adam':
          mx = beta * mx + (1 - beta) * cgx;
          my = beta * my + (1 - beta) * cgy;
          sx = beta2 * sx + (1 - beta2) * cgx * cgx;
          sy = beta2 * sy + (1 - beta2) * cgy * cgy;
          const t = i + 1;
          const mxh = mx / (1 - Math.pow(beta, t));
          const myh = my / (1 - Math.pow(beta, t));
          const sxh = sx / (1 - Math.pow(beta2, t));
          const syh = sy / (1 - Math.pow(beta2, t));
          x -= lr * mxh / (Math.sqrt(sxh) + eps);
          y -= lr * myh / (Math.sqrt(syh) + eps);
          break;
      }

      // Clamp to range
      x = Math.max(lo, Math.min(hi, x));
      y = Math.max(lo, Math.min(hi, y));

      path.push({ x, y, loss: lossFn.fn(x, y) });
    }

    return path;
  }

  // ==================== Drawing: Paths ====================
  function drawPaths() {
    const maxStep = currentStep;

    for (const [opt, path] of Object.entries(optimizerPaths)) {
      const color = OPTIMIZER_COLORS[opt];
      const steps = Math.min(maxStep + 1, path.length);

      if (steps < 2) {
        // Draw starting dot only
        if (path.length > 0) {
          surfaceCtx.beginPath();
          surfaceCtx.arc(toCanvasX(path[0].x), toCanvasY(path[0].y), 5, 0, Math.PI * 2);
          surfaceCtx.fillStyle = color;
          surfaceCtx.fill();
          surfaceCtx.strokeStyle = 'white';
          surfaceCtx.lineWidth = 1.5;
          surfaceCtx.stroke();
        }
        continue;
      }

      // Draw line
      surfaceCtx.beginPath();
      surfaceCtx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y));
      for (let i = 1; i < steps; i++) {
        surfaceCtx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y));
      }
      surfaceCtx.strokeStyle = color;
      surfaceCtx.lineWidth = 2;
      surfaceCtx.globalAlpha = 0.8;
      surfaceCtx.stroke();
      surfaceCtx.globalAlpha = 1;

      // Draw dots
      for (let i = 0; i < steps; i++) {
        const r = i === steps - 1 ? 5 : 2.5;
        surfaceCtx.beginPath();
        surfaceCtx.arc(toCanvasX(path[i].x), toCanvasY(path[i].y), r, 0, Math.PI * 2);
        surfaceCtx.fillStyle = color;
        surfaceCtx.fill();
        if (i === steps - 1) {
          surfaceCtx.strokeStyle = 'white';
          surfaceCtx.lineWidth = 2;
          surfaceCtx.stroke();
        }
      }
    }

    // Draw start point marker
    if (startPoint) {
      surfaceCtx.beginPath();
      surfaceCtx.arc(toCanvasX(startPoint.x), toCanvasY(startPoint.y), 7, 0, Math.PI * 2);
      surfaceCtx.strokeStyle = 'white';
      surfaceCtx.lineWidth = 2.5;
      surfaceCtx.stroke();
      surfaceCtx.beginPath();
      surfaceCtx.arc(toCanvasX(startPoint.x), toCanvasY(startPoint.y), 7, 0, Math.PI * 2);
      surfaceCtx.strokeStyle = 'rgba(0,0,0,0.4)';
      surfaceCtx.lineWidth = 1;
      surfaceCtx.stroke();
    }
  }

  // ==================== Drawing: Convergence ====================
  function drawConvergence() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

    convCtx.fillStyle = bgColor;
    convCtx.fillRect(0, 0, convW, convH);

    const pad = { top: 15, right: 15, bottom: 30, left: 55 };
    const plotW = convW - pad.left - pad.right;
    const plotH = convH - pad.top - pad.bottom;

    if (Object.keys(optimizerPaths).length === 0 || currentStep === 0) {
      // Empty state
      convCtx.fillStyle = textColor;
      convCtx.font = '13px sans-serif';
      convCtx.textAlign = 'center';
      convCtx.fillText('Run optimization to see convergence', convW / 2, convH / 2);
      return;
    }

    // Find max loss for Y scale
    let maxLoss = 0;
    let maxLen = 0;
    for (const path of Object.values(optimizerPaths)) {
      const steps = Math.min(currentStep + 1, path.length);
      maxLen = Math.max(maxLen, steps);
      for (let i = 0; i < steps; i++) {
        if (isFinite(path[i].loss)) maxLoss = Math.max(maxLoss, path[i].loss);
      }
    }
    if (maxLoss === 0) maxLoss = 1;

    // Use log scale if range is large
    const useLog = maxLoss > 100;
    const yScale = useLog
      ? (v) => pad.top + plotH - (Math.log10(Math.max(v, 1e-10)) - Math.log10(1e-10)) / (Math.log10(maxLoss) - Math.log10(1e-10)) * plotH
      : (v) => pad.top + plotH - (v / maxLoss) * plotH;

    // Grid
    convCtx.strokeStyle = gridColor;
    convCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.top + (i / 4) * plotH;
      convCtx.beginPath();
      convCtx.moveTo(pad.left, gy);
      convCtx.lineTo(pad.left + plotW, gy);
      convCtx.stroke();
    }

    // Y-axis labels
    convCtx.fillStyle = textColor;
    convCtx.font = `10px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;
    convCtx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const gy = pad.top + (i / 4) * plotH;
      let val;
      if (useLog) {
        const logMin = Math.log10(1e-10);
        const logMax = Math.log10(maxLoss);
        val = Math.pow(10, logMax - (i / 4) * (logMax - logMin));
        convCtx.fillText(val.toExponential(0), pad.left - 5, gy + 3);
      } else {
        val = maxLoss * (1 - i / 4);
        convCtx.fillText(val < 10 ? val.toFixed(2) : val.toFixed(0), pad.left - 5, gy + 3);
      }
    }

    // X-axis labels
    convCtx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const gx = pad.left + (i / 4) * plotW;
      const val = Math.round((i / 4) * (maxLen - 1));
      convCtx.fillText(val, gx, convH - pad.bottom + 15);
    }

    // Axis titles
    convCtx.fillStyle = textColor;
    convCtx.font = '11px sans-serif';
    convCtx.textAlign = 'center';
    convCtx.fillText('Iteration', pad.left + plotW / 2, convH - 3);

    // Plot lines
    for (const [opt, path] of Object.entries(optimizerPaths)) {
      const color = OPTIMIZER_COLORS[opt];
      const steps = Math.min(currentStep + 1, path.length);
      if (steps < 1) continue;

      convCtx.beginPath();
      for (let i = 0; i < steps; i++) {
        const px = pad.left + (i / Math.max(maxLen - 1, 1)) * plotW;
        const py = yScale(path[i].loss);
        if (i === 0) convCtx.moveTo(px, py);
        else convCtx.lineTo(px, py);
      }
      convCtx.strokeStyle = color;
      convCtx.lineWidth = 2;
      convCtx.stroke();
    }
  }

  // ==================== Animation ====================
  function play() {
    if (!startPoint) {
      ToolsCommon.showToast('Click on the surface to set a starting point', 'warning');
      return;
    }

    if (Object.keys(optimizerPaths).length === 0) {
      computeAllPaths();
    }

    isPlaying = true;
    $('#playBtn').disabled = true;
    $('#pauseBtn').disabled = false;

    animate();
  }

  function pause() {
    isPlaying = false;
    $('#playBtn').disabled = false;
    $('#pauseBtn').disabled = true;
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  function step() {
    if (!startPoint) {
      ToolsCommon.showToast('Click on the surface to set a starting point', 'warning');
      return;
    }

    if (Object.keys(optimizerPaths).length === 0) {
      computeAllPaths();
    }

    pause();
    if (currentStep < maxIterations) {
      currentStep++;
      drawSurface();
      drawPaths();
      drawConvergence();
      updateStats(currentStep);
    }
  }

  function resetAll() {
    pause();
    startPoint = null;
    currentStep = 0;
    optimizerPaths = {};
    $('#canvasHint').classList.remove('hidden');
    contourImage = null;
    drawSurface();
    drawConvergence();
    updateStats(0);
    updateLegend();
  }

  let lastAnimTime = 0;

  function animate(timestamp) {
    if (!isPlaying) return;

    if (!timestamp) {
      lastAnimTime = 0;
      animFrame = requestAnimationFrame(animate);
      return;
    }

    if (!lastAnimTime) lastAnimTime = timestamp;
    const elapsed = timestamp - lastAnimTime;
    const interval = 1000 / animSpeed;

    if (elapsed >= interval) {
      lastAnimTime = timestamp;

      if (currentStep < maxIterations) {
        currentStep++;
        drawSurface();
        drawPaths();
        drawConvergence();
        updateStats(currentStep);
      } else {
        pause();
        ToolsCommon.showToast('Optimization complete', 'success');
        return;
      }
    }

    animFrame = requestAnimationFrame(animate);
  }

  // ==================== UI Updates ====================
  function updateStats(step) {
    $('#statIter').textContent = step;

    if (step === 0 || Object.keys(optimizerPaths).length === 0) {
      $('#statPos').textContent = startPoint ? `(${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)})` : '(-, -)';
      $('#statLoss').textContent = startPoint ? LossFunctions[currentFunction].fn(startPoint.x, startPoint.y).toFixed(4) : '-';
      return;
    }

    // Show first active optimizer's current state
    const firstOpt = Object.keys(optimizerPaths)[0];
    if (firstOpt) {
      const path = optimizerPaths[firstOpt];
      const idx = Math.min(step, path.length - 1);
      const pt = path[idx];
      $('#statPos').textContent = `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`;
      $('#statLoss').textContent = pt.loss < 0.001 ? pt.loss.toExponential(2) : pt.loss.toFixed(4);
    }
  }

  function updateLegend() {
    const container = $('#legendList');
    container.innerHTML = '';

    for (const opt of getActiveOptimizers()) {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.backgroundColor = OPTIMIZER_COLORS[opt];

      const label = document.createElement('span');
      label.textContent = OPTIMIZER_LABELS[opt];

      const loss = document.createElement('span');
      loss.className = 'legend-loss';
      loss.id = `legend-loss-${opt}`;

      if (optimizerPaths[opt] && currentStep > 0) {
        const path = optimizerPaths[opt];
        const idx = Math.min(currentStep, path.length - 1);
        loss.textContent = path[idx].loss < 0.001 ? path[idx].loss.toExponential(2) : path[idx].loss.toFixed(4);
      } else {
        loss.textContent = '-';
      }

      item.appendChild(dot);
      item.appendChild(label);
      item.appendChild(loss);
      container.appendChild(item);
    }
  }

  // ==================== Export ====================
  function exportPNG() {
    // Create combined canvas
    const dpr = window.devicePixelRatio || 1;
    const exportCanvas = document.createElement('canvas');
    const gap = 20;
    const totalH = surfaceH + gap + 200;
    exportCanvas.width = surfaceW * dpr;
    exportCanvas.height = totalH * dpr;
    const ctx = exportCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, surfaceW, totalH);

    // Copy surface
    ctx.drawImage(surfaceCanvas, 0, 0, surfaceW, surfaceH);

    // Copy convergence
    ctx.drawImage(convCanvas, 0, surfaceH + gap, surfaceW, 200);

    const link = document.createElement('a');
    link.download = `gradient-descent-${currentFunction}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    ToolsCommon.showToast('Exported as PNG', 'success');
  }

  // ==================== Start ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
