EditorFields.register('section', function(slide) {
  const E = EditorFields;
  return [
    E.select('style', 'Style', slide.style || 1, [
      { value: 1, label: 'Style 1 — Centered Gradient' },
      { value: 2, label: 'Style 2 — Oversized Number' },
      { value: 3, label: 'Style 3 — Split Layout' }
    ], { hint: 'Changes the visual layout' }),
    E.row(
      E.input('number', 'Section #', slide.number || '', { type: 'number', placeholder: 'Auto' }),
      E.input('title', 'Title', slide.title || '', { placeholder: 'Section name' })
    ),
    E.input('subtitle', 'Subtitle', slide.subtitle || '', { placeholder: 'Brief description (optional)' }),
  ].join('');
});
