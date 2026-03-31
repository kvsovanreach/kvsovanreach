SlideRenderer.register('content', function(slide) {
  const isReferences = slide.title && slide.title.toLowerCase().includes('reference');
  const refClass = isReferences ? ' references-slide' : '';
  let c = '';
  if (slide.text) c += `<p class="slide-text">${this.fmt(slide.text)}</p>`;
  if (slide.bullets?.length) c += `<ul class="slide-bullets">${slide.bullets.map(b => `<li>${this.fmt(b)}</li>`).join('')}</ul>`;
  return `<div class="slide-content content-slide${refClass}">${this.slideTitle(slide.title, slide.section)}${c}</div>`;
});
