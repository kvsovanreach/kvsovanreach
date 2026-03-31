SlideRenderer.register('blank', function(slide) {
  const bg = slide.backgroundColor ? `style="background:${this.esc(slide.backgroundColor)}"` : '';
  return `
    <div class="slide-content blank-slide" ${bg}>
      ${slide.title ? `<h2 class="slide-title">${this.esc(slide.title)}</h2>` : ''}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
    </div>`;
});
