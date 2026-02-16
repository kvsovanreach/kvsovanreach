/**
 * KVSOVANREACH Grayscale Tester Tool
 * Test visual hierarchy with grayscale filter
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    uploadSection: document.getElementById('uploadSection'),
    previewSection: document.getElementById('previewSection'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewImage: document.getElementById('previewImage'),
    grayscaleSlider: document.getElementById('grayscaleSlider'),
    sliderValue: document.getElementById('sliderValue'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // ==================== Core Functions ====================

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      ToolsCommon.Toast.show('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      elements.previewImage.src = e.target.result;
      showPreview();
      updateGrayscale();
    };
    reader.readAsDataURL(file);
  }

  function showPreview() {
    elements.uploadSection.hidden = true;
    elements.previewSection.hidden = false;
  }

  function hidePreview() {
    elements.uploadSection.hidden = false;
    elements.previewSection.hidden = true;
    elements.previewImage.src = '';
  }

  function updateGrayscale() {
    const value = elements.grayscaleSlider.value;
    elements.sliderValue.textContent = `${value}%`;
    elements.previewImage.style.filter = `grayscale(${value}%)`;

    // Update quick buttons
    elements.quickBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === value);
    });
  }

  // ==================== Event Handlers ====================

  function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleClick() {
    elements.fileInput.click();
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    handleFile(file);
  }

  function handleQuickBtnClick(e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;

    elements.grayscaleSlider.value = btn.dataset.value;
    updateGrayscale();
  }

  function handleClear() {
    hidePreview();
    elements.fileInput.value = '';
    elements.grayscaleSlider.value = 100;
    updateGrayscale();
    ToolsCommon.Toast.show('Cleared', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    if (elements.previewSection.hidden) return;

    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      elements.grayscaleSlider.value = elements.grayscaleSlider.value === '100' ? '0' : '100';
      updateGrayscale();
    } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      elements.grayscaleSlider.value = 0;
      updateGrayscale();
    }
  }

  // ==================== Initialization ====================

  function init() {
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

    // Slider
    elements.grayscaleSlider?.addEventListener('input', updateGrayscale);

    // Quick buttons
    elements.quickBtns.forEach(btn => {
      btn.addEventListener('click', handleQuickBtnClick);
    });

    // Clear button
    elements.clearBtn?.addEventListener('click', handleClear);

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
