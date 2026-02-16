/**
 * Code Formatter Tool
 * Beautify and minify HTML, CSS, and JavaScript code
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    currentLang: 'html',
    options: {
      indentSize: 2,
      useTabs: false,
      lineWidth: 120,
      semicolons: true,
      singleQuote: false
    }
  };

  // Sample code for each language
  const sampleCode = {
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sample Page</title><link rel="stylesheet" href="styles.css"></head><body><header><nav><ul><li><a href="/">Home</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul></nav></header><main><section class="hero"><h1>Welcome to Our Website</h1><p>This is a sample HTML document for testing the code formatter.</p><button onclick="handleClick()">Click Me</button></section></main><footer><p>&copy; 2024 Sample Company</p></footer></body></html>`,

    css: `.container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;background-color:#f5f5f5}.card{background:white;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);padding:24px;margin:16px;max-width:400px;width:100%}.card h2{margin:0 0 16px;color:#333;font-size:24px}.card p{color:#666;line-height:1.6}.button{display:inline-block;padding:12px 24px;background-color:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;transition:background-color 0.3s}.button:hover{background-color:#0056b3}`,

    javascript: `const users=[];function addUser(name,email,age){if(!name||!email){throw new Error("Name and email are required")}const user={id:Date.now(),name:name,email:email,age:age||null,createdAt:new Date().toISOString()};users.push(user);return user}function findUserByEmail(email){return users.find(user=>user.email===email)}function updateUser(id,updates){const index=users.findIndex(user=>user.id===id);if(index===-1){return null}users[index]={...users[index],...updates};return users[index]}async function fetchUsers(){try{const response=await fetch("/api/users");if(!response.ok){throw new Error("Failed to fetch users")}const data=await response.json();return data}catch(error){console.error("Error:",error);return[]}}`,

    json: `{"name":"project-name","version":"1.0.0","description":"A sample project configuration","main":"index.js","scripts":{"start":"node index.js","dev":"nodemon index.js","build":"webpack --mode production","test":"jest","lint":"eslint src/"},"dependencies":{"express":"^4.18.2","mongoose":"^7.0.0","dotenv":"^16.0.3"},"devDependencies":{"jest":"^29.5.0","eslint":"^8.36.0","nodemon":"^2.0.22"},"author":"John Doe","license":"MIT"}`
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Language tabs
    langTabs: document.querySelectorAll('.lang-tab'),

    // Input/Output
    codeInput: document.getElementById('codeInput'),
    codeOutput: document.getElementById('codeOutput'),
    inputChars: document.getElementById('inputChars'),
    inputLines: document.getElementById('inputLines'),
    outputChars: document.getElementById('outputChars'),
    outputLines: document.getElementById('outputLines'),
    sizeDiff: document.getElementById('sizeDiff'),

    // Options
    indentSize: document.getElementById('indentSize'),
    lineWidth: document.getElementById('lineWidth'),
    semicolons: document.getElementById('semicolons'),
    singleQuote: document.getElementById('singleQuote'),
    semicolonsGroup: document.getElementById('semicolonsGroup'),
    singleQuoteGroup: document.getElementById('singleQuoteGroup'),

    // Buttons
    beautifyBtn: document.getElementById('beautifyBtn'),
    minifyBtn: document.getElementById('minifyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

    // Error
    errorDisplay: document.getElementById('errorDisplay'),
    errorMessage: document.getElementById('errorMessage'),

    // Other
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
    updateStats();
    updateJsOptions();
  }

  function initEventListeners() {
    // Language tabs
    elements.langTabs.forEach(tab => {
      tab.addEventListener('click', () => switchLanguage(tab.dataset.lang));
    });

    // Input changes
    elements.codeInput?.addEventListener('input', () => {
      updateStats();
      hideError();
    });

    // Options
    elements.indentSize?.addEventListener('change', (e) => {
      if (e.target.value === 'tab') {
        state.options.useTabs = true;
        state.options.indentSize = 2;
      } else {
        state.options.useTabs = false;
        state.options.indentSize = parseInt(e.target.value);
      }
    });

    elements.lineWidth?.addEventListener('change', (e) => {
      state.options.lineWidth = parseInt(e.target.value);
    });

    elements.semicolons?.addEventListener('change', (e) => {
      state.options.semicolons = e.target.checked;
    });

    elements.singleQuote?.addEventListener('change', (e) => {
      state.options.singleQuote = e.target.checked;
    });

    // Action buttons
    elements.beautifyBtn?.addEventListener('click', beautifyCode);
    elements.minifyBtn?.addEventListener('click', minifyCode);
    elements.clearBtn?.addEventListener('click', clearAll);
    elements.pasteBtn?.addEventListener('click', pasteFromClipboard);
    elements.sampleBtn?.addEventListener('click', loadSampleCode);
    elements.copyBtn?.addEventListener('click', copyOutput);
    elements.downloadBtn?.addEventListener('click', downloadOutput);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Language Switching
  // ============================================
  function switchLanguage(lang) {
    state.currentLang = lang;

    elements.langTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.lang === lang);
    });

    updateJsOptions();
    hideError();
  }

  function updateJsOptions() {
    const isJs = state.currentLang === 'javascript';
    elements.semicolonsGroup?.classList.toggle('show', isJs);
    elements.singleQuoteGroup?.classList.toggle('show', isJs);
  }

  // ============================================
  // Formatting Functions
  // ============================================
  async function beautifyCode() {
    const code = elements.codeInput.value.trim();
    if (!code) {
      showToast('Please enter some code first', 'error');
      return;
    }

    try {
      hideError();
      let formatted;

      if (typeof prettier !== 'undefined') {
        const options = {
          tabWidth: state.options.indentSize,
          useTabs: state.options.useTabs,
          printWidth: state.options.lineWidth
        };

        switch (state.currentLang) {
          case 'html':
            formatted = await prettier.format(code, {
              ...options,
              parser: 'html',
              plugins: prettierPlugins
            });
            break;
          case 'css':
            formatted = await prettier.format(code, {
              ...options,
              parser: 'css',
              plugins: prettierPlugins
            });
            break;
          case 'javascript':
            formatted = await prettier.format(code, {
              ...options,
              parser: 'babel',
              plugins: prettierPlugins,
              semi: state.options.semicolons,
              singleQuote: state.options.singleQuote
            });
            break;
          case 'json':
            formatted = await prettier.format(code, {
              ...options,
              parser: 'json',
              plugins: prettierPlugins
            });
            break;
        }
      } else {
        // Fallback simple formatting
        formatted = simpleBeautify(code, state.currentLang);
      }

      elements.codeOutput.textContent = formatted.trim();
      updateOutputStats();
      showToast('Code beautified!', 'success');
    } catch (error) {
      showError(error.message);
    }
  }

  function minifyCode() {
    const code = elements.codeInput.value.trim();
    if (!code) {
      showToast('Please enter some code first', 'error');
      return;
    }

    try {
      hideError();
      let minified;

      switch (state.currentLang) {
        case 'html':
          minified = minifyHtml(code);
          break;
        case 'css':
          minified = minifyCss(code);
          break;
        case 'javascript':
          minified = minifyJs(code);
          break;
        case 'json':
          minified = JSON.stringify(JSON.parse(code));
          break;
      }

      elements.codeOutput.textContent = minified;
      updateOutputStats();
      showToast('Code minified!', 'success');
    } catch (error) {
      showError(error.message);
    }
  }

  // Simple minification functions
  function minifyHtml(code) {
    return code
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*=\s*/g, '=')
      .trim();
  }

  function minifyCss(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*,\s*/g, ',')
      .replace(/;}/g, '}')
      .trim();
  }

  function minifyJs(code) {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:<>=+\-*/&|!?])\s*/g, '$1')
      .trim();
  }

  // Fallback simple beautify
  function simpleBeautify(code, lang) {
    if (lang === 'json') {
      return JSON.stringify(JSON.parse(code), null, state.options.indentSize);
    }
    return code;
  }

  // ============================================
  // Stats Functions
  // ============================================
  function updateStats() {
    const code = elements.codeInput.value;
    const chars = code.length;
    const lines = code ? code.split('\n').length : 0;

    elements.inputChars.textContent = `${chars.toLocaleString()} characters`;
    elements.inputLines.textContent = `${lines.toLocaleString()} lines`;
  }

  function updateOutputStats() {
    const input = elements.codeInput.value;
    const output = elements.codeOutput.textContent;
    const inputChars = input.length;
    const outputChars = output.length;
    const outputLines = output ? output.split('\n').length : 0;

    elements.outputChars.textContent = `${outputChars.toLocaleString()} characters`;
    elements.outputLines.textContent = `${outputLines.toLocaleString()} lines`;

    // Calculate size difference
    if (inputChars > 0) {
      const diff = outputChars - inputChars;
      const percent = ((diff / inputChars) * 100).toFixed(1);

      if (diff > 0) {
        elements.sizeDiff.textContent = `+${diff} chars (+${percent}%)`;
        elements.sizeDiff.className = 'size-diff positive';
      } else if (diff < 0) {
        elements.sizeDiff.textContent = `${diff} chars (${percent}%)`;
        elements.sizeDiff.className = 'size-diff negative';
      } else {
        elements.sizeDiff.textContent = 'No change';
        elements.sizeDiff.className = 'size-diff';
      }
    } else {
      elements.sizeDiff.textContent = '';
    }
  }

  // ============================================
  // Utility Functions
  // ============================================
  function clearAll() {
    elements.codeInput.value = '';
    elements.codeOutput.textContent = '';
    updateStats();
    elements.outputChars.textContent = '0 characters';
    elements.outputLines.textContent = '0 lines';
    elements.sizeDiff.textContent = '';
    hideError();
    showToast('Cleared', 'success');
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.codeInput.value = text;
      updateStats();
      showToast('Pasted from clipboard', 'success');
    } catch (error) {
      showToast('Failed to paste from clipboard', 'error');
    }
  }

  function loadSampleCode() {
    elements.codeInput.value = sampleCode[state.currentLang];
    updateStats();
    showToast('Sample code loaded', 'success');
  }

  function copyOutput() {
    const output = elements.codeOutput.textContent;
    if (!output) {
      showToast('Nothing to copy', 'error');
      return;
    }

    navigator.clipboard.writeText(output).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  function downloadOutput() {
    const output = elements.codeOutput.textContent;
    if (!output) {
      showToast('Nothing to download', 'error');
      return;
    }

    const extensions = {
      html: 'html',
      css: 'css',
      javascript: 'js',
      json: 'json'
    };

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${extensions[state.currentLang]}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  }

  // ============================================
  // Error Handling
  // ============================================
  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorDisplay.style.display = 'flex';
  }

  function hideError() {
    elements.errorDisplay.style.display = 'none';
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    // Shortcuts that work even in textarea
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        minifyCode();
      } else {
        beautifyCode();
      }
      return;
    }

    // Ignore other shortcuts if typing in textarea
    if (e.target.matches('textarea')) return;

    switch (e.key) {
      case '1':
        e.preventDefault();
        switchLanguage('html');
        break;
      case '2':
        e.preventDefault();
        switchLanguage('css');
        break;
      case '3':
        e.preventDefault();
        switchLanguage('javascript');
        break;
      case '4':
        e.preventDefault();
        switchLanguage('json');
        break;
    }
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
