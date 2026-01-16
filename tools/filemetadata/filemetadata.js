/**
 * KVSOVANREACH File Metadata Viewer
 * View file information and metadata
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    filesSection: document.getElementById('filesSection'),
    filesList: document.getElementById('filesList'),
    fileCount: document.getElementById('fileCount'),
    detailsSection: document.getElementById('detailsSection'),
    detailsContent: document.getElementById('detailsContent'),
    summarySection: document.getElementById('summarySection'),
    totalFiles: document.getElementById('totalFiles'),
    totalSize: document.getElementById('totalSize'),
    avgSize: document.getElementById('avgSize'),
    fileTypes: document.getElementById('fileTypes'),
    typeBreakdown: document.getElementById('typeBreakdown'),
    clearBtn: document.getElementById('clearBtn')
  };

  // State
  let files = [];
  let selectedFile = null;

  // File type mappings
  const fileTypeIcons = {
    'image': { icon: 'fa-image', class: 'image' },
    'video': { icon: 'fa-video', class: 'video' },
    'audio': { icon: 'fa-music', class: 'audio' },
    'application/pdf': { icon: 'fa-file-pdf', class: 'pdf' },
    'application/msword': { icon: 'fa-file-word', class: 'doc' },
    'application/vnd.openxmlformats-officedocument': { icon: 'fa-file-word', class: 'doc' },
    'text': { icon: 'fa-file-code', class: 'code' },
    'application/json': { icon: 'fa-file-code', class: 'code' },
    'application/javascript': { icon: 'fa-file-code', class: 'code' },
    'application/zip': { icon: 'fa-file-archive', class: 'archive' },
    'application/x-rar': { icon: 'fa-file-archive', class: 'archive' },
    'application/x-7z': { icon: 'fa-file-archive', class: 'archive' },
    'default': { icon: 'fa-file', class: 'default' }
  };

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Upload area click
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());

    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);

    // Clear button
    elements.clearBtn.addEventListener('click', clearFiles);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Handle file selection
   */
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  }

  /**
   * Handle drag over
   */
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.add('dragover');
  }

  /**
   * Handle drag leave
   */
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');
  }

  /**
   * Handle drop
   */
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }

  /**
   * Process selected files
   */
  function processFiles(selectedFiles) {
    if (selectedFiles.length === 0) return;

    files = selectedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified),
      extension: getFileExtension(file.name)
    }));

    renderFilesList();
    renderSummary();

    elements.filesSection.style.display = 'block';
    elements.summarySection.style.display = 'block';

    if (files.length === 1) {
      selectFile(0);
    } else {
      elements.detailsSection.style.display = 'none';
    }

    ToolsCommon.Toast.show(`${files.length} file(s) loaded`, 'success');
  }

  /**
   * Render files list
   */
  function renderFilesList() {
    elements.fileCount.textContent = files.length;

    elements.filesList.innerHTML = files.map((file, index) => {
      const iconInfo = getFileIcon(file.type);
      return `
        <div class="file-item ${selectedFile === index ? 'selected' : ''}"
             onclick="window.selectFileByIndex(${index})">
          <div class="file-icon ${iconInfo.class}">
            <i class="fa-solid ${iconInfo.icon}"></i>
          </div>
          <div class="file-info">
            <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
            <div class="file-meta">
              <span>${formatSize(file.size)}</span>
              <span>${file.extension || 'unknown'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Select file by index
   */
  window.selectFileByIndex = function(index) {
    selectFile(index);
  };

  /**
   * Select file
   */
  function selectFile(index) {
    selectedFile = index;
    renderFilesList();
    renderDetails(files[index]);
    elements.detailsSection.style.display = 'block';
  }

  /**
   * Render file details
   */
  function renderDetails(file) {
    const details = [
      { label: 'File Name', value: file.name },
      { label: 'Size', value: `${formatSize(file.size)} (${file.size.toLocaleString()} bytes)` },
      { label: 'Type', value: file.type || 'Unknown' },
      { label: 'Extension', value: file.extension || 'None' },
      { label: 'Last Modified', value: formatDate(file.lastModified) },
      { label: 'Modified (ISO)', value: file.lastModified.toISOString() }
    ];

    elements.detailsContent.innerHTML = details.map(d => `
      <div class="detail-row">
        <span class="detail-label">${d.label}</span>
        <span class="detail-value">${escapeHtml(d.value)}</span>
      </div>
    `).join('');
  }

  /**
   * Render summary
   */
  function renderSummary() {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const avgSize = files.length > 0 ? totalSize / files.length : 0;

    // Count file types
    const typeCount = {};
    files.forEach(f => {
      const category = getFileCategory(f.type);
      typeCount[category] = (typeCount[category] || 0) + 1;
    });

    elements.totalFiles.textContent = files.length;
    elements.totalSize.textContent = formatSize(totalSize);
    elements.avgSize.textContent = formatSize(avgSize);
    elements.fileTypes.textContent = Object.keys(typeCount).length;

    // Render type breakdown
    elements.typeBreakdown.innerHTML = Object.entries(typeCount).map(([type, count]) => {
      const iconInfo = getFileIcon(type);
      return `
        <div class="type-badge">
          <i class="fa-solid ${iconInfo.icon} type-badge-icon" style="color: inherit;"></i>
          <span>${type}</span>
          <span class="type-badge-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Get file extension
   */
  function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /**
   * Get file icon based on type
   */
  function getFileIcon(type) {
    if (!type) return fileTypeIcons.default;

    // Check for exact match first
    if (fileTypeIcons[type]) return fileTypeIcons[type];

    // Check for partial match
    for (const [key, value] of Object.entries(fileTypeIcons)) {
      if (type.startsWith(key)) return value;
    }

    return fileTypeIcons.default;
  }

  /**
   * Get file category
   */
  function getFileCategory(type) {
    if (!type) return 'Other';
    if (type.startsWith('image')) return 'Image';
    if (type.startsWith('video')) return 'Video';
    if (type.startsWith('audio')) return 'Audio';
    if (type.startsWith('text')) return 'Text';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'Document';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'Archive';
    if (type.includes('json') || type.includes('javascript')) return 'Code';
    return 'Other';
  }

  /**
   * Format file size
   */
  function formatSize(bytes) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
  }

  /**
   * Format date
   */
  function formatDate(date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear files
   */
  function clearFiles() {
    files = [];
    selectedFile = null;

    elements.fileInput.value = '';
    elements.filesSection.style.display = 'none';
    elements.detailsSection.style.display = 'none';
    elements.summarySection.style.display = 'none';

    ToolsCommon.Toast.show('Files cleared', 'info');
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Ctrl+O - Open file picker
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      elements.fileInput.click();
    }

    // Escape - Clear
    if (e.key === 'Escape') {
      clearFiles();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
