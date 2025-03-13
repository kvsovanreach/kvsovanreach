/**
 * ColorPicker Accessibility Module
 * Handles color contrast checking and accessibility features
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Accessibility module to handle contrast checking
  const Accessibility = {
    // DOM element references
    elements: {},
    
    // Current colors
    colors: {
      foreground: '#000000',
      background: '#FFFFFF'
    },
    
    // WCAG contrast thresholds
    thresholds: {
      AALarge: 3.0,
      AANormal: 4.5,
      AAALarge: 4.5,
      AAANormal: 7.0,
      UIComponents: 3.0
    },
    
    // Initialize the accessibility module
    init: function() {
      this.cacheElements();
      this.setupEventListeners();
      this.updateContrastResults();
      
      // Provide initial guidance for better user experience
      setTimeout(() => {
        if (this.elements.contrastSuggestions) {
          this.elements.contrastSuggestions.innerHTML = `
            <div class="cp-suggestion-title">Tips for better contrast:</div>
            <ul style="margin-top: 8px; margin-bottom: 8px; padding-left: 20px;">
              <li>Try dark text on light backgrounds (or vice versa) for best readability</li>
              <li>Aim for at least 4.5:1 contrast ratio for normal text</li>
              <li>Click on suggested colors below to apply them</li>
            </ul>
            <p style="font-size: 0.85rem; margin-top: 5px;">Try different color combinations using the controls above.</p>
          `;
        }
      }, 500);
    },
    
    // Cache DOM element references
    cacheElements: function() {
      // Color inputs
      this.elements.foregroundColorPicker = document.getElementById('foregroundColorPicker');
      this.elements.foregroundColorHex = document.getElementById('foregroundColorHex');
      this.elements.foregroundColorPreview = document.getElementById('foregroundColorPreview');
      
      this.elements.backgroundColorPicker = document.getElementById('backgroundColorPicker');
      this.elements.backgroundColorHex = document.getElementById('backgroundColorHex');
      this.elements.backgroundColorPreview = document.getElementById('backgroundColorPreview');
      
      // Swap button
      this.elements.swapColorsBtn = document.getElementById('swapColorsBtn');
      
      // Text preview
      this.elements.textPreviewBox = document.getElementById('textPreviewBox');
      
      // Results
      this.elements.contrastRatio = document.getElementById('contrastRatio');
      this.elements.normalAA = document.getElementById('normalAA');
      this.elements.largeAA = document.getElementById('largeAA');
      this.elements.graphicsAA = document.getElementById('graphicsAA');
      this.elements.normalAAA = document.getElementById('normalAAA');
      this.elements.largeAAA = document.getElementById('largeAAA');
      
      // Suggestions
      this.elements.contrastSuggestions = document.getElementById('contrastSuggestions');
      
      // Back link
      this.elements.backLink = document.getElementById('backFromAccessibility');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      // Foreground color events
      this.elements.foregroundColorPicker.addEventListener('input', this.handleForegroundColorChange.bind(this));
      this.elements.foregroundColorHex.addEventListener('change', this.handleForegroundHexChange.bind(this));
      
      // Background color events
      this.elements.backgroundColorPicker.addEventListener('input', this.handleBackgroundColorChange.bind(this));
      this.elements.backgroundColorHex.addEventListener('change', this.handleBackgroundHexChange.bind(this));
      
      // Swap colors button
      this.elements.swapColorsBtn.addEventListener('click', this.swapColors.bind(this));
      
      // Back link
      this.elements.backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetColors();
      });
    },
    
    // Handle foreground color change from picker
    handleForegroundColorChange: function(e) {
      const color = e.target.value;
      this.colors.foreground = color;
      this.elements.foregroundColorPreview.style.backgroundColor = color;
      this.elements.foregroundColorHex.value = color.substring(1);
      this.updateContrastResults();
    },
    
    // Handle foreground color change from hex input
    handleForegroundHexChange: function() {
      let hex = this.elements.foregroundColorHex.value;
      
      // Add # if missing
      if (hex.charAt(0) !== '#') {
        hex = '#' + hex;
      }
      
      // Validate hex format
      if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
        // Invalid hex, reset to current value
        this.elements.foregroundColorHex.value = this.colors.foreground.substring(1);
        window.ColorPickerTool.UI.showAlert('Invalid HEX color code', 'error');
        return;
      }
      
      // Standardize 3-digit hex to 6-digit
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      
      // Update foreground color
      this.colors.foreground = hex;
      this.elements.foregroundColorPicker.value = hex;
      this.elements.foregroundColorPreview.style.backgroundColor = hex;
      this.updateContrastResults();
    },
    
    // Handle background color change from picker
    handleBackgroundColorChange: function(e) {
      const color = e.target.value;
      this.colors.background = color;
      this.elements.backgroundColorPreview.style.backgroundColor = color;
      this.elements.backgroundColorHex.value = color.substring(1);
      this.updateContrastResults();
    },
    
    // Handle background color change from hex input
    handleBackgroundHexChange: function() {
      let hex = this.elements.backgroundColorHex.value;
      
      // Add # if missing
      if (hex.charAt(0) !== '#') {
        hex = '#' + hex;
      }
      
      // Validate hex format
      if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
        // Invalid hex, reset to current value
        this.elements.backgroundColorHex.value = this.colors.background.substring(1);
        window.ColorPickerTool.UI.showAlert('Invalid HEX color code', 'error');
        return;
      }
      
      // Standardize 3-digit hex to 6-digit
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      
      // Update background color
      this.colors.background = hex;
      this.elements.backgroundColorPicker.value = hex;
      this.elements.backgroundColorPreview.style.backgroundColor = hex;
      this.updateContrastResults();
    },
    
    // Swap foreground and background colors
    swapColors: function() {
      const temp = this.colors.foreground;
      this.colors.foreground = this.colors.background;
      this.colors.background = temp;
      
      // Update UI
      this.elements.foregroundColorPicker.value = this.colors.foreground;
      this.elements.foregroundColorHex.value = this.colors.foreground.substring(1);
      this.elements.foregroundColorPreview.style.backgroundColor = this.colors.foreground;
      
      this.elements.backgroundColorPicker.value = this.colors.background;
      this.elements.backgroundColorHex.value = this.colors.background.substring(1);
      this.elements.backgroundColorPreview.style.backgroundColor = this.colors.background;
      
      this.updateContrastResults();
    },
    
    // Reset colors to default
    resetColors: function() {
      this.colors.foreground = '#000000';
      this.colors.background = '#FFFFFF';
      
      // Update UI
      this.elements.foregroundColorPicker.value = this.colors.foreground;
      this.elements.foregroundColorHex.value = this.colors.foreground.substring(1);
      this.elements.foregroundColorPreview.style.backgroundColor = this.colors.foreground;
      
      this.elements.backgroundColorPicker.value = this.colors.background;
      this.elements.backgroundColorHex.value = this.colors.background.substring(1);
      this.elements.backgroundColorPreview.style.backgroundColor = this.colors.background;
      
      this.updateContrastResults();
    },
    
    // Update contrast results
    updateContrastResults: function() {
      // Calculate contrast ratio
      const ratio = this.calculateContrastRatio(this.colors.foreground, this.colors.background);
      
      // Update text preview
      this.updateTextPreview();
      
      // Update contrast ratio display
      this.elements.contrastRatio.textContent = ratio.toFixed(2) + ':1';
      
      // Update color based on ratio
      if (ratio >= 7.0) {
        this.elements.contrastRatio.style.color = '#28a745'; // Green
      } else if (ratio >= 4.5) {
        this.elements.contrastRatio.style.color = '#ffc107'; // Yellow
      } else if (ratio >= 3.0) {
        this.elements.contrastRatio.style.color = '#fd7e14'; // Orange
      } else {
        this.elements.contrastRatio.style.color = '#dc3545'; // Red
      }
      
      // Update WCAG results
      this.updateWcagResults(ratio);
      
      // Generate suggestions if needed
      this.generateSuggestions(ratio);
    },
    
    // Update text preview
    updateTextPreview: function() {
      this.elements.textPreviewBox.style.backgroundColor = this.colors.background;
      this.elements.textPreviewBox.style.color = this.colors.foreground;
    },
    
    // Update WCAG results
    updateWcagResults: function(ratio) {
      // AA level checks
      const passAANormal = ratio >= this.thresholds.AANormal;
      const passAALarge = ratio >= this.thresholds.AALarge;
      const passUIComponents = ratio >= this.thresholds.UIComponents;
      
      // AAA level checks
      const passAAANormal = ratio >= this.thresholds.AAANormal;
      const passAAALarge = ratio >= this.thresholds.AAALarge;
      
      // Update normal text AA
      this.updateResultElement(this.elements.normalAA, passAANormal);
      
      // Update large text AA
      this.updateResultElement(this.elements.largeAA, passAALarge);
      
      // Update UI components AA
      this.updateResultElement(this.elements.graphicsAA, passUIComponents);
      
      // Update normal text AAA
      this.updateResultElement(this.elements.normalAAA, passAAANormal);
      
      // Update large text AAA
      this.updateResultElement(this.elements.largeAAA, passAAALarge);
    },
    
    // Update a result element based on pass/fail
    updateResultElement: function(element, pass) {
      if (pass) {
        element.innerHTML = '<i class="fas fa-check-circle cp-pass"></i> Pass';
      } else {
        element.innerHTML = '<i class="fas fa-times-circle cp-fail"></i> Fail';
      }
    },
    
    // Generate suggestions to improve contrast
    generateSuggestions: function(ratio) {
      // Clear previous suggestions
      this.elements.contrastSuggestions.innerHTML = '';
      
      // Only provide suggestions if ratio is below AAA level
      if (ratio >= this.thresholds.AAANormal) {
        return;
      }
      
      // Create suggestions container
      const container = document.createElement('div');
      
      // Add title
      const title = document.createElement('div');
      title.className = 'cp-suggestion-title';
      title.textContent = 'Suggestions to improve contrast:';
      container.appendChild(title);
      
      // Generate color suggestions
      const suggestedColors = document.createElement('div');
      suggestedColors.className = 'cp-suggested-colors';
      
      // Foreground color suggestions
      const fgRgb = this.hexToRgb(this.colors.foreground);
      const suggestedFgColors = this.generateColorVariations(fgRgb, this.colors.background);
      
      // Background color suggestions
      const bgRgb = this.hexToRgb(this.colors.background);
      const suggestedBgColors = this.generateColorVariations(bgRgb, this.colors.foreground);
      
      // Add foreground color suggestions
      for (let i = 0; i < 4 && i < suggestedFgColors.length; i++) {
        const colorElement = document.createElement('div');
        colorElement.className = 'cp-suggested-color';
        colorElement.style.backgroundColor = suggestedFgColors[i];
        colorElement.title = `Apply as text color: ${suggestedFgColors[i]}`;
        
        // Add click event to apply the color
        colorElement.addEventListener('click', () => {
          this.colors.foreground = suggestedFgColors[i];
          this.elements.foregroundColorPicker.value = suggestedFgColors[i];
          this.elements.foregroundColorHex.value = suggestedFgColors[i].substring(1);
          this.elements.foregroundColorPreview.style.backgroundColor = suggestedFgColors[i];
          this.updateContrastResults();
        });
        
        suggestedColors.appendChild(colorElement);
      }
      
      // Add background color suggestions
      for (let i = 0; i < 4 && i < suggestedBgColors.length; i++) {
        const colorElement = document.createElement('div');
        colorElement.className = 'cp-suggested-color';
        colorElement.style.backgroundColor = suggestedBgColors[i];
        colorElement.title = `Apply as background color: ${suggestedBgColors[i]}`;
        
        // Add click event to apply the color
        colorElement.addEventListener('click', () => {
          this.colors.background = suggestedBgColors[i];
          this.elements.backgroundColorPicker.value = suggestedBgColors[i];
          this.elements.backgroundColorHex.value = suggestedBgColors[i].substring(1);
          this.elements.backgroundColorPreview.style.backgroundColor = suggestedBgColors[i];
          this.updateContrastResults();
        });
        
        suggestedColors.appendChild(colorElement);
      }
      
      container.appendChild(suggestedColors);
      
      // Add suggestions to the page
      this.elements.contrastSuggestions.appendChild(container);
    },
    
    // Generate color variations to improve contrast
    generateColorVariations: function(rgb, contrastColor) {
      const variations = [];
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Target contrast with contrast color
      const targetRatios = [4.5, 7.0];
      
      // Try different lightness values
      for (let l = 5; l <= 95; l += 10) {
        const testColor = this.hslToHex(hsl.h, hsl.s, l);
        const ratio = this.calculateContrastRatio(testColor, contrastColor);
        
        // If meets a target ratio, add to suggestions
        if (targetRatios.some(target => Math.abs(ratio - target) < 0.5)) {
          variations.push(testColor);
        }
      }
      
      // Add darker and lighter versions
      const darkerColor = this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20));
      const lighterColor = this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20));
      
      variations.push(darkerColor);
      variations.push(lighterColor);
      
      // Add high-contrast variations
      variations.push('#000000');
      variations.push('#FFFFFF');
      
      // Filter out duplicate colors and sort by contrast ratio
      return [...new Set(variations)]
        .sort((a, b) => {
          const ratioA = this.calculateContrastRatio(a, contrastColor);
          const ratioB = this.calculateContrastRatio(b, contrastColor);
          return ratioB - ratioA; // Sort by highest contrast
        });
    },
    
    // Calculate contrast ratio between two colors
    calculateContrastRatio: function(color1, color2) {
      const l1 = this.getLuminance(color1);
      const l2 = this.getLuminance(color2);
      
      // Return contrast ratio (lighter color / darker color)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    
    // Get luminance from hex color
    getLuminance: function(hexColor) {
      const rgb = this.hexToRgb(hexColor);
      
      // Convert RGB to [0,1]
      let r = rgb.r / 255;
      let g = rgb.g / 255;
      let b = rgb.b / 255;
      
      // Apply gamma correction
      r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      // Calculate luminance
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    
    // Color Format Conversion Utilities
    
    // HEX to RGB
    hexToRgb: function(hex) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return { r, g, b };
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
    },
    
    // RGB to HEX
    rgbToHex: function(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Accessibility = Accessibility;
})();