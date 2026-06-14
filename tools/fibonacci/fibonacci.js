/**
 * Fibonacci Explorer Tool
 * Sequence generation, golden ratio visualization, spiral drawing, properties
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    termSlider: document.getElementById('termSlider'),
    termValue: document.getElementById('termValue'),
    generateBtn: document.getElementById('generateBtn'),
    copySeqBtn: document.getElementById('copySeqBtn'),
    sequenceList: document.getElementById('sequenceList'),
    ratioList: document.getElementById('ratioList'),
    spiralCanvas: document.getElementById('spiralCanvas'),
    propsGrid: document.getElementById('propsGrid'),
    tabs: document.querySelectorAll('.fib-tab'),
    panels: document.querySelectorAll('.fib-panel')
  };

  // ==================== State ====================
  let sequence = [];
  let sequenceBigInt = [];

  // ==================== Fibonacci Generation ====================

  function generateFibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0n];
    if (n === 2) return [0n, 1n];

    const seq = [0n, 1n];
    for (let i = 2; i < n; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq;
  }

  function isPrime(n) {
    if (n < 2n) return false;
    if (n === 2n) return true;
    if (n % 2n === 0n) return false;
    if (n === 3n) return true;
    if (n % 3n === 0n) return false;
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false;
    }
    return true;
  }

  function digitCount(bigN) {
    return bigN.toString().length;
  }

  // ==================== Tab Switching ====================

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const activeTab = document.querySelector(`.fib-tab[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(`${tabName}Panel`);

    if (activeTab) activeTab.classList.add('active');
    if (activePanel) activePanel.classList.add('active');

    if (tabName === 'spiral' && sequence.length > 0) {
      drawSpiral();
    }
  }

  // ==================== Render Sequence ====================

  function renderSequence() {
    if (sequenceBigInt.length === 0) {
      elements.sequenceList.innerHTML = '<div class="fib-empty">Press <strong>Generate</strong> to start exploring</div>';
      return;
    }

    let html = '';
    for (let i = 0; i < sequenceBigInt.length; i++) {
      const val = sequenceBigInt[i];
      const prime = val > 1n && sequenceBigInt.length <= 50 && isPrime(val);
      html += `<div class="fib-seq-item${prime ? ' prime' : ''}">
        <span class="fib-seq-index">F(${i})</span>
        <span class="fib-seq-value">${val.toString()}</span>
        ${prime ? '<span class="fib-seq-prime-badge">prime</span>' : ''}
      </div>`;
    }
    elements.sequenceList.innerHTML = html;
  }

  // ==================== Render Golden Ratio ====================

  function renderRatio() {
    if (sequenceBigInt.length < 3) {
      elements.ratioList.innerHTML = '<div class="fib-empty">Need at least 3 terms to show ratios</div>';
      return;
    }

    const PHI = 1.6180339887498948482;

    let html = `<div class="fib-ratio-item fib-ratio-header">
      <span class="fib-ratio-label">Division</span>
      <span class="fib-ratio-val">Ratio</span>
      <span class="fib-ratio-diff">Diff from &phi;</span>
    </div>`;

    for (let i = 2; i < sequenceBigInt.length && i < 50; i++) {
      const prev = sequenceBigInt[i - 1];
      if (prev === 0n) continue;

      const ratio = Number(sequenceBigInt[i]) / Number(prev);
      const diff = Math.abs(ratio - PHI);
      const diffClass = diff < 0.001 ? 'close' : 'far';

      html += `<div class="fib-ratio-item">
        <span class="fib-ratio-label">F(${i})/F(${i - 1})</span>
        <span class="fib-ratio-val">${ratio.toFixed(12)}</span>
        <span class="fib-ratio-diff ${diffClass}">${diff < 0.000001 ? '~0' : diff.toFixed(10)}</span>
      </div>`;
    }

    elements.ratioList.innerHTML = html;
  }

  // ==================== Draw Spiral ====================

  function drawSpiral() {
    const canvas = elements.spiralCanvas;
    const ctx = canvas.getContext('2d');

    // Responsive canvas sizing
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 32, 600);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Use at most 12 terms for visual clarity
    const terms = sequence.slice(1, Math.min(sequence.length, 13));
    if (terms.length < 2) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#888';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Need at least 3 terms to draw a spiral', size / 2, size / 2);
      return;
    }

    // Scale to fit
    const maxVal = Math.max(...terms);
    const scale = (size * 0.45) / (maxVal || 1);

    const centerX = size / 2;
    const centerY = size / 2;

    const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#91214E';
    const border = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';

    // Draw golden rectangles
    let x = centerX;
    let y = centerY;

    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }  // left
    ];

    const rects = [];

    for (let i = terms.length - 1; i >= 0; i--) {
      const s = terms[i] * scale;
      const dir = directions[i % 4];

      let rx, ry;
      if (i === terms.length - 1) {
        rx = centerX - s / 2;
        ry = centerY - s / 2;
      } else {
        const prev = rects[rects.length - 1];
        switch (i % 4) {
          case 0: rx = prev.x; ry = prev.y - s; break;
          case 1: rx = prev.x + prev.s; ry = prev.y; break;
          case 2: rx = prev.x + prev.s - s; ry = prev.y + prev.s; break;
          case 3: rx = prev.x - s; ry = prev.y + prev.s - s; break;
        }
      }

      rects.push({ x: rx, y: ry, s });
    }

    // Draw rectangles
    rects.forEach((r, i) => {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x, r.y, r.s, r.s);

      ctx.fillStyle = `${primary}${(10 + i * 4).toString(16).padStart(2, '0')}`;
      ctx.fillRect(r.x, r.y, r.s, r.s);
    });

    // Draw spiral arcs
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    rects.forEach((r, i) => {
      const idx = (terms.length - 1 - i) % 4;
      let startAngle, endAngle, cx, cy;

      switch (idx) {
        case 0:
          cx = r.x + r.s; cy = r.y + r.s;
          startAngle = Math.PI; endAngle = 1.5 * Math.PI;
          break;
        case 1:
          cx = r.x; cy = r.y + r.s;
          startAngle = 1.5 * Math.PI; endAngle = 2 * Math.PI;
          break;
        case 2:
          cx = r.x; cy = r.y;
          startAngle = 0; endAngle = 0.5 * Math.PI;
          break;
        case 3:
          cx = r.x + r.s; cy = r.y;
          startAngle = 0.5 * Math.PI; endAngle = Math.PI;
          break;
      }

      ctx.arc(cx, cy, r.s, startAngle, endAngle);
    });

    ctx.stroke();
  }

  // ==================== Render Properties ====================

  function renderProperties() {
    if (sequenceBigInt.length === 0) {
      elements.propsGrid.innerHTML = '<div class="fib-empty">Generate a sequence to see properties</div>';
      return;
    }

    const n = sequenceBigInt.length;
    const last = sequenceBigInt[n - 1];
    const sum = sequenceBigInt.reduce((a, b) => a + b, 0n);
    const lastIsPrime = n <= 50 && isPrime(last);
    const digits = digitCount(last);

    const lastStr = last.toString();
    const displayLast = lastStr.length > 20 ? lastStr.slice(0, 17) + '...' : lastStr;
    const sumStr = sum.toString();
    const displaySum = sumStr.length > 20 ? sumStr.slice(0, 17) + '...' : sumStr;

    elements.propsGrid.innerHTML = `
      <div class="fib-prop-card">
        <span class="fib-prop-label">Terms</span>
        <span class="fib-prop-value">${n}</span>
      </div>
      <div class="fib-prop-card">
        <span class="fib-prop-label">F(${n - 1})</span>
        <span class="fib-prop-value ${lastStr.length > 15 ? 'small' : ''}">${displayLast}</span>
      </div>
      <div class="fib-prop-card">
        <span class="fib-prop-label">Sum</span>
        <span class="fib-prop-value ${sumStr.length > 15 ? 'small' : ''}">${displaySum}</span>
      </div>
      <div class="fib-prop-card">
        <span class="fib-prop-label">Digits in F(${n - 1})</span>
        <span class="fib-prop-value">${digits}</span>
      </div>
      <div class="fib-prop-card">
        <span class="fib-prop-label">F(${n - 1}) is Prime?</span>
        <span class="fib-prop-value primary">${n > 50 ? 'N/A (too large)' : (lastIsPrime ? 'Yes' : 'No')}</span>
      </div>
      <div class="fib-prop-card">
        <span class="fib-prop-label">F(${n - 1}) Even/Odd</span>
        <span class="fib-prop-value">${last % 2n === 0n ? 'Even' : 'Odd'}</span>
      </div>
    `;
  }

  // ==================== Generate All ====================

  function generate() {
    const n = parseInt(elements.termSlider.value);
    sequenceBigInt = generateFibonacci(n);
    sequence = sequenceBigInt.map(Number);

    renderSequence();
    renderRatio();
    renderProperties();

    // Redraw spiral if that tab is active
    const spiralActive = document.getElementById('spiralPanel').classList.contains('active');
    if (spiralActive) drawSpiral();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(`Generated ${n} Fibonacci term${n !== 1 ? 's' : ''}`, 'success');
    }
  }

  // ==================== Copy Sequence ====================

  function copySequence() {
    if (sequenceBigInt.length === 0) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Nothing to copy', 'error');
      }
      return;
    }

    const text = sequenceBigInt.map((v, i) => `F(${i}) = ${v}`).join('\n');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.copyWithToast(text, 'Sequence copied!');
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  // ==================== Event Listeners ====================

  elements.termSlider.addEventListener('input', function() {
    elements.termValue.textContent = this.value;
  });

  elements.generateBtn.addEventListener('click', generate);
  elements.copySeqBtn.addEventListener('click', copySequence);

  elements.tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Keyboard: Enter to generate
  elements.termSlider.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') generate();
  });

  // Resize handler for spiral
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (document.getElementById('spiralPanel').classList.contains('active') && sequence.length > 0) {
        drawSpiral();
      }
    }, 200);
  });

  // Auto-generate on load
  generate();

})();
