SlideRenderer.register('video', function(slide) {
  const vid = slide.video || {};
  const media = slide.media || {};
  const sizeClass = this.mediaSizeClass(media);
  const mStyle = this.mediaStyle(media);
  const attrs = [vid.autoplay ? 'autoplay' : '', vid.loop ? 'loop' : '', vid.muted ? 'muted' : '', 'playsinline controls'].filter(Boolean).join(' ');
  const vidNum = this.nextCount('video');

  const videoHtml = vid.src
    ? `<video class="slide-video${sizeClass}" ${mStyle} ${attrs} ${vid.poster ? `poster="${this.esc(this.resolveUrl(vid.poster))}"` : ''}><source src="${this.esc(this.resolveUrl(vid.src))}"></video>`
    : '<div class="image-placeholder"><i class="fa-solid fa-video"></i><span>No video</span></div>';

  const captionText = slide.figureCaption || vid.caption || '';
  const figureLabelHtml = `<div class="figure-label"><span class="figure-label-num">Video ${vidNum}.</span>${captionText ? ' ' + this.fmt(captionText) : ''}</div>`;

  return `
    <div class="slide-content image-slide">
      ${this.slideTitle(slide.title, slide.section)}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      ${videoHtml}
      ${figureLabelHtml}
    </div>`;
});
