/**
 * KVSOVANREACH Card Validator
 */

(function() {
  'use strict';

  const CARD_TYPES = {
    visa: { pattern: /^4/, lengths: [13, 16, 19], icon: 'fa-brands fa-cc-visa' },
    mastercard: { pattern: /^5[1-5]|^2[2-7]/, lengths: [16], icon: 'fa-brands fa-cc-mastercard' },
    amex: { pattern: /^3[47]/, lengths: [15], icon: 'fa-brands fa-cc-amex' },
    discover: { pattern: /^6(?:011|5)/, lengths: [16, 19], icon: 'fa-brands fa-cc-discover' },
    diners: { pattern: /^3(?:0[0-5]|[68])/, lengths: [14], icon: 'fa-brands fa-cc-diners-club' },
    jcb: { pattern: /^(?:2131|1800|35)/, lengths: [16], icon: 'fa-brands fa-cc-jcb' }
  };

  const elements = {};

  function initElements() {
    elements.cardNumber = document.getElementById('cardNumber');
    elements.displayNumber = document.getElementById('displayNumber');
    elements.cardBrand = document.getElementById('cardBrand');
    elements.resultStatus = document.getElementById('resultStatus');
    elements.cardType = document.getElementById('cardType');
    elements.cardFormat = document.getElementById('cardFormat');
    elements.luhnCheck = document.getElementById('luhnCheck');
    elements.testBtns = document.querySelectorAll('.test-btn');
    elements.clearBtn = document.getElementById('clearBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function luhnCheck(number) {
    const digits = number.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  function detectCardType(number) {
    const cleaned = number.replace(/\D/g, '');

    for (const [name, config] of Object.entries(CARD_TYPES)) {
      if (config.pattern.test(cleaned)) {
        return { name, ...config };
      }
    }

    return null;
  }

  function formatCardNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }

  function validateCard(number) {
    const cleaned = number.replace(/\D/g, '');

    if (!cleaned) {
      return { valid: false, type: null, luhn: false };
    }

    const type = detectCardType(cleaned);
    const luhn = luhnCheck(cleaned);

    let validLength = false;
    if (type) {
      validLength = type.lengths.includes(cleaned.length);
    } else {
      validLength = cleaned.length >= 13 && cleaned.length <= 19;
    }

    return {
      valid: luhn && validLength,
      type,
      luhn,
      length: cleaned.length,
      validLength
    };
  }

  function updateUI(result) {
    const cleaned = elements.cardNumber.value.replace(/\D/g, '');

    let displayNum = '**** **** **** ****';
    if (cleaned) {
      const formatted = formatCardNumber(cleaned);
      const padding = '**** **** **** ****'.slice(formatted.length);
      displayNum = formatted + padding;
    }
    elements.displayNumber.textContent = displayNum;

    if (result.type) {
      elements.cardBrand.innerHTML = `<i class="${result.type.icon}"></i>`;
      elements.cardType.textContent = result.type.name.charAt(0).toUpperCase() + result.type.name.slice(1);
    } else {
      elements.cardBrand.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
      elements.cardType.textContent = cleaned ? 'Unknown' : '-';
    }

    elements.cardFormat.textContent = cleaned ? `${result.length} digits` : '-';
    elements.luhnCheck.textContent = cleaned ? (result.luhn ? 'Pass' : 'Fail') : '-';

    elements.resultStatus.className = 'result-status';
    if (!cleaned) {
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>Enter a card number</span>';
    } else if (result.valid) {
      elements.resultStatus.classList.add('valid');
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Valid Card Number</span>';
    } else {
      elements.resultStatus.classList.add('invalid');
      elements.resultStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i><span>Invalid Card Number</span>';
    }
  }

  function handleInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 19) value = value.slice(0, 19);
    e.target.value = formatCardNumber(value);

    const result = validateCard(value);
    updateUI(result);
  }

  function setTestNumber(number) {
    elements.cardNumber.value = formatCardNumber(number);
    const result = validateCard(number);
    updateUI(result);
  }

  function clearForm() {
    elements.cardNumber.value = '';
    updateUI({ valid: false, type: null, luhn: false });
    showToast('Cleared', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      clearForm();
    }
  }

  function init() {
    initElements();

    elements.cardNumber.addEventListener('input', handleInput);

    elements.testBtns.forEach(btn => {
      btn.addEventListener('click', () => setTestNumber(btn.dataset.number));
    });

    if (elements.clearBtn) {
      elements.clearBtn.addEventListener('click', clearForm);
    }

    document.addEventListener('keydown', handleKeydown);

    updateUI({ valid: false, type: null, luhn: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
