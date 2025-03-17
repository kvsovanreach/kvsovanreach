/**
 * Calculator Equation Solver Module
 * Handles solving linear and quadratic equations
 */

const CalculatorEquation = (function() {
  // Private variables
  let linearA, linearB, linearC;
  let quadraticA, quadraticB, quadraticC;
  let linearSteps, linearSolution;
  let quadraticSteps, quadraticSolution;
  
  /**
   * Initializes the equation solver module
   */
  function init() {
    // Cache DOM elements
    linearA = document.getElementById('linearA');
    linearB = document.getElementById('linearB');
    linearC = document.getElementById('linearC');
    quadraticA = document.getElementById('quadraticA');
    quadraticB = document.getElementById('quadraticB');
    quadraticC = document.getElementById('quadraticC');
    linearSteps = document.getElementById('linearSteps');
    linearSolution = document.getElementById('linearSolution');
    quadraticSteps = document.getElementById('quadraticSteps');
    quadraticSolution = document.getElementById('quadraticSolution');
    
    // Setup event listeners
    document.getElementById('solveLinearBtn').addEventListener('click', solveLinearEquation);
    document.getElementById('solveQuadraticBtn').addEventListener('click', solveQuadraticEquation);
    
    // Add input validation
    setupInputValidation();
    
    // Add tab switching listeners
    setupTabSwitching();
  }
  
  /**
   * Sets up input validation for equation coefficients
   */
  function setupInputValidation() {
    const coefficientInputs = [linearA, linearB, linearC, quadraticA, quadraticB, quadraticC];
    
    coefficientInputs.forEach(input => {
      input.addEventListener('input', function() {
        // Remove non-numeric characters except minus sign and decimal point
        this.value = this.value.replace(/[^0-9.-]/g, '');
        
        // Ensure only one decimal point
        const decimalCount = (this.value.match(/\./g) || []).length;
        if (decimalCount > 1) {
          this.value = this.value.replace(/\.(?=.*\.)/g, '');
        }
        
        // Ensure only one minus sign at the beginning
        if (this.value.lastIndexOf('-') > 0) {
          this.value = this.value.replace(/-(?!^)/g, '');
        }
      });
      
      // Add Enter key press to trigger solve
      input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          // Determine which equation to solve
          if (this.id.startsWith('linear')) {
            solveLinearEquation();
          } else if (this.id.startsWith('quadratic')) {
            solveQuadraticEquation();
          }
        }
      });
    });
  }
  
  /**
   * Sets up tab switching between linear and quadratic equations
   */
  function setupTabSwitching() {
    document.querySelectorAll('.calc-equation-type-btn').forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.calc-equation-type-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Hide all equation forms
        document.querySelectorAll('.calc-equation-form').forEach(form => {
          form.classList.remove('active');
        });
        
        // Show the selected equation form
        const equationType = this.getAttribute('data-equation-type');
        document.getElementById(`${equationType}EquationForm`).classList.add('active');
      });
    });
  }
  
  /**
   * Solves a linear equation of the form ax + b = c
   */
  function solveLinearEquation() {
    try {
      // Get coefficient values
      const a = parseFloat(linearA.value) || 0;
      const b = parseFloat(linearB.value) || 0;
      const c = parseFloat(linearC.value) || 0;
      
      // Check if a is zero (not a valid linear equation)
      if (a === 0) {
        linearSteps.innerHTML = '<p class="calc-error">The coefficient a cannot be zero for a linear equation.</p>';
        
        // Special case: if b = c, then the equation has infinitely many solutions
        if (b === c) {
          linearSolution.innerHTML = 'Infinitely many solutions (x can be any value)';
        } 
        // Special case: if b ≠ c, then the equation has no solutions
        else {
          linearSolution.innerHTML = 'No solution (contradiction)';
        }
        return;
      }
      
      // Calculate the solution
      const x = (c - b) / a;
      
      // Format the solution
      const formattedX = formatNumber(x);
      
      // Generate step-by-step solution
      linearSteps.innerHTML = `
        <p>Starting with the equation: ${formatCoefficient(a)}x + ${formatCoefficient(b)} = ${formatCoefficient(c)}</p>
        <p>Subtract ${formatCoefficient(b)} from both sides:</p>
        <p>${formatCoefficient(a)}x = ${formatCoefficient(c)} - ${formatCoefficient(b)}</p>
        <p>${formatCoefficient(a)}x = ${formatCoefficient(c-b)}</p>
        <p>Divide both sides by ${formatCoefficient(a)}:</p>
        <p>x = ${formatCoefficient(c-b)} ÷ ${formatCoefficient(a)}</p>
      `;
      
      linearSolution.innerHTML = `x = ${formattedX}`;
      
    } catch (error) {
      console.error('Error solving linear equation:', error);
      linearSteps.innerHTML = '<p class="calc-error">An error occurred while solving the equation.</p>';
      linearSolution.innerHTML = 'Error';
    }
  }
  
  /**
   * Solves a quadratic equation of the form ax² + bx + c = 0
   */
  function solveQuadraticEquation() {
    try {
      // Get coefficient values
      const a = parseFloat(quadraticA.value) || 0;
      const b = parseFloat(quadraticB.value) || 0;
      const c = parseFloat(quadraticC.value) || 0;
      
      // Check if a is zero (not a valid quadratic equation)
      if (a === 0) {
        // If a is zero, it becomes a linear equation: bx + c = 0
        quadraticSteps.innerHTML = '<p class="calc-error">The coefficient a cannot be zero for a quadratic equation.</p>';
        
        // Solve as a linear equation if b is not zero
        if (b !== 0) {
          const x = -c / b;
          quadraticSteps.innerHTML += `
            <p>This is a linear equation of the form ${formatCoefficient(b)}x + ${formatCoefficient(c)} = 0</p>
            <p>Solving for x: x = -${formatCoefficient(c)} ÷ ${formatCoefficient(b)}</p>
          `;
          quadraticSolution.innerHTML = `x = ${formatNumber(x)}`;
        } else {
          // If both a and b are zero, check c
          if (c === 0) {
            quadraticSolution.innerHTML = 'Infinitely many solutions (x can be any value)';
          } else {
            quadraticSolution.innerHTML = 'No solution (contradiction)';
          }
        }
        return;
      }
      
      // Calculate the discriminant
      const discriminant = b * b - 4 * a * c;
      
      // Generate step-by-step solution
      quadraticSteps.innerHTML = `
        <p>Starting with the equation: ${formatCoefficient(a)}x² + ${formatCoefficient(b)}x + ${formatCoefficient(c)} = 0</p>
        <p>Using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a</p>
        <p>Where a = ${formatCoefficient(a)}, b = ${formatCoefficient(b)}, c = ${formatCoefficient(c)}</p>
        <p>Calculate the discriminant: b² - 4ac</p>
        <p>Discriminant = ${formatCoefficient(b)}² - 4 × ${formatCoefficient(a)} × ${formatCoefficient(c)}</p>
        <p>Discriminant = ${formatCoefficient(b*b)} - ${formatCoefficient(4*a*c)}</p>
        <p>Discriminant = ${formatCoefficient(discriminant)}</p>
      `;
      
      // Calculate the solutions based on the discriminant
      if (discriminant > 0) {
        // Two real solutions
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        quadraticSteps.innerHTML += `
          <p>Since the discriminant is positive, there are two real solutions.</p>
          <p>x₁ = (-${formatCoefficient(b)} + √${formatCoefficient(discriminant)}) / (2 × ${formatCoefficient(a)})</p>
          <p>x₁ = (${formatCoefficient(-b)} + ${formatCoefficient(Math.sqrt(discriminant))}) / ${formatCoefficient(2*a)}</p>
          <p>x₁ = ${formatCoefficient(-b + Math.sqrt(discriminant))} / ${formatCoefficient(2*a)}</p>
          <p>x₁ = ${formatNumber(x1)}</p>
          <p>x₂ = (-${formatCoefficient(b)} - √${formatCoefficient(discriminant)}) / (2 × ${formatCoefficient(a)})</p>
          <p>x₂ = (${formatCoefficient(-b)} - ${formatCoefficient(Math.sqrt(discriminant))}) / ${formatCoefficient(2*a)}</p>
          <p>x₂ = ${formatCoefficient(-b - Math.sqrt(discriminant))} / ${formatCoefficient(2*a)}</p>
          <p>x₂ = ${formatNumber(x2)}</p>
        `;
        
        quadraticSolution.innerHTML = `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`;
        
      } else if (discriminant === 0) {
        // One real solution (double root)
        const x = -b / (2 * a);
        
        quadraticSteps.innerHTML += `
          <p>Since the discriminant is zero, there is one real solution (double root).</p>
          <p>x = -${formatCoefficient(b)} / (2 × ${formatCoefficient(a)})</p>
          <p>x = ${formatCoefficient(-b)} / ${formatCoefficient(2*a)}</p>
          <p>x = ${formatNumber(x)}</p>
        `;
        
        quadraticSolution.innerHTML = `x = ${formatNumber(x)} (double root)`;
        
      } else {
        // Complex solutions
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
        
        quadraticSteps.innerHTML += `
          <p>Since the discriminant is negative, there are two complex solutions.</p>
          <p>x = -${formatCoefficient(b)} / (2 × ${formatCoefficient(a)}) ± (√${formatCoefficient(Math.abs(discriminant))}) / (2 × ${formatCoefficient(a)})i</p>
          <p>Real part = -${formatCoefficient(b)} / (2 × ${formatCoefficient(a)}) = ${formatNumber(realPart)}</p>
          <p>Imaginary part = √${formatCoefficient(Math.abs(discriminant))} / (2 × ${formatCoefficient(a)}) = ${formatNumber(imaginaryPart)}</p>
        `;
        
        quadraticSolution.innerHTML = `
          x₁ = ${formatNumber(realPart)} + ${formatNumber(imaginaryPart)}i,<br>
          x₂ = ${formatNumber(realPart)} - ${formatNumber(imaginaryPart)}i
        `;
      }
      
    } catch (error) {
      console.error('Error solving quadratic equation:', error);
      quadraticSteps.innerHTML = '<p class="calc-error">An error occurred while solving the equation.</p>';
      quadraticSolution.innerHTML = 'Error';
    }
  }
  
  /**
   * Formats a coefficient for display in the step-by-step solution
   * @param {number} coefficient - The coefficient to format
   * @returns {string} The formatted coefficient
   */
  function formatCoefficient(coefficient) {
    if (coefficient === 0) return '0';
    
    // Handle negative coefficients
    if (coefficient < 0) {
      return `(${coefficient.toFixed(2).replace(/\.?0+$/, '')})`;
    }
    
    return coefficient.toFixed(2).replace(/\.?0+$/, '');
  }
  
  /**
   * Formats a number for display in the solution
   * @param {number} number - The number to format
   * @returns {string} The formatted number
   */
  function formatNumber(number) {
    if (isNaN(number)) return 'Error';
    
    // Handle very small numbers that should be zero
    if (Math.abs(number) < 1e-10) {
      return '0';
    }
    
    // Format to 6 decimal places but remove trailing zeros
    const result = number.toFixed(6).replace(/\.?0+$/, '');
    
    // For fractions, try to show a simpler representation if possible
    if (Math.abs(number) < 1 && Math.abs(number) > 0) {
      try {
        // Try to find a simple fraction representation
        const fraction = approximateFraction(number);
        if (fraction.denominator <= 20) { // Only show "nice" fractions
          return `${result} ≈ ${fraction.numerator}/${fraction.denominator}`;
        }
      } catch (e) {
        // If fraction approximation fails, just return the decimal
      }
    }
    
    return result;
  }
  
  /**
   * Approximates a decimal as a fraction
   * @param {number} decimal - The decimal to convert
   * @returns {Object} Object with numerator and denominator
   */
  function approximateFraction(decimal) {
    const precision = 1.0E-10;
    
    // Check if it's already an integer
    if (Math.abs(Math.round(decimal) - decimal) < precision) {
      return { numerator: Math.round(decimal), denominator: 1 };
    }
    
    // Check if the decimal is negative
    const isNegative = decimal < 0;
    decimal = Math.abs(decimal);
    
    // Simple continued fraction algorithm
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    // Maximum iterations to prevent infinite loops
    const maxIterations = 20;
    let i = 0;
    
    do {
      const a = Math.floor(b);
      const aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
      i++;
      
      if (Math.abs(decimal - h1 / k1) < decimal * precision || i >= maxIterations) {
        break;
      }
    } while (true);
    
    // Apply the negative sign if needed
    return {
      numerator: isNegative ? -h1 : h1,
      denominator: k1
    };
  }
  
  /**
   * Adds styles for error messages
   */
  function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .calc-error {
        color: var(--calc-danger);
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add error styles
  addErrorStyles();
  
  // Initialize the module when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Return public API
  return {
    solveLinearEquation,
    solveQuadraticEquation
  };
})();