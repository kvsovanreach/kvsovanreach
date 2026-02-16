/**
 * KVSOVANREACH File Metadata Viewer
 * View file information and metadata
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    files: [],
    selectedIndex: null
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.uploadArea = document.getElementById('uploadArea');
    elements.fileInput = document.getElementById('fileInput');
    elements.filesSection = document.getElementById('filesSection');
    elements.filesList = document.getElementById('filesList');
    elements.fileCount = document.getElementById('fileCount');
    elements.detailsSection = document.getElementById('detailsSection');
    elements.detailsContent = document.getElementById('detailsContent');
    elements.summarySection = document.getElementById('summarySection');
    elements.totalFiles = document.getElementById('totalFiles');
    elements.totalSize = document.getElementById('totalSize');
    elements.avgSize = document.getElementById('avgSize');
    elements.fileTypes = document.getElementById('fileTypes');
    elements.typeBreakdown = document.getElementById('typeBreakdown');
    elements.clearBtn = document.getElementById('clearBtn');
  }

  // ==================== File Type Mappings ====================
  const FILE_TYPE_ICONS = {
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

  // ==================== File Processing ====================
  function processFiles(selectedFiles) {
    if (selectedFiles.length === 0) return;

    state.files = selectedFiles.map(file => ({
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

    if (state.files.length === 1) {
      selectFile(0);
    } else {
      state.selectedIndex = null;
      elements.detailsSection.style.display = 'none';
    }

    ToolsCommon.Toast.show(`${state.files.length} file(s) loaded`, 'success');
  }

  function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function getFileIcon(type) {
    if (!type) return FILE_TYPE_ICONS.default;

    if (FILE_TYPE_ICONS[type]) return FILE_TYPE_ICONS[type];

    for (const [key, value] of Object.entries(FILE_TYPE_ICONS)) {
      if (type.startsWith(key)) return value;
    }

    return FILE_TYPE_ICONS.default;
  }

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

  // ==================== File Selection ====================
  function selectFile(index) {
    state.selectedIndex = index;
    renderFilesList();
    renderDetails(state.files[index]);
    elements.detailsSection.style.display = 'block';
  }

  function handleFileClick(e) {
    const fileItem = e.target.closest('.file-item');
    if (!fileItem) return;

    const index = parseInt(fileItem.dataset.index, 10);
    if (!isNaN(index)) {
      selectFile(index);
    }
  }

  // ==================== Rendering ====================
  function renderFilesList() {
    elements.fileCount.textContent = state.files.length;

    elements.filesList.innerHTML = state.files.map((file, index) => {
      const iconInfo = getFileIcon(file.type);
      return `
        <div class="file-item ${state.selectedIndex === index ? 'selected' : ''}" data-index="${index}">
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

  function renderSummary() {
    const totalSize = state.files.reduce((sum, f) => sum + f.size, 0);
    const avgSize = state.files.length > 0 ? totalSize / state.files.length : 0;

    const typeCount = {};
    state.files.forEach(f => {
      const category = getFileCategory(f.type);
      typeCount[category] = (typeCount[category] || 0) + 1;
    });

    elements.totalFiles.textContent = state.files.length;
    elements.totalSize.textContent = formatSize(totalSize);
    elements.avgSize.textContent = formatSize(avgSize);
    elements.fileTypes.textContent = Object.keys(typeCount).length;

    elements.typeBreakdown.innerHTML = Object.entries(typeCount).map(([type, count]) => {
      const iconInfo = getFileIcon(type);
      return `
        <div class="type-badge">
          <i class="fa-solid ${iconInfo.icon} type-badge-icon"></i>
          <span>${type}</span>
          <span class="type-badge-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // ==================== Utilities ====================
  function formatSize(bytes) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
  }

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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== Actions ====================
  function clearFiles() {
    if (state.files.length === 0) return;

    state.files = [];
    state.selectedIndex = null;

    elements.fileInput.value = '';
    elements.filesSection.style.display = 'none';
    elements.detailsSection.style.display = 'none';
    elements.summarySection.style.display = 'none';

    ToolsCommon.Toast.show('Files cleared', 'info');
  }

  // ==================== Event Handlers ====================
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      elements.fileInput.click();
      return;
    }

    if (e.key === 'Escape') {
      clearFiles();
      return;
    }

    // Arrow key navigation
    if (state.files.length > 0 && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const currentIndex = state.selectedIndex ?? -1;
      let newIndex;

      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : state.files.length - 1;
      } else {
        newIndex = currentIndex < state.files.length - 1 ? currentIndex + 1 : 0;
      }

      selectFile(newIndex);
    }
  }

  // ==================== Event Listeners ====================
  function setupEventListeners() {
    // Upload area
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);

    // File list click delegation
    elements.filesList.addEventListener('click', handleFileClick);

    // Clear button
    elements.clearBtn.addEventListener('click', clearFiles);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
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
