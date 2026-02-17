/**
 * KVSOVANREACH Subnet Calculator
 */

(function() {
  'use strict';

  const elements = {};

  function initElements() {
    elements.ipAddress = document.getElementById('ipAddress');
    elements.cidr = document.getElementById('cidr');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.networkAddress = document.getElementById('networkAddress');
    elements.broadcastAddress = document.getElementById('broadcastAddress');
    elements.subnetMask = document.getElementById('subnetMask');
    elements.wildcardMask = document.getElementById('wildcardMask');
    elements.firstHost = document.getElementById('firstHost');
    elements.lastHost = document.getElementById('lastHost');
    elements.totalHosts = document.getElementById('totalHosts');
    elements.usableHosts = document.getElementById('usableHosts');
    elements.ipClass = document.getElementById('ipClass');
    elements.ipType = document.getElementById('ipType');
    elements.subnetBtns = document.querySelectorAll('.subnet-btn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }

  function intToIp(int) {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  }

  function isValidIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  }

  function getIpClass(firstOctet) {
    if (firstOctet < 128) return 'A';
    if (firstOctet < 192) return 'B';
    if (firstOctet < 224) return 'C';
    if (firstOctet < 240) return 'D (Multicast)';
    return 'E (Reserved)';
  }

  function getIpType(ip) {
    const parts = ip.split('.').map(Number);
    const first = parts[0];
    const second = parts[1];

    if (first === 10) return 'Private (Class A)';
    if (first === 172 && second >= 16 && second <= 31) return 'Private (Class B)';
    if (first === 192 && second === 168) return 'Private (Class C)';
    if (first === 127) return 'Loopback';
    if (first === 169 && second === 254) return 'Link-Local';
    if (first >= 224 && first <= 239) return 'Multicast';
    return 'Public';
  }

  function calculate() {
    const ip = elements.ipAddress.value.trim();
    const cidr = parseInt(elements.cidr.value);

    if (!isValidIp(ip)) {
      clearResults();
      return;
    }

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      clearResults();
      return;
    }

    const ipInt = ipToInt(ip);
    const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
    const wildcard = ~mask >>> 0;

    const networkInt = (ipInt & mask) >>> 0;
    const broadcastInt = (networkInt | wildcard) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

    const firstHostInt = cidr >= 31 ? networkInt : networkInt + 1;
    const lastHostInt = cidr >= 31 ? broadcastInt : broadcastInt - 1;

    elements.networkAddress.textContent = intToIp(networkInt);
    elements.broadcastAddress.textContent = intToIp(broadcastInt);
    elements.subnetMask.textContent = intToIp(mask);
    elements.wildcardMask.textContent = intToIp(wildcard);
    elements.firstHost.textContent = intToIp(firstHostInt);
    elements.lastHost.textContent = intToIp(lastHostInt);
    elements.totalHosts.textContent = totalHosts.toLocaleString();
    elements.usableHosts.textContent = usableHosts.toLocaleString();

    const firstOctet = parseInt(ip.split('.')[0]);
    elements.ipClass.textContent = getIpClass(firstOctet);
    elements.ipType.textContent = getIpType(ip);
  }

  function clearResults() {
    elements.networkAddress.textContent = '-';
    elements.broadcastAddress.textContent = '-';
    elements.subnetMask.textContent = '-';
    elements.wildcardMask.textContent = '-';
    elements.firstHost.textContent = '-';
    elements.lastHost.textContent = '-';
    elements.totalHosts.textContent = '-';
    elements.usableHosts.textContent = '-';
    elements.ipClass.textContent = '-';
    elements.ipType.textContent = '-';
  }

  function setCidr(cidr) {
    elements.cidr.value = cidr;
    calculate();
  }

  function clearAll() {
    elements.ipAddress.value = '';
    elements.cidr.value = '24';
    clearResults();
    elements.ipAddress.focus();
    showToast('Cleared', 'success');
  }

  function init() {
    initElements();

    elements.ipAddress.addEventListener('input', calculate);
    elements.cidr.addEventListener('input', calculate);
    elements.clearBtn.addEventListener('click', clearAll);

    elements.subnetBtns.forEach(btn => {
      btn.addEventListener('click', () => setCidr(btn.dataset.cidr));
    });

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
