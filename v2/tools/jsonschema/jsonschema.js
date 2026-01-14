/**
 * KVSOVANREACH JSON Schema Visualizer
 * Convert JSON schemas into expandable visual trees
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    schemaInput: document.getElementById('schemaInput'),
    inputError: document.getElementById('inputError'),
    errorMessage: document.getElementById('errorMessage'),
    treeContainer: document.getElementById('treeContainer'),
    searchInput: document.getElementById('searchInput'),
    // Stats
    propertyCount: document.getElementById('propertyCount'),
    depthCount: document.getElementById('depthCount'),
    requiredCount: document.getElementById('requiredCount'),
    typeCount: document.getElementById('typeCount'),
    // Buttons
    sampleBtn: document.getElementById('sampleBtn'),
    expandAllBtn: document.getElementById('expandAllBtn'),
    collapseAllBtn: document.getElementById('collapseAllBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // State
  let currentSchema = null;
  let stats = {
    properties: 0,
    depth: 0,
    required: 0,
    types: new Set()
  };

  // Sample schema
  const sampleSchema = {
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
      },
      "address": {
        "type": "object",
        "properties": {
          "street": { "type": "string" },
          "city": { "type": "string" },
          "country": { "type": "string" },
          "postalCode": {
            "type": "string",
            "pattern": "^[0-9]{5}$"
          }
        },
        "required": ["city", "country"]
      },
      "metadata": {
        "type": "object",
        "additionalProperties": true
      }
    }
  };

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    renderPlaceholder();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Input events
    elements.schemaInput.addEventListener('input', ToolsCommon.debounce(handleInputChange, 300));
    elements.searchInput.addEventListener('input', ToolsCommon.debounce(handleSearch, 200));

    // Button events
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.expandAllBtn.addEventListener('click', expandAll);
    elements.collapseAllBtn.addEventListener('click', collapseAll);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.clearBtn.addEventListener('click', clearInput);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Handle input change
   */
  function handleInputChange() {
    const input = elements.schemaInput.value.trim();

    if (!input) {
      hideError();
      renderPlaceholder();
      resetStats();
      return;
    }

    try {
      const schema = JSON.parse(input);
      currentSchema = schema;
      hideError();
      renderTree(schema);
      calculateStats(schema);
    } catch (e) {
      showError('Invalid JSON: ' + e.message);
      renderPlaceholder();
      resetStats();
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.inputError.classList.remove('hidden');
  }

  /**
   * Hide error message
   */
  function hideError() {
    elements.inputError.classList.add('hidden');
  }

  /**
   * Reset stats
   */
  function resetStats() {
    stats = {
      properties: 0,
      depth: 0,
      required: 0,
      types: new Set()
    };
    updateStatsDisplay();
  }

  /**
   * Calculate schema statistics
   */
  function calculateStats(schema, depth = 0, parentRequired = []) {
    if (depth === 0) {
      stats = {
        properties: 0,
        depth: 0,
        required: 0,
        types: new Set()
      };
    }

    stats.depth = Math.max(stats.depth, depth);

    // Count type
    if (schema.type) {
      if (Array.isArray(schema.type)) {
        schema.type.forEach(t => stats.types.add(t));
      } else {
        stats.types.add(schema.type);
      }
    }

    // Count required fields
    if (schema.required && Array.isArray(schema.required)) {
      stats.required += schema.required.length;
    }

    // Process properties
    if (schema.properties) {
      const propKeys = Object.keys(schema.properties);
      stats.properties += propKeys.length;

      propKeys.forEach(key => {
        calculateStats(schema.properties[key], depth + 1, schema.required || []);
      });
    }

    // Process array items
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach(item => calculateStats(item, depth + 1, []));
      } else {
        calculateStats(schema.items, depth + 1, []);
      }
    }

    // Process additionalProperties if it's a schema
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      calculateStats(schema.additionalProperties, depth + 1, []);
    }

    // Process allOf, anyOf, oneOf
    ['allOf', 'anyOf', 'oneOf'].forEach(keyword => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        schema[keyword].forEach(subSchema => calculateStats(subSchema, depth + 1, []));
      }
    });

    if (depth === 0) {
      updateStatsDisplay();
    }
  }

  /**
   * Update stats display
   */
  function updateStatsDisplay() {
    elements.propertyCount.textContent = stats.properties;
    elements.depthCount.textContent = stats.depth;
    elements.requiredCount.textContent = stats.required;
    elements.typeCount.textContent = stats.types.size;
  }

  /**
   * Render placeholder
   */
  function renderPlaceholder() {
    elements.treeContainer.innerHTML = `
      <div class="tree-placeholder">
        <i class="fa-solid fa-diagram-project"></i>
        <p>Paste a JSON Schema to visualize its structure</p>
      </div>
    `;
  }

  /**
   * Render the schema tree
   */
  function renderTree(schema) {
    elements.treeContainer.innerHTML = '';

    const rootNode = createNode('root', schema, [], true);
    elements.treeContainer.appendChild(rootNode);
  }

  /**
   * Create a tree node
   */
  function createNode(name, schema, requiredFields = [], isRoot = false) {
    const node = document.createElement('div');
    node.className = 'tree-node';

    const type = getSchemaType(schema);
    const isRequired = requiredFields.includes(name);
    const hasChildren = hasChildNodes(schema);
    const description = schema.description || '';
    const constraints = getConstraints(schema);

    // Node header
    const header = document.createElement('div');
    header.className = 'node-header';

    // Toggle icon
    const toggle = document.createElement('span');
    toggle.className = 'node-toggle' + (hasChildren ? '' : ' hidden');
    toggle.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

    // Name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';
    nameSpan.textContent = isRoot ? (schema.title || 'Schema') : name;

    // Type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = 'node-type ' + type;
    typeBadge.textContent = type;

    // Required indicator
    const requiredSpan = document.createElement('span');
    requiredSpan.className = 'node-required';
    requiredSpan.innerHTML = isRequired ? '<i class="fa-solid fa-asterisk"></i>' : '';

    // Constraints
    const constraintsDiv = document.createElement('div');
    constraintsDiv.className = 'node-constraints';
    constraints.forEach(c => {
      const span = document.createElement('span');
      span.className = 'constraint';
      span.textContent = c;
      constraintsDiv.appendChild(span);
    });

    // Description
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

    // Children container
    if (hasChildren) {
      const children = document.createElement('div');
      children.className = 'node-children';

      // Add child nodes based on schema type
      addChildNodes(children, schema);

      node.appendChild(children);

      // Toggle click handler
      header.addEventListener('click', () => {
        toggle.classList.toggle('expanded');
        children.classList.toggle('expanded');
      });

      // Auto-expand root and first level
      if (isRoot) {
        toggle.classList.add('expanded');
        children.classList.add('expanded');
      }
    }

    return node;
  }

  /**
   * Get schema type
   */
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

  /**
   * Check if schema has child nodes
   */
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

  /**
   * Add child nodes to container
   */
  function addChildNodes(container, schema) {
    // Properties
    if (schema.properties) {
      const required = schema.required || [];
      Object.entries(schema.properties).forEach(([key, value]) => {
        const childNode = createNode(key, value, required);
        container.appendChild(childNode);
      });
    }

    // Array items
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

    // Additional properties
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const childNode = createNode('[additional]', schema.additionalProperties, []);
      container.appendChild(childNode);
    }

    // Composition keywords
    ['allOf', 'anyOf', 'oneOf'].forEach(keyword => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        schema[keyword].forEach((subSchema, index) => {
          const childNode = createNode(`${keyword}[${index}]`, subSchema, []);
          container.appendChild(childNode);
        });
      }
    });
  }

  /**
   * Get constraints from schema
   */
  function getConstraints(schema) {
    const constraints = [];

    // String constraints
    if (schema.minLength !== undefined) constraints.push(`min: ${schema.minLength}`);
    if (schema.maxLength !== undefined) constraints.push(`max: ${schema.maxLength}`);
    if (schema.pattern) constraints.push('pattern');
    if (schema.format) constraints.push(schema.format);

    // Number constraints
    if (schema.minimum !== undefined) constraints.push(`>= ${schema.minimum}`);
    if (schema.maximum !== undefined) constraints.push(`<= ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined) constraints.push(`> ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined) constraints.push(`< ${schema.exclusiveMaximum}`);
    if (schema.multipleOf !== undefined) constraints.push(`x${schema.multipleOf}`);

    // Array constraints
    if (schema.minItems !== undefined) constraints.push(`items >= ${schema.minItems}`);
    if (schema.maxItems !== undefined) constraints.push(`items <= ${schema.maxItems}`);
    if (schema.uniqueItems) constraints.push('unique');

    // Enum
    if (schema.enum) constraints.push(`enum(${schema.enum.length})`);

    // Default
    if (schema.default !== undefined) constraints.push(`default: ${JSON.stringify(schema.default)}`);

    return constraints.slice(0, 3); // Limit to 3 constraints for display
  }

  /**
   * Handle search
   */
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
          // Expand parent nodes to show match
          expandToNode(header);
        }
      }
    });
  }

  /**
   * Expand parent nodes to show a node
   */
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

  /**
   * Expand all nodes
   */
  function expandAll() {
    const toggles = elements.treeContainer.querySelectorAll('.node-toggle:not(.hidden)');
    const children = elements.treeContainer.querySelectorAll('.node-children');

    toggles.forEach(t => t.classList.add('expanded'));
    children.forEach(c => c.classList.add('expanded'));

    ToolsCommon.Toast.show('All nodes expanded', 'success');
  }

  /**
   * Collapse all nodes
   */
  function collapseAll() {
    const toggles = elements.treeContainer.querySelectorAll('.node-toggle:not(.hidden)');
    const children = elements.treeContainer.querySelectorAll('.node-children');

    toggles.forEach(t => t.classList.remove('expanded'));
    children.forEach(c => c.classList.remove('expanded'));

    ToolsCommon.Toast.show('All nodes collapsed', 'info');
  }

  /**
   * Load sample schema
   */
  function loadSample() {
    elements.schemaInput.value = JSON.stringify(sampleSchema, null, 2);
    handleInputChange();
    ToolsCommon.Toast.show('Sample schema loaded', 'success');
  }

  /**
   * Paste from clipboard
   */
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.schemaInput.value = text;
      handleInputChange();
      ToolsCommon.Toast.show('Pasted from clipboard', 'success');
    } catch (e) {
      ToolsCommon.Toast.show('Failed to paste from clipboard', 'error');
    }
  }

  /**
   * Clear input
   */
  function clearInput() {
    elements.schemaInput.value = '';
    hideError();
    renderPlaceholder();
    resetStats();
    elements.searchInput.value = '';
    ToolsCommon.Toast.show('Input cleared', 'info');
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Ctrl+E - Expand all
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      expandAll();
    }

    // Ctrl+W - Collapse all
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      collapseAll();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
