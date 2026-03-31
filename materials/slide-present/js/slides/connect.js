SlideRenderer.register('connect', function(slide) {
  const c = slide.contact || {};
  const links = [];
  if (c.email) links.push(`<div class="connect-item"><i class="fa-solid fa-envelope"></i><span>${this.esc(c.email)}</span></div>`);
  if (c.website) links.push(`<div class="connect-item"><i class="fa-solid fa-globe"></i><span>${this.esc(c.website)}</span></div>`);
  if (c.github) links.push(`<div class="connect-item"><i class="fa-brands fa-github"></i><span>github.com/${this.esc(c.github)}</span></div>`);
  if (c.linkedin) links.push(`<div class="connect-item"><i class="fa-brands fa-linkedin"></i><span>linkedin.com/in/${this.esc(c.linkedin)}</span></div>`);
  return `
    <div class="slide-content connect-slide">
      <h2 class="connect-title">${this.esc(slide.title || "Let's Connect")}</h2>
      ${slide.subtitle ? `<p class="connect-intro">${this.esc(slide.subtitle)}</p>` : ''}
      ${links.length ? `<div class="connect-links">${links.join('')}</div>` : ''}
      <p class="connect-thanks">${this.esc(slide.thanks || 'Thank You!')}</p>
    </div>`;
});
