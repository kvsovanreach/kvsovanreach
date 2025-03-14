/**
 * Lucky Draw Wheel Module
 * Handles wheel creation, rendering, and spinning functionality
 */

const LuckyDrawWheel = (function() {
  // Private variables
  let currentWheel = null;
  let wheelCanvas = null;
  let wheelCtx = null;
  let isSpinning = false;
  let spinAngle = 0;
  let spinVelocity = 0;
  let animationId = null;
  let prizeIndex = null;
  let currentWheelSize = {
    width: 400,
    height: 400
  };
  
  // Default wheel settings with attractive colors
  const defaultWheel = {
    title: 'Lucky Draw',
    segments: [
      { label: '1st Prize', color: '#FF6B6B', weight: 25 },
      { label: '2nd Prize', color: '#4ECDC4', weight: 25 },
      { label: '3rd Prize', color: '#FFD166', weight: 25 },
      { label: 'Try Again', color: '#6A0572', weight: 25 }
    ],
    borderColor: '#333333',
    textColor: '#FFFFFF',
    borderWidth: 3,
    textSize: 16,
    size: 'medium',
    spinDuration: 5,
    spinCycles: 10,
    playSound: true,
    showConfetti: true
  };
  
  /**
   * Initializes the combined wheel functionality
   */
  function initWheel() {
    console.log('Initializing combined wheel');
    
    // Get the canvas element
    wheelCanvas = document.getElementById('mainWheelCanvas');
    if (!wheelCanvas) {
      console.error('Main wheel canvas not found');
      return;
    }
    
    // Setup canvas
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Set canvas size based on container
    const wheelContainer = wheelCanvas.parentElement;
    if (wheelContainer) {
      const containerWidth = wheelContainer.clientWidth;
      wheelCanvas.width = Math.min(containerWidth, 400);
      wheelCanvas.height = Math.min(containerWidth, 400);
      
      currentWheelSize.width = wheelCanvas.width;
      currentWheelSize.height = wheelCanvas.height;
    }
    
    // Load saved wheel if exists, otherwise use default
    loadWheel();
    
    // Create initial wheel preview
    updatePreview();
    
    // Setup event listeners for segment changes
    setupSegmentChangeListeners();
    
    // Draw the wheel
    drawWheel();
  }
  
  /**
   * Initializes the wheel creator functionality (legacy)
   */
  function initCreator() {
    console.log('Initializing wheel creator');
    
    // Get the canvas element - try first for combined mode, then for separate mode
    wheelCanvas = document.getElementById('mainWheelCanvas') || document.getElementById('wheelCanvas');
    if (!wheelCanvas) {
      console.error('Wheel canvas not found');
      return;
    }
    
    // Setup canvas
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Set canvas size based on container
    const wheelContainer = wheelCanvas.parentElement;
    if (wheelContainer) {
      const containerWidth = wheelContainer.clientWidth;
      wheelCanvas.width = Math.min(containerWidth, 300);
      wheelCanvas.height = Math.min(containerWidth, 300);
      
      currentWheelSize.width = wheelCanvas.width;
      currentWheelSize.height = wheelCanvas.height;
    }
    
    // Load saved wheel if exists, otherwise use default
    loadWheel();
    
    // Create initial wheel preview
    updatePreview();
    
    // Setup event listeners for segment changes
    setupSegmentChangeListeners();
  }
  
  /**
   * Initializes the wheel spinner functionality (legacy)
   */
  function initSpinner() {
    console.log('Initializing wheel spinner');
    
    // Get the canvas element
    wheelCanvas = document.getElementById('mainWheelCanvas');
    if (!wheelCanvas) {
      console.error('Main wheel canvas not found');
      return;
    }
    
    // Setup canvas
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Set canvas size based on container
    const wheelContainer = wheelCanvas.parentElement;
    if (wheelContainer) {
      const containerWidth = wheelContainer.clientWidth;
      wheelCanvas.width = Math.min(containerWidth, 400);
      wheelCanvas.height = Math.min(containerWidth, 400);
      
      currentWheelSize.width = wheelCanvas.width;
      currentWheelSize.height = wheelCanvas.height;
    }
    
    // Load saved wheel if exists, otherwise use default
    loadWheel();
    
    // Draw the wheel
    drawWheel();
  }
  
  /**
   * Loads the wheel data from localStorage
   */
  function loadWheel() {
    try {
      const savedWheel = localStorage.getItem('luckyDrawCurrentWheel');
      if (savedWheel) {
        currentWheel = JSON.parse(savedWheel);
      } else {
        // Use default wheel
        currentWheel = JSON.parse(JSON.stringify(defaultWheel));
      }
      
      // Populate form with wheel data if in creator mode
      if (document.getElementById('wheelTitle')) {
        populateWheelForm();
      }
    } catch (error) {
      console.error('Error loading wheel data:', error);
      currentWheel = JSON.parse(JSON.stringify(defaultWheel));
    }
  }
  
  /**
   * Populates the wheel form with current wheel data
   */
  function populateWheelForm() {
    if (!currentWheel) return;
    
    // Set basic fields
    const wheelTitle = document.getElementById('wheelTitle');
    if (wheelTitle) {
      wheelTitle.value = currentWheel.title || 'Lucky Draw';
    }
    
    // Set appearance fields
    const wheelBorderColor = document.getElementById('wheelBorderColor');
    const wheelTextColor = document.getElementById('wheelTextColor');
    const wheelSize = document.getElementById('wheelSize');
    const wheelBorderWidth = document.getElementById('wheelBorderWidth');
    const textFontSize = document.getElementById('textFontSize');
    
    if (wheelBorderColor) wheelBorderColor.value = currentWheel.borderColor || '#000000';
    if (wheelTextColor) wheelTextColor.value = currentWheel.textColor || '#FFFFFF';
    if (wheelSize) wheelSize.value = currentWheel.size || 'medium';
    if (wheelBorderWidth) {
      wheelBorderWidth.value = currentWheel.borderWidth || 3;
      const borderWidthValue = document.getElementById('borderWidthValue');
      if (borderWidthValue) {
        borderWidthValue.textContent = `${wheelBorderWidth.value}px`;
      }
    }
    if (textFontSize) {
      textFontSize.value = currentWheel.textSize || 16;
      const textFontSizeValue = document.getElementById('textFontSizeValue');
      if (textFontSizeValue) {
        textFontSizeValue.textContent = `${textFontSize.value}px`;
      }
    }
    
    // Set animation fields
    const spinDuration = document.getElementById('spinDuration');
    const spinCycles = document.getElementById('spinCycles');
    const playSound = document.getElementById('playSound');
    const showConfetti = document.getElementById('showConfetti');
    
    if (spinDuration) {
      spinDuration.value = currentWheel.spinDuration || 5;
      const spinDurationValue = document.getElementById('spinDurationValue');
      if (spinDurationValue) {
        spinDurationValue.textContent = `${spinDuration.value} seconds`;
      }
    }
    if (spinCycles) {
      spinCycles.value = currentWheel.spinCycles || 10;
      const spinCyclesValue = document.getElementById('spinCyclesValue');
      if (spinCyclesValue) {
        spinCyclesValue.textContent = `${spinCycles.value} cycles`;
      }
    }
    if (playSound) playSound.checked = currentWheel.playSound !== false;
    if (showConfetti) showConfetti.checked = currentWheel.showConfetti !== false;
    
    // Set segments
    const segmentsContainer = document.getElementById('segmentsContainer');
    if (segmentsContainer && currentWheel.segments && currentWheel.segments.length > 0) {
      // Clear existing segments
      segmentsContainer.innerHTML = '';
      
      // Add segments from current wheel
      currentWheel.segments.forEach(segment => {
        const segmentElement = document.createElement('div');
        segmentElement.className = 'lucky-segment-item';
        segmentElement.innerHTML = `
          <input type="text" placeholder="Prize name" class="segment-label" value="${segment.label}">
          <input type="color" class="segment-color" value="${segment.color}">
          <input type="number" min="1" max="100" class="segment-weight" value="${segment.weight}">
          <button class="lucky-delete-btn"><i class="fas fa-trash"></i></button>
        `;
        
        // Add to container
        segmentsContainer.appendChild(segmentElement);
        
        // Set up delete button
        const deleteBtn = segmentElement.querySelector('.lucky-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function() {
            if (document.querySelectorAll('.lucky-segment-item').length > 2) {
              segmentElement.remove();
              updatePreview();
            } else {
              if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
                window.LuckyDrawTool.showAlert('You must have at least 2 segments on the wheel', 'warning');
              } else {
                alert('You must have at least 2 segments on the wheel');
              }
            }
          });
        }
      });
    }
  }
  
  /**
   * Updates the wheel preview based on current settings
   */
  function updatePreview() {
    if (!wheelCanvas || !wheelCtx) return;
    
    // Get current wheel data from form
    getWheelDataFromForm();
    
    // Draw the wheel
    drawWheel();
    
    // Update probability statistics
    updateProbabilityStats();
  }
  
  /**
   * Updates the probability statistics display
   */
  function updateProbabilityStats() {
    const statsContainer = document.getElementById('probabilityStats');
    if (!statsContainer || !currentWheel || !currentWheel.segments) return;
    
    // Clear previous stats
    statsContainer.innerHTML = '';
    
    // Calculate total weight
    const totalWeight = currentWheel.segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // Add stats for each segment
    currentWheel.segments.forEach(segment => {
      const probability = ((segment.weight / totalWeight) * 100).toFixed(1);
      
      const statItem = document.createElement('div');
      statItem.className = 'lucky-stat-item';
      statItem.innerHTML = `
        <div class="lucky-stat-color" style="background-color: ${segment.color}"></div>
        <div class="lucky-stat-label">${segment.label}</div>
        <div class="lucky-stat-value">${probability}%</div>
      `;
      
      statsContainer.appendChild(statItem);
    });
  }
  
  /**
   * Gets the current wheel data from the form
   */
  function getWheelDataFromForm() {
    // Start with an empty wheel object
    const wheelData = {
      segments: []
    };
    
    // Get basic fields
    const wheelTitle = document.getElementById('wheelTitle');
    if (wheelTitle) {
      wheelData.title = wheelTitle.value || 'Lucky Draw';
    }
    
    // Get appearance fields
    const wheelBorderColor = document.getElementById('wheelBorderColor');
    const wheelTextColor = document.getElementById('wheelTextColor');
    const wheelSize = document.getElementById('wheelSize');
    const wheelBorderWidth = document.getElementById('wheelBorderWidth');
    const textFontSize = document.getElementById('textFontSize');
    
    if (wheelBorderColor) wheelData.borderColor = wheelBorderColor.value;
    if (wheelTextColor) wheelData.textColor = wheelTextColor.value;
    if (wheelSize) wheelData.size = wheelSize.value;
    if (wheelBorderWidth) wheelData.borderWidth = parseInt(wheelBorderWidth.value, 10);
    if (textFontSize) wheelData.textSize = parseInt(textFontSize.value, 10);
    
    // Get animation fields
    const spinDuration = document.getElementById('spinDuration');
    const spinCycles = document.getElementById('spinCycles');
    const playSound = document.getElementById('playSound');
    const showConfetti = document.getElementById('showConfetti');
    
    if (spinDuration) wheelData.spinDuration = parseInt(spinDuration.value, 10);
    if (spinCycles) wheelData.spinCycles = parseInt(spinCycles.value, 10);
    if (playSound) wheelData.playSound = playSound.checked;
    if (showConfetti) wheelData.showConfetti = showConfetti.checked;
    
    // Get segments
    const segmentItems = document.querySelectorAll('.lucky-segment-item');
    if (segmentItems.length > 0) {
      segmentItems.forEach(item => {
        const labelInput = item.querySelector('.segment-label');
        const colorInput = item.querySelector('.segment-color');
        const weightInput = item.querySelector('.segment-weight');
        
        if (labelInput && colorInput && weightInput) {
          wheelData.segments.push({
            label: labelInput.value || 'Prize',
            color: colorInput.value,
            weight: parseInt(weightInput.value, 10) || 10
          });
        }
      });
    }
    
    // Update current wheel
    currentWheel = wheelData;
  }
  
  /**
   * Draws the wheel on the canvas
   */
  function drawWheel() {
    if (!wheelCanvas || !wheelCtx || !currentWheel) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    // Clear canvas
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // Prepare segments
    const segments = currentWheel.segments || [];
    if (segments.length === 0) return;
    
    // Calculate total weight
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // Draw segments
    let startAngle = 0;
    let endAngle = 0;
    
    segments.forEach((segment, index) => {
      // Calculate segment angle based on weight
      const segmentAngle = (segment.weight / totalWeight) * (Math.PI * 2);
      endAngle = startAngle + segmentAngle;
      
      // Draw segment
      wheelCtx.beginPath();
      wheelCtx.moveTo(centerX, centerY);
      wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
      wheelCtx.closePath();
      
      // Fill segment
      wheelCtx.fillStyle = segment.color || '#CCCCCC';
      wheelCtx.fill();
      
      // Draw border
      wheelCtx.lineWidth = currentWheel.borderWidth || 3;
      wheelCtx.strokeStyle = currentWheel.borderColor || '#000000';
      wheelCtx.stroke();
      
      // Add text
      const midAngle = startAngle + (segmentAngle / 2);
      const textRadius = radius * 0.75;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;
      
      // Set text properties
      wheelCtx.save();
      wheelCtx.translate(textX, textY);
      wheelCtx.rotate(midAngle + Math.PI / 2);
      wheelCtx.textAlign = 'center';
      wheelCtx.textBaseline = 'middle';
      wheelCtx.fillStyle = currentWheel.textColor || '#FFFFFF';
      wheelCtx.font = `bold ${currentWheel.textSize || 16}px Arial`;
      
      // Draw text
      wheelCtx.fillText(segment.label, 0, 0);
      wheelCtx.restore();
      
      // Move to next segment
      startAngle = endAngle;
    });
    
    // Draw center circle
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
    wheelCtx.fillStyle = currentWheel.borderColor || '#000000';
    wheelCtx.fill();
    
    // We don't call rotateWheel here anymore to avoid infinite recursion
  }
  
  /**
   * Rotates the wheel by the given angle
   * @param {number} angle - The angle to rotate in radians
   */
  function rotateWheel(angle) {
    if (!wheelCanvas || !wheelCtx) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    
    // Clear canvas
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // Save the canvas state
    wheelCtx.save();
    
    // Translate to center, rotate, and translate back
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(angle);
    
    // Draw the wheel directly without calling drawWheel()
    const radius = Math.min(centerX, centerY) - 15; // Reduced radius to make room for pointer and decorations
    
    // Prepare segments
    const segments = currentWheel.segments || [];
    if (segments.length === 0) {
      wheelCtx.restore();
      return;
    }
    
    // Calculate total weight
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // Draw segments
    let startAngle = 0;
    let endAngle = 0;
    
    // Draw a subtle shadow for depth
    wheelCtx.shadowColor = 'rgba(0,0,0,0.3)';
    wheelCtx.shadowBlur = 10;
    wheelCtx.shadowOffsetX = 2;
    wheelCtx.shadowOffsetY = 2;
    
    // Draw outer rim of wheel first
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    wheelCtx.fillStyle = '#333333';
    wheelCtx.fill();
    wheelCtx.shadowBlur = 0; // Turn off shadow for segments
    
    segments.forEach((segment, index) => {
      // Calculate segment angle based on weight
      const segmentAngle = (segment.weight / totalWeight) * (Math.PI * 2);
      endAngle = startAngle + segmentAngle;
      
      // Draw segment
      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, radius, startAngle, endAngle);
      wheelCtx.closePath();
      
      // Fill segment with a slight gradient for more dimension
      const gradient = wheelCtx.createRadialGradient(0, 0, 0, 0, 0, radius);
      const baseColor = segment.color || '#CCCCCC';
      
      // Lighten and darken the base color for gradient
      gradient.addColorStop(0, lightenColor(baseColor, 20));
      gradient.addColorStop(0.7, baseColor);
      gradient.addColorStop(1, darkenColor(baseColor, 15));
      
      wheelCtx.fillStyle = gradient;
      wheelCtx.fill();
      
      // Draw border
      wheelCtx.lineWidth = currentWheel.borderWidth || 3;
      wheelCtx.strokeStyle = currentWheel.borderColor || '#000000';
      wheelCtx.stroke();
      
      // Add text
      const midAngle = startAngle + (segmentAngle / 2);
      const textRadius = radius * 0.65; // Moved text in slightly
      const textX = Math.cos(midAngle) * textRadius;
      const textY = Math.sin(midAngle) * textRadius;
      
      // Set text properties
      wheelCtx.save();
      wheelCtx.translate(textX, textY);
      wheelCtx.rotate(midAngle + Math.PI / 2);
      wheelCtx.textAlign = 'center';
      wheelCtx.textBaseline = 'middle';
      
      // Add text shadow for better readability
      wheelCtx.shadowColor = 'rgba(0,0,0,0.5)';
      wheelCtx.shadowBlur = 2;
      wheelCtx.shadowOffsetX = 1;
      wheelCtx.shadowOffsetY = 1;
      
      wheelCtx.fillStyle = currentWheel.textColor || '#FFFFFF';
      wheelCtx.font = `bold ${currentWheel.textSize || 16}px Arial`;
      
      // Draw text
      wheelCtx.fillText(segment.label, 0, 0);
      wheelCtx.restore();
      
      // Move to next segment
      startAngle = endAngle;
    });
    
    // Draw center circle
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    wheelCtx.fillStyle = '#333333';
    wheelCtx.fill();
    
    // Add a metallic shine to the center
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    const centerGradient = wheelCtx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.12);
    centerGradient.addColorStop(0, '#FFFFFF');
    centerGradient.addColorStop(0.3, '#DDDDDD');
    centerGradient.addColorStop(0.8, '#999999');
    centerGradient.addColorStop(1, '#666666');
    wheelCtx.fillStyle = centerGradient;
    wheelCtx.fill();
    
    // Restore the canvas state
    wheelCtx.restore();
  }
  
  /**
   * Helper function to lighten a color
   * @param {string} color - Hex color code
   * @param {number} percent - Percentage to lighten
   * @returns {string} Lightened color
   */
  function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }
  
  /**
   * Helper function to darken a color
   * @param {string} color - Hex color code
   * @param {number} percent - Percentage to darken
   * @returns {string} Darkened color
   */
  function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) - amt,
          G = (num >> 8 & 0x00FF) - amt,
          B = (num & 0x0000FF) - amt;
    
    return '#' + (
      0x1000000 + 
      (R > 0 ? R : 0) * 0x10000 + 
      (G > 0 ? G : 0) * 0x100 + 
      (B > 0 ? B : 0)
    ).toString(16).slice(1);
  }
  
  /**
   * Spins the wheel with animation
   */
  function spin() {
    console.log('Spin function called');
    
    if (isSpinning) {
      console.log('Already spinning, ignoring request');
      return;
    }
    
    // Check if wheel exists
    if (!wheelCanvas || !wheelCtx || !currentWheel) {
      console.error('Wheel not initialized', { 
        wheelCanvas: !!wheelCanvas, 
        wheelCtx: !!wheelCtx, 
        currentWheel: !!currentWheel 
      });
      return;
    }
    
    console.log('Wheel is ready to spin');
    
    // Check if spinning is limited
    const settings = JSON.parse(localStorage.getItem('luckyDrawSettings') || '{}');
    if (settings.enableSpinLimit) {
      const currentDate = new Date().toLocaleDateString();
      const spinsData = JSON.parse(localStorage.getItem('luckyDrawSpinsData') || '{}');
      const todaySpins = spinsData[currentDate] || 0;
      const maxSpins = settings.spinLimitCount || 3;
      
      if (todaySpins >= maxSpins) {
        if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
          window.LuckyDrawTool.showAlert('You have reached your daily spin limit', 'warning');
        } else {
          alert('You have reached your daily spin limit');
        }
        return;
      }
    }
    
    // Check if confirmation is required
    if (settings.requireConfirmation) {
      if (window.LuckyDrawTool && window.LuckyDrawTool.showConfirmation) {
        window.LuckyDrawTool.showConfirmation(
          'Are you ready to spin the wheel?',
          startSpin
        );
      } else {
        if (confirm('Are you ready to spin the wheel?')) {
          startSpin();
        }
      }
    } else {
      startSpin();
    }
  }
  
  /**
   * Starts the wheel spin animation
   */
  function startSpin() {
    console.log('Starting spin animation');
    isSpinning = true;
    
    // Disable spin button
    const spinButton = document.getElementById('spinWheelBtn');
    console.log('Spin button for disabling:', spinButton);
    if (spinButton) {
      spinButton.disabled = true;
      spinButton.style.backgroundColor = '#cccccc';
      spinButton.style.animation = 'none';
      spinButton.style.cursor = 'not-allowed';
    }
    
    const segments = currentWheel.segments || [];
    if (segments.length === 0) return;
    
    // Create a dynamic spin experience
    // Random number of rotations between 5 and 15
    const minRotations = 5;
    const maxRotations = 15;
    const randomRotations = minRotations + Math.random() * (maxRotations - minRotations);
    
    // Random duration between 3 and 7 seconds
    const minDuration = 3;
    const maxDuration = 7;
    const randomDuration = minDuration + Math.random() * (maxDuration - minDuration);
    
    // Calculate total weight
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // Get a random segment based on weight
    const randomValue = Math.random() * totalWeight;
    let weightSum = 0;
    
    for (let i = 0; i < segments.length; i++) {
      weightSum += segments[i].weight;
      if (randomValue <= weightSum) {
        prizeIndex = i;
        break;
      }
    }
    
    // Calculate the precise stopping angle for the chosen prize
    // The wheel needs to stop with the pointer at the top pointing to the prize segment
    let segmentStartAngle = 0;
    for (let i = 0; i < prizeIndex; i++) {
      segmentStartAngle += (segments[i].weight / totalWeight) * (Math.PI * 2);
    }
    
    // Calculate segment size
    const segmentAngle = (segments[prizeIndex].weight / totalWeight) * (Math.PI * 2);
    
    // Use a position in the middle of the segment for reliability
    const randomPositionInSegment = 0.5;
    
    // The angle calculation is critical:
    // 1. We want the top pointer (at -π/2 in standard position) to point to the winning segment
    // 2. The wheel rotates clockwise during spin, so we need a negative angle to position it correctly
    // 3. We add π/2 to account for the pointer being at the top
    const destinationAngle = -(segmentStartAngle + (segmentAngle * randomPositionInSegment)) + Math.PI / 2;
    
    // Add multiple rotations for effect before stopping at the destination angle
    const extraRotations = randomRotations * Math.PI * 2;
    const totalRotation = destinationAngle + extraRotations;
    
    // Add some randomness to initial velocity for more natural feel
    spinVelocity = Math.PI * (6 + Math.random() * 5); // Random initial velocity between 6π and 11π
    
    // Initialize animation time
    const startTime = performance.now();
    const duration = randomDuration * 1000; // Convert to milliseconds
    
    console.log(`Spinning to segment ${prizeIndex} (${segments[prizeIndex].label}) with ${randomRotations.toFixed(2)} rotations over ${randomDuration.toFixed(2)} seconds`);
    
    // Play sound if enabled
    if (currentWheel.playSound) {
      playSpinSound();
    }
    
    // Start animation
    animateWheel(startTime, duration, totalRotation);
  }
  
  /**
   * Animates the wheel spin
   * @param {number} startTime - The animation start time
   * @param {number} duration - The animation duration in milliseconds
   * @param {number} totalRotation - The total rotation angle
   */
  function animateWheel(startTime, duration, totalRotation) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;
    
    // Calculate progress (0 to 1)
    let progress = Math.min(elapsedTime / duration, 1);
    
    // Use a custom easing function for more realistic spinning
    // Start fast, maintain speed, then gradually slow down
    let easedProgress;
    
    if (progress < 0.1) {
      // Fast start (ease-in)
      easedProgress = progress * 10 * progress;
    } else if (progress < 0.7) {
      // Maintain a steady speed through most of the animation
      easedProgress = 0.1 + (progress - 0.1) * (0.7 / 0.6);
    } else {
      // Gradually slow down (ease-out)
      // Use a strong cubic ease-out for realistic physics
      const t = (progress - 0.7) / 0.3;
      easedProgress = 0.7 + 0.3 * (1 - Math.pow(1 - t, 3));
    }
    
    // Calculate current rotation with varying velocity
    spinAngle = totalRotation * easedProgress;
    
    // Apply rotation directly
    if (wheelCanvas && wheelCtx) {
      rotateWheel(spinAngle);
      
      // Draw a pointer at the top to clearly show where the wheel will stop
      drawPointer();
    }
    
    // Continue animation if not complete
    if (progress < 1) {
      animationId = requestAnimationFrame(() => {
        animateWheel(startTime, duration, totalRotation);
      });
    } else {
      // Animation complete
      
      // Final check to ensure the prize index matches what the pointer is pointing to
      // This ensures the result shown matches what the user sees
      if (wheelCanvas && wheelCtx && currentWheel && currentWheel.segments && currentWheel.segments.length > 0) {
        // Calculate the final wheel position angle (normalized to 0-2π range)
        const finalAngle = (spinAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        
        // The pointer is at the top (-π/2 from horizontal)
        // We need to determine which segment contains the position π/2 - finalAngle
        const pointerAngle = Math.PI * 1.5 - finalAngle;
        
        // Find which segment this angle falls into
        const totalWeight = currentWheel.segments.reduce((sum, segment) => sum + segment.weight, 0);
        let segmentEndAngle = 0;
        
        for (let i = 0; i < currentWheel.segments.length; i++) {
          segmentEndAngle += (currentWheel.segments[i].weight / totalWeight) * (Math.PI * 2);
          if (pointerAngle <= segmentEndAngle) {
            // This is the segment the pointer is pointing to
            console.log(`Pointer is at angle ${(pointerAngle * 180 / Math.PI).toFixed(2)}° which falls in segment ${i} (${currentWheel.segments[i].label})`);
            prizeIndex = i;
            break;
          }
        }
      }
      
      spinComplete();
    }
  }
  
  /**
   * Draws a pointer that indicates where the wheel stops
   */
  function drawPointer() {
    if (!wheelCanvas || !wheelCtx) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY);
    
    // Draw a triangle pointer at the top
    wheelCtx.save();
    
    // Clear the area where the pointer will be
    wheelCtx.clearRect(centerX - 20, centerY - radius - 20, 40, 20);
    
    // Draw pointer triangle
    wheelCtx.beginPath();
    wheelCtx.moveTo(centerX, centerY - radius + 5);
    wheelCtx.lineTo(centerX - 10, centerY - radius - 15);
    wheelCtx.lineTo(centerX + 10, centerY - radius - 15);
    wheelCtx.closePath();
    
    // Fill and stroke
    wheelCtx.fillStyle = '#FF4136'; // Bright red for visibility
    wheelCtx.strokeStyle = '#111111';
    wheelCtx.lineWidth = 2;
    wheelCtx.fill();
    wheelCtx.stroke();
    
    wheelCtx.restore();
  }
  
  /**
   * Called when the spin animation is complete
   */
  function spinComplete() {
    isSpinning = false;
    
    // Re-enable spin button
    const spinButton = document.getElementById('spinWheelBtn');
    if (spinButton) {
      spinButton.disabled = false;
    }
    
    // Show result
    showResult();
    
    // Play winning sound
    if (currentWheel.playSound) {
      playWinSound();
    }
    
    // Show confetti if enabled
    if (currentWheel.showConfetti && typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Increment spin counter
    incrementSpinCounter();
    
    // Update spin counter display
    if (window.LuckyDrawTool && window.LuckyDrawTool.updateSpinCounter) {
      window.LuckyDrawTool.updateSpinCounter();
    }
  }
  
  /**
   * Shows the result of the spin
   */
  function showResult() {
    if (prizeIndex === null || !currentWheel || !currentWheel.segments) return;
    
    const prize = currentWheel.segments[prizeIndex];
    const resultPanel = document.getElementById('resultPanel');
    const prizeLabel = document.getElementById('prizeLabel');
    
    if (resultPanel && prizeLabel) {
      prizeLabel.textContent = prize.label;
      prizeLabel.style.color = prize.color;
      resultPanel.style.display = 'block';
    }
    
    // Auto-save result if enabled
    const settings = JSON.parse(localStorage.getItem('luckyDrawSettings') || '{}');
    if (settings.autoSaveResults) {
      saveResult();
    }
    
    // Vibrate if supported and enabled
    if (settings.enableHapticFeedback && navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Show notification if enabled
    if (settings.showWinNotification) {
      if (window.LuckyDrawTool && window.LuckyDrawTool.showAlert) {
        window.LuckyDrawTool.showAlert(`Congratulations! You won: ${prize.label}`, 'success');
      }
    }
  }
  
  /**
   * Increments the spin counter in localStorage
   */
  function incrementSpinCounter() {
    const currentDate = new Date().toLocaleDateString();
    const spinsData = JSON.parse(localStorage.getItem('luckyDrawSpinsData') || '{}');
    
    // Increment today's spin count
    spinsData[currentDate] = (spinsData[currentDate] || 0) + 1;
    
    // Save updated data
    localStorage.setItem('luckyDrawSpinsData', JSON.stringify(spinsData));
  }
  
  /**
   * Plays the spin sound
   */
  function playSpinSound() {
    try {
      // Create a simpler audio beep using the Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Spin sound frequency
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // 0.5 second beep
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }
  
  /**
   * Plays the win sound
   */
  function playWinSound() {
    try {
      // Create a victory sound using the Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }
  
  /**
   * Resets the wheel after spinning
   */
  function resetWheel() {
    spinAngle = 0;
    prizeIndex = null;
    drawWheel();
  }
  
  /**
   * Saves the current wheel to localStorage
   * @returns {Object} Result object with success status and message
   */
  function saveWheel() {
    try {
      // Get current wheel data from form if in creator mode
      if (document.getElementById('wheelTitle')) {
        getWheelDataFromForm();
      }
      
      // Validate wheel data
      if (!currentWheel) {
        return { success: false, message: 'No wheel data to save' };
      }
      
      if (!currentWheel.segments || currentWheel.segments.length < 2) {
        return { success: false, message: 'Wheel must have at least 2 segments' };
      }
      
      // Save to localStorage
      localStorage.setItem('luckyDrawCurrentWheel', JSON.stringify(currentWheel));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving wheel:', error);
      return { success: false, message: 'Failed to save wheel: ' + error.message };
    }
  }
  
  /**
   * Resets the wheel to default settings
   * @returns {Object} Result object with success status and message
   */
  function resetToDefault() {
    try {
      // Reset to default wheel
      currentWheel = JSON.parse(JSON.stringify(defaultWheel));
      
      // Save to localStorage
      localStorage.setItem('luckyDrawCurrentWheel', JSON.stringify(currentWheel));
      
      // Update form with default values
      if (document.getElementById('wheelTitle')) {
        populateWheelForm();
      }
      
      // Reset wheel display
      resetWheel();
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting wheel:', error);
      return { success: false, message: 'Failed to reset wheel: ' + error.message };
    }
  }
  
  /**
   * Saves the current spin result to history
   * @returns {Object} Result object with success status and message
   */
  function saveResult() {
    try {
      if (prizeIndex === null || !currentWheel || !currentWheel.segments) {
        return { success: false, message: 'No result to save' };
      }
      
      const prize = currentWheel.segments[prizeIndex];
      const timestamp = new Date().toISOString();
      
      // Create result object
      const result = {
        id: 'spin_' + Date.now(),
        label: prize.label,
        color: prize.color,
        timestamp: timestamp,
        wheelTitle: currentWheel.title || 'Lucky Draw'
      };
      
      // Get existing history
      const history = JSON.parse(localStorage.getItem('luckyDrawHistory') || '[]');
      
      // Add new result
      history.unshift(result);
      
      // Save updated history
      localStorage.setItem('luckyDrawHistory', JSON.stringify(history));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving result:', error);
      return { success: false, message: 'Failed to save result: ' + error.message };
    }
  }
  
  /**
   * Sets up event listeners for segment changes
   */
  function setupSegmentChangeListeners() {
    // Watch for changes in segment input fields
    const segmentsContainer = document.getElementById('segmentsContainer');
    if (segmentsContainer) {
      // Use event delegation to handle changes in segment inputs
      segmentsContainer.addEventListener('input', function(event) {
        const target = event.target;
        
        // Only update if it's a segment input
        if (target.classList.contains('segment-label') ||
            target.classList.contains('segment-color') ||
            target.classList.contains('segment-weight')) {
          
          // Update wheel preview
          updatePreview();
        }
      });
    }
  }
  
  // Public API
  return {
    initWheel,      // New combined initialization
    initCreator,    // Legacy support
    initSpinner,    // Legacy support
    updatePreview,
    saveWheel,
    spin,
    resetWheel,
    resetToDefault, // New reset function
    saveResult
  };
})();