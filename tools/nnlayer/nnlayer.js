/**
 * KVSOVANREACH Neural Network Layer Visualizer
 * Build and visualize neural network architectures
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    networkDiagram: document.getElementById('networkDiagram'),
    emptyState: document.getElementById('emptyState'),
    layerList: document.getElementById('layerList'),
    layerListSection: document.getElementById('layerListSection'),
    statsSection: document.getElementById('statsSection'),
    totalLayers: document.getElementById('totalLayers'),
    totalParams: document.getElementById('totalParams'),
    memorySize: document.getElementById('memorySize'),
    configModal: document.getElementById('configModal'),
    configTitle: document.getElementById('configTitle'),
    configBody: document.getElementById('configBody'),
    closeConfigBtn: document.getElementById('closeConfigBtn'),
    cancelConfigBtn: document.getElementById('cancelConfigBtn'),
    addLayerBtn: document.getElementById('addLayerBtn'),
    presetModal: document.getElementById('presetModal'),
    presetBtn: document.getElementById('presetBtn'),
    closePresetBtn: document.getElementById('closePresetBtn'),
    clearBtn: document.getElementById('clearBtn'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn')
  };

  // Layer types configuration
  const layerTypes = {
    input: {
      name: 'Input',
      icon: 'fa-arrow-right-to-bracket',
      fields: [
        { name: 'shape', label: 'Input Shape', type: 'text', placeholder: '784 or 28,28,1', default: '784' }
      ]
    },
    dense: {
      name: 'Dense',
      icon: 'fa-table-cells',
      fields: [
        { name: 'units', label: 'Units', type: 'number', default: '128' },
        { name: 'activation', label: 'Activation', type: 'select', options: ['relu', 'sigmoid', 'tanh', 'softmax', 'linear'], default: 'relu' }
      ]
    },
    conv2d: {
      name: 'Conv2D',
      icon: 'fa-border-all',
      fields: [
        { name: 'filters', label: 'Filters', type: 'number', default: '32' },
        { name: 'kernel', label: 'Kernel Size', type: 'text', placeholder: '3,3', default: '3,3' },
        { name: 'activation', label: 'Activation', type: 'select', options: ['relu', 'sigmoid', 'tanh', 'linear'], default: 'relu' }
      ]
    },
    pooling: {
      name: 'Pooling',
      icon: 'fa-compress',
      fields: [
        { name: 'poolType', label: 'Pool Type', type: 'select', options: ['max', 'average'], default: 'max' },
        { name: 'poolSize', label: 'Pool Size', type: 'text', placeholder: '2,2', default: '2,2' }
      ]
    },
    dropout: {
      name: 'Dropout',
      icon: 'fa-droplet-slash',
      fields: [
        { name: 'rate', label: 'Rate', type: 'number', step: '0.1', min: '0', max: '1', default: '0.5' }
      ]
    },
    flatten: {
      name: 'Flatten',
      icon: 'fa-bars',
      fields: []
    },
    output: {
      name: 'Output',
      icon: 'fa-arrow-right-from-bracket',
      fields: [
        { name: 'units', label: 'Units (Classes)', type: 'number', default: '10' },
        { name: 'activation', label: 'Activation', type: 'select', options: ['softmax', 'sigmoid', 'linear'], default: 'softmax' }
      ]
    }
  };

  // Presets
  const presets = {
    mlp: [
      { type: 'input', config: { shape: '784' } },
      { type: 'dense', config: { units: '256', activation: 'relu' } },
      { type: 'dropout', config: { rate: '0.3' } },
      { type: 'dense', config: { units: '128', activation: 'relu' } },
      { type: 'dropout', config: { rate: '0.3' } },
      { type: 'output', config: { units: '10', activation: 'softmax' } }
    ],
    cnn: [
      { type: 'input', config: { shape: '28,28,1' } },
      { type: 'conv2d', config: { filters: '32', kernel: '3,3', activation: 'relu' } },
      { type: 'pooling', config: { poolType: 'max', poolSize: '2,2' } },
      { type: 'conv2d', config: { filters: '64', kernel: '3,3', activation: 'relu' } },
      { type: 'pooling', config: { poolType: 'max', poolSize: '2,2' } },
      { type: 'flatten', config: {} },
      { type: 'dense', config: { units: '128', activation: 'relu' } },
      { type: 'dropout', config: { rate: '0.5' } },
      { type: 'output', config: { units: '10', activation: 'softmax' } }
    ],
    autoencoder: [
      { type: 'input', config: { shape: '784' } },
      { type: 'dense', config: { units: '256', activation: 'relu' } },
      { type: 'dense', config: { units: '64', activation: 'relu' } },
      { type: 'dense', config: { units: '32', activation: 'relu' } },
      { type: 'dense', config: { units: '64', activation: 'relu' } },
      { type: 'dense', config: { units: '256', activation: 'relu' } },
      { type: 'output', config: { units: '784', activation: 'sigmoid' } }
    ]
  };

  // State
  let layers = [];
  let currentLayerType = null;
  let zoomLevel = 1;

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
    // Layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.addEventListener('click', () => openConfigModal(btn.dataset.type));
    });

    // Config modal
    elements.closeConfigBtn.addEventListener('click', closeConfigModal);
    elements.cancelConfigBtn.addEventListener('click', closeConfigModal);
    elements.addLayerBtn.addEventListener('click', addLayerFromConfig);

    // Preset modal
    elements.presetBtn.addEventListener('click', openPresetModal);
    elements.closePresetBtn.addEventListener('click', closePresetModal);

    // Preset options
    document.querySelectorAll('.preset-option').forEach(btn => {
      btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
    });

    // Clear
    elements.clearBtn.addEventListener('click', clearLayers);

    // Zoom
    elements.zoomInBtn.addEventListener('click', () => zoom(0.1));
    elements.zoomOutBtn.addEventListener('click', () => zoom(-0.1));

    // Click outside modals
    elements.configModal.addEventListener('click', (e) => {
      if (e.target === elements.configModal) closeConfigModal();
    });
    elements.presetModal.addEventListener('click', (e) => {
      if (e.target === elements.presetModal) closePresetModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Open config modal for layer type
   */
  function openConfigModal(type) {
    currentLayerType = type;
    const layerConfig = layerTypes[type];

    elements.configTitle.textContent = `Add ${layerConfig.name} Layer`;

    // Generate form fields
    if (layerConfig.fields.length === 0) {
      elements.configBody.innerHTML = '<p style="color: var(--color-text-muted); font-size: var(--font-size-sm);">No configuration needed for this layer.</p>';
    } else {
      elements.configBody.innerHTML = layerConfig.fields.map(field => {
        let input;
        if (field.type === 'select') {
          input = `
            <select id="config_${field.name}">
              ${field.options.map(opt => `<option value="${opt}" ${opt === field.default ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          `;
        } else {
          input = `
            <input type="${field.type}" id="config_${field.name}"
                   value="${field.default || ''}"
                   placeholder="${field.placeholder || ''}"
                   ${field.step ? `step="${field.step}"` : ''}
                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                   ${field.max !== undefined ? `max="${field.max}"` : ''}>
          `;
        }

        return `
          <div class="config-field">
            <label for="config_${field.name}">${field.label}</label>
            ${input}
          </div>
        `;
      }).join('');
    }

    elements.configModal.classList.add('active');
  }

  /**
   * Close config modal
   */
  function closeConfigModal() {
    elements.configModal.classList.remove('active');
    currentLayerType = null;
  }

  /**
   * Add layer from config modal
   */
  function addLayerFromConfig() {
    if (!currentLayerType) return;

    const layerConfig = layerTypes[currentLayerType];
    const config = {};

    // Collect field values
    layerConfig.fields.forEach(field => {
      const input = document.getElementById(`config_${field.name}`);
      if (input) {
        config[field.name] = input.value;
      }
    });

    addLayer(currentLayerType, config);
    closeConfigModal();
  }

  /**
   * Add layer to network
   */
  function addLayer(type, config) {
    layers.push({ type, config });
    renderNetwork();
    updateStats();
    ToolsCommon.Toast.show(`${layerTypes[type].name} layer added`, 'success');
  }

  /**
   * Remove layer
   */
  function removeLayer(index) {
    layers.splice(index, 1);
    renderNetwork();
    updateStats();
    ToolsCommon.Toast.show('Layer removed', 'info');
  }

  /**
   * Open preset modal
   */
  function openPresetModal() {
    elements.presetModal.classList.add('active');
  }

  /**
   * Close preset modal
   */
  function closePresetModal() {
    elements.presetModal.classList.remove('active');
  }

  /**
   * Load preset network
   */
  function loadPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    layers = preset.map(layer => ({ ...layer }));
    renderNetwork();
    updateStats();
    closePresetModal();
    ToolsCommon.Toast.show(`Loaded ${presetName.toUpperCase()} preset`, 'success');
  }

  /**
   * Clear all layers
   */
  function clearLayers() {
    layers = [];
    renderNetwork();
    updateStats();
    ToolsCommon.Toast.show('All layers cleared', 'info');
  }

  /**
   * Render the network diagram
   */
  function renderNetwork() {
    if (layers.length === 0) {
      elements.emptyState.style.display = 'flex';
      elements.layerListSection.style.display = 'none';
      elements.statsSection.style.display = 'none';
      elements.networkDiagram.innerHTML = '';
      elements.networkDiagram.appendChild(elements.emptyState);
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.layerListSection.style.display = 'block';
    elements.statsSection.style.display = 'grid';

    // Render diagram
    const nodes = layers.map((layer, index) => {
      const layerConfig = layerTypes[layer.type];
      const shape = getLayerShape(layer);

      return `
        <div class="layer-node ${layer.type}" data-index="${index}">
          <button class="layer-delete" onclick="window.removeNNLayer(${index})">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="layer-icon">
            <i class="fa-solid ${layerConfig.icon}"></i>
          </div>
          <span class="layer-type">${layerConfig.name}</span>
          <span class="layer-shape">${shape}</span>
        </div>
      `;
    });

    // Add arrows between nodes
    const html = nodes.reduce((acc, node, i) => {
      if (i > 0) {
        acc += '<div class="connection-arrow"><i class="fa-solid fa-arrow-right"></i></div>';
      }
      acc += node;
      return acc;
    }, '');

    elements.networkDiagram.innerHTML = html;
    elements.networkDiagram.style.transform = `scale(${zoomLevel})`;

    // Render layer list
    elements.layerList.innerHTML = layers.map((layer, index) => {
      const layerConfig = layerTypes[layer.type];
      const details = getLayerDetails(layer);
      const params = estimateLayerParams(layer, index);

      return `
        <div class="layer-item">
          <div class="layer-item-info">
            <span class="layer-item-index">${index + 1}</span>
            <span class="layer-item-type">${layerConfig.name}</span>
            <span class="layer-item-details">${details}</span>
          </div>
          <span class="layer-item-params">${formatNumber(params)} params</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Get layer shape string
   */
  function getLayerShape(layer) {
    switch (layer.type) {
      case 'input':
        return `(${layer.config.shape})`;
      case 'dense':
      case 'output':
        return `(${layer.config.units})`;
      case 'conv2d':
        return `${layer.config.filters}@${layer.config.kernel}`;
      case 'pooling':
        return `${layer.config.poolType} ${layer.config.poolSize}`;
      case 'dropout':
        return `${(parseFloat(layer.config.rate) * 100).toFixed(0)}%`;
      case 'flatten':
        return '(-)';
      default:
        return '';
    }
  }

  /**
   * Get layer details string
   */
  function getLayerDetails(layer) {
    switch (layer.type) {
      case 'input':
        return `shape: ${layer.config.shape}`;
      case 'dense':
      case 'output':
        return `${layer.config.units} units, ${layer.config.activation}`;
      case 'conv2d':
        return `${layer.config.filters} filters, ${layer.config.kernel}, ${layer.config.activation}`;
      case 'pooling':
        return `${layer.config.poolType} pooling, ${layer.config.poolSize}`;
      case 'dropout':
        return `rate: ${layer.config.rate}`;
      case 'flatten':
        return 'flatten to 1D';
      default:
        return '';
    }
  }

  /**
   * Estimate layer parameters
   */
  function estimateLayerParams(layer, index) {
    // Get previous layer output size
    let prevOutput = 784; // Default input size

    if (index > 0) {
      const prevLayer = layers[index - 1];
      switch (prevLayer.type) {
        case 'input':
          prevOutput = parseShape(prevLayer.config.shape).reduce((a, b) => a * b, 1);
          break;
        case 'dense':
        case 'output':
          prevOutput = parseInt(prevLayer.config.units);
          break;
        case 'conv2d':
          prevOutput = parseInt(prevLayer.config.filters) * 100; // Estimate
          break;
        default:
          break;
      }
    }

    switch (layer.type) {
      case 'dense':
      case 'output':
        const units = parseInt(layer.config.units);
        return (prevOutput * units) + units; // weights + biases
      case 'conv2d':
        const filters = parseInt(layer.config.filters);
        const kernel = parseShape(layer.config.kernel);
        const channels = index === 0 ? 1 : 32; // Estimate
        return (kernel[0] * kernel[1] * channels * filters) + filters;
      default:
        return 0;
    }
  }

  /**
   * Parse shape string to array
   */
  function parseShape(shapeStr) {
    return shapeStr.split(',').map(s => parseInt(s.trim()) || 1);
  }

  /**
   * Update statistics
   */
  function updateStats() {
    const totalParams = layers.reduce((sum, layer, index) => {
      return sum + estimateLayerParams(layer, index);
    }, 0);

    elements.totalLayers.textContent = layers.length;
    elements.totalParams.textContent = formatNumber(totalParams);

    // Estimate memory (4 bytes per float32 parameter)
    const memoryBytes = totalParams * 4;
    elements.memorySize.textContent = formatBytes(memoryBytes);
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  /**
   * Format bytes to human readable
   */
  function formatBytes(bytes) {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' B';
  }

  /**
   * Zoom control
   */
  function zoom(delta) {
    zoomLevel = Math.max(0.5, Math.min(1.5, zoomLevel + delta));
    elements.networkDiagram.style.transform = `scale(${zoomLevel})`;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (elements.configModal.classList.contains('active')) {
        closeConfigModal();
      } else if (elements.presetModal.classList.contains('active')) {
        closePresetModal();
      } else {
        clearLayers();
      }
    }
  }

  // Expose removeLayer to global scope for onclick
  window.removeNNLayer = removeLayer;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
