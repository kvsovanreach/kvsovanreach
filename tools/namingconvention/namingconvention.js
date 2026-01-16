/**
 * KVSOVANREACH Naming Convention Checker
 * Check and convert between naming conventions
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    nameInput: document.getElementById('nameInput'),
    detectionResult: document.getElementById('detectionResult'),
    validationRules: document.getElementById('validationRules'),
    validationMessage: document.querySelector('#validationSection .validation-item span'),
    validationIcon: document.querySelector('#validationSection .validation-item i'),
    validationItem: document.querySelector('#validationSection .validation-item'),
    // Values
    camelCaseValue: document.getElementById('camelCaseValue'),
    PascalCaseValue: document.getElementById('PascalCaseValue'),
    snake_caseValue: document.getElementById('snake_caseValue'),
    SCREAMING_SNAKE_CASEValue: document.getElementById('SCREAMING_SNAKE_CASEValue'),
    'kebab-caseValue': document.getElementById('kebab-caseValue'),
    flatcaseValue: document.getElementById('flatcaseValue'),
    // Buttons
    sampleBtn: document.getElementById('sampleBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn')
  };

  // Convention patterns
  const conventions = {
    camelCase: {
      pattern: /^[a-z][a-zA-Z0-9]*$/,
      check: (str) => /^[a-z]/.test(str) && !/[-_]/.test(str) && /[A-Z]/.test(str)
    },
    PascalCase: {
      pattern: /^[A-Z][a-zA-Z0-9]*$/,
      check: (str) => /^[A-Z]/.test(str) && !/[-_]/.test(str)
    },
    snake_case: {
      pattern: /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/,
      check: (str) => /^[a-z]/.test(str) && /_/.test(str) && str === str.toLowerCase()
    },
    SCREAMING_SNAKE_CASE: {
      pattern: /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
      check: (str) => /^[A-Z]/.test(str) && /_/.test(str) && str === str.toUpperCase()
    },
    'kebab-case': {
      pattern: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
      check: (str) => /^[a-z]/.test(str) && /-/.test(str) && str === str.toLowerCase()
    },
    flatcase: {
      pattern: /^[a-z][a-z0-9]*$/,
      check: (str) => /^[a-z][a-z0-9]*$/.test(str) && !/[-_A-Z]/.test(str)
    }
  };

  // Sample names
  const samples = [
    'getUserName',
    'UserProfile',
    'user_name',
    'MAX_VALUE',
    'user-profile',
    'myAwesomeFunction'
  ];

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Input event
    elements.nameInput.addEventListener('input', ToolsCommon.debounce(handleInput, 150));

    // Button events
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.clearBtn.addEventListener('click', clearInput);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => copyValue(btn.dataset.target));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Handle input change
   */
  function handleInput() {
    const input = elements.nameInput.value.trim();

    if (!input) {
      resetOutput();
      return;
    }

    // Detect conventions
    detectConventions(input);

    // Convert to all conventions
    convertToAll(input);

    // Validate
    validateName(input);

    // Highlight matching cards
    highlightMatchingCards(input);
  }

  /**
   * Detect which conventions the input matches
   */
  function detectConventions(input) {
    const detected = [];

    // Check each convention
    Object.entries(conventions).forEach(([name, conv]) => {
      if (conv.pattern.test(input)) {
        detected.push(name);
      }
    });

    // Also check if it's a simple lowercase single word
    if (/^[a-z]+$/.test(input) && input.length > 0) {
      if (!detected.includes('flatcase')) {
        detected.push('flatcase');
      }
    }

    // Display results
    if (detected.length === 0) {
      elements.detectionResult.innerHTML = `
        <span class="detected-badge secondary">
          <i class="fa-solid fa-question"></i>
          No standard convention detected
        </span>
      `;
    } else {
      elements.detectionResult.innerHTML = detected.map((name, i) => `
        <span class="detected-badge${i > 0 ? ' secondary' : ''}">
          <i class="fa-solid fa-check"></i>
          ${name}
        </span>
      `).join('');
    }
  }

  /**
   * Convert input to all naming conventions
   */
  function convertToAll(input) {
    // Parse input into words
    const words = parseWords(input);

    if (words.length === 0) {
      resetConversions();
      return;
    }

    // camelCase
    elements.camelCaseValue.textContent = words.map((word, i) =>
      i === 0 ? word.toLowerCase() : capitalize(word)
    ).join('');

    // PascalCase
    elements.PascalCaseValue.textContent = words.map(word => capitalize(word)).join('');

    // snake_case
    elements.snake_caseValue.textContent = words.map(word => word.toLowerCase()).join('_');

    // SCREAMING_SNAKE_CASE
    elements.SCREAMING_SNAKE_CASEValue.textContent = words.map(word => word.toUpperCase()).join('_');

    // kebab-case
    elements['kebab-caseValue'].textContent = words.map(word => word.toLowerCase()).join('-');

    // flatcase
    elements.flatcaseValue.textContent = words.map(word => word.toLowerCase()).join('');
  }

  /**
   * Parse input string into words
   */
  function parseWords(input) {
    // Handle different separators and patterns
    let words = [];

    // Check for snake_case or SCREAMING_SNAKE_CASE
    if (input.includes('_')) {
      words = input.split('_').filter(w => w.length > 0);
    }
    // Check for kebab-case
    else if (input.includes('-')) {
      words = input.split('-').filter(w => w.length > 0);
    }
    // Check for camelCase or PascalCase
    else if (/[a-z][A-Z]/.test(input) || /^[A-Z]/.test(input)) {
      // Split on uppercase letters, keeping them
      words = input.split(/(?=[A-Z])/).filter(w => w.length > 0);
    }
    // Single word
    else {
      words = [input];
    }

    return words;
  }

  /**
   * Capitalize first letter
   */
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  /**
   * Validate the name
   */
  function validateName(input) {
    const rules = [
      {
        name: 'Starts with letter',
        check: /^[a-zA-Z]/.test(input)
      },
      {
        name: 'No spaces',
        check: !/\s/.test(input)
      },
      {
        name: 'No special chars',
        check: /^[a-zA-Z0-9_-]+$/.test(input)
      },
      {
        name: 'Not too long',
        check: input.length <= 50
      },
      {
        name: 'Not reserved word',
        check: !isReservedWord(input)
      },
      {
        name: 'Consistent style',
        check: hasConsistentStyle(input)
      }
    ];

    const allPassed = rules.every(r => r.check);

    // Update validation message
    elements.validationItem.classList.toggle('valid', allPassed);
    elements.validationItem.classList.toggle('invalid', !allPassed);
    elements.validationIcon.className = allPassed
      ? 'fa-solid fa-circle-check'
      : 'fa-solid fa-circle-xmark';
    elements.validationMessage.textContent = allPassed
      ? 'Valid identifier name'
      : 'Some validation rules failed';

    // Display rules
    elements.validationRules.innerHTML = rules.map(rule => `
      <div class="validation-rule ${rule.check ? 'pass' : 'fail'}">
        <i class="fa-solid ${rule.check ? 'fa-check' : 'fa-xmark'}"></i>
        <span>${rule.name}</span>
      </div>
    `).join('');
  }

  /**
   * Check if word is reserved
   */
  function isReservedWord(word) {
    const reserved = [
      'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
      'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
      'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
      'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
      'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
      'protected', 'public', 'static', 'yield', 'null', 'true', 'false'
    ];
    return reserved.includes(word.toLowerCase());
  }

  /**
   * Check if name has consistent style
   */
  function hasConsistentStyle(input) {
    // Check if it matches at least one convention pattern
    return Object.values(conventions).some(conv => conv.pattern.test(input));
  }

  /**
   * Highlight matching conversion cards
   */
  function highlightMatchingCards(input) {
    document.querySelectorAll('.conversion-card').forEach(card => {
      const convention = card.dataset.convention;
      const conv = conventions[convention];
      card.classList.toggle('active', conv && conv.pattern.test(input));
    });
  }

  /**
   * Reset output displays
   */
  function resetOutput() {
    elements.detectionResult.innerHTML = '<span class="detection-placeholder">Enter a name to detect its convention</span>';
    resetConversions();

    elements.validationItem.classList.remove('valid', 'invalid');
    elements.validationIcon.className = 'fa-solid fa-circle-check';
    elements.validationMessage.textContent = 'Enter a name to validate';
    elements.validationRules.innerHTML = '';

    document.querySelectorAll('.conversion-card').forEach(card => {
      card.classList.remove('active');
    });
  }

  /**
   * Reset conversion values
   */
  function resetConversions() {
    elements.camelCaseValue.textContent = '-';
    elements.PascalCaseValue.textContent = '-';
    elements.snake_caseValue.textContent = '-';
    elements.SCREAMING_SNAKE_CASEValue.textContent = '-';
    elements['kebab-caseValue'].textContent = '-';
    elements.flatcaseValue.textContent = '-';
  }

  /**
   * Load a sample name
   */
  function loadSample() {
    const sample = samples[Math.floor(Math.random() * samples.length)];
    elements.nameInput.value = sample;
    handleInput();
    ToolsCommon.Toast.show('Sample loaded', 'success');
  }

  /**
   * Clear input
   */
  function clearInput() {
    elements.nameInput.value = '';
    resetOutput();
    elements.nameInput.focus();
    ToolsCommon.Toast.show('Input cleared', 'info');
  }

  /**
   * Paste from clipboard
   */
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      // Take only first word/line
      const firstWord = text.trim().split(/\s+/)[0];
      elements.nameInput.value = firstWord;
      handleInput();
      ToolsCommon.Toast.show('Pasted from clipboard', 'success');
    } catch (e) {
      ToolsCommon.Toast.show('Failed to paste', 'error');
    }
  }

  /**
   * Copy value to clipboard
   */
  function copyValue(targetId) {
    const element = document.getElementById(targetId);
    const value = element.textContent;

    if (value === '-') {
      ToolsCommon.Toast.show('Nothing to copy', 'error');
      return;
    }

    ToolsCommon.Clipboard.copy(value);
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Escape - Clear
    if (e.key === 'Escape') {
      clearInput();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
