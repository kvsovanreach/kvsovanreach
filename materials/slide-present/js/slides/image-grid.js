SlideRenderer.register('image-grid', function(slide) {
  const cols = slide.columns || 3;
  const gap = slide.gap || '12';
  const images = (slide.images || []).map(img => `
    <div class="grid-item">
      ${img.src ? `<img src="${this.esc(this.resolveUrl(img.src))}" alt="${this.esc(img.alt || '')}">` : '<div class="image-placeholder"><i class="fa-solid fa-image"></i></div>'}
      ${img.caption ? `<div class="grid-caption">${this.esc(img.caption)}</div>` : ''}
    </div>
  `).join('');
  return `
    <div class="slide-content image-grid-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.esc(slide.text)}</p>` : ''}
      <div class="image-grid" style="grid-template-columns:repeat(${cols},1fr);gap:${gap}px">${images}</div>
    </div>`;
});
