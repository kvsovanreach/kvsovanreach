SlideRenderer.register('comparison', function(slide) {
  const left = slide.left || {}, right = slide.right || {};
  const lb = (left.bullets || []).map(b => `<li>${this.fmt(b)}</li>`).join('');
  const rb = (right.bullets || []).map(b => `<li>${this.fmt(b)}</li>`).join('');
  return `
    <div class="slide-content comparison-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      <div class="comparison-wrapper">
        <div class="comparison-side comparison-left">
          <h3 class="comparison-heading">${this.esc(left.heading || 'Before')}</h3>
          ${lb ? `<ul class="slide-bullets">${lb}</ul>` : ''}
        </div>
        <div class="comparison-side comparison-right">
          <h3 class="comparison-heading">${this.esc(right.heading || 'After')}</h3>
          ${rb ? `<ul class="slide-bullets">${rb}</ul>` : ''}
        </div>
      </div>
    </div>`;
});
