/**
 * ColorPicker Image Module
 * Handles image upload and color extraction
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Image module to handle color extraction from images
  const Image = {
    // DOM element references
    elements: {},
    
    // Current state
    uploadedImage: null,
    extractedColors: [],
    colorCount: 6,
    sortByBrightness: true,
    eyedropperData: {
      canvas: null,
      ctx: null,
      image: null,
      selectedColor: null
    },
    
    // Initialize the image module
    init: function() {
      this.cacheElements();
      this.setupEventListeners();
    },
    
    // Cache DOM element references
    cacheElements: function() {
      this.elements.imageDropzone = document.getElementById('imageDropzone');
      this.elements.imageInput = document.getElementById('imageInput');
      this.elements.colorCount = document.getElementById('colorCount');
      this.elements.sortColorsByBrightness = document.getElementById('sortColorsByBrightness');
      this.elements.extractColorsBtn = document.getElementById('extractColorsBtn');
      this.elements.uploadedImage = document.getElementById('uploadedImage');
      this.elements.imageResult = document.querySelector('.cp-image-result');
      this.elements.extractedColorPalette = document.getElementById('extractedColorPalette');
      this.elements.saveExtractedColorsBtn = document.getElementById('saveExtractedColorsBtn');
      this.elements.exportExtractedColorsBtn = document.getElementById('exportExtractedColorsBtn');
      this.elements.eyedropperTool = document.querySelector('.cp-eyedropper-tool');
      this.elements.eyedropperCanvas = document.getElementById('eyedropperCanvas');
      this.elements.eyedropperColor = document.getElementById('eyedropperColor');
      this.elements.eyedropperValue = document.getElementById('eyedropperValue');
      this.elements.addEyedropperColorBtn = document.getElementById('addEyedropperColorBtn');
      this.elements.backLink = document.getElementById('backFromImage');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      // File input change
      this.elements.imageInput.addEventListener('change', this.handleFileSelect.bind(this));
      
      // Dropzone
      this.elements.imageDropzone.addEventListener('click', () => {
        this.elements.imageInput.click();
      });
      
      this.elements.imageDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.elements.imageDropzone.classList.add('active');
      });
      
      this.elements.imageDropzone.addEventListener('dragleave', () => {
        this.elements.imageDropzone.classList.remove('active');
      });
      
      this.elements.imageDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.elements.imageDropzone.classList.remove('active');
        
        if (e.dataTransfer.files.length > 0) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });
      
      // Extract colors button
      this.elements.extractColorsBtn.addEventListener('click', this.extractColors.bind(this));
      
      // Color count select
      this.elements.colorCount.addEventListener('change', () => {
        this.colorCount = parseInt(this.elements.colorCount.value);
        if (this.uploadedImage) {
          this.extractColors();
        }
      });
      
      // Sort by brightness checkbox
      this.elements.sortColorsByBrightness.addEventListener('change', () => {
        this.sortByBrightness = this.elements.sortColorsByBrightness.checked;
        if (this.extractedColors.length > 0) {
          this.displayExtractedColors();
        }
      });
      
      // Save colors button
      this.elements.saveExtractedColorsBtn.addEventListener('click', this.saveExtractedColors.bind(this));
      
      // Export colors button
      this.elements.exportExtractedColorsBtn.addEventListener('click', this.exportExtractedColors.bind(this));
      
      // Eyedropper canvas click
      if (this.elements.eyedropperCanvas) {
        this.elements.eyedropperCanvas.addEventListener('click', this.handleEyedropperClick.bind(this));
        this.elements.eyedropperCanvas.addEventListener('mousemove', this.handleEyedropperMove.bind(this));
      }
      
      // Add eyedropper color button
      if (this.elements.addEyedropperColorBtn) {
        this.elements.addEyedropperColorBtn.addEventListener('click', this.addEyedropperColor.bind(this));
      }
      
      // Back link
      this.elements.backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetImageUpload();
      });
    },
    
    // Handle file selection from input
    handleFileSelect: function(e) {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    },
    
    // Process the selected file
    handleFile: function(file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        window.ColorPickerTool.UI.showAlert('Please select an image file', 'error');
        return;
      }
      
      // Create file reader
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Store uploaded image data
        this.uploadedImage = e.target.result;
        
        // Enable extract button
        this.elements.extractColorsBtn.disabled = false;
        
        // Update dropzone to show selected file
        this.elements.imageDropzone.classList.add('file-selected');
        this.elements.imageDropzone.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <p>Image selected: ${file.name}</p>
          <small>Click "Extract Colors" to analyze the image</small>
        `;
        
        // Auto extract colors after a short delay for better UX
        setTimeout(() => {
          this.extractColors();
        }, 500);
      };
      
      reader.readAsDataURL(file);
    },
    
    // Extract colors from the uploaded image
    extractColors: function() {
      if (!this.uploadedImage) {
        window.ColorPickerTool.UI.showAlert('Please upload an image first', 'warning');
        return;
      }
      
      // Show loading state
      this.elements.extractColorsBtn.disabled = true;
      this.elements.extractColorsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      
      // Create a new image element
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        // Show image result section
        this.elements.imageResult.style.display = 'grid';
        this.elements.uploadedImage.src = this.uploadedImage;
        
        // Extract colors using ColorThief library
        const colorThief = new ColorThief();
        let palette;
        
        try {
          // Make sure image is loaded
          if (!img.complete) {
            img.addEventListener('load', () => {
              try {
                palette = colorThief.getPalette(img, this.colorCount);
                this.processExtractedColors(palette);
              } catch (e) {
                window.ColorPickerTool.UI.showAlert('Error processing image. Try a different one.', 'error');
                this.resetExtractButton();
              }
            });
            return;
          }
          
          palette = colorThief.getPalette(img, this.colorCount);
          this.processExtractedColors(palette);
        } catch (error) {
          window.ColorPickerTool.UI.showAlert('Error extracting colors. Try a different image.', 'error');
          this.resetExtractButton();
        }
      };
      
      img.onerror = () => {
        window.ColorPickerTool.UI.showAlert('Error loading image', 'error');
        this.resetExtractButton();
      };
      
      img.src = this.uploadedImage;
    },
    
    // Reset extract button state
    resetExtractButton: function() {
      if (this.elements.extractColorsBtn) {
        this.elements.extractColorsBtn.disabled = false;
        this.elements.extractColorsBtn.innerHTML = '<i class="fas fa-magic"></i> Extract Colors';
      }
    },
    
    // Process the extracted colors
    processExtractedColors: function(palette) {
      if (!palette || !palette.length) {
        window.ColorPickerTool.UI.showAlert('Could not extract colors from this image', 'error');
        this.resetExtractButton();
        return;
      }
      
      // Convert RGB arrays to hex
      this.extractedColors = palette.map(rgb => this.rgbToHex(rgb[0], rgb[1], rgb[2]));
      
      // Display the extracted colors
      this.displayExtractedColors();
      
      // Reset button state
      this.resetExtractButton();
      
      // Setup eyedropper tool with a short delay to ensure image is loaded
      setTimeout(() => {
        const uploadedImg = document.getElementById('uploadedImage');
        if (uploadedImg && uploadedImg.complete) {
          this.setupEyedropper(uploadedImg);
        } else if (uploadedImg) {
          // Add load event listener if image is still loading
          uploadedImg.onload = () => this.setupEyedropper(uploadedImg);
        }
      }, 200);
    },
    
    // Display the extracted colors
    displayExtractedColors: function() {
      // Clear previous colors
      this.elements.extractedColorPalette.innerHTML = '';
      
      // Sort colors if needed
      let colors = [...this.extractedColors];
      
      if (this.sortByBrightness) {
        colors.sort((a, b) => {
          const luminanceA = this.getLuminance(a);
          const luminanceB = this.getLuminance(b);
          return luminanceB - luminanceA; // Sort from lightest to darkest
        });
      }
      
      // Add each color to the palette
      colors.forEach(color => {
        const colorElement = document.createElement('div');
        colorElement.className = 'cp-color-palette-item';
        colorElement.style.backgroundColor = color;
        colorElement.setAttribute('data-color', color);
        
        // Add click event to copy color
        colorElement.addEventListener('click', () => {
          this.copyColorToClipboard(color);
        });
        
        this.elements.extractedColorPalette.appendChild(colorElement);
      });
    },
    
    // Setup eyedropper tool
    setupEyedropper: function(img) {
      if (!img || !this.elements.eyedropperTool) return;
      
      // If image is not fully loaded yet, wait for it
      if (!img.complete) {
        img.onload = () => this.setupEyedropper(img);
        return;
      }
      
      try {
        // Show eyedropper tool
        this.elements.eyedropperTool.style.display = 'block';
        
        const canvas = this.elements.eyedropperCanvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Store image dimensions - fall back if naturalWidth/Height not available
        const imgWidth = img.naturalWidth || img.width || 300;
        const imgHeight = img.naturalHeight || img.height || 200;
        
        if (imgWidth === 0 || imgHeight === 0) {
          console.error('Image has zero width or height');
          window.ColorPickerTool.UI.showAlert('Could not process image for eyedropper', 'warning');
          return;
        }
        
        // Set canvas size maintaining aspect ratio
        const maxWidth = 600;
        let width = imgWidth;
        let height = imgHeight;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.floor(height * ratio);
        }
        
        // Set dimensions with pixel ratio for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Store canvas data
        this.eyedropperData.canvas = canvas;
        this.eyedropperData.ctx = ctx;
        this.eyedropperData.image = img;
        
        // Inform user they can use the eyedropper
        window.ColorPickerTool.UI.showAlert('Click anywhere on the image to pick specific colors', 'info', 3000);
      } catch (error) {
        console.error('Error setting up eyedropper:', error);
        window.ColorPickerTool.UI.showAlert('Could not initialize eyedropper tool', 'error');
      }
    },
    
    // Handle eyedropper click
    handleEyedropperClick: function(e) {
      const color = this.getColorFromCanvas(e);
      
      if (color) {
        this.eyedropperData.selectedColor = color;
        this.elements.eyedropperColor.style.backgroundColor = color;
        this.elements.eyedropperValue.textContent = color;
      }
    },
    
    // Handle eyedropper mousemove
    handleEyedropperMove: function(e) {
      const color = this.getColorFromCanvas(e);
      
      if (color) {
        this.elements.eyedropperColor.style.backgroundColor = color;
        // No need to update text here as getColorFromCanvas now handles this
      }
    },
    
    // Get color from canvas at event position
    getColorFromCanvas: function(e) {
      const canvas = this.eyedropperData.canvas;
      const ctx = this.eyedropperData.ctx;
      
      if (!canvas || !ctx) return null;
      
      try {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Calculate the correct pixel position accounting for high-DPI displays
        const x = Math.floor((e.clientX - rect.left) * dpr);
        const y = Math.floor((e.clientY - rect.top) * dpr);
        
        // Make sure we're within canvas bounds
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
          return null;
        }
        
        // Get pixel data
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        
        // Update the eyedropper info with coordinates for better UX
        const displayX = Math.floor(x / dpr);
        const displayY = Math.floor(y / dpr);
        
        // Show position information alongside the hex value if element exists
        const valueDisplay = this.elements.eyedropperValue;
        if (valueDisplay) {
          const hex = this.rgbToHex(r, g, b);
          valueDisplay.innerHTML = `${hex} <small style="opacity: 0.7;">(${displayX},${displayY})</small>`;
        }
        
        // Convert to hex
        return this.rgbToHex(r, g, b);
      } catch (e) {
        console.error('Error getting pixel data:', e);
        return null;
      }
    },
    
    // Add eyedropper color to palette
    addEyedropperColor: function() {
      if (!this.eyedropperData.selectedColor) {
        window.ColorPickerTool.UI.showAlert('Please select a color first', 'warning');
        return;
      }
      
      // Add color to extracted colors
      if (!this.extractedColors.includes(this.eyedropperData.selectedColor)) {
        this.extractedColors.push(this.eyedropperData.selectedColor);
        this.displayExtractedColors();
        window.ColorPickerTool.UI.showAlert('Color added to palette', 'success');
      } else {
        window.ColorPickerTool.UI.showAlert('Color already in palette', 'info');
      }
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
    
    // Save extracted colors to collections
    saveExtractedColors: function() {
      if (this.extractedColors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No colors to save', 'warning');
        return;
      }
      
      // Create palette object
      const palette = {
        id: window.ColorPickerTool.UI.generateUniqueId(),
        name: 'Image Palette',
        colors: this.extractedColors,
        type: 'image',
        date: new Date()
      };
      
      // Save to collections or localStorage
      if (window.ColorPickerTool.Collections && typeof window.ColorPickerTool.Collections.addPalette === 'function') {
        window.ColorPickerTool.Collections.addPalette(palette);
        window.ColorPickerTool.UI.showAlert('Colors added to your collections', 'success');
      } else {
        // Collections module not loaded, store in localStorage
        const palettes = JSON.parse(localStorage.getItem('cpPalettes') || '[]');
        palettes.push(palette);
        localStorage.setItem('cpPalettes', JSON.stringify(palettes));
        window.ColorPickerTool.UI.showAlert('Colors saved to storage', 'success');
      }
    },
    
    // Export extracted colors
    exportExtractedColors: function() {
      if (this.extractedColors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No colors to export', 'warning');
        return;
      }
      
      // Create export modal
      const modal = document.createElement('div');
      modal.className = 'cp-modal';
      
      modal.innerHTML = `
        <div class="cp-modal-content">
          <span class="cp-close-modal">&times;</span>
          <div class="cp-modal-header">
            <h3>Export Image Colors</h3>
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
      this.updateExportPreview(this.extractedColors, formatSelect.value, exportPreview);
      
      // Format change event
      formatSelect.addEventListener('change', () => {
        this.updateExportPreview(this.extractedColors, formatSelect.value, exportPreview);
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
        const filename = `image_colors${extension}`;
        
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
              name: 'Image Colors',
              source: 'image',
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
    
    // Reset image upload
    resetImageUpload: function() {
      this.uploadedImage = null;
      this.extractedColors = [];
      this.elements.extractColorsBtn.disabled = true;
      
      // Reset dropzone
      this.elements.imageDropzone.classList.remove('file-selected');
      this.elements.imageDropzone.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Drag & drop an image or click to browse</p>
        <small>Supports JPG, PNG, GIF files</small>
      `;
      
      // Hide result sections
      this.elements.imageResult.style.display = 'none';
      this.elements.eyedropperTool.style.display = 'none';
      
      // Clear file input
      this.elements.imageInput.value = '';
    },
    
    // Utility Functions
    
    // RGB to HEX
    rgbToHex: function(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },
    
    // Get luminance from hex color
    getLuminance: function(hexColor) {
      // Remove # if present
      hexColor = hexColor.replace('#', '');
      
      // Convert to RGB
      const r = parseInt(hexColor.substr(0, 2), 16) / 255;
      const g = parseInt(hexColor.substr(2, 2), 16) / 255;
      const b = parseInt(hexColor.substr(4, 2), 16) / 255;
      
      // Calculate luminance
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Image = Image;
})();