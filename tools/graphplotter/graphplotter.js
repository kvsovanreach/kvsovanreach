/**
 * KVSOVANREACH Graph Plotter Tool
 * Plot mathematical functions with zoom, pan, derivatives, and intercepts
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const COLORS = ['#91214E', '#2563eb', '#16a34a', '#ea580c', '#7c3aed'];
  const DERIVATIVE_ALPHA = 0.5;
  const MAX_FUNCTIONS = 5;
  const ZOOM_FACTOR = 1.15;
  const PAN_SENSITIVITY = 1;
  const GRID_COLOR_LIGHT = '#e5e7eb';
  const GRID_COLOR_DARK = '#333';
  const AXIS_COLOR_LIGHT = '#374151';
  const AXIS_COLOR_DARK = '#ccc';
  const LABEL_COLOR_LIGHT = '#6b7280';
  const LABEL_COLOR_DARK = '#9ca3af';

  // ==================== DOM ====================
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  const fnList = document.getElementById('fnList');
  const addFnBtn = document.getElementById('addFnBtn');
  const plotBtn = document.getElementById('plotBtn');
  const resetViewBtn = document.getElementById('resetViewBtn');
  const xMinInput = document.getElementById('xMin');
  const xMaxInput = document.getElementById('xMax');
  const yMinInput = document.getElementById('yMin');
  const yMaxInput = document.getElementById('yMax');
  const gridToggle = document.getElementById('gridToggle');
  const derivativeToggle = document.getElementById('derivativeToggle');
  const intersectionToggle = document.getElementById('intersectionToggle');
  const coordsDisplay = document.getElementById('coordsDisplay');

  // ==================== State ====================
  let functions = [];
  let view = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let dragViewStart = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

  // ==================== Math Parser ====================

  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (/\s/.test(ch)) { i++; continue; }

      // Number
      if (/[0-9.]/.test(ch)) {
        let num = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
        tokens.push({ type: 'num', value: parseFloat(num) });
        continue;
      }

      // Letter (function name or variable or constant)
      if (/[a-zA-Z]/.test(ch)) {
        let name = '';
        while (i < expr.length && /[a-zA-Z]/.test(expr[i])) { name += expr[i]; i++; }
        if (name === 'pi') { tokens.push({ type: 'num', value: Math.PI }); }
        else if (name === 'e' && (i >= expr.length || expr[i] !== '(')) {
          // 'e' not followed by '(' is Euler's number; 'e(' would be parsed but we only have known fns
          tokens.push({ type: 'num', value: Math.E });
        }
        else if (name === 'x') { tokens.push({ type: 'var' }); }
        else { tokens.push({ type: 'fn', value: name }); }
        continue;
      }

      if ('+-*/^()'.includes(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }

      i++; // skip unknown
    }

    // Insert implicit multiplication: num|)|var before fn|var|(|num
    const result = [];
    for (let j = 0; j < tokens.length; j++) {
      result.push(tokens[j]);
      if (j + 1 < tokens.length) {
        const a = tokens[j];
        const b = tokens[j + 1];
        const aRight = a.type === 'num' || a.type === 'var' || (a.type === 'op' && a.value === ')');
        const bLeft = b.type === 'num' || b.type === 'var' || b.type === 'fn' || (b.type === 'op' && b.value === '(');
        if (aRight && bLeft) {
          result.push({ type: 'op', value: '*' });
        }
      }
    }
    return result;
  }

  function parseExpr(tokens, pos) {
    return parseAddSub(tokens, pos);
  }

  function parseAddSub(tokens, pos) {
    let [left, p] = parseMulDiv(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'op' && (tokens[p].value === '+' || tokens[p].value === '-')) {
      const op = tokens[p].value;
      const [right, np] = parseMulDiv(tokens, p + 1);
      left = op === '+' ? (x => { const l = left(x), r = right(x); return l + r; })
                         : (x => { const l = left(x), r = right(x); return l - r; });
      p = np;
    }
    return [left, p];
  }

  function parseMulDiv(tokens, pos) {
    let [left, p] = parseUnary(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'op' && (tokens[p].value === '*' || tokens[p].value === '/')) {
      const op = tokens[p].value;
      const [right, np] = parseUnary(tokens, p + 1);
      left = op === '*' ? (x => { const l = left(x), r = right(x); return l * r; })
                         : (x => { const l = left(x), r = right(x); return l / r; });
      p = np;
    }
    return [left, p];
  }

  function parseUnary(tokens, pos) {
    if (pos < tokens.length && tokens[pos].type === 'op' && (tokens[pos].value === '-' || tokens[pos].value === '+')) {
      const sign = tokens[pos].value;
      const [expr, p] = parsePower(tokens, pos + 1);
      if (sign === '-') return [x => -expr(x), p];
      return [expr, p];
    }
    return parsePower(tokens, pos);
  }

  function parsePower(tokens, pos) {
    let [base, p] = parseAtom(tokens, pos);
    if (p < tokens.length && tokens[p].type === 'op' && tokens[p].value === '^') {
      const [exp, np] = parseUnary(tokens, p + 1); // right-associative
      base = (x => { const b = base(x), e = exp(x); return Math.pow(b, e); });
      p = np;
    }
    return [base, p];
  }

  function parseAtom(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Unexpected end of expression');

    const t = tokens[pos];

    if (t.type === 'num') {
      const v = t.value;
      return [() => v, pos + 1];
    }

    if (t.type === 'var') {
      return [x => x, pos + 1];
    }

    if (t.type === 'fn') {
      const fnName = t.value;
      // Expect '(' after function name
      if (pos + 1 >= tokens.length || tokens[pos + 1].type !== 'op' || tokens[pos + 1].value !== '(') {
        throw new Error('Expected ( after ' + fnName);
      }
      const [arg, p] = parseExpr(tokens, pos + 2);
      if (p >= tokens.length || tokens[p].type !== 'op' || tokens[p].value !== ')') {
        throw new Error('Expected ) after ' + fnName + ' argument');
      }
      const fn = getMathFn(fnName);
      return [x => fn(arg(x)), p + 1];
    }

    if (t.type === 'op' && t.value === '(') {
      const [expr, p] = parseExpr(tokens, pos + 1);
      if (p >= tokens.length || tokens[p].type !== 'op' || tokens[p].value !== ')') {
        throw new Error('Expected closing )');
      }
      return [expr, p + 1];
    }

    throw new Error('Unexpected token: ' + JSON.stringify(t));
  }

  function getMathFn(name) {
    const fns = {
      sin: Math.sin, cos: Math.cos, tan: Math.tan,
      asin: Math.asin, acos: Math.acos, atan: Math.atan,
      log: Math.log10, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs,
      ceil: Math.ceil, floor: Math.floor, round: Math.round,
      exp: Math.exp, sign: Math.sign
    };
    if (fns[name]) return fns[name];
    throw new Error('Unknown function: ' + name);
  }

  function compileFn(expr) {
    if (!expr.trim()) return null;
    try {
      const tokens = tokenize(expr);
      const [fn, pos] = parseExpr(tokens, 0);
      if (pos < tokens.length) throw new Error('Unexpected content after expression');
      // Test evaluation
      fn(1);
      return fn;
    } catch (e) {
      return null;
    }
  }

  // ==================== Numerical Derivative ====================
  function numericalDerivative(fn, x) {
    const h = 1e-7;
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }

  // ==================== Find X-Intercepts ====================
  function findXIntercepts(fn, xMin, xMax) {
    const intercepts = [];
    const steps = 500;
    const dx = (xMax - xMin) / steps;
    for (let i = 0; i < steps; i++) {
      const x1 = xMin + i * dx;
      const x2 = x1 + dx;
      const y1 = fn(x1);
      const y2 = fn(x2);
      if (!isFinite(y1) || !isFinite(y2)) continue;
      if (y1 * y2 <= 0) {
        // Bisection
        let lo = x1, hi = x2;
        for (let j = 0; j < 50; j++) {
          const mid = (lo + hi) / 2;
          const yMid = fn(mid);
          if (!isFinite(yMid)) break;
          if (Math.abs(yMid) < 1e-12) { lo = hi = mid; break; }
          if (yMid * fn(lo) < 0) hi = mid;
          else lo = mid;
        }
        const root = (lo + hi) / 2;
        // Avoid duplicates
        if (intercepts.length === 0 || Math.abs(root - intercepts[intercepts.length - 1]) > dx * 0.5) {
          intercepts.push(root);
        }
      }
    }
    return intercepts;
  }

  // ==================== Canvas Utilities ====================
  function resizeCanvas() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(w * 0.65, 500);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function worldToCanvas(wx, wy, w, h) {
    const px = (wx - view.xMin) / (view.xMax - view.xMin) * w;
    const py = (1 - (wy - view.yMin) / (view.yMax - view.yMin)) * h;
    return { x: px, y: py };
  }

  function canvasToWorld(cx, cy, w, h) {
    const wx = view.xMin + cx / w * (view.xMax - view.xMin);
    const wy = view.yMax - cy / h * (view.yMax - view.yMin);
    return { x: wx, y: wy };
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  // ==================== Drawing ====================
  function draw() {
    const { w, h } = resizeCanvas();
    const dark = isDark();

    // Background
    ctx.fillStyle = dark ? '#1a1a2e' : '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (gridToggle.checked) {
      drawGrid(w, h, dark);
    }

    // Axes
    drawAxes(w, h, dark);

    // Functions
    functions.forEach((item, idx) => {
      if (!item.fn) return;
      const color = COLORS[idx % COLORS.length];
      drawFunction(item.fn, color, 2, w, h);

      // Derivative
      if (derivativeToggle.checked) {
        drawFunction(x => numericalDerivative(item.fn, x), color, 1.5, w, h, [6, 4], DERIVATIVE_ALPHA);
      }

      // X-Intercepts
      if (intersectionToggle.checked) {
        const intercepts = findXIntercepts(item.fn, view.xMin, view.xMax);
        intercepts.forEach(root => {
          const pt = worldToCanvas(root, 0, w, h);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = dark ? '#1a1a2e' : '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label
          ctx.fillStyle = dark ? '#ddd' : '#333';
          ctx.font = '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(root.toFixed(2), pt.x, pt.y - 10);
        });
      }
    });
  }

  function drawGrid(w, h, dark) {
    ctx.strokeStyle = dark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT;
    ctx.lineWidth = 0.5;

    const xRange = view.xMax - view.xMin;
    const yRange = view.yMax - view.yMin;
    const xStep = niceStep(xRange);
    const yStep = niceStep(yRange);

    // Vertical grid lines
    let x = Math.ceil(view.xMin / xStep) * xStep;
    while (x <= view.xMax) {
      const pt = worldToCanvas(x, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(pt.x, 0);
      ctx.lineTo(pt.x, h);
      ctx.stroke();
      x += xStep;
    }

    // Horizontal grid lines
    let y = Math.ceil(view.yMin / yStep) * yStep;
    while (y <= view.yMax) {
      const pt = worldToCanvas(0, y, w, h);
      ctx.beginPath();
      ctx.moveTo(0, pt.y);
      ctx.lineTo(w, pt.y);
      ctx.stroke();
      y += yStep;
    }
  }

  function drawAxes(w, h, dark) {
    const axisColor = dark ? AXIS_COLOR_DARK : AXIS_COLOR_LIGHT;
    const labelColor = dark ? LABEL_COLOR_DARK : LABEL_COLOR_LIGHT;

    // X axis
    const originY = worldToCanvas(0, 0, w, h);
    if (originY.y >= 0 && originY.y <= h) {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, originY.y);
      ctx.lineTo(w, originY.y);
      ctx.stroke();
    }

    // Y axis
    const originX = worldToCanvas(0, 0, w, h);
    if (originX.x >= 0 && originX.x <= w) {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX.x, 0);
      ctx.lineTo(originX.x, h);
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = labelColor;
    ctx.font = '11px monospace';

    const xRange = view.xMax - view.xMin;
    const yRange = view.yMax - view.yMin;
    const xStep = niceStep(xRange);
    const yStep = niceStep(yRange);

    // X-axis labels
    let xLabel = Math.ceil(view.xMin / xStep) * xStep;
    while (xLabel <= view.xMax) {
      if (Math.abs(xLabel) > xStep * 0.01) {
        const pt = worldToCanvas(xLabel, 0, w, h);
        const labelY = Math.min(Math.max(originY.y + 15, 15), h - 5);
        ctx.textAlign = 'center';
        ctx.fillText(formatLabel(xLabel), pt.x, labelY);
      }
      xLabel += xStep;
    }

    // Y-axis labels
    let yLabel = Math.ceil(view.yMin / yStep) * yStep;
    while (yLabel <= view.yMax) {
      if (Math.abs(yLabel) > yStep * 0.01) {
        const pt = worldToCanvas(0, yLabel, w, h);
        const labelX = Math.min(Math.max(originX.x - 8, 30), w - 5);
        ctx.textAlign = 'right';
        ctx.fillText(formatLabel(yLabel), labelX, pt.y + 4);
      }
      yLabel += yStep;
    }
  }

  function drawFunction(fn, color, lineWidth, w, h, dash, alpha) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = alpha || 1;
    if (dash) ctx.setLineDash(dash);
    else ctx.setLineDash([]);

    ctx.beginPath();
    let started = false;
    const steps = w * 2;
    for (let i = 0; i <= steps; i++) {
      const wx = view.xMin + (i / steps) * (view.xMax - view.xMin);
      let wy;
      try { wy = fn(wx); } catch { wy = NaN; }

      if (!isFinite(wy) || Math.abs(wy) > 1e10) {
        started = false;
        continue;
      }

      const pt = worldToCanvas(wx, wy, w, h);
      if (!started) {
        ctx.moveTo(pt.x, pt.y);
        started = true;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function niceStep(range) {
    const rough = range / 10;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step;
    if (norm < 1.5) step = 1;
    else if (norm < 3.5) step = 2;
    else if (norm < 7.5) step = 5;
    else step = 10;
    return step * pow;
  }

  function formatLabel(val) {
    if (Math.abs(val) >= 1000 || (Math.abs(val) < 0.01 && val !== 0)) {
      return val.toExponential(1);
    }
    const s = val.toFixed(4).replace(/\.?0+$/, '');
    return s;
  }

  // ==================== Function Row Management ====================
  function createFnRow(index, expr) {
    const row = document.createElement('div');
    row.className = 'gp-fn-row';
    row.dataset.index = index;

    const colorDot = document.createElement('div');
    colorDot.className = 'gp-fn-color';
    colorDot.style.backgroundColor = COLORS[index % COLORS.length];

    const label = document.createElement('span');
    label.className = 'gp-fn-label';
    label.textContent = 'f' + (index + 1) + '(x)=';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gp-fn-input';
    input.placeholder = 'e.g. sin(x), x^2-3';
    input.value = expr || '';
    input.autocomplete = 'off';
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') plotAll();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gp-fn-remove';
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.title = 'Remove function';
    removeBtn.addEventListener('click', function() {
      removeFnRow(index);
    });

    row.appendChild(colorDot);
    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(removeBtn);
    return row;
  }

  function rebuildFnList() {
    fnList.innerHTML = '';
    functions.forEach(function(item, idx) {
      const row = createFnRow(idx, item.expr);
      fnList.appendChild(row);
    });
    updateRemoveButtons();
  }

  function updateRemoveButtons() {
    const btns = fnList.querySelectorAll('.gp-fn-remove');
    btns.forEach(function(btn) {
      btn.disabled = functions.length <= 1;
    });
  }

  function addFunction(expr) {
    if (functions.length >= MAX_FUNCTIONS) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Maximum ' + MAX_FUNCTIONS + ' functions allowed', 'warning');
      }
      return;
    }
    functions.push({ expr: expr || '', fn: compileFn(expr || '') });
    rebuildFnList();
  }

  function removeFnRow(index) {
    if (functions.length <= 1) return;
    functions.splice(index, 1);
    rebuildFnList();
    plotAll();
  }

  function readFnInputs() {
    const inputs = fnList.querySelectorAll('.gp-fn-input');
    inputs.forEach(function(input, idx) {
      if (idx < functions.length) {
        functions[idx].expr = input.value;
        functions[idx].fn = compileFn(input.value);
      }
    });
  }

  // ==================== Plot ====================
  function plotAll() {
    readFnInputs();
    syncViewInputs();

    // Validate at least one function
    const hasValid = functions.some(function(f) { return f.fn !== null; });
    if (!hasValid && functions.some(function(f) { return f.expr.trim() !== ''; })) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Invalid expression. Check syntax.', 'error');
      }
    }

    draw();
  }

  function syncViewInputs() {
    view.xMin = parseFloat(xMinInput.value) || -10;
    view.xMax = parseFloat(xMaxInput.value) || 10;
    view.yMin = parseFloat(yMinInput.value) || -10;
    view.yMax = parseFloat(yMaxInput.value) || 10;
    if (view.xMin >= view.xMax) { view.xMin = -10; view.xMax = 10; }
    if (view.yMin >= view.yMax) { view.yMin = -10; view.yMax = 10; }
  }

  function updateViewInputs() {
    xMinInput.value = parseFloat(view.xMin.toFixed(4));
    xMaxInput.value = parseFloat(view.xMax.toFixed(4));
    yMinInput.value = parseFloat(view.yMin.toFixed(4));
    yMaxInput.value = parseFloat(view.yMax.toFixed(4));
  }

  // ==================== Zoom & Pan ====================
  canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const wPt = canvasToWorld(cx, cy, rect.width, rect.height);

    const factor = e.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    view.xMin = wPt.x + (view.xMin - wPt.x) * factor;
    view.xMax = wPt.x + (view.xMax - wPt.x) * factor;
    view.yMin = wPt.y + (view.yMin - wPt.y) * factor;
    view.yMax = wPt.y + (view.yMax - wPt.y) * factor;

    updateViewInputs();
    draw();
  }, { passive: false });

  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    dragViewStart = { xMin: view.xMin, xMax: view.xMax, yMin: view.yMin, yMax: view.yMax };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - dragStart.x) / rect.width * (dragViewStart.xMax - dragViewStart.xMin);
      const dy = (e.clientY - dragStart.y) / rect.height * (dragViewStart.yMax - dragViewStart.yMin);
      view.xMin = dragViewStart.xMin - dx * PAN_SENSITIVITY;
      view.xMax = dragViewStart.xMax - dx * PAN_SENSITIVITY;
      view.yMin = dragViewStart.yMin + dy * PAN_SENSITIVITY;
      view.yMax = dragViewStart.yMax + dy * PAN_SENSITIVITY;
      updateViewInputs();
      draw();
    }

    // Coordinates display
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (cx >= 0 && cx <= rect.width && cy >= 0 && cy <= rect.height) {
      const wPt = canvasToWorld(cx, cy, rect.width, rect.height);
      coordsDisplay.textContent = 'x: ' + wPt.x.toFixed(3) + ', y: ' + wPt.y.toFixed(3);
    }
  });

  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'crosshair';
    }
  });

  // Touch support
  let lastTouchDist = 0;
  let touchCenter = null;

  canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragViewStart = { xMin: view.xMin, xMax: view.xMax, yMin: view.yMin, yMax: view.yMax };
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      touchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && isDragging) {
      const rect = canvas.getBoundingClientRect();
      const dx = (e.touches[0].clientX - dragStart.x) / rect.width * (dragViewStart.xMax - dragViewStart.xMin);
      const dy = (e.touches[0].clientY - dragStart.y) / rect.height * (dragViewStart.yMax - dragViewStart.yMin);
      view.xMin = dragViewStart.xMin - dx;
      view.xMax = dragViewStart.xMax - dx;
      view.yMin = dragViewStart.yMin + dy;
      view.yMax = dragViewStart.yMax + dy;
      updateViewInputs();
      draw();
    } else if (e.touches.length === 2 && touchCenter) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = lastTouchDist / dist;
      const rect = canvas.getBoundingClientRect();
      const wPt = canvasToWorld(touchCenter.x - rect.left, touchCenter.y - rect.top, rect.width, rect.height);

      view.xMin = wPt.x + (view.xMin - wPt.x) * factor;
      view.xMax = wPt.x + (view.xMax - wPt.x) * factor;
      view.yMin = wPt.y + (view.yMin - wPt.y) * factor;
      view.yMax = wPt.y + (view.yMax - wPt.y) * factor;

      lastTouchDist = dist;
      updateViewInputs();
      draw();
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', function() {
    isDragging = false;
    lastTouchDist = 0;
    touchCenter = null;
  });

  // ==================== Event Listeners ====================
  plotBtn.addEventListener('click', plotAll);

  resetViewBtn.addEventListener('click', function() {
    view = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    updateViewInputs();
    draw();
  });

  addFnBtn.addEventListener('click', function() {
    addFunction('');
  });

  gridToggle.addEventListener('change', draw);
  derivativeToggle.addEventListener('change', draw);
  intersectionToggle.addEventListener('change', draw);

  // Presets
  document.querySelectorAll('.preset-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const expr = btn.dataset.fn;
      // Set as first function
      functions = [{ expr: expr, fn: compileFn(expr) }];
      rebuildFnList();

      // Adjust view for specific presets
      if (expr === 'log(x)' || expr === 'sqrt(x)') {
        view = { xMin: -2, xMax: 15, yMin: -5, yMax: 5 };
      } else if (expr === 'e^x') {
        view = { xMin: -5, xMax: 5, yMin: -2, yMax: 20 };
      } else if (expr === '1/x') {
        view = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
      } else {
        view = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
      }
      updateViewInputs();
      draw();

      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Loaded: ' + expr, 'success');
      }
    });
  });

  // Window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 100);
  });

  // Theme changes
  const observer = new MutationObserver(function() { draw(); });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ==================== Init ====================
  addFunction('sin(x)');
  syncViewInputs();
  draw();

})();
