# KVSOVANREACH Tools - Implementation Guide

This guide ensures consistency across all tools in the KVSOVANREACH Tools Portal. Follow these conventions when creating new tools or modifying existing ones.

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [HTML Structure](#2-html-structure)
3. [CSS Conventions](#3-css-conventions)
4. [JavaScript Patterns](#4-javascript-patterns)
5. [Common Components](#5-common-components)
6. [Accessibility Requirements](#6-accessibility-requirements)
7. [Checklist for New Tools](#7-checklist-for-new-tools)

---

## 1. File Structure

### Directory Layout

```
tools/
├── [tool-name]/
│   ├── index.html        # Main HTML file
│   ├── [tool-name].css   # Tool-specific styles
│   └── [tool-name].js    # Tool logic (single file)
├── js/
│   ├── tools-common.js   # Shared JavaScript utilities
│   └── tools-common.css  # Shared CSS styles
└── IMPLEMENTATION_GUIDE.md
```

### Naming Conventions

- **Folder name**: lowercase, hyphenated (e.g., `color-picker`, `json-formatter`)
- **CSS/JS files**: Match folder name (e.g., `colorpicker.css`, `colorpicker.js`)
- **CSS classes**: Use tool prefix (e.g., `.picker-*`, `.json-*`, `.calc-*`)

---

## 2. HTML Structure

### Standard Template

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Tool Name] - KVSOVANREACH Tools</title>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="../../assets/icons/favicon.svg">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../../js/tools-common.css">
  <link rel="stylesheet" href="[tool-name].css">
</head>
<body>
  <!-- Skip Link (Accessibility) -->
  <a href="#[tool-id]" class="skip-link">Skip to [Tool Name]</a>

  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <a href="../../tools.html" class="back-btn" title="Back to Tools">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        <span class="logo-text">KVSOVANREACH</span>
        <span class="logo-divider">/</span>
        <span class="logo-tools">Tools</span>
      </div>
      <div class="nav-actions">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
          <i class="fa-solid fa-moon"></i>
          <i class="fa-solid fa-sun"></i>
        </button>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="tool-page">
    <div class="container">
      <div class="[tool]-wrapper" id="[tool-id]">
        <!-- Tool Header -->
        <div class="[tool]-header">
          <h2><i class="fa-solid fa-[icon]"></i> [Tool Name]</h2>
          <div class="[tool]-actions">
            <!-- Header action buttons -->
          </div>
        </div>

        <!-- Tool Content -->
        <div class="[tool]-content">
          <!-- Main tool interface -->
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p class="footer-copy">&copy; <span id="current-year"></span> Kong Vungsovanreach. All rights reserved.</p>
        <p class="footer-made">Made with <i class="fa-solid fa-heart"></i> in South Korea</p>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div class="toast" id="toast"></div>

  <!-- Keyboard Shortcuts Hint -->
  <div class="shortcuts-hint" id="shortcutsHint">
    <span>Press <kbd>?</kbd> for shortcuts</span>
  </div>

  <!-- Keyboard Shortcuts Modal -->
  <div class="shortcuts-modal" id="shortcutsModal">
    <div class="shortcuts-content">
      <div class="shortcuts-header">
        <h3><i class="fa-solid fa-keyboard"></i> Keyboard Shortcuts</h3>
        <button class="close-shortcuts-btn" id="closeShortcutsBtn" aria-label="Close shortcuts">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="shortcuts-body">
        <!-- Shortcuts groups here -->
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="../../js/tools-common.js"></script>
  <script src="[tool-name].js"></script>
</body>
</html>
```

### Element Ordering (CRITICAL)

Elements after `</main>` must follow this exact order:

```html
</main>

<!-- 1. Footer -->
<footer class="footer">...</footer>

<!-- 2. Toast Notification -->
<div class="toast" id="toast"></div>

<!-- 3. Keyboard Shortcuts Hint -->
<div class="shortcuts-hint" id="shortcutsHint">...</div>

<!-- 4. Keyboard Shortcuts Modal -->
<div class="shortcuts-modal" id="shortcutsModal">...</div>

<!-- 5. Scripts -->
<script src="../../js/tools-common.js"></script>
<script src="[tool-name].js"></script>
```

### Shortcuts Modal Structure

```html
<div class="shortcuts-modal" id="shortcutsModal">
  <div class="shortcuts-content">
    <div class="shortcuts-header">
      <h3><i class="fa-solid fa-keyboard"></i> Keyboard Shortcuts</h3>
      <button class="close-shortcuts-btn" id="closeShortcutsBtn" aria-label="Close shortcuts">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="shortcuts-body">
      <!-- Group 1 -->
      <div class="shortcuts-group">
        <div class="shortcuts-group-title">General</div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>S</kbd></div>
          <div class="shortcut-desc">Save</div>
        </div>
        <!-- More rows... -->
      </div>

      <!-- Group 2 -->
      <div class="shortcuts-group">
        <div class="shortcuts-group-title">Navigation</div>
        <!-- Rows... -->
      </div>
    </div>
  </div>
</div>
```

**Important IDs (must match exactly):**
- Modal: `id="shortcutsModal"`
- Close button: `id="closeShortcutsBtn"` (NOT `shortcutsClose`)
- Hint: `id="shortcutsHint"`

---

## 3. CSS Conventions

### CSS Variables (from tools-common.css)

Always use CSS variables instead of hardcoded values:

```css
/* Colors */
--color-primary: #3776A1;
--color-primary-light: #5293BB;
--color-primary-dark: #1B5886;
--color-secondary: #6EB1D6;
--color-accent: #89CFF1;

--color-bg: #ffffff;
--color-bg-secondary: #f8fafc;
--color-bg-tertiary: #f1f5f9;
--color-surface: #ffffff;          /* Use for card/panel backgrounds */

--color-text: #1e293b;
--color-text-secondary: #475569;
--color-text-muted: #64748b;

--color-border: #cbd5e1;
--color-border-light: #e2e8f0;

--color-success: #22c55e;
--color-error: #ef4444;
--color-warning: #f59e0b;

/* Spacing */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */

/* Font Sizes */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */

/* Border Radius */
--radius-xs: 0.25rem;
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
```

### Standard Wrapper Style

```css
.[tool]-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
```

### Standard Header Style

```css
.[tool]-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);  /* Standard padding */
  background-color: var(--color-surface);   /* NOT --color-bg */
  border-bottom: 1px solid var(--color-border);
}

.[tool]-header h2 {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: 600;                         /* Standard weight: 600 */
  color: var(--color-text);
}

.[tool]-header h2 i {
  color: var(--color-primary);
}
```

### Button Classes (from tools-common.css)

Use these predefined button classes:

```css
/* Default action button */
.action-btn { }

/* Primary (gradient) button */
.action-btn.primary { }

/* Secondary (outlined) button */
.action-btn.secondary { }

/* Danger (red hover) button */
.action-btn.danger { }

/* Disabled state (automatic) */
.action-btn:disabled { }
```

**Usage:**
```html
<button class="action-btn">Default</button>
<button class="action-btn primary">Primary Action</button>
<button class="action-btn secondary">Secondary</button>
<button class="action-btn danger">Delete</button>
```

### Tab Classes (from tools-common.css)

**Underline Tabs (for main navigation):**
```html
<div class="tool-tabs">
  <button class="tool-tab active" data-tab="tab1">
    <i class="fa-solid fa-icon"></i> Tab 1
  </button>
  <button class="tool-tab" data-tab="tab2">
    <i class="fa-solid fa-icon"></i> Tab 2
  </button>
</div>
```

**Pill Tabs (for panel sub-navigation):**
```html
<div class="panel-tabs">
  <button class="panel-tab active" data-view="view1">View 1</button>
  <button class="panel-tab" data-view="view2">View 2</button>
</div>
```

### Responsive Breakpoints

```css
/* Tablet */
@media screen and (max-width: 1024px) { }

/* Mobile Large */
@media screen and (max-width: 768px) { }

/* Mobile Small */
@media screen and (max-width: 480px) { }

/* Mobile Extra Small */
@media screen and (max-width: 360px) { }
```

---

## 4. JavaScript Patterns

### Standard IIFE Structure

```javascript
/**
 * KVSOVANREACH [Tool Name] Tool
 * [Brief description]
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    // Tool state variables
    activeTab: 'default',
    history: [],
    // ...
  };

  // ==================== DOM Elements ====================
  const elements = {
    // Cache DOM elements
    wrapper: document.getElementById('[tool]-wrapper'),
    input: document.getElementById('input'),
    output: document.getElementById('output'),
    // ...
  };

  // ==================== Constants/Config ====================
  const CONFIG = {
    MAX_HISTORY: 50,
    DEBOUNCE_MS: 300,
    // ...
  };

  // ==================== Core Functions ====================

  function processInput() {
    // Main processing logic
  }

  function updateUI() {
    // UI update logic
  }

  // ==================== Event Handlers ====================

  function handleInputChange(e) {
    // Handle input changes
  }

  function handleButtonClick(e) {
    // Handle button clicks
  }

  // ==================== Utilities ====================

  function formatOutput(data) {
    // Utility functions
  }

  // ==================== Initialization ====================

  function init() {
    // Initialize tool
    setupEventListeners();
    loadFromStorage();
    // ...
  }

  function setupEventListeners() {
    // Attach event listeners
    elements.input?.addEventListener('input', handleInputChange);
    // ...
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

### Using tools-common.js Utilities

```javascript
// Toast notifications
ToolsCommon.Toast.show('Message here');
ToolsCommon.Toast.show('Success!', 'success');
ToolsCommon.Toast.show('Error!', 'error');

// Copy to clipboard
ToolsCommon.Clipboard.copy(text);

// File download
ToolsCommon.FileDownload.text(content, 'filename.txt');
ToolsCommon.FileDownload.json(data, 'data.json');
ToolsCommon.FileDownload.blob(blob, 'file.png');

// Utilities
ToolsCommon.debounce(fn, delay);
ToolsCommon.throttle(fn, delay);
ToolsCommon.formatFileSize(bytes);
ToolsCommon.generateId();

// Theme (auto-initialized)
// Theme toggle is handled automatically by tools-common.js

// Shortcuts Modal (auto-initialized)
// Modal show/hide is handled automatically by tools-common.js
```

### LocalStorage Pattern

```javascript
const STORAGE_KEY = 'kvsovanreach_[tool]_data';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      Object.assign(state, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
}
```

---

## 5. Common Components

### Input with Actions

```html
<div class="input-section">
  <div class="input-header">
    <h3>Input</h3>
    <div class="input-actions">
      <button class="action-btn" id="pasteBtn" title="Paste" aria-label="Paste from clipboard">
        <i class="fa-solid fa-paste"></i>
      </button>
      <button class="action-btn" id="clearBtn" title="Clear" aria-label="Clear input">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
  <textarea id="input" placeholder="Enter text..."></textarea>
</div>
```

### Output with Actions

```html
<div class="output-section">
  <div class="output-header">
    <h3>Output</h3>
    <div class="output-actions">
      <button class="action-btn" id="copyBtn" title="Copy" aria-label="Copy to clipboard">
        <i class="fa-solid fa-copy"></i>
      </button>
      <button class="action-btn" id="downloadBtn" title="Download" aria-label="Download file">
        <i class="fa-solid fa-download"></i>
      </button>
    </div>
  </div>
  <div class="output-content" id="output"></div>
</div>
```

### Empty State

```html
<div class="empty-state" id="emptyState">
  <i class="fa-solid fa-inbox"></i>
  <p>No results yet</p>
  <span>Enter some input to get started</span>
</div>
```

### Generate/Action Button (Primary)

```html
<button class="action-btn primary" id="generateBtn">
  <i class="fa-solid fa-wand-magic-sparkles"></i>
  <span>Generate</span>
</button>
```

### Options/Settings Panel

```html
<div class="options-panel">
  <div class="option-group">
    <label class="option-label">Option Name</label>
    <select id="optionSelect">
      <option value="value1">Option 1</option>
      <option value="value2">Option 2</option>
    </select>
  </div>

  <div class="option-group">
    <label class="option-label">
      <input type="checkbox" id="optionCheck">
      Enable feature
    </label>
  </div>
</div>
```

---

## 6. Accessibility Requirements

### Required ARIA Labels

**All icon-only buttons MUST have `aria-label` AND `title`:**

```html
<!-- CORRECT -->
<button class="action-btn" id="copyBtn" title="Copy to clipboard" aria-label="Copy to clipboard">
  <i class="fa-solid fa-copy"></i>
</button>

<!-- INCORRECT - Missing accessibility -->
<button class="action-btn" id="copyBtn">
  <i class="fa-solid fa-copy"></i>
</button>
```

### Skip Link

Every tool must have a skip link as the first element in `<body>`:

```html
<a href="#[tool-id]" class="skip-link">Skip to [Tool Name]</a>
```

### Focus States

Ensure all interactive elements have visible focus states (handled by tools-common.css).

### Semantic HTML

- Use `<main>` for primary content
- Use `<nav>` for navigation
- Use `<footer>` for footer
- Use `<button>` for clickable actions (not `<div>` or `<span>`)
- Use `<a>` for navigation links

### Form Labels

```html
<!-- Always associate labels with inputs -->
<label for="inputField">Field Name</label>
<input type="text" id="inputField">

<!-- Or use aria-label for unlabeled inputs -->
<input type="text" id="searchInput" aria-label="Search" placeholder="Search...">
```

---

## 7. Checklist for New Tools

### Before Starting

- [ ] Tool folder created: `tools/[tool-name]/`
- [ ] Files created: `index.html`, `[tool-name].css`, `[tool-name].js`
- [ ] Tool added to `js/tools-data.js`

### HTML Structure

- [ ] Correct DOCTYPE and lang attribute
- [ ] All required meta tags present
- [ ] tools-common.css linked BEFORE tool CSS
- [ ] Skip link present as first body element
- [ ] Standard navbar with back button and theme toggle
- [ ] Main content wrapped in `.tool-page > .container`
- [ ] Footer present
- [ ] Element order: Footer → Toast → Hint → Modal → Scripts
- [ ] tools-common.js loaded BEFORE tool JS
- [ ] Shortcuts modal with correct IDs (`shortcutsModal`, `closeShortcutsBtn`)

### CSS

- [ ] Using CSS variables (no hardcoded colors/spacing)
- [ ] Wrapper uses `--color-surface` for background
- [ ] Header uses `padding: var(--space-4) var(--space-5)`
- [ ] Header h2 uses `font-weight: 600`
- [ ] Using standard button classes from tools-common.css
- [ ] Using standard tab classes if applicable
- [ ] Responsive styles for 1024px, 768px, 480px breakpoints

### JavaScript

- [ ] Wrapped in IIFE with `'use strict'`
- [ ] Using ToolsCommon utilities (Toast, Clipboard, FileDownload)
- [ ] Event listeners properly attached
- [ ] Error handling for localStorage operations
- [ ] No global variable pollution

### Accessibility

- [ ] All icon-only buttons have `aria-label` AND `title`
- [ ] Skip link targets correct element ID
- [ ] Form inputs have associated labels or aria-label
- [ ] Interactive elements are focusable
- [ ] Sufficient color contrast

### Testing

- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Keyboard shortcuts work (if applicable)
- [ ] Toast notifications display correctly
- [ ] Responsive on mobile devices
- [ ] No console errors

---

## Quick Reference

### Common Icon Classes

```
fa-solid fa-copy          # Copy
fa-solid fa-paste         # Paste
fa-solid fa-download      # Download
fa-solid fa-upload        # Upload
fa-solid fa-trash         # Delete/Clear
fa-solid fa-xmark         # Close/Remove
fa-solid fa-plus          # Add
fa-solid fa-minus         # Remove/Decrease
fa-solid fa-check         # Success/Confirm
fa-solid fa-gear          # Settings
fa-solid fa-rotate        # Refresh/Reset
fa-solid fa-wand-magic-sparkles  # Generate
fa-solid fa-code          # Code
fa-solid fa-file-code     # Code file
fa-solid fa-keyboard      # Shortcuts
```

### Standard Element IDs

```
theme-toggle      # Theme toggle button
toast             # Toast notification container
shortcutsHint     # Shortcuts hint (bottom-right)
shortcutsModal    # Shortcuts modal
closeShortcutsBtn # Shortcuts modal close button
current-year      # Footer year span
```

---

*Last updated: January 2026*
*Version: 1.0*
