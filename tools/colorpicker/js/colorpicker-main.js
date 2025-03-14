/**
 * ColorPicker Main Module
 * Initializes the color picker tool and handles tab switching
 */
(function() {
  'use strict';

  // Create a global namespace for the color picker tool
  window.ColorPickerTool = window.ColorPickerTool || {};
  
  // Main module to handle initialization and tab switching
  const Main = {
    // DOM element references
    elements: {
      toolContent: null,
      tabItems: null,
      tabDescriptions: null
    },
    
    // Current active tab
    activeTab: 'picker',
    
    // Templates for tab content
    templates: {
      picker: null,
      palettes: null,
      image: null,
      accessibility: null,
      collections: null
    },
    
    // Initialize the color picker tool
    init: function() {
      this.cacheElements();
      this.setupEventListeners();
      this.loadTemplates();
      // Load the picker tab by default on first load
      this.switchTab('picker');
    },
    
    // Cache DOM element references
    cacheElements: function() {
      this.elements.toolContent = document.getElementById('cpToolContent');
      this.elements.tabItems = document.querySelectorAll('.cp-tab-item');
      this.elements.tabDescriptions = document.querySelectorAll('.cp-tab-description');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
      // Tab switching
      this.elements.tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.getAttribute('id').replace('Tab', '');
          this.switchTab(tabId);
        });
      });
      
      // Handle URL hash changes for direct linking
      window.addEventListener('hashchange', () => {
        this.handleUrlHash();
      });
      
      // Check URL hash on page load
      this.handleUrlHash();
    },
    
    // Load tab content templates
    loadTemplates: function() {
      this.templates.picker = document.getElementById('pickerTemplate');
      this.templates.palettes = document.getElementById('palettesTemplate');
      this.templates.image = document.getElementById('imageTemplate');
      this.templates.accessibility = document.getElementById('accessibilityTemplate');
      this.templates.collections = document.getElementById('collectionsTemplate');
    },
    
    // Handle URL hash for direct linking to tabs
    handleUrlHash: function() {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Map hash to tab ID
        const tabMap = {
          'picker': 'picker',
          'palettes': 'palettes',
          'image': 'image',
          'accessibility': 'accessibility',
          'collections': 'collections'
        };
        
        const tabId = tabMap[hash];
        if (tabId) {
          this.switchTab(tabId);
        } else {
          // Default to picker tab if hash doesn't match
          this.switchTab('picker');
        }
      } else {
        // Default to picker tab if no hash
        this.switchTab('picker');
      }
    },
    
    // Switch to the specified tab
    switchTab: function(tabId) {
      if (this.activeTab === tabId) return;
      
      // Update active tab
      this.activeTab = tabId;
      
      // Update tab UI
      this.elements.tabItems.forEach(tab => {
        const id = tab.getAttribute('id').replace('Tab', '');
        tab.classList.toggle('active', id === tabId);
      });
      
      // Update tab descriptions
      this.elements.tabDescriptions.forEach(desc => {
        const id = desc.getAttribute('id').replace('Description', '');
        desc.classList.toggle('active', id === tabId);
      });
      
      // Fade out current content
      this.elements.toolContent.classList.add('fade-out');
      
      // After fade out, load new content
      setTimeout(() => {
        this.loadTabContent(tabId);
        
        // Fade in new content
        this.elements.toolContent.classList.remove('fade-out');
        this.elements.toolContent.classList.add('active', 'fade-in');
        
        // Update URL hash without triggering hashchange event
        const newUrl = window.location.pathname + '#' + tabId;
        history.replaceState(null, '', newUrl);
      }, 200);
    },
    
    // Load content for the specified tab
    loadTabContent: function(tabId) {
      const template = this.templates[tabId];
      
      if (!template) {
        console.error(`Template for tab "${tabId}" not found`);
        return;
      }
      
      // Clone the template content
      const content = template.content.cloneNode(true);
      
      // Clear and append new content
      this.elements.toolContent.innerHTML = '';
      this.elements.toolContent.appendChild(content);
      
      // Initialize the corresponding module
      this.initModule(tabId);
    },
    
    // Initialize the module corresponding to the active tab
    initModule: function(tabId) {
      switch (tabId) {
        case 'picker':
          if (window.ColorPickerTool.Picker && typeof window.ColorPickerTool.Picker.init === 'function') {
            window.ColorPickerTool.Picker.init();
          }
          break;
        case 'palettes':
          if (window.ColorPickerTool.Palettes && typeof window.ColorPickerTool.Palettes.init === 'function') {
            window.ColorPickerTool.Palettes.init();
          }
          break;
        case 'image':
          if (window.ColorPickerTool.Image && typeof window.ColorPickerTool.Image.init === 'function') {
            window.ColorPickerTool.Image.init();
          }
          break;
        case 'accessibility':
          if (window.ColorPickerTool.Accessibility && typeof window.ColorPickerTool.Accessibility.init === 'function') {
            window.ColorPickerTool.Accessibility.init();
          }
          break;
        case 'collections':
          if (window.ColorPickerTool.Collections && typeof window.ColorPickerTool.Collections.init === 'function') {
            window.ColorPickerTool.Collections.init();
          }
          break;
      }
    }
  };
  
  // Add to the global namespace
  window.ColorPickerTool.Main = Main;
  
  // Initialize the main module when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    Main.init();
  });
})();