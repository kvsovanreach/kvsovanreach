/**
 * KVSOVANREACH Grayscale Tester Tool
 * Test visual hierarchy with grayscale filter
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    grayscaleValue: 100,
    imageLoaded: false,
    isClearing: false
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.uploadSection = document.getElementById('uploadSection');
    elements.previewSection = document.getElementById('previewSection');
    elements.uploadArea = document.getElementById('uploadArea');
    elements.fileInput = document.getElementById('fileInput');
    elements.previewImage = document.getElementById('previewImage');
    elements.grayscaleSlider = document.getElementById('grayscaleSlider');
    elements.sliderValue = document.getElementById('sliderValue');
    elements.quickBtns = document.querySelectorAll('.quick-btn');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== Core Functions ====================

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      ToolsCommon?.showToast?.('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      elements.previewImage.src = e.target.result;
      state.imageLoaded = true;
      showPreview();
      updateGrayscale();
    };
    reader.readAsDataURL(file);
  }

  function showPreview() {
    elements.uploadSection.hidden = true;
    elements.previewSection.hidden = false;
    if (elements.downloadBtn) elements.downloadBtn.disabled = false;
  }

  function hidePreview() {
    elements.uploadSection.hidden = false;
    elements.previewSection.hidden = true;
    state.isClearing = true;
    elements.previewImage.removeAttribute('src');
    state.imageLoaded = false;
    state.isClearing = false;
    if (elements.downloadBtn) elements.downloadBtn.disabled = true;
  }

  function downloadImage() {
    if (!state.imageLoaded) return;

    const img = elements.previewImage;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply grayscale filter
    ctx.filter = `grayscale(${state.grayscaleValue}%)`;
    ctx.drawImage(img, 0, 0);

    // Download
    const link = document.createElement('a');
    link.download = `grayscale-${state.grayscaleValue}pct.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    ToolsCommon?.showToast?.('Image downloaded', 'success');
  }

  function updateGrayscale() {
    const value = elements.grayscaleSlider.value;
    state.grayscaleValue = parseInt(value, 10);
    elements.sliderValue.textContent = `${value}%`;
    elements.previewImage.style.filter = `grayscale(${value}%)`;

    // Update quick buttons
    elements.quickBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === value);
    });
  }

  function resetForm() {
    hidePreview();
    elements.fileInput.value = '';
    elements.grayscaleSlider.value = 100;
    state.grayscaleValue = 100;
    updateGrayscale();
    ToolsCommon?.showToast?.('Reset', 'success');
  }

  // ==================== Event Handlers ====================

  function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea?.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('dragover');

    const file = e.dataTransfer?.files[0];
    handleFile(file);
  }

  function handleClick() {
    elements.fileInput?.click();
  }

  function handleFileSelect(e) {
    const file = e.target?.files?.[0];
    handleFile(file);
  }

  function handleQuickBtnClick(e) {
    const btn = e.target?.closest('.quick-btn');
    if (!btn) return;

    elements.grayscaleSlider.value = btn.dataset.value;
    updateGrayscale();
  }

  function handleKeydown(e) {
    if (e.target?.matches('input, textarea, select, [contenteditable]')) return;

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetForm();
      return;
    }

    if (elements.previewSection?.hidden) return;

    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      elements.grayscaleSlider.value = elements.grayscaleSlider.value === '100' ? '0' : '100';
      updateGrayscale();
    } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      elements.grayscaleSlider.value = 0;
      updateGrayscale();
    } else if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      downloadImage();
    }
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Upload area
    elements.uploadArea?.addEventListener('dragover', handleDragOver);
    elements.uploadArea?.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea?.addEventListener('drop', handleDrop);
    elements.uploadArea?.addEventListener('click', handleClick);

    // File input
    elements.fileInput?.addEventListener('change', handleFileSelect);

    // Image error handler
    elements.previewImage?.addEventListener('error', () => {
      if (state.isClearing) return;
      ToolsCommon?.showToast?.('Failed to load image', 'error');
      hidePreview();
    });

    // Slider
    elements.grayscaleSlider?.addEventListener('input', updateGrayscale);

    // Quick buttons
    elements.quickBtns?.forEach(btn => {
      btn.addEventListener('click', handleQuickBtnClick);
    });

    // Download button
    elements.downloadBtn?.addEventListener('click', downloadImage);

    // Reset button
    elements.resetBtn?.addEventListener('click', resetForm);

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
