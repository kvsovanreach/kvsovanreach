SlideRenderer.register('title-hero', function(slide) {
  const meta = slide.meta || {};
  const style = slide.style || 1;

  const presenterHtml = `
    <div class="hero-presenter">
      <div class="presenter-info">
        ${meta.presenter ? `<span class="presenter-name">${this.esc(meta.presenter)}</span>` : ''}
        ${meta.role ? `<span class="presenter-role">${this.esc(meta.role)}</span>` : ''}
      </div>
      <div class="presenter-meta">
        ${meta.location ? `<span><i class="fa-solid fa-location-dot"></i> ${this.esc(meta.location)}</span>` : ''}
        ${meta.date ? `<span><i class="fa-solid fa-calendar"></i> ${this.esc(meta.date)}</span>` : ''}
      </div>
    </div>`;

  if (style === 2) {
    // Style 2: Split layout — text left, accent panel right
    return `
      <div class="slide-content title-hero-slide hero-style-2">
        <div class="hero-s2-left">
          ${slide.hook ? `<div class="hero-hook"><span>${this.esc(slide.hook)}</span></div>` : ''}
          <h1 class="hero-title">
            ${this.esc(slide.title)}
            ${slide.highlight ? `<span class="hero-highlight">${this.esc(slide.highlight)}</span>` : ''}
          </h1>
          ${slide.subtitle ? `<p class="hero-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
          ${presenterHtml}
        </div>
        <div class="hero-s2-right">
          <div class="hero-s2-accent"></div>
          <div class="hero-s2-dots"></div>
        </div>
      </div>`;
  }

  if (style === 3) {
    // Style 3: Bold gradient title with decorative lines
    return `
      <div class="slide-content title-hero-slide hero-style-3">
        <div class="hero-s3-line hero-s3-line-top"></div>
        <div class="hero-content">
          ${slide.hook ? `<div class="hero-hook"><span>${this.esc(slide.hook)}</span></div>` : ''}
          <h1 class="hero-title">
            ${this.esc(slide.title)}
            ${slide.highlight ? `<span class="hero-highlight">${this.esc(slide.highlight)}</span>` : ''}
          </h1>
          ${slide.subtitle ? `<p class="hero-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
          ${presenterHtml}
        </div>
        <div class="hero-s3-line hero-s3-line-bottom"></div>
      </div>`;
  }

  // Style 1 (default): Centered hero with hook badge
  return `
    <div class="slide-content title-hero-slide hero-style-1">
      <div class="hero-content">
        ${slide.hook ? `<div class="hero-hook"><span>${this.esc(slide.hook)}</span></div>` : ''}
        <h1 class="hero-title">
          ${this.esc(slide.title)}
          ${slide.highlight ? `<span class="hero-highlight">${this.esc(slide.highlight)}</span>` : ''}
        </h1>
        ${slide.subtitle ? `<p class="hero-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
        ${presenterHtml}
      </div>
    </div>`;
});
