/**
 * ColorPicker Palettes Module
 * Generates color palettes based on color theory
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Palettes module to handle color palette generation
  const Palettes = {
    // DOM element references
    elements: {},
    
    // Current state
    currentHarmony: 'complementary',
    baseColor: '#6E57E0',
    
    // Harmony descriptions
    descriptions: {
      complementary: {
        title: 'Complementary',
        text: 'Colors that are opposite each other on the color wheel. This creates a high-contrast, vibrant look.'
      },
      analogous: {
        title: 'Analogous',
        text: 'Colors that are adjacent to each other on the color wheel. These create a harmonious, unified feel.'
      },
      triadic: {
        title: 'Triadic',
        text: 'Three colors equally spaced around the color wheel. This creates a balanced yet vibrant color scheme.'
      },
      tetradic: {
        title: 'Tetradic',
        text: 'Four colors arranged in two complementary pairs. Creates a rich, dynamic color scheme with many possibilities.'
      },
      monochromatic: {
        title: 'Monochromatic',
        text: 'Different shades, tones, and tints of a single color. Creates a cohesive, sophisticated look.'
      },
      shades: {
        title: 'Shades',
        text: 'Variations of a single hue from light to dark, mixed with black and white. Perfect for creating depth.'
      }
    },
    
    // Initialize the palettes module
    init: function() {
      this.cacheElements();
      this.setupEventListeners();
      
      // Default to a nice color to match site theme
      this.baseColor = '#6E57E0';
      this.elements.baseColorPicker.value = this.baseColor;
      this.elements.baseColorHex.value = this.baseColor.substring(1);
      this.elements.baseColorPreview.style.backgroundColor = this.baseColor;
      
      // Generate palette with default harmony
      this.generatePalette();
      
      // Highlight harmony options for better discoverability
      setTimeout(() => {
        document.querySelectorAll('.cp-harmony-btn').forEach((btn, index) => {
          setTimeout(() => {
            btn.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            btn.style.transform = 'translateY(-5px)';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            
            setTimeout(() => {
              btn.style.transform = '';
              btn.style.boxShadow = '';
            }, 300);
          }, index * 100);
        });
      }, 500);
    },
    
    // Cache DOM element references
    cacheElements: function() {
      // Base color elements
      this.elements.baseColorPreview = document.getElementById('baseColorPreview');
      this.elements.baseColorPicker = document.getElementById('baseColorPicker');
      this.elements.baseColorHex = document.getElementById('baseColorHex');
      
      // Harmony buttons
      this.elements.harmonyButtons = document.querySelectorAll('.cp-harmony-btn');
      
      // Palette elements
      this.elements.generatedPalette = document.getElementById('generatedPalette');
      this.elements.paletteDescription = document.getElementById('paletteDescription');
      
      // Action buttons
      this.elements.generatePaletteBtn = document.getElementById('generatePaletteBtn');
      this.elements.randomBaseColorBtn = document.getElementById('randomBaseColorBtn');
      this.elements.savePaletteBtn = document.getElementById('savePaletteBtn');
      this.elements.exportPaletteBtn = document.getElementById('exportPaletteBtn');
      
      // Back link
      this.elements.backLink = document.getElementById('backFromPalettes');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      // Base color picker
      this.elements.baseColorPicker.addEventListener('input', this.handleBaseColorChange.bind(this));
      
      // Base color hex input
      this.elements.baseColorHex.addEventListener('change', this.handleBaseColorHexChange.bind(this));
      
      // Harmony buttons
      this.elements.harmonyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const harmony = button.getAttribute('data-harmony');
          this.selectHarmony(harmony);
        });
      });
      
      // Generate palette button
      this.elements.generatePaletteBtn.addEventListener('click', this.generatePalette.bind(this));
      
      // Random base color button
      this.elements.randomBaseColorBtn.addEventListener('click', this.setRandomBaseColor.bind(this));
      
      // Save palette button
      this.elements.savePaletteBtn.addEventListener('click', this.savePalette.bind(this));
      
      // Export palette button
      this.elements.exportPaletteBtn.addEventListener('click', this.exportPalette.bind(this));
      
      // Back link
      this.elements.backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.setRandomBaseColor();
      });
    },
    
    // Handle base color change from color picker
    handleBaseColorChange: function(e) {
      const color = e.target.value;
      this.baseColor = color;
      this.elements.baseColorPreview.style.backgroundColor = color;
      this.elements.baseColorHex.value = color.substring(1);
      this.generatePalette();
    },
    
    // Handle base color change from hex input
    handleBaseColorHexChange: function() {
      let hex = this.elements.baseColorHex.value;
      
      // Add # if missing
      if (hex.charAt(0) !== '#') {
        hex = '#' + hex;
      }
      
      // Validate hex format
      if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
        // Invalid hex, reset to current value
        this.elements.baseColorHex.value = this.baseColor.substring(1);
        window.ColorPickerTool.UI.showAlert('Invalid HEX color code', 'error');
        return;
      }
      
      // Update base color
      this.baseColor = hex;
      this.elements.baseColorPicker.value = hex;
      this.elements.baseColorPreview.style.backgroundColor = hex;
      this.generatePalette();
    },
    
    // Select a harmony type
    selectHarmony: function(harmony) {
      this.currentHarmony = harmony;
      
      // Update active button
      this.elements.harmonyButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-harmony') === harmony);
      });
      
      // Update description
      const description = this.descriptions[harmony];
      this.elements.paletteDescription.innerHTML = `
        <h4>${description.title}</h4>
        <p>${description.text}</p>
      `;
      
      // Generate new palette
      this.generatePalette();
    },
    
    // Set a random base color
    setRandomBaseColor: function() {
      // Generate random RGB values
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      // Convert to hex
      const hex = this.rgbToHex(r, g, b);
      
      // Update base color
      this.baseColor = hex;
      this.elements.baseColorPicker.value = hex;
      this.elements.baseColorHex.value = hex.substring(1);
      this.elements.baseColorPreview.style.backgroundColor = hex;
      
      // Generate new palette
      this.generatePalette();
    },
    
    // Generate color palette based on selected harmony
    generatePalette: function() {
      // Convert base color to HSL
      const rgb = this.hexToRgb(this.baseColor);
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Generate colors based on harmony type
      let colors = [];
      
      switch (this.currentHarmony) {
        case 'complementary':
          colors = this.generateComplementary(hsl);
          break;
        case 'analogous':
          colors = this.generateAnalogous(hsl);
          break;
        case 'triadic':
          colors = this.generateTriadic(hsl);
          break;
        case 'tetradic':
          colors = this.generateTetradic(hsl);
          break;
        case 'monochromatic':
          colors = this.generateMonochromatic(hsl);
          break;
        case 'shades':
          colors = this.generateShades(hsl);
          break;
      }
      
      // Display the palette
      this.displayPalette(colors);
    },
    
    // Display the generated palette
    displayPalette: function(colors) {
      // Clear previous palette
      this.elements.generatedPalette.innerHTML = '';
      
      // Add each color to the palette
      colors.forEach(color => {
        const colorElement = document.createElement('div');
        colorElement.className = 'cp-palette-color';
        colorElement.style.backgroundColor = color;
        colorElement.setAttribute('data-color', color);
        
        // Add click event to select color
        colorElement.addEventListener('click', () => {
          this.copyColorToClipboard(color);
        });
        
        this.elements.generatedPalette.appendChild(colorElement);
      });
    },
    
    // Copy color to clipboard
    copyColorToClipboard: function(color) {
      window.ColorPickerTool.UI.copyToClipboard(color)
        .then(() => {
          window.ColorPickerTool.UI.showAlert(`Copied: ${color}`, 'success', 1500);
        })
        .catch(() => {
          window.ColorPickerTool.UI.showAlert('Failed to copy to clipboard', 'error');
        });
    },
    
    // Save the current palette to collections
    savePalette: function() {
      // Get all colors from the palette
      const colorElements = this.elements.generatedPalette.querySelectorAll('.cp-palette-color');
      const colors = Array.from(colorElements).map(el => el.getAttribute('data-color'));
      
      if (colors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No palette to save', 'warning');
        return;
      }
      
      // Create palette object
      const palette = {
        id: window.ColorPickerTool.UI.generateUniqueId(),
        name: `${this.descriptions[this.currentHarmony].title} Palette`,
        colors: colors,
        harmony: this.currentHarmony,
        baseColor: this.baseColor,
        date: new Date()
      };
      
      // Save to collections or localStorage
      if (window.ColorPickerTool.Collections && typeof window.ColorPickerTool.Collections.addPalette === 'function') {
        window.ColorPickerTool.Collections.addPalette(palette);
        window.ColorPickerTool.UI.showAlert('Palette added to your collections', 'success');
      } else {
        // Collections module not loaded, store in localStorage
        const palettes = JSON.parse(localStorage.getItem('cpPalettes') || '[]');
        palettes.push(palette);
        localStorage.setItem('cpPalettes', JSON.stringify(palettes));
        window.ColorPickerTool.UI.showAlert('Palette saved to storage', 'success');
      }
    },
    
    // Export palette in different formats
    exportPalette: function() {
      // Get all colors from the palette
      const colorElements = this.elements.generatedPalette.querySelectorAll('.cp-palette-color');
      const colors = Array.from(colorElements).map(el => el.getAttribute('data-color'));
      
      if (colors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No palette to export', 'warning');
        return;
      }
      
      // Create export modal
      const modal = document.createElement('div');
      modal.className = 'cp-modal';
      
      modal.innerHTML = `
        <div class="cp-modal-content">
          <span class="cp-close-modal">&times;</span>
          <div class="cp-modal-header">
            <h3>Export Palette</h3>
          </div>
          <div class="cp-modal-body">
            <div class="cp-field-group">
              <label>Export Format</label>
              <select id="exportFormat">
                <option value="css">CSS Variables</option>
                <option value="sass">SCSS Variables</option>
                <option value="json">JSON</option>
                <option value="text">Text (HEX)</option>
              </select>
            </div>
            <div class="cp-field-group">
              <label>Preview</label>
              <pre id="exportPreview" class="cp-export-preview"></pre>
            </div>
          </div>
          <div class="cp-modal-footer">
            <button id="copyExportBtn" class="cp-primary-btn">
              <i class="fas fa-copy"></i> Copy to Clipboard
            </button>
            <button id="downloadExportBtn" class="cp-secondary-btn">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        </div>
      `;
      
      // Add modal to document
      document.body.appendChild(modal);
      
      // Show modal
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
      
      // Get elements
      const closeButton = modal.querySelector('.cp-close-modal');
      const formatSelect = modal.querySelector('#exportFormat');
      const exportPreview = modal.querySelector('#exportPreview');
      const copyButton = modal.querySelector('#copyExportBtn');
      const downloadButton = modal.querySelector('#downloadExportBtn');
      
      // Generate initial preview
      this.updateExportPreview(colors, formatSelect.value, exportPreview);
      
      // Format change event
      formatSelect.addEventListener('change', () => {
        this.updateExportPreview(colors, formatSelect.value, exportPreview);
      });
      
      // Copy button event
      copyButton.addEventListener('click', () => {
        const content = exportPreview.textContent;
        window.ColorPickerTool.UI.copyToClipboard(content)
          .then(() => {
            window.ColorPickerTool.UI.showAlert('Copied to clipboard', 'success');
          })
          .catch(() => {
            window.ColorPickerTool.UI.showAlert('Failed to copy to clipboard', 'error');
          });
      });
      
      // Download button event
      downloadButton.addEventListener('click', () => {
        const content = exportPreview.textContent;
        const format = formatSelect.value;
        let extension = '.txt';
        let mimeType = 'text/plain';
        
        switch (format) {
          case 'css':
            extension = '.css';
            mimeType = 'text/css';
            break;
          case 'sass':
            extension = '.scss';
            mimeType = 'text/plain';
            break;
          case 'json':
            extension = '.json';
            mimeType = 'application/json';
            break;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const filename = `palette_${this.currentHarmony}${extension}`;
        
        window.ColorPickerTool.UI.downloadBlob(blob, filename);
      });
      
      // Close button event
      closeButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    },
    
    // Update export preview based on format
    updateExportPreview: function(colors, format, previewElement) {
      let content = '';
      
      switch (format) {
        case 'css':
          content = ':root {\n';
          colors.forEach((color, index) => {
            content += `  --color-${index + 1}: ${color};\n`;
          });
          content += '}';
          break;
        
        case 'sass':
          colors.forEach((color, index) => {
            content += `$color-${index + 1}: ${color};\n`;
          });
          break;
        
        case 'json':
          const jsonObj = {
            palette: {
              name: `${this.descriptions[this.currentHarmony].title} Palette`,
              harmony: this.currentHarmony,
              baseColor: this.baseColor,
              colors: colors
            }
          };
          content = JSON.stringify(jsonObj, null, 2);
          break;
        
        case 'text':
          colors.forEach(color => {
            content += `${color}\n`;
          });
          break;
      }
      
      previewElement.textContent = content;
    },
    
    // Color Harmony Generation Functions
    
    // Generate complementary colors
    generateComplementary: function(hsl) {
      const { h, s, l } = hsl;
      const colors = [];
      
      // Base color
      colors.push(this.hslToHex(h, s, l));
      
      // Complementary color
      colors.push(this.hslToHex((h + 180) % 360, s, l));
      
      // Add tints and shades of each
      colors.push(this.hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 15)));
      colors.push(this.hslToHex(h, Math.min(100, s + 20), Math.max(0, l - 15)));
      colors.push(this.hslToHex((h + 180) % 360, Math.max(0, s - 20), Math.min(100, l + 15)));
      colors.push(this.hslToHex((h + 180) % 360, Math.min(100, s + 20), Math.max(0, l - 15)));
      
      return colors;
    },
    
    // Generate analogous colors
    generateAnalogous: function(hsl) {
      const { h, s, l } = hsl;
      const colors = [];
      
      // Analogous colors (-30°, base, +30°, +60°)
      colors.push(this.hslToHex((h - 30 + 360) % 360, s, l));
      colors.push(this.hslToHex(h, s, l));
      colors.push(this.hslToHex((h + 30) % 360, s, l));
      colors.push(this.hslToHex((h + 60) % 360, s, l));
      
      // Add additional variations
      colors.push(this.hslToHex((h - 30 + 360) % 360, Math.min(100, s + 10), Math.max(0, l - 10)));
      colors.push(this.hslToHex((h + 60) % 360, Math.min(100, s + 10), Math.max(0, l - 10)));
      
      return colors;
    },
    
    // Generate triadic colors
    generateTriadic: function(hsl) {
      const { h, s, l } = hsl;
      const colors = [];
      
      // Triadic colors (0°, 120°, 240°)
      colors.push(this.hslToHex(h, s, l));
      colors.push(this.hslToHex((h + 120) % 360, s, l));
      colors.push(this.hslToHex((h + 240) % 360, s, l));
      
      // Add tints and shades
      colors.push(this.hslToHex(h, Math.max(0, s - 15), Math.min(100, l + 15)));
      colors.push(this.hslToHex((h + 120) % 360, Math.max(0, s - 15), Math.min(100, l + 15)));
      colors.push(this.hslToHex((h + 240) % 360, Math.max(0, s - 15), Math.min(100, l + 15)));
      
      return colors;
    },
    
    // Generate tetradic colors
    generateTetradic: function(hsl) {
      const { h, s, l } = hsl;
      const colors = [];
      
      // Tetradic colors (0°, 90°, 180°, 270°)
      colors.push(this.hslToHex(h, s, l));
      colors.push(this.hslToHex((h + 90) % 360, s, l));
      colors.push(this.hslToHex((h + 180) % 360, s, l));
      colors.push(this.hslToHex((h + 270) % 360, s, l));
      
      // Add additional variations
      colors.push(this.hslToHex(h, Math.min(100, s + 15), Math.max(0, l - 10)));
      colors.push(this.hslToHex((h + 180) % 360, Math.min(100, s + 15), Math.max(0, l - 10)));
      
      return colors;
    },
    
    // Generate monochromatic colors
    generateMonochromatic: function(hsl) {
      const { h, s, l } = hsl;
      const colors = [];
      
      // Monochromatic variations (same hue, different saturation/lightness)
      colors.push(this.hslToHex(h, Math.min(100, s + 15), Math.min(100, l + 30)));
      colors.push(this.hslToHex(h, Math.min(100, s + 10), Math.min(100, l + 15)));
      colors.push(this.hslToHex(h, s, l));
      colors.push(this.hslToHex(h, Math.min(100, s + 10), Math.max(0, l - 15)));
      colors.push(this.hslToHex(h, Math.min(100, s + 15), Math.max(0, l - 30)));
      
      // One more variation
      colors.push(this.hslToHex(h, Math.max(0, s - 15), l));
      
      return colors;
    },
    
    // Generate shades
    generateShades: function(hsl) {
      const { h, s } = hsl;
      const colors = [];
      
      // Shades (from light to dark)
      for (let i = 90; i >= 15; i -= 15) {
        colors.push(this.hslToHex(h, s, i));
      }
      
      // Add white and black
      colors.unshift('#FFFFFF');
      colors.push('#000000');
      
      return colors;
    },
    
    // Color Format Conversion Utilities
    
    // RGB to HEX
    rgbToHex: function(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },
    
    // HEX to RGB
    hexToRgb: function(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    // RGB to HSL
    rgbToHsl: function(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      return {
        h: h * 360,
        s: s * 100,
        l: l * 100
      };
    },
    
    // HSL to RGB
    hslToRgb: function(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l; // achromatic
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
    
    // HSL to HEX
    hslToHex: function(h, s, l) {
      const rgb = this.hslToRgb(h, s, l);
      return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Palettes = Palettes;
})();