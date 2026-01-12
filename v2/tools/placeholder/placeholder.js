/**
 * KVSOVANREACH Placeholder Image Tool
 * Generate SVG placeholder images for web mockups
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    widthInput: document.getElementById('widthInput'),
    heightInput: document.getElementById('heightInput'),
    bgColor: document.getElementById('bgColor'),
    bgColorText: document.getElementById('bgColorText'),
    textColor: document.getElementById('textColor'),
    textColorText: document.getElementById('textColorText'),
    labelInput: document.getElementById('labelInput'),
    previewContainer: document.getElementById('previewContainer'),
    previewSize: document.getElementById('previewSize'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    colorPresets: document.querySelectorAll('.color-preset'),
    copyDataUrlBtn: document.getElementById('copyDataUrlBtn'),
    copySvgBtn: document.getElementById('copySvgBtn'),
    downloadSvgBtn: document.getElementById('downloadSvgBtn'),
    downloadPngBtn: document.getElementById('downloadPngBtn')
  };

  // ==================== Core Functions ====================

  function generateSVG() {
    const width = parseInt(elements.widthInput.value) || 800;
    const height = parseInt(elements.heightInput.value) || 600;
    const bgColor = elements.bgColor.value;
    const textColor = elements.textColor.value;
    const label = elements.labelInput.value || `${width} × ${height}`;

    // Calculate font size based on dimensions
    const fontSize = Math.min(width, height) / 8;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}px" fill="${textColor}">${escapeHtml(label)}</text>
</svg>`;

    return svg;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updatePreview() {
    const svg = generateSVG();
    elements.previewContainer.innerHTML = svg;

    const width = elements.widthInput.value || 800;
    const height = elements.heightInput.value || 600;
    elements.previewSize.textContent = `${width} × ${height}`;
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

  function handleColorPresetClick(e) {
    const btn = e.target.closest('.color-preset');
    if (!btn) return;

    const bg = btn.dataset.bg;
    const text = btn.dataset.text;

    elements.bgColor.value = bg;
    elements.bgColorText.value = bg;
    elements.textColor.value = text;
    elements.textColorText.value = text;
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
    const width = elements.widthInput.value || 800;
    const height = elements.heightInput.value || 600;
    ToolsCommon.FileDownload.text(svg, `placeholder-${width}x${height}.svg`, 'image/svg+xml');
    ToolsCommon.Toast.show('SVG downloaded!', 'success');
  }

  function handleDownloadPng() {
    const svg = generateSVG();
    const width = parseInt(elements.widthInput.value) || 800;
    const height = parseInt(elements.heightInput.value) || 600;

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

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    updatePreview();
  }

  function setupEventListeners() {
    // Dimension inputs
    elements.widthInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));
    elements.heightInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));

    // Label input
    elements.labelInput?.addEventListener('input', ToolsCommon.debounce(updatePreview, 150));

    // Color sync
    syncColorInputs(elements.bgColor, elements.bgColorText);
    syncColorInputs(elements.textColor, elements.textColorText);

    // Presets
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', handlePresetClick);
    });

    elements.colorPresets.forEach(btn => {
      btn.addEventListener('click', handleColorPresetClick);
    });

    // Action buttons
    elements.copyDataUrlBtn?.addEventListener('click', handleCopyDataUrl);
    elements.copySvgBtn?.addEventListener('click', handleCopySvg);
    elements.downloadSvgBtn?.addEventListener('click', handleDownloadSvg);
    elements.downloadPngBtn?.addEventListener('click', handleDownloadPng);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
