/**
 * KVSOVANREACH Flexbox Playground
 */

(function() {
  'use strict';

  var ITEM_COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#2980b9', '#c0392b', '#8e44ad'
  ];

  var items = [];
  var selectedItemIndex = 0;

  var containerState = {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: 10
  };

  function defaultItemState() {
    return { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 };
  }

  var elements = {};

  function initElements() {
    elements.previewArea = document.getElementById('previewArea');
    elements.cssOutput = document.getElementById('cssOutput');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.addItemBtn = document.getElementById('addItemBtn');
    elements.removeItemBtn = document.getElementById('removeItemBtn');
    elements.itemCount = document.getElementById('itemCount');
    elements.selectedItem = document.getElementById('selectedItem');

    elements.flexDirection = document.getElementById('flexDirection');
    elements.flexWrap = document.getElementById('flexWrap');
    elements.justifyContent = document.getElementById('justifyContent');
    elements.alignItems = document.getElementById('alignItems');
    elements.alignContent = document.getElementById('alignContent');
    elements.gap = document.getElementById('gap');
    elements.gapValue = document.getElementById('gapValue');

    elements.flexGrow = document.getElementById('flexGrow');
    elements.flexGrowValue = document.getElementById('flexGrowValue');
    elements.flexShrink = document.getElementById('flexShrink');
    elements.flexShrinkValue = document.getElementById('flexShrinkValue');
    elements.flexBasis = document.getElementById('flexBasis');
    elements.alignSelf = document.getElementById('alignSelf');
    elements.order = document.getElementById('order');
    elements.orderValue = document.getElementById('orderValue');
  }

  var showToast = function(message, type) { ToolsCommon.showToast(message, type); };

  function renderPreview() {
    var area = elements.previewArea;
    area.style.flexDirection = containerState.flexDirection;
    area.style.flexWrap = containerState.flexWrap;
    area.style.justifyContent = containerState.justifyContent;
    area.style.alignItems = containerState.alignItems;
    area.style.alignContent = containerState.alignContent;
    area.style.gap = containerState.gap + 'px';

    area.innerHTML = '';
    items.forEach(function(item, i) {
      var el = document.createElement('div');
      el.className = 'fb-flex-item' + (i === selectedItemIndex ? ' selected' : '');
      el.textContent = i + 1;
      el.style.flexGrow = item.flexGrow;
      el.style.flexShrink = item.flexShrink;
      el.style.flexBasis = item.flexBasis;
      el.style.alignSelf = item.alignSelf;
      el.style.order = item.order;
      el.addEventListener('click', function() {
        selectItem(i);
      });
      area.appendChild(el);
    });

    elements.itemCount.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');
    updateSelectedItemDropdown();
    updateCSS();
  }

  function updateSelectedItemDropdown() {
    var sel = elements.selectedItem;
    sel.innerHTML = '';
    items.forEach(function(_, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = 'Item ' + (i + 1);
      if (i === selectedItemIndex) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function selectItem(index) {
    selectedItemIndex = index;
    var item = items[index];
    if (!item) return;

    elements.flexGrow.value = item.flexGrow;
    elements.flexGrowValue.textContent = item.flexGrow;
    elements.flexShrink.value = item.flexShrink;
    elements.flexShrinkValue.textContent = item.flexShrink;
    elements.flexBasis.value = item.flexBasis;
    elements.alignSelf.value = item.alignSelf;
    elements.order.value = item.order;
    elements.orderValue.textContent = item.order;
    elements.selectedItem.value = index;

    elements.previewArea.querySelectorAll('.fb-flex-item').forEach(function(el, i) {
      el.classList.toggle('selected', i === index);
    });
  }

  function updateCSS() {
    var lines = ['.container {'];
    lines.push('  display: flex;');
    if (containerState.flexDirection !== 'row') lines.push('  flex-direction: ' + containerState.flexDirection + ';');
    if (containerState.flexWrap !== 'nowrap') lines.push('  flex-wrap: ' + containerState.flexWrap + ';');
    if (containerState.justifyContent !== 'flex-start') lines.push('  justify-content: ' + containerState.justifyContent + ';');
    if (containerState.alignItems !== 'stretch') lines.push('  align-items: ' + containerState.alignItems + ';');
    if (containerState.alignContent !== 'stretch') lines.push('  align-content: ' + containerState.alignContent + ';');
    if (containerState.gap !== 0) lines.push('  gap: ' + containerState.gap + 'px;');
    lines.push('}');

    var hasItemCSS = false;
    items.forEach(function(item, i) {
      var itemLines = [];
      if (item.flexGrow !== 0) itemLines.push('  flex-grow: ' + item.flexGrow + ';');
      if (item.flexShrink !== 1) itemLines.push('  flex-shrink: ' + item.flexShrink + ';');
      if (item.flexBasis !== 'auto') itemLines.push('  flex-basis: ' + item.flexBasis + ';');
      if (item.alignSelf !== 'auto') itemLines.push('  align-self: ' + item.alignSelf + ';');
      if (item.order !== 0) itemLines.push('  order: ' + item.order + ';');
      if (itemLines.length > 0) {
        hasItemCSS = true;
        lines.push('');
        lines.push('.item-' + (i + 1) + ' {');
        itemLines.forEach(function(l) { lines.push(l); });
        lines.push('}');
      }
    });

    elements.cssOutput.textContent = lines.join('\n');
  }

  function addItem() {
    if (items.length >= 10) {
      showToast('Maximum 10 items', 'error');
      return;
    }
    items.push(defaultItemState());
    renderPreview();
    showToast('Item added', 'success');
  }

  function removeItem() {
    if (items.length <= 1) {
      showToast('Minimum 1 item', 'error');
      return;
    }
    items.pop();
    if (selectedItemIndex >= items.length) {
      selectedItemIndex = items.length - 1;
    }
    renderPreview();
    selectItem(selectedItemIndex);
    showToast('Item removed', 'success');
  }

  var presetConfigs = {
    navbar: {
      container: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', alignContent: 'stretch', gap: 10 },
      items: [
        { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
        { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
        { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'auto', order: 0 }
      ]
    },
    cardgrid: {
      container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 16 },
      items: [
        { flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 },
        { flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 },
        { flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 },
        { flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 }
      ]
    },
    holygrail: {
      container: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 10 },
      items: [
        { flexGrow: 0, flexShrink: 0, flexBasis: '100px', alignSelf: 'auto', order: 0 },
        { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
        { flexGrow: 0, flexShrink: 0, flexBasis: '100px', alignSelf: 'auto', order: 0 }
      ]
    },
    sidebar: {
      container: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 10 },
      items: [
        { flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 },
        { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 }
      ]
    },
    centered: {
      container: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'center', alignContent: 'stretch', gap: 10 },
      items: [
        { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'auto', order: 0 }
      ]
    }
  };

  function applyPreset(name) {
    var preset = presetConfigs[name];
    if (!preset) return;

    containerState.flexDirection = preset.container.flexDirection;
    containerState.flexWrap = preset.container.flexWrap;
    containerState.justifyContent = preset.container.justifyContent;
    containerState.alignItems = preset.container.alignItems;
    containerState.alignContent = preset.container.alignContent;
    containerState.gap = preset.container.gap;

    elements.flexDirection.value = containerState.flexDirection;
    elements.flexWrap.value = containerState.flexWrap;
    elements.justifyContent.value = containerState.justifyContent;
    elements.alignItems.value = containerState.alignItems;
    elements.alignContent.value = containerState.alignContent;
    elements.gap.value = containerState.gap;
    elements.gapValue.textContent = containerState.gap + 'px';

    items = preset.items.map(function(it) {
      return {
        flexGrow: it.flexGrow,
        flexShrink: it.flexShrink,
        flexBasis: it.flexBasis,
        alignSelf: it.alignSelf,
        order: it.order
      };
    });

    selectedItemIndex = 0;
    renderPreview();
    selectItem(0);
    showToast('Preset: ' + name, 'success');
  }

  function handleReset() {
    containerState.flexDirection = 'row';
    containerState.flexWrap = 'nowrap';
    containerState.justifyContent = 'flex-start';
    containerState.alignItems = 'stretch';
    containerState.alignContent = 'stretch';
    containerState.gap = 10;

    elements.flexDirection.value = 'row';
    elements.flexWrap.value = 'nowrap';
    elements.justifyContent.value = 'flex-start';
    elements.alignItems.value = 'stretch';
    elements.alignContent.value = 'stretch';
    elements.gap.value = 10;
    elements.gapValue.textContent = '10px';

    items = [defaultItemState(), defaultItemState(), defaultItemState()];
    selectedItemIndex = 0;
    renderPreview();
    selectItem(0);
    showToast('Reset to defaults', 'success');
  }

  function handleCopy() {
    var css = elements.cssOutput.textContent;
    ToolsCommon.copyWithToast(css, 'CSS copied!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, select')) return;
    switch (e.key) {
      case 'c': case 'C': e.preventDefault(); handleCopy(); break;
      case 'r': case 'R': e.preventDefault(); handleReset(); break;
      case '+': case '=': e.preventDefault(); addItem(); break;
      case '-': case '_': e.preventDefault(); removeItem(); break;
    }
  }

  function init() {
    initElements();

    items = [defaultItemState(), defaultItemState(), defaultItemState()];
    renderPreview();
    selectItem(0);

    // Container controls
    var containerSelects = ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent'];
    containerSelects.forEach(function(prop) {
      elements[prop].addEventListener('change', function(e) {
        containerState[prop] = e.target.value;
        renderPreview();
      });
    });

    elements.gap.addEventListener('input', function(e) {
      containerState.gap = parseInt(e.target.value);
      elements.gapValue.textContent = containerState.gap + 'px';
      renderPreview();
    });

    // Item controls
    elements.flexGrow.addEventListener('input', function(e) {
      var val = parseInt(e.target.value);
      items[selectedItemIndex].flexGrow = val;
      elements.flexGrowValue.textContent = val;
      renderPreview();
    });

    elements.flexShrink.addEventListener('input', function(e) {
      var val = parseInt(e.target.value);
      items[selectedItemIndex].flexShrink = val;
      elements.flexShrinkValue.textContent = val;
      renderPreview();
    });

    elements.flexBasis.addEventListener('change', function(e) {
      items[selectedItemIndex].flexBasis = e.target.value;
      renderPreview();
    });

    elements.alignSelf.addEventListener('change', function(e) {
      items[selectedItemIndex].alignSelf = e.target.value;
      renderPreview();
    });

    elements.order.addEventListener('input', function(e) {
      var val = parseInt(e.target.value);
      items[selectedItemIndex].order = val;
      elements.orderValue.textContent = val;
      renderPreview();
    });

    elements.selectedItem.addEventListener('change', function(e) {
      selectItem(parseInt(e.target.value));
    });

    // Buttons
    elements.addItemBtn.addEventListener('click', addItem);
    elements.removeItemBtn.addEventListener('click', removeItem);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.resetBtn.addEventListener('click', handleReset);

    // Presets
    document.querySelectorAll('.fb-preset-btn').forEach(function(btn) {
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
