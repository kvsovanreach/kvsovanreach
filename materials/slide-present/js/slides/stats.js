SlideRenderer.register('stats', function(slide) {
  const items = (slide.items || []).map(item => `
    <div class="stat-card">
      ${item.icon ? `<div class="stat-icon-wrap"><i class="fa-solid fa-${this.esc(item.icon)}"></i></div>` : ''}
      <div class="stat-body">
        <span class="stat-value">${this.esc(item.value)}</span>
        <span class="stat-label">${this.esc(item.label)}</span>
      </div>
    </div>
  `).join('');
  return `
    <div class="slide-content stats-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      <div class="stats-grid">${items}</div>
    </div>`;
});
