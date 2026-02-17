/**
 * KVSOVANREACH Email Validator
 */

(function() {
  'use strict';

  const COMMON_TLDS = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'co', 'io', 'dev', 'app', 'uk', 'de', 'fr', 'jp', 'cn', 'au', 'ca', 'br', 'in', 'ru', 'info', 'biz', 'me', 'tv', 'cc', 'us'];

  const elements = {};

  function initElements() {
    elements.emailInput = document.getElementById('emailInput');
    elements.resultStatus = document.getElementById('resultStatus');
    elements.checksList = document.getElementById('checksList');
    elements.localPart = document.getElementById('localPart');
    elements.domainPart = document.getElementById('domainPart');
    elements.tldPart = document.getElementById('tldPart');
    elements.clearBtn = document.getElementById('clearBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function validateEmail(email) {
    const checks = {
      format: false,
      local: false,
      domain: false,
      tld: false,
      length: false
    };

    email = email.trim();

    if (!email) {
      return { valid: false, checks, parts: {} };
    }

    checks.length = email.length >= 3 && email.length <= 254;

    const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    checks.format = basicRegex.test(email);

    const parts = email.split('@');
    let local = '', domain = '', tld = '';

    if (parts.length === 2) {
      local = parts[0];
      domain = parts[1];

      const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
      checks.local = local.length >= 1 && local.length <= 64 && localRegex.test(local) && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');

      const domainParts = domain.split('.');
      if (domainParts.length >= 2) {
        tld = domainParts[domainParts.length - 1].toLowerCase();
        checks.tld = tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
        checks.domain = domainRegex.test(domain) || (domainParts.length === 2 && domainParts[0].length >= 1);
      }
    }

    const valid = Object.values(checks).every(v => v);

    return {
      valid,
      checks,
      parts: { local, domain, tld }
    };
  }

  function updateUI(result) {
    elements.resultStatus.className = 'result-status';
    if (result.valid) {
      elements.resultStatus.classList.add('valid');
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Valid Email</span>';
    } else if (elements.emailInput.value.trim()) {
      elements.resultStatus.classList.add('invalid');
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i><span>Invalid Email</span>';
    } else {
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>Enter an email to validate</span>';
    }

    Object.keys(result.checks).forEach(check => {
      const item = elements.checksList.querySelector(`[data-check="${check}"]`);
      if (item) {
        item.className = 'check-item';
        const icon = item.querySelector('.check-icon i');

        if (!elements.emailInput.value.trim()) {
          icon.className = 'fa-solid fa-minus';
        } else if (result.checks[check]) {
          item.classList.add('pass');
          icon.className = 'fa-solid fa-check';
        } else {
          item.classList.add('fail');
          icon.className = 'fa-solid fa-xmark';
        }
      }
    });

    elements.localPart.textContent = result.parts.local || '-';
    elements.domainPart.textContent = result.parts.domain || '-';
    elements.tldPart.textContent = result.parts.tld || '-';
  }

  function handleInput() {
    const result = validateEmail(elements.emailInput.value);
    updateUI(result);
  }

  function clearAll() {
    elements.emailInput.value = '';
    handleInput();
    showToast('Cleared', 'success');
  }

  function init() {
    initElements();

    elements.emailInput.addEventListener('input', handleInput);
    elements.clearBtn.addEventListener('click', clearAll);

    elements.emailInput.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
