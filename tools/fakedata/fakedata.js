/**
 * KVSOVANREACH Fake Data Generator
 */

(function() {
  'use strict';

  const DATA = {
    firstNames: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Oliver', 'Ava', 'Liam', 'Sophia', 'Noah', 'Isabella', 'Ethan', 'Mia', 'Lucas'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'],
    domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'],
    companyTypes: ['Inc', 'LLC', 'Corp', 'Co', 'Ltd', 'Group', 'Solutions', 'Technologies', 'Systems', 'Enterprises'],
    companyNames: ['Alpha', 'Beta', 'Global', 'Prime', 'Elite', 'Apex', 'Nova', 'Quantum', 'Vertex', 'Zenith', 'Stellar', 'Nexus', 'Vanguard', 'Pioneer', 'Summit'],
    streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine St', 'Elm Ave', 'Park Blvd', 'Lake Dr', 'Hill Rd', 'River Way', 'Forest Ave', 'Valley Dr', 'Mountain Rd', 'Ocean Blvd', 'Sunset Ave'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Seattle', 'Denver', 'Boston'],
    states: ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'WA', 'AZ', 'MA', 'CO', 'VA']
  };

  const state = {
    type: 'person'
  };

  const elements = {};

  function initElements() {
    elements.dataTypeBtns = document.querySelectorAll('.tool-tab[data-type]');
    elements.generatedData = document.getElementById('generatedData');
    elements.generateBtn = document.getElementById('generateBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generatePerson() {
    const firstName = random(DATA.firstNames);
    const lastName = random(DATA.lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${random(DATA.domains)}`;
    const phone = `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
    const dob = `${randomInt(1960, 2005)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`;

    return [
      { label: 'First Name', value: firstName },
      { label: 'Last Name', value: lastName },
      { label: 'Email', value: email },
      { label: 'Phone', value: phone },
      { label: 'Date of Birth', value: dob }
    ];
  }

  function generateCompany() {
    const name = `${random(DATA.companyNames)} ${random(DATA.companyTypes)}`;
    const phone = `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
    const employees = randomInt(10, 10000);
    const founded = randomInt(1950, 2023);

    return [
      { label: 'Company Name', value: name },
      { label: 'Phone', value: phone },
      { label: 'Employees', value: employees.toLocaleString() },
      { label: 'Founded', value: founded.toString() },
      { label: 'Industry', value: random(['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing']) }
    ];
  }

  function generateAddress() {
    const street = `${randomInt(100, 9999)} ${random(DATA.streets)}`;
    const city = random(DATA.cities);
    const stateCode = random(DATA.states);
    const zip = String(randomInt(10000, 99999));

    return [
      { label: 'Street', value: street },
      { label: 'City', value: city },
      { label: 'State', value: stateCode },
      { label: 'ZIP Code', value: zip },
      { label: 'Country', value: 'United States' }
    ];
  }

  function generateInternet() {
    const username = `${random(DATA.firstNames).toLowerCase()}${randomInt(1, 999)}`;
    const password = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2, 6);
    const ip = `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`;
    const mac = Array.from({ length: 6 }, () => randomInt(0, 255).toString(16).padStart(2, '0')).join(':').toUpperCase();

    return [
      { label: 'Username', value: username },
      { label: 'Password', value: password },
      { label: 'IPv4', value: ip },
      { label: 'MAC Address', value: mac },
      { label: 'User Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    ];
  }

  function generateFinance() {
    const cardNumber = Array.from({ length: 4 }, () => String(randomInt(1000, 9999))).join(' ');
    const cvv = String(randomInt(100, 999));
    const expiry = `${String(randomInt(1, 12)).padStart(2, '0')}/${randomInt(25, 30)}`;
    const iban = `US${randomInt(10, 99)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`;

    return [
      { label: 'Card Number', value: cardNumber },
      { label: 'CVV', value: cvv },
      { label: 'Expiry', value: expiry },
      { label: 'IBAN', value: iban },
      { label: 'Account Type', value: random(['Checking', 'Savings', 'Credit']) }
    ];
  }

  function generateData() {
    const generators = {
      person: generatePerson,
      company: generateCompany,
      address: generateAddress,
      internet: generateInternet,
      finance: generateFinance
    };

    const data = generators[state.type]();
    renderData(data);
  }

  function renderData(data) {
    elements.generatedData.innerHTML = data.map(item => `
      <div class="data-item">
        <span class="data-label">${item.label}</span>
        <span class="data-value">${item.value}</span>
        <button class="copy-item-btn" data-value="${item.value}" title="Copy">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `).join('');

    elements.generatedData.querySelectorAll('.copy-item-btn').forEach(btn => {
      btn.addEventListener('click', () => copyItem(btn.dataset.value));
    });
  }

  function copyItem(value) {
    navigator.clipboard.writeText(value).then(() => {
      showToast('Copied!', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  function setType(type) {
    state.type = type;
    elements.dataTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    generateData();
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;
    if (e.key === ' ') {
      e.preventDefault();
      generateData();
    }
  }

  function init() {
    initElements();

    elements.dataTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => setType(btn.dataset.type));
    });

    elements.generateBtn.addEventListener('click', generateData);
    document.addEventListener('keydown', handleKeydown);

    generateData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
