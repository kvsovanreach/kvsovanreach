EditorFields.register('discussion', function(slide) {
  const E = EditorFields;
  const prompts = slide.prompts || [];
  const promptsHtml = prompts.map((p, i) => `
    <div class="list-editor-item" data-index="${i}">
      <div class="list-editor-fields">
        <select data-prompt-field="icon" data-index="${i}" style="max-width:100px">
          ${['hand', 'comments', 'lightbulb', 'question', 'check', 'star', 'heart', 'thumbs-up', 'brain', 'rocket'].map(ic =>
            `<option value="${ic}" ${p.icon === ic ? 'selected' : ''}>${ic}</option>`
          ).join('')}
        </select>
        <input type="text" value="${E.esc(p.text)}" placeholder="Discussion prompt..." data-prompt-field="text" data-index="${i}">
      </div>
      <button class="btn-icon btn-icon-danger" data-remove-prompt="${i}"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  return [
    E.input('title', 'Title', slide.title || "Let's Discuss"),
    E.input('subtitle', 'Subtitle', slide.subtitle || '', { placeholder: 'e.g. Raise your hand if you\'ve ever...' }),
    `<div class="form-group">
      <label>Prompts <span class="field-hint">Icon | Text</span></label>
      <div class="list-editor" id="prompt-editor-list">${promptsHtml}</div>
      <div class="bullet-add" id="btn-add-prompt"><i class="fa-solid fa-plus"></i> Add Prompt</div>
    </div>`,
    E.collapse('disc-opts', 'Advanced', E.input('icon', 'Main Icon', slide.icon || 'comments', { placeholder: 'comments', hint: 'FontAwesome name' })),
  ].join('');
});
