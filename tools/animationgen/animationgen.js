/**
 * KVSOVANREACH CSS Animation Generator
 */

(function() {
  'use strict';

  const showToast = (msg, type) => ToolsCommon.showToast(msg, type);

  const PRESETS = {
    bounce: {
      name: 'bounce',
      duration: 1000,
      timing: 'ease',
      direction: 'normal',
      fillMode: 'both',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 20, translateX: 0, translateY: -30, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 40, translateX: 0, translateY: -15, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 60, translateX: 0, translateY: -4, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    spin: {
      name: 'spin',
      duration: 1000,
      timing: 'linear',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 360, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    fadeIn: {
      name: 'fadeIn',
      duration: 800,
      timing: 'ease-in',
      direction: 'normal',
      fillMode: 'both',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 0, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    slide: {
      name: 'slide',
      duration: 800,
      timing: 'ease-out',
      direction: 'normal',
      fillMode: 'both',
      keyframes: [
        { percent: 0, translateX: -100, translateY: 0, rotate: 0, scale: 1, opacity: 0, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    pulse: {
      name: 'pulse',
      duration: 1000,
      timing: 'ease-in-out',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 50, translateX: 0, translateY: 0, rotate: 0, scale: 1.15, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    shake: {
      name: 'shake',
      duration: 600,
      timing: 'ease-in-out',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 20, translateX: -10, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 40, translateX: 10, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 60, translateX: -10, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 80, translateX: 10, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    flip: {
      name: 'flip',
      duration: 1000,
      timing: 'ease-in-out',
      direction: 'normal',
      fillMode: 'both',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 50, translateX: 0, translateY: 0, rotate: 180, scale: 1, opacity: 0.5, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 360, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    },
    swing: {
      name: 'swing',
      duration: 1000,
      timing: 'ease-in-out',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 20, translateX: 0, translateY: 0, rotate: 15, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 40, translateX: 0, translateY: 0, rotate: -10, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 60, translateX: 0, translateY: 0, rotate: 5, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 80, translateX: 0, translateY: 0, rotate: -5, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
        { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
      ]
    }
  };

  const state = {
    name: 'myAnimation',
    duration: 1000,
    timingFunction: 'ease',
    cubicBezier: [0.25, 0.1, 0.25, 1],
    delay: 0,
    iterationCount: 1,
    infinite: false,
    direction: 'normal',
    fillMode: 'none',
    shape: 'box',
    playing: true,
    keyframes: [
      { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
      { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
    ]
  };

  let dynamicStyle = null;
  const el = {};

  function initElements() {
    el.previewElement = document.getElementById('previewElement');
    el.playBtn = document.getElementById('playBtn');
    el.pauseBtn = document.getElementById('pauseBtn');
    el.restartBtn = document.getElementById('restartBtn');
    el.animName = document.getElementById('animName');
    el.duration = document.getElementById('duration');
    el.durationValue = document.getElementById('durationValue');
    el.timingFunction = document.getElementById('timingFunction');
    el.bezierControls = document.getElementById('bezierControls');
    el.bx1 = document.getElementById('bx1');
    el.by1 = document.getElementById('by1');
    el.bx2 = document.getElementById('bx2');
    el.by2 = document.getElementById('by2');
    el.delay = document.getElementById('delay');
    el.delayValue = document.getElementById('delayValue');
    el.iterationCount = document.getElementById('iterationCount');
    el.iterationValue = document.getElementById('iterationValue');
    el.infiniteLoop = document.getElementById('infiniteLoop');
    el.direction = document.getElementById('direction');
    el.fillMode = document.getElementById('fillMode');
    el.timelineTrack = document.getElementById('timelineTrack');
    el.addKeyframeBtn = document.getElementById('addKeyframeBtn');
    el.keyframesList = document.getElementById('keyframesList');
    el.cssOutput = document.getElementById('cssOutput');
    el.copyBtn = document.getElementById('copyBtn');
    el.outputCopyBtn = document.getElementById('outputCopyBtn');
    el.resetBtn = document.getElementById('resetBtn');
    el.bezierCanvas = document.getElementById('bezierCanvas');
    el.presetsGrid = document.getElementById('presetsGrid');

    dynamicStyle = document.createElement('style');
    document.head.appendChild(dynamicStyle);

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function getTimingString() {
    if (state.timingFunction === 'cubic-bezier') {
      return `cubic-bezier(${state.cubicBezier.join(', ')})`;
    }
    return state.timingFunction;
  }

  function buildKeyframesCSS() {
    const sorted = [...state.keyframes].sort((a, b) => a.percent - b.percent);
    let css = `@keyframes ${state.name} {\n`;
    sorted.forEach(kf => {
      const transforms = [];
      if (kf.translateX !== 0 || kf.translateY !== 0) {
        transforms.push(`translate(${kf.translateX}px, ${kf.translateY}px)`);
      }
      if (kf.rotate !== 0) transforms.push(`rotate(${kf.rotate}deg)`);
      if (kf.scale !== 1) transforms.push(`scale(${kf.scale})`);

      const props = [];
      if (transforms.length > 0) props.push(`    transform: ${transforms.join(' ')};`);
      if (kf.opacity !== 1) props.push(`    opacity: ${kf.opacity};`);
      if (kf.bgColor) props.push(`    background-color: ${kf.bgColor};`);
      if (kf.borderRadius) props.push(`    border-radius: ${kf.borderRadius};`);

      css += `  ${kf.percent}% {\n`;
      if (props.length > 0) {
        css += props.join('\n') + '\n';
      }
      css += `  }\n`;
    });
    css += '}';
    return css;
  }

  function buildAnimationShorthand() {
    const iterCount = state.infinite ? 'infinite' : state.iterationCount;
    return `animation: ${state.name} ${state.duration / 1000}s ${getTimingString()} ${state.delay / 1000}s ${iterCount} ${state.direction} ${state.fillMode};`;
  }

  function generateFullCSS() {
    return buildKeyframesCSS() + '\n\n' + buildAnimationShorthand();
  }

  function applyAnimation() {
    const keyframesCSS = buildKeyframesCSS();
    const iterCount = state.infinite ? 'infinite' : state.iterationCount;
    const animCSS = `
      ${keyframesCSS}
      .preview-element.animating {
        animation: ${state.name} ${state.duration / 1000}s ${getTimingString()} ${state.delay / 1000}s ${iterCount} ${state.direction} ${state.fillMode};
      }
    `;
    dynamicStyle.textContent = animCSS;

    if (state.playing) {
      el.previewElement.classList.remove('animating');
      void el.previewElement.offsetWidth;
      el.previewElement.classList.add('animating');
      el.previewElement.style.animationPlayState = 'running';
    }
  }

  function updateOutput() {
    el.cssOutput.textContent = generateFullCSS();
  }

  function updateAll() {
    applyAnimation();
    updateOutput();
    renderTimeline();
    drawBezier();
  }

  function renderTimeline() {
    el.timelineTrack.innerHTML = '';
    state.keyframes.forEach((kf, i) => {
      const point = document.createElement('div');
      point.className = 'timeline-point';
      point.style.left = kf.percent + '%';
      point.title = kf.percent + '%';

      const label = document.createElement('span');
      label.className = 'timeline-point-label';
      label.textContent = kf.percent + '%';
      point.appendChild(label);

      point.addEventListener('click', () => scrollToKeyframeCard(i));
      el.timelineTrack.appendChild(point);
    });
  }

  function scrollToKeyframeCard(index) {
    const cards = el.keyframesList.querySelectorAll('.keyframe-card');
    if (cards[index]) cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderKeyframeCards() {
    el.keyframesList.innerHTML = '';
    const sorted = [...state.keyframes].sort((a, b) => a.percent - b.percent);
    // Re-sort actual array
    state.keyframes.sort((a, b) => a.percent - b.percent);

    state.keyframes.forEach((kf, i) => {
      const card = document.createElement('div');
      card.className = 'keyframe-card';

      const canRemove = state.keyframes.length > 2;

      card.innerHTML = `
        <div class="keyframe-card-header">
          <span class="kf-percent">${kf.percent}%</span>
          ${canRemove ? `<button class="kf-remove-btn" data-index="${i}" title="Remove"><i class="fa-solid fa-trash-can"></i></button>` : ''}
        </div>
        <div class="kf-props">
          <div class="kf-prop-group">
            <label>Percentage</label>
            <input type="number" data-index="${i}" data-prop="percent" value="${kf.percent}" min="0" max="100" step="1">
          </div>
          <div class="kf-prop-group">
            <label>Opacity</label>
            <input type="number" data-index="${i}" data-prop="opacity" value="${kf.opacity}" min="0" max="1" step="0.05">
          </div>
          <div class="kf-prop-group">
            <label>Translate X (px)</label>
            <input type="number" data-index="${i}" data-prop="translateX" value="${kf.translateX}" step="1">
          </div>
          <div class="kf-prop-group">
            <label>Translate Y (px)</label>
            <input type="number" data-index="${i}" data-prop="translateY" value="${kf.translateY}" step="1">
          </div>
          <div class="kf-prop-group">
            <label>Rotate (deg)</label>
            <input type="number" data-index="${i}" data-prop="rotate" value="${kf.rotate}" step="5">
          </div>
          <div class="kf-prop-group">
            <label>Scale</label>
            <input type="number" data-index="${i}" data-prop="scale" value="${kf.scale}" min="0" max="5" step="0.05">
          </div>
          <div class="kf-prop-group">
            <label>Background</label>
            <input type="color" data-index="${i}" data-prop="bgColor" value="${kf.bgColor || '#91214E'}">
          </div>
          <div class="kf-prop-group">
            <label>Border Radius</label>
            <input type="text" data-index="${i}" data-prop="borderRadius" value="${kf.borderRadius}" placeholder="e.g. 50%">
          </div>
        </div>
      `;

      el.keyframesList.appendChild(card);
    });

    // Bind events
    el.keyframesList.querySelectorAll('.kf-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        state.keyframes.splice(idx, 1);
        renderKeyframeCards();
        updateAll();
        showToast('Keyframe removed', 'success');
      });
    });

    el.keyframesList.querySelectorAll('.kf-props input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const prop = e.target.dataset.prop;
        let val = e.target.value;

        if (prop === 'bgColor') {
          state.keyframes[idx][prop] = val;
        } else if (prop === 'borderRadius') {
          state.keyframes[idx][prop] = val;
        } else {
          val = parseFloat(val);
          if (prop === 'percent') val = Math.max(0, Math.min(100, Math.round(val)));
          state.keyframes[idx][prop] = val;
        }

        renderKeyframeCards();
        updateAll();
      });
    });
  }

  function addKeyframe() {
    // Find a good percentage gap
    const existing = state.keyframes.map(k => k.percent).sort((a, b) => a - b);
    let bestPercent = 50;
    let maxGap = 0;

    for (let i = 0; i < existing.length - 1; i++) {
      const gap = existing[i + 1] - existing[i];
      if (gap > maxGap) {
        maxGap = gap;
        bestPercent = Math.round(existing[i] + gap / 2);
      }
    }

    if (existing.includes(bestPercent)) {
      for (let p = 0; p <= 100; p += 5) {
        if (!existing.includes(p)) { bestPercent = p; break; }
      }
    }

    state.keyframes.push({
      percent: bestPercent,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      bgColor: '',
      borderRadius: ''
    });

    renderKeyframeCards();
    updateAll();
    showToast(`Keyframe added at ${bestPercent}%`, 'success');
  }

  function drawBezier() {
    const canvas = el.bezierCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Resolve the actual bezier values
    let bz;
    switch (state.timingFunction) {
      case 'ease': bz = [0.25, 0.1, 0.25, 1]; break;
      case 'linear': bz = [0, 0, 1, 1]; break;
      case 'ease-in': bz = [0.42, 0, 1, 1]; break;
      case 'ease-out': bz = [0, 0, 0.58, 1]; break;
      case 'ease-in-out': bz = [0.42, 0, 0.58, 1]; break;
      case 'cubic-bezier': bz = [...state.cubicBezier]; break;
      default: bz = [0.25, 0.1, 0.25, 1];
    }

    const pad = 12;
    const gw = w - pad * 2;
    const gh = h - pad * 2;

    // Grid
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = pad + (gw * i / 4);
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + gh); ctx.stroke();
      const y = pad + (gh * i / 4);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + gw, y); ctx.stroke();
    }

    // Curve
    const toX = t => pad + t * gw;
    const toY = t => pad + gh - t * gh;

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#91214E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(0));

    for (let t = 0; t <= 1; t += 0.005) {
      const mt = 1 - t;
      const x = 3 * mt * mt * t * bz[0] + 3 * mt * t * t * bz[2] + t * t * t;
      const y = 3 * mt * mt * t * bz[1] + 3 * mt * t * t * bz[3] + t * t * t;
      ctx.lineTo(toX(x), toY(y));
    }
    ctx.stroke();

    // Control points
    ctx.fillStyle = 'rgba(145, 33, 78, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(145, 33, 78, 0.4)';

    ctx.beginPath(); ctx.moveTo(toX(0), toY(0)); ctx.lineTo(toX(bz[0]), toY(bz[1])); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX(1), toY(1)); ctx.lineTo(toX(bz[2]), toY(bz[3])); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#91214E';
    ctx.beginPath(); ctx.arc(toX(bz[0]), toY(bz[1]), 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(toX(bz[2]), toY(bz[3]), 4, 0, Math.PI * 2); ctx.fill();
  }

  function setShape(shape) {
    state.shape = shape;
    el.previewElement.classList.remove('shape-box', 'shape-circle', 'shape-text');
    el.previewElement.classList.add('shape-' + shape);
    el.previewElement.textContent = shape === 'text' ? 'Animate' : (shape === 'circle' ? '' : '');

    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === shape);
    });
  }

  function applyPreset(presetName) {
    const p = PRESETS[presetName];
    if (!p) return;

    state.name = p.name;
    state.duration = p.duration;
    state.timingFunction = p.timing;
    state.direction = p.direction;
    state.fillMode = p.fillMode;
    state.keyframes = p.keyframes.map(kf => ({ ...kf }));

    el.animName.value = state.name;
    el.duration.value = state.duration;
    el.durationValue.textContent = (state.duration / 1000) + 's';
    el.timingFunction.value = state.timingFunction;
    el.direction.value = state.direction;
    el.fillMode.value = state.fillMode;
    el.bezierControls.style.display = 'none';

    renderKeyframeCards();
    updateAll();
    showToast(`Preset "${presetName}" applied`, 'success');
  }

  function handleReset() {
    state.name = 'myAnimation';
    state.duration = 1000;
    state.timingFunction = 'ease';
    state.cubicBezier = [0.25, 0.1, 0.25, 1];
    state.delay = 0;
    state.iterationCount = 1;
    state.infinite = false;
    state.direction = 'normal';
    state.fillMode = 'none';
    state.keyframes = [
      { percent: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' },
      { percent: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, bgColor: '', borderRadius: '' }
    ];

    el.animName.value = state.name;
    el.duration.value = 1000;
    el.durationValue.textContent = '1s';
    el.timingFunction.value = 'ease';
    el.bezierControls.style.display = 'none';
    el.delay.value = 0;
    el.delayValue.textContent = '0s';
    el.iterationCount.value = 1;
    el.iterationValue.textContent = '1';
    el.infiniteLoop.checked = false;
    el.direction.value = 'normal';
    el.fillMode.value = 'none';
    el.bx1.value = 0.25;
    el.by1.value = 0.1;
    el.bx2.value = 0.25;
    el.by2.value = 1;

    renderKeyframeCards();
    updateAll();
    showToast('Reset to defaults', 'success');
  }

  function handleCopy() {
    ToolsCommon.copyWithToast(generateFullCSS(), 'CSS copied!');
  }

  function bindEvents() {
    el.animName.addEventListener('input', (e) => {
      state.name = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'myAnimation';
      e.target.value = state.name;
      updateAll();
    });

    el.duration.addEventListener('input', (e) => {
      state.duration = parseInt(e.target.value);
      el.durationValue.textContent = (state.duration / 1000) + 's';
      updateAll();
    });

    el.timingFunction.addEventListener('change', (e) => {
      state.timingFunction = e.target.value;
      el.bezierControls.style.display = e.target.value === 'cubic-bezier' ? '' : 'none';
      updateAll();
    });

    [el.bx1, el.by1, el.bx2, el.by2].forEach((input, i) => {
      input.addEventListener('input', () => {
        state.cubicBezier[i] = parseFloat(input.value) || 0;
        updateAll();
      });
    });

    el.delay.addEventListener('input', (e) => {
      state.delay = parseInt(e.target.value);
      el.delayValue.textContent = (state.delay / 1000) + 's';
      updateAll();
    });

    el.iterationCount.addEventListener('input', (e) => {
      state.iterationCount = parseInt(e.target.value);
      el.iterationValue.textContent = state.infinite ? 'infinite' : state.iterationCount;
      updateAll();
    });

    el.infiniteLoop.addEventListener('change', (e) => {
      state.infinite = e.target.checked;
      el.iterationCount.disabled = state.infinite;
      el.iterationValue.textContent = state.infinite ? 'infinite' : state.iterationCount;
      updateAll();
    });

    el.direction.addEventListener('change', (e) => {
      state.direction = e.target.value;
      updateAll();
    });

    el.fillMode.addEventListener('change', (e) => {
      state.fillMode = e.target.value;
      updateAll();
    });

    el.playBtn.addEventListener('click', () => {
      state.playing = true;
      el.previewElement.style.animationPlayState = 'running';
      if (!el.previewElement.classList.contains('animating')) {
        el.previewElement.classList.add('animating');
      }
    });

    el.pauseBtn.addEventListener('click', () => {
      state.playing = false;
      el.previewElement.style.animationPlayState = 'paused';
    });

    el.restartBtn.addEventListener('click', () => {
      state.playing = true;
      el.previewElement.classList.remove('animating');
      void el.previewElement.offsetWidth;
      el.previewElement.classList.add('animating');
      el.previewElement.style.animationPlayState = 'running';
    });

    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => setShape(btn.dataset.shape));
    });

    el.presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    el.addKeyframeBtn.addEventListener('click', addKeyframe);
    el.copyBtn.addEventListener('click', handleCopy);
    el.outputCopyBtn.addEventListener('click', handleCopy);
    el.resetBtn.addEventListener('click', handleReset);

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select, textarea')) return;
      switch (e.key.toLowerCase()) {
        case 'c': e.preventDefault(); handleCopy(); break;
        case 'r': e.preventDefault(); handleReset(); break;
        case ' ':
          e.preventDefault();
          if (state.playing) {
            el.pauseBtn.click();
          } else {
            el.playBtn.click();
          }
          break;
      }
    });
  }

  function init() {
    initElements();
    bindEvents();
    renderKeyframeCards();
    updateAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
