/**
 * KVSOVANREACH Prime Checker Tool
 * Check if a number is prime with detailed explanation
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    numberInput: document.getElementById('numberInput'),
    checkBtn: document.getElementById('checkBtn'),
    clearBtn: document.getElementById('clearBtn'),
    inputHint: document.getElementById('inputHint'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    resultSection: document.getElementById('resultSection'),
    resultCard: document.getElementById('resultCard'),
    resultIcon: document.getElementById('resultIcon'),
    resultNumber: document.getElementById('resultNumber'),
    resultLabel: document.getElementById('resultLabel'),
    factorsSection: document.getElementById('factorsSection'),
    factorsList: document.getElementById('factorsList'),
    explanationSection: document.getElementById('explanationSection'),
    explanationContent: document.getElementById('explanationContent'),
    digitCount: document.getElementById('digitCount'),
    evenOdd: document.getElementById('evenOdd'),
    divBy3: document.getElementById('divBy3'),
    divBy5: document.getElementById('divBy5'),
    emptyState: document.getElementById('emptyState')
  };

  // ==================== Core Functions ====================

  /**
   * Check if a number is prime
   */
  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * Get all factors of a number
   */
  function getFactors(n) {
    const factors = [];
    const sqrt = Math.sqrt(n);

    for (let i = 1; i <= sqrt; i++) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) {
          factors.push(n / i);
        }
      }
    }

    return factors.sort((a, b) => a - b);
  }

  /**
   * Get factor pairs
   */
  function getFactorPairs(n) {
    const pairs = [];
    const sqrt = Math.sqrt(n);

    for (let i = 1; i <= sqrt; i++) {
      if (n % i === 0) {
        pairs.push([i, n / i]);
      }
    }

    return pairs;
  }

  /**
   * Generate explanation steps
   */
  function generateExplanation(n, prime) {
    const steps = [];

    if (n < 2) {
      steps.push(`The number ${n} is less than 2.`);
      steps.push(`By definition, prime numbers must be greater than 1.`);
      steps.push(`Therefore, ${n} is not a prime number.`);
      return steps;
    }

    if (n === 2) {
      steps.push(`The number 2 is the smallest and only even prime number.`);
      steps.push(`It can only be divided by 1 and itself.`);
      return steps;
    }

    const sqrt = Math.floor(Math.sqrt(n));
    steps.push(`To check if ${n} is prime, we test divisibility up to √${n} ≈ ${sqrt}.`);

    if (n % 2 === 0) {
      steps.push(`${n} is even (divisible by 2).`);
      steps.push(`Since ${n} ÷ 2 = ${n / 2}, it has factors other than 1 and itself.`);
      return steps;
    }

    steps.push(`${n} is odd, so we skip even divisors.`);

    if (prime) {
      steps.push(`Testing odd numbers from 3 to ${sqrt}: none divide ${n} evenly.`);
      steps.push(`Therefore, ${n} is a prime number!`);
    } else {
      // Find the smallest factor
      for (let i = 3; i <= sqrt; i += 2) {
        if (n % i === 0) {
          steps.push(`Found: ${n} ÷ ${i} = ${n / i}`);
          steps.push(`Since ${n} has factors other than 1 and itself, it is not prime.`);
          break;
        }
      }
    }

    return steps;
  }

  /**
   * Validate input
   */
  function validateInput(value) {
    if (value === '') {
      return { valid: false, error: '' };
    }

    // Remove leading zeros but keep "0"
    const cleanValue = value.replace(/^0+/, '') || '0';

    // Check if it's a valid positive integer
    if (!/^\d+$/.test(value)) {
      return { valid: false, error: 'Please enter a positive integer only.' };
    }

    const num = parseInt(cleanValue, 10);

    if (num > Number.MAX_SAFE_INTEGER) {
      return { valid: false, error: 'Number is too large. Max: 9,007,199,254,740,991' };
    }

    return { valid: true, number: num };
  }

  // ==================== UI Functions ====================

  /**
   * Check the number and display results
   */
  function checkNumber() {
    const value = elements.numberInput.value.trim();
    const validation = validateInput(value);

    if (!validation.valid) {
      elements.inputHint.textContent = validation.error;
      return;
    }

    elements.inputHint.textContent = '';
    const num = validation.number;
    const prime = isPrime(num);

    // Update result card
    elements.resultNumber.textContent = num.toLocaleString();

    if (num < 2) {
      elements.resultCard.className = 'result-card invalid';
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      elements.resultLabel.textContent = 'is not a valid candidate (must be ≥ 2)';
    } else if (prime) {
      elements.resultCard.className = 'result-card prime';
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
      elements.resultLabel.textContent = 'is a prime number';
    } else {
      elements.resultCard.className = 'result-card not-prime';
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-times"></i>';
      elements.resultLabel.textContent = 'is not a prime number';
    }

    // Update factors
    const factors = getFactors(num);
    elements.factorsList.innerHTML = '';

    if (num >= 2) {
      factors.forEach(f => {
        const span = document.createElement('span');
        span.className = 'factor-item';
        if (f === 1 || f === num) {
          span.classList.add('highlight');
        }
        span.textContent = f.toLocaleString();
        elements.factorsList.appendChild(span);
      });
      elements.factorsSection.style.display = 'block';
    } else {
      elements.factorsSection.style.display = 'none';
    }

    // Update explanation
    const steps = generateExplanation(num, prime);
    elements.explanationContent.innerHTML = steps.map((step, i) => `
      <div class="step">
        <span class="step-num">${i + 1}</span>
        <span class="step-text">${step}</span>
      </div>
    `).join('');

    // Update number info
    elements.digitCount.textContent = num.toString().length;
    elements.evenOdd.textContent = num % 2 === 0 ? 'Even' : 'Odd';
    elements.divBy3.textContent = num % 3 === 0 ? 'Yes' : 'No';
    elements.divBy5.textContent = num % 5 === 0 ? 'Yes' : 'No';

    // Show results
    elements.resultSection.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
  }

  /**
   * Clear everything
   */
  function clearAll() {
    elements.numberInput.value = '';
    elements.inputHint.textContent = '';
    elements.resultSection.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    elements.numberInput.focus();
  }

  // ==================== Event Handlers ====================

  function handleInputKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkNumber();
    } else if (e.key === 'Escape') {
      clearAll();
    }
  }

  function handleQuickClick(e) {
    const value = e.target.dataset.value;
    if (value) {
      elements.numberInput.value = value;
      checkNumber();
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Event listeners
    elements.checkBtn.addEventListener('click', checkNumber);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.numberInput.addEventListener('keydown', handleInputKeydown);

    // Quick test buttons
    elements.quickBtns.forEach(btn => {
      btn.addEventListener('click', handleQuickClick);
    });

    // Input validation (only allow digits)
    elements.numberInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      elements.inputHint.textContent = '';
    });

    // Focus input on load
    elements.numberInput.focus();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
