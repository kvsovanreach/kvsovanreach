/**
 * KVSOVANREACH Neural Activation Visualizer
 * Interactive activation function explorer
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    activationChart: document.getElementById('activationChart'),
    chartLegend: document.getElementById('chartLegend'),
    functionBtns: document.querySelectorAll('.function-btn'),
    inputValue: document.getElementById('inputValue'),
    outputValue: document.getElementById('outputValue'),
    derivativeValue: document.getElementById('derivativeValue'),
    detailsTitle: document.getElementById('detailsTitle'),
    detailRange: document.getElementById('detailRange'),
    detailVanishing: document.getElementById('detailVanishing'),
    detailZeroCentered: document.getElementById('detailZeroCentered'),
    detailComputation: document.getElementById('detailComputation'),
    detailDesc: document.getElementById('detailDesc'),
    detailPros: document.getElementById('detailPros'),
    detailCons: document.getElementById('detailCons')
  };

  // ==================== Activation Functions ====================
  const FUNCTIONS = {
    sigmoid: {
      name: 'Sigmoid',
      fn: x => 1 / (1 + Math.exp(-x)),
      derivative: x => {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      },
      color: '#6366f1',
      range: '(0, 1)',
      vanishing: 'Yes',
      zeroCentered: 'No',
      computation: 'Expensive',
      desc: 'The sigmoid function squashes input values to a range between 0 and 1. It\'s commonly used in binary classification and in the output layer of neural networks.',
      pros: ['Smooth gradient', 'Output bound between 0 and 1', 'Clear predictions for classification'],
      cons: ['Vanishing gradient problem', 'Not zero-centered', 'Computationally expensive (exp)']
    },
    tanh: {
      name: 'Tanh',
      fn: x => Math.tanh(x),
      derivative: x => 1 - Math.pow(Math.tanh(x), 2),
      color: '#ec4899',
      range: '(-1, 1)',
      vanishing: 'Yes',
      zeroCentered: 'Yes',
      computation: 'Expensive',
      desc: 'Tanh (hyperbolic tangent) is similar to sigmoid but outputs values between -1 and 1, making it zero-centered. Often preferred over sigmoid in hidden layers.',
      pros: ['Zero-centered output', 'Stronger gradients than sigmoid', 'Bound output range'],
      cons: ['Still has vanishing gradient problem', 'Computationally expensive']
    },
    relu: {
      name: 'ReLU',
      fn: x => Math.max(0, x),
      derivative: x => x > 0 ? 1 : 0,
      color: '#22c55e',
      range: '[0, ∞)',
      vanishing: 'No',
      zeroCentered: 'No',
      computation: 'Cheap',
      desc: 'Rectified Linear Unit (ReLU) is the most popular activation function in deep learning. It outputs zero for negative inputs and the input value for positive inputs.',
      pros: ['No vanishing gradient for positive values', 'Computationally efficient', 'Sparse activation (some neurons output 0)'],
      cons: ['Dying ReLU problem', 'Not zero-centered', 'Unbounded output']
    },
    leakyrelu: {
      name: 'Leaky ReLU',
      fn: x => x > 0 ? x : 0.01 * x,
      derivative: x => x > 0 ? 1 : 0.01,
      color: '#14b8a6',
      range: '(-∞, ∞)',
      vanishing: 'No',
      zeroCentered: 'Almost',
      computation: 'Cheap',
      desc: 'Leaky ReLU allows a small, non-zero gradient when the input is negative, addressing the dying ReLU problem.',
      pros: ['Prevents dying ReLU', 'Allows negative gradients', 'Fast computation'],
      cons: ['Inconsistent results', 'Arbitrary slope for negatives', 'Not zero-centered']
    },
    elu: {
      name: 'ELU',
      fn: x => x > 0 ? x : Math.exp(x) - 1,
      derivative: x => x > 0 ? 1 : Math.exp(x),
      color: '#f59e0b',
      range: '(-1, ∞)',
      vanishing: 'No',
      zeroCentered: 'Almost',
      computation: 'Moderate',
      desc: 'Exponential Linear Unit (ELU) uses exponential for negative values, allowing negative outputs and maintaining a mean activation closer to zero.',
      pros: ['Smooth for negative values', 'Pushes mean activation toward zero', 'No dying ReLU problem'],
      cons: ['More expensive than ReLU', 'Unbounded positive output', 'Uses exponential']
    },
    swish: {
      name: 'Swish',
      fn: x => x / (1 + Math.exp(-x)),
      derivative: x => {
        const s = 1 / (1 + Math.exp(-x));
        return s + x * s * (1 - s);
      },
      color: '#8b5cf6',
      range: '(-∞, ∞)',
      vanishing: 'No',
      zeroCentered: 'Almost',
      computation: 'Expensive',
      desc: 'Swish is a self-gated activation function (x * sigmoid(x)). Developed at Google, it often outperforms ReLU in deep networks.',
      pros: ['Smooth and non-monotonic', 'Better gradient flow', 'Works well in deep networks'],
      cons: ['Computationally expensive', 'Requires tuning in some cases', 'Unbounded output']
    },
    softplus: {
      name: 'Softplus',
      fn: x => Math.log(1 + Math.exp(x)),
      derivative: x => 1 / (1 + Math.exp(-x)),
      color: '#f43f5e',
      range: '(0, ∞)',
      vanishing: 'No',
      zeroCentered: 'No',
      computation: 'Moderate',
      desc: 'Softplus is a smooth approximation of ReLU. Unlike ReLU, it\'s differentiable everywhere and has a smooth curve.',
      pros: ['Smooth everywhere', 'Never exactly zero', 'Approximates ReLU smoothly'],
      cons: ['Not zero-centered', 'Slower than ReLU', 'Unbounded output']
    },
    gelu: {
      name: 'GELU',
      fn: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
      derivative: x => {
        const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
        const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
        return cdf + x * pdf;
      },
      color: '#0ea5e9',
      range: '(-∞, ∞)',
      vanishing: 'No',
      zeroCentered: 'Almost',
      computation: 'Expensive',
      desc: 'Gaussian Error Linear Unit (GELU) weights inputs by their percentile. It\'s the default activation in BERT and GPT models.',
      pros: ['State-of-the-art in NLP', 'Smooth and differentiable', 'Probabilistic interpretation'],
      cons: ['Computationally expensive', 'Complex formula', 'May not improve simpler tasks']
    }
  };

  // ==================== State ====================
  let chart = null;
  let activeFunction = 'sigmoid';

  // ==================== Chart Functions ====================

  function generateChartData() {
    const labels = [];
    const data = {};

    // Generate x values from -6 to 6
    for (let x = -6; x <= 6; x += 0.1) {
      labels.push(x.toFixed(1));
    }

    // Calculate y values for active function
    const fn = FUNCTIONS[activeFunction];
    data[activeFunction] = labels.map(x => fn.fn(parseFloat(x)));

    return { labels, data };
  }

  function createChart() {
    const { labels, data } = generateChartData();
    const ctx = elements.activationChart.getContext('2d');
    const fn = FUNCTIONS[activeFunction];

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: fn.name,
          data: data[activeFunction],
          borderColor: fn.color,
          backgroundColor: `${fn.color}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
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
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => `f(${context.label}) = ${context.parsed.y.toFixed(4)}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Input (x)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value, index) => index % 10 === 0 ? labels[index] : ''
            }
          },
          y: {
            title: {
              display: true,
              text: 'Output f(x)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }

  // ==================== UI Functions ====================

  function updateDetails() {
    const fn = FUNCTIONS[activeFunction];

    elements.detailsTitle.textContent = fn.name;
    elements.detailRange.textContent = fn.range;
    elements.detailVanishing.textContent = fn.vanishing;
    elements.detailZeroCentered.textContent = fn.zeroCentered;
    elements.detailComputation.textContent = fn.computation;
    elements.detailDesc.textContent = fn.desc;

    elements.detailPros.innerHTML = fn.pros.map(p => `<li>${p}</li>`).join('');
    elements.detailCons.innerHTML = fn.cons.map(c => `<li>${c}</li>`).join('');
  }

  function updateCalculation() {
    const x = parseFloat(elements.inputValue.value) || 0;
    const fn = FUNCTIONS[activeFunction];

    const output = fn.fn(x);
    const derivative = fn.derivative(x);

    elements.outputValue.textContent = output.toFixed(6);
    elements.derivativeValue.textContent = derivative.toFixed(6);
  }

  function selectFunction(fnName) {
    activeFunction = fnName;

    // Update button states
    elements.functionBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.function === fnName);
    });

    // Update chart
    createChart();

    // Update details
    updateDetails();

    // Update calculation
    updateCalculation();
  }

  // ==================== Initialization ====================

  function init() {
    // Function buttons
    elements.functionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectFunction(btn.dataset.function);
      });
    });

    // Calculator input
    elements.inputValue.addEventListener('input', updateCalculation);

    // Initialize
    createChart();
    updateDetails();
    updateCalculation();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
