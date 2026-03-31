SlideRenderer.register('section', function(slide) {
  const num = slide.number ? String(slide.number).padStart(2, '0') : '';
  const style = slide.style || 1;

  if (style === 2) {
    // Style 2: Oversized number background, text bottom-left
    return `
      <div class="slide-content section-slide section-style-2">
        ${num ? `<span class="section-number">${num}</span>` : ''}
        <div class="section-s2-text">
          <h2 class="section-title">${this.esc(slide.title)}</h2>
          ${slide.subtitle ? `<p class="section-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
        </div>
      </div>`;
  }

  if (style === 3) {
    // Style 3: Number right, text left, vertical split
    return `
      <div class="slide-content section-slide section-style-3">
        <div class="section-s3-left">
          <h2 class="section-title">${this.esc(slide.title)}</h2>
          ${slide.subtitle ? `<p class="section-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
          <div class="section-s3-line"></div>
        </div>
        ${num ? `<div class="section-s3-right"><span class="section-number">${num}</span></div>` : ''}
      </div>`;
  }

  // Style 1 (default): Centered with gradient title
  return `
    <div class="slide-content section-slide section-style-1">
      ${num ? `<span class="section-number">${num}</span>` : ''}
      <h2 class="section-title">${this.esc(slide.title)}</h2>
      ${slide.subtitle ? `<p class="section-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
    </div>`;
});
