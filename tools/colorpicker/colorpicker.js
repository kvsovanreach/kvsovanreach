/**
 * KVSOVANREACH Color Picker Tool
 * Advanced color picker with format conversions, palettes, image picker, and accessibility tools
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    hue: 0,
    saturation: 100,
    value: 100,
    alpha: 1,
    savedAlpha: 1, // Store alpha when leaving Picker tab
    previousColor: '#666666',
    history: [],
    pickedFromImage: [],
    activeTab: 'picker',
    harmonyType: 'complementary',
    formatsExpanded: true,
    imageLoaded: false
  };

  // ==================== Color Conversion Functions ====================
  const ColorConverter = {
    // HSV to RGB
    hsvToRgb(h, s, v) {
      s /= 100;
      v /= 100;
      const c = v * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = v - c;
      let r, g, b;

      if (h < 60) { r = c; g = x; b = 0; }
      else if (h < 120) { r = x; g = c; b = 0; }
      else if (h < 180) { r = 0; g = c; b = x; }
      else if (h < 240) { r = 0; g = x; b = c; }
      else if (h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    },

    // RGB to HSV
    rgbToHsv(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      let h, s, v = max;

      s = max === 0 ? 0 : d / max;

      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
      };
    },

    // RGB to HSL
    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    },

    // HSL to RGB
    hslToRgb(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    },

    // RGB to CMYK
    rgbToCmyk(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
      return {
        c: Math.round((1 - r - k) / (1 - k) * 100),
        m: Math.round((1 - g - k) / (1 - k) * 100),
        y: Math.round((1 - b - k) / (1 - k) * 100),
        k: Math.round(k * 100)
      };
    },

    // CMYK to RGB
    cmykToRgb(c, m, y, k) {
      c /= 100;
      m /= 100;
      y /= 100;
      k /= 100;
      return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k))
      };
    },

    // RGB to HEX
    rgbToHex(r, g, b) {
      return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    },

    // HEX to RGB
    hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // Get current color in various formats
    getCurrentColor() {
      const rgb = this.hsvToRgb(state.hue, state.saturation, state.value);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);

      return {
        hex: '#' + hex.toUpperCase(),
        rgb: rgb,
        hsl: hsl,
        hsv: { h: state.hue, s: state.saturation, v: state.value },
        cmyk: cmyk,
        alpha: state.alpha
      };
    },

    // Color blindness simulation
    simulateColorBlindness(r, g, b, type) {
      // Matrices for different types of color blindness
      const matrices = {
        protanopia: [
          [0.567, 0.433, 0],
          [0.558, 0.442, 0],
          [0, 0.242, 0.758]
        ],
        deuteranopia: [
          [0.625, 0.375, 0],
          [0.7, 0.3, 0],
          [0, 0.3, 0.7]
        ],
        tritanopia: [
          [0.95, 0.05, 0],
          [0, 0.433, 0.567],
          [0, 0.475, 0.525]
        ],
        achromatopsia: [
          [0.299, 0.587, 0.114],
          [0.299, 0.587, 0.114],
          [0.299, 0.587, 0.114]
        ]
      };

      if (type === 'normal') return { r, g, b };

      const matrix = matrices[type];
      if (!matrix) return { r, g, b };

      return {
        r: Math.min(255, Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b)),
        g: Math.min(255, Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b)),
        b: Math.min(255, Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b))
      };
    },

    // Calculate contrast ratio
    getContrastRatio(rgb1, rgb2) {
      const getLuminance = (rgb) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const l1 = getLuminance(rgb1);
      const l2 = getLuminance(rgb2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    },

    // Generate color harmonies
    getHarmonies(h, s, v, type) {
      const harmonies = [];
      const hsvToHex = (h, s, v) => {
        const rgb = this.hsvToRgb(h, s, v);
        return '#' + this.rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
      };

      // Always include the base color
      harmonies.push(hsvToHex(h, s, v));

      switch (type) {
        case 'complementary':
          harmonies.push(hsvToHex((h + 180) % 360, s, v));
          break;

        case 'triadic':
          harmonies.push(hsvToHex((h + 120) % 360, s, v));
          harmonies.push(hsvToHex((h + 240) % 360, s, v));
          break;

        case 'analogous':
          harmonies.push(hsvToHex((h + 30) % 360, s, v));
          harmonies.push(hsvToHex((h - 30 + 360) % 360, s, v));
          break;

        case 'split':
          harmonies.push(hsvToHex((h + 150) % 360, s, v));
          harmonies.push(hsvToHex((h + 210) % 360, s, v));
          break;

        case 'tetradic':
          harmonies.push(hsvToHex((h + 90) % 360, s, v));
          harmonies.push(hsvToHex((h + 180) % 360, s, v));
          harmonies.push(hsvToHex((h + 270) % 360, s, v));
          break;

        case 'monochromatic':
          harmonies.push(hsvToHex(h, Math.max(0, s - 30), v));
          harmonies.push(hsvToHex(h, Math.min(100, s + 20), Math.max(0, v - 20)));
          harmonies.push(hsvToHex(h, s, Math.min(100, v + 20)));
          break;
      }

      return harmonies;
    }
  };

  // ==================== Palettes Data ====================
  const Palettes = {
    material: [
      { name: 'Red', colors: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'] },
      { name: 'Pink', colors: ['#FCE4EC', '#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F'] },
      { name: 'Purple', colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'] },
      { name: 'Blue', colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'] },
      { name: 'Green', colors: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'] },
      { name: 'Yellow', colors: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'] },
      { name: 'Orange', colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'] },
      { name: 'Grey', colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'] }
    ],
    tailwind: [
      { name: 'Slate', colors: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'] },
      { name: 'Red', colors: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'] },
      { name: 'Amber', colors: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'] },
      { name: 'Emerald', colors: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'] },
      { name: 'Sky', colors: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'] },
      { name: 'Violet', colors: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'] },
      { name: 'Rose', colors: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'] }
    ],
    flat: [
      { name: 'Flat UI', colors: ['#1abc9c', '#16a085', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#34495e', '#2c3e50'] },
      { name: 'Flat UI 2', colors: ['#f1c40f', '#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b', '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d'] }
    ],
    social: [
      { name: 'Social', colors: ['#3b5998', '#1da1f2', '#c32aa3', '#ff0000', '#ff4500', '#25d366', '#0077b5', '#bd081c', '#1db954', '#6441a4'] }
    ],
    nord: [
      { name: 'Polar Night', colors: ['#2e3440', '#3b4252', '#434c5e', '#4c566a'] },
      { name: 'Snow Storm', colors: ['#d8dee9', '#e5e9f0', '#eceff4'] },
      { name: 'Frost', colors: ['#8fbcbb', '#88c0d0', '#81a1c1', '#5e81ac'] },
      { name: 'Aurora', colors: ['#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#b48ead'] }
    ],
    pastel: [
      { name: 'Pastel Rainbow', colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'] },
      { name: 'Pastel Soft', colors: ['#f8b4b4', '#fcd5ce', '#f9e2af', '#cbf3f0', '#b8e0d2', '#d6eadf', '#eac4d5', '#d4a5a5'] },
      { name: 'Pastel Mint', colors: ['#cffafe', '#a7f3d0', '#d9f99d', '#fef08a', '#fde68a', '#fed7aa', '#fecaca', '#e9d5ff'] }
    ],
    earth: [
      { name: 'Forest', colors: ['#1a3c34', '#2d5a45', '#4a7856', '#6b9362', '#8bae72', '#a8c686', '#c4dea4', '#dff0c8'] },
      { name: 'Desert', colors: ['#6b4226', '#8b5a2b', '#a67b4a', '#c49a6c', '#ddb892', '#e8cdb5', '#f2e2d2', '#faf5f0'] },
      { name: 'Ocean', colors: ['#0c2d48', '#145374', '#2e8bc0', '#6db3d8', '#a4d4e4', '#c4e3ed', '#dff1f7', '#f0f9fc'] },
      { name: 'Autumn', colors: ['#5c3317', '#8b4513', '#cd6839', '#e07020', '#e89040', '#f0a060', '#f5c090', '#fae0c0'] }
    ],
    neon: [
      { name: 'Neon Lights', colors: ['#ff00ff', '#ff00bf', '#ff0080', '#ff0040', '#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00', '#00ff00'] },
      { name: 'Cyberpunk', colors: ['#0ff0fc', '#00ff9f', '#00ff00', '#fffc00', '#ff00ff', '#fe00fe', '#8b00ff', '#ff2a6d', '#d1f7ff', '#05ffa1'] },
      { name: 'Retrowave', colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#ff00ff', '#00ffff', '#ff0099', '#ffff00', '#00ff00'] }
    ],
    vintage: [
      { name: 'Retro', colors: ['#e8d5b7', '#b8860b', '#cd853f', '#8b4513', '#d2691e', '#a0522d', '#bc8f8f', '#f4a460'] },
      { name: 'Muted', colors: ['#96858f', '#6d7993', '#9099a2', '#d5d5d5', '#d4a59a', '#c97c5d', '#b36a5e', '#826a6a'] },
      { name: 'Sepia', colors: ['#704214', '#a67b5b', '#c4a35a', '#e1c16e', '#f0e68c', '#f5deb3', '#ffe4b5', '#faebd7'] }
    ],
    apple: [
      { name: 'iOS System', colors: ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#30b0c7', '#007aff', '#5856d6', '#af52de', '#ff2d55'] },
      { name: 'macOS', colors: ['#ff5f57', '#ffbd2e', '#28c940', '#007aff', '#5856d6', '#ff2d55', '#a2845e', '#8e8e93', '#636366', '#48484a'] }
    ],
    gradients: [
      { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Forest', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
      { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
      { name: 'Sky', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
      { name: 'Purple', gradient: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
      { name: 'Fire', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
      { name: 'Night', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
      { name: 'Mint', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
      { name: 'Berry', gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' },
      { name: 'Aqua', gradient: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)' },
      { name: 'Coral', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { name: 'Lavender', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
      { name: 'Mango', gradient: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)' },
      { name: 'Electric', gradient: 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)' },
      { name: 'Blush', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)' },
      { name: 'Twilight', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
      { name: 'Aurora', gradient: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)' },
      { name: 'Candy', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
      { name: 'Midnight', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }
    ]
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.picker-panel');

    // Color Area
    elements.colorArea = document.getElementById('colorArea');
    elements.colorAreaCursor = document.getElementById('colorAreaCursor');

    // Sliders
    elements.hueSlider = document.getElementById('hueSlider');
    elements.hueCursor = document.getElementById('hueCursor');
    elements.alphaSlider = document.getElementById('alphaSlider');
    elements.alphaGradient = document.getElementById('alphaGradient');
    elements.alphaCursor = document.getElementById('alphaCursor');
    elements.alphaValue = document.getElementById('alphaValue');

    // Preview
    elements.currentColor = document.getElementById('currentColor');
    elements.previousColor = document.getElementById('previousColor');

    // HEX Display
    elements.hexValue = document.getElementById('hexValue');
    elements.hexCopyBtn = document.getElementById('hexCopyBtn');

    // Quick Actions
    elements.randomColor = document.getElementById('randomColor');
    elements.eyeDropper = document.getElementById('eyeDropper');
    elements.saveColor = document.getElementById('saveColor');

    // Harmonies
    elements.harmonyType = document.getElementById('harmonyType');
    elements.harmoniesSwatches = document.getElementById('harmoniesSwatches');

    // Formats Toggle
    elements.formatsToggle = document.getElementById('formatsToggle');
    elements.formatsContent = document.getElementById('formatsContent');

    // History
    elements.historySwatches = document.getElementById('historySwatches');
    elements.clearHistory = document.getElementById('clearHistory');

    // Format Inputs
    elements.hexInput = document.getElementById('hexInput');
    elements.rgbR = document.getElementById('rgbR');
    elements.rgbG = document.getElementById('rgbG');
    elements.rgbB = document.getElementById('rgbB');
    elements.hslH = document.getElementById('hslH');
    elements.hslS = document.getElementById('hslS');
    elements.hslL = document.getElementById('hslL');
    elements.hsvH = document.getElementById('hsvH');
    elements.hsvS = document.getElementById('hsvS');
    elements.hsvV = document.getElementById('hsvV');
    elements.cmykC = document.getElementById('cmykC');
    elements.cmykM = document.getElementById('cmykM');
    elements.cmykY = document.getElementById('cmykY');
    elements.cmykK = document.getElementById('cmykK');

    // Image Picker
    elements.imageUploadArea = document.getElementById('imageUploadArea');
    elements.imageInput = document.getElementById('imageInput');
    elements.imageCanvasContainer = document.getElementById('imageCanvasContainer');
    elements.imageCanvas = document.getElementById('imageCanvas');
    elements.imagePin = document.getElementById('imagePin');
    elements.magnifier = document.getElementById('imageMagnifier');
    elements.magnifierCanvas = document.getElementById('magnifierCanvas');
    elements.magnifierColor = document.getElementById('magnifierColor');
    elements.removeImage = document.getElementById('removeImage');
    elements.pickedColorsList = document.getElementById('pickedColorsList');

    // Image Color Info
    elements.imageColorInfo = document.getElementById('imageColorInfo');
    elements.imageColorSwatch = document.getElementById('imageColorSwatch');
    elements.imageHex = document.getElementById('imageHex');
    elements.imageRgb = document.getElementById('imageRgb');
    elements.imageHsl = document.getElementById('imageHsl');

    // Palettes
    elements.paletteCategories = document.querySelectorAll('.palette-category');
    elements.paletteGrid = document.getElementById('paletteGrid');

    // Accessibility
    elements.fgColor = document.getElementById('fgColor');
    elements.bgColor = document.getElementById('bgColor');
    elements.fgColorPicker = document.getElementById('fgColorPicker');
    elements.bgColorPicker = document.getElementById('bgColorPicker');
    elements.fgSwatch = document.getElementById('fgSwatch');
    elements.bgSwatch = document.getElementById('bgSwatch');
    elements.useFgCurrent = document.getElementById('useFgCurrent');
    elements.useBgCurrent = document.getElementById('useBgCurrent');
    elements.swapContrastColors = document.getElementById('swapContrastColors');
    elements.contrastPreview = document.getElementById('contrastPreview');
    elements.contrastRatio = document.getElementById('contrastRatio');
    elements.colorblindGrid = document.getElementById('colorblindGrid');

    // Theme
    elements.themeToggle = document.getElementById('theme-toggle');
  }

  // ==================== UI Functions ====================
  // Use centralized toast from tools-common.js
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function updateColorArea() {
    const hueColor = ColorConverter.hsvToRgb(state.hue, 100, 100);
    elements.colorArea.style.backgroundColor = `rgb(${hueColor.r}, ${hueColor.g}, ${hueColor.b})`;
  }

  // Thumb radius for slider positioning (half of thumb width)
  const THUMB_RADIUS = 9;

  function updateCursors() {
    // Color area cursor
    const x = (state.saturation / 100) * elements.colorArea.offsetWidth;
    const y = (1 - state.value / 100) * elements.colorArea.offsetHeight;
    elements.colorAreaCursor.style.left = x + 'px';
    elements.colorAreaCursor.style.top = y + 'px';

    // Hue cursor - account for thumb radius so it stays within track
    const hueWidth = elements.hueSlider.offsetWidth;
    const hueX = THUMB_RADIUS + (state.hue / 360) * (hueWidth - 2 * THUMB_RADIUS);
    elements.hueCursor.style.left = hueX + 'px';

    // Alpha cursor - account for thumb radius so it stays within track
    const alphaWidth = elements.alphaSlider.offsetWidth;
    const alphaX = THUMB_RADIUS + state.alpha * (alphaWidth - 2 * THUMB_RADIUS);
    elements.alphaCursor.style.left = alphaX + 'px';
  }

  function updateAlphaGradient() {
    const color = ColorConverter.getCurrentColor();
    elements.alphaGradient.style.background =
      `linear-gradient(to right, transparent, ${color.hex})`;
  }

  function updatePreview() {
    const color = ColorConverter.getCurrentColor();

    // Apply color to current preview via CSS custom property (for checkered pattern layering)
    if (state.alpha < 1) {
      elements.currentColor.style.setProperty('--preview-color',
        `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${state.alpha})`);
    } else {
      elements.currentColor.style.setProperty('--preview-color', color.hex);
    }

    elements.previousColor.style.backgroundColor = state.previousColor;
    elements.alphaValue.textContent = Math.round(state.alpha * 100) + '%';

    // Update HEX display (show hex8 when alpha < 1)
    if (elements.hexValue) {
      if (state.alpha < 1) {
        const alphaHex = Math.round(state.alpha * 255).toString(16).padStart(2, '0').toUpperCase();
        elements.hexValue.textContent = color.hex + alphaHex;
      } else {
        elements.hexValue.textContent = color.hex;
      }
    }
  }

  function updateFormatInputs() {
    const color = ColorConverter.getCurrentColor();

    elements.hexInput.value = color.hex.replace('#', '');
    elements.rgbR.value = color.rgb.r;
    elements.rgbG.value = color.rgb.g;
    elements.rgbB.value = color.rgb.b;
    elements.hslH.value = color.hsl.h;
    elements.hslS.value = color.hsl.s;
    elements.hslL.value = color.hsl.l;
    elements.hsvH.value = color.hsv.h;
    elements.hsvS.value = color.hsv.s;
    elements.hsvV.value = color.hsv.v;
    elements.cmykC.value = color.cmyk.c;
    elements.cmykM.value = color.cmyk.m;
    elements.cmykY.value = color.cmyk.y;
    elements.cmykK.value = color.cmyk.k;
  }

  function updateAll() {
    updateColorArea();
    updateCursors();
    updateAlphaGradient();
    updatePreview();
    updateFormatInputs();
    updateColorBlindness();
    updateHarmonies();
  }

  function updateHarmonies() {
    if (!elements.harmoniesSwatches) return;

    const harmonies = ColorConverter.getHarmonies(
      state.hue, state.saturation, state.value, state.harmonyType
    );

    elements.harmoniesSwatches.innerHTML = harmonies.map(hex => `
      <div class="harmony-swatch" style="background-color: ${hex}" data-hex="${hex}" title="${hex}"></div>
    `).join('');

    // Add click handlers
    elements.harmoniesSwatches.querySelectorAll('.harmony-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        setColorFromHex(swatch.dataset.hex);
        ToolsCommon.copyWithToast(swatch.dataset.hex, 'Color copied!');
      });
    });
  }

  function setColorFromHex(hex) {
    const rgb = ColorConverter.hexToRgb(hex);
    if (rgb) {
      // Save current color as previous before changing
      state.previousColor = ColorConverter.getCurrentColor().hex;

      const hsv = ColorConverter.rgbToHsv(rgb.r, rgb.g, rgb.b);
      state.hue = hsv.h;
      state.saturation = hsv.s;
      state.value = hsv.v;
      updateAll();
    }
  }

  // ==================== Tab Navigation ====================
  function initTabs() {
    const pickerMain = document.querySelector('.picker-main');

    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        elements.tabs.forEach(t => t.classList.remove('active'));
        elements.panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tabName + 'Panel').classList.add('active');

        const previousTab = state.activeTab;
        state.activeTab = tabName;

        // Toggle full-width layout for Palettes and A11y tabs
        const isFullWidth = tabName === 'palettes' || tabName === 'accessibility';
        pickerMain.classList.toggle('full-width', isFullWidth);

        // Save alpha when leaving Picker tab, restore when returning
        if (previousTab === 'picker' && tabName !== 'picker') {
          state.savedAlpha = state.alpha;
          state.alpha = 1;
          updateAll();
        } else if (tabName === 'picker' && previousTab !== 'picker') {
          state.alpha = state.savedAlpha;
          updateAll();
        }

        // Load palettes when switching to palettes tab
        if (tabName === 'palettes') {
          loadPalettes('material');
        }

        // Update accessibility when switching to a11y tab
        if (tabName === 'accessibility') {
          updateContrastChecker();
          updateColorBlindness();
        }
      });
    });
  }

  // ==================== Color Picker Interactions ====================
  function initColorArea() {
    let isDragging = false;

    const updateFromPosition = (e) => {
      const rect = elements.colorArea.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      state.saturation = Math.round((x / rect.width) * 100);
      state.value = Math.round((1 - y / rect.height) * 100);
      updateAll();
    };

    elements.colorArea.addEventListener('mousedown', (e) => {
      // Save current color as previous before starting to pick
      state.previousColor = ColorConverter.getCurrentColor().hex;
      isDragging = true;
      updateFromPosition(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) updateFromPosition(e);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    elements.colorArea.addEventListener('touchstart', (e) => {
      // Save current color as previous before starting to pick
      state.previousColor = ColorConverter.getCurrentColor().hex;
      isDragging = true;
      updateFromPosition(e.touches[0]);
    }, { passive: true });

    elements.colorArea.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateFromPosition(e.touches[0]);
      }
    }, { passive: false });

    elements.colorArea.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  function initHueSlider() {
    let isDragging = false;

    const updateFromPosition = (e) => {
      const rect = elements.hueSlider.getBoundingClientRect();
      let x = e.clientX - rect.left;
      // Clamp x to usable range (accounting for thumb radius)
      const usableWidth = rect.width - 2 * THUMB_RADIUS;
      x = Math.max(THUMB_RADIUS, Math.min(x, rect.width - THUMB_RADIUS));
      // Calculate hue from clamped position
      state.hue = Math.round(((x - THUMB_RADIUS) / usableWidth) * 360);
      updateAll();
    };

    elements.hueSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateFromPosition(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) updateFromPosition(e);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    elements.hueSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateFromPosition(e.touches[0]);
    }, { passive: true });

    elements.hueSlider.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateFromPosition(e.touches[0]);
      }
    }, { passive: false });

    elements.hueSlider.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  function initAlphaSlider() {
    let isDragging = false;

    const updateFromPosition = (e) => {
      const rect = elements.alphaSlider.getBoundingClientRect();
      let x = e.clientX - rect.left;
      // Clamp x to usable range (accounting for thumb radius)
      const usableWidth = rect.width - 2 * THUMB_RADIUS;
      x = Math.max(THUMB_RADIUS, Math.min(x, rect.width - THUMB_RADIUS));
      // Calculate alpha from clamped position
      state.alpha = (x - THUMB_RADIUS) / usableWidth;
      updatePreview();
      // Position cursor at clamped position
      elements.alphaCursor.style.left = x + 'px';
    };

    elements.alphaSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateFromPosition(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) updateFromPosition(e);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    elements.alphaSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateFromPosition(e.touches[0]);
    }, { passive: true });

    elements.alphaSlider.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateFromPosition(e.touches[0]);
      }
    }, { passive: false });

    elements.alphaSlider.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // ==================== Format Inputs ====================
  function initFormatInputs() {
    // HEX input
    elements.hexInput.addEventListener('input', (e) => {
      let hex = e.target.value.replace(/[^a-fA-F0-9]/g, '');
      if (hex.length === 6 || hex.length === 3) {
        setColorFromHex('#' + hex);
      }
    });

    // RGB inputs
    [elements.rgbR, elements.rgbG, elements.rgbB].forEach(input => {
      input.addEventListener('input', () => {
        const r = parseInt(elements.rgbR.value) || 0;
        const g = parseInt(elements.rgbG.value) || 0;
        const b = parseInt(elements.rgbB.value) || 0;
        const hsv = ColorConverter.rgbToHsv(
          Math.min(255, Math.max(0, r)),
          Math.min(255, Math.max(0, g)),
          Math.min(255, Math.max(0, b))
        );
        state.hue = hsv.h;
        state.saturation = hsv.s;
        state.value = hsv.v;
        updateAll();
      });
    });

    // HSL inputs
    [elements.hslH, elements.hslS, elements.hslL].forEach(input => {
      input.addEventListener('input', () => {
        const h = parseInt(elements.hslH.value) || 0;
        const s = parseInt(elements.hslS.value) || 0;
        const l = parseInt(elements.hslL.value) || 0;
        const rgb = ColorConverter.hslToRgb(h, s, l);
        const hsv = ColorConverter.rgbToHsv(rgb.r, rgb.g, rgb.b);
        state.hue = hsv.h;
        state.saturation = hsv.s;
        state.value = hsv.v;
        updateAll();
      });
    });

    // HSV inputs
    [elements.hsvH, elements.hsvS, elements.hsvV].forEach(input => {
      input.addEventListener('input', () => {
        state.hue = parseInt(elements.hsvH.value) || 0;
        state.saturation = parseInt(elements.hsvS.value) || 0;
        state.value = parseInt(elements.hsvV.value) || 0;
        updateAll();
      });
    });

    // CMYK inputs
    [elements.cmykC, elements.cmykM, elements.cmykY, elements.cmykK].forEach(input => {
      input.addEventListener('input', () => {
        const c = parseInt(elements.cmykC.value) || 0;
        const m = parseInt(elements.cmykM.value) || 0;
        const y = parseInt(elements.cmykY.value) || 0;
        const k = parseInt(elements.cmykK.value) || 0;
        const rgb = ColorConverter.cmykToRgb(c, m, y, k);
        const hsv = ColorConverter.rgbToHsv(rgb.r, rgb.g, rgb.b);
        state.hue = hsv.h;
        state.saturation = hsv.s;
        state.value = hsv.v;
        updateAll();
      });
    });

    // Copy buttons
    document.querySelectorAll('.format-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        const color = ColorConverter.getCurrentColor();
        const hasAlpha = state.alpha < 1;
        const alphaRounded = Math.round(state.alpha * 100) / 100;
        let text = '';

        switch (format) {
          case 'hex':
            if (hasAlpha) {
              const alphaHex = Math.round(state.alpha * 255).toString(16).padStart(2, '0').toUpperCase();
              text = color.hex + alphaHex;
            } else {
              text = color.hex;
            }
            break;
          case 'rgb':
            if (hasAlpha) {
              text = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alphaRounded})`;
            } else {
              text = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            }
            break;
          case 'hsl':
            if (hasAlpha) {
              text = `hsla(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%, ${alphaRounded})`;
            } else {
              text = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
            }
            break;
          case 'hsv':
            text = `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`;
            break;
          case 'cmyk':
            text = `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;
            break;
        }

        ToolsCommon.copyWithToast(text, `${format.toUpperCase()} copied!`);
      });
    });
  }

  // ==================== Quick Actions ====================
  function initQuickActions() {
    // Random color
    elements.randomColor.addEventListener('click', generateRandomColor);

    // EyeDropper API
    if (elements.eyeDropper) {
      if ('EyeDropper' in window) {
        elements.eyeDropper.addEventListener('click', openEyeDropper);
      } else {
        elements.eyeDropper.disabled = true;
        elements.eyeDropper.title = 'EyeDropper not supported in this browser';
      }
    }

    // Save to history
    elements.saveColor.addEventListener('click', () => {
      saveToHistory();
    });

    // HEX copy button
    if (elements.hexCopyBtn) {
      elements.hexCopyBtn.addEventListener('click', copyHexToClipboard);
    }

    // Harmony type change
    if (elements.harmonyType) {
      elements.harmonyType.addEventListener('change', (e) => {
        state.harmonyType = e.target.value;
        updateHarmonies();
      });
    }

    // Formats toggle
    if (elements.formatsToggle) {
      elements.formatsToggle.addEventListener('click', () => {
        state.formatsExpanded = !state.formatsExpanded;
        elements.formatsToggle.classList.toggle('active', state.formatsExpanded);
        elements.formatsContent.classList.toggle('active', state.formatsExpanded);
      });
    }
  }

  // Show pin at position on image (relative to canvas display size)
  function showImagePin(displayX, displayY) {
    if (!elements.imageCanvas || !elements.imageCanvasContainer || !elements.imagePin) return;

    const canvasRect = elements.imageCanvas.getBoundingClientRect();
    const containerRect = elements.imageCanvasContainer.getBoundingClientRect();
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;

    elements.imagePin.style.left = (offsetX + displayX) + 'px';
    elements.imagePin.style.top = (offsetY + displayY) + 'px';
    elements.imagePin.classList.remove('active');
    // Force reflow for animation
    void elements.imagePin.offsetWidth;
    elements.imagePin.classList.add('active');
  }

  // Update image color info panel
  function updateImageColorInfo(hex, r, g, b, hsl) {
    if (!elements.imageColorInfo) return;

    elements.imageColorInfo.classList.add('active');
    elements.imageColorSwatch.style.backgroundColor = hex;
    elements.imageHex.textContent = hex;
    elements.imageRgb.textContent = `rgb(${r}, ${g}, ${b})`;
    elements.imageHsl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  // Render picked colors from image
  function renderPickedColors() {
    if (!elements.pickedColorsList) return;

    if (state.pickedFromImage.length === 0) {
      elements.pickedColorsList.innerHTML = '<div class="picked-empty">Click on the image to pick colors</div>';
      return;
    }

    elements.pickedColorsList.innerHTML = state.pickedFromImage.map(color => `
      <div class="picked-color-item" data-color="${color}">
        <div class="picked-color-swatch" style="background-color: ${color}"></div>
        <span class="picked-color-hex">${color}</span>
      </div>
    `).join('');

    elements.pickedColorsList.querySelectorAll('.picked-color-item').forEach(item => {
      item.addEventListener('click', () => {
        state.alpha = 1; // Reset alpha for image picks
        setColorFromHex(item.dataset.color);
        ToolsCommon.copyWithToast(item.dataset.color, 'Color copied!');
      });
    });
  }

  // Random pick from image
  function randomPickFromImage() {
    if (!state.imageLoaded || !imageCtx) return false;

    // Get random position within image bounds
    const canvasX = Math.floor(Math.random() * elements.imageCanvas.width);
    const canvasY = Math.floor(Math.random() * elements.imageCanvas.height);

    // Get pixel color
    const pixel = imageCtx.getImageData(canvasX, canvasY, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    const hex = '#' + ColorConverter.rgbToHex(r, g, b).toUpperCase();
    const hsl = ColorConverter.rgbToHsl(r, g, b);

    // Calculate display position for pin
    const canvasRect = elements.imageCanvas.getBoundingClientRect();
    const displayX = (canvasX / elements.imageCanvas.width) * canvasRect.width;
    const displayY = (canvasY / elements.imageCanvas.height) * canvasRect.height;
    showImagePin(displayX, displayY);

    // Update color info panel
    updateImageColorInfo(hex, r, g, b, hsl);

    // Add to picked colors
    if (!state.pickedFromImage.includes(hex)) {
      state.pickedFromImage.unshift(hex);
      if (state.pickedFromImage.length > 10) {
        state.pickedFromImage.pop();
      }
      renderPickedColors();
    }

    // Set as current color (reset alpha to 1 for image picks)
    state.alpha = 1;
    setColorFromHex(hex);
    return true;
  }

  function generateRandomColor() {
    // If on image tab with an image loaded, pick from image
    if (state.activeTab === 'image' && state.imageLoaded) {
      if (randomPickFromImage()) {
        showToast('Random color picked from image!');
        return;
      }
    }

    // Default: generate random HSV color
    state.hue = Math.floor(Math.random() * 360);
    state.saturation = 30 + Math.floor(Math.random() * 70);
    state.value = 40 + Math.floor(Math.random() * 50);
    updateAll();
    showToast('Random color generated!');
  }

  function copyHexToClipboard() {
    const color = ColorConverter.getCurrentColor();
    let hex = color.hex;
    if (state.alpha < 1) {
      const alphaHex = Math.round(state.alpha * 255).toString(16).padStart(2, '0').toUpperCase();
      hex = color.hex + alphaHex;
    }
    ToolsCommon.copyWithToast(hex, 'HEX copied!');
  }

  async function openEyeDropper() {
    if (!('EyeDropper' in window)) {
      showToast('EyeDropper not supported', 'error');
      return;
    }

    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      setColorFromHex(result.sRGBHex);
      showToast('Color picked from screen!', 'success');
    } catch (e) {
      // User cancelled
    }
  }

  // ==================== History ====================
  function saveToHistory() {
    const color = ColorConverter.getCurrentColor();

    // Don't save duplicates
    if (state.history.includes(color.hex)) {
      showToast('Color already in history');
      return;
    }

    state.history.unshift(color.hex);
    if (state.history.length > 20) {
      state.history.pop();
    }

    localStorage.setItem('colorPickerHistory', JSON.stringify(state.history));
    renderHistory();
    showToast('Color saved!', 'success');
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historySwatches.innerHTML = '<div class="history-empty">No colors saved</div>';
      return;
    }

    elements.historySwatches.innerHTML = state.history.map(color => `
      <div class="history-swatch" style="background-color: ${color}" data-color="${color}" title="${color}"></div>
    `).join('');

    elements.historySwatches.querySelectorAll('.history-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        setColorFromHex(swatch.dataset.color);
        showToast('Color loaded from history');
      });
    });
  }

  function loadHistory() {
    const saved = localStorage.getItem('colorPickerHistory');
    if (saved) {
      state.history = JSON.parse(saved);
      renderHistory();
    }
  }

  function initHistory() {
    loadHistory();

    elements.clearHistory.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('colorPickerHistory');
      renderHistory();
      showToast('History cleared');
    });
  }

  // ==================== Image Picker ====================
  let imageCtx = null; // Canvas context for random pick

  function initImagePicker() {
    const ctx = elements.imageCanvas.getContext('2d');
    const magCtx = elements.magnifierCanvas.getContext('2d');
    imageCtx = ctx; // Store reference for random pick

    // Upload area click
    elements.imageUploadArea.addEventListener('click', () => {
      elements.imageInput.click();
    });

    // Drag and drop
    elements.imageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.imageUploadArea.classList.add('dragover');
    });

    elements.imageUploadArea.addEventListener('dragleave', () => {
      elements.imageUploadArea.classList.remove('dragover');
    });

    elements.imageUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.imageUploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImage(file);
      }
    });

    // File input change
    elements.imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        loadImage(file);
      }
    });

    function loadImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Set canvas size
          const maxWidth = elements.imageCanvasContainer.parentElement.offsetWidth - 32;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          elements.imageCanvas.width = width;
          elements.imageCanvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          elements.imageUploadArea.style.display = 'none';
          elements.imageCanvasContainer.classList.add('active');
          state.imageLoaded = true;
          state.pickedFromImage = [];
          renderPickedColors();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // Remove image
    elements.removeImage.addEventListener('click', () => {
      elements.imageUploadArea.style.display = 'flex';
      elements.imageCanvasContainer.classList.remove('active');
      elements.imageColorInfo.classList.remove('active');
      elements.imagePin.classList.remove('active');
      state.imageLoaded = false;
      elements.imageInput.value = '';
      state.pickedFromImage = [];
      renderPickedColors();
    });

    // Helper to check if coordinates are within canvas bounds
    function isWithinBounds(canvasX, canvasY) {
      return canvasX >= 0 && canvasX < elements.imageCanvas.width &&
             canvasY >= 0 && canvasY < elements.imageCanvas.height;
    }

    // Pick color from image
    elements.imageCanvas.addEventListener('mousemove', (e) => {
      if (!state.imageLoaded) return;

      const canvasRect = elements.imageCanvas.getBoundingClientRect();
      const containerRect = elements.imageCanvasContainer.getBoundingClientRect();

      // Mouse position relative to canvas
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      // Canvas offset within container (for magnifier positioning)
      const canvasOffsetX = canvasRect.left - containerRect.left;
      const canvasOffsetY = canvasRect.top - containerRect.top;

      const scaleX = elements.imageCanvas.width / canvasRect.width;
      const scaleY = elements.imageCanvas.height / canvasRect.height;
      const canvasX = Math.floor(x * scaleX);
      const canvasY = Math.floor(y * scaleY);

      // Check if within image bounds
      if (!isWithinBounds(canvasX, canvasY)) {
        elements.magnifier.classList.remove('active');
        return;
      }

      // Get pixel color
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const hex = ColorConverter.rgbToHex(pixel[0], pixel[1], pixel[2]);

      // Update magnifier (position relative to container)
      elements.magnifier.classList.add('active');
      elements.magnifier.style.left = (canvasOffsetX + x + 20) + 'px';
      elements.magnifier.style.top = (canvasOffsetY + y - 60) + 'px';

      // Draw magnified area
      magCtx.imageSmoothingEnabled = false;
      magCtx.clearRect(0, 0, 100, 100);
      magCtx.drawImage(
        elements.imageCanvas,
        canvasX - 5, canvasY - 5, 10, 10,
        0, 0, 100, 100
      );

      elements.magnifierColor.textContent = '#' + hex.toUpperCase();
    });

    elements.imageCanvas.addEventListener('mouseleave', () => {
      elements.magnifier.classList.remove('active');
    });

    elements.imageCanvas.addEventListener('click', (e) => {
      if (!state.imageLoaded) return;

      const rect = elements.imageCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scaleX = elements.imageCanvas.width / rect.width;
      const scaleY = elements.imageCanvas.height / rect.height;
      const canvasX = Math.floor(x * scaleX);
      const canvasY = Math.floor(y * scaleY);

      // Check if within image bounds
      if (!isWithinBounds(canvasX, canvasY)) {
        return;
      }

      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const r = pixel[0], g = pixel[1], b = pixel[2];
      const hex = '#' + ColorConverter.rgbToHex(r, g, b).toUpperCase();
      const hsl = ColorConverter.rgbToHsl(r, g, b);

      // Show pin at click position
      showImagePin(x, y);

      // Update color info panel
      updateImageColorInfo(hex, r, g, b, hsl);

      // Add to picked colors
      if (!state.pickedFromImage.includes(hex)) {
        state.pickedFromImage.unshift(hex);
        if (state.pickedFromImage.length > 10) {
          state.pickedFromImage.pop();
        }
        renderPickedColors();
      }

      // Set as current color (reset alpha to 1 for image picks)
      state.alpha = 1;
      setColorFromHex(hex);
      showToast('Color picked from image');
    });

    // Image color info copy buttons
    elements.imageColorInfo.querySelectorAll('.format-copy-sm').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        let text = '';
        switch (format) {
          case 'hex': text = elements.imageHex.textContent; break;
          case 'rgb': text = elements.imageRgb.textContent; break;
          case 'hsl': text = elements.imageHsl.textContent; break;
        }
        ToolsCommon.copyWithToast(text, `${format.toUpperCase()} copied!`);
      });
    });
  }

  // ==================== Palettes ====================
  function loadPalettes(category) {
    elements.paletteGrid.innerHTML = '';

    if (category === 'gradients') {
      Palettes.gradients.forEach(gradient => {
        const card = document.createElement('div');
        card.className = 'gradient-card';
        card.innerHTML = `
          <div class="gradient-preview" style="background: ${gradient.gradient}"></div>
          <div class="gradient-info">
            <span class="gradient-name">${gradient.name}</span>
            <button class="gradient-copy" title="Copy CSS">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
        `;

        card.querySelector('.gradient-copy').addEventListener('click', (e) => {
          e.stopPropagation();
          ToolsCommon.copyWithToast(gradient.gradient, 'Gradient CSS copied!');
        });

        elements.paletteGrid.appendChild(card);
      });
    } else {
      const palettes = Palettes[category] || [];
      palettes.forEach(palette => {
        const card = document.createElement('div');
        card.className = 'palette-card';
        card.innerHTML = `
          <div class="palette-colors">
            ${palette.colors.map(c => `<div class="palette-color" style="background-color: ${c}" data-color="${c}"></div>`).join('')}
          </div>
          <div class="palette-name">${palette.name}</div>
        `;

        card.querySelectorAll('.palette-color').forEach(colorEl => {
          colorEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const hex = colorEl.dataset.color;
            setColorFromHex(hex);
            showToast(`Selected ${hex}`, 'success');
          });
        });

        elements.paletteGrid.appendChild(card);
      });
    }
  }

  function initPalettes() {
    elements.paletteCategories.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.paletteCategories.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadPalettes(btn.dataset.category);
      });
    });
  }

  // ==================== Accessibility ====================
  function normalizeHex(hex) {
    // Remove # if present and ensure uppercase
    hex = hex.replace('#', '').toUpperCase();
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    // Return with # prefix if valid, otherwise null
    if (/^[0-9A-F]{6}$/.test(hex)) {
      return '#' + hex;
    }
    return null;
  }

  function updateContrastChecker() {
    const fgInput = elements.fgColor.value || '#000000';
    const bgInput = elements.bgColor.value || '#FFFFFF';

    // Normalize hex values
    const fgHex = normalizeHex(fgInput) || '#000000';
    const bgHex = normalizeHex(bgInput) || '#FFFFFF';

    const fgRgb = ColorConverter.hexToRgb(fgHex);
    const bgRgb = ColorConverter.hexToRgb(bgHex);

    if (!fgRgb || !bgRgb) return;

    // Update swatches
    elements.fgSwatch.style.backgroundColor = fgHex;
    elements.bgSwatch.style.backgroundColor = bgHex;

    // Sync color pickers
    elements.fgColorPicker.value = fgHex.toLowerCase();
    elements.bgColorPicker.value = bgHex.toLowerCase();

    // Update preview
    elements.contrastPreview.style.backgroundColor = bgHex;
    elements.contrastPreview.style.color = fgHex;

    // Calculate contrast ratio
    const ratio = ColorConverter.getContrastRatio(fgRgb, bgRgb);
    elements.contrastRatio.textContent = ratio.toFixed(2) + ':1';

    // WCAG scores
    const badges = document.querySelectorAll('.score-badges .badge');
    badges.forEach(badge => {
      const test = badge.dataset.test;
      let pass = false;

      switch (test) {
        case 'aa-normal': pass = ratio >= 4.5; break;
        case 'aa-large': pass = ratio >= 3; break;
        case 'aaa-normal': pass = ratio >= 7; break;
        case 'aaa-large': pass = ratio >= 4.5; break;
      }

      badge.classList.toggle('pass', pass);
      badge.classList.toggle('fail', !pass);
    });

    // Update color blindness preview with foreground color
    updateColorBlindness();
  }

  function updateColorBlindness() {
    // Use foreground color from contrast checker
    const fgInput = elements.fgColor?.value || '#000000';
    const fgHex = normalizeHex(fgInput) || '#000000';
    const rgb = ColorConverter.hexToRgb(fgHex);

    if (!rgb) return;

    const types = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];

    types.forEach(type => {
      const preview = document.querySelector(`.colorblind-preview[data-type="${type}"]`);
      if (preview) {
        const swatch = preview.querySelector('.colorblind-swatch');
        const hexDisplay = preview.querySelector('.colorblind-hex');
        const simulated = ColorConverter.simulateColorBlindness(
          rgb.r, rgb.g, rgb.b, type
        );
        const hex = '#' + ColorConverter.rgbToHex(simulated.r, simulated.g, simulated.b);
        swatch.style.backgroundColor = hex;
        if (hexDisplay) {
          hexDisplay.textContent = hex.toUpperCase();
        }
        // Store hex for click handler
        preview.dataset.hex = hex.toUpperCase();
      }
    });
  }

  function initAccessibility() {
    // Text input handlers
    elements.fgColor.addEventListener('input', updateContrastChecker);
    elements.bgColor.addEventListener('input', updateContrastChecker);

    // Color picker handlers
    elements.fgColorPicker.addEventListener('input', () => {
      elements.fgColor.value = elements.fgColorPicker.value.toUpperCase();
      updateContrastChecker();
    });

    elements.bgColorPicker.addEventListener('input', () => {
      elements.bgColor.value = elements.bgColorPicker.value.toUpperCase();
      updateContrastChecker();
    });

    // Use current color buttons
    elements.useFgCurrent.addEventListener('click', () => {
      const color = ColorConverter.getCurrentColor();
      elements.fgColor.value = color.hex;
      elements.fgColorPicker.value = color.hex;
      updateContrastChecker();
    });

    elements.useBgCurrent.addEventListener('click', () => {
      const color = ColorConverter.getCurrentColor();
      elements.bgColor.value = color.hex;
      elements.bgColorPicker.value = color.hex;
      updateContrastChecker();
    });

    // Swap colors
    elements.swapContrastColors.addEventListener('click', () => {
      const tempText = elements.fgColor.value;
      const tempPicker = elements.fgColorPicker.value;
      elements.fgColor.value = elements.bgColor.value;
      elements.fgColorPicker.value = elements.bgColorPicker.value;
      elements.bgColor.value = tempText;
      elements.bgColorPicker.value = tempPicker;
      updateContrastChecker();
    });

    // Colorblind swatch click to copy
    document.querySelectorAll('.colorblind-preview').forEach(preview => {
      preview.addEventListener('click', () => {
        const hex = preview.dataset.hex;
        if (hex) {
          ToolsCommon.copyWithToast(hex, `Copied ${hex}`);
        }
      });
    });

    // Initial values
    elements.fgColor.value = '#000000';
    elements.bgColor.value = '#FFFFFF';
    elements.fgColorPicker.value = '#000000';
    elements.bgColorPicker.value = '#ffffff';
    updateContrastChecker();
  }

  // ==================== Keyboard Shortcuts ====================
  function initKeyboardShortcuts() {
    // Global keyboard shortcuts (shortcut modal handled by tools-common.js)
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          generateRandomColor();
          break;

        case 'i':
          e.preventDefault();
          openEyeDropper();
          break;

        case 's':
          e.preventDefault();
          saveToHistory();
          break;

        case 'c':
          e.preventDefault();
          copyHexToClipboard();
          break;

        case '1':
          e.preventDefault();
          switchTab('picker');
          break;

        case '2':
          e.preventDefault();
          switchTab('image');
          break;

        case '3':
          e.preventDefault();
          switchTab('palettes');
          break;

        case '4':
          e.preventDefault();
          switchTab('accessibility');
          break;

        case 'arrowup':
          e.preventDefault();
          state.value = Math.min(100, state.value + 5);
          updateAll();
          break;

        case 'arrowdown':
          e.preventDefault();
          state.value = Math.max(0, state.value - 5);
          updateAll();
          break;

        case 'arrowleft':
          e.preventDefault();
          if (e.shiftKey) {
            state.hue = (state.hue - 10 + 360) % 360;
          } else {
            state.saturation = Math.max(0, state.saturation - 5);
          }
          updateAll();
          break;

        case 'arrowright':
          e.preventDefault();
          if (e.shiftKey) {
            state.hue = (state.hue + 10) % 360;
          } else {
            state.saturation = Math.min(100, state.saturation + 5);
          }
          updateAll();
          break;
      }
    });
  }

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.tool-tab[data-tab="${tabName}"]`);
    const pickerMain = document.querySelector('.picker-main');

    if (tab) {
      tab.classList.add('active');
      document.getElementById(tabName + 'Panel').classList.add('active');

      const previousTab = state.activeTab;
      state.activeTab = tabName;

      // Toggle full-width layout for Palettes and A11y tabs
      const isFullWidth = tabName === 'palettes' || tabName === 'accessibility';
      pickerMain.classList.toggle('full-width', isFullWidth);

      // Save alpha when leaving Picker tab, restore when returning
      if (previousTab === 'picker' && tabName !== 'picker') {
        state.savedAlpha = state.alpha;
        state.alpha = 1;
        updateAll();
      } else if (tabName === 'picker' && previousTab !== 'picker') {
        state.alpha = state.savedAlpha;
        updateAll();
      }

      if (tabName === 'palettes') {
        loadPalettes('material');
      }
      if (tabName === 'accessibility') {
        updateContrastChecker();
        updateColorBlindness();
      }
    }
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initTabs();
    initColorArea();
    initHueSlider();
    initAlphaSlider();
    initFormatInputs();
    initQuickActions();
    initHistory();
    initImagePicker();
    initPalettes();
    initAccessibility();
    initKeyboardShortcuts();

    // Set initial color
    state.hue = 207;
    state.saturation = 64;
    state.value = 63;
    updateAll();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
