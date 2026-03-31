EditorFields.register('two-column', function(slide) {
  const E = EditorFields;
  const cols = slide.columns || [{}, {}];
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Optional text above columns' }),
    E.sectionTitle('Left Column'),
    E.input('columns.0.heading', 'Heading', (cols[0] || {}).heading || '', { placeholder: 'Column heading' }),
    E.bulletList('columns.0.bullets', 'Items', (cols[0] || {}).bullets || []),
    E.sectionTitle('Right Column'),
    E.input('columns.1.heading', 'Heading', (cols[1] || {}).heading || '', { placeholder: 'Column heading' }),
    E.bulletList('columns.1.bullets', 'Items', (cols[1] || {}).bullets || []),
  ].join('');
});
