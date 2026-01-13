/**
 * KVSOVANREACH HTTP Header Generator
 * Generate HTTP security headers
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    // CSP
    cspEnabled: document.getElementById('cspEnabled'),
    cspDefault: document.getElementById('cspDefault'),
    cspScript: document.getElementById('cspScript'),
    cspStyle: document.getElementById('cspStyle'),
    cspImg: document.getElementById('cspImg'),
    cspFont: document.getElementById('cspFont'),

    // HSTS
    hstsEnabled: document.getElementById('hstsEnabled'),
    hstsMaxAge: document.getElementById('hstsMaxAge'),
    hstsSubdomains: document.getElementById('hstsSubdomains'),
    hstsPreload: document.getElementById('hstsPreload'),

    // X-Frame-Options
    xfoEnabled: document.getElementById('xfoEnabled'),
    xfoValue: document.getElementById('xfoValue'),

    // X-Content-Type-Options
    xctoEnabled: document.getElementById('xctoEnabled'),

    // Referrer-Policy
    rpEnabled: document.getElementById('rpEnabled'),
    rpValue: document.getElementById('rpValue'),

    // Permissions-Policy
    ppEnabled: document.getElementById('ppEnabled'),
    ppCamera: document.getElementById('ppCamera'),
    ppMic: document.getElementById('ppMic'),
    ppGeo: document.getElementById('ppGeo'),

    // Cache-Control
    ccEnabled: document.getElementById('ccEnabled'),
    ccValue: document.getElementById('ccValue'),

    // Presets
    presetBtns: document.querySelectorAll('.preset-btn'),

    // Output
    outputTabs: document.querySelectorAll('.output-tab'),
    outputCode: document.getElementById('outputCode'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  // ==================== State ====================
  const state = {
    format: 'raw' // 'raw', 'nginx', 'apache', 'json'
  };

  // ==================== Presets ====================
  const PRESETS = {
    basic: {
      csp: { enabled: true, default: "'self'", script: "'self'", style: "'self' 'unsafe-inline'", img: "'self' data:", font: "'self'" },
      hsts: { enabled: true, maxAge: 31536000, subdomains: false, preload: false },
      xfo: { enabled: true, value: 'SAMEORIGIN' },
      xcto: { enabled: true },
      rp: { enabled: true, value: 'strict-origin' },
      pp: { enabled: false, camera: false, mic: false, geo: false },
      cc: { enabled: false, value: 'no-store' }
    },
    secure: {
      csp: { enabled: true, default: "'self'", script: "'self'", style: "'self'", img: "'self' data: https:", font: "'self'" },
      hsts: { enabled: true, maxAge: 31536000, subdomains: true, preload: false },
      xfo: { enabled: true, value: 'DENY' },
      xcto: { enabled: true },
      rp: { enabled: true, value: 'strict-origin-when-cross-origin' },
      pp: { enabled: true, camera: true, mic: true, geo: true },
      cc: { enabled: false, value: 'no-store' }
    },
    strict: {
      csp: { enabled: true, default: "'none'", script: "'self'", style: "'self'", img: "'self'", font: "'self'" },
      hsts: { enabled: true, maxAge: 63072000, subdomains: true, preload: true },
      xfo: { enabled: true, value: 'DENY' },
      xcto: { enabled: true },
      rp: { enabled: true, value: 'no-referrer' },
      pp: { enabled: true, camera: true, mic: true, geo: true },
      cc: { enabled: true, value: 'no-store' }
    }
  };

  // ==================== Core Functions ====================

  function getHeaders() {
    const headers = {};

    // Content-Security-Policy
    if (elements.cspEnabled.checked) {
      const directives = [];
      if (elements.cspDefault.value) directives.push(`default-src ${elements.cspDefault.value}`);
      if (elements.cspScript.value) directives.push(`script-src ${elements.cspScript.value}`);
      if (elements.cspStyle.value) directives.push(`style-src ${elements.cspStyle.value}`);
      if (elements.cspImg.value) directives.push(`img-src ${elements.cspImg.value}`);
      if (elements.cspFont.value) directives.push(`font-src ${elements.cspFont.value}`);
      if (directives.length > 0) {
        headers['Content-Security-Policy'] = directives.join('; ');
      }
    }

    // Strict-Transport-Security
    if (elements.hstsEnabled.checked) {
      let value = `max-age=${elements.hstsMaxAge.value}`;
      if (elements.hstsSubdomains.checked) value += '; includeSubDomains';
      if (elements.hstsPreload.checked) value += '; preload';
      headers['Strict-Transport-Security'] = value;
    }

    // X-Frame-Options
    if (elements.xfoEnabled.checked) {
      headers['X-Frame-Options'] = elements.xfoValue.value;
    }

    // X-Content-Type-Options
    if (elements.xctoEnabled.checked) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // Referrer-Policy
    if (elements.rpEnabled.checked) {
      headers['Referrer-Policy'] = elements.rpValue.value;
    }

    // Permissions-Policy
    if (elements.ppEnabled.checked) {
      const policies = [];
      if (elements.ppCamera.checked) policies.push('camera=()');
      if (elements.ppMic.checked) policies.push('microphone=()');
      if (elements.ppGeo.checked) policies.push('geolocation=()');
      if (policies.length > 0) {
        headers['Permissions-Policy'] = policies.join(', ');
      }
    }

    // Cache-Control
    if (elements.ccEnabled.checked) {
      headers['Cache-Control'] = elements.ccValue.value;
    }

    return headers;
  }

  function formatRaw(headers) {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  function formatNginx(headers) {
    return Object.entries(headers)
      .map(([key, value]) => `add_header ${key} "${value}";`)
      .join('\n');
  }

  function formatApache(headers) {
    return Object.entries(headers)
      .map(([key, value]) => `Header set ${key} "${value}"`)
      .join('\n');
  }

  function formatJSON(headers) {
    return JSON.stringify(headers, null, 2);
  }

  function formatOutput(headers) {
    switch (state.format) {
      case 'nginx': return formatNginx(headers);
      case 'apache': return formatApache(headers);
      case 'json': return formatJSON(headers);
      default: return formatRaw(headers);
    }
  }

  // ==================== UI Functions ====================

  function updateOutput() {
    const headers = getHeaders();
    const output = formatOutput(headers);
    elements.outputCode.textContent = output || '# No headers selected';
  }

  function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;

    // CSP
    elements.cspEnabled.checked = preset.csp.enabled;
    elements.cspDefault.value = preset.csp.default;
    elements.cspScript.value = preset.csp.script;
    elements.cspStyle.value = preset.csp.style;
    elements.cspImg.value = preset.csp.img;
    elements.cspFont.value = preset.csp.font;

    // HSTS
    elements.hstsEnabled.checked = preset.hsts.enabled;
    elements.hstsMaxAge.value = preset.hsts.maxAge;
    elements.hstsSubdomains.checked = preset.hsts.subdomains;
    elements.hstsPreload.checked = preset.hsts.preload;

    // X-Frame-Options
    elements.xfoEnabled.checked = preset.xfo.enabled;
    elements.xfoValue.value = preset.xfo.value;

    // X-Content-Type-Options
    elements.xctoEnabled.checked = preset.xcto.enabled;

    // Referrer-Policy
    elements.rpEnabled.checked = preset.rp.enabled;
    elements.rpValue.value = preset.rp.value;

    // Permissions-Policy
    elements.ppEnabled.checked = preset.pp.enabled;
    elements.ppCamera.checked = preset.pp.camera;
    elements.ppMic.checked = preset.pp.mic;
    elements.ppGeo.checked = preset.pp.geo;

    // Cache-Control
    elements.ccEnabled.checked = preset.cc.enabled;
    elements.ccValue.value = preset.cc.value;

    updateOutput();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.info(`Applied ${presetName} preset`);
    }
  }

  function reset() {
    applyPreset('basic');
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.info('Reset to defaults');
    }
  }

  function copyOutput() {
    const headers = getHeaders();
    const output = formatOutput(headers);
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Clipboard.copy(output);
    }
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case 'r':
        reset();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Add event listeners to all config inputs
    const inputs = document.querySelectorAll('.config-card input, .config-card select');
    inputs.forEach(input => {
      input.addEventListener('change', updateOutput);
      input.addEventListener('input', updateOutput);
    });

    // Preset buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Output format tabs
    elements.outputTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.outputTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.format = tab.dataset.format;
        updateOutput();
      });
    });

    // Copy button
    elements.copyBtn.addEventListener('click', copyOutput);

    // Reset button
    elements.resetBtn.addEventListener('click', reset);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Initial render
    updateOutput();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
