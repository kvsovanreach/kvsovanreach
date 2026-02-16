/**
 * KVSOVANREACH Big-O Cheat Sheet
 * Interactive complexity reference
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    complexityChart: document.getElementById('complexityChart'),
    nSlider: document.getElementById('nSlider'),
    nValue: document.getElementById('nValue')
  };

  // ==================== State ====================
  let chart = null;

  // ==================== Complexity Functions ====================

  function constant(n) {
    return 1;
  }

  function logarithmic(n) {
    return Math.log2(n);
  }

  function linear(n) {
    return n;
  }

  function linearithmic(n) {
    return n * Math.log2(n);
  }

  function quadratic(n) {
    return n * n;
  }

  function exponential(n) {
    // Cap at a reasonable value for visualization
    return Math.min(Math.pow(2, n), 10000000);
  }

  // ==================== Chart Functions ====================

  function generateData(maxN) {
    const labels = [];
    const o1 = [];
    const oLogN = [];
    const oN = [];
    const oNLogN = [];
    const oN2 = [];
    const o2N = [];

    for (let n = 1; n <= maxN; n++) {
      labels.push(n);
      o1.push(constant(n));
      oLogN.push(logarithmic(n));
      oN.push(linear(n));
      oNLogN.push(linearithmic(n));
      oN2.push(quadratic(n));
      // Only show 2^n for small values
      o2N.push(n <= 15 ? exponential(n) : null);
    }

    return { labels, o1, oLogN, oN, oNLogN, oN2, o2N };
  }

  function createChart(maxN) {
    const data = generateData(maxN);
    const ctx = elements.complexityChart.getContext('2d');

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'O(1)',
            data: data.o1,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'O(log n)',
            data: data.oLogN,
            borderColor: '#84cc16',
            backgroundColor: 'rgba(132, 204, 22, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'O(n)',
            data: data.oN,
            borderColor: '#eab308',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'O(n log n)',
            data: data.oNLogN,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'O(n²)',
            data: data.oN2,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'O(2ⁿ)',
            data: data.o2N,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            spanGaps: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let value = context.parsed.y;
                if (value === null) return null;
                if (value >= 1000000) {
                  return `${context.dataset.label}: ${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${context.dataset.label}: ${(value / 1000).toFixed(1)}K`;
                }
                return `${context.dataset.label}: ${value.toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Input Size (n)'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Operations'
            },
            type: 'logarithmic',
            min: 1,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }

  // ==================== Initialization ====================

  function init() {
    // Slider
    elements.nSlider.addEventListener('input', () => {
      const n = parseInt(elements.nSlider.value);
      elements.nValue.textContent = n;
      createChart(n);
    });

    // Initialize chart
    createChart(50);

    // Card click animations
    document.querySelectorAll('.complexity-card').forEach(card => {
      card.addEventListener('click', () => {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      });
    });
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
