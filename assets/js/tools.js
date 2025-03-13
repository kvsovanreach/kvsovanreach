document.addEventListener('DOMContentLoaded', function() {
    // Get all tool cards
    const toolCards = document.querySelectorAll('.kong-tool-card-content');
    
    // Find the max height
    let maxHeight = 0;
    toolCards.forEach(card => {
        const height = card.offsetHeight;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });
    
    // Set all cards to the same height for consistency
    toolCards.forEach(card => {
        card.style.height = maxHeight + 'px';
    });
    
    // Add special class to tool cards
    const qrCodeTitle = document.querySelector('.qr-tool-title');
    if (qrCodeTitle) {
        const btnContainer = qrCodeTitle.closest('.kong-tool-card-wrap');
        if (btnContainer) {
            btnContainer.classList.add('qr-tool-card');
        }
    }
    
    // Add special class to color picker tool card
    const colorPickerTitle = document.querySelector('.color-picker-tool-title');
    if (colorPickerTitle) {
        const btnContainer = colorPickerTitle.closest('.kong-tool-card-wrap');
        if (btnContainer) {
            btnContainer.classList.add('color-picker-tool-card');
        }
    }
});