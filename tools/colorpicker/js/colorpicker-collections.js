/**
 * ColorPicker Collections Module
 * Handles color and palette storage and management
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Collections module to handle color and palette storage
  const Collections = {
    // DOM element references
    elements: {},
    
    // Current state
    activeCollection: 'favorites',
    viewMode: 'grid',
    
    // Storage data
    colorData: {
      favorites: [],
      palettes: [],
      custom: []
    },
    
    // Initialize the collections module
    init: function() {
      this.cacheElements();
      this.loadStoredData();
      this.setupEventListeners();
      this.renderCollections();
    },
    
    // Cache DOM element references
    cacheElements: function() {
      // Controls
      this.elements.collectionsSearch = document.getElementById('collectionsSearch');
      this.elements.viewButtons = document.querySelectorAll('.cp-view-btn');
      this.elements.createCollectionBtn = document.getElementById('createCollectionBtn');
      
      // Tabs
      this.elements.collectionTabs = document.querySelectorAll('.cp-collection-tab');
      
      // Display
      this.elements.collectionsDisplay = document.getElementById('collectionsDisplay');
      
      // Export buttons
      this.elements.exportCssBtn = document.getElementById('exportCssBtn');
      this.elements.exportSassBtn = document.getElementById('exportSassBtn');
      this.elements.exportJsonBtn = document.getElementById('exportJsonBtn');
      this.elements.exportTailwindBtn = document.getElementById('exportTailwindBtn');
      this.elements.exportImageBtn = document.getElementById('exportImageBtn');
      
      // Modals
      this.elements.collectionModal = document.getElementById('collectionModal');
      this.elements.newCollectionModal = document.getElementById('newCollectionModal');
      
      // Back link
      this.elements.backLink = document.getElementById('backFromCollections');
    },
    
    // Load stored data from localStorage
    loadStoredData: function() {
      // Load favorites
      const favorites = JSON.parse(localStorage.getItem('cpColors') || '[]');
      this.colorData.favorites = favorites;
      
      // Load palettes
      const palettes = JSON.parse(localStorage.getItem('cpPalettes') || '[]');
      this.colorData.palettes = palettes;
      
      // Load custom collections
      const custom = JSON.parse(localStorage.getItem('cpCustomCollections') || '[]');
      this.colorData.custom = custom;
    },
    
    // Save data to localStorage
    saveData: function() {
      localStorage.setItem('cpColors', JSON.stringify(this.colorData.favorites));
      localStorage.setItem('cpPalettes', JSON.stringify(this.colorData.palettes));
      localStorage.setItem('cpCustomCollections', JSON.stringify(this.colorData.custom));
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      // Search box
      this.elements.collectionsSearch.addEventListener('input', this.handleSearch.bind(this));
      
      // View buttons
      this.elements.viewButtons.forEach(button => {
        button.addEventListener('click', () => {
          const view = button.getAttribute('data-view');
          this.switchView(view);
        });
      });
      
      // Create collection button
      this.elements.createCollectionBtn.addEventListener('click', this.showNewCollectionModal.bind(this));
      
      // Collection tabs
      this.elements.collectionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const collection = tab.getAttribute('data-collection');
          this.switchCollection(collection);
        });
      });
      
      // Export buttons
      this.elements.exportCssBtn.addEventListener('click', () => this.exportCollection('css'));
      this.elements.exportSassBtn.addEventListener('click', () => this.exportCollection('sass'));
      this.elements.exportJsonBtn.addEventListener('click', () => this.exportCollection('json'));
      this.elements.exportTailwindBtn.addEventListener('click', () => this.exportCollection('tailwind'));
      this.elements.exportImageBtn.addEventListener('click', () => this.exportCollection('image'));
      
      // New collection modal elements
      if (this.elements.newCollectionModal) {
        const cancelBtn = document.getElementById('cancelNewCollectionBtn');
        const createBtn = document.getElementById('createNewCollectionBtn');
        const closeBtn = this.elements.newCollectionModal.querySelector('.cp-close-modal');
        
        if (cancelBtn) cancelBtn.addEventListener('click', this.hideNewCollectionModal.bind(this));
        if (closeBtn) closeBtn.addEventListener('click', this.hideNewCollectionModal.bind(this));
        if (createBtn) createBtn.addEventListener('click', this.createNewCollection.bind(this));
      }
      
      // Back link
      this.elements.backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadStoredData();
        this.renderCollections();
      });
    },
    
    // Handle search input
    handleSearch: function() {
      const searchTerm = this.elements.collectionsSearch.value.toLowerCase();
      this.renderCollections(searchTerm);
    },
    
    // Switch between grid and list view
    switchView: function(view) {
      this.viewMode = view;
      
      // Update active button
      this.elements.viewButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-view') === view);
      });
      
      // Update display
      this.elements.collectionsDisplay.classList.toggle('list-view', view === 'list');
      
      // Re-render collections
      this.renderCollections();
    },
    
    // Switch between collections
    switchCollection: function(collection) {
      this.activeCollection = collection;
      
      // Update active tab
      this.elements.collectionTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-collection') === collection);
      });
      
      // Re-render collections
      this.renderCollections();
    },
    
    // Render collections based on active collection and search term
    renderCollections: function(searchTerm = '') {
      // Clear display
      this.elements.collectionsDisplay.innerHTML = '';
      
      // Get active collection data
      let data = this.colorData[this.activeCollection];
      
      // Filter by search term if provided
      if (searchTerm) {
        data = this.filterBySearchTerm(data, searchTerm);
      }
      
      // Check if empty
      if (data.length === 0) {
        this.renderEmptyState();
        return;
      }
      
      // Render based on collection type
      switch (this.activeCollection) {
        case 'favorites':
          this.renderFavorites(data);
          break;
        case 'palettes':
          this.renderPalettes(data);
          break;
        case 'custom':
          this.renderCustomCollections(data);
          break;
      }
    },
    
    // Filter data by search term
    filterBySearchTerm: function(data, searchTerm) {
      return data.filter(item => {
        // For individual colors
        if (item.hex) {
          return item.hex.toLowerCase().includes(searchTerm) ||
                (item.name && item.name.toLowerCase().includes(searchTerm));
        }
        
        // For palettes and collections
        if (item.name && item.colors) {
          return item.name.toLowerCase().includes(searchTerm) ||
                item.colors.some(color => color.toLowerCase().includes(searchTerm));
        }
        
        return false;
      });
    },
    
    // Render empty state
    renderEmptyState: function() {
      const emptyElement = document.createElement('div');
      emptyElement.className = 'cp-empty-collection';
      
      let message = '';
      let hint = '';
      let actionButton = '';
      
      switch (this.activeCollection) {
        case 'favorites':
          message = 'No favorite colors found';
          hint = 'Save colors from the Color Picker tab using the "Add to Collection" button';
          actionButton = `
            <button class="cp-primary-btn" style="margin-top: 15px;" onclick="window.ColorPickerTool.Main.switchTab('picker')">
              <i class="fas fa-eye-dropper"></i> Go to Color Picker
            </button>
          `;
          break;
        case 'palettes':
          message = 'No saved palettes found';
          hint = 'Generate and save palettes from the Palettes tab';
          actionButton = `
            <button class="cp-primary-btn" style="margin-top: 15px;" onclick="window.ColorPickerTool.Main.switchTab('palettes')">
              <i class="fas fa-palette"></i> Go to Palettes
            </button>
          `;
          break;
        case 'custom':
          message = 'No custom collections found';
          hint = 'Create custom collections to organize your colors';
          actionButton = `
            <button class="cp-primary-btn" style="margin-top: 15px;" id="emptyStateCreateCollection">
              <i class="fas fa-plus"></i> Create Collection
            </button>
          `;
          break;
      }
      
      emptyElement.innerHTML = `
        <i class="fas fa-palette"></i>
        <p>${message}</p>
        <p class="cp-empty-hint">${hint}</p>
        ${actionButton}
      `;
      
      this.elements.collectionsDisplay.appendChild(emptyElement);
      
      // Add event listener for create collection button if present
      const createBtn = document.getElementById('emptyStateCreateCollection');
      if (createBtn) {
        createBtn.addEventListener('click', this.showNewCollectionModal.bind(this));
      }
    },
    
    // Render favorite colors
    renderFavorites: function(colors) {
      colors.forEach(color => {
        const cardElement = document.createElement('div');
        cardElement.className = 'cp-collection-card';
        cardElement.setAttribute('data-id', color.id);
        
        cardElement.innerHTML = `
          <div class="cp-collection-colors">
            <div class="cp-collection-color" style="background-color: ${color.hex};"></div>
          </div>
          <div class="cp-collection-info">
            <div class="cp-collection-title">
              ${color.name || 'Untitled Color'}
              <span class="cp-collection-count">1</span>
            </div>
            <div class="cp-collection-date">
              ${window.ColorPickerTool.UI.formatDate(color.date)}
            </div>
          </div>
        `;
        
        // Add click event to show color details
        cardElement.addEventListener('click', () => {
          this.showColorDetails(color);
        });
        
        this.elements.collectionsDisplay.appendChild(cardElement);
      });
    },
    
    // Render color palettes
    renderPalettes: function(palettes) {
      palettes.forEach(palette => {
        const cardElement = document.createElement('div');
        cardElement.className = 'cp-collection-card';
        cardElement.setAttribute('data-id', palette.id);
        
        // Create color stripes
        let colorStripes = '';
        palette.colors.forEach(color => {
          colorStripes += `<div class="cp-collection-color" style="background-color: ${color};"></div>`;
        });
        
        cardElement.innerHTML = `
          <div class="cp-collection-colors">
            ${colorStripes}
          </div>
          <div class="cp-collection-info">
            <div class="cp-collection-title">
              ${palette.name || 'Untitled Palette'}
              <span class="cp-collection-count">${palette.colors.length}</span>
            </div>
            <div class="cp-collection-date">
              ${window.ColorPickerTool.UI.formatDate(palette.date)}
            </div>
          </div>
        `;
        
        // Add click event to show palette details
        cardElement.addEventListener('click', () => {
          this.showPaletteDetails(palette);
        });
        
        this.elements.collectionsDisplay.appendChild(cardElement);
      });
    },
    
    // Render custom collections
    renderCustomCollections: function(collections) {
      collections.forEach(collection => {
        const cardElement = document.createElement('div');
        cardElement.className = 'cp-collection-card';
        cardElement.setAttribute('data-id', collection.id);
        
        // Create color stripes
        let colorStripes = '';
        collection.colors.forEach(color => {
          colorStripes += `<div class="cp-collection-color" style="background-color: ${color};"></div>`;
        });
        
        cardElement.innerHTML = `
          <div class="cp-collection-colors">
            ${colorStripes}
          </div>
          <div class="cp-collection-info">
            <div class="cp-collection-title">
              ${collection.name || 'Untitled Collection'}
              <span class="cp-collection-count">${collection.colors.length}</span>
            </div>
            <div class="cp-collection-date">
              ${window.ColorPickerTool.UI.formatDate(collection.date)}
            </div>
          </div>
        `;
        
        // Add click event to show collection details
        cardElement.addEventListener('click', () => {
          this.showCollectionDetails(collection);
        });
        
        this.elements.collectionsDisplay.appendChild(cardElement);
      });
    },
    
    // Show color details modal
    showColorDetails: function(color) {
      this.createModal({
        title: color.name || 'Color Details',
        date: color.date,
        colors: [color.hex],
        id: color.id,
        type: 'color',
        data: color
      });
    },
    
    // Show palette details modal
    showPaletteDetails: function(palette) {
      this.createModal({
        title: palette.name || 'Palette Details',
        date: palette.date,
        colors: palette.colors,
        id: palette.id,
        type: 'palette',
        data: palette
      });
    },
    
    // Show collection details modal
    showCollectionDetails: function(collection) {
      this.createModal({
        title: collection.name || 'Collection Details',
        date: collection.date,
        colors: collection.colors,
        id: collection.id,
        type: 'collection',
        data: collection
      });
    },
    
    // Create and show a modal with the given details
    createModal: function(details) {
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'cp-modal';
      
      // Create color stripes
      let colorStripes = '';
      details.colors.forEach(color => {
        colorStripes += `<div class="cp-collection-color" style="background-color: ${color};" data-color="${color}"></div>`;
      });
      
      modal.innerHTML = `
        <div class="cp-modal-content">
          <span class="cp-close-modal">&times;</span>
          <div class="cp-modal-header">
            <h3>${details.title}</h3>
            <span class="cp-date-created">Created on: ${window.ColorPickerTool.UI.formatDate(details.date)}</span>
          </div>
          <div class="cp-modal-body">
            <div class="cp-modal-colors">
              ${colorStripes}
            </div>
            <div class="cp-modal-details">
              <div class="cp-field-group">
                <label for="collectionNameInput">Name</label>
                <input type="text" id="collectionNameInput" value="${details.title}" placeholder="Enter name">
              </div>
              <div class="cp-field-group">
                <label for="collectionDescription">Description</label>
                <textarea id="collectionDescription" placeholder="Add a description">${details.data.description || ''}</textarea>
              </div>
            </div>
          </div>
          <div class="cp-modal-footer">
            <button id="deleteCollectionBtn" class="cp-danger-btn">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button id="exportCollectionBtn" class="cp-secondary-btn">
              <i class="fas fa-file-export"></i> Export
            </button>
            <button id="saveCollectionBtn" class="cp-primary-btn">
              <i class="fas fa-save"></i> Save Changes
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
      
      // Get buttons
      const closeButton = modal.querySelector('.cp-close-modal');
      const deleteButton = modal.querySelector('#deleteCollectionBtn');
      const exportButton = modal.querySelector('#exportCollectionBtn');
      const saveButton = modal.querySelector('#saveCollectionBtn');
      
      // Set up event listeners
      closeButton.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
      
      deleteButton.addEventListener('click', () => {
        this.deleteItem(details.type, details.id);
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
      
      exportButton.addEventListener('click', () => {
        this.exportItem(details.type, details.colors);
      });
      
      saveButton.addEventListener('click', () => {
        const nameInput = modal.querySelector('#collectionNameInput');
        const descriptionInput = modal.querySelector('#collectionDescription');
        
        this.updateItem(
          details.type,
          details.id,
          nameInput.value,
          descriptionInput.value
        );
        
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
      
      // Add click events to colors
      const colorElements = modal.querySelectorAll('.cp-collection-color');
      colorElements.forEach(element => {
        element.addEventListener('click', () => {
          const color = element.getAttribute('data-color');
          this.copyColorToClipboard(color);
        });
      });
    },
    
    // Show new collection modal
    showNewCollectionModal: function() {
      if (!this.elements.newCollectionModal) return;
      
      // Reset form
      const nameInput = document.getElementById('newCollectionName');
      const descriptionInput = document.getElementById('newCollectionDescription');
      
      if (nameInput) nameInput.value = '';
      if (descriptionInput) descriptionInput.value = '';
      
      // Show modal
      setTimeout(() => {
        this.elements.newCollectionModal.classList.add('active');
      }, 10);
    },
    
    // Hide new collection modal
    hideNewCollectionModal: function() {
      if (!this.elements.newCollectionModal) return;
      
      this.elements.newCollectionModal.classList.remove('active');
    },
    
    // Create a new collection
    createNewCollection: function() {
      const nameInput = document.getElementById('newCollectionName');
      const descriptionInput = document.getElementById('newCollectionDescription');
      
      if (!nameInput || !nameInput.value.trim()) {
        window.ColorPickerTool.UI.showAlert('Please enter a collection name', 'error');
        return;
      }
      
      // Create new collection
      const newCollection = {
        id: window.ColorPickerTool.UI.generateUniqueId(),
        name: nameInput.value.trim(),
        description: descriptionInput ? descriptionInput.value.trim() : '',
        colors: [],
        date: new Date()
      };
      
      // Add to collections
      this.colorData.custom.push(newCollection);
      
      // Save to localStorage
      this.saveData();
      
      // Switch to custom collections
      this.switchCollection('custom');
      
      // Hide modal
      this.hideNewCollectionModal();
      
      // Show success message
      window.ColorPickerTool.UI.showAlert('Collection created successfully', 'success');
    },
    
    // Delete an item
    deleteItem: function(type, id) {
      // Determine which array to update
      let array;
      switch (type) {
        case 'color':
          array = this.colorData.favorites;
          break;
        case 'palette':
          array = this.colorData.palettes;
          break;
        case 'collection':
          array = this.colorData.custom;
          break;
      }
      
      // Find and remove the item
      const index = array.findIndex(item => item.id === id);
      if (index !== -1) {
        array.splice(index, 1);
        
        // Save to localStorage
        this.saveData();
        
        // Re-render collections
        this.renderCollections();
        
        // Show success message
        window.ColorPickerTool.UI.showAlert('Item deleted successfully', 'success');
      }
    },
    
    // Update an item
    updateItem: function(type, id, name, description) {
      // Determine which array to update
      let array;
      switch (type) {
        case 'color':
          array = this.colorData.favorites;
          break;
        case 'palette':
          array = this.colorData.palettes;
          break;
        case 'collection':
          array = this.colorData.custom;
          break;
      }
      
      // Find and update the item
      const item = array.find(item => item.id === id);
      if (item) {
        item.name = name.trim();
        item.description = description.trim();
        
        // Save to localStorage
        this.saveData();
        
        // Re-render collections
        this.renderCollections();
        
        // Show success message
        window.ColorPickerTool.UI.showAlert('Changes saved successfully', 'success');
      }
    },
    
    // Export a collection
    exportCollection: function(format) {
      // Get all colors from active collection
      let colors = [];
      
      switch (this.activeCollection) {
        case 'favorites':
          colors = this.colorData.favorites.map(color => color.hex);
          break;
        case 'palettes':
          // Concatenate all palette colors
          this.colorData.palettes.forEach(palette => {
            colors = colors.concat(palette.colors);
          });
          break;
        case 'custom':
          // Concatenate all custom collection colors
          this.colorData.custom.forEach(collection => {
            colors = colors.concat(collection.colors);
          });
          break;
      }
      
      // Remove duplicates
      colors = [...new Set(colors)];
      
      if (colors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No colors to export', 'warning');
        return;
      }
      
      this.exportItem(this.activeCollection, colors, format);
    },
    
    // Export an item in specified format
    exportItem: function(type, colors, format = 'css') {
      if (!colors || colors.length === 0) {
        window.ColorPickerTool.UI.showAlert('No colors to export', 'warning');
        return;
      }
      
      let content = '';
      let filename = `colors_${type}`;
      let mimeType = 'text/plain';
      
      switch (format) {
        case 'css':
          content = ':root {\n';
          colors.forEach((color, index) => {
            content += `  --color-${index + 1}: ${color};\n`;
          });
          content += '}';
          filename += '.css';
          mimeType = 'text/css';
          break;
        
        case 'sass':
          colors.forEach((color, index) => {
            content += `$color-${index + 1}: ${color};\n`;
          });
          filename += '.scss';
          break;
        
        case 'json':
          const jsonObj = {
            collection: {
              type: type,
              colors: colors
            }
          };
          content = JSON.stringify(jsonObj, null, 2);
          filename += '.json';
          mimeType = 'application/json';
          break;
        
        case 'tailwind':
          content = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
          colors.forEach((color, index) => {
            content += `        color${index + 1}: '${color}',\n`;
          });
          content += '      }\n    }\n  }\n}';
          filename += '.js';
          break;
        
        case 'image':
          // Create a canvas to generate an image
          this.generatePaletteImage(colors, filename);
          return;
        
        default:
          // Plain text
          colors.forEach(color => {
            content += `${color}\n`;
          });
          break;
      }
      
      // Create a blob and download
      const blob = new Blob([content], { type: mimeType });
      window.ColorPickerTool.UI.downloadBlob(blob, filename);
    },
    
    // Generate a palette image
    generatePaletteImage: function(colors, filename) {
      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      const swatchSize = 60;
      const padding = 10;
      const maxColorsPerRow = 5;
      
      const numRows = Math.ceil(colors.length / maxColorsPerRow);
      const numCols = Math.min(colors.length, maxColorsPerRow);
      
      canvas.width = numCols * swatchSize + (numCols + 1) * padding;
      canvas.height = numRows * swatchSize + (numRows + 1) * padding;
      
      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw color swatches
      colors.forEach((color, index) => {
        const row = Math.floor(index / maxColorsPerRow);
        const col = index % maxColorsPerRow;
        
        const x = padding + col * (swatchSize + padding);
        const y = padding + row * (swatchSize + padding);
        
        // Draw color swatch
        ctx.fillStyle = color;
        ctx.fillRect(x, y, swatchSize, swatchSize);
        
        // Draw border
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, swatchSize, swatchSize);
        
        // Draw color code
        ctx.fillStyle = this.getContrastColor(color);
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(color, x + swatchSize / 2, y + swatchSize / 2);
      });
      
      // Convert to PNG and download
      canvas.toBlob(blob => {
        window.ColorPickerTool.UI.downloadBlob(blob, 'color_palette.png');
      });
    },
    
    // Get contrasting text color (black or white)
    getContrastColor: function(hexColor) {
      // Convert hex to RGB
      hexColor = hexColor.replace('#', '');
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      
      // Calculate perceived brightness (YIQ formula)
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      return (yiq >= 128) ? '#000000' : '#FFFFFF';
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
    
    // Add a color to favorites
    addColor: function(color) {
      this.colorData.favorites.push(color);
      this.saveData();
    },
    
    // Add a palette to palettes
    addPalette: function(palette) {
      this.colorData.palettes.push(palette);
      this.saveData();
    },
    
    // Add a color to a custom collection
    addColorToCollection: function(collectionId, color) {
      const collection = this.colorData.custom.find(c => c.id === collectionId);
      if (collection) {
        collection.colors.push(color);
        this.saveData();
        return true;
      }
      return false;
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Collections = Collections;
})();