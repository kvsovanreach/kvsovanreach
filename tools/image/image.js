/**
 * KVSOVANREACH Image Compressor Tool
 * Compress and resize images while maintaining quality
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    images: [],
    quality: 80,
    format: 'original',
    maxWidth: null,
    savedLevels: []
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Upload
    elements.uploadZone = document.getElementById('uploadZone');
    elements.fileInput = document.getElementById('fileInput');

    // Settings
    elements.qualitySlider = document.getElementById('qualitySlider');
    elements.qualityValue = document.getElementById('qualityValue');
    elements.addLevelBtn = document.getElementById('addLevelBtn');
    elements.savedLevels = document.getElementById('savedLevels');
    elements.formatSelect = document.getElementById('formatSelect');
    elements.maxWidth = document.getElementById('maxWidth');

    // Image list
    elements.imageList = document.getElementById('imageList');

    // Actions
    elements.imageActions = document.getElementById('imageActions');
    elements.compressAllBtn = document.getElementById('compressAllBtn');
    elements.downloadAllBtn = document.getElementById('downloadAllBtn');
    elements.clearAllBtn = document.getElementById('clearAllBtn');
    elements.headerClearBtn = document.getElementById('headerClearBtn');

    // Summary
    elements.compressionSummary = document.getElementById('compressionSummary');
    elements.totalImages = document.getElementById('totalImages');
    elements.originalSize = document.getElementById('originalSize');
    elements.compressedSize = document.getElementById('compressedSize');
    elements.savedSize = document.getElementById('savedSize');
  }

  // ==================== File Handling ====================

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = '';
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
      ToolsCommon.Toast.show('Please drop image files', 'error');
      return;
    }

    processFiles(files);
  }

  function processFiles(files) {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        ToolsCommon.Toast.show(`${file.name} is not an image`, 'error');
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
            originalType: file.type,
            compressedVersions: [],
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

  // ==================== Level Management ====================

  function addLevel() {
    const quality = state.quality;

    if (state.savedLevels.includes(quality)) {
      ToolsCommon.Toast.show(`${quality}% already added`, 'info');
      return;
    }

    state.savedLevels.push(quality);
    state.savedLevels.sort((a, b) => b - a);
    renderSavedLevels();
    ToolsCommon.Toast.show(`Added ${quality}% level`, 'success');
  }

  function removeLevel(quality) {
    const index = state.savedLevels.indexOf(quality);
    if (index > -1) {
      state.savedLevels.splice(index, 1);
      renderSavedLevels();
    }
  }

  function renderSavedLevels() {
    elements.savedLevels.innerHTML = state.savedLevels.map(q => `
      <span class="level-tag" data-quality="${q}">
        ${q}%
        <button class="remove-level" title="Remove"><i class="fa-solid fa-xmark"></i></button>
      </span>
    `).join('');

    // Add event listeners
    elements.savedLevels.querySelectorAll('.remove-level').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const quality = parseInt(btn.closest('.level-tag').dataset.quality);
        removeLevel(quality);
      });
    });
  }

  // ==================== Rendering ====================

  function renderImageItem(imageData) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.id = `image-${imageData.id}`;

    item.innerHTML = `
      <div class="image-preview">
        <img src="${imageData.dataUrl}" alt="${escapeHtml(imageData.name)}">
      </div>
      <div class="image-info">
        <div class="image-name">${escapeHtml(imageData.name)}</div>
        <div class="image-details">
          <span>${imageData.width} × ${imageData.height}</span>
          <span>${formatFileSize(imageData.originalSize)}</span>
        </div>
        <div class="image-versions" style="display: none;"></div>
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

    item.querySelector('.compress-btn').addEventListener('click', () => compressImage(imageData.id));
    item.querySelector('.download-btn').addEventListener('click', () => showDownloadOptions(imageData.id));
    item.querySelector('.remove-btn').addEventListener('click', () => removeImage(imageData.id));

    elements.imageList.appendChild(item);
  }

  function updateImageItem(imageData) {
    const item = document.getElementById(`image-${imageData.id}`);
    if (!item) return;

    const statusIcon = item.querySelector('.status-icon');
    const versionsContainer = item.querySelector('.image-versions');
    const downloadBtn = item.querySelector('.download-btn');
    const compressBtn = item.querySelector('.compress-btn');

    if (imageData.status === 'processing') {
      statusIcon.className = 'status-icon processing';
      statusIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      compressBtn.disabled = true;
    } else if (imageData.status === 'done') {
      statusIcon.className = 'status-icon done';
      statusIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
      compressBtn.disabled = false;
      compressBtn.title = 'Re-compress';
      compressBtn.innerHTML = '<i class="fa-solid fa-rotate"></i>';

      if (imageData.compressedVersions.length > 0) {
        versionsContainer.style.display = 'flex';
        versionsContainer.innerHTML = imageData.compressedVersions.map(v => {
          const savings = imageData.originalSize - v.size;
          const savingsPercent = Math.round((savings / imageData.originalSize) * 100);
          const isSmaller = savings > 0;
          return `
            <div class="version-tag ${isSmaller ? '' : 'larger'}" data-quality="${v.quality}">
              <span class="version-quality">${v.quality}%</span>
              <span class="version-size">${formatFileSize(v.size)}</span>
              <span class="version-savings">${isSmaller ? '-' : '+'}${Math.abs(savingsPercent)}%</span>
            </div>
          `;
        }).join('');
      }

      downloadBtn.disabled = false;
    } else if (imageData.status === 'error') {
      statusIcon.className = 'status-icon error';
      statusIcon.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
      compressBtn.disabled = false;
    } else if (imageData.status === 'pending') {
      statusIcon.className = 'status-icon pending';
      statusIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
      compressBtn.disabled = false;
      compressBtn.title = 'Compress';
      compressBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
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
    const hasCompressed = state.images.some(img => img.status === 'done');

    elements.compressionSummary.style.display = hasCompressed ? 'flex' : 'none';

    if (hasCompressed) {
      const compressedImages = state.images.filter(img => img.compressedVersions.length > 0);
      const originalTotal = compressedImages.reduce((sum, img) => sum + img.originalSize, 0);

      const compressedTotal = compressedImages.reduce((sum, img) => {
        if (img.compressedVersions.length === 0) return sum + img.originalSize;
        const smallestVersion = img.compressedVersions.reduce((min, v) =>
          v.size < min.size ? v : min, img.compressedVersions[0]);
        return sum + smallestVersion.size;
      }, 0);

      const saved = originalTotal - compressedTotal;
      const savedPercent = originalTotal > 0 ? Math.round((saved / originalTotal) * 100) : 0;
      const isSmaller = saved >= 0;

      elements.totalImages.textContent = total;
      elements.originalSize.textContent = formatFileSize(originalTotal);
      elements.compressedSize.textContent = formatFileSize(compressedTotal);

      if (isSmaller) {
        elements.savedSize.textContent = `${formatFileSize(saved)} (${savedPercent}%)`;
        elements.savedSize.className = 'summary-value success';
      } else {
        elements.savedSize.textContent = `+${formatFileSize(Math.abs(saved))} (+${Math.abs(savedPercent)}%)`;
        elements.savedSize.className = 'summary-value error';
      }
    }
  }

  // ==================== Compression ====================

  async function compressImage(id) {
    const imageData = state.images.find(img => img.id === id);
    if (!imageData) return;

    if (state.savedLevels.length === 0) {
      ToolsCommon.Toast.show('Please add at least one quality level', 'error');
      return;
    }

    imageData.status = 'processing';
    imageData.compressedVersions = [];
    updateImageItem(imageData);

    try {
      for (const quality of state.savedLevels) {
        const result = await compress(imageData, quality);
        imageData.compressedVersions.push({
          quality,
          blob: result.blob,
          size: result.blob.size,
          usedOriginal: result.usedOriginal
        });
      }

      imageData.status = 'done';
      updateImageItem(imageData);
      updateSummary();

      const levelStr = state.savedLevels.length > 1
        ? `at ${state.savedLevels.length} levels`
        : `at ${state.savedLevels[0]}%`;
      ToolsCommon.Toast.show(`Compressed ${imageData.name} ${levelStr}`, 'success');
    } catch (e) {
      imageData.status = 'error';
      updateImageItem(imageData);
      ToolsCommon.Toast.show(`Failed to compress ${imageData.name}`, 'error');
    }
  }

  async function compressAll() {
    if (state.savedLevels.length === 0) {
      ToolsCommon.Toast.show('Please add at least one quality level', 'error');
      return;
    }

    const pendingImages = state.images.filter(img => img.status !== 'done' || img.compressedVersions.length === 0);

    if (pendingImages.length === 0) {
      const allImages = state.images;
      for (const imageData of allImages) {
        await compressImage(imageData.id);
      }
      ToolsCommon.Toast.show(`Re-compressed ${allImages.length} images`, 'success');
      return;
    }

    for (const imageData of pendingImages) {
      await compressImage(imageData.id);
    }

    ToolsCommon.Toast.show(`Compressed ${pendingImages.length} images`, 'success');
  }

  function compress(imageData, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const isResizing = state.maxWidth && width > state.maxWidth;

        if (isResizing) {
          const ratio = state.maxWidth / width;
          width = state.maxWidth;
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/jpeg';
        if (state.format === 'original') {
          mimeType = imageData.originalType || imageData.file.type;
          // PNG doesn't support quality, convert to WebP for better compression
          if (mimeType === 'image/png') {
            mimeType = 'image/webp';
          }
        } else if (state.format === 'png') {
          mimeType = 'image/png';
        } else if (state.format === 'webp') {
          mimeType = 'image/webp';
        } else if (state.format === 'jpeg') {
          mimeType = 'image/jpeg';
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // If compressed is larger than original and not resizing, use original
              if (blob.size >= imageData.originalSize && !isResizing) {
                resolve({ blob: imageData.file, usedOriginal: true });
              } else {
                resolve({ blob, usedOriginal: false });
              }
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality / 100
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData.dataUrl;
    });
  }

  // ==================== Download ====================

  function showDownloadOptions(id) {
    const imageData = state.images.find(img => img.id === id);
    if (!imageData || imageData.compressedVersions.length === 0) return;

    if (imageData.compressedVersions.length === 1) {
      downloadVersion(imageData, imageData.compressedVersions[0]);
      return;
    }

    showDownloadModal(imageData);
  }

  function showDownloadModal(imageData) {
    const existingModal = document.getElementById('downloadModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.className = 'download-modal';
    modal.innerHTML = `
      <div class="download-modal-content">
        <div class="download-modal-header">
          <h3>Download Options</h3>
          <button class="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="download-modal-body">
          <p class="download-filename">${escapeHtml(imageData.name)}</p>
          <div class="download-versions">
            ${imageData.compressedVersions.map(v => {
              const savings = imageData.originalSize - v.size;
              const savingsPercent = Math.round((savings / imageData.originalSize) * 100);
              const isSmaller = savings > 0;
              return `
                <button class="download-version-btn" data-quality="${v.quality}">
                  <span class="version-info">
                    <span class="quality">${v.quality}% Quality</span>
                    <span class="size">${formatFileSize(v.size)} (${isSmaller ? '-' : '+'}${Math.abs(savingsPercent)}%)</span>
                  </span>
                  <i class="fa-solid fa-download"></i>
                </button>
              `;
            }).join('')}
          </div>
          <button class="download-all-versions-btn">
            <i class="fa-solid fa-download"></i>
            Download All Versions
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelectorAll('.download-version-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quality = parseInt(btn.dataset.quality);
        const version = imageData.compressedVersions.find(v => v.quality === quality);
        if (version) {
          downloadVersion(imageData, version);
          modal.remove();
        }
      });
    });

    modal.querySelector('.download-all-versions-btn').addEventListener('click', () => {
      downloadAllVersions(imageData);
      modal.remove();
    });
  }

  function getFilename(imageData, version) {
    let ext;
    if (version.usedOriginal) {
      ext = imageData.name.split('.').pop().toLowerCase() || 'jpg';
    } else {
      ext = getExtensionFromFormat(imageData);
    }
    const baseName = imageData.name.replace(/\.[^.]+$/, '');
    return `${baseName}_${version.quality}q.${ext}`;
  }

  function downloadVersion(imageData, version) {
    const filename = getFilename(imageData, version);
    ToolsCommon.FileDownload.blob(version.blob, filename);
  }

  async function downloadAllVersions(imageData) {
    if (imageData.compressedVersions.length === 1) {
      downloadVersion(imageData, imageData.compressedVersions[0]);
      return;
    }

    ToolsCommon.Toast.show('Creating ZIP...', 'info');

    try {
      const zip = new JSZip();
      const baseName = imageData.name.replace(/\.[^.]+$/, '');

      for (const version of imageData.compressedVersions) {
        const filename = getFilename(imageData, version);
        zip.file(filename, version.blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      ToolsCommon.FileDownload.blob(content, `${baseName}_compressed.zip`);
      ToolsCommon.Toast.show('ZIP downloaded!', 'success');
    } catch (e) {
      ToolsCommon.Toast.show('Failed to create ZIP', 'error');
    }
  }

  async function downloadAll() {
    const compressedImages = state.images.filter(img => img.status === 'done' && img.compressedVersions.length > 0);

    if (compressedImages.length === 0) {
      ToolsCommon.Toast.show('No compressed images to download', 'error');
      return;
    }

    ToolsCommon.Toast.show('Creating ZIP...', 'info');

    try {
      const zip = new JSZip();

      for (const imageData of compressedImages) {
        for (const version of imageData.compressedVersions) {
          const filename = getFilename(imageData, version);
          zip.file(filename, version.blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const totalVersions = compressedImages.reduce((sum, img) => sum + img.compressedVersions.length, 0);

      ToolsCommon.FileDownload.blob(content, `compressed_images.zip`);
      ToolsCommon.Toast.show(`ZIP with ${totalVersions} files downloaded!`, 'success');
    } catch (e) {
      ToolsCommon.Toast.show('Failed to create ZIP', 'error');
    }
  }

  function getExtensionFromFormat(imageData) {
    if (state.format === 'original') {
      const ext = imageData.name.split('.').pop().toLowerCase();
      // PNG gets converted to WebP for compression
      if (ext === 'png') return 'webp';
      return ext || 'jpg';
    }
    switch (state.format) {
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'webp': return 'webp';
      default: return 'jpg';
    }
  }

  // ==================== Remove ====================

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
      ToolsCommon.Toast.show('No images to clear', 'info');
      return;
    }

    state.images = [];
    elements.imageList.innerHTML = '';
    updateUI();
    ToolsCommon.Toast.show('All images cleared', 'success');
  }

  // ==================== Utilities ====================

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

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select')) return;

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
    if (e.key === 'Escape') {
      const modal = document.getElementById('downloadModal');
      if (modal) modal.remove();
    }
  }

  // ==================== Event Listeners ====================

  function setupEventListeners() {
    // Upload zone
    elements.uploadZone?.addEventListener('click', () => elements.fileInput?.click());
    elements.fileInput?.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadZone?.addEventListener('dragover', handleDragOver);
    elements.uploadZone?.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone?.addEventListener('drop', handleDrop);

    // Quality slider
    elements.qualitySlider?.addEventListener('input', (e) => {
      state.quality = parseInt(e.target.value);
      elements.qualityValue.textContent = state.quality + '%';
    });

    // Add level button
    elements.addLevelBtn?.addEventListener('click', addLevel);

    // Format and max width
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
    document.addEventListener('keydown', handleKeydown);

    // Initial render of saved levels
    renderSavedLevels();
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    setupEventListeners();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
