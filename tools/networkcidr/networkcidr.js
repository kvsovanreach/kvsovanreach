/**
 * Network CIDR Calculator
 * CIDR notation calculator with subnet visualization, binary display, division, and conversion.
 */
(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const tabs = document.querySelectorAll('.tool-tab[data-tab]');
  const panels = {
    calculator: document.getElementById('calculatorPanel'),
    cidr2range: document.getElementById('cidr2rangePanel'),
    range2cidr: document.getElementById('range2cidrPanel'),
    supernet: document.getElementById('supernetPanel')
  };

  const ipInput = document.getElementById('ipAddress');
  const cidrInput = document.getElementById('cidrPrefix');
  const clearBtn = document.getElementById('clearBtn');
  const quickBtns = document.querySelectorAll('.quick-btn');

  // Result elements
  const els = {};
  ['networkAddress', 'broadcastAddress', 'subnetMask', 'wildcardMask',
   'firstHost', 'lastHost', 'totalHosts', 'usableHosts', 'ipClass', 'ipType'
  ].forEach(id => { els[id] = document.getElementById(id); });

  const binaryDisplay = document.getElementById('binaryDisplay');
  const addressBarNetwork = document.getElementById('addressBarNetwork');
  const addressBarHost = document.getElementById('addressBarHost');
  const addressBarNetworkLabel = document.getElementById('addressBarNetworkLabel');
  const addressBarHostLabel = document.getElementById('addressBarHostLabel');
  const splitCidr = document.getElementById('splitCidr');
  const divisionBody = document.getElementById('divisionBody');

  // Converter elements
  const cidrToRangeInput = document.getElementById('cidrToRangeInput');
  const cidrToRangeBtn = document.getElementById('cidrToRangeBtn');
  const cidrToRangeResult = document.getElementById('cidrToRangeResult');
  const rangeStartInput = document.getElementById('rangeStartInput');
  const rangeEndInput = document.getElementById('rangeEndInput');
  const rangeToCidrBtn = document.getElementById('rangeToCidrBtn');
  const rangeToCidrResult = document.getElementById('rangeToCidrResult');
  const supernetInput = document.getElementById('supernetInput');
  const supernetBtn = document.getElementById('supernetBtn');
  const supernetResult = document.getElementById('supernetResult');

  // ==================== IP Utilities ====================
  function ipToInt(ip) {
    const p = ip.split('.').map(Number);
    return ((p[0] << 24) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
  }

  function intToIp(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }

  function isValidIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => { const n = parseInt(p, 10); return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p.trim(); });
  }

  function ipToBinary(ip) {
    return ip.split('.').map(o => parseInt(o, 10).toString(2).padStart(8, '0'));
  }

  function getIpClass(firstOctet) {
    if (firstOctet < 128) return 'Class A';
    if (firstOctet < 192) return 'Class B';
    if (firstOctet < 224) return 'Class C';
    if (firstOctet < 240) return 'Class D (Multicast)';
    return 'Class E (Reserved)';
  }

  function getIpType(ip) {
    const p = ip.split('.').map(Number);
    if (p[0] === 10) return 'Private';
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return 'Private';
    if (p[0] === 192 && p[1] === 168) return 'Private';
    if (p[0] === 127) return 'Loopback';
    if (p[0] === 169 && p[1] === 254) return 'Link-Local';
    if (p[0] >= 224 && p[0] <= 239) return 'Multicast';
    if (p[0] === 0) return 'This Network';
    if (p[0] === 255) return 'Broadcast';
    return 'Public';
  }

  function cidrToMask(cidr) {
    return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==================== Tab Switching ====================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(panels).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      panels[tab.dataset.tab].classList.add('active');
    });
  });

  // ==================== Main Calculator ====================
  function calculate() {
    const ip = ipInput.value.trim();
    const cidr = parseInt(cidrInput.value, 10);

    if (!isValidIp(ip) || isNaN(cidr) || cidr < 0 || cidr > 32) {
      clearResults();
      return;
    }

    const ipInt = ipToInt(ip);
    const mask = cidrToMask(cidr);
    const wildcard = (~mask) >>> 0;
    const networkInt = (ipInt & mask) >>> 0;
    const broadcastInt = (networkInt | wildcard) >>> 0;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : Math.max(totalHosts - 2, 0);
    const firstHostInt = cidr >= 31 ? networkInt : (networkInt + 1) >>> 0;
    const lastHostInt = cidr >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;
    const firstOctet = parseInt(ip.split('.')[0], 10);

    els.networkAddress.textContent = intToIp(networkInt);
    els.broadcastAddress.textContent = intToIp(broadcastInt);
    els.subnetMask.textContent = intToIp(mask);
    els.wildcardMask.textContent = intToIp(wildcard);
    els.firstHost.textContent = intToIp(firstHostInt);
    els.lastHost.textContent = intToIp(lastHostInt);
    els.totalHosts.textContent = totalHosts.toLocaleString();
    els.usableHosts.textContent = usableHosts.toLocaleString();
    els.ipClass.textContent = getIpClass(firstOctet);
    els.ipType.textContent = getIpType(ip);

    renderBinary(ip, cidr);
    renderAddressBar(cidr);
    populateSplitOptions(cidr);
    renderDivision(networkInt, cidr);
  }

  function clearResults() {
    Object.values(els).forEach(el => { el.textContent = '-'; });
    binaryDisplay.innerHTML = '<div class="binary-placeholder">Enter an IP/CIDR to see binary</div>';
    addressBarNetwork.style.width = '0%';
    addressBarHost.style.width = '100%';
    addressBarNetworkLabel.textContent = 'Network: 0 bits';
    addressBarHostLabel.textContent = 'Host: 0 bits';
    divisionBody.innerHTML = '';
  }

  // ==================== Binary Visualization ====================
  function renderBinary(ip, cidr) {
    const octets = ipToBinary(ip);
    const labels = ['Octet 1', 'Octet 2', 'Octet 3', 'Octet 4'];
    let bitIndex = 0;
    let html = '<div class="binary-row">';

    octets.forEach((octet, oi) => {
      if (oi > 0) html += '<span class="dot-sep">.</span>';
      html += '<span class="octet-bits">';
      for (let i = 0; i < 8; i++) {
        const cls = bitIndex < cidr ? 'network' : 'host';
        html += '<span class="bit ' + cls + '">' + octet[i] + '</span>';
        bitIndex++;
      }
      html += '</span>';
    });

    html += '</div>';

    // Mask row
    const maskOctets = ipToBinary(intToIp(cidrToMask(cidr)));
    bitIndex = 0;
    html += '<div class="binary-row" style="margin-top:var(--space-2)">';
    html += '<span class="octet-label" style="color:var(--color-text-muted);font-size:var(--font-size-xs)">Subnet Mask</span>';
    maskOctets.forEach((octet, oi) => {
      if (oi > 0) html += '<span class="dot-sep">.</span>';
      html += '<span class="octet-bits">';
      for (let i = 0; i < 8; i++) {
        const cls = bitIndex < cidr ? 'network' : 'host';
        html += '<span class="bit ' + cls + '">' + octet[i] + '</span>';
        bitIndex++;
      }
      html += '</span>';
    });
    html += '</div>';

    binaryDisplay.innerHTML = html;
  }

  // ==================== Address Space Bar ====================
  function renderAddressBar(cidr) {
    const networkPct = (cidr / 32) * 100;
    const hostPct = 100 - networkPct;
    addressBarNetwork.style.width = networkPct + '%';
    addressBarHost.style.width = hostPct + '%';
    addressBarNetworkLabel.textContent = 'Network: ' + cidr + ' bits';
    addressBarHostLabel.textContent = 'Host: ' + (32 - cidr) + ' bits';
  }

  // ==================== Subnet Division ====================
  function populateSplitOptions(currentCidr) {
    splitCidr.innerHTML = '';
    for (let c = currentCidr + 1; c <= 32; c++) {
      const count = Math.pow(2, c - currentCidr);
      const hostsPerSubnet = Math.pow(2, 32 - c);
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = '/' + c + ' (' + count + ' subnets, ' + hostsPerSubnet + ' addresses each)';
      if (c === currentCidr + 1) opt.selected = true;
      splitCidr.appendChild(opt);
    }
  }

  function renderDivision(networkInt, baseCidr) {
    const targetCidr = parseInt(splitCidr.value, 10);
    if (isNaN(targetCidr) || targetCidr <= baseCidr || targetCidr > 32) {
      divisionBody.innerHTML = '';
      return;
    }

    const count = Math.pow(2, targetCidr - baseCidr);
    const subnetSize = Math.pow(2, 32 - targetCidr);
    const maxRows = Math.min(count, 256); // limit display
    let html = '';

    for (let i = 0; i < maxRows; i++) {
      const subNetInt = (networkInt + i * subnetSize) >>> 0;
      const subBroadcast = (subNetInt + subnetSize - 1) >>> 0;
      const subFirst = targetCidr >= 31 ? subNetInt : (subNetInt + 1) >>> 0;
      const subLast = targetCidr >= 31 ? subBroadcast : (subBroadcast - 1) >>> 0;
      const usable = targetCidr >= 31 ? subnetSize : Math.max(subnetSize - 2, 0);

      html += '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + intToIp(subNetInt) + '/' + targetCidr + '</td>' +
        '<td>' + intToIp(subFirst) + '</td>' +
        '<td>' + intToIp(subLast) + '</td>' +
        '<td>' + intToIp(subBroadcast) + '</td>' +
        '<td>' + usable.toLocaleString() + '</td>' +
        '</tr>';
    }

    if (count > maxRows) {
      html += '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);font-style:italic">Showing first ' + maxRows + ' of ' + count.toLocaleString() + ' subnets</td></tr>';
    }

    divisionBody.innerHTML = html;
  }

  splitCidr.addEventListener('change', () => {
    const ip = ipInput.value.trim();
    const cidr = parseInt(cidrInput.value, 10);
    if (!isValidIp(ip) || isNaN(cidr)) return;
    const networkInt = (ipToInt(ip) & cidrToMask(cidr)) >>> 0;
    renderDivision(networkInt, cidr);
  });

  // ==================== CIDR to Range ====================
  cidrToRangeBtn.addEventListener('click', () => {
    const val = cidrToRangeInput.value.trim();
    const match = val.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!match || !isValidIp(match[1])) {
      ToolsCommon.showToast('Invalid CIDR notation (e.g. 192.168.1.0/24)', 'error');
      return;
    }

    const ip = match[1];
    const cidr = parseInt(match[2], 10);
    if (cidr < 0 || cidr > 32) {
      ToolsCommon.showToast('CIDR prefix must be 0-32', 'error');
      return;
    }

    const mask = cidrToMask(cidr);
    const networkInt = (ipToInt(ip) & mask) >>> 0;
    const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;

    cidrToRangeResult.innerHTML =
      '<div><strong>CIDR:</strong> ' + escapeHtml(intToIp(networkInt) + '/' + cidr) + '</div>' +
      '<div><strong>Start:</strong> ' + escapeHtml(intToIp(networkInt)) + '</div>' +
      '<div><strong>End:</strong> ' + escapeHtml(intToIp(broadcastInt)) + '</div>' +
      '<div><strong>Total Addresses:</strong> ' + Math.pow(2, 32 - cidr).toLocaleString() + '</div>';

    ToolsCommon.showToast('Converted', 'success');
  });

  // ==================== Range to CIDR ====================
  rangeToCidrBtn.addEventListener('click', () => {
    const startIp = rangeStartInput.value.trim();
    const endIp = rangeEndInput.value.trim();

    if (!isValidIp(startIp) || !isValidIp(endIp)) {
      ToolsCommon.showToast('Invalid IP address', 'error');
      return;
    }

    const startInt = ipToInt(startIp);
    const endInt = ipToInt(endIp);

    if (startInt > endInt) {
      ToolsCommon.showToast('Start IP must be less than or equal to End IP', 'error');
      return;
    }

    const cidrs = rangeToCidrs(startInt, endInt);

    if (cidrs.length === 0) {
      rangeToCidrResult.innerHTML = '<div class="converter-placeholder">No results</div>';
      return;
    }

    let html = '<div style="margin-bottom:var(--space-2);color:var(--color-text-secondary);font-size:var(--font-size-xs)">Range covers ' + cidrs.length + ' CIDR block(s):</div>';
    cidrs.forEach(c => {
      html += '<div class="cidr-line"><span>' + escapeHtml(c) + '</span>' +
        '<button type="button" onclick="ToolsCommon.copyWithToast(\'' + escapeHtml(c) + '\',\'Copied\')" title="Copy"><i class="fa-solid fa-copy"></i></button></div>';
    });

    rangeToCidrResult.innerHTML = html;
    ToolsCommon.showToast('Converted to ' + cidrs.length + ' CIDR block(s)', 'success');
  });

  function rangeToCidrs(start, end) {
    const result = [];
    let current = start;

    while (current <= end) {
      // Find the largest CIDR block starting at `current` that fits within the range
      let maxBits = 32;
      // Find the number of trailing zeros in current to determine alignment
      if (current !== 0) {
        let tz = 0;
        let tmp = current;
        while ((tmp & 1) === 0 && tz < 32) { tz++; tmp >>>= 1; }
        maxBits = 32 - tz;
      } else {
        maxBits = 0;
      }

      // Find the largest block that doesn't exceed end
      while (maxBits > 0) {
        const blockSize = Math.pow(2, 32 - maxBits);
        const blockEnd = (current + blockSize - 1) >>> 0;
        if (blockEnd <= end) break;
        maxBits++;
      }

      result.push(intToIp(current) + '/' + maxBits);
      const blockSize = Math.pow(2, 32 - maxBits);
      current = (current + blockSize) >>> 0;

      if (current === 0) break; // wrapped around
      if (result.length > 1000) break; // safety
    }

    return result;
  }

  // ==================== Supernetting ====================
  supernetBtn.addEventListener('click', () => {
    const lines = supernetInput.value.trim().split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length < 2) {
      ToolsCommon.showToast('Enter at least 2 subnets', 'error');
      return;
    }

    // Parse subnets
    const subnets = [];
    for (const line of lines) {
      const match = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
      if (!match || !isValidIp(match[1])) {
        ToolsCommon.showToast('Invalid CIDR: ' + line, 'error');
        return;
      }
      const cidr = parseInt(match[2], 10);
      if (cidr < 0 || cidr > 32) {
        ToolsCommon.showToast('Invalid prefix: ' + line, 'error');
        return;
      }
      const mask = cidrToMask(cidr);
      const networkInt = (ipToInt(match[1]) & mask) >>> 0;
      subnets.push({ network: networkInt, cidr: cidr, size: Math.pow(2, 32 - cidr) });
    }

    // Sort by network address
    subnets.sort((a, b) => a.network - b.network);

    // Check contiguity and try to merge
    const merged = mergeSubnets(subnets);

    if (merged.length === subnets.length) {
      supernetResult.innerHTML = '<div style="color:var(--color-text-secondary)">These subnets cannot be merged (not contiguous or not aligned for supernetting).</div>';
      ToolsCommon.showToast('Cannot merge these subnets', 'error');
      return;
    }

    let html = '<div style="margin-bottom:var(--space-2);color:var(--color-text-secondary);font-size:var(--font-size-xs)">Merged into ' + merged.length + ' supernet(s):</div>';
    merged.forEach(s => {
      const cidrStr = intToIp(s.network) + '/' + s.cidr;
      const endInt = (s.network + Math.pow(2, 32 - s.cidr) - 1) >>> 0;
      html += '<div class="cidr-line"><span><strong>' + escapeHtml(cidrStr) + '</strong> (' +
        escapeHtml(intToIp(s.network)) + ' - ' + escapeHtml(intToIp(endInt)) + ', ' +
        Math.pow(2, 32 - s.cidr).toLocaleString() + ' addresses)</span>' +
        '<button type="button" onclick="ToolsCommon.copyWithToast(\'' + escapeHtml(cidrStr) + '\',\'Copied\')" title="Copy"><i class="fa-solid fa-copy"></i></button></div>';
    });

    supernetResult.innerHTML = html;
    ToolsCommon.showToast('Merged ' + subnets.length + ' subnets into ' + merged.length, 'success');
  });

  function mergeSubnets(subnets) {
    // Convert to list of {network, cidr}
    let list = subnets.map(s => ({ network: s.network, cidr: s.cidr }));
    let changed = true;

    while (changed) {
      changed = false;
      list.sort((a, b) => a.network - b.network || a.cidr - b.cidr);

      const newList = [];
      const used = new Set();

      for (let i = 0; i < list.length; i++) {
        if (used.has(i)) continue;

        let merged = false;
        for (let j = i + 1; j < list.length; j++) {
          if (used.has(j)) continue;
          if (list[i].cidr !== list[j].cidr) continue;

          // Check if they are a pair that can merge
          const parentCidr = list[i].cidr - 1;
          if (parentCidr < 0) continue;

          const parentMask = cidrToMask(parentCidr);
          const parentNet1 = (list[i].network & parentMask) >>> 0;
          const parentNet2 = (list[j].network & parentMask) >>> 0;

          if (parentNet1 === parentNet2) {
            newList.push({ network: parentNet1, cidr: parentCidr });
            used.add(i);
            used.add(j);
            changed = true;
            merged = true;
            break;
          }
        }

        if (!merged && !used.has(i)) {
          newList.push(list[i]);
        }
      }

      list = newList;
    }

    return list;
  }

  // ==================== Copy Field Buttons ====================
  document.querySelectorAll('.copy-field-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const el = els[field];
      if (!el || el.textContent === '-') {
        ToolsCommon.showToast('Nothing to copy', 'error');
        return;
      }
      ToolsCommon.copyWithToast(el.textContent, 'Copied');
    });
  });

  // ==================== Quick CIDR Buttons ====================
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cidrInput.value = btn.dataset.cidr;
      calculate();
    });
  });

  // ==================== Clear ====================
  clearBtn.addEventListener('click', () => {
    ipInput.value = '';
    cidrInput.value = '24';
    clearResults();
    ipInput.focus();
    ToolsCommon.showToast('Cleared', 'info');
  });

  // ==================== Live Calculation ====================
  ipInput.addEventListener('input', () => {
    // Support pasting "192.168.1.0/24" directly
    const val = ipInput.value.trim();
    const match = val.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (match) {
      ipInput.value = match[1];
      cidrInput.value = match[2];
    }
    calculate();
  });

  cidrInput.addEventListener('input', calculate);

  // ==================== Init ====================
  calculate();

})();
