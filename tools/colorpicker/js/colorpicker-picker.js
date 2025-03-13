/**
 * ColorPicker Picker Module
 * Handles the main color picker functionality
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Picker module to handle color selection
  const Picker = {
    // DOM element references
    elements: {},
    
    // Current color state
    color: {
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      hex: '#000000',
      cmyk: { c: 0, m: 0, y: 0, k: 100 }
    },
    
    // Color wheel properties
    wheel: {
      canvas: null,
      ctx: null,
      centerX: 0,
      centerY: 0,
      radius: 0,
      isDragging: false
    },
    
    // Initialize the color picker
    init: function() {
      this.cacheElements();
      this.setupEventListeners();
      this.initColorWheel();
      
      // Default to a nice color instead of random
      this.updateColorFromHex('#6E57E0'); // Site's primary color 
      
      // Apply subtle animation to make wheel more inviting
      setTimeout(() => {
        if (this.elements.colorWheelThumb) {
          this.elements.colorWheelThumb.style.transition = 'transform 0.5s ease';
          this.elements.colorWheelThumb.style.transform = 'scale(1.2)';
          setTimeout(() => {
            if (this.elements.colorWheelThumb) {
              this.elements.colorWheelThumb.style.transform = '';
            }
          }, 500);
        }
      }, 300);
    },
    
    // Cache DOM element references
    cacheElements: function() {
      // Color wheel elements
      this.elements.colorWheelCanvas = document.getElementById('colorWheelCanvas');
      this.elements.colorWheelThumb = document.getElementById('colorWheelThumb');
      this.elements.colorWheelInner = document.getElementById('colorWheelInner');
      
      // RGB inputs
      this.elements.redSlider = document.getElementById('redSlider');
      this.elements.redValue = document.getElementById('redValue');
      this.elements.greenSlider = document.getElementById('greenSlider');
      this.elements.greenValue = document.getElementById('greenValue');
      this.elements.blueSlider = document.getElementById('blueSlider');
      this.elements.blueValue = document.getElementById('blueValue');
      
      // HSL inputs
      this.elements.hueSlider = document.getElementById('hueSlider');
      this.elements.hueValue = document.getElementById('hueValue');
      this.elements.saturationSlider = document.getElementById('saturationSlider');
      this.elements.saturationValue = document.getElementById('saturationValue');
      this.elements.lightnessSlider = document.getElementById('lightnessSlider');
      this.elements.lightnessValue = document.getElementById('lightnessValue');
      
      // HEX input
      this.elements.hexValue = document.getElementById('hexValue');
      
      // CMYK inputs
      this.elements.cyanSlider = document.getElementById('cyanSlider');
      this.elements.cyanValue = document.getElementById('cyanValue');
      this.elements.magentaSlider = document.getElementById('magentaSlider');
      this.elements.magentaValue = document.getElementById('magentaValue');
      this.elements.yellowSlider = document.getElementById('yellowSlider');
      this.elements.yellowValue = document.getElementById('yellowValue');
      this.elements.blackSlider = document.getElementById('blackSlider');
      this.elements.blackValue = document.getElementById('blackValue');
      
      // Color output elements
      this.elements.colorPreview = document.getElementById('colorPreview');
      this.elements.rgbValue = document.getElementById('rgbValue');
      this.elements.hexCode = document.getElementById('hexCode');
      this.elements.hslValue = document.getElementById('hslValue');
      this.elements.cmykValue = document.getElementById('cmykValue');
      
      // Sample text preview elements
      this.elements.textOnColor = document.querySelector('.cp-text-on-color');
      this.elements.colorOnText = document.querySelector('.cp-color-on-text');
      
      // Tab buttons
      this.elements.tabButtons = document.querySelectorAll('.cp-tab-btn');
      
      // Action buttons
      this.elements.saveColorBtn = document.getElementById('saveColorBtn');
      this.elements.randomColorBtn = document.getElementById('randomColorBtn');
      
      // Copy buttons
      this.elements.copyButtons = document.querySelectorAll('.cp-copy-btn');
      
      // Back link
      this.elements.backLink = document.getElementById('backFromPicker');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      if (!this.elements.colorWheelCanvas) return;
      
      // Color wheel events
      this.elements.colorWheelCanvas.addEventListener('mousedown', this.handleWheelMouseDown.bind(this));
      document.addEventListener('mousemove', this.handleWheelMouseMove.bind(this));
      document.addEventListener('mouseup', this.handleWheelMouseUp.bind(this));
      
      this.elements.colorWheelCanvas.addEventListener('touchstart', this.handleWheelTouchStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.handleWheelTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleWheelTouchEnd.bind(this));
      
      // Inner circle (lightness)
      this.elements.colorWheelInner.addEventListener('mousedown', this.handleInnerMouseDown.bind(this));
      
      // RGB inputs
      this.elements.redSlider.addEventListener('input', this.handleRgbInput.bind(this));
      this.elements.redValue.addEventListener('change', this.handleRgbInput.bind(this));
      this.elements.greenSlider.addEventListener('input', this.handleRgbInput.bind(this));
      this.elements.greenValue.addEventListener('change', this.handleRgbInput.bind(this));
      this.elements.blueSlider.addEventListener('input', this.handleRgbInput.bind(this));
      this.elements.blueValue.addEventListener('change', this.handleRgbInput.bind(this));
      
      // HSL inputs
      this.elements.hueSlider.addEventListener('input', this.handleHslInput.bind(this));
      this.elements.hueValue.addEventListener('change', this.handleHslInput.bind(this));
      this.elements.saturationSlider.addEventListener('input', this.handleHslInput.bind(this));
      this.elements.saturationValue.addEventListener('change', this.handleHslInput.bind(this));
      this.elements.lightnessSlider.addEventListener('input', this.handleHslInput.bind(this));
      this.elements.lightnessValue.addEventListener('change', this.handleHslInput.bind(this));
      
      // HEX input
      this.elements.hexValue.addEventListener('change', this.handleHexInput.bind(this));
      
      // CMYK inputs
      this.elements.cyanSlider.addEventListener('input', this.handleCmykInput.bind(this));
      this.elements.cyanValue.addEventListener('change', this.handleCmykInput.bind(this));
      this.elements.magentaSlider.addEventListener('input', this.handleCmykInput.bind(this));
      this.elements.magentaValue.addEventListener('change', this.handleCmykInput.bind(this));
      this.elements.yellowSlider.addEventListener('input', this.handleCmykInput.bind(this));
      this.elements.yellowValue.addEventListener('change', this.handleCmykInput.bind(this));
      this.elements.blackSlider.addEventListener('input', this.handleCmykInput.bind(this));
      this.elements.blackValue.addEventListener('change', this.handleCmykInput.bind(this));
      
      // Tab switching
      this.elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabName = button.getAttribute('data-tab');
          this.switchTab(tabName);
        });
      });
      
      // Action buttons
      this.elements.saveColorBtn.addEventListener('click', this.saveColor.bind(this));
      this.elements.randomColorBtn.addEventListener('click', this.setRandomColor.bind(this));
      
      // Copy buttons
      this.elements.copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const valueType = button.getAttribute('data-value');
          this.copyColorValue(valueType);
        });
      });
      
      // Back link
      this.elements.backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.setRandomColor();
      });
    },
    
    // Initialize the color wheel
    initColorWheel: function() {
      if (!this.elements.colorWheelCanvas) return;
      
      const canvas = this.elements.colorWheelCanvas;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimize for pixel reading
      
      // Set canvas dimensions to match its display size
      const rect = canvas.getBoundingClientRect();
      // Use high-resolution canvas for crisp rendering on high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
      
      // Store canvas properties
      this.wheel.canvas = canvas;
      this.wheel.ctx = ctx;
      this.wheel.centerX = rect.width / 2;
      this.wheel.centerY = rect.height / 2;
      this.wheel.radius = Math.min(rect.width, rect.height) / 2 - 2; // Small margin
      
      // Draw the color wheel
      this.drawColorWheel();
    },
    
    // Draw the color wheel
    drawColorWheel: function() {
      const { ctx, centerX, centerY, radius } = this.wheel;
      
      // Clear the canvas
      ctx.clearRect(0, 0, this.wheel.canvas.width, this.wheel.canvas.height);
      
      // Add an outer circle for better visual appearance
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw the color wheel more efficiently
      const angleStep = 1; // For smoother wheel with 1-degree steps
      for (let angle = 0; angle < 360; angle += angleStep) {
        const startAngle = (angle - angleStep/2) * Math.PI / 180;
        const endAngle = (angle + angleStep/2) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Set color based on hue
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        
        // White at center, fully saturated at edge
        gradient.addColorStop(0, 'hsla(' + angle + ', 0%, 100%, 1)');
        gradient.addColorStop(0.97, 'hsla(' + angle + ', 100%, 50%, 1)');
        gradient.addColorStop(1, 'hsla(' + angle + ', 100%, 50%, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Draw inner circle border
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.stroke();
    },
    
    // Update color wheel thumb position based on HSL
    updateColorWheel: function() {
      const { h, s, l } = this.color.hsl;
      
      // Saturation is the distance from center (0-100)
      // Hue is the angle around the wheel (0-360)
      const radians = h * Math.PI / 180;
      const distance = s / 100 * this.wheel.radius;
      
      // Calculate x,y position
      const x = this.wheel.centerX + distance * Math.cos(radians);
      const y = this.wheel.centerY - distance * Math.sin(radians); // Negative to make 0° at right side
      
      // Update thumb position
      this.elements.colorWheelThumb.style.left = x + 'px';
      this.elements.colorWheelThumb.style.top = y + 'px';
      
      // Update inner circle color (represents lightness)
      this.elements.colorWheelInner.style.backgroundColor = `hsl(${h}, ${s}%, 50%)`;
    },
    
    // Set a random color
    setRandomColor: function() {
      // Generate random RGB values
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      // Update color state from RGB
      this.updateColorFromRgb(r, g, b);
    },
    
    // Update color from RGB values
    updateColorFromRgb: function(r, g, b) {
      // Update RGB state
      this.color.rgb = { r, g, b };
      
      // Convert to other formats
      this.color.hex = this.rgbToHex(r, g, b);
      this.color.hsl = this.rgbToHsl(r, g, b);
      this.color.cmyk = this.rgbToCmyk(r, g, b);
      
      // Update UI
      this.updateColorUI();
    },
    
    // Update color from HSL values
    updateColorFromHsl: function(h, s, l) {
      // Update HSL state
      this.color.hsl = { h, s, l };
      
      // Convert to other formats
      const rgb = this.hslToRgb(h, s, l);
      this.color.rgb = rgb;
      this.color.hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      this.color.cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      // Update UI
      this.updateColorUI();
    },
    
    // Update color from HEX value
    updateColorFromHex: function(hex) {
      // Ensure hex has # prefix
      if (hex.charAt(0) !== '#') {
        hex = '#' + hex;
      }
      
      // Validate hex format
      if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
        return false;
      }
      
      // Update HEX state
      this.color.hex = hex;
      
      // Convert to other formats
      const rgb = this.hexToRgb(hex);
      this.color.rgb = rgb;
      this.color.hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      this.color.cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      // Update UI
      this.updateColorUI();
      return true;
    },
    
    // Update color from CMYK values
    updateColorFromCmyk: function(c, m, y, k) {
      // Update CMYK state
      this.color.cmyk = { c, m, y, k };
      
      // Convert to other formats
      const rgb = this.cmykToRgb(c, m, y, k);
      this.color.rgb = rgb;
      this.color.hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      this.color.hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Update UI
      this.updateColorUI();
    },
    
    // Update all UI elements with current color
    updateColorUI: function() {
      // Update RGB sliders/inputs
      this.elements.redSlider.value = this.color.rgb.r;
      this.elements.redValue.value = this.color.rgb.r;
      this.elements.greenSlider.value = this.color.rgb.g;
      this.elements.greenValue.value = this.color.rgb.g;
      this.elements.blueSlider.value = this.color.rgb.b;
      this.elements.blueValue.value = this.color.rgb.b;
      
      // Update HSL sliders/inputs
      this.elements.hueSlider.value = this.color.hsl.h;
      this.elements.hueValue.value = Math.round(this.color.hsl.h);
      this.elements.saturationSlider.value = this.color.hsl.s;
      this.elements.saturationValue.value = Math.round(this.color.hsl.s);
      this.elements.lightnessSlider.value = this.color.hsl.l;
      this.elements.lightnessValue.value = Math.round(this.color.hsl.l);
      
      // Update HEX input
      this.elements.hexValue.value = this.color.hex.substring(1); // Remove # prefix
      
      // Update CMYK sliders/inputs
      this.elements.cyanSlider.value = this.color.cmyk.c;
      this.elements.cyanValue.value = Math.round(this.color.cmyk.c);
      this.elements.magentaSlider.value = this.color.cmyk.m;
      this.elements.magentaValue.value = Math.round(this.color.cmyk.m);
      this.elements.yellowSlider.value = this.color.cmyk.y;
      this.elements.yellowValue.value = Math.round(this.color.cmyk.y);
      this.elements.blackSlider.value = this.color.cmyk.k;
      this.elements.blackValue.value = Math.round(this.color.cmyk.k);
      
      // Update color wheel
      this.updateColorWheel();
      
      // Update color preview
      this.elements.colorPreview.style.backgroundColor = this.color.hex;
      
      // Update color values display
      this.elements.rgbValue.textContent = `rgb(${this.color.rgb.r}, ${this.color.rgb.g}, ${this.color.rgb.b})`;
      this.elements.hexCode.textContent = this.color.hex;
      this.elements.hslValue.textContent = `hsl(${Math.round(this.color.hsl.h)}, ${Math.round(this.color.hsl.s)}%, ${Math.round(this.color.hsl.l)}%)`;
      this.elements.cmykValue.textContent = `cmyk(${Math.round(this.color.cmyk.c)}%, ${Math.round(this.color.cmyk.m)}%, ${Math.round(this.color.cmyk.y)}%, ${Math.round(this.color.cmyk.k)}%)`;
      
      // Update text preview
      this.elements.textOnColor.style.backgroundColor = this.color.hex;
      this.elements.colorOnText.style.color = this.color.hex;
      
      // Set text color for contrast based on luminance
      this.elements.textOnColor.style.color = this.getLuminance(this.color.rgb.r, this.color.rgb.g, this.color.rgb.b) > 0.5 ? '#000000' : '#FFFFFF';
    },
    
    // Switch between color format tabs
    switchTab: function(tabName) {
      // Update tab buttons
      this.elements.tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabName);
      });
      
      // Update tab panes
      document.querySelectorAll('.cp-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabName + 'Tab');
      });
    },
    
    // Save the current color to collections
    saveColor: function() {
      if (window.ColorPickerTool.Collections && typeof window.ColorPickerTool.Collections.addColor === 'function') {
        window.ColorPickerTool.Collections.addColor({
          id: window.ColorPickerTool.UI.generateUniqueId(),
          hex: this.color.hex,
          rgb: this.color.rgb,
          hsl: this.color.hsl,
          name: 'Untitled Color',
          date: new Date()
        });
        
        // Show success message
        window.ColorPickerTool.UI.showAlert('Color added to your collection', 'success');
      } else {
        // Collections module not loaded, store in localStorage
        const colors = JSON.parse(localStorage.getItem('cpColors') || '[]');
        colors.push({
          id: 'cp_' + Date.now(),
          hex: this.color.hex,
          rgb: this.color.rgb,
          hsl: this.color.hsl,
          name: 'Untitled Color',
          date: new Date()
        });
        localStorage.setItem('cpColors', JSON.stringify(colors));
        
        // Show success message
        window.ColorPickerTool.UI.showAlert('Color saved to storage', 'success');
      }
    },
    
    // Copy a color value to clipboard
    copyColorValue: function(valueType) {
      let value = '';
      let button = null;
      
      // Find the button that triggered this
      document.querySelectorAll('.cp-copy-btn').forEach(btn => {
        if (btn.getAttribute('data-value') === valueType) {
          button = btn;
        }
      });
      
      switch (valueType) {
        case 'rgb':
          value = `rgb(${this.color.rgb.r}, ${this.color.rgb.g}, ${this.color.rgb.b})`;
          break;
        case 'hex':
          value = this.color.hex;
          break;
        case 'hsl':
          value = `hsl(${Math.round(this.color.hsl.h)}, ${Math.round(this.color.hsl.s)}%, ${Math.round(this.color.hsl.l)}%)`;
          break;
        case 'cmyk':
          value = `cmyk(${Math.round(this.color.cmyk.c)}%, ${Math.round(this.color.cmyk.m)}%, ${Math.round(this.color.cmyk.y)}%, ${Math.round(this.color.cmyk.k)}%)`;
          break;
      }
      
      if (value) {
        // Visual feedback on button
        if (button) {
          const originalIcon = button.innerHTML;
          button.innerHTML = '<i class="fas fa-check"></i>';
          button.style.color = '#28a745';
          
          setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
          }, 1000);
        }
        
        window.ColorPickerTool.UI.copyToClipboard(value)
          .then(() => {
            window.ColorPickerTool.UI.showAlert(`Copied: ${value}`, 'success', 1500);
          })
          .catch(() => {
            window.ColorPickerTool.UI.showAlert('Failed to copy to clipboard', 'error');
          });
      }
    },
    
    // Event Handlers
    
    // Color wheel mouse events
    handleWheelMouseDown: function(e) {
      e.preventDefault();
      this.wheel.isDragging = true;
      this.updateWheelFromEvent(e);
    },
    
    handleWheelMouseMove: function(e) {
      if (!this.wheel.isDragging) return;
      e.preventDefault();
      this.updateWheelFromEvent(e);
    },
    
    handleWheelMouseUp: function() {
      this.wheel.isDragging = false;
    },
    
    // Color wheel touch events
    handleWheelTouchStart: function(e) {
      e.preventDefault();
      this.wheel.isDragging = true;
      this.updateWheelFromEvent(e.touches[0]);
    },
    
    handleWheelTouchMove: function(e) {
      if (!this.wheel.isDragging) return;
      e.preventDefault();
      this.updateWheelFromEvent(e.touches[0]);
    },
    
    handleWheelTouchEnd: function() {
      this.wheel.isDragging = false;
    },
    
    // Inner circle events (lightness)
    handleInnerMouseDown: function(e) {
      e.stopPropagation();
      
      // Create a vertical slider for lightness
      const startY = e.clientY;
      const startL = this.color.hsl.l;
      
      const handleMouseMove = (moveEvent) => {
        const deltaY = startY - moveEvent.clientY;
        const newL = Math.max(0, Math.min(100, startL + deltaY / 2));
        
        // Update color with new lightness
        const { h, s } = this.color.hsl;
        this.updateColorFromHsl(h, s, newL);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // Update color from wheel event
    updateWheelFromEvent: function(e) {
      const rect = this.wheel.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate distance from center
      const dx = x - this.wheel.centerX;
      const dy = y - this.wheel.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only update if within wheel radius
      if (distance <= this.wheel.radius) {
        // Calculate hue (angle) and saturation (distance)
        let angle = Math.atan2(-dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        
        const saturation = Math.min(100, (distance / this.wheel.radius) * 100);
        
        // Update color with new hue and saturation, keeping same lightness
        const { l } = this.color.hsl;
        this.updateColorFromHsl(angle, saturation, l);
      }
    },
    
    // Handle RGB input changes
    handleRgbInput: function(e) {
      const input = e.target;
      const value = parseInt(input.value);
      
      // Validate input
      if (isNaN(value) || value < 0 || value > 255) {
        // Reset to current value
        this.updateColorUI();
        return;
      }
      
      // Update the corresponding slider/input
      const isSlider = input.type === 'range';
      const pair = isSlider ? input.id.replace('Slider', 'Value') : input.id.replace('Value', 'Slider');
      document.getElementById(pair).value = value;
      
      // Get current RGB values
      const r = parseInt(this.elements.redValue.value);
      const g = parseInt(this.elements.greenValue.value);
      const b = parseInt(this.elements.blueValue.value);
      
      // Update color
      this.updateColorFromRgb(r, g, b);
    },
    
    // Handle HSL input changes
    handleHslInput: function(e) {
      const input = e.target;
      let value = parseInt(input.value);
      let max = input.id.includes('hue') ? 360 : 100;
      
      // Validate input
      if (isNaN(value) || value < 0 || value > max) {
        // Reset to current value
        this.updateColorUI();
        return;
      }
      
      // Update the corresponding slider/input
      const isSlider = input.type === 'range';
      const pair = isSlider ? input.id.replace('Slider', 'Value') : input.id.replace('Value', 'Slider');
      document.getElementById(pair).value = value;
      
      // Get current HSL values
      const h = parseInt(this.elements.hueValue.value);
      const s = parseInt(this.elements.saturationValue.value);
      const l = parseInt(this.elements.lightnessValue.value);
      
      // Update color
      this.updateColorFromHsl(h, s, l);
    },
    
    // Handle HEX input changes
    handleHexInput: function() {
      const hex = this.elements.hexValue.value;
      
      // Validate and update color
      if (!this.updateColorFromHex('#' + hex)) {
        // Invalid hex, reset to current value
        this.elements.hexValue.value = this.color.hex.substring(1);
        window.ColorPickerTool.UI.showAlert('Invalid HEX color code', 'error');
      }
    },
    
    // Handle CMYK input changes
    handleCmykInput: function(e) {
      const input = e.target;
      const value = parseInt(input.value);
      
      // Validate input
      if (isNaN(value) || value < 0 || value > 100) {
        // Reset to current value
        this.updateColorUI();
        return;
      }
      
      // Update the corresponding slider/input
      const isSlider = input.type === 'range';
      const pair = isSlider ? input.id.replace('Slider', 'Value') : input.id.replace('Value', 'Slider');
      document.getElementById(pair).value = value;
      
      // Get current CMYK values
      const c = parseInt(this.elements.cyanValue.value);
      const m = parseInt(this.elements.magentaValue.value);
      const y = parseInt(this.elements.yellowValue.value);
      const k = parseInt(this.elements.blackValue.value);
      
      // Update color
      this.updateColorFromCmyk(c, m, y, k);
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
    
    // RGB to CMYK
    rgbToCmyk: function(r, g, b) {
      // Convert RGB to [0,1]
      r = r / 255;
      g = g / 255;
      b = b / 255;
      
      // Get the black key (k)
      const k = 1 - Math.max(r, g, b);
      
      // If completely black, return all 0s except k=100
      if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
      }
      
      // Calculate CMY
      const c = (1 - r - k) / (1 - k);
      const m = (1 - g - k) / (1 - k);
      const y = (1 - b - k) / (1 - k);
      
      // Convert to percentages
      return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
      };
    },
    
    // CMYK to RGB
    cmykToRgb: function(c, m, y, k) {
      // Convert to [0,1]
      c = c / 100;
      m = m / 100;
      y = y / 100;
      k = k / 100;
      
      // Calculate RGB
      const r = 255 * (1 - c) * (1 - k);
      const g = 255 * (1 - m) * (1 - k);
      const b = 255 * (1 - y) * (1 - k);
      
      return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
      };
    },
    
    // Get luminance from RGB (for calculating text contrast)
    getLuminance: function(r, g, b) {
      // Convert RGB to [0,1]
      r = r / 255;
      g = g / 255;
      b = b / 255;
      
      // Transform values
      r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      // Calculate luminance
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Picker = Picker;
})();