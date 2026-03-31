EditorFields.register('timeline', function(slide) {
  const E = EditorFields;
  const items = slide.items || [];
  const itemsHtml = items.map((item, i) => `
    <div class="list-editor-item" data-index="${i}">
      <span class="bullet-drag"><i class="fa-solid fa-grip-vertical"></i></span>
      <div class="list-editor-fields list-editor-fields-3">
        <input type="text" value="${E.esc(item.date)}" placeholder="2026" data-timeline-field="date" data-index="${i}" style="max-width:80px">
        <input type="text" value="${E.esc(item.title)}" placeholder="Event title" data-timeline-field="title" data-index="${i}">
        <input type="text" value="${E.esc(item.description || '')}" placeholder="Description" data-timeline-field="description" data-index="${i}">
      </div>
      <button class="btn-icon btn-icon-danger" data-remove-timeline="${i}"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Optional intro text' }),
    `<div class="form-group">
      <label>Events <span class="field-hint">Date | Title | Description</span></label>
      <div class="list-editor" id="timeline-editor-list">${itemsHtml}</div>
      <div class="bullet-add" id="btn-add-timeline-item"><i class="fa-solid fa-plus"></i> Add Event</div>
    </div>`,
  ].join('');
});
