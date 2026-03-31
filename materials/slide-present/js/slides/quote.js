SlideRenderer.register('quote', function(slide) {
  const layout = slide.layout || 'centered';

  const authorImgHtml = slide.authorImage
    ? `<img class="quote-author-image" src="${this.esc(this.resolveUrl(slide.authorImage))}" alt="${this.esc(slide.author || '')}">`
    : '';

  const authorHtml = slide.author
    ? `<div class="quote-attribution">
        ${authorImgHtml || '<div class="quote-attr-line"></div>'}
        <div class="quote-attr-info">
          <span class="quote-author">${this.esc(slide.author)}</span>
          ${slide.source ? `<span class="quote-source">${this.fmt(slide.source)}</span>` : ''}
        </div>
      </div>`
    : '';

  const quoteContentHtml = `
    <div class="quote-content">
      <i class="fa-solid fa-quote-left quote-icon"></i>
      <p class="quote-text">${this.fmt(slide.quote)}</p>
      ${authorHtml}
    </div>`;

  // Layout: with-image — side image + quote content
  if (layout === 'with-image' && slide.backgroundImage) {
    return `
      <div class="slide-content quote-slide quote-layout-with-image">
        <div class="quote-side-image">
          <img src="${this.esc(this.resolveUrl(slide.backgroundImage))}" alt="">
        </div>
        ${quoteContentHtml}
      </div>`;
  }

  // Centered / Left — optional background image overlay
  const bgStyle = slide.backgroundImage
    ? `background-image:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.6)),url(${this.esc(this.resolveUrl(slide.backgroundImage))})`
    : '';
  const bgClass = slide.backgroundImage ? ' has-bg-image' : '';

  return `
    <div class="slide-content quote-slide quote-layout-${layout}${bgClass}" ${bgStyle ? `style="${bgStyle}"` : ''}>
      ${quoteContentHtml}
    </div>`;
});
