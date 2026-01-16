/**
 * Favicon Generator Tool
 * Generate favicons from images with multiple sizes
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    sourceImage: null,
    background: 'transparent',
    customBgColor: '#3b82f6',
    shape: 'square',
    padding: 0
  };

  // Favicon sizes
  const SIZES = [16, 32, 48, 64, 128, 256];
  const APPLE_SIZE = 180;
  const ANDROID_SIZES = [192, 512];

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Upload
    uploadArea: document.getElementById('uploadArea'),
    imageInput: document.getElementById('imageInput'),

    // Editor
    editorSection: document.getElementById('editorSection'),
    sourceImage: document.getElementById('sourceImage'),
    sourceInfo: document.getElementById('sourceInfo'),
    changeImageBtn: document.getElementById('changeImageBtn'),

    // Options
    customBgColor: document.getElementById('customBgColor'),
    paddingSlider: document.getElementById('paddingSlider'),
    paddingValue: document.getElementById('paddingValue'),

    // Previews
    browserFavicon: document.getElementById('browserFavicon'),

    // Download
    downloadPngBtn: document.getElementById('downloadPngBtn'),
    downloadIcoBtn: document.getElementById('downloadIcoBtn'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),

    // Code
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    htmlCode: document.getElementById('htmlCode'),

    // Other
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
  }

  function initEventListeners() {
    // Upload
    elements.uploadArea?.addEventListener('click', () => elements.imageInput?.click());
    elements.imageInput?.addEventListener('change', handleFileSelect);
    elements.changeImageBtn?.addEventListener('click', () => elements.imageInput?.click());

    // Drag and drop
    elements.uploadArea?.addEventListener('dragover', handleDragOver);
    elements.uploadArea?.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea?.addEventListener('drop', handleDrop);

    // Background options
    document.querySelectorAll('.bg-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.background = btn.dataset.bg;
        if (state.background === 'custom') {
          state.background = elements.customBgColor.value;
        }
        updatePreviews();
      });
    });

    elements.customBgColor?.addEventListener('input', (e) => {
      state.customBgColor = e.target.value;
      state.background = e.target.value;
      document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
      e.target.closest('.bg-option').classList.add('active');
      updatePreviews();
    });

    // Shape options
    document.querySelectorAll('.shape-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.shape = btn.dataset.shape;
        updatePreviews();
      });
    });

    // Padding
    elements.paddingSlider?.addEventListener('input', (e) => {
      state.padding = parseInt(e.target.value);
      elements.paddingValue.textContent = `${state.padding}%`;
      updatePreviews();
    });

    // Download buttons
    elements.downloadPngBtn?.addEventListener('click', downloadPng);
    elements.downloadIcoBtn?.addEventListener('click', downloadIco);
    elements.downloadAllBtn?.addEventListener('click', downloadAll);

    // Copy code
    elements.copyCodeBtn?.addEventListener('click', copyHtmlCode);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // File Handling
  // ============================================
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea?.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    } else {
      showToast('Please drop an image file', 'error');
    }
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.sourceImage = img;
        elements.sourceImage.src = e.target.result;
        elements.sourceInfo.textContent = `${img.width} x ${img.height}px`;

        // Show editor, hide upload
        elements.uploadArea.parentElement.style.display = 'none';
        elements.editorSection.style.display = 'block';

        updatePreviews();
        showToast('Image loaded successfully', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ============================================
  // Preview Generation
  // ============================================
  function updatePreviews() {
    if (!state.sourceImage) return;

    // Update all size previews
    SIZES.forEach(size => {
      const canvas = document.getElementById(`preview${size}`);
      if (canvas) {
        renderFavicon(canvas, size);
      }
    });

    // Update browser preview
    if (elements.browserFavicon) {
      renderFavicon(elements.browserFavicon, 16);
    }
  }

  function renderFavicon(canvas, size) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    if (state.background !== 'transparent') {
      ctx.fillStyle = state.background;

      if (state.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (state.shape === 'rounded') {
        const radius = size * 0.2;
        roundRect(ctx, 0, 0, size, size, radius);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // Apply clipping for shape
    if (state.shape !== 'square') {
      ctx.save();
      ctx.beginPath();
      if (state.shape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (state.shape === 'rounded') {
        const radius = size * 0.2;
        roundRect(ctx, 0, 0, size, size, radius);
      }
      ctx.clip();
    }

    // Calculate padding
    const paddingPx = (state.padding / 100) * size;
    const drawSize = size - (paddingPx * 2);

    // Draw image centered and scaled
    const scale = Math.min(drawSize / state.sourceImage.width, drawSize / state.sourceImage.height);
    const imgWidth = state.sourceImage.width * scale;
    const imgHeight = state.sourceImage.height * scale;
    const x = (size - imgWidth) / 2;
    const y = (size - imgHeight) / 2;

    ctx.drawImage(state.sourceImage, x, y, imgWidth, imgHeight);

    if (state.shape !== 'square') {
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ============================================
  // Download Functions
  // ============================================
  async function downloadPng() {
    if (!state.sourceImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    const zip = new JSZip();

    SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      zip.file(`favicon-${size}x${size}.png`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'favicons-png.zip');
    showToast('PNG icons downloaded', 'success');
  }

  async function downloadIco() {
    if (!state.sourceImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    // Generate ICO file (simplified - using largest size as PNG)
    const canvas = document.createElement('canvas');
    renderFavicon(canvas, 32);

    canvas.toBlob((blob) => {
      // For a real ICO, we'd need to combine multiple sizes
      // This is a simplified version using PNG
      downloadBlob(blob, 'favicon.ico');
      showToast('ICO file downloaded', 'success');
    }, 'image/png');
  }

  async function downloadAll() {
    if (!state.sourceImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    const zip = new JSZip();

    // Add PNG favicons
    SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      zip.file(`favicon-${size}x${size}.png`, base64, { base64: true });
    });

    // Add Apple Touch Icon
    const appleCanvas = document.createElement('canvas');
    renderFavicon(appleCanvas, APPLE_SIZE);
    const appleData = appleCanvas.toDataURL('image/png').split(',')[1];
    zip.file('apple-touch-icon.png', appleData, { base64: true });

    // Add Android icons
    ANDROID_SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      zip.file(`android-chrome-${size}x${size}.png`, base64, { base64: true });
    });

    // Add favicon.ico (32x32 PNG)
    const icoCanvas = document.createElement('canvas');
    renderFavicon(icoCanvas, 32);
    const icoData = icoCanvas.toDataURL('image/png').split(',')[1];
    zip.file('favicon.ico', icoData, { base64: true });

    // Add web manifest
    const manifest = {
      name: "My Website",
      short_name: "Website",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };
    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    // Add browserconfig.xml
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/favicon-128x128.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
    zip.file('browserconfig.xml', browserconfig);

    // Add README
    const readme = `Favicon Package
===============

Files included:
- favicon.ico (32x32)
- favicon-16x16.png
- favicon-32x32.png
- favicon-48x48.png
- favicon-64x64.png
- favicon-128x128.png
- favicon-256x256.png
- apple-touch-icon.png (180x180)
- android-chrome-192x192.png
- android-chrome-512x512.png
- site.webmanifest
- browserconfig.xml

HTML Code:
----------
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
`;
    zip.file('README.txt', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'favicon-package.zip');
    showToast('Full package downloaded', 'success');
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================
  // Code Copy
  // ============================================
  function copyHtmlCode() {
    const code = elements.htmlCode?.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
      showToast('HTML code copied!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.matches('input, textarea')) return;

    // Ctrl shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'o':
          e.preventDefault();
          elements.imageInput?.click();
          break;
        case 's':
          e.preventDefault();
          downloadAll();
          break;
      }
    }
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
