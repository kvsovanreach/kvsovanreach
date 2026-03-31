/**
 * PreviewRenderer — thin wrapper around shared SlideRenderer
 * Renders slides inside .slide-preview-wrapper, scaled via CSS transform
 */
const PreviewRenderer = {
  render(slide) {
    if (!slide) return '<div class="preview-placeholder"><div class="placeholder-icon"><i class="fa-solid fa-display"></i></div><p class="placeholder-title">No slide selected</p><p class="placeholder-hint">Click a slide on the left panel or add a new one to get started</p></div>';
    const inner = SlideRenderer.renderSlide(slide);
    if (!inner) return '<div class="preview-placeholder"><p>Empty slide</p></div>';
    return `<div class="slide-preview-wrapper"><div class="slide">${inner}</div></div>`;
  }
};
