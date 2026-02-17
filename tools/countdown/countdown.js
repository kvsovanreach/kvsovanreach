/**
 * KVSOVANREACH Countdown Timer
 */

(function() {
  'use strict';

  const state = {
    targetDate: null,
    eventName: '',
    intervalId: null
  };

  const elements = {};

  function initElements() {
    elements.eventName = document.getElementById('eventName');
    elements.dtYear = document.getElementById('dtYear');
    elements.dtMonth = document.getElementById('dtMonth');
    elements.dtDay = document.getElementById('dtDay');
    elements.dtHour = document.getElementById('dtHour');
    elements.dtMinute = document.getElementById('dtMinute');
    elements.days = document.getElementById('days');
    elements.hours = document.getElementById('hours');
    elements.minutes = document.getElementById('minutes');
    elements.seconds = document.getElementById('seconds');
    elements.countdownDisplay = document.getElementById('countdownDisplay');
    elements.eventNameDisplay = document.getElementById('eventNameDisplay');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.fastDatetime = document.getElementById('targetDatetime');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function updateCountdown() {
    if (!state.targetDate) {
      elements.days.textContent = '0';
      elements.hours.textContent = '00';
      elements.minutes.textContent = '00';
      elements.seconds.textContent = '00';
      elements.countdownDisplay.classList.remove('expired');
      return;
    }

    const now = new Date();
    const diff = state.targetDate - now;

    if (diff <= 0) {
      elements.days.textContent = '0';
      elements.hours.textContent = '00';
      elements.minutes.textContent = '00';
      elements.seconds.textContent = '00';
      elements.countdownDisplay.classList.add('expired');
      elements.eventNameDisplay.textContent = state.eventName ? `${state.eventName} has passed!` : 'Event has passed!';
      return;
    }

    elements.countdownDisplay.classList.remove('expired');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    elements.days.textContent = days;
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');

    elements.eventNameDisplay.textContent = state.eventName || 'Counting down...';
  }

  function getDateFromInputs() {
    const year = elements.dtYear.value;
    const month = elements.dtMonth.value;
    const day = elements.dtDay.value;
    const hour = elements.dtHour.value || '00';
    const minute = elements.dtMinute.value || '00';

    if (!year || !month || !day) return null;

    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );

    return isNaN(date.getTime()) ? null : date;
  }

  function setDateToInputs(date) {
    elements.dtYear.value = date.getFullYear();
    elements.dtMonth.value = String(date.getMonth() + 1).padStart(2, '0');
    elements.dtDay.value = String(date.getDate()).padStart(2, '0');
    elements.dtHour.value = String(date.getHours()).padStart(2, '0');
    elements.dtMinute.value = String(date.getMinutes()).padStart(2, '0');
  }

  function setTarget() {
    const date = getDateFromInputs();
    state.targetDate = date;
    state.eventName = elements.eventName.value;
    updateCountdown();
    saveState();
  }

  function setupFastDatetimeInput(container) {
    const inputs = container.querySelectorAll('input');

    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        const maxLen = parseInt(e.target.maxLength);

        if (value.length > maxLen) {
          value = value.slice(0, maxLen);
        }

        e.target.value = value;

        if (value.length === maxLen) {
          const nextId = e.target.dataset.next;
          if (nextId) {
            const nextInput = document.getElementById(nextId);
            if (nextInput) nextInput.focus();
          }
        }

        setTarget();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '') {
          const inputs = Array.from(container.querySelectorAll('input'));
          const idx = inputs.indexOf(e.target);
          if (idx > 0) {
            inputs[idx - 1].focus();
          }
        }
      });
    });
  }

  function setPreset(preset) {
    const now = new Date();
    let targetDate;
    let eventName;

    switch(preset) {
      case 'newyear':
        targetDate = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
        if (now.getMonth() === 0 && now.getDate() === 1) {
          targetDate = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
        }
        eventName = `New Year ${targetDate.getFullYear()}`;
        break;
      case 'christmas':
        targetDate = new Date(now.getFullYear(), 11, 25, 0, 0, 0);
        if (now > targetDate) {
          targetDate = new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
        }
        eventName = `Christmas ${targetDate.getFullYear()}`;
        break;
      case 'week':
        targetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        eventName = '1 Week from now';
        break;
      case 'month':
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        eventName = '1 Month from now';
        break;
    }

    state.targetDate = targetDate;
    state.eventName = eventName;

    setDateToInputs(targetDate);
    elements.eventName.value = eventName;

    updateCountdown();
    saveState();
    showToast(`Set countdown to ${eventName}`, 'success');
  }

  function reset() {
    state.targetDate = null;
    state.eventName = '';

    elements.eventName.value = '';
    elements.dtYear.value = '';
    elements.dtMonth.value = '';
    elements.dtDay.value = '';
    elements.dtHour.value = '';
    elements.dtMinute.value = '';

    elements.eventNameDisplay.textContent = 'Set your countdown above';
    localStorage.removeItem('countdown');
    updateCountdown();
    showToast('Reset', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      reset();
    }
  }

  function saveState() {
    if (state.targetDate) {
      localStorage.setItem('countdown', JSON.stringify({
        targetDate: state.targetDate.toISOString(),
        eventName: state.eventName
      }));
    }
  }

  function loadState() {
    const saved = localStorage.getItem('countdown');
    if (saved) {
      const data = JSON.parse(saved);
      state.targetDate = new Date(data.targetDate);
      state.eventName = data.eventName;

      setDateToInputs(state.targetDate);
      elements.eventName.value = state.eventName;
    }
  }

  function init() {
    initElements();
    loadState();

    elements.eventName.addEventListener('input', setTarget);
    setupFastDatetimeInput(elements.fastDatetime);

    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => setPreset(btn.dataset.preset));
    });

    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', reset);
    }

    document.addEventListener('keydown', handleKeydown);

    updateCountdown();
    state.intervalId = setInterval(updateCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
