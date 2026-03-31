SlideRenderer.register('timeline', function(slide) {
  const items = (slide.items || []).map((item, i) => `
    <div class="timeline-item">
      <div class="timeline-marker">
        <div class="timeline-dot"></div>
        ${i < (slide.items.length - 1) ? '<div class="timeline-line"></div>' : ''}
      </div>
      <div class="timeline-content">
        <span class="timeline-date">${this.esc(item.date)}</span>
        <span class="timeline-event-title">${this.esc(item.title)}</span>
        ${item.description ? `<span class="timeline-desc">${this.esc(item.description)}</span>` : ''}
      </div>
    </div>
  `).join('');
  return `
    <div class="slide-content timeline-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      <div class="timeline">${items}</div>
    </div>`;
});
