/**
 * Class Imbalance Simulator
 */
(function() {
  'use strict';

  const elements = {
    imbalanceRatio: document.getElementById('imbalanceRatio'),
    ratioValue: document.getElementById('ratioValue'),
    totalSamples: document.getElementById('totalSamples'),
    strategy: document.getElementById('strategy'),
    simulateBtn: document.getElementById('simulateBtn'),
    distributionCanvas: document.getElementById('distributionCanvas'),
    boundaryCanvas: document.getElementById('boundaryCanvas'),
    accuracy: document.getElementById('accuracy'),
    precision: document.getElementById('precision'),
    recall: document.getElementById('recall'),
    f1score: document.getElementById('f1score'),
    tn: document.getElementById('tn'),
    fp: document.getElementById('fp'),
    fn: document.getElementById('fn'),
    tp: document.getElementById('tp')
  };

  function simulate() {
    const ratio = parseInt(elements.imbalanceRatio.value);
    const total = parseInt(elements.totalSamples.value);
    const strategy = elements.strategy.value;

    const minority = Math.floor(total / (ratio + 1));
    const majority = total - minority;

    drawDistribution(majority, minority, strategy);
    drawBoundary(majority, minority, strategy);
    calculateMetrics(majority, minority, strategy);

    ToolsCommon.Toast.show('Simulation complete', 'success');
  }

  function drawDistribution(majority, minority, strategy) {
    const canvas = elements.distributionCanvas;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, size, size);

    // Adjust for strategy
    let dispMaj = majority, dispMin = minority;
    if (strategy === 'oversample' || strategy === 'smote') {
      dispMin = majority;
    } else if (strategy === 'undersample') {
      dispMaj = minority;
    }

    const total = dispMaj + dispMin;
    const majAngle = (dispMaj / total) * 2 * Math.PI;
    const cx = size / 2, cy = size / 2, r = 70;

    // Majority
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, 0, majAngle);
    ctx.closePath();
    ctx.fill();

    // Minority
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, majAngle, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#1e293b';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`Majority: ${dispMaj}`, cx, size - 20);
    ctx.fillText(`Minority: ${dispMin}`, cx, size - 8);
  }

  function drawBoundary(majority, minority, strategy) {
    const canvas = elements.boundaryCanvas;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, size, size);

    const ratio = majority / minority;
    const boundary = strategy === 'none' ? 0.5 - (ratio - 1) * 0.02 : 0.5;

    // Background regions
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(0, 0, size * boundary, size);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(size * boundary, 0, size * (1 - boundary), size);

    // Boundary line
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(size * boundary, 0);
    ctx.lineTo(size * boundary, size);
    ctx.stroke();
    ctx.setLineDash([]);

    // Generate points
    const padding = 20;
    const majPoints = Math.min(50, majority);
    const minPoints = Math.min(50, minority);

    // Majority class
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < majPoints; i++) {
      const x = padding + Math.random() * (size * 0.4);
      const y = padding + Math.random() * (size - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Minority class
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < minPoints; i++) {
      const x = size * 0.6 + Math.random() * (size * 0.3);
      const y = padding + Math.random() * (size - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Decision Boundary', size * boundary, 12);
  }

  function calculateMetrics(majority, minority, strategy) {
    const ratio = majority / minority;
    const total = majority + minority;

    // Simulated confusion matrix values
    let tn, fp, fn, tp;

    if (strategy === 'none') {
      // Biased toward majority
      const bias = Math.min(0.4, (ratio - 1) * 0.03);
      tn = Math.floor(majority * (0.9 - bias * 0.1));
      fp = majority - tn;
      tp = Math.floor(minority * (0.5 - bias));
      fn = minority - tp;
    } else {
      // Balanced performance
      tn = Math.floor(majority * 0.85);
      fp = majority - tn;
      tp = Math.floor(minority * 0.8);
      fn = minority - tp;
    }

    elements.tn.textContent = tn;
    elements.fp.textContent = fp;
    elements.fn.textContent = fn;
    elements.tp.textContent = tp;

    const accuracy = ((tn + tp) / total * 100).toFixed(1) + '%';
    const precision = (tp / (tp + fp) * 100).toFixed(1) + '%';
    const recall = (tp / (tp + fn) * 100).toFixed(1) + '%';
    const f1 = (2 * tp / (2 * tp + fp + fn) * 100).toFixed(1) + '%';

    elements.accuracy.textContent = accuracy;
    elements.precision.textContent = precision;
    elements.recall.textContent = recall;
    elements.f1score.textContent = f1;
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') { e.preventDefault(); simulate(); }
  }

  function init() {
    elements.imbalanceRatio.addEventListener('input', () => {
      elements.ratioValue.textContent = elements.imbalanceRatio.value;
    });
    elements.simulateBtn.addEventListener('click', simulate);
    document.addEventListener('keydown', handleKeydown);
    simulate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
