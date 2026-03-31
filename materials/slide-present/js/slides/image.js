SlideRenderer.register('image', function(slide) {
  const img = slide.image || {};
  const figNum = this.nextCount('figure');

  const imgHtml = img.src
    ? `<img class="slide-image" src="${this.esc(this.resolveUrl(img.src))}" alt="${this.esc(img.alt || '')}">`
    : '<div class="image-placeholder"><i class="fa-solid fa-image"></i><span>No image</span></div>';

  const captionText = img.caption || '';
  const figureLabelHtml = `<div class="figure-label"><span class="figure-label-num">Figure ${figNum}.</span>${captionText ? ' ' + this.fmt(captionText) : ''}</div>`;

  return `
    <div class="slide-content image-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      ${imgHtml}
      ${figureLabelHtml}
    </div>`;
});
