SlideRenderer.register('two-column', function(slide) {
  const cols = (slide.columns || []).map(col => {
    let c = '';
    if (col.bullets?.length) c += `<ul class="slide-bullets">${col.bullets.map(b => `<li>${this.fmt(b)}</li>`).join('')}</ul>`;
    return `<div class="column">${col.heading ? `<h3 class="column-heading">${this.esc(col.heading)}</h3>` : ''}${c}</div>`;
  }).join('');
  return `
    <div class="slide-content two-column-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      <div class="columns-wrapper">${cols}</div>
    </div>`;
});
