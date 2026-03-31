SlideRenderer.register('image-content', function(slide) {
  const img = slide.image || {};
  const content = slide.content || {};
  const layoutClass = slide.layout === 'image-right' ? ' image-right' : '';
  const hasFigure = !!slide.figureCaption;
  const figNum = hasFigure ? this.nextCount('figure') : 0;

  let contentHtml = '';
  if (content.text) contentHtml += `<p class="slide-text">${this.fmt(content.text)}</p>`;
  if (content.bullets?.length) contentHtml += `<ul class="slide-bullets">${content.bullets.map(b => `<li>${this.fmt(b)}</li>`).join('')}</ul>`;

  const imgHtml = img.src
    ? `<img class="slide-image" src="${this.esc(this.resolveUrl(img.src))}" alt="${this.esc(img.alt || '')}">`
    : '<div class="image-placeholder"><i class="fa-solid fa-image"></i></div>';

  const captionText = slide.figureCaption || '';
  const figureLabelHtml = captionText
    ? `<div class="figure-label"><span class="figure-label-num">Figure ${figNum}.</span> ${this.fmt(captionText)}</div>`
    : '';

  return `
    <div class="slide-content image-content-slide${layoutClass}">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      <div class="image-wrapper">
        ${imgHtml}
        ${figureLabelHtml}
      </div>
      <div class="content-wrapper">${contentHtml}</div>
    </div>`;
});
