/**
 * CSS Generator Tool
 * Generate CSS code for gradients, shadows, borders, flexbox, and grid
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    currentTab: 'gradient',
    gradient: {
      type: 'linear',
      angle: 90,
      position: 'center center',
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ]
    },
    shadow: {
      type: 'box',
      offsetX: 5,
      offsetY: 5,
      blur: 15,
      spread: 0,
      color: '#000000',
      opacity: 30,
      inset: false
    },
    border: {
      mode: 'all',
      radiusAll: 16,
      radiusTL: 16,
      radiusTR: 16,
      radiusBR: 16,
      radiusBL: 16,
      width: 2,
      style: 'solid',
      color: '#3776a1',
      bgColor: '#ffffff'
    },
    flexbox: {
      direction: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      wrap: 'nowrap',
      gap: 10,
      items: 5
    },
    grid: {
      columns: 3,
      rows: 2,
      gap: 10,
      columnGap: 10,
      rowGap: 10,
      autoFlow: 'row'
    }
  };

  // Store raw CSS code for copying
  const rawCode = {
    gradient: '',
    shadow: '',
    border: '',
    flexbox: '',
    grid: ''
  };

  // ============================================
  // CSS Syntax Highlighter
  // ============================================
  function highlightCSS(code) {
    // Escape HTML
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tokenize and highlight
    const lines = highlighted.split('\n');
    const highlightedLines = lines.map(line => {
      // Split by colon to separate property from value
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return line;

      const property = line.substring(0, colonIndex);
      const rest = line.substring(colonIndex);

      // Highlight property
      const highlightedProperty = `<span class="css-property">${property}</span>`;

      // Highlight value part
      let value = rest;

      // Highlight colon and semicolon
      value = value.replace(/:/g, '<span class="css-punctuation">:</span>');
      value = value.replace(/;/g, '<span class="css-punctuation">;</span>');
      value = value.replace(/,/g, '<span class="css-punctuation">,</span>');

      // Highlight colors (hex) - must be before numbers
      value = value.replace(/(#[a-fA-F0-9]{3,8})/g, '<span class="css-color">$1</span>');

      // Highlight rgba/hsla/rgb/hsl functions
      value = value.replace(/\b(rgba?|hsla?)\(/gi, '<span class="css-function">$1</span>(');

      // Highlight CSS functions
      value = value.replace(/\b(linear-gradient|radial-gradient|conic-gradient|repeat|minmax|calc|var)\(/gi, '<span class="css-function">$1</span>(');

      // Highlight numbers with units (but not inside hex colors)
      value = value.replace(/(?<!#[a-fA-F0-9]*)(\d+\.?\d*)(px|em|rem|%|deg|vh|vw|fr|s|ms)?\b/g, '<span class="css-number">$1$2</span>');

      // Highlight keywords (only as standalone values)
      value = value.replace(/\b(none|auto|inherit|initial|unset|solid|dashed|dotted|double|inset|flex|grid|row|column|wrap|nowrap|center|start|end|flex-start|flex-end|space-between|space-around|space-evenly|stretch|baseline)\b/gi, '<span class="css-keyword">$1</span>');

      return highlightedProperty + value;
    });

    return highlightedLines.join('\n');
  }

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Tabs
    tabs: document.querySelectorAll('.css-tab'),
    panels: document.querySelectorAll('.css-panel'),

    // Gradient
    gradientTypeButtons: document.querySelectorAll('#gradientPanel .type-btn'),
    gradientAngle: document.getElementById('gradientAngle'),
    gradientAngleValue: document.getElementById('gradientAngleValue'),
    gradientAngleGroup: document.getElementById('gradientAngleGroup'),
    gradientPositionGroup: document.getElementById('gradientPositionGroup'),
    positionButtons: document.querySelectorAll('.position-btn'),
    colorStops: document.getElementById('colorStops'),
    addColorStop: document.getElementById('addColorStop'),
    gradientPresets: document.getElementById('gradientPresets'),
    gradientPreview: document.getElementById('gradientPreview'),
    gradientCode: document.getElementById('gradientCode'),
    copyGradient: document.getElementById('copyGradient'),

    // Shadow
    shadowTypeButtons: document.querySelectorAll('#shadowPanel .type-btn'),
    shadowOffsetX: document.getElementById('shadowOffsetX'),
    shadowOffsetXValue: document.getElementById('shadowOffsetXValue'),
    shadowOffsetY: document.getElementById('shadowOffsetY'),
    shadowOffsetYValue: document.getElementById('shadowOffsetYValue'),
    shadowBlur: document.getElementById('shadowBlur'),
    shadowBlurValue: document.getElementById('shadowBlurValue'),
    shadowSpread: document.getElementById('shadowSpread'),
    shadowSpreadValue: document.getElementById('shadowSpreadValue'),
    shadowSpreadGroup: document.getElementById('shadowSpreadGroup'),
    shadowColor: document.getElementById('shadowColor'),
    shadowOpacity: document.getElementById('shadowOpacity'),
    shadowOpacityValue: document.getElementById('shadowOpacityValue'),
    shadowInset: document.getElementById('shadowInset'),
    shadowInsetGroup: document.getElementById('shadowInsetGroup'),
    shadowPresets: document.getElementById('shadowPresets'),
    shadowDemoBox: document.getElementById('shadowDemoBox'),
    shadowCode: document.getElementById('shadowCode'),
    copyShadow: document.getElementById('copyShadow'),

    // Border
    radiusModeButtons: document.querySelectorAll('.radius-mode .mode-btn'),
    radiusAll: document.getElementById('radiusAll'),
    radiusAllValue: document.getElementById('radiusAllValue'),
    radiusAllGroup: document.getElementById('radiusAllGroup'),
    radiusIndividualGroup: document.getElementById('radiusIndividualGroup'),
    radiusTL: document.getElementById('radiusTL'),
    radiusTR: document.getElementById('radiusTR'),
    radiusBR: document.getElementById('radiusBR'),
    radiusBL: document.getElementById('radiusBL'),
    borderWidth: document.getElementById('borderWidth'),
    borderWidthValue: document.getElementById('borderWidthValue'),
    borderStyle: document.getElementById('borderStyle'),
    borderColor: document.getElementById('borderColor'),
    bgColor: document.getElementById('bgColor'),
    borderPresets: document.getElementById('borderPresets'),
    borderDemoBox: document.getElementById('borderDemoBox'),
    borderCode: document.getElementById('borderCode'),
    copyBorder: document.getElementById('copyBorder'),

    // Flexbox
    flexDirection: document.getElementById('flexDirection'),
    justifyContent: document.getElementById('justifyContent'),
    alignItems: document.getElementById('alignItems'),
    flexWrap: document.getElementById('flexWrap'),
    flexGap: document.getElementById('flexGap'),
    flexGapValue: document.getElementById('flexGapValue'),
    flexItems: document.getElementById('flexItems'),
    flexItemsValue: document.getElementById('flexItemsValue'),
    flexboxContainer: document.getElementById('flexboxContainer'),
    flexboxCode: document.getElementById('flexboxCode'),
    copyFlexbox: document.getElementById('copyFlexbox'),

    // Grid
    gridColumns: document.getElementById('gridColumns'),
    gridColumnsValue: document.getElementById('gridColumnsValue'),
    gridRows: document.getElementById('gridRows'),
    gridRowsValue: document.getElementById('gridRowsValue'),
    gridGap: document.getElementById('gridGap'),
    gridGapValue: document.getElementById('gridGapValue'),
    gridColumnGap: document.getElementById('gridColumnGap'),
    gridColumnGapValue: document.getElementById('gridColumnGapValue'),
    gridRowGap: document.getElementById('gridRowGap'),
    gridRowGapValue: document.getElementById('gridRowGapValue'),
    gridAutoFlow: document.getElementById('gridAutoFlow'),
    gridPresets: document.getElementById('gridPresets'),
    gridContainer: document.getElementById('gridContainer'),
    gridCode: document.getElementById('gridCode'),
    copyGrid: document.getElementById('copyGrid'),

    // Other
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
    updateGradient();
    updateShadow();
    updateBorder();
    updateFlexbox();
    updateGrid();
  }

  function initEventListeners() {
    // Tabs
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Gradient
    initGradientListeners();

    // Shadow
    initShadowListeners();

    // Border
    initBorderListeners();

    // Flexbox
    initFlexboxListeners();

    // Grid
    initGridListeners();

    // Copy buttons
    elements.copyGradient?.addEventListener('click', () => copyToClipboard(rawCode.gradient));
    elements.copyShadow?.addEventListener('click', () => copyToClipboard(rawCode.shadow));
    elements.copyBorder?.addEventListener('click', () => copyToClipboard(rawCode.border));
    elements.copyFlexbox?.addEventListener('click', () => copyToClipboard(rawCode.flexbox));
    elements.copyGrid?.addEventListener('click', () => copyToClipboard(rawCode.grid));

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Tab Switching
  // ============================================
  function switchTab(tabName) {
    state.currentTab = tabName;

    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
  }

  // ============================================
  // Gradient Functions
  // ============================================
  function initGradientListeners() {
    // Type buttons
    elements.gradientTypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.gradientTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gradient.type = btn.dataset.type;

        // Show/hide angle or position controls
        if (state.gradient.type === 'linear') {
          elements.gradientAngleGroup.style.display = 'flex';
          elements.gradientPositionGroup.style.display = 'none';
        } else {
          elements.gradientAngleGroup.style.display = 'none';
          elements.gradientPositionGroup.style.display = 'flex';
        }

        updateGradient();
      });
    });

    // Angle slider
    elements.gradientAngle?.addEventListener('input', (e) => {
      state.gradient.angle = parseInt(e.target.value);
      elements.gradientAngleValue.textContent = state.gradient.angle;
      updateGradient();
    });

    // Position buttons
    elements.positionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.positionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gradient.position = btn.dataset.pos;
        updateGradient();
      });
    });

    // Color stops
    elements.colorStops?.addEventListener('input', handleColorStopChange);
    elements.colorStops?.addEventListener('click', handleColorStopRemove);

    // Add color stop
    elements.addColorStop?.addEventListener('click', addColorStop);

    // Presets
    elements.gradientPresets?.addEventListener('click', (e) => {
      const btn = e.target.closest('.preset-btn');
      if (btn) {
        const colors = btn.dataset.colors.split(',');
        state.gradient.stops = colors.map((color, i) => ({
          color,
          position: Math.round((i / (colors.length - 1)) * 100)
        }));
        renderColorStops();
        updateGradient();
      }
    });
  }

  function handleColorStopChange(e) {
    const stopEl = e.target.closest('.color-stop');
    if (!stopEl) return;

    const index = parseInt(stopEl.dataset.index);

    if (e.target.classList.contains('stop-color')) {
      state.gradient.stops[index].color = e.target.value;
    } else if (e.target.classList.contains('stop-position')) {
      state.gradient.stops[index].position = parseInt(e.target.value) || 0;
    }

    updateGradient();
  }

  function handleColorStopRemove(e) {
    const removeBtn = e.target.closest('.remove-stop-btn');
    if (!removeBtn) return;

    if (state.gradient.stops.length <= 2) {
      showToast('Minimum 2 color stops required', 'error');
      return;
    }

    const stopEl = removeBtn.closest('.color-stop');
    const index = parseInt(stopEl.dataset.index);
    state.gradient.stops.splice(index, 1);
    renderColorStops();
    updateGradient();
  }

  function addColorStop() {
    if (state.gradient.stops.length >= 10) {
      showToast('Maximum 10 color stops allowed', 'error');
      return;
    }

    const lastStop = state.gradient.stops[state.gradient.stops.length - 1];
    const newPosition = Math.min(lastStop.position + 10, 100);
    state.gradient.stops.push({
      color: getRandomColor(),
      position: newPosition
    });

    renderColorStops();
    updateGradient();
  }

  function renderColorStops() {
    elements.colorStops.innerHTML = state.gradient.stops.map((stop, i) => `
      <div class="color-stop" data-index="${i}">
        <input type="color" class="stop-color" value="${stop.color}">
        <input type="number" class="stop-position" value="${stop.position}" min="0" max="100">
        <span class="stop-percent">%</span>
        <button class="remove-stop-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join('');
  }

  function updateGradient() {
    const stops = state.gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    let gradient;
    let cssCode;

    switch (state.gradient.type) {
      case 'linear':
        gradient = `linear-gradient(${state.gradient.angle}deg, ${stops})`;
        break;
      case 'radial':
        gradient = `radial-gradient(circle at ${state.gradient.position}, ${stops})`;
        break;
      case 'conic':
        gradient = `conic-gradient(from 0deg at ${state.gradient.position}, ${stops})`;
        break;
    }

    elements.gradientPreview.style.background = gradient;
    cssCode = `background: ${gradient};`;

    rawCode.gradient = cssCode;
    elements.gradientCode.innerHTML = highlightCSS(cssCode);
  }

  // ============================================
  // Shadow Functions
  // ============================================
  function initShadowListeners() {
    // Type buttons
    elements.shadowTypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.shadowTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.shadow.type = btn.dataset.type;

        // Show/hide spread and inset for box shadow only
        const isBox = state.shadow.type === 'box';
        elements.shadowSpreadGroup.style.display = isBox ? 'flex' : 'none';
        elements.shadowInsetGroup.style.display = isBox ? 'flex' : 'none';

        updateShadow();
      });
    });

    // Sliders
    elements.shadowOffsetX?.addEventListener('input', (e) => {
      state.shadow.offsetX = parseInt(e.target.value);
      elements.shadowOffsetXValue.textContent = state.shadow.offsetX;
      updateShadow();
    });

    elements.shadowOffsetY?.addEventListener('input', (e) => {
      state.shadow.offsetY = parseInt(e.target.value);
      elements.shadowOffsetYValue.textContent = state.shadow.offsetY;
      updateShadow();
    });

    elements.shadowBlur?.addEventListener('input', (e) => {
      state.shadow.blur = parseInt(e.target.value);
      elements.shadowBlurValue.textContent = state.shadow.blur;
      updateShadow();
    });

    elements.shadowSpread?.addEventListener('input', (e) => {
      state.shadow.spread = parseInt(e.target.value);
      elements.shadowSpreadValue.textContent = state.shadow.spread;
      updateShadow();
    });

    elements.shadowColor?.addEventListener('input', (e) => {
      state.shadow.color = e.target.value;
      updateShadow();
    });

    elements.shadowOpacity?.addEventListener('input', (e) => {
      state.shadow.opacity = parseInt(e.target.value);
      elements.shadowOpacityValue.textContent = state.shadow.opacity + '%';
      updateShadow();
    });

    elements.shadowInset?.addEventListener('change', (e) => {
      state.shadow.inset = e.target.checked;
      updateShadow();
    });

    // Presets
    elements.shadowPresets?.addEventListener('click', (e) => {
      const btn = e.target.closest('.shadow-preset-btn');
      if (btn) {
        const shadow = btn.dataset.shadow;
        elements.shadowDemoBox.style.boxShadow = shadow;
        const cssCode = `box-shadow: ${shadow};`;
        rawCode.shadow = cssCode;
        elements.shadowCode.innerHTML = highlightCSS(cssCode);
      }
    });
  }

  function updateShadow() {
    const { offsetX, offsetY, blur, spread, color, opacity, inset, type } = state.shadow;
    const rgba = hexToRgba(color, opacity / 100);

    let shadow;
    let cssCode;

    if (type === 'box') {
      shadow = `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
      cssCode = `box-shadow: ${shadow};`;
      elements.shadowDemoBox.style.boxShadow = shadow;
      elements.shadowDemoBox.style.textShadow = 'none';
    } else {
      shadow = `${offsetX}px ${offsetY}px ${blur}px ${rgba}`;
      cssCode = `text-shadow: ${shadow};`;
      elements.shadowDemoBox.style.textShadow = shadow;
      elements.shadowDemoBox.style.boxShadow = 'none';
    }

    rawCode.shadow = cssCode;
    elements.shadowCode.innerHTML = highlightCSS(cssCode);
  }

  // ============================================
  // Border Functions
  // ============================================
  function initBorderListeners() {
    // Mode buttons
    elements.radiusModeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.radiusModeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.border.mode = btn.dataset.mode;

        const isAll = state.border.mode === 'all';
        elements.radiusAllGroup.style.display = isAll ? 'flex' : 'none';
        elements.radiusIndividualGroup.style.display = isAll ? 'none' : 'flex';

        updateBorder();
      });
    });

    // Radius all
    elements.radiusAll?.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      state.border.radiusAll = value;
      state.border.radiusTL = value;
      state.border.radiusTR = value;
      state.border.radiusBR = value;
      state.border.radiusBL = value;
      elements.radiusAllValue.textContent = value;
      updateBorder();
    });

    // Individual radius
    ['TL', 'TR', 'BR', 'BL'].forEach(corner => {
      const el = elements[`radius${corner}`];
      el?.addEventListener('input', (e) => {
        state.border[`radius${corner}`] = parseInt(e.target.value);
        updateBorder();
      });
    });

    // Border width
    elements.borderWidth?.addEventListener('input', (e) => {
      state.border.width = parseInt(e.target.value);
      elements.borderWidthValue.textContent = state.border.width;
      updateBorder();
    });

    // Border style
    elements.borderStyle?.addEventListener('change', (e) => {
      state.border.style = e.target.value;
      updateBorder();
    });

    // Colors
    elements.borderColor?.addEventListener('input', (e) => {
      state.border.color = e.target.value;
      updateBorder();
    });

    elements.bgColor?.addEventListener('input', (e) => {
      state.border.bgColor = e.target.value;
      updateBorder();
    });

    // Presets
    elements.borderPresets?.addEventListener('click', (e) => {
      const btn = e.target.closest('.border-preset-btn');
      if (btn) {
        const radius = parseInt(btn.dataset.radius);
        state.border.radiusAll = radius;
        state.border.radiusTL = radius;
        state.border.radiusTR = radius;
        state.border.radiusBR = radius;
        state.border.radiusBL = radius;
        elements.radiusAll.value = radius;
        elements.radiusAllValue.textContent = radius;
        updateBorder();
      }
    });
  }

  function updateBorder() {
    const { mode, radiusAll, radiusTL, radiusTR, radiusBR, radiusBL, width, style, color, bgColor } = state.border;

    let borderRadius;
    if (mode === 'all') {
      borderRadius = `${radiusAll}px`;
    } else {
      borderRadius = `${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px`;
    }

    const border = `${width}px ${style} ${color}`;

    elements.borderDemoBox.style.borderRadius = borderRadius;
    elements.borderDemoBox.style.border = border;
    elements.borderDemoBox.style.backgroundColor = bgColor;

    const cssCode = [
      `border-radius: ${borderRadius};`,
      `border: ${border};`,
      `background-color: ${bgColor};`
    ].join('\n');

    rawCode.border = cssCode;
    elements.borderCode.innerHTML = highlightCSS(cssCode);
  }

  // ============================================
  // Flexbox Functions
  // ============================================
  function initFlexboxListeners() {
    elements.flexDirection?.addEventListener('change', (e) => {
      state.flexbox.direction = e.target.value;
      updateFlexbox();
    });

    elements.justifyContent?.addEventListener('change', (e) => {
      state.flexbox.justifyContent = e.target.value;
      updateFlexbox();
    });

    elements.alignItems?.addEventListener('change', (e) => {
      state.flexbox.alignItems = e.target.value;
      updateFlexbox();
    });

    elements.flexWrap?.addEventListener('change', (e) => {
      state.flexbox.wrap = e.target.value;
      updateFlexbox();
    });

    elements.flexGap?.addEventListener('input', (e) => {
      state.flexbox.gap = parseInt(e.target.value);
      elements.flexGapValue.textContent = state.flexbox.gap;
      updateFlexbox();
    });

    elements.flexItems?.addEventListener('input', (e) => {
      state.flexbox.items = parseInt(e.target.value);
      elements.flexItemsValue.textContent = state.flexbox.items;
      updateFlexbox();
    });
  }

  function updateFlexbox() {
    const { direction, justifyContent, alignItems, wrap, gap, items } = state.flexbox;

    // Update container
    elements.flexboxContainer.style.flexDirection = direction;
    elements.flexboxContainer.style.justifyContent = justifyContent;
    elements.flexboxContainer.style.alignItems = alignItems;
    elements.flexboxContainer.style.flexWrap = wrap;
    elements.flexboxContainer.style.gap = gap + 'px';

    // Update items
    elements.flexboxContainer.innerHTML = '';
    for (let i = 1; i <= items; i++) {
      const item = document.createElement('div');
      item.className = 'flex-item';
      item.textContent = i;
      elements.flexboxContainer.appendChild(item);
    }

    // Generate code
    const cssCode = [
      'display: flex;',
      `flex-direction: ${direction};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
      `flex-wrap: ${wrap};`,
      `gap: ${gap}px;`
    ].join('\n');

    rawCode.flexbox = cssCode;
    elements.flexboxCode.innerHTML = highlightCSS(cssCode);
  }

  // ============================================
  // Grid Functions
  // ============================================
  function initGridListeners() {
    elements.gridColumns?.addEventListener('input', (e) => {
      state.grid.columns = parseInt(e.target.value);
      elements.gridColumnsValue.textContent = state.grid.columns;
      updateGrid();
    });

    elements.gridRows?.addEventListener('input', (e) => {
      state.grid.rows = parseInt(e.target.value);
      elements.gridRowsValue.textContent = state.grid.rows;
      updateGrid();
    });

    elements.gridGap?.addEventListener('input', (e) => {
      state.grid.gap = parseInt(e.target.value);
      state.grid.columnGap = state.grid.gap;
      state.grid.rowGap = state.grid.gap;
      elements.gridGapValue.textContent = state.grid.gap;
      elements.gridColumnGap.value = state.grid.gap;
      elements.gridRowGap.value = state.grid.gap;
      elements.gridColumnGapValue.textContent = state.grid.gap;
      elements.gridRowGapValue.textContent = state.grid.gap;
      updateGrid();
    });

    elements.gridColumnGap?.addEventListener('input', (e) => {
      state.grid.columnGap = parseInt(e.target.value);
      elements.gridColumnGapValue.textContent = state.grid.columnGap;
      updateGrid();
    });

    elements.gridRowGap?.addEventListener('input', (e) => {
      state.grid.rowGap = parseInt(e.target.value);
      elements.gridRowGapValue.textContent = state.grid.rowGap;
      updateGrid();
    });

    elements.gridAutoFlow?.addEventListener('change', (e) => {
      state.grid.autoFlow = e.target.value;
      updateGrid();
    });

    // Presets
    elements.gridPresets?.addEventListener('click', (e) => {
      const btn = e.target.closest('.grid-preset-btn');
      if (btn) {
        state.grid.columns = parseInt(btn.dataset.cols);
        state.grid.rows = parseInt(btn.dataset.rows);
        elements.gridColumns.value = state.grid.columns;
        elements.gridRows.value = state.grid.rows;
        elements.gridColumnsValue.textContent = state.grid.columns;
        elements.gridRowsValue.textContent = state.grid.rows;
        updateGrid();
      }
    });
  }

  function updateGrid() {
    const { columns, rows, columnGap, rowGap, autoFlow } = state.grid;

    // Update container
    elements.gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    elements.gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    elements.gridContainer.style.columnGap = columnGap + 'px';
    elements.gridContainer.style.rowGap = rowGap + 'px';
    elements.gridContainer.style.gridAutoFlow = autoFlow;

    // Update items
    const itemCount = columns * rows;
    elements.gridContainer.innerHTML = '';
    for (let i = 1; i <= itemCount; i++) {
      const item = document.createElement('div');
      item.className = 'grid-item';
      item.textContent = i;
      elements.gridContainer.appendChild(item);
    }

    // Generate code
    const cssCode = [
      'display: grid;',
      `grid-template-columns: repeat(${columns}, 1fr);`,
      `grid-template-rows: repeat(${rows}, 1fr);`,
      `column-gap: ${columnGap}px;`,
      `row-gap: ${rowGap}px;`,
      `grid-auto-flow: ${autoFlow};`
    ].join('\n');

    rawCode.grid = cssCode;
    elements.gridCode.innerHTML = highlightCSS(cssCode);
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    // Ignore if typing in input
    if (e.target.matches('input, textarea, select')) return;

    switch (e.key) {
      case '1':
        e.preventDefault();
        switchTab('gradient');
        break;
      case '2':
        e.preventDefault();
        switchTab('shadow');
        break;
      case '3':
        e.preventDefault();
        switchTab('border');
        break;
      case '4':
        e.preventDefault();
        switchTab('flexbox');
        break;
      case '5':
        e.preventDefault();
        switchTab('grid');
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        copyCurrentCSS();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        resetCurrentTab();
        break;
    }
  }

  function copyCurrentCSS() {
    const code = rawCode[state.currentTab];
    if (code) copyToClipboard(code);
  }

  function resetCurrentTab() {
    switch (state.currentTab) {
      case 'gradient':
        state.gradient = {
          type: 'linear',
          angle: 90,
          position: 'center center',
          stops: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 }
          ]
        };
        elements.gradientAngle.value = 90;
        elements.gradientAngleValue.textContent = '90';
        renderColorStops();
        updateGradient();
        break;
      // Add other tab resets as needed
    }
    showToast('Reset to defaults', 'success');
  }

  // ============================================
  // Utilities
  // ============================================
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
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
