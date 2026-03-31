EditorFields.register('content', function(slide) {
  const E = EditorFields;
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Optional intro text above bullets' }),
    E.bulletList('bullets', 'Bullet Points', slide.bullets || []),
  ].join('');
});
