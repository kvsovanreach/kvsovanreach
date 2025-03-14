/**
 * Lucky Draw History Module
 * Handles spin history management and visualization
 */

const LuckyDrawHistory = (function() {
  // Private variables
  let historyData = [];
  let filteredHistory = [];
  let currentSearchTerm = '';
  let currentSortOrder = 'newest';
  let chart = null;
  
  /**
   * Initializes the history module
   */
  function init() {
    console.log('Initializing lucky draw history');
    
    // Load history data
    loadHistory();
    
    // Update history display
    displayHistory();
    
    // Update summary statistics
    updateSummaryStats();
    
    // Initialize chart if available
    initChart();
  }
  
  /**
   * Loads history data from localStorage
   */
  function loadHistory() {
    try {
      const savedHistory = localStorage.getItem('luckyDrawHistory');
      if (savedHistory) {
        historyData = JSON.parse(savedHistory);
        // Create a copy for filtered data
        filteredHistory = [...historyData];
      } else {
        historyData = [];
        filteredHistory = [];
      }
    } catch (error) {
      console.error('Error loading history data:', error);
      historyData = [];
      filteredHistory = [];
    }
  }
  
  /**
   * Displays history records in the UI
   */
  function displayHistory() {
    const historyRecords = document.getElementById('historyRecords');
    if (!historyRecords) return;
    
    // Clear current records
    historyRecords.innerHTML = '';
    
    // Show empty state if no records
    if (filteredHistory.length === 0) {
      historyRecords.innerHTML = `
        <div class="lucky-history-empty">
          <i class="fas fa-history"></i>
          <p>No spin history found</p>
          <p class="lucky-empty-hint">Spin the wheel to start recording your results</p>
        </div>
      `;
      return;
    }
    
    // Add each record
    filteredHistory.forEach(record => {
      const recordElement = document.createElement('div');
      recordElement.className = 'lucky-record-item';
      recordElement.dataset.id = record.id;
      
      // Format date
      const date = new Date(record.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      recordElement.innerHTML = `
        <div class="lucky-record-color" style="background-color: ${record.color}"></div>
        <div class="lucky-record-details">
          <div class="lucky-record-label">${record.label}</div>
          <div class="lucky-record-date">${formattedDate}</div>
        </div>
        <div class="lucky-record-actions">
          <button class="lucky-record-delete" data-id="${record.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      historyRecords.appendChild(recordElement);
    });
    
    // Add event listeners for delete buttons
    const deleteButtons = historyRecords.querySelectorAll('.lucky-record-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const recordId = this.dataset.id;
        deleteRecord(recordId);
      });
    });
  }
  
  /**
   * Updates summary statistics
   */
  function updateSummaryStats() {
    const totalSpinsCount = document.getElementById('totalSpinsCount');
    const mostCommonPrize = document.getElementById('mostCommonPrize');
    const todaySpinsCount = document.getElementById('todaySpinsCount');
    
    if (totalSpinsCount) {
      totalSpinsCount.textContent = historyData.length;
    }
    
    if (mostCommonPrize) {
      // Calculate most common prize
      const prizeCounts = {};
      historyData.forEach(record => {
        prizeCounts[record.label] = (prizeCounts[record.label] || 0) + 1;
      });
      
      // Find the prize with highest count
      let maxCount = 0;
      let mostCommon = 'None';
      
      for (const prize in prizeCounts) {
        if (prizeCounts[prize] > maxCount) {
          maxCount = prizeCounts[prize];
          mostCommon = prize;
        }
      }
      
      mostCommonPrize.textContent = mostCommon;
    }
    
    if (todaySpinsCount) {
      // Count today's spins
      const today = new Date().toLocaleDateString();
      let todayCount = 0;
      
      historyData.forEach(record => {
        const recordDate = new Date(record.timestamp).toLocaleDateString();
        if (recordDate === today) {
          todayCount++;
        }
      });
      
      todaySpinsCount.textContent = todayCount;
    }
  }
  
  /**
   * Initializes the distribution chart
   */
  function initChart() {
    const chartCanvas = document.getElementById('prizeDistributionChart');
    if (!chartCanvas || !window.Chart) return;
    
    // Calculate prize distribution
    const prizes = {};
    historyData.forEach(record => {
      prizes[record.label] = (prizes[record.label] || 0) + 1;
    });
    
    // Prepare chart data
    const labels = Object.keys(prizes);
    const data = Object.values(prizes);
    const colors = labels.map(label => {
      // Find color for this label
      const record = historyData.find(record => record.label === label);
      return record ? record.color : '#CCCCCC';
    });
    
    // Destroy existing chart if any
    if (chart) {
      chart.destroy();
    }
    
    // Create new chart
    chart = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => {
            // Darken the border color
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r*0.8}, ${g*0.8}, ${b*0.8}, 1)`;
          }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--lucky-secondary'),
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Apply dark theme to chart if needed
    if (document.body.classList.contains('dark-theme')) {
      applyChartDarkTheme();
    }
  }
  
  /**
   * Applies dark theme styling to the chart
   */
  function applyChartDarkTheme() {
    if (!chart) return;
    
    chart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--lucky-light');
    chart.update();
  }
  
  /**
   * Filters and sorts history based on search term and sort order
   */
  function filterHistory() {
    // Get current search term
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
      currentSearchTerm = searchInput.value.toLowerCase();
    }
    
    // Get current sort order
    const sortSelect = document.getElementById('historySortOrder');
    if (sortSelect) {
      currentSortOrder = sortSelect.value;
    }
    
    // Filter by search term
    if (currentSearchTerm) {
      filteredHistory = historyData.filter(record => 
        record.label.toLowerCase().includes(currentSearchTerm) ||
        record.wheelTitle.toLowerCase().includes(currentSearchTerm)
      );
    } else {
      filteredHistory = [...historyData];
    }
    
    // Sort records
    sortHistory();
    
    // Update display
    displayHistory();
  }
  
  /**
   * Sorts history based on the current sort order
   */
  function sortHistory() {
    switch (currentSortOrder) {
      case 'newest':
        filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        filteredHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'prizeAsc':
        filteredHistory.sort((a, b) => a.label.localeCompare(b.label));
        break;
      case 'prizeDesc':
        filteredHistory.sort((a, b) => b.label.localeCompare(a.label));
        break;
      default:
        // Default to newest first
        filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // Update display
    displayHistory();
  }
  
  /**
   * Deletes a record from history
   * @param {string} recordId - The ID of the record to delete
   */
  function deleteRecord(recordId) {
    if (!recordId) return;
    
    // Confirm deletion
    if (window.LuckyDrawTool && window.LuckyDrawTool.showConfirmation) {
      window.LuckyDrawTool.showConfirmation(
        'Are you sure you want to delete this spin record?',
        function() {
          performDelete(recordId);
        }
      );
    } else {
      if (confirm('Are you sure you want to delete this spin record?')) {
        performDelete(recordId);
      }
    }
  }
  
  /**
   * Performs the actual record deletion
   * @param {string} recordId - The ID of the record to delete
   */
  function performDelete(recordId) {
    // Remove from historyData
    historyData = historyData.filter(record => record.id !== recordId);
    
    // Save updated history
    localStorage.setItem('luckyDrawHistory', JSON.stringify(historyData));
    
    // Update filtered history
    filterHistory();
    
    // Update summary stats
    updateSummaryStats();
    
    // Update chart
    initChart();
    
    // Show success message
    if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
      window.LuckyDrawTool.showAlert('Record deleted successfully', 'success');
    }
  }
  
  /**
   * Clears all history
   */
  function clearHistory() {
    // Clear history data
    historyData = [];
    filteredHistory = [];
    
    // Save empty history
    localStorage.setItem('luckyDrawHistory', JSON.stringify(historyData));
    
    // Update display
    displayHistory();
    
    // Update summary stats
    updateSummaryStats();
    
    // Update chart
    initChart();
  }
  
  /**
   * Saves a spin result to history
   * @returns {Object} Result object with success status and message
   */
  function saveResult() {
    if (typeof LuckyDrawWheel !== 'undefined' && LuckyDrawWheel.saveResult) {
      const result = LuckyDrawWheel.saveResult();
      
      // Reload history data
      loadHistory();
      
      // Update displays
      displayHistory();
      updateSummaryStats();
      initChart();
      
      return result;
    }
    
    return { success: false, message: 'Wheel spinner not available' };
  }
  
  /**
   * Exports history data as JSON
   */
  function exportHistory() {
    try {
      // Create blob with JSON data
      const data = JSON.stringify(historyData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lucky_draw_history.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting history:', error);
      return { success: false, message: 'Failed to export history: ' + error.message };
    }
  }
  
  /**
   * Imports history data from a JSON file
   * @param {File} file - The JSON file to import
   */
  function importHistory(file) {
    try {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        try {
          // Parse JSON data
          const importedData = JSON.parse(event.target.result);
          
          // Validate data
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid history data format');
          }
          
          // Merge with existing history
          historyData = [...importedData, ...historyData];
          
          // Save updated history
          localStorage.setItem('luckyDrawHistory', JSON.stringify(historyData));
          
          // Update filtered history
          filteredHistory = [...historyData];
          
          // Update display
          displayHistory();
          
          // Update summary stats
          updateSummaryStats();
          
          // Update chart
          initChart();
          
          // Show success message
          if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
            window.LuckyDrawTool.showAlert('History imported successfully', 'success');
          }
        } catch (error) {
          console.error('Error parsing history data:', error);
          if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
            window.LuckyDrawTool.showAlert('Failed to import history: ' + error.message, 'error');
          }
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing history:', error);
      if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
        window.LuckyDrawTool.showAlert('Failed to import history: ' + error.message, 'error');
      }
    }
  }
  
  // Public API
  return {
    init,
    loadHistory,
    filterHistory,
    sortHistory,
    clearHistory,
    saveResult,
    exportHistory,
    importHistory
  };
})();