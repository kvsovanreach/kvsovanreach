/**
 * KVSOVANREACH IP Converter Tool
 * Convert IP addresses between multiple formats with classification
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  var ipInput = document.getElementById('ipInput');
  var clearBtn = document.getElementById('clearBtn');
  var inputHint = document.getElementById('inputHint');
  var inputError = document.getElementById('inputError');
  var results = document.getElementById('results');
  var formatTabs = document.getElementById('formatTabs');
  var classificationRow = document.getElementById('classificationRow');
  var classBadge = document.getElementById('classBadge');
  var typeBadge = document.getElementById('typeBadge');
  var octetTableBody = document.getElementById('octetTableBody');
  var bitRows = document.getElementById('bitRows');
  var ipv6Section = document.getElementById('ipv6Section');
  var octetBreakdown = document.getElementById('octetBreakdown');
  var binaryViz = document.getElementById('binaryViz');

  var activeFormat = 'ipv4';

  var hints = {
    ipv4: 'Enter an IPv4 address (e.g. 192.168.1.1)',
    decimal: 'Enter a 32-bit decimal number (e.g. 3232235777)',
    binary: 'Enter 32 bits with dots (e.g. 11000000.10101000.00000001.00000001)',
    hex: 'Enter hex value (e.g. C0A80101 or 0xC0A80101)',
    octal: 'Enter octal with dots (e.g. 0300.0250.0001.0001)',
    ipv6: 'Enter an IPv6 address (e.g. 2001:db8::1 or ::ffff:192.168.1.1)'
  };

  var placeholders = {
    ipv4: '192.168.1.1',
    decimal: '3232235777',
    binary: '11000000.10101000.00000001.00000001',
    hex: 'C0A80101',
    octal: '0300.0250.0001.0001',
    ipv6: '2001:db8::1'
  };

  // ==================== Initialize ====================
  function init() {
    bindEvents();
  }

  // ==================== Events ====================
  function bindEvents() {
    ipInput.addEventListener('input', debounce(handleConvert, 200));

    clearBtn.addEventListener('click', function() {
      ipInput.value = '';
      results.classList.add('hidden');
      inputError.classList.add('hidden');
      ipInput.focus();
    });

    formatTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.fmt-tab');
      if (!tab) return;
      formatTabs.querySelectorAll('.fmt-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      activeFormat = tab.dataset.format;
      ipInput.placeholder = placeholders[activeFormat];
      inputHint.textContent = hints[activeFormat];
      inputError.classList.add('hidden');
      if (ipInput.value.trim()) handleConvert();
    });

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var fmt = btn.dataset.format;
        // Switch format tab
        formatTabs.querySelectorAll('.fmt-tab').forEach(function(t) { t.classList.remove('active'); });
        formatTabs.querySelector('[data-format="' + fmt + '"]').classList.add('active');
        activeFormat = fmt;
        ipInput.placeholder = placeholders[fmt];
        inputHint.textContent = hints[fmt];
        ipInput.value = btn.dataset.value;
        handleConvert();
      });
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = btn.dataset.target;
        var el = document.getElementById(targetId);
        if (el && el.textContent) {
          ToolsCommon.copyWithToast(el.textContent, 'Copied to clipboard');
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
          ipInput.value = '';
          results.classList.add('hidden');
          inputError.classList.add('hidden');
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        ipInput.focus();
      }
    });
  }

  // ==================== Main Convert Handler ====================
  function handleConvert() {
    var raw = ipInput.value.trim();
    if (!raw) {
      results.classList.add('hidden');
      inputError.classList.add('hidden');
      return;
    }

    var octets = null;

    try {
      if (activeFormat === 'ipv6') {
        convertIPv6(raw);
        return;
      }

      octets = parseInput(raw, activeFormat);
      if (!octets) throw new Error('Invalid input for selected format');

      inputError.classList.add('hidden');
      showIPv4Results(octets);
    } catch (err) {
      inputError.textContent = err.message;
      inputError.classList.remove('hidden');
      results.classList.add('hidden');
    }
  }

  // ==================== Parse Input to Octets ====================
  function parseInput(raw, format) {
    switch (format) {
      case 'ipv4':
        return parseIPv4(raw);
      case 'decimal':
        return parseDecimal(raw);
      case 'binary':
        return parseBinary(raw);
      case 'hex':
        return parseHex(raw);
      case 'octal':
        return parseOctal(raw);
      default:
        return null;
    }
  }

  function parseIPv4(str) {
    var parts = str.split('.');
    if (parts.length !== 4) throw new Error('IPv4 must have 4 octets separated by dots');
    var octets = parts.map(function(p) {
      var n = parseInt(p, 10);
      if (isNaN(n) || n < 0 || n > 255 || String(n) !== p.trim()) throw new Error('Each octet must be 0-255');
      return n;
    });
    return octets;
  }

  function parseDecimal(str) {
    str = str.replace(/,/g, '');
    var n = parseInt(str, 10);
    if (isNaN(n) || n < 0 || n > 4294967295) throw new Error('Decimal must be 0 to 4294967295');
    return [
      (n >>> 24) & 0xFF,
      (n >>> 16) & 0xFF,
      (n >>> 8) & 0xFF,
      n & 0xFF
    ];
  }

  function parseBinary(str) {
    str = str.replace(/\s/g, '');
    var parts;
    if (str.indexOf('.') !== -1) {
      parts = str.split('.');
      if (parts.length !== 4) throw new Error('Binary dotted format needs 4 octets');
    } else {
      if (str.length !== 32) throw new Error('Binary must be 32 bits or use dotted format');
      parts = [str.substring(0,8), str.substring(8,16), str.substring(16,24), str.substring(24,32)];
    }
    return parts.map(function(p) {
      if (!/^[01]{1,8}$/.test(p)) throw new Error('Each octet must be 1-8 binary digits');
      var n = parseInt(p, 2);
      if (n > 255) throw new Error('Each octet must be 0-255');
      return n;
    });
  }

  function parseHex(str) {
    str = str.replace(/^0x/i, '').replace(/\s/g, '');
    if (!/^[0-9a-fA-F]{1,8}$/.test(str)) throw new Error('Hex must be 1-8 hex digits');
    var n = parseInt(str, 16);
    if (n > 4294967295) throw new Error('Hex value exceeds 32 bits');
    return [
      (n >>> 24) & 0xFF,
      (n >>> 16) & 0xFF,
      (n >>> 8) & 0xFF,
      n & 0xFF
    ];
  }

  function parseOctal(str) {
    var parts = str.split('.');
    if (parts.length === 4) {
      return parts.map(function(p) {
        p = p.replace(/^0+/, '') || '0';
        var n = parseInt(p, 8);
        if (isNaN(n) || n < 0 || n > 255) throw new Error('Each octal octet must be 0-377');
        return n;
      });
    }
    // Single octal number
    str = str.replace(/^0+/, '') || '0';
    var n = parseInt(str, 8);
    if (isNaN(n) || n > 4294967295) throw new Error('Octal value exceeds 32 bits');
    return [
      (n >>> 24) & 0xFF,
      (n >>> 16) & 0xFF,
      (n >>> 8) & 0xFF,
      n & 0xFF
    ];
  }

  // ==================== Show IPv4 Results ====================
  function showIPv4Results(octets) {
    var ip = octets.join('.');
    var num = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;

    // Formats
    document.getElementById('valIpv4').textContent = ip;
    document.getElementById('valDecimal').textContent = num.toString(10);
    document.getElementById('valBinary').textContent = octets.map(function(o) {
      return ('00000000' + o.toString(2)).slice(-8);
    }).join('.');
    document.getElementById('valHex').textContent = '0x' + ('00000000' + num.toString(16).toUpperCase()).slice(-8);
    document.getElementById('valOctal').textContent = octets.map(function(o) {
      return '0' + o.toString(8);
    }).join('.');
    document.getElementById('valIpv6').textContent = '::ffff:' + ip;

    // Classification
    var ipClass = getIPClass(octets[0]);
    var ipType = getIPType(octets);
    classBadge.textContent = 'Class ' + ipClass;
    typeBadge.textContent = ipType.label;
    typeBadge.className = 'type-badge type-' + ipType.type;
    classificationRow.classList.remove('hidden');

    // Octet breakdown
    octetTableBody.innerHTML = octets.map(function(o, i) {
      return '<tr>' +
        '<td><span class="octet-label">Octet ' + (i + 1) + '</span></td>' +
        '<td>' + o + '</td>' +
        '<td>' + ('00000000' + o.toString(2)).slice(-8) + '</td>' +
        '<td>' + ('00' + o.toString(16).toUpperCase()).slice(-2) + '</td>' +
        '<td>' + '0' + o.toString(8) + '</td>' +
        '</tr>';
    }).join('');

    // Binary visualization
    bitRows.innerHTML = octets.map(function(o, i) {
      var bits = ('00000000' + o.toString(2)).slice(-8);
      var cells = bits.split('').map(function(b) {
        return '<div class="bit-cell bit-' + b + '">' + b + '</div>';
      }).join('');
      return '<div class="bit-octet oct-' + i + '">' + cells + '</div>';
    }).join('');

    // Show IPv4 sections, hide IPv6
    octetBreakdown.classList.remove('hidden');
    binaryViz.classList.remove('hidden');
    ipv6Section.classList.add('hidden');

    // Show all IPv4 cards
    document.getElementById('cardIpv4').classList.remove('hidden');
    document.getElementById('cardDecimal').classList.remove('hidden');
    document.getElementById('cardBinary').classList.remove('hidden');
    document.getElementById('cardHex').classList.remove('hidden');
    document.getElementById('cardOctal').classList.remove('hidden');
    document.getElementById('cardIpv6').classList.remove('hidden');

    results.classList.remove('hidden');
  }

  // ==================== IPv6 Handling ====================
  function convertIPv6(raw) {
    var expanded = expandIPv6(raw);
    if (!expanded) throw new Error('Invalid IPv6 address');

    inputError.classList.add('hidden');

    var compressed = compressIPv6(expanded);

    document.getElementById('valIpv6Full').textContent = expanded;
    document.getElementById('valIpv6Compressed').textContent = compressed;

    // Check if it's an IPv4-mapped address
    var isV4Mapped = expanded.startsWith('0000:0000:0000:0000:0000:ffff:');
    var isV4Compat = expanded.startsWith('0000:0000:0000:0000:0000:0000:') && !expanded.endsWith(':0000:0000');

    if (isV4Mapped || raw.indexOf('.') !== -1) {
      // Extract IPv4 part
      var lastTwo = expanded.split(':').slice(-2);
      var o1 = parseInt(lastTwo[0].substring(0, 2), 16);
      var o2 = parseInt(lastTwo[0].substring(2, 4), 16);
      var o3 = parseInt(lastTwo[1].substring(0, 2), 16);
      var o4 = parseInt(lastTwo[1].substring(2, 4), 16);
      showIPv4Results([o1, o2, o3, o4]);
      ipv6Section.classList.remove('hidden');
    } else {
      // Pure IPv6 - show limited info
      classificationRow.classList.remove('hidden');
      var v6Type = getIPv6Type(expanded, compressed);
      classBadge.textContent = 'IPv6';
      typeBadge.textContent = v6Type.label;
      typeBadge.className = 'type-badge type-' + v6Type.type;

      // Hide IPv4-specific cards
      document.getElementById('cardIpv4').classList.add('hidden');
      document.getElementById('cardDecimal').classList.add('hidden');
      document.getElementById('cardBinary').classList.add('hidden');
      document.getElementById('cardHex').classList.add('hidden');
      document.getElementById('cardOctal').classList.add('hidden');
      document.getElementById('cardIpv6').classList.add('hidden');

      octetBreakdown.classList.add('hidden');
      binaryViz.classList.add('hidden');
      ipv6Section.classList.remove('hidden');
    }

    results.classList.remove('hidden');
  }

  function expandIPv6(str) {
    str = str.trim();

    // Handle IPv4-mapped like ::ffff:192.168.1.1
    var v4match = str.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (!v4match) {
      v4match = str.match(/::(\d+\.\d+\.\d+\.\d+)$/);
    }
    if (v4match) {
      var v4parts = v4match[1].split('.');
      if (v4parts.length === 4) {
        var hex1 = ('00' + parseInt(v4parts[0], 10).toString(16)).slice(-2) +
                   ('00' + parseInt(v4parts[1], 10).toString(16)).slice(-2);
        var hex2 = ('00' + parseInt(v4parts[2], 10).toString(16)).slice(-2) +
                   ('00' + parseInt(v4parts[3], 10).toString(16)).slice(-2);
        str = str.replace(v4match[1], hex1 + ':' + hex2);
      }
    }

    // Split on ::
    var halves = str.split('::');
    if (halves.length > 2) return null;

    var groups;
    if (halves.length === 2) {
      var left = halves[0] ? halves[0].split(':') : [];
      var right = halves[1] ? halves[1].split(':') : [];
      var missing = 8 - left.length - right.length;
      if (missing < 0) return null;
      var middle = [];
      for (var i = 0; i < missing; i++) middle.push('0000');
      groups = left.concat(middle, right);
    } else {
      groups = str.split(':');
    }

    if (groups.length !== 8) return null;

    var expanded = groups.map(function(g) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
      return ('0000' + g).slice(-4);
    });

    if (expanded.indexOf(null) !== -1) return null;
    return expanded.join(':').toLowerCase();
  }

  function compressIPv6(expanded) {
    var groups = expanded.split(':');

    // Find longest run of 0000
    var bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
    for (var i = 0; i < 8; i++) {
      if (groups[i] === '0000') {
        if (curStart === -1) curStart = i;
        curLen++;
        if (curLen > bestLen) {
          bestStart = curStart;
          bestLen = curLen;
        }
      } else {
        curStart = -1;
        curLen = 0;
      }
    }

    // Remove leading zeros from each group
    var short = groups.map(function(g) { return g.replace(/^0+/, '') || '0'; });

    if (bestLen >= 2) {
      var before = short.slice(0, bestStart);
      var after = short.slice(bestStart + bestLen);
      return (before.length ? before.join(':') : '') + '::' + (after.length ? after.join(':') : '');
    }

    return short.join(':');
  }

  function getIPv6Type(expanded, compressed) {
    if (compressed === '::1') return { type: 'loopback', label: 'Loopback' };
    if (compressed === '::') return { type: 'reserved', label: 'Unspecified' };
    if (expanded.startsWith('fe80')) return { type: 'link-local', label: 'Link-Local' };
    if (expanded.startsWith('fc') || expanded.startsWith('fd')) return { type: 'private', label: 'Unique Local' };
    if (expanded.startsWith('ff')) return { type: 'multicast', label: 'Multicast' };
    if (expanded.startsWith('2001:0db8')) return { type: 'reserved', label: 'Documentation' };
    return { type: 'public', label: 'Global Unicast' };
  }

  // ==================== IP Classification ====================
  function getIPClass(firstOctet) {
    if (firstOctet < 128) return 'A';
    if (firstOctet < 192) return 'B';
    if (firstOctet < 224) return 'C';
    if (firstOctet < 240) return 'D';
    return 'E';
  }

  function getIPType(octets) {
    var o = octets;

    // Loopback
    if (o[0] === 127) return { type: 'loopback', label: 'Loopback' };

    // Broadcast
    if (o[0] === 255 && o[1] === 255 && o[2] === 255 && o[3] === 255) {
      return { type: 'broadcast', label: 'Broadcast' };
    }

    // Multicast (Class D)
    if (o[0] >= 224 && o[0] <= 239) return { type: 'multicast', label: 'Multicast' };

    // Reserved (Class E)
    if (o[0] >= 240) return { type: 'reserved', label: 'Reserved' };

    // Private ranges
    if (o[0] === 10) return { type: 'private', label: 'Private (10.0.0.0/8)' };
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return { type: 'private', label: 'Private (172.16.0.0/12)' };
    if (o[0] === 192 && o[1] === 168) return { type: 'private', label: 'Private (192.168.0.0/16)' };

    // Link-local
    if (o[0] === 169 && o[1] === 254) return { type: 'link-local', label: 'Link-Local' };

    // Unspecified
    if (o[0] === 0 && o[1] === 0 && o[2] === 0 && o[3] === 0) {
      return { type: 'reserved', label: 'Unspecified' };
    }

    return { type: 'public', label: 'Public' };
  }

  // ==================== Helpers ====================
  function debounce(fn, delay) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  // ==================== Start ====================
  init();
})();
