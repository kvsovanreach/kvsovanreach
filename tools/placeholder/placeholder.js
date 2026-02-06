/**
 * KVSOVANREACH Placeholder Image Tool
 * Generate SVG placeholder images for web mockups
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    width: 800,
    height: 600,
    bgColor: '#cccccc',
    bgColor2: '#888888',
    textColor: '#666666',
    label: '',
    useGradient: false,
    gradientAngle: 135
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.widthInput = document.getElementById('widthInput');
    elements.heightInput = document.getElementById('heightInput');
    elements.bgColor = document.getElementById('bgColor');
    elements.bgColorText = document.getElementById('bgColorText');
    elements.bgColor2 = document.getElementById('bgColor2');
    elements.bgColor2Text = document.getElementById('bgColor2Text');
    elements.textColor = document.getElementById('textColor');
    elements.textColorText = document.getElementById('textColorText');
    elements.labelInput = document.getElementById('labelInput');
    elements.gradientEnabled = document.getElementById('gradientEnabled');
    elements.gradientSettings = document.getElementById('gradientSettings');
    elements.gradientAngle = document.getElementById('gradientAngle');
    elements.angleValue = document.getElementById('angleValue');
    elements.previewContainer = document.getElementById('previewContainer');
    elements.previewSize = document.getElementById('previewSize');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.copyDataUrlBtn = document.getElementById('copyDataUrlBtn');
    elements.copySvgBtn = document.getElementById('copySvgBtn');
    elements.downloadSvgBtn = document.getElementById('downloadSvgBtn');
    elements.downloadPngBtn = document.getElementById('downloadPngBtn');
  }

  // ==================== Core Functions ====================

  function generateSVG() {
    const width = state.width;
    const height = state.height;
    const textColor = state.textColor;
    const label = state.label || `${width} × ${height}`;

    // Calculate font size based on dimensions
    const fontSize = Math.min(width, height) / 8;

    let backgroundFill;
    let defsContent = '';

    if (state.useGradient) {
      // Calculate gradient coordinates based on angle
      const angle = state.gradientAngle;
      const angleRad = (angle - 90) * Math.PI / 180;
      const x1 = 50 - Math.cos(angleRad) * 50;
      const y1 = 50 - Math.sin(angleRad) * 50;
      const x2 = 50 + Math.cos(angleRad) * 50;
      const y2 = 50 + Math.sin(angleRad) * 50;

      defsContent = `
  <defs>
    <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" style="stop-color:${state.bgColor}"/>
      <stop offset="100%" style="stop-color:${state.bgColor2}"/>
    </linearGradient>
  </defs>`;
      backgroundFill = 'url(#grad)';
    } else {
      backgroundFill = state.bgColor;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defsContent}
  <rect width="100%" height="100%" fill="${backgroundFill}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}px" fill="${textColor}">${escapeHtml(label)}</text>
</svg>`;

    return svg;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateStateFromInputs() {
    state.width = parseInt(elements.widthInput.value) || 800;
    state.height = parseInt(elements.heightInput.value) || 600;
    state.bgColor = elements.bgColor.value;
    state.bgColor2 = elements.bgColor2.value;
    state.textColor = elements.textColor.value;
    state.label = elements.labelInput.value;
    state.useGradient = elements.gradientEnabled.checked;
    state.gradientAngle = parseInt(elements.gradientAngle.value) || 135;
  }

  function updatePreview() {
    updateStateFromInputs();
    const svg = generateSVG();
    elements.previewContainer.innerHTML = svg;
    elements.previewSize.textContent = `${state.width} × ${state.height}`;
  }

  function getSvgDataUrl() {
    const svg = generateSVG();
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  // ==================== Event Handlers ====================

  function handlePresetClick(e) {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;

    elements.widthInput.value = btn.dataset.width;
    elements.heightInput.value = btn.dataset.height;
    updatePreview();
  }

  function handleGradientToggle() {
    const isEnabled = elements.gradientEnabled.checked;
    if (isEnabled) {
      elements.gradientSettings.classList.remove('hidden');
    } else {
      elements.gradientSettings.classList.add('hidden');
    }
    updatePreview();
  }

  function handleAngleChange() {
    elements.angleValue.textContent = elements.gradientAngle.value + '°';
    updatePreview();
  }

  function syncColorInputs(colorInput, textInput) {
    colorInput.addEventListener('input', () => {
      textInput.value = colorInput.value;
      updatePreview();
    });

    textInput.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
        colorInput.value = textInput.value;
        updatePreview();
      }
    });

    textInput.addEventListener('blur', () => {
      if (!/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
        textInput.value = colorInput.value;
      }
    });
  }

  async function handleCopyDataUrl() {
    const dataUrl = getSvgDataUrl();
    await ToolsCommon.Clipboard.copyWithToast(dataUrl, 'Data URL copied!');
  }

  async function handleCopySvg() {
    const svg = generateSVG();
    await ToolsCommon.Clipboard.copyWithToast(svg, 'SVG code copied!');
  }

  function handleDownloadSvg() {
    const svg = generateSVG();
    ToolsCommon.FileDownload.text(svg, `placeholder-${state.width}x${state.height}.svg`, 'image/svg+xml');
    ToolsCommon.Toast.show('SVG downloaded!', 'success');
  }

  function handleDownloadPng() {
    const svg = generateSVG();
    const width = state.width;
    const height = state.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function(blob) {
        ToolsCommon.FileDownload.blob(blob, `placeholder-${width}x${height}.png`);
        ToolsCommon.Toast.show('PNG downloaded!', 'success');
      }, 'image/png');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      handleCopyDataUrl();
    } else if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      handleDownloadSvg();
    }
  }

  // ==================== Event Listeners ====================

  function setupEventListeners() {
    // Dimension inputs
    elements.widthInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));
    elements.heightInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));

    // Label input
    elements.labelInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));

    // Color sync
    if (elements.bgColor && elements.bgColorText) {
      syncColorInputs(elements.bgColor, elements.bgColorText);
    }
    if (elements.bgColor2 && elements.bgColor2Text) {
      syncColorInputs(elements.bgColor2, elements.bgColor2Text);
    }
    if (elements.textColor && elements.textColorText) {
      syncColorInputs(elements.textColor, elements.textColorText);
    }

    // Gradient toggle
    elements.gradientEnabled?.addEventListener('change', handleGradientToggle);
    elements.gradientAngle?.addEventListener('input', handleAngleChange);

    // Presets
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', handlePresetClick);
    });

    // Action buttons
    elements.copyDataUrlBtn?.addEventListener('click', handleCopyDataUrl);
    elements.copySvgBtn?.addEventListener('click', handleCopySvg);
    elements.downloadSvgBtn?.addEventListener('click', handleDownloadSvg);
    elements.downloadPngBtn?.addEventListener('click', handleDownloadPng);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
    updatePreview();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
