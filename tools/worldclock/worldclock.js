/**
 * KVSOVANREACH World Clock
 */

(function() {
  'use strict';

  const TIMEZONES = [
    // North America
    { city: 'New York', timezone: 'America/New_York', country: 'USA' },
    { city: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
    { city: 'Chicago', timezone: 'America/Chicago', country: 'USA' },
    { city: 'Houston', timezone: 'America/Chicago', country: 'USA' },
    { city: 'Phoenix', timezone: 'America/Phoenix', country: 'USA' },
    { city: 'Philadelphia', timezone: 'America/New_York', country: 'USA' },
    { city: 'San Antonio', timezone: 'America/Chicago', country: 'USA' },
    { city: 'San Diego', timezone: 'America/Los_Angeles', country: 'USA' },
    { city: 'Dallas', timezone: 'America/Chicago', country: 'USA' },
    { city: 'San Francisco', timezone: 'America/Los_Angeles', country: 'USA' },
    { city: 'Austin', timezone: 'America/Chicago', country: 'USA' },
    { city: 'Denver', timezone: 'America/Denver', country: 'USA' },
    { city: 'Seattle', timezone: 'America/Los_Angeles', country: 'USA' },
    { city: 'Boston', timezone: 'America/New_York', country: 'USA' },
    { city: 'Washington D.C.', timezone: 'America/New_York', country: 'USA' },
    { city: 'Miami', timezone: 'America/New_York', country: 'USA' },
    { city: 'Atlanta', timezone: 'America/New_York', country: 'USA' },
    { city: 'Detroit', timezone: 'America/Detroit', country: 'USA' },
    { city: 'Minneapolis', timezone: 'America/Chicago', country: 'USA' },
    { city: 'Las Vegas', timezone: 'America/Los_Angeles', country: 'USA' },
    { city: 'Honolulu', timezone: 'Pacific/Honolulu', country: 'USA' },
    { city: 'Anchorage', timezone: 'America/Anchorage', country: 'USA' },
    { city: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
    { city: 'Vancouver', timezone: 'America/Vancouver', country: 'Canada' },
    { city: 'Montreal', timezone: 'America/Montreal', country: 'Canada' },
    { city: 'Calgary', timezone: 'America/Edmonton', country: 'Canada' },
    { city: 'Ottawa', timezone: 'America/Toronto', country: 'Canada' },
    { city: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico' },
    { city: 'Guadalajara', timezone: 'America/Mexico_City', country: 'Mexico' },
    { city: 'Cancún', timezone: 'America/Cancun', country: 'Mexico' },

    // Central America & Caribbean
    { city: 'Panama City', timezone: 'America/Panama', country: 'Panama' },
    { city: 'San José', timezone: 'America/Costa_Rica', country: 'Costa Rica' },
    { city: 'Guatemala City', timezone: 'America/Guatemala', country: 'Guatemala' },
    { city: 'Havana', timezone: 'America/Havana', country: 'Cuba' },
    { city: 'Santo Domingo', timezone: 'America/Santo_Domingo', country: 'Dominican Republic' },
    { city: 'San Juan', timezone: 'America/Puerto_Rico', country: 'Puerto Rico' },
    { city: 'Kingston', timezone: 'America/Jamaica', country: 'Jamaica' },

    // South America
    { city: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
    { city: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', country: 'Brazil' },
    { city: 'Brasília', timezone: 'America/Sao_Paulo', country: 'Brazil' },
    { city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
    { city: 'Lima', timezone: 'America/Lima', country: 'Peru' },
    { city: 'Bogotá', timezone: 'America/Bogota', country: 'Colombia' },
    { city: 'Santiago', timezone: 'America/Santiago', country: 'Chile' },
    { city: 'Caracas', timezone: 'America/Caracas', country: 'Venezuela' },
    { city: 'Quito', timezone: 'America/Guayaquil', country: 'Ecuador' },
    { city: 'Montevideo', timezone: 'America/Montevideo', country: 'Uruguay' },
    { city: 'Asunción', timezone: 'America/Asuncion', country: 'Paraguay' },
    { city: 'La Paz', timezone: 'America/La_Paz', country: 'Bolivia' },

    // Europe - Western
    { city: 'London', timezone: 'Europe/London', country: 'UK' },
    { city: 'Manchester', timezone: 'Europe/London', country: 'UK' },
    { city: 'Edinburgh', timezone: 'Europe/London', country: 'UK' },
    { city: 'Dublin', timezone: 'Europe/Dublin', country: 'Ireland' },
    { city: 'Paris', timezone: 'Europe/Paris', country: 'France' },
    { city: 'Lyon', timezone: 'Europe/Paris', country: 'France' },
    { city: 'Marseille', timezone: 'Europe/Paris', country: 'France' },
    { city: 'Amsterdam', timezone: 'Europe/Amsterdam', country: 'Netherlands' },
    { city: 'Brussels', timezone: 'Europe/Brussels', country: 'Belgium' },
    { city: 'Luxembourg', timezone: 'Europe/Luxembourg', country: 'Luxembourg' },

    // Europe - Central
    { city: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
    { city: 'Munich', timezone: 'Europe/Berlin', country: 'Germany' },
    { city: 'Frankfurt', timezone: 'Europe/Berlin', country: 'Germany' },
    { city: 'Hamburg', timezone: 'Europe/Berlin', country: 'Germany' },
    { city: 'Vienna', timezone: 'Europe/Vienna', country: 'Austria' },
    { city: 'Zurich', timezone: 'Europe/Zurich', country: 'Switzerland' },
    { city: 'Geneva', timezone: 'Europe/Zurich', country: 'Switzerland' },
    { city: 'Prague', timezone: 'Europe/Prague', country: 'Czech Republic' },
    { city: 'Warsaw', timezone: 'Europe/Warsaw', country: 'Poland' },
    { city: 'Kraków', timezone: 'Europe/Warsaw', country: 'Poland' },
    { city: 'Budapest', timezone: 'Europe/Budapest', country: 'Hungary' },

    // Europe - Southern
    { city: 'Rome', timezone: 'Europe/Rome', country: 'Italy' },
    { city: 'Milan', timezone: 'Europe/Rome', country: 'Italy' },
    { city: 'Venice', timezone: 'Europe/Rome', country: 'Italy' },
    { city: 'Madrid', timezone: 'Europe/Madrid', country: 'Spain' },
    { city: 'Barcelona', timezone: 'Europe/Madrid', country: 'Spain' },
    { city: 'Lisbon', timezone: 'Europe/Lisbon', country: 'Portugal' },
    { city: 'Athens', timezone: 'Europe/Athens', country: 'Greece' },

    // Europe - Northern
    { city: 'Stockholm', timezone: 'Europe/Stockholm', country: 'Sweden' },
    { city: 'Oslo', timezone: 'Europe/Oslo', country: 'Norway' },
    { city: 'Copenhagen', timezone: 'Europe/Copenhagen', country: 'Denmark' },
    { city: 'Helsinki', timezone: 'Europe/Helsinki', country: 'Finland' },
    { city: 'Reykjavik', timezone: 'Atlantic/Reykjavik', country: 'Iceland' },

    // Europe - Eastern
    { city: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
    { city: 'Saint Petersburg', timezone: 'Europe/Moscow', country: 'Russia' },
    { city: 'Kyiv', timezone: 'Europe/Kiev', country: 'Ukraine' },
    { city: 'Bucharest', timezone: 'Europe/Bucharest', country: 'Romania' },
    { city: 'Sofia', timezone: 'Europe/Sofia', country: 'Bulgaria' },
    { city: 'Belgrade', timezone: 'Europe/Belgrade', country: 'Serbia' },
    { city: 'Zagreb', timezone: 'Europe/Zagreb', country: 'Croatia' },

    // Middle East
    { city: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
    { city: 'Abu Dhabi', timezone: 'Asia/Dubai', country: 'UAE' },
    { city: 'Riyadh', timezone: 'Asia/Riyadh', country: 'Saudi Arabia' },
    { city: 'Jeddah', timezone: 'Asia/Riyadh', country: 'Saudi Arabia' },
    { city: 'Doha', timezone: 'Asia/Qatar', country: 'Qatar' },
    { city: 'Kuwait City', timezone: 'Asia/Kuwait', country: 'Kuwait' },
    { city: 'Manama', timezone: 'Asia/Bahrain', country: 'Bahrain' },
    { city: 'Muscat', timezone: 'Asia/Muscat', country: 'Oman' },
    { city: 'Tel Aviv', timezone: 'Asia/Jerusalem', country: 'Israel' },
    { city: 'Jerusalem', timezone: 'Asia/Jerusalem', country: 'Israel' },
    { city: 'Amman', timezone: 'Asia/Amman', country: 'Jordan' },
    { city: 'Beirut', timezone: 'Asia/Beirut', country: 'Lebanon' },
    { city: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey' },
    { city: 'Ankara', timezone: 'Europe/Istanbul', country: 'Turkey' },
    { city: 'Tehran', timezone: 'Asia/Tehran', country: 'Iran' },
    { city: 'Baghdad', timezone: 'Asia/Baghdad', country: 'Iraq' },

    // South Asia
    { city: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Delhi', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Bangalore', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Chennai', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Kolkata', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Hyderabad', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Ahmedabad', timezone: 'Asia/Kolkata', country: 'India' },
    { city: 'Karachi', timezone: 'Asia/Karachi', country: 'Pakistan' },
    { city: 'Lahore', timezone: 'Asia/Karachi', country: 'Pakistan' },
    { city: 'Islamabad', timezone: 'Asia/Karachi', country: 'Pakistan' },
    { city: 'Dhaka', timezone: 'Asia/Dhaka', country: 'Bangladesh' },
    { city: 'Colombo', timezone: 'Asia/Colombo', country: 'Sri Lanka' },
    { city: 'Kathmandu', timezone: 'Asia/Kathmandu', country: 'Nepal' },

    // Southeast Asia
    { city: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
    { city: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' },
    { city: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia' },
    { city: 'Bali', timezone: 'Asia/Makassar', country: 'Indonesia' },
    { city: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
    { city: 'Manila', timezone: 'Asia/Manila', country: 'Philippines' },
    { city: 'Ho Chi Minh City', timezone: 'Asia/Ho_Chi_Minh', country: 'Vietnam' },
    { city: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh', country: 'Vietnam' },
    { city: 'Phnom Penh', timezone: 'Asia/Phnom_Penh', country: 'Cambodia' },
    { city: 'Yangon', timezone: 'Asia/Yangon', country: 'Myanmar' },

    // East Asia
    { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
    { city: 'Osaka', timezone: 'Asia/Tokyo', country: 'Japan' },
    { city: 'Kyoto', timezone: 'Asia/Tokyo', country: 'Japan' },
    { city: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
    { city: 'Busan', timezone: 'Asia/Seoul', country: 'South Korea' },
    { city: 'Beijing', timezone: 'Asia/Shanghai', country: 'China' },
    { city: 'Shanghai', timezone: 'Asia/Shanghai', country: 'China' },
    { city: 'Shenzhen', timezone: 'Asia/Shanghai', country: 'China' },
    { city: 'Guangzhou', timezone: 'Asia/Shanghai', country: 'China' },
    { city: 'Chengdu', timezone: 'Asia/Shanghai', country: 'China' },
    { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
    { city: 'Macau', timezone: 'Asia/Macau', country: 'Macau' },
    { city: 'Taipei', timezone: 'Asia/Taipei', country: 'Taiwan' },
    { city: 'Ulaanbaatar', timezone: 'Asia/Ulaanbaatar', country: 'Mongolia' },

    // Central Asia
    { city: 'Almaty', timezone: 'Asia/Almaty', country: 'Kazakhstan' },
    { city: 'Tashkent', timezone: 'Asia/Tashkent', country: 'Uzbekistan' },
    { city: 'Baku', timezone: 'Asia/Baku', country: 'Azerbaijan' },
    { city: 'Tbilisi', timezone: 'Asia/Tbilisi', country: 'Georgia' },
    { city: 'Yerevan', timezone: 'Asia/Yerevan', country: 'Armenia' },

    // Africa - North
    { city: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' },
    { city: 'Alexandria', timezone: 'Africa/Cairo', country: 'Egypt' },
    { city: 'Casablanca', timezone: 'Africa/Casablanca', country: 'Morocco' },
    { city: 'Marrakech', timezone: 'Africa/Casablanca', country: 'Morocco' },
    { city: 'Algiers', timezone: 'Africa/Algiers', country: 'Algeria' },
    { city: 'Tunis', timezone: 'Africa/Tunis', country: 'Tunisia' },
    { city: 'Tripoli', timezone: 'Africa/Tripoli', country: 'Libya' },

    // Africa - West
    { city: 'Lagos', timezone: 'Africa/Lagos', country: 'Nigeria' },
    { city: 'Abuja', timezone: 'Africa/Lagos', country: 'Nigeria' },
    { city: 'Accra', timezone: 'Africa/Accra', country: 'Ghana' },
    { city: 'Dakar', timezone: 'Africa/Dakar', country: 'Senegal' },
    { city: 'Abidjan', timezone: 'Africa/Abidjan', country: 'Ivory Coast' },

    // Africa - East
    { city: 'Nairobi', timezone: 'Africa/Nairobi', country: 'Kenya' },
    { city: 'Addis Ababa', timezone: 'Africa/Addis_Ababa', country: 'Ethiopia' },
    { city: 'Dar es Salaam', timezone: 'Africa/Dar_es_Salaam', country: 'Tanzania' },
    { city: 'Kampala', timezone: 'Africa/Kampala', country: 'Uganda' },
    { city: 'Kigali', timezone: 'Africa/Kigali', country: 'Rwanda' },

    // Africa - South
    { city: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa' },
    { city: 'Cape Town', timezone: 'Africa/Johannesburg', country: 'South Africa' },
    { city: 'Durban', timezone: 'Africa/Johannesburg', country: 'South Africa' },
    { city: 'Harare', timezone: 'Africa/Harare', country: 'Zimbabwe' },
    { city: 'Lusaka', timezone: 'Africa/Lusaka', country: 'Zambia' },
    { city: 'Maputo', timezone: 'Africa/Maputo', country: 'Mozambique' },

    // Australia & New Zealand
    { city: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
    { city: 'Melbourne', timezone: 'Australia/Melbourne', country: 'Australia' },
    { city: 'Brisbane', timezone: 'Australia/Brisbane', country: 'Australia' },
    { city: 'Perth', timezone: 'Australia/Perth', country: 'Australia' },
    { city: 'Adelaide', timezone: 'Australia/Adelaide', country: 'Australia' },
    { city: 'Darwin', timezone: 'Australia/Darwin', country: 'Australia' },
    { city: 'Hobart', timezone: 'Australia/Hobart', country: 'Australia' },
    { city: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand' },
    { city: 'Wellington', timezone: 'Pacific/Auckland', country: 'New Zealand' },
    { city: 'Christchurch', timezone: 'Pacific/Auckland', country: 'New Zealand' },

    // Pacific Islands
    { city: 'Fiji', timezone: 'Pacific/Fiji', country: 'Fiji' },
    { city: 'Guam', timezone: 'Pacific/Guam', country: 'Guam' },
    { city: 'Samoa', timezone: 'Pacific/Apia', country: 'Samoa' },
    { city: 'Tahiti', timezone: 'Pacific/Tahiti', country: 'French Polynesia' }
  ];

  const state = {
    clocks: [],
    intervalId: null,
    viewMode: 'grid' // 'grid' or 'clock'
  };

  const elements = {};

  function initElements() {
    elements.localTime = document.getElementById('localTime');
    elements.localDate = document.getElementById('localDate');
    elements.clocksGrid = document.getElementById('clocksGrid');
    elements.addClockBtn = document.getElementById('addClockBtn');
    elements.toggleViewBtn = document.getElementById('toggleViewBtn');
    elements.addClockModal = document.getElementById('addClockModal');
    elements.closeModalBtn = document.getElementById('closeModalBtn');
    elements.searchTimezone = document.getElementById('searchTimezone');
    elements.timezoneList = document.getElementById('timezoneList');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function formatTime(date, timezone) {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function formatDate(date, timezone) {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatShortDate(date, timezone) {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function getTimeDiff(timezone) {
    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const localDate = new Date(now.toLocaleString('en-US'));
    const diff = (targetDate - localDate) / (1000 * 60 * 60);

    if (diff === 0) return 'Same time';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff}h`;
  }

  function updateLocalTime() {
    const now = new Date();
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    elements.localTime.textContent = formatTime(now, localTimezone);
    elements.localDate.textContent = formatDate(now, localTimezone);
  }

  function updateClocks() {
    const now = new Date();
    state.clocks.forEach((clock, index) => {
      const card = document.querySelector(`[data-clock-index="${index}"]`);
      if (!card) return;

      const timeEl = card.querySelector('.clock-time');
      const dateEl = card.querySelector('.clock-date');
      if (timeEl) timeEl.textContent = formatTime(now, clock.timezone);
      if (dateEl) dateEl.textContent = formatShortDate(now, clock.timezone);

      // Update analog clock hands
      const angles = getClockAngles(clock.timezone);
      const hourHand = card.querySelector('.hour-hand');
      const minuteHand = card.querySelector('.minute-hand');
      const secondHand = card.querySelector('.second-hand');
      if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${angles.hourAngle}deg)`;
      if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${angles.minuteAngle}deg)`;
      if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${angles.secondAngle}deg)`;
    });
  }

  function getClockAngles(timezone) {
    const now = new Date();
    const options = { timeZone: timezone, hour12: false };
    const hours = parseInt(now.toLocaleString('en-US', { ...options, hour: '2-digit' }));
    const minutes = parseInt(now.toLocaleString('en-US', { ...options, minute: '2-digit' }));
    const seconds = parseInt(now.toLocaleString('en-US', { ...options, second: '2-digit' }));

    const secondAngle = seconds * 6;
    const minuteAngle = minutes * 6 + (seconds / 60) * 6;
    const hourAngle = ((hours % 12) * 30) + (minutes / 60) * 30;

    return { hourAngle, minuteAngle, secondAngle };
  }

  function generateClockMarks() {
    let marks = '';
    for (let i = 0; i < 12; i++) {
      marks += `<div class="clock-mark" style="transform: translateX(-50%) rotate(${i * 30}deg)"></div>`;
    }
    return marks;
  }

  function renderClocks() {
    const now = new Date();
    elements.clocksGrid.innerHTML = state.clocks.map((clock, index) => {
      const angles = getClockAngles(clock.timezone);
      return `
      <div class="clock-card" data-clock-index="${index}" data-timezone="${clock.timezone}">
        <div class="clock-card-header">
          <div class="clock-card-info">
            <span class="clock-city">${clock.city}</span>
            <span class="clock-diff">${getTimeDiff(clock.timezone)}</span>
          </div>
          <button type="button" class="remove-clock" data-index="${index}" title="Remove">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="clock-body">
          <div class="analog-clock">
            <div class="clock-face">
              <div class="clock-marks">${generateClockMarks()}</div>
              <div class="hand hour-hand" style="transform: translateX(-50%) rotate(${angles.hourAngle}deg); transform-origin: 50% 100%;"></div>
              <div class="hand minute-hand" style="transform: translateX(-50%) rotate(${angles.minuteAngle}deg); transform-origin: 50% 100%;"></div>
              <div class="hand second-hand" style="transform: translateX(-50%) rotate(${angles.secondAngle}deg); transform-origin: 50% 100%;"></div>
            </div>
          </div>
          <div class="clock-time">${formatTime(now, clock.timezone)}</div>
          <div class="clock-date">${formatShortDate(now, clock.timezone)}</div>
        </div>
      </div>
    `}).join('');

    document.querySelectorAll('.remove-clock').forEach(btn => {
      btn.addEventListener('click', () => removeClock(parseInt(btn.dataset.index)));
    });
  }

  function renderTimezoneList(filter = '') {
    const filtered = TIMEZONES.filter(tz =>
      !state.clocks.some(c => c.timezone === tz.timezone) &&
      (tz.city.toLowerCase().includes(filter.toLowerCase()) ||
       tz.country.toLowerCase().includes(filter.toLowerCase()) ||
       tz.timezone.toLowerCase().includes(filter.toLowerCase()))
    );

    elements.timezoneList.innerHTML = filtered.map((tz, index) => `
      <div class="timezone-item" data-index="${index}">
        <div class="timezone-item-city">${tz.city}, ${tz.country}</div>
        <div class="timezone-item-zone">${tz.timezone}</div>
      </div>
    `).join('');

    elements.timezoneList.querySelectorAll('.timezone-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        addClock(filtered[i]);
        closeModal();
      });
    });
  }

  function addClock(tz) {
    state.clocks.push(tz);
    saveClocks();
    renderClocks();
    showToast(`Added ${tz.city}`, 'success');
  }

  function removeClock(index) {
    const removed = state.clocks.splice(index, 1)[0];
    saveClocks();
    renderClocks();
    showToast(`Removed ${removed.city}`, 'success');
  }

  function saveClocks() {
    localStorage.setItem('worldclocks', JSON.stringify(state.clocks));
  }

  function loadClocks() {
    const saved = localStorage.getItem('worldclocks');
    if (saved) {
      state.clocks = JSON.parse(saved);
    } else {
      state.clocks = [
        TIMEZONES.find(tz => tz.city === 'London'),
        TIMEZONES.find(tz => tz.city === 'New York'),
        TIMEZONES.find(tz => tz.city === 'Tokyo')
      ];
    }
  }

  function loadViewMode() {
    const saved = localStorage.getItem('worldclock-view');
    if (saved) {
      state.viewMode = saved;
    }
    applyViewMode();
  }

  function saveViewMode() {
    localStorage.setItem('worldclock-view', state.viewMode);
  }

  function applyViewMode() {
    elements.clocksGrid.classList.toggle('clock-view', state.viewMode === 'clock');
    const icon = elements.toggleViewBtn.querySelector('i');
    if (state.viewMode === 'clock') {
      icon.className = 'fa-solid fa-table-cells';
    } else {
      icon.className = 'fa-solid fa-clock';
    }
  }

  function toggleView() {
    state.viewMode = state.viewMode === 'grid' ? 'clock' : 'grid';
    applyViewMode();
    saveViewMode();
    showToast(state.viewMode === 'grid' ? 'Digital view' : 'Analog view', 'success');
  }

  function openModal() {
    elements.addClockModal.classList.add('show');
    elements.searchTimezone.value = '';
    elements.searchTimezone.focus();
    renderTimezoneList();
  }

  function closeModal() {
    elements.addClockModal.classList.remove('show');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'a') {
      e.preventDefault();
      openModal();
    }
    if (e.key.toLowerCase() === 'v') {
      e.preventDefault();
      toggleView();
    }
  }

  function init() {
    initElements();
    loadClocks();
    loadViewMode();

    updateLocalTime();
    renderClocks();

    state.intervalId = setInterval(() => {
      updateLocalTime();
      updateClocks();
    }, 1000);

    elements.addClockBtn.addEventListener('click', openModal);
    elements.toggleViewBtn.addEventListener('click', toggleView);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.addClockModal.addEventListener('click', (e) => {
      if (e.target === elements.addClockModal) closeModal();
    });
    elements.searchTimezone.addEventListener('input', (e) => {
      renderTimezoneList(e.target.value);
    });
    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
