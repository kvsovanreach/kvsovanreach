/**
 * KVSOVANREACH JSON Schema Visualizer
 * Refactored to follow Color Picker design pattern
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeTab: 'editor',
    currentSchema: null,
    stats: {
      properties: 0,
      depth: 0,
      required: 0,
      types: new Set()
    }
  };

  // ==================== Sample Schemas ====================
  const sampleSchemas = {
    user: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "User Profile",
      "type": "object",
      "required": ["id", "name", "email"],
      "properties": {
        "id": {
          "type": "integer",
          "description": "Unique identifier"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "User's full name"
        },
        "email": {
          "type": "string",
          "format": "email",
          "description": "Email address"
        },
        "age": {
          "type": "integer",
          "minimum": 0,
          "maximum": 150
        },
        "isActive": {
          "type": "boolean",
          "default": true
        },
        "roles": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["admin", "user", "moderator"]
          },
          "description": "User roles"
        }
      }
    },
    product: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "Product",
      "type": "object",
      "required": ["id", "name", "price"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "minLength": 1 },
        "description": { "type": "string" },
        "price": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "enum": ["USD", "EUR", "GBP"] },
        "inStock": { "type": "boolean", "default": true },
        "categories": {
          "type": "array",
          "items": { "type": "string" }
        },
        "metadata": {
          "type": "object",
          "additionalProperties": true
        }
      }
    },
    address: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "Address",
      "type": "object",
      "required": ["street", "city", "country"],
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "postalCode": {
          "type": "string",
          "pattern": "^[0-9]{5}(-[0-9]{4})?$"
        },
        "country": {
          "type": "string",
          "minLength": 2,
          "maxLength": 2
        }
      }
    },
    event: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "Calendar Event",
      "type": "object",
      "required": ["title", "start"],
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "description": { "type": "string" },
        "start": { "type": "string", "format": "date-time" },
        "end": { "type": "string", "format": "date-time" },
        "allDay": { "type": "boolean", "default": false },
        "location": { "type": "string" },
        "attendees": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "email": { "type": "string", "format": "email" },
              "name": { "type": "string" },
              "status": { "type": "string", "enum": ["pending", "accepted", "declined"] }
            }
          }
        }
      }
    },
    api: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "API Response",
      "type": "object",
      "required": ["success", "data"],
      "properties": {
        "success": { "type": "boolean" },
        "data": {
          "type": ["object", "array", "null"]
        },
        "error": {
          "type": "object",
          "properties": {
            "code": { "type": "string" },
            "message": { "type": "string" }
          }
        },
        "meta": {
          "type": "object",
          "properties": {
            "page": { "type": "integer", "minimum": 1 },
            "perPage": { "type": "integer", "minimum": 1 },
            "total": { "type": "integer", "minimum": 0 }
          }
        }
      }
    },
    config: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "App Configuration",
      "type": "object",
      "required": ["appName", "version"],
      "properties": {
        "appName": { "type": "string" },
        "version": { "type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$" },
        "debug": { "type": "boolean", "default": false },
        "database": {
          "type": "object",
          "properties": {
            "host": { "type": "string" },
            "port": { "type": "integer", "default": 5432 },
            "name": { "type": "string" },
            "ssl": { "type": "boolean", "default": true }
          },
          "required": ["host", "name"]
        },
        "features": {
          "type": "object",
          "additionalProperties": { "type": "boolean" }
        },
        "logging": {
          "type": "object",
          "properties": {
            "level": { "type": "string", "enum": ["debug", "info", "warn", "error"] },
            "format": { "type": "string", "enum": ["json", "text"] }
          }
        }
      }
    }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.schema-panel');
    elements.schemaMain = document.querySelector('.schema-main');

    // Editor
    elements.schemaInput = document.getElementById('schemaInput');
    elements.inputError = document.getElementById('inputError');
    elements.errorMessage = document.getElementById('errorMessage');

    // Tree
    elements.treeContainer = document.getElementById('treeContainer');
    elements.searchInput = document.getElementById('searchInput');

    // Stats
    elements.propertyCount = document.getElementById('propertyCount');
    elements.depthCount = document.getElementById('depthCount');
    elements.requiredCount = document.getElementById('requiredCount');
    elements.typeCount = document.getElementById('typeCount');

    // Schema Info
    elements.schemaInfoContent = document.getElementById('schemaInfoContent');

    // Buttons
    elements.validateBtn = document.getElementById('validateBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.pasteBtn = document.getElementById('pasteBtn');
    elements.formatBtn = document.getElementById('formatBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.expandAllBtn = document.getElementById('expandAllBtn');
    elements.collapseAllBtn = document.getElementById('collapseAllBtn');

    // Examples
    elements.examplesGrid = document.getElementById('examplesGrid');
  }

  // ==================== Tab Navigation ====================
  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.tool-tab[data-tab="${tabName}"]`);
    if (tab) {
      tab.classList.add('active');
      document.getElementById(tabName + 'Panel').classList.add('active');
      state.activeTab = tabName;

      // Toggle full-width layout for Examples tab
      const isFullWidth = tabName === 'examples';
      elements.schemaMain.classList.toggle('full-width', isFullWidth);

      // Update tree when switching to tree tab
      if (tabName === 'tree' && state.currentSchema) {
        renderTree(state.currentSchema);
      }
    }
  }

  // ==================== Input Handling ====================
  function handleInputChange() {
    const input = elements.schemaInput.value.trim();

    if (!input) {
      hideError();
      renderPlaceholder();
      resetStats();
      updateSchemaInfo(null);
      state.currentSchema = null;
      return;
    }

    try {
      const schema = JSON.parse(input);
      state.currentSchema = schema;
      hideError();
      calculateStats(schema);
      updateSchemaInfo(schema);

      // If on tree tab, update tree
      if (state.activeTab === 'tree') {
        renderTree(schema);
      }
    } catch (e) {
      showError('Invalid JSON: ' + e.message);
      renderPlaceholder();
      resetStats();
      updateSchemaInfo(null);
      state.currentSchema = null;
    }
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.inputError.classList.remove('hidden');
  }

  function hideError() {
    elements.inputError.classList.add('hidden');
  }

  // ==================== Stats ====================
  function resetStats() {
    state.stats = {
      properties: 0,
      depth: 0,
      required: 0,
      types: new Set()
    };
    updateStatsDisplay();
  }

  function calculateStats(schema, depth = 0) {
    if (depth === 0) {
      state.stats = {
        properties: 0,
        depth: 0,
        required: 0,
        types: new Set()
      };
    }

    state.stats.depth = Math.max(state.stats.depth, depth);

    if (schema.type) {
      if (Array.isArray(schema.type)) {
        schema.type.forEach(t => state.stats.types.add(t));
      } else {
        state.stats.types.add(schema.type);
      }
    }

    if (schema.required && Array.isArray(schema.required)) {
      state.stats.required += schema.required.length;
    }

    if (schema.properties) {
      const propKeys = Object.keys(schema.properties);
      state.stats.properties += propKeys.length;

      propKeys.forEach(key => {
        calculateStats(schema.properties[key], depth + 1);
      });
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach(item => calculateStats(item, depth + 1));
      } else {
        calculateStats(schema.items, depth + 1);
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      calculateStats(schema.additionalProperties, depth + 1);
    }

    ['allOf', 'anyOf', 'oneOf'].forEach(keyword => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        schema[keyword].forEach(subSchema => calculateStats(subSchema, depth + 1));
      }
    });

    if (depth === 0) {
      updateStatsDisplay();
    }
  }

  function updateStatsDisplay() {
    elements.propertyCount.textContent = state.stats.properties;
    elements.depthCount.textContent = state.stats.depth;
    elements.requiredCount.textContent = state.stats.required;
    elements.typeCount.textContent = state.stats.types.size;
  }

  // ==================== Schema Info ====================
  function updateSchemaInfo(schema) {
    if (!schema) {
      elements.schemaInfoContent.innerHTML = '<div class="info-empty">No schema loaded</div>';
      return;
    }

    const info = [];
    if (schema.title) info.push({ label: 'Title', value: schema.title });
    if (schema.$schema) info.push({ label: 'Draft', value: schema.$schema.split('/').pop() });
    if (schema.type) info.push({ label: 'Root Type', value: Array.isArray(schema.type) ? schema.type.join(', ') : schema.type });
    if (schema.description) info.push({ label: 'Description', value: schema.description });

    if (info.length === 0) {
      elements.schemaInfoContent.innerHTML = '<div class="info-empty">No metadata found</div>';
      return;
    }

    elements.schemaInfoContent.innerHTML = info.map(item => `
      <div class="info-row">
        <span class="info-label">${item.label}</span>
        <span class="info-value" title="${item.value}">${item.value}</span>
      </div>
    `).join('');
  }

  // ==================== Tree Rendering ====================
  function renderPlaceholder() {
    elements.treeContainer.innerHTML = `
      <div class="tree-placeholder">
        <i class="fa-solid fa-diagram-project"></i>
        <p>Paste a JSON Schema to visualize its structure</p>
      </div>
    `;
  }

  function renderTree(schema) {
    elements.treeContainer.innerHTML = '';
    const rootNode = createNode('root', schema, [], true);
    elements.treeContainer.appendChild(rootNode);
  }

  function createNode(name, schema, requiredFields = [], isRoot = false) {
    const node = document.createElement('div');
    node.className = 'tree-node';

    const type = getSchemaType(schema);
    const isRequired = requiredFields.includes(name);
    const hasChildren = hasChildNodes(schema);
    const description = schema.description || '';
    const constraints = getConstraints(schema);

    const header = document.createElement('div');
    header.className = 'node-header';

    const toggle = document.createElement('span');
    toggle.className = 'node-toggle' + (hasChildren ? '' : ' hidden');
    toggle.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';
    nameSpan.textContent = isRoot ? (schema.title || 'Schema') : name;

    const typeBadge = document.createElement('span');
    typeBadge.className = 'node-type ' + type.replace(/[|\[\]]/g, '');
    typeBadge.textContent = type;

    const requiredSpan = document.createElement('span');
    requiredSpan.className = 'node-required';
    requiredSpan.innerHTML = isRequired ? '<i class="fa-solid fa-asterisk"></i>' : '';

    const constraintsDiv = document.createElement('div');
    constraintsDiv.className = 'node-constraints';
    constraints.forEach(c => {
      const span = document.createElement('span');
      span.className = 'constraint';
      span.textContent = c;
      constraintsDiv.appendChild(span);
    });

    const descSpan = document.createElement('span');
    descSpan.className = 'node-description';
    descSpan.textContent = description;
    descSpan.title = description;

    header.appendChild(toggle);
    header.appendChild(nameSpan);
    header.appendChild(typeBadge);
    header.appendChild(requiredSpan);
    header.appendChild(constraintsDiv);
    header.appendChild(descSpan);

    node.appendChild(header);

    if (hasChildren) {
      const children = document.createElement('div');
      children.className = 'node-children';

      addChildNodes(children, schema);

      node.appendChild(children);

      header.addEventListener('click', () => {
        toggle.classList.toggle('expanded');
        children.classList.toggle('expanded');
      });

      if (isRoot) {
        toggle.classList.add('expanded');
        children.classList.add('expanded');
      }
    }

    return node;
  }

  function getSchemaType(schema) {
    if (schema.type) {
      if (Array.isArray(schema.type)) {
        return schema.type.join('|');
      }
      return schema.type;
    }
    if (schema.enum) return 'enum';
    if (schema.const !== undefined) return 'const';
    if (schema.allOf) return 'allOf';
    if (schema.anyOf) return 'anyOf';
    if (schema.oneOf) return 'oneOf';
    if (schema.$ref) return 'ref';
    return 'any';
  }

  function hasChildNodes(schema) {
    return !!(
      schema.properties ||
      schema.items ||
      (schema.additionalProperties && typeof schema.additionalProperties === 'object') ||
      schema.allOf ||
      schema.anyOf ||
      schema.oneOf
    );
  }

  function addChildNodes(container, schema) {
    if (schema.properties) {
      const required = schema.required || [];
      Object.entries(schema.properties).forEach(([key, value]) => {
        const childNode = createNode(key, value, required);
        container.appendChild(childNode);
      });
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item, index) => {
          const childNode = createNode(`[${index}]`, item, []);
          container.appendChild(childNode);
        });
      } else {
        const childNode = createNode('[items]', schema.items, []);
        container.appendChild(childNode);
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const childNode = createNode('[additional]', schema.additionalProperties, []);
      container.appendChild(childNode);
    }

    ['allOf', 'anyOf', 'oneOf'].forEach(keyword => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        schema[keyword].forEach((subSchema, index) => {
          const childNode = createNode(`${keyword}[${index}]`, subSchema, []);
          container.appendChild(childNode);
        });
      }
    });
  }

  function getConstraints(schema) {
    const constraints = [];

    if (schema.minLength !== undefined) constraints.push(`min: ${schema.minLength}`);
    if (schema.maxLength !== undefined) constraints.push(`max: ${schema.maxLength}`);
    if (schema.pattern) constraints.push('pattern');
    if (schema.format) constraints.push(schema.format);

    if (schema.minimum !== undefined) constraints.push(`>= ${schema.minimum}`);
    if (schema.maximum !== undefined) constraints.push(`<= ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined) constraints.push(`> ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined) constraints.push(`< ${schema.exclusiveMaximum}`);
    if (schema.multipleOf !== undefined) constraints.push(`x${schema.multipleOf}`);

    if (schema.minItems !== undefined) constraints.push(`items >= ${schema.minItems}`);
    if (schema.maxItems !== undefined) constraints.push(`items <= ${schema.maxItems}`);
    if (schema.uniqueItems) constraints.push('unique');

    if (schema.enum) constraints.push(`enum(${schema.enum.length})`);

    if (schema.default !== undefined) constraints.push(`default: ${JSON.stringify(schema.default)}`);

    return constraints.slice(0, 3);
  }

  // ==================== Search ====================
  function handleSearch() {
    const query = elements.searchInput.value.trim().toLowerCase();
    const nodes = elements.treeContainer.querySelectorAll('.node-header');

    nodes.forEach(header => {
      header.classList.remove('highlight');

      if (query) {
        const name = header.querySelector('.node-name')?.textContent.toLowerCase() || '';
        const type = header.querySelector('.node-type')?.textContent.toLowerCase() || '';

        if (name.includes(query) || type.includes(query)) {
          header.classList.add('highlight');
          expandToNode(header);
        }
      }
    });
  }

  function expandToNode(header) {
    let parent = header.parentElement;
    while (parent) {
      if (parent.classList.contains('node-children')) {
        parent.classList.add('expanded');
        const toggle = parent.previousElementSibling?.querySelector('.node-toggle');
        if (toggle) toggle.classList.add('expanded');
      }
      parent = parent.parentElement;
    }
  }

  // ==================== Actions ====================
  function expandAll() {
    const toggles = elements.treeContainer.querySelectorAll('.node-toggle:not(.hidden)');
    const children = elements.treeContainer.querySelectorAll('.node-children');

    toggles.forEach(t => t.classList.add('expanded'));
    children.forEach(c => c.classList.add('expanded'));

    ToolsCommon.showToast('All nodes expanded', 'success');
  }

  function collapseAll() {
    const toggles = elements.treeContainer.querySelectorAll('.node-toggle:not(.hidden)');
    const children = elements.treeContainer.querySelectorAll('.node-children');

    toggles.forEach(t => t.classList.remove('expanded'));
    children.forEach(c => c.classList.remove('expanded'));

    ToolsCommon.showToast('All nodes collapsed', 'info');
  }

  function validateSchema() {
    const input = elements.schemaInput.value.trim();

    if (!input) {
      ToolsCommon.showToast('No schema to validate', 'error');
      return;
    }

    try {
      const schema = JSON.parse(input);

      // Basic validation checks
      const errors = [];

      if (schema.type && !['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'].includes(schema.type) && !Array.isArray(schema.type)) {
        errors.push(`Invalid type: ${schema.type}`);
      }

      if (errors.length > 0) {
        ToolsCommon.showToast('Schema has issues: ' + errors.join(', '), 'error');
      } else {
        ToolsCommon.showToast('Schema is valid!', 'success');
      }
    } catch (e) {
      ToolsCommon.showToast('Invalid JSON: ' + e.message, 'error');
    }
  }

  function copySchema() {
    const input = elements.schemaInput.value.trim();
    if (!input) {
      ToolsCommon.showToast('No schema to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(input, 'Schema copied!');
  }

  function downloadSchema() {
    const input = elements.schemaInput.value.trim();
    if (!input) {
      ToolsCommon.showToast('No schema to download', 'error');
      return;
    }

    try {
      const schema = JSON.parse(input);
      const filename = (schema.title || 'schema').toLowerCase().replace(/\s+/g, '-') + '.json';
      ToolsCommon.downloadJson(schema, filename, true);
      ToolsCommon.showToast('Schema downloaded!', 'success');
    } catch (e) {
      ToolsCommon.showToast('Invalid JSON', 'error');
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.schemaInput.value = text;
      handleInputChange();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (e) {
      ToolsCommon.showToast('Failed to paste from clipboard', 'error');
    }
  }

  function formatJson() {
    const input = elements.schemaInput.value.trim();
    if (!input) {
      ToolsCommon.showToast('No JSON to format', 'error');
      return;
    }

    try {
      const schema = JSON.parse(input);
      elements.schemaInput.value = JSON.stringify(schema, null, 2);
      handleInputChange();
      ToolsCommon.showToast('JSON formatted!', 'success');
    } catch (e) {
      ToolsCommon.showToast('Invalid JSON: ' + e.message, 'error');
    }
  }

  function clearInput() {
    elements.schemaInput.value = '';
    hideError();
    renderPlaceholder();
    resetStats();
    updateSchemaInfo(null);
    elements.searchInput.value = '';
    state.currentSchema = null;
    ToolsCommon.showToast('Input cleared', 'info');
  }

  function loadExample(exampleName) {
    const schema = sampleSchemas[exampleName];
    if (schema) {
      elements.schemaInput.value = JSON.stringify(schema, null, 2);
      handleInputChange();
      switchTab('editor');
      ToolsCommon.showToast(`${schema.title || 'Sample'} schema loaded!`, 'success');
    }
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Input events
    elements.schemaInput.addEventListener('input', ToolsCommon.debounce(handleInputChange, 300));
    elements.searchInput.addEventListener('input', ToolsCommon.debounce(handleSearch, 200));

    // Quick action buttons
    elements.validateBtn.addEventListener('click', validateSchema);
    elements.copyBtn.addEventListener('click', copySchema);
    elements.downloadBtn.addEventListener('click', downloadSchema);

    // Editor action buttons
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.formatBtn.addEventListener('click', formatJson);
    elements.clearBtn.addEventListener('click', clearInput);

    // Tree action buttons
    elements.expandAllBtn.addEventListener('click', expandAll);
    elements.collapseAllBtn.addEventListener('click', collapseAll);

    // Example cards
    elements.examplesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.example-card');
      if (card) {
        loadExample(card.dataset.example);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'v':
        e.preventDefault();
        validateSchema();
        break;

      case 'c':
        e.preventDefault();
        copySchema();
        break;

      case 'd':
        e.preventDefault();
        downloadSchema();
        break;

      case 'e':
        e.preventDefault();
        if (state.activeTab === 'tree') {
          expandAll();
        }
        break;

      case 'w':
        e.preventDefault();
        if (state.activeTab === 'tree') {
          collapseAll();
        }
        break;

      case '1':
        e.preventDefault();
        switchTab('editor');
        break;

      case '2':
        e.preventDefault();
        switchTab('tree');
        break;

      case '3':
        e.preventDefault();
        switchTab('examples');
        break;
    }
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initTabs();
    bindEvents();
    renderPlaceholder();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
