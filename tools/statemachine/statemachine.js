/**
 * KVSOVANREACH State Machine Simulator
 * Finite State Machine builder, visualizer, and tester
 */

(function() {
  'use strict';

  // DOM Elements
  const canvas = document.getElementById('fsmCanvas');
  const ctx = canvas.getContext('2d');
  const canvasHint = document.getElementById('canvasHint');
  const presetSelect = document.getElementById('presetSelect');
  const testInput = document.getElementById('testInput');
  const testResult = document.getElementById('testResult');
  const testTrace = document.getElementById('testTrace');
  const transitionTable = document.getElementById('transitionTable');
  const tableEmpty = document.getElementById('tableEmpty');
  const fileInput = document.getElementById('fileInput');

  const modeBtns = document.querySelectorAll('.fsm-btn-mode');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const runTestBtn = document.getElementById('runTestBtn');
  const stepTestBtn = document.getElementById('stepTestBtn');
  const resetTestBtn = document.getElementById('resetTestBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');

  // Constants
  const STATE_RADIUS = 30;
  const ARROW_SIZE = 10;
  const SELF_LOOP_RADIUS = 22;
  const COLORS = {
    stateFill: '#ffffff',
    stateFillDark: '#1e1e2e',
    stateStroke: '#374151',
    stateStrokeDark: '#9ca3af',
    initial: '#10b981',
    accept: '#91214E',
    active: '#3b82f6',
    activeFill: 'rgba(59, 130, 246, 0.15)',
    transLine: '#6b7280',
    transLineDark: '#9ca3af',
    text: '#1f2937',
    textDark: '#e5e7eb',
    label: '#374151',
    labelDark: '#d1d5db'
  };

  // State
  let mode = 'select';
  let states = []; // {id, name, x, y, isInitial, isAccept}
  let transitions = []; // {from, to, label}
  let nextId = 0;
  let dragState = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let transitionSource = null;
  let selectedState = null;

  // Test state
  let testState = {
    running: false,
    inputStr: '',
    currentIndex: 0,
    currentStateId: null,
    trace: [],
    animTimer: null
  };

  // Canvas sizing
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.max(400, Math.min(500, rect.width * 0.5));
    draw();
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  // Dark mode detection
  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  // Draw everything
  function draw() {
    const dark = isDark();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw transitions
    transitions.forEach(t => {
      const from = states.find(s => s.id === t.from);
      const to = states.find(s => s.id === t.to);
      if (!from || !to) return;

      const isActive = testState.running &&
        testState.currentIndex > 0 &&
        testState.trace.length > 1 &&
        testState.trace[testState.currentIndex - 1] === t.from &&
        testState.trace[testState.currentIndex] === t.to;

      if (t.from === t.to) {
        drawSelfLoop(from, t.label, isActive, dark);
      } else {
        drawArrow(from, to, t.label, isActive, dark);
      }
    });

    // Draw states
    states.forEach(s => {
      const isActiveState = testState.running && testState.currentStateId === s.id;
      drawState(s, isActiveState, dark);
    });

    // Draw transition source indicator
    if (mode === 'addTransition' && transitionSource !== null) {
      const src = states.find(s => s.id === transitionSource);
      if (src) {
        ctx.beginPath();
        ctx.arc(src.x, src.y, STATE_RADIUS + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Update hint
    if (states.length > 0 && canvasHint) {
      canvasHint.classList.add('hidden');
    }
  }

  function drawState(s, isActive, dark) {
    const x = s.x, y = s.y;

    // Outer circle for initial state
    if (s.isInitial) {
      ctx.beginPath();
      ctx.arc(x, y, STATE_RADIUS + 6, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.initial;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow pointing to the state
      const ax = x - STATE_RADIUS - 20;
      ctx.beginPath();
      ctx.moveTo(ax, y);
      ctx.lineTo(x - STATE_RADIUS - 6, y);
      ctx.strokeStyle = COLORS.initial;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(x - STATE_RADIUS - 6, y);
      ctx.lineTo(x - STATE_RADIUS - 14, y - 5);
      ctx.lineTo(x - STATE_RADIUS - 14, y + 5);
      ctx.fillStyle = COLORS.initial;
      ctx.fill();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, STATE_RADIUS, 0, Math.PI * 2);

    if (isActive) {
      ctx.fillStyle = COLORS.activeFill;
      ctx.strokeStyle = COLORS.active;
      ctx.lineWidth = 3;
    } else if (s.isAccept) {
      ctx.fillStyle = dark ? 'rgba(145,33,78,0.15)' : 'rgba(145,33,78,0.08)';
      ctx.strokeStyle = COLORS.accept;
      ctx.lineWidth = 2.5;
    } else {
      ctx.fillStyle = dark ? COLORS.stateFillDark : COLORS.stateFill;
      ctx.strokeStyle = dark ? COLORS.stateStrokeDark : COLORS.stateStroke;
      ctx.lineWidth = 2;
    }
    ctx.fill();
    ctx.stroke();

    // Double circle for accepting state
    if (s.isAccept) {
      ctx.beginPath();
      ctx.arc(x, y, STATE_RADIUS - 5, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.accept;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // State name
    ctx.fillStyle = isActive ? COLORS.active : (dark ? COLORS.textDark : COLORS.text);
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.name, x, y);
  }

  function drawArrow(from, to, label, isActive, dark) {
    // Check for bidirectional - offset if reverse transition exists
    const hasReverse = transitions.some(t => t.from === to.id && t.to === from.id);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    // Perpendicular offset for bidirectional
    let px = 0, py = 0;
    if (hasReverse) {
      px = -ny * 12;
      py = nx * 12;
    }

    const startX = from.x + nx * STATE_RADIUS + px;
    const startY = from.y + ny * STATE_RADIUS + py;
    const endX = to.x - nx * STATE_RADIUS + px;
    const endY = to.y - ny * STATE_RADIUS + py;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (hasReverse) {
      const midX = (startX + endX) / 2 + px;
      const midY = (startY + endY) / 2 + py;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
    } else {
      ctx.lineTo(endX, endY);
    }

    ctx.strokeStyle = isActive ? COLORS.active : (dark ? COLORS.transLineDark : COLORS.transLine);
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();

    // Arrowhead
    let angle;
    if (hasReverse) {
      const midX = (startX + endX) / 2 + px;
      const midY = (startY + endY) / 2 + py;
      // Tangent at endpoint of quadratic curve
      angle = Math.atan2(endY - midY, endX - midX);
    } else {
      angle = Math.atan2(endY - startY, endX - startX);
    }

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - ARROW_SIZE * Math.cos(angle - 0.35), endY - ARROW_SIZE * Math.sin(angle - 0.35));
    ctx.lineTo(endX - ARROW_SIZE * Math.cos(angle + 0.35), endY - ARROW_SIZE * Math.sin(angle + 0.35));
    ctx.fillStyle = isActive ? COLORS.active : (dark ? COLORS.transLineDark : COLORS.transLine);
    ctx.fill();

    // Label
    let labelX, labelY;
    if (hasReverse) {
      labelX = (startX + endX) / 2 + px * 0.8;
      labelY = (startY + endY) / 2 + py * 0.8;
    } else {
      labelX = (startX + endX) / 2;
      labelY = (startY + endY) / 2;
    }

    const pad = 4;
    ctx.font = '12px system-ui, sans-serif';
    const metrics = ctx.measureText(label);
    ctx.fillStyle = dark ? 'rgba(30,30,46,0.9)' : 'rgba(255,255,255,0.9)';
    ctx.fillRect(labelX - metrics.width / 2 - pad, labelY - 8 - pad, metrics.width + pad * 2, 16 + pad * 2);
    ctx.fillStyle = isActive ? COLORS.active : (dark ? COLORS.labelDark : COLORS.label);
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX, labelY);
  }

  function drawSelfLoop(state, label, isActive, dark) {
    const x = state.x;
    const y = state.y - STATE_RADIUS - SELF_LOOP_RADIUS;

    ctx.beginPath();
    ctx.arc(x, y, SELF_LOOP_RADIUS, 0.3, Math.PI - 0.3);
    ctx.strokeStyle = isActive ? COLORS.active : (dark ? COLORS.transLineDark : COLORS.transLine);
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();

    // Arrowhead at right end
    const endAngle = 0.3;
    const ex = x + SELF_LOOP_RADIUS * Math.cos(endAngle);
    const ey = y + SELF_LOOP_RADIUS * Math.sin(endAngle);
    const tangentAngle = endAngle + Math.PI / 2;

    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 8 * Math.cos(tangentAngle - 0.5), ey - 8 * Math.sin(tangentAngle - 0.5));
    ctx.lineTo(ex - 8 * Math.cos(tangentAngle + 0.5), ey - 8 * Math.sin(tangentAngle + 0.5));
    ctx.fillStyle = isActive ? COLORS.active : (dark ? COLORS.transLineDark : COLORS.transLine);
    ctx.fill();

    // Label
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = isActive ? COLORS.active : (dark ? COLORS.labelDark : COLORS.label);
    ctx.fillText(label, x, y - SELF_LOOP_RADIUS - 4);
  }

  // Hit detection
  function getStateAt(x, y) {
    for (let i = states.length - 1; i >= 0; i--) {
      const s = states[i];
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy <= STATE_RADIUS * STATE_RADIUS) {
        return s;
      }
    }
    return null;
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // Canvas events
  canvas.addEventListener('mousedown', (e) => {
    const pos = getCanvasPos(e);
    const hit = getStateAt(pos.x, pos.y);

    if (mode === 'select') {
      if (hit) {
        dragState = hit;
        dragOffsetX = pos.x - hit.x;
        dragOffsetY = pos.y - hit.y;
        canvas.style.cursor = 'grabbing';
      }
    } else if (mode === 'addState') {
      if (!hit) {
        addState(pos.x, pos.y);
      }
    } else if (mode === 'addTransition') {
      if (hit) {
        if (transitionSource === null) {
          transitionSource = hit.id;
          draw();
          ToolsCommon.showToast('Now click the target state', 'info');
        } else {
          const label = prompt('Transition label (input symbol):', '');
          if (label !== null && label.trim() !== '') {
            addTransition(transitionSource, hit.id, label.trim());
          }
          transitionSource = null;
          draw();
        }
      }
    } else if (mode === 'setInitial') {
      if (hit) {
        states.forEach(s => s.isInitial = false);
        hit.isInitial = true;
        draw();
        updateTable();
        ToolsCommon.showToast(hit.name + ' set as initial state', 'success');
      }
    } else if (mode === 'toggleAccept') {
      if (hit) {
        hit.isAccept = !hit.isAccept;
        draw();
        updateTable();
        ToolsCommon.showToast(hit.name + (hit.isAccept ? ' is now accepting' : ' is no longer accepting'), 'info');
      }
    } else if (mode === 'delete') {
      if (hit) {
        deleteState(hit.id);
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (dragState) {
      const pos = getCanvasPos(e);
      dragState.x = Math.max(STATE_RADIUS, Math.min(canvas.width - STATE_RADIUS, pos.x - dragOffsetX));
      dragState.y = Math.max(STATE_RADIUS, Math.min(canvas.height - STATE_RADIUS, pos.y - dragOffsetY));
      draw();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (dragState) {
      dragState = null;
      canvas.style.cursor = 'crosshair';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (dragState) {
      dragState = null;
      canvas.style.cursor = 'crosshair';
    }
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('mouseup'));
  }, { passive: false });

  // Mode switching
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      transitionSource = null;
      draw();
    });
  });

  // State management
  function addState(x, y) {
    const name = 'q' + nextId;
    const state = {
      id: nextId++,
      name: name,
      x: x,
      y: y,
      isInitial: states.length === 0,
      isAccept: false
    };
    states.push(state);
    draw();
    updateTable();
    ToolsCommon.showToast('Added state ' + name, 'success');
  }

  function addTransition(fromId, toId, label) {
    // Check for duplicate
    const exists = transitions.some(t => t.from === fromId && t.to === toId && t.label === label);
    if (exists) {
      ToolsCommon.showToast('Transition already exists', 'error');
      return;
    }
    transitions.push({ from: fromId, to: toId, label: label });
    draw();
    updateTable();
    ToolsCommon.showToast('Transition added', 'success');
  }

  function deleteState(id) {
    const state = states.find(s => s.id === id);
    states = states.filter(s => s.id !== id);
    transitions = transitions.filter(t => t.from !== id && t.to !== id);
    draw();
    updateTable();
    if (state) ToolsCommon.showToast('Deleted state ' + state.name, 'info');
  }

  // Transition table
  function updateTable() {
    if (states.length === 0) {
      transitionTable.style.display = 'none';
      tableEmpty.style.display = 'block';
      return;
    }

    transitionTable.style.display = 'table';
    tableEmpty.style.display = 'none';

    // Gather all symbols
    const symbols = [...new Set(transitions.map(t => t.label))].sort();

    // Build header
    let headerHTML = '<tr><th>State</th>';
    symbols.forEach(sym => {
      headerHTML += '<th>' + escapeHTML(sym) + '</th>';
    });
    headerHTML += '</tr>';
    transitionTable.querySelector('thead').innerHTML = headerHTML;

    // Build body
    let bodyHTML = '';
    states.forEach(s => {
      bodyHTML += '<tr>';
      bodyHTML += '<td class="state-cell">' + escapeHTML(s.name);
      if (s.isInitial) bodyHTML += ' <span class="state-initial">(start)</span>';
      if (s.isAccept) bodyHTML += ' <span class="state-accept">(accept)</span>';
      bodyHTML += '</td>';

      symbols.forEach(sym => {
        const targets = transitions
          .filter(t => t.from === s.id && t.label === sym)
          .map(t => {
            const target = states.find(st => st.id === t.to);
            return target ? target.name : '?';
          });
        bodyHTML += '<td>' + (targets.length > 0 ? targets.join(', ') : '-') + '</td>';
      });

      bodyHTML += '</tr>';
    });
    transitionTable.querySelector('tbody').innerHTML = bodyHTML;
  }

  // Test engine
  function getInitialState() {
    return states.find(s => s.isInitial) || null;
  }

  function getNextState(stateId, symbol) {
    const t = transitions.find(tr => tr.from === stateId && tr.label === symbol);
    return t ? t.to : null;
  }

  function resetTest() {
    if (testState.animTimer) clearTimeout(testState.animTimer);
    testState = { running: false, inputStr: '', currentIndex: 0, currentStateId: null, trace: [], animTimer: null };
    testResult.className = 'fsm-test-result';
    testResult.style.display = 'none';
    testResult.textContent = '';
    testTrace.innerHTML = '';
    draw();
  }

  function runFullTest() {
    const initial = getInitialState();
    if (!initial) {
      ToolsCommon.showToast('No initial state defined', 'error');
      return;
    }

    const input = testInput.value;
    resetTest();
    testState.inputStr = input;
    testState.currentStateId = initial.id;
    testState.trace = [initial.id];
    testState.running = true;

    let currentId = initial.id;
    let rejected = false;

    for (let i = 0; i < input.length; i++) {
      const nextId = getNextState(currentId, input[i]);
      if (nextId === null) {
        // Dead state - rejected
        testState.currentIndex = i;
        rejected = true;
        break;
      }
      currentId = nextId;
      testState.trace.push(currentId);
    }

    testState.currentStateId = currentId;
    testState.currentIndex = rejected ? testState.trace.length - 1 : input.length;

    if (rejected) {
      showResult('rejected', 'Rejected - No transition for "' + input[testState.currentIndex] + '" from state ' + getStateName(currentId));
    } else {
      const finalState = states.find(s => s.id === currentId);
      if (finalState && finalState.isAccept) {
        showResult('accepted', 'Accepted! Ended in accepting state ' + finalState.name);
      } else {
        showResult('rejected', 'Rejected - Ended in non-accepting state ' + (finalState ? finalState.name : '?'));
      }
    }

    renderTrace();
    draw();
  }

  function stepTest() {
    const initial = getInitialState();
    if (!initial) {
      ToolsCommon.showToast('No initial state defined', 'error');
      return;
    }

    const input = testInput.value;

    if (!testState.running) {
      resetTest();
      testState.inputStr = input;
      testState.currentStateId = initial.id;
      testState.trace = [initial.id];
      testState.running = true;
      testState.currentIndex = 0;
      showResult('running', 'Step 0: Starting at state ' + initial.name);
      renderTrace();
      draw();
      return;
    }

    if (testState.currentIndex >= input.length) {
      const finalState = states.find(s => s.id === testState.currentStateId);
      if (finalState && finalState.isAccept) {
        showResult('accepted', 'Accepted! Ended in accepting state ' + finalState.name);
      } else {
        showResult('rejected', 'Rejected - Ended in non-accepting state ' + (finalState ? finalState.name : '?'));
      }
      return;
    }

    const symbol = input[testState.currentIndex];
    const nextId = getNextState(testState.currentStateId, symbol);

    if (nextId === null) {
      showResult('rejected', 'Rejected - No transition for "' + symbol + '" from ' + getStateName(testState.currentStateId));
      draw();
      return;
    }

    testState.currentStateId = nextId;
    testState.trace.push(nextId);
    testState.currentIndex++;

    if (testState.currentIndex >= input.length) {
      const finalState = states.find(s => s.id === nextId);
      if (finalState && finalState.isAccept) {
        showResult('accepted', 'Accepted! Ended in accepting state ' + finalState.name);
      } else {
        showResult('rejected', 'Rejected - Ended in non-accepting state ' + (finalState ? finalState.name : '?'));
      }
    } else {
      showResult('running', 'Step ' + testState.currentIndex + ': Read "' + symbol + '" → now in ' + getStateName(nextId));
    }

    renderTrace();
    draw();
  }

  function showResult(type, message) {
    testResult.className = 'fsm-test-result ' + type;
    testResult.style.display = 'block';
    testResult.innerHTML = '<i class="fa-solid fa-' +
      (type === 'accepted' ? 'circle-check' : type === 'rejected' ? 'circle-xmark' : 'spinner fa-spin') +
      '"></i> ' + escapeHTML(message);
  }

  function renderTrace() {
    let html = '';
    testState.trace.forEach((stateId, i) => {
      const name = getStateName(stateId);
      const isLast = i === testState.trace.length - 1;
      const isCurrent = i === testState.currentIndex;

      html += '<span class="fsm-trace-step' + (isCurrent || isLast ? ' active' : '') + '">';
      html += escapeHTML(name);
      html += '</span>';

      if (i < testState.trace.length - 1 && i < testState.inputStr.length) {
        html += '<span class="fsm-trace-step"><span class="trace-arrow">--' + escapeHTML(testState.inputStr[i]) + '--&gt;</span></span>';
      }
    });
    testTrace.innerHTML = html;
  }

  function getStateName(id) {
    const s = states.find(st => st.id === id);
    return s ? s.name : '?';
  }

  // Presets
  const presets = {
    divBy3: {
      states: [
        { id: 0, name: 'q0', x: 150, y: 250, isInitial: true, isAccept: true },
        { id: 1, name: 'q1', x: 400, y: 120, isInitial: false, isAccept: false },
        { id: 2, name: 'q2', x: 400, y: 380, isInitial: false, isAccept: false }
      ],
      transitions: [
        { from: 0, to: 0, label: '0' },
        { from: 0, to: 1, label: '1' },
        { from: 1, to: 2, label: '0' },
        { from: 1, to: 0, label: '1' },
        { from: 2, to: 1, label: '0' },
        { from: 2, to: 2, label: '1' }
      ],
      nextId: 3
    },
    palindrome: {
      states: [
        { id: 0, name: 'q0', x: 120, y: 250, isInitial: true, isAccept: false },
        { id: 1, name: 'q1', x: 300, y: 150, isInitial: false, isAccept: false },
        { id: 2, name: 'q2', x: 480, y: 150, isInitial: false, isAccept: false },
        { id: 3, name: 'q3', x: 660, y: 250, isInitial: false, isAccept: true },
        { id: 4, name: 'q4', x: 300, y: 350, isInitial: false, isAccept: false },
        { id: 5, name: 'q5', x: 480, y: 350, isInitial: false, isAccept: false }
      ],
      transitions: [
        { from: 0, to: 1, label: 'a' },
        { from: 0, to: 4, label: 'b' },
        { from: 1, to: 1, label: 'a' },
        { from: 1, to: 1, label: 'b' },
        { from: 1, to: 2, label: 'a' },
        { from: 2, to: 3, label: 'a' },
        { from: 4, to: 4, label: 'a' },
        { from: 4, to: 4, label: 'b' },
        { from: 4, to: 5, label: 'b' },
        { from: 5, to: 3, label: 'b' }
      ],
      nextId: 6
    },
    email: {
      states: [
        { id: 0, name: 'start', x: 80, y: 250, isInitial: true, isAccept: false },
        { id: 1, name: 'user', x: 240, y: 250, isInitial: false, isAccept: false },
        { id: 2, name: '@', x: 400, y: 250, isInitial: false, isAccept: false },
        { id: 3, name: 'domain', x: 560, y: 250, isInitial: false, isAccept: false },
        { id: 4, name: '.', x: 700, y: 250, isInitial: false, isAccept: false },
        { id: 5, name: 'tld', x: 830, y: 250, isInitial: false, isAccept: true }
      ],
      transitions: [
        { from: 0, to: 1, label: 'c' },
        { from: 1, to: 1, label: 'c' },
        { from: 1, to: 2, label: '@' },
        { from: 2, to: 3, label: 'c' },
        { from: 3, to: 3, label: 'c' },
        { from: 3, to: 4, label: '.' },
        { from: 4, to: 5, label: 'c' },
        { from: 5, to: 5, label: 'c' }
      ],
      nextId: 6
    },
    traffic: {
      states: [
        { id: 0, name: 'GREEN', x: 200, y: 150, isInitial: true, isAccept: false },
        { id: 1, name: 'YELLOW', x: 500, y: 150, isInitial: false, isAccept: false },
        { id: 2, name: 'RED', x: 500, y: 370, isInitial: false, isAccept: false },
        { id: 3, name: 'WALK', x: 200, y: 370, isInitial: false, isAccept: true }
      ],
      transitions: [
        { from: 0, to: 1, label: 'timer' },
        { from: 1, to: 2, label: 'timer' },
        { from: 2, to: 3, label: 'walk' },
        { from: 2, to: 0, label: 'timer' },
        { from: 3, to: 0, label: 'timer' }
      ],
      nextId: 4
    }
  };

  function loadPreset(name) {
    if (!presets[name]) return;
    const p = presets[name];
    states = JSON.parse(JSON.stringify(p.states));
    transitions = JSON.parse(JSON.stringify(p.transitions));
    nextId = p.nextId;

    // Scale positions to canvas
    const maxX = Math.max(...states.map(s => s.x));
    const maxY = Math.max(...states.map(s => s.y));
    const scaleX = (canvas.width - 80) / Math.max(maxX, 1);
    const scaleY = (canvas.height - 80) / Math.max(maxY, 1);
    const scale = Math.min(scaleX, scaleY, 1);

    if (scale < 1) {
      states.forEach(s => {
        s.x = 40 + (s.x - 40) * scale;
        s.y = 40 + (s.y - 40) * scale;
      });
    }

    resetTest();
    draw();
    updateTable();
    ToolsCommon.showToast('Loaded preset: ' + presetSelect.options[presetSelect.selectedIndex].text, 'success');
  }

  // Export / Import
  function exportJSON() {
    const data = { states, transitions, nextId };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fsm-export.json';
    a.click();
    URL.revokeObjectURL(url);
    ToolsCommon.showToast('Exported FSM as JSON', 'success');
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.states && data.transitions) {
          states = data.states;
          transitions = data.transitions;
          nextId = data.nextId || states.length;
          resetTest();
          draw();
          updateTable();
          ToolsCommon.showToast('Imported FSM from JSON', 'success');
        } else {
          ToolsCommon.showToast('Invalid FSM JSON format', 'error');
        }
      } catch (err) {
        ToolsCommon.showToast('Error parsing JSON file', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Clear all
  function clearAll() {
    states = [];
    transitions = [];
    nextId = 0;
    transitionSource = null;
    resetTest();
    draw();
    updateTable();
    if (canvasHint) canvasHint.classList.remove('hidden');
    ToolsCommon.showToast('Cleared all states and transitions', 'info');
  }

  // Utility
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Event listeners
  clearAllBtn.addEventListener('click', clearAll);
  runTestBtn.addEventListener('click', runFullTest);
  stepTestBtn.addEventListener('click', stepTest);
  resetTestBtn.addEventListener('click', () => { resetTest(); draw(); });
  exportBtn.addEventListener('click', exportJSON);
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });

  presetSelect.addEventListener('change', () => {
    if (presetSelect.value) {
      loadPreset(presetSelect.value);
      presetSelect.value = '';
    }
  });

  testInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runFullTest();
  });

  // Observe theme changes for redraw
  const observer = new MutationObserver(() => draw());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Initial draw
  draw();
  updateTable();
})();
