/**
 * KVSOVANREACH Text Shadow Generator
 */

(function() {
  'use strict';

  let layers = [];
  let layerIdCounter = 0;

  const presets = {
    neon: {
      bg: '#0a0a1a',
      textColor: '#ffffff',
      layers: [
        { x: 0, y: 0, blur: 7, color: '#ff00de', alpha: 100 },
        { x: 0, y: 0, blur: 10, color: '#ff00de', alpha: 80 },
        { x: 0, y: 0, blur: 21, color: '#ff00de', alpha: 60 },
        { x: 0, y: 0, blur: 42, color: '#ff00de', alpha: 40 }
      ]
    },
    emboss: {
      bg: '#666666',
      textColor: '#666666',
      layers: [
        { x: -1, y: -1, blur: 0, color: '#ffffff', alpha: 40 },
        { x: 1, y: 1, blur: 0, color: '#000000', alpha: 60 }
      ]
    },
    retro: {
      bg: '#f5e6ca',
      textColor: '#2c3e50',
      layers: [
        { x: 3, y: 3, blur: 0, color: '#e74c3c', alpha: 100 },
        { x: 6, y: 6, blur: 0, color: '#3498db', alpha: 100 }
      ]
    },
    fire: {
      bg: '#1a0a00',
      textColor: '#ffffff',
      layers: [
        { x: 0, y: 0, blur: 4, color: '#ff6600', alpha: 100 },
        { x: 0, y: -5, blur: 4, color: '#ff3300', alpha: 80 },
        { x: 0, y: -10, blur: 10, color: '#ff0000', alpha: 60 },
        { x: 0, y: -15, blur: 20, color: '#ff0000', alpha: 30 }
      ]
    },
    threed: {
      bg: '#2c3e50',
      textColor: '#ecf0f1',
      layers: [
        { x: 1, y: 1, blur: 0, color: '#bdc3c7', alpha: 100 },
        { x: 2, y: 2, blur: 0, color: '#95a5a6', alpha: 100 },
        { x: 3, y: 3, blur: 0, color: '#7f8c8d', alpha: 100 },
        { x: 4, y: 4, blur: 0, color: '#707b7c', alpha: 100 },
        { x: 5, y: 5, blur: 0, color: '#616a6b', alpha: 100 }
      ]
    },
    outline: {
      bg: '#ffffff',
      textColor: '#ffffff',
      layers: [
        { x: -1, y: -1, blur: 0, color: '#333333', alpha: 100 },
        { x: 1, y: -1, blur: 0, color: '#333333', alpha: 100 },
        { x: -1, y: 1, blur: 0, color: '#333333', alpha: 100 },
        { x: 1, y: 1, blur: 0, color: '#333333', alpha: 100 }
      ]
    }
  };

  const elements = {};

  function initElements() {
    elements.previewArea = document.getElementById('previewArea');
    elements.previewText = document.getElementById('previewText');
    elements.bgColor = document.getElementById('bgColor');
    elements.textColor = document.getElementById('textColor');
    elements.fontSize = document.getElementById('fontSize');
    elements.fontSizeValue = document.getElementById('fontSizeValue');
    elements.fontWeight = document.getElementById('fontWeight');
    elements.layersList = document.getElementById('layersList');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.addLayerBtn = document.getElementById('addLayerBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
  }

  function createLayer(config) {
    const id = layerIdCounter++;
    const layer = {
      id: id,
      x: config ? config.x : 2,
      y: config ? config.y : 2,
      blur: config ? config.blur : 4,
      color: config ? config.color : '#000000',
      alpha: config ? config.alpha : 50
    };
    layers.push(layer);
    return layer;
  }

  function renderLayers() {
    elements.layersList.innerHTML = '';
    layers.forEach(function(layer, index) {
      var el = document.createElement('div');
      el.className = 'ts-layer';
      el.dataset.id = layer.id;
      el.innerHTML =
        '<div class="ts-layer-header">' +
          '<span class="ts-layer-title">Layer ' + (index + 1) + '</span>' +
          '<div class="ts-layer-actions">' +
            (index > 0 ? '<button class="ts-layer-action-btn move-up" title="Move up"><i class="fa-solid fa-arrow-up"></i></button>' : '') +
            (index < layers.length - 1 ? '<button class="ts-layer-action-btn move-down" title="Move down"><i class="fa-solid fa-arrow-down"></i></button>' : '') +
            (layers.length > 1 ? '<button class="ts-layer-action-btn delete" title="Remove layer"><i class="fa-solid fa-trash"></i></button>' : '') +
          '</div>' +
        '</div>' +
        '<div class="ts-layer-body">' +
          '<div class="ts-layer-row">' +
            '<label>X</label>' +
            '<input type="range" data-prop="x" min="-50" max="50" value="' + layer.x + '">' +
            '<span class="control-value">' + layer.x + 'px</span>' +
          '</div>' +
          '<div class="ts-layer-row">' +
            '<label>Y</label>' +
            '<input type="range" data-prop="y" min="-50" max="50" value="' + layer.y + '">' +
            '<span class="control-value">' + layer.y + 'px</span>' +
          '</div>' +
          '<div class="ts-layer-row">' +
            '<label>Blur</label>' +
            '<input type="range" data-prop="blur" min="0" max="50" value="' + layer.blur + '">' +
            '<span class="control-value">' + layer.blur + 'px</span>' +
          '</div>' +
          '<div class="ts-layer-row">' +
            '<label>Color</label>' +
            '<input type="color" data-prop="color" value="' + layer.color + '">' +
            '<input type="range" data-prop="alpha" min="0" max="100" value="' + layer.alpha + '">' +
            '<span class="control-value">' + layer.alpha + '%</span>' +
          '</div>' +
        '</div>';
      elements.layersList.appendChild(el);
    });
    bindLayerEvents();
  }

  function bindLayerEvents() {
    elements.layersList.querySelectorAll('.ts-layer').forEach(function(el) {
      var id = parseInt(el.dataset.id);
      var layer = layers.find(function(l) { return l.id === id; });
      if (!layer) return;

      el.querySelectorAll('input[data-prop]').forEach(function(input) {
        input.addEventListener('input', function() {
          var prop = input.dataset.prop;
          if (prop === 'color') {
            layer[prop] = input.value;
          } else {
            layer[prop] = parseInt(input.value);
          }
          var row = input.closest('.ts-layer-row');
          var valueSpan = row.querySelector('.control-value');
          if (prop === 'alpha') {
            valueSpan.textContent = layer[prop] + '%';
          } else if (prop !== 'color') {
            valueSpan.textContent = layer[prop] + 'px';
          }
          updatePreview();
        });
      });

      var moveUpBtn = el.querySelector('.move-up');
      if (moveUpBtn) {
        moveUpBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = layers.findIndex(function(l) { return l.id === id; });
          if (idx > 0) {
            var temp = layers[idx];
            layers[idx] = layers[idx - 1];
            layers[idx - 1] = temp;
            renderLayers();
            updatePreview();
          }
        });
      }

      var moveDownBtn = el.querySelector('.move-down');
      if (moveDownBtn) {
        moveDownBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = layers.findIndex(function(l) { return l.id === id; });
          if (idx < layers.length - 1) {
            var temp = layers[idx];
            layers[idx] = layers[idx + 1];
            layers[idx + 1] = temp;
            renderLayers();
            updatePreview();
          }
        });
      }

      var deleteBtn = el.querySelector('.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          layers = layers.filter(function(l) { return l.id !== id; });
          renderLayers();
          updatePreview();
          showToast('Layer removed', 'success');
        });
      }
    });
  }

  function generateShadowCSS() {
    return layers.map(function(layer) {
      var color = hexToRgba(layer.color, layer.alpha);
      return layer.x + 'px ' + layer.y + 'px ' + layer.blur + 'px ' + color;
    }).join(',\n    ');
  }

  function updatePreview() {
    var shadow = layers.map(function(layer) {
      var color = hexToRgba(layer.color, layer.alpha);
      return layer.x + 'px ' + layer.y + 'px ' + layer.blur + 'px ' + color;
    }).join(', ');

    elements.previewText.style.textShadow = shadow;
    elements.cssOutput.textContent = 'text-shadow: ' + generateShadowCSS() + ';';
  }

  function applyPreset(name) {
    var preset = presets[name];
    if (!preset) return;

    elements.bgColor.value = preset.bg;
    elements.textColor.value = preset.textColor;
    elements.previewArea.style.backgroundColor = preset.bg;
    elements.previewText.style.color = preset.textColor;

    layers = [];
    layerIdCounter = 0;
    preset.layers.forEach(function(cfg) { createLayer(cfg); });
    renderLayers();
    updatePreview();
    showToast('Preset applied: ' + name, 'success');
  }

  function handleReset() {
    layers = [];
    layerIdCounter = 0;
    createLayer({ x: 2, y: 2, blur: 4, color: '#000000', alpha: 50 });

    elements.bgColor.value = '#1a1a2e';
    elements.textColor.value = '#ffffff';
    elements.fontSize.value = 64;
    elements.fontSizeValue.textContent = '64px';
    elements.fontWeight.value = '700';
    elements.previewArea.style.backgroundColor = '#1a1a2e';
    elements.previewText.style.color = '#ffffff';
    elements.previewText.style.fontSize = '64px';
    elements.previewText.style.fontWeight = '700';
    elements.previewText.textContent = 'Shadow';

    renderLayers();
    updatePreview();
    showToast('Reset to defaults', 'success');
  }

  function handleCopy() {
    var css = elements.cssOutput.textContent;
    ToolsCommon.copyWithToast(css, 'CSS copied!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, select, [contenteditable]')) return;
    switch (e.key.toLowerCase()) {
      case 'c': e.preventDefault(); handleCopy(); break;
      case 'r': e.preventDefault(); handleReset(); break;
      case 'a': e.preventDefault(); addLayer(); break;
    }
  }

  function addLayer() {
    if (layers.length >= 10) {
      showToast('Maximum 10 layers', 'error');
      return;
    }
    createLayer(null);
    renderLayers();
    updatePreview();
    showToast('Layer added', 'success');
  }

  function init() {
    initElements();

    createLayer({ x: 2, y: 2, blur: 5, color: '#000000', alpha: 50 });
    renderLayers();
    updatePreview();

    elements.bgColor.addEventListener('input', function(e) {
      elements.previewArea.style.backgroundColor = e.target.value;
    });

    elements.textColor.addEventListener('input', function(e) {
      elements.previewText.style.color = e.target.value;
    });

    elements.fontSize.addEventListener('input', function(e) {
      var val = e.target.value;
      elements.previewText.style.fontSize = val + 'px';
      elements.fontSizeValue.textContent = val + 'px';
    });

    elements.fontWeight.addEventListener('change', function(e) {
      elements.previewText.style.fontWeight = e.target.value;
    });

    elements.addLayerBtn.addEventListener('click', addLayer);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.resetBtn.addEventListener('click', handleReset);

    document.querySelectorAll('.ts-preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        applyPreset(btn.dataset.preset);
      });
    });

    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
