/**
 * Image Compressor Tool
 * Compress and resize images while maintaining quality
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    images: [],
    quality: 80,
    format: 'webp',
    maxWidth: null
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Upload
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),

    // Settings
    qualitySlider: document.getElementById('qualitySlider'),
    qualityValue: document.getElementById('qualityValue'),
    formatSelect: document.getElementById('formatSelect'),
    maxWidth: document.getElementById('maxWidth'),

    // Image list
    imageList: document.getElementById('imageList'),

    // Actions
    imageActions: document.getElementById('imageActions'),
    compressAllBtn: document.getElementById('compressAllBtn'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    headerClearBtn: document.getElementById('headerClearBtn'),

    // Summary
    compressionSummary: document.getElementById('compressionSummary'),
    totalImages: document.getElementById('totalImages'),
    originalSize: document.getElementById('originalSize'),
    compressedSize: document.getElementById('compressedSize'),
    savedSize: document.getElementById('savedSize'),

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
    // Upload zone
    elements.uploadZone?.addEventListener('click', () => elements.fileInput?.click());
    elements.fileInput?.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadZone?.addEventListener('dragover', handleDragOver);
    elements.uploadZone?.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone?.addEventListener('drop', handleDrop);

    // Settings
    elements.qualitySlider?.addEventListener('input', (e) => {
      state.quality = parseInt(e.target.value);
      elements.qualityValue.textContent = state.quality + '%';
    });

    elements.formatSelect?.addEventListener('change', (e) => {
      state.format = e.target.value;
    });

    elements.maxWidth?.addEventListener('change', (e) => {
      state.maxWidth = e.target.value ? parseInt(e.target.value) : null;
    });

    // Actions
    elements.compressAllBtn?.addEventListener('click', compressAll);
    elements.downloadAllBtn?.addEventListener('click', downloadAll);
    elements.clearAllBtn?.addEventListener('click', clearAll);
    elements.headerClearBtn?.addEventListener('click', clearAll);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;

      if (e.key.toLowerCase() === 'c' && state.images.length > 0) {
        e.preventDefault();
        compressAll();
      }
      if (e.key.toLowerCase() === 'd' && state.images.length > 0) {
        e.preventDefault();
        downloadAll();
      }
      if (e.key === 'Delete' && state.images.length > 0) {
        e.preventDefault();
        clearAll();
      }
    });
  }

  // ============================================
  // File Handling
  // ============================================
  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = ''; // Reset input
  }

  function handleDragOver(e) {
    e.preventDefault();
    elements.uploadZone.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      showToast('Please drop image files', 'error');
      return;
    }

    processFiles(files);
  }

  function processFiles(files) {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} is not an image`, 'error');
        return;
      }

      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageData = {
            id,
            file,
            name: file.name,
            originalSize: file.size,
            compressedSize: null,
            compressedBlob: null,
            width: img.width,
            height: img.height,
            dataUrl: e.target.result,
            status: 'pending'
          };

          state.images.push(imageData);
          renderImageItem(imageData);
          updateUI();
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  // ============================================
  // Rendering
  // ============================================
  function renderImageItem(imageData) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.id = `image-${imageData.id}`;

    item.innerHTML = `
      <div class="image-preview">
        <img src="${imageData.dataUrl}" alt="${imageData.name}">
      </div>
      <div class="image-info">
        <div class="image-name">${escapeHtml(imageData.name)}</div>
        <div class="image-details">
          <span>${imageData.width} x ${imageData.height}</span>
          <span>${formatFileSize(imageData.originalSize)}</span>
        </div>
        <div class="image-size-comparison" style="display: none;">
          <span class="size-original">${formatFileSize(imageData.originalSize)}</span>
          <i class="fa-solid fa-arrow-right size-arrow"></i>
          <span class="size-compressed">-</span>
          <span class="size-savings">-</span>
        </div>
      </div>
      <div class="image-status">
        <div class="status-icon pending">
          <i class="fa-solid fa-clock"></i>
        </div>
      </div>
      <div class="image-actions-item">
        <button class="item-btn compress-btn" title="Compress">
          <i class="fa-solid fa-compress"></i>
        </button>
        <button class="item-btn download-btn" title="Download" disabled>
          <i class="fa-solid fa-download"></i>
        </button>
        <button class="item-btn danger remove-btn" title="Remove">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    // Event listeners
    item.querySelector('.compress-btn').addEventListener('click', () => compressImage(imageData.id));
    item.querySelector('.download-btn').addEventListener('click', () => downloadImage(imageData.id));
    item.querySelector('.remove-btn').addEventListener('click', () => removeImage(imageData.id));

    elements.imageList.appendChild(item);
  }

  function updateImageItem(imageData) {
    const item = document.getElementById(`image-${imageData.id}`);
    if (!item) return;

    const statusIcon = item.querySelector('.status-icon');
    const sizeComparison = item.querySelector('.image-size-comparison');
    const downloadBtn = item.querySelector('.download-btn');

    if (imageData.status === 'processing') {
      statusIcon.className = 'status-icon processing';
      statusIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    } else if (imageData.status === 'done') {
      statusIcon.className = 'status-icon done';
      statusIcon.innerHTML = '<i class="fa-solid fa-check"></i>';

      // Show size comparison
      const savings = imageData.originalSize - imageData.compressedSize;
      const savingsPercent = Math.round((savings / imageData.originalSize) * 100);

      sizeComparison.style.display = 'flex';
      sizeComparison.querySelector('.size-compressed').textContent = formatFileSize(imageData.compressedSize);
      sizeComparison.querySelector('.size-savings').textContent = `-${savingsPercent}%`;

      downloadBtn.disabled = false;
    } else if (imageData.status === 'error') {
      statusIcon.className = 'status-icon error';
      statusIcon.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
    }
  }

  function updateUI() {
    const hasImages = state.images.length > 0;

    elements.imageActions.style.display = hasImages ? 'flex' : 'none';
    if (elements.headerClearBtn) {
      elements.headerClearBtn.style.display = hasImages ? 'flex' : 'none';
    }

    updateSummary();
  }

  function updateSummary() {
    const total = state.images.length;
    const originalTotal = state.images.reduce((sum, img) => sum + img.originalSize, 0);
    const compressedTotal = state.images
      .filter(img => img.compressedSize !== null)
      .reduce((sum, img) => sum + img.compressedSize, 0);

    const hasCompressed = state.images.some(img => img.status === 'done');

    elements.compressionSummary.style.display = hasCompressed ? 'flex' : 'none';

    if (hasCompressed) {
      const originalCompressable = state.images
        .filter(img => img.compressedSize !== null)
        .reduce((sum, img) => sum + img.originalSize, 0);

      const saved = originalCompressable - compressedTotal;
      const savedPercent = originalCompressable > 0 ? Math.round((saved / originalCompressable) * 100) : 0;

      elements.totalImages.textContent = total;
      elements.originalSize.textContent = formatFileSize(originalCompressable);
      elements.compressedSize.textContent = formatFileSize(compressedTotal);
      elements.savedSize.textContent = `${formatFileSize(saved)} (${savedPercent}%)`;
    }
  }

  // ============================================
  // Compression
  // ============================================
  async function compressImage(id) {
    const imageData = state.images.find(img => img.id === id);
    if (!imageData) return;

    imageData.status = 'processing';
    updateImageItem(imageData);

    try {
      const compressedBlob = await compress(imageData);
      imageData.compressedBlob = compressedBlob;
      imageData.compressedSize = compressedBlob.size;
      imageData.status = 'done';

      updateImageItem(imageData);
      updateSummary();
      showToast(`Compressed ${imageData.name}`, 'success');
    } catch (e) {
      imageData.status = 'error';
      updateImageItem(imageData);
      showToast(`Failed to compress ${imageData.name}`, 'error');
    }
  }

  async function compressAll() {
    const pendingImages = state.images.filter(img => img.status !== 'done');

    if (pendingImages.length === 0) {
      showToast('All images already compressed', 'info');
      return;
    }

    for (const imageData of pendingImages) {
      await compressImage(imageData.id);
    }

    showToast(`Compressed ${pendingImages.length} images`, 'success');
  }

  function compress(imageData) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Resize if max width is set
        if (state.maxWidth && width > state.maxWidth) {
          const ratio = state.maxWidth / width;
          width = state.maxWidth;
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format
        let mimeType = 'image/jpeg';
        if (state.format === 'original') {
          mimeType = imageData.file.type;
        } else if (state.format === 'png') {
          mimeType = 'image/png';
        } else if (state.format === 'webp') {
          mimeType = 'image/webp';
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          state.quality / 100
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData.dataUrl;
    });
  }

  // ============================================
  // Download
  // ============================================
  function downloadImage(id) {
    const imageData = state.images.find(img => img.id === id);
    if (!imageData || !imageData.compressedBlob) return;

    const url = URL.createObjectURL(imageData.compressedBlob);
    const a = document.createElement('a');
    a.href = url;

    // Update filename with new extension
    const ext = getExtensionFromFormat();
    const baseName = imageData.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}_compressed.${ext}`;

    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAll() {
    const compressedImages = state.images.filter(img => img.status === 'done');

    if (compressedImages.length === 0) {
      showToast('No compressed images to download', 'error');
      return;
    }

    // If only one image, download directly
    if (compressedImages.length === 1) {
      downloadImage(compressedImages[0].id);
      return;
    }

    // For multiple images, download each with a delay
    for (let i = 0; i < compressedImages.length; i++) {
      setTimeout(() => {
        downloadImage(compressedImages[i].id);
      }, i * 500);
    }

    showToast(`Downloading ${compressedImages.length} images`, 'success');
  }

  function getExtensionFromFormat() {
    switch (state.format) {
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'webp': return 'webp';
      default: return 'jpg';
    }
  }

  // ============================================
  // Remove
  // ============================================
  function removeImage(id) {
    const index = state.images.findIndex(img => img.id === id);
    if (index === -1) return;

    state.images.splice(index, 1);

    const item = document.getElementById(`image-${id}`);
    if (item) {
      item.remove();
    }

    updateUI();
  }

  function clearAll() {
    if (state.images.length === 0) {
      showToast('No images to clear', 'info');
      return;
    }

    state.images = [];
    elements.imageList.innerHTML = '';
    updateUI();
    showToast('All images cleared', 'success');
  }

  // ============================================
  // Utilities
  // ============================================
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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
