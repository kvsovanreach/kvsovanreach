SlideRenderer.register('discussion', function(slide) {
  const prompts = (slide.prompts || []).map(p => `
    <div class="discussion-prompt">
      <span class="prompt-icon"><i class="fa-solid fa-${p.icon || 'comments'}"></i></span>
      <span class="prompt-text">${this.esc(p.text)}</span>
    </div>
  `).join('');
  return `
    <div class="slide-content discussion-slide">
      <div class="discussion-header">
        <span class="discussion-icon"><i class="fa-solid fa-${slide.icon || 'comments'}"></i></span>
        <h2 class="discussion-title">${this.esc(slide.title || "Let's Discuss")}</h2>
        ${slide.subtitle ? `<p class="discussion-subtitle">${this.esc(slide.subtitle)}</p>` : ''}
      </div>
      ${prompts ? `<div class="discussion-prompts">${prompts}</div>` : ''}
    </div>`;
});
