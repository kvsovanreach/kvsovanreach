/**
 * KVSOVANREACH Age Calculator
 */

(function() {
  'use strict';

  const elements = {};

  function initElements() {
    elements.birthDateInput = document.getElementById('birthDateInput');
    elements.targetDateInput = document.getElementById('targetDateInput');
    elements.todayBtn = document.getElementById('todayBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.years = document.getElementById('years');
    elements.months = document.getElementById('months');
    elements.days = document.getElementById('days');
    elements.totalMonths = document.getElementById('totalMonths');
    elements.totalWeeks = document.getElementById('totalWeeks');
    elements.totalDays = document.getElementById('totalDays');
    elements.totalHours = document.getElementById('totalHours');
    elements.totalMinutes = document.getElementById('totalMinutes');
    elements.birthdayText = document.getElementById('birthdayText');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function formatNumber(num) {
    return num.toLocaleString();
  }

  function setupFastDateInput(container, onUpdate) {
    if (!container) return;

    const inputs = container.querySelectorAll('input');

    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');

        const maxLen = parseInt(input.getAttribute('maxlength'));
        if (e.target.value.length >= maxLen) {
          const nextId = input.dataset.next;
          if (nextId) {
            const nextInput = document.getElementById(nextId);
            if (nextInput) {
              nextInput.focus();
              nextInput.select();
            }
          }
        }

        onUpdate();
      });

      input.addEventListener('focus', () => {
        setTimeout(() => input.select(), 0);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '') {
          const allInputs = Array.from(inputs);
          const idx = allInputs.indexOf(input);
          if (idx > 0) {
            allInputs[idx - 1].focus();
          }
        }
      });
    });
  }

  function getDateFromContainer(container) {
    if (!container) return null;

    const yearInput = container.querySelector('.dt-year');
    const monthInput = container.querySelector('.dt-month');
    const dayInput = container.querySelector('.dt-day');

    const year = parseInt(yearInput?.value);
    const month = parseInt(monthInput?.value);
    const day = parseInt(dayInput?.value);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

    return new Date(year, month - 1, day);
  }

  function setDateToContainer(container, date) {
    if (!container || !date) return;

    const yearInput = container.querySelector('.dt-year');
    const monthInput = container.querySelector('.dt-month');
    const dayInput = container.querySelector('.dt-day');

    if (yearInput) yearInput.value = date.getFullYear();
    if (monthInput) monthInput.value = String(date.getMonth() + 1).padStart(2, '0');
    if (dayInput) dayInput.value = String(date.getDate()).padStart(2, '0');
  }

  function clearDateContainer(container) {
    if (!container) return;

    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
  }

  function calculateAge() {
    const birthDate = getDateFromContainer(elements.birthDateInput);
    const targetDate = getDateFromContainer(elements.targetDateInput);

    if (!birthDate) {
      resetDisplay();
      return;
    }

    if (!targetDate) {
      resetDisplay();
      return;
    }

    if (birthDate > targetDate) {
      showToast('Birth date cannot be after target date', 'error');
      resetDisplay();
      return;
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = targetDate - birthDate;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    elements.years.textContent = years;
    elements.months.textContent = months;
    elements.days.textContent = days;
    elements.totalMonths.textContent = formatNumber(totalMonths);
    elements.totalWeeks.textContent = formatNumber(totalWeeks);
    elements.totalDays.textContent = formatNumber(totalDays);
    elements.totalHours.textContent = formatNumber(totalHours);
    elements.totalMinutes.textContent = formatNumber(totalMinutes);

    updateBirthdayInfo(birthDate, targetDate);
  }

  function updateBirthdayInfo(birthDate, targetDate) {
    const nextBirthday = new Date(
      targetDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (nextBirthday <= targetDate) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    const daysUntil = Math.ceil((nextBirthday - targetDate) / (1000 * 60 * 60 * 24));

    if (daysUntil === 365 || daysUntil === 366) {
      elements.birthdayText.textContent = "Happy Birthday!";
    } else {
      elements.birthdayText.textContent = `${daysUntil} days until your next birthday`;
    }
  }

  function resetDisplay() {
    elements.years.textContent = '0';
    elements.months.textContent = '0';
    elements.days.textContent = '0';
    elements.totalMonths.textContent = '0';
    elements.totalWeeks.textContent = '0';
    elements.totalDays.textContent = '0';
    elements.totalHours.textContent = '0';
    elements.totalMinutes.textContent = '0';
    elements.birthdayText.textContent = 'Enter your birth date to see your next birthday';
  }

  function setTargetToToday() {
    const today = new Date();
    setDateToContainer(elements.targetDateInput, today);
    calculateAge();
  }

  function resetForm() {
    clearDateContainer(elements.birthDateInput);
    clearDateContainer(elements.targetDateInput);
    setTargetToToday();
    resetDisplay();
    showToast('Form reset', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key.toLowerCase() === 't') {
      e.preventDefault();
      setTargetToToday();
      showToast('Target date set to today', 'success');
    }

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetForm();
    }
  }

  function init() {
    initElements();

    setTargetToToday();

    setupFastDateInput(elements.birthDateInput, calculateAge);
    setupFastDateInput(elements.targetDateInput, calculateAge);

    elements.todayBtn?.addEventListener('click', () => {
      setTargetToToday();
      showToast('Target date set to today', 'success');
    });

    elements.resetBtn?.addEventListener('click', resetForm);

    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
