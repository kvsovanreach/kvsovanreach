/**
 * KVSOVANREACH CSS Clip-Path Maker
 */

(function() {
  'use strict';

  const PRESETS = {
    circle:   { type: 'circle', radius: 50, cx: 50, cy: 50 },
    ellipse:  { type: 'ellipse', rx: 50, ry: 35, cx: 50, cy: 50 },
    triangle: { type: 'polygon', points: [[50,0],[0,100],[100,100]] },
    pentagon: { type: 'polygon', points: [[50,0],[100,38],[82,100],[18,100],[0,38]] },
    hexagon:  { type: 'polygon', points: [[25,0],[75,0],[100,50],[75,100],[25,100],[0,50]] },
    star:     { type: 'polygon', points: [[50,0],[61,35],[98,35],[68,57],[79,91],[50,70],[21,91],[32,57],[2,35],[39,35]] },
    arrow:    { type: 'polygon', points: [[0,30],[70,30],[70,0],[100,50],[70,100],[70,70],[0,70]] },
    cross:    { type: 'polygon', points: [[35,0],[65,0],[65,35],[100,35],[100,65],[65,65],[65,100],[35,100],[35,65],[0,65],[0,35],[35,35]] },
    message:  { type: 'polygon', points: [[0,0],[100,0],[100,70],[30,70],[15,100],[20,70],[0,70]] },
    heart:    { type: 'polygon', points: [[50,100],[5,55],[0,30],[5,15],[15,5],[30,0],[45,5],[50,20],[55,5],[70,0],[85,5],[95,15],[100,30],[95,55]] }
  };

  const state = {
    mode: 'circle',
    points: [],
    circle: { radius: 50, cx: 50, cy: 50 },
    ellipse: { rx: 50, ry: 35, cx: 50, cy: 50 },
    inset: { top: 10, right: 10, bottom: 10, left: 10, round: 0 },
    bgType: 'gradient',
    bgColor: '#91214E',
    bgImage: null,
    previewSize: 300,
    dragging: null
  };

  const elements = {};

  function initElements() {
    elements.previewArea = document.getElementById('previewArea');
    elements.previewShape = document.getElementById('previewShape');
    elements.previewGhost = document.getElementById('previewGhost');
    elements.pointsSvg = document.getElementById('pointsSvg');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.presetBtns = document.querySelectorAll('.cp-preset-btn');
    elements.bgBtns = document.querySelectorAll('.cp-bg-btn');
    elements.previewSize = document.getElementById('previewSize');
    elements.previewSizeValue = document.getElementById('previewSizeValue');

    // Circle controls
    elements.circleControls = document.getElementById('circleControls');
    elements.circleRadius = document.getElementById('circleRadius');
    elements.circleRadiusValue = document.getElementById('circleRadiusValue');
    elements.circlePosX = document.getElementById('circlePosX');
    elements.circlePosXValue = document.getElementById('circlePosXValue');
    elements.circlePosY = document.getElementById('circlePosY');
    elements.circlePosYValue = document.getElementById('circlePosYValue');

    // Ellipse controls
    elements.ellipseControls = document.getElementById('ellipseControls');
    elements.ellipseRX = document.getElementById('ellipseRX');
    elements.ellipseRXValue = document.getElementById('ellipseRXValue');
    elements.ellipseRY = document.getElementById('ellipseRY');
    elements.ellipseRYValue = document.getElementById('ellipseRYValue');
    elements.ellipsePosX = document.getElementById('ellipsePosX');
    elements.ellipsePosXValue = document.getElementById('ellipsePosXValue');
    elements.ellipsePosY = document.getElementById('ellipsePosY');
    elements.ellipsePosYValue = document.getElementById('ellipsePosYValue');

    // Inset controls
    elements.insetControls = document.getElementById('insetControls');
    elements.insetTop = document.getElementById('insetTop');
    elements.insetTopValue = document.getElementById('insetTopValue');
    elements.insetRight = document.getElementById('insetRight');
    elements.insetRightValue = document.getElementById('insetRightValue');
    elements.insetBottom = document.getElementById('insetBottom');
    elements.insetBottomValue = document.getElementById('insetBottomValue');
    elements.insetLeft = document.getElementById('insetLeft');
    elements.insetLeftValue = document.getElementById('insetLeftValue');
    elements.insetRound = document.getElementById('insetRound');
    elements.insetRoundValue = document.getElementById('insetRoundValue');

    // Polygon controls
    elements.polygonControls = document.getElementById('polygonControls');

    // Background
    elements.solidColorWrap = document.getElementById('solidColorWrap');
    elements.solidColor = document.getElementById('solidColor');
    elements.imageUploadWrap = document.getElementById('imageUploadWrap');
    elements.imageUpload = document.getElementById('imageUpload');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;

    elements.presetBtns.forEach(b => b.classList.toggle('active', b.dataset.preset === name));

    if (preset.type === 'circle') {
      state.mode = 'circle';
      state.circle = { radius: preset.radius, cx: preset.cx, cy: preset.cy };
      syncCircleControls();
    } else if (preset.type === 'ellipse') {
      state.mode = 'ellipse';
      state.ellipse = { rx: preset.rx, ry: preset.ry, cx: preset.cx, cy: preset.cy };
      syncEllipseControls();
    } else if (preset.type === 'inset') {
      state.mode = 'inset';
    } else {
      state.mode = 'polygon';
      state.points = preset.points.map(p => [...p]);
    }

    showModeControls();
    render();
  }

  function showModeControls() {
    elements.circleControls.style.display = state.mode === 'circle' ? '' : 'none';
    elements.ellipseControls.style.display = state.mode === 'ellipse' ? '' : 'none';
    elements.insetControls.style.display = state.mode === 'inset' ? '' : 'none';
    elements.polygonControls.style.display = state.mode === 'polygon' ? '' : 'none';
  }

  function syncCircleControls() {
    elements.circleRadius.value = state.circle.radius;
    elements.circleRadiusValue.textContent = state.circle.radius + '%';
    elements.circlePosX.value = state.circle.cx;
    elements.circlePosXValue.textContent = state.circle.cx + '%';
    elements.circlePosY.value = state.circle.cy;
    elements.circlePosYValue.textContent = state.circle.cy + '%';
  }

  function syncEllipseControls() {
    elements.ellipseRX.value = state.ellipse.rx;
    elements.ellipseRXValue.textContent = state.ellipse.rx + '%';
    elements.ellipseRY.value = state.ellipse.ry;
    elements.ellipseRYValue.textContent = state.ellipse.ry + '%';
    elements.ellipsePosX.value = state.ellipse.cx;
    elements.ellipsePosXValue.textContent = state.ellipse.cx + '%';
    elements.ellipsePosY.value = state.ellipse.cy;
    elements.ellipsePosYValue.textContent = state.ellipse.cy + '%';
  }

  function getClipPath() {
    if (state.mode === 'circle') {
      return 'circle(' + state.circle.radius + '% at ' + state.circle.cx + '% ' + state.circle.cy + '%)';
    }
    if (state.mode === 'ellipse') {
      return 'ellipse(' + state.ellipse.rx + '% ' + state.ellipse.ry + '% at ' + state.ellipse.cx + '% ' + state.ellipse.cy + '%)';
    }
    if (state.mode === 'inset') {
      let val = 'inset(' + state.inset.top + '% ' + state.inset.right + '% ' + state.inset.bottom + '% ' + state.inset.left + '%';
      if (state.inset.round > 0) val += ' round ' + state.inset.round + '%';
      return val + ')';
    }
    // polygon
    const pts = state.points.map(p => Math.round(p[0]) + '% ' + Math.round(p[1]) + '%').join(', ');
    return 'polygon(' + pts + ')';
  }

  function render() {
    const clipPath = getClipPath();
    elements.previewShape.style.clipPath = clipPath;
    elements.previewShape.style.webkitClipPath = clipPath;

    // Ghost shows outline
    elements.previewGhost.style.background = elements.previewShape.style.background;
    elements.previewGhost.style.backgroundSize = elements.previewShape.style.backgroundSize || '';
    elements.previewGhost.style.backgroundPosition = elements.previewShape.style.backgroundPosition || '';

    renderPoints();
    updateCSSOutput(clipPath);
  }

  function renderPoints() {
    elements.pointsSvg.innerHTML = '';
    if (state.mode !== 'polygon') return;

    const w = elements.previewArea.offsetWidth;
    const h = elements.previewArea.offsetHeight;

    // Lines
    if (state.points.length > 1) {
      for (let i = 0; i < state.points.length; i++) {
        const next = (i + 1) % state.points.length;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', state.points[i][0] / 100 * w);
        line.setAttribute('y1', state.points[i][1] / 100 * h);
        line.setAttribute('x2', state.points[next][0] / 100 * w);
        line.setAttribute('y2', state.points[next][1] / 100 * h);
        line.setAttribute('class', 'cp-line');
        elements.pointsSvg.appendChild(line);
      }
    }

    // Points
    state.points.forEach((pt, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt[0] / 100 * w);
      circle.setAttribute('cy', pt[1] / 100 * h);
      circle.setAttribute('r', 6);
      circle.setAttribute('class', 'cp-point');
      circle.setAttribute('data-index', i);

      circle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.dragging = i;
        circle.classList.add('dragging');
      });

      circle.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (state.points.length > 3) {
          state.points.splice(i, 1);
          render();
        }
      });

      // Touch support
      circle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.dragging = i;
        circle.classList.add('dragging');
      });

      elements.pointsSvg.appendChild(circle);
    });
  }

  function handlePointerMove(clientX, clientY) {
    if (state.dragging === null) return;
    const rect = elements.previewArea.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    state.points[state.dragging] = [Math.round(x), Math.round(y)];
    render();
  }

  function handlePointerUp() {
    if (state.dragging !== null) {
      const circles = elements.pointsSvg.querySelectorAll('.cp-point');
      circles.forEach(c => c.classList.remove('dragging'));
      state.dragging = null;
    }
  }

  function addPointAtClick(e) {
    if (state.mode !== 'polygon') return;
    if (state.dragging !== null) return;
    if (e.target.closest('.cp-point')) return;

    const rect = elements.previewArea.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Insert point near closest edge
    let bestIdx = state.points.length;
    let bestDist = Infinity;

    for (let i = 0; i < state.points.length; i++) {
      const next = (i + 1) % state.points.length;
      const dist = pointToSegmentDist(x, y, state.points[i], state.points[next]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = next;
      }
    }

    state.points.splice(bestIdx, 0, [x, y]);
    render();
  }

  function pointToSegmentDist(px, py, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - a[0], py - a[1]);
    let t = ((px - a[0]) * dx + (py - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
  }

  function updateBackground() {
    if (state.bgType === 'gradient') {
      elements.previewShape.style.background = 'linear-gradient(135deg, #91214E, #2d6a8a, #e67e22, #27ae60)';
      elements.previewShape.style.backgroundSize = '';
      elements.previewShape.style.backgroundPosition = '';
    } else if (state.bgType === 'solid') {
      elements.previewShape.style.background = state.bgColor;
      elements.previewShape.style.backgroundSize = '';
      elements.previewShape.style.backgroundPosition = '';
    } else if (state.bgType === 'image' && state.bgImage) {
      elements.previewShape.style.background = 'url(' + state.bgImage + ')';
      elements.previewShape.style.backgroundSize = 'cover';
      elements.previewShape.style.backgroundPosition = 'center';
    }

    elements.previewGhost.style.background = elements.previewShape.style.background;
    elements.previewGhost.style.backgroundSize = elements.previewShape.style.backgroundSize || '';
    elements.previewGhost.style.backgroundPosition = elements.previewShape.style.backgroundPosition || '';
  }

  function updateCSSOutput(clipPath) {
    const css = 'clip-path: ' + clipPath + ';';
    elements.cssOutput.textContent = css;
  }

  function copyCSS() {
    const css = elements.cssOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(() => {
        showToast('CSS copied to clipboard!', 'success');
      }).catch(() => fallbackCopy(css));
    } else {
      fallbackCopy(css);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('CSS copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function resetForm() {
    state.mode = 'circle';
    state.circle = { radius: 50, cx: 50, cy: 50 };
    state.bgType = 'gradient';
    state.previewSize = 300;
    state.dragging = null;

    elements.presetBtns.forEach(b => b.classList.toggle('active', b.dataset.preset === 'circle'));
    elements.bgBtns.forEach(b => b.classList.toggle('active', b.dataset.bg === 'gradient'));
    elements.solidColorWrap.style.display = 'none';
    elements.imageUploadWrap.style.display = 'none';
    elements.previewSize.value = 300;
    elements.previewSizeValue.textContent = '300px';
    elements.previewArea.style.width = '300px';
    elements.previewArea.style.height = '300px';

    syncCircleControls();
    showModeControls();
    updateBackground();
    render();
    showToast('Reset to default', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, select, textarea')) return;

    if (e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyCSS();
    }
    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
    }
  }

  function init() {
    initElements();

    // Presets
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Circle controls
    elements.circleRadius.addEventListener('input', (e) => {
      state.circle.radius = parseInt(e.target.value);
      elements.circleRadiusValue.textContent = state.circle.radius + '%';
      render();
    });
    elements.circlePosX.addEventListener('input', (e) => {
      state.circle.cx = parseInt(e.target.value);
      elements.circlePosXValue.textContent = state.circle.cx + '%';
      render();
    });
    elements.circlePosY.addEventListener('input', (e) => {
      state.circle.cy = parseInt(e.target.value);
      elements.circlePosYValue.textContent = state.circle.cy + '%';
      render();
    });

    // Ellipse controls
    elements.ellipseRX.addEventListener('input', (e) => {
      state.ellipse.rx = parseInt(e.target.value);
      elements.ellipseRXValue.textContent = state.ellipse.rx + '%';
      render();
    });
    elements.ellipseRY.addEventListener('input', (e) => {
      state.ellipse.ry = parseInt(e.target.value);
      elements.ellipseRYValue.textContent = state.ellipse.ry + '%';
      render();
    });
    elements.ellipsePosX.addEventListener('input', (e) => {
      state.ellipse.cx = parseInt(e.target.value);
      elements.ellipsePosXValue.textContent = state.ellipse.cx + '%';
      render();
    });
    elements.ellipsePosY.addEventListener('input', (e) => {
      state.ellipse.cy = parseInt(e.target.value);
      elements.ellipsePosYValue.textContent = state.ellipse.cy + '%';
      render();
    });

    // Inset controls
    ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
      const key = side.toLowerCase();
      elements['inset' + side].addEventListener('input', (e) => {
        state.inset[key] = parseInt(e.target.value);
        elements['inset' + side + 'Value'].textContent = state.inset[key] + '%';
        render();
      });
    });
    elements.insetRound.addEventListener('input', (e) => {
      state.inset.round = parseInt(e.target.value);
      elements.insetRoundValue.textContent = state.inset.round + '%';
      render();
    });

    // Preview size
    elements.previewSize.addEventListener('input', (e) => {
      state.previewSize = parseInt(e.target.value);
      elements.previewSizeValue.textContent = state.previewSize + 'px';
      elements.previewArea.style.width = state.previewSize + 'px';
      elements.previewArea.style.height = state.previewSize + 'px';
      render();
    });

    // Background type
    elements.bgBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.bgBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.bgType = btn.dataset.bg;

        elements.solidColorWrap.style.display = state.bgType === 'solid' ? '' : 'none';
        elements.imageUploadWrap.style.display = state.bgType === 'image' ? '' : 'none';

        updateBackground();
        render();
      });
    });

    elements.solidColor.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      updateBackground();
    });

    elements.imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        state.bgImage = ev.target.result;
        updateBackground();
        render();
      };
      reader.readAsDataURL(file);
    });

    // Polygon drag interactions
    document.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', (e) => {
      if (state.dragging !== null) {
        e.preventDefault();
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    }, { passive: false });
    document.addEventListener('touchend', handlePointerUp);

    // Click to add points
    elements.previewArea.addEventListener('click', addPointAtClick);

    // Prevent context menu on preview area
    elements.previewArea.addEventListener('contextmenu', (e) => {
      if (state.mode === 'polygon') e.preventDefault();
    });

    // Actions
    elements.copyBtn.addEventListener('click', copyCSS);
    elements.resetBtn.addEventListener('click', resetForm);
    document.addEventListener('keydown', handleKeydown);

    // Init default
    applyPreset('circle');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
