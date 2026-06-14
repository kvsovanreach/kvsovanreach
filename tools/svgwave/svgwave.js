/**
 * KVSOVANREACH SVG Wave Generator
 */

(function() {
  'use strict';

  const showToast = (msg, type) => ToolsCommon.showToast(msg, type);

  const PRESETS = {
    gentle: {
      waveType: 'sine', amplitude: 30, frequency: 1.5, segments: 128,
      height: 120, opacity: 100, fillColor: '#91214E', useGradient: false,
      gradientColor: '#e74c3c', flipV: false, flipH: false,
      layers: []
    },
    ocean: {
      waveType: 'smooth', amplitude: 50, frequency: 2, segments: 160,
      height: 180, opacity: 100, fillColor: '#1a5276', useGradient: true,
      gradientColor: '#2e86c1', flipV: false, flipH: false,
      layers: [
        { color: '#2e86c1', opacity: 60, offsetY: 15, amplitude: 35, frequency: 2.5 },
        { color: '#85c1e9', opacity: 40, offsetY: 30, amplitude: 25, frequency: 3 }
      ]
    },
    mountain: {
      waveType: 'sharp', amplitude: 80, frequency: 3, segments: 128,
      height: 200, opacity: 100, fillColor: '#2c3e50', useGradient: false,
      gradientColor: '#34495e', flipV: false, flipH: false,
      layers: [
        { color: '#34495e', opacity: 70, offsetY: 20, amplitude: 60, frequency: 2.5 }
      ]
    },
    zigzag: {
      waveType: 'sharp', amplitude: 40, frequency: 6, segments: 64,
      height: 140, opacity: 100, fillColor: '#e74c3c', useGradient: false,
      gradientColor: '#c0392b', flipV: false, flipH: false,
      layers: []
    },
    blob: {
      waveType: 'smooth', amplitude: 60, frequency: 1, segments: 200,
      height: 200, opacity: 100, fillColor: '#8e44ad', useGradient: true,
      gradientColor: '#3498db', flipV: false, flipH: false,
      layers: []
    }
  };

  const state = {
    waveType: 'sine',
    amplitude: 40,
    frequency: 2,
    segments: 128,
    height: 150,
    opacity: 100,
    fillColor: '#91214E',
    useGradient: false,
    gradientColor: '#e74c3c',
    flipV: false,
    flipH: false,
    layers: [] // each: { color, opacity, offsetY, amplitude, frequency }
  };

  const el = {};

  function initElements() {
    el.svgContainer = document.getElementById('svgContainer');
    el.waveType = document.getElementById('waveType');
    el.amplitude = document.getElementById('amplitude');
    el.amplitudeValue = document.getElementById('amplitudeValue');
    el.frequency = document.getElementById('frequency');
    el.frequencyValue = document.getElementById('frequencyValue');
    el.segments = document.getElementById('segments');
    el.segmentsValue = document.getElementById('segmentsValue');
    el.waveHeight = document.getElementById('waveHeight');
    el.waveHeightValue = document.getElementById('waveHeightValue');
    el.waveOpacity = document.getElementById('waveOpacity');
    el.waveOpacityValue = document.getElementById('waveOpacityValue');
    el.fillColor = document.getElementById('fillColor');
    el.useGradient = document.getElementById('useGradient');
    el.gradientColor = document.getElementById('gradientColor');
    el.gradientStop = document.getElementById('gradientStop');
    el.flipVertical = document.getElementById('flipVertical');
    el.flipHorizontal = document.getElementById('flipHorizontal');
    el.layersList = document.getElementById('layersList');
    el.layerCount = document.getElementById('layerCount');
    el.addLayerBtn = document.getElementById('addLayerBtn');
    el.svgOutput = document.getElementById('svgOutput');
    el.cssOutput = document.getElementById('cssOutput');
    el.copyBtn = document.getElementById('copyBtn');
    el.svgCopyBtn = document.getElementById('svgCopyBtn');
    el.cssCopyBtn = document.getElementById('cssCopyBtn');
    el.downloadBtn = document.getElementById('downloadBtn');
    el.resetBtn = document.getElementById('resetBtn');
    el.presetsGrid = document.getElementById('presetsGrid');

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function generateWavePoints(amplitude, frequency, segments, waveType, width, height, offsetY) {
    const points = [];
    const midY = height * 0.4 + (offsetY || 0);

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const t = (i / segments) * Math.PI * 2 * frequency;
      let y;

      switch (waveType) {
        case 'sine':
          y = midY + Math.sin(t) * amplitude;
          break;
        case 'smooth':
          y = midY + Math.sin(t) * amplitude * (0.7 + 0.3 * Math.sin(t * 0.3));
          break;
        case 'sharp':
          y = midY + ((2 * Math.abs((t / Math.PI) % 2 - 1) - 1)) * amplitude;
          break;
        case 'steps': {
          const stepCount = Math.max(4, Math.round(frequency * 4));
          const stepIndex = Math.floor((i / segments) * stepCount);
          const stepVal = Math.sin((stepIndex / stepCount) * Math.PI * 2 * frequency);
          y = midY + stepVal * amplitude;
          break;
        }
        default:
          y = midY + Math.sin(t) * amplitude;
      }
      points.push({ x, y });
    }
    return points;
  }

  function pointsToPath(points, width, height) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
  }

  function buildSVG() {
    const width = 1200;
    const height = state.height;
    const viewBox = `0 0 ${width} ${height}`;

    let transforms = '';
    if (state.flipV && state.flipH) {
      transforms = `transform="scale(-1,-1) translate(-${width},-${height})"`;
    } else if (state.flipV) {
      transforms = `transform="scale(1,-1) translate(0,-${height})"`;
    } else if (state.flipH) {
      transforms = `transform="scale(-1,1) translate(-${width},0)"`;
    }

    let defs = '';
    let gradientId = 'waveGrad';
    if (state.useGradient) {
      defs = `
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${state.fillColor}" />
      <stop offset="100%" stop-color="${state.gradientColor}" />
    </linearGradient>
  </defs>`;
    }

    // Main wave
    const mainPoints = generateWavePoints(state.amplitude, state.frequency, state.segments, state.waveType, width, height, 0);
    const mainPath = pointsToPath(mainPoints, width, height);
    const mainFill = state.useGradient ? `url(#${gradientId})` : state.fillColor;
    const mainOpacity = state.opacity / 100;

    let layerPaths = '';
    state.layers.forEach((layer, i) => {
      const lPoints = generateWavePoints(
        layer.amplitude, layer.frequency, state.segments, state.waveType, width, height, layer.offsetY
      );
      const lPath = pointsToPath(lPoints, width, height);
      layerPaths += `\n  <path d="${lPath}" fill="${layer.color}" opacity="${layer.opacity / 100}" />`;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none"${transforms ? ' ' + transforms : ''}>` +
      defs +
      layerPaths +
      `\n  <path d="${mainPath}" fill="${mainFill}" opacity="${mainOpacity}" />` +
      `\n</svg>`;

    return svg;
  }

  function generateCSS() {
    return `.section-divider {
  width: 100%;
  height: ${state.height}px;
  overflow: hidden;
  line-height: 0;
}

.section-divider svg {
  width: 100%;
  height: 100%;
  display: block;
}`;
  }

  function updatePreview() {
    const svg = buildSVG();
    el.svgContainer.innerHTML = svg;

    // Set bottom section color to match wave
    const bottomSection = document.querySelector('.preview-bottom-section');
    if (bottomSection) {
      bottomSection.style.backgroundColor = state.useGradient ? state.gradientColor : state.fillColor;
    }
  }

  function updateOutput() {
    el.svgOutput.textContent = buildSVG();
    el.cssOutput.textContent = generateCSS();
  }

  function updateAll() {
    updatePreview();
    updateOutput();
  }

  function renderLayers() {
    el.layersList.innerHTML = '';
    el.layerCount.textContent = `(${state.layers.length + 1}/3)`;

    state.layers.forEach((layer, i) => {
      const card = document.createElement('div');
      card.className = 'layer-card';
      card.innerHTML = `
        <div class="layer-card-header">
          <span class="layer-label">Layer ${i + 2}</span>
          <button class="layer-remove-btn" data-index="${i}" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="layer-props">
          <div class="layer-prop-group">
            <label>Color</label>
            <input type="color" data-index="${i}" data-prop="color" value="${layer.color}">
          </div>
          <div class="layer-prop-group">
            <label>Opacity (%)</label>
            <input type="number" data-index="${i}" data-prop="opacity" value="${layer.opacity}" min="10" max="100" step="5">
          </div>
          <div class="layer-prop-group">
            <label>Offset Y (px)</label>
            <input type="number" data-index="${i}" data-prop="offsetY" value="${layer.offsetY}" min="-50" max="80" step="5">
          </div>
          <div class="layer-prop-group">
            <label>Amplitude</label>
            <input type="number" data-index="${i}" data-prop="amplitude" value="${layer.amplitude}" min="5" max="150" step="5">
          </div>
          <div class="layer-prop-group">
            <label>Frequency</label>
            <input type="number" data-index="${i}" data-prop="frequency" value="${layer.frequency}" min="0.5" max="8" step="0.5">
          </div>
        </div>
      `;
      el.layersList.appendChild(card);
    });

    // Bind events
    el.layersList.querySelectorAll('.layer-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.layers.splice(parseInt(btn.dataset.index), 1);
        renderLayers();
        updateAll();
        showToast('Layer removed', 'success');
      });
    });

    el.layersList.querySelectorAll('.layer-props input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const prop = e.target.dataset.prop;
        if (prop === 'color') {
          state.layers[idx][prop] = e.target.value;
        } else {
          state.layers[idx][prop] = parseFloat(e.target.value) || 0;
        }
        updateAll();
      });
    });

    el.addLayerBtn.style.display = state.layers.length >= 2 ? 'none' : '';
  }

  function addLayer() {
    if (state.layers.length >= 2) return;
    const colors = ['#3498db', '#2ecc71', '#e67e22'];
    state.layers.push({
      color: colors[state.layers.length] || '#3498db',
      opacity: 50,
      offsetY: 15 * (state.layers.length + 1),
      amplitude: Math.max(20, state.amplitude - 10 * (state.layers.length + 1)),
      frequency: state.frequency + 0.5 * (state.layers.length + 1)
    });
    renderLayers();
    updateAll();
    showToast('Layer added', 'success');
  }

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;

    state.waveType = p.waveType;
    state.amplitude = p.amplitude;
    state.frequency = p.frequency;
    state.segments = p.segments;
    state.height = p.height;
    state.opacity = p.opacity;
    state.fillColor = p.fillColor;
    state.useGradient = p.useGradient;
    state.gradientColor = p.gradientColor;
    state.flipV = p.flipV;
    state.flipH = p.flipH;
    state.layers = (p.layers || []).map(l => ({ ...l }));

    syncControlsFromState();
    renderLayers();
    updateAll();
    showToast(`Preset "${name}" applied`, 'success');
  }

  function syncControlsFromState() {
    el.waveType.value = state.waveType;
    el.amplitude.value = state.amplitude;
    el.amplitudeValue.textContent = state.amplitude + 'px';
    el.frequency.value = state.frequency;
    el.frequencyValue.textContent = state.frequency;
    el.segments.value = state.segments;
    el.segmentsValue.textContent = state.segments;
    el.waveHeight.value = state.height;
    el.waveHeightValue.textContent = state.height + 'px';
    el.waveOpacity.value = state.opacity;
    el.waveOpacityValue.textContent = state.opacity + '%';
    el.fillColor.value = state.fillColor;
    el.useGradient.checked = state.useGradient;
    el.gradientColor.value = state.gradientColor;
    el.gradientStop.classList.toggle('active', state.useGradient);
    el.flipVertical.checked = state.flipV;
    el.flipHorizontal.checked = state.flipH;
  }

  function handleReset() {
    state.waveType = 'sine';
    state.amplitude = 40;
    state.frequency = 2;
    state.segments = 128;
    state.height = 150;
    state.opacity = 100;
    state.fillColor = '#91214E';
    state.useGradient = false;
    state.gradientColor = '#e74c3c';
    state.flipV = false;
    state.flipH = false;
    state.layers = [];

    syncControlsFromState();
    renderLayers();
    updateAll();
    showToast('Reset to defaults', 'success');
  }

  function handleCopySVG() {
    ToolsCommon.copyWithToast(buildSVG(), 'SVG copied!');
  }

  function handleCopyCSS() {
    ToolsCommon.copyWithToast(generateCSS(), 'CSS copied!');
  }

  function handleDownload() {
    const svg = buildSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wave-divider.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('SVG downloaded', 'success');
  }

  function bindEvents() {
    el.waveType.addEventListener('change', (e) => {
      state.waveType = e.target.value;
      updateAll();
    });

    el.amplitude.addEventListener('input', (e) => {
      state.amplitude = parseInt(e.target.value);
      el.amplitudeValue.textContent = state.amplitude + 'px';
      updateAll();
    });

    el.frequency.addEventListener('input', (e) => {
      state.frequency = parseFloat(e.target.value);
      el.frequencyValue.textContent = state.frequency;
      updateAll();
    });

    el.segments.addEventListener('input', (e) => {
      state.segments = parseInt(e.target.value);
      el.segmentsValue.textContent = state.segments;
      updateAll();
    });

    el.waveHeight.addEventListener('input', (e) => {
      state.height = parseInt(e.target.value);
      el.waveHeightValue.textContent = state.height + 'px';
      updateAll();
    });

    el.waveOpacity.addEventListener('input', (e) => {
      state.opacity = parseInt(e.target.value);
      el.waveOpacityValue.textContent = state.opacity + '%';
      updateAll();
    });

    el.fillColor.addEventListener('input', (e) => {
      state.fillColor = e.target.value;
      updateAll();
    });

    el.useGradient.addEventListener('change', (e) => {
      state.useGradient = e.target.checked;
      el.gradientStop.classList.toggle('active', state.useGradient);
      updateAll();
    });

    el.gradientColor.addEventListener('input', (e) => {
      state.gradientColor = e.target.value;
      updateAll();
    });

    el.flipVertical.addEventListener('change', (e) => {
      state.flipV = e.target.checked;
      updateAll();
    });

    el.flipHorizontal.addEventListener('change', (e) => {
      state.flipH = e.target.checked;
      updateAll();
    });

    el.addLayerBtn.addEventListener('click', addLayer);

    el.copyBtn.addEventListener('click', handleCopySVG);
    el.svgCopyBtn.addEventListener('click', handleCopySVG);
    el.cssCopyBtn.addEventListener('click', handleCopyCSS);
    el.downloadBtn.addEventListener('click', handleDownload);
    el.resetBtn.addEventListener('click', handleReset);

    el.presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select, textarea')) return;
      switch (e.key.toLowerCase()) {
        case 'c': e.preventDefault(); handleCopySVG(); break;
        case 'd': e.preventDefault(); handleDownload(); break;
        case 'r': e.preventDefault(); handleReset(); break;
      }
    });
  }

  function init() {
    initElements();
    bindEvents();
    renderLayers();
    updateAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
