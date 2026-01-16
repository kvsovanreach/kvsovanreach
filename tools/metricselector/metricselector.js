/**
 * KVSOVANREACH Evaluation Metric Selector
 * ML metric selection guide with formulas and use cases
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    considerationsGrid: document.getElementById('considerationsGrid'),
    metricsGrid: document.getElementById('metricsGrid'),
    detailSection: document.getElementById('detailSection'),
    detailTitle: document.getElementById('detailTitle'),
    detailContent: document.getElementById('detailContent'),
    closeDetailBtn: document.getElementById('closeDetailBtn')
  };

  // Considerations by problem type
  const considerations = {
    binary: [
      { id: 'imbalanced', label: 'Imbalanced classes' },
      { id: 'fp_cost', label: 'False positives are costly' },
      { id: 'fn_cost', label: 'False negatives are costly' },
      { id: 'probability', label: 'Need probability scores' },
      { id: 'threshold', label: 'Adjustable threshold' },
      { id: 'interpretable', label: 'Must be interpretable' }
    ],
    multiclass: [
      { id: 'imbalanced', label: 'Imbalanced classes' },
      { id: 'class_importance', label: 'Classes have different importance' },
      { id: 'top_k', label: 'Top-K predictions matter' },
      { id: 'hierarchical', label: 'Hierarchical classes' },
      { id: 'interpretable', label: 'Must be interpretable' }
    ],
    regression: [
      { id: 'outliers', label: 'Sensitive to outliers' },
      { id: 'scale', label: 'Scale-independent needed' },
      { id: 'interpretable', label: 'Easy interpretation' },
      { id: 'direction', label: 'Direction matters' },
      { id: 'relative', label: 'Relative errors matter' }
    ],
    ranking: [
      { id: 'position', label: 'Position matters' },
      { id: 'cutoff', label: 'Top-K results important' },
      { id: 'relevance', label: 'Graded relevance' },
      { id: 'diversity', label: 'Diversity needed' }
    ]
  };

  // Metrics by problem type
  const metrics = {
    binary: [
      {
        id: 'accuracy',
        name: 'Accuracy',
        icon: 'fa-check-circle',
        desc: 'Percentage of correct predictions',
        formula: 'Accuracy = (TP + TN) / (TP + TN + FP + FN)',
        range: '0 to 1',
        useWhen: ['Balanced classes', 'All errors equally important'],
        avoid: ['Imbalanced datasets', 'Different error costs'],
        recommended: []
      },
      {
        id: 'precision',
        name: 'Precision',
        icon: 'fa-bullseye',
        desc: 'Of predicted positives, how many are correct',
        formula: 'Precision = TP / (TP + FP)',
        range: '0 to 1',
        useWhen: ['False positives are costly', 'Spam detection', 'Fraud alerts'],
        avoid: ['When recall is more important'],
        recommended: ['fp_cost']
      },
      {
        id: 'recall',
        name: 'Recall (Sensitivity)',
        icon: 'fa-search',
        desc: 'Of actual positives, how many detected',
        formula: 'Recall = TP / (TP + FN)',
        range: '0 to 1',
        useWhen: ['False negatives are costly', 'Disease detection', 'Security threats'],
        avoid: ['When precision is more important'],
        recommended: ['fn_cost']
      },
      {
        id: 'f1',
        name: 'F1-Score',
        icon: 'fa-balance-scale',
        desc: 'Harmonic mean of precision and recall',
        formula: 'F1 = 2 × (Precision × Recall) / (Precision + Recall)',
        range: '0 to 1',
        useWhen: ['Imbalanced classes', 'Need balance between precision and recall'],
        avoid: ['When one metric clearly more important'],
        recommended: ['imbalanced']
      },
      {
        id: 'auc_roc',
        name: 'AUC-ROC',
        icon: 'fa-chart-area',
        desc: 'Area under ROC curve, threshold-independent',
        formula: 'AUC = Area under TPR vs FPR curve',
        range: '0.5 (random) to 1 (perfect)',
        useWhen: ['Compare models', 'Threshold-independent evaluation', 'Probability outputs'],
        avoid: ['Highly imbalanced data', 'Need single threshold'],
        recommended: ['probability', 'threshold']
      },
      {
        id: 'auc_pr',
        name: 'AUC-PR',
        icon: 'fa-chart-line',
        desc: 'Area under Precision-Recall curve',
        formula: 'AUC-PR = Area under Precision vs Recall curve',
        range: '0 to 1',
        useWhen: ['Imbalanced datasets', 'Focus on positive class'],
        avoid: ['Balanced datasets'],
        recommended: ['imbalanced', 'probability']
      },
      {
        id: 'log_loss',
        name: 'Log Loss',
        icon: 'fa-calculator',
        desc: 'Penalizes confident wrong predictions',
        formula: 'LogLoss = -1/N × Σ[y×log(p) + (1-y)×log(1-p)]',
        range: '0 (perfect) to +∞',
        useWhen: ['Probability calibration matters', 'Ranking by confidence'],
        avoid: ['Only care about classification accuracy'],
        recommended: ['probability']
      }
    ],
    multiclass: [
      {
        id: 'accuracy',
        name: 'Accuracy',
        icon: 'fa-check-circle',
        desc: 'Percentage of correct predictions',
        formula: 'Accuracy = Correct / Total',
        range: '0 to 1',
        useWhen: ['Balanced classes', 'All classes equally important'],
        avoid: ['Imbalanced datasets'],
        recommended: []
      },
      {
        id: 'macro_f1',
        name: 'Macro F1',
        icon: 'fa-balance-scale',
        desc: 'Average F1 across all classes (unweighted)',
        formula: 'Macro F1 = (1/K) × Σ F1_k',
        range: '0 to 1',
        useWhen: ['All classes equally important', 'Imbalanced but equal importance'],
        avoid: ['Classes have different importance'],
        recommended: ['imbalanced']
      },
      {
        id: 'weighted_f1',
        name: 'Weighted F1',
        icon: 'fa-weight-hanging',
        desc: 'Weighted average F1 by class frequency',
        formula: 'Weighted F1 = Σ (n_k/N) × F1_k',
        range: '0 to 1',
        useWhen: ['Classes have different importance', 'Frequency-based importance'],
        avoid: ['Minority class equally important'],
        recommended: ['class_importance']
      },
      {
        id: 'top_k_accuracy',
        name: 'Top-K Accuracy',
        icon: 'fa-trophy',
        desc: 'Correct if true label in top K predictions',
        formula: 'Top-K Acc = Correct in Top K / Total',
        range: '0 to 1',
        useWhen: ['Multiple correct answers acceptable', 'Recommendation systems'],
        avoid: ['Only one answer is acceptable'],
        recommended: ['top_k']
      },
      {
        id: 'confusion_matrix',
        name: 'Confusion Matrix',
        icon: 'fa-table',
        desc: 'Visual breakdown of all predictions',
        formula: 'Matrix of predictions vs actuals',
        range: 'N/A (visualization)',
        useWhen: ['Detailed error analysis', 'Understanding misclassifications'],
        avoid: ['Need single metric'],
        recommended: ['interpretable']
      }
    ],
    regression: [
      {
        id: 'mse',
        name: 'MSE',
        icon: 'fa-square',
        desc: 'Mean Squared Error - penalizes large errors',
        formula: 'MSE = (1/N) × Σ(y - ŷ)²',
        range: '0 (perfect) to +∞',
        useWhen: ['Large errors should be penalized more', 'Optimization objective'],
        avoid: ['Sensitive to outliers is a problem'],
        recommended: ['outliers']
      },
      {
        id: 'rmse',
        name: 'RMSE',
        icon: 'fa-square-root-variable',
        desc: 'Root MSE - same units as target',
        formula: 'RMSE = √MSE',
        range: '0 (perfect) to +∞',
        useWhen: ['Want error in original units', 'Interpretable magnitude'],
        avoid: ['Scale comparison needed'],
        recommended: ['interpretable']
      },
      {
        id: 'mae',
        name: 'MAE',
        icon: 'fa-minus',
        desc: 'Mean Absolute Error - robust to outliers',
        formula: 'MAE = (1/N) × Σ|y - ŷ|',
        range: '0 (perfect) to +∞',
        useWhen: ['Outliers present', 'All errors weighted equally'],
        avoid: ['Large errors should be penalized more'],
        recommended: []
      },
      {
        id: 'r2',
        name: 'R² Score',
        icon: 'fa-percent',
        desc: 'Proportion of variance explained',
        formula: 'R² = 1 - SS_res/SS_tot',
        range: '-∞ to 1 (perfect)',
        useWhen: ['Compare across datasets', 'Variance explanation'],
        avoid: ['Non-linear relationships'],
        recommended: ['scale']
      },
      {
        id: 'mape',
        name: 'MAPE',
        icon: 'fa-divide',
        desc: 'Mean Absolute Percentage Error',
        formula: 'MAPE = (100/N) × Σ|y - ŷ|/|y|',
        range: '0% (perfect) to +∞',
        useWhen: ['Percentage errors matter', 'Different scales'],
        avoid: ['Zero values in target'],
        recommended: ['relative', 'scale']
      }
    ],
    ranking: [
      {
        id: 'ndcg',
        name: 'NDCG',
        icon: 'fa-list-ol',
        desc: 'Normalized Discounted Cumulative Gain',
        formula: 'NDCG = DCG / IDCG',
        range: '0 to 1',
        useWhen: ['Graded relevance', 'Position important', 'Search results'],
        avoid: ['Binary relevance only'],
        recommended: ['position', 'relevance']
      },
      {
        id: 'map',
        name: 'MAP',
        icon: 'fa-chart-bar',
        desc: 'Mean Average Precision',
        formula: 'MAP = (1/Q) × Σ AP(q)',
        range: '0 to 1',
        useWhen: ['Binary relevance', 'Multiple queries'],
        avoid: ['Graded relevance needed'],
        recommended: ['cutoff']
      },
      {
        id: 'mrr',
        name: 'MRR',
        icon: 'fa-1',
        desc: 'Mean Reciprocal Rank',
        formula: 'MRR = (1/Q) × Σ 1/rank_i',
        range: '0 to 1',
        useWhen: ['First relevant result matters most', 'QA systems'],
        avoid: ['Multiple relevant items matter'],
        recommended: ['position']
      },
      {
        id: 'precision_at_k',
        name: 'Precision@K',
        icon: 'fa-medal',
        desc: 'Precision in top K results',
        formula: 'P@K = Relevant in K / K',
        range: '0 to 1',
        useWhen: ['Fixed result set size', 'Top K matters'],
        avoid: ['Position within K matters'],
        recommended: ['cutoff']
      }
    ]
  };

  // State
  let currentProblemType = 'binary';
  let selectedConsiderations = new Set();

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    renderConsiderations();
    renderMetrics();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Problem type buttons
    document.querySelectorAll('.problem-btn').forEach(btn => {
      btn.addEventListener('click', () => selectProblemType(btn.dataset.type));
    });

    // Close detail
    elements.closeDetailBtn.addEventListener('click', closeDetail);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Select problem type
   */
  function selectProblemType(type) {
    currentProblemType = type;
    selectedConsiderations.clear();

    // Update button states
    document.querySelectorAll('.problem-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    renderConsiderations();
    renderMetrics();
    closeDetail();
  }

  /**
   * Render considerations
   */
  function renderConsiderations() {
    const typeConsiderations = considerations[currentProblemType] || [];

    elements.considerationsGrid.innerHTML = typeConsiderations.map(item => `
      <div class="consideration-item ${selectedConsiderations.has(item.id) ? 'active' : ''}" data-id="${item.id}">
        <div class="consideration-checkbox">
          <i class="fa-solid fa-check"></i>
        </div>
        <span class="consideration-label">${item.label}</span>
      </div>
    `).join('');

    // Bind click events
    elements.considerationsGrid.querySelectorAll('.consideration-item').forEach(item => {
      item.addEventListener('click', () => toggleConsideration(item.dataset.id));
    });
  }

  /**
   * Toggle consideration
   */
  function toggleConsideration(id) {
    if (selectedConsiderations.has(id)) {
      selectedConsiderations.delete(id);
    } else {
      selectedConsiderations.add(id);
    }

    renderConsiderations();
    renderMetrics();
  }

  /**
   * Render metrics
   */
  function renderMetrics() {
    const typeMetrics = metrics[currentProblemType] || [];

    // Score metrics based on selected considerations
    const scoredMetrics = typeMetrics.map(metric => {
      let score = 0;
      metric.recommended.forEach(rec => {
        if (selectedConsiderations.has(rec)) {
          score += 1;
        }
      });
      return { ...metric, score };
    });

    // Sort by score (recommended first)
    scoredMetrics.sort((a, b) => b.score - a.score);

    elements.metricsGrid.innerHTML = scoredMetrics.map(metric => `
      <div class="metric-card ${metric.score > 0 ? 'recommended' : ''}" data-id="${metric.id}">
        <div class="metric-card-header">
          <span class="metric-name">${metric.name}</span>
          <div class="metric-icon">
            <i class="fa-solid ${metric.icon}"></i>
          </div>
        </div>
        <p class="metric-desc">${metric.desc}</p>
      </div>
    `).join('');

    // Bind click events
    elements.metricsGrid.querySelectorAll('.metric-card').forEach(card => {
      card.addEventListener('click', () => showMetricDetail(card.dataset.id));
    });
  }

  /**
   * Show metric detail
   */
  function showMetricDetail(metricId) {
    const typeMetrics = metrics[currentProblemType] || [];
    const metric = typeMetrics.find(m => m.id === metricId);

    if (!metric) return;

    elements.detailTitle.textContent = metric.name;

    elements.detailContent.innerHTML = `
      <div class="detail-formula">${metric.formula}</div>
      <div class="detail-info">
        <div class="detail-info-item">
          <h4>Range</h4>
          <p>${metric.range}</p>
        </div>
        <div class="detail-info-item">
          <h4>When to Use</h4>
          <ul>
            ${metric.useWhen.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="detail-info-item">
          <h4>When to Avoid</h4>
          <ul>
            ${metric.avoid.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    elements.detailSection.style.display = 'block';
    elements.detailSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Close detail panel
   */
  function closeDetail() {
    elements.detailSection.style.display = 'none';
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeDetail();
    }

    // Number keys to select problem type
    const typeMap = { '1': 'binary', '2': 'multiclass', '3': 'regression', '4': 'ranking' };
    if (typeMap[e.key]) {
      selectProblemType(typeMap[e.key]);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
